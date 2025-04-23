import 'express-serve-static-core';

declare module 'express-serve-static-core' {
  interface Request {
    usuario: {
      id: string;
      role: string;
      escolaId?: string;
    };
  }
}

