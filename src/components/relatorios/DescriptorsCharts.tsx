
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

const DescriptorsCharts: React.FC<DescriptorsChartsProps> = ({ 
  desempenhoDescritores, 
  componente 
}) => {
  const descriptorColors = [
    { range: [0, 60], color: '#EF5350', label: 'Crítico' },
    { range: [60, 70], color: '#FFA726', label: 'Básico' },
    { range: [70, 85], color: '#66BB6A', label: 'Adequado' },
    { range: [85, 100], color: '#26A69A', label: 'Avançado' }
  ];

  const getColorForPercentage = (percentual: number) => {
    const colorInfo = descriptorColors.find(
      color => percentual >= color.range[0] && percentual < color.range[1]
    );
    return colorInfo ? colorInfo.color : '#8884d8';
  };

  const chartConfig = {
    portugues: {
      label: 'Língua Portuguesa',
      color: 'hsl(214, 89%, 52%)',
      icon: BookOpenText
    },
    matematica: {
      label: 'Matemática',
      color: 'hsl(160, 84%, 39%)',
      icon: Calculator
    }
  };

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
              <ResponsiveContainer width="100%" height="100%">
                <BarChart 
                  data={componente !== 'matematica' ? desempenhoDescritores : []} 
                  margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis dataKey="descritor" className="text-xs" />
                  <YAxis domain={[0, 100]} className="text-xs" />
                  <ChartTooltipContent />
                  <Bar dataKey="percentual" name="Percentual de Acerto">
                    {desempenhoDescritores.map((entry, index) => (
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
                  <ResponsiveContainer width="100%" height={250}>
                    <PieChart>
                      <Pie
                        data={[
                          { name: 'Crítico (Abaixo de 60%)', value: 2, color: '#EF5350' },
                          { name: 'Básico (60% a 70%)', value: 3, color: '#FFA726' },
                          { name: 'Adequado (70% a 85%)', value: 5, color: '#66BB6A' },
                          { name: 'Avançado (Acima de 85%)', value: 2, color: '#26A69A' }
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
