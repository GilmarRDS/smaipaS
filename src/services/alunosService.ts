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

  async listarPorTurma(turmaId: string) {
    try {
      const response = await api.get<Aluno[]>(`/turmas/${turmaId}/alunos`);
      return response.data;
    } catch (error) {
      console.error('Erro ao listar alunos da turma:', error);
      throw error;
    }
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

  async criar(aluno: Omit<Aluno, 'id'>) {
    try {
      const response = await api.post<Aluno>('/alunos', aluno);
      return response.data;
    } catch (error) {
      console.error('Erro ao criar aluno:', error);
      throw error;
    }
  },

  async atualizar(id: string, aluno: Partial<Aluno>) {
    try {
      const response = await api.put<Aluno>(`/alunos/${id}`, aluno);
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
  }
}; 