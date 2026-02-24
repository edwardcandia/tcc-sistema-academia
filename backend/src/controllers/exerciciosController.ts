import { Request, Response } from 'express';
import db from '../config/database';

export const GRUPOS_MUSCULARES = [
    'Peito', 'Costas', 'Pernas', 'Ombros', 'Bíceps',
    'Tríceps', 'Abdômen', 'Glúteos', 'Panturrilha', 'Antebraço', 'Lombar'
];

const isValidYoutubeUrl = (url: string): boolean => {
    if (!url) return true;
    const regex = /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.be)\/.+/;
    return regex.test(url);
};

const isValidImageUrl = (url: string): boolean => {
    if (!url) return true;
    const regex = /\.(jpg|jpeg|png|gif)$/i;
    return regex.test(url);
};

export const createExercicio = async (req: Request, res: Response): Promise<void> => {
    const { nome, grupo_muscular, link_video, imagem_url, instrucoes } = req.body;

    if (!nome || typeof nome !== 'string' || nome.trim().length < 3) {
        res.status(400).json({ error: 'Nome do exercício deve ter pelo menos 3 caracteres.' });
        return;
    }
    if (!grupo_muscular || !GRUPOS_MUSCULARES.includes(grupo_muscular)) {
        res.status(400).json({ error: 'Grupo muscular inválido.', grupos_validos: GRUPOS_MUSCULARES });
        return;
    }
    if (link_video && !isValidYoutubeUrl(link_video)) {
        res.status(400).json({ error: 'URL de vídeo inválida. Deve ser uma URL do YouTube.' });
        return;
    }
    try {
        const existeExercicio = await db.query(
            'SELECT id FROM exercicios WHERE LOWER(nome) = LOWER($1)', [nome.trim()]
        );
        if (existeExercicio.rows.length > 0) {
            res.status(409).json({ error: 'Já existe um exercício com este nome.' });
            return;
        }
        const result = await db.query(
            'INSERT INTO exercicios (nome, grupo_muscular, link_video, imagem_url, instrucoes) VALUES ($1, $2, $3, $4, $5) RETURNING *',
            [nome.trim(), grupo_muscular, link_video?.trim() || null, imagem_url?.trim() || null, instrucoes?.trim() || null]
        );
        res.status(201).json(result.rows[0]);
    } catch (error: any) {
        console.error('Erro ao criar exercício:', error);
        if (error.code === '23505') { res.status(409).json({ error: 'Já existe um exercício com este nome.' }); return; }
        res.status(500).json({ error: 'Erro ao criar exercício.' });
    }
};

export const getAllExercicios = async (req: Request, res: Response): Promise<void> => {
    try {
        const grupo = String(req.query.grupo || '');
        const page = parseInt(String(req.query.page || '1'));
        const limit = parseInt(String(req.query.limit || '10'));
        const search = String(req.query.search || '');

        if (page < 1 || limit < 1 || limit > 100) {
            res.status(400).json({ error: 'Parâmetros de paginação inválidos.' });
            return;
        }
        const offset = (page - 1) * limit;
        const queryWhere: string[] = [];
        const params: (string | number)[] = [];
        let paramIndex = 1;

        if (grupo && GRUPOS_MUSCULARES.includes(grupo)) {
            queryWhere.push(`grupo_muscular = $${paramIndex++}`);
            params.push(grupo);
        }
        if (search.trim()) {
            queryWhere.push(`LOWER(nome) LIKE LOWER($${paramIndex++})`);
            params.push(`%${search.trim()}%`);
        }
        const whereClause = queryWhere.length > 0 ? `WHERE ${queryWhere.join(' AND ')}` : '';
        const countResult = await db.query(`SELECT COUNT(*) FROM exercicios ${whereClause}`, params);
        const total = parseInt(countResult.rows[0].count);
        const query = `SELECT * FROM exercicios ${whereClause} ORDER BY grupo_muscular, nome ASC LIMIT $${paramIndex++} OFFSET $${paramIndex++}`;
        params.push(limit, offset);
        const result = await db.query(query, params);
        const totalPages = Math.ceil(total / limit);
        res.status(200).json({
            exercicios: result.rows,
            pagination: { total, totalPages, currentPage: page, limit, hasNextPage: page < totalPages, hasPrevPage: page > 1 }
        });
    } catch (error) {
        console.error('Erro ao buscar exercícios:', error);
        res.status(500).json({ error: 'Erro ao buscar exercícios.' });
    }
};

export const updateExercicio = async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params;
    const { nome, grupo_muscular, link_video, imagem_url, instrucoes } = req.body;

    if (!nome || typeof nome !== 'string' || nome.trim().length < 3) {
        res.status(400).json({ error: 'Nome do exercício deve ter pelo menos 3 caracteres.' });
        return;
    }
    if (!grupo_muscular || !GRUPOS_MUSCULARES.includes(grupo_muscular)) {
        res.status(400).json({ error: 'Grupo muscular inválido.', grupos_validos: GRUPOS_MUSCULARES });
        return;
    }
    if (link_video && !isValidYoutubeUrl(link_video)) {
        res.status(400).json({ error: 'URL de vídeo inválida.' });
        return;
    }
    if (imagem_url && !isValidImageUrl(imagem_url)) {
        res.status(400).json({ error: 'URL de imagem inválida.' });
        return;
    }
    try {
        const exercicioExistente = await db.query('SELECT * FROM exercicios WHERE id = $1', [id]);
        if (exercicioExistente.rows.length === 0) {
            res.status(404).json({ error: 'Exercício não encontrado.' });
            return;
        }
        if (nome.toLowerCase() !== exercicioExistente.rows[0].nome.toLowerCase()) {
            const nomeExistente = await db.query(
                'SELECT id FROM exercicios WHERE LOWER(nome) = LOWER($1) AND id != $2', [nome.trim(), id]
            );
            if (nomeExistente.rows.length > 0) {
                res.status(409).json({ error: 'Já existe outro exercício com este nome.' });
                return;
            }
        }
        const result = await db.query(
            'UPDATE exercicios SET nome = $1, grupo_muscular = $2, link_video = $3, imagem_url = $4, instrucoes = $5 WHERE id = $6 RETURNING *',
            [nome.trim(), grupo_muscular, link_video?.trim() || null, imagem_url?.trim() || null, instrucoes?.trim() || null, id]
        );
        res.status(200).json(result.rows[0]);
    } catch (error: any) {
        console.error('Erro ao atualizar exercício:', error);
        if (error.code === '23505') { res.status(409).json({ error: 'Já existe um exercício com este nome.' }); return; }
        res.status(500).json({ error: 'Erro ao atualizar exercício.' });
    }
};

export const deleteExercicio = async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params;
    try {
        const exercicioExiste = await db.query('SELECT id, nome FROM exercicios WHERE id = $1', [id]);
        if (exercicioExiste.rows.length === 0) {
            res.status(404).json({ error: 'Exercício não encontrado.' });
            return;
        }
        const exercicioEmUso = await db.query('SELECT COUNT(*) FROM itens_treino WHERE exercicio_id = $1', [id]);
        if (parseInt(exercicioEmUso.rows[0].count) > 0) {
            res.status(409).json({ error: 'Este exercício não pode ser excluído pois está sendo usado em modelos de treino.' });
            return;
        }
        await db.query('DELETE FROM exercicios WHERE id = $1', [id]);
        res.status(200).json({ message: 'Exercício excluído com sucesso.', id: parseInt(id) });
    } catch (error: any) {
        console.error('Erro ao excluir exercício:', error);
        if (error.code === '23503') { res.status(409).json({ error: 'Exercício em uso em modelo de treino.' }); return; }
        res.status(500).json({ error: 'Erro ao excluir exercício.' });
    }
};

export const getExercicioById = async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params;
    try {
        const result = await db.query('SELECT * FROM exercicios WHERE id = $1', [id]);
        if (result.rows.length === 0) {
            res.status(404).json({ error: 'Exercício não encontrado.' });
            return;
        }
        res.status(200).json(result.rows[0]);
    } catch (error) {
        console.error('Erro ao buscar exercício por ID:', error);
        res.status(500).json({ error: 'Erro ao buscar exercício.' });
    }
};

export const getExerciciosByGrupo = async (req: Request, res: Response): Promise<void> => {
    const { grupo } = req.params;
    if (!GRUPOS_MUSCULARES.includes(grupo)) {
        res.status(400).json({ error: 'Grupo muscular inválido.', grupos_validos: GRUPOS_MUSCULARES });
        return;
    }
    try {
        const result = await db.query('SELECT * FROM exercicios WHERE grupo_muscular = $1 ORDER BY nome ASC', [grupo]);
        res.status(200).json(result.rows);
    } catch (error) {
        console.error('Erro ao buscar exercícios por grupo:', error);
        res.status(500).json({ error: 'Erro ao buscar exercícios por grupo muscular.' });
    }
};
