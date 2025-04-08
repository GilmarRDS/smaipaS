
import { useState } from 'react';
import MainLayout from '@/components/layout/MainLayout';
import { Button } from '@/components/ui/button';
import { Users, Plus } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';
import { Turma, TURMAS_MOCK, ESCOLAS_MOCK } from '@/types/turmas';
import TurmaForm from '@/components/turmas/TurmaForm';
import TurmasList from '@/components/turmas/TurmasList';

const Turmas = () => {
  const { user, isSecretaria } = useAuth();
  const [turmas, setTurmas] = useState<Turma[]>(TURMAS_MOCK);
  const [open, setOpen] = useState(false);
  const [editingTurma, setEditingTurma] = useState<Turma | null>(null);
  
  // Filtrar turmas por escola se for usuário de escola
  const turmasFiltradas = isSecretaria 
    ? turmas 
    : turmas.filter(turma => turma.escolaId === user?.schoolId);

  // Escolas disponíveis para seleção (apenas para secretaria)
  const escolasDisponiveis = isSecretaria 
    ? ESCOLAS_MOCK 
    : ESCOLAS_MOCK.filter(escola => escola.id === user?.schoolId);

  const handleOpenForm = (turma?: Turma) => {
    if (turma) {
      setEditingTurma(turma);
    } else {
      setEditingTurma(null);
    }
    setOpen(true);
  };

  const handleSubmit = (data: Omit<Turma, 'id' | 'escola'>) => {
    // Validações básicas
    if (!data.nome || !data.ano || !data.turno || !data.escolaId) {
      toast.error('Todos os campos são obrigatórios');
      return;
    }

    // Encontrar o nome da escola
    const selectedSchool = ESCOLAS_MOCK.find(escola => escola.id === data.escolaId);
    
    if (!selectedSchool) {
      toast.error('Escola não encontrada');
      return;
    }

    // Se estiver editando
    if (editingTurma) {
      const updatedTurmas = turmas.map(t => 
        t.id === editingTurma.id 
          ? { 
              ...t, 
              nome: data.nome, 
              ano: data.ano, 
              turno: data.turno,
              escolaId: data.escolaId,
              escola: selectedSchool.nome
            }
          : t
      );
      setTurmas(updatedTurmas);
      toast.success('Turma atualizada com sucesso!');
    } else {
      // Adicionando nova turma
      const newTurma: Turma = {
        id: `turma-${Date.now()}`, // Gera ID único
        nome: data.nome,
        ano: data.ano,
        turno: data.turno,
        escolaId: data.escolaId,
        escola: selectedSchool.nome
      };
      setTurmas([...turmas, newTurma]);
      toast.success('Turma cadastrada com sucesso!');
    }
    
    setOpen(false);
  };

  const handleDelete = (id: string) => {
    // Corrigir a sintaxe do toast
    toast("Confirmar exclusão", {
      description: "Tem certeza que deseja excluir esta turma?",
      action: {
        label: "Excluir",
        onClick: () => {
          setTurmas(turmas.filter(turma => turma.id !== id));
          toast.success('Turma excluída com sucesso!');
        }
      },
      cancel: {
        label: "Cancelar",
        onClick: () => {}
      }
    });
  };

  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Users className="h-6 w-6 text-primary" />
            <h1 className="text-2xl font-bold">Turmas</h1>
          </div>
          
          <Button onClick={() => handleOpenForm()}>
            <Plus className="h-4 w-4 mr-2" />
            Nova Turma
          </Button>
        </div>

        <TurmasList 
          turmas={turmasFiltradas} 
          onEdit={handleOpenForm} 
          onDelete={handleDelete} 
        />
        
        <TurmaForm
          open={open}
          onOpenChange={setOpen}
          editingTurma={editingTurma}
          onSubmit={handleSubmit}
          escolasDisponiveis={escolasDisponiveis}
          isSecretaria={isSecretaria}
          defaultEscolaId={user?.schoolId}
        />
      </div>
    </MainLayout>
  );
};

export default Turmas;
