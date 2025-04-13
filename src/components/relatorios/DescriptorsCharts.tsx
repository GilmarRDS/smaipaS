
import React from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Cell, PieChart, Pie, ResponsiveContainer } from 'recharts';

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
  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Desempenho em Língua Portuguesa</CardTitle>
            <CardDescription>
              Percentual de acerto por descritor
            </CardDescription>
          </CardHeader>
          <CardContent className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={componente !== 'matematica' ? desempenhoDescritores : []} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="descritor" />
                <YAxis domain={[0, 100]} />
                <Tooltip 
                  formatter={(value, name, props) => {
                    return [`${value}%`, props.payload.nome];
                  }}
                />
                <Bar dataKey="percentual" name="Percentual de Acerto" fill="#1E88E5">
                  {desempenhoDescritores.map((entry, index) => (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={entry.percentual < 60 ? '#EF5350' : entry.percentual < 70 ? '#FFA726' : '#66BB6A'} 
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Desempenho em Matemática</CardTitle>
            <CardDescription>
              Percentual de acerto por descritor
            </CardDescription>
          </CardHeader>
          <CardContent className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={componente !== 'portugues' ? desempenhoDescritores : []} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="descritor" />
                <YAxis domain={[0, 100]} />
                <Tooltip 
                  formatter={(value, name, props) => {
                    return [`${value}%`, props.payload.nome];
                  }}
                />
                <Bar dataKey="percentual" name="Percentual de Acerto" fill="#26A69A">
                  {desempenhoDescritores.map((entry, index) => (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={entry.percentual < 60 ? '#EF5350' : entry.percentual < 70 ? '#FFA726' : '#66BB6A'} 
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Análise de Descritores</CardTitle>
          <CardDescription>
            Distribuição dos descritores por nível de desempenho
          </CardDescription>
        </CardHeader>
        <CardContent className="h-72">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h3 className="text-base font-medium mb-2 text-center">Língua Portuguesa</h3>
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie
                    data={[
                      { name: 'Crítico (Abaixo de 60%)', value: 2 },
                      { name: 'Básico (60% a 70%)', value: 3 },
                      { name: 'Adequado (70% a 85%)', value: 5 },
                      { name: 'Avançado (Acima de 85%)', value: 2 }
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
                  <Tooltip formatter={(value) => [`${value} descritores`, '']} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div>
              <h3 className="text-base font-medium mb-2 text-center">Matemática</h3>
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie
                    data={[
                      { name: 'Crítico (Abaixo de 60%)', value: 3 },
                      { name: 'Básico (60% a 70%)', value: 4 },
                      { name: 'Adequado (70% a 85%)', value: 4 },
                      { name: 'Avançado (Acima de 85%)', value: 1 }
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
                  <Tooltip formatter={(value) => [`${value} descritores`, '']} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </CardContent>
      </Card>
    </>
  );
};

export default DescriptorsCharts;
