import { Request, Response } from 'express';
import db from '../config/database';
import { ApiError, ErrorTypes, asyncHandler } from '../utils/errorHandler';

export const obterNotificacoes = asyncHandler(async (req: Request, res: Response) => {
  const { aluno_id } = req.params;

  const notificacoes = await db.query(
        `SELECT id, texto, tipo, lida, created_at
         FROM notificacoes
         WHERE aluno_id = $1
         ORDER BY created_at DESC`,
        [aluno_id]
    );

  res.status(200).json({ success: true, data: notificacoes.rows });
});

// Usada pelo portal do aluno — busca as próprias notificações via token
export const obterMinhasNotificacoes = asyncHandler(async (req: Request, res: Response) => {
    const aluno_id = req.aluno!.id;
    const notificacoes = await db.query(
        `SELECT id, texto, tipo, lida, created_at
         FROM notificacoes
         WHERE aluno_id = $1
         ORDER BY created_at DESC`,
        [aluno_id]
    );
    res.status(200).json({ success: true, data: notificacoes.rows });
});

export const marcarComoLida = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    // Suporta aluno via token ou admin passando aluno_id no body
    const aluno_id = req.aluno?.id ?? req.body.aluno_id;

    if (aluno_id) {
        const notificacao = await db.query(
            'SELECT id FROM notificacoes WHERE id = $1 AND aluno_id = $2',
            [id, aluno_id]
        );
        if (notificacao.rows.length === 0) {
            throw new ApiError(ErrorTypes.NOT_FOUND.code, 'Notificação não encontrada.');
        }
    }

    await db.query('UPDATE notificacoes SET lida = TRUE WHERE id = $1', [id]);
    res.status(200).json({ success: true, message: 'Notificação marcada como lida' });
});

// Usada pelo portal do aluno — marca como lida via token
export const marcarComoLidaMe = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const aluno_id = req.aluno!.id;
    const notificacao = await db.query(
        'SELECT id FROM notificacoes WHERE id = $1 AND aluno_id = $2',
        [id, aluno_id]
    );
    if (notificacao.rows.length === 0) {
        throw new ApiError(ErrorTypes.NOT_FOUND.code, 'Notificação não encontrada.');
    }
    await db.query('UPDATE notificacoes SET lida = TRUE WHERE id = $1', [id]);
    res.status(200).json({ success: true, message: 'Notificação marcada como lida' });
});

export const marcarTodasComoLidas = asyncHandler(async (req: Request, res: Response) => {
  const { aluno_id } = req.params;
  await db.query('UPDATE notificacoes SET lida = TRUE WHERE aluno_id = $1', [aluno_id]);
  res.status(200).json({ success: true, message: 'Todas as notificações foram marcadas como lidas' });
});

// Usada pelo portal do aluno — marca todas como lidas via token
export const marcarTodasComoLidasMe = asyncHandler(async (req: Request, res: Response) => {
    const aluno_id = req.aluno!.id;
    await db.query('UPDATE notificacoes SET lida = TRUE WHERE aluno_id = $1', [aluno_id]);
    res.status(200).json({ success: true, message: 'Todas as notificações foram marcadas como lidas' });
});

export const excluirNotificacao = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const { aluno_id } = req.body;

    if (!aluno_id) {
        throw new ApiError(
            ErrorTypes.VALIDATION_ERROR.code,
            'ID do aluno não fornecido na requisição'
        );
    }

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

    await db.query('DELETE FROM notificacoes WHERE id = $1', [id]);
    res.status(200).json({ success: true, message: 'Notificação excluída com sucesso' });
});

// Função interna usada por outros controllers (não é rota HTTP)
export const criarNotificacaoInterna = async (aluno_id: number, texto: string, tipo = 'info'): Promise<boolean> => {
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

export const criarNotificacao = asyncHandler(async (req: Request, res: Response) => {
    const { aluno_id, texto, tipo } = req.body;

    if (!aluno_id || !texto) {
        throw new ApiError(
            ErrorTypes.VALIDATION_ERROR.code,
            'ID do aluno e texto da notificação são obrigatórios'
        );
    }

    const alunoExists = await db.query('SELECT id FROM alunos WHERE id = $1', [aluno_id]);
    if (alunoExists.rows.length === 0) {
        throw new ApiError(ErrorTypes.NOT_FOUND.code, 'Aluno não encontrado');
    }

    const notificacao = await db.query(
        `INSERT INTO notificacoes (aluno_id, texto, tipo)
         VALUES ($1, $2, $3)
         RETURNING id, texto, tipo, created_at`,
        [aluno_id, texto, tipo || 'informacao']
    );

  res.status(201).json({ success: true, message: 'Notificação criada com sucesso', data: notificacao.rows[0] });
});
