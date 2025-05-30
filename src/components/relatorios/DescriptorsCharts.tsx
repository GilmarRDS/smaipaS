import React from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Cell, PieChart, Pie, ResponsiveContainer, TooltipProps } from 'recharts';
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
      <div className="bg-background border rounded-lg p-3 shadow-lg">
        <p className="font-medium">{data.descritor}</p>
        <p className="text-sm text-muted-foreground">{data.nome}</p>
        <p style={{ color: payload[0].color }}>
          Percentual: {payload[0].value.toFixed(1)}%
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

  const getColorForPercentage = (percentual: number) => {
    if (percentual >= 80) return '#66BB6A'; // Verde
    if (percentual >= 60) return '#FFA726'; // Laranja
    return '#EF5350'; // Vermelho
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

  // Processar os descritores para garantir o formato correto
  const processedDescritores = (desempenhoDescritores || [])
    .filter(d => {
      if (!d || !d.descritor) {
        console.log('Filtrando descritor inválido:', d);
        return false;
      }
      if (componente === 'all_componentes') return true;
      return d.componente?.toLowerCase() === componente.toLowerCase();
    })
    .map(d => {
      // Garantir que o descritor seja apenas o código
      const descritorCode = d.descritor.split(' - ')[0];
      const processed = {
        ...d,
        descritor: descritorCode
      };
      console.log('Processando descritor:', processed);
      return processed;
    })
    .sort((a, b) => b.percentual - a.percentual);

  console.log('DescriptorsCharts - Dados processados:', {
    processedDescritores,
    totalProcessados: processedDescritores.length
  });

  const performanceData = calculatePerformanceData(processedDescritores);

  if (processedDescritores.length === 0) {
    console.log('DescriptorsCharts - Nenhum dado disponível');
    return (
      <div className="text-center p-4 text-muted-foreground">
        Nenhum dado disponível para exibição.
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <Card className="col-span-1">
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
        <CardContent className="h-[500px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart 
              data={processedDescritores} 
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
                  value: 'Percentual de Acerto (%)', 
                  position: 'insideBottom',
                  offset: -5,
                  style: { fontSize: 12 }
                }}
              />
              <YAxis 
                type="category"
                dataKey="descritor" 
                className="text-xs"
                width={80}
                tick={{ fontSize: 12 }}
              />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="percentual" name="Percentual de Acerto">
                {processedDescritores.map((entry, index) => (
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
      
      <Card className="col-span-1">
        <CardHeader>
          <CardTitle>Análise de Descritores</CardTitle>
          <CardDescription>
            Distribuição dos descritores por nível de desempenho
          </CardDescription>
        </CardHeader>
        <CardContent className="h-[500px]">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={performanceData}
                dataKey="value"
                cx="50%"
                cy="50%"
                labelLine={false}
                outerRadius={150}
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
        </CardContent>
      </Card>
    </div>
  );
};

export default DescriptorsCharts;
