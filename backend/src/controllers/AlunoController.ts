import { Request as ExpressRequest, Response } from 'express';
// import '../../types/express';
import { prisma } from '../lib/prisma';
import { Prisma } from '@prisma/client';
import { v4 as uuidv4 } from 'uuid';

interface CustomRequest extends ExpressRequest {
  usuario: {
    id: string;
    role: string;
    escolaId?: string;
  };
}

export class AlunoController {
  async criar(request: CustomRequest, response: Response) {
    const { nome, matricula, turmaId } = request.body;

    // Verificar se a turma existe
    const turma = await prisma.turma.findUnique({
      where: { id: turmaId },
    });

    if (!turma) {
      return response.status(400).json({ error: 'Turma não encontrada' });
    }

    // Se for um usuário da escola, só pode criar alunos para turmas da própria escola
    if (!request.usuario) {
      // continue normally
    } else if (request.usuario.role !== 'escola') {
      // continue normally
    } else if (turma.escolaId !== request.usuario.escolaId) {
      return response.status(403).json({ error: 'Acesso negado' });
    }

    // Gerar matrícula automática se não for fornecida
    let matriculaFinal = matricula;
    if (!matriculaFinal || matriculaFinal.trim() === '') {
      matriculaFinal = uuidv4().slice(0, 8);
    }

    // Verificar se a matrícula já está em uso
    const matriculaEmUso = await prisma.aluno.findFirst({
      where: { matricula: matriculaFinal },
    });

    if (matriculaEmUso) {
      return response.status(400).json({ error: 'Matrícula já cadastrada' });
    }

    const aluno = await prisma.aluno.create({
      data: {
        nome,
        matricula: matriculaFinal,
        turmaId,
      },
    });

    return response.status(201).json(aluno);
  }

  async listarTodos(request: CustomRequest, response: Response) {
    const { turmaId } = request.query;

    // Se for um usuário da escola, só pode ver alunos das turmas da própria escola
    if (request.usuario === undefined) {
      // continue normally
    } else if (request.usuario.role !== 'escola') {
      // continue normally
    } else {
      // Usando Prisma.AlunoWhereInput ao invés de any
      const where: Prisma.AlunoWhereInput = {};
      
      if (turmaId) {
        where.turmaId = turmaId as string;
      } else {
        // Buscar todas as turmas da escola
        const turmas = await prisma.turma.findMany({
          where: { escolaId: request.usuario?.escolaId ?? '' },
          select: { id: true },
        });
    
      where.turmaId = {
        in: turmas.map(turma => turma.id),
      };
      }

      const alunos = await prisma.aluno.findMany({
        where,
        include: {
          turma: {
            select: {
              id: true,
              nome: true,
              ano: true,
            },
          },
        },
      });

      return response.json(alunos);
    }

    // Se for um usuário da secretaria, pode filtrar por turma
    // Usando Prisma.AlunoWhereInput ao invés de any
    const where: Prisma.AlunoWhereInput = {};
    if (turmaId) {
      where.turmaId = turmaId as string;
    }

    const alunos = await prisma.aluno.findMany({
      where,
      include: {
        turma: {
          select: {
            id: true,
            nome: true,
            ano: true,
            escola: {
              select: {
                id: true,
                nome: true,
              },
            },
          },
        },
      },
    });

    return response.json(alunos);
  }

  async buscarPorId(request: CustomRequest, response: Response) {
    const { id } = request.params;

    const aluno = await prisma.aluno.findUnique({
      where: { id },
      include: {
        turma: {
          select: {
            id: true,
            nome: true,
            ano: true,
            escola: {
              select: {
                id: true,
                nome: true,
              },
            },
          },
        },
        respostas: {
          select: {
            id: true,
            avaliacao: {
              select: {
                id: true,
                nome: true,
                tipo: true,
                disciplina: true,
                dataAplicacao: true,
              },
            },
            compareceu: true,
            transferido: true,
          },
        },
      },
    });

    if (!aluno) {
      return response.status(404).json({ error: 'Aluno não encontrado' });
    }

    // Se for um usuário da escola, só pode ver alunos das turmas da própria escola
    if (request.usuario === undefined) {
      // continue normally
    } else if (request.usuario.role !== 'escola') {
      // continue normally
    } else if (aluno.turma.escola.id !== request.usuario.escolaId) {
      return response.status(403).json({ error: 'Acesso negado' });
    }

    return response.json(aluno);
  }

  async atualizar(request: CustomRequest, response: Response) {
    const { id } = request.params;
    const { nome, matricula, turmaId } = request.body;

    // Verificar se o aluno existe
    const alunoExistente = await prisma.aluno.findUnique({
      where: { id },
      include: {
        turma: {
          select: {
            escolaId: true,
          },
        },
      },
    });

    if (!alunoExistente) {
      return response.status(404).json({ error: 'Aluno não encontrado' });
    }

    // Se for um usuário da escola, só pode atualizar alunos das turmas da própria escola
    if (request.usuario === undefined) {
      // continue normally
    } else if (request.usuario.role !== 'escola') {
      // continue normally
    } else if (alunoExistente.turma.escolaId !== request.usuario.escolaId) {
      return response.status(403).json({ error: 'Acesso negado' });
    }

    // Verificar se a matrícula já está em uso por outro aluno
    if (matricula !== alunoExistente.matricula) {
      const matriculaEmUso = await prisma.aluno.findFirst({
        where: { matricula },
      });

      if (matriculaEmUso) {
        return response.status(400).json({ error: 'Matrícula já cadastrada' });
      }
    }

    // Verificar se a turma existe, se estiver alterando a turma
    if (turmaId && turmaId !== alunoExistente.turmaId) {
      const turma = await prisma.turma.findUnique({
        where: { id: turmaId },
        include: {
          escola: {
            select: {
              id: true,
            },
          },
        },
      });

      if (!turma) {
        return response.status(400).json({ error: 'Turma não encontrada' });
      }

      // Se for um usuário da escola, não pode transferir alunos para turmas de outras escolas
      // if (request.usuario.role === 'escola' && turma.escola.id !== request.usuario.escolaId) {
      //   return response.status(403).json({ error: 'Acesso negado' });
      // }
      if (request.usuario && request.usuario.role === 'escola' && turma.escola.id !== request.usuario.escolaId) {
        return response.status(403).json({ error: 'Acesso negado' });
      }
      
    }

    const aluno = await prisma.aluno.update({
      where: { id },
      data: {
        nome,
        matricula,
        turmaId,
      },
      include: {
        turma: {
          select: {
            id: true,
            nome: true,
            ano: true,
            escola: {
              select: {
                id: true,
                nome: true,
              },
            },
          },
        },
      },
    });

    return response.json(aluno);
  }

  async deletar(request: CustomRequest, response: Response) {
    const { id } = request.params;

    // Verificar se o aluno existe
    const alunoExistente = await prisma.aluno.findUnique({
      where: { id },
      include: {
        turma: {
          select: {
            escolaId: true,
          },
        },
      },
    });

    if (!alunoExistente) {
      return response.status(404).json({ error: 'Aluno não encontrado' });
    }

    // Se for um usuário da escola, só pode deletar alunos das turmas da própria escola
    if (request.usuario === undefined) {
      // continue normally
    } else if (request.usuario.role !== 'escola') {
      // continue normally
    } else if (alunoExistente.turma.escolaId !== request.usuario.escolaId) {
      return response.status(403).json({ error: 'Acesso negado' });
    }

    await prisma.aluno.delete({
      where: { id },
    });

    return response.status(204).send();
  }
}