import 'express-async-errors';
import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import { config } from 'dotenv';
import { router } from './routes/index';
import path from 'path';
import { authMiddleware } from './middlewares/auth';

config();

const app = express();

// Configurar CORS para permitir requisições do frontend
app.use(cors({
  origin: ['http://localhost:8080', 'http://127.0.0.1:8080'],
  credentials: true
}));

app.use(express.json());

// Aplicar middleware de autenticação em todas as rotas da API
app.use('/api', authMiddleware as express.RequestHandler);

// Rotas da API
app.use('/api', router);

// Em desenvolvimento, redirecionar todas as outras rotas para o servidor de desenvolvimento do Vite
if (process.env.NODE_ENV !== 'production') {
  app.get('*', (req, res, next) => {
    // Se a rota começa com /api, não redireciona
    if (req.path.startsWith('/api')) {
      return next();
    }
    // Redireciona para o servidor de desenvolvimento do Vite
    res.redirect('http://localhost:8080' + req.path);
  });
} else {
  // Em produção, servir os arquivos estáticos do frontend
  app.use(express.static(path.join(__dirname, '../../dist')));
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../../dist/index.html'));
  });
}

const PORT = Number(process.env.PORT) || 3000;
const HOST = '0.0.0.0'; // Escutar em todas as interfaces de rede

app.listen(PORT, HOST, () => {
  console.log(`Servidor rodando em http://${HOST}:${PORT}`);
});
