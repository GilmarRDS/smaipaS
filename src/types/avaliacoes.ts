export interface Avaliacao {
  id: string;
  nome: string;
  tipo: 'DIAGNOSTICA_INICIAL' | 'DIAGNOSTICA_FINAL';
  disciplina: 'PORTUGUES' | 'MATEMATICA';
  ano: string;
  dataAplicacao: string;
  dataCriacao: string;
  dataAtualizacao: string;
  status?: string; // propriedade adicionada como opcional
  dataInicio?: string; // propriedade adicionada como opcional
  respostas?: {
    id: string;
    alunoId: string;
    compareceu: boolean;
    transferido: boolean;
    presente?: boolean; // propriedade adicionada como opcional
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
    avaliacaoId?: string; // adicionado para compatibilidade com uso no componente
    createdAt?: string; // adicionado para compatibilidade
    updatedAt?: string; // adicionado para compatibilidade
    aluno?: {
      id: string;
      nome: string;
      // outras propriedades do aluno podem ser adicionadas conforme necessário
    };
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
