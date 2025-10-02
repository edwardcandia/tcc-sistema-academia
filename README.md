# PlankGYM - Sistema de Gestão para Academias

## Visão Geral

PlankGYM é um sistema de gestão completo para academias, com foco na administração de alunos, planos, pagamentos e treinos. O sistema foi simplificado para atender apenas aos administradores e funcionários, centralizando a gestão e aumentando a eficiência operacional.

## Alterações Recentes

### Remoção da Funcionalidade de Aulas e Atividades

Para simplificar o sistema e focar nas funcionalidades essenciais, a opção de aulas e atividades foi removida. Isso inclui:

- Remoção das rotas relacionadas a aulas
- Remoção dos controllers de aulas
- Remoção das referências no arquivo principal (index.js)

### Aprimoramento dos Relatórios

A seção de relatórios foi significativamente aprimorada com novos relatórios detalhados:

- **Frequência de Alunos**: Analisa padrões de frequência, dias da semana mais populares e horários de pico
- **Análise de Receitas**: Detalha receitas mensais, por plano e estatísticas gerais
- **Desempenho de Treinos**: Mostra os treinos mais populares, avaliações médias e duração
- **Dashboard**: Resumo com KPIs principais para visão gerencial rápida

### Rebranding para PlankGYM

O sistema foi renomeado para "PlankGYM" em homenagem ao Plankton do desenho Bob Esponja. Esta mudança foi aplicada em:

- Metadados dos arquivos package.json (frontend e backend)
- Título da aplicação no arquivo index.html
- Componentes da interface (Dashboard)
- Documentação Swagger

## Tecnologias Utilizadas

### Backend
- Node.js
- Express.js
- PostgreSQL
- JWT para autenticação

### Frontend
- React
- Material UI
- Axios para requisições HTTP
- Vite para build e desenvolvimento

## Instalação

### Requisitos
- Node.js v14+
- PostgreSQL 12+

### Passos para Instalação

1. Clone o repositório
2. Configure o banco de dados PostgreSQL

**Backend:**
```
cd backend
npm install
npm run dev
```

**Frontend:**
```
cd frontend
npm install
npm run dev
```

## Estrutura do Projeto

```
tcc-sistema-academia/
├── backend/
│   ├── src/
│   │   ├── config/
│   │   ├── controllers/
│   │   ├── middleware/
│   │   ├── routes/
│   │   ├── services/
│   │   └── utils/
│   └── index.js
└── frontend/
    ├── public/
    └── src/
        ├── components/
        ├── context/
        ├── hooks/
        ├── pages/
        └── services/
```

## Funcionalidades Principais

- Gestão de alunos
- Controle de planos e pagamentos
- Gerenciamento de treinos e exercícios
- Notificações automáticas
- Relatórios detalhados e análises
- Dashboard interativo

## Acesso ao Sistema

O sistema agora é focado apenas no acesso de administradores e funcionários, com diferentes níveis de permissão baseados em papéis.