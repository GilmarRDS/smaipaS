import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
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

const PerformanceCharts: React.FC<PerformanceChartsProps> = ({ dados }) => {
  console.log('PerformanceCharts - Dados recebidos:', dados);

  if (!dados) {
    console.log('PerformanceCharts - Nenhum dado recebido');
    return (
      <div className="text-center p-4">
        <p>Nenhum dado disponível para exibição.</p>
      </div>
    );
  }

  const evolucaoData = dados.evolucao || [];
  const desempenhoData = dados.desempenho || [];

  console.log('PerformanceCharts - Dados processados:', {
    evolucao: evolucaoData,
    desempenho: desempenhoData
  });

  if (evolucaoData.length === 0 && desempenhoData.length === 0) {
    console.log('PerformanceCharts - Nenhum dado para exibir');
    return (
      <div className="text-center p-4">
        <p>Nenhum dado disponível para exibição.</p>
      </div>
    );
  }

  const chartConfig = {
    media: {
      label: 'Média',
      color: '#8884d8'
    },
    meta: {
      label: 'Meta',
      color: '#82ca9d'
    },
    quantidade: {
      label: 'Quantidade',
      color: '#8884d8'
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {evolucaoData.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Evolução do Desempenho</CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig}>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={evolucaoData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="periodo" />
                  <YAxis domain={[0, 100]} />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="media" name="Média" fill={chartConfig.media.color} />
                  <Bar dataKey="meta" name="Meta" fill={chartConfig.meta.color} />
                </BarChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>
      )}

      {desempenhoData.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Distribuição de Desempenho</CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig}>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={desempenhoData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="categoria" />
                  <YAxis domain={[0, 100]} />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="quantidade" name="Quantidade" fill={chartConfig.quantidade.color} />
                </BarChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default PerformanceCharts;
