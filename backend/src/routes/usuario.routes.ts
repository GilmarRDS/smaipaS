import { Router, Request, Response, NextFunction, RequestHandler } from 'express';
import { UsuarioController } from '../controllers/UsuarioController';
import { PasswordController } from '../controllers/PasswordController';
import { authMiddleware, RequestWithUsuario } from '../middlewares/auth';

const usuarioRoutes = Router();
const usuarioController = new UsuarioController();
const passwordController = new PasswordController();

// Middleware para tratar funções assíncronas com RequestWithUsuario
function asyncHandler(
  fn: (req: RequestWithUsuario, res: Response, next: NextFunction) => Promise<unknown>
): RequestHandler {
  return (req, res, next) => {
    Promise.resolve(fn(req as RequestWithUsuario, res, next)).catch((error) => {
      console.error('Erro capturado pelo asyncHandler:', error);
      next(error);
    });
  };
}

// Rotas públicas
usuarioRoutes.post('/login', asyncHandler((req, res) => usuarioController.login(req, res)));
usuarioRoutes.post('/', asyncHandler((req, res) => usuarioController.criar(req, res)));
usuarioRoutes.post('/recuperar-senha', asyncHandler((req, res) => passwordController.forgotPassword(req, res)));
usuarioRoutes.post('/resetar-senha', asyncHandler((req, res) => passwordController.resetPassword(req, res)));

// Rotas autenticadas
usuarioRoutes.get('/', authMiddleware, asyncHandler((req, res) => 
  usuarioController.listarTodos(req as RequestWithUsuario, res)
));

usuarioRoutes.get('/:id', authMiddleware, asyncHandler((req, res) => 
  usuarioController.buscarPorId(req as RequestWithUsuario, res)
));

usuarioRoutes.put('/:id', authMiddleware, asyncHandler((req, res) => 
  usuarioController.atualizar(req as RequestWithUsuario, res)
));

usuarioRoutes.delete('/:id', authMiddleware, asyncHandler((req, res) => 
  usuarioController.deletar(req as RequestWithUsuario, res)
));

export { usuarioRoutes };
