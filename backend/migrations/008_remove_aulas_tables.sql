-- backend/migrations/008_remove_aulas_tables.sql
-- Script para remover as tabelas relacionadas a aulas e atividades

-- Primeiro removemos as tabelas filhas para evitar erros de chave estrangeira
DROP TABLE IF EXISTS inscricoes_aula;
DROP TABLE IF EXISTS aulas;
DROP TABLE IF EXISTS tipos_aula;

-- Comentário indicando a conclusão da migração
COMMENT ON DATABASE plankgym IS 'Banco de dados do sistema PlankGYM - Módulo de aulas e atividades removido.';