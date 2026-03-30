import { Request, Response } from 'express';
import db from '../config/database';
import { asyncHandler, ApiError, ErrorTypes } from '../utils/errorHandler';

/**
 * Associa um modelo de treino a um aluno
 */
const associarModeloAoAluno = asyncHandler(async (req: Request, res: Response) => {
    const { aluno_id, modelo_treino_id, data_inicio, data_fim, observacoes } = req.body;

    if (!aluno_id || !modelo_treino_id) {
        throw new ApiError(ErrorTypes.BAD_REQUEST.code, 'aluno_id e modelo_treino_id são obrigatórios.');
    }

    // Verifica se o aluno existe
    const alunoCheck = await db.query('SELECT id FROM alunos WHERE id = $1', [aluno_id]);
    if (alunoCheck.rows.length === 0) {
        throw new ApiError(ErrorTypes.NOT_FOUND.code, 'Aluno não encontrado.');
    }

    // Verifica se o modelo existe
    const modeloCheck = await db.query('SELECT id FROM modelos_treino WHERE id = $1', [modelo_treino_id]);
    if (modeloCheck.rows.length === 0) {
        throw new ApiError(ErrorTypes.NOT_FOUND.code, 'Modelo de treino não encontrado.');
    }

    // Verifica se já existe uma associação ativa
    const existingActive = await db.query(
        'SELECT id FROM alunos_modelos_treino WHERE aluno_id = $1 AND modelo_treino_id = $2 AND status = $3',
        [aluno_id, modelo_treino_id, 'ativo']
    );

    if (existingActive.rows.length > 0) {
        throw new ApiError(ErrorTypes.BAD_REQUEST.code, 'Este aluno já possui este modelo ativo.');
    }

    const result = await db.query(
        `INSERT INTO alunos_modelos_treino (aluno_id, modelo_treino_id, data_inicio, data_fim, observacoes, status)
         VALUES ($1, $2, $3, $4, $5, 'ativo')
         RETURNING *`,
        [aluno_id, modelo_treino_id, data_inicio || null, data_fim || null, observacoes || null]
    );

    res.status(201).json(result.rows[0]);
});

/**
 * Lista todos os modelos associados a um aluno específico
 */
const getModelosDoAluno = asyncHandler(async (req: Request, res: Response) => {
    const { aluno_id } = req.params;

    const result = await db.query(
        `SELECT 
            amt.id as associacao_id,
            amt.aluno_id,
            amt.modelo_treino_id,
            amt.data_atribuicao,
            TO_CHAR(amt.data_inicio, 'YYYY-MM-DD') as data_inicio,
            TO_CHAR(amt.data_fim, 'YYYY-MM-DD') as data_fim,
            amt.status,
            amt.observacoes,
            mt.nome as modelo_nome,
            mt.descricao as modelo_descricao,
            mt.nivel_dificuldade,
            mt.objetivo,
            mt.duracao_semanas
         FROM alunos_modelos_treino amt
         JOIN modelos_treino mt ON amt.modelo_treino_id = mt.id
         WHERE amt.aluno_id = $1
         ORDER BY amt.data_atribuicao DESC`,
        [aluno_id]
    );

    res.status(200).json(result.rows);
});

/**
 * Lista todos os alunos associados a um modelo de treino específico
 */
const getAlunosDoModelo = asyncHandler(async (req: Request, res: Response) => {
    const { modelo_id } = req.params;

    const result = await db.query(
        `SELECT 
            amt.id as associacao_id,
            amt.aluno_id,
            amt.modelo_treino_id,
            amt.data_atribuicao,
            TO_CHAR(amt.data_inicio, 'YYYY-MM-DD') as data_inicio,
            TO_CHAR(amt.data_fim, 'YYYY-MM-DD') as data_fim,
            amt.status,
            amt.observacoes,
            a.nome_completo,
            a.email,
            a.status as aluno_status
         FROM alunos_modelos_treino amt
         JOIN alunos a ON amt.aluno_id = a.id
         WHERE amt.modelo_treino_id = $1
         ORDER BY amt.data_atribuicao DESC`,
        [modelo_id]
    );

    res.status(200).json(result.rows);
});

/**
 * Atualiza uma associação existente (status, datas, observações)
 */
const atualizarAssociacao = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const { data_inicio, data_fim, status, observacoes } = req.body;

    const result = await db.query(
        `UPDATE alunos_modelos_treino
         SET data_inicio = COALESCE($1, data_inicio),
             data_fim = COALESCE($2, data_fim),
             status = COALESCE($3, status),
             observacoes = COALESCE($4, observacoes)
         WHERE id = $5
         RETURNING *`,
        [data_inicio, data_fim, status, observacoes, id]
    );

    if (result.rows.length === 0) {
        throw new ApiError(ErrorTypes.NOT_FOUND.code, 'Associação não encontrada.');
    }

    res.status(200).json(result.rows[0]);
});

/**
 * Remove uma associação entre aluno e modelo
 */
const removerAssociacao = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;

    const result = await db.query('DELETE FROM alunos_modelos_treino WHERE id = $1', [id]);

    if (result.rowCount === 0) {
        throw new ApiError(ErrorTypes.NOT_FOUND.code, 'Associação não encontrada.');
    }

    res.status(200).json({ message: 'Associação removida com sucesso.' });
});

/**
 * Lista todas as associações no sistema (útil para dashboards)
 */
const getAllAssociacoes = asyncHandler(async (_req: Request, res: Response) => {
    const result = await db.query(
        `SELECT 
            amt.id,
            amt.aluno_id,
            amt.modelo_treino_id,
            amt.data_atribuicao,
            TO_CHAR(amt.data_inicio, 'YYYY-MM-DD') as data_inicio,
            TO_CHAR(amt.data_fim, 'YYYY-MM-DD') as data_fim,
            amt.status,
            amt.observacoes,
            a.nome_completo as aluno_nome,
            mt.nome as modelo_nome
         FROM alunos_modelos_treino amt
         JOIN alunos a ON amt.aluno_id = a.id
         JOIN modelos_treino mt ON amt.modelo_treino_id = mt.id
         ORDER BY amt.data_atribuicao DESC`
    );

    res.status(200).json(result.rows);
});

export {
    associarModeloAoAluno,
    getModelosDoAluno,
    getAlunosDoModelo,
    atualizarAssociacao,
    removerAssociacao,
    getAllAssociacoes
};
