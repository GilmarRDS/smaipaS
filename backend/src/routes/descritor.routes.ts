import { Router, RequestHandler, Response, NextFunction } from 'express';
import { RequestWithUsuario } from '../types/express';
import { DescritorController } from '../controllers/DescritorController';
import { authMiddleware } from '../middlewares/auth';

const descritorRoutes = Router();
const descritorController = new DescritorController();

function asyncHandler(fn: (req: RequestWithUsuario, res: Response, next: NextFunction) => Promise<unknown>): RequestHandler {
  return (req, res, next) => {
    Promise.resolve(fn(req as RequestWithUsuario, res, next)).catch(next);
  };
}

// Aplicando o middleware de autenticação em todas as rotas
descritorRoutes.use(authMiddleware);

descritorRoutes.get('/', asyncHandler((req, res) => descritorController.listarTodos(req, res)));
descritorRoutes.get('/:id', asyncHandler((req, res) => descritorController.buscarPorId(req, res)));
descritorRoutes.post('/', asyncHandler((req, res) => descritorController.criar(req, res)));
descritorRoutes.put('/:id', asyncHandler((req, res) => descritorController.atualizar(req, res)));
descritorRoutes.delete('/:id', asyncHandler((req, res) => descritorController.deletar(req, res)));

export { descritorRoutes }; 