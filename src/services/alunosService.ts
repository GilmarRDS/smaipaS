import api from '@/lib/api';
import { Aluno, RespostaAluno } from '@/types/alunos';

export const alunosService = {
  async listar(escolaId?: string) {
    try {
      if (escolaId) {
        const response = await api.get(`/escolas/${escolaId}/alunos`);
        return response.data;
      } else {
        const response = await api.get('/alunos');
        return response.data;
      }
    } catch (error) {
      console.error('Erro ao listar alunos:', error);
      throw error;
    }
  },

  async listarPorTurma(turmaId: string) {
    try {
      const response = await api.get(`/turmas/${turmaId}/alunos`);
      return response.data;
    } catch (error) {
      console.error('Erro ao listar alunos da turma:', error);
      throw error;
    }
  },

  async obterPorId(id: string) {
    try {
      const response = await api.get(`/alunos/${id}`);
      return response.data;
    } catch (error) {
      console.error('Erro ao obter aluno:', error);
      throw error;
    }
  },

  async criar(aluno: Omit<Aluno, 'id'>) {
    try {
      const response = await api.post('/alunos', aluno);
      return response.data;
    } catch (error) {
      console.error('Erro ao criar aluno:', error);
      throw error;
    }
  },

  async atualizar(id: string, aluno: Partial<Aluno>) {
    try {
      const response = await api.put(`/alunos/${id}`, aluno);
      return response.data;
    } catch (error) {
      console.error('Erro ao atualizar aluno:', error);
      throw error;
    }
  },

  async deletar(id: string) {
    try {
      await api.delete(`/alunos/${id}`);
    } catch (error) {
      console.error('Erro ao deletar aluno:', error);
      throw error;
    }
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
    try {
      const token = localStorage.getItem('smaipa_token');
      if (!token) {
        throw new Error('Token não encontrado');
      }

      await api.post('/alunos/importar', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          'Authorization': `Bearer ${token.trim()}`
        },
      });
    } catch (error) {
      console.error('Erro ao importar alunos:', error);
      throw error;
    }
  },

  async downloadTemplate(): Promise<Blob> {
    try {
      const response = await api.get('/alunos/template', {
        responseType: 'blob',
      });
      return response.data;
    } catch (error) {
      console.error('Erro ao baixar template:', error);
      throw error;
    }
  }
}; 