import { Request, Response } from 'express';
import db from '../config/database';
import { criarNotificacaoInterna } from './notificacoesController';

export const criarFeedback = async (req: Request, res: Response): Promise<void> => {
    try {
        const { titulo, descricao, tipo, avaliacao, aluno_id } = req.body;

        if (!titulo || !descricao || !tipo || !avaliacao || !aluno_id) {
            return void res.status(400).json({
                success: false,
                message: 'Dados incompletos. Título, descrição, tipo, avaliação e ID do aluno são obrigatórios'
            });
        }

        const feedback = await db.query(
            `INSERT INTO feedbacks 
                (aluno_id, titulo, descricao, tipo, avaliacao) 
             VALUES ($1, $2, $3, $4, $5) RETURNING id`,
            [aluno_id, titulo, descricao, tipo, avaliacao]
        );

        // Notificar administradores sobre o novo feedback (em um sistema real)
        // Isso poderia ser implementado usando websockets ou outro mecanismo de notificação em tempo real

        res.status(201).json({
            success: true,
            message: 'Feedback enviado com sucesso. Obrigado por sua opinião!',
            id: feedback.rows[0].id
        });
    } catch (error) {
        console.error('Erro ao criar feedback:', error);
        res.status(500).json({
            success: false,
            message: 'Erro interno do servidor ao criar feedback'
        });
    }
};

export const obterFeedbacksAluno = async (req: Request, res: Response): Promise<void> => {
    try {
        const { aluno_id } = req.params;
        
        if (!aluno_id) {
            return void res.status(400).json({
                success: false,
                message: 'ID do aluno é obrigatório'
            });
        }
        
        const feedbacks = await db.query(
            `SELECT id, titulo, descricao, tipo, avaliacao, status, resposta, created_at, updated_at
             FROM feedbacks
             WHERE aluno_id = $1
             ORDER BY created_at DESC`,
            [aluno_id]
        );

        res.status(200).json({
            success: true,
            data: feedbacks.rows
        });
    } catch (error) {
        console.error('Erro ao obter feedbacks do aluno:', error);
        res.status(500).json({
            success: false,
            message: 'Erro interno do servidor ao obter feedbacks'
        });
    }
};

export const listarTodosFeedbacks = async (req: Request, res: Response): Promise<void> => {
    try {
        // Parâmetros de filtro opcionais
        const { status, tipo } = req.query;
        const valores = [];
        let query = `
            SELECT 
                f.id, f.titulo, f.descricao, f.tipo, f.avaliacao, f.status,
                f.created_at, f.updated_at, f.resposta,
                a.nome_completo as aluno_nome, a.id as aluno_id,
                u.nome as respondido_por_nome
            FROM feedbacks f
            JOIN alunos a ON f.aluno_id = a.id
            LEFT JOIN usuarios u ON f.respondido_por = u.id
        `;

        // Adicionar filtros se fornecidos
        const condicoes = [];
        if (status) {
            valores.push(status);
            condicoes.push(`f.status = $${valores.length}`);
        }
        
        if (tipo) {
            valores.push(tipo);
            condicoes.push(`f.tipo = $${valores.length}`);
        }
        
        if (condicoes.length > 0) {
            query += ` WHERE ${condicoes.join(' AND ')}`;
        }
        
        query += ` ORDER BY f.created_at DESC`;
        
        const feedbacks = await db.query(query, valores);

        res.status(200).json({
            success: true,
            data: feedbacks.rows
        });
    } catch (error) {
        console.error('Erro ao listar feedbacks:', error);
        res.status(500).json({
            success: false,
            message: 'Erro interno do servidor ao listar feedbacks'
        });
    }
};

export const responderFeedback = async (req: Request, res: Response): Promise<void> => {
    try {
        const { id } = req.params;
        const { resposta } = req.body;
        const usuario_id = req.user?.id;

        if (!resposta) {
            return void res.status(400).json({
                success: false,
                message: 'A resposta é obrigatória'
            });
        }

        // Verificar se o feedback existe
        const feedbackCheck = await db.query(
            'SELECT aluno_id FROM feedbacks WHERE id = $1',
            [id]
        );

        if (feedbackCheck.rows.length === 0) {
            res.status(404).json({ success: false, message: 'Feedback não encontrado' });
            return;
        }

        await db.query(
            `UPDATE feedbacks 
             SET resposta = $1, status = 'respondido', respondido_por = $2, updated_at = CURRENT_TIMESTAMP
             WHERE id = $3`,
            [resposta, usuario_id, id]
        );

        await criarNotificacaoInterna(
            feedbackCheck.rows[0].aluno_id,
            'Seu feedback recebeu uma resposta! Confira em seu histórico de feedbacks.',
            'info'
        );

        res.status(200).json({ success: true, message: 'Feedback respondido com sucesso' });
    } catch (error) {
        console.error('Erro ao responder feedback:', error);
        res.status(500).json({ success: false, message: 'Erro interno ao responder feedback' });
    }
};

export const arquivarFeedback = async (req: Request, res: Response): Promise<void> => {
    try {
        const { id } = req.params;

        // Verificar se o feedback existe
        const feedbackCheck = await db.query(
            'SELECT id FROM feedbacks WHERE id = $1',
            [id]
        );

        if (feedbackCheck.rows.length === 0) {
            res.status(404).json({ success: false, message: 'Feedback não encontrado' });
            return;
        }

        await db.query(
            "UPDATE feedbacks SET status = 'arquivado', updated_at = CURRENT_TIMESTAMP WHERE id = $1",
            [id]
        );

        res.status(200).json({
            success: true,
            message: 'Feedback arquivado com sucesso'
        });
    } catch (error) {
        console.error('Erro ao arquivar feedback:', error);
        res.status(500).json({
            success: false,
            message: 'Erro interno do servidor ao arquivar feedback'
        });
    }
};

export const obterEstatisticasFeedback = async (req: Request, res: Response): Promise<void> => {
    try {
        const [totalPorStatus, totalPorTipo, mediaAvaliacoes, feedbacksRecentes, feedbacksSemResposta] = await Promise.all([
            db.query(`SELECT status, COUNT(*) as total FROM feedbacks GROUP BY status`),
            db.query(`SELECT tipo, COUNT(*) as total FROM feedbacks GROUP BY tipo`),
            db.query(`SELECT AVG(avaliacao) as media FROM feedbacks`),
            db.query(`SELECT COUNT(*) as total FROM feedbacks WHERE created_at >= CURRENT_DATE - INTERVAL '7 days'`),
            db.query(`SELECT COUNT(*) as total FROM feedbacks WHERE status = 'pendente'`),
        ]);

        res.status(200).json({
            success: true,
            data: {
                por_status: totalPorStatus.rows,
                por_tipo: totalPorTipo.rows,
                media_avaliacoes: mediaAvaliacoes.rows[0].media || 0,
                recentes: feedbacksRecentes.rows[0].total || 0,
                sem_resposta: feedbacksSemResposta.rows[0].total || 0
            }
        });
    } catch (error) {
        console.error('Erro ao obter estatísticas de feedback:', error);
        res.status(500).json({
            success: false,
            message: 'Erro interno do servidor ao obter estatísticas'
        });
    }
};