import { Request, Response, NextFunction, RequestHandler } from 'express';
import { RequestWithUsuario } from '../types/express';

type AsyncFunction = (req: RequestWithUsuario, res: Response) => Promise<any>;

export const asyncHandler = (fn: AsyncFunction): RequestHandler => (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  Promise.resolve(fn(req as RequestWithUsuario, res)).catch(next);
}; 