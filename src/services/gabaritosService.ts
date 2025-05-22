import api from '@/lib/api';
import { Gabarito } from '@/types/gabaritos';

export interface ItemGabarito {
  numero: number;
  resposta: string;
  descritorId: string;
}

export const gabaritosService = {
  async listarTodos() {
    try {
      const response = await api.get<Gabarito[]>('/api/gabaritos');
      return response.data;
    } catch (error) {
      console.error('Erro ao listar gabaritos:', error);
      throw error;
    }
  },

  async obterPorId(id: string) {
    try {
      const response = await api.get<Gabarito>(`/api/gabaritos/${id}`);
      return response.data;
    } catch (error) {
      console.error('Erro ao obter gabarito:', error);
      throw error;
    }
  },

  async criar(gabaritoData: Omit<Gabarito, 'id'>) {
    try {
      const response = await api.post<Gabarito>('/api/gabaritos', gabaritoData);
      return response.data;
    } catch (error) {
      console.error('Erro ao criar gabarito:', error);
      throw error;
    }
  },

  async atualizar(id: string, gabaritoData: Omit<Gabarito, 'id'>) {
    try {
      const response = await api.put<Gabarito>(`/api/gabaritos/${id}`, gabaritoData);
      return response.data;
    } catch (error) {
      console.error('Erro ao atualizar gabarito:', error);
      throw error;
    }
  },

  async deletar(id: string) {
    try {
      await api.delete(`/api/gabaritos/${id}`);
    } catch (error) {
      console.error('Erro ao deletar gabarito:', error);
      throw error;
    }
  }
};