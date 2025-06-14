import { Router, RequestHandler, Response, NextFunction } from 'express';
import { RequestWithUsuario } from '../types/express';
import { DescritorController } from '../controllers/DescritorController';
import { authMiddleware } from '../middlewares/auth';

const descritorRoutes = Router();
const descritorController = new DescritorController();

function asyncHandler(fn: (req: RequestWithUsuario, res: Response, next: NextFunction) => Promise<void | Response>): RequestHandler {
  return (req, res, next) => {
    Promise.resolve(fn(req as RequestWithUsuario, res, next)).catch(next);
  };
}

// Aplicando o middleware de autenticação em todas as rotas
descritorRoutes.use(asyncHandler(authMiddleware));

descritorRoutes.get('/', asyncHandler(async (req, res) => {
  await descritorController.listarTodos(req, res);
}));

descritorRoutes.get('/componente/:componente', asyncHandler(async (req, res) => {
  await descritorController.listarPorComponente(req, res);
}));

descritorRoutes.get('/:id', asyncHandler(async (req, res) => {
  await descritorController.buscarPorId(req, res);
}));

descritorRoutes.post('/', asyncHandler(async (req, res) => {
  await descritorController.criar(req, res);
}));

descritorRoutes.put('/:id', asyncHandler(async (req, res) => {
  await descritorController.atualizar(req, res);
}));

descritorRoutes.delete('/:id', asyncHandler(async (req, res) => {
  await descritorController.deletar(req, res);
}));

export { descritorRoutes }; 