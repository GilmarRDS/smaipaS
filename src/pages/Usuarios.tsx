import { useState, useEffect, useCallback } from 'react';
import MainLayout from '@/components/layout/MainLayout';
import { useAuth } from '@/contexts/AuthContext';
import { Navigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { User, Plus, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { usuariosService, Usuario } from '@/services/usuariosService';
import { escolasService, Escola } from '@/services/escolasService';
import UsuarioForm from '@/components/usuarios/UsuarioForm';
import UsuariosList from '@/components/usuarios/UsuariosList';
import { useToast } from '@/components/ui/use-toast';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface UsuarioFormData {
  nome: string;
  email: string;
  senha?: string;
  role: 'secretaria' | 'escola';
  escolaId?: string;
}

const Usuarios = () => {
  const { isSecretaria } = useAuth();
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [escolas, setEscolas] = useState<Escola[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [selectedUsuario, setSelectedUsuario] = useState<Usuario | undefined>();
  const { toast } = useToast();

  const loadData = useCallback(async () => {
    try {
      setIsLoading(true);
      const [usuariosData, escolasData] = await Promise.all([
        usuariosService.listar(),
        escolasService.listar(),
      ]);
      setUsuarios(usuariosData);
      setEscolas(escolasData);
    } catch (error) {
      toast({
        title: 'Erro',
        description: 'Erro ao carregar dados',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    // Se não for da secretaria, não carregar dados
    if (!isSecretaria) {
      return;
    }
    
    loadData();
  }, [isSecretaria, loadData]);

  // Se não for da secretaria, redirecionar
  if (!isSecretaria) {
    toast({
      title: 'Erro',
      description: 'Acesso restrito à Secretaria de Educação',
      variant: 'destructive',
    });
    return <Navigate to="/dashboard" replace />;
  }

  const handleCreate = () => {
    setSelectedUsuario(undefined);
    setShowForm(true);
  };

  const handleEdit = (usuario: Usuario) => {
    setSelectedUsuario(usuario);
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    const usuario = usuarios.find(u => u.id === id);
    if (!usuario) return;
    
    if (!window.confirm('Tem certeza que deseja excluir este usuário?')) {
      return;
    }

    try {
      await usuariosService.deletar(id);
      toast({
        title: 'Sucesso',
        description: 'Usuário excluído com sucesso',
      });
      loadData();
    } catch (error) {
      toast({
        title: 'Erro',
        description: 'Erro ao excluir usuário',
        variant: 'destructive',
      });
    }
  };

  const handleSubmit = async (data: UsuarioFormData) => {
    try {
      if (selectedUsuario) {
        await usuariosService.atualizar(selectedUsuario.id, data);
        toast({
          title: 'Sucesso',
          description: 'Usuário atualizado com sucesso',
        });
      } else {
        // Garantir que a senha seja fornecida ao criar um novo usuário
        if (!data.senha) {
          toast({
            title: 'Erro',
            description: 'A senha é obrigatória para criar um novo usuário',
            variant: 'destructive',
          });
      return;
    }

        await usuariosService.criar({
          ...data,
          senha: data.senha
        });
        toast({
          title: 'Sucesso',
          description: 'Usuário criado com sucesso',
        });
      }
      setShowForm(false);
      loadData();
    } catch (error) {
      toast({
        title: 'Erro',
        description: 'Erro ao salvar usuário',
        variant: 'destructive',
      });
    }
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
            <User className="h-6 w-6 text-primary" />
            <h1 className="text-2xl font-bold">Usuários</h1>
          </div>
          
          <Button onClick={handleCreate}>
            <Plus className="h-4 w-4 mr-2" />
                Novo Usuário
              </Button>
        </div>

        <UsuariosList
          usuarios={usuarios}
          onEdit={handleEdit}
          onDelete={handleDelete}
          isLoading={isLoading}
        />
        
        {showForm && (
          <UsuarioForm
            usuario={selectedUsuario}
            escolas={escolas}
            onSubmit={handleSubmit}
            onClose={() => setShowForm(false)}
          />
        )}
      </div>
    </MainLayout>
  );
};

export default Usuarios;
