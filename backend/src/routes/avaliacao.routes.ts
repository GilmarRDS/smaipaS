import { Router, RequestHandler } from 'express';
import { AvaliacaoController } from '../controllers/AvaliacaoController';
import { authMiddleware } from '../middlewares/auth';
import { asyncHandler } from '../utils/asyncHandler';
import { RequestWithUsuario } from '../types/express';

const avaliacaoRoutes = Router();
const avaliacaoController = new AvaliacaoController();

// Aplicar middleware de autenticação em todas as rotas
avaliacaoRoutes.use(authMiddleware as RequestHandler);

// Rotas de avaliação
avaliacaoRoutes.post('/', asyncHandler((req: RequestWithUsuario, res) => avaliacaoController.criar(req, res)) as RequestHandler);
avaliacaoRoutes.get('/', asyncHandler((req: RequestWithUsuario, res) => avaliacaoController.listarTodas(req, res)) as RequestHandler);
avaliacaoRoutes.get('/:id', asyncHandler((req: RequestWithUsuario, res) => avaliacaoController.buscarPorId(req, res)) as RequestHandler);
avaliacaoRoutes.put('/:id', asyncHandler((req: RequestWithUsuario, res) => avaliacaoController.atualizar(req, res)) as RequestHandler);
avaliacaoRoutes.delete('/:id', asyncHandler((req: RequestWithUsuario, res) => avaliacaoController.deletar(req, res)) as RequestHandler);

// Rotas específicas
avaliacaoRoutes.get('/turma/:turmaId', asyncHandler((req: RequestWithUsuario, res) => avaliacaoController.listarPorTurma(req, res)) as RequestHandler);
avaliacaoRoutes.get('/ano/:ano', asyncHandler((req: RequestWithUsuario, res) => avaliacaoController.listarPorAno(req, res)) as RequestHandler);
avaliacaoRoutes.get('/ano/:ano/componente/:componente', asyncHandler((req: RequestWithUsuario, res) => avaliacaoController.listarPorAnoEComponente(req, res)) as RequestHandler);
avaliacaoRoutes.get('/relatorios/dados', asyncHandler((req: RequestWithUsuario, res) => avaliacaoController.obterDadosRelatorios(req, res)) as RequestHandler);

// Rotas de gabarito
avaliacaoRoutes.get('/:id/gabarito', asyncHandler((req: RequestWithUsuario, res) => avaliacaoController.obterGabarito(req, res)) as RequestHandler);
avaliacaoRoutes.put('/:id/gabarito', asyncHandler((req: RequestWithUsuario, res) => avaliacaoController.atualizarGabarito(req, res)) as RequestHandler);

export { avaliacaoRoutes };
