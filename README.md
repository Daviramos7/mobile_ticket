# 🏥 Sistema de Controle de Atendimento

Sistema completo para gerenciamento de filas de atendimento em laboratórios e clínicas, desenvolvido como projeto acadêmico. O sistema implementa regras de negócio complexas de priorização (SP, SE, SG) e conta com arquitetura de microsserviços simulada em um monorepo.

## 👥 Integrantes do Projeto

- **Davi Ramos Ferreira** - 01702924
- **Gabriel Cauã Ferreira de Brito** - 01530132
- **João Mariano Leite Valadares** - 01744166
- **Nickolas Eduardo Gonçalves de Oliveira** - 01711842
- **Larissa Vitória Minervina de Souza** - 01703622

---

## 🚀 Arquitetura do Projeto

O sistema é composto por **6 aplicações** integradas:

1. **Backend (API REST):** Desenvolvido em Node.js/TypeScript. Gerencia a lógica da fila, regras de prioridade e persistência de dados.
2. **Banco de Dados:** MySQL 8.0 rodando em container Docker.
3. **Frontend Totem:** Interface de autoatendimento para o paciente retirar a senha.
4. **Frontend Atendente:** Interface para o funcionário chamar o próximo da fila e finalizar atendimentos.
5. **Frontend Painel:** Interface de TV que monitora a fila e anuncia chamadas em tempo real.
6. **Frontend Gestor:** Dashboard para a diretoria com relatórios de produtividade e Tempo Médio (TM).

---

## 🛠️ Tecnologias Utilizadas

- **Backend:** Node.js, Express, TypeScript, MySQL2
- **Database:** Docker, Docker Compose, MySQL 8.0
- **Frontend:** Ionic 7, Angular, Sass
- **Integração:** API RESTful com CORS habilitado

---

## ⚙️ Pré-requisitos

- Node.js (v18 ou superior)
- NPM
- Docker Desktop (para o banco de dados)
- Ionic CLI (`npm install -g @ionic/cli`)

---

## 🏃‍♂️ Como Rodar o Projeto (Passo a Passo)

Para simular o ambiente completo, recomenda-se abrir 6 terminais diferentes.

### 1. Iniciar o Banco de Dados (Terminal 1)

Na raiz do projeto, suba o container do MySQL:
```bash
docker-compose up -d
```

### 2. Iniciar o Backend (Terminal 2)

O servidor rodará na porta 3000.
```bash
cd backend
npm install
npm run dev
```

### 3. Iniciar o Totem - Cliente (Terminal 3)

Rodará na porta 8100.
```bash
cd frontend-totem
npm install
ionic serve
```

### 4. Iniciar o Atendente - Mesa (Terminal 4)

Rodará na porta 8101.
```bash
cd frontend-atendente
npm install
ionic serve --port 8101
```

### 5. Iniciar o Painel - TV (Terminal 5)

Rodará na porta 8102.
```bash
cd frontend-painel
npm install
ionic serve --port 8102
```

### 6. Iniciar o Gestor - Dashboard (Terminal 6)

Rodará na porta 8103.
```bash
cd frontend-gestor
npm install
ionic serve --port 8103
```

---

## 📋 Regras de Negócio Implementadas

### Tipos de Senha

- **SP (Prioritária):** Gestantes, idosos, PNE. Tem prioridade máxima na fila.
- **SE (Exames):** Retirada de exames. Prioridade secundária.
- **SG (Geral):** Atendimento comum. Só é chamada se não houver SP ou SE pendentes.

### Formatação

As senhas seguem o padrão `YYMMDD-TIPO-SEQ` (ex: `251125-SP1`), com reinício de contagem diária.

---

## 📚 Documentação da API

Para detalhes sobre os endpoints (`/senha`, `/chamar`, `/painel`, `/relatorios`), consulte o arquivo `ROTAS.md` na raiz do projeto.

---

## 📝 Licença

Projeto desenvolvido para a disciplina de Projetos de Sistemas de Informação.
