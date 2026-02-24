import { Request, Response } from 'express';
import db from '../config/database';
import { ApiError, ErrorTypes, asyncHandler } from '../utils/errorHandler';

export const registrarTreino = asyncHandler(async (req: Request, res: Response) => {
    const { treino_id, data, duracao, observacoes, avaliacao, aluno_id } = req.body;
    
    if (!aluno_id) {
        throw new ApiError(ErrorTypes.VALIDATION_ERROR.code, 'ID do aluno é obrigatório');
    }

    // Verificar se o treino existe e está atribuído ao aluno
    const treino = await db.query(`
        SELECT mt.id 
        FROM modelos_treino mt
        JOIN alunos_modelos_treino amt ON mt.id = amt.modelo_treino_id
        WHERE mt.id = $1 AND amt.aluno_id = $2
    `, [treino_id, aluno_id]);

    if (treino.rows.length === 0) {
        throw new ApiError(
            ErrorTypes.NOT_FOUND.code,
            'Treino não encontrado ou não atribuído a este aluno'
        );
    }

    // Registrar o treino realizado usando uma transação
    const result = await db.transaction(async (client) => {
        // Inserir o registro do treino
        const insertResult = await client.query(`
            INSERT INTO registros_treino 
                (aluno_id, treino_id, data_realizacao, duracao, observacoes, avaliacao) 
            VALUES ($1, $2, $3, $4, $5, $6) 
            RETURNING id
        `, [aluno_id, treino_id, data, duracao, observacoes, avaliacao || 5]);
        
        // Podemos adicionar outras operações relacionadas dentro da mesma transação
        // Por exemplo, atualizar estatísticas do aluno, registrar no histórico, etc.
        
        return insertResult.rows[0];
    });

    // Resposta de sucesso
    res.status(201).json({
        success: true,
        message: 'Treino registrado com sucesso',
        id: result.id
    });
});

export const obterHistoricoTreinos = asyncHandler(async (req: Request, res: Response) => {
    const { aluno_id } = req.query;
    
    // Verificar se o ID do aluno está definido
    if (!aluno_id) {
        throw new ApiError(ErrorTypes.VALIDATION_ERROR.code, 'ID do aluno não fornecido na requisição');
    }
    
    // Obter histórico de treinos com paginação
    const page = parseInt(String(req.query.page || '1')) || 1;
    const limit = parseInt(String(req.query.limit || '10')) || 10;
    const offset = (page - 1) * limit;
    
    // Consultar total de registros para paginação
    const countResult = await db.query(
        'SELECT COUNT(*) FROM registros_treino WHERE aluno_id = $1',
        [aluno_id]
    );
    
    const total = parseInt(countResult.rows[0].count);
    const totalPages = Math.ceil(total / limit);
    
    // Consultar registros de treino com junções para informações relevantes
    const result = await db.query(`
        SELECT 
            rt.id,
            rt.aluno_id,
            rt.treino_id,
            rt.data_realizacao,
            rt.duracao,
            rt.observacoes,
            rt.avaliacao,
            rt.created_at,
            mt.nome AS nome_treino,
            mt.descricao AS descricao_treino
        FROM 
            registros_treino rt
        JOIN 
            modelos_treino mt ON rt.treino_id = mt.id
        WHERE 
            rt.aluno_id = $1
        ORDER BY 
            rt.data_realizacao DESC
        LIMIT $2 OFFSET $3
    `, [aluno_id, limit, offset]);
    
    // Montar objeto de resposta com paginação
    res.status(200).json({
        success: true,
        data: result.rows,
        pagination: {
            total,
            totalPages,
            currentPage: page,
            pageSize: limit
        }
    });
});

export const obterEstatisticas = asyncHandler(async (req: Request, res: Response) => {
    const { aluno_id } = req.query;
    
    // Verificar se o ID do aluno está definido
    if (!aluno_id) {
        throw new ApiError(ErrorTypes.VALIDATION_ERROR.code, 'ID do aluno não fornecido na requisição');
    }
    
    // Estatísticas básicas: total de treinos, tempo total, média de avaliação
    const estatisticas = await db.query(`
        SELECT 
            COUNT(*) as total_treinos,
            SUM(duracao) as tempo_total,
            ROUND(AVG(avaliacao), 1) as media_avaliacao,
            MIN(data_realizacao) as primeiro_treino,
            MAX(data_realizacao) as ultimo_treino
        FROM 
            registros_treino
        WHERE 
            aluno_id = $1
    `, [aluno_id]);
    
    // Estatísticas por tipo de treino
    const estatisticasPorTreino = await db.query(`
        SELECT 
            mt.id,
            mt.nome,
            COUNT(*) as vezes_realizado,
            SUM(rt.duracao) as tempo_total,
            ROUND(AVG(rt.avaliacao), 1) as media_avaliacao
        FROM 
            registros_treino rt
        JOIN 
            modelos_treino mt ON rt.treino_id = mt.id
        WHERE 
            rt.aluno_id = $1
        GROUP BY 
            mt.id, mt.nome
        ORDER BY 
            vezes_realizado DESC
    `, [aluno_id]);
    
    // Resposta com estatísticas
    res.status(200).json({
        success: true,
        data: {
            resumo: estatisticas.rows[0],
            por_treino: estatisticasPorTreino.rows
        }
    });
});

export const obterFrequenciaSemanal = asyncHandler(async (req: Request, res: Response) => {
    const { aluno_id } = req.query;
    
    // Verificar se o ID do aluno está definido
    if (!aluno_id) {
        throw new ApiError(ErrorTypes.VALIDATION_ERROR.code, 'ID do aluno não fornecido na requisição');
    }
    
    // Obter frequência por dia da semana
    const frequencia = await db.query(`
        SELECT 
            EXTRACT(DOW FROM data_realizacao) as dia_semana,
            COUNT(*) as total
        FROM 
            registros_treino
        WHERE 
            aluno_id = $1
        GROUP BY 
            dia_semana
        ORDER BY 
            dia_semana
    `, [aluno_id]);
    
    // Mapeamento para nomes dos dias da semana (0=Domingo, 1=Segunda, etc.)
    const diasSemana = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];
    
    // Formatar resultados
    const frequenciaSemanal = frequencia.rows.map(row => ({
        dia: diasSemana[row.dia_semana],
        total: parseInt(row.total)
    }));
    
    // Resposta
    res.status(200).json({
        success: true,
        data: frequenciaSemanal
    });
});

export const obterAvaliacoes = asyncHandler(async (req: Request, res: Response) => {
    const { aluno_id } = req.query;
    
    // Verificar se o ID do aluno está definido
    if (!aluno_id) {
        throw new ApiError(ErrorTypes.VALIDATION_ERROR.code, 'ID do aluno não fornecido na requisição');
    }
    
    // Obter avaliações médias por treino
    const avaliacoes = await db.query(`
        SELECT 
            mt.id,
            mt.nome,
            ROUND(AVG(rt.avaliacao), 1) as avaliacao_media,
            COUNT(*) as total_registros
        FROM 
            registros_treino rt
        JOIN 
            modelos_treino mt ON rt.treino_id = mt.id
        WHERE 
            rt.aluno_id = $1
        GROUP BY 
            mt.id, mt.nome
        ORDER BY 
            avaliacao_media DESC
    `, [aluno_id]);
    
    // Resposta
    res.status(200).json({
        success: true,
        data: avaliacoes.rows
    });
});

export const obterHistoricoTreinosAluno = async (req: Request, res: Response): Promise<void> => {
    try {
        const { aluno_id } = req.params;
        
        // Verificar se o ID do aluno está definido
        if (!aluno_id) {
            return void res.status(400).json({
                success: false,
                message: 'ID do aluno não fornecido na requisição'
            });
        }
        
        // Verificar se o aluno existe
        const alunoCheck = await db.query('SELECT id FROM alunos WHERE id = $1', [aluno_id]);
        if (alunoCheck.rows.length === 0) {
            return void res.status(404).json({
                success: false,
                message: 'Aluno não encontrado'
            });
        }
        
        // Obter histórico de treinos
        const result = await db.query(`
            SELECT 
                rt.id,
                rt.data_realizacao,
                rt.duracao,
                rt.observacoes,
                rt.avaliacao,
                rt.created_at,
                mt.nome as nome_treino,
                mt.descricao as descricao_treino
            FROM 
                registros_treino rt
            LEFT JOIN 
                modelos_treino mt ON rt.treino_id = mt.id
            WHERE 
                rt.aluno_id = $1
            ORDER BY 
                rt.data_realizacao DESC
        `, [aluno_id]);
        
        res.status(200).json({
            success: true,
            total: result.rows.length,
            data: result.rows
        });
    } catch (error) {
        console.error('Erro ao obter histórico de treinos:', error);
        res.status(500).json({
            success: false,
            message: 'Erro ao obter histórico de treinos',
            error: error.message
        });
    }
};