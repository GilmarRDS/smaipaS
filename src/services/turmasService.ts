import api from '@/lib/api';
import { Turma } from '@/types/turmas';
import { AxiosError } from 'axios';

export const turmasService = {
  async listar(escolaId: string) {
    try {
      if (!escolaId) {
        console.error('escolaId não fornecido');
        return [];
      }
      const response = await api.get<Turma[]>(`/escolas/${escolaId}/turmas`);
      return response.data;
    } catch (error) {
      console.error('Erro ao listar turmas:', error);
      throw error;
    }
  },

  async listarPorEscola(escolaId: string) {
    try {
      if (!escolaId) {
        console.warn('ID da escola não fornecido');
        return [];
      }
      
      const response = await api.get<Turma[]>(`/escolas/${escolaId}/turmas`);
      return response.data;
    } catch (error) {
      if (error instanceof AxiosError && error.response?.status === 404) {
        console.warn(`Nenhuma turma encontrada para a escola ${escolaId}`);
        return [];
      }
      console.error('Erro ao listar turmas da escola:', error);
      throw error;
    }
  },

  async obterPorId(id: string) {
    try {
      const response = await api.get<Turma>(`/turmas/${id}`);
      return response.data;
    } catch (error) {
      console.error('Erro ao obter turma:', error);
      throw error;
    }
  },

  async criar(turma: Omit<Turma, 'id'>) {
    try {
      const response = await api.post<Turma>('/turmas', turma);
      return response.data;
    } catch (error) {
      console.error('Erro ao criar turma:', error);
      throw error;
    }
  },

  async atualizar(id: string, turma: Partial<Turma>) {
    try {
      const response = await api.put<Turma>(`/turmas/${id}`, turma);
      return response.data;
    } catch (error) {
      console.error('Erro ao atualizar turma:', error);
      throw error;
    }
  },

  async deletar(id: string) {
    try {
      await api.delete(`/turmas/${id}`);
    } catch (error) {
      console.error('Erro ao deletar turma:', error);
      throw error;
    }
  }
}; 