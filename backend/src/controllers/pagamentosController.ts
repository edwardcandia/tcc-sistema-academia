import { Request, Response } from 'express';
import db from '../config/database';
import { asyncHandler, ApiError, ErrorTypes } from '../utils/errorHandler';

const registrarPagamento = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const { valor_pago, data_pagamento } = req.body;
    if (!valor_pago || !data_pagamento) {
        throw new ApiError(ErrorTypes.BAD_REQUEST.code, 'Valor e data do pagamento são obrigatórios.');
    }
    await db.transaction(async (client) => {
        await client.query(
            'INSERT INTO pagamentos (aluno_id, data_pagamento, valor, status, data_vencimento) VALUES ($1, $2, $3, $4, NOW())',
            [id, data_pagamento, valor_pago, 'pago']
        );
        const proximoVencimento = new Date(data_pagamento);
        proximoVencimento.setDate(proximoVencimento.getDate() + 30);
        await client.query('UPDATE alunos SET proximo_vencimento = $1 WHERE id = $2', [proximoVencimento, id]);
    });
    res.status(201).json({
        message: 'Pagamento registrado com sucesso.',
        pagamento: { valor: valor_pago, data: data_pagamento, aluno_id: id }
    });
});

const getPagamentosPorAluno = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const result = await db.query(
        "SELECT id, valor, TO_CHAR(data_pagamento, 'DD/MM/YYYY') as data_pagamento FROM pagamentos WHERE aluno_id = $1 ORDER BY data_pagamento DESC",
        [id]
    );
    res.status(200).json(result.rows);
});

const deletePagamento = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const result = await db.query('DELETE FROM pagamentos WHERE id = $1', [id]);
    if (result.rowCount === 0) {
        throw new ApiError(ErrorTypes.NOT_FOUND.code, 'Pagamento não encontrado.');
    }
    res.status(200).json({ message: 'Pagamento excluído com sucesso.' });
});

export { registrarPagamento, getPagamentosPorAluno, deletePagamento };