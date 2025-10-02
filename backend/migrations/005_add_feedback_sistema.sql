-- backend/migrations/005_add_feedback_sistema.sql
-- Criar tabela de feedbacks dos alunos
CREATE TABLE IF NOT EXISTS feedbacks (
    id SERIAL PRIMARY KEY,
    aluno_id BIGINT NOT NULL,
    titulo VARCHAR(255) NOT NULL,
    descricao TEXT NOT NULL,
    tipo VARCHAR(50) NOT NULL, -- 'sugestao', 'elogio', 'reclamacao'
    avaliacao INT CHECK (avaliacao BETWEEN 1 AND 5), -- Classificação de 1 a 5 estrelas
    resposta TEXT,
    status VARCHAR(20) NOT NULL DEFAULT 'pendente', -- 'pendente', 'respondido', 'arquivado'
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    respondido_por BIGINT,
    FOREIGN KEY (aluno_id) REFERENCES alunos(id) ON DELETE CASCADE,
    FOREIGN KEY (respondido_por) REFERENCES usuarios(id) ON DELETE SET NULL
);