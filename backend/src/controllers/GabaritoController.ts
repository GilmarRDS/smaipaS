import { Request as ExpressRequest, Response } from 'express';
import { prisma } from '../lib/prisma';
import { Prisma } from '@prisma/client';

interface CustomRequest extends ExpressRequest {
  usuario: {
    id: string;
    role: string;
    escolaId?: string;
  };
}

interface ItemGabarito {
  numero: number;
  resposta: string;
  descritorId: string;
}

interface CriarGabaritoParams {
  avaliacaoId: string;
  itens: ItemGabarito[];
}

export class GabaritoController {
  async criar(request: CustomRequest, response: Response) {
    const { avaliacaoId, itens } = request.body as CriarGabaritoParams;

    // Verificar se a avaliação existe
    const avaliacao = await prisma.avaliacao.findUnique({
      where: { id: avaliacaoId },
    });

    if (!avaliacao) {
      return response.status(404).json({ error: 'Avaliação não encontrada' });
    }

    // Criar o gabarito com seus itens
    const gabarito = await prisma.gabarito.create({
      data: {
        avaliacaoId,
        itens: {
          create: itens.map((item: ItemGabarito) => ({
            numero: item.numero,
            resposta: item.resposta,
            descritorId: item.descritorId,
          })),
        },
      } as unknown as Prisma.GabaritoUncheckedCreateInput,
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

  async listarTodos(request: CustomRequest, response: Response) {
    const gabaritos = await prisma.gabarito.findMany({
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

  async buscarPorId(request: CustomRequest, response: Response) {
    const { id } = request.params;

    const gabarito = await prisma.gabarito.findUnique({
      where: { id },
      include: {
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

    return response.json(gabarito);
  }

  async atualizar(request: CustomRequest, response: Response) {
    const { id } = request.params;
    const { itens } = request.body;

    // Verificar se o gabarito existe
    const gabaritoExistente = await prisma.gabarito.findUnique({
      where: { id },
    });

    if (!gabaritoExistente) {
      return response.status(404).json({ error: 'Gabarito não encontrado' });
    }

    // Atualizar os itens do gabarito
    await prisma.itemGabarito.deleteMany({
      where: { gabaritoId: id },
    });

    const gabarito = await prisma.gabarito.update({
      where: { id },
      data: {
        itens: {
          create: itens.map((item: ItemGabarito) => ({
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

    return response.json(gabarito);
  }

  async deletar(request: CustomRequest, response: Response) {
    const { id } = request.params;

    // Verificar se o gabarito existe
    const gabaritoExistente = await prisma.gabarito.findUnique({
      where: { id },
    });

    if (!gabaritoExistente) {
      return response.status(404).json({ error: 'Gabarito não encontrado' });
    }

    await prisma.gabarito.delete({
      where: { id },
    });

    return response.status(204).send();
  }

  async listarPorAvaliacao(request: CustomRequest, response: Response) {
    const { avaliacaoId } = request.params;

    if (!avaliacaoId) {
      return response.status(400).json({ error: 'ID da avaliação é obrigatório' });
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
      return response.json([]);
    }

    return response.json([gabarito]);
  }
}
