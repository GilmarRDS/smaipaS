import api from '@/lib/api';
import { Avaliacao } from '@/types/avaliacoes';

export const avaliacoesService = {
  async listarPorTurma(turmaId: string): Promise<Avaliacao[]> {
    const response = await api.get<Avaliacao[]>(`/avaliacoes/turma/${turmaId}`);
    return response.data;
  },

  async listarPorEscola(escolaId: string): Promise<Avaliacao[]> {
    const response = await api.get<Avaliacao[]>(`/avaliacoes/escola/${escolaId}`);
    return response.data;
  },

  async obterDadosRelatorios(params: { escolaId?: string; turmaId?: string; componente?: string }) {
    const response = await api.get('/avaliacoes/dados-relatorios', { params });
    return response.data;
  },

  async obterGabarito(avaliacaoId: string) {
    const response = await api.get(`/avaliacoes/gabarito/${avaliacaoId}`);
    return response.data;
  },

  async criar(avaliacaoData: Omit<Avaliacao, 'id'>): Promise<Avaliacao> {
    const response = await api.post<Avaliacao>('/avaliacoes', avaliacaoData);
    return response.data;
  },

  async atualizar(id: string, avaliacaoData: Omit<Avaliacao, 'id'>): Promise<Avaliacao> {
    const response = await api.put<Avaliacao>(`/avaliacoes/${id}`, avaliacaoData);
    return response.data;
  },

  async deletar(id: string): Promise<void> {
    await api.delete(`/avaliacoes/${id}`);
  }
};
