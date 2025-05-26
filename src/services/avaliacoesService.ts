import api from '@/lib/api';
import { Avaliacao } from '@/types/avaliacoes';

interface ListarTodasParams {
  ano?: string;
  disciplina?: string;
}

export const avaliacoesService = {
  async listarPorTurma(turmaId: string): Promise<Avaliacao[]> {
    try {
      const response = await api.get<Avaliacao[]>(`/api/avaliacoes/turma/${turmaId}`);
      return response.data;
    } catch (error) {
      console.error('Erro ao listar avaliações da turma:', error);
      throw error;
    }
  },

  async listarPorEscola(escolaId: string): Promise<Avaliacao[]> {
    try {
      const response = await api.get<Avaliacao[]>(`/api/escolas/${escolaId}/avaliacoes`);
      return response.data;
    } catch (error) {
      console.error('Erro ao listar avaliações da escola:', error);
      throw error;
    }
  },

  async obterDadosRelatorios(params: { escolaId?: string; turmaId?: string; componente?: string }) {
    try {
      const response = await api.get('/api/relatorios/dados', { params });
      return response.data;
    } catch (error) {
      console.error('Erro ao obter dados dos relatórios:', error);
      throw error;
    }
  },

  async obterGabarito(avaliacaoId: string) {
    try {
      const response = await api.get(`/api/avaliacoes/gabarito/${avaliacaoId}`);
      return response.data;
    } catch (error) {
      console.error('Erro ao obter gabarito:', error);
      throw error;
    }
  },

  async criar(avaliacaoData: Omit<Avaliacao, 'id'>): Promise<Avaliacao> {
    try {
      const response = await api.post<Avaliacao>('/api/avaliacoes', avaliacaoData);
      return response.data;
    } catch (error) {
      console.error('Erro ao criar avaliação:', error);
      throw error;
    }
  },

  async atualizar(id: string, avaliacaoData: Omit<Avaliacao, 'id'>): Promise<Avaliacao> {
    try {
      const response = await api.put<Avaliacao>(`/api/avaliacoes/${id}`, avaliacaoData);
      return response.data;
    } catch (error) {
      console.error('Erro ao atualizar avaliação:', error);
      throw error;
    }
  },

  async deletar(id: string): Promise<void> {
    try {
      await api.delete(`/avaliacoes/${id}`);
    } catch (error) {
      console.error('Erro ao deletar avaliação:', error);
      throw error;
    }
  },

  async listarTodas(params: ListarTodasParams = {}): Promise<Avaliacao[]> {
    const queryParams = new URLSearchParams();
    if (params.ano) queryParams.append('ano', params.ano);
    if (params.disciplina) queryParams.append('disciplina', params.disciplina);

    const response = await api.get(`/api/avaliacoes?${queryParams.toString()}`);
    return response.data;
  }
};
