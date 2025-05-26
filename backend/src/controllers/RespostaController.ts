import { Request, Response } from 'express';
import { prisma } from '../lib/prisma';

// Interface para tipagem dos itens de resposta
interface ItemResposta {
  numero: number;
  resposta: string;
}

export class RespostaController {
  async criar(request: Request, response: Response) {
    const { alunoId, avaliacaoId, compareceu, transferido, itens } = request.body;

    console.log('Debugging Save: Received alunoId:', alunoId, 'and avaliacaoId:', avaliacaoId);

    // Verificar se o aluno existe
    const aluno = await prisma.aluno.findUnique({
      where: { id: alunoId },
      include: {
        turma: {
          select: {
            id: true,
            escola: {
              select: {
                id: true,
              },
            },
          },
        },
      },
    });

    console.log('Resultado da busca por aluno:', aluno ? 'Encontrado - ID: ' + aluno.id : 'Não encontrado');

    if (!aluno) {
      return response.status(400).json({ error: 'Aluno não encontrado' });
    }

    // Verificar se a avaliação existe
    const avaliacao = await prisma.avaliacao.findUnique({
      where: { id: avaliacaoId },
      select: {
        id: true,
        nome: true,
        escolaId: true,
      },
    });

    console.log('Resultado da busca por avaliação:', avaliacao ? 'Encontrada - ID: ' + avaliacao.id : 'Não encontrada');

    if (!avaliacao) {
      return response.status(400).json({ error: 'Avaliação não encontrada' });
    }

    // Se for um usuário da escola, só pode criar respostas para avaliações da própria escola
    if (request.usuario.role === 'escola' && avaliacao.escolaId !== request.usuario.escolaId) {
      return response.status(403).json({ error: 'Acesso negado' });
    }

    // Verificar se o aluno já respondeu esta avaliação
    const respostaExistente = await prisma.resposta.findFirst({
      where: {
        alunoId,
        avaliacaoId,
      },
    });

    if (respostaExistente) {
      return response.status(400).json({ error: 'Aluno já respondeu esta avaliação' });
    }

    // Validar itens se o aluno compareceu
    if (compareceu && (!Array.isArray(itens) || itens.length === 0)) {
      return response.status(400).json({ error: 'O aluno compareceu mas não há respostas' });
    }

    // Validar cada item se o aluno compareceu
    if (compareceu) {
      for (const item of itens as ItemResposta[]) {
        if (!item.numero || !item.resposta) {
          return response.status(400).json({ error: 'Item inválido' });
        }
      }
    }

    const resposta = await prisma.resposta.create({
      data: {
        alunoId,
        avaliacaoId,
        compareceu,
        transferido,
        ...(compareceu && {
          itens: {
            create: (itens as ItemResposta[]).map(item => ({
              numero: item.numero,
              resposta: item.resposta,
            })),
          },
        }),
      },
      include: {
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
        itens: true,
      },
    });

    return response.status(201).json(resposta);
  }

  async listarTodas(request: Request, response: Response) {
    const { avaliacaoId, alunoId } = request.query;

    // Se for um usuário da escola, só pode ver respostas de avaliações da própria escola
    if (request.usuario.role === 'escola') {
      const respostas = await prisma.resposta.findMany({
        where: {
          avaliacao: {
            escolaId: request.usuario.escolaId,
          },
          ...(avaliacaoId ? { avaliacaoId: avaliacaoId as string } : {}),
          ...(alunoId ? { alunoId: alunoId as string } : {}),
        },
        include: {
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
          avaliacao: {
            select: {
              id: true,
              nome: true,
              escolaId: true,
            },
          },
          itens: true,
        },
      });

      return response.json(respostas);
    }

    // Se for um usuário da secretaria, pode filtrar por avaliação e aluno
    const where: { avaliacaoId?: string; alunoId?: string } = {};
    if (avaliacaoId) {
      Object.assign(where, { avaliacaoId: avaliacaoId as string });
    }
    if (alunoId) {
      Object.assign(where, { alunoId: alunoId as string });
    }

    const respostas = await prisma.resposta.findMany({
      where,
      include: {
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
        itens: true,
      },
    });

    return response.json(respostas);
  }

  async buscarPorId(request: Request, response: Response) {
    const { id } = request.params;

    const resposta = await prisma.resposta.findUnique({
      where: { id },
      include: {
        avaliacao: {
          select: {
            id: true,
            escola: {
              select: {
                id: true,
              },
            },
          },
        },
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
        itens: true,
      },
    });

    if (!resposta) {
      return response.status(404).json({ error: 'Resposta não encontrada' });
    }

    // Se for um usuário da escola, só pode ver respostas de avaliações da própria escola
    if (request.usuario.role === 'escola' && resposta.avaliacao.escola.id !== request.usuario.escolaId) {
      return response.status(403).json({ error: 'Acesso negado' });
    }

    return response.json(resposta);
  }

  async atualizar(request: Request, response: Response) {
    const { id } = request.params;
    const { compareceu, transferido, itens } = request.body;

    // Verificar se a resposta existe
    const respostaExistente = await prisma.resposta.findUnique({
      where: { id },
      include: {
        avaliacao: {
          select: {
            id: true,
            escola: {
              select: {
                id: true,
              },
            },
          },
        },
      },
    });

    if (!respostaExistente) {
      return response.status(404).json({ error: 'Resposta não encontrada' });
    }

    // Se for um usuário da escola, só pode atualizar respostas de avaliações da própria escola
    if (request.usuario.role === 'escola' && respostaExistente.avaliacao.escola.id !== request.usuario.escolaId) {
      return response.status(403).json({ error: 'Acesso negado' });
    }

    // Validar itens se o aluno compareceu
    if (compareceu && (!Array.isArray(itens) || itens.length === 0)) {
      return response.status(400).json({ error: 'O aluno compareceu mas não há respostas' });
    }

    // Validar cada item se o aluno compareceu
    if (compareceu) {
      for (const item of itens as ItemResposta[]) {
        if (!item.numero || !item.resposta) {
          return response.status(400).json({ error: 'Item inválido' });
        }
      }
    }

    // Atualizar a resposta
    const resposta = await prisma.resposta.update({
      where: { id },
      data: {
        compareceu,
        transferido,
        ...(compareceu && {
          itens: {
            deleteMany: {},
            create: (itens as ItemResposta[]).map((item) => ({
              numero: item.numero,
              resposta: item.resposta,
            })),
          },
        }),
      },
      include: {
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
        itens: true,
      },
    });

    return response.json(resposta);
  }

  async deletar(request: Request, response: Response) {
    const { id } = request.params;

    // Verificar se a resposta existe
    const respostaExistente = await prisma.resposta.findUnique({
      where: { id },
      include: {
        avaliacao: {
          select: {
            id: true,
            escola: {
              select: {
                id: true,
              },
            },
          },
        },
      },
    });

    if (!respostaExistente) {
      return response.status(404).json({ error: 'Resposta não encontrada' });
    }

    // Se for um usuário da escola, só pode deletar respostas de avaliações da própria escola
    if (request.usuario.role === 'escola' && respostaExistente.avaliacao.escola.id !== request.usuario.escolaId) {
      return response.status(403).json({ error: 'Acesso negado' });
    }

    await prisma.resposta.delete({
      where: { id },
    });

    return response.status(204).send();
  }
}