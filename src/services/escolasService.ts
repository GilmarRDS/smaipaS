import api from '@/lib/api';
import { Escola } from '@/types/escolas';

export const escolasService = {
  async listar() {
    try {
      const response = await api.get<Escola[]>('/escolas');
      return response.data;
    } catch (error) {
      console.error('Erro ao listar escolas:', error);
      throw error;
    }
  },

  async obterPorId(id: string) {
    try {
      const response = await api.get<Escola>(`/escolas/${id}`);
      return response.data;
    } catch (error) {
      console.error('Erro ao obter escola:', error);
      throw error;
    }
  },

  async criar(escola: Omit<Escola, 'id'>) {
    try {
      const response = await api.post<Escola>('/escolas', escola);
      return response.data;
    } catch (error) {
      console.error('Erro ao criar escola:', error);
      throw error;
    }
  },

  async atualizar(id: string, escola: Partial<Escola>) {
    try {
      const response = await api.put<Escola>(`/escolas/${id}`, escola);
      return response.data;
    } catch (error) {
      console.error('Erro ao atualizar escola:', error);
      throw error;
    }
  },

  async deletar(id: string) {
    try {
      await api.delete(`/escolas/${id}`);
    } catch (error) {
      console.error('Erro ao deletar escola:', error);
      throw error;
    }
  }
}; 