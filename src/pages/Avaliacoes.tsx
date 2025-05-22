import React, { useState, useEffect } from 'react';
import MainLayout from '@/components/layout/MainLayout';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AvaliacaoForm } from '@/components/avaliacoes/AvaliacaoForm';
import { AvaliacoesList } from '@/components/avaliacoes/AvaliacoesList';
import { avaliacoesService } from '@/services/avaliacoesService';
import { Avaliacao } from '@/types/avaliacoes';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';
import useAuth from '@/hooks/useAuth';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const Avaliacoes: React.FC = () => {
  const { user } = useAuth();
  const [abaAtiva, setAbaAtiva] = useState('listar');
  const [avaliacoes, setAvaliacoes] = useState<Avaliacao[]>([]);
  const [avaliacaoEditando, setAvaliacaoEditando] = useState<Avaliacao | null>(null);
  const [carregando, setCarregando] = useState(true);
  const [anoSelecionado, setAnoSelecionado] = useState<string>('todos');
  const [disciplinaSelecionada, setDisciplinaSelecionada] = useState<string>('todos');

  useEffect(() => {
    const buscarAvaliacoes = async () => {
      try {
        setCarregando(true);
        const dados = await avaliacoesService.listarTodas({
          ano: anoSelecionado === 'todos' ? '' : anoSelecionado,
          disciplina: disciplinaSelecionada === 'todos' ? '' : disciplinaSelecionada
        });
        setAvaliacoes(dados);
      } catch (erro) {
        toast.error('Erro ao carregar avaliações');
        console.error('Erro ao carregar avaliações:', erro);
      } finally {
        setCarregando(false);
      }
    };
    buscarAvaliacoes();
  }, [anoSelecionado, disciplinaSelecionada]);

  const handleEditar = (avaliacao: Avaliacao) => {
    setAvaliacaoEditando(avaliacao);
    setAbaAtiva('cadastrar');
  };

  const handleExcluir = async (avaliacao: Avaliacao) => {
    try {
      await avaliacoesService.deletar(avaliacao.id);
      setAvaliacoes(prev => prev.filter(a => a.id !== avaliacao.id));
      toast.success('Avaliação excluída com sucesso');
    } catch (erro) {
      toast.error('Erro ao excluir avaliação');
      console.error('Erro ao excluir avaliação:', erro);
    }
  };

  const handleEnviar = async (dados: Omit<Avaliacao, 'id'>) => {
    try {
      if (avaliacaoEditando) {
        await avaliacoesService.atualizar(avaliacaoEditando.id, dados);
        setAvaliacoes(prev => prev.map(a => a.id === avaliacaoEditando.id ? { ...a, ...dados } : a));
        toast.success('Avaliação atualizada com sucesso');
      } else {
        const novaAvaliacao = await avaliacoesService.criar(dados);
        setAvaliacoes(prev => [...prev, novaAvaliacao]);
        toast.success('Avaliação criada com sucesso');
      }
      setAbaAtiva('listar');
      setAvaliacaoEditando(null);
    } catch (erro) {
      toast.error('Erro ao salvar avaliação');
      console.error('Erro ao salvar avaliação:', erro);
    }
  };

  return (
    <MainLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Avaliações</h1>
          <p className="text-muted-foreground">Gerencie as avaliações aplicadas</p>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block mb-1 font-medium">Ano/Série</label>
            <Select value={anoSelecionado} onValueChange={setAnoSelecionado}>
              <SelectTrigger>
                <SelectValue placeholder="Todos os anos" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos</SelectItem>
                <SelectItem value="1">1º Ano</SelectItem>
                <SelectItem value="2">2º Ano</SelectItem>
                <SelectItem value="3">3º Ano</SelectItem>
                <SelectItem value="4">4º Ano</SelectItem>
                <SelectItem value="5">5º Ano</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="block mb-1 font-medium">Disciplina</label>
            <Select value={disciplinaSelecionada} onValueChange={setDisciplinaSelecionada}>
              <SelectTrigger>
                <SelectValue placeholder="Todas as disciplinas" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todas</SelectItem>
                <SelectItem value="PORTUGUES">Português</SelectItem>
                <SelectItem value="MATEMATICA">Matemática</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <Tabs value={abaAtiva} onValueChange={setAbaAtiva}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="listar">Listar Avaliações</TabsTrigger>
            <TabsTrigger value="cadastrar">{avaliacaoEditando ? 'Editar Avaliação' : 'Cadastrar Avaliação'}</TabsTrigger>
          </TabsList>

          <TabsContent value="listar" className="space-y-4">
            {carregando ? (
              <div className="flex justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : (
              <AvaliacoesList avaliacoes={avaliacoes} onEdit={handleEditar} onDelete={handleExcluir} />
            )}
          </TabsContent>

          <TabsContent value="cadastrar" className="space-y-4">
            <AvaliacaoForm
              avaliacao={avaliacaoEditando}
              onSubmit={handleEnviar}
              onCancel={() => {
                setAbaAtiva('listar');
                setAvaliacaoEditando(null);
              }}
            />
          </TabsContent>
        </Tabs>
      </div>
    </MainLayout>
  );
};

export default Avaliacoes;
