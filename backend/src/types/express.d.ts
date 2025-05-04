import 'express';

declare module 'express' {
  export interface Request {
    usuario?: {
      id: string;
      role: string;
      escolaId?: string;
    };
  }
}
