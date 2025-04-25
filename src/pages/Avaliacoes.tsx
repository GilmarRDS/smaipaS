import React, { useState, useEffect } from 'react';
import MainLayout from '@/components/layout/MainLayout';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AvaliacaoForm } from '@/components/avaliacoes/AvaliacaoForm';
import { AvaliacoesList } from '@/components/avaliacoes/AvaliacoesList';
import { avaliacoesService } from '@/services/avaliacoesService';
import { Avaliacao } from '@/types/avaliacoes';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';

const Avaliacoes: React.FC = () => {
  const [activeTab, setActiveTab] = useState('listar');
  const [avaliacoes, setAvaliacoes] = useState<Avaliacao[]>([]);
  const [editingAvaliacao, setEditingAvaliacao] = useState<Avaliacao | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchAvaliacoes = async () => {
      try {
        setIsLoading(true);
        // Use listarPorEscola or listarPorTurma if needed, here using listarPorEscola with empty string as placeholder
        const data = await avaliacoesService.listarPorEscola('');
        setAvaliacoes(data);
      } catch (error) {
        toast.error('Erro ao carregar avaliações');
        console.error('Erro ao carregar avaliações:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAvaliacoes();
  }, []);

  const handleEdit = (avaliacao: Avaliacao) => {
    setEditingAvaliacao(avaliacao);
    setActiveTab('cadastrar');
  };

  const handleDelete = async (id: string) => {
    try {
      await avaliacoesService.deletarAvaliacao(id);
      setAvaliacoes(avaliacoes.filter(a => a.id !== id));
      toast.success('Avaliação deletada com sucesso');
    } catch (error) {
      toast.error('Erro ao deletar avaliação');
      console.error('Erro ao deletar avaliação:', error);
    }
  };

  const handleSubmit = async (avaliacaoData: Omit<Avaliacao, 'id'>) => {
    try {
      if (editingAvaliacao) {
        await avaliacoesService.atualizar(editingAvaliacao.id, avaliacaoData);
        setAvaliacoes(avaliacoes.map(a => (a.id === editingAvaliacao.id ? { ...a, ...avaliacaoData } : a)));
        toast.success('Avaliação atualizada com sucesso');
      } else {
        const newAvaliacao = await avaliacoesService.criar(avaliacaoData);
        setAvaliacoes([...avaliacoes, newAvaliacao]);
        toast.success('Avaliação criada com sucesso');
      }
      setActiveTab('listar');
      setEditingAvaliacao(null);
    } catch (error) {
      toast.error('Erro ao salvar avaliação');
      console.error('Erro ao salvar avaliação:', error);
    }
  };

  return (
    <MainLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Avaliações</h1>
          <p className="text-muted-foreground">Gerencie as avaliações aplicadas</p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="listar">Listar Avaliações</TabsTrigger>
            <TabsTrigger value="cadastrar">{editingAvaliacao ? 'Editar Avaliação' : 'Cadastrar Avaliação'}</TabsTrigger>
          </TabsList>

          <TabsContent value="listar" className="space-y-4">
            {isLoading ? (
              <div className="flex justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : (
              <AvaliacoesList avaliacoes={avaliacoes} onEdit={handleEdit} onDelete={handleDelete} />
            )}
          </TabsContent>

          <TabsContent value="cadastrar" className="space-y-4">
            <AvaliacaoForm
              avaliacao={editingAvaliacao}
              onSubmit={handleSubmit}
              onCancel={() => {
                setActiveTab('listar');
                setEditingAvaliacao(null);
              }}
            />
          </TabsContent>
        </Tabs>
      </div>
    </MainLayout>
  );
};

export default Avaliacoes;
