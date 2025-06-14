import React, { useEffect, useState } from 'react';
import useAuth from '@/hooks/useAuth';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { alunosService } from '@/services/alunosService';
import { avaliacoesService } from '@/services/avaliacoesService';
import { turmasService } from '@/services/turmasService';
import { Avaliacao } from '@/types/avaliacoes';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';

interface DescritorDificuldade {
  codigo: string;
  descricao: string;
  percentualAcerto: number;
  cor: string;
}

interface QuestaoData {
  numero: number;
  descritor?: string;
}

const DifficultyAnalysis: React.FC = () => {
  const { user, isSecretaria } = useAuth();
  const [descritores, setDescritores] = useState<DescritorDificuldade[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [descritoresMap, setDescritoresMap] = useState<{[key: string]: string}>({});

  useEffect(() => {
    const carregarDados = async () => {
      try {
        setIsLoading(true);
        
        // Se for secretaria, não precisa carregar dados específicos de escola
        if (isSecretaria) {
          setDescritores([]);
          return;
        }

        // Verificar se tem schoolId
        if (!user?.schoolId) {
          throw new Error('ID da escola não encontrado');
        }
        
        // Carregar turmas da escola
        const turmas = await turmasService.listar(user.schoolId);
        
        // Carregar avaliações
        const avaliacoes = await avaliacoesService.listarPorEscola(user.schoolId) as Avaliacao[];
        
        // Mapeamento de descritores
        const descritoresMap: { [key: string]: { acertos: number; total: number } } = {};
        const descritoresInfo: { [key: string]: string } = {};
        
        for (const avaliacao of avaliacoes) {
          if (avaliacao.status === 'concluida') {
            // Obter o gabarito da avaliação para mapear questões aos descritores
            const gabarito = await avaliacoesService.obterGabarito(avaliacao.id);
            
            // Armazenar informações dos descritores do gabarito
            if (gabarito) {
              for (const item of gabarito.itens) {
                if (item.descritor) {
                  descritoresInfo[item.descritor.codigo] = item.descritor.descricao;
                }
              }
            }
            
            for (const turma of turmas) {
              const alunos = await alunosService.listarPorTurma(turma.id);
              
              for (const aluno of alunos) {
                try {
                  const resposta = await alunosService.obterRespostas(aluno.id, avaliacao.id);
                  
                  if (resposta) {
                    for (const item of resposta.respostas) {
                      // Encontrar o item correspondente no gabarito
                      const itemGabarito = gabarito?.itens.find(i => i.numero === item.questao);
                      
                      // Usar o descritor do gabarito se disponível, ou gerar um código baseado no número da questão
                      const descritor = itemGabarito?.descritor?.codigo || 
                        `${avaliacao.disciplina === 'PORTUGUES' ? 'LP' : 'MT'}-${item.questao}`;
                      
                      if (!descritoresMap[descritor]) {
                        descritoresMap[descritor] = { acertos: 0, total: 0 };
                      }
                      
                      descritoresMap[descritor].total++;
                      if (itemGabarito && item.alternativa === itemGabarito.resposta) {
                        descritoresMap[descritor].acertos++;
                      }
                    }
                  }
                } catch (error) {
                  console.error('Erro ao processar resposta:', error);
                  continue;
                }
              }
            }
          }
        }
        
        // Salvar o mapeamento de descritores
        setDescritoresMap(descritoresInfo);
        
        // Converter para array e calcular percentuais
        const descritoresArray = Object.entries(descritoresMap).map(([codigo, data]) => {
          const percentual = Math.round((data.acertos / data.total) * 100);
          
          // Definir cor baseada no percentual
          let cor = 'bg-green-500';
          if (percentual < 50) {
            cor = 'bg-red-500';
          } else if (percentual < 60) {
            cor = 'bg-orange-500';
          } else if (percentual < 70) {
            cor = 'bg-yellow-500';
          }
          
          return {
            codigo,
            descricao: getDescritorDescricao(codigo, descritoresInfo),
            percentualAcerto: percentual,
            cor
          };
        });
        
        // Ordenar por percentual de acerto (menor para maior)
        descritoresArray.sort((a, b) => a.percentualAcerto - b.percentualAcerto);
        
        // Pegar os 5 primeiros
        setDescritores(descritoresArray.slice(0, 5));
      } catch (error) {
        console.error('Erro ao carregar análise de dificuldades:', error);
        toast.error('Erro ao carregar análise de dificuldades. Por favor, tente novamente.');
      } finally {
        setIsLoading(false);
      }
    };
    
    carregarDados();
  }, [user?.schoolId, isSecretaria]);

  const getDescritorDescricao = (codigo: string, descritoresInfo: {[key: string]: string}): string => {
    // Verificar se é um código de descritor conhecido no gabarito
    if (descritoresInfo[codigo]) {
      return descritoresInfo[codigo];
    }
    
    // Se for um código gerado automaticamente (LP-X ou MT-X)
    if (codigo.startsWith('LP-') || codigo.startsWith('MT-')) {
      const [disciplina, numero] = codigo.split('-');
      return `${disciplina === 'LP' ? 'Português' : 'Matemática'} - Questão ${numero}`;
    }
    
    // Mapeamento de códigos para descrições (fallback)
    const descricoes: { [key: string]: string } = {
      'D15': 'Reconhecer diferentes formas de tratar a informação',
      'D23': 'Resolver problemas com números racionais',
      'D08': 'Interpretar textos que articulam linguagens verbais e não verbais',
      'D30': 'Calcular área de figuras planas',
      'D03': 'Inferir o sentido de uma palavra ou expressão',
      // Adicione mais descritores conforme necessário
    };
    
    // Verificar se é um código de descritor conhecido no mapeamento estático
    if (descricoes[codigo]) {
      return descricoes[codigo];
    }
    
    return `Descritor ${codigo}`;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-32">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Principais Dificuldades Identificadas</CardTitle>
        <CardDescription>
          Descritores com menor percentual de acerto
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {descritores.map((descritor) => (
            <div key={descritor.codigo} className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div className={`h-4 w-1 ${descritor.cor} rounded`}></div>
                  <span className="font-medium">{descritor.codigo} - {descritor.descricao}</span>
                </div>
                <span className="font-semibold">{descritor.percentualAcerto}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700">
                <div
                  className={`${descritor.cor} h-2.5 rounded-full`}
                  style={{ width: `${descritor.percentualAcerto}%` }}
                ></div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default DifficultyAnalysis;
