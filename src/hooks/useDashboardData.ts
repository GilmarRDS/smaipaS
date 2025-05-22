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

interface TurmaData {
  turma: string;
  portugues: number;
  matematica: number;
  presentes?: number;
  ausentes?: number;
}

interface DescritorData {
  alunoId: string;
  aluno: string;
  turmaId: string;
  turmaNome: string;
  codigo: string;
  nome: string;
  percentual: number;
}

interface FilterState {
  escolaId?: string;
  turmaId?: string;
  periodo?: string;
}

interface ApiResponse {
  evolucaoDesempenho: Array<{
    avaliacao: string;
    portugues: number;
    matematica: number;
  }>;
  desempenhoTurmas: TurmaData[];
  desempenhoDescritores: DescritorData[];
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
        const escolaId = selectedFilters.escolaId || user?.schoolId;
        if (!escolaId) {
          throw new Error('ID da escola não encontrado');
        }

        // Buscar dados dos relatórios
        const response = await api.get<ApiResponse>(`/api/relatorios/dados?escolaId=${escolaId}`);
        const dadosRelatorios = response.data;

        console.log('Dados brutos da API:', dadosRelatorios);

        // Processar dados de desempenho
        const performance = dadosRelatorios.evolucaoDesempenho || [];

        // Processar dados de presença
        const presenca = dadosRelatorios.desempenhoTurmas?.map((turma: TurmaData) => ({
          turma: turma.turma,
          presentes: turma.presentes || 0,
          ausentes: turma.ausentes || 0
        })) || [];

        // Processar dados de descritores por aluno
        const descritoresPorAluno = dadosRelatorios.desempenhoDescritores?.reduce((acc: Array<{
          alunoId: string;
          aluno: string;
          turmaId: string;
          turmaNome: string;
          descritores: Array<{
            codigo: string;
            nome: string;
            percentual: number;
          }>;
        }>, desc: DescritorData) => {
          const alunoIndex = acc.findIndex(a => a.alunoId === desc.alunoId);
          if (alunoIndex === -1) {
            acc.push({
              alunoId: desc.alunoId,
              aluno: desc.aluno,
              turmaId: desc.turmaId,
              turmaNome: desc.turmaNome,
              descritores: [{
                codigo: desc.codigo,
                nome: desc.nome,
                percentual: desc.percentual
              }]
            });
          } else {
            acc[alunoIndex].descritores.push({
              codigo: desc.codigo,
              nome: desc.nome,
              percentual: desc.percentual
            });
          }
          return acc;
        }, []) || [];

        const processedData = {
          performance,
          presenca,
          descritoresPorAluno
        };

        console.log('Dados processados:', processedData);
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
  }, [user?.schoolId, selectedFilters]);

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
