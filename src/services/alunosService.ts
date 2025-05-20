import api from '@/lib/api';
import { Aluno, RespostaAluno } from '@/types/alunos';

export const alunosService = {
  async listar() {
    try {
      const response = await api.get<Aluno[]>('/alunos');
      return response.data;
    } catch (error) {
      console.error('Erro ao listar alunos:', error);
      throw error;
    }
  },

  async listarPorEscola(escolaId: string) {
    try {
      const response = await api.get<Aluno[]>(`/escolas/${escolaId}/alunos`);
      return response.data;
    } catch (error) {
      console.error('Erro ao listar alunos da escola:', error);
      throw error;
    }
  },

  async listarPorTurma(turmaId: string): Promise<Aluno[]> {
    const response = await api.get(`/alunos/turma/${turmaId}`);
    return response.data;
  },

  async obterPorId(id: string) {
    try {
      const response = await api.get<Aluno>(`/alunos/${id}`);
      return response.data;
    } catch (error) {
      console.error('Erro ao obter aluno:', error);
      throw error;
    }
  },

  async criar(aluno: Omit<Aluno, 'id'>): Promise<Aluno> {
    const response = await api.post('/alunos', aluno);
    return response.data;
  },

  async atualizar(id: string, aluno: Partial<Aluno>): Promise<Aluno> {
    const response = await api.put(`/alunos/${id}`, aluno);
    return response.data;
  },

  async deletar(id: string): Promise<void> {
    await api.delete(`/alunos/${id}`);
  },

  async obterRespostas(alunoId: string, avaliacaoId: string) {
    try {
      const response = await api.get<RespostaAluno>(`/alunos/${alunoId}/avaliacoes/${avaliacaoId}/respostas`);
      return response.data;
    } catch (error) {
      console.error('Erro ao obter respostas do aluno:', error);
      throw error;
    }
  },

  async importarAlunos(formData: FormData): Promise<void> {
    await api.post('/alunos/importar', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },

  async downloadTemplate(): Promise<Blob> {
    const response = await api.get('/alunos/template', {
      responseType: 'blob',
    });
    return response.data;
  }
}; 