import { Router } from 'express';
import { usuarioRoutes } from './usuario.routes';
import { escolaRoutes } from './escola.routes';
import { turmaRoutes } from './turma.routes';
import { alunoRoutes } from './aluno.routes';
import { avaliacaoRoutes } from './avaliacao.routes';
import { gabaritoRoutes } from './gabarito.routes';
import { respostaRoutes } from './resposta.routes';

const router = Router();

router.use('/usuarios', usuarioRoutes);
router.use('/escolas', escolaRoutes);
router.use('/turmas', turmaRoutes);
router.use('/alunos', alunoRoutes);
router.use('/avaliacoes', avaliacaoRoutes);
router.use('/gabaritos', gabaritoRoutes);
router.use('/respostas', respostaRoutes);

export { router }; 