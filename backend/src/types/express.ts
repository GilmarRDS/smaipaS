import { Request } from 'express';

export interface RequestWithUsuario extends Request {
  usuario: {
    id: string;
    role: string;
    escolaId?: string;
  };
}
