// backend/src/controllers/relatoriosController.js
const pool = require('../config/database');

// Gera o relatório de novos alunos por mês no último ano
const getNovosAlunosPorMes = async (req, res) => {
  try {
    const query = `
      SELECT 
        TO_CHAR(DATE_TRUNC('month', data_matricula), 'YYYY-MM') AS mes,
        COUNT(id) AS quantidade
      FROM 
        alunos
      WHERE 
        data_matricula >= NOW() - INTERVAL '1 year'
      GROUP BY 
        mes
      ORDER BY 
        mes ASC;
    `;
    const result = await pool.query(query);
    res.status(200).json(result.rows);
  } catch (error) {
    console.error('Erro detalhado ao gerar relatório:', error);
    res.status(500).json({ error: 'Erro ao gerar relatório.' });
  }
};

module.exports = {
  getNovosAlunosPorMes,
};