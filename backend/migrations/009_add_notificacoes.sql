-- Migration 009: Criar tabela de notificações
CREATE TABLE IF NOT EXISTS notificacoes (
    id          SERIAL PRIMARY KEY,
    aluno_id    INTEGER NOT NULL REFERENCES alunos(id) ON DELETE CASCADE,
    texto       TEXT NOT NULL,
    tipo        VARCHAR(50) NOT NULL DEFAULT 'info',
    lida        BOOLEAN NOT NULL DEFAULT FALSE,
    created_at  TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_notificacoes_aluno_id ON notificacoes(aluno_id);
CREATE INDEX IF NOT EXISTS idx_notificacoes_lida ON notificacoes(lida);
