/* eslint-disable @typescript-eslint/no-explicit-any */
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

interface DadosRelatorios {
  desempenhoTurmas: Array<{ turma: string; portugues: number; matematica: number }>;
  evolucaoDesempenho: Array<{ avaliacao: string; portugues: number; matematica: number }>;
  desempenhoHabilidades: Array<{ nome: string; percentual: number }>;
  desempenhoDescritores: Array<{ descritor: string; nome: string; percentual: number }>;
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
  
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [showStudentDetails, setShowStudentDetails] = useState(false);

  const [students, setStudents] = useState<Student[]>([]);
  const [loadingStudents, setLoadingStudents] = useState(false);
  const [errorStudents, setErrorStudents] = useState<string | null>(null);

  const [desempenhoTurmas, setDesempenhoTurmas] = useState<DadosRelatorios['desempenhoTurmas']>([]);
  const [evolucaoDesempenho, setEvolucaoDesempenho] = useState<DadosRelatorios['evolucaoDesempenho']>([]);
  const [desempenhoHabilidades, setDesempenhoHabilidades] = useState<DadosRelatorios['desempenhoHabilidades']>([]);
  const [desempenhoDescritores, setDesempenhoDescritores] = useState<DadosRelatorios['desempenhoDescritores']>([]);

  const handleFilterChange = (filterType: string, value: string) => {
    setSelectedFilters(prev => {
      if (filterType === 'turma') {
        return {
          ...prev,
          [filterType]: value,
          avaliacao: 'all_avaliacoes'
        };
      }

      return {
        ...prev,
        [filterType]: value
      };
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
        const dados = await avaliacoesService.obterDadosRelatorios({
          escolaId: selectedFilters.escola !== 'all_escolas' ? selectedFilters.escola : undefined,
          turmaId: selectedFilters.turma !== 'all_turmas' ? selectedFilters.turma : undefined,
          componente: selectedFilters.componente !== 'all_componentes' ? selectedFilters.componente : undefined,
        });

        // Mapear dados para o formato esperado pelos gráficos de descritores
        const desempenhoDescritoresMapped = (dados.desempenhoDescritores as any[]).map((d) => ({
          descritor: d.codigo,
          nome: d.nome,
          percentual: d.percentual
        }));

        setDesempenhoTurmas(dados?.desempenhoTurmas ?? []);
        setEvolucaoDesempenho(dados?.evolucaoDesempenho ?? []);
        setDesempenhoHabilidades(dados?.desempenhoHabilidades ?? []);
        setDesempenhoDescritores(desempenhoDescritoresMapped);
      } catch (error) {
        console.error('Erro ao buscar dados dos relatórios:', error);
      }
    }
    fetchRelatorioData();
  }, [selectedFilters]);

  useEffect(() => {
    const fetchStudents = async () => {
      if (selectedFilters.turma === 'all_turmas') {
        setStudents([]);
        return;
      }
      setLoadingStudents(true);
      setErrorStudents(null);
      try {
        const data = await avaliacoesService.listarPorTurma(selectedFilters.turma);
        // Mapear dados para o formato esperado
        const mappedStudents = data.map((aluno: any) => ({
          id: aluno.id,
          nome: aluno.nome,
          presente: false,
          portugues: null,
          matematica: null,
          media: null,
          descritores: null,
          transferida: false
        }));
        setStudents(mappedStudents);
      } catch (error) {
        setErrorStudents('Erro ao carregar alunos');
      } finally {
        setLoadingStudents(false);
      }
    };

    fetchStudents();
  }, [selectedFilters.turma]);

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

        <Tabs defaultValue="geral" className="space-y-4">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="geral">Visão Geral</TabsTrigger>
            <TabsTrigger value="descritores">Por Descritores</TabsTrigger>
            <TabsTrigger value="alunos">Por Alunos</TabsTrigger>
          </TabsList>

          <TabsContent value="geral" className="space-y-4">
            <PerformanceCharts 
              desempenhoTurmas={desempenhoTurmas}
              evolucaoDesempenho={evolucaoDesempenho}
              desempenhoHabilidades={desempenhoHabilidades}
            />
          </TabsContent>

          <TabsContent value="descritores" className="space-y-4">
            <DescriptorsCharts 
              desempenhoDescritores={desempenhoDescritores}
              componente={selectedFilters.componente}
            />
          </TabsContent>

          <TabsContent value="alunos" className="space-y-4">
            {loadingStudents && <p>Carregando alunos...</p>}
            {errorStudents && <p className="text-red-600">{errorStudents}</p>}
            {!loadingStudents && !errorStudents && (
              <StudentsTable 
                students={students}
                isTurmaSelected={selectedFilters.turma !== 'all_turmas'}
                selectedTurma={selectedTurma}
                onViewStudentDetails={handleViewStudentDetails}
              />
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
