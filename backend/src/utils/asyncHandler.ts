import { Request, Response, NextFunction, RequestHandler } from 'express';
import { RequestWithUsuario } from '../types/express';

type AsyncFunction = (req: RequestWithUsuario, res: Response, next: NextFunction) => Promise<void>;

export const asyncHandler = (fn: AsyncFunction): RequestHandler => (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  Promise.resolve(fn(req as RequestWithUsuario, res, next)).catch(next);
};
