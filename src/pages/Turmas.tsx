import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { toast } from 'sonner';
import { Turma } from '@/types/turmas';
import { turmasService } from '@/services/turmasService';
import TurmasList from '@/components/turmas/TurmasList';
import TurmaForm from '@/components/turmas/TurmaForm';
import MainLayout from '@/components/layout/MainLayout';

const Turmas = () => {
  const { user } = useAuth();
  const [turmas, setTurmas] = useState<Turma[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [selectedTurma, setSelectedTurma] = useState<Turma | null>(null);

  const loadTurmas = useCallback(async () => {
    try {
      setLoading(true);
      const data = await turmasService.listarPorEscola(user?.schoolId || '');
      setTurmas(data);
    } catch (error) {
      toast.error('Erro ao carregar turmas');
      console.error(error);
    } finally {
      setLoading(false);
    }
  }, [user?.schoolId]);

  useEffect(() => {
    loadTurmas();
  }, [loadTurmas]);

  const handleCreate = () => {
    setSelectedTurma(null);
    setShowForm(true);
  };

  const handleEdit = (turma: Turma) => {
    setSelectedTurma(turma);
    setShowForm(true);
  };

  const handleDelete = async (turma: Turma) => {
    try {
      await turmasService.deletar(turma.id);
      toast.success('Turma excluída com sucesso');
      loadTurmas();
    } catch (error) {
      toast.error('Erro ao excluir turma');
      console.error(error);
    }
  };

  const handleSubmit = async (data: Partial<Turma>) => {
    try {
      if (selectedTurma) {
        await turmasService.atualizar(selectedTurma.id, data);
        toast.success('Turma atualizada com sucesso');
      } else {
        await turmasService.criar({
          ...data,
          escolaId: user?.schoolId || '',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        } as Omit<Turma, 'id'>);
        toast.success('Turma criada com sucesso');
      }
      setShowForm(false);
      loadTurmas();
    } catch (error) {
      toast.error('Erro ao salvar turma');
      console.error(error);
    }
  };

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold">Turmas</h1>
        <Button onClick={handleCreate}>
          <Plus className="w-4 h-4 mr-2" />
            Nova Turma
          </Button>
        </div>

      {showForm ? (
        <TurmaForm
          turma={selectedTurma}
          onSubmit={handleSubmit}
          onCancel={() => setShowForm(false)}
        />
      ) : (
        <TurmasList
          turmas={turmas}
          onEdit={handleEdit}
          onDelete={handleDelete}
          isLoading={loading}
        />
      )}
      </div>
  );
};

export default Turmas;
