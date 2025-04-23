export interface DashboardFilters {
  escola: string;
  turma: string;
  turno: string;
  componente: string;
  avaliacao: string;
}

export interface PerformanceData {
  avaliacao: string;
  portugues: number;
  matematica: number;
}

export interface PresencaData {
  turma: string;
  presentes: number;
  ausentes: number;
}

export interface DescritorAluno {
  codigo: string;
  componente: string;
  acertos: number;
}

export interface AlunoDescritores {
  aluno: string;
  descritores: DescritorAluno[];
} 