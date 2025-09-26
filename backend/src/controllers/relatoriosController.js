// backend/src/controllers/relatoriosController.js
const pool = require('../config/database');

const getNovosAlunosPorMes = async (req, res) => {
  // Pega as datas da query string, ex: /novos-alunos?startDate=2025-01-01&endDate=2025-12-31
  const { startDate, endDate } = req.query;
  
  // Define um filtro padrão para o último ano se nenhuma data for fornecida
  let dateFilter = "WHERE data_matricula >= NOW() - INTERVAL '1 year'";
  const params = [];

  // Se as datas forem fornecidas, altera o filtro para usar os parâmetros
  if (startDate && endDate) {
    dateFilter = 'WHERE data_matricula BETWEEN $1 AND $2';
    params.push(startDate, endDate);
  }

  try {
    const query = `
      SELECT 
        TO_CHAR(DATE_TRUNC('month', data_matricula), 'YYYY-MM') AS mes,
        COUNT(id) AS quantidade
      FROM alunos
      ${dateFilter}
      GROUP BY mes ORDER BY mes ASC;
    `;
    const result = await pool.query(query, params);
    res.status(200).json(result.rows);
  } catch (error) {
    console.error('Erro detalhado ao gerar relatório de novos alunos:', error);
    res.status(500).json({ error: 'Erro ao gerar relatório.' });
  }
};

const getAlunosPorPlano = async (req, res) => {
  try {
    const query = `
      SELECT p.nome, COUNT(a.id) AS quantidade
      FROM alunos a
      JOIN planos p ON a.plano_id = p.id
      WHERE a.status = 'ativo'
      GROUP BY p.nome;
    `;
    const result = await pool.query(query);
    res.status(200).json(result.rows);
  } catch (error) {
    console.error('Erro detalhado ao gerar relatório de alunos por plano:', error);
    res.status(500).json({ error: 'Erro ao gerar relatório.' });
  }
};

const getStatusPagamentos = async (req, res) => {
  try {
    const query = `
      SELECT 
        CASE
          WHEN status = 'inativo' THEN 'Inativo'
          WHEN proximo_vencimento IS NULL THEN 'Pendente'
          WHEN proximo_vencimento < NOW() THEN 'Atrasado'
          ELSE 'Em Dia'
        END as status,
        COUNT(*) AS quantidade
      FROM alunos
      GROUP BY status;
    `;
    const result = await pool.query(query);
    res.status(200).json(result.rows);
  } catch (error) {
    console.error('Erro detalhado ao gerar relatório de status de pagamentos:', error);
    res.status(500).json({ error: 'Erro ao gerar relatório.' });
  }
};

module.exports = {
  getNovosAlunosPorMes,
  getAlunosPorPlano,
  getStatusPagamentos,
};