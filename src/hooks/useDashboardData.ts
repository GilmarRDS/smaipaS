import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { avaliacoesService } from '@/services/avaliacoesService';
import { alunosService } from '@/services/alunosService';
import { turmasService } from '@/services/turmasService';
import type { RespostaAluno } from '@/types/alunos';
import type { DashboardFilters, PerformanceData, PresencaData, AlunoDescritores } from '@/types/dashboard';

const useDashboardData = () => {
  const { user } = useAuth();
  const [selectedFilters, setSelectedFilters] = useState<DashboardFilters>({
    escola: user?.schoolId || '',
    turma: 'all_turmas',
    turno: 'all_turnos',
    componente: 'all_componentes',
    avaliacao: 'all_avaliacoes'
  });
  
  const [selectedAluno, setSelectedAluno] = useState<string>('');
  const [performanceData, setPerformanceData] = useState<PerformanceData[]>([]);
  const [presencaData, setPresencaData] = useState<PresencaData[]>([]);
  const [descritoresPorAluno, setDescritoresPorAluno] = useState<AlunoDescritores[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const carregarDados = async () => {
      if (!user) {
        console.log('Usuário não autenticado');
        setIsLoading(false);
        return;
      }

      if (user.role === 'escola' && !user.schoolId) {
        console.log('Usuário do tipo escola não tem schoolId definido');
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);

        // Carregar avaliações
        const avaliacoes = user.role === 'secretaria' 
          ? [] // Secretaria não carrega dados específicos de escola
          : await avaliacoesService.listarPorEscola(user.schoolId);
        
        // Carregar turmas
        const turmas = user.role === 'secretaria'
          ? [] // Secretaria não carrega dados específicos de escola
          : await turmasService.listarPorEscola(user.schoolId);
        
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
                    if (avaliacao.componente === 'portugues') {
                      performanceMap[avaliacao.nome].portugues += resposta.respostas.filter(r => r.alternativa !== null).length;
                      performanceMap[avaliacao.nome].totalPortugues++;
                    } else if (avaliacao.componente === 'matematica') {
                      performanceMap[avaliacao.nome].matematica += resposta.respostas.filter(r => r.alternativa !== null).length;
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

        // Carregar alunos e suas respostas
        const alunosComDescritores = await Promise.all(
          turmas.flatMap(async turma => {
            const alunos = await alunosService.listarPorTurma(turma.id);
            return Promise.all(
              alunos.map(async aluno => {
                const respostas = await Promise.all(
                  avaliacoes
                    .filter(a => a.status === 'concluida')
                    .map(avaliacao => 
                      alunosService.obterRespostas(aluno.id, avaliacao.id)
                        .catch(() => null)
                    )
                );
                return {
                  aluno: aluno.nome,
                  descritores: respostas
                    .filter((resposta): resposta is RespostaAluno => resposta !== null)
                    .map(resposta => {
                      const avaliacao = avaliacoes.find(a => a.id === resposta.avaliacaoId);
                      return {
                        codigo: `D${avaliacao?.componente === 'portugues' ? 'PT' : 'MT'}${resposta.id}`,
                        componente: avaliacao?.componente === 'portugues' ? 'Português' : 'Matemática',
                        acertos: resposta.respostas.filter(r => r.alternativa !== null).length
                      };
                    })
                };
              })
            );
          })
        );
        setDescritoresPorAluno(alunosComDescritores.flat());

      } catch (error) {
        console.error('Erro ao carregar dados do dashboard:', error);
      } finally {
        setIsLoading(false);
      }
    };

    carregarDados();
  }, [user]);
  
  const handleFilterChange = (filterType: string, value: string) => {
    setSelectedFilters(prev => {
      if (filterType === 'turma') {
        return {
          ...prev,
          [filterType]: value,
          avaliacao: 'all_avaliacoes'
        };
      }
      return {
        ...prev,
        [filterType]: value
      };
    });
  };
  
  const getHabilidadesAluno = (alunoNome: string) => {
    const aluno = descritoresPorAluno.find(a => a.aluno === alunoNome);
    if (!aluno) return [];
    
    return aluno.descritores.map(d => ({
      descritor: d.codigo,
      percentual: d.acertos
    }));
  };
  
  const alunoHabilidades = selectedAluno ? getHabilidadesAluno(selectedAluno) : [];
  
  return {
    selectedFilters,
    handleFilterChange,
    performanceData,
    presencaData,
    descritoresPorAluno,
    selectedAluno,
    setSelectedAluno,
    alunoHabilidades,
    isLoading
  };
};

export default useDashboardData;
