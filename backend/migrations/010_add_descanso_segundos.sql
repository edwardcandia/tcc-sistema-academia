-- Migration 010: Adiciona campo descanso_segundos na tabela itens_treino
-- Este campo armazena o tempo de descanso entre séries em segundos

ALTER TABLE itens_treino 
ADD COLUMN IF NOT EXISTS descanso_segundos INTEGER;

-- Comentário explicativo
COMMENT ON COLUMN itens_treino.descanso_segundos IS 'Tempo de descanso entre séries em segundos';
