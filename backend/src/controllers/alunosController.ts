import { Request, Response } from 'express';
import db from '../config/database';
import { asyncHandler, ApiError, ErrorTypes } from '../utils/errorHandler';

const ALUNO_SELECT = `
    id, nome_completo, cpf, email, telefone,
    TO_CHAR(data_nascimento, 'YYYY-MM-DD') AS data_nascimento,
    TO_CHAR(data_matricula, 'YYYY-MM-DD') AS data_matricula,
    status, plano_id,
    TO_CHAR(proximo_vencimento, 'YYYY-MM-DD') AS proximo_vencimento,
    CASE
        WHEN status = 'inativo' THEN 'inativo'
        WHEN proximo_vencimento IS NULL THEN 'pendente'
        WHEN proximo_vencimento < NOW() THEN 'atrasado'
        ELSE 'em_dia'
    END AS status_pagamento
`;

const getAlunos = asyncHandler(async (_req: Request, res: Response) => {
    const result = await db.query(`SELECT ${ALUNO_SELECT} FROM alunos ORDER BY id ASC`);
    res.status(200).json(result.rows);
});

const createAluno = asyncHandler(async (req: Request, res: Response) => {
    const { nome_completo, cpf, email, telefone, data_nascimento, plano_id, status } = req.body;
    if (!nome_completo || !cpf || !email || !data_nascimento) {
        throw new ApiError(ErrorTypes.BAD_REQUEST.code, 'Campos obrigatórios: nome_completo, cpf, email, data_nascimento.');
    }
    const proximoVencimento = new Date();
    proximoVencimento.setDate(proximoVencimento.getDate() + 30);
    const result = await db.query(
        `INSERT INTO alunos (nome_completo, cpf, email, telefone, data_nascimento, plano_id, proximo_vencimento, status)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
         RETURNING ${ALUNO_SELECT}`,
        [nome_completo, cpf, email, telefone, data_nascimento, plano_id, proximoVencimento, status || 'ativo']
    );
    res.status(201).json(result.rows[0]);
});

const updateAluno = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const { nome_completo, cpf, email, telefone, data_nascimento, plano_id, status, proximo_vencimento } = req.body;
    const result = await db.query(
        `UPDATE alunos
         SET nome_completo=$1, cpf=$2, email=$3, telefone=$4, data_nascimento=$5,
             plano_id=$6, status=$7, proximo_vencimento=$8
         WHERE id=$9
         RETURNING ${ALUNO_SELECT}`,
        [nome_completo, cpf, email, telefone, data_nascimento, plano_id, status, proximo_vencimento, id]
    );
    if (result.rows.length === 0) {
        throw new ApiError(ErrorTypes.NOT_FOUND.code, 'Aluno não encontrado.');
    }
    res.status(200).json(result.rows[0]);
});

const deleteAluno = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const result = await db.query('DELETE FROM alunos WHERE id = $1', [id]);
    if (result.rowCount === 0) {
        throw new ApiError(ErrorTypes.NOT_FOUND.code, 'Aluno não encontrado.');
    }
    res.status(200).json({ message: 'Aluno deletado com sucesso.' });
});

export { getAlunos, createAluno, updateAluno, deleteAluno };