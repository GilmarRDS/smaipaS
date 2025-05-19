import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { toast } from 'sonner';
import { Aluno } from '@/types/alunos';
import { Turma } from '@/types/turmas';
import { alunosService } from '@/services/alunosService';
import { turmasService } from '@/services/turmasService';
import AlunosList from '@/components/alunos/AlunosList';
import AlunoForm from '@/components/alunos/AlunoForm';

const Alunos = () => {
  const { user } = useAuth();
  const [alunos, setAlunos] = useState<Aluno[]>([]);
  const [turmas, setTurmas] = useState<Turma[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [selectedAluno, setSelectedAluno] = useState<Aluno | null>(null);

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      let alunosData = [];
      let turmasData = [];
      if (user?.role === 'secretaria') {
        alunosData = await alunosService.listar();
        turmasData = await turmasService.listar();
      } else {
        alunosData = await alunosService.listarPorEscola(user?.schoolId || '');
        turmasData = await turmasService.listarPorEscola(user?.schoolId || '');
      }
      setAlunos(alunosData);
      setTurmas(turmasData);
    } catch (error) {
      toast.error('Erro ao carregar dados');
      console.error(error);
    } finally {
      setLoading(false);
    }
  }, [user?.role, user?.schoolId]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleCreate = () => {
    setSelectedAluno(null);
    setShowForm(true);
  };

  const handleEdit = (aluno: Aluno) => {
    setSelectedAluno(aluno);
    setShowForm(true);
  };

  const handleDelete = async (aluno: Aluno) => {
    try {
      await alunosService.deletar(aluno.id);
      toast.success('Aluno excluído com sucesso');
      loadData();
    } catch (error) {
      toast.error('Erro ao excluir aluno');
      console.error(error);
    }
  };

  const handleSubmit = async (data: Partial<Aluno>) => {
    try {
      if (selectedAluno) {
        await alunosService.atualizar(selectedAluno.id, data);
        toast.success('Aluno atualizado com sucesso');
      } else {
        await alunosService.criar({
          ...data,
          escolaId: user?.schoolId || '',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        } as Omit<Aluno, 'id'>);
        toast.success('Aluno criado com sucesso');
      }
      setShowForm(false);
      loadData();
    } catch (error) {
      toast.error('Erro ao salvar aluno');
      console.error(error);
    }
  };

  if (loading) {
    return <div>Carregando...</div>;
  }

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Alunos</h1>
        <Button onClick={handleCreate}>
          <Plus className="w-4 h-4 mr-2" />
          Novo Aluno
        </Button>
      </div>

      {showForm ? (
        <AlunoForm
          aluno={selectedAluno}
          turmas={turmas}
          onSubmit={handleSubmit}
          onCancel={() => setShowForm(false)}
        />
      ) : (
        <AlunosList
          alunos={alunos}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
      )}
    </div>
  );
};

export default Alunos; 