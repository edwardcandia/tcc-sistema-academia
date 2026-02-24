import { Request, Response } from 'express';
import db from '../config/database';
import { ApiError, ErrorTypes, asyncHandler } from '../utils/errorHandler';

const createModeloTreino = async (req: Request, res: Response): Promise<void> => {
    const { nome, descricao } = req.body;
    if (!nome) {
        return void res.status(400).json({ error: 'O nome do modelo de treino é obrigatório.' });
    }
    try {
        const result = await db.query(
            'INSERT INTO modelos_treino (nome, descricao) VALUES ($1, $2) RETURNING *',
            [nome, descricao]
        );
        res.status(201).json(result.rows[0]);
    } catch (error) {
        console.error('Erro ao criar modelo de treino:', error);
        res.status(500).json({ error: 'Erro ao criar modelo de treino.' });
    }
};

const getAllModelosTreino = async (req: Request, res: Response): Promise<void> => {
    try {
        const result = await db.query('SELECT * FROM modelos_treino ORDER BY nome ASC');
        res.status(200).json(result.rows);
    } catch (error) {
        console.error('Erro ao buscar modelos de treino:', error);
        res.status(500).json({ error: 'Erro ao buscar modelos de treino.' });
    }
};

const getModeloTreinoById = async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params;
    try {
        const modeloResult = await db.query('SELECT * FROM modelos_treino WHERE id = $1', [id]);
        if (modeloResult.rows.length === 0) {
            res.status(404).json({ error: 'Modelo de treino não encontrado.' });
            return;
        }

        const exerciciosQuery = `
            SELECT it.id, e.nome, e.grupo_muscular, it.series, it.repeticoes, it.dia_semana, it.ordem
            FROM itens_treino it
            JOIN exercicios e ON it.exercicio_id = e.id
            WHERE it.modelo_treino_id = $1
            ORDER BY it.dia_semana, it.ordem ASC;
        `;
        const exerciciosResult = await db.query(exerciciosQuery, [id]);

        res.status(200).json({ ...modeloResult.rows[0], exercicios: exerciciosResult.rows });
    } catch (error) {
        console.error('Erro ao buscar detalhes do modelo de treino:', error);
        res.status(500).json({ error: 'Erro ao buscar detalhes do modelo de treino.' });
    }
};

const addExercicioAoModelo = async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params;
    const { exercicio_id, series, repeticoes, dia_semana, ordem, observacoes } = req.body;
    if (!exercicio_id || !series || !repeticoes) {
        res.status(400).json({ error: 'Exercício, séries e repetições são obrigatórios.' });
        return;
    }
    try {
        const result = await db.query(
            'INSERT INTO itens_treino (modelo_treino_id, exercicio_id, series, repeticoes, dia_semana, ordem, observacoes) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *',
            [id, exercicio_id, series, repeticoes, dia_semana, ordem, observacoes]
        );
        res.status(201).json(result.rows[0]);
    } catch (error) {
        console.error('Erro ao adicionar exercício ao modelo:', error);
        res.status(500).json({ error: 'Erro ao adicionar exercício ao modelo.' });
    }
};

const removeExercicioDoModelo = async (req: Request, res: Response): Promise<void> => {
    const { exercicioDoModeloId } = req.params;
    try {
        const result = await db.query('DELETE FROM itens_treino WHERE id = $1', [exercicioDoModeloId]);
        if (result.rowCount === 0) {
            res.status(404).json({ error: 'Exercício não encontrado neste modelo.' });
            return;
        }
        res.status(200).json({ message: 'Exercício removido do modelo com sucesso.' });
    } catch (error) {
        console.error('Erro ao remover exercício do modelo:', error);
        res.status(500).json({ error: 'Erro ao remover exercício do modelo.' });
    }
};

const deleteModeloTreino = async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params;
    try {
        const result = await db.query('DELETE FROM modelos_treino WHERE id = $1', [id]);
        if(result.rowCount === 0) {
            return void res.status(404).json({error: 'Modelo de treino não encontrado'});
        }
        res.status(200).json({message: 'Modelo de treino excluído com sucesso'});
    } catch(error) {
        console.error('Erro ao excluir modelo de treino:', error);
        res.status(500).json({error: 'Erro ao excluir modelo de treino.'});
    }
}

const duplicateModeloTreino = async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params;
    const { nome, descricao } = req.body;

    if (!nome) {
        return void res.status(400).json({ error: 'O nome do novo modelo é obrigatório.' });
    }

    try {
        const modeloOriginal = await db.query('SELECT * FROM modelos_treino WHERE id = $1', [id]);
        if (modeloOriginal.rows.length === 0) {
            return void res.status(404).json({ error: 'Modelo de treino original não encontrado.' });
        }

        const novoModelo = await db.query(
            'INSERT INTO modelos_treino (nome, descricao) VALUES ($1, $2) RETURNING *',
            [nome, descricao || `${modeloOriginal.rows[0].descricao} (Cópia)`]
        );
        const novoModeloId = novoModelo.rows[0].id;

        const itensTreinoOriginais = await db.query(
            'SELECT exercicio_id, series, repeticoes, dia_semana, ordem, observacoes FROM itens_treino WHERE modelo_treino_id = $1',
            [id]
        );

        // Use parameterized queries to avoid SQL injection — never interpolate DB values into SQL strings
        for (const item of itensTreinoOriginais.rows) {
            await db.query(
                'INSERT INTO itens_treino (modelo_treino_id, exercicio_id, series, repeticoes, dia_semana, ordem, observacoes) VALUES ($1, $2, $3, $4, $5, $6, $7)',
                [novoModeloId, item.exercicio_id, item.series, item.repeticoes, item.dia_semana, item.ordem, item.observacoes]
            );
        }

        res.status(201).json({
            message: 'Modelo duplicado com sucesso',
            modelo: novoModelo.rows[0],
            exerciciosCopiados: itensTreinoOriginais.rows.length
        });
    } catch (error) {
        console.error('Erro ao duplicar modelo de treino:', error);
        res.status(500).json({ error: 'Erro ao duplicar modelo de treino.' });
    }
};

// Obter modelos de treino de um aluno específico
const getModelosTreinoByAlunoId = asyncHandler(async (req, res) => {
    const { alunoId } = req.params;
    const alunoResult = await db.query('SELECT id FROM alunos WHERE id = $1', [alunoId]);
    if (alunoResult.rows.length === 0) {
        throw new ApiError(
            ErrorTypes.NOT_FOUND.code,
            'Aluno não encontrado.'
        );
    }
    
    // Buscar os modelos de treino atribuídos ao aluno
    const query = `
        SELECT mt.id, mt.nome, mt.descricao 
        FROM modelos_treino mt
        JOIN alunos_modelos_treino amt ON mt.id = amt.modelo_treino_id
        WHERE amt.aluno_id = $1
        ORDER BY mt.nome ASC
    `;
    const result = await db.query(query, [alunoId]);
    
    res.status(200).json({
        success: true,
        data: result.rows
    });
});

const assignModeloTreinoToAluno = async (req: Request, res: Response): Promise<void> => {
    const { alunoId, modeloTreinoId } = req.params;
    
    try {
        // Verificar se o aluno existe
        const alunoResult = await db.query('SELECT id FROM alunos WHERE id = $1', [alunoId]);
        if (alunoResult.rows.length === 0) {
            return void res.status(404).json({ error: 'Aluno não encontrado.' });
        }
        
        // Verificar se o modelo de treino existe
        const modeloResult = await db.query('SELECT id FROM modelos_treino WHERE id = $1', [modeloTreinoId]);
        if (modeloResult.rows.length === 0) {
            return void res.status(404).json({ error: 'Modelo de treino não encontrado.' });
        }
        
        // Verificar se já existe essa atribuição
        const existeResult = await db.query(
            'SELECT * FROM alunos_modelos_treino WHERE aluno_id = $1 AND modelo_treino_id = $2',
            [alunoId, modeloTreinoId]
        );
        
        if (existeResult.rows.length > 0) {
            return void res.status(409).json({ error: 'Este modelo de treino já está atribuído a este aluno.' });
        }
        
        // Atribuir o modelo de treino ao aluno
        await db.query(
            'INSERT INTO alunos_modelos_treino (aluno_id, modelo_treino_id) VALUES ($1, $2)',
            [alunoId, modeloTreinoId]
        );
        
        res.status(201).json({ message: 'Modelo de treino atribuído com sucesso.' });
    } catch (error) {
        console.error('Erro ao atribuir modelo de treino:', error);
        res.status(500).json({ error: 'Erro ao atribuir modelo de treino.' });
    }
};

const removeModeloTreinoFromAluno = async (req: Request, res: Response): Promise<void> => {
    const { alunoId, modeloTreinoId } = req.params;
    
    try {
        const result = await db.query(
            'DELETE FROM alunos_modelos_treino WHERE aluno_id = $1 AND modelo_treino_id = $2',
            [alunoId, modeloTreinoId]
        );
        
        if (result.rowCount === 0) {
            return void res.status(404).json({ error: 'Atribuição não encontrada.' });
        }
        
        res.status(200).json({ message: 'Modelo de treino removido do aluno com sucesso.' });
    } catch (error) {
        console.error('Erro ao remover atribuição de modelo de treino:', error);
        res.status(500).json({ error: 'Erro ao remover atribuição de modelo de treino.' });
    }
};

export {
    createModeloTreino,
    getAllModelosTreino,
    getModeloTreinoById,
    addExercicioAoModelo,
    removeExercicioDoModelo,
    deleteModeloTreino,
    duplicateModeloTreino,
    getModelosTreinoByAlunoId,
    assignModeloTreinoToAluno,
    removeModeloTreinoFromAluno
};