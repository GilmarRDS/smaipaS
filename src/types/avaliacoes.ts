
export interface Avaliacao {
  id: string;
  nome: string;
  dataInicio: string;
  dataFim: string;
  componente: 'portugues' | 'matematica';
  ano: string;
  numQuestoes: number;
  status: 'agendada' | 'em-andamento' | 'concluida' | 'cancelada';
}

// Mock data
export const AVALIACOES_MOCK: Avaliacao[] = [
  {
    id: 'aval-1',
    nome: 'Diagnóstica Inicial - Português - 5º Ano',
    dataInicio: '2024-02-15',
    dataFim: '2024-02-17',
    componente: 'portugues',
    ano: '5',
    numQuestoes: 20,
    status: 'concluida',
  },
  {
    id: 'aval-2',
    nome: 'Diagnóstica Inicial - Matemática - 5º Ano',
    dataInicio: '2024-02-20',
    dataFim: '2024-02-22',
    componente: 'matematica',
    ano: '5',
    numQuestoes: 20,
    status: 'concluida',
  },
  {
    id: 'aval-3',
    nome: 'Diagnóstica Inicial - Português - 9º Ano',
    dataInicio: '2024-03-10',
    dataFim: '2024-03-12',
    componente: 'portugues',
    ano: '9',
    numQuestoes: 25,
    status: 'concluida',
  },
  {
    id: 'aval-4',
    nome: 'Diagnóstica Inicial - Matemática - 9º Ano',
    dataInicio: '2024-03-15',
    dataFim: '2024-03-17',
    componente: 'matematica',
    ano: '9',
    numQuestoes: 25,
    status: 'em-andamento',
  },
  {
    id: 'aval-5',
    nome: 'Diagnóstica 2 - Português - 5º Ano',
    dataInicio: '2024-06-10',
    dataFim: '2024-06-12',
    componente: 'portugues',
    ano: '5',
    numQuestoes: 20,
    status: 'agendada',
  },
];

// Helper function to get status badge color
export const getStatusColor = (status: Avaliacao['status']) => {
  switch (status) {
    case 'agendada':
      return 'bg-blue-100 text-blue-800';
    case 'em-andamento':
      return 'bg-orange-100 text-orange-800';
    case 'concluida':
      return 'bg-green-100 text-green-800';
    case 'cancelada':
      return 'bg-red-100 text-red-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

// Helper function to format status for display
export const formatStatus = (status: Avaliacao['status']) => {
  switch (status) {
    case 'agendada':
      return 'Agendada';
    case 'em-andamento':
      return 'Em andamento';
    case 'concluida':
      return 'Concluída';
    case 'cancelada':
      return 'Cancelada';
    default:
      return status;
  }
};
