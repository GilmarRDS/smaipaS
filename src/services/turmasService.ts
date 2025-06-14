import api from '@/lib/api';
import { Turma } from '@/types/turmas';
import { AxiosError } from 'axios';

export const turmasService = {
  async listar(escolaId?: string) {
    try {
      if (!escolaId) {
        // Se não tiver escolaId, lista todas as turmas
        const response = await api.get('/turmas');
        return response.data;
      }
      
      const response = await api.get(`/escolas/${escolaId}/turmas`);
      const turmas = response.data;
      const turmasFiltradas = Array.isArray(turmas)
        ? turmas.filter((turma: Turma) => turma.escolaId === escolaId)
        : [];
      return turmasFiltradas;
    } catch (error) {
      console.error('Erro ao listar turmas:', error);
      throw error;
    }
  },

  async obterPorId(id: string) {
    try {
      const response = await api.get(`/turmas/${id}`);
      return response.data;
    } catch (error) {
      console.error('Erro ao obter turma:', error);
      throw error;
    }
  },

  async criar(turma: Omit<Turma, 'id'>) {
    try {
      console.log('Enviando dados para criar turma:', turma);
      const response = await api.post('/turmas', turma);
      return response.data;
    } catch (error) {
      if (error instanceof AxiosError) {
        console.error('Erro ao criar turma:', {
          status: error.response?.status,
          data: error.response?.data,
          message: error.message
        });
      } else {
        console.error('Erro ao criar turma:', error);
      }
      throw error;
    }
  },

  async atualizar(id: string, turma: Partial<Turma>) {
    try {
      const response = await api.put(`/turmas/${id}`, turma);
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