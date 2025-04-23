import { Router, RequestHandler, Response, NextFunction } from 'express';
import { RequestWithUsuario } from '../types/express';
import { AvaliacaoController } from '../controllers/AvaliacaoController';

const avaliacaoRoutes = Router();
const avaliacaoController = new AvaliacaoController();

function asyncHandler(fn: (req: RequestWithUsuario, res: Response) => Promise<unknown>): RequestHandler {
  return (req, res, next) => {
    Promise.resolve(fn(req as RequestWithUsuario, res)).catch(next);
  };
}

avaliacaoRoutes.post('/', asyncHandler((req, res) => avaliacaoController.criar(req, res)));
avaliacaoRoutes.get('/', asyncHandler((req, res) => avaliacaoController.listarTodas(req, res)));
avaliacaoRoutes.get('/:id', asyncHandler((req, res) => avaliacaoController.buscarPorId(req, res)));
avaliacaoRoutes.put('/:id', asyncHandler((req, res) => avaliacaoController.atualizar(req, res)));
avaliacaoRoutes.delete('/:id', asyncHandler((req, res) => avaliacaoController.deletar(req, res)));

export { avaliacaoRoutes };
