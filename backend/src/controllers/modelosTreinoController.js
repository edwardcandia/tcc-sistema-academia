// backend/src/controllers/modelosTreinoController.js
const db = require('../config/database');

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

module.exports = {
    createModeloTreino,
    getAllModelosTreino,
    getModeloTreinoById,
    addExercicioAoModelo,
    removeExercicioDoModelo,
    deleteModeloTreino
};