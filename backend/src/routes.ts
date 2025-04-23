import { Router, RequestHandler, Response, NextFunction } from 'express';
import { RequestWithUsuario } from './types/express';
import { UsuarioController } from './controllers/UsuarioController';
import { EscolaController } from './controllers/EscolaController';
import { TurmaController } from './controllers/TurmaController';
import { AlunoController } from './controllers/AlunoController';
import { AvaliacaoController } from './controllers/AvaliacaoController';
import { DescritorController } from './controllers/DescritorController';

const router = Router();

const usuarioController = new UsuarioController();
const escolaController = new EscolaController();
const turmaController = new TurmaController();
const alunoController = new AlunoController();
const avaliacaoController = new AvaliacaoController();
const descritorController = new DescritorController();

function asyncHandler(fn: (req: RequestWithUsuario, res: Response, next: NextFunction) => Promise<unknown>): RequestHandler {
  return (req, res, next) => {
    Promise.resolve(fn(req as RequestWithUsuario, res, next)).catch(next);
  };
}

// Rotas de usuários
router.post('/usuarios/login', asyncHandler((req, res) => usuarioController.login(req, res)));
router.get('/usuarios', asyncHandler((req, res) => usuarioController.listarTodos(req, res)));
router.get('/usuarios/:id', asyncHandler((req, res) => usuarioController.buscarPorId(req, res)));
router.post('/usuarios', asyncHandler((req, res) => usuarioController.criar(req, res)));
router.put('/usuarios/:id', asyncHandler((req, res) => usuarioController.atualizar(req, res)));
router.delete('/usuarios/:id', asyncHandler((req, res) => usuarioController.deletar(req, res)));

// Rotas de escolas
router.get('/escolas', asyncHandler((req, res) => escolaController.listarTodas(req, res)));
router.get('/escolas/:id', asyncHandler((req, res) => escolaController.buscarPorId(req, res)));
router.post('/escolas', asyncHandler((req, res) => escolaController.criar(req, res)));
router.put('/escolas/:id', asyncHandler((req, res) => escolaController.atualizar(req, res)));
router.delete('/escolas/:id', asyncHandler((req, res) => escolaController.deletar(req, res)));

// Rotas de turmas
router.get('/escolas/:escolaId/turmas', asyncHandler((req, res) => turmaController.listarTodas(req, res)));
router.get('/turmas/:id', asyncHandler((req, res) => turmaController.buscarPorId(req, res)));
router.post('/turmas', asyncHandler((req, res) => turmaController.criar(req, res)));
router.put('/turmas/:id', asyncHandler((req, res) => turmaController.atualizar(req, res)));
router.delete('/turmas/:id', asyncHandler((req, res) => turmaController.deletar(req, res)));

// Rotas de alunos
router.get('/turmas/:turmaId/alunos', asyncHandler((req, res) => alunoController.listarTodos(req, res)));
router.get('/alunos/:id', asyncHandler((req, res) => alunoController.buscarPorId(req, res)));
router.post('/alunos', asyncHandler((req, res) => alunoController.criar(req, res)));
router.put('/alunos/:id', asyncHandler((req, res) => alunoController.atualizar(req, res)));
router.delete('/alunos/:id', asyncHandler((req, res) => alunoController.deletar(req, res)));

// Rotas de avaliações
router.get('/escolas/:escolaId/avaliacoes', asyncHandler((req, res) => avaliacaoController.listarTodas(req, res)));
router.get('/avaliacoes/:id', asyncHandler((req, res) => avaliacaoController.buscarPorId(req, res)));
router.post('/avaliacoes', asyncHandler((req, res) => avaliacaoController.criar(req, res)));
router.put('/avaliacoes/:id', asyncHandler((req, res) => avaliacaoController.atualizar(req, res)));
router.delete('/avaliacoes/:id', asyncHandler((req, res) => avaliacaoController.deletar(req, res)));

// Rotas de descritores
router.get('/descritores', asyncHandler((req, res) => descritorController.listar(req, res)));
router.get('/descritores/:id', asyncHandler((req, res) => descritorController.obterPorId(req, res)));
router.post('/descritores', asyncHandler((req, res) => descritorController.criar(req, res)));
router.put('/descritores/:id', asyncHandler((req, res) => descritorController.atualizar(req, res)));
router.delete('/descritores/:id', asyncHandler((req, res) => descritorController.deletar(req, res)));

// Nova rota para dados agregados dos relatórios
router.get('/relatorios/dados', asyncHandler((req, res, next) => avaliacaoController.obterDadosRelatorios(req, res).catch(next)));

export { router };
