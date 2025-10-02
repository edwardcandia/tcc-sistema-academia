// backend/src/controllers/notificacoesController.js
const db = require('../config/database');
const { ApiError, ErrorTypes, asyncHandler } = require('../utils/errorHandler');

// Obter notificações do aluno
exports.obterNotificacoes = asyncHandler(async (req, res) => {
    const { aluno_id } = req.params;
    
    if (!aluno_id) {
        throw new ApiError(
            'ID do aluno não fornecido na requisição',
            400,
            ErrorTypes.VALIDATION_ERROR
        );
    }
    
    const notificacoes = await db.query(
        `SELECT id, texto, tipo, lida, created_at
         FROM notificacoes
         WHERE aluno_id = $1
         ORDER BY created_at DESC`,
        [aluno_id]
    );

    res.status(200).json({
        success: true,
        data: notificacoes.rows
    });
});

// Marcar notificação como lida
exports.marcarComoLida = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { aluno_id } = req.body;

    if (!aluno_id) {
        throw new ApiError(
            'ID do aluno não fornecido na requisição',
            400,
            ErrorTypes.VALIDATION_ERROR
        );
    }

    // Verificar se a notificação pertence ao aluno
    const notificacao = await db.query(
        'SELECT id FROM notificacoes WHERE id = $1 AND aluno_id = $2',
        [id, aluno_id]
    );

    if (notificacao.rows.length === 0) {
        throw new ApiError(
            ErrorTypes.NOT_FOUND.code,
            'Notificação não encontrada ou não pertence a este aluno'
        );
    }

    // Marcar como lida
    await db.query(
        'UPDATE notificacoes SET lida = TRUE WHERE id = $1',
        [id]
    );

    res.status(200).json({
        success: true,
        message: 'Notificação marcada como lida com sucesso'
    });
});

// Marcar todas as notificações como lidas
exports.marcarTodasComoLidas = asyncHandler(async (req, res) => {
    const { aluno_id } = req.params;

    if (!aluno_id) {
        throw new ApiError(
            'ID do aluno não fornecido na requisição',
            400,
            ErrorTypes.VALIDATION_ERROR
        );
    }

    await db.query(
        'UPDATE notificacoes SET lida = TRUE WHERE aluno_id = $1',
        [aluno_id]
    );

    res.status(200).json({
        success: true,
        message: 'Todas as notificações foram marcadas como lidas com sucesso'
    });
});

// Excluir uma notificação
exports.excluirNotificacao = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { aluno_id } = req.body;

    if (!aluno_id) {
        throw new ApiError(
            'ID do aluno não fornecido na requisição',
            400,
            ErrorTypes.VALIDATION_ERROR
        );
    }

    // Verificar se a notificação pertence ao aluno
    const notificacao = await db.query(
        'SELECT id FROM notificacoes WHERE id = $1 AND aluno_id = $2',
        [id, aluno_id]
    );

    if (notificacao.rows.length === 0) {
        throw new ApiError(
            ErrorTypes.NOT_FOUND.code,
            'Notificação não encontrada ou não pertence a este aluno'
        );
    }

    await db.query(
        'DELETE FROM notificacoes WHERE id = $1',
        [id]
    );

    res.status(200).json({
        success: true,
        message: 'Notificação excluída com sucesso'
    });
});

// Criar notificação (para uso interno)
exports.criarNotificacao = async (aluno_id, texto, tipo = 'info') => {
    try {
        await db.query(
            'INSERT INTO notificacoes (aluno_id, texto, tipo) VALUES ($1, $2, $3)',
            [aluno_id, texto, tipo]
        );
        return true;
    } catch (error) {
        console.error('Erro ao criar notificação:', error);
        return false;
    }
};

// Criar notificação para um aluno (pelos administradores/atendentes)
exports.criarNotificacao = asyncHandler(async (req, res) => {
    const { aluno_id, texto, tipo } = req.body;

    if (!aluno_id || !texto) {
        throw new ApiError(
            'ID do aluno e texto da notificação são obrigatórios',
            400,
            ErrorTypes.VALIDATION_ERROR
        );
    }

    // Verificar se o aluno existe
    const alunoExists = await db.query(
        'SELECT id FROM alunos WHERE id = $1',
        [aluno_id]
    );

    if (alunoExists.rows.length === 0) {
        throw new ApiError(
            'Aluno não encontrado',
            404,
            ErrorTypes.NOT_FOUND_ERROR
        );
    }

    const notificacao = await db.query(
        `INSERT INTO notificacoes (aluno_id, texto, tipo)
         VALUES ($1, $2, $3)
         RETURNING id, texto, tipo, created_at`,
        [aluno_id, texto, tipo || 'informacao']
    );

    res.status(201).json({
        success: true,
        message: 'Notificação criada com sucesso',
        data: notificacao.rows[0]
    });
});
