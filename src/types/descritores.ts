export interface Descritor {
  id: string;
  codigo: string;
  descricao: string;
  disciplina: 'PORTUGUES' | 'MATEMATICA';
  tipo: 'inicial' | 'final';
  dataCriacao: string;
  dataAtualizacao: string;
} 