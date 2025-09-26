-- Apaga as tabelas se elas já existirem, para podermos rodar o script várias vezes sem erro.
DROP TABLE IF EXISTS pagamentos;
DROP TABLE IF EXISTS alunos;
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

-- Inserir dados iniciais para teste
INSERT INTO planos (nome, valor, descricao) VALUES ('Plano Musculação Mensal', 99.90, 'Acesso ilimitado à área de musculação.');
INSERT INTO usuarios (nome, email, senha_hash, cargo) VALUES ('Admin', 'admin@academia.com', 'hash_da_senha_aqui', 'administrador');