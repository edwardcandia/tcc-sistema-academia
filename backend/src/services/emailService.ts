// backend/src/services/emailService.ts
import nodemailer from 'nodemailer';
import type { SendMailOptions } from 'nodemailer';

let _transporter: nodemailer.Transporter | null = null;

const getTransporter = () => {
    if (_transporter) return _transporter;

    // Prefer explicit SMTP settings; fall back to service if provided
    const smtpHost = process.env.SMTP_HOST;
    const smtpPort = process.env.SMTP_PORT ? parseInt(process.env.SMTP_PORT, 10) : undefined;
    const user = process.env.EMAIL_USER;
    const pass = process.env.EMAIL_PASS;
    const service = process.env.EMAIL_SERVICE; // e.g. 'gmail'

    if (!user || !pass) {
        console.warn('Email service credentials (EMAIL_USER/EMAIL_PASS) are not set. Email sending will likely fail.');
    }

    if (smtpHost) {
        _transporter = nodemailer.createTransport({
            host: smtpHost,
            port: smtpPort || 587,
            secure: smtpPort === 465, // true for 465, false for other ports
            auth: user && pass ? { user, pass } : undefined
        });
    } else if (service) {
        _transporter = nodemailer.createTransport({
            service,
            auth: user && pass ? { user, pass } : undefined
        });
    } else {
        // Last resort: use direct transport (not recommended for production)
        _transporter = nodemailer.createTransport({
            host: 'localhost',
            port: 25,
            secure: false
        });
    }

    return _transporter;
};

export const enviarEmail = async (to: string, subject: string, text: string, html?: string) => {
    try {
        const transporter = getTransporter();
        const mailOptions: SendMailOptions = {
            from: process.env.EMAIL_FROM || process.env.EMAIL_USER || 'academia@exemplo.com',
            to,
            subject,
            text,
            html: html || text
        };

        const info = await transporter.sendMail(mailOptions);
        console.log('E-mail enviado com sucesso:', info.messageId);
        return { success: true, messageId: info.messageId };
    } catch (error) {
        console.error('Erro ao enviar e-mail:', error && error.message ? error.message : error);
        return { success: false, error };
    }
};

export const enviarLembreteTreino = async (aluno: any, treino: any) => {
    const subject = `Lembrete de Treino: ${treino.nome}`;
    const text = `Olá ${aluno.nome_completo.split(' ')[0]},\n\nEste é um lembrete sobre seu treino "${treino.nome}" agendado para hoje.\n\nBom treino!\n\nAtenciosamente,\nEquipe da Academia`;
    const html = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #4CAF50;">Lembrete de Treino</h2>
            <p>Olá <strong>${aluno.nome_completo.split(' ')[0]}</strong>,</p>
            <p>Este é um lembrete sobre seu treino <strong>${treino.nome}</strong> agendado para hoje.</p>
            <div style="background-color: #f5f5f5; padding: 15px; border-radius: 5px; margin: 20px 0;">
                <h3 style="margin-top: 0; color: #333;">${treino.nome}</h3>
                <p>${treino.descricao || "Treino personalizado"}</p>
                <p>Nível: ${treino.nivel_dificuldade || "Personalizado"}</p>
                <p>Objetivo: ${treino.objetivo || "Desenvolvimento físico geral"}</p>
            </div>
            <p>Não se esqueça de registrar sua avaliação após a conclusão do treino.</p>
            <p>Bom treino!</p>
            <p>Atenciosamente,<br>Equipe da Academia</p>
        </div>
    `;
    return await enviarEmail(aluno.email, subject, text, html);
};

export const enviarLembretePagamento = async (aluno: any, pagamento: any) => {
    const dataVencimento = new Date(pagamento.data_vencimento).toLocaleDateString('pt-BR');
    const valorFormatado = parseFloat(pagamento.valor).toLocaleString('pt-BR', {
        style: 'currency',
        currency: 'BRL'
    });

    const subject = `Lembrete de Pagamento - Vencimento em ${dataVencimento}`;
    const text = `Olá ${aluno.nome_completo.split(' ')[0]},\n\nEste é um lembrete sobre seu pagamento no valor de ${valorFormatado} com vencimento em ${dataVencimento}.\n\nCaso já tenha efetuado o pagamento, por favor desconsidere este e-mail.\n\nAtenciosamente,\nEquipe da Academia`;
    const html = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #2196F3;">Lembrete de Pagamento</h2>
            <p>Olá <strong>${aluno.nome_completo.split(' ')[0]}</strong>,</p>
            <p>Este é um lembrete sobre seu pagamento com vencimento próximo:</p>
            <div style="background-color: #f5f5f5; padding: 15px; border-radius: 5px; margin: 20px 0;">
                <table style="width: 100%; border-collapse: collapse;">
                    <tr>
                        <td style="padding: 8px; border-bottom: 1px solid #ddd;"><strong>Valor:</strong></td>
                        <td style="padding: 8px; border-bottom: 1px solid #ddd;">${valorFormatado}</td>
                    </tr>
                    <tr>
                        <td style="padding: 8px; border-bottom: 1px solid #ddd;"><strong>Vencimento:</strong></td>
                        <td style="padding: 8px; border-bottom: 1px solid #ddd;">${dataVencimento}</td>
                    </tr>
                </table>
            </div>
            <p>Caso já tenha efetuado o pagamento, por favor desconsidere este e-mail.</p>
            <p>Atenciosamente,<br>Equipe da Academia</p>
        </div>
    `;
    return await enviarEmail(aluno.email, subject, text, html);
};

export default {
    enviarEmail,
    enviarLembreteTreino,
    enviarLembretePagamento
};