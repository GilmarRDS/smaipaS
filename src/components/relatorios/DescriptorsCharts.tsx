import React from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Cell, PieChart, Pie, ResponsiveContainer } from 'recharts';
import { BookOpenText, Calculator } from 'lucide-react';

export interface Descriptor {
  descritor: string;
  nome: string;
  percentual: number;
  componente: string;
}

interface DescriptorsChartsProps {
  desempenhoDescritores: Descriptor[];
  componente: string;
}

interface TooltipProps {
  active?: boolean;
  payload?: Array<{
    value: number;
    name: string;
    color: string;
  }>;
  label?: string;
}

const DescriptorsCharts: React.FC<DescriptorsChartsProps> = ({ desempenhoDescritores, componente }) => {
  const getColorForPercentage = (percentual: number) => {
    if (percentual >= 80) return '#66BB6A'; // Verde
    if (percentual >= 60) return '#FFA726'; // Laranja
    return '#EF5350'; // Vermelho
  };

  const CustomTooltip: React.FC<TooltipProps> = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-background border rounded-lg p-3 shadow-lg">
          <p className="font-medium">{label}</p>
          {payload.map((entry, index) => (
            <p key={index} style={{ color: entry.color }}>
              {entry.name}: {entry.value}%
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  // Calcular dados de desempenho
  const calculatePerformanceData = (descritores: Descriptor[]) => {
    const total = descritores.length;
    const excelente = descritores.filter(d => d.percentual >= 80).length;
    const bom = descritores.filter(d => d.percentual >= 60 && d.percentual < 80).length;
    const precisaMelhorar = descritores.filter(d => d.percentual < 60).length;

    return [
      { name: 'Excelente', value: (excelente / total) * 100, color: '#66BB6A' },
      { name: 'Bom', value: (bom / total) * 100, color: '#FFA726' },
      { name: 'Precisa Melhorar', value: (precisaMelhorar / total) * 100, color: '#EF5350' }
    ];
  };

  const filteredDescritores = desempenhoDescritores
    .filter(d => componente === 'all_componentes' || d.componente === componente)
    .sort((a, b) => b.percentual - a.percentual);

  const performanceData = calculatePerformanceData(filteredDescritores);

  if (filteredDescritores.length === 0) {
    return (
      <div className="text-center p-4 text-muted-foreground">
        Nenhum dado disponível para exibição.
      </div>
    );
  }

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {componente === 'portugues' ? (
                <BookOpenText className="h-5 w-5 text-blue-500" />
              ) : componente === 'matematica' ? (
                <Calculator className="h-5 w-5 text-green-500" />
              ) : (
                <>
                  <BookOpenText className="h-5 w-5 text-blue-500" />
                  <Calculator className="h-5 w-5 text-green-500" />
                </>
              )}
              Desempenho por Descritor
            </CardTitle>
            <CardDescription>
              Percentual de acerto por descritor
            </CardDescription>
          </CardHeader>
          <CardContent className="h-[400px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart 
                data={filteredDescritores} 
                margin={{ top: 20, right: 30, left: 20, bottom: 80 }}
              >
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis 
                  dataKey="descritor" 
                  className="text-xs"
                  angle={-45}
                  textAnchor="end"
                  height={100}
                  tick={{ fontSize: 12 }}
                />
                <YAxis 
                  domain={[0, 100]} 
                  className="text-xs"
                  tick={{ fontSize: 12 }}
                  label={{ 
                    value: 'Percentual de Acerto (%)', 
                    angle: -90, 
                    position: 'insideLeft',
                    style: { fontSize: 12 }
                  }}
                />
                <Tooltip content={<CustomTooltip />} />
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
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Análise de Descritores</CardTitle>
            <CardDescription>
              Distribuição dos descritores por nível de desempenho
            </CardDescription>
          </CardHeader>
          <CardContent className="h-[400px]">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {['Língua Portuguesa', 'Matemática'].map(subject => (
                <div key={subject} className="flex flex-col items-center">
                  <h3 className="text-base font-medium mb-4 text-center">{subject}</h3>
                  <ResponsiveContainer width="100%" height={300}>
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
                          <Cell 
                            key={`cell-${index}`} 
                            fill={entry.color}
                            className="transition-colors duration-300 hover:opacity-80"
                          />
                        ))}
                      </Pie>
                      <Tooltip content={<CustomTooltip />} />
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
