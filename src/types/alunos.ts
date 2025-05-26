import { Turma } from './turmas';

export interface Aluno {
  id: string;
  nome: string;
  matricula: string;
  dataNascimento: string;
  turmaId: string;
  escolaId?: string;
  turma?: Turma;
  createdAt: string;
  updatedAt: string;
}

export interface RespostaAluno {
  id: string;
  alunoId: string;
  avaliacaoId: string;
  presente: boolean;
  transferido: boolean;
  nota: number;
  respostas: Array<{
    numero: number;
    resposta: string;
  }>;
  createdAt: string;
  updatedAt: string;
  aluno?: Aluno;
} 