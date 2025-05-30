import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';
import { BookOpenText, Calculator, Target, TrendingUp } from 'lucide-react';
import type { Descriptor } from './DescriptorsCharts';

interface DescriptorsAnalysisProps {
  desempenhoDescritores: Descriptor[];
  componente?: string;
}

const COLORS = {
  excelente: '#22c55e', // Verde
  bom: '#eab308',      // Amarelo
  regular: '#f97316',  // Laranja
  baixo: '#ef4444',    // Vermelho
};

const DescriptorsAnalysis: React.FC<DescriptorsAnalysisProps> = ({ desempenhoDescritores, componente }) => {
  // Processar dados para diferentes visualizações
  const processedData = React.useMemo(() => {
    const filtered = desempenhoDescritores
      .filter(d => d.descritor && d.percentual !== undefined)
      .map(d => ({
        ...d,
        descritor: d.descritor.split('-')[0].trim(),
        percentual: Number(d.percentual.toFixed(1))
      }));

    // Dados para o gráfico de distribuição
    const distribuicao = [
      { name: 'Excelente (80-100%)', value: filtered.filter(d => d.percentual >= 80).length },
      { name: 'Bom (60-79%)', value: filtered.filter(d => d.percentual >= 60 && d.percentual < 80).length },
      { name: 'Regular (40-59%)', value: filtered.filter(d => d.percentual >= 40 && d.percentual < 60).length },
      { name: 'Baixo (0-39%)', value: filtered.filter(d => d.percentual < 40).length }
    ];

    // Dados para o gráfico de evolução (ordenado por percentual)
    const evolucao = [...filtered].sort((a, b) => b.percentual - a.percentual);

    // Calcular estatísticas
    const media = filtered.reduce((acc, curr) => acc + curr.percentual, 0) / filtered.length;
    const max = Math.max(...filtered.map(d => d.percentual));
    const min = Math.min(...filtered.map(d => d.percentual));

    return {
      distribuicao,
      evolucao,
      estatisticas: {
        media: Number(media.toFixed(1)),
        max: Number(max.toFixed(1)),
        min: Number(min.toFixed(1)),
        total: filtered.length
      }
    };
  }, [desempenhoDescritores]);

  // Custom Tooltip para o gráfico de distribuição
  const CustomPieTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      const percentual = ((data.value / processedData.estatisticas.total) * 100).toFixed(1);
      return (
        <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
          <p className="font-bold">{data.name}</p>
          <p className="text-sm text-gray-600">
            Quantidade: {data.value}
          </p>
          <p className="text-sm text-gray-600">
            Percentual: {percentual}%
          </p>
        </div>
      );
    }
    return null;
  };

  if (processedData.estatisticas.total === 0) {
    return (
      <div className="text-center p-4 text-muted-foreground">
        Nenhum dado disponível para exibição.
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Card de Estatísticas */}
      <Card className="bg-smaipa-50/50 border-smaipa-100">
        <CardHeader>
          <CardTitle className="text-xl font-semibold flex items-center gap-2">
            <Target className="h-5 w-5" />
            Estatísticas dos Descritores
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 bg-white rounded-lg shadow-sm">
              <p className="text-sm text-gray-600">Média Geral</p>
              <p className="text-2xl font-bold text-blue-600">{processedData.estatisticas.media}%</p>
            </div>
            <div className="p-4 bg-white rounded-lg shadow-sm">
              <p className="text-sm text-gray-600">Total de Descritores</p>
              <p className="text-2xl font-bold text-blue-600">{processedData.estatisticas.total}</p>
            </div>
            <div className="p-4 bg-white rounded-lg shadow-sm">
              <p className="text-sm text-gray-600">Maior Percentual</p>
              <p className="text-2xl font-bold text-green-600">{processedData.estatisticas.max}%</p>
            </div>
            <div className="p-4 bg-white rounded-lg shadow-sm">
              <p className="text-sm text-gray-600">Menor Percentual</p>
              <p className="text-2xl font-bold text-red-600">{processedData.estatisticas.min}%</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Card de Distribuição */}
      <Card className="bg-smaipa-50/50 border-smaipa-100">
        <CardHeader>
          <CardTitle className="text-xl font-semibold flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Distribuição de Desempenho
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={processedData.distribuicao}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                >
                  {processedData.distribuicao.map((entry, index) => (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={Object.values(COLORS)[index]}
                    />
                  ))}
                </Pie>
                <Tooltip content={<CustomPieTooltip />} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Card de Evolução */}
      <Card className="bg-smaipa-50/50 border-smaipa-100 lg:col-span-2">
        <CardHeader>
          <CardTitle className="text-xl font-semibold flex items-center gap-2">
            {componente === 'portugues' ? (
              <BookOpenText className="h-5 w-5 text-blue-500" />
            ) : componente === 'matematica' ? (
              <Calculator className="h-5 w-5 text-green-500" />
            ) : (
              <TrendingUp className="h-5 w-5" />
            )}
            Evolução dos Descritores
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[400px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={processedData.evolucao}
                margin={{ top: 20, right: 30, left: 40, bottom: 60 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  dataKey="descritor"
                  angle={-45}
                  textAnchor="end"
                  height={60}
                  tick={{ fontSize: 12 }}
                />
                <YAxis
                  domain={[0, 100]}
                  tickFormatter={(value) => `${value}%`}
                />
                <Tooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const data = payload[0].payload;
                      return (
                        <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
                          <p className="font-bold">{data.descritor}</p>
                          <p className="text-sm text-gray-600">{data.nome}</p>
                          <p className="text-sm font-semibold">
                            Percentual: <span className="text-blue-600">{data.percentual}%</span>
                          </p>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Bar
                  dataKey="percentual"
                  name="Percentual de Acertos"
                  fill="#3b82f6"
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default DescriptorsAnalysis; 