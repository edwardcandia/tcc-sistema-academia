// backend/src/controllers/modelosTreinoController.js
const db = require('../config/database');
const { ApiError, ErrorTypes, asyncHandler } = require('../utils/errorHandler');

// Criar um novo modelo de treino (ex: "Treino A")
const createModeloTreino = async (req, res) => {
    const { nome, descricao } = req.body;
    if (!nome) {
        return res.status(400).json({ error: 'O nome do modelo de treino é obrigatório.' });
    }
    try {
        const result = await db.query(
            'INSERT INTO modelos_treino (nome, descricao) VALUES ($1, $2) RETURNING *',
            [nome, descricao]
        );
        res.status(201).json(result.rows[0]);
    } catch (error) {
        res.status(500).json({ error: 'Erro ao criar modelo de treino.' });
    }
};

// Obter todos os modelos de treino
const getAllModelosTreino = async (req, res) => {
    try {
        const result = await db.query('SELECT * FROM modelos_treino ORDER BY nome ASC');
        res.status(200).json(result.rows);
    } catch (error) {
        res.status(500).json({ error: 'Erro ao buscar modelos de treino.' });
    }
};

// Obter detalhes de um modelo de treino, incluindo seus exercícios
const getModeloTreinoById = async (req, res) => {
    const { id } = req.params;
    try {
        const modeloResult = await db.query('SELECT * FROM modelos_treino WHERE id = $1', [id]);
        if (modeloResult.rows.length === 0) {
            return res.status(404).json({ error: 'Modelo de treino não encontrado.' });
        }

        const exerciciosQuery = `
            SELECT edm.id, e.nome, e.grupo_muscular, edm.series, edm.repeticoes, edm.descanso_segundos
            FROM exercicios_do_modelo edm
            JOIN exercicios e ON edm.exercicio_id = e.id
            WHERE edm.modelo_treino_id = $1
            ORDER BY edm.ordem ASC;
        `;
        const exerciciosResult = await db.query(exerciciosQuery, [id]);

        const response = {
            ...modeloResult.rows[0],
            exercicios: exerciciosResult.rows
        };
        res.status(200).json(response);
    } catch (error) {
        res.status(500).json({ error: 'Erro ao buscar detalhes do modelo de treino.' });
    }
};

// Adicionar um exercício a um modelo de treino
const addExercicioAoModelo = async (req, res) => {
    const { id } = req.params; // ID do modelo de treino
    const { exercicio_id, series, repeticoes, descanso_segundos, ordem } = req.body;
    if (!exercicio_id || !series || !repeticoes) {
        return res.status(400).json({ error: 'Exercício, séries e repetições são obrigatórios.' });
    }
    try {
        const result = await db.query(
            'INSERT INTO exercicios_do_modelo (modelo_treino_id, exercicio_id, series, repeticoes, descanso_segundos, ordem) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
            [id, exercicio_id, series, repeticoes, descanso_segundos, ordem]
        );
        res.status(201).json(result.rows[0]);
    } catch (error) {
        res.status(500).json({ error: 'Erro ao adicionar exercício ao modelo.' });
    }
};

// Remover um exercício de um modelo de treino
const removeExercicioDoModelo = async (req, res) => {
    const { exercicioDoModeloId } = req.params;
    try {
        const result = await db.query('DELETE FROM exercicios_do_modelo WHERE id = $1', [exercicioDoModeloId]);
        if (result.rowCount === 0) {
            return res.status(404).json({ error: 'Exercício não encontrado neste modelo.' });
        }
        res.status(200).json({ message: 'Exercício removido do modelo com sucesso.' });
    } catch (error) {
        res.status(500).json({ error: 'Erro ao remover exercício do modelo.' });
    }
};

const deleteModeloTreino = async (req, res) => {
    const { id } = req.params;
    try {
        const result = await db.query('DELETE FROM modelos_treino WHERE id = $1', [id]);
        if(result.rowCount === 0) {
            return res.status(404).json({error: 'Modelo de treino não encontrado'});
        }
        res.status(200).json({message: 'Modelo de treino deletado com sucesso'});
    } catch(error) {
        res.status(500).json({error: 'Erro ao deletar modelo de treino'});
    }
}

// Duplicar um modelo de treino existente (com seus exercícios)
const duplicateModeloTreino = async (req, res) => {
    const { id } = req.params;
    const { nome, descricao } = req.body;
    
    if (!nome) {
        return res.status(400).json({ error: 'O nome do novo modelo é obrigatório.' });
    }
    
    try {
        // Verificar se o modelo original existe
        const modeloOriginal = await db.query('SELECT * FROM modelos_treino WHERE id = $1', [id]);
        if (modeloOriginal.rows.length === 0) {
            return res.status(404).json({ error: 'Modelo de treino original não encontrado.' });
        }
        
        // Criar um novo modelo baseado no original
        const novoModeloResult = await db.query(
            'INSERT INTO modelos_treino (nome, descricao) VALUES ($1, $2) RETURNING *',
            [nome, descricao || modeloOriginal.rows[0].descricao + ' (Cópia)']
        );
        
        const novoModeloId = novoModeloResult.rows[0].id;
        
        // Buscar os exercícios do modelo original
        const exerciciosOriginais = await db.query(
            `SELECT exercicio_id, series, repeticoes, descanso_segundos, ordem 
             FROM exercicios_do_modelo 
             WHERE modelo_treino_id = $1`,
            [id]
        );
        
        // Duplicar os exercícios para o novo modelo
        if (exerciciosOriginais.rows.length > 0) {
            const insertValues = exerciciosOriginais.rows.map(ex => {
                return `(${novoModeloId}, ${ex.exercicio_id}, ${ex.series}, ${ex.repeticoes}, ${ex.descanso_segundos || 'NULL'}, ${ex.ordem || 'NULL'})`;
            }).join(', ');
            
            await db.query(
                `INSERT INTO exercicios_do_modelo 
                 (modelo_treino_id, exercicio_id, series, repeticoes, descanso_segundos, ordem)
                 VALUES ${insertValues}`
            );
        }
        
        res.status(201).json({
            message: 'Modelo de treino duplicado com sucesso',
            modelo: novoModeloResult.rows[0],
            exerciciosCopiados: exerciciosOriginais.rows.length
        });
    } catch (error) {
        console.error('Erro ao duplicar modelo de treino:', error);
        res.status(500).json({ error: 'Erro ao duplicar modelo de treino.' });
    }
}

// Obter modelos de treino de um aluno específico
const getModelosTreinoByAlunoId = asyncHandler(async (req, res) => {
    const { alunoId } = req.params;
    
    // Não precisa mais verificar se é o próprio aluno acessando seus dados
    // O acesso agora é aberto
    
    // Verificar se o aluno existe
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

// Atribuir um modelo de treino a um aluno
const assignModeloTreinoToAluno = async (req, res) => {
    const { alunoId, modeloTreinoId } = req.params;
    
    try {
        // Verificar se o aluno existe
        const alunoResult = await db.query('SELECT id FROM alunos WHERE id = $1', [alunoId]);
        if (alunoResult.rows.length === 0) {
            return res.status(404).json({ error: 'Aluno não encontrado.' });
        }
        
        // Verificar se o modelo de treino existe
        const modeloResult = await db.query('SELECT id FROM modelos_treino WHERE id = $1', [modeloTreinoId]);
        if (modeloResult.rows.length === 0) {
            return res.status(404).json({ error: 'Modelo de treino não encontrado.' });
        }
        
        // Verificar se já existe essa atribuição
        const existeResult = await db.query(
            'SELECT * FROM alunos_modelos_treino WHERE aluno_id = $1 AND modelo_treino_id = $2',
            [alunoId, modeloTreinoId]
        );
        
        if (existeResult.rows.length > 0) {
            return res.status(409).json({ error: 'Este modelo de treino já está atribuído a este aluno.' });
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

// Remover atribuição de um modelo de treino a um aluno
const removeModeloTreinoFromAluno = async (req, res) => {
    const { alunoId, modeloTreinoId } = req.params;
    
    try {
        const result = await db.query(
            'DELETE FROM alunos_modelos_treino WHERE aluno_id = $1 AND modelo_treino_id = $2',
            [alunoId, modeloTreinoId]
        );
        
        if (result.rowCount === 0) {
            return res.status(404).json({ error: 'Atribuição não encontrada.' });
        }
        
        res.status(200).json({ message: 'Modelo de treino removido do aluno com sucesso.' });
    } catch (error) {
        console.error('Erro ao remover atribuição de modelo de treino:', error);
        res.status(500).json({ error: 'Erro ao remover atribuição de modelo de treino.' });
    }
};

module.exports = {
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