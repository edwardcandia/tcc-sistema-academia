import { Request, Response } from 'express';
import db from '../config/database';
import { asyncHandler } from '../utils/errorHandler';

const getMetrics = asyncHandler(async (_req: Request, res: Response) => {
    const [totalAlunosRes, alunosAtivosRes, totalPlanosRes, receitaMensalRes] = await Promise.all([
        db.query('SELECT COUNT(*) FROM alunos'),
        db.query("SELECT COUNT(*) FROM alunos WHERE status = 'ativo'"),
        db.query('SELECT COUNT(*) FROM planos'),
        db.query(`SELECT SUM(p.valor) AS receita_total FROM alunos a JOIN planos p ON a.plano_id = p.id WHERE a.status = 'ativo'`)
    ]);
    res.status(200).json({
        totalAlunos: parseInt(totalAlunosRes.rows[0].count, 10),
        alunosAtivos: parseInt(alunosAtivosRes.rows[0].count, 10),
        totalPlanos: parseInt(totalPlanosRes.rows[0].count, 10),
        receitaMensal: parseFloat(receitaMensalRes.rows[0].receita_total || 0).toFixed(2)
    });
});

const getAniversariantesDoMes = asyncHandler(async (_req: Request, res: Response) => {
    const result = await db.query(`
        SELECT id, nome_completo, TO_CHAR(data_nascimento, 'DD/MM') AS aniversario
        FROM alunos
        WHERE EXTRACT(MONTH FROM data_nascimento) = EXTRACT(MONTH FROM NOW())
          AND status = 'ativo'
        ORDER BY EXTRACT(DAY FROM data_nascimento) ASC
    `);
    res.status(200).json(result.rows);
});

const getPagamentosVencendo = asyncHandler(async (_req: Request, res: Response) => {
    const result = await db.query(`
        SELECT id, nome_completo, TO_CHAR(proximo_vencimento, 'DD/MM/YYYY') AS vencimento
        FROM alunos
        WHERE status = 'ativo'
          AND proximo_vencimento BETWEEN NOW() AND NOW() + INTERVAL '7 days'
        ORDER BY proximo_vencimento ASC
    `);
    res.status(200).json(result.rows);
});

const getEstatisticas = asyncHandler(async (_req: Request, res: Response) => {
    const [totalAlunosRes, alunosAtivosRes, pagamentosPendentesRes, receitaMesRes] = await Promise.all([
        db.query('SELECT COUNT(*) FROM alunos'),
        db.query("SELECT COUNT(*) FROM alunos WHERE status = 'ativo'"),
        db.query("SELECT COUNT(*) FROM alunos WHERE status = 'ativo' AND proximo_vencimento < NOW()"),
        db.query(`
            SELECT COALESCE(SUM(valor), 0) AS receita_total
            FROM pagamentos
            WHERE EXTRACT(MONTH FROM data_pagamento) = EXTRACT(MONTH FROM CURRENT_DATE)
              AND EXTRACT(YEAR FROM data_pagamento) = EXTRACT(YEAR FROM CURRENT_DATE)
        `)
    ]);
    res.status(200).json({
        totalAlunos: parseInt(totalAlunosRes.rows[0].count, 10),
        alunosAtivos: parseInt(alunosAtivosRes.rows[0].count, 10),
        receitaMes: parseFloat(receitaMesRes.rows[0].receita_total || 0).toFixed(2),
        pagamentosPendentes: parseInt(pagamentosPendentesRes.rows[0].count, 10)
    });
});

const getStatusAlunos = asyncHandler(async (_req: Request, res: Response) => {
    const result = await db.query('SELECT status, COUNT(*) AS total FROM alunos GROUP BY status ORDER BY status');
    res.status(200).json(result.rows);
});

const getDistribuicaoPlanos = asyncHandler(async (_req: Request, res: Response) => {
    const result = await db.query(`
        SELECT p.id, p.nome, COUNT(a.id) AS total_alunos
        FROM planos p
        LEFT JOIN alunos a ON p.id = a.plano_id
        GROUP BY p.id, p.nome
        ORDER BY p.nome
    `);
    res.status(200).json(result.rows);
});

const getHistoricoPagamentos = asyncHandler(async (_req: Request, res: Response) => {
    const result = await db.query(`
        WITH meses AS (
            SELECT
                date_trunc('month', (current_date - (n || ' month')::interval)) AS mes_date,
                TO_CHAR(date_trunc('month', (current_date - (n || ' month')::interval)), 'Mon/YYYY') AS mes_formatado
            FROM generate_series(0, 5) n
        ),
        receitas AS (
            SELECT
                date_trunc('month', data_pagamento) AS mes_date,
                SUM(valor) AS receita_total
            FROM pagamentos
            WHERE data_pagamento >= NOW() - INTERVAL '6 months'
            GROUP BY mes_date
        )
        SELECT m.mes_formatado, COALESCE(r.receita_total, 0) AS receita_total
        FROM meses m
        LEFT JOIN receitas r ON m.mes_date = r.mes_date
        ORDER BY m.mes_date ASC
    `);
    res.status(200).json({
        meses: result.rows.map(r => r.mes_formatado),
        valores: result.rows.map(r => parseFloat(r.receita_total || 0))
    });
});

// Retorna alunos ativos com pagamento vencido, ordenados pelo mais atrasado.
// Alimenta o Painel de Inadimplência no dashboard e a página dedicada.
const getInadimplentes = asyncHandler(async (_req: Request, res: Response) => {
    const result = await db.query(`
        SELECT
            a.id,
            a.nome_completo,
            a.email,
            a.telefone,
            TO_CHAR(a.proximo_vencimento, 'DD/MM/YYYY') AS vencimento,
            CURRENT_DATE - a.proximo_vencimento::date AS dias_atraso,
            COALESCE(p.valor, 0) AS valor_plano,
            p.nome AS plano_nome
        FROM alunos a
        LEFT JOIN planos p ON a.plano_id = p.id
        WHERE a.status = 'ativo'
          AND a.proximo_vencimento < CURRENT_DATE
        ORDER BY a.proximo_vencimento ASC
    `);
    res.status(200).json(result.rows);
});

export {
    getMetrics,
    getAniversariantesDoMes,
    getPagamentosVencendo,
    getEstatisticas,
    getStatusAlunos,
    getDistribuicaoPlanos,
    getHistoricoPagamentos,
    getInadimplentes
};