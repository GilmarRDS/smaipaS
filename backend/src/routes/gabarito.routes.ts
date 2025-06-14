import { Router, RequestHandler, Response, NextFunction } from 'express';
import { RequestWithUsuario } from '../types/express';
import { GabaritoController } from '../controllers/GabaritoController';

const gabaritoRoutes = Router();
const gabaritoController = new GabaritoController();

function asyncHandler(fn: (req: RequestWithUsuario, res: Response, next: NextFunction) => Promise<unknown>): RequestHandler {
  return (req, res, next) => {
    Promise.resolve(fn(req as RequestWithUsuario, res, next)).catch(next);
  };
}

gabaritoRoutes.post('/', asyncHandler((req, res) => gabaritoController.criar(req, res)));
gabaritoRoutes.get('/', asyncHandler((req, res) => gabaritoController.listarTodos(req, res)));
gabaritoRoutes.get('/avaliacao/:avaliacaoId', asyncHandler((req, res) => gabaritoController.listarPorAvaliacao(req, res)));
gabaritoRoutes.get('/:id', asyncHandler((req, res) => gabaritoController.buscarPorId(req, res)));
gabaritoRoutes.put('/:id', asyncHandler((req, res) => gabaritoController.atualizar(req, res)));
gabaritoRoutes.delete('/:id', asyncHandler((req, res) => gabaritoController.deletar(req, res)));

export { gabaritoRoutes };
