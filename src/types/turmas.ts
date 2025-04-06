
export interface Turma {
  id: string;
  nome: string;
  ano: string;
  turno: 'matutino' | 'vespertino' | 'noturno' | 'integral';
  escola: string;
  escolaId: string;
}

export interface Escola {
  id: string;
  nome: string;
}

// Mock data
export const TURMAS_MOCK: Turma[] = [
  {
    id: 'turma-1',
    nome: '1º Ano A',
    ano: '1',
    turno: 'matutino',
    escola: 'Escola Municipal A',
    escolaId: 'escola-1',
  },
  {
    id: 'turma-2',
    nome: '2º Ano B',
    ano: '2',
    turno: 'vespertino',
    escola: 'Escola Municipal A',
    escolaId: 'escola-1',
  },
  {
    id: 'turma-3',
    nome: '3º Ano C',
    ano: '3',
    turno: 'matutino',
    escola: 'Escola Municipal B',
    escolaId: 'escola-2',
  },
];

export const ESCOLAS_MOCK: Escola[] = [
  { id: 'escola-1', nome: 'Escola Municipal A' },
  { id: 'escola-2', nome: 'Escola Municipal B' },
];

export const ANOS_ESCOLARES = ['1', '2', '3', '4', '5', '6', '7', '8', '9'];
