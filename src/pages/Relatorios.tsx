
import React, { useState } from 'react';
import MainLayout from '@/components/layout/MainLayout';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/contexts/AuthContext';
import FilterControls from '@/components/dashboard/FilterControls';
import { TURMAS_MOCK } from '@/types/turmas';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import StudentDetailsView from '@/components/relatorios/StudentDetailsView';
import PerformanceCharts from '@/components/relatorios/PerformanceCharts';
import DescriptorsCharts from '@/components/relatorios/DescriptorsCharts';
import StudentsTable from '@/components/relatorios/StudentsTable';
import { filterData, mockStudentData } from '@/utils/relatoriosUtils';

const Relatorios: React.FC = () => {
  const { isSecretaria, user } = useAuth();
  const [selectedFilters, setSelectedFilters] = useState({
    escola: 'all_escolas',
    turma: 'all_turmas',
    turno: 'all_turnos',
    componente: 'all_componentes',
    avaliacao: 'all_avaliacoes'
  });
  
  const [selectedStudent, setSelectedStudent] = useState<any>(null);
  const [showStudentDetails, setShowStudentDetails] = useState(false);
  
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
  
  const { 
    desempenhoTurmas: filteredDesempenhoTurmas, 
    evolucaoDesempenho: filteredEvolucaoDesempenho,
    desempenhoHabilidades: filteredDesempenhoHabilidades,
    desempenhoDescritores: filteredDesempenhoDescritores
  } = filterData(selectedFilters);
  
  const handleViewStudentDetails = (student: any) => {
    setSelectedStudent(student);
    setShowStudentDetails(true);
  };
  
  const selectedTurma = selectedFilters.turma !== 'all_turmas' 
    ? TURMAS_MOCK.find(turma => turma.id === selectedFilters.turma) 
    : undefined;
  
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
              desempenhoTurmas={filteredDesempenhoTurmas}
              evolucaoDesempenho={filteredEvolucaoDesempenho}
              desempenhoHabilidades={filteredDesempenhoHabilidades}
            />
          </TabsContent>
          
          <TabsContent value="descritores" className="space-y-4">
            <DescriptorsCharts 
              desempenhoDescritores={filteredDesempenhoDescritores}
              componente={selectedFilters.componente}
            />
          </TabsContent>
          
          <TabsContent value="alunos" className="space-y-4">
            <StudentsTable 
              students={mockStudentData}
              isTurmaSelected={selectedFilters.turma !== 'all_turmas'}
              selectedTurma={selectedTurma}
              onViewStudentDetails={handleViewStudentDetails}
            />
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
