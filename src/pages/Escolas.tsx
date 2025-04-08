
import { useState } from 'react';
import MainLayout from '@/components/layout/MainLayout';
import { useAuth } from '@/contexts/AuthContext';
import { Navigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { School, Plus } from 'lucide-react';
import { toast } from 'sonner';
import { Escola, ESCOLAS_MOCK } from '@/types/escolas';
import EscolaForm from '@/components/escolas/EscolaForm';
import EscolasList from '@/components/escolas/EscolasList';

const Escolas = () => {
  const { isSecretaria } = useAuth();
  const [escolas, setEscolas] = useState<Escola[]>(ESCOLAS_MOCK);
  const [open, setOpen] = useState(false);
  const [editingEscola, setEditingEscola] = useState<Escola | null>(null);

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

  const handleSubmit = (escolaData: Omit<Escola, 'id'>) => {
    // Se estiver editando
    if (editingEscola) {
      const updatedEscolas = escolas.map(esc => 
        esc.id === editingEscola.id 
          ? { ...esc, ...escolaData }
          : esc
      );
      setEscolas(updatedEscolas);
      toast.success('Escola atualizada com sucesso!');
    } else {
      // Adicionando nova escola
      const newEscola: Escola = {
        id: `escola-${Date.now()}`, // Gera ID único
        ...escolaData
      };
      setEscolas([...escolas, newEscola]);
      toast.success('Escola cadastrada com sucesso!');
    }
    
    setOpen(false);
  };

  const handleDelete = (id: string) => {
    toast("Confirmar exclusão", {
      description: "Tem certeza que deseja excluir esta escola?",
      action: {
        label: "Excluir",
        onClick: () => {
          setEscolas(escolas.filter(escola => escola.id !== id));
          toast.success('Escola excluída com sucesso!');
        }
      },
      cancel: {
        label: "Cancelar",
      }
    });
  };

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
