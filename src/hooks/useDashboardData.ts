import { useState, useEffect } from 'react';
import { TURMAS_MOCK } from '@/types/turmas';
import { ESCOLAS_MOCK } from '@/types/escolas';
import { AVALIACOES_MOCK } from '@/types/avaliacoes';

// Original mock data
const originalPerformanceData = [
  { avaliacao: 'Diagnóstica 1', portugues: 65, matematica: 60 },
  { avaliacao: 'Diagnóstica 2', portugues: 72, matematica: 68 },
];

const originalPresencaData = [
  { turma: '1º Ano', presentes: 92, ausentes: 8 },
  { turma: '2º Ano', presentes: 88, ausentes: 12 },
  { turma: '3º Ano', presentes: 90, ausentes: 10 },
  { turma: '4º Ano', presentes: 95, ausentes: 5 },
  { turma: '5º Ano', presentes: 91, ausentes: 9 },
];

// Dados simulados para descritores problemáticos por aluno
const originalDescritoresProblematicosPorAluno = [
  { aluno: 'Ana Silva', descritores: [
    { codigo: 'D15', componente: 'Português', acertos: 30 },
    { codigo: 'D23', componente: 'Matemática', acertos: 25 },
    { codigo: 'D08', componente: 'Português', acertos: 40 }
  ]},
  { aluno: 'Bruno Santos', descritores: [
    { codigo: 'D04', componente: 'Matemática', acertos: 20 },
    { codigo: 'D15', componente: 'Português', acertos: 35 },
    { codigo: 'D30', componente: 'Matemática', acertos: 30 }
  ]},
  { aluno: 'Carla Mendes', descritores: [
    { codigo: 'D08', componente: 'Português', acertos: 25 },
    { codigo: 'D23', componente: 'Matemática', acertos: 30 },
    { codigo: 'D03', componente: 'Português', acertos: 40 }
  ]},
  { aluno: 'Daniel Costa', descritores: [
    { codigo: 'D30', componente: 'Matemática', acertos: 15 },
    { codigo: 'D15', componente: 'Português', acertos: 20 },
    { codigo: 'D04', componente: 'Matemática', acertos: 25 }
  ]},
];

// Helper function to get student skills
export const getHabilidadesAluno = (alunoNome: string) => {
  const aluno = originalDescritoresProblematicosPorAluno.find(a => a.aluno === alunoNome);
  if (!aluno) return [];
  
  return aluno.descritores.map(d => ({
    descritor: d.codigo,
    percentual: d.acertos
  }));
};

// Filter-related data function
const generateFilteredData = (filters: {
  escola: string;
  turma: string;
  turno: string;
  componente: string;
  avaliacao: string;
}) => {
  let filteredPerformanceData = [...originalPerformanceData];
  let filteredPresencaData = [...originalPresencaData];
  let filteredDescritoresPorAluno = [...originalDescritoresProblematicosPorAluno];
  
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
      
      // Filter alunos by escola
      filteredDescritoresPorAluno = filteredDescritoresPorAluno.slice(0, 2);
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
      
      // Filter alunos by turma
      filteredDescritoresPorAluno = filteredDescritoresPorAluno.slice(0, 3);
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
      
      // Filter descritores by componente
      filteredDescritoresPorAluno = filteredDescritoresPorAluno.map(aluno => ({
        ...aluno,
        descritores: aluno.descritores.filter(d => d.componente === 'Português')
      }));
    } else if (filters.componente === 'matematica') {
      // Emphasize Math data
      filteredPerformanceData = filteredPerformanceData.map(item => ({
        ...item,
        portugues: item.portugues * 0.85, // De-emphasize Portuguese scores
        matematica: item.matematica
      }));
      
      // Filter descritores by componente
      filteredDescritoresPorAluno = filteredDescritoresPorAluno.map(aluno => ({
        ...aluno,
        descritores: aluno.descritores.filter(d => d.componente === 'Matemática')
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
    // Get avaliação info
    const avaliacaoInfo = AVALIACOES_MOCK.find(a => a.id === filters.avaliacao);
    
    if (avaliacaoInfo) {
      // Filter performance data to show only the selected avaliação
      if (avaliacaoInfo.nome.includes('Diagnóstica 1')) {
        filteredPerformanceData = [filteredPerformanceData[0]];
      } else if (avaliacaoInfo.nome.includes('Diagnóstica 2')) {
        filteredPerformanceData = [filteredPerformanceData[1]];
      }
    }
  }
  
  return {
    performanceData: filteredPerformanceData, 
    presencaData: filteredPresencaData,
    descritoresPorAluno: filteredDescritoresPorAluno
  };
};

export interface DashboardFilters {
  escola: string;
  turma: string;
  turno: string;
  componente: string;
  avaliacao: string;
}

export const useDashboardData = () => {
  const [selectedFilters, setSelectedFilters] = useState<DashboardFilters>({
    escola: 'all_escolas',
    turma: 'all_turmas',
    turno: 'all_turnos',
    componente: 'all_componentes',
    avaliacao: 'all_avaliacoes'
  });
  
  const [selectedAluno, setSelectedAluno] = useState<string>('');
  
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
  
  const { 
    performanceData, 
    presencaData, 
    descritoresPorAluno 
  } = generateFilteredData(selectedFilters);
  
  // Reset selectedAluno when filtered students change
  useEffect(() => {
    if (descritoresPorAluno.length > 0 && 
        (!selectedAluno || !descritoresPorAluno.some(a => a.aluno === selectedAluno))) {
      setSelectedAluno(descritoresPorAluno[0].aluno);
    }
  }, [descritoresPorAluno, selectedAluno]);
  
  const alunoHabilidades = selectedAluno ? getHabilidadesAluno(selectedAluno) : [];
  
  return {
    selectedFilters,
    handleFilterChange,
    performanceData,
    presencaData,
    descritoresPorAluno,
    selectedAluno,
    setSelectedAluno,
    alunoHabilidades
  };
};
