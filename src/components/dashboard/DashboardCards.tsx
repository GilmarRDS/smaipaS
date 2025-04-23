import React, { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { alunosService } from '@/services/alunosService';
import { avaliacoesService } from '@/services/avaliacoesService';
import { turmasService } from '@/services/turmasService';
import { Avaliacao } from '@/types/avaliacoes';
import { Loader2, Users, BookOpen, Calculator, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';

interface DashboardCardsProps {
  isSecretaria: boolean;
}

interface DashboardStats {
  totalAlunos: number;
  mediaPortugues: number;
  mediaMatematica: number;
  taxaPresenca: number;
  variacaoAlunos: number;
  variacaoPortugues: number;
  variacaoMatematica: number;
  variacaoPresenca: number;
}

const DashboardCards: React.FC<DashboardCardsProps> = ({ isSecretaria }) => {
  const { user } = useAuth();
  const [stats, setStats] = useState<DashboardStats>({
    totalAlunos: 0,
    mediaPortugues: 0,
    mediaMatematica: 0,
    taxaPresenca: 0,
    variacaoAlunos: 0,
    variacaoPortugues: 0,
    variacaoMatematica: 0,
    variacaoPresenca: 0
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const carregarDados = async () => {
      try {
        setIsLoading(true);
        
        // Se for secretaria, não precisa carregar dados específicos de escola
        if (isSecretaria) {
          setStats({
            totalAlunos: 0,
            mediaPortugues: 0,
            mediaMatematica: 0,
            taxaPresenca: 0,
            variacaoAlunos: 0,
            variacaoPortugues: 0,
            variacaoMatematica: 0,
            variacaoPresenca: 0
          });
          return;
        }

        // Verificar se tem schoolId
        if (!user?.schoolId) {
          throw new Error('ID da escola não encontrado');
        }
        
        // Carregar turmas da escola
        const turmas = await turmasService.listarPorEscola(user.schoolId);
        
        // Carregar alunos de todas as turmas
        const alunosPromises = turmas.map(turma => alunosService.listarPorTurma(turma.id));
        const alunosPorTurma = await Promise.all(alunosPromises);
        const totalAlunos = alunosPorTurma.reduce((total, alunos) => total + alunos.length, 0);
        
        // Carregar avaliações
        const avaliacoes = await avaliacoesService.listarPorEscola(user.schoolId) as Avaliacao[];
        
        // Calcular médias e taxas de presença
        let totalNotaPortugues = 0;
        let totalNotaMatematica = 0;
        let totalRespostasPortugues = 0;
        let totalRespostasMatematica = 0;
        let totalPresentes = 0;
        
        // Calcular médias de notas
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
                      totalNotaPortugues += nota;
                      totalRespostasPortugues++;
                    } else if (avaliacao.disciplina === 'MATEMATICA') {
                      totalNotaMatematica += nota;
                      totalRespostasMatematica++;
                    }
                    
                    if (resposta.presente) {
                      totalPresentes++;
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
        
        // Calcular médias
        const mediaPortugues = totalRespostasPortugues > 0 
          ? Math.round((totalNotaPortugues / totalRespostasPortugues) * 10) / 10 
          : 0;
          
        const mediaMatematica = totalRespostasMatematica > 0 
          ? Math.round((totalNotaMatematica / totalRespostasMatematica) * 10) / 10 
          : 0;
          
        const taxaPresenca = totalAlunos > 0 
          ? Math.round((totalPresentes / (totalAlunos * avaliacoes.length)) * 100) 
          : 0;
        
        // Calcular variações baseadas em dados históricos
        const avaliacoesAnteriores = avaliacoes.filter(a => 
          new Date(a.dataInicio) < new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
        );
        
        let mediaPortuguesAnterior = 0;
        let mediaMatematicaAnterior = 0;
        let taxaPresencaAnterior = 0;
        
        if (avaliacoesAnteriores.length > 0) {
          // Calcular médias anteriores
          for (const avaliacao of avaliacoesAnteriores) {
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
                        mediaPortuguesAnterior += nota;
                      } else if (avaliacao.disciplina === 'MATEMATICA') {
                        mediaMatematicaAnterior += nota;
                      }
                    }
                  } catch (error) {
                    continue;
                  }
                }
              }
            }
          }
          
          mediaPortuguesAnterior = mediaPortuguesAnterior / avaliacoesAnteriores.length;
          mediaMatematicaAnterior = mediaMatematicaAnterior / avaliacoesAnteriores.length;
          taxaPresencaAnterior = taxaPresenca;
        }
        
        // Calcular variações percentuais
        const variacaoPortugues = mediaPortuguesAnterior > 0
          ? Math.round(((mediaPortugues - mediaPortuguesAnterior) / mediaPortuguesAnterior) * 100)
          : 0;
          
        const variacaoMatematica = mediaMatematicaAnterior > 0
          ? Math.round(((mediaMatematica - mediaMatematicaAnterior) / mediaMatematicaAnterior) * 100)
          : 0;
          
        const variacaoPresenca = taxaPresencaAnterior > 0
          ? Math.round(((taxaPresenca - taxaPresencaAnterior) / taxaPresencaAnterior) * 100)
          : 0;
        
        setStats({
          totalAlunos,
          mediaPortugues,
          mediaMatematica,
          taxaPresenca,
          variacaoAlunos: 0, // Será implementado quando tivermos histórico de alunos
          variacaoPortugues,
          variacaoMatematica,
          variacaoPresenca
        });
      } catch (error) {
        console.error('Erro ao carregar estatísticas:', error);
        toast.error('Erro ao carregar estatísticas. Por favor, tente novamente.');
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
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            Total de Alunos
          </CardTitle>
          <Users className="h-5 w-5 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.totalAlunos}</div>
          <p className="text-xs text-muted-foreground">
            {stats.variacaoAlunos > 0 ? '+' : ''}{stats.variacaoAlunos}% em relação ao ano anterior
          </p>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            Média em Português
          </CardTitle>
          <BookOpen className="h-5 w-5 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.mediaPortugues}%</div>
          <p className="text-xs text-muted-foreground">
            {stats.variacaoPortugues > 0 ? '+' : ''}{stats.variacaoPortugues}% em relação à última avaliação
          </p>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            Média em Matemática
          </CardTitle>
          <Calculator className="h-5 w-5 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.mediaMatematica}%</div>
          <p className="text-xs text-muted-foreground">
            {stats.variacaoMatematica > 0 ? '+' : ''}{stats.variacaoMatematica}% em relação à última avaliação
          </p>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            Taxa de Presença
          </CardTitle>
          <CheckCircle className="h-5 w-5 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.taxaPresenca}%</div>
          <p className="text-xs text-muted-foreground">
            {stats.variacaoPresenca > 0 ? '+' : ''}{stats.variacaoPresenca}% em relação ao mês anterior
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default DashboardCards;
