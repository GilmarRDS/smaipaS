import { Request, Response } from 'express';
import { prisma } from '../lib/prisma';
import { Prisma } from '@prisma/client';

// Estender a interface Request do Express
declare module 'express' {
  interface Request {
    usuario: {
      id: string;
      role: string;
      escolaId?: string;
    };
  }
}

export class TurmaController {
  async criar(request: Request, response: Response) {
    const { nome, ano, escolaId } = request.body;

    // Verificar se a escola existe
    const escola = await prisma.escola.findUnique({
      where: { id: escolaId },
    });

    if (!escola) {
      return response.status(400).json({ error: 'Escola não encontrada' });
    }

    // Permitir que usuários da secretaria criem turmas para qualquer escola
    if (request.usuario.role === 'escola' && escolaId !== request.usuario.escolaId) {
      return response.status(403).json({ error: 'Acesso negado' });
    }

    const turma = await prisma.turma.create({
      data: {
        nome,
        ano,
        escolaId,
      },
    });

    return response.status(201).json(turma);
  }

  async listarTodas(request: Request, response: Response) {
    const { escolaId } = request.query;

    // Se for um usuário da escola, só pode ver turmas da própria escola
    if (request.usuario.role === 'escola') {
      const turmas = await prisma.turma.findMany({
        where: { escolaId: request.usuario.escolaId },
        include: {
          alunos: {
            select: {
              id: true,
              nome: true,
              matricula: true,
            },
          },
          avaliacoes: {
            select: {
              id: true,
              nome: true,
              tipo: true,
              disciplina: true,
              dataAplicacao: true,
            },
          },
        },
      });

      return response.json(turmas);
    }

    // Se for um usuário da secretaria, pode filtrar por escola
    const where: Prisma.TurmaWhereInput = {};
    if (escolaId) {
      where.escolaId = escolaId as string;
    }

    const turmas = await prisma.turma.findMany({
      where,
      include: {
        alunos: {
          select: {
            id: true,
            nome: true,
            matricula: true,
          },
        },
        avaliacoes: {
          select: {
            id: true,
            nome: true,
            tipo: true,
            disciplina: true,
            dataAplicacao: true,
          },
        },
      },
    });

    return response.json(turmas);
  }

  async buscarPorId(request: Request, response: Response) {
    const { id } = request.params;

    const turma = await prisma.turma.findUnique({
      where: { id },
      include: {
        alunos: {
          select: {
            id: true,
            nome: true,
            matricula: true,
          },
        },
        avaliacoes: {
          select: {
            id: true,
            nome: true,
            tipo: true,
            disciplina: true,
            dataAplicacao: true,
          },
        },
      },
    });

    if (!turma) {
      return response.status(404).json({ error: 'Turma não encontrada' });
    }

    // Se for um usuário da escola, só pode ver turmas da própria escola
    if (request.usuario.role === 'escola' && turma.escolaId !== request.usuario.escolaId) {
      return response.status(403).json({ error: 'Acesso negado' });
    }

    return response.json(turma);
  }

  async atualizar(request: Request, response: Response) {
    const { id } = request.params;
    const { nome, ano, escolaId } = request.body;

    // Verificar se a turma existe
    const turmaExistente = await prisma.turma.findUnique({
      where: { id },
    });

    if (!turmaExistente) {
      return response.status(404).json({ error: 'Turma não encontrada' });
    }

    // Se for um usuário da escola, só pode atualizar turmas da própria escola
    if (request.usuario.role === 'escola' && turmaExistente.escolaId !== request.usuario.escolaId) {
      return response.status(403).json({ error: 'Acesso negado' });
    }

    // Verificar se a escola existe, se estiver alterando a escola
    if (escolaId && escolaId !== turmaExistente.escolaId) {
      const escola = await prisma.escola.findUnique({
        where: { id: escolaId },
      });

      if (!escola) {
        return response.status(400).json({ error: 'Escola não encontrada' });
      }

      // Se for um usuário da escola, não pode transferir turmas para outras escolas
      if (request.usuario.role === 'escola') {
        return response.status(403).json({ error: 'Acesso negado' });
      }
    }

    const turma = await prisma.turma.update({
      where: { id },
      data: {
        nome,
        ano,
        escolaId,
      },
      include: {
        alunos: {
          select: {
            id: true,
            nome: true,
            matricula: true,
          },
        },
        avaliacoes: {
          select: {
            id: true,
            nome: true,
            tipo: true,
            disciplina: true,
            dataAplicacao: true,
          },
        },
      },
    });

    return response.json(turma);
  }

  async deletar(request: Request, response: Response) {
    const { id } = request.params;

    // Verificar se a turma existe
    const turmaExistente = await prisma.turma.findUnique({
      where: { id },
    });

    if (!turmaExistente) {
      return response.status(404).json({ error: 'Turma não encontrada' });
    }

    // Se for um usuário da escola, só pode deletar turmas da própria escola
    if (request.usuario.role === 'escola' && turmaExistente.escolaId !== request.usuario.escolaId) {
      return response.status(403).json({ error: 'Acesso negado' });
    }

    await prisma.turma.delete({
      where: { id },
    });

    return response.status(204).send();
  }
}
