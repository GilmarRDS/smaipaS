
export interface Escola {
  id: string;
  nome: string;
  inep: string;
  endereco: string;
  telefone: string;
  diretor: string;
}

// Mock de dados iniciais
export const ESCOLAS_MOCK: Escola[] = [
  {
    id: 'escola-1',
    nome: 'Escola Municipal A',
    inep: '12345678',
    endereco: 'Rua das Flores, 123',
    telefone: '(11) 1234-5678',
    diretor: 'Ana Silva',
  },
  {
    id: 'escola-2',
    nome: 'Escola Municipal B',
    inep: '87654321',
    endereco: 'Av. Principal, 456',
    telefone: '(11) 8765-4321',
    diretor: 'João Santos',
  },
];
