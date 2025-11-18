import express from 'express';
import cors from 'cors';
import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json()); // Importante para ler JSON enviado pelo Frontend

// Configuração do Banco de Dados
const pool = mysql.createPool({
    host: 'localhost', // Use 'db' se rodar via Docker network, 'localhost' se rodar local
    user: 'user',
    password: 'password',
    database: 'atendimento_db',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
    timezone: '-03:00' // Forçando horário de Recife/Brasília
});

// Rota de teste simples
app.get('/', (req, res) => {
    res.send('API Controle de Atendimento (Backend) - Online 🟢');
});

// =============================================================
// 1. ROTA PARA GERAR NOVA SENHA (USADA PELO TOTEM)
// =============================================================
app.post('/api/senha', async (req, res) => {
    const { tipo_senha } = req.body; // O frontend manda: { "tipo_senha": "SP" }

    // Validação básica
    if (!['SP', 'SG', 'SE'].includes(tipo_senha)) {
        res.status(400).json({ error: 'Tipo de senha inválido. Use SP, SG ou SE.' });
        return 
    }

    try {
        // A. Descobrir a data de hoje em formato YYYY-MM-DD para buscar no banco
        // Ajuste simples para garantir data local
        const agora = new Date();
        agora.setHours(agora.getHours() - 3); // Ajuste manual para fuso Recife se servidor for UTC
        const hojeISO = agora.toISOString().split('T')[0]; // "2025-11-18"
        
        // B. Descobrir qual a próxima sequência para esse tipo HOJE
        const [rows]: any = await pool.query(
            `SELECT COALESCE(MAX(sequencia_diaria), 0) + 1 as proxima 
             FROM atendimentos 
             WHERE data_emissao = ? AND tipo_senha = ?`,
            [hojeISO, tipo_senha]
        );
        
        const proximaSequencia = rows[0].proxima;

        // C. Formatar a senha: YYMMDD-PPSQ
        // YYMMDD
        const ano = agora.getFullYear().toString().slice(-2);
        const mes = (agora.getMonth() + 1).toString().padStart(2, '0');
        const dia = agora.getDate().toString().padStart(2, '0');
        const dataFormatada = `${ano}${mes}${dia}`;

        // SQ (Sequência com zeros a esquerda? O PDF não especifica, mas fica melhor visualmente)
        const seqFormatada = proximaSequencia.toString(); 

        // Ex: 251118-SP1
        const senhaPronta = `${dataFormatada}-${tipo_senha}${seqFormatada}`;

        // D. Salvar no Banco
        await pool.query(
            `INSERT INTO atendimentos (data_emissao, tipo_senha, sequencia_diaria, senha_formatada, status)
             VALUES (?, ?, ?, ?, 'PENDENTE')`,
            [hojeISO, tipo_senha, proximaSequencia, senhaPronta]
        );

        // E. Responder ao Frontend (Totem)
        console.log(`Nova senha gerada: ${senhaPronta}`);
        res.status(201).json({ 
            mensagem: 'Senha gerada com sucesso',
            senha: senhaPronta,
            tipo: tipo_senha,
            numero: proximaSequencia
        });

    } catch (error) {
        console.error('Erro ao gerar senha:', error);
        res.status(500).json({ error: 'Erro interno ao gerar senha' });
    }
});

// =============================================================
// 2. ROTA PARA CHAMAR O PRÓXIMO DA FILA (USADA PELO ATENDENTE)
// =============================================================
app.post('/api/chamar', async (req, res) => {
    const { guiche } = req.body; // O frontend manda: { "guiche": 5 }

    if (!guiche) {
        res.status(400).json({ error: 'Número do guichê é obrigatório' });
        return;
    }

    const connection = await pool.getConnection(); // Pegamos uma conexão dedicada para usar transação

    try {
        await connection.beginTransaction();

        // A. O Algoritmo da Fila (SP > SE > SG)
        // Buscamos uma senha PENDENTE ordenando pela prioridade personalizada
        // FIELD(tipo, 'SP', 'SE', 'SG') faz a mágica da ordem pedida no PDF
        const [rows]: any = await connection.query(
            `SELECT id, senha_formatada, tipo_senha 
             FROM atendimentos 
             WHERE status = 'PENDENTE' 
             ORDER BY FIELD(tipo_senha, 'SP', 'SE', 'SG'), id ASC 
             LIMIT 1 FOR UPDATE`
        );

        if (rows.length === 0) {
            await connection.rollback();
            res.status(404).json({ mensagem: 'Não há ninguém na fila agora.' });
            return;
        }

        const proximaSenha = rows[0];

        // B. Atualizar o status para CHAMADO e vincular ao guichê
        // Ajuste de horário local (-3h) para registrar a chamada corretamente
        const agora = new Date();
        agora.setHours(agora.getHours() - 3);

        await connection.query(
            `UPDATE atendimentos 
             SET status = 'CHAMADO', 
                 guiche_id = ?, 
                 hora_chamada = ? 
             WHERE id = ?`,
            [guiche, agora, proximaSenha.id]
        );

        await connection.commit();

        console.log(`Guichê ${guiche} chamou a senha: ${proximaSenha.senha_formatada}`);
        res.json({
            mensagem: 'Próximo cliente chamado',
            senha: proximaSenha.senha_formatada,
            guiche: guiche,
            id_atendimento: proximaSenha.id
        });

    } catch (error) {
        await connection.rollback();
        console.error('Erro ao chamar senha:', error);
        res.status(500).json({ error: 'Erro ao processar fila' });
    } finally {
        connection.release();
    }
});

// =============================================================
// 3. ROTA PARA FINALIZAR ATENDIMENTO (USADA PELO ATENDENTE)
// =============================================================
app.post('/api/finalizar', async (req, res) => {
    const { id_atendimento } = req.body;

    if (!id_atendimento) {
        res.status(400).json({ error: 'ID do atendimento é obrigatório' });
        return;
    }

    try {
        const agora = new Date();
        agora.setHours(agora.getHours() - 3);

        await pool.query(
            `UPDATE atendimentos 
             SET status = 'CONCLUIDO', 
                 hora_finalizacao = ? 
             WHERE id = ?`,
            [agora, id_atendimento]
        );

        res.json({ mensagem: 'Atendimento finalizado com sucesso.' });

    } catch (error) {
        console.error('Erro ao finalizar:', error);
        res.status(500).json({ error: 'Erro interno' });
    }
});

// =============================================================
// 4. ROTA PARA O PAINEL (TV) - LISTA AS ÚLTIMAS CHAMADAS
// =============================================================
app.get('/api/painel', async (req, res) => {
    try {
        // Busca as últimas 5 senhas que já foram chamadas (status CHAMADO ou CONCLUIDO)
        // Ordena pela hora da chamada (da mais recente para a mais antiga)
        const [rows] = await pool.query(
            `SELECT senha_formatada, guiche_id, tipo_senha 
             FROM atendimentos 
             WHERE status IN ('CHAMADO', 'CONCLUIDO') 
             ORDER BY hora_chamada DESC 
             LIMIT 5`
        );

        res.json(rows);

    } catch (error) {
        console.error('Erro ao buscar dados do painel:', error);
        res.status(500).json({ error: 'Erro interno' });
    }
});

// =============================================================
// 5. ROTA DE ESTATÍSTICAS (PARA O GESTOR) - QUANTIDADE E TEMPO MÉDIO
// =============================================================
app.get('/api/relatorios/stats', async (req, res) => {
    try {
        // A. Quantidade por Tipo (Emitidas vs Atendidas)
        const [counts]: any = await pool.query(`
            SELECT 
                tipo_senha,
                COUNT(*) as total_emitidas,
                SUM(CASE WHEN status = 'CONCLUIDO' THEN 1 ELSE 0 END) as total_atendidas
            FROM atendimentos
            GROUP BY tipo_senha
        `);

        // B. Tempo Médio de Atendimento (TM) em minutos
        // Calcula a diferença em minutos entre a hora que chamou e a hora que acabou
        const [tempos]: any = await pool.query(`
            SELECT 
                tipo_senha,
                AVG(TIMESTAMPDIFF(MINUTE, hora_chamada, hora_finalizacao)) as tempo_medio_minutos
            FROM atendimentos
            WHERE status = 'CONCLUIDO'
            GROUP BY tipo_senha
        `);

        res.json({
            producao: counts,
            performance: tempos
        });

    } catch (error) {
        console.error('Erro nos relatórios:', error);
        res.status(500).json({ error: 'Erro ao gerar estatísticas' });
    }
});

// =============================================================
// 6. ROTA DE RELATÓRIO DETALHADO (AUDITORIA)
// =============================================================
app.get('/api/relatorios/detalhado', async (req, res) => {
    try {
        // Retorna a lista completa com datas formatadas para leitura humana
        const [rows] = await pool.query(`
            SELECT 
                senha_formatada,
                tipo_senha,
                DATE_FORMAT(hora_emissao, '%d/%m/%Y %H:%i:%s') as emissao,
                DATE_FORMAT(hora_chamada, '%d/%m/%Y %H:%i:%s') as chamada,
                DATE_FORMAT(hora_finalizacao, '%d/%m/%Y %H:%i:%s') as finalizacao,
                guiche_id,
                status
            FROM atendimentos
            ORDER BY hora_emissao DESC
        `);

        res.json(rows);

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Erro no relatório detalhado' });
    }
});


const PORT = 3000;
app.listen(PORT, () => {
    console.log(`🚀 Servidor rodando em http://localhost:${PORT}`);
    console.log(`📍 Configurado para fuso horário de Recife (-03:00)`);
});