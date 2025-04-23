import api from '@/lib/api';

export interface ItemGabarito {
  numero: number;
  resposta: string;
  descritorId: string;
}

export interface Gabarito {
  id: string;
  ciclo: string;
  avaliacaoId: string;
  itens: ItemGabarito[];
}

export const gabaritosService = {
  async listarTodos() {
    try {
      const response = await api.get<Gabarito[]>('/gabarito');
      return response.data;
    } catch (error) {
      console.error('Erro ao listar gabaritos:', error);
      return [];
    }
  },

  async deletar(id: string) {
    try {
      await api.delete(`/gabarito/${id}`);
    } catch (error) {
      console.error('Erro ao deletar gabarito:', error);
      throw error;
    }
  },

  async atualizar(id: string, gabarito: Partial<Gabarito>) {
    try {
      const response = await api.put<Gabarito>(`/gabarito/${id}`, gabarito);
      return response.data;
    } catch (error) {
      console.error('Erro ao atualizar gabarito:', error);
      throw error;
    }
  },
};