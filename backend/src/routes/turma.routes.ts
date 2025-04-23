import { Router, RequestHandler, Response, NextFunction } from 'express';
import { RequestWithUsuario } from '../types/express';
import { TurmaController } from '../controllers/TurmaController';

const turmaRoutes = Router();
const turmaController = new TurmaController();

function asyncHandler(fn: (req: RequestWithUsuario, res: Response, next: NextFunction) => Promise<unknown>): RequestHandler {
  return (req, res, next) => {
    Promise.resolve(fn(req as RequestWithUsuario, res, next)).catch(next);
  };
}

turmaRoutes.post('/', asyncHandler((req, res) => turmaController.criar(req, res)));
turmaRoutes.get('/', asyncHandler((req, res) => turmaController.listarTodas(req, res)));
turmaRoutes.get('/:id', asyncHandler((req, res) => turmaController.buscarPorId(req, res)));
turmaRoutes.put('/:id', asyncHandler((req, res) => turmaController.atualizar(req, res)));
turmaRoutes.delete('/:id', asyncHandler((req, res) => turmaController.deletar(req, res)));

export { turmaRoutes };
