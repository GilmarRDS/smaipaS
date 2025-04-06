
export interface GabaritoMock {
  id: string;
  avaliacao: string;
  data: string;
  questoes: number;
}

// Mock de gabaritos para demonstração
export const MOCK_GABARITOS: GabaritoMock[] = [
  { id: '1', avaliacao: 'Diagnóstica Inicial - Português - 5º Ano', data: '2024-02-15', questoes: 20 },
  { id: '2', avaliacao: 'Diagnóstica Inicial - Matemática - 5º Ano', data: '2024-02-16', questoes: 20 },
  { id: '3', avaliacao: 'Diagnóstica Inicial - Português - 9º Ano', data: '2024-02-17', questoes: 25 },
  { id: '4', avaliacao: 'Diagnóstica Inicial - Matemática - 9º Ano', data: '2024-02-18', questoes: 25 },
];
