import { useState, useEffect } from 'react';
import MainLayout from '@/components/layout/MainLayout';
import useAuth from '@/hooks/useAuth';
import { Navigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { School, Plus, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { Escola } from '@/types/escolas';
import { escolasService } from '@/services/escolasService';
import EscolaForm from '@/components/escolas/EscolaForm';
import EscolasList from '@/components/escolas/EscolasList';

const Escolas = () => {
  const { isSecretaria } = useAuth();
  const [escolas, setEscolas] = useState<Escola[]>([]);
  const [open, setOpen] = useState(false);
  const [editingEscola, setEditingEscola] = useState<Escola | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Se não for da secretaria, não carregar dados
    if (!isSecretaria) {
      return;
    }

    const carregarEscolas = async () => {
      try {
        setIsLoading(true);
        const data = await escolasService.listar();
        setEscolas(data);
      } catch (error) {
        console.error('Erro ao carregar escolas:', error);
        toast.error('Erro ao carregar escolas');
      } finally {
        setIsLoading(false);
      }
    };

    carregarEscolas();
  }, [isSecretaria]);

  // Se não for da secretaria, redirecionar
  if (!isSecretaria) {
    toast.error('Acesso restrito à Secretaria de Educação');
    return <Navigate to="/dashboard" replace />;
  }

  const handleOpenForm = (escola?: Escola) => {
    if (escola) {
      setEditingEscola(escola);
    } else {
      setEditingEscola(null);
    }
    setOpen(true);
  };

  const handleSubmit = async (escolaData: Omit<Escola, 'id'>) => {
    try {
      // Se estiver editando
      if (editingEscola) {
        await escolasService.atualizar(editingEscola.id, escolaData);
        const updatedEscolas = escolas.map(esc => 
          esc.id === editingEscola.id 
            ? { ...esc, ...escolaData }
            : esc
        );
        setEscolas(updatedEscolas);
        toast.success('Escola atualizada com sucesso!');
      } else {
        // Adicionando nova escola
        const newEscola = await escolasService.criar(escolaData);
        setEscolas([...escolas, newEscola]);
        toast.success('Escola cadastrada com sucesso!');
      }
      
      setOpen(false);
    } catch (error) {
      console.error('Erro ao salvar escola:', error);
      toast.error('Erro ao salvar escola');
    }
  };

  const handleDelete = async (id: string) => {
    toast("Confirmar exclusão", {
      description: "Tem certeza que deseja excluir esta escola?",
      action: {
        label: "Excluir",
        onClick: async () => {
          try {
            await escolasService.deletar(id);
            setEscolas(escolas.filter(escola => escola.id !== id));
            toast.success('Escola excluída com sucesso!');
          } catch (error) {
            console.error('Erro ao excluir escola:', error);
            toast.error('Erro ao excluir escola');
          }
        }
      },
      cancel: {
        label: "Cancelar",
        onClick: () => {}
      }
    });
  };

  if (isLoading) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <School className="h-6 w-6 text-primary" />
            <h1 className="text-2xl font-bold">Escolas</h1>
          </div>
          
          <Button onClick={() => handleOpenForm()}>
            <Plus className="h-4 w-4 mr-2" />
            Nova Escola
          </Button>
        </div>

        <EscolasList 
          escolas={escolas} 
          onEdit={handleOpenForm} 
          onDelete={handleDelete} 
        />
        
        <EscolaForm
          open={open}
          onOpenChange={setOpen}
          editingEscola={editingEscola}
          onSubmit={handleSubmit}
        />
      </div>
    </MainLayout>
  );
};

export default Escolas;
