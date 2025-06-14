import { Router } from 'express';
import { usuarioRoutes } from './usuario.routes';
import { escolaRoutes } from './escola.routes';
import { turmaRoutes } from './turma.routes';
import { alunoRoutes } from './aluno.routes';
import { avaliacaoRoutes } from './avaliacao.routes';
import { gabaritoRoutes } from './gabarito.routes';
import { respostaRoutes } from './resposta.routes';
import { descritorRoutes } from './descritor.routes';

const router = Router();

// Rotas de usuários
router.use('/usuarios', usuarioRoutes);

// Rotas de escolas
router.use('/escolas', escolaRoutes);

// Rotas de turmas
router.use('/turmas', turmaRoutes);

// Rotas de alunos
router.use('/alunos', alunoRoutes);

// Rotas de avaliações
router.use('/avaliacoes', avaliacaoRoutes);

// Rotas de gabaritos
router.use('/gabaritos', gabaritoRoutes);

// Rotas de respostas
router.use('/respostas', respostaRoutes);

// Rotas de descritores
router.use('/descritores', descritorRoutes);

export { router }; 