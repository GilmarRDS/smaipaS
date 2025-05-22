import { Router, Request, Response, NextFunction, RequestHandler } from 'express';
import { UsuarioController } from '../controllers/UsuarioController';
import { PasswordController } from '../controllers/PasswordController';
import { authMiddleware, RequestWithUsuario } from '../middlewares/auth';

const usuarioRoutes = Router();
const usuarioController = new UsuarioController();
const passwordController = new PasswordController();

// Middleware para tratar funções assíncronas com RequestWithUsuario
function asyncHandler(
  fn: (req: RequestWithUsuario, res: Response, next: NextFunction) => Promise<void | Response>
): RequestHandler {
  return (req, res, next) => {
    Promise.resolve(fn(req as RequestWithUsuario, res, next)).catch((error) => {
      console.error('Erro capturado pelo asyncHandler:', error);
      next(error);
    });
  };
}

// Rotas públicas
usuarioRoutes.post('/login', asyncHandler(async (req, res) => {
  await usuarioController.login(req, res);
}));

usuarioRoutes.post('/', asyncHandler(async (req, res) => {
  await usuarioController.criar(req, res);
}));

usuarioRoutes.post('/recuperar-senha', asyncHandler(async (req, res) => {
  await passwordController.forgotPassword(req, res);
}));

usuarioRoutes.get('/validar-token/:token', asyncHandler(async (req, res) => {
  await passwordController.validateResetToken(req, res);
}));

usuarioRoutes.post('/resetar-senha', asyncHandler(async (req, res) => {
  await passwordController.resetPassword(req, res);
}));

// Rotas autenticadas
usuarioRoutes.get('/', asyncHandler(authMiddleware), asyncHandler(async (req, res) => {
  await usuarioController.listarTodos(req, res);
}));

usuarioRoutes.get('/:id', asyncHandler(authMiddleware), asyncHandler(async (req, res) => {
  await usuarioController.buscarPorId(req, res);
}));

// Rota para obter informações do usuário atual
usuarioRoutes.get('/me', asyncHandler(authMiddleware), asyncHandler(async (req, res) => {
  const usuario = (req as RequestWithUsuario).usuario;
  if (!usuario) {
    return res.status(401).json({ message: 'Usuário não autenticado' });
  }
  return res.json(usuario);
}));

usuarioRoutes.put('/:id', asyncHandler(authMiddleware), asyncHandler(async (req, res) => {
  await usuarioController.atualizar(req, res);
}));

usuarioRoutes.delete('/:id', asyncHandler(authMiddleware), asyncHandler(async (req, res) => {
  await usuarioController.deletar(req, res);
}));

export { usuarioRoutes };
