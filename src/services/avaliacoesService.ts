import api from '@/lib/api';
import { Avaliacao } from '@/types/avaliacoes';

export const avaliacoesService = {
  async listarPorTurma(turmaId: string): Promise<Avaliacao[]> {
    const response = await api.get<Avaliacao[]>(`/avaliacoes/turma/${turmaId}`);
    return response.data;
  },

  async obterDadosRelatorios(params: { escolaId?: string; turmaId?: string; componente?: string }) {
    const response = await api.get('/avaliacoes/dados-relatorios', { params });
    return response.data;
  }
};
