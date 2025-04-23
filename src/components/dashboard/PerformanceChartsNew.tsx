import React, { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { alunosService } from '@/services/alunosService';
import { avaliacoesService } from '@/services/avaliacoesService';
import { turmasService } from '@/services/turmasService';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';

interface PerformanceChartsProps {
  isSecretaria: boolean;
}

interface PerformanceData {
  avaliacao: string;
  portugues: number;
  matematica: number;
}

interface PresencaData {
  turma: string;
  presentes: number;
  ausentes: number;
}

const PerformanceCharts: React.FC<PerformanceChartsProps> = ({ isSecretaria }) => {
  const { user } = useAuth();
  const [performanceData, setPerformanceData] = useState<PerformanceData[]>([]);
  const [presencaData, setPresencaData] = useState<PresencaData[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const carregarDados = async () => {
      try {
        setIsLoading(true);
        
        // Carregar turmas da escola
        const turmas = await turmasService.listarPorEscola(user?.schoolId || '');
        
        // Carregar avaliações
        const avaliacoes = await avaliacoesService.listarPorEscola(user?.schoolId || '');
        
        // Preparar dados de desempenho
        const desempenhoPorAvaliacao: { [key: string]: { portugues: number; matematica: number } } = {};
        
        for (const avaliacao of avaliacoes) {
          if (avaliacao.status === 'concluida') {
            const data = new Date(avaliacao.dataInicio).toLocaleDateString('pt-BR', { month: 'short' });
            
            if (!desempenhoPorAvaliacao[data]) {
              desempenhoPorAvaliacao[data] = { portugues: 0, matematica: 0 };
            }
            
            let totalNota = 0;
            let totalAlunos = 0;
            
            for (const turma of turmas) {
              const alunos = await alunosService.listarPorTurma(turma.id);
              
              for (const aluno of alunos) {
                try {
                  const resposta = await alunosService.obterRespostas(avaliacao.id, aluno.id);
                  
                  if (resposta) {
                    totalNota += resposta.nota;
                    totalAlunos++;
                  }
                } catch (error) {
                  continue;
                }
              }
            }
            
            if (totalAlunos > 0) {
              const media = totalNota / totalAlunos;
              
              if (avaliacao.componente === 'portugues') {
                desempenhoPorAvaliacao[data].portugues = Math.round(media * 10) / 10;
              } else if (avaliacao.componente === 'matematica') {
                desempenhoPorAvaliacao[data].matematica = Math.round(media * 10) / 10;
              }
            }
          }
        }
        
        const desempenhoArray = Object.entries(desempenhoPorAvaliacao).map(([avaliacao, data]) => ({
          avaliacao,
          ...data
        }));
        
        setPerformanceData(desempenhoArray);
        
        // Preparar dados de presença por turma
        const presencaPorTurma: PresencaData[] = [];
        
        for (const turma of turmas) {
          const alunos = await alunosService.listarPorTurma(turma.id);
          let totalPresentes = 0;
          let totalAusentes = 0;
          
          for (const avaliacao of avaliacoes) {
            if (avaliacao.status === 'concluida') {
              for (const aluno of alunos) {
                try {
                  const resposta = await alunosService.obterRespostas(avaliacao.id, aluno.id);
                  if (resposta) {
                    totalPresentes++;
                  } else {
                    totalAusentes++;
                  }
                } catch (error) {
                  totalAusentes++;
                }
              }
            }
          }
          
          const total = totalPresentes + totalAusentes;
          if (total > 0) {
            presencaPorTurma.push({
              turma: turma.nome,
              presentes: Math.round((totalPresentes / total) * 100),
              ausentes: Math.round((totalAusentes / total) * 100)
            });
          }
        }
        
        setPresencaData(presencaPorTurma);
      } catch (error) {
        console.error('Erro ao carregar dados dos gráficos:', error);
        toast.error('Erro ao carregar dados dos gráficos. Por favor, tente novamente.');
      } finally {
        setIsLoading(false);
      }
    };
    
    carregarDados();
  }, [user?.schoolId]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-32">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

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