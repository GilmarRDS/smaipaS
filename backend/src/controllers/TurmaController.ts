import { Request, Response } from 'express';
import { prisma } from '../lib/prisma';
import { Prisma, Turno } from '@prisma/client';

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
    console.log('Request body:', request.body);
    console.log('Request headers:', request.headers);
    console.log('Request user:', request.usuario);
    
    const { nome, ano, turno, escolaId } = request.body;
    
    console.log('Dados recebidos:', { nome, ano, turno, escolaId });
    console.log('Tipo do turno:', typeof turno);
    console.log('Valores do enum Turno:', Object.values(Turno));

    // Validar se o turno é um valor válido
    const turnosValidos = ['matutino', 'vespertino', 'noturno', 'integral'];
    if (!turnosValidos.includes(turno)) {
      console.log('Turno inválido:', turno);
      return response.status(400).json({ 
        error: 'Valor de turno inválido. Valores aceitos: matutino, vespertino, noturno, integral' 
      });
    }

    // Verificar se a escola existe
    const escola = await prisma.escola.findUnique({
      where: { id: escolaId },
    });

    if (!escola) {
      console.log('Escola não encontrada:', escolaId);
      return response.status(400).json({ error: 'Escola não encontrada' });
    }

    // Permitir que usuários da secretaria criem turmas para qualquer escola
    if (request.usuario.role === 'escola' && escolaId !== request.usuario.escolaId) {
      console.log('Acesso negado - usuário da escola tentando criar turma para outra escola');
      return response.status(403).json({ error: 'Acesso negado' });
    }

    try {
      console.log('Tentando criar turma com dados:', {
        nome,
        ano,
        turno,
        escolaId,
      });

      const turma = await prisma.turma.create({
        data: {
          nome,
          ano,
          turno: turno as unknown as Turno,
          escolaId,
        },
      });

      console.log('Turma criada com sucesso:', turma);
      return response.status(201).json(turma);
    } catch (error) {
      console.error('Erro ao criar turma:', error);
      console.error('Stack trace:', error instanceof Error ? error.stack : 'No stack trace');
      return response.status(500).json({ 
        error: 'Erro ao criar turma', 
        details: error instanceof Error ? error.message : 'Erro desconhecido',
        stack: error instanceof Error ? error.stack : undefined
      });
    }
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
    const { nome, ano, turno, escolaId } = request.body;

    // Validar se o turno é um valor válido, se fornecido
    if (turno) {
      const turnosValidos = ['matutino', 'vespertino', 'noturno', 'integral'];
      if (!turnosValidos.includes(turno)) {
        console.log('Turno inválido:', turno);
        return response.status(400).json({ 
          error: 'Valor de turno inválido. Valores aceitos: matutino, vespertino, noturno, integral' 
        });
      }
    }

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

    try {
      const turma = await prisma.turma.update({
        where: { id },
        data: {
          nome,
          ano,
          turno: turno as Turno,
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
    } catch (error) {
      console.error('Erro ao atualizar turma:', error);
      return response.status(500).json({ error: 'Erro ao atualizar turma', details: error });
    }
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