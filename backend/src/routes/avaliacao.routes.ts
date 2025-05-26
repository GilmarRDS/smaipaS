import { Router, RequestHandler, Response, NextFunction } from 'express';
import { RequestWithUsuario } from '../types/express';
import { AvaliacaoController } from '../controllers/AvaliacaoController';
import { authMiddleware } from '../middlewares/auth';
import { asyncHandler } from '../utils/asyncHandler';

const avaliacaoRoutes = Router();
const avaliacaoController = new AvaliacaoController();

// Aplicando o middleware de autenticação em todas as rotas
avaliacaoRoutes.use(authMiddleware);

function asyncHandler(fn: (req: RequestWithUsuario, res: Response) => Promise<unknown>): RequestHandler {
  return (req, res, next) => {
    Promise.resolve(fn(req as RequestWithUsuario, res)).catch(next);
  };
}

avaliacaoRoutes.post('/', asyncHandler((req, res) => avaliacaoController.criar(req, res)));
avaliacaoRoutes.get('/', asyncHandler((req, res) => avaliacaoController.listarTodas(req, res)));

// Novas rotas para corrigir erros 404
avaliacaoRoutes.get('/turma/:turmaId', asyncHandler((req, res) => avaliacaoController.listarPorTurma(req, res)));
// Corrigir rota para listar avaliações por escola usando listarTodas com filtro escolaId
avaliacaoRoutes.get('/escola/:escolaId', asyncHandler((req, res) => {
  req.query.escolaId = req.params.escolaId;
  return avaliacaoController.listarTodas(req, res);
}));
avaliacaoRoutes.get('/dados-relatorios', asyncHandler((req, res) => avaliacaoController.obterDadosRelatorios(req, res)));
avaliacaoRoutes.get('/ano/:ano', asyncHandler((req, res) => avaliacaoController.listarPorAno(req, res)));

// Rota para obter gabarito por avaliacaoId - método a ser criado no controller
avaliacaoRoutes.get('/gabarito/:avaliacaoId', asyncHandler((req, res) => avaliacaoController.obterGabarito(req, res)));

// Rotas com parâmetros dinâmicos devem vir por último
avaliacaoRoutes.get('/:id', asyncHandler((req, res) => avaliacaoController.buscarPorId(req, res)));
avaliacaoRoutes.put('/:id', asyncHandler((req, res) => avaliacaoController.atualizar(req, res)));
avaliacaoRoutes.delete('/:id', asyncHandler((req, res) => avaliacaoController.deletar(req, res)));

export { avaliacaoRoutes };
