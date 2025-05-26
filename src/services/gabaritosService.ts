import api from '@/lib/api';
import { Gabarito, CriarGabaritoParams } from '@/types/gabaritos';

export interface ItemGabarito {
  numero: number;
  resposta: string;
  descritorId: string;
}

export const gabaritosService = {
  criar: async (params: CriarGabaritoParams): Promise<Gabarito> => {
    const response = await api.post('/gabaritos', params);
    return response.data;
  },

  listarTodos: async (): Promise<Gabarito[]> => {
    const response = await api.get('/gabaritos');
    return response.data;
  },

  listarPorAvaliacao: async (avaliacaoId: string): Promise<Gabarito[]> => {
    const response = await api.get(`/gabaritos/avaliacao/${avaliacaoId}`);
    return response.data;
  },

  buscarPorId: async (id: string): Promise<Gabarito> => {
    const response = await api.get(`/gabaritos/${id}`);
    return response.data;
  },

  atualizar: async (id: string, params: Partial<CriarGabaritoParams>): Promise<Gabarito> => {
    const response = await api.put(`/gabaritos/${id}`, params);
    return response.data;
  },

  excluir: async (id: string): Promise<void> => {
    await api.delete(`/gabaritos/${id}`);
  },

  exportar: async (id: string): Promise<void> => {
    const response = await api.get(`/gabaritos/${id}/exportar`, {
      responseType: 'blob'
    });
    
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `gabarito-${id}.xlsx`);
    document.body.appendChild(link);
    link.click();
    link.remove();
  }
};