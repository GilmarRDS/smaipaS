import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { prisma } from '../lib/prisma';

interface TokenPayload {
  id: string;
  role: string;
  escolaId?: string;
}

// Declare a interface para estender o Request
export interface RequestWithUsuario extends Request {
  usuario: {
    id: string;
    role: string;
    escolaId?: string;
  };
}

export const authMiddleware = async (
  request: RequestWithUsuario,
  response: Response,
  next: NextFunction
) => {
  const { authorization } = request.headers;

  if (!authorization) {
    return response.status(401).json({ error: 'Token não fornecido' });
  }

  const token = authorization.replace('Bearer', '').trim();

  try {
    const data = jwt.verify(token, process.env.JWT_SECRET || 'smaipa-secret') as TokenPayload;

    const usuario = await prisma.usuario.findUnique({
      where: { id: data.id },
    });

    if (!usuario) {
      return response.status(401).json({ error: 'Usuário não encontrado' });
    }

    request.usuario = {
      id: data.id,
      role: data.role,
      escolaId: data.escolaId,
    };

    return next();
  } catch (error) {
    return response.status(401).json({ error: 'Token inválido' });
  }
};

export const secretariaMiddleware = (
  request: RequestWithUsuario,
  response: Response,
  next: NextFunction
) => {
  if (request.usuario.role !== 'secretaria') {
    return response.status(403).json({ error: 'Acesso restrito à Secretaria de Educação' });
  }

  return next();
};