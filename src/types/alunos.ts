import { Turma } from './turmas';

export interface Aluno {
  id: string;
  nome: string;
  matricula: string;
  dataNascimento: string;
  turmaId: string;
  dataCriacao: string;
  dataAtualizacao: string;
  turma?: Turma;
  respostas?: {
    id: string;
    avaliacaoId: string;
    compareceu: boolean;
    transferido: boolean;
    itens: Array<{
      id: string;
      numero: number;
      resposta: string;
      correta?: boolean;
      descritor?: {
        id: string;
        codigo: string;
        descricao: string;
      };
    }>;
    avaliacao?: {
      id: string;
      nome: string;
      tipo: string;
      disciplina: string;
      dataAplicacao: string;
    };
  }[];
  escolaId?: string;
  createdAt: string;
  updatedAt: string;
  avaliacoes?: string[]; // IDs das avaliações
  habilidades?: {
    leitura?: number;
    escrita?: number;
    interpretacao?: number;
    calculo?: number;
    raciocinio?: number;
    resolucao?: number;
  };
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