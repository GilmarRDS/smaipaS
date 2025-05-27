export interface Avaliacao {
  id: string;
  nome: string;
  tipo: 'DIAGNOSTICA_INICIAL' | 'DIAGNOSTICA_FINAL';
  disciplina: 'PORTUGUES' | 'MATEMATICA';
  ano: string;
  dataAplicacao: string;
  dataCriacao: string;
  dataAtualizacao: string;
  respostas?: {
    id: string;
    alunoId: string;
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
  }[];
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
}

export interface ListarTodasParams {
  escolaId?: string;
  turmaId?: string;
  componente?: string;
  ano?: string;
}

// Helper function to get status badge color
export const getStatusColor = (status: string) => {
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
export const formatStatus = (status: string) => {
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
