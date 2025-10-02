## Instalação do Calendário de Aulas

Para instalar corretamente o módulo de calendário de aulas, siga os passos abaixo:

### 1. Backend

1. Certifique-se de aplicar o arquivo de migração:

```sql
-- Arquivo: migrations/006_add_aulas_calendario.sql

CREATE TABLE IF NOT EXISTS tipos_aula (
    id SERIAL PRIMARY KEY,
    nome VARCHAR(100) NOT NULL,
    descricao TEXT,
    cor VARCHAR(20) DEFAULT '#3498db',
    duracao_padrao INTEGER DEFAULT 60
);

CREATE TABLE IF NOT EXISTS aulas (
    id SERIAL PRIMARY KEY,
    tipo_aula_id INTEGER REFERENCES tipos_aula(id),
    titulo VARCHAR(100) NOT NULL,
    descricao TEXT,
    data DATE NOT NULL,
    hora_inicio TIME NOT NULL,
    hora_fim TIME NOT NULL,
    status VARCHAR(20) DEFAULT 'agendada',
    max_participantes INTEGER,
    instrutor_id INTEGER REFERENCES usuarios(id),
    sala VARCHAR(50),
    observacoes TEXT,
    data_criacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS inscricoes_aula (
    id SERIAL PRIMARY KEY,
    aula_id INTEGER REFERENCES aulas(id) ON DELETE CASCADE,
    aluno_id INTEGER REFERENCES alunos(id) ON DELETE CASCADE,
    status VARCHAR(20) DEFAULT 'confirmada',
    data_inscricao TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    observacoes TEXT,
    UNIQUE(aula_id, aluno_id)
);

-- Dados iniciais de exemplo
INSERT INTO tipos_aula (nome, descricao, cor, duracao_padrao) VALUES
('Musculação', 'Aula de musculação com orientação', '#2ecc71', 60),
('Funcional', 'Treinamento funcional em grupo', '#3498db', 45),
('Yoga', 'Aula de yoga para equilíbrio físico e mental', '#9b59b6', 60),
('Pilates', 'Aula de pilates para fortalecimento e flexibilidade', '#e74c3c', 50),
('Spinning', 'Aula de spinning para alta queima calórica', '#f39c12', 45),
('CrossFit', 'Treino de alta intensidade', '#1abc9c', 60),
('Zumba', 'Aula de dança e ritmos', '#d35400', 45)
ON CONFLICT DO NOTHING;
```

2. Instale as dependências do backend (o nodemailer já está incluído no package.json):

```
cd backend
npm install
```

3. Certifique-se de que o arquivo de rotas foi adicionado ao `index.js`.

### 2. Frontend

1. Instale as novas dependências do frontend:

```
cd frontend
npm install @mui/x-date-pickers moment react-big-calendar @date-io/date-fns@2.16.0
```

> **Importante**: A versão específica do `@date-io/date-fns` (2.16.0) é necessária para compatibilidade com a versão do `date-fns` (2.30.0) usada no projeto.

2. Execute a aplicação:

```
npm run dev
```

### 3. Uso da Funcionalidade

- **Administradores e instrutores** podem:
  - Criar e gerenciar tipos de aulas
  - Agendar novas aulas
  - Ver inscrições de alunos
  - Cancelar ou marcar aulas como realizadas

- **Alunos** podem:
  - Ver o calendário de aulas disponíveis
  - Inscrever-se em aulas
  - Cancelar suas inscrições
  - Ver seu histórico de aulas

Agora você pode acessar o sistema e começar a usar o calendário de aulas!