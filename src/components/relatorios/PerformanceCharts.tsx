import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, LineChart, Line, TooltipProps } from 'recharts';
import { ChartContainer } from '@/components/ui/chart';

interface PerformanceChartsProps {
  dados: {
    evolucao: Array<{
      periodo: string;
      media: number;
      meta: number;
    }>;
    desempenho: Array<{
      categoria: string;
      quantidade: number;
    }>;
  };
}

interface CustomTooltipProps extends TooltipProps<number, string> {
  active?: boolean;
  payload?: Array<{
    value: number;
    name: string;
    color: string;
  }>;
  label?: string;
}

const CustomTooltip: React.FC<CustomTooltipProps> = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-background border rounded-lg p-3 shadow-lg">
        <p className="font-medium">{label}</p>
        {payload.map((entry, index) => (
          <p key={index} style={{ color: entry.color }}>
            {entry.name}: {entry.value.toFixed(1)}%
          </p>
        ))}
      </div>
    );
  }
  return null;
};

const PerformanceCharts: React.FC<PerformanceChartsProps> = ({ dados }) => {
  const evolucaoData = dados.evolucao || [];
  const desempenhoData = dados.desempenho || [];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {evolucaoData.length > 0 && (
        <Card className="col-span-1">
          <CardHeader>
            <CardTitle>Evolução do Desempenho</CardTitle>
            <CardDescription>
              Comparativo entre média alcançada e meta por período
            </CardDescription>
          </CardHeader>
          <CardContent className="h-[500px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={evolucaoData} margin={{ top: 20, right: 30, left: 20, bottom: 80 }}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis 
                  dataKey="periodo" 
                  angle={-45}
                  textAnchor="end"
                  height={100}
                  tick={{ fontSize: 12 }}
                />
                <YAxis 
                  domain={[0, 100]}
                  tick={{ fontSize: 12 }}
                  label={{ 
                    value: 'Percentual (%)', 
                    angle: -90, 
                    position: 'insideLeft',
                    style: { fontSize: 12 }
                  }}
                />
                <Tooltip content={<CustomTooltip />} />
                <Legend />
                <Line 
                  type="monotone" 
                  dataKey="media" 
                  name="Média Alcançada" 
                  stroke="#8884d8" 
                  strokeWidth={2}
                  dot={{ r: 4 }}
                  activeDot={{ r: 6 }}
                />
                <Line 
                  type="monotone" 
                  dataKey="meta" 
                  name="Meta" 
                  stroke="#82ca9d" 
                  strokeWidth={2}
                  strokeDasharray="5 5"
                  dot={{ r: 4 }}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}

      {desempenhoData.length > 0 && (
        <Card className="col-span-1">
          <CardHeader>
            <CardTitle>Distribuição de Desempenho</CardTitle>
            <CardDescription>
              Percentual de desempenho por categoria
            </CardDescription>
          </CardHeader>
          <CardContent className="h-[500px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart 
                data={desempenhoData} 
                margin={{ top: 20, right: 30, left: 20, bottom: 80 }}
                layout="vertical"
              >
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis 
                  type="number"
                  domain={[0, 100]} 
                  className="text-xs"
                  tick={{ fontSize: 12 }}
                  label={{ 
                    value: 'Percentual (%)', 
                    position: 'insideBottom',
                    offset: -5,
                    style: { fontSize: 12 }
                  }}
                />
                <YAxis 
                  type="category"
                  dataKey="categoria" 
                  className="text-xs"
                  width={150}
                  tick={{ fontSize: 12 }}
                />
                <Tooltip content={<CustomTooltip />} />
                <Bar 
                  dataKey="quantidade" 
                  name="Percentual de Desempenho"
                  fill="#8884d8"
                  className="transition-colors duration-300 hover:opacity-80"
                />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default PerformanceCharts;
