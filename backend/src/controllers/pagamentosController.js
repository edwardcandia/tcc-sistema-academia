const db = require('../config/database');

const registrarPagamento = async (req, res) => {
    const { id } = req.params;
    const { valor_pago, data_pagamento } = req.body;
    if (!valor_pago || !data_pagamento) {
        return res.status(400).json({ error: 'Valor e data do pagamento são obrigatórios.' });
    }
    try {
        // Iniciar uma transação para garantir a consistência dos dados
        await db.query('BEGIN');
        
        // Inserir o novo pagamento
        await db.query('INSERT INTO pagamentos (aluno_id, data_pagamento, valor, status, data_vencimento) VALUES ($1, $2, $3, $4, NOW())', 
                      [id, data_pagamento, valor_pago, 'pago']);
        
        // Atualizar a data de vencimento do aluno
        const proximoVencimento = new Date(data_pagamento);
        proximoVencimento.setDate(proximoVencimento.getDate() + 30);
        await db.query('UPDATE alunos SET proximo_vencimento = $1 WHERE id = $2', 
                      [proximoVencimento, id]);
        
        // Confirmar a transação
        await db.query('COMMIT');
        
        console.log(`Pagamento registrado para aluno ID ${id}: R$ ${valor_pago}`);
        res.status(201).json({ 
            message: 'Pagamento registrado com sucesso.',
            success: true,
            pagamento: {
                valor: valor_pago,
                data: data_pagamento,
                aluno_id: id
            }
        });
    } catch (error) {
        // Em caso de erro, reverter a transação
        await db.query('ROLLBACK');
        console.error('Erro ao registrar pagamento:', error);
        res.status(500).json({ error: 'Erro ao registrar o pagamento.' });
    }
};

const getPagamentosPorAluno = async (req, res) => {
    const { id } = req.params;
    try {
        const result = await db.query("SELECT id, valor, TO_CHAR(data_pagamento, 'DD/MM/YYYY') as data_pagamento FROM pagamentos WHERE aluno_id = $1 ORDER BY data_pagamento DESC", [id]);
        res.status(200).json(result.rows);
    } catch (error) {
        res.status(500).json({ error: 'Erro ao buscar histórico.' });
    }
};

const deletePagamento = async (req, res) => {
    const { id } = req.params;
    try {
        const result = await db.query('DELETE FROM pagamentos WHERE id = $1', [id]);
        if (result.rowCount === 0) {
            return res.status(404).json({ error: 'Pagamento não encontrado.' });
        }
        res.status(200).json({ message: 'Pagamento excluído com sucesso.' });
    } catch (error) {
        res.status(500).json({ error: 'Erro ao excluir o pagamento.' });
    }
};

module.exports = { registrarPagamento, getPagamentosPorAluno, deletePagamento };