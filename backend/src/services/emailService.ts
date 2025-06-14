import nodemailer from 'nodemailer';
import { config } from '../config';

// Criar objeto de transporte reutilizável usando transporte SMTP
const transporter = nodemailer.createTransport({
  host: config.email.host,
  port: config.email.port,
  secure: config.email.port === 465,
  auth: {
    user: config.email.user,
    pass: config.email.pass,
  },
});

// Verificar configuração do transporter
transporter.verify((error, success) => {
  if (error) {
    console.error('Erro na configuração do serviço de email:', error);
  } else {
    console.log('Serviço de email está pronto para enviar mensagens');
  }
});

/**
 * Envia um email de recuperação de senha para o usuário
 * @param to Email do destinatário
 * @param token Token de recuperação de senha
 * @returns Promise que resolve quando o email for enviado
 */
import { prisma } from '../lib/prisma';

export const sendPasswordRecoveryEmail = async (email: string, token: string) => {
  try {
    console.log('Iniciando envio de email de recuperação para:', email);
    console.log('Configurações de email:', {
      host: config.email.host,
      port: config.email.port,
      user: config.email.user,
      secure: config.email.port === 465
    });

    // Usar a URL do frontend da configuração
    const resetUrl = `${config.frontend.url}/redefinir-senha?token=${token}`;
    console.log('URL de redefinição de senha:', resetUrl);

    const mailOptions = {
      from: `"SMAIPA" <${config.email.user}>`,
      to: email,
      subject: 'Recuperação de Senha - SMAIPA',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 5px;">
          <h2 style="color: #2c3e50; text-align: center; margin-bottom: 30px;">Recuperação de Senha</h2>
          
          <p style="color: #34495e; font-size: 16px; line-height: 1.6;">Olá,</p>
          
          <p style="color: #34495e; font-size: 16px; line-height: 1.6;">
            Recebemos uma solicitação para redefinir a senha da sua conta no SMAIPA.
          </p>
          
          <p style="color: #34495e; font-size: 16px; line-height: 1.6;">
            Para prosseguir com a redefinição de senha, clique no botão abaixo:
          </p>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${resetUrl}" 
               style="display: inline-block; padding: 12px 24px; background-color: #3498db; color: white; text-decoration: none; border-radius: 5px; font-weight: bold;">
              Redefinir Minha Senha
            </a>
          </div>
          
          <p style="color: #7f8c8d; font-size: 14px; line-height: 1.6;">
            Se você não solicitou esta recuperação de senha, por favor ignore este e-mail.
          </p>
          
          <p style="color: #7f8c8d; font-size: 14px; line-height: 1.6;">
            Este link é válido por 1 hora.
          </p>
          
          <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
          
          <p style="color: #7f8c8d; font-size: 14px; line-height: 1.6; text-align: center;">
            Atenciosamente,<br>
            <strong>Equipe SMAIPA</strong>
          </p>
        </div>
      `,
    };

    console.log('Enviando email com as opções:', {
      from: mailOptions.from,
      to: mailOptions.to,
      subject: mailOptions.subject
    });

    const info = await transporter.sendMail(mailOptions);
    console.log('Email de recuperação de senha enviado:', info.messageId);
    return true;
  } catch (error) {
    console.error('Erro ao enviar email de recuperação de senha:', error);
    throw new Error('Falha ao enviar email de recuperação de senha');
  }
};

/**
 * Envia um email de boas-vindas para um novo usuário
 * @param to Email do destinatário
 * @param name Nome do usuário
 */
export async function sendWelcomeEmail(to: string, name: string): Promise<void> {
  try {
    const loginUrl = `${process.env.FRONTEND_URL}/login`;

    const mailOptions = {
      from: `"SMAIPA" <${process.env.SMTP_USER}>`,
      to,
      subject: 'Bem-vindo ao SMAIPA',
      html: `
        <h1>Olá, ${name}!</h1>
        <p>Bem-vindo ao SMAIPA. Estamos felizes em tê-lo conosco.</p>
        <p>Você pode acessar sua conta através do link abaixo:</p>
        <a href="${loginUrl}">Acessar minha conta</a>
        <p>Se você tiver alguma dúvida, entre em contato com nossa equipe de suporte.</p>
        <p>Atenciosamente,<br>Equipe SMAIPA</p>
      `
    };

    await transporter.sendMail(mailOptions);
    console.log(`Email de boas-vindas enviado para: ${to}`);
  } catch (error) {
    console.error(`Erro ao enviar email de boas-vindas para ${to}:`, error);
    throw new Error('Falha ao enviar email de boas-vindas');
  }
}

/**
 * Envia uma notificação para o usuário
 * @param to Email do destinatário
 * @param subject Assunto da notificação
 * @param message Mensagem da notificação
 */
export async function sendNotificationEmail(to: string, subject: string, message: string): Promise<void> {
  try {
    const mailOptions = {
      from: `"SMAIPA" <${process.env.SMTP_USER}>`,
      to,
      subject,
      html: `
        <h2>${subject}</h2>
        <p>${message}</p>
        <p>Atenciosamente,<br>Equipe SMAIPA</p>
      `
    };

    await transporter.sendMail(mailOptions);
    console.log(`Email de notificação enviado para: ${to}`);
  } catch (error) {
    console.error(`Erro ao enviar email de notificação para ${to}:`, error);
    throw new Error('Falha ao enviar email de notificação');
  }
}

// Função para testar a conexão com o servidor SMTP
export async function testEmailConnection(): Promise<boolean> {
  try {
    await transporter.verify();
    console.log('Conexão com servidor SMTP estabelecida com sucesso');
    return true;
  } catch (error) {
    console.error('Falha na conexão com servidor SMTP:', error);
    return false;
  }
}