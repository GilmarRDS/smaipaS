import React from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Cell, PieChart, Pie, ResponsiveContainer, TooltipProps, Legend } from 'recharts';
import { BookOpenText, Calculator } from 'lucide-react';

export interface Descriptor {
  descritor: string;
  nome: string;
  percentual: number;
  componente?: string;
}

interface DescriptorsChartsProps {
  desempenhoDescritores: Descriptor[];
  componente?: string;
}

interface CustomTooltipProps extends TooltipProps<number, string> {
  active?: boolean;
  payload?: Array<{
    value: number;
    name: string;
    color: string;
    payload: Descriptor;
  }>;
  label?: string;
}

const CustomTooltip: React.FC<CustomTooltipProps> = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
        <p className="font-bold text-lg">{data.descritor}</p>
        <p className="text-sm text-gray-600 mb-1">{data.nome}</p>
        <p className="text-sm font-semibold">
          Acertos: <span className="text-blue-600">{data.percentual.toFixed(1)}%</span>
        </p>
      </div>
    );
  }
  return null;
};

const DescriptorsCharts: React.FC<DescriptorsChartsProps> = ({ desempenhoDescritores, componente }) => {
  console.log('DescriptorsCharts - Dados recebidos:', {
    desempenhoDescritores,
    componente,
    totalDescritores: desempenhoDescritores?.length
  });

  // Processar e ordenar os descritores
  const processedDescritores = React.useMemo(() => {
    return desempenhoDescritores
      .filter(d => d.descritor && d.percentual !== undefined)
      .map(d => ({
        ...d,
        descritor: d.descritor.split('-')[0].trim(), // Garantir que só temos o código
        percentual: Number(d.percentual.toFixed(1)) // Arredondar para 1 casa decimal
      }))
      .sort((a, b) => b.percentual - a.percentual); // Ordenar por percentual decrescente
  }, [desempenhoDescritores]);

  // Função para formatar o valor do eixo Y
  const formatYAxis = (value: string) => {
    return value;
  };

  // Função para formatar o valor do eixo X
  const formatXAxis = (value: number) => {
    return `${value}%`;
  };

  // Calcular a média geral
  const mediaGeral = React.useMemo(() => {
    if (processedDescritores.length === 0) return 0;
    const soma = processedDescritores.reduce((acc, curr) => acc + curr.percentual, 0);
    return Number((soma / processedDescritores.length).toFixed(1));
  }, [processedDescritores]);

  if (processedDescritores.length === 0) {
    console.log('DescriptorsCharts - Nenhum dado disponível');
    return (
      <div className="text-center p-4 text-muted-foreground">
        Nenhum dado disponível para exibição.
      </div>
    );
  }

  return (
    <Card className="bg-smaipa-50/50 border-smaipa-100">
      <CardHeader>
        <CardTitle className="text-xl font-semibold">
          Análise de Descritores
          {componente && <span className="text-sm font-normal ml-2">({componente})</span>}
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Média Geral: {mediaGeral}%
        </p>
      </CardHeader>
      <CardContent>
        <div className="h-[500px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={processedDescritores}
              layout="vertical"
              margin={{ top: 20, right: 30, left: 40, bottom: 20 }}
            >
              <CartesianGrid strokeDasharray="3 3" horizontal={false} />
              <XAxis
                type="number"
                domain={[0, 100]}
                tickFormatter={formatXAxis}
                tick={{ fill: '#666', fontSize: 12 }}
                axisLine={{ stroke: '#666' }}
                tickLine={{ stroke: '#666' }}
              />
              <YAxis
                type="category"
                dataKey="descritor"
                tickFormatter={formatYAxis}
                width={80}
                tick={{ fill: '#666', fontSize: 12 }}
                axisLine={{ stroke: '#666' }}
                tickLine={{ stroke: '#666' }}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              <Bar
                dataKey="percentual"
                fill="#3b82f6"
                radius={[0, 4, 4, 0]}
                name="Percentual de Acertos"
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
};

export default DescriptorsCharts;
