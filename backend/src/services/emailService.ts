import * as nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: Number(process.env.EMAIL_PORT) || 587,
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
  connectionTimeout: 30000, // timeout de conexão em milissegundos
  greetingTimeout: 30000,   // timeout para o greeting SMTP
  socketTimeout: 30000      // timeout para operações de socket
});

/**
 * Envia um email de recuperação de senha para o usuário
 * @param to Email do destinatário
 * @param token Token de recuperação de senha
 * @returns Promise que resolve quando o email for enviado
 */
import { prisma } from '../lib/prisma';

export async function sendPasswordResetEmail(to: string, token: string): Promise<void> {
  try {
    // Verifica se o email existe no banco de dados
    const user = await prisma.usuario.findUnique({ where: { email: to } });
    if (!user) {
      console.log(`Tentativa de envio de email para endereço não cadastrado: ${to}`);
      throw new Error('Email não cadastrado');
    }

    const resetUrl = `${process.env.FRONTEND_URL}/recuperar-senha?token=${token}`;

    const mailOptions = {
      from: `"No Reply" <${process.env.EMAIL_USER}>`,
      to,
      subject: 'Recuperação de senha',
      html: `
        <p>Você solicitou a recuperação de senha.</p>
        <p>Clique no link abaixo para redefinir sua senha:</p>
        <a href="${resetUrl}">${resetUrl}</a>
        <p>Se você não solicitou, ignore este email.</p>
      `
    };

    await transporter.sendMail(mailOptions);
    console.log(`Email de recuperação enviado para: ${to}`);
  } catch (error) {
    console.error(`Erro ao enviar email de recuperação para ${to}:`, error);
    throw error;
  }
}

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