import { Router, Request, Response, NextFunction, RequestHandler } from 'express';
import { RequestWithUsuario } from '../types/express';
import { AlunoController } from '../controllers/AlunoController';
import { ensureAuthenticated } from '../middlewares/ensureAuthenticated';
import { authMiddleware } from '../middlewares/auth';
import { upload } from '../config/multer';

const alunoRoutes = Router();
const alunoController = new AlunoController();

// Middleware para tratar funções assíncronas
function asyncHandler(
  fn: (req: RequestWithUsuario, res: Response, next: NextFunction) => Promise<unknown>
): RequestHandler {
  return (req, res, next) => {
    Promise.resolve(fn(req as RequestWithUsuario, res, next)).catch(next);
  };
}

alunoRoutes.use(ensureAuthenticated);

// Rotas básicas
alunoRoutes.post('/', asyncHandler((req, res) => alunoController.criar(req, res)));
alunoRoutes.get('/', asyncHandler((req, res) => alunoController.listarTodos(req, res)));

// Rota do template deve vir antes da rota com parâmetro
alunoRoutes.get('/template', asyncHandler((req, res) => alunoController.downloadTemplate(req, res)));

// Rotas com parâmetros
alunoRoutes.get('/:id', asyncHandler((req, res) => alunoController.buscarPorId(req, res)));
alunoRoutes.put('/:id', asyncHandler((req, res) => alunoController.atualizar(req, res)));
alunoRoutes.delete('/:id', asyncHandler((req, res) => alunoController.deletar(req, res)));

// Rota de importação
alunoRoutes.post('/importar', upload.single('file'), asyncHandler((req, res) => alunoController.importarAlunos(req, res)));

export { alunoRoutes };
