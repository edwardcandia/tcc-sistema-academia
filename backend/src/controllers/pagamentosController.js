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

module.exports = {
  registrarPagamento,
};