import 'express-async-errors';
import express from 'express';
import cors from 'cors';
import { config } from 'dotenv';
import { router } from './routes';
import { authMiddleware } from './middlewares/auth';
import { RequestWithUsuario } from './types/express';

config();

const app = express();

app.use(cors());
app.use(express.json());

// Aplicar middleware de autenticação em todas as rotas, exceto login
app.use((req, res, next) => {
  if (req.path === '/usuarios/login') {
    return next();
  }
  return authMiddleware(req as RequestWithUsuario, res, next);
});

app.use(router);

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});
