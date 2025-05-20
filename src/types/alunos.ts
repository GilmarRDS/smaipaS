export interface Aluno {
  id: string;
  nome: string;
  matricula: string;
  dataNascimento: string;
  turmaId: string;
  turma?: {
    id: string;
    nome: string;
  };
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
    questao: number;
    alternativa: string | null;
  }>;
  createdAt: string;
  updatedAt: string;
  aluno?: Aluno;
} 