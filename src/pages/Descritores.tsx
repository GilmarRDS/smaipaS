import React, { useState, useEffect } from 'react';
import MainLayout from '@/components/layout/MainLayout';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { DescritoresList } from '@/components/descritores/DescritoresList';
import { DescritorForm } from '@/components/descritores/DescritorForm';
import { descritoresService } from '@/services/descritoresService';
import { Descritor } from '@/types/descritores';
import { toast } from 'sonner';

const Descritores: React.FC = () => {
  const [activeTab, setActiveTab] = useState('listar');
  const [descritores, setDescritores] = useState<Descritor[]>([]);
  const [editingDescritor, setEditingDescritor] = useState<Descritor | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchDescritores = async () => {
      try {
        setIsLoading(true);
        const data = await descritoresService.listarDescritores();
        setDescritores(data);
      } catch (error) {
        toast.error('Erro ao carregar descritores');
        console.error('Erro ao carregar descritores:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDescritores();
  }, []);

  const handleEdit = (descritor: Descritor) => {
    setEditingDescritor(descritor);
    setActiveTab('cadastrar');
  };

  const handleDelete = async (descritor: Descritor) => {
    try {
      await descritoresService.deletarDescritor(descritor.id);
      setDescritores(descritores.filter(d => d.id !== descritor.id));
      toast.success('Descritor excluído com sucesso');
    } catch (error) {
      toast.error('Erro ao excluir descritor');
      console.error('Erro ao excluir descritor:', error);
    }
  };

  const handleSubmit = async (descritorData: Omit<Descritor, 'id'>) => {
    try {
      if (editingDescritor) {
        await descritoresService.atualizarDescritor(editingDescritor.id, descritorData);
        setDescritores(descritores.map(d => (d.id === editingDescritor.id ? { ...d, ...descritorData } : d)));
        toast.success('Descritor atualizado com sucesso');
      } else {
        const newDescritor = await descritoresService.criarDescritor(descritorData);
        setDescritores([...descritores, newDescritor]);
        toast.success('Descritor criado com sucesso');
      }
      setActiveTab('listar');
      setEditingDescritor(null);
    } catch (error) {
      toast.error('Erro ao salvar descritor');
      console.error('Erro ao salvar descritor:', error);
    }
  };

  return (
    <MainLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Descritores</h1>
          <p className="text-muted-foreground">Gerencie os descritores cadastrados</p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="listar">Listar Descritores</TabsTrigger>
            <TabsTrigger value="cadastrar">{editingDescritor ? 'Editar Descritor' : 'Cadastrar Descritor'}</TabsTrigger>
          </TabsList>

          <TabsContent value="listar" className="space-y-4">
            {isLoading ? (
              <div>Carregando descritores...</div>
            ) : (
              <DescritoresList descritores={descritores} onEdit={handleEdit} onDelete={handleDelete} />
            )}
          </TabsContent>

          <TabsContent value="cadastrar" className="space-y-4">
            <DescritorForm
              descritor={editingDescritor}
              onSubmit={handleSubmit}
              onCancel={() => {
                setActiveTab('listar');
                setEditingDescritor(null);
              }}
            />
          </TabsContent>
        </Tabs>
      </div>
    </MainLayout>
  );
};

export default Descritores;
