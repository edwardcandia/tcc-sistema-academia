import { Request, Response } from 'express';
import db from '../config/database';
import { ApiError, ErrorTypes, asyncHandler } from '../utils/errorHandler';
import { AIFactory } from '../services/ai/AIFactory';
import { ChatMessage } from '../services/ai/IAIProvider';

/**
 * Controller para processar as mensagens do Chatbot (PlankBot)
 */
export const handleChat = asyncHandler(async (req: Request, res: Response) => {
    const alunoId = req.aluno?.id;
    const { messages } = req.body;

    if (!alunoId) {
        throw new ApiError(ErrorTypes.UNAUTHORIZED.code, 'Aluno não identificado');
    }

    if (!messages || !Array.isArray(messages)) {
        throw new ApiError(ErrorTypes.VALIDATION_ERROR.code, 'Histórico de mensagens é obrigatório.');
    }

    // 1. Coleta de Contexto Enriquecido
    // Buscamos dados do aluno, plano, status financeiro e treinos em paralelo
    const [alunoResult, treinosResult, registrosResult] = await Promise.all([
        db.query(`
            SELECT a.nome_completo, a.status, p.nome as plano_nome,
            CASE 
                WHEN a.proximo_vencimento < CURRENT_DATE THEN 'Atrasado'
                WHEN a.proximo_vencimento >= CURRENT_DATE THEN 'Em Dia'
                ELSE 'Pendente'
            END as status_financeiro
            FROM alunos a
            LEFT JOIN planos p ON a.plano_id = p.id
            WHERE a.id = $1
        `, [alunoId]),
        db.query(`
            SELECT mt.nome as modelo_nome, mt.objetivo, mt.nivel_dificuldade,
            e.nome as exercicio_nome, e.instrucoes, it.series, it.repeticoes, it.observacoes as obs_instrutor
            FROM alunos_modelos_treino amt
            JOIN modelos_treino mt ON amt.modelo_treino_id = mt.id
            JOIN itens_treino it ON mt.id = it.modelo_treino_id
            JOIN exercicios e ON it.exercicio_id = e.id
            WHERE amt.aluno_id = $1 AND amt.status = 'ativo'
        `, [alunoId]),
        db.query(`
            SELECT TO_CHAR(data_realizacao, 'DD/MM/YYYY') as data_formatada,
            COUNT(*) OVER() as total_mes
            FROM registros_treino
            WHERE aluno_id = $1 AND data_realizacao >= DATE_TRUNC('month', CURRENT_DATE)
            ORDER BY data_realizacao DESC
            LIMIT 1
        `, [alunoId])
    ]);

    const aluno = alunoResult.rows[0];
    const treinos = treinosResult.rows;
    const ultimoRegistro = registrosResult.rows[0];

    if (!aluno) {
        throw new ApiError(ErrorTypes.NOT_FOUND.code, 'Dados do aluno não encontrados.');
    }

    // 2. Montagem do System Prompt (Otimizado para economia de tokens)
    const exerciciosStr = treinos.length > 0
        ? treinos.map(t => {
            // Pegamos apenas os primeiros 150 caracteres da instrução
            const instrucaoResumida = t.instrucoes && t.instrucoes.length > 150 
                ? t.instrucoes.substring(0, 150) + '...' 
                : t.instrucoes || 'Consultar instrutor';
            
            return `- ${t.exercicio_nome}: ${t.series}x${t.repeticoes}. Dica: ${instrucaoResumida}`;
        }).join('\n')
        : 'Nenhum exercício listado.';

    const systemPrompt = `
Você é o "PlankBot", o Personal Trainer Digital da academia PlankGYM.
Seja motivador e conciso.

--- ALUNO ---
Nome: ${aluno.nome_completo} | Status: ${aluno.status_financeiro}
Treino: ${treinos[0]?.modelo_nome || 'Nenhum'} | Mensal: ${ultimoRegistro?.total_mes || 0} idas.

--- EXERCÍCIOS ---
${exerciciosStr}

Regras:
1. Respostas curtas (máx 2 parágrafos).
2. Use os dados acima. Se o status for "Atrasado", avise para ir na recepção.
`;

    // 3. Chamada ao Provedor (Memória ultra-reduzida: apenas as últimas 4 mensagens)
    const memoryMessages = messages.slice(-4) as ChatMessage[];
    const aiProvider = AIFactory.getProvider();

    try {
        const aiResponse = await aiProvider.generateResponse(systemPrompt, memoryMessages);

        res.status(200).json({
            success: true,
            data: {
                message: {
                    role: 'assistant',
                    content: aiResponse
                }
            }
        });
    } catch (error) {
        console.error('Erro no PlankBot:', error);
        res.status(500).json({
            success: false,
            error: 'O PlankBot está descansando entre as séries. Tente novamente em alguns instantes!'
        });
    }
});
