import { Request, Response } from 'express';
import db from '../config/database';
import { ApiError, ErrorTypes, asyncHandler } from '../utils/errorHandler';

/**
 * Obtém os dados do perfil do aluno logado
 */
export const getMeusDados = asyncHandler(async (req: Request, res: Response) => {
    const alunoId = req.aluno?.id;

    if (!alunoId) {
        throw new ApiError(ErrorTypes.UNAUTHORIZED.code, 'Aluno não identificado');
    }

    const result = await db.query(`
        SELECT 
            a.id, 
            a.nome_completo, 
            a.cpf, 
            a.email, 
            a.telefone, 
            TO_CHAR(a.data_nascimento, 'DD/MM/YYYY') as data_nascimento,
            TO_CHAR(a.data_matricula, 'DD/MM/YYYY') as data_matricula,
            a.status,
            p.nome as nome_plano,
            p.valor as valor_plano,
            TO_CHAR(a.proximo_vencimento, 'DD/MM/YYYY') as proximo_vencimento
        FROM alunos a
        LEFT JOIN planos p ON a.plano_id = p.id
        WHERE a.id = $1
    `, [alunoId]);

    if (result.rows.length === 0) {
        throw new ApiError(ErrorTypes.NOT_FOUND.code, 'Aluno não encontrado');
    }

    res.status(200).json(result.rows[0]);
});

/**
 * Obtém o histórico de pagamentos do aluno logado
 */
export const getMeusPagamentos = asyncHandler(async (req: Request, res: Response) => {
    const alunoId = req.aluno?.id;

    if (!alunoId) {
        throw new ApiError(ErrorTypes.UNAUTHORIZED.code, 'Aluno não identificado');
    }

    const result = await db.query(`
        SELECT 
            id, 
            TO_CHAR(data_vencimento, 'DD/MM/YYYY') as data_vencimento,
            TO_CHAR(data_pagamento, 'DD/MM/YYYY') as data_pagamento,
            valor,
            status
        FROM pagamentos
        WHERE aluno_id = $1
        ORDER BY data_vencimento DESC
    `, [alunoId]);

    res.status(200).json(result.rows);
});
