import api from '@/lib/api';
import { Avaliacao } from '@/types/avaliacoes';

export interface ItemGabarito {
  numero: number;
  resposta: string;
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
}

export const avaliacoesService = {
  async listarPorEscola(escolaId: string) {
    try {
      if (!escolaId) {
        console.error('escolaId não fornecido');
        return [];
      }
      const response = await api.get<Avaliacao[]>(`/escolas/${escolaId}/avaliacoes`);
      return response.data || [];
    } catch (error) {
      console.error('Erro ao listar avaliações da escola:', error);
      return [];
    }
  },

  async listarPorTurma(turmaId: string) {
    try {
      if (!turmaId) {
        console.error('turmaId não fornecido');
        return [];
      }
      const response = await api.get<Avaliacao[]>(`/avaliacoes/turma/${turmaId}`);
      return response.data || [];
    } catch (error) {
      console.error('Erro ao listar avaliações da turma:', error);
      return [];
    }
  },

  async obterPorId(id: string) {
    try {
      const response = await api.get<Avaliacao>(`/avaliacoes/${id}`);
      return response.data;
    } catch (error) {
      console.error('Erro ao obter avaliação:', error);
      return null;
    }
  },

  async criar(avaliacao: Omit<Avaliacao, 'id'>) {
    try {
      const response = await api.post<Avaliacao>('/avaliacoes', avaliacao);
      return response.data;
    } catch (error) {
      console.error('Erro ao criar avaliação:', error);
      throw error;
    }
  },

  async atualizar(id: string, avaliacao: Partial<Avaliacao>) {
    try {
      const response = await api.put<Avaliacao>(`/avaliacoes/${id}`, avaliacao);
      return response.data;
    } catch (error) {
      console.error('Erro ao atualizar avaliação:', error);
      throw error;
    }
  },

  async deletar(id: string) {
    try {
      await api.delete(`/avaliacoes/${id}`);
    } catch (error) {
      console.error('Erro ao deletar avaliação:', error);
      throw error;
    }
  },

  async obterGabarito(avaliacaoId: string) {
    try {
      const response = await api.get<Gabarito>(`/avaliacoes/${avaliacaoId}/gabarito`);
      return response.data;
    } catch (error) {
      console.error('Erro ao obter gabarito:', error);
      return null;
    }
  },

  // Aliases para manter compatibilidade com código existente
  async criarAvaliacao(avaliacao: Omit<Avaliacao, 'id'>) {
    return this.criar(avaliacao);
  },

  async atualizarAvaliacao(id: string, avaliacao: Partial<Avaliacao>) {
    return this.atualizar(id, avaliacao);
  },

  async deletarAvaliacao(id: string) {
    return this.deletar(id);
  }
}; 