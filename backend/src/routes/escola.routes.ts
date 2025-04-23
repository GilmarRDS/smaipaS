import { Router, RequestHandler, Response, NextFunction } from 'express';
import { RequestWithUsuario } from '../types/express';
import { EscolaController } from '../controllers/EscolaController';

const escolaRoutes = Router();
const escolaController = new EscolaController();

function asyncHandler(fn: (req: RequestWithUsuario, res: Response, next: NextFunction) => Promise<unknown>): RequestHandler {
  return (req, res, next) => {
    Promise.resolve(fn(req as RequestWithUsuario, res, next)).catch(next);
  };
}

escolaRoutes.post('/', asyncHandler((req, res) => escolaController.criar(req, res)));
escolaRoutes.get('/', asyncHandler((req, res) => escolaController.listarTodas(req, res)));
escolaRoutes.get('/:id', asyncHandler((req, res) => escolaController.buscarPorId(req, res)));
escolaRoutes.put('/:id', asyncHandler((req, res) => escolaController.atualizar(req, res)));
escolaRoutes.delete('/:id', asyncHandler((req, res) => escolaController.deletar(req, res)));

export { escolaRoutes };
