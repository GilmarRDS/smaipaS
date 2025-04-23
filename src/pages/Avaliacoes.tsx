import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react'; // pacotes externos não precisam de @ ou caminho relativo
import { toast } from 'sonner';
import { Avaliacao } from '@/types/avaliacoes';
import { avaliacoesService } from '@/services/avaliacoesService';
import { AvaliacoesList } from '@/components/avaliacoes/AvaliacoesList';
import { AvaliacaoForm } from '@/components/avaliacoes/AvaliacaoForm';
import { Loader2 } from 'lucide-react'; // esse continua igual, porque é pacote externo
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { escolasService } from '@/services/escolasService';
import { Escola } from '@/types/escolas';

const Avaliacoes = () => {
  const { user } = useAuth();
  const [avaliacoes, setAvaliacoes] = useState<Avaliacao[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [selectedAvaliacao, setSelectedAvaliacao] = useState<Avaliacao | null>(null);
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
      console.error('Erro ao carregar escolas:', error);
      toast.error('Erro ao carregar escolas');
    }
  }, []);

  const loadAvaliacoes = useCallback(async () => {
    try {
      setLoading(true);
      let data: Avaliacao[] = [];
      
      if (user?.role === 'secretaria') {
        if (selectedEscolaId) {
          data = await avaliacoesService.listarPorEscola(selectedEscolaId);
        } else {
          // Se não houver escola selecionada, carregar todas as avaliações
          const promises = escolas.map(escola => 
            avaliacoesService.listarPorEscola(escola.id)
          );
          const results = await Promise.all(promises);
          data = results.flat();
        }
      } else if ((user as { escolaId?: string })?.escolaId) {
        data = await avaliacoesService.listarPorEscola((user as { escolaId?: string }).escolaId!);
      }
      
      setAvaliacoes(data || []);
    } catch (error) {
      console.error('Erro ao carregar avaliações:', error);
      toast.error('Erro ao carregar avaliações. Por favor, tente novamente.');
      setAvaliacoes([]);
    } finally {
      setLoading(false);
    }
  }, [user?.role, user, selectedEscolaId, escolas]);

  useEffect(() => {
    if (user?.role === 'secretaria') {
      loadEscolas();
    }
  }, [user?.role, loadEscolas]);

  useEffect(() => {
    loadAvaliacoes();
  }, [loadAvaliacoes]);

  const handleCreate = () => {
    setSelectedAvaliacao(null);
    setShowForm(true);
  };

  const handleEdit = (avaliacao: Avaliacao) => {
    setSelectedAvaliacao(avaliacao);
    setShowForm(true);
  };

  const handleDelete = async (avaliacao: Avaliacao) => {
    try {
      await avaliacoesService.deletarAvaliacao(avaliacao.id);
      toast.success('Avaliação excluída com sucesso');
      loadAvaliacoes();
    } catch (error) {
      toast.error('Erro ao excluir avaliação');
      console.error(error);
    }
  };

  const handleSubmit = async (data: Partial<Avaliacao>) => {
    if (!user?.schoolId && user?.role !== 'secretaria') {
      toast.error('Usuário não possui escola associada');
      return;
    }

    try {
      if (selectedAvaliacao) {
        await avaliacoesService.atualizarAvaliacao(selectedAvaliacao.id, {
          ...data,
          disciplina: data.disciplina
        });
        toast.success('Avaliação atualizada com sucesso');
      } else {
        if (!data.turmaId) {
          toast.error('É necessário selecionar uma turma');
          return;
        }
        
        await avaliacoesService.criarAvaliacao({
          ...data,
          escolaId: user?.role === 'secretaria' ? selectedEscolaId : user.schoolId,
          turmaId: data.turmaId,
          disciplina: data.disciplina
        } as Omit<Avaliacao, 'id'>);
        toast.success('Avaliação criada com sucesso');
      }
      setShowForm(false);
      loadAvaliacoes();
    } catch (error) {
      toast.error('Erro ao salvar avaliação');
      console.error(error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!(user as { escolaId?: string })?.escolaId && user?.role !== 'secretaria') {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-muted-foreground">Usuário não possui escola associada</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Avaliações</h1>
        <div className="flex items-center gap-4">
          {user?.role === 'secretaria' && escolas.length > 0 && (
            <Select
              value={selectedEscolaId}
              onValueChange={setSelectedEscolaId}
            >
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Selecione uma escola" />
              </SelectTrigger>
              <SelectContent>
                {escolas.map(escola => (
                  <SelectItem key={escola.id} value={escola.id}>
                    {escola.nome}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
          <Button onClick={handleCreate}>
            <Plus className="mr-2 h-4 w-4" />
            Nova Avaliação
          </Button>
        </div>
      </div>

      {showForm ? (
        <AvaliacaoForm
          avaliacao={selectedAvaliacao}
          onSubmit={handleSubmit}
          onCancel={() => setShowForm(false)}
        />
      ) : (
        <AvaliacoesList
          avaliacoes={avaliacoes}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
      )}
    </div>
  );
};

export default Avaliacoes;
