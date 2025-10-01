-- Apaga as tabelas se elas já existirem, para podermos rodar o script várias vezes sem erro.
DROP TABLE IF EXISTS itens_treino;
DROP TABLE IF EXISTS modelos_treino;
DROP TABLE IF EXISTS pagamentos;
DROP TABLE IF EXISTS alunos;
DROP TABLE IF EXISTS exercicios;
DROP TABLE IF EXISTS planos;
DROP TABLE IF EXISTS usuarios;

-- Tabela para os planos da academia
CREATE TABLE planos (
    id SERIAL PRIMARY KEY,
    nome VARCHAR(100) NOT NULL,
    valor DECIMAL(10, 2) NOT NULL,
    descricao TEXT
);

-- Tabela para os usuários do sistema (admin, recepcionista)
CREATE TABLE usuarios (
    id SERIAL PRIMARY KEY,
    nome VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    senha_hash VARCHAR(255) NOT NULL,
    cargo VARCHAR(50) NOT NULL
);

-- Tabela para os alunos matriculados
CREATE TABLE alunos (
    id SERIAL PRIMARY KEY,
    nome_completo VARCHAR(255) NOT NULL,
    cpf VARCHAR(14) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    telefone VARCHAR(20),
    data_nascimento DATE NOT NULL,
    data_matricula DATE NOT NULL DEFAULT CURRENT_DATE,
    status VARCHAR(20) NOT NULL DEFAULT 'ativo',
    plano_id INTEGER,
    CONSTRAINT fk_plano FOREIGN KEY (plano_id) REFERENCES planos(id)
);

-- Tabela para o histórico de pagamentos
CREATE TABLE pagamentos (
    id SERIAL PRIMARY KEY,
    aluno_id INTEGER NOT NULL,
    data_vencimento DATE NOT NULL,
    data_pagamento DATE,
    valor DECIMAL(10, 2) NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'pendente',
    CONSTRAINT fk_aluno FOREIGN KEY (aluno_id) REFERENCES alunos(id) ON DELETE CASCADE
);

-- Tabela para os exercícios da academia
CREATE TABLE exercicios (
    id SERIAL PRIMARY KEY,
    nome VARCHAR(255) NOT NULL UNIQUE,
    grupo_muscular VARCHAR(100) NOT NULL,
    link_video VARCHAR(255),
    data_criacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Inserir dados iniciais para teste
INSERT INTO planos (nome, valor, descricao) VALUES ('Plano Musculação Mensal', 99.90, 'Acesso ilimitado à área de musculação.');
INSERT INTO usuarios (nome, email, senha_hash, cargo) VALUES ('Admin', 'admin@academia.com', 'hash_da_senha_aqui', 'administrador');

-- Tabela para modelos de treino
CREATE TABLE modelos_treino (
    id SERIAL PRIMARY KEY,
    nome VARCHAR(255) NOT NULL,
    descricao TEXT,
    nivel_dificuldade VARCHAR(50) CHECK (nivel_dificuldade IN ('Iniciante', 'Intermediário', 'Avançado')),
    objetivo VARCHAR(100),
    duracao_semanas INTEGER,
    data_criacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    criado_por INTEGER REFERENCES usuarios(id)
);

-- Tabela para os itens (exercícios) de cada modelo de treino
CREATE TABLE itens_treino (
    id SERIAL PRIMARY KEY,
    modelo_treino_id INTEGER NOT NULL,
    exercicio_id INTEGER NOT NULL,
    dia_semana INTEGER CHECK (dia_semana BETWEEN 1 AND 7), -- 1: Domingo, 2: Segunda, etc.
    series INTEGER NOT NULL,
    repeticoes VARCHAR(50) NOT NULL, -- Pode ser "12", "8-12", etc.
    ordem INTEGER NOT NULL, -- Ordem de execução no dia
    observacoes TEXT,
    CONSTRAINT fk_modelo_treino FOREIGN KEY (modelo_treino_id) REFERENCES modelos_treino(id) ON DELETE CASCADE,
    CONSTRAINT fk_exercicio FOREIGN KEY (exercicio_id) REFERENCES exercicios(id)
);

-- Inserindo alguns exercícios de exemplo
INSERT INTO exercicios (nome, grupo_muscular, link_video) VALUES 
('Supino Reto', 'Peito', 'https://www.youtube.com/watch?v=exemplo1'),
('Agachamento', 'Pernas', 'https://www.youtube.com/watch?v=exemplo2'),
('Remada Curvada', 'Costas', 'https://www.youtube.com/watch?v=exemplo3'),
('Rosca Direta', 'Bíceps', 'https://www.youtube.com/watch?v=exemplo4'),
('Tríceps Corda', 'Tríceps', 'https://www.youtube.com/watch?v=exemplo5');