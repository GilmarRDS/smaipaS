import api from '@/lib/api';
import { Aluno, RespostaAluno } from '@/types/alunos';

export const alunosService = {
  async listar(escolaId: string) {
    try {
      const response = await api.get<Aluno[]>(`/api/escolas/${escolaId}/alunos`);
      return response.data;
    } catch (error) {
      console.error('Erro ao listar alunos:', error);
      throw error;
    }
  },

  async listarPorTurma(turmaId: string) {
    try {
      const response = await api.get(`/api/turmas/${turmaId}/alunos`);
      return response.data;
    } catch (error) {
      console.error('Erro ao listar alunos da turma:', error);
      throw error;
    }
  },

  async obterPorId(id: string) {
    try {
      const response = await api.get(`/api/alunos/${id}`);
      return response.data;
    } catch (error) {
      console.error('Erro ao obter aluno:', error);
      throw error;
    }
  },

  async criar(aluno: Omit<Aluno, 'id'>) {
    try {
      const response = await api.post('/api/alunos', aluno);
      return response.data;
    } catch (error) {
      console.error('Erro ao criar aluno:', error);
      throw error;
    }
  },

  async atualizar(id: string, aluno: Partial<Aluno>) {
    try {
      const response = await api.put(`/api/alunos/${id}`, aluno);
      return response.data;
    } catch (error) {
      console.error('Erro ao atualizar aluno:', error);
      throw error;
    }
  },

  async deletar(id: string) {
    try {
      await api.delete(`/api/alunos/${id}`);
    } catch (error) {
      console.error('Erro ao deletar aluno:', error);
      throw error;
    }
  },

  async obterRespostas(alunoId: string, avaliacaoId: string) {
    try {
      const response = await api.get<RespostaAluno>(`/api/alunos/${alunoId}/avaliacoes/${avaliacaoId}/respostas`);
      return response.data;
    } catch (error) {
      console.error('Erro ao obter respostas do aluno:', error);
      throw error;
    }
  },

  async importarAlunos(formData: FormData): Promise<void> {
    try {
      await api.post('/api/alunos/importar', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
    } catch (error) {
      console.error('Erro ao importar alunos:', error);
      throw error;
    }
  },

  async downloadTemplate(): Promise<Blob> {
    try {
      const response = await api.get('/api/alunos/template', {
        responseType: 'blob',
      });
      return response.data;
    } catch (error) {
      console.error('Erro ao baixar template:', error);
      throw error;
    }
  }
}; 