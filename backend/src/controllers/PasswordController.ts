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
      console.log('Solicitação de recuperação de senha para:', email);

      if (!email) {
        return res.status(400).json({ error: 'Email é obrigatório' });
      }

      const user = await prisma.usuario.findUnique({
        where: { email },
      });

      if (!user) {
        console.log('Usuário não encontrado:', email);
        return res.status(404).json({ error: 'Usuário não encontrado' });
      }

      // Gerar token de recuperação
      const token = crypto.randomBytes(32).toString('hex');
      const expiresAt = new Date(Date.now() + 3600000); // 1 hora
      console.log('Token gerado:', token);
      console.log('Expira em:', expiresAt);

      // Atualizar usuário com o token
      const updatedUser = await prisma.usuario.update({
        where: { id: user.id },
        data: {
          resetToken: token,
          resetTokenExpires: expiresAt,
        },
      });
      console.log('Usuário atualizado com token:', updatedUser.id);
      console.log('Dados do usuário após atualização:', {
        id: updatedUser.id,
        resetToken: updatedUser.resetToken,
        resetTokenExpires: updatedUser.resetTokenExpires
      });

      // Verificar se o token foi salvo corretamente
      const userAfterUpdate = await prisma.usuario.findUnique({
        where: { id: user.id }
      });
      console.log('Verificação do banco de dados após atualização:', {
        id: userAfterUpdate?.id,
        resetToken: userAfterUpdate?.resetToken,
        resetTokenExpires: userAfterUpdate?.resetTokenExpires
      });

      // Enviar email
      await sendPasswordRecoveryEmail(email, token);
      console.log('Email enviado com sucesso para:', email);

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
      console.log('Validando token:', token);

      if (!token) {
        return res.status(400).json({ error: 'Token é obrigatório' });
      }

      console.log('Buscando usuário com token:', token);
      const user = await prisma.usuario.findFirst({
        where: {
          resetToken: token,
          resetTokenExpires: { gt: new Date() }
        }
      });

      if (!user) {
        console.log('Token inválido ou expirado:', token);
        // Buscar usuário apenas pelo token para debug
        const userWithToken = await prisma.usuario.findFirst({
          where: { resetToken: token }
        });
        if (userWithToken) {
          console.log('Usuário encontrado com token, mas expirado:', {
            id: userWithToken.id,
            resetToken: userWithToken.resetToken,
            resetTokenExpires: userWithToken.resetTokenExpires,
            currentTime: new Date()
          });
        } else {
          console.log('Nenhum usuário encontrado com este token');
          // Buscar todos os usuários com tokens para debug
          const usersWithTokens = await prisma.usuario.findMany({
            where: {
              resetToken: { not: null }
            },
            select: {
              id: true,
              email: true,
              resetToken: true,
              resetTokenExpires: true
            }
          });
          console.log('Usuários com tokens no banco:', usersWithTokens);
        }
        return res.status(400).json({ error: 'Token inválido ou expirado' });
      }

      console.log('Token válido para usuário:', {
        id: user.id,
        resetToken: user.resetToken,
        resetTokenExpires: user.resetTokenExpires
      });
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
      console.log('Tentativa de redefinição de senha com token:', token);

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
        console.log('Token inválido ou expirado:', token);
        return res.status(400).json({ error: 'Token inválido ou expirado' });
      }

      console.log('Usuário encontrado para redefinição:', user.id);

      // Hash da nova senha
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(newPassword, salt);

      // Atualizar senha e limpar token
      const updatedUser = await prisma.usuario.update({
        where: { id: user.id },
        data: {
          senha: hashedPassword,
          resetToken: null,
          resetTokenExpires: null,
        },
      });
      console.log('Senha redefinida com sucesso para usuário:', updatedUser.id);

      return res.json({ message: 'Senha redefinida com sucesso' });
    } catch (error) {
      console.error('Erro em resetPassword:', error);
      return res.status(500).json({ error: 'Erro ao redefinir senha' });
    }
  }
}
