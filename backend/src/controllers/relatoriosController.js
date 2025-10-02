const db = require('../config/database');

/**
 * @swagger
 * /api/relatorios/novos-alunos:
 *   get:
 *     summary: Relatório de novos alunos por mês
 *     tags: [Relatórios]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date
 *         description: Data inicial (YYYY-MM-DD)
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date
 *         description: Data final (YYYY-MM-DD)
 *     responses:
 *       200:
 *         description: Relatório gerado com sucesso
 *       401:
 *         description: Acesso não autorizado
 */
const getNovosAlunosPorMes = async (req, res) => {
    const { startDate, endDate } = req.query;
    
    let dateFilter = "WHERE data_matricula >= NOW() - INTERVAL '1 year'";
    const params = [];
    
    if (startDate && endDate) {
        dateFilter = 'WHERE data_matricula BETWEEN $1 AND $2';
        params.push(startDate, endDate);
    }
    
    try {
        const query = `
            SELECT 
                TO_CHAR(DATE_TRUNC('month', data_matricula), 'YYYY-MM') AS mes,
                COUNT(id) AS quantidade
            FROM alunos
            ${dateFilter}
            GROUP BY mes
            ORDER BY mes ASC
        `;
        
        const result = await db.query(query, params);
        
        res.status(200).json({
            success: true,
            title: "Novos Alunos por Mês",
            description: "Relatório mostrando a quantidade de novos alunos matriculados por mês",
            data: result.rows
        });
    } catch (error) {
        console.error("Erro no relatório de novos alunos:", error);
        res.status(500).json({ 
            success: false,
            error: 'Erro ao gerar relatório de novos alunos.' 
        });
    }
};

/**
 * @swagger
 * /api/relatorios/alunos-por-plano:
 *   get:
 *     summary: Relatório de alunos por plano
 *     tags: [Relatórios]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Relatório gerado com sucesso
 *       401:
 *         description: Acesso não autorizado
 */
const getAlunosPorPlano = async (req, res) => {
    try {
        const query = `
            SELECT 
                p.nome,
                COUNT(a.id) AS quantidade,
                ROUND(COUNT(a.id) * 100.0 / (SELECT COUNT(*) FROM alunos WHERE status = 'ativo'), 1) AS porcentagem
            FROM alunos a
            JOIN planos p ON a.plano_id = p.id
            WHERE a.status = 'ativo'
            GROUP BY p.nome
            ORDER BY quantidade DESC
        `;
        
        const result = await db.query(query);
        
        res.status(200).json({
            success: true,
            title: "Distribuição de Alunos por Plano",
            description: "Relatório mostrando a distribuição dos alunos ativos por plano",
            data: result.rows
        });
    } catch (error) {
        console.error("Erro no relatório de alunos por plano:", error);
        res.status(500).json({ 
            success: false,
            error: 'Erro ao gerar relatório de alunos por plano.' 
        });
    }
};

/**
 * @swagger
 * /api/relatorios/status-pagamentos:
 *   get:
 *     summary: Relatório de status de pagamentos
 *     tags: [Relatórios]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Relatório gerado com sucesso
 *       401:
 *         description: Acesso não autorizado
 */
const getStatusPagamentos = async (req, res) => {
    try {
        const query = `
            SELECT 
                CASE 
                    WHEN status = 'inativo' THEN 'Inativo'
                    WHEN proximo_vencimento IS NULL THEN 'Pendente'
                    WHEN proximo_vencimento < NOW() THEN 'Atrasado'
                    ELSE 'Em Dia' 
                END as status,
                COUNT(*) AS quantidade,
                ROUND(COUNT(*) * 100.0 / (SELECT COUNT(*) FROM alunos), 1) AS porcentagem
            FROM alunos
            GROUP BY status
            ORDER BY 
                CASE 
                    WHEN status = 'Em Dia' THEN 1
                    WHEN status = 'Atrasado' THEN 2
                    WHEN status = 'Pendente' THEN 3
                    ELSE 4
                END
        `;
        
        const result = await db.query(query);
        
        res.status(200).json({
            success: true,
            title: "Status de Pagamentos dos Alunos",
            description: "Relatório mostrando a distribuição dos alunos por status de pagamento",
            data: result.rows
        });
    } catch (error) {
        console.error("Erro no relatório de status de pagamentos:", error);
        res.status(500).json({ 
            success: false,
            error: 'Erro ao gerar relatório de status de pagamentos.' 
        });
    }
};

/**
 * @swagger
 * /api/relatorios/frequencia-alunos:
 *   get:
 *     summary: Relatório de frequência dos alunos
 *     tags: [Relatórios]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date
 *         description: Data inicial (YYYY-MM-DD)
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date
 *         description: Data final (YYYY-MM-DD)
 *     responses:
 *       200:
 *         description: Relatório gerado com sucesso
 *       401:
 *         description: Acesso não autorizado
 */
const getFrequenciaAlunos = async (req, res) => {
    const { startDate, endDate } = req.query;
    
    let dateFilter = "WHERE rt.data_realizacao >= NOW() - INTERVAL '30 days'";
    const params = [];
    
    if (startDate && endDate) {
        dateFilter = 'WHERE rt.data_realizacao BETWEEN $1 AND $2';
        params.push(startDate, endDate);
    }
    
    try {
        // Estatísticas gerais de frequência
        const queryGeral = `
            SELECT 
                COUNT(DISTINCT rt.aluno_id) AS alunos_ativos,
                COUNT(rt.id) AS total_treinos,
                ROUND(AVG(rt.duracao), 1) AS duracao_media,
                ROUND(AVG(treinos_por_aluno), 1) AS media_treinos_por_aluno
            FROM registros_treino rt
            JOIN (
                SELECT 
                    aluno_id, 
                    COUNT(*) AS treinos_por_aluno
                FROM registros_treino
                ${dateFilter}
                GROUP BY aluno_id
            ) AS stats ON rt.aluno_id = stats.aluno_id
            ${dateFilter}
        `;
        
        // Frequência por dia da semana
        const queryDiaSemana = `
            SELECT 
                EXTRACT(DOW FROM rt.data_realizacao) as dia_semana,
                CASE 
                    WHEN EXTRACT(DOW FROM rt.data_realizacao) = 0 THEN 'Domingo'
                    WHEN EXTRACT(DOW FROM rt.data_realizacao) = 1 THEN 'Segunda'
                    WHEN EXTRACT(DOW FROM rt.data_realizacao) = 2 THEN 'Terça'
                    WHEN EXTRACT(DOW FROM rt.data_realizacao) = 3 THEN 'Quarta'
                    WHEN EXTRACT(DOW FROM rt.data_realizacao) = 4 THEN 'Quinta'
                    WHEN EXTRACT(DOW FROM rt.data_realizacao) = 5 THEN 'Sexta'
                    WHEN EXTRACT(DOW FROM rt.data_realizacao) = 6 THEN 'Sábado'
                END AS nome_dia,
                COUNT(*) AS total_treinos
            FROM registros_treino rt
            ${dateFilter}
            GROUP BY dia_semana, nome_dia
            ORDER BY dia_semana
        `;
        
        // Horários mais populares
        const queryHorario = `
            SELECT 
                EXTRACT(HOUR FROM rt.created_at) AS hora,
                LPAD(EXTRACT(HOUR FROM rt.created_at)::text, 2, '0') || ':00' AS faixa_horaria,
                COUNT(*) AS total_treinos
            FROM registros_treino rt
            ${dateFilter}
            GROUP BY hora, faixa_horaria
            ORDER BY total_treinos DESC
            LIMIT 5
        `;
        
        const [resultGeral, resultDiaSemana, resultHorario] = await Promise.all([
            db.query(queryGeral, params),
            db.query(queryDiaSemana, params),
            db.query(queryHorario, params)
        ]);
        
        res.status(200).json({
            success: true,
            title: "Análise de Frequência dos Alunos",
            description: "Relatório detalhado da frequência dos alunos na academia",
            data: {
                estatisticas_gerais: resultGeral.rows[0],
                frequencia_por_dia: resultDiaSemana.rows,
                horarios_populares: resultHorario.rows
            }
        });
    } catch (error) {
        console.error("Erro no relatório de frequência:", error);
        res.status(500).json({ 
            success: false,
            error: 'Erro ao gerar relatório de frequência.' 
        });
    }
};

/**
 * @swagger
 * /api/relatorios/receitas:
 *   get:
 *     summary: Relatório de receitas
 *     tags: [Relatórios]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date
 *         description: Data inicial (YYYY-MM-DD)
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date
 *         description: Data final (YYYY-MM-DD)
 *     responses:
 *       200:
 *         description: Relatório gerado com sucesso
 *       401:
 *         description: Acesso não autorizado
 */
const getReceitas = async (req, res) => {
    const { startDate, endDate } = req.query;
    
    // Por padrão, mostra os últimos 6 meses
    let dateFilter = "WHERE data_pagamento >= NOW() - INTERVAL '6 months'";
    const params = [];
    
    if (startDate && endDate) {
        dateFilter = 'WHERE data_pagamento BETWEEN $1 AND $2';
        params.push(startDate, endDate);
    }
    
    try {
        // Gera uma série temporal dos últimos 6 meses para garantir que todos os meses apareçam
        const queryMensal = `
            WITH meses AS (
                SELECT TO_CHAR(date_trunc('month', (current_date - (n || ' month')::interval)), 'YYYY-MM') AS mes
                FROM generate_series(0, 5) n
            ),
            receitas AS (
                SELECT 
                    TO_CHAR(DATE_TRUNC('month', data_pagamento), 'YYYY-MM') AS mes,
                    SUM(valor) AS receita_total,
                    COUNT(*) AS total_pagamentos
                FROM pagamentos
                ${dateFilter}
                GROUP BY mes
            )
            SELECT 
                m.mes,
                COALESCE(r.receita_total, 0) AS receita_total,
                COALESCE(r.total_pagamentos, 0) AS total_pagamentos
            FROM meses m
            LEFT JOIN receitas r ON m.mes = r.mes
            ORDER BY m.mes DESC
        `;
        
        // Receita por plano
        const queryPlano = `
            SELECT 
                p.nome AS plano,
                SUM(pg.valor) AS receita_total,
                COUNT(*) AS total_pagamentos,
                ROUND(AVG(pg.valor), 2) AS ticket_medio
            FROM pagamentos pg
            JOIN alunos a ON pg.aluno_id = a.id
            JOIN planos p ON a.plano_id = p.id
            ${dateFilter}
            GROUP BY p.nome
            ORDER BY receita_total DESC
        `;
        
        // Estatísticas gerais
        const queryGeral = `
            SELECT 
                SUM(valor) AS receita_total,
                COUNT(*) AS total_pagamentos,
                ROUND(AVG(valor), 2) AS ticket_medio,
                COUNT(DISTINCT aluno_id) AS alunos_pagantes
            FROM pagamentos
            ${dateFilter}
        `;
        
        const [resultMensal, resultPlano, resultGeral] = await Promise.all([
            db.query(queryMensal, params),
            db.query(queryPlano, params),
            db.query(queryGeral, params)
        ]);
        
        res.status(200).json({
            success: true,
            title: "Análise de Receitas - PlankGYM",
            description: "Relatório financeiro detalhado das receitas da academia",
            data: {
                estatisticas_gerais: resultGeral.rows[0],
                receita_mensal: resultMensal.rows,
                receita_por_plano: resultPlano.rows
            }
        });
    } catch (error) {
        console.error("Erro no relatório de receitas:", error);
        res.status(500).json({ 
            success: false,
            error: 'Erro ao gerar relatório de receitas.' 
        });
    }
};

/**
 * @swagger
 * /api/relatorios/desempenho-treinos:
 *   get:
 *     summary: Relatório de desempenho dos treinos
 *     tags: [Relatórios]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Relatório gerado com sucesso
 *       401:
 *         description: Acesso não autorizado
 */
const getDesempenhoTreinos = async (req, res) => {
    try {
        // Modelos de treino mais populares
        const queryPopulares = `
            SELECT 
                mt.nome AS treino,
                COUNT(rt.id) AS total_realizados,
                ROUND(AVG(rt.avaliacao), 1) AS avaliacao_media,
                ROUND(AVG(rt.duracao), 1) AS duracao_media
            FROM registros_treino rt
            JOIN modelos_treino mt ON rt.treino_id = mt.id
            GROUP BY mt.nome
            ORDER BY total_realizados DESC
            LIMIT 10
        `;
        
        // Avaliação dos treinos
        const queryAvaliacoes = `
            SELECT 
                rt.avaliacao,
                COUNT(*) AS total
            FROM registros_treino rt
            WHERE rt.avaliacao IS NOT NULL
            GROUP BY rt.avaliacao
            ORDER BY rt.avaliacao DESC
        `;
        
        // Duração média por modelo de treino
        const queryDuracao = `
            SELECT 
                mt.nome AS treino,
                ROUND(AVG(rt.duracao), 1) AS duracao_media,
                MIN(rt.duracao) AS duracao_minima,
                MAX(rt.duracao) AS duracao_maxima
            FROM registros_treino rt
            JOIN modelos_treino mt ON rt.treino_id = mt.id
            GROUP BY mt.nome
            ORDER BY duracao_media DESC
        `;
        
        const [resultPopulares, resultAvaliacoes, resultDuracao] = await Promise.all([
            db.query(queryPopulares),
            db.query(queryAvaliacoes),
            db.query(queryDuracao)
        ]);
        
        res.status(200).json({
            success: true,
            title: "Análise de Desempenho dos Treinos - PlankGYM",
            description: "Relatório detalhado sobre o desempenho e avaliação dos treinos na academia",
            data: {
                treinos_populares: resultPopulares.rows,
                distribuicao_avaliacoes: resultAvaliacoes.rows,
                duracao_por_treino: resultDuracao.rows
            }
        });
    } catch (error) {
        console.error("Erro no relatório de desempenho dos treinos:", error);
        res.status(500).json({ 
            success: false,
            error: 'Erro ao gerar relatório de desempenho dos treinos.' 
        });
    }
};

/**
 * @swagger
 * /api/relatorios/dashboard:
 *   get:
 *     summary: Resumo para dashboard
 *     tags: [Relatórios]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Dados gerados com sucesso
 *       401:
 *         description: Acesso não autorizado
 */
const getDashboardData = async (req, res) => {
    try {
        // Total de alunos ativos
        const queryAlunosAtivos = `
            SELECT COUNT(*) AS total FROM alunos WHERE status = 'ativo'
        `;
        
        // Total de alunos novos no mês atual
        const queryAlunosNovos = `
            SELECT COUNT(*) AS total 
            FROM alunos 
            WHERE DATE_TRUNC('month', data_matricula) = DATE_TRUNC('month', CURRENT_DATE)
        `;
        
        // Total de receita no mês atual
        const queryReceitaMes = `
            SELECT SUM(valor) AS total 
            FROM pagamentos 
            WHERE DATE_TRUNC('month', data_pagamento) = DATE_TRUNC('month', CURRENT_DATE)
        `;
        
        // Total de treinos registrados no mês atual
        const queryTreinosMes = `
            SELECT COUNT(*) AS total 
            FROM registros_treino 
            WHERE DATE_TRUNC('month', data_realizacao) = DATE_TRUNC('month', CURRENT_DATE)
        `;
        
        // Pagamentos em atraso
        const queryPagamentosAtraso = `
            SELECT COUNT(*) AS total 
            FROM alunos 
            WHERE proximo_vencimento < CURRENT_DATE AND status = 'ativo'
        `;
        
        const [
            resultAlunosAtivos, 
            resultAlunosNovos, 
            resultReceitaMes, 
            resultTreinosMes,
            resultPagamentosAtraso
        ] = await Promise.all([
            db.query(queryAlunosAtivos),
            db.query(queryAlunosNovos),
            db.query(queryReceitaMes),
            db.query(queryTreinosMes),
            db.query(queryPagamentosAtraso)
        ]);
        
        res.status(200).json({
            success: true,
            title: "Dashboard PlankGYM",
            description: "Dados resumidos para o painel principal",
            data: {
                alunos_ativos: parseInt(resultAlunosAtivos.rows[0].total || 0),
                alunos_novos_mes: parseInt(resultAlunosNovos.rows[0].total || 0),
                receita_mes: parseFloat(resultReceitaMes.rows[0].total || 0),
                treinos_mes: parseInt(resultTreinosMes.rows[0].total || 0),
                pagamentos_atraso: parseInt(resultPagamentosAtraso.rows[0].total || 0)
            }
        });
    } catch (error) {
        console.error("Erro ao gerar dados do dashboard:", error);
        res.status(500).json({ 
            success: false,
            error: 'Erro ao gerar dados do dashboard.' 
        });
    }
};

/**
 * @swagger
 * /api/relatorios/receitas-ultimos-meses:
 *   get:
 *     summary: Relatório de receitas dos últimos 6 meses
 *     tags: [Relatórios]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Relatório gerado com sucesso
 *       401:
 *         description: Acesso não autorizado
 */
const getReceitasUltimosMeses = async (req, res) => {
    try {
        // Gera uma série temporal dos últimos 6 meses e combina com os dados reais
        const query = `
            WITH meses AS (
                SELECT 
                    date_trunc('month', (current_date - (n || ' month')::interval)) AS mes_date,
                    TO_CHAR(date_trunc('month', (current_date - (n || ' month')::interval)), 'YYYY-MM') AS mes,
                    TO_CHAR(date_trunc('month', (current_date - (n || ' month')::interval)), 'Mon/YY') AS mes_formatado
                FROM generate_series(0, 5) n
            ),
            receitas AS (
                SELECT 
                    date_trunc('month', data_pagamento) AS mes_date,
                    SUM(valor) AS receita_total,
                    COUNT(*) AS total_pagamentos
                FROM pagamentos
                WHERE data_pagamento >= NOW() - INTERVAL '6 months'
                GROUP BY mes_date
            )
            SELECT 
                m.mes,
                m.mes_formatado,
                COALESCE(r.receita_total, 0) AS receita_total,
                COALESCE(r.total_pagamentos, 0) AS total_pagamentos
            FROM meses m
            LEFT JOIN receitas r ON m.mes_date = r.mes_date
            ORDER BY m.mes_date DESC
        `;
        
        const result = await db.query(query);
        
        // Inverte a ordem para ficar cronológica (do mais antigo para o mais recente)
        const dadosOrdenados = result.rows.reverse();
        
        res.status(200).json({
            success: true,
            title: "Receitas dos Últimos 6 Meses - PlankGYM",
            description: "Evolução da receita mensal nos últimos 6 meses",
            data: dadosOrdenados
        });
    } catch (error) {
        console.error("Erro no relatório de receitas dos últimos meses:", error);
        res.status(500).json({ 
            success: false,
            error: 'Erro ao gerar relatório de receitas dos últimos meses.' 
        });
    }
};

module.exports = {
    getNovosAlunosPorMes,
    getAlunosPorPlano,
    getStatusPagamentos,
    getFrequenciaAlunos,
    getReceitas,
    getReceitasUltimosMeses,
    getDesempenhoTreinos,
    getDashboardData
};