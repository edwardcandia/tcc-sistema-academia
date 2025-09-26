// backend/src/controllers/pagamentosController.js
const pool = require('../config/database');

const registrarPagamento = async (req, res) => {
  const { id } = req.params; // ID do aluno
  const { valor_pago, data_pagamento } = req.body;

  if (!valor_pago || !data_pagamento) {
    return res.status(400).json({ error: 'Valor e data do pagamento são obrigatórios.' });
  }

  try {
    await pool.query(
      'INSERT INTO pagamentos (aluno_id, data_pagamento, valor, status, data_vencimento) VALUES ($1, $2, $3, $4, NOW())',
      [id, data_pagamento, valor_pago, 'pago']
    );

    const proximoVencimento = new Date(data_pagamento);
    proximoVencimento.setDate(proximoVencimento.getDate() + 30);
    
    await pool.query(
      'UPDATE alunos SET proximo_vencimento = $1 WHERE id = $2',
      [proximoVencimento, id]
    );
    
    res.status(201).json({ message: 'Pagamento registrado e data de vencimento atualizada com sucesso.' });
  } catch (error) {
    console.error('Erro detalhado ao registrar pagamento:', error);
    res.status(500).json({ error: 'Erro ao registrar o pagamento.' });
  }
};

const getPagamentosPorAluno = async (req, res) => {
  const { id } = req.params; // ID do aluno
  try {
    const result = await pool.query(
      'SELECT id, valor, TO_CHAR(data_pagamento, \'DD/MM/YYYY\') as data_pagamento FROM pagamentos WHERE aluno_id = $1 ORDER BY data_pagamento DESC',
      [id]
    );
    res.status(200).json(result.rows);
  } catch (error) {
    console.error('Erro ao buscar histórico de pagamentos:', error);
    res.status(500).json({ error: 'Erro ao buscar histórico de pagamentos.' });
  }
};

// --- NOVA FUNÇÃO ---
const deletePagamento = async (req, res) => {
    const { id } = req.params; // ID do pagamento
    try {
        const result = await pool.query('DELETE FROM pagamentos WHERE id = $1', [id]);
        if (result.rowCount === 0) {
            return res.status(404).json({ error: 'Pagamento não encontrado.' });
        }
        res.status(200).json({ message: 'Pagamento excluído com sucesso.' });
    } catch (error) {
        console.error('Erro ao excluir pagamento:', error);
        res.status(500).json({ error: 'Erro ao excluir o pagamento.' });
    }
};

module.exports = {
  registrarPagamento,
  getPagamentosPorAluno,
  deletePagamento, // Adicionado
};