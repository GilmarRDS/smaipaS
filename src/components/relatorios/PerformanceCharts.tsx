
import React from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import RadarChartComponent from '@/components/charts/RadarChart';

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
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={desempenhoTurmas} layout="vertical" margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
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
              <LineChart data={evolucaoDesempenho} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
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
            data={desempenhoHabilidades} 
            dataKey="percentual" 
            nameKey="nome" 
          />
        </CardContent>
      </Card>
    </>
  );
};

export default PerformanceCharts;
