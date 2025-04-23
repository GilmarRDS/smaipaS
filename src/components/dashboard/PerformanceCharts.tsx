import React, { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { alunosService } from '@/services/alunosService';
import { avaliacoesService } from '@/services/avaliacoesService';
import { turmasService } from '@/services/turmasService';
import { Avaliacao } from '@/types/avaliacoes';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';

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

interface PerformanceChartsProps {
  isSecretaria?: boolean;
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
        
        // Se for secretaria, não precisa carregar dados específicos de escola
        if (isSecretaria) {
          setPerformanceData([]);
          return;
        }

        // Verificar se tem schoolId
        if (!user?.schoolId) {
          throw new Error('ID da escola não encontrado');
        }
        
        // Carregar turmas da escola
        const turmas = await turmasService.listarPorEscola(user.schoolId);
        
        // Carregar avaliações
        const avaliacoes = await avaliacoesService.listarPorEscola(user.schoolId) as Avaliacao[];
        
        // Processar dados de performance
        const performanceMap: { [key: string]: { portugues: number; matematica: number; totalPortugues: number; totalMatematica: number } } = {};
        
        // Inicializar o mapa de performance
        avaliacoes.forEach(avaliacao => {
          if (avaliacao.status === 'concluida') {
            if (!performanceMap[avaliacao.nome]) {
              performanceMap[avaliacao.nome] = { 
                portugues: 0, 
                matematica: 0, 
                totalPortugues: 0, 
                totalMatematica: 0 
              };
            }
          }
        });
        
        // Calcular médias de performance
        for (const avaliacao of avaliacoes) {
          if (avaliacao.status === 'concluida') {
            for (const turma of turmas) {
              const alunos = await alunosService.listarPorTurma(turma.id);
              
              for (const aluno of alunos) {
                try {
                  const resposta = await alunosService.obterRespostas(aluno.id, avaliacao.id);
                  
                  if (resposta) {
                    // Calcular nota baseada nas respostas corretas
                    const nota = resposta.respostas.reduce((total, item) => {
                      const itemGabarito = avaliacao.gabarito?.itens.find(i => i.numero === item.questao);
                      if (itemGabarito && item.alternativa === itemGabarito.resposta) {
                        return total + 1;
                      }
                      return total;
                    }, 0) / resposta.respostas.length * 10;

                    if (avaliacao.disciplina === 'PORTUGUES') {
                      performanceMap[avaliacao.nome].portugues += nota;
                      performanceMap[avaliacao.nome].totalPortugues++;
                    } else if (avaliacao.disciplina === 'MATEMATICA') {
                      performanceMap[avaliacao.nome].matematica += nota;
                      performanceMap[avaliacao.nome].totalMatematica++;
                    }
                  }
                } catch (error) {
                  // Aluno não tem resposta para esta avaliação
                  continue;
                }
              }
            }
          }
        }
        
        // Converter para array e calcular médias
        const performance = Object.entries(performanceMap).map(([avaliacao, data]) => ({
          avaliacao,
          portugues: data.totalPortugues > 0 ? Math.round((data.portugues / data.totalPortugues) * 10) / 10 : 0,
          matematica: data.totalMatematica > 0 ? Math.round((data.matematica / data.totalMatematica) * 10) / 10 : 0
        }));
        
        setPerformanceData(performance);
        
        // Processar dados de presença
        const presencaPromises = turmas.map(async turma => {
          const alunos = await alunosService.listarPorTurma(turma.id);
          const totalAlunos = alunos.length;
          
          let presentes = 0;
          
          for (const avaliacao of avaliacoes) {
            if (avaliacao.status === 'concluida') {
              for (const aluno of alunos) {
                try {
                  const resposta = await alunosService.obterRespostas(aluno.id, avaliacao.id);
                  if (resposta) {
                    presentes++;
                  }
                } catch (error) {
                  continue;
                }
              }
            }
          }
          
          const totalAvaliacoes = avaliacoes.filter(a => a.status === 'concluida').length;
          const totalPossivel = totalAlunos * totalAvaliacoes;
          
          return {
            turma: turma.nome,
            presentes: totalPossivel > 0 ? Math.round((presentes / totalPossivel) * 100) : 0,
            ausentes: totalPossivel > 0 ? Math.round(((totalPossivel - presentes) / totalPossivel) * 100) : 0
          };
        });
        
        const presenca = await Promise.all(presencaPromises);
        setPresencaData(presenca);
      } catch (error) {
        console.error('Erro ao carregar dados dos gráficos:', error);
        toast.error('Erro ao carregar dados dos gráficos. Por favor, tente novamente.');
      } finally {
        setIsLoading(false);
      }
    };
    
    carregarDados();
  }, [user?.schoolId, isSecretaria]);

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