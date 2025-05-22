import React from 'react';
import useAuth from '@/hooks/useAuth';
import { Filter, Loader2 } from 'lucide-react';
import MainLayout from '@/components/layout/MainLayout';
import FilterControls from '@/components/dashboard/FilterControls';
import DashboardCards from '@/components/dashboard/DashboardCards';
import PerformanceCharts from '@/components/dashboard/PerformanceCharts';
import DifficultyAnalysis from '@/components/dashboard/DifficultyAnalysis';
import StudentDescriptorAnalysis from '@/components/dashboard/StudentDescriptorAnalysis';
import { useDashboardData } from '@/hooks/useDashboardData';

const Dashboard: React.FC = () => {
  const { user, isSecretaria } = useAuth();
  const {
    selectedFilters,
    handleFilterChange,
    descritoresPorAluno,
    selectedAluno,
    setSelectedAluno,
    alunoHabilidades,
    isLoading
  } = useDashboardData();

  return (
    <MainLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">
            {isSecretaria 
              ? 'Visão geral do desempenho de todas as escolas' 
              : `Visão geral do desempenho da ${user?.schoolName || 'sua escola'}`}
          </p>
        </div>

        <div className="border p-4 rounded-md bg-muted/20">
          <div className="flex items-center gap-2 mb-4">
            <Filter className="h-5 w-5 text-muted-foreground" />
            <h2 className="text-lg font-medium">Filtros</h2>
          </div>
          <FilterControls 
            onFilterChange={handleFilterChange}
            selectedFilters={selectedFilters}
          />
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center h-64">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : (
          <>
            <DashboardCards isSecretaria={isSecretaria} />
            <PerformanceCharts isSecretaria={isSecretaria} />

            <div className="grid gap-4 md:grid-cols-2">
              <DifficultyAnalysis />
              
              <StudentDescriptorAnalysis 
                studentData={descritoresPorAluno}
                selectedStudent={selectedAluno}
                onStudentChange={setSelectedAluno}
                studentSkills={alunoHabilidades}
              />
            </div>
          </>
        )}
      </div>
    </MainLayout>
  );
};

export default Dashboard;
