export interface Avaliacao {
  id: string;
  nome: string;
  descricao: string;
  dataInicio: string;
  dataFim: string;
  componente: 'portugues' | 'matematica';
  disciplina: 'PORTUGUES' | 'MATEMATICA';
  tipo: 'DIAGNOSTICA_INICIAL' | 'DIAGNOSTICA_FINAL';
  ano: string;
  numQuestoes: number;
  status: 'agendada' | 'em-andamento' | 'concluida' | 'cancelada';
  turmaId: string;
  escolaId: string;
  gabarito?: {
    id: string;
    itens: Array<{
      id: string;
      numero: number;
      resposta: string;
      descritor?: {
        id: string;
        codigo: string;
        descricao: string;
      };
    }>;
  };
  turma?: {
    id: string;
    nome: string;
  };
  escola?: {
    id: string;
    nome: string;
  };
}

// Helper function to get status badge color
export const getStatusColor = (status: Avaliacao['status']) => {
  switch (status) {
    case 'agendada':
      return 'bg-blue-100 text-blue-800';
    case 'em-andamento':
      return 'bg-orange-100 text-orange-800';
    case 'concluida':
      return 'bg-green-100 text-green-800';
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
    default:
      return status;
  }
};
