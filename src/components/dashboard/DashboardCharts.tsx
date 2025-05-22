import React, { useEffect, useState } from 'react';
import useAuth from '@/hooks/useAuth';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { alunosService } from '@/services/alunosService';
import { avaliacoesService } from '@/services/avaliacoesService';
import { turmasService } from '@/services/turmasService';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { Aluno } from '@/types/alunos';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  BarChart,
  Bar,
} from 'recharts';

interface DashboardChartsProps {
  isSecretaria: boolean;
}

interface DesempenhoData {
  name: string;
  portugues: number;
  matematica: number;
}

interface PresencaData {
  name: string;
  presenca: number;
}

const DashboardCharts: React.FC<DashboardChartsProps> = ({ isSecretaria }) => {
  const { user } = useAuth();
  const [desempenhoData, setDesempenhoData] = useState<DesempenhoData[]>([]);
  const [presencaData, setPresencaData] = useState<PresencaData[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const carregarDados = async () => {
      try {
        setIsLoading(true);
        
        // Determinar o ID da escola a ser usado
        const escolaId = isSecretaria && user?.schoolId
          ? user.schoolId
          : user?.schoolId;

        if (!escolaId) {
          console.warn('Usuário não tem schoolId definido - não é possível carregar dados');
          setDesempenhoData([]);
          setPresencaData([]);
          setIsLoading(false);
          return;
        }
        
        // Buscar dados de uma vez para reduzir chamadas à API
        const [turmas, avaliacoes] = await Promise.all([
          turmasService.listar(escolaId),
          avaliacoesService.listarPorEscola(escolaId)
        ]);
        
        // Verificação de dados vazios
        if (!turmas?.length || !avaliacoes?.length) {
          console.info('Não há turmas ou avaliações para exibir');
          setDesempenhoData([]);
          setPresencaData([]);
          setIsLoading(false);
          return;
        }

        // Buscar todos os alunos de todas as turmas de uma vez
        const turmasAlunosPromises = turmas.map(turma => 
          alunosService.listarPorTurma(turma.id).then(alunos => ({
            turmaId: turma.id,
            alunos: alunos || []
          }))
        );
        
        const turmasAlunos = await Promise.all(turmasAlunosPromises);
        
        // Criar mapa de turmaId -> alunos para acesso rápido
        const alunosPorTurma = turmasAlunos.reduce((map, item) => {
          if (item?.turmaId && item?.alunos) {
            map[item.turmaId] = item.alunos;
          }
          return map;
        }, {} as Record<string, Aluno[]>);
        
        // Preparar dados de desempenho
        const desempenhoPorAvaliacao: Record<string, { portugues: number; matematica: number }> = {};
        const presencaPorMes: Record<string, { presentes: number; total: number }> = {};
        
        // Para cada avaliação concluída
        const avaliacoesConcluidas = avaliacoes.filter(av => av?.status === 'concluida');
        
        for (const avaliacao of avaliacoesConcluidas) {
          if (!avaliacao?.dataInicio) continue;
          
          const data = new Date(avaliacao.dataInicio).toLocaleDateString('pt-BR', { month: 'short' });
          
          // Inicializar registros se não existirem
          if (!desempenhoPorAvaliacao[data]) {
            desempenhoPorAvaliacao[data] = { portugues: 0, matematica: 0 };
          }
          
          if (!presencaPorMes[data]) {
            presencaPorMes[data] = { presentes: 0, total: 0 };
          }
          
          let totalNota = 0;
          let totalAlunos = 0;
          let totalPresentes = 0;
          
          // Para cada turma, processar alunos e respostas
          for (const turma of turmas) {
            if (!turma?.id) continue;
            
            const alunos = alunosPorTurma[turma.id] || [];
            presencaPorMes[data].total += alunos.length;
            
            // Obter respostas de todos os alunos de uma vez seria ideal,
            // mas se a API não suporta, precisamos fazer um por um
            for (const aluno of alunos) {
              if (!aluno?.id) continue;
              
              try {
                const resposta = await alunosService.obterRespostas(aluno.id, avaliacao.id);
                
                if (resposta) {
                  totalAlunos++;
                  totalNota += resposta.nota || 0;
                  
                  if (resposta.presente) {
                    totalPresentes++;
                  }
                }
              } catch (error) {
                console.warn(`Erro ao obter respostas do aluno ${aluno.id}:`, error);
                // Continuar para o próximo aluno
                continue;
              }
            }
          }
          
          // Calcular médias
          if (totalAlunos > 0) {
            const media = totalNota / totalAlunos;
            
            if (avaliacao.componente === 'portugues') {
              desempenhoPorAvaliacao[data].portugues = Math.round(media * 10) / 10;
            } else if (avaliacao.componente === 'matematica') {
              desempenhoPorAvaliacao[data].matematica = Math.round(media * 10) / 10;
            }
            
            // Atualizar dados de presença
            presencaPorMes[data].presentes = totalPresentes;
          }
        }
        
        // Converter para arrays para o componente de gráfico
        const desempenhoArray = Object.entries(desempenhoPorAvaliacao).map(([name, data]) => ({
          name,
          ...data
        }));
        
        const presencaArray = Object.entries(presencaPorMes).map(([name, data]) => ({
          name,
          presenca: data.total > 0 ? Math.round((data.presentes / data.total) * 100) : 0
        }));
        
        setDesempenhoData(desempenhoArray);
        setPresencaData(presencaArray);
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
          <CardTitle>Desempenho por Componente</CardTitle>
          <CardDescription>
            Média de notas em Português e Matemática por avaliação
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div style={{ width: '100%', height: 300 }}>
            <ResponsiveContainer>
              <LineChart data={desempenhoData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis domain={[0, 10]} />
                <Tooltip />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="portugues"
                  stroke="#8884d8"
                  name="Português"
                />
                <Line
                  type="monotone"
                  dataKey="matematica"
                  stroke="#82ca9d"
                  name="Matemática"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Taxa de Presença</CardTitle>
          <CardDescription>
            Percentual de alunos presentes nas avaliações por mês
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div style={{ width: '100%', height: 300 }}>
            <ResponsiveContainer>
              <BarChart data={presencaData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis domain={[0, 100]} />
                <Tooltip />
                <Legend />
                <Bar
                  dataKey="presenca"
                  fill="#8884d8"
                  name="Presença (%)"
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default DashboardCharts;