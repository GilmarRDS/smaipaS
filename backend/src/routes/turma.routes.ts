import { Router, RequestHandler } from 'express';
import { TurmaController } from '../controllers/TurmaController';
import { authMiddleware } from '../middlewares/auth';
import { asyncHandler } from '../utils/asyncHandler';
import { RequestWithUsuario } from '../types/express';
import { AlunoController } from '../controllers/AlunoController';

const turmaRoutes = Router();
const turmaController = new TurmaController();
const alunoController = new AlunoController();

turmaRoutes.use(authMiddleware as RequestHandler);

turmaRoutes.post('/', asyncHandler((req, res) => turmaController.criar(req, res)));
turmaRoutes.get('/', asyncHandler((req, res) => turmaController.listarTodas(req, res)));
turmaRoutes.get('/:id', asyncHandler((req, res) => turmaController.buscarPorId(req, res)));
turmaRoutes.put('/:id', asyncHandler((req, res) => turmaController.atualizar(req, res)));
turmaRoutes.delete('/:id', asyncHandler((req, res) => turmaController.deletar(req, res)));

turmaRoutes.get('/:turmaId/alunos', asyncHandler((req, res) => alunoController.listarTodos(req, res)));

export { turmaRoutes };
