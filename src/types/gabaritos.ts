export interface GabaritoMock {
  id: string;
  avaliacao: string;
  data: string;
  questoes: number;
}

export interface Descritor {
  id: string;
  codigo: string;
  descricao: string;
}

export interface ItemGabarito {
  id: string;
  numero: number;
  resposta: string;
  descritorId: string;
  descritor: Descritor;
}

export interface Gabarito {
  id: string;
  avaliacaoId: string;
  itens: ItemGabarito[];
  dataCriacao: string;
  dataAtualizacao: string;
}

export interface CriarGabaritoParams {
  avaliacaoId: string;
  itens: {
    numero: number;
    resposta: string;
    descritorId: string;
  }[];
}
