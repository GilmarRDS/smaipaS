import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import MainLayout from '@/components/layout/MainLayout';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import FilterControls from '@/components/dashboard/FilterControls';
import { Filter } from 'lucide-react';
import { TURMAS_MOCK } from '@/types/turmas';
import { ESCOLAS_MOCK } from '@/types/escolas';

// Dados simulados para os gráficos
const originalPerformanceData = [
  { mes: 'Jan', portugues: 65, matematica: 60 },
  { mes: 'Fev', portugues: 68, matematica: 62 },
  { mes: 'Mar', portugues: 72, matematica: 65 },
  { mes: 'Abr', portugues: 70, matematica: 68 },
  { mes: 'Mai', portugues: 74, matematica: 72 },
  { mes: 'Jun', portugues: 78, matematica: 75 },
];

const originalPresencaData = [
  { turma: '1º Ano', presentes: 92, ausentes: 8 },
  { turma: '2º Ano', presentes: 88, ausentes: 12 },
  { turma: '3º Ano', presentes: 90, ausentes: 10 },
  { turma: '4º Ano', presentes: 95, ausentes: 5 },
  { turma: '5º Ano', presentes: 91, ausentes: 9 },
];

// Filter-related data function
const generateFilteredData = (filters) => {
  let filteredPerformanceData = [...originalPerformanceData];
  let filteredPresencaData = [...originalPresencaData];
  
  // Apply escola filter
  if (filters.escola !== 'all_escolas') {
    // Simulate filtering performance data by escola
    filteredPerformanceData = filteredPerformanceData.map(item => ({
      ...item,
      portugues: Math.round(item.portugues * 0.9 + Math.random() * 10),
      matematica: Math.round(item.matematica * 0.9 + Math.random() * 10)
    }));
    
    // Get escola name for more realistic filtering
    const escolaName = ESCOLAS_MOCK.find(escola => escola.id === filters.escola)?.nome || '';
    if (escolaName.includes('Municipal')) {
      // Municipal schools might have different stats
      filteredPresencaData = filteredPresencaData.map(item => ({
        ...item,
        presentes: Math.min(100, Math.round(item.presentes * 0.95)),
        ausentes: Math.max(0, 100 - Math.round(item.presentes * 0.95))
      }));
    }
  }
  
  // Apply turma filter
  if (filters.turma !== 'all_turmas') {
    const selectedTurma = TURMAS_MOCK.find(turma => turma.id === filters.turma);
    
    if (selectedTurma) {
      // Filter presence data to show only selected turma or similar turmas
      filteredPresencaData = originalPresencaData.filter(item => 
        item.turma.includes(selectedTurma.ano.toString())
      );
      
      // If no matching turmas, keep at least one for display
      if (filteredPresencaData.length === 0) {
        filteredPresencaData = [originalPresencaData[0]];
      }
    }
  }
  
  // Apply componente filter
  if (filters.componente !== 'all_componentes') {
    if (filters.componente === 'portugues') {
      // Emphasize Portuguese data
      filteredPerformanceData = filteredPerformanceData.map(item => ({
        ...item,
        portugues: item.portugues,
        matematica: item.matematica * 0.85 // De-emphasize math scores
      }));
    } else if (filters.componente === 'matematica') {
      // Emphasize Math data
      filteredPerformanceData = filteredPerformanceData.map(item => ({
        ...item,
        portugues: item.portugues * 0.85, // De-emphasize Portuguese scores
        matematica: item.matematica
      }));
    }
  }
  
  // Apply turno filter
  if (filters.turno !== 'all_turnos') {
    // Simulate different performance for different turnos
    const turnoModifier = filters.turno === 'matutino' ? 1.05 : 0.95;
    
    filteredPerformanceData = filteredPerformanceData.map(item => ({
      ...item,
      portugues: Math.min(100, Math.round(item.portugues * turnoModifier)),
      matematica: Math.min(100, Math.round(item.matematica * turnoModifier))
    }));
    
    filteredPresencaData = filteredPresencaData.map(item => ({
      ...item,
      presentes: Math.min(100, Math.round(item.presentes * turnoModifier)),
      ausentes: Math.max(0, 100 - Math.round(item.presentes * turnoModifier))
    }));
  }
  
  // Apply avaliacao filter
  if (filters.avaliacao !== 'all_avaliacoes') {
    // Different assessments might show different performance profiles
    const randomOffset = Math.random() * 10 - 5; // Random offset between -5 and 5
    
    filteredPerformanceData = filteredPerformanceData.map(item => ({
      ...item,
      portugues: Math.min(100, Math.max(0, Math.round(item.portugues + randomOffset))),
      matematica: Math.min(100, Math.max(0, Math.round(item.matematica + randomOffset)))
    }));
  }
  
  return {
    performanceData: filteredPerformanceData, 
    presencaData: filteredPresencaData
  };
};

const Dashboard: React.FC = () => {
  const { user, isSecretaria } = useAuth();
  const [selectedFilters, setSelectedFilters] = useState({
    escola: 'all_escolas',
    turma: 'all_turmas',
    turno: 'all_turnos',
    componente: 'all_componentes',
    avaliacao: 'all_avaliacoes'
  });
  
  const handleFilterChange = (filterType: string, value: string) => {
    setSelectedFilters(prev => {
      // If turma filter changes, reset avaliacao filter
      if (filterType === 'turma') {
        return {
          ...prev,
          [filterType]: value,
          avaliacao: 'all_avaliacoes' // Reset avaliação when turma changes
        };
      }
      
      return {
        ...prev,
        [filterType]: value
      };
    });
  };
  
  const { performanceData: filteredPerformanceData, presencaData: filteredPresencaData } = 
    generateFilteredData(selectedFilters);
  
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

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total de Alunos
              </CardTitle>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0m-3 7h3m-3 4h3m-6-4h.01M9 16h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
              </svg>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{isSecretaria ? '2.845' : '367'}</div>
              <p className="text-xs text-muted-foreground">
                {isSecretaria ? '+12% em relação ao ano anterior' : '+5% em relação ao bimestre anterior'}
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Média em Português
              </CardTitle>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
              </svg>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">72.4%</div>
              <p className="text-xs text-muted-foreground">
                +4.3% em relação à última avaliação
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Média em Matemática
              </CardTitle>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
              </svg>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">68.7%</div>
              <p className="text-xs text-muted-foreground">
                +2.8% em relação à última avaliação
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Taxa de Presença
              </CardTitle>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">91.2%</div>
              <p className="text-xs text-muted-foreground">
                -1.1% em relação ao mês anterior
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Evolução do Desempenho</CardTitle>
              <CardDescription>
                Média de desempenho nas disciplinas ao longo do tempo
              </CardDescription>
            </CardHeader>
            <CardContent className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={filteredPerformanceData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="mes" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="portugues" stroke="#1E88E5" name="Português" />
                  <Line type="monotone" dataKey="matematica" stroke="#26A69A" name="Matemática" />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Taxa de Presença por Turma</CardTitle>
              <CardDescription>
                Percentual de presença e ausência por turma
              </CardDescription>
            </CardHeader>
            <CardContent className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={filteredPresencaData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="turma" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="presentes" stackId="a" fill="#66BB6A" name="Presentes (%)" />
                  <Bar dataKey="ausentes" stackId="a" fill="#EF5350" name="Ausentes (%)" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-4 grid-cols-1">
          <Card>
            <CardHeader>
              <CardTitle>Principais Dificuldades Identificadas</CardTitle>
              <CardDescription>
                Descritores com menor percentual de acerto
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <div className="h-4 w-1 bg-red-500 rounded"></div>
                      <span className="font-medium">D15 - Reconhecer diferentes formas de tratar a informação</span>
                    </div>
                    <span className="font-semibold">42.3%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700">
                    <div className="bg-red-500 h-2.5 rounded-full" style={{ width: '42.3%' }}></div>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <div className="h-4 w-1 bg-orange-500 rounded"></div>
                      <span className="font-medium">D23 - Resolver problemas com números racionais</span>
                    </div>
                    <span className="font-semibold">48.7%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700">
                    <div className="bg-orange-500 h-2.5 rounded-full" style={{ width: '48.7%' }}></div>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <div className="h-4 w-1 bg-yellow-500 rounded"></div>
                      <span className="font-medium">D08 - Interpretar textos que articulam linguagens verbais e não verbais</span>
                    </div>
                    <span className="font-semibold">52.5%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700">
                    <div className="bg-yellow-500 h-2.5 rounded-full" style={{ width: '52.5%' }}></div>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <div className="h-4 w-1 bg-yellow-500 rounded"></div>
                      <span className="font-medium">D30 - Calcular área de figuras planas</span>
                    </div>
                    <span className="font-semibold">54.2%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700">
                    <div className="bg-yellow-500 h-2.5 rounded-full" style={{ width: '54.2%' }}></div>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <div className="h-4 w-1 bg-green-500 rounded"></div>
                      <span className="font-medium">D03 - Inferir o sentido de uma palavra ou expressão</span>
                    </div>
                    <span className="font-semibold">61.8%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700">
                    <div className="bg-green-500 h-2.5 rounded-full" style={{ width: '61.8%' }}></div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </MainLayout>
  );
};

export default Dashboard;
