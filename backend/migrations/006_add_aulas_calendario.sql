-- backend/migrations/006_add_aulas_calendario.sql
-- Criar tabela para tipos de aulas
CREATE TABLE IF NOT EXISTS tipos_aula (
    id SERIAL PRIMARY KEY,
    nome VARCHAR(100) NOT NULL,
    descricao TEXT,
    cor VARCHAR(7) NOT NULL DEFAULT '#3498db', -- Cor para exibição no calendário (formato HEX)
    duracao_padrao INTEGER NOT NULL DEFAULT 60 -- Duração padrão em minutos
);

-- Criar tabela para aulas agendadas
CREATE TABLE IF NOT EXISTS aulas (
    id SERIAL PRIMARY KEY,
    tipo_aula_id BIGINT NOT NULL,
    titulo VARCHAR(255) NOT NULL,
    descricao TEXT,
    data DATE NOT NULL,
    hora_inicio TIME NOT NULL,
    hora_fim TIME NOT NULL,
    max_participantes INTEGER,
    instrutor_id BIGINT, -- ID do professor/instrutor (referência a usuarios)
    status VARCHAR(20) NOT NULL DEFAULT 'agendada', -- 'agendada', 'realizada', 'cancelada'
    sala VARCHAR(50),
    observacoes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (tipo_aula_id) REFERENCES tipos_aula(id) ON DELETE RESTRICT,
    FOREIGN KEY (instrutor_id) REFERENCES usuarios(id) ON DELETE SET NULL
);

-- Criar tabela para inscrições em aulas
CREATE TABLE IF NOT EXISTS inscricoes_aula (
    id SERIAL PRIMARY KEY,
    aula_id BIGINT NOT NULL,
    aluno_id BIGINT NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'confirmada', -- 'confirmada', 'cancelada', 'presente', 'ausente'
    data_inscricao TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    observacoes TEXT,
    FOREIGN KEY (aula_id) REFERENCES aulas(id) ON DELETE CASCADE,
    FOREIGN KEY (aluno_id) REFERENCES alunos(id) ON DELETE CASCADE,
    UNIQUE(aula_id, aluno_id) -- Evitar inscrições duplicadas
);

-- Inserir alguns tipos de aula para testes
INSERT INTO tipos_aula (nome, descricao, cor, duracao_padrao) VALUES 
('Yoga', 'Aulas de yoga para todos os níveis', '#8e44ad', 60),
('Pilates', 'Fortalecimento do core e flexibilidade', '#2ecc71', 45),
('Spinning', 'Ciclismo indoor de alta intensidade', '#e74c3c', 45),
('Zumba', 'Aula de dança com ritmos latinos', '#f39c12', 60),
('Funcional', 'Treino funcional em grupo', '#3498db', 45);