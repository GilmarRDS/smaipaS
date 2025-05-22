import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { useDashboardData } from '@/hooks/useDashboardData';
import { Loader2 } from 'lucide-react';

interface PerformanceChartsProps {
    isSecretaria: boolean;
}

const PerformanceCharts: React.FC<PerformanceChartsProps> = ({ isSecretaria }) => {
    const { data, isLoading, error } = useDashboardData();

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-32">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex items-center justify-center h-32 text-red-500">
                {error}
            </div>
        );
    }

    // Verificar se há dados para exibir
    const hasPerformanceData = data.performance.length > 0;
    const hasPresencaData = data.presenca.length > 0;

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
                    {hasPerformanceData ? (
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={data.performance} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis 
                                    dataKey="avaliacao"
                                    angle={-45}
                                    textAnchor="end"
                                    height={60}
                                />
                                <YAxis domain={[0, 100]} />
                                <Tooltip />
                                <Legend />
                                <Line 
                                    type="monotone" 
                                    dataKey="portugues" 
                                    stroke="#1E88E5" 
                                    name="Português"
                                    strokeWidth={2}
                                    dot={{ r: 4 }}
                                />
                                <Line 
                                    type="monotone" 
                                    dataKey="matematica" 
                                    stroke="#26A69A" 
                                    name="Matemática"
                                    strokeWidth={2}
                                    dot={{ r: 4 }}
                                />
                            </LineChart>
                        </ResponsiveContainer>
                    ) : (
                        <div className="flex items-center justify-center h-full text-muted-foreground">
                            Nenhum dado de desempenho disponível
                        </div>
                    )}
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
                    {hasPresencaData ? (
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={data.presenca} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis 
                                    dataKey="turma"
                                    angle={-45}
                                    textAnchor="end"
                                    height={60}
                                />
                                <YAxis domain={[0, 100]} />
                                <Tooltip />
                                <Legend />
                                <Bar 
                                    dataKey="presentes" 
                                    stackId="a" 
                                    fill="#66BB6A" 
                                    name="Presentes (%)"
                                    radius={[4, 4, 0, 0]}
                                />
                                <Bar 
                                    dataKey="ausentes" 
                                    stackId="a" 
                                    fill="#EF5350" 
                                    name="Ausentes (%)"
                                    radius={[0, 0, 4, 4]}
                                />
                            </BarChart>
                        </ResponsiveContainer>
                    ) : (
                        <div className="flex items-center justify-center h-full text-muted-foreground">
                            Nenhum dado de presença disponível
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
};

export default PerformanceCharts;