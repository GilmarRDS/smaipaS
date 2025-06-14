import { useState, useEffect } from 'react';
import useAuth from './useAuth';
import api from '@/lib/api';
import { toast } from 'sonner';

interface DashboardData {
  performance: Array<{
    avaliacao: string;
    portugues: number;
    matematica: number;
  }>;
  presenca: Array<{
    turma: string;
    presentes: number;
    ausentes: number;
  }>;
  descritoresPorAluno: Array<{
    alunoId: string;
    aluno: string;
    turmaId: string;
    turmaNome: string;
    descritores: Array<{
      codigo: string;
      nome: string;
      percentual: number;
    }>;
  }>;
}

interface FilterState {
  escolaId?: string;
  turmaId?: string;
  periodo?: string;
}

interface Descritor {
  codigo: string;
  nome: string;
  percentual: number;
}

interface Aluno {
  id: string;
  nome: string;
  presente: boolean;
  transferida: boolean;
  portugues: number | null;
  matematica: number | null;
  media: number | null;
  descritores: {
    portugues: Descritor[];
    matematica: Descritor[];
  };
}

interface DesempenhoTurma {
  turmaId: string;
  nomeTurma: string;
  mediaPortugues: number;
  mediaMatematica: number;
  totalAlunos: number;
  alunos: Aluno[];
}

interface ApiResponse {
  desempenhoTurmas: DesempenhoTurma[];
  evolucaoDesempenho: Array<{
    avaliacao: string;
    portugues: number;
    matematica: number;
  }>;
  desempenhoHabilidades: Array<{
    nome: string;
    percentual: number;
  }>;
  desempenhoDescritores: Array<{
    codigo: string;
    nome: string;
    percentual: number;
  }>;
}

export function useDashboardData() {
  const { user } = useAuth();
  const [data, setData] = useState<DashboardData>({
    performance: [],
    presenca: [],
    descritoresPorAluno: []
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedFilters, setSelectedFilters] = useState<FilterState>({});
  const [selectedAluno, setSelectedAluno] = useState<string | null>(null);
  const [alunoHabilidades, setAlunoHabilidades] = useState<Array<{ codigo: string; nome: string; percentual: number }>>([]);

  const handleFilterChange = (filters: FilterState) => {
    setSelectedFilters(filters);
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // Determinar o ID da escola a ser usado
        let escolaId = selectedFilters.escolaId || user?.schoolId;

        // Se o usuário não for do tipo 'escola' e escolaId estiver vazio, permitir undefined para evitar erro
        if (!escolaId && user?.role !== 'escola') {
          escolaId = undefined;
        }

        if (!escolaId && user?.role === 'escola') {
          throw new Error('ID da escola não encontrado');
        }

        console.log('Buscando dados com filtros:', {
          escolaId,
          turmaId: selectedFilters.turmaId,
          componente: selectedFilters.periodo
        });

        // Buscar dados dos relatórios
        const response = await api.get<ApiResponse>(`/avaliacoes/relatorios/dados`, {
          params: {
            escolaId,
            turmaId: selectedFilters.turmaId,
            componente: selectedFilters.periodo
          }
        });

        console.log('Resposta completa da API:', JSON.stringify(response.data, null, 2));
        const dadosRelatorios = response.data;

        // Verificar se os dados necessários existem
        if (!dadosRelatorios) {
          console.error('Dados da API estão vazios ou undefined');
          throw new Error('Dados da API estão vazios ou undefined');
        }

        // Mapear dados de desempenho
        const desempenhoTurmas = dadosRelatorios.desempenhoTurmas || [];
        console.log('Dados de desempenhoTurmas mapeados:', JSON.stringify(desempenhoTurmas, null, 2));

        // Mapear dados de desempenho para performance e presenca
        const performance = desempenhoTurmas.map(turma => ({
          avaliacao: turma.nomeTurma,
          portugues: turma.mediaPortugues,
          matematica: turma.mediaMatematica
        }));

        const presenca = desempenhoTurmas.map(turma => ({
          turma: turma.nomeTurma,
          presentes: turma.alunos.filter(a => a.presente).length,
          ausentes: turma.alunos.filter(a => !a.presente).length
        }));

        // Mapear dados de descritores por aluno
        const descritoresPorAluno = desempenhoTurmas.flatMap(turma =>
          turma.alunos.map(aluno => ({
            alunoId: aluno.id,
            aluno: aluno.nome,
            turmaId: turma.turmaId,
            turmaNome: turma.nomeTurma,
            descritores: [
          ...aluno.descritores.portugues.map((d: Descritor) => ({
            codigo: d.codigo,
            nome: d.nome,
            percentual: d.percentual
          })),
          ...aluno.descritores.matematica.map((d: Descritor) => ({
            codigo: d.codigo,
            nome: d.nome,
            percentual: d.percentual
          }))
            ]
          }))
        );

        console.log('Dados de descritores mapeados:', JSON.stringify(descritoresPorAluno, null, 2));
        console.log('Número de itens:', descritoresPorAluno.length);

        // Verificar se os dados estão vazios
        if (!performance.length && !presenca.length && !descritoresPorAluno.length) {
          console.warn('Todos os dados estão vazios após o mapeamento');
        }

        const processedData = {
          performance,
          presenca,
          descritoresPorAluno
        };

        console.log('Dados processados finais:', JSON.stringify(processedData, null, 2));
        console.log('Tipo dos dados processados:', {
          performance: typeof processedData.performance,
          presenca: typeof processedData.presenca,
          descritoresPorAluno: typeof processedData.descritoresPorAluno
        });

        setData(processedData);
      } catch (err) {
        console.error('Erro ao carregar dados do dashboard:', err);
        setError('Erro ao carregar dados do dashboard');
        toast.error('Erro ao carregar dados do dashboard');
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [user?.schoolId, selectedFilters, user?.role]);

  // Atualizar habilidades do aluno selecionado
  useEffect(() => {
    if (selectedAluno) {
      const aluno = data.descritoresPorAluno.find(a => a.alunoId === selectedAluno);
      if (aluno) {
        setAlunoHabilidades(aluno.descritores);
      }
    } else {
      setAlunoHabilidades([]);
    }
  }, [selectedAluno, data.descritoresPorAluno]);

  return {
    data,
    isLoading,
    error,
    selectedFilters,
    handleFilterChange,
    descritoresPorAluno: data.descritoresPorAluno,
    selectedAluno,
    setSelectedAluno,
    alunoHabilidades
  };
}
