import { Request, Response } from 'express';
import { prisma } from '../lib/prisma';
import crypto from 'crypto';
import bcrypt from 'bcrypt';
import { sendPasswordResetEmail } from '../services/emailService';

export class PasswordController {
  /**
   * Generate a password reset token and send a recovery email
   */
  async forgotPassword(req: Request, res: Response): Promise<Response> {
    try {
      const { email } = req.body;

      if (!email) {
        return res.status(400).send({ message: 'Email is required' });
      }

      // Find user by email
      const user = await prisma.usuario.findUnique({ where: { email } });
      
      // For security, don't reveal if a user exists or not
      if (!user) {
        console.log(`Password reset requested for non-existent email: ${email}`);
        // Send the same response as if the user exists to prevent email enumeration
        return res.status(200).send({ 
          message: 'If a user with that email exists, a password reset link has been sent.' 
        });
      }

      // Generate a random token with 32 bytes (64 hex characters)
      const resetToken = crypto.randomBytes(32).toString('hex');
      
      // Hash the token for database storage
      const hashedToken = crypto
        .createHash('sha256')
        .update(resetToken)
        .digest('hex');

      // Set token expiration (1 hour from now)
      const expiresAt = new Date();
      expiresAt.setHours(expiresAt.getHours() + 1);

      // Save token to user record
      await prisma.usuario.update({
        where: { email },
        data: {
          resetToken: hashedToken,
          resetTokenExpires: expiresAt,
        },
      });

      // Use email service to send reset email
      await sendPasswordResetEmail(email, resetToken);

      console.log(`Password reset email sent to: ${email}`);
      return res.status(200).send({ 
        message: 'If a user with that email exists, a password reset link has been sent.' 
      });
    } catch (error) {
      console.error('Error in forgotPassword:', error);
      return res.status(500).send({ 
        message: 'An error occurred while processing your request.' 
      });
    }
  }

  /**
   * Validate reset token from URL
   */
  async validateResetToken(req: Request, res: Response): Promise<Response> {
    try {
      const { token } = req.params;

      if (!token) {
        return res.status(400).send({ message: 'Token is required' });
      }

      // Hash the token from the URL to compare with the hashed token in the database
      const hashedToken = crypto
        .createHash('sha256')
        .update(token)
        .digest('hex');

      // Find user with this token that hasn't expired
      const user = await prisma.usuario.findFirst({
        where: {
          resetToken: hashedToken,
          resetTokenExpires: { gt: new Date() } // Token hasn't expired yet
        }
      });

      if (!user) {
        return res.status(400).send({ message: 'Invalid or expired token.' });
      }

      return res.status(200).send({ message: 'Token is valid.' });
    } catch (error) {
      console.error('Error in validateResetToken:', error);
      return res.status(500).send({ 
        message: 'An error occurred while validating the token.' 
      });
    }
  }

  /**
   * Reset password using the token and new password
   */
  async resetPassword(req: Request, res: Response): Promise<Response> {
    try {
      const { token, newPassword } = req.body;

      if (!token || !newPassword) {
        return res.status(400).send({ 
          message: 'Token and new password are required.' 
        });
      }

      // Password validation
      if (newPassword.length < 8) {
        return res.status(400).send({ 
          message: 'Password must be at least 8 characters long.' 
        });
      }

      // Hash the token to compare with the stored hashed token
      const hashedToken = crypto
        .createHash('sha256')
        .update(token)
        .digest('hex');

      // Find user with this token that hasn't expired
      const user = await prisma.usuario.findFirst({
        where: {
          resetToken: hashedToken,
          resetTokenExpires: { gt: new Date() } // Token hasn't expired yet
        }
      });

      if (!user) {
        return res.status(400).send({ message: 'Invalid or expired token.' });
      }

      // Hash the new password
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(newPassword, salt);

      // Update user's password and clear reset token
      await prisma.usuario.update({
        where: { id: user.id },
        data: {
          senha: hashedPassword,
          resetToken: null,
          resetTokenExpires: null,
        },
      });

      // Could send confirmation email here
      
      console.log(`Password reset successful for user: ${user.email}`);
      return res.status(200).send({ message: 'Password has been reset successfully.' });
    } catch (error) {
      console.error('Error in resetPassword:', error);
      return res.status(500).send({ 
        message: 'An error occurred while resetting the password.' 
      });
    }
  }
}
