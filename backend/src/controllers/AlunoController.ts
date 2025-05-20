import { Request as ExpressRequest, Response } from 'express';
// import '../../types/express';
import { prisma } from '../lib/prisma';
import { Prisma } from '@prisma/client';
import { v4 as uuidv4 } from 'uuid';
import { RequestWithUsuario } from '../middlewares/auth';
import * as XLSX from 'xlsx';
import path from 'path';
import fs from 'fs';

interface CustomRequest extends ExpressRequest {
  usuario: {
    id: string;
    role: string;
    escolaId?: string;
  };
  params: {
    id?: string;
  };
  file?: Express.Multer.File;
}

interface AlunoRow {
  nome: string;
  matricula?: string;
  dataNascimento?: string;
}

export class AlunoController {
  async criar(request: CustomRequest, response: Response) {
    const { nome, matricula, dataNascimento, turmaId } = request.body;

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
        dataNascimento: new Date(dataNascimento),
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
    const { nome, matricula, dataNascimento, turmaId } = request.body;

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
    if (!request.usuario) {
      // continue normally
    } else if (request.usuario.role !== 'escola') {
      // continue normally
    } else if (alunoExistente.turma.escolaId !== request.usuario.escolaId) {
      return response.status(403).json({ error: 'Acesso negado' });
    }

    // Se estiver alterando a turma, verificar se a nova turma existe
    if (turmaId && turmaId !== alunoExistente.turmaId) {
      const novaTurma = await prisma.turma.findUnique({
        where: { id: turmaId },
      });

      if (!novaTurma) {
        return response.status(400).json({ error: 'Turma não encontrada' });
      }

      // Se for um usuário da escola, só pode mover alunos para turmas da própria escola
      if (!request.usuario) {
        // continue normally
      } else if (request.usuario.role !== 'escola') {
        // continue normally
      } else if (novaTurma.escolaId !== request.usuario.escolaId) {
        return response.status(403).json({ error: 'Acesso negado' });
      }
    }

    // Se estiver alterando a matrícula, verificar se a nova matrícula já está em uso
    if (matricula && matricula !== alunoExistente.matricula) {
      const matriculaEmUso = await prisma.aluno.findFirst({
        where: { matricula },
      });

      if (matriculaEmUso) {
        return response.status(400).json({ error: 'Matrícula já cadastrada' });
      }
    }

    const aluno = await prisma.aluno.update({
      where: { id },
      data: {
        nome,
        matricula,
        dataNascimento: dataNascimento ? new Date(dataNascimento) : undefined,
        turmaId,
      },
    });

    return response.json(aluno);
  }

  async deletar(request: CustomRequest, response: Response) {
    const { id } = request.params;

    // Verificar se o aluno existe
    const aluno = await prisma.aluno.findUnique({
      where: { id },
      include: {
        turma: {
          select: {
            escolaId: true,
          },
        },
      },
    });

    if (!aluno) {
      return response.status(404).json({ error: 'Aluno não encontrado' });
    }

    // Se for um usuário da escola, só pode deletar alunos das turmas da própria escola
    if (!request.usuario) {
      // continue normally
    } else if (request.usuario.role !== 'escola') {
      // continue normally
    } else if (aluno.turma.escolaId !== request.usuario.escolaId) {
      return response.status(403).json({ error: 'Acesso negado' });
    }

    await prisma.aluno.delete({
      where: { id },
    });

    return response.status(204).send();
  }

  async importarAlunos(request: CustomRequest, response: Response) {
    if (!request.file) {
      return response.status(400).json({ error: 'Nenhum arquivo enviado' });
    }

    const { turmaId } = request.body;

    if (!turmaId) {
      return response.status(400).json({ error: 'ID da turma não fornecido' });
    }

    // Verificar se a turma existe
    const turma = await prisma.turma.findUnique({
      where: { id: turmaId },
    });

    if (!turma) {
      return response.status(400).json({ error: 'Turma não encontrada' });
    }

    // Se for um usuário da escola, só pode importar alunos para turmas da própria escola
    if (!request.usuario) {
      // continue normally
    } else if (request.usuario.role !== 'escola') {
      // continue normally
    } else if (turma.escolaId !== request.usuario.escolaId) {
      return response.status(403).json({ error: 'Acesso negado' });
    }

    try {
      const workbook = XLSX.readFile(request.file.path);
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      const data = XLSX.utils.sheet_to_json<AlunoRow>(worksheet);

      const alunos = await Promise.all(
        data.map(async (row) => {
          const matricula = row.matricula || uuidv4().slice(0, 8);
          const dataNascimento = row.dataNascimento ? new Date(row.dataNascimento) : new Date();

          return prisma.aluno.create({
            data: {
              nome: row.nome,
              matricula,
              dataNascimento,
              turmaId,
            },
          });
        })
      );

      // Remover o arquivo após a importação
      fs.unlinkSync(request.file.path);

      return response.status(201).json(alunos);
    } catch (error) {
      // Remover o arquivo em caso de erro
      if (request.file.path) {
        fs.unlinkSync(request.file.path);
      }
      return response.status(400).json({ error: 'Erro ao importar alunos' });
    }
  }

  async downloadTemplate(request: CustomRequest, response: Response) {
    const templatePath = path.join(__dirname, '..', 'templates', 'alunos_template.xlsx');

    if (!fs.existsSync(templatePath)) {
      return response.status(404).json({ error: 'Template não encontrado' });
    }

    response.download(templatePath);
  }
}