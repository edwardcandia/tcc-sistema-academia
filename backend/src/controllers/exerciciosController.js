// backend/src/controllers/exerciciosController.js
const db = require('../config/database');

// Lista de grupos musculares permitidos
const GRUPOS_MUSCULARES = [
    'Peito', 'Costas', 'Pernas', 'Ombros', 'Bíceps', 
    'Tríceps', 'Abdômen', 'Glúteos', 'Panturrilha', 'Antebraço', 'Lombar'
];

// Validar URL de vídeo do YouTube
const isValidYoutubeUrl = (url) => {
    if (!url) return true; // URL é opcional
    const regex = /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.be)\/.+/;
    return regex.test(url);
};

// Criar um novo exercício
const createExercicio = async (req, res) => {
    const { nome, grupo_muscular, link_video } = req.body;
    
    // Validações aprimoradas
    if (!nome || typeof nome !== 'string' || nome.trim().length < 3) {
        return res.status(400).json({ error: 'Nome do exercício deve ter pelo menos 3 caracteres.' });
    }
    
    if (!grupo_muscular || !GRUPOS_MUSCULARES.includes(grupo_muscular)) {
        return res.status(400).json({ 
            error: 'Grupo muscular inválido. Escolha uma das opções disponíveis.',
            grupos_validos: GRUPOS_MUSCULARES
        });
    }
    
    if (link_video && !isValidYoutubeUrl(link_video)) {
        return res.status(400).json({ error: 'URL de vídeo inválida. Deve ser uma URL do YouTube.' });
    }

    try {
        // Verificar se o exercício já existe pelo nome (case insensitive)
        const existeExercicio = await db.query(
            'SELECT * FROM exercicios WHERE LOWER(nome) = LOWER($1)',
            [nome.trim()]
        );
        
        if (existeExercicio.rows.length > 0) {
            return res.status(409).json({ error: 'Já existe um exercício com este nome.' });
        }
        
        const result = await db.query(
            'INSERT INTO exercicios (nome, grupo_muscular, link_video) VALUES ($1, $2, $3) RETURNING *',
            [nome.trim(), grupo_muscular, link_video ? link_video.trim() : null]
        );
        
        console.log(`Exercício "${nome}" criado com sucesso pelo usuário ${req.user.id}`);
        res.status(201).json(result.rows[0]);
    } catch (error) {
        console.error('Erro ao criar exercício:', error);
        if (error.code === '23505') {
            return res.status(409).json({ error: 'Já existe um exercício com este nome.' });
        }
        res.status(500).json({ error: 'Erro ao criar exercício. Por favor, tente novamente.' });
    }
};

// Obter todos os exercícios
const getAllExercicios = async (req, res) => {
    try {
        const { grupo } = req.query;
        
        let query = 'SELECT * FROM exercicios';
        const params = [];
        
        if (grupo && GRUPOS_MUSCULARES.includes(grupo)) {
            query += ' WHERE grupo_muscular = $1';
            params.push(grupo);
        }
        
        query += ' ORDER BY grupo_muscular, nome ASC';
        
        const result = await db.query(query, params);
        res.status(200).json(result.rows);
    } catch (error) {
        console.error('Erro ao buscar exercícios:', error);
        res.status(500).json({ error: 'Erro ao buscar exercícios. Por favor, tente novamente.' });
    }
};

// Atualizar um exercício
const updateExercicio = async (req, res) => {
    const { id } = req.params;
    const { nome, grupo_muscular, link_video } = req.body;
    
    // Validações aprimoradas
    if (!nome || typeof nome !== 'string' || nome.trim().length < 3) {
        return res.status(400).json({ error: 'Nome do exercício deve ter pelo menos 3 caracteres.' });
    }
    
    if (!grupo_muscular || !GRUPOS_MUSCULARES.includes(grupo_muscular)) {
        return res.status(400).json({ 
            error: 'Grupo muscular inválido. Escolha uma das opções disponíveis.',
            grupos_validos: GRUPOS_MUSCULARES
        });
    }
    
    if (link_video && !isValidYoutubeUrl(link_video)) {
        return res.status(400).json({ error: 'URL de vídeo inválida. Deve ser uma URL do YouTube.' });
    }
    
    try {
        // Verificar se o exercício existe
        const exercicioExistente = await db.query('SELECT * FROM exercicios WHERE id = $1', [id]);
        if (exercicioExistente.rows.length === 0) {
            return res.status(404).json({ error: 'Exercício não encontrado.' });
        }
        
        // Verificar se já existe outro exercício com o mesmo nome
        if (nome.toLowerCase() !== exercicioExistente.rows[0].nome.toLowerCase()) {
            const nomeExistente = await db.query(
                'SELECT * FROM exercicios WHERE LOWER(nome) = LOWER($1) AND id != $2',
                [nome.trim(), id]
            );
            
            if (nomeExistente.rows.length > 0) {
                return res.status(409).json({ error: 'Já existe outro exercício com este nome.' });
            }
        }
        
        const result = await db.query(
            'UPDATE exercicios SET nome = $1, grupo_muscular = $2, link_video = $3 WHERE id = $4 RETURNING *',
            [nome.trim(), grupo_muscular, link_video ? link_video.trim() : null, id]
        );
        
        console.log(`Exercício ID ${id} atualizado com sucesso pelo usuário ${req.user.id}`);
        res.status(200).json(result.rows[0]);
    } catch (error) {
        console.error('Erro ao atualizar exercício:', error);
        if (error.code === '23505') {
            return res.status(409).json({ error: 'Já existe um exercício com este nome.' });
        }
        res.status(500).json({ error: 'Erro ao atualizar exercício. Por favor, tente novamente.' });
    }
};

// Deletar um exercício
const deleteExercicio = async (req, res) => {
    const { id } = req.params;
    
    try {
        // Verificar se o exercício existe antes de tentar excluir
        const exercicioExiste = await db.query('SELECT id, nome FROM exercicios WHERE id = $1', [id]);
        if (exercicioExiste.rows.length === 0) {
            return res.status(404).json({ error: 'Exercício não encontrado.' });
        }
        
        // Verificar se o exercício está sendo usado em algum modelo de treino
        const exercicioEmUso = await db.query(
            'SELECT COUNT(*) FROM itens_treino WHERE exercicio_id = $1',
            [id]
        );
        
        if (parseInt(exercicioEmUso.rows[0].count) > 0) {
            return res.status(409).json({ 
                error: 'Este exercício não pode ser excluído pois está sendo usado em um ou mais modelos de treino.' 
            });
        }
        
        // Se não estiver sendo usado, exclui
        const result = await db.query('DELETE FROM exercicios WHERE id = $1', [id]);
        
        console.log(`Exercício "${exercicioExiste.rows[0].nome}" (ID: ${id}) excluído com sucesso pelo usuário ${req.user.id}`);
        res.status(200).json({ 
            message: 'Exercício deletado com sucesso.',
            id: parseInt(id)
        });
    } catch (error) {
        console.error('Erro ao deletar exercício:', error);
        if (error.code === '23503') {
            return res.status(409).json({ 
                error: 'Este exercício não pode ser excluído pois está sendo usado em um modelo de treino.' 
            });
        }
        res.status(500).json({ error: 'Erro ao deletar exercício. Por favor, tente novamente.' });
    }
};

// Obter um exercício específico pelo ID
const getExercicioById = async (req, res) => {
    const { id } = req.params;
    
    try {
        const result = await db.query('SELECT * FROM exercicios WHERE id = $1', [id]);
        
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Exercício não encontrado.' });
        }
        
        res.status(200).json(result.rows[0]);
    } catch (error) {
        console.error('Erro ao buscar exercício por ID:', error);
        res.status(500).json({ error: 'Erro ao buscar detalhes do exercício.' });
    }
};

// Buscar exercícios por grupo muscular
const getExerciciosByGrupo = async (req, res) => {
    const { grupo } = req.params;
    
    if (!GRUPOS_MUSCULARES.includes(grupo)) {
        return res.status(400).json({ 
            error: 'Grupo muscular inválido.',
            grupos_validos: GRUPOS_MUSCULARES
        });
    }
    
    try {
        const result = await db.query(
            'SELECT * FROM exercicios WHERE grupo_muscular = $1 ORDER BY nome ASC',
            [grupo]
        );
        
        res.status(200).json(result.rows);
    } catch (error) {
        console.error('Erro ao buscar exercícios por grupo:', error);
        res.status(500).json({ error: 'Erro ao buscar exercícios por grupo muscular.' });
    }
};

module.exports = {
    createExercicio,
    getAllExercicios,
    getExercicioById,
    getExerciciosByGrupo,
    updateExercicio,
    deleteExercicio,
    GRUPOS_MUSCULARES // Exportar a lista de grupos musculares para uso em outros lugares
};