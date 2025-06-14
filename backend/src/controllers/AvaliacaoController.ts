import { Request as ExpressRequest, Response } from 'express';
import { prisma } from '../lib/prisma';
import { Prisma } from '@prisma/client';
import { Disciplina as PrismaDisciplina, TipoAvaliacao as PrismaTipoAvaliacao } from '@prisma/client';
import { RequestWithUsuario } from '../middlewares/auth';

// Definir os tipos manualmente
type TipoAvaliacao = 'DIAGNOSTICA_INICIAL' | 'DIAGNOSTICA_FINAL';
type Disciplina = 'PORTUGUES' | 'MATEMATICA';

interface CustomRequest extends ExpressRequest {
  usuario: {
    id: string;
    role: string;
    escolaId?: string;
  };
}

interface ItemResposta {
  numero: number;
  resposta: string;
}

interface AvaliacaoCreateInput {
  nome: string;
  tipo: TipoAvaliacao;
  disciplina: Disciplina;
  ano: string;
  dataAplicacao: Date;
}

interface AvaliacaoUpdateInput {
  nome?: string;
  tipo?: TipoAvaliacao;
  disciplina?: Disciplina;
  ano?: string;
  dataAplicacao?: Date;
}

interface ItemGabarito {
  numero: number;
  resposta: string;
  descritor?: {
    id: string;
    codigo: string;
    descricao: string;
  };
}

interface WhereClause {
  ano?: string;
  disciplina?: Disciplina;
}

export class AvaliacaoController {
  async criar(request: CustomRequest, response: Response) {
    const { nome, tipo, disciplina, ano, dataAplicacao } = request.body;

    // Validar tipo de avaliação
    if (!['DIAGNOSTICA_INICIAL', 'DIAGNOSTICA_FINAL'].includes(tipo)) {
      return response.status(400).json({ error: 'Tipo de avaliação inválido' });
    }

    // Validar disciplina
    if (!['PORTUGUES', 'MATEMATICA'].includes(disciplina)) {
      return response.status(400).json({ error: 'Disciplina inválida' });
    }

    // Validar ano
    if (!ano || !['1', '2', '3', '4', '5', '6', '7', '8', '9'].includes(ano)) {
      return response.status(400).json({ error: 'Ano inválido' });
    }

    const avaliacao = await prisma.avaliacao.create({
      data: {
        nome,
        tipo: tipo as TipoAvaliacao,
        disciplina: disciplina as Disciplina,
        ano,
        dataAplicacao: new Date(dataAplicacao)
      } as AvaliacaoCreateInput,
    });

    return response.status(201).json(avaliacao);
  }

  // Novo método para obter gabarito por avaliacaoId
  async obterGabarito(request: CustomRequest, response: Response) {
    const { id } = request.params;
    if (!id) {
      return response.status(400).json({ error: 'id é obrigatório' });
    }
    const gabarito = await prisma.gabarito.findFirst({
      where: { avaliacaoId: id },
      include: {
        itens: {
          include: {
            descritor: true,
          },
        },
      },
    });
    if (!gabarito) {
      return response.status(404).json({ error: 'Gabarito não encontrado para a avaliação' });
    }
    return response.json(gabarito);
  }

  async listarPorTurma(request: CustomRequest, response: Response) {
    const { turmaId } = request.params;

    if (!turmaId) {
      return response.status(400).json({ error: 'turmaId é obrigatório' });
    }

    // Buscar a turma para obter o ano
    const turma = await prisma.turma.findUnique({
      where: { id: turmaId },
      select: { ano: true }
    });

    if (!turma) {
      return response.status(404).json({ error: 'Turma não encontrada' });
    }

    // Buscar avaliações pelo ano da turma
    console.log('Buscando avaliações para o ano da turma:', turma.ano);
    // Extrair apenas o dígito do ano da turma para a busca
    const anoNumerico = turma.ano ? turma.ano.replace(/\D/g, '') : '';
    console.log('Ano numérico para busca:', anoNumerico);

    // Este endpoint parece listar avaliações relevantes para o ano de uma turma, não filtrar avaliações *por* respostas dessa turma.
    // O filtro por respostas da turma é melhor tratado em obterDadosRelatorios.
    // Este método pode precisar ser revisado dependendo do seu uso pretendido, mas por enquanto, vamos focar em obterDadosRelatorios.
    const avaliacoes = await prisma.avaliacao.findMany({
      where: { ano: anoNumerico },
      include: {
        respostas: { // Incluir respostas aqui pode não ser necessário apenas para listar avaliações
          include: {
            aluno: true,
            itens: true,
          },
        },
        gabarito: {
          include: {
            itens: {
              include: {
                descritor: true,
              },
            },
          },
        },
      },
    });

    console.log('Resultado da busca de avaliações:', avaliacoes);
    return response.json(avaliacoes);
  }

  // Método para dados agregados dos relatórios
  async obterDadosRelatorios(request: CustomRequest, response: Response) {
    try {
      const { escolaId, turmaId, componente } = request.query;

      console.log('Relatorios API: Parâmetros recebidos:', { escolaId, turmaId, componente });

      // Construir o objeto de filtro principal para a query de Avaliacao
      const avaliacaoWhere: Prisma.AvaliacaoWhereInput = {};

      // Filtrar por componente (disciplina) se fornecido
      if (componente) {
        const disciplina = (componente as string).toUpperCase() as Disciplina;
        if (['PORTUGUES', 'MATEMATICA'].includes(disciplina)) {
          avaliacaoWhere.disciplina = disciplina;
        }
      }

      // Filtrar por turmaId verificando as respostas dos alunos dessa turma
      if (turmaId) {
        avaliacaoWhere.respostas = {
          some: {
            aluno: {
              turmaId: turmaId as string
            }
          }
        };
        // Se filtrar por turma, também precisamos garantir que as avaliações sejam do ano correto para essa turma
        const turma = await prisma.turma.findUnique({
          where: { id: turmaId as string },
          select: { ano: true }
        });
        if (turma && turma.ano) {
          const anoNumerico = turma.ano.replace(/\D/g, '');
          if (anoNumerico) {
            avaliacaoWhere.ano = anoNumerico;
          }
        }
      } else if (escolaId) {
        const turmasDaEscola = await prisma.turma.findMany({
          where: { escolaId: escolaId as string },
          select: { ano: true }
        });
        const anosDaEscola = turmasDaEscola.map(t => t.ano.replace(/\D/g, '')).filter(Boolean);
        if (anosDaEscola.length > 0) {
          avaliacaoWhere.ano = { in: anosDaEscola };
        }
      }

      console.log('Relatorios API: Cláusula Where Final para Avaliacao:', avaliacaoWhere);

      // Buscar avaliações filtradas
      const avaliacoes = await prisma.avaliacao.findMany({
        where: avaliacaoWhere,
        include: {
          respostas: {
            where: turmaId ? {
              aluno: {
                turmaId: turmaId as string
              }
            } : {},
            include: {
              aluno: {
                include: {
                  turma: {
                    select: {
                      id: true,
                      nome: true
                    }
                  }
                }
              },
              itens: {
                include: {
                  descritor: true
                }
              },
            },
          },
          gabarito: {
            include: {
              itens: {
                include: {
                  descritor: true,
                },
              },
            },
          },
        },
      });

      console.log('Relatorios API: Avaliações encontradas:', avaliacoes.length);

      // Agregar dados para desempenho por turma
      const desempenhoTurmasMap: Record<string, {
        turmaId: string;
        nomeTurma: string;
        portugues: number;
        matematica: number;
        totalAlunos: number;
        alunos: Array<{
          id: string;
          nome: string;
          presente: boolean;
          transferida: boolean;
          portugues: number | null;
          matematica: number | null;
          media: number | null;
          descritores: {
            portugues: Array<{
              codigo: string;
              nome: string;
              percentual: number;
            }> | null;
            matematica: Array<{
              codigo: string;
              nome: string;
              percentual: number;
            }> | null;
          } | null;
        }>;
      }> = {};

      // Processar respostas dos alunos
      for (const avaliacao of avaliacoes) {
        for (const resposta of avaliacao.respostas) {
          if (!resposta.aluno || !resposta.aluno.turmaId) {
            console.log('Relatorios API: Resposta sem aluno ou turma:', resposta.id);
            continue;
          }

          const turmaIdResposta = resposta.aluno.turmaId;
          const nomeTurmaResposta = resposta.aluno.turma?.nome || 'Turma Desconhecida';

          if (!desempenhoTurmasMap[turmaIdResposta]) {
            desempenhoTurmasMap[turmaIdResposta] = {
              turmaId: turmaIdResposta,
              nomeTurma: nomeTurmaResposta,
              portugues: 0,
              matematica: 0,
              totalAlunos: 0,
              alunos: []
            };
          }

          // Encontrar ou criar aluno no mapa para esta turma
          let alunoIndex = desempenhoTurmasMap[turmaIdResposta].alunos.findIndex(a => a.id === resposta.alunoId);
          if (alunoIndex === -1) {
            desempenhoTurmasMap[turmaIdResposta].alunos.push({
              id: resposta.alunoId,
              nome: resposta.aluno.nome,
              presente: resposta.compareceu || false,
              transferida: resposta.transferido || false,
              portugues: null,
              matematica: null,
              media: null,
              descritores: {
                portugues: [],
                matematica: []
              }
            });
            alunoIndex = desempenhoTurmasMap[turmaIdResposta].alunos.length - 1;
            desempenhoTurmasMap[turmaIdResposta].totalAlunos++;
          }

          // Calcular desempenho para a resposta atual
          const acertos = resposta.itens.filter(item => item.correta === true).length;
          const total = resposta.itens.length;
          const percentual = total > 0 ? (acertos / total) * 100 : 0;

          console.log(`Relatorios API: Desempenho do aluno ${resposta.aluno.nome} na avaliação ${avaliacao.nome} (${avaliacao.disciplina}): ${percentual.toFixed(2)}%`);

          // Atualizar o desempenho do aluno na disciplina específica
          if (avaliacao.disciplina === 'PORTUGUES') {
            desempenhoTurmasMap[turmaIdResposta].alunos[alunoIndex].portugues = percentual;
            desempenhoTurmasMap[turmaIdResposta].portugues += percentual;
          } else if (avaliacao.disciplina === 'MATEMATICA') {
            desempenhoTurmasMap[turmaIdResposta].alunos[alunoIndex].matematica = percentual;
            desempenhoTurmasMap[turmaIdResposta].matematica += percentual;
          }

          // Calcular a média do aluno
          const aluno = desempenhoTurmasMap[turmaIdResposta].alunos[alunoIndex];
          if (aluno.portugues !== null && aluno.matematica !== null) {
            aluno.media = (aluno.portugues + aluno.matematica) / 2;
          }

          // Processar descritores
          if (avaliacao.disciplina === 'PORTUGUES' && aluno.descritores) {
            const descritores = new Map<string, { acertos: number; total: number }>();
            resposta.itens.forEach(item => {
              if (item.descritor) {
                const key = item.descritor.codigo;
                if (!descritores.has(key)) {
                  descritores.set(key, { acertos: 0, total: 0 });
                }
                const desc = descritores.get(key)!;
                desc.total++;
                if (item.correta) desc.acertos++;
              }
            });

            aluno.descritores.portugues = Array.from(descritores.entries()).map(([codigo, { acertos, total }]) => ({
              codigo,
              nome: avaliacao.gabarito?.itens.find(i => i.descritor?.codigo === codigo)?.descritor?.descricao || codigo,
              percentual: total > 0 ? (acertos / total) * 100 : 0
            }));
          } else if (avaliacao.disciplina === 'MATEMATICA' && aluno.descritores) {
            const descritores = new Map<string, { acertos: number; total: number }>();
            resposta.itens.forEach(item => {
              if (item.descritor) {
                const key = item.descritor.codigo;
                if (!descritores.has(key)) {
                  descritores.set(key, { acertos: 0, total: 0 });
                }
                const desc = descritores.get(key)!;
                desc.total++;
                if (item.correta) desc.acertos++;
              }
            });

            aluno.descritores.matematica = Array.from(descritores.entries()).map(([codigo, { acertos, total }]) => ({
              codigo,
              nome: avaliacao.gabarito?.itens.find(i => i.descritor?.codigo === codigo)?.descritor?.descricao || codigo,
              percentual: total > 0 ? (acertos / total) * 100 : 0
            }));
          }
        }
      }

      // Calcular médias finais por turma
      const desempenhoTurmas = Object.values(desempenhoTurmasMap).map(turma => {
        const totalAlunosNaTurma = turma.alunos.length;
        const mediaPortugues = turma.totalAlunos > 0 ? turma.portugues / turma.totalAlunos : 0;
        const mediaMatematica = turma.totalAlunos > 0 ? turma.matematica / turma.totalAlunos : 0;

        console.log(`Relatorios API: Médias Finais da turma ${turma.nomeTurma}:`, {
          totalAlunos: turma.totalAlunos,
          mediaPortugues: mediaPortugues.toFixed(2),
          mediaMatematica: mediaMatematica.toFixed(2)
        });

        return {
          turmaId: turma.turmaId,
          nomeTurma: turma.nomeTurma,
          mediaPortugues: parseFloat(mediaPortugues.toFixed(2)),
          mediaMatematica: parseFloat(mediaMatematica.toFixed(2)),
          totalAlunos: turma.totalAlunos,
          alunos: turma.alunos
        };
      });

      const responseData = {
        desempenhoTurmas,
        evolucaoDesempenho: [], // Implementar conforme necessário
        desempenhoHabilidades: [], // Implementar conforme necessário
        desempenhoDescritores: [], // Implementar conforme necessário
      };

      console.log('Relatorios API: Dados retornados para frontend:', {
        totalTurmasInResponse: desempenhoTurmas.length,
        ...(turmaId && desempenhoTurmas.length > 0 ? {
          turmaRetornada: desempenhoTurmas[0].nomeTurma,
          alunosNaTurmaRetornada: desempenhoTurmas[0].alunos.length
        } : {})
      });

      return response.json(responseData);
    } catch (error) {
      console.error('Relatorios API: Erro ao obter dados dos relatórios:', error);
      return response.status(500).json({ error: 'Erro interno do servidor' });
    }
  }

  async listarTodas(request: CustomRequest, response: Response) {
    const { ano, disciplina } = request.query;

    // Construir filtros
    const where: WhereClause = {};
    if (ano) where.ano = ano as string;
    if (disciplina) where.disciplina = disciplina as Disciplina;

    const avaliacoes = await prisma.avaliacao.findMany({
      where,
      include: {
        gabarito: {
          select: {
            id: true,
            itens: {
              select: {
                id: true,
                numero: true,
                resposta: true,
                descritor: {
                  select: {
                    id: true,
                    codigo: true,
                    descricao: true
                  }
                }
              }
            }
          }
        }
      }
    });

    return response.json(avaliacoes);
  }

  async buscarPorId(request: CustomRequest, response: Response) {
    const { id } = request.params;

    const avaliacao = await prisma.avaliacao.findUnique({
      where: { id },
      include: {
        gabarito: {
          select: {
            id: true,
            itens: {
              select: {
                id: true,
                numero: true,
                resposta: true,
                descritor: {
                  select: {
                    id: true,
                    codigo: true,
                    descricao: true
                  }
                }
              }
            }
          }
        },
        respostas: {
          select: {
            id: true,
            aluno: {
              select: {
                id: true,
                nome: true,
                matricula: true,
                turma: {
                  select: {
                    id: true,
                    nome: true,
                    ano: true
                  }
                }
              }
            },
            compareceu: true,
            transferido: true,
            itens: {
              select: {
                id: true,
                numero: true,
                resposta: true
              }
            }
          }
        }
      }
    });

    if (!avaliacao) {
      return response.status(404).json({ error: 'Avaliação não encontrada' });
    }

    return response.json(avaliacao);
  }

  async atualizar(request: CustomRequest, response: Response) {
    const { id } = request.params;
    const { nome, tipo, disciplina, ano, dataAplicacao } = request.body;

    // Verificar se a avaliação existe
    const avaliacaoExistente = await prisma.avaliacao.findUnique({
      where: { id },
    });

    if (!avaliacaoExistente) {
      return response.status(404).json({ error: 'Avaliação não encontrada' });
    }

    // Validar tipo de avaliação
    if (tipo && !['DIAGNOSTICA_INICIAL', 'DIAGNOSTICA_FINAL'].includes(tipo)) {
      return response.status(400).json({ error: 'Tipo de avaliação inválido' });
    }

    // Validar disciplina
    if (disciplina && !['PORTUGUES', 'MATEMATICA'].includes(disciplina)) {
      return response.status(400).json({ error: 'Disciplina inválida' });
    }

    // Validar ano
    if (ano && !['1', '2', '3', '4', '5', '6', '7', '8', '9'].includes(ano)) {
      return response.status(400).json({ error: 'Ano inválido' });
    }

    const avaliacao = await prisma.avaliacao.update({
      where: { id },
      data: {
        nome,
        tipo: tipo as TipoAvaliacao,
        disciplina: disciplina as Disciplina,
        ano,
        dataAplicacao: dataAplicacao ? new Date(dataAplicacao) : undefined,
      } as AvaliacaoUpdateInput,
      include: {
        gabarito: {
          select: {
            id: true,
            itens: {
              select: {
                id: true,
                numero: true,
                resposta: true,
                descritor: {
                  select: {
                    id: true,
                    codigo: true,
                    descricao: true
                  }
                }
              }
            }
          }
        }
      }
    });

    return response.json(avaliacao);
  }

  async deletar(request: CustomRequest, response: Response) {
    const { id } = request.params;

    // Verificar se a avaliação existe
    const avaliacaoExistente = await prisma.avaliacao.findUnique({
      where: { id },
    });

    if (!avaliacaoExistente) {
      return response.status(404).json({ error: 'Avaliação não encontrada' });
    }

    await prisma.avaliacao.delete({
      where: { id },
    });

    return response.status(204).send();
  }

  async atualizarGabarito(request: CustomRequest, response: Response) {
    const { id } = request.params;
    const { itens } = request.body as { itens: ItemGabarito[] };

    // Verificar se a avaliação existe
    const avaliacao = await prisma.avaliacao.findUnique({
      where: { id },
      include: {
        gabarito: {
          include: {
            itens: {
              include: {
                descritor: true,
              }
            }
          }
        }
      }
    });

    if (!avaliacao) {
      return response.status(404).json({ error: 'Avaliação não encontrada' });
    }

    // Validar itens do gabarito
    if (!Array.isArray(itens) || itens.length === 0) {
      return response.status(400).json({ error: 'Itens do gabarito inválidos' });
    }

    // Validar cada item
    for (const item of itens) {
      if (!item.numero || !item.resposta) {
        return response.status(400).json({ error: 'Item do gabarito inválido' });
      }
    }

    // Atualizar ou criar gabarito
    const gabarito = await prisma.gabarito.upsert({
      where: {
        avaliacaoId: id,
      },
      create: {
        avaliacaoId: id,
        itens: {
          create: itens.map((item) => ({
            numero: item.numero,
            resposta: item.resposta,
            descritorId: item.descritor?.id,
          }))
        }
      } as unknown as Prisma.GabaritoUncheckedCreateInput,
      update: {
        itens: {
          deleteMany: {},
          create: itens.map((item) => ({
            numero: item.numero,
            resposta: item.resposta,
            descritorId: item.descritor?.id,
          }))
        }
      },
      include: {
        itens: {
          include: {
            descritor: true,
          }
        }
      }
    });

    return response.json(gabarito);
  }

  /**
   * Lista avaliações por ano
   */
  async listarPorAno(request: CustomRequest, response: Response) {
    try {
      const { ano } = request.params;

      // Validação básica do ano
      if (!ano || !/^[1-9]$/.test(ano)) {
        return response.status(400).json({ error: 'Ano inválido.' });
      }

      const avaliacoes = await prisma.avaliacao.findMany({
        where: {
          ano,
        },
        include: {
          gabarito: {
            include: {
              itens: true // Incluir itens do gabarito
            }
          }
        },
        orderBy: {
          nome: 'asc'
        }
      });

      return response.json(avaliacoes);
    } catch (error) {
      console.error('Erro ao listar avaliações por ano:', error);
      return response.status(500).json({ error: 'Erro interno do servidor ao listar avaliações por ano.' });
    }
  }

  /**
   * Lista avaliações por ano e componente
   */
  async listarPorAnoEComponente(request: CustomRequest, response: Response) {
    try {
      const { ano, componente } = request.params;

      // Validação básica do ano e componente
      if (!ano || !/^[1-9]$/.test(ano)) {
        return response.status(400).json({ error: 'Ano inválido.' });
      }

      // Validar e converter o componente para o tipo Disciplina
      const disciplina = componente?.toUpperCase() as Disciplina | undefined;
      if (!disciplina || !['PORTUGUES', 'MATEMATICA'].includes(disciplina)) {
         return response.status(400).json({ error: 'Componente (disciplina) inválido.' });
      }

      const avaliacoes = await prisma.avaliacao.findMany({
        where: {
          ano,
          disciplina // Usando 'disciplina' em vez de 'componente'
        },
        include: {
          gabarito: {
            include: {
              itens: true
            }
          }
        },
        orderBy: {
          nome: 'asc'
        }
      });

      return response.json(avaliacoes);
    } catch (error) {
      console.error('Erro ao listar avaliações por ano e componente:', error);
      return response.status(500).json({ error: 'Erro interno do servidor ao listar avaliações por ano and componente.' });
    }
  }

  async listarPorEscola(request: CustomRequest, response: Response) {
    const { escolaId } = request.params;

    if (!escolaId) {
      return response.status(400).json({ error: 'escolaId é obrigatório' });
    }

    // Buscar todas as turmas da escola
    const turmas = await prisma.turma.findMany({
      where: { escolaId },
      select: { id: true, ano: true }
    });

    if (!turmas.length) {
      return response.status(404).json({ error: 'Nenhuma turma encontrada para esta escola' });
    }

    // Extrair as partes numéricas dos anos das turmas da escola
    const anos = turmas.map(turma => turma.ano.replace(/\D/g, '')).filter(Boolean);

    // Buscar avaliações que correspondem a qualquer um desses anos
    const avaliacoes = await prisma.avaliacao.findMany({
      where: {
        ano: {
          in: anos.length > 0 ? anos : undefined // Filtrar se houver anos válidos
        }
      },
      include: {
        respostas: {
          include: {
            aluno: true,
            itens: true,
          }
        },
        gabarito: {
          include: {
            itens: {
              include: {
                descritor: true
              }
            }
          }
        }
      }
    });

    return response.json(avaliacoes);
  }
}
