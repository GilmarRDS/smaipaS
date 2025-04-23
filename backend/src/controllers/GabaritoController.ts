import { Request, Response } from 'express';
import { prisma } from '../lib/prisma';

export class GabaritoController {
  async criar(request: Request, response: Response) {
    const { avaliacaoId, itens } = request.body;

    // Verificar se a avaliação existe
    const avaliacao = await prisma.avaliacao.findUnique({
      where: { id: avaliacaoId },
      include: {
        escola: {
          select: {
            id: true,
          },
        },
      },
    });

    if (!avaliacao) {
      return response.status(400).json({ error: 'Avaliação não encontrada' });
    }

    // Se for um usuário da escola, só pode criar gabaritos para avaliações da própria escola
    if (request.usuario.role === 'escola' && avaliacao.escola.id !== request.usuario.escolaId) {
      return response.status(403).json({ error: 'Acesso negado' });
    }

    // Validar itens
    if (!Array.isArray(itens) || itens.length === 0) {
      return response.status(400).json({ error: 'O gabarito deve ter pelo menos um item' });
    }

    // Validar cada item
    for (const item of itens) {
      if (
        typeof item.numero !== 'number' ||
        typeof item.resposta !== 'string' ||
        typeof item.descritorId !== 'string'
      ) {
        return response.status(400).json({ error: 'Item inválido' });
      }
    }

    const gabarito = await prisma.gabarito.create({
      data: {
        avaliacaoId,
        itens: {
          create: itens.map(item => ({
            numero: item.numero,
            resposta: item.resposta,
            descritorId: item.descritorId,
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

    return response.status(201).json(gabarito);
  }

  async listarTodos(request: Request, response: Response) {
    const { avaliacaoId } = request.query;

    // Se for um usuário da escola, só pode ver gabaritos de avaliações da própria escola
    if (request.usuario.role === 'escola') {
      const gabaritos = await prisma.gabarito.findMany({
        where: {
          avaliacao: {
            escolaId: request.usuario.escolaId,
          },
          ...(avaliacaoId ? { avaliacaoId: avaliacaoId as string } : {}),
        },
        include: {
          itens: {
            include: {
              descritor: true,
            },
          },
        },
      });

      return response.json(gabaritos);
    }

    // Se for um usuário da secretaria, pode filtrar por avaliação
    const where = {};
    if (avaliacaoId) {
      Object.assign(where, { avaliacaoId: avaliacaoId as string });
    }

    const gabaritos = await prisma.gabarito.findMany({
      where,
      include: {
        itens: {
          include: {
            descritor: true,
          },
        },
      },
    });

    return response.json(gabaritos);
  }

  async buscarPorId(request: Request, response: Response) {
    const { id } = request.params;

    const gabarito = await prisma.gabarito.findUnique({
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
        itens: {
          include: {
            descritor: true,
          },
        },
      },
    });

    if (!gabarito) {
      return response.status(404).json({ error: 'Gabarito não encontrado' });
    }

    // Se for um usuário da escola, só pode ver gabaritos de avaliações da própria escola
    if (request.usuario.role === 'escola' && gabarito.avaliacao.escola.id !== request.usuario.escolaId) {
      return response.status(403).json({ error: 'Acesso negado' });
    }

    return response.json(gabarito);
  }

  async atualizar(request: Request, response: Response) {
    const { id } = request.params;
    const { itens } = request.body;

    // Verificar se o gabarito existe
    const gabaritoExistente = await prisma.gabarito.findUnique({
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

    if (!gabaritoExistente) {
      return response.status(404).json({ error: 'Gabarito não encontrado' });
    }

    // Se for um usuário da escola, só pode atualizar gabaritos de avaliações da própria escola
    if (request.usuario.role === 'escola' && gabaritoExistente.avaliacao.escola.id !== request.usuario.escolaId) {
      return response.status(403).json({ error: 'Acesso negado' });
    }

    // Validar itens
    if (itens) {
      if (!Array.isArray(itens) || itens.length === 0) {
        return response.status(400).json({ error: 'O gabarito deve ter pelo menos um item' });
      }

      // Validar cada item
      for (const item of itens) {
        if (!item.numero || !item.resposta || !item.descritorId) {
          return response.status(400).json({ error: 'Item inválido' });
        }
      }
    }

    // Atualizar o gabarito
    const gabarito = await prisma.gabarito.update({
      where: { id },
      data: {
        ...(itens && {
          itens: {
            deleteMany: {},
            create: itens.map((item: { numero: number; resposta: string; descritorId: string }) => ({
              numero: item.numero,
              resposta: item.resposta,
              descritorId: item.descritorId,
            })),
          },
        }),
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

  async deletar(request: Request, response: Response) {
    const { id } = request.params;

    // Verificar se o gabarito existe
    const gabaritoExistente = await prisma.gabarito.findUnique({
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

    if (!gabaritoExistente) {
      return response.status(404).json({ error: 'Gabarito não encontrado' });
    }

    // Se for um usuário da escola, só pode deletar gabaritos de avaliações da própria escola
    if (request.usuario.role === 'escola' && gabaritoExistente.avaliacao.escola.id !== request.usuario.escolaId) {
      return response.status(403).json({ error: 'Acesso negado' });
    }

    await prisma.gabarito.delete({
      where: { id },
    });

    return response.status(204).send();
  }
}
