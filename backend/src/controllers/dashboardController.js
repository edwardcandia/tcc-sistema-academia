// backend/src/controllers/dashboardController.js
const pool = require('../config/database');

const getMetrics = async (req, res) => {
  try {
    // Executa todas as consultas em paralelo para mais eficiência
    const [totalAlunosRes, alunosAtivosRes, totalPlanosRes, receitaMensalRes] = await Promise.all([
      pool.query('SELECT COUNT(*) FROM alunos'),
      pool.query("SELECT COUNT(*) FROM alunos WHERE status = 'ativo'"),
      pool.query('SELECT COUNT(*) FROM planos'),
      pool.query(`
        SELECT SUM(p.valor) as receita_total
        FROM alunos a
        JOIN planos p ON a.plano_id = p.id
        WHERE a.status = 'ativo'
      `)
    ]);

    const metrics = {
      totalAlunos: parseInt(totalAlunosRes.rows[0].count, 10),
      alunosAtivos: parseInt(alunosAtivosRes.rows[0].count, 10),
      totalPlanos: parseInt(totalPlanosRes.rows[0].count, 10),
      receitaMensal: parseFloat(receitaMensalRes.rows[0].receita_total || 0).toFixed(2)
    };

    res.status(200).json(metrics);
  } catch (error) {
    console.error('Erro detalhado ao buscar métricas:', error);
    res.status(500).json({ error: 'Erro ao buscar as métricas.' });
  }
};

module.exports = {
  getMetrics,
};