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
                          <tr className="border-b">
                            <td className="p-2 font-medium">Ana Silva</td>
                            <td className="p-2 text-center">
                              <span className="px-2 py-1 rounded-full text-xs bg-green-100 text-green-800">Presente</span>
                            </td>
                            <td className="p-2 text-center">
                              <span className="px-2 py-1 rounded-full text-xs bg-green-100 text-green-800">85%</span>
                            </td>
                            <td className="p-2 text-center">
                              <span className="px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-800">78%</span>
                            </td>
                            <td className="p-2 text-center">
                              <span className="px-2 py-1 rounded-full text-xs bg-green-100 text-green-800">81.5%</span>
                            </td>
                            <td className="p-2 text-right">
                              <Button variant="outline" size="sm">Ver detalhes</Button>
                            </td>
                          </tr>
                          <tr className="border-b">
                            <td className="p-2 font-medium">Bruno Oliveira</td>
                            <td className="p-2 text-center">
                              <span className="px-2 py-1 rounded-full text-xs bg-green-100 text-green-800">Presente</span>
                            </td>
                            <td className="p-2 text-center">
                              <span className="px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-800">72%</span>
                            </td>
                            <td className="p-2 text-center">
                              <span className="px-2 py-1 rounded-full text-xs bg-orange-100 text-orange-800">65%</span>
                            </td>
                            <td className="p-2 text-center">
                              <span className="px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-800">68.5%</span>
                            </td>
                            <td className="p-2 text-right">
                              <Button variant="outline" size="sm">Ver detalhes</Button>
                            </td>
                          </tr>
                          <tr className="border-b">
                            <td className="p-2 font-medium">Carla Santos</td>
                            <td className="p-2 text-center">
                              <span className="px-2 py-1 rounded-full text-xs bg-green-100 text-green-800">Presente</span>
                            </td>
                            <td className="p-2 text-center">
                              <span className="px-2 py-1 rounded-full text-xs bg-orange-100 text-orange-800">68%</span>
                            </td>
                            <td className="p-2 text-center">
                              <span className="px-2 py-1 rounded-full text-xs bg-orange-100 text-orange-800">62%</span>
                            </td>
                            <td className="p-2 text-center">
                              <span className="px-2 py-1 rounded-full text-xs bg-orange-100 text-orange-800">65%</span>
                            </td>
                            <td className="p-2 text-right">
                              <Button variant="outline" size="sm">Ver detalhes</Button>
                            </td>
                          </tr>
                          <tr className="border-b">
                            <td className="p-2 font-medium">Daniel Lima</td>
                            <td className="p-2 text-center">
                              <span className="px-2 py-1 rounded-full text-xs bg-yellow-100 text-yellow-800">Ausente</span>
                            </td>
                            <td className="p-2 text-center">
                              <span className="px-2 py-1 rounded-full text-xs bg-gray-100 text-gray-800">-</span>
                            </td>
                            <td className="p-2 text-center">
                              <span className="px-2 py-1 rounded-full text-xs bg-gray-100 text-gray-800">-</span>
                            </td>
                            <td className="p-2 text-center">
                              <span className="px-2 py-1 rounded-full text-xs bg-gray-100 text-gray-800">-</span>
                            </td>
                            <td className="p-2 text-right">
                              <Button variant="outline" size="sm">Ver detalhes</Button>
                            </td>
                          </tr>
                          <tr className="border-b">
                            <td className="p-2 font-medium">Eduarda Costa</td>
                            <td className="p-2 text-center">
                              <span className="px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-800">Transferida</span>
                            </td>
                            <td className="p-2 text-center">
                              <span className="px-2 py-1 rounded-full text-xs bg-gray-100 text-gray-800">-</span>
                            </td>
                            <td className="p-2 text-center">
                              <span className="px-2 py-1 rounded-full text-xs bg-gray-100 text-gray-800">-</span>
                            </td>
                            <td className="p-2 text-center">
                              <span className="px-2 py-1 rounded-full text-xs bg-gray-100 text-gray-800">-</span>
                            </td>
                            <td className="p-2 text-right">
                              <Button variant="outline" size="sm">Ver detalhes</Button>
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                    
                    <div className="flex justify-end">
                      <Button>
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                        </svg>
                        Exportar Relatório
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </MainLayout>
  );
};

export default Relatorios;
