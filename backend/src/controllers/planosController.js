// backend/src/controllers/planosController.js
const pool = require('../config/database');

const getPlanos = async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM planos ORDER BY id ASC');
    res.status(200).json(result.rows);
  } catch (error) {
    console.error('Erro detalhado ao buscar planos:', error);
    res.status(500).json({ error: 'Erro ao buscar os planos.' });
  }
};

const createPlano = async (req, res) => {
  const { nome, valor, descricao } = req.body;
  if (!nome || !valor) {
    return res.status(400).json({ error: 'Nome e valor são campos obrigatórios.' });
  }
  try {
    const result = await pool.query(
      'INSERT INTO planos (nome, valor, descricao) VALUES ($1, $2, $3) RETURNING *',
      [nome, valor, descricao]
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Erro detalhado ao criar plano:', error);
    res.status(500).json({ error: 'Erro ao criar o plano.' });
  }
};

const updatePlano = async (req, res) => {
  const { id } = req.params;
  const { nome, valor, descricao } = req.body;
  if (!nome || !valor) {
    return res.status(400).json({ error: 'Nome e valor são campos obrigatórios.' });
  }
  try {
    const result = await pool.query(
      'UPDATE planos SET nome = $1, valor = $2, descricao = $3 WHERE id = $4 RETURNING *',
      [nome, valor, descricao, id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Plano não encontrado.' });
    }
    res.status(200).json(result.rows[0]);
  } catch (error) {
    console.error('Erro detalhado ao atualizar plano:', error);
    res.status(500).json({ error: 'Erro ao atualizar o plano.' });
  }
};

// --- FUNÇÃO DE DELETAR ATUALIZADA ---
const deletePlano = async (req, res) => {
  const { id } = req.params;
  try {
    // 1. VERIFICAR se o plano está em uso
    const alunosNoPlano = await pool.query('SELECT COUNT(*) FROM alunos WHERE plano_id = $1', [id]);
    if (parseInt(alunosNoPlano.rows[0].count, 10) > 0) {
      // 2. RETORNAR um erro específico (409 Conflict) se estiver em uso
      return res.status(409).json({ error: 'Este plano não pode ser excluído pois está em uso por um ou mais alunos.' });
    }

    // 3. DELETAR somente se não estiver em uso
    const result = await pool.query('DELETE FROM planos WHERE id = $1', [id]);
    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'Plano não encontrado.' });
    }

    res.status(200).json({ message: 'Plano deletado com sucesso.' });
  } catch (error) {
    console.error('Erro detalhado ao deletar plano:', error);
    res.status(500).json({ error: 'Erro ao deletar o plano.' });
  }
};

module.exports = {
  getPlanos,
  createPlano,
  updatePlano,
  deletePlano,
};