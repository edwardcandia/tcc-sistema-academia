-- Criar tabela de registros de treinos realizados
CREATE TABLE IF NOT EXISTS registros_treino (
    id SERIAL PRIMARY KEY,
    aluno_id BIGINT NOT NULL,
    treino_id BIGINT NOT NULL,
    data_realizacao DATE NOT NULL,
    duracao INT NOT NULL, -- Duração em minutos
    observacoes TEXT,
    avaliacao INT CHECK (avaliacao BETWEEN 1 AND 5),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (aluno_id) REFERENCES alunos(id) ON DELETE CASCADE,
    FOREIGN KEY (treino_id) REFERENCES modelos_treino(id) ON DELETE CASCADE
);

-- Criar tabela de notificações
CREATE TABLE IF NOT EXISTS notificacoes (
    id SERIAL PRIMARY KEY,
    aluno_id BIGINT NOT NULL,
    texto VARCHAR(255) NOT NULL,
    tipo VARCHAR(50) NOT NULL, -- alerta, info
    lida BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (aluno_id) REFERENCES alunos(id) ON DELETE CASCADE
);