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

/**
 * Obtém os modelos de treino associados ao aluno logado
 */
export const getMeusModelos = asyncHandler(async (req: Request, res: Response) => {
    const alunoId = req.aluno?.id;

    if (!alunoId) {
        throw new ApiError(ErrorTypes.UNAUTHORIZED.code, 'Aluno não identificado');
    }

    const result = await db.query(`
        SELECT 
            amt.id as associacao_id,
            amt.modelo_treino_id as id,
            amt.modelo_treino_id,
            amt.status,
            amt.observacoes,
            TO_CHAR(amt.data_inicio, 'DD/MM/YYYY') as data_inicio,
            TO_CHAR(amt.data_fim, 'DD/MM/YYYY') as data_fim,
            mt.nome as modelo_nome,
            mt.descricao as modelo_descricao,
            mt.objetivo,
            mt.nivel_dificuldade
        FROM alunos_modelos_treino amt
        JOIN modelos_treino mt ON amt.modelo_treino_id = mt.id
        WHERE amt.aluno_id = $1 AND amt.status = 'ativo'
        ORDER BY amt.data_atribuicao DESC
    `, [alunoId]);

    res.status(200).json(result.rows);
});

/**
 * Obtém os detalhes de um modelo de treino específico associado ao aluno logado
 */
export const getDetalhesMeuTreino = asyncHandler(async (req: Request, res: Response) => {
    const alunoId = req.aluno?.id;
    const { id } = req.params;

    if (!alunoId) {
        throw new ApiError(ErrorTypes.UNAUTHORIZED.code, 'Aluno não identificado');
    }

    const modeloId = parseInt(id);
    if (isNaN(modeloId)) {
        throw new ApiError(ErrorTypes.VALIDATION_ERROR.code, 'ID do treino inválido');
    }

    // Primeiro verifica se o aluno tem esse modelo associado (por segurança)
    const associacaoCheck = await db.query(
        'SELECT id FROM alunos_modelos_treino WHERE aluno_id = $1 AND modelo_treino_id = $2',
        [alunoId, modeloId]
    );

    if (associacaoCheck.rows.length === 0) {
        throw new ApiError(ErrorTypes.FORBIDDEN.code, 'Você não tem permissão para visualizar este treino.');
    }

    // Busca os dados do modelo
    const modeloResult = await db.query('SELECT * FROM modelos_treino WHERE id = $1', [modeloId]);
    
    // Busca os exercícios do modelo
    const exerciciosQuery = `
        SELECT 
            it.id, 
            it.exercicio_id,
            e.nome, 
            e.grupo_muscular, 
            it.series, 
            it.repeticoes, 
            it.dia_semana, 
            it.ordem,
            it.descanso_segundos,
            it.observacoes
        FROM itens_treino it
        JOIN exercicios e ON it.exercicio_id = e.id
        WHERE it.modelo_treino_id = $1
        ORDER BY it.dia_semana, it.ordem ASC;
    `;
    const exerciciosResult = await db.query(exerciciosQuery, [modeloId]);

    res.status(200).json({ 
        ...modeloResult.rows[0], 
        exercicios: exerciciosResult.rows 
    });
});
