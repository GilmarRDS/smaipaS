import api from '@/lib/api';
import { Descritor } from '@/types/gabaritos';

export const descritoresService = {
  listarTodos: async (): Promise<Descritor[]> => {
    const response = await api.get('/descritores');
    return response.data;
  },

  listarDescritores: async (): Promise<Descritor[]> => {
    const response = await api.get('/descritores');
    return response.data;
  },

  listarPorComponente: async (componente: string): Promise<Descritor[]> => {
    const response = await api.get(`/descritores/componente/${componente}`);
    return response.data;
  },

  async obterDescritor(id: string): Promise<Descritor> {
    try {
      const response = await api.get(`/descritores/${id}`);
      return response.data;
    } catch (error) {
      console.error('Erro ao obter descritor:', error);
      throw error;
    }
  },

  async criarDescritor(data: Partial<Descritor>): Promise<Descritor> {
    try {
      const response = await api.post('/descritores', data);
      return response.data;
    } catch (error) {
      console.error('Erro ao criar descritor:', error);
      throw error;
    }
  },

  async atualizarDescritor(id: string, data: Partial<Descritor>): Promise<Descritor> {
    try {
      const response = await api.put(`/descritores/${id}`, data);
      return response.data;
    } catch (error) {
      console.error('Erro ao atualizar descritor:', error);
      throw error;
    }
  },

  async deletarDescritor(id: string): Promise<void> {
    try {
      await api.delete(`/descritores/${id}`);
    } catch (error) {
      console.error('Erro ao deletar descritor:', error);
      throw error;
    }
  }
}; 