# ☑️ Lista de Tarefas (Roadmap)

Este documento rastreia o progresso do desenvolvimento do Sistema de Controle de Atendimento (Mobile Ticket).

## 🏗️ Infraestrutura & DevOps (Responsável: Davi)
- [x] Configurar repositório Git (Monorepo).
- [x] Configurar Docker Compose para Banco de Dados.
- [x] Definir imagem MySQL 8.0.
- [x] Criar script de inicialização do banco (`init.sql`).
- [x] Configurar `.gitignore` global para ignorar `node_modules` e `.angular`.

## 🧠 Backend (API & Lógica)
- [x] Configurar servidor Node.js com TypeScript e Express.
- [x] **Requisito:** Conexão com Banco de Dados MySQL.
- [x] **Requisito:** Lógica de geração de senhas (`YYMMDD-TIPO-SEQ`).
- [x] **Requisito:** Reinício diário da sequência de senhas.
- [x] **Requisito:** Lógica de Prioridade de Fila (SP > SE > SG).
- [x] Endpoint `POST /senha`: Gerar nova senha.
- [x] Endpoint `POST /chamar`: Chamar próximo da fila respeitando prioridade.
- [x] Endpoint `POST /finalizar`: Encerrar atendimento e gravar horário.
- [x] Endpoint `GET /painel`: Listar últimas 5 chamadas.
- [x] Endpoint `GET /relatorios`: Calcular totais e Tempo Médio (TM).

## 📱 Frontends (Interfaces)

### 1. Totem (Autoatendimento)
- [x] Criar projeto Ionic/Angular.
- [x] Tela com 3 botões (Prioritário, Exames, Geral).
- [x] Integração com API (`POST /senha`).
- [x] Feedback visual (Alerta) com a senha gerada.

### 2. Atendente (Mesa)
- [x] Criar projeto Ionic/Angular.
- [x] Tela de configuração do número do Guichê.
- [x] Botão "Chamar Próximo" (Consome API).
- [x] Botão "Finalizar Atendimento".
- [x] Exibição da senha atual em atendimento.

### 3. Painel (TV da Sala de Espera)
- [x] Criar projeto Ionic/Angular.
- [x] **Requisito:** Atualização automática (Polling a cada 5s).
- [x] Layout de TV (Destaque à esquerda, Histórico à direita).
- [x] Mostrar as últimas 5 senhas chamadas.

### 4. Gestor (Dashboard)
- [x] Criar projeto Ionic/Angular.
- [x] Cards de KPIs (Emitidos vs Atendidos).
- [x] Cards de Tempo Médio (TM) por tipo de senha.
- [x] Tabela de Auditoria (Lista detalhada com horários).
- [x] Funcionalidade "Pull to Refresh" para atualizar dados.

## 📚 Documentação
- [x] Criar `README.md` com instruções de instalação.
- [x] Criar `ROTAS.md` documentando os endpoints da API.
- [x] Gravar vídeo de apresentação do fluxo completo.

---

## 🚀 Melhorias Futuras (Backlog)
- [ ] Implementar autenticação real (Login) para o Atendente e Gestor.
- [ ] Substituir *Polling* (setInterval) do Painel por *WebSockets* (Socket.io) para atualização em tempo real instantânea.
- [ ] Adicionar sons de chamada no Painel ("Ding Dong").
- [ ] Criar versão responsiva do Gestor para celular.
