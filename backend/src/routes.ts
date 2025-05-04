import { Router, RequestHandler, Response, NextFunction } from 'express';
import { RequestWithUsuario } from './types/express';
import { UsuarioController } from './controllers/UsuarioController';
import { EscolaController } from './controllers/EscolaController';
import { TurmaController } from './controllers/TurmaController';
import { AlunoController } from './controllers/AlunoController';
import { AvaliacaoController } from './controllers/AvaliacaoController';
import { DescritorController } from './controllers/DescritorController';
// Importar o novo PasswordController
import { PasswordController } from './controllers/PasswordController';

const router = Router();

const usuarioController = new UsuarioController();
const escolaController = new EscolaController();
const turmaController = new TurmaController();
const alunoController = new AlunoController();
const avaliacaoController = new AvaliacaoController();
const descritorController = new DescritorController();
// Instanciar o novo PasswordController
const passwordController = new PasswordController();

function asyncHandler(fn: (req: RequestWithUsuario, res: Response, next: NextFunction) => Promise<unknown>): RequestHandler {
  return ((req, res, next) => {
    Promise.resolve(fn(req as RequestWithUsuario, res, next)).catch(next);
  }) as RequestHandler;
}

// Rotas de usuários
router.post('/usuarios/login', asyncHandler((req: RequestWithUsuario, res: Response) => usuarioController.login(req, res)));
router.get('/usuarios', asyncHandler((req: RequestWithUsuario, res: Response) => usuarioController.listarTodos(req, res)));
router.get('/usuarios/:id', asyncHandler((req: RequestWithUsuario, res: Response) => usuarioController.buscarPorId(req, res)));
router.post('/usuarios', asyncHandler((req: RequestWithUsuario, res: Response) => usuarioController.criar(req, res)));
router.put('/usuarios/:id', asyncHandler((req: RequestWithUsuario, res: Response) => usuarioController.atualizar(req, res)));
router.delete('/usuarios/:id', asyncHandler((req: RequestWithUsuario, res: Response) => usuarioController.deletar(req, res)));

// Rotas de escolas
router.get('/escolas', asyncHandler((req: RequestWithUsuario, res: Response) => escolaController.listarTodas(req, res)));
router.get('/escolas/:id', asyncHandler((req: RequestWithUsuario, res: Response) => escolaController.buscarPorId(req, res)));
router.post('/escolas', asyncHandler((req: RequestWithUsuario, res: Response) => escolaController.criar(req, res)));
router.put('/escolas/:id', asyncHandler((req: RequestWithUsuario, res: Response) => escolaController.atualizar(req, res)));
router.delete('/escolas/:id', asyncHandler((req: RequestWithUsuario, res: Response) => escolaController.deletar(req, res)));

// Rotas de turmas
router.get('/escolas/:escolaId/turmas', asyncHandler((req: RequestWithUsuario, res: Response) => turmaController.listarTodas(req, res)));
router.get('/turmas/:id', asyncHandler((req: RequestWithUsuario, res: Response) => turmaController.buscarPorId(req, res)));
router.post('/turmas', asyncHandler((req: RequestWithUsuario, res: Response) => turmaController.criar(req, res)));
router.put('/turmas/:id', asyncHandler((req: RequestWithUsuario, res: Response) => turmaController.atualizar(req, res)));
router.delete('/turmas/:id', asyncHandler((req: RequestWithUsuario, res: Response) => turmaController.deletar(req, res)));

// Rotas de alunos
router.get('/turmas/:turmaId/alunos', asyncHandler((req: RequestWithUsuario, res: Response) => alunoController.listarTodos(req, res)));
router.get('/alunos/:id', asyncHandler((req: RequestWithUsuario, res: Response) => alunoController.buscarPorId(req, res)));
router.post('/alunos', asyncHandler((req: RequestWithUsuario, res: Response) => alunoController.criar(req, res)));
router.put('/alunos/:id', asyncHandler((req: RequestWithUsuario, res: Response) => alunoController.atualizar(req, res)));
router.delete('/alunos/:id', asyncHandler((req: RequestWithUsuario, res: Response) => alunoController.deletar(req, res)));

// Rotas de avaliações
router.get('/escolas/:escolaId/avaliacoes', asyncHandler((req: RequestWithUsuario, res: Response) => avaliacaoController.listarTodas(req, res)));
router.get('/avaliacoes/:id', asyncHandler((req: RequestWithUsuario, res: Response) => avaliacaoController.buscarPorId(req, res)));
router.post('/avaliacoes', asyncHandler((req: RequestWithUsuario, res: Response) => avaliacaoController.criar(req, res)));
router.put('/avaliacoes/:id', asyncHandler((req: RequestWithUsuario, res: Response) => avaliacaoController.atualizar(req, res)));
router.delete('/avaliacoes/:id', asyncHandler((req: RequestWithUsuario, res: Response) => avaliacaoController.deletar(req, res)));

// Rotas de descritores
router.get('/descritores', asyncHandler((req: RequestWithUsuario, res: Response) => descritorController.listar(req, res)));
router.get('/descritores/:id', asyncHandler((req: RequestWithUsuario, res: Response) => descritorController.obterPorId(req, res)));
router.post('/descritores', asyncHandler((req: RequestWithUsuario, res: Response) => descritorController.criar(req, res)));
router.put('/descritores/:id', asyncHandler((req: RequestWithUsuario, res: Response) => descritorController.atualizar(req, res)));
router.delete('/descritores/:id', asyncHandler((req: RequestWithUsuario, res: Response) => descritorController.deletar(req, res)));

// Nova rota para dados agregados dos relatórios
router.get('/relatorios/dados', asyncHandler((req: RequestWithUsuario, res: Response, next: NextFunction) => avaliacaoController.obterDadosRelatorios(req, res).catch(next)));

// Rotas de recuperação de senha
router.post('/password/forgot', asyncHandler((req: RequestWithUsuario, res: Response) => passwordController.forgotPassword(req, res)));
router.get('/password/reset/:token', asyncHandler((req: RequestWithUsuario, res: Response) => passwordController.validateResetToken(req, res)));
router.post('/password/reset', asyncHandler((req: RequestWithUsuario, res: Response) => passwordController.resetPassword(req, res)));


export { router };
