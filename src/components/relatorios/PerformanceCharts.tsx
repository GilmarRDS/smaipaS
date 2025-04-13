
import React from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import RadarChartComponent from '@/components/charts/RadarChart';
import { ChartContainer, ChartTooltipContent } from '@/components/ui/chart';
import { Book, Calculator } from 'lucide-react';

interface PerformanceChartsProps {
  desempenhoTurmas: Array<{
    turma: string;
    portugues: number;
    matematica: number;
  }>;
  evolucaoDesempenho: Array<{
    avaliacao: string;
    portugues: number;
    matematica: number;
  }>;
  desempenhoHabilidades: Array<{
    nome: string;
    percentual: number;
  }>;
}

const PerformanceCharts: React.FC<PerformanceChartsProps> = ({ 
  desempenhoTurmas, 
  evolucaoDesempenho, 
  desempenhoHabilidades 
}) => {
  const chartConfig = {
    portugues: {
      label: 'Língua Portuguesa',
      color: 'hsl(214, 89%, 52%)',
      icon: Book
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
            <CardTitle>Desempenho por Turma</CardTitle>
            <CardDescription>
              Média de acertos por turma nas disciplinas
            </CardDescription>
          </CardHeader>
          <CardContent className="h-80">
            <ChartContainer config={chartConfig}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={desempenhoTurmas} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis type="number" domain={[0, 100]} className="text-xs" />
                  <YAxis dataKey="turma" type="category" className="text-xs" />
                  <ChartTooltipContent />
                  <Bar dataKey="portugues" name="Língua Portuguesa" fill={chartConfig.portugues.color} radius={[0, 4, 4, 0]} />
                  <Bar dataKey="matematica" name="Matemática" fill={chartConfig.matematica.color} radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Evolução do Desempenho</CardTitle>
            <CardDescription>
              Comparativo de desempenho nas avaliações diagnósticas
            </CardDescription>
          </CardHeader>
          <CardContent className="h-80">
            <ChartContainer config={chartConfig}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={evolucaoDesempenho}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis 
                    dataKey="avaliacao" 
                    className="text-xs"
                    tick={{ fontSize: 10 }}
                    angle={-15}
                    textAnchor="end"
                    height={60}
                  />
                  <YAxis domain={[0, 100]} className="text-xs" />
                  <ChartTooltipContent />
                  <Line 
                    type="monotone" 
                    dataKey="portugues" 
                    stroke={chartConfig.portugues.color} 
                    strokeWidth={3} 
                    dot={{ r: 5 }} 
                  />
                  <Line 
                    type="monotone" 
                    dataKey="matematica" 
                    stroke={chartConfig.matematica.color} 
                    strokeWidth={3} 
                    dot={{ r: 5 }} 
                  />
                </LineChart>
              </ResponsiveContainer>
            </ChartContainer>
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
            data={desempenhoHabilidades} 
            dataKey="percentual" 
            nameKey="nome" 
            colors={['#7C3AED', '#8B5CF6']}
          />
        </CardContent>
      </Card>
    </>
  );
};

export default PerformanceCharts;
