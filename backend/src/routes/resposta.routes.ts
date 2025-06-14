import { Router, RequestHandler, Response, NextFunction } from 'express';
import { RequestWithUsuario } from '../types/express';
import { RespostaController } from '../controllers/RespostaController';
import { ensureAuthenticated } from '../middlewares/ensureAuthenticated';

const respostaRoutes = Router();
const respostaController = new RespostaController();

function asyncHandler(fn: (req: RequestWithUsuario, res: Response, next: NextFunction) => Promise<unknown>): RequestHandler {
  return (req, res, next) => {
    Promise.resolve(fn(req as RequestWithUsuario, res, next)).catch(next);
  };
}

respostaRoutes.use(ensureAuthenticated);

respostaRoutes.post('/', asyncHandler((req, res) => respostaController.criar(req, res)));
respostaRoutes.get('/', asyncHandler((req, res) => respostaController.listarTodas(req, res)));
respostaRoutes.get('/:id', asyncHandler((req, res) => respostaController.buscarPorId(req, res)));
respostaRoutes.put('/:id', asyncHandler((req, res) => respostaController.atualizar(req, res)));
respostaRoutes.delete('/:id', asyncHandler((req, res) => respostaController.deletar(req, res)));

export { respostaRoutes };
