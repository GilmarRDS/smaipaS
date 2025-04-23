import { Router } from 'express';
import { RequestWithUsuario } from '../types/express';
import { AlunoController } from '../controllers/AlunoController';
import { ensureAuthenticated } from '../middlewares/ensureAuthenticated';

const alunoRoutes = Router();
const alunoController = new AlunoController();

function asyncHandler(fn: (req: RequestWithUsuario, res: any, next: any) => Promise<any>) {
  return (req: any, res: any, next: any) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}

alunoRoutes.use(ensureAuthenticated);

alunoRoutes.post('/', asyncHandler((req, res) => alunoController.criar(req, res)));
alunoRoutes.get('/', asyncHandler((req, res) => alunoController.listarTodos(req, res)));
alunoRoutes.get('/:id', asyncHandler((req, res) => alunoController.buscarPorId(req, res)));
alunoRoutes.put('/:id', asyncHandler((req, res) => alunoController.atualizar(req, res)));
alunoRoutes.delete('/:id', asyncHandler((req, res) => alunoController.deletar(req, res)));

export { alunoRoutes };
