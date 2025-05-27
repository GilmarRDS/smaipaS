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
  compareceu: boolean;
  transferido: boolean;
  itens: {
    numero: number;
    resposta: string;
  }[];
  createdAt: string;
  updatedAt: string;
  aluno?: Aluno;
} 