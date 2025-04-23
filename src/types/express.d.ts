import { Usuario } from './user'; // ajuste o caminho conforme necessário
import { Request as ExpressRequest } from 'express';

declare global {
  namespace Express {
    interface Request {
      usuario?: Usuario;
    }
  }
}

export interface RequestWithUsuario extends ExpressRequest {
  usuario: Usuario;
}
