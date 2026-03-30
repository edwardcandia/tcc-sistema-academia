-- Migration 011: Torna campos dia_semana e ordem opcionais em itens_treino
-- Esses campos não são sempre necessários, pois nem todo treino precisa de ordem específica

-- Remove a constraint NOT NULL do campo ordem
ALTER TABLE itens_treino 
ALTER COLUMN ordem DROP NOT NULL;

-- Comentários explicativos
COMMENT ON COLUMN itens_treino.ordem IS 'Ordem de execução do exercício (opcional). Se não especificado, exercícios podem ser feitos em qualquer ordem';
COMMENT ON COLUMN itens_treino.dia_semana IS 'Dia da semana do exercício (1=Domingo, 7=Sábado). Opcional para treinos sem divisão semanal';
