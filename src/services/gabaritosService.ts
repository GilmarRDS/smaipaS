import api from '@/lib/api';
import { Gabarito } from '@/types/gabaritos';

export interface ItemGabarito {
  numero: number;
  resposta: string;
  descritorId: string;
}

export interface CriarGabaritoParams {
  avaliacaoId: string;
  turno: 'matutino' | 'vespertino' | 'noturno' | 'integral';
  itens: ItemGabarito[];
}

export const gabaritosService = {
  async criar(params: CriarGabaritoParams): Promise<Gabarito> {
    const response = await api.post<Gabarito>('/gabaritos', params);
    return response.data;
  },

  async listarTodos(): Promise<Gabarito[]> {
    const response = await api.get('/api/gabaritos');
    return response.data;
  },

  async buscarPorId(id: string): Promise<Gabarito> {
    const response = await api.get(`/api/gabaritos/${id}`);
    return response.data;
  },

  async atualizar(id: string, params: Partial<CriarGabaritoParams>): Promise<Gabarito> {
    const response = await api.put(`/api/gabaritos/${id}`, params);
    return response.data;
  },

  async deletar(id: string): Promise<void> {
    await api.delete(`/api/gabaritos/${id}`);
  }
};