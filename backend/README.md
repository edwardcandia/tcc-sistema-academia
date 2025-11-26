# PlankGYM - Sistema de Gestão de Academia

Sistema completo de gestão de academia desenvolvido como Trabalho de Conclusão de Curso (TCC).

## 📋 Funcionalidades

- **Gestão de Alunos**: Cadastro, edição, visualização e controle de status
- **Planos e Pagamentos**: Gerenciamento de planos de mensalidade e controle de pagamentos
- **Modelos de Treino**: Criação e atribuição de treinos personalizados
- **Exercícios**: Biblioteca de exercícios com vídeos e instruções
- **Registro de Treinos**: Histórico de treinos realizados pelos alunos
- **Notificações**: Sistema de notificações automáticas (pagamentos, treinos)
- **Feedback**: Sistema de feedback dos alunos
- **Dashboard**: Visualização de estatísticas e métricas da academia
- **Autenticação**: Login seguro com JWT para funcionários e administradores

## 🛠️ Tecnologias

### Backend
- Node.js + Express
- TypeScript
- PostgreSQL
- JWT (autenticação)
- Nodemailer (envio de emails)
- Swagger (documentação da API)

### Frontend
- React
- Material-UI
- Vite
- Context API

## 📦 Pré-requisitos

- Node.js (v18 ou superior)
- PostgreSQL (v14 ou superior)
- npm ou yarn

## 🚀 Instalação e Configuração

### 1. Clone o repositório

```bash
git clone https://github.com/edwardcandia/tcc-sistema-academia.git
cd tcc-sistema-academia
```

### 2. Configuração do Backend

```bash
cd backend
npm install
```

### 3. Configure as variáveis de ambiente

Copie o arquivo `.env.example` para `.env` e preencha com suas configurações:

```bash
cp .env.example .env
```

**Importante**: Em produção, altere obrigatoriamente:
- `JWT_SECRET`: Use uma chave forte (ex: `openssl rand -base64 32`)
- `DB_PASSWORD`: Senha segura do PostgreSQL
- `EMAIL_USER` e `EMAIL_PASS`: Credenciais válidas de email

### 4. Configure o banco de dados

Execute o script SQL de criação do schema:

```bash
psql -U postgres -d postgres -f schema.sql
```

Ou crie o banco manualmente e execute as migrations na ordem:

```sql
-- Crie o banco primeiro
CREATE DATABASE academia;
```

Depois execute os scripts:
```bash
psql -U postgres -d academia -f migrations/004_add_registros_treino.sql
psql -U postgres -d academia -f migrations/005_add_feedback_sistema.sql
psql -U postgres -d academia -f migrations/006_add_aulas_calendario.sql
psql -U postgres -d academia -f migrations/007_add_senha_hash_alunos.sql
psql -U postgres -d academia -f migrations/008_remove_aulas_tables.sql
```

### 5. Inicie o servidor backend

**Desenvolvimento:**
```bash
npm run dev
```

**Produção:**
```bash
npm run build
npm start
```

O servidor estará disponível em `http://localhost:3001`
Documentação da API: `http://localhost:3001/api-docs`

### 6. Configuração do Frontend

Em outro terminal:

```bash
cd ../frontend
npm install
npm run dev
```

O frontend estará disponível em `http://localhost:5173`

## 📚 Estrutura do Projeto

```
tcc-sistema-academia/
├── backend/
│   ├── src/
│   │   ├── config/          # Configurações (DB)
│   │   ├── controllers/     # Controladores de rotas
│   │   ├── middleware/      # Middlewares (auth, etc)
│   │   ├── routes/          # Definição de rotas
│   │   ├── services/        # Serviços (email, etc)
│   │   └── utils/           # Utilitários (errorHandler, validator)
│   ├── migrations/          # Scripts SQL de migração
│   ├── logs/               # Logs da aplicação
│   └── index.ts            # Ponto de entrada
│
└── frontend/
    ├── src/
    │   ├── components/     # Componentes React
    │   ├── pages/          # Páginas da aplicação
    │   ├── services/       # Serviços de API
    │   └── context/        # Context API (autenticação)
    └── public/             # Arquivos estáticos
```

## 🔐 Segurança

- **JWT**: Tokens expiram em 8 horas
- **Bcrypt**: Senhas hasheadas com salt de 10 rounds
- **Helmet**: Proteção de headers HTTP
- **CORS**: Configurado para origens específicas
- **Validação**: Joi para validação de dados de entrada
- **Rate Limiting**: Recomendado adicionar em produção

## 📖 API Endpoints Principais

### Autenticação
- `POST /api/login` - Login
- `POST /api/auth/register` - Registrar usuário (admin/atendente)
- `GET /api/auth/verify-token` - Verificar token

### Alunos
- `GET /api/alunos` - Listar alunos
- `POST /api/alunos` - Criar aluno
- `PUT /api/alunos/:id` - Atualizar aluno
- `DELETE /api/alunos/:id` - Deletar aluno

### Planos
- `GET /api/planos` - Listar planos
- `POST /api/planos` - Criar plano
- `PUT /api/planos/:id` - Atualizar plano
- `DELETE /api/planos/:id` - Deletar plano

Ver documentação completa em: `http://localhost:3001/api-docs`

## 🧪 Testes

```bash
cd backend
npm test
```

## 🔧 Scripts Disponíveis

### Backend
- `npm run dev` - Desenvolvimento com hot-reload
- `npm run build` - Build para produção
- `npm start` - Iniciar em produção
- `npm run lint` - Executar linter
- `npm test` - Executar testes

### Frontend
- `npm run dev` - Desenvolvimento
- `npm run build` - Build para produção
- `npm run preview` - Preview do build

## 🐛 Troubleshooting

### Erro de conexão com banco de dados
- Verifique se o PostgreSQL está rodando
- Confirme as credenciais no `.env`
- Teste a conexão: `psql -U postgres -d academia`

### Erro "JWT_SECRET não definido"
- Em produção, o sistema requer `JWT_SECRET` no `.env`
- Gere uma chave: `openssl rand -base64 32`

### Erros de TypeScript
- Execute: `npm run build` ou `npx tsc --noEmit`
- Verifique se todas as dependências estão instaladas

## 📝 TODO / Melhorias Futuras

- [ ] Adicionar testes unitários e de integração (Jest + Supertest)
- [ ] Implementar rate limiting para rotas de autenticação
- [ ] Adicionar CI/CD com GitHub Actions
- [ ] Migrar controllers restantes para TypeScript tipado completo
- [ ] Implementar sistema de backup automático do banco
- [ ] Adicionar logs estruturados (Winston/Pino)
- [ ] Implementar reset de senha por email
- [ ] Adicionar foto de perfil para alunos
- [ ] Dashboard com gráficos avançados (Chart.js)
- [ ] Relatórios em PDF (pdfkit)

## 👥 Contribuindo

Este é um projeto acadêmico (TCC), mas sugestões são bem-vindas:

1. Fork o projeto
2. Crie uma branch (`git checkout -b feature/MinhaFeature`)
3. Commit suas mudanças (`git commit -m 'Adiciona MinhaFeature'`)
4. Push para a branch (`git push origin feature/MinhaFeature`)
5. Abra um Pull Request

## 📄 Licença

Este projeto é de uso acadêmico.

## 👨‍💻 Autor

Edward Candia - [GitHub](https://github.com/edwardcandia)

## 🙏 Agradecimentos

- Universidade e orientadores
- Comunidade open-source
- Bibliotecas e frameworks utilizados
