// backend/src/controllers/notificacoesController.js
const conn = require('../config/database');

// Obter notificações do aluno
exports.obterNotificacoes = async (req, res) => {
    try {
        const aluno_id = req.alunoId;
        
        const notificacoes = await conn.query(
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
    } catch (error) {
        console.error('Erro ao obter notificações:', error);
        res.status(500).json({
            success: false,
            message: 'Erro interno do servidor ao obter notificações'
        });
    }
};

// Marcar notificação como lida
exports.marcarComoLida = async (req, res) => {
    try {
        const { id } = req.params;
        const aluno_id = req.alunoId;

        // Verificar se a notificação pertence ao aluno
        const notificacao = await conn.query(
            'SELECT id FROM notificacoes WHERE id = $1 AND aluno_id = $2',
            [id, aluno_id]
        );

        if (notificacao.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Notificação não encontrada ou não pertence a este aluno'
            });
        }

        // Marcar como lida
        await conn.query(
            'UPDATE notificacoes SET lida = TRUE WHERE id = $1',
            [id]
        );

        res.status(200).json({
            success: true,
            message: 'Notificação marcada como lida com sucesso'
        });
    } catch (error) {
        console.error('Erro ao marcar notificação como lida:', error);
        res.status(500).json({
            success: false,
            message: 'Erro interno do servidor ao marcar notificação como lida'
        });
    }
};

// Marcar todas as notificações como lidas
exports.marcarTodasComoLidas = async (req, res) => {
    try {
        const aluno_id = req.alunoId;

        await conn.query(
            'UPDATE notificacoes SET lida = TRUE WHERE aluno_id = $1',
            [aluno_id]
        );

        res.status(200).json({
            success: true,
            message: 'Todas as notificações foram marcadas como lidas com sucesso'
        });
    } catch (error) {
        console.error('Erro ao marcar todas as notificações como lidas:', error);
        res.status(500).json({
            success: false,
            message: 'Erro interno do servidor ao marcar todas as notificações como lidas'
        });
    }
};

// Criar notificação (para uso interno)
exports.criarNotificacao = async (aluno_id, texto, tipo = 'info') => {
    try {
        await conn.query(
            'INSERT INTO notificacoes (aluno_id, texto, tipo) VALUES ($1, $2, $3)',
            [aluno_id, texto, tipo]
        );
        return true;
    } catch (error) {
        console.error('Erro ao criar notificação:', error);
        return false;
    }
};

// Excluir notificação
exports.excluirNotificacao = async (req, res) => {
    try {
        const { id } = req.params;
        const aluno_id = req.alunoId;

        // Verificar se a notificação pertence ao aluno
        const notificacao = await conn.query(
            'SELECT id FROM notificacoes WHERE id = $1 AND aluno_id = $2',
            [id, aluno_id]
        );

        if (notificacao.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Notificação não encontrada ou não pertence a este aluno'
            });
        }

        // Excluir a notificação
        await conn.query(
            'DELETE FROM notificacoes WHERE id = $1',
            [id]
        );

        res.status(200).json({
            success: true,
            message: 'Notificação excluída com sucesso'
        });
    } catch (error) {
        console.error('Erro ao excluir notificação:', error);
        res.status(500).json({
            success: false,
            message: 'Erro interno do servidor ao excluir notificação'
        });
    }
};