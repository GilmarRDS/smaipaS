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
usuarioRoutes.get('/validar-token/:token', asyncHandler((req, res) => passwordController.validateResetToken(req, res)));
usuarioRoutes.post('/resetar-senha', asyncHandler((req, res) => passwordController.resetPassword(req, res)));

// Rota para obter informações do usuário atual
usuarioRoutes.get('/me', authMiddleware, asyncHandler((req, res) => {
  const usuario = (req as RequestWithUsuario).usuario;
  if (!usuario) {
    return res.status(401).json({ message: 'Usuário não autenticado' });
  }
  return res.json(usuario);
}));

// Rotas autenticadas
usuarioRoutes.get('/', authMiddleware, asyncHandler((req: RequestWithUsuario, res) => 
  usuarioController.listarTodos(req, res)
));

usuarioRoutes.get('/:id', authMiddleware, asyncHandler((req: RequestWithUsuario, res) => 
  usuarioController.buscarPorId(req, res)
));

usuarioRoutes.put('/:id', authMiddleware, asyncHandler((req: RequestWithUsuario, res) => 
  usuarioController.atualizar(req, res)
));

usuarioRoutes.delete('/:id', authMiddleware, asyncHandler((req: RequestWithUsuario, res) => 
  usuarioController.deletar(req, res)
));

export { usuarioRoutes };
