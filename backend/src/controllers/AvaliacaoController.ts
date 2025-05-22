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
    const { nome, tipo, disciplina, dataAplicacao, escolaId, turmaId } = request.body;

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
        turmaId
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

  // Método para dados agregados dos relatórios
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
        const turmaNome = avaliacao.turmaId || 'Sem Turma';
        const dataAplicacaoStr = avaliacao.dataAplicacao ? avaliacao.dataAplicacao.toISOString().split('T')[0] : 'Sem Data';

        if (!desempenhoTurmasMap[turmaNome]) {
          desempenhoTurmasMap[turmaNome] = { portugues: 0, matematica: 0, count: 0 };
        }
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
                desempenhoTurmasMap[turmaNome].portugues += respostaAluno && respostaAluno.resposta === itemGabarito.resposta ? 1 : 0;
                evolucaoDesempenhoMap[dataAplicacaoStr].portugues += respostaAluno && respostaAluno.resposta === itemGabarito.resposta ? 1 : 0;
                desempenhoTurmasMap[turmaNome].count++;
                evolucaoDesempenhoMap[dataAplicacaoStr].count++;
              } else if (descritor.disciplina === 'MATEMATICA') {
                desempenhoTurmasMap[turmaNome].matematica += respostaAluno && respostaAluno.resposta === itemGabarito.resposta ? 1 : 0;
                evolucaoDesempenhoMap[dataAplicacaoStr].matematica += respostaAluno && respostaAluno.resposta === itemGabarito.resposta ? 1 : 0;
                desempenhoTurmasMap[turmaNome].count++;
                evolucaoDesempenhoMap[dataAplicacaoStr].count++;
              }
            }
          }
        }
      }

      // Calcular médias finais
      const desempenhoTurmas = Object.entries(desempenhoTurmasMap).map(([turma, data]) => ({
        turma,
        portugues: data.count > 0 ? (data.portugues / data.count) * 100 : 0,
        matematica: data.count > 0 ? (data.matematica / data.count) * 100 : 0,
      }));

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
        desempenhoTurmas,
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
    const { nome, tipo, disciplina, dataAplicacao, escolaId, turmaId } = request.body;

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
        turmaId
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
