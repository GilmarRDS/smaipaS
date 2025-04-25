import React, { useState, useEffect, useCallback } from 'react';
import MainLayout from 'components/layout/MainLayout';
import { Tabs, TabsContent, TabsList, TabsTrigger } from 'components/ui/tabs';
import { Button } from 'components/ui/button';
import { Plus } from 'lucide-react';
import { toast } from 'sonner';
import { Turma } from 'types/turmas';
import { turmasService } from 'services/turmasService';
import TurmasList from 'components/turmas/TurmasList';
import TurmaForm from 'components/turmas/TurmaForm';
import { useAuth } from 'contexts/AuthContext';
import { escolasService } from 'services/escolasService';
import { Escola } from 'types/escolas';

const Turmas: React.FC = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<string>('listar');
  const [turmas, setTurmas] = useState<Turma[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [editingTurma, setEditingTurma] = useState<Turma | null>(null);
  const [escolas, setEscolas] = useState<Escola[]>([]);
  const [selectedEscolaId, setSelectedEscolaId] = useState<string>('');

  const loadEscolas = useCallback(async () => {
    try {
      const data = await escolasService.listar();
      setEscolas(data);
      if (data.length > 0) {
        setSelectedEscolaId(data[0].id);
      }
    } catch (error) {
      toast.error('Erro ao carregar escolas');
      console.error(error);
    }
  }, []);

  const loadTurmas = useCallback(async () => {
    if (!user) {
      console.warn('Usuário não definido');
      return;
    }
    try {
      setLoading(true);
      if (user.role === 'secretaria') {
        if (!selectedEscolaId) {
          toast.error('Selecione uma escola para listar as turmas');
          setTurmas([]);
          return;
        }
        const data = await turmasService.listar(selectedEscolaId);
        setTurmas(data);
      } else if (user.role === 'escola') {
        if (!user.schoolId) {
          toast.error('Usuário sem escola associada');
          setTurmas([]);
          return;
        }
        const data = await turmasService.listarPorEscola(user.schoolId);
        setTurmas(data);
      } else {
        toast.error('Papel de usuário não suportado');
        setTurmas([]);
      }
    } catch (error) {
      toast.error('Erro ao carregar turmas');
      console.error(error);
    } finally {
      setLoading(false);
    }
  }, [user, selectedEscolaId]);

  useEffect(() => {
    if (user?.role === 'secretaria') {
      loadEscolas();
    }
  }, [loadEscolas, user]);

  useEffect(() => {
    loadTurmas();
  }, [loadTurmas]);

  const handleEdit = (turma: Turma) => {
    setEditingTurma(turma);
    setActiveTab('cadastrar');
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

  const handleSubmit = async (turmaData: Partial<Turma>) => {
    const escolaIdToUse = user?.role === 'secretaria' ? turmaData.escolaId : user?.schoolId;

    if (!escolaIdToUse) {
      toast.error('Usuário sem escola associada');
      return;
    }

    try {
      if (editingTurma) {
        await turmasService.atualizar(editingTurma.id, turmaData);
        toast.success('Turma atualizada com sucesso');
      } else {
        await turmasService.criar({
          ...turmaData,
          escolaId: escolaIdToUse,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        } as Omit<Turma, 'id'>);
        toast.success('Turma criada com sucesso');
      }
      setActiveTab('listar');
      setEditingTurma(null);
      loadTurmas();
    } catch (error) {
      toast.error('Erro ao salvar turma');
      console.error(error);
    }
  };

  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold tracking-tight">Turmas</h1>
          <Button onClick={() => setActiveTab('cadastrar')}>
            <Plus className="w-4 h-4 mr-2" />
            Nova Turma
          </Button>
        </div>

        {user?.role === 'secretaria' && (
          <div className="mb-4">
            <label htmlFor="escola-select" className="block mb-1 font-medium">
              Selecione a Escola
            </label>
            <select
              id="escola-select"
              value={selectedEscolaId}
              onChange={(e) => setSelectedEscolaId(e.target.value)}
              className="border rounded px-3 py-2 w-full max-w-xs"
            >
              {escolas.map((escola) => (
                <option key={escola.id} value={escola.id}>
                  {escola.nome}
                </option>
              ))}
            </select>
          </div>
        )}

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="listar">Listar Turmas</TabsTrigger>
            <TabsTrigger value="cadastrar">{editingTurma ? 'Editar Turma' : 'Cadastrar Turma'}</TabsTrigger>
          </TabsList>

          <TabsContent value="listar" className="space-y-4">
            {loading ? (
              <div>Carregando turmas...</div>
            ) : (
              <TurmasList turmas={turmas} onEdit={handleEdit} onDelete={handleDelete} />
            )}
          </TabsContent>

          <TabsContent value="cadastrar" className="space-y-4">
            <TurmaForm
              turma={editingTurma}
              onSubmit={handleSubmit}
              onCancel={() => {
                setActiveTab('listar');
                setEditingTurma(null);
              }}
            />
          </TabsContent>
        </Tabs>
      </div>
    </MainLayout>
  );
};

export default Turmas;
