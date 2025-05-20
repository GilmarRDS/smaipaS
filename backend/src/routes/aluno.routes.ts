import { Router, Request, Response, NextFunction, RequestHandler } from 'express';
import { RequestWithUsuario } from '../types/express';
import { AlunoController } from '../controllers/AlunoController';
import { ensureAuthenticated } from '../middlewares/ensureAuthenticated';
import { authMiddleware } from '../middlewares/auth';
import multer from 'multer';
import path from 'path';

const alunoRoutes = Router();
const alunoController = new AlunoController();

// Configuração do multer para upload de arquivos
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/');
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage: storage,
  fileFilter: (req, file, cb) => {
    const allowedExtensions = ['.xlsx', '.xls', '.csv'];
    const ext = path.extname(file.originalname).toLowerCase();
    if (allowedExtensions.includes(ext)) {
      cb(null, true);
    } else {
      cb(new Error('Formato de arquivo inválido. Use apenas .xlsx, .xls ou .csv'));
    }
  }
});

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
alunoRoutes.get('/:id', asyncHandler((req, res) => alunoController.buscarPorId(req, res)));
alunoRoutes.put('/:id', asyncHandler((req, res) => alunoController.atualizar(req, res)));
alunoRoutes.delete('/:id', asyncHandler((req, res) => alunoController.deletar(req, res)));

// Rotas para importação
alunoRoutes.post('/importar', upload.single('file'), asyncHandler((req, res) => alunoController.importarAlunos(req, res)));
alunoRoutes.get('/template', asyncHandler((req, res) => alunoController.downloadTemplate(req, res)));

export { alunoRoutes };
