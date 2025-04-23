import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { toast } from 'sonner';
import { Descritor } from '@/types/descritores';
import { descritoresService } from '@/services/descritoresService';
import { DescritoresList } from '@/components/descritores/DescritoresList';
import { DescritorForm } from '@/components/descritores/DescritorForm';

const Descritores = () => {
  const { user } = useAuth();
  const [descritores, setDescritores] = useState<Descritor[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [selectedDescritor, setSelectedDescritor] = useState<Descritor | null>(null);

  useEffect(() => {
    loadDescritores();
  }, []);

  const loadDescritores = async () => {
    try {
      setLoading(true);
      const data = await descritoresService.listarDescritores();
      setDescritores(data);
    } catch (error) {
      toast.error('Erro ao carregar descritores');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = () => {
    setSelectedDescritor(null);
    setShowForm(true);
  };

  const handleEdit = (descritor: Descritor) => {
    setSelectedDescritor(descritor);
    setShowForm(true);
  };

  const handleDelete = async (descritor: Descritor) => {
    try {
      await descritoresService.deletarDescritor(descritor.id);
      toast.success('Descritor excluído com sucesso');
      loadDescritores();
    } catch (error) {
      toast.error('Erro ao excluir descritor');
      console.error(error);
    }
  };

  const handleSubmit = async (data: Partial<Descritor>) => {
    try {
      if (selectedDescritor) {
        await descritoresService.atualizarDescritor(selectedDescritor.id, data);
        toast.success('Descritor atualizado com sucesso');
      } else {
        await descritoresService.criarDescritor(data);
        toast.success('Descritor criado com sucesso');
      }
      setShowForm(false);
      loadDescritores();
    } catch (error) {
      toast.error('Erro ao salvar descritor');
      console.error(error);
    }
  };

  if (loading) {
    return <div>Carregando...</div>;
  }
  
  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Descritores</h1>
        <Button onClick={handleCreate}>
          <Plus className="w-4 h-4 mr-2" />
          Novo Descritor
        </Button>
          </div>
          
      {showForm ? (
        <DescritorForm
          descritor={selectedDescritor}
          onSubmit={handleSubmit}
          onCancel={() => setShowForm(false)}
        />
      ) : (
        <DescritoresList
          descritores={descritores}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
          )}
        </div>
  );
};

export default Descritores;
