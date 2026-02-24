import { Request, Response } from 'express';
import db from '../config/database';
import emailService from '../services/emailService';
import { criarNotificacaoInterna } from './notificacoesController';

/**
 * Verifica e envia lembretes de pagamentos próximos do vencimento
 * Essa função deve ser executada diariamente através de um agendador
 */
export const enviarLembretesPagamento = async (req: Request, res: Response): Promise<void> => {
    try {
        // Buscar pagamentos que vencem nos próximos 3 dias e que ainda não foram notificados
        const pagamentosPendentes = await db.query(`
            SELECT p.id, p.aluno_id, p.data_vencimento, p.valor, 
                   a.nome_completo, a.email
            FROM pagamentos p
            JOIN alunos a ON p.aluno_id = a.id
            WHERE p.status = 'pendente' 
                AND p.data_vencimento BETWEEN CURRENT_DATE AND CURRENT_DATE + INTERVAL '3 days'
                AND NOT EXISTS (
                    SELECT 1 FROM notificacoes n 
                    WHERE n.aluno_id = p.aluno_id 
                        AND n.texto LIKE '%pagamento%' || p.id || '%'
                )
        `);

        let sucessos = 0;

        // Para cada pagamento pendente, enviar um e-mail de lembrete
        for (const pagamento of pagamentosPendentes.rows) {
            // Enviar e-mail
            const resultadoEmail = await emailService.enviarLembretePagamento(
                {
                    nome_completo: pagamento.nome_completo,
                    email: pagamento.email
                },
                {
                    id: pagamento.id,
                    data_vencimento: pagamento.data_vencimento,
                    valor: pagamento.valor
                }
            );

            // Sempre cria notificação interna, independentemente do e-mail
            const dataVencimento = new Date(pagamento.data_vencimento).toLocaleDateString('pt-BR');
            await criarNotificacaoInterna(
                pagamento.aluno_id,
                `Lembrete: Você tem um pagamento de R$ ${parseFloat(pagamento.valor).toFixed(2)} com vencimento em ${dataVencimento}. ID: ${pagamento.id}`,
                'alerta'
            );

            if (resultadoEmail.success) {
                sucessos++;
            }
        }

        // Retornar resultado
        return void res.status(200).json({
            success: true,
            mensagem: `Lembretes de pagamento processados. ${sucessos} de ${pagamentosPendentes.rows.length} enviados com sucesso.`
        });
    } catch (error) {
        console.error('Erro ao enviar lembretes de pagamento:', error);
        return void res.status(500).json({
            success: false,
            mensagem: 'Erro ao processar lembretes de pagamento'
        });
    }
};

/**
 * Verifica e envia lembretes de treinos agendados para hoje
 * Essa função deve ser executada diariamente através de um agendador
 */
export const enviarLembretesTreino = async (req: Request, res: Response): Promise<void> => {
    try {
        // Buscar treinos agendados para hoje
        const treinosHoje = await db.query(`
            SELECT amt.id, amt.aluno_id, amt.modelo_treino_id,
                   mt.nome, mt.descricao, mt.nivel_dificuldade, mt.objetivo,
                   a.nome_completo, a.email
            FROM alunos_modelos_treino amt
            JOIN modelos_treino mt ON amt.modelo_treino_id = mt.id
            JOIN alunos a ON amt.aluno_id = a.id
            WHERE amt.status = 'ativo'
                AND EXTRACT(DOW FROM CURRENT_DATE) = ANY(
                    SELECT dia_semana FROM itens_treino it 
                    WHERE it.modelo_treino_id = amt.modelo_treino_id
                    GROUP BY dia_semana
                )
                AND NOT EXISTS (
                    SELECT 1 FROM notificacoes n 
                    WHERE n.aluno_id = amt.aluno_id 
                        AND n.created_at::date = CURRENT_DATE
                        AND n.texto LIKE '%treino%' || mt.nome || '%'
                )
        `);

        let sucessos = 0;

        // Para cada treino agendado, enviar um e-mail de lembrete
        for (const treino of treinosHoje.rows) {
            // Enviar e-mail
            const resultadoEmail = await emailService.enviarLembreteTreino(
                {
                    nome_completo: treino.nome_completo,
                    email: treino.email
                },
                {
                    id: treino.modelo_treino_id,
                    nome: treino.nome,
                    descricao: treino.descricao,
                    nivel_dificuldade: treino.nivel_dificuldade,
                    objetivo: treino.objetivo
                }
            );

            // Sempre cria notificação interna, independentemente do e-mail
            await criarNotificacaoInterna(
                treino.aluno_id,
                `Lembrete: Você tem o treino "${treino.nome}" agendado para hoje. Não se esqueça de registrar após concluí-lo!`,
                'info'
            );

            if (resultadoEmail.success) {
                sucessos++;
            }
        }

        // Retornar resultado
        return void res.status(200).json({
            success: true,
            mensagem: `Lembretes de treino processados. ${sucessos} de ${treinosHoje.rows.length} enviados com sucesso.`
        });
    } catch (error) {
        console.error('Erro ao enviar lembretes de treino:', error);
        return void res.status(500).json({
            success: false,
            mensagem: 'Erro ao processar lembretes de treino'
        });
    }
};

export const testarEmail = async (req: Request, res: Response): Promise<void> => {
    try {
        const { destinatario, assunto, mensagem } = req.body;
        
        if (!destinatario || !assunto || !mensagem) {
            return void res.status(400).json({
                success: false,
                mensagem: 'Destinatário, assunto e mensagem são obrigatórios'
            });
        }
        
        const resultado = await emailService.enviarEmail(
            destinatario, 
            assunto, 
            mensagem
        );
        
        if (resultado.success) {
            return void res.status(200).json({
                success: true,
                mensagem: `E-mail enviado com sucesso para ${destinatario}`,
                messageId: resultado.messageId
            });
        } else {
            return void res.status(500).json({
                success: false,
                mensagem: 'Erro ao enviar e-mail',
                erro: resultado.error
            });
        }
    } catch (error) {
        console.error('Erro ao testar envio de e-mail:', error);
        return void res.status(500).json({
            success: false,
            mensagem: 'Erro ao testar envio de e-mail'
        });
    }
};