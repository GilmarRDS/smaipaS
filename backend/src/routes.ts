import { Router, RequestHandler, Response, NextFunction, Request } from 'express';
import { RequestWithUsuario } from './types/express';
import { UsuarioController } from './controllers/UsuarioController';
import { EscolaController } from './controllers/EscolaController';
import { TurmaController } from './controllers/TurmaController';
import { AlunoController } from './controllers/AlunoController';
import { AvaliacaoController } from './controllers/AvaliacaoController';
import { DescritorController } from './controllers/DescritorController';
import { GabaritoController } from './controllers/GabaritoController';
// Importar o novo PasswordController
import { PasswordController } from './controllers/PasswordController';
import { prisma } from './lib/prisma';
import { upload } from './config/multer';

const router = Router();

const usuarioController = new UsuarioController();
const escolaController = new EscolaController();
const turmaController = new TurmaController();
const alunoController = new AlunoController();
const avaliacaoController = new AvaliacaoController();
const descritorController = new DescritorController();
const gabaritoController = new GabaritoController();
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
router.get('/escolas/:escolaId/turmas', asyncHandler((req: RequestWithUsuario, res: Response) => escolaController.listarTurmas(req, res)));
router.get('/turmas/:id', asyncHandler((req: RequestWithUsuario, res: Response) => turmaController.buscarPorId(req, res)));
router.post('/turmas', asyncHandler((req: RequestWithUsuario, res: Response) => turmaController.criar(req, res)));
router.put('/turmas/:id', asyncHandler((req: RequestWithUsuario, res: Response) => turmaController.atualizar(req, res)));
router.delete('/turmas/:id', asyncHandler((req: RequestWithUsuario, res: Response) => turmaController.deletar(req, res)));

// Rotas de alunos
router.get('/alunos/template', asyncHandler((req: RequestWithUsuario, res: Response) => alunoController.downloadTemplate(req, res)));
router.post('/alunos/importar', upload.single('file'), asyncHandler((req: RequestWithUsuario, res: Response) => alunoController.importarAlunos(req, res)));
router.get('/escolas/:escolaId/alunos', asyncHandler((req: RequestWithUsuario, res: Response) => alunoController.listarTodos(req, res)));
router.get('/alunos/:id', asyncHandler((req: RequestWithUsuario, res: Response) => alunoController.buscarPorId(req, res)));
router.post('/alunos', asyncHandler((req: RequestWithUsuario, res: Response) => alunoController.criar(req, res)));
router.put('/alunos/:id', asyncHandler((req: RequestWithUsuario, res: Response) => alunoController.atualizar(req, res)));
router.delete('/alunos/:id', asyncHandler((req: RequestWithUsuario, res: Response) => alunoController.deletar(req, res)));

// Rotas de descritores
router.get('/descritores', asyncHandler((req: RequestWithUsuario, res: Response) => descritorController.listarTodos(req, res)));
router.get('/descritores/:id', asyncHandler((req: RequestWithUsuario, res: Response) => descritorController.buscarPorId(req, res)));
router.post('/descritores', asyncHandler((req: RequestWithUsuario, res: Response) => descritorController.criar(req, res)));
router.put('/descritores/:id', asyncHandler((req: RequestWithUsuario, res: Response) => descritorController.atualizar(req, res)));
router.delete('/descritores/:id', asyncHandler((req: RequestWithUsuario, res: Response) => descritorController.deletar(req, res)));

// Nova rota para dados agregados dos relatórios
router.get('/relatorios/dados', asyncHandler((req: RequestWithUsuario, res: Response, next: NextFunction) => avaliacaoController.obterDadosRelatorios(req, res).catch(next)));

// Rotas de recuperação de senha
router.post('/usuarios/recuperar-senha', asyncHandler((req: RequestWithUsuario, res: Response) => passwordController.forgotPassword(req, res)));
router.get('/usuarios/validar-token/:token', asyncHandler((req: RequestWithUsuario, res: Response) => passwordController.validateResetToken(req, res)));
router.post('/usuarios/resetar-senha', asyncHandler((req: RequestWithUsuario, res: Response) => passwordController.resetPassword(req, res)));

// Rotas de gabarito
router.get('/gabaritos', asyncHandler((req: RequestWithUsuario, res: Response) => gabaritoController.listarTodos(req, res)));
router.get('/gabaritos/:id', asyncHandler((req: RequestWithUsuario, res: Response) => gabaritoController.buscarPorId(req, res)));
router.post('/gabaritos', asyncHandler((req: RequestWithUsuario, res: Response) => gabaritoController.criar(req, res)));
router.put('/gabaritos/:id', asyncHandler((req: RequestWithUsuario, res: Response) => gabaritoController.atualizar(req, res)));
router.delete('/gabaritos/:id', asyncHandler((req: RequestWithUsuario, res: Response) => gabaritoController.deletar(req, res)));

export { router };
