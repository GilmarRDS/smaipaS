import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { useDashboardData } from '@/hooks/useDashboardData';
import { Loader2 } from 'lucide-react';

interface PerformanceChartsProps {
    isSecretaria: boolean;
}

interface TooltipProps {
    active?: boolean;
    payload?: Array<{
        value: number;
        name: string;
        color: string;
    }>;
    label?: string;
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
    const hasPerformanceData = data?.performance && Array.isArray(data.performance) && data.performance.length > 0;
    const hasPresencaData = data?.presenca && Array.isArray(data.presenca) && data.presenca.length > 0;

    if (!hasPerformanceData && !hasPresencaData) {
        return (
            <div className="text-center p-4 text-muted-foreground">
                Nenhum dado disponível para exibição.
            </div>
        );
    }

    const CustomTooltip: React.FC<TooltipProps> = ({ active, payload, label }) => {
        if (active && payload && payload.length) {
            return (
                <div className="bg-background border rounded-lg p-3 shadow-lg">
                    <p className="font-medium">{label}</p>
                    {payload.map((entry, index) => (
                        <p key={index} style={{ color: entry.color }}>
                            {entry.name}: {entry.value}%
                        </p>
                    ))}
                </div>
            );
        }
        return null;
    };

    return (
        <div className="grid gap-6 md:grid-cols-2">
            {hasPerformanceData && (
                <Card className="col-span-2">
                    <CardHeader>
                        <CardTitle>Evolução do Desempenho</CardTitle>
                        <CardDescription>
                            Média de desempenho nas disciplinas por avaliação
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="w-full h-[400px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart 
                                    data={data.performance}
                                    margin={{ top: 20, right: 30, left: 20, bottom: 80 }}
                                >
                                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                                    <XAxis 
                                        dataKey="avaliacao"
                                        angle={-45}
                                        textAnchor="end"
                                        height={100}
                                        tick={{ fontSize: 12 }}
                                        className="text-xs"
                                    />
                                    <YAxis 
                                        domain={[0, 100]} 
                                        tick={{ fontSize: 12 }}
                                        className="text-xs"
                                        label={{ 
                                            value: 'Percentual (%)', 
                                            angle: -90, 
                                            position: 'insideLeft',
                                            style: { fontSize: 12 }
                                        }}
                                    />
                                    <Tooltip content={<CustomTooltip />} />
                                    <Legend wrapperStyle={{ paddingTop: 20 }} />
                                    <Line 
                                        type="monotone" 
                                        dataKey="portugues" 
                                        stroke="#1E88E5" 
                                        name="Português"
                                        strokeWidth={2}
                                        dot={{ r: 4 }}
                                        activeDot={{ r: 6 }}
                                    />
                                    <Line 
                                        type="monotone" 
                                        dataKey="matematica" 
                                        stroke="#26A69A" 
                                        name="Matemática"
                                        strokeWidth={2}
                                        dot={{ r: 4 }}
                                        activeDot={{ r: 6 }}
                                    />
                                </LineChart>
                            </ResponsiveContainer>
                        </div>
                    </CardContent>
                </Card>
            )}
            
            {hasPresencaData && (
                <Card className="col-span-2">
                    <CardHeader>
                        <CardTitle>Taxa de Presença por Turma</CardTitle>
                        <CardDescription>
                            Percentual de presença e ausência por turma
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="w-full h-[400px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart 
                                    data={data.presenca}
                                    margin={{ top: 20, right: 30, left: 20, bottom: 80 }}
                                >
                                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                                    <XAxis 
                                        dataKey="turma"
                                        angle={-45}
                                        textAnchor="end"
                                        height={100}
                                        tick={{ fontSize: 12 }}
                                        className="text-xs"
                                    />
                                    <YAxis 
                                        domain={[0, 100]} 
                                        tick={{ fontSize: 12 }}
                                        className="text-xs"
                                        label={{ 
                                            value: 'Percentual (%)', 
                                            angle: -90, 
                                            position: 'insideLeft',
                                            style: { fontSize: 12 }
                                        }}
                                    />
                                    <Tooltip content={<CustomTooltip />} />
                                    <Legend wrapperStyle={{ paddingTop: 20 }} />
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
                        </div>
                    </CardContent>
                </Card>
            )}
        </div>
    );
};

export default PerformanceCharts;