import { Request, Response } from 'express';
import { prisma } from '../lib/prisma';

// Definir os tipos manualmente
type TipoAvaliacao = 'DIAGNOSTICA_INICIAL' | 'DIAGNOSTICA_FINAL';
type Disciplina = 'PORTUGUES' | 'MATEMATICA';

interface CustomRequest extends Request {
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
    const { avaliacaoId } = request.params;

    if (!avaliacaoId) {
      return response.status(400).json({ error: 'avaliacaoId é obrigatório' });
    }

    const gabarito = await prisma.gabarito.findFirst({
      where: { avaliacaoId },
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
    const avaliacoes = await prisma.avaliacao.findMany({
      where: { ano: turma.ano },
      include: {
        respostas: {
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

    return response.json(avaliacoes);
  }

  // Método para dados agregados dos relatórios
  async obterDadosRelatorios(request: CustomRequest, response: Response) {
    try {
      const { escolaId, turmaId, componente } = request.query;

      // Buscar a turma para obter o ano
      let ano: string | undefined;
      if (turmaId) {
        const turma = await prisma.turma.findUnique({
          where: { id: turmaId as string },
          select: { ano: true }
        });
        if (turma) {
          ano = turma.ano;
        }
      }

      // Filtros opcionais
      const filtros: WhereClause = {};
      if (ano) filtros.ano = ano;
      if (componente) filtros.disciplina = componente as Disciplina;

      // Buscar avaliações filtradas
      const avaliacoes = await prisma.avaliacao.findMany({
        where: filtros,
        include: {
          respostas: {
            include: {
              aluno: true,
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

      // Agregar dados para desempenho por turma
      const desempenhoTurmasMap: Record<string, { portugues: number; matematica: number; count: number }> = {};
      // Agregar dados para evolução desempenho
      const evolucaoDesempenhoMap: Record<string, { portugues: number; matematica: number; count: number }> = {};
      // Agregar dados para descritores
      const descritoresMap: Record<string, { 
        codigo: string;
        nome: string; 
        acertos: number; 
        total: number;
        disciplina: 'PORTUGUES' | 'MATEMATICA';
      }> = {};

      for (const avaliacao of avaliacoes) {
        const dataAplicacaoStr = avaliacao.dataAplicacao ? avaliacao.dataAplicacao.toISOString().split('T')[0] : 'Sem Data';

        if (!evolucaoDesempenhoMap[dataAplicacaoStr]) {
          evolucaoDesempenhoMap[dataAplicacaoStr] = { portugues: 0, matematica: 0, count: 0 };
        }

        // Processar respostas dos alunos
        for (const resposta of avaliacao.respostas) {
          // Mapear respostas do aluno por número da questão
          const respostasAluno = new Map(
            resposta.itens.map(item => [item.numero, item])
          );

          // Processar cada item do gabarito
          for (const itemGabarito of avaliacao.gabarito?.itens ?? []) {
            if (itemGabarito.descritor) {
              const descritor = itemGabarito.descritor;
              const respostaAluno = respostasAluno.get(itemGabarito.numero);

              // Inicializar contadores para o descritor se não existirem
              if (!descritoresMap[descritor.codigo]) {
                descritoresMap[descritor.codigo] = {
                  codigo: descritor.codigo,
                  nome: descritor.descricao,
                  acertos: 0,
                  total: 0,
                  disciplina: descritor.disciplina
                };
              }

              // Incrementar contadores
              descritoresMap[descritor.codigo].total++;
              if (respostaAluno && respostaAluno.resposta === itemGabarito.resposta) {
                descritoresMap[descritor.codigo].acertos++;
              }

              // Atualizar contadores de português e matemática
              if (descritor.disciplina === 'PORTUGUES') {
                evolucaoDesempenhoMap[dataAplicacaoStr].portugues += respostaAluno && respostaAluno.resposta === itemGabarito.resposta ? 1 : 0;
                evolucaoDesempenhoMap[dataAplicacaoStr].count++;
              } else if (descritor.disciplina === 'MATEMATICA') {
                evolucaoDesempenhoMap[dataAplicacaoStr].matematica += respostaAluno && respostaAluno.resposta === itemGabarito.resposta ? 1 : 0;
                evolucaoDesempenhoMap[dataAplicacaoStr].count++;
              }
            }
          }
        }
      }

      // Calcular médias finais
      const evolucaoDesempenho = Object.entries(evolucaoDesempenhoMap).map(([avaliacao, data]) => ({
        avaliacao,
        portugues: data.count > 0 ? (data.portugues / data.count) * 100 : 0,
        matematica: data.count > 0 ? (data.matematica / data.count) * 100 : 0,
      }));

      // Filtrar e calcular percentuais dos descritores
      const desempenhoDescritores = Object.values(descritoresMap)
        .filter(desc => !componente || 
          (componente === 'portugues' && desc.disciplina === 'PORTUGUES') ||
          (componente === 'matematica' && desc.disciplina === 'MATEMATICA'))
        .map(desc => ({
          codigo: desc.codigo,
          nome: desc.nome,
          percentual: desc.total > 0 ? (desc.acertos / desc.total) * 100 : 0
        }))
        .sort((a, b) => a.codigo.localeCompare(b.codigo));

      return response.json({
        evolucaoDesempenho,
        desempenhoHabilidades: [], // Implementar conforme necessidade
        desempenhoDescritores,
      });
    } catch (error) {
      console.error('Erro ao obter dados dos relatórios:', error);
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
                    descricao: true,
                  },
                },
              },
            },
          },
        },
      },
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
                    descricao: true,
                  },
                },
              },
            },
          },
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
                    ano: true,
                  },
                },
              },
            },
            compareceu: true,
            transferido: true,
            itens: {
              select: {
                id: true,
                numero: true,
                resposta: true,
              },
            },
          },
        },
      },
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
                    descricao: true,
                  },
                },
              },
            },
          },
        },
      },
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
              },
            },
          },
        },
      },
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
          })),
        },
      },
      update: {
        itens: {
          deleteMany: {},
          create: itens.map((item) => ({
            numero: item.numero,
            resposta: item.resposta,
            descritorId: item.descritor?.id,
          })),
        },
      },
      include: {
        itens: {
          include: {
            descritor: true,
          },
        },
      },
    });

    return response.json(gabarito);
  }
}
