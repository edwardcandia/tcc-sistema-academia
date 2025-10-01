// backend/src/controllers/registroTreinoController.js
const conn = require('../config/database');

// Registrar a realização de um treino
exports.registrarTreino = async (req, res) => {
    try {
        const { treino_id, data, duracao, observacoes, avaliacao } = req.body;
        const aluno_id = req.alunoId;

        if (!treino_id || !data || !duracao) {
            return res.status(400).json({
                success: false,
                message: 'Dados incompletos. Treino, data e duração são obrigatórios'
            });
        }

        // Verificar se o treino existe e está atribuído ao aluno
        const treino = await conn.query(
            'SELECT id FROM modelos_treino WHERE id = $1 AND aluno_id = $2',
            [treino_id, aluno_id]
        );

        if (treino.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Treino não encontrado ou não atribuído a este aluno'
            });
        }

        // Registrar o treino realizado
        const result = await conn.query(
            `INSERT INTO registros_treino 
                (aluno_id, treino_id, data_realizacao, duracao, observacoes, avaliacao) 
             VALUES ($1, $2, $3, $4, $5, $6) RETURNING id`,
            [aluno_id, treino_id, data, duracao, observacoes, avaliacao]
        );

        res.status(201).json({
            success: true,
            message: 'Treino registrado com sucesso',
            id: result.rows[0].id
        });
    } catch (error) {
        console.error('Erro ao registrar treino:', error);
        res.status(500).json({
            success: false,
            message: 'Erro interno do servidor ao registrar treino'
        });
    }
};

// Obter histórico de treinos realizados
exports.obterHistoricoTreinos = async (req, res) => {
    try {
        const aluno_id = req.alunoId;
        
        const registros = await conn.query(
            `SELECT r.id, r.treino_id, mt.nome AS treino_nome, r.data_realizacao, 
                    r.duracao, r.observacoes, r.avaliacao 
             FROM registros_treino r
             JOIN modelos_treino mt ON r.treino_id = mt.id
             WHERE r.aluno_id = $1
             ORDER BY r.data_realizacao DESC`,
            [aluno_id]
        );

        res.status(200).json({
            success: true,
            data: registros.rows
        });
    } catch (error) {
        console.error('Erro ao obter histórico de treinos:', error);
        res.status(500).json({
            success: false,
            message: 'Erro interno do servidor ao obter histórico de treinos'
        });
    }
};

// Obter estatísticas de treino
exports.obterEstatisticas = async (req, res) => {
    try {
        const aluno_id = req.alunoId;
        
        // Total de treinos realizados
        const totalTreinos = await conn.query(
            'SELECT COUNT(*) as total FROM registros_treino WHERE aluno_id = $1',
            [aluno_id]
        );
        
        // Tempo total de treino (em minutos)
        const tempoTotal = await conn.query(
            'SELECT SUM(duracao) as total_minutos FROM registros_treino WHERE aluno_id = $1',
            [aluno_id]
        );
        
        // Treinos por tipo (agrupados pelo modelo de treino)
        const treinosPorTipo = await conn.query(
            `SELECT mt.nome, COUNT(*) as quantidade 
             FROM registros_treino rt 
             JOIN modelos_treino mt ON rt.treino_id = mt.id 
             WHERE rt.aluno_id = $1 
             GROUP BY mt.nome`,
            [aluno_id]
        );
        
        // Avaliação média
        const avaliacaoMedia = await conn.query(
            'SELECT AVG(avaliacao) as media FROM registros_treino WHERE aluno_id = $1',
            [aluno_id]
        );
        
        // Frequência mensal (últimos 6 meses)
        const frequenciaMensal = await conn.query(
            `SELECT 
                TO_CHAR(data_realizacao, 'YYYY-MM') as mes,
                COUNT(*) as quantidade
             FROM registros_treino
             WHERE aluno_id = $1 AND data_realizacao >= CURRENT_DATE - INTERVAL '6 months'
             GROUP BY TO_CHAR(data_realizacao, 'YYYY-MM')
             ORDER BY mes`,
            [aluno_id]
        );

        res.status(200).json({
            success: true,
            data: {
                total_treinos: parseInt(totalTreinos.rows[0].total),
                tempo_total: tempoTotal.rows[0].total_minutos || 0,
                treinos_por_tipo: treinosPorTipo.rows,
                avaliacao_media: avaliacaoMedia.rows[0].media || 0,
                frequencia_mensal: frequenciaMensal.rows
            }
        });
    } catch (error) {
        console.error('Erro ao obter estatísticas de treino:', error);
        res.status(500).json({
            success: false,
            message: 'Erro interno do servidor ao obter estatísticas de treino'
        });
    }
};

// Excluir registro de treino
exports.excluirRegistroTreino = async (req, res) => {
    try {
        const { id } = req.params;
        const aluno_id = req.alunoId;

        // Verificar se o registro pertence ao aluno
        const registro = await conn.query(
            'SELECT id FROM registros_treino WHERE id = $1 AND aluno_id = $2',
            [id, aluno_id]
        );

        if (registro.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Registro de treino não encontrado ou não pertence a este aluno'
            });
        }

        // Excluir o registro
        await conn.query(
            'DELETE FROM registros_treino WHERE id = $1',
            [id]
        );

        res.status(200).json({
            success: true,
            message: 'Registro de treino excluído com sucesso'
        });
    } catch (error) {
        console.error('Erro ao excluir registro de treino:', error);
        res.status(500).json({
            success: false,
            message: 'Erro interno do servidor ao excluir registro de treino'
        });
    }
};