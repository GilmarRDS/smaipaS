import React, { useState } from 'react';
import MainLayout from '@/components/layout/MainLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/contexts/AuthContext';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import RadarChartComponent from '@/components/charts/RadarChart';
import FilterControls from '@/components/dashboard/FilterControls';
import { TURMAS_MOCK } from '@/types/turmas';
import { ESCOLAS_MOCK } from '@/types/escolas';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { toast } from "sonner";
import { FileText, FileSpreadsheet, FileCode } from 'lucide-react';
import StudentDetailsView from '@/components/relatorios/StudentDetailsView';
import { ActionButton } from '@/components/ui/action-button';
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from '@/components/ui/dropdown-menu';

const originalDesempenhoTurmas = [
  { turma: '5º Ano A', portugues: 72, matematica: 68 },
  { turma: '5º Ano B', portugues: 76, matematica: 65 },
  { turma: '5º Ano C', portugues: 68, matematica: 71 },
  { turma: '9º Ano A', portugues: 65, matematica: 62 },
  { turma: '9º Ano B', portugues: 70, matematica: 66 },
];

const portDescritores = [
  { descritor: 'D01', nome: 'Localizar informações', percentual: 78 },
  { descritor: 'D02', nome: 'Inferir sentido', percentual: 65 },
  { descritor: 'D03', nome: 'Inferir informação', percentual: 58 },
  { descritor: 'D04', nome: 'Identificar tema', percentual: 72 },
  { descritor: 'D05', nome: 'Distinguir fato', percentual: 63 },
];

const matDescritores = [
  { descritor: 'D16', nome: 'Operações básicas', percentual: 76 },
  { descritor: 'D17', nome: 'Frações', percentual: 55 },
  { descritor: 'D18', nome: 'Geometria', percentual: 60 },
  { descritor: 'D19', nome: 'Proporcionalidade', percentual: 68 },
  { descritor: 'D20', nome: 'Estatística', percentual: 71 },
];

const originalEvolucaoDesempenho = [
  { avaliacao: 'Diagnóstica 1/2023', portugues: 62, matematica: 58 },
  { avaliacao: 'Diagnóstica 2/2023', portugues: 65, matematica: 61 },
  { avaliacao: 'Diagnóstica 1/2024', portugues: 70, matematica: 65 },
];

const originalHabilidades = [
  { nome: 'Leitura', percentual: 72 },
  { nome: 'Escrita', percentual: 68 },
  { nome: 'Interpretação', percentual: 66 },
  { nome: 'Cálculo', percentual: 70 },
  { nome: 'Raciocínio Lógico', percentual: 64 },
  { nome: 'Resolução de Problemas', percentual: 62 },
];

const mockStudentData = [
  { 
    id: '1', 
    nome: 'Ana Silva', 
    presente: true, 
    portugues: 85, 
    matematica: 78, 
    media: 81.5,
    descritores: {
      portugues: [
        { codigo: 'D01', nome: 'Localizar informações', percentual: 90 },
        { codigo: 'D02', nome: 'Inferir sentido', percentual: 75 },
        { codigo: 'D03', nome: 'Inferir informação', percentual: 85 }
      ],
      matematica: [
        { codigo: 'D16', nome: 'Operações básicas', percentual: 80 },
        { codigo: 'D17', nome: 'Frações', percentual: 65 },
        { codigo: 'D18', nome: 'Geometria', percentual: 85 }
      ]
    }
  },
  { 
    id: '2', 
    nome: 'Bruno Oliveira', 
    presente: true, 
    portugues: 72, 
    matematica: 65, 
    media: 68.5,
    descritores: {
      portugues: [
        { codigo: 'D01', nome: 'Localizar informações', percentual: 75 },
        { codigo: 'D02', nome: 'Inferir sentido', percentual: 70 },
        { codigo: 'D03', nome: 'Inferir informação', percentual: 65 }
      ],
      matematica: [
        { codigo: 'D16', nome: 'Operações básicas', percentual: 70 },
        { codigo: 'D17', nome: 'Frações', percentual: 55 },
        { codigo: 'D18', nome: 'Geometria', percentual: 65 }
      ]
    }
  },
  { 
    id: '3', 
    nome: 'Carla Santos', 
    presente: true, 
    portugues: 68, 
    matematica: 62, 
    media: 65,
    descritores: {
      portugues: [
        { codigo: 'D01', nome: 'Localizar informações', percentual: 70 },
        { codigo: 'D02', nome: 'Inferir sentido', percentual: 65 },
        { codigo: 'D03', nome: 'Inferir informação', percentual: 65 }
      ],
      matematica: [
        { codigo: 'D16', nome: 'Operações básicas', percentual: 65 },
        { codigo: 'D17', nome: 'Frações', percentual: 55 },
        { codigo: 'D18', nome: 'Geometria', percentual: 60 }
      ]
    }
  },
  { 
    id: '4', 
    nome: 'Daniel Lima', 
    presente: false, 
    portugues: null, 
    matematica: null, 
    media: null,
    descritores: null
  },
  { 
    id: '5', 
    nome: 'Eduarda Costa', 
    presente: false, 
    portugues: null, 
    matematica: null, 
    media: null,
    transferida: true,
    descritores: null
  }
];

const filterData = (filters) => {
  let desempenhoTurmas = [...originalDesempenhoTurmas];
  let evolucaoDesempenho = [...originalEvolucaoDesempenho];
  let desempenhoHabilidades = [...originalHabilidades];
  let desempenhoDescritores = filters.componente === 'matematica' 
    ? [...matDescritores] 
    : [...portDescritores];
  
  if (filters.escola !== 'all_escolas') {
    const randomModifier = 0.9 + Math.random() * 0.2;
    
    desempenhoTurmas = desempenhoTurmas.map(item => ({
      ...item,
      portugues: Math.min(100, Math.round(item.portugues * randomModifier)),
      matematica: Math.min(100, Math.round(item.matematica * randomModifier))
    }));
    
    evolucaoDesempenho = evolucaoDesempenho.map(item => ({
      ...item,
      portugues: Math.min(100, Math.round(item.portugues * randomModifier)),
      matematica: Math.min(100, Math.round(item.matematica * randomModifier))
    }));
    
    desempenhoHabilidades = desempenhoHabilidades.map(item => ({
      ...item,
      percentual: Math.min(100, Math.round(item.percentual * randomModifier))
    }));
    
    desempenhoDescritores = desempenhoDescritores.map(item => ({
      ...item,
      percentual: Math.min(100, Math.round(item.percentual * randomModifier))
    }));
  }
  
  if (filters.turma !== 'all_turmas') {
    const selectedTurma = TURMAS_MOCK.find(turma => turma.id === filters.turma);
    
    if (selectedTurma) {
      desempenhoTurmas = desempenhoTurmas.filter(item => 
        item.turma.includes(selectedTurma.ano.toString()) || 
        item.turma.includes(selectedTurma.nome)
      );
      
      if (desempenhoTurmas.length === 0) {
        desempenhoTurmas = [originalDesempenhoTurmas[0]];
      }
      
      const yearModifier = parseInt(selectedTurma.ano) <= 5 ? 0.9 : 1.1;
      
      evolucaoDesempenho = evolucaoDesempenho.map(item => ({
        ...item,
        portugues: Math.min(100, Math.round(item.portugues * yearModifier)),
        matematica: Math.min(100, Math.round(item.matematica * yearModifier))
      }));
      
      desempenhoHabilidades = desempenhoHabilidades.map(item => ({
        ...item,
        percentual: Math.min(100, Math.round(item.percentual * yearModifier))
      }));
    }
  }
  
  if (filters.componente !== 'all_componentes') {
    if (filters.componente === 'portugues') {
      desempenhoTurmas = desempenhoTurmas.map(item => ({
        ...item,
        portugues: item.portugues,
        matematica: item.matematica * 0.7
      }));
      
      evolucaoDesempenho = evolucaoDesempenho.map(item => ({
        ...item,
        portugues: item.portugues,
        matematica: item.matematica * 0.7
      }));
      
      desempenhoHabilidades = desempenhoHabilidades.map(item => {
        if (['Leitura', 'Escrita', 'Interpretação'].includes(item.nome)) {
          return { ...item, percentual: Math.min(100, item.percentual + 5) };
        }
        return item;
      });
    } else if (filters.componente === 'matematica') {
      desempenhoTurmas = desempenhoTurmas.map(item => ({
        ...item,
        portugues: item.portugues * 0.7,
        matematica: item.matematica
      }));
      
      evolucaoDesempenho = evolucaoDesempenho.map(item => ({
        ...item,
        portugues: item.portugues * 0.7,
        matematica: item.matematica
      }));
      
      desempenhoHabilidades = desempenhoHabilidades.map(item => {
        if (['Cálculo', 'Raciocínio Lógico', 'Resolução de Problemas'].includes(item.nome)) {
          return { ...item, percentual: Math.min(100, item.percentual + 5) };
        }
        return item;
      });
    }
  }
  
  if (filters.turno !== 'all_turnos') {
    const turnoModifier = filters.turno === 'matutino' ? 1.05 : 0.95;
    
    desempenhoTurmas = desempenhoTurmas.map(item => ({
      ...item,
      portugues: Math.min(100, Math.round(item.portugues * turnoModifier)),
      matematica: Math.min(100, Math.round(item.matematica * turnoModifier))
    }));
    
    evolucaoDesempenho = evolucaoDesempenho.map(item => ({
      ...item,
      portugues: Math.min(100, Math.round(item.portugues * turnoModifier)),
      matematica: Math.min(100, Math.round(item.matematica * turnoModifier))
    }));
  }
  
  if (filters.avaliacao !== 'all_avaliacoes') {
    const randomOffset = Math.random() * 10 - 5;
    
    desempenhoTurmas = desempenhoTurmas.map(item => ({
      ...item,
      portugues: Math.min(100, Math.max(0, Math.round(item.portugues + randomOffset))),
      matematica: Math.min(100, Math.max(0, Math.round(item.matematica + randomOffset)))
    }));
    
    evolucaoDesempenho = evolucaoDesempenho.map(item => ({
      ...item,
      portugues: Math.min(100, Math.max(0, Math.round(item.portugues + randomOffset))),
      matematica: Math.min(100, Math.max(0, Math.round(item.matematica + randomOffset)))
    }));
    
    desempenhoDescritores = desempenhoDescritores.map(item => ({
      ...item,
      percentual: Math.min(100, Math.max(0, Math.round(item.percentual + randomOffset)))
    }));
  }
  
  return {
    desempenhoTurmas,
    evolucaoDesempenho,
    desempenhoHabilidades,
    desempenhoDescritores
  };
};

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
  
  const handleExportReport = (format: 'excel' | 'pdf') => {
    if (selectedFilters.turma === 'all_turmas') {
      toast.error("Selecione uma turma específica para exportar o relatório");
      return;
    }
    
    const selectedTurma = TURMAS_MOCK.find(turma => turma.id === selectedFilters.turma);
    const extension = format === 'excel' ? 'xlsx' : 'pdf';
    const fileName = `relatorio_turma_${selectedTurma?.nome?.toLowerCase().replace(/\s+/g, '_') || 'selecionada'}.${extension}`;
    
    const link = document.createElement('a');
    link.download = fileName;
    link.href = '#';
    link.click();
    
    toast.success(`Relatório da turma ${selectedTurma?.nome || ''} baixado como ${format.toUpperCase()}`, {
      description: `Arquivo ${fileName} salvo na pasta de downloads`
    });
  };
  
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
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle>Desempenho por Turma</CardTitle>
                  <CardDescription>
                    Média de acertos por turma nas disciplinas
                  </CardDescription>
                </CardHeader>
                <CardContent className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={filteredDesempenhoTurmas} layout="vertical" margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis type="number" domain={[0, 100]} />
                      <YAxis dataKey="turma" type="category" />
                      <Tooltip formatter={(value) => [`${value}%`, '']} />
                      <Legend />
                      <Bar dataKey="portugues" name="Língua Portuguesa" fill="#1E88E5" />
                      <Bar dataKey="matematica" name="Matemática" fill="#26A69A" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>Evolução do Desempenho</CardTitle>
                  <CardDescription>
                    Comparativo de desempenho nas últimas avaliações
                  </CardDescription>
                </CardHeader>
                <CardContent className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={filteredEvolucaoDesempenho} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="avaliacao" />
                      <YAxis domain={[0, 100]} />
                      <Tooltip formatter={(value) => [`${value}%`, '']} />
                      <Legend />
                      <Line type="monotone" dataKey="portugues" name="Língua Portuguesa" stroke="#1E88E5" strokeWidth={2} />
                      <Line type="monotone" dataKey="matematica" name="Matemática" stroke="#26A69A" strokeWidth={2} />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>
            
            <Card>
              <CardHeader>
                <CardTitle>Mapa de Habilidades</CardTitle>
                <CardDescription>
                  Desempenho por área de habilidade
                </CardDescription>
              </CardHeader>
              <CardContent className="h-80">
                <RadarChartComponent 
                  data={filteredDesempenhoHabilidades} 
                  dataKey="percentual" 
                  nameKey="nome" 
                />
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="descritores" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle>Desempenho em Língua Portuguesa</CardTitle>
                  <CardDescription>
                    Percentual de acerto por descritor
                  </CardDescription>
                </CardHeader>
                <CardContent className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={selectedFilters.componente !== 'matematica' ? filteredDesempenhoDescritores : []} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="descritor" />
                      <YAxis domain={[0, 100]} />
                      <Tooltip 
                        formatter={(value, name, props) => {
                          return [`${value}%`, props.payload.nome];
                        }}
                      />
                      <Bar dataKey="percentual" name="Percentual de Acerto" fill="#1E88E5">
                        {filteredDesempenhoDescritores.map((entry, index) => (
                          <Cell 
                            key={`cell-${index}`} 
                            fill={entry.percentual < 60 ? '#EF5350' : entry.percentual < 70 ? '#FFA726' : '#66BB6A'} 
                          />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>Desempenho em Matemática</CardTitle>
                  <CardDescription>
                    Percentual de acerto por descritor
                  </CardDescription>
                </CardHeader>
                <CardContent className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={selectedFilters.componente !== 'portugues' ? filteredDesempenhoDescritores : []} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="descritor" />
                      <YAxis domain={[0, 100]} />
                      <Tooltip 
                        formatter={(value, name, props) => {
                          return [`${value}%`, props.payload.nome];
                        }}
                      />
                      <Bar dataKey="percentual" name="Percentual de Acerto" fill="#26A69A">
                        {filteredDesempenhoDescritores.map((entry, index) => (
                          <Cell 
                            key={`cell-${index}`} 
                            fill={entry.percentual < 60 ? '#EF5350' : entry.percentual < 70 ? '#FFA726' : '#66BB6A'} 
                          />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>
            
            <Card>
              <CardHeader>
                <CardTitle>Análise de Descritores</CardTitle>
                <CardDescription>
                  Distribuição dos descritores por nível de desempenho
                </CardDescription>
              </CardHeader>
              <CardContent className="h-72">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h3 className="text-base font-medium mb-2 text-center">Língua Portuguesa</h3>
                    <ResponsiveContainer width="100%" height={250}>
                      <PieChart>
                        <Pie
                          data={[
                            { name: 'Crítico (Abaixo de 60%)', value: 2 },
                            { name: 'Básico (60% a 70%)', value: 3 },
                            { name: 'Adequado (70% a 85%)', value: 5 },
                            { name: 'Avançado (Acima de 85%)', value: 2 }
                          ]}
                          dataKey="value"
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          outerRadius={80}
                          fill="#8884d8"
                          label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                        >
                          {[
                            { name: 'Crítico', color: '#EF5350' },
                            { name: 'Básico', color: '#FFA726' },
                            { name: 'Adequado', color: '#66BB6A' },
                            { name: 'Avançado', color: '#26A69A' },
                          ].map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip formatter={(value) => [`${value} descritores`, '']} />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                  <div>
                    <h3 className="text-base font-medium mb-2 text-center">Matemática</h3>
                    <ResponsiveContainer width="100%" height={250}>
                      <PieChart>
                        <Pie
                          data={[
                            { name: 'Crítico (Abaixo de 60%)', value: 3 },
                            { name: 'Básico (60% a 70%)', value: 4 },
                            { name: 'Adequado (70% a 85%)', value: 4 },
                            { name: 'Avançado (Acima de 85%)', value: 1 }
                          ]}
                          dataKey="value"
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          outerRadius={80}
                          fill="#8884d8"
                          label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                        >
                          {[
                            { name: 'Crítico', color: '#EF5350' },
                            { name: 'Básico', color: '#FFA726' },
                            { name: 'Adequado', color: '#66BB6A' },
                            { name: 'Avançado', color: '#26A69A' },
                          ].map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip formatter={(value) => [`${value} descritores`, '']} />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="alunos" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Desempenho Individual dos Alunos</CardTitle>
                <CardDescription>
                  Para visualizar os dados individuais, selecione uma turma específica
                </CardDescription>
              </CardHeader>
              <CardContent>
                {selectedFilters.turma === 'all_turmas' ? (
                  <div className="flex items-center justify-center h-40">
                    <div className="text-center">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <p className="mt-2 text-muted-foreground">Selecione uma turma específica para visualizar o desempenho individual dos alunos</p>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="overflow-x-auto">
                      <table className="w-full border-collapse">
                        <thead>
                          <tr className="bg-muted">
                            <th className="p-2 text-left">Aluno</th>
                            <th className="p-2 text-center">Situação</th>
                            <th className="p-2 text-center">Português</th>
                            <th className="p-2 text-center">Matemática</th>
                            <th className="p-2 text-center">Média Geral</th>
                            <th className="p-2 text-right">Detalhes</th>
                          </tr>
                        </thead>
                        <tbody>
                          {mockStudentData.map((student) => (
                            <tr key={student.id} className="border-b">
                              <td className="p-2 font-medium">{student.nome}</td>
                              <td className="p-2 text-center">
                                {student.transferida ? (
                                  <span className="px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-800">Transferida</span>
                                ) : student.presente ? (
                                  <span className="px-2 py-1 rounded-full text-xs bg-green-100 text-green-800">Presente</span>
                                ) : (
                                  <span className="px-2 py-1 rounded-full text-xs bg-yellow-100 text-yellow-800">Ausente</span>
                                )}
                              </td>
                              <td className="p-2 text-center">
                                {student.portugues ? (
                                  <span className={`px-2 py-1 rounded-full text-xs ${
                                    student.portugues >= 70 ? 'bg-green-100 text-green-800' : 
                                    student.portugues >= 60 ? 'bg-blue-100 text-blue-800' : 
                                    'bg-orange-100 text-orange-800'
                                  }`}>
                                    {student.portugues}%
                                  </span>
                                ) : (
                                  <span className="px-2 py-1 rounded-full text-xs bg-gray-100 text-gray-800">-</span>
                                )}
                              </td>
                              <td className="p-2 text-center">
                                {student.matematica ? (
                                  <span className={`px-2 py-1 rounded-full text-xs ${
                                    student.matematica >= 70 ? 'bg-green-100 text-green-800' : 
                                    student.matematica >= 60 ? 'bg-blue-100 text-blue-800' : 
                                    'bg-orange-100 text-orange-800'
                                  }`}>
                                    {student.matematica}%
                                  </span>
                                ) : (
                                  <span className="px-2 py-1 rounded-full text-xs bg-gray-100 text-gray-800">-</span>
                                )}
                              </td>
                              <td className="p-2 text-center">
                                {student.media ? (
                                  <span className={`px-2 py-1 rounded-full text-xs ${
                                    student.media >= 70 ? 'bg-green-100 text-green-800' : 
                                    student.media >= 60 ? 'bg-blue-100 text-blue-800' : 
                                    'bg-orange-100 text-orange-800'
                                  }`}>
                                    {student.media}%
                                  </span>
                                ) : (
                                  <span className="px-2 py-1 rounded-full text-xs bg-gray-100 text-gray-800">-</span>
                                )}
                              </td>
                              <td className="p-2 text-right">
                                <ActionButton 
                                  action="view" 
                                  onClick={() => handleViewStudentDetails(student)}
                                  disabled={!student.presente}
                                />
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                    
                    <div className="flex justify-end">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button>
                            <FileText className="h-5 w-5 mr-2" />
                            Exportar Relatório da Turma
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent>
                          <DropdownMenuItem onClick={() => handleExportReport('excel')}>
                            <FileSpreadsheet className="h-4 w-4 mr-2" />
                            <span>Baixar como Excel</span>
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleExportReport('pdf')}>
                            <FileCode className="h-4 w-4 mr-2" />
                            <span>Baixar como PDF</span>
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
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
