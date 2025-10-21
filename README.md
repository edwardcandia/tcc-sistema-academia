# PlankGYM - Sistema de Gestão para Academias

## Visão Geral

PlankGYM é um sistema de gestão completo para academias, com foco na administração de alunos, planos, pagamentos e treinos. O sistema foi simplificado para atender apenas aos administradores e funcionários, centralizando a gestão e aumentando a eficiência operacional.

## Alterações Recentes

### Migração para TypeScript

Todo o código-fonte do projeto foi migrado de JavaScript para TypeScript, trazendo os seguintes benefícios:

- Tipagem estática para maior segurança e confiabilidade do código
- Melhor suporte para autocompletar e documentação inline
- Refatorações mais seguras e detecção de erros em tempo de compilação
- Interfaces e tipos bem definidos para modelos de dados
- Melhor experiência de desenvolvimento com IntelliSense aprimorado

### Remoção da Funcionalidade de Aulas e Atividades

Para simplificar o sistema e focar nas funcionalidades essenciais, a opção de aulas e atividades foi completamente removida. Isso inclui:

- Remoção das rotas relacionadas a aulas
- Remoção dos controllers de aulas
- Remoção de componentes frontend e páginas de aulas
- Remoção das tabelas de banco de dados relacionadas
- Limpeza completa de todos arquivos e referências a essa funcionalidade

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
- Node.js com TypeScript
- Express.js
- PostgreSQL
- JWT para autenticação
- Swagger para documentação da API

### Frontend
- React com TypeScript
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
npm run dev      # Para desenvolvimento com hot-reload
npm run build    # Para compilar TypeScript
npm start        # Para executar versão compilada
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
│   ├── dist/              # Código compilado TypeScript
│   ├── src/
│   │   ├── @types/        # Definições de tipos TypeScript
│   │   ├── config/
│   │   ├── controllers/
│   │   ├── middleware/
│   │   ├── routes/
│   │   ├── services/
│   │   └── utils/
│   └── index.ts           # Ponto de entrada em TypeScript
└── frontend/
    ├── public/
    └── src/
        ├── components/
        ├── context/
        ├── hooks/
        ├── pages/
        ├── types/         # Definições de tipos TypeScript
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