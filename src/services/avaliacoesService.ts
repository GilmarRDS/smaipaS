import api from '@/lib/api';
import { Avaliacao } from '@/types/avaliacoes';
import { ListarTodasParams } from '@/types/avaliacoes';
import { AxiosError } from 'axios';
import { toast } from 'sonner';

export const avaliacoesService = {
  async listarPorTurma(turmaId: string): Promise<Avaliacao[]> {
    try {
      const response = await api.get<Avaliacao[]>(`/avaliacoes/turma/${turmaId}`);
      return response.data;
    } catch (error) {
      console.error('Erro ao listar avaliações da turma:', error);
      throw error;
    }
  },

  async listarPorEscola(escolaId: string): Promise<Avaliacao[]> {
    try {
      const response = await api.get<Avaliacao[]>(`/avaliacoes/escola/${escolaId}`);
      return response.data;
    } catch (error) {
      console.error('Erro ao listar avaliações da escola:', error);
      throw error;
    }
  },

  async listarPorAno(ano: string): Promise<Avaliacao[]> {
    try {
      const anoNumerico = ano.match(/\d+/)?.[0] || ano;
      const response = await api.get<Avaliacao[]>(`/avaliacoes/ano/${encodeURIComponent(anoNumerico)}`);
      return response.data;
    } catch (error) {
      console.error('Erro ao listar avaliações por ano:', error);
      throw error as AxiosError;
    }
  },

  async listarPorAnoEComponente(ano: string, componente: string): Promise<Avaliacao[]> {
    try {
      const anoNumerico = ano.match(/\d+/)?.[0] || ano;
      const response = await api.get<Avaliacao[]>(`/avaliacoes/ano/${encodeURIComponent(anoNumerico)}/componente/${encodeURIComponent(componente)}`);
      return response.data;
    } catch (error) {
      console.error('Erro ao listar avaliações por ano e componente:', error);
      throw error as AxiosError;
    }
  },

  async obterDadosRelatorios(params: { 
    escolaId?: string; 
    turmaId?: string; 
    componente?: string;
    avaliacaoId?: string;
  }) {
    try {
      const response = await api.get('/avaliacoes/relatorios/dados', { params });
      return response.data;
    } catch (error) {
      console.error('Erro ao obter dados dos relatórios:', error);
      throw error;
    }
  },

  async obterGabarito(avaliacaoId: string) {
    try {
      const response = await api.get(`/avaliacoes/${avaliacaoId}/gabarito`);
      return response.data;
    } catch (error) {
      console.error('Erro ao obter gabarito:', error);
      throw error;
    }
  },

  async criar(avaliacaoData: Omit<Avaliacao, 'id'>): Promise<Avaliacao> {
    try {
      const response = await api.post<Avaliacao>('/avaliacoes', avaliacaoData);
      return response.data;
    } catch (error) {
      console.error('Erro ao criar avaliação:', error);
      throw error;
    }
  },

  async atualizar(id: string, avaliacaoData: Omit<Avaliacao, 'id'>): Promise<Avaliacao> {
    try {
      const response = await api.put<Avaliacao>(`/avaliacoes/${id}`, avaliacaoData);
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
    if (params.componente) queryParams.append('disciplina', params.componente);

    const response = await api.get(`/avaliacoes?${queryParams.toString()}`);
    return response.data;
  }
};
