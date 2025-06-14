export interface Turma {
  id: string;
  nome: string;
  ano: string;
  turno: 'matutino' | 'vespertino' | 'noturno' | 'integral';
  escolaId: string;
  escola?: {
    id: string;
    nome: string;
  };
  dataCriacao?: string;
  dataAtualizacao?: string;
}

export interface Escola {
  id: string;
  nome: string;
}
