import React from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Cell, PieChart, Pie, ResponsiveContainer } from 'recharts';
import { ChartContainer, ChartTooltipContent } from '@/components/ui/chart';
import { BookOpenText, Calculator } from 'lucide-react';

interface DescriptorsChartsProps {
  desempenhoDescritores: Array<{
    descritor: string;
    nome: string;
    percentual: number;
  }>;
  componente: string;
}

const DescriptorsCharts: React.FC<DescriptorsChartsProps> = ({ desempenhoDescritores, componente }) => {
  const chartConfig = {
    percentual: {
      label: 'Percentual de Acerto',
      color: '#1E88E5'
    }
  };

  const getColorForPercentage = (percentual: number) => {
    if (percentual < 60) return '#EF5350';
    if (percentual < 70) return '#FFA726';
    if (percentual < 85) return '#66BB6A';
    return '#26A69A';
  };

  // Filtrar descritores por componente
  const filteredDescritores = componente === 'all_componentes' 
    ? desempenhoDescritores 
    : desempenhoDescritores.filter(d => d.descritor.toLowerCase().includes(componente.toLowerCase()));

  // Calculate performance levels
  const calculatePerformanceLevels = (descritores: typeof desempenhoDescritores) => {
    const levels = {
      critico: 0,
      basico: 0,
      adequado: 0,
      avancado: 0
    };

    descritores.forEach(desc => {
      if (desc.percentual < 60) levels.critico++;
      else if (desc.percentual < 70) levels.basico++;
      else if (desc.percentual < 85) levels.adequado++;
      else levels.avancado++;
    });

    return [
      { name: 'Crítico (Abaixo de 60%)', value: levels.critico, color: '#EF5350' },
      { name: 'Básico (60% a 70%)', value: levels.basico, color: '#FFA726' },
      { name: 'Adequado (70% a 85%)', value: levels.adequado, color: '#66BB6A' },
      { name: 'Avançado (Acima de 85%)', value: levels.avancado, color: '#26A69A' }
    ];
  };

  const performanceData = calculatePerformanceLevels(filteredDescritores);

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Desempenho por Descritor</CardTitle>
            <CardDescription>
              Percentual de acerto por descritor
            </CardDescription>
          </CardHeader>
          <CardContent className="h-80">
            <ChartContainer config={chartConfig}>
              <ResponsiveContainer>
                <BarChart 
                  data={filteredDescritores} 
                  margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis 
                    dataKey="descritor" 
                    className="text-xs"
                    angle={-45}
                    textAnchor="end"
                    height={100}
                  />
                  <YAxis domain={[0, 100]} className="text-xs" />
                  <ChartTooltipContent />
                  <Bar dataKey="percentual" name="Percentual de Acerto">
                    {filteredDescritores.map((entry, index) => (
                      <Cell 
                        key={`cell-${index}`} 
                        fill={getColorForPercentage(entry.percentual)}
                        className="transition-colors duration-300 hover:opacity-80"
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Análise de Descritores</CardTitle>
            <CardDescription>
              Distribuição dos descritores por nível de desempenho
            </CardDescription>
          </CardHeader>
          <CardContent className="h-72">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {['Língua Portuguesa', 'Matemática'].map(subject => (
                <div key={subject}>
                  <h3 className="text-base font-medium mb-2 text-center">{subject}</h3>
                  <ResponsiveContainer>
                    <PieChart>
                      <Pie
                        data={performanceData}
                        dataKey="value"
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        outerRadius={80}
                        fill="#8884d8"
                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                      >
                        {performanceData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <ChartTooltipContent />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  );
};

export default DescriptorsCharts;
