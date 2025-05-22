export interface GabaritoMock {
  id: string;
  avaliacao: string;
  data: string;
  questoes: number;
}

export interface ItemGabarito {
  id: string;
  numero: number;
  resposta: string;
  descritorId?: string;
  descritor?: {
    id: string;
    codigo: string;
    descricao: string;
  };
}

export interface Gabarito {
  id: string;
  avaliacaoId: string;
  itens: ItemGabarito[];
  dataCriacao: string;
  dataAtualizacao: string;
}
