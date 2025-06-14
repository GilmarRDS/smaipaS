import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { prisma } from '../lib/prisma';

// Interface para o payload do token
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

// Lista de rotas públicas que não precisam de autenticação
const publicRoutes = [
  '/usuarios/login',
  '/usuarios/recuperar-senha',
  '/usuarios/resetar-senha',
  '/usuarios/validar-token',
  '/redefinir-senha',
  '/favicon.ico'
];

// Middleware de autenticação
export const authMiddleware = async (
  request: Request,
  response: Response,
  next: NextFunction
) => {
  const req = request as RequestWithUsuario;

  // Log para debug
  console.log('Rota acessada:', req.originalUrl);
  console.log('Headers recebidos:', req.headers);

  // Verifica se a rota é pública
  const isPublicRoute = publicRoutes.some(route => req.originalUrl.includes(route));
  if (isPublicRoute) {
    console.log('Rota pública detectada, permitindo acesso');
    return next();
  }

  const { authorization } = req.headers;

  if (!authorization) {
    console.log('Token não fornecido nos headers');
    return response.status(401).json({ error: 'Token não fornecido' });
  }

  // Verifica se o formato do token está correto
  if (!authorization.startsWith('Bearer ')) {
    console.log('Formato do token inválido:', authorization);
    return response.status(401).json({ error: 'Formato do token inválido' });
  }

  const token = authorization.replace('Bearer ', '').trim();
  console.log('Token extraído:', token);

  try {
    const data = jwt.verify(token, process.env.JWT_SECRET || 'smaipa-secret') as TokenPayload;
    console.log('Token decodificado:', data);

    const usuario = await prisma.usuario.findUnique({
      where: { id: data.id },
      include: {
        escola: true
      }
    });

    if (!usuario) {
      console.log('Usuário não encontrado:', data.id);
      return response.status(401).json({ error: 'Usuário não encontrado' });
    }

    // Armazenando os dados do usuário no request
    req.usuario = {
      id: usuario.id,
      role: usuario.role,
      escolaId: usuario.escolaId ?? undefined,
    };

    // Log para debug do objeto usuario no request
    console.log('Objeto usuario no request:', req.usuario);

    console.log('Autenticação bem-sucedida para usuário:', {
      id: usuario.id,
      role: usuario.role,
      escolaId: usuario.escolaId
    });
    return next();
  } catch (error) {
    console.error('Erro na autenticação:', error);
    
    if (error instanceof jwt.TokenExpiredError) {
      return response.status(401).json({ error: 'Token expirado' });
    }
    if (error instanceof jwt.JsonWebTokenError) {
      return response.status(401).json({ error: 'Token inválido' });
    }
    return response.status(401).json({ error: 'Erro na autenticação' });
  }
};

// Middleware para checar se o usuário tem a role de 'secretaria'
export const secretariaMiddleware = (
  request: Request,
  response: Response,
  next: NextFunction
) => {
  const req = request as RequestWithUsuario;

  if (!req.usuario) {
    return response.status(401).json({ error: 'Usuário não autenticado' });
  }

  if (req.usuario.role !== 'secretaria') {
    return response.status(403).json({ error: 'Acesso restrito à Secretaria de Educação' });
  }

  return next();
};
