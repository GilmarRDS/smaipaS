import api from '@/lib/api';

export interface Usuario {
  id: string;
  nome: string;
  email: string;
  role: 'secretaria' | 'escola';
  escolaId?: string;
  escola?: {
    id: string;
    nome: string;
  };
}

export const usuariosService = {
  async listar() {
    const response = await api.get<Usuario[]>('/usuarios');
    return response.data;
  },

  async listarPorEscola(escolaId: string) {
    const response = await api.get<Usuario[]>(`/usuarios/escola/${escolaId}`);
    return response.data;
  },

  async obterPorId(id: string) {
    const response = await api.get<Usuario>(`/usuarios/${id}`);
    return response.data;
  },

  async criar(usuario: Omit<Usuario, 'id'> & { senha: string }) {
    const response = await api.post<Usuario>('/usuarios', usuario);
    return response.data;
  },

  async atualizar(id: string, usuario: Partial<Usuario> & { senha?: string }) {
    const response = await api.put<Usuario>(`/usuarios/${id}`, usuario);
    return response.data;
  },

  async deletar(id: string) {
    await api.delete(`/usuarios/${id}`);
  }
};