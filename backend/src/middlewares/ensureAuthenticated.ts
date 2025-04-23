import { Request, Response, NextFunction } from 'express';
import { authMiddleware } from './auth';
import { RequestWithUsuario } from '../types/express';

function asyncHandler(
  fn: (req: Request, res: Response, next: NextFunction) => Promise<unknown>
) {
  return (req: Request, res: Response, next: NextFunction) => {
    fn(req, res, next).catch(next);
  };
}

export const ensureAuthenticated = asyncHandler(authMiddleware);
