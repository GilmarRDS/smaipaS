import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import { useDashboardData } from '@/hooks/useDashboardData';
import { Loader2 } from 'lucide-react';

interface PerformanceChartsProps {
    isSecretaria: boolean;
}

const PerformanceCharts: React.FC<PerformanceChartsProps> = ({ isSecretaria }) => {
    const { data, isLoading, error } = useDashboardData();

    console.log('PerformanceCharts - Dados recebidos:', JSON.stringify(data, null, 2));
    console.log('PerformanceCharts - Tipo dos dados:', {
        performance: data?.performance ? typeof data.performance : 'undefined',
        presenca: data?.presenca ? typeof data.presenca : 'undefined'
    });

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

    console.log('PerformanceCharts - hasPerformanceData:', hasPerformanceData);
    console.log('PerformanceCharts - hasPresencaData:', hasPresencaData);
    console.log('PerformanceCharts - performance data:', JSON.stringify(data?.performance, null, 2));
    console.log('PerformanceCharts - presenca data:', JSON.stringify(data?.presenca, null, 2));

    if (!hasPerformanceData && !hasPresencaData) {
        console.warn('PerformanceCharts - Nenhum dado disponível para exibição');
        console.warn('PerformanceCharts - Dados recebidos:', JSON.stringify({
            performance: data?.performance,
            presenca: data?.presenca
        }, null, 2));
    }

    // Dados de exemplo para teste
    const dadosExemplo = {
        performance: [
            { avaliacao: 'Avaliação 1', portugues: 75, matematica: 80 },
            { avaliacao: 'Avaliação 2', portugues: 82, matematica: 78 },
            { avaliacao: 'Avaliação 3', portugues: 88, matematica: 85 }
        ],
        presenca: [
            { turma: 'Turma A', presentes: 85, ausentes: 15 },
            { turma: 'Turma B', presentes: 90, ausentes: 10 },
            { turma: 'Turma C', presentes: 88, ausentes: 12 }
        ]
    };

    // Usar dados reais se disponíveis, caso contrário usar dados de exemplo
    const dadosParaExibicao = {
        performance: hasPerformanceData ? data.performance : dadosExemplo.performance,
        presenca: hasPresencaData ? data.presenca : dadosExemplo.presenca
    };

    return (
        <div className="grid gap-6 md:grid-cols-2">
            <Card className="col-span-2">
                <CardHeader>
                    <CardTitle>Evolução do Desempenho</CardTitle>
                    <CardDescription>
                        Média de desempenho nas disciplinas por avaliação
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="w-full h-[500px] flex items-center justify-center">
                        <LineChart 
                            width={1000} 
                            height={500} 
                            data={dadosParaExibicao.performance} 
                            margin={{ top: 20, right: 30, left: 20, bottom: 80 }}
                        >
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis 
                                dataKey="avaliacao"
                                angle={-45}
                                textAnchor="end"
                                height={100}
                                tick={{ fontSize: 14 }}
                            />
                            <YAxis 
                                domain={[0, 100]} 
                                tick={{ fontSize: 14 }}
                                label={{ value: 'Percentual (%)', angle: -90, position: 'insideLeft', style: { fontSize: 14 } }}
                            />
                            <Tooltip />
                            <Legend wrapperStyle={{ paddingTop: 20 }} />
                            <Line 
                                type="monotone" 
                                dataKey="portugues" 
                                stroke="#1E88E5" 
                                name="Português"
                                strokeWidth={3}
                                dot={{ r: 6 }}
                            />
                            <Line 
                                type="monotone" 
                                dataKey="matematica" 
                                stroke="#26A69A" 
                                name="Matemática"
                                strokeWidth={3}
                                dot={{ r: 6 }}
                            />
                        </LineChart>
                    </div>
                </CardContent>
            </Card>
            
            <Card className="col-span-2">
                <CardHeader>
                    <CardTitle>Taxa de Presença por Turma</CardTitle>
                    <CardDescription>
                        Percentual de presença e ausência por turma
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="w-full h-[500px] flex items-center justify-center">
                        <BarChart 
                            width={1000} 
                            height={500} 
                            data={dadosParaExibicao.presenca} 
                            margin={{ top: 20, right: 30, left: 20, bottom: 80 }}
                        >
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis 
                                dataKey="turma"
                                angle={-45}
                                textAnchor="end"
                                height={100}
                                tick={{ fontSize: 14 }}
                            />
                            <YAxis 
                                domain={[0, 100]} 
                                tick={{ fontSize: 14 }}
                                label={{ value: 'Percentual (%)', angle: -90, position: 'insideLeft', style: { fontSize: 14 } }}
                            />
                            <Tooltip />
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
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};

export default PerformanceCharts;