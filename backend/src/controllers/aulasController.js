// backend/src/controllers/aulasController.js
const conn = require('../config/database');
const notificacoesController = require('./notificacoesController');

// Listar tipos de aula
exports.listarTiposAula = async (req, res) => {
    try {
        const tiposAula = await conn.query('SELECT * FROM tipos_aula ORDER BY nome');
        
        res.status(200).json({
            success: true,
            data: tiposAula.rows
        });
    } catch (error) {
        console.error('Erro ao listar tipos de aula:', error);
        res.status(500).json({
            success: false,
            message: 'Erro interno do servidor ao listar tipos de aula'
        });
    }
};

// Criar novo tipo de aula
exports.criarTipoAula = async (req, res) => {
    try {
        const { nome, descricao, cor, duracao_padrao } = req.body;
        
        if (!nome) {
            return res.status(400).json({
                success: false,
                message: 'O nome do tipo de aula é obrigatório'
            });
        }
        
        const tipoAula = await conn.query(
            'INSERT INTO tipos_aula (nome, descricao, cor, duracao_padrao) VALUES ($1, $2, $3, $4) RETURNING *',
            [nome, descricao, cor || '#3498db', duracao_padrao || 60]
        );
        
        res.status(201).json({
            success: true,
            message: 'Tipo de aula criado com sucesso',
            data: tipoAula.rows[0]
        });
    } catch (error) {
        console.error('Erro ao criar tipo de aula:', error);
        res.status(500).json({
            success: false,
            message: 'Erro interno do servidor ao criar tipo de aula'
        });
    }
};

// Agendar nova aula
exports.agendarAula = async (req, res) => {
    try {
        const { 
            tipo_aula_id, titulo, descricao, data, hora_inicio, hora_fim,
            max_participantes, instrutor_id, sala, observacoes
        } = req.body;
        
        if (!tipo_aula_id || !titulo || !data || !hora_inicio || !hora_fim) {
            return res.status(400).json({
                success: false,
                message: 'Dados incompletos. Tipo de aula, título, data, hora de início e fim são obrigatórios'
            });
        }
        
        // Verificar se o tipo de aula existe
        const tipoAula = await conn.query('SELECT id FROM tipos_aula WHERE id = $1', [tipo_aula_id]);
        if (tipoAula.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Tipo de aula não encontrado'
            });
        }
        
        // Agendar a aula
        const aula = await conn.query(
            `INSERT INTO aulas 
                (tipo_aula_id, titulo, descricao, data, hora_inicio, hora_fim, 
                 max_participantes, instrutor_id, sala, observacoes) 
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) RETURNING *`,
            [tipo_aula_id, titulo, descricao, data, hora_inicio, hora_fim, 
             max_participantes, instrutor_id, sala, observacoes]
        );
        
        res.status(201).json({
            success: true,
            message: 'Aula agendada com sucesso',
            data: aula.rows[0]
        });
    } catch (error) {
        console.error('Erro ao agendar aula:', error);
        res.status(500).json({
            success: false,
            message: 'Erro interno do servidor ao agendar aula'
        });
    }
};

// Listar aulas agendadas (com filtros)
exports.listarAulas = async (req, res) => {
    try {
        const { data_inicio, data_fim, tipo_aula_id, status } = req.query;
        
        // Construir a consulta com filtros dinâmicos
        let query = `
            SELECT a.*, ta.nome as tipo_aula_nome, ta.cor as cor, 
                   u.nome as instrutor_nome,
                   (SELECT COUNT(*) FROM inscricoes_aula ia WHERE ia.aula_id = a.id AND ia.status = 'confirmada') as total_inscritos
            FROM aulas a
            JOIN tipos_aula ta ON a.tipo_aula_id = ta.id
            LEFT JOIN usuarios u ON a.instrutor_id = u.id
            WHERE 1=1
        `;
        
        const params = [];
        
        // Adicionar filtros se fornecidos
        if (data_inicio) {
            params.push(data_inicio);
            query += ` AND a.data >= $${params.length}`;
        }
        
        if (data_fim) {
            params.push(data_fim);
            query += ` AND a.data <= $${params.length}`;
        }
        
        if (tipo_aula_id) {
            params.push(tipo_aula_id);
            query += ` AND a.tipo_aula_id = $${params.length}`;
        }
        
        if (status) {
            params.push(status);
            query += ` AND a.status = $${params.length}`;
        }
        
        query += ' ORDER BY a.data, a.hora_inicio';
        
        const aulas = await conn.query(query, params);
        
        res.status(200).json({
            success: true,
            data: aulas.rows
        });
    } catch (error) {
        console.error('Erro ao listar aulas:', error);
        res.status(500).json({
            success: false,
            message: 'Erro interno do servidor ao listar aulas'
        });
    }
};

// Obter detalhes de uma aula
exports.obterAula = async (req, res) => {
    try {
        const { id } = req.params;
        
        // Buscar dados da aula
        const aula = await conn.query(
            `SELECT a.*, ta.nome as tipo_aula_nome, ta.cor as cor, 
                    u.nome as instrutor_nome
             FROM aulas a
             JOIN tipos_aula ta ON a.tipo_aula_id = ta.id
             LEFT JOIN usuarios u ON a.instrutor_id = u.id
             WHERE a.id = $1`,
            [id]
        );
        
        if (aula.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Aula não encontrada'
            });
        }
        
        // Buscar participantes inscritos
        const participantes = await conn.query(
            `SELECT ia.id, ia.status, ia.data_inscricao, ia.observacoes,
                    a.id as aluno_id, a.nome_completo as aluno_nome
             FROM inscricoes_aula ia
             JOIN alunos a ON ia.aluno_id = a.id
             WHERE ia.aula_id = $1
             ORDER BY ia.data_inscricao`,
            [id]
        );
        
        // Combinar dados
        const aulaDetalhes = {
            ...aula.rows[0],
            participantes: participantes.rows
        };
        
        res.status(200).json({
            success: true,
            data: aulaDetalhes
        });
    } catch (error) {
        console.error('Erro ao obter detalhes da aula:', error);
        res.status(500).json({
            success: false,
            message: 'Erro interno do servidor ao obter detalhes da aula'
        });
    }
};

// Atualizar status de uma aula
exports.atualizarStatusAula = async (req, res) => {
    try {
        const { id } = req.params;
        const { status, observacoes } = req.body;
        
        if (!status || !['agendada', 'realizada', 'cancelada'].includes(status)) {
            return res.status(400).json({
                success: false,
                message: 'Status inválido. Deve ser: agendada, realizada ou cancelada'
            });
        }
        
        // Verificar se a aula existe
        const aulaCheck = await conn.query('SELECT id FROM aulas WHERE id = $1', [id]);
        if (aulaCheck.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Aula não encontrada'
            });
        }
        
        // Atualizar status
        await conn.query(
            'UPDATE aulas SET status = $1, observacoes = $2 WHERE id = $3',
            [status, observacoes, id]
        );
        
        // Se a aula for cancelada, notificar os participantes
        if (status === 'cancelada') {
            // Buscar participantes inscritos
            const participantes = await conn.query(
                `SELECT ia.aluno_id, a.titulo
                 FROM inscricoes_aula ia
                 JOIN aulas a ON ia.aula_id = a.id
                 WHERE ia.aula_id = $1 AND ia.status = 'confirmada'`,
                [id]
            );
            
            // Enviar notificação para cada participante
            for (const participante of participantes.rows) {
                await notificacoesController.criarNotificacao(
                    participante.aluno_id,
                    `A aula "${participante.titulo}" foi cancelada. ${observacoes || ''}`,
                    'alerta'
                );
            }
        }
        
        res.status(200).json({
            success: true,
            message: `Status da aula atualizado para ${status}`
        });
    } catch (error) {
        console.error('Erro ao atualizar status da aula:', error);
        res.status(500).json({
            success: false,
            message: 'Erro interno do servidor ao atualizar status da aula'
        });
    }
};

// Inscrever aluno em uma aula
exports.inscreverEmAula = async (req, res) => {
    try {
        const { aula_id, aluno_id } = req.body;
        
        if (!aula_id || !aluno_id) {
            return res.status(400).json({
                success: false,
                message: 'ID da aula e ID do aluno são obrigatórios'
            });
        }
        
        // Verificar se a aula existe e está agendada
        const aula = await conn.query(
            'SELECT id, titulo, max_participantes FROM aulas WHERE id = $1 AND status = $2',
            [aula_id, 'agendada']
        );
        
        if (aula.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Aula não encontrada ou não está mais disponível'
            });
        }
        
        // Verificar se já existe inscrição
        const inscricaoExistente = await conn.query(
            'SELECT id FROM inscricoes_aula WHERE aula_id = $1 AND aluno_id = $2',
            [aula_id, aluno_id]
        );
        
        if (inscricaoExistente.rows.length > 0) {
            return res.status(400).json({
                success: false,
                message: 'Você já está inscrito nesta aula'
            });
        }
        
        // Verificar se há vagas disponíveis
        const totalInscritos = await conn.query(
            'SELECT COUNT(*) as total FROM inscricoes_aula WHERE aula_id = $1 AND status = $2',
            [aula_id, 'confirmada']
        );
        
        const maxParticipantes = aula.rows[0].max_participantes;
        
        if (maxParticipantes && parseInt(totalInscritos.rows[0].total) >= maxParticipantes) {
            return res.status(400).json({
                success: false,
                message: 'Esta aula já atingiu o número máximo de participantes'
            });
        }
        
        // Realizar inscrição
        const inscricao = await conn.query(
            'INSERT INTO inscricoes_aula (aula_id, aluno_id) VALUES ($1, $2) RETURNING id',
            [aula_id, aluno_id]
        );
        
        res.status(201).json({
            success: true,
            message: `Inscrição realizada com sucesso na aula "${aula.rows[0].titulo}"`,
            id: inscricao.rows[0].id
        });
    } catch (error) {
        console.error('Erro ao inscrever em aula:', error);
        res.status(500).json({
            success: false,
            message: 'Erro interno do servidor ao realizar inscrição'
        });
    }
};

// Cancelar inscrição em uma aula
exports.cancelarInscricao = async (req, res) => {
    try {
        const { aula_id } = req.params;
        const { aluno_id } = req.body;
        
        if (!aluno_id) {
            return res.status(400).json({
                success: false,
                message: 'ID do aluno é obrigatório'
            });
        }
        
        // Verificar se existe inscrição
        const inscricao = await conn.query(
            'SELECT id FROM inscricoes_aula WHERE aula_id = $1 AND aluno_id = $2',
            [aula_id, aluno_id]
        );
        
        if (inscricao.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Inscrição não encontrada'
            });
        }
        
        // Atualizar status para cancelado
        await conn.query(
            "UPDATE inscricoes_aula SET status = 'cancelada' WHERE aula_id = $1 AND aluno_id = $2",
            [aula_id, aluno_id]
        );
        
        res.status(200).json({
            success: true,
            message: 'Inscrição cancelada com sucesso'
        });
    } catch (error) {
        console.error('Erro ao cancelar inscrição:', error);
        res.status(500).json({
            success: false,
            message: 'Erro interno do servidor ao cancelar inscrição'
        });
    }
};

// Listar aulas do aluno
exports.listarAulasAluno = async (req, res) => {
    try {
        const { aluno_id } = req.params;
        
        if (!aluno_id) {
            return res.status(400).json({
                success: false,
                message: 'ID do aluno é obrigatório'
            });
        }
        
        // Buscar aulas em que o aluno está inscrito
        const aulas = await conn.query(
            `SELECT a.*, ta.nome as tipo_aula_nome, ta.cor as cor,
                    u.nome as instrutor_nome,
                    ia.status as status_inscricao
             FROM aulas a
             JOIN tipos_aula ta ON a.tipo_aula_id = ta.id
             LEFT JOIN usuarios u ON a.instrutor_id = u.id
             JOIN inscricoes_aula ia ON a.id = ia.aula_id
             WHERE ia.aluno_id = $1
             ORDER BY a.data, a.hora_inicio`,
            [aluno_id]
        );
        
        res.status(200).json({
            success: true,
            data: aulas.rows
        });
    } catch (error) {
        console.error('Erro ao listar aulas do aluno:', error);
        res.status(500).json({
            success: false,
            message: 'Erro interno do servidor ao listar aulas do aluno'
        });
    }
};