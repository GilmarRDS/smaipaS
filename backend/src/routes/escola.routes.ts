import { Router, RequestHandler, Response, NextFunction } from 'express';
import { RequestWithUsuario } from '../types/express';
import { EscolaController } from '../controllers/EscolaController';
import { AlunoController } from '../controllers/AlunoController';
import { authMiddleware } from '../middlewares/auth';

const escolaRoutes = Router();
const escolaController = new EscolaController();
const alunoController = new AlunoController();

function asyncHandler(fn: (req: RequestWithUsuario, res: Response, next: NextFunction) => Promise<void | Response>): RequestHandler {
  return (req, res, next) => {
    Promise.resolve(fn(req as RequestWithUsuario, res, next)).catch(next);
  };
}

// Aplicando o middleware de autenticação em todas as rotas
escolaRoutes.use(asyncHandler(authMiddleware));

escolaRoutes.post('/', asyncHandler(async (req, res) => {
  await escolaController.criar(req, res);
}));

escolaRoutes.get('/', asyncHandler(async (req, res) => {
  await escolaController.listarTodas(req, res);
}));

escolaRoutes.get('/:id', asyncHandler(async (req, res) => {
  await escolaController.buscarPorId(req, res);
}));

escolaRoutes.get('/:id/turmas', asyncHandler(async (req, res) => {
  await escolaController.listarTurmas(req, res);
}));

escolaRoutes.get('/:id/alunos', asyncHandler(async (req, res) => {
  await alunoController.listarTodos(req, res);
}));

escolaRoutes.put('/:id', asyncHandler(async (req, res) => {
  await escolaController.atualizar(req, res);
}));

escolaRoutes.delete('/:id', asyncHandler(async (req, res) => {
  await escolaController.deletar(req, res);
}));

export { escolaRoutes };
