import React, { useState, useEffect } from 'react';
import MainLayout from '../components/layout/MainLayout';
import { Card, CardContent } from '../components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import useAuth from '@/hooks/useAuth';
import FilterControls from '../components/dashboard/FilterControls';
import { turmasService } from '../services/turmasService';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '../components/ui/dialog';
import StudentDetailsView from '../components/relatorios/StudentDetailsView';
import PerformanceCharts from '../components/relatorios/PerformanceCharts';
import DescriptorsCharts from '../components/relatorios/DescriptorsCharts';
import StudentsTable from '../components/relatorios/StudentsTable';
import { avaliacoesService } from '../services/avaliacoesService';
import type { Descriptor } from '@/components/relatorios/DescriptorsCharts';
import { toast } from 'sonner';

interface Student {
  id: string;
  nome: string;
  presente: boolean;
  portugues: number | null;
  matematica: number | null;
  media: number | null;
  transferida?: boolean;
  descritores: {
    portugues: Array<{
      codigo: string;
      nome: string;
      percentual: number;
    }> | null;
    matematica: Array<{
      codigo: string;
      nome: string;
      percentual: number;
    }> | null;
  } | null;
}

interface AlunoDesempenho {
  id: string;
  nome: string;
  desempenho: {
    portugues: number;
    matematica: number;
    media: number;
    habilidades: {
      leitura?: number;
      escrita?: number;
      interpretacao?: number;
      calculo?: number;
      raciocinio?: number;
      resolucao?: number;
    };
  };
  presente: boolean;
  transferida: boolean;
  descritores: {
    portugues: Array<{
      codigo: string;
      nome: string;
      percentual: number;
    }> | null;
    matematica: Array<{
      codigo: string;
      nome: string;
      percentual: number;
    }> | null;
  } | null;
}

interface DadosRelatorios {
  desempenhoTurmas: Array<{
    turmaId: string;
    nomeTurma: string;
    mediaPortugues: number;
    mediaMatematica: number;
    totalAlunos: number;
    alunos: AlunoDesempenho[];
  }>;
  evolucaoDesempenho: Array<{
    avaliacao: string;
    nomeAvaliacao: string;
    media: number;
    portugues: number;
    matematica: number;
  }>;
  desempenhoHabilidades: Array<{ nome: string; percentual: number }>;
  desempenhoDescritores: Array<{ 
    codigo: string;
    nome: string; 
    percentual: number;
  }>;
}

const Relatorios: React.FC = () => {
  const { isSecretaria, user } = useAuth();
  const [selectedFilters, setSelectedFilters] = useState({
    escola: 'all_escolas',
    turma: 'all_turmas',
    turno: 'all_turnos',
    componente: 'all_componentes',
    avaliacao: 'all_avaliacoes'
  });
  
  const [desempenhoTurmas, setDesempenhoTurmas] = useState<DadosRelatorios['desempenhoTurmas']>([]);
  const [evolucaoDesempenho, setEvolucaoDesempenho] = useState<DadosRelatorios['evolucaoDesempenho']>([]);
  const [desempenhoHabilidades, setDesempenhoHabilidades] = useState<DadosRelatorios['desempenhoHabilidades']>([]);
  const [desempenhoDescritores, setDesempenhoDescritores] = useState<Descriptor[]>([]);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [showStudentDetails, setShowStudentDetails] = useState(false);
  const [loadingStudents, setLoadingStudents] = useState(false);
  const [errorStudents, setErrorStudents] = useState<string | null>(null);
  const [selectedTab, setSelectedTab] = useState('geral');

  const handleFilterChange = (filterType: string, value: string) => {
    setSelectedFilters(prev => {
      const newFilters = {
        ...prev,
        [filterType]: value
      };

      // Se mudar a turma, resetar a avaliação
      if (filterType === 'turma') {
        newFilters.avaliacao = 'all_avaliacoes';
      }

      // Se mudar a escola, resetar turma e avaliação
      if (filterType === 'escola') {
        newFilters.turma = 'all_turmas';
        newFilters.avaliacao = 'all_avaliacoes';
      }

      return newFilters;
    });
  };

  const handleViewStudentDetails = (student: Student) => {
    setSelectedStudent(student);
    setShowStudentDetails(true);
  };

  const [turmas, setTurmas] = React.useState<Array<{id: string; nome: string}>>([]);

  React.useEffect(() => {
    async function fetchTurmas() {
      if (selectedFilters.escola === 'all_escolas') {
        setTurmas([]);
        return;
      }
      try {
        const turmasData = await turmasService.listar(selectedFilters.escola);
        setTurmas(turmasData);
      } catch (error) {
        console.error('Erro ao buscar turmas:', error);
        setTurmas([]);
      }
    }
    fetchTurmas();
  }, [selectedFilters.escola]);

  const selectedTurma = selectedFilters.turma !== 'all_turmas' 
    ? turmas.find(turma => turma.id === selectedFilters.turma) 
    : undefined;

  useEffect(() => {
    async function fetchRelatorioData() {
      try {
        console.log('Buscando dados com filtros:', selectedFilters);
        
        const dados = await avaliacoesService.obterDadosRelatorios({
          escolaId: selectedFilters.escola !== 'all_escolas' ? selectedFilters.escola : undefined,
          turmaId: selectedFilters.turma !== 'all_turmas' ? selectedFilters.turma : undefined,
          componente: selectedFilters.componente !== 'all_componentes' ? selectedFilters.componente : undefined,
          avaliacaoId: selectedFilters.avaliacao !== 'all_avaliacoes' ? selectedFilters.avaliacao : undefined
        });

        console.log('Dados recebidos:', dados);

        // Mapear dados para o formato esperado pelos gráficos de descritores
        const desempenhoDescritoresMapped: Descriptor[] = (dados.desempenhoDescritores || []).map((d) => {
          console.log('Mapeando descritor:', d);
          return {
            descritor: d.codigo || d.descritor,
            nome: d.nome,
            percentual: d.percentual,
            componente: d.componente
          };
        });

        console.log('Dados mapeados dos descritores:', {
          original: dados.desempenhoDescritores,
          mapeado: desempenhoDescritoresMapped
        });

        // Verificar se há dados antes de atualizar o estado
        const hasData = dados.desempenhoTurmas?.length > 0 || 
                       dados.evolucaoDesempenho?.length > 0 || 
                       dados.desempenhoHabilidades?.length > 0 || 
                       desempenhoDescritoresMapped.length > 0;

        console.log('Dados processados:', {
          hasData,
          desempenhoTurmas: dados.desempenhoTurmas?.length || 0,
          evolucaoDesempenho: dados.evolucaoDesempenho?.length || 0,
          desempenhoHabilidades: dados.desempenhoHabilidades?.length || 0,
          desempenhoDescritores: desempenhoDescritoresMapped.length,
          detalhes: {
            desempenhoTurmas: dados.desempenhoTurmas?.map(t => ({
              turma: t.nomeTurma,
              alunos: t.alunos?.length || 0,
              mediaPortugues: t.mediaPortugues,
              mediaMatematica: t.mediaMatematica
            })),
            evolucaoDesempenho: dados.evolucaoDesempenho?.map(e => ({
              avaliacao: e.nomeAvaliacao,
              media: e.media,
              portugues: e.portugues,
              matematica: e.matematica
            })),
            desempenhoHabilidades: dados.desempenhoHabilidades?.map(h => ({
              nome: h.nome,
              percentual: h.percentual
            })),
            desempenhoDescritores: desempenhoDescritoresMapped.map(d => ({
              descritor: d.descritor,
              nome: d.nome,
              percentual: d.percentual,
              componente: d.componente
            }))
          }
        });

        if (hasData) {
          setDesempenhoTurmas(dados.desempenhoTurmas || []);
          setEvolucaoDesempenho(dados.evolucaoDesempenho || []);
          setDesempenhoHabilidades(dados.desempenhoHabilidades || []);
          setDesempenhoDescritores(desempenhoDescritoresMapped);
        } else {
          console.log('Nenhum dado disponível para os filtros selecionados');
          setDesempenhoTurmas([]);
          setEvolucaoDesempenho([]);
          setDesempenhoHabilidades([]);
          setDesempenhoDescritores([]);
        }
      } catch (error) {
        console.error('Erro ao buscar dados dos relatórios:', error);
        toast.error('Erro ao carregar dados dos relatórios. Por favor, tente novamente.');
        setDesempenhoTurmas([]);
        setEvolucaoDesempenho([]);
        setDesempenhoHabilidades([]);
        setDesempenhoDescritores([]);
      }
    }
    fetchRelatorioData();
  }, [selectedFilters]);

  // Extract students from the selected turma's performance data
  const studentsForTable = selectedFilters.turma !== 'all_turmas'
    ? desempenhoTurmas.find(turma => turma.turmaId === selectedFilters.turma)?.alunos.map((aluno: AlunoDesempenho): Student => ({
        id: aluno.id,
        nome: aluno.nome,
        presente: aluno.presente,
        transferida: aluno.transferida,
        portugues: aluno.desempenho?.portugues ?? null,
        matematica: aluno.desempenho?.matematica ?? null,
        media: aluno.desempenho?.media ?? null,
        descritores: aluno.descritores
      })) || []
    : [];

  return (
    <MainLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Relatórios</h1>
          <p className="text-muted-foreground">
            Analise o desempenho dos alunos nas avaliações
          </p>
        </div>

        <Card className="bg-smaipa-50/50 border-smaipa-100">
          <CardContent className="pt-6">
            <FilterControls 
              onFilterChange={handleFilterChange}
              selectedFilters={selectedFilters}
            />
          </CardContent>
        </Card>

        <Tabs value={selectedTab} onValueChange={setSelectedTab} className="space-y-4">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="geral">Visão Geral</TabsTrigger>
            <TabsTrigger value="descritores">Por Descritores</TabsTrigger>
            <TabsTrigger value="alunos">Por Alunos</TabsTrigger>
          </TabsList>

          <TabsContent value="geral" className="space-y-4">
            {desempenhoTurmas.length === 0 && 
             evolucaoDesempenho.length === 0 && 
             desempenhoHabilidades.length === 0 && 
             desempenhoDescritores.length === 0 ? (
              <p className="text-center text-muted-foreground">Nenhum dado disponível para os filtros selecionados.</p>
            ) : (
              <PerformanceCharts 
                dados={{
                  evolucao: evolucaoDesempenho.map(item => ({
                    periodo: item.nomeAvaliacao || item.avaliacao,
                    media: item.media || ((item.portugues || 0) + (item.matematica || 0)) / 2,
                    meta: 100
                  })),
                  desempenho: desempenhoTurmas.map(item => {
                    const mediaPortugues = item?.mediaPortugues ?? 0;
                    const mediaMatematica = item?.mediaMatematica ?? 0;

                    return {
                      categoria: item?.nomeTurma || 'Desconhecida',
                      quantidade: (mediaPortugues + mediaMatematica) / 2
                    };
                  })
                }}
              />
            )}
          </TabsContent>

          <TabsContent value="descritores" className="space-y-4">
            {desempenhoDescritores.length === 0 ? (
              <p className="text-center text-muted-foreground">Nenhum dado disponível para os filtros selecionados.</p>
            ) : (
              <DescriptorsCharts 
                desempenhoDescritores={desempenhoDescritores}
                componente={selectedFilters.componente}
              />
            )}
          </TabsContent>

          <TabsContent value="alunos" className="space-y-4">
            {loadingStudents && <p>Carregando alunos...</p>}
            {errorStudents && <p className="text-red-600">{errorStudents}</p>}
            {!loadingStudents && !errorStudents && (
              <StudentsTable 
                students={studentsForTable}
                isTurmaSelected={selectedFilters.turma !== 'all_turmas'}
                selectedTurma={selectedTurma}
                onViewStudentDetails={handleViewStudentDetails}
              />
            )}
            {!loadingStudents && !errorStudents && selectedFilters.turma !== 'all_turmas' && studentsForTable.length === 0 && (
               <p className="text-center text-muted-foreground">Nenhum aluno encontrado para a turma selecionada com dados de desempenho.</p>
            )}
          </TabsContent>
        </Tabs>
      </div>

      <Dialog open={showStudentDetails} onOpenChange={setShowStudentDetails}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Detalhes do Aluno: {selectedStudent?.nome}</DialogTitle>
            <DialogDescription>
              Desempenho detalhado nas avaliações
            </DialogDescription>
          </DialogHeader>
          {selectedStudent && <StudentDetailsView student={selectedStudent} />}
        </DialogContent>
      </Dialog>
    </MainLayout>
  );
};

export default Relatorios;
