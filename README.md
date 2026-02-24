# PlankGYM — Sistema de Gestão de Academia

Sistema completo para gerenciamento de academias, desenvolvido como Trabalho de Conclusão de Curso (TCC). Abrange cadastro de alunos, gestão de planos e pagamentos, prescrição de treinos, notificações automáticas e portal do aluno.

## Tecnologias

| Camada | Stack |
|--------|-------|
| Backend | Node.js 18 · TypeScript · Express 5 · PostgreSQL 14 |
| Autenticação | JWT (8 h) · bcryptjs |
| Frontend | React 18 · Vite 4 · Material UI 5 · Axios |
| E-mail | Nodemailer (SMTP) |
| Documentação | Swagger UI — `GET /api-docs` |

---

## Funcionalidades

- **Autenticação** — Login com JWT; perfis `administrador` e `atendente`
- **Portal do Aluno** — Login separado, visualização de treinos, registro de execução e envio de feedback
- **Alunos** — Cadastro completo, foto, histórico de pagamentos e programa de treino
- **Planos** — CRUD com bloqueio de exclusão quando há alunos vinculados
- **Pagamentos** — Registro de parcelas com atualização automática de vencimento
- **Exercícios** — Biblioteca com filtro por grupo muscular e paginação
- **Modelos de Treino** — Criação, duplicação, atribuição de exercícios e atribuição a alunos
- **Registro de Treino** — Histórico de execuções por aluno (séries, repetições, carga)
- **Notificações** — Sistema interno de alertas por aluno
- **Notificações Automáticas** — Lembretes de pagamento e treino via e-mail (SMTP)
- **Feedback** — Envio, resposta e arquivamento de feedbacks de alunos
- **Dashboard** — Métricas em tempo real, gráficos de receita e aniversariantes do mês
- **Termo de Matrícula** — Geração de documento PDF assinável

---

## Pré-requisitos

- [Node.js](https://nodejs.org/) >= 18
- [PostgreSQL](https://www.postgresql.org/) >= 14
- npm >= 9

---

## Instalação

### 1. Clone o repositório

```bash
git clone https://github.com/seu-usuario/tcc-sistema-academia.git
cd tcc-sistema-academia
```

### 2. Crie o banco de dados e execute o schema

```bash
psql -U postgres -c "CREATE DATABASE academia;"
psql -U postgres -d academia -f backend/schema.sql
```

### 3. Execute as migrations (em ordem)

```bash
psql -U postgres -d academia -f backend/migrations/004_add_registros_treino.sql
psql -U postgres -d academia -f backend/migrations/005_add_feedback_sistema.sql
psql -U postgres -d academia -f backend/migrations/006_add_aulas_calendario.sql
psql -U postgres -d academia -f backend/migrations/007_add_senha_hash_alunos.sql
psql -U postgres -d academia -f backend/migrations/008_remove_aulas_tables.sql
```

### 4. Configure e instale o backend

```bash
cd backend
cp .env.example .env
# Edite .env com suas credenciais do PostgreSQL, JWT_SECRET forte e dados SMTP
npm install
```

### 5. Crie o usuário administrador

```bash
npm run seed
```

> Cria `admin@plankgym.com` / `admin123` com hash bcrypt. Seguro para reexecutar (idempotente).

### 6. Configure e instale o frontend

```bash
cd ../frontend
cp .env.example .env
# Edite .env caso o backend esteja em outro endereço
npm install
```

---

## Executando

Abra **dois terminais** a partir da raiz do projeto:

```bash
# Terminal 1 — Backend (porta 3001)
cd backend
npm run dev

# Terminal 2 — Frontend (porta 5173)
cd frontend
npm run dev
```

| Serviço | URL |
|---------|-----|
| Aplicação | http://localhost:5173 |
| API / Swagger | http://localhost:3001/api-docs |

**Login padrão:** `admin@plankgym.com` / `admin123`

---

## Variáveis de ambiente

### `backend/.env`

| Variável | Descrição | Exemplo |
|----------|-----------|---------|
| `DB_USER` | Usuário do PostgreSQL | `postgres` |
| `DB_HOST` | Host do banco | `localhost` |
| `DB_NAME` | Nome do banco | `academia` |
| `DB_PASSWORD` | Senha do banco | `sua_senha` |
| `DB_PORT` | Porta do banco | `5432` |
| `JWT_SECRET` | Chave secreta para tokens JWT | string aleatória longa |
| `PORT` | Porta do servidor | `3001` |
| `NODE_ENV` | Ambiente de execução | `development` |
| `CORS_ORIGIN` | Origem permitida pelo CORS | `http://localhost:5173` |
| `EMAIL_HOST` | Host SMTP | `smtp.gmail.com` |
| `EMAIL_PORT` | Porta SMTP | `587` |
| `EMAIL_USER` | Usuário de e-mail | `seu@email.com` |
| `EMAIL_PASS` | Senha ou App Password | `sua_senha_app` |
| `EMAIL_FROM` | Remetente exibido | `PlankGYM <seu@email.com>` |

### `frontend/.env`

| Variável | Descrição | Padrão |
|----------|-----------|--------|
| `VITE_API_URL` | URL base da API (sem `/api`) | `http://localhost:3001/api` |

---

## Scripts disponíveis

### Backend (`cd backend`)

| Comando | Descrição |
|---------|-----------|
| `npm run dev` | Desenvolvimento com hot-reload (ts-node-dev) |
| `npm run build` | Compila TypeScript para `dist/` |
| `npm start` | Inicia build de produção |
| `npm run seed` | Cria usuário admin padrão no banco |

### Frontend (`cd frontend`)

| Comando | Descrição |
|---------|-----------|
| `npm run dev` | Vite em modo desenvolvimento |
| `npm run build` | Build de produção em `dist/` |
| `npm run preview` | Pré-visualiza build de produção |

---

## Rotas da API

Todas as rotas abaixo têm prefixo `/api`. Rotas marcadas com 🔒 exigem header `Authorization: Bearer <token>`.

### Autenticação — `/auth`

| Método | Rota | Descrição |
|--------|------|-----------|
| POST | `/auth/login` | Login de funcionário; retorna JWT |
| POST | `/auth/register` | Cadastro de funcionário 🔒 (admin) |
| POST | `/auth/aluno/login` | Login do portal do aluno |

### Alunos — `/alunos` 🔒

| Método | Rota | Descrição |
|--------|------|-----------|
| GET | `/alunos` | Lista todos os alunos |
| POST | `/alunos` | Cadastra novo aluno |
| GET | `/alunos/:id` | Detalhe de um aluno |
| PUT | `/alunos/:id` | Atualiza aluno |
| DELETE | `/alunos/:id` | Remove aluno |

### Planos — `/planos` 🔒

| Método | Rota | Descrição |
|--------|------|-----------|
| GET | `/planos` | Lista planos |
| POST | `/planos` | Cria plano |
| PUT | `/planos/:id` | Atualiza plano |
| DELETE | `/planos/:id` | Remove plano (falha se houver alunos vinculados) |

### Pagamentos — `/pagamentos` 🔒

| Método | Rota | Descrição |
|--------|------|-----------|
| POST | `/pagamentos` | Registra pagamento |
| GET | `/pagamentos/aluno/:alunoId` | Histórico de pagamentos do aluno |
| DELETE | `/pagamentos/:id` | Remove pagamento |

### Exercícios — `/exercicios` 🔒

| Método | Rota | Descrição |
|--------|------|-----------|
| GET | `/exercicios` | Lista com filtro por grupo muscular e paginação |
| POST | `/exercicios` | Cria exercício |
| PUT | `/exercicios/:id` | Atualiza exercício |
| DELETE | `/exercicios/:id` | Remove exercício |

### Modelos de Treino — `/modelos-treino` 🔒

| Método | Rota | Descrição |
|--------|------|-----------|
| GET | `/modelos-treino` | Lista modelos |
| POST | `/modelos-treino` | Cria modelo |
| GET | `/modelos-treino/:id` | Detalhe com exercícios |
| PUT | `/modelos-treino/:id` | Atualiza modelo |
| DELETE | `/modelos-treino/:id` | Remove modelo |
| POST | `/modelos-treino/:id/duplicate` | Duplica modelo |
| POST | `/modelos-treino/:id/assign` | Atribui modelo a aluno |

### Dashboard — `/dashboard` 🔒

| Método | Rota | Descrição |
|--------|------|-----------|
| GET | `/dashboard/metrics` | Métricas gerais (alunos, receita, inadimplentes) |
| GET | `/dashboard/receita-mensal` | Receita dos últimos 12 meses |
| GET | `/dashboard/aniversariantes` | Aniversariantes do mês |

### Registro de Treino — `/registro-treino`

| Método | Rota | Descrição |
|--------|------|-----------|
| POST | `/registro-treino` | Registra execução de treino (aluno) |
| GET | `/registro-treino/aluno/:id` | Histórico de treinos do aluno 🔒 |

### Notificações — `/notificacoes` 🔒

| Método | Rota | Descrição |
|--------|------|-----------|
| GET | `/notificacoes/aluno/:id` | Lista notificações do aluno |
| POST | `/notificacoes` | Cria notificação |
| PATCH | `/notificacoes/:id/lida` | Marca como lida |
| DELETE | `/notificacoes/:id` | Remove notificação |

### Notificações Automáticas — `/notificacoes-automaticas` 🔒

| Método | Rota | Descrição |
|--------|------|-----------|
| GET | `/notificacoes-automaticas/config` | Lê configuração |
| PUT | `/notificacoes-automaticas/config` | Atualiza configuração |
| POST | `/notificacoes-automaticas/enviar-agora` | Dispara envio imediato |

### Feedback — `/feedback`

| Método | Rota | Descrição |
|--------|------|-----------|
| POST | `/feedback` | Aluno envia feedback |
| GET | `/feedback` | Lista feedbacks 🔒 |
| PUT | `/feedback/:id/responder` | Funcionário responde 🔒 |
| PATCH | `/feedback/:id/arquivar` | Arquiva feedback 🔒 |

### Termo de Matrícula — `/termo-matricula` 🔒

| Método | Rota | Descrição |
|--------|------|-----------|
| GET | `/termo-matricula/aluno/:id` | Gera PDF do termo de matrícula |

---

## Estrutura do projeto

```
tcc-sistema-academia/
├── backend/
│   ├── src/
│   │   ├── config/         # Pool de conexão PostgreSQL
│   │   ├── controllers/    # Handlers de cada recurso
│   │   ├── middleware/     # JWT auth + controle de cargo
│   │   ├── routes/         # Registro de rotas Express
│   │   ├── services/       # Nodemailer (e-mail)
│   │   └── utils/          # asyncHandler, ApiError, Swagger, validador
│   ├── migrations/         # Scripts SQL incrementais (004–008)
│   ├── scripts/
│   │   └── seed.js         # Cria usuário admin com hash bcrypt
│   ├── schema.sql          # DDL completo do banco
│   └── index.ts            # Entry point — Express + rotas
└── frontend/
    └── src/
        ├── components/     # Formulários, listas e gráficos reutilizáveis
        ├── context/        # AuthContext (JWT + papel do usuário)
        ├── hooks/          # useApi — wrapper Axios com auth header
        ├── pages/          # Uma página por funcionalidade
        ├── services/
        │   └── api.js      # API_BASE centralizado (VITE_API_URL)
        └── types/          # Types TypeScript compartilhados
```

---

## Segurança

- Senhas armazenadas com **bcryptjs** (salt rounds = 10)
- Tokens JWT com expiração de **8 horas**
- Rotas protegidas por middleware de autenticação + verificação de cargo
- Variáveis sensíveis isoladas em `.env` (nunca versionadas)
- `JWT_SECRET` deve ser uma string longa e aleatória em produção

---

## Licença

Distribuído sob a licença MIT. Consulte o arquivo `LICENSE` para mais detalhes.
