// import { Request, Response, NextFunction, RequestHandler } from 'express';
// import { authMiddleware } from './auth';
// import { RequestWithUsuario } from '../types/express';

// function asyncHandler(
//   fn: (req: Request, res: Response, next: NextFunction) => Promise<unknown>
// ): RequestHandler {
//   return (req: Request, res: Response, next: NextFunction) => {
//     fn(req, res, next).catch(next);
//   };
// }

// export const ensureAuthenticated = asyncHandler(authMiddleware);
import { Request, Response, NextFunction, RequestHandler } from 'express';
import { authMiddleware } from './auth';
import { RequestWithUsuario } from '../types/express';  // Certifique-se de importar de onde o `RequestWithUsuario` está localizado

// Função para tratar middlewares assíncronos e capturar erros automaticamente
function asyncHandler<
  Req extends Request = Request,
  Res extends Response = Response
>(
  fn: (req: Req, res: Res, next: NextFunction) => Promise<unknown>
): RequestHandler {
  return (req, res, next) => {
    void fn(req as Req, res as Res, next).catch(next);
  };
}

// Definição do middleware de autenticação
export const ensureAuthenticated = asyncHandler<RequestWithUsuario>(authMiddleware);
