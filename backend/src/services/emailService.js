// backend/src/services/emailService.js
const nodemailer = require('nodemailer');

// Configuração do transporter do Nodemailer (isso pode ser movido para variáveis de ambiente)
const transporter = nodemailer.createTransport({
    service: 'gmail', // Pode ser alterado para outros serviços
    auth: {
        user: process.env.EMAIL_USER || 'academia@exemplo.com', 
        pass: process.env.EMAIL_PASS || 'senha_do_email'
    }
});

/**
 * Envia um e-mail para um destinatário específico
 * @param {string} to E-mail do destinatário 
 * @param {string} subject Assunto do e-mail
 * @param {string} text Conteúdo de texto puro
 * @param {string} html Conteúdo HTML (opcional)
 * @returns {Promise} Promessa resolvida ou rejeitada com o resultado
 */
exports.enviarEmail = async (to, subject, text, html) => {
    try {
        const mailOptions = {
            from: process.env.EMAIL_USER || 'academia@exemplo.com',
            to,
            subject,
            text,
            html: html || text,
        };

        const info = await transporter.sendMail(mailOptions);
        console.log('E-mail enviado com sucesso:', info.messageId);
        return { success: true, messageId: info.messageId };
    } catch (error) {
        console.error('Erro ao enviar e-mail:', error);
        return { success: false, error };
    }
};

/**
 * Envia um e-mail de lembrete de treino para um aluno
 * @param {object} aluno Dados do aluno
 * @param {object} treino Dados do treino
 * @returns {Promise} Promessa resolvida ou rejeitada com o resultado
 */
exports.enviarLembreteTreino = async (aluno, treino) => {
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
    
    return await exports.enviarEmail(aluno.email, subject, text, html);
};

/**
 * Envia um e-mail de lembrete de pagamento para um aluno
 * @param {object} aluno Dados do aluno
 * @param {object} pagamento Dados do pagamento
 * @returns {Promise} Promessa resolvida ou rejeitada com o resultado
 */
exports.enviarLembretePagamento = async (aluno, pagamento) => {
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
    
    return await exports.enviarEmail(aluno.email, subject, text, html);
};