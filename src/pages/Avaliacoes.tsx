import React, { useState, useEffect } from 'react';
import MainLayout from '@/components/layout/MainLayout';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AvaliacaoForm } from '@/components/avaliacoes/AvaliacaoForm';
import { AvaliacoesList } from '@/components/avaliacoes/AvaliacoesList';
import { avaliacoesService } from '@/services/avaliacoesService';
import { escolasService } from '@/services/escolasService';
import { Avaliacao } from '@/types/avaliacoes';
import { Escola } from '@/types/escolas';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';
import useAuth from '@/hooks/useAuth';

const Avaliacoes: React.FC = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('listar');
  const [avaliacoes, setAvaliacoes] = useState<Avaliacao[]>([]);
  const [editingAvaliacao, setEditingAvaliacao] = useState<Avaliacao | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [escolas, setEscolas] = useState<Escola[]>([]);
  const [selectedEscolaId, setSelectedEscolaId] = useState<string>('');

  useEffect(() => {
    const loadEscolas = async () => {
      if (user?.role === 'secretaria') {
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
      } else if (user?.role === 'escola') {
        if (user.schoolId) {
          setSelectedEscolaId(user.schoolId);
        }
      }
    };
    loadEscolas();
  }, [user]);

  useEffect(() => {
    const fetchAvaliacoes = async () => {
      if (!selectedEscolaId) {
        setAvaliacoes([]);
        return;
      }
      try {
        setIsLoading(true);
        const data = await avaliacoesService.listarPorEscola(selectedEscolaId);
        setAvaliacoes(data);
      } catch (error) {
        toast.error('Erro ao carregar avaliações');
        console.error('Erro ao carregar avaliações:', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchAvaliacoes();
  }, [selectedEscolaId]);

  const handleEdit = (avaliacao: Avaliacao) => {
    setEditingAvaliacao(avaliacao);
    setActiveTab('cadastrar');
  };

  const handleDelete = async (avaliacao: Avaliacao) => {
    try {
      await avaliacoesService.deletar(avaliacao.id);
      setAvaliacoes(avaliacoes.filter(a => a.id !== avaliacao.id));
      toast.success('Avaliação deletada com sucesso');
    } catch (error) {
      toast.error('Erro ao deletar avaliação');
      console.error('Erro ao deletar avaliação:', error);
    }
  };

  const handleSubmit = async (avaliacaoData: Omit<Avaliacao, 'id'>) => {
    try {
      if (editingAvaliacao) {
        const updated = await avaliacoesService.atualizar(editingAvaliacao.id, avaliacaoData);
        setAvaliacoes(avaliacoes.map(a => (a.id === editingAvaliacao.id ? updated : a)));
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
              schoolId={selectedEscolaId}
            />
          </TabsContent>
        </Tabs>
      </div>
    </MainLayout>
  );
};

export default Avaliacoes;
