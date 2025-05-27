import { Request, Response, NextFunction } from 'express';
import { RequestWithUsuario } from '../types/express';

// Extend Express Request type to include usuario
// declare module 'express' {
//   interface Request {
//     usuario?: {
//       id: number;
//       nome: string;
//       email: string;
//       tipo: string;
//     };
//   }
// }

type AsyncFunction = (
  req: RequestWithUsuario,
  res: Response,
  next: NextFunction
) => Promise<Response | void>;

export const asyncHandler = (fn: AsyncFunction) => (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  Promise.resolve(fn(req as RequestWithUsuario, res, next)).catch(next);
};
