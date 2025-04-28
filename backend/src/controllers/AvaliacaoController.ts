import { Request as ExpressRequest, Response } from 'express';
import { prisma } from '../lib/prisma';
import { TipoAvaliacao, Disciplina } from '@prisma/client';

interface CustomRequest extends ExpressRequest {
  usuario: {
    id: string;
    role: string;
    escolaId?: string;
  };
}

export class AvaliacaoController {
  async criar(request: CustomRequest, response: Response) {
    const { nome, tipo, disciplina, dataAplicacao, escolaId, turmaId, ciclo } = request.body;

    // Verificar se a escola existe
    const escola = await prisma.escola.findUnique({
      where: { id: escolaId },
    });

    if (!escola) {
      return response.status(400).json({ error: 'Escola não encontrada' });
    }

    // Se for um usuário da escola, só pode criar avaliações para a própria escola
    if (request.usuario?.role === 'escola' && escolaId !== request.usuario.escolaId) {
      return response.status(403).json({ error: 'Acesso negado' });
    }

    // Validar tipo de avaliação
    if (!Object.values(TipoAvaliacao).includes(tipo)) {
      return response.status(400).json({ error: 'Tipo de avaliação inválido' });
    }

    // Validar disciplina
    if (!Object.values(Disciplina).includes(disciplina)) {
      return response.status(400).json({ error: 'Disciplina inválida' });
    }

    const avaliacao = await prisma.avaliacao.create({
      data: {
        nome,
        tipo,
        disciplina,
        dataAplicacao: new Date(dataAplicacao),
        escolaId,
        turmaId,
        escola: {
          connect: {
            id: escolaId
          }
        },
        turma: {
          connect: {
            id: turmaId
          }
        }
      },
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

    // Se for um usuário da escola, só pode ver avaliações da própria escola
    if (request.usuario?.role === 'escola') {
      const avaliacoes = await prisma.avaliacao.findMany({
        where: { turmaId, escolaId: request.usuario.escolaId },
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

    // Se for um usuário da secretaria, pode ver todas as avaliações da turma
    const avaliacoes = await prisma.avaliacao.findMany({
      where: { turmaId },
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

  // Novo método para dados agregados dos relatórios
  async obterDadosRelatorios(request: CustomRequest, response: Response) {
    try {
      const { escolaId, turmaId, componente } = request.query;

      // Filtros opcionais
      const filtros: Record<string, string | undefined> = {};
      if (escolaId) filtros.escolaId = escolaId as string;
      if (turmaId) filtros.turmaId = turmaId as string;

      // Buscar avaliações filtradas
      const avaliacoes = await prisma.avaliacao.findMany({
        where: filtros,
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

      // Agregar dados para desempenho por turma
      const desempenhoTurmasMap: Record<string, { portugues: number; matematica: number; count: number }> = {};
      // Agregar dados para evolução desempenho
      const evolucaoDesempenhoMap: Record<string, { portugues: number; matematica: number; count: number }> = {};
      // Agregar dados para habilidades (exemplo simplificado)
      const habilidadesMap: Record<string, number[]> = {};
      // Agregar dados para descritores
      const descritoresMap: Record<string, { nome: string; percentualTotal: number; count: number }> = {};

      for (const avaliacao of avaliacoes) {
        const turmaNome = avaliacao.turmaId || 'Sem Turma';
        const dataAplicacaoStr = avaliacao.dataAplicacao ? avaliacao.dataAplicacao.toISOString().split('T')[0] : 'Sem Data';

        if (!desempenhoTurmasMap[turmaNome]) {
          desempenhoTurmasMap[turmaNome] = { portugues: 0, matematica: 0, count: 0 };
        }
        if (!evolucaoDesempenhoMap[dataAplicacaoStr]) {
          evolucaoDesempenhoMap[dataAplicacaoStr] = { portugues: 0, matematica: 0, count: 0 };
        }

        // Calcular médias simplificadas para português e matemática
        let totalPortugues = 0;
        let totalMatematica = 0;
        let countPortugues = 0;
        let countMatematica = 0;

        for (const resposta of avaliacao.respostas) {
          for (const item of avaliacao.gabarito?.itens ?? []) {
            if (item.descritor && resposta.itens.some(ri => ri.id === item.id)) {
              // Exemplo: incrementar contadores para português e matemática baseado no descritor
              if (item.descritor.codigo.startsWith('D0')) {
                totalPortugues++;
                countPortugues++;
              } else if (item.descritor.codigo.startsWith('D1')) {
                totalMatematica++;
                countMatematica++;
              }
            }
          }
        }

        if (countPortugues > 0) {
          desempenhoTurmasMap[turmaNome].portugues += totalPortugues / countPortugues;
          evolucaoDesempenhoMap[dataAplicacaoStr].portugues += totalPortugues / countPortugues;
        }
        if (countMatematica > 0) {
          desempenhoTurmasMap[turmaNome].matematica += totalMatematica / countMatematica;
          evolucaoDesempenhoMap[dataAplicacaoStr].matematica += totalMatematica / countMatematica;
        }
        desempenhoTurmasMap[turmaNome].count++;
        evolucaoDesempenhoMap[dataAplicacaoStr].count++;

        // Agregar descritores
        for (const item of avaliacao.gabarito?.itens ?? []) {
          if (item.descritor) {
            if (!descritoresMap[item.descritor.codigo]) {
              descritoresMap[item.descritor.codigo] = { nome: item.descritor.descricao, percentualTotal: 0, count: 0 };
            }
            descritoresMap[item.descritor.codigo].percentualTotal += 1; // Exemplo simplificado
            descritoresMap[item.descritor.codigo].count++;
          }
        }
      }

      // Calcular médias finais
      const desempenhoTurmas = Object.entries(desempenhoTurmasMap).map(([turma, data]) => ({
        turma,
        portugues: data.count > 0 ? data.portugues / data.count : 0,
        matematica: data.count > 0 ? data.matematica / data.count : 0,
      }));

      const evolucaoDesempenho = Object.entries(evolucaoDesempenhoMap).map(([avaliacao, data]) => ({
        avaliacao,
        portugues: data.count > 0 ? data.portugues / data.count : 0,
        matematica: data.count > 0 ? data.matematica / data.count : 0,
      }));

      const desempenhoHabilidades: Array<{ habilidade: string; percentual: number }> = []; // Implementar conforme necessidade

      const desempenhoDescritores = Object.entries(descritoresMap).map(([codigo, data]) => ({
        codigo,
        nome: data.nome,
        percentual: data.count > 0 ? (data.percentualTotal / data.count) * 100 : 0,
      }));

      return response.json({
        desempenhoTurmas,
        evolucaoDesempenho,
        desempenhoHabilidades,
        desempenhoDescritores,
      });
    } catch (error) {
      console.error('Erro ao obter dados dos relatórios:', error);
      return response.status(500).json({ error: 'Erro interno do servidor' });
    }
  }

  async listarTodas(request: CustomRequest, response: Response) {
    const { escolaId } = request.query;

    // Se for um usuário da escola, só pode ver avaliações da própria escola
    if (request.usuario?.role === 'escola') {
      const avaliacoes = await prisma.avaliacao.findMany({
        where: { escolaId: request.usuario.escolaId },
        include: {
          escola: {
            select: {
              id: true,
              nome: true,
            },
          },
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

    // Se for um usuário da secretaria, pode filtrar por escola
    const where: Record<string, string> = {};
    if (escolaId) {
      where.escolaId = escolaId as string;
    }

    const avaliacoes = await prisma.avaliacao.findMany({
      where,
      include: {
        escola: {
          select: {
            id: true,
            nome: true,
          },
        },
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
        escola: {
          select: {
            id: true,
            nome: true,
          },
        },
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

    // Se for um usuário da escola, só pode ver avaliações da própria escola
    if (request.usuario?.role === 'escola' && avaliacao.escola.id !== request.usuario.escolaId) {
      return response.status(403).json({ error: 'Acesso negado' });
    }

    return response.json(avaliacao);
  }

  async atualizar(request: CustomRequest, response: Response) {
    const { id } = request.params;
    const { nome, tipo, disciplina, dataAplicacao, escolaId, turmaId, ciclo } = request.body;

    // Verificar se a avaliação existe
    const avaliacaoExistente = await prisma.avaliacao.findUnique({
      where: { id },
      include: {
        escola: {
          select: {
            id: true,
          },
        },
      },
    });

    if (!avaliacaoExistente) {
      return response.status(404).json({ error: 'Avaliação não encontrada' });
    }

    // Se for um usuário da escola, só pode atualizar avaliações da própria escola
    if (request.usuario?.role === 'escola' && avaliacaoExistente.escola.id !== request.usuario.escolaId) {
      return response.status(403).json({ error: 'Acesso negado' });
    }

    // Verificar se a escola existe, se estiver alterando a escola
    if (escolaId && escolaId !== avaliacaoExistente.escolaId) {
      const escola = await prisma.escola.findUnique({
        where: { id: escolaId },
      });

      if (!escola) {
        return response.status(400).json({ error: 'Escola não encontrada' });
      }

      // Se for um usuário da escola, não pode transferir avaliações para outras escolas
      if (request.usuario?.role === 'escola' && escolaId !== request.usuario.escolaId) {
        return response.status(403).json({ error: 'Acesso negado' });
      }
    }

    // Validar tipo de avaliação
    if (tipo && !Object.values(TipoAvaliacao).includes(tipo)) {
      return response.status(400).json({ error: 'Tipo de avaliação inválido' });
    }

    // Validar disciplina
    if (disciplina && !Object.values(Disciplina).includes(disciplina)) {
      return response.status(400).json({ error: 'Disciplina inválida' });
    }

    const avaliacao = await prisma.avaliacao.update({
      where: { id },
      data: {
        nome,
        tipo,
        disciplina,
        dataAplicacao: dataAplicacao ? new Date(dataAplicacao) : undefined,
        escolaId,
        turmaId,
        escola: {
          connect: {
            id: escolaId
          }
        },
        turma: {
          connect: {
            id: turmaId
          }
        }
      },
      include: {
        escola: {
          select: {
            id: true,
            nome: true,
          },
        },
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
      include: {
        escola: {
          select: {
            id: true,
          },
        },
      },
    });

    if (!avaliacaoExistente) {
      return response.status(404).json({ error: 'Avaliação não encontrada' });
    }

    // Se for um usuário da escola, só pode deletar avaliações da própria escola
    if (request.usuario?.role === 'escola' && avaliacaoExistente.escola.id !== request.usuario.escolaId) {
      return response.status(403).json({ error: 'Acesso negado' });
    }

    await prisma.avaliacao.delete({
      where: { id },
    });

    return response.status(204).send();
  }
}
