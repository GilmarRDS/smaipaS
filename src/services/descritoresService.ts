import api from '@/lib/api';
import { Descritor } from '@/types/descritores';

export const descritoresService = {
  async listarDescritores(): Promise<Descritor[]> {
    try {
      const response = await api.get('/api/descritores');
      return response.data;
    } catch (error) {
      console.error('Erro ao listar descritores:', error);
      throw error;
    }
  },

  async obterDescritor(id: string): Promise<Descritor> {
    try {
      const response = await api.get(`/api/descritores/${id}`);
      return response.data;
    } catch (error) {
      console.error('Erro ao obter descritor:', error);
      throw error;
    }
  },

  async criarDescritor(data: Partial<Descritor>): Promise<Descritor> {
    try {
      const response = await api.post('/api/descritores', data);
      return response.data;
    } catch (error) {
      console.error('Erro ao criar descritor:', error);
      throw error;
    }
  },

  async atualizarDescritor(id: string, data: Partial<Descritor>): Promise<Descritor> {
    try {
      const response = await api.put(`/api/descritores/${id}`, data);
      return response.data;
    } catch (error) {
      console.error('Erro ao atualizar descritor:', error);
      throw error;
    }
  },

  async deletarDescritor(id: string): Promise<void> {
    try {
      await api.delete(`/api/descritores/${id}`);
    } catch (error) {
      console.error('Erro ao deletar descritor:', error);
      throw error;
    }
  }
}; 