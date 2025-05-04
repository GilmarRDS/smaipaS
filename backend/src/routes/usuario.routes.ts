// import { Router, RequestHandler, Response, NextFunction, Request } from 'express';
// import { RequestWithUsuario } from '../types/express';
// import { UsuarioController } from '../controllers/UsuarioController';
// import { PasswordController } from '../controllers/PasswordController';
// import { authMiddleware } from '../middlewares/auth';

// const usuarioRoutes = Router();
// const usuarioController = new UsuarioController();
// const passwordController = new PasswordController();

// function asyncHandler(fn: (req: Request, res: Response, next: NextFunction) => Promise<unknown>): RequestHandler {
//   return (req, res, next) => {
//     Promise.resolve(fn(req, res, next)).catch(next);
//   };
// }

// usuarioRoutes.post('/login', asyncHandler((req, res) => usuarioController.login(req as RequestWithUsuario, res)));
// usuarioRoutes.post('/', asyncHandler((req, res) => usuarioController.criar(req as RequestWithUsuario, res)));

// // Password recovery routes without authMiddleware
// usuarioRoutes.post('/recuperar-senha', asyncHandler((req, res) => passwordController.forgotPassword(req, res)));
// usuarioRoutes.post('/resetar-senha', asyncHandler((req, res) => passwordController.resetPassword(req, res)));

// // Apply authMiddleware individually to routes that require authentication
// usuarioRoutes.get('/', authMiddleware, asyncHandler((req, res) => usuarioController.listarTodos(req as RequestWithUsuario, res)));
// usuarioRoutes.get('/:id', authMiddleware, asyncHandler((req, res) => usuarioController.buscarPorId(req as RequestWithUsuario, res)));
// usuarioRoutes.put('/:id', authMiddleware, asyncHandler((req, res) => usuarioController.atualizar(req, res)));
// usuarioRoutes.delete('/:id', authMiddleware, asyncHandler((req, res) => usuarioController.deletar(req, res)));

// export { usuarioRoutes };


import { Router, Response, NextFunction, RequestHandler } from 'express';
import { RequestWithUsuario } from '../types/express';
import { UsuarioController } from '../controllers/UsuarioController';
import { PasswordController } from '../controllers/PasswordController';
import { authMiddleware } from '../middlewares/auth';

const usuarioRoutes = Router();
const usuarioController = new UsuarioController();
const passwordController = new PasswordController();

// Middleware para tratar funções assíncronas com RequestWithUsuario
function asyncHandler(
  fn: (req: RequestWithUsuario, res: Response, next: NextFunction) => Promise<unknown>
): RequestHandler {
  return (req, res, next) => {
    fn(req as RequestWithUsuario, res, next).catch(next);
  };
}

// Rotas públicas
usuarioRoutes.post('/login', asyncHandler((req, res) => usuarioController.login(req, res)));
usuarioRoutes.post('/', asyncHandler((req, res) => usuarioController.criar(req, res)));
usuarioRoutes.post('/recuperar-senha', asyncHandler((req, res) => passwordController.forgotPassword(req, res)));
usuarioRoutes.post('/resetar-senha', asyncHandler((req, res) => passwordController.resetPassword(req, res)));

// Rotas autenticadas
usuarioRoutes.get('/', authMiddleware, asyncHandler((req, res) => usuarioController.listarTodos(req, res)));
usuarioRoutes.get('/:id', authMiddleware, asyncHandler((req, res) => usuarioController.buscarPorId(req, res)));
usuarioRoutes.put('/:id', authMiddleware, asyncHandler((req, res) => usuarioController.atualizar(req, res)));
usuarioRoutes.delete('/:id', authMiddleware, asyncHandler((req, res) => usuarioController.deletar(req, res)));

export { usuarioRoutes };
