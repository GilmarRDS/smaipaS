import { Request, Response } from 'express';
import { prisma } from '../lib/prisma';
import crypto from 'crypto';
import bcrypt from 'bcrypt';
import { sendPasswordRecoveryEmail } from '../services/emailService';

export class PasswordController {
  /**
   * Generate a password reset token and send a recovery email
   */
  async forgotPassword(req: Request, res: Response): Promise<Response> {
    try {
      const { email } = req.body;

      if (!email) {
        return res.status(400).json({ error: 'Email é obrigatório' });
      }

      const user = await prisma.usuario.findUnique({
        where: { email },
      });

      if (!user) {
        return res.status(404).json({ error: 'Usuário não encontrado' });
      }

      // Gerar token de recuperação
      const token = crypto.randomBytes(32).toString('hex');
      const expiresAt = new Date(Date.now() + 3600000); // 1 hora

      // Atualizar usuário com o token
      await prisma.usuario.update({
        where: { id: user.id },
        data: {
          resetToken: token,
          resetTokenExpires: expiresAt,
        },
      });

      // Enviar email
      await sendPasswordRecoveryEmail(email, token);

      return res.json({ message: 'Email de recuperação enviado com sucesso' });
    } catch (error) {
      console.error('Erro em forgotPassword:', error);
      return res.status(500).json({ error: 'Erro ao processar recuperação de senha' });
    }
  }

  /**
   * Validate reset token from URL
   */
  async validateResetToken(req: Request, res: Response): Promise<Response> {
    try {
      const { token } = req.params;

      if (!token) {
        return res.status(400).json({ error: 'Token é obrigatório' });
      }

      const user = await prisma.usuario.findFirst({
        where: {
          resetToken: token,
          resetTokenExpires: { gt: new Date() }
        }
      });

      if (!user) {
        return res.status(400).json({ error: 'Token inválido ou expirado' });
      }

      return res.json({ message: 'Token válido' });
    } catch (error) {
      console.error('Erro em validateResetToken:', error);
      return res.status(500).json({ error: 'Erro ao validar token' });
    }
  }

  /**
   * Reset password using the token and new password
   */
  async resetPassword(req: Request, res: Response): Promise<Response> {
    try {
      const { token, newPassword } = req.body;

      if (!token || !newPassword) {
        return res.status(400).json({ error: 'Token e nova senha são obrigatórios' });
      }

      if (newPassword.length < 8) {
        return res.status(400).json({ error: 'A senha deve ter pelo menos 8 caracteres' });
      }

      const user = await prisma.usuario.findFirst({
        where: {
          resetToken: token,
          resetTokenExpires: { gt: new Date() }
        }
      });

      if (!user) {
        return res.status(400).json({ error: 'Token inválido ou expirado' });
      }

      // Hash da nova senha
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(newPassword, salt);

      // Atualizar senha e limpar token
      await prisma.usuario.update({
        where: { id: user.id },
        data: {
          senha: hashedPassword,
          resetToken: null,
          resetTokenExpires: null,
        },
      });

      return res.json({ message: 'Senha redefinida com sucesso' });
    } catch (error) {
      console.error('Erro em resetPassword:', error);
      return res.status(500).json({ error: 'Erro ao redefinir senha' });
    }
  }
}
