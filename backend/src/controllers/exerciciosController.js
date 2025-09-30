// backend/src/controllers/exerciciosController.js
const db = require('../config/database');

// Criar um novo exercício
const createExercicio = async (req, res) => {
    const { nome, grupo_muscular, link_video } = req.body;
    if (!nome || !grupo_muscular) {
        return res.status(400).json({ error: 'Nome e grupo muscular são obrigatórios.' });
    }
    try {
        const result = await db.query(
            'INSERT INTO exercicios (nome, grupo_muscular, link_video) VALUES ($1, $2, $3) RETURNING *',
            [nome, grupo_muscular, link_video]
        );
        res.status(201).json(result.rows[0]);
    } catch (error) {
        if (error.code === '23505') {
            return res.status(409).json({ error: 'Já existe um exercício com este nome.' });
        }
        res.status(500).json({ error: 'Erro ao criar exercício.' });
    }
};

// Obter todos os exercícios
const getAllExercicios = async (req, res) => {
    try {
        const result = await db.query('SELECT * FROM exercicios ORDER BY grupo_muscular, nome ASC');
        res.status(200).json(result.rows);
    } catch (error) {
        res.status(500).json({ error: 'Erro ao buscar exercícios.' });
    }
};

// Atualizar um exercício
const updateExercicio = async (req, res) => {
    const { id } = req.params;
    const { nome, grupo_muscular, link_video } = req.body;
    if (!nome || !grupo_muscular) {
        return res.status(400).json({ error: 'Nome e grupo muscular são obrigatórios.' });
    }
    try {
        const result = await db.query(
            'UPDATE exercicios SET nome = $1, grupo_muscular = $2, link_video = $3 WHERE id = $4 RETURNING *',
            [nome, grupo_muscular, link_video, id]
        );
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Exercício não encontrado.' });
        }
        res.status(200).json(result.rows[0]);
    } catch (error) {
        if (error.code === '23505') {
            return res.status(409).json({ error: 'Já existe um exercício com este nome.' });
        }
        res.status(500).json({ error: 'Erro ao atualizar exercício.' });
    }
};

// Deletar um exercício
const deleteExercicio = async (req, res) => {
    const { id } = req.params;
    try {
        const result = await db.query('DELETE FROM exercicios WHERE id = $1', [id]);
        if (result.rowCount === 0) {
            return res.status(404).json({ error: 'Exercício não encontrado.' });
        }
        res.status(200).json({ message: 'Exercício deletado com sucesso.' });
    } catch (error) {
        if (error.code === '23503') {
            return res.status(409).json({ error: 'Este exercício não pode ser excluído pois está sendo usado em um modelo de treino.' });
        }
        res.status(500).json({ error: 'Erro ao deletar exercício.' });
    }
};

module.exports = {
    createExercicio,
    getAllExercicios,
    updateExercicio,
    deleteExercicio,
};