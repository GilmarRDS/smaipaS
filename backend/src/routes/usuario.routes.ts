import { Router, RequestHandler, Response, NextFunction } from 'express';
import { RequestWithUsuario } from '../types/express';
import { UsuarioController } from '../controllers/UsuarioController';

const usuarioRoutes = Router();
const usuarioController = new UsuarioController();

function asyncHandler(fn: (req: RequestWithUsuario, res: Response, next: NextFunction) => Promise<unknown>): RequestHandler {
  return (req, res, next) => {
    Promise.resolve(fn(req as RequestWithUsuario, res, next)).catch(next);
  };
}

usuarioRoutes.post('/login', asyncHandler((req, res) => usuarioController.login(req, res)));
usuarioRoutes.post('/', asyncHandler((req, res) => usuarioController.criar(req, res)));
usuarioRoutes.get('/', asyncHandler((req, res) => usuarioController.listarTodos(req, res)));
usuarioRoutes.get('/:id', asyncHandler((req, res) => usuarioController.buscarPorId(req, res)));
usuarioRoutes.put('/:id', asyncHandler((req, res) => usuarioController.atualizar(req, res)));
usuarioRoutes.delete('/:id', asyncHandler((req, res) => usuarioController.deletar(req, res)));

export { usuarioRoutes };
