// import { Request, Response, NextFunction, RequestHandler } from 'express';
// import jwt from 'jsonwebtoken';
// import { prisma } from '../lib/prisma';

// // Interface para o payload do token
// interface TokenPayload {
//   id: string;
//   role: string;
//   escolaId?: string;
// }

// // Declare a interface para estender o Request
// export interface RequestWithUsuario extends Request {
//   usuario: {
//     id: string;
//     role: string;
//     escolaId?: string;
//   };
// }

// // Middleware de autenticação com tipagem compatível com Express
// export const authMiddleware = async (
//   request: Request,
//   response: Response,
//   next: NextFunction
// ) => {
//   const req = request as RequestWithUsuario;
//   const { authorization } = req.headers;

//   if (!authorization) {
//     return response.status(401).json({ error: 'Token não fornecido' });
//   }

//   const token = authorization.replace('Bearer', '').trim();

//   try {
//     const data = jwt.verify(token, process.env.JWT_SECRET || 'smaipa-secret') as TokenPayload;

//     const usuario = await prisma.usuario.findUnique({
//       where: { id: data.id },
//     });

//     if (!usuario) {
//       return response.status(401).json({ error: 'Usuário não encontrado' });
//     }

//     // Armazenando os dados do usuário no request
//     req.usuario = {
//       id: data.id,
//       role: data.role,
//       escolaId: data.escolaId,
//     };

//     return next();
//   } catch (error) {
//     return response.status(401).json({ error: 'Token inválido' });
//   }
// };

// // Middleware para checar se o usuário tem a role de 'secretaria'
// export const secretariaMiddleware = (
//   request: Request,
//   response: Response,
//   next: NextFunction
// ) => {
//   const req = request as RequestWithUsuario;
//   if (req.usuario.role !== 'secretaria') {
//     return response.status(403).json({ error: 'Acesso restrito à Secretaria de Educação' });
//   }

//   return next();
// };


import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { prisma } from '../lib/prisma';

// Interface para o payload do token
interface TokenPayload {
  id: string;
  role: string;
  escolaId?: string;
}

// Estendendo o tipo Request do Express
export interface RequestWithUsuario extends Request {
  usuario: {
    id: string;
    role: string;
    escolaId?: string;
  };
}

// Middleware de autenticação
export const authMiddleware = async (
  request: Request,
  response: Response,
  next: NextFunction
) => {
  const req = request as RequestWithUsuario;
  const { authorization } = req.headers;

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

    req.usuario = {
      id: data.id,
      role: data.role,
      escolaId: data.escolaId,
    };

    return next();
  } catch (error) {
    return response.status(401).json({ error: 'Token inválido' });
  }
};

// Middleware para checar se o usuário tem a role de 'secretaria'
export const secretariaMiddleware = (
  request: Request,
  response: Response,
  next: NextFunction
) => {
  const req = request as RequestWithUsuario;

  if (req.usuario?.role !== 'secretaria') {
    return response.status(403).json({ error: 'Acesso restrito à Secretaria de Educação' });
  }

  return next();
};
