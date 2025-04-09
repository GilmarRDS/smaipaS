
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface PerformanceChartsProps {
  performanceData: Array<{
    avaliacao: string;
    portugues: number;
    matematica: number;
  }>;
  presencaData: Array<{
    turma: string;
    presentes: number;
    ausentes: number;
  }>;
}

const PerformanceCharts: React.FC<PerformanceChartsProps> = ({ performanceData, presencaData }) => {
  return (
    <div className="grid gap-4 md:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle>Evolução do Desempenho</CardTitle>
          <CardDescription>
            Média de desempenho nas disciplinas por avaliação
          </CardDescription>
        </CardHeader>
        <CardContent className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={performanceData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="avaliacao" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="portugues" stroke="#1E88E5" name="Português" />
              <Line type="monotone" dataKey="matematica" stroke="#26A69A" name="Matemática" />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Taxa de Presença por Turma</CardTitle>
          <CardDescription>
            Percentual de presença e ausência por turma
          </CardDescription>
        </CardHeader>
        <CardContent className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={presencaData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="turma" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="presentes" stackId="a" fill="#66BB6A" name="Presentes (%)" />
              <Bar dataKey="ausentes" stackId="a" fill="#EF5350" name="Ausentes (%)" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
};

export default PerformanceCharts;
