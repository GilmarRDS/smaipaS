import api from '@/lib/api';

export interface Escola {
  id: string;
  nome: string;
  inep: string;
  endereco: string;
  telefone: string;
  diretor: string;
}

export const escolasService = {
  async listar() {
    const response = await api.get<Escola[]>('/escolas');
    return response.data;
  },

  async obterPorId(id: string) {
    const response = await api.get<Escola>(`/escolas/${id}`);
    return response.data;
  },

  async criar(escola: Omit<Escola, 'id'>) {
    const response = await api.post<Escola>('/escolas', escola);
    return response.data;
  },

  async atualizar(id: string, escola: Partial<Escola>) {
    const response = await api.put<Escola>(`/escolas/${id}`, escola);
    return response.data;
  },

  async deletar(id: string) {
    await api.delete(`/escolas/${id}`);
  }
}; 