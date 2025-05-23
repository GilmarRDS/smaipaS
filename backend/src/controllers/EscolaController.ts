import { Request, Response } from 'express';
import { prisma } from '../lib/prisma';
import { RequestWithUsuario } from '../middlewares/auth';

export class EscolaController {
  async criar(request: Request, response: Response) {
    try {
      const req = request as RequestWithUsuario;
      const { nome, inep, endereco, telefone, diretor } = request.body;

      // Validação básica dos campos obrigatórios
      if (!nome || !inep || !endereco || !telefone || !diretor) {
        return response.status(400).json({ error: 'Todos os campos são obrigatórios' });
      }

      // Verificar se a escola já existe pelo INEP
      const escolaExistente = await prisma.escola.findUnique({
        where: { inep },
      });

      if (escolaExistente) {
        return response.status(400).json({ error: 'Escola com este INEP já cadastrada' });
      }

      const escola = await prisma.escola.create({
        data: {
          nome,
          inep,
          endereco,
          telefone,
          diretor,
        },
      });

      return response.status(201).json(escola);
    } catch (error) {
      console.error('Erro ao criar escola:', error);
      return response.status(500).json({ error: 'Erro interno do servidor' });
    }
  }

  async listarTodas(request: Request, response: Response) {
    try {
      const req = request as RequestWithUsuario;
      
      if (!req.usuario) {
        return response.status(401).json({ error: 'Usuário não autenticado' });
      }

      // Se for um usuário da escola, só pode ver a própria escola
      if (req.usuario.role === 'escola') {
        const escola = await prisma.escola.findUnique({
          where: { id: req.usuario.escolaId },
          include: {
            usuarios: {
              select: {
                id: true,
                nome: true,
                email: true,
                role: true,
              },
            },
            turmas: {
              select: {
                id: true,
                nome: true,
                ano: true,
              },
              orderBy: {
                ano: 'asc'
              }
            },
          },
        });

        if (!escola) {
          return response.status(404).json({ error: 'Escola não encontrada' });
        }

        return response.json([escola]);
      }

      // Se for um usuário da secretaria, pode ver todas as escolas
      const escolas = await prisma.escola.findMany({
        orderBy: {
          nome: 'asc'
        },
        include: {
          usuarios: {
            select: {
              id: true,
              nome: true,
              email: true,
              role: true,
            },
          },
          turmas: {
            select: {
              id: true,
              nome: true,
              ano: true,
            },
            orderBy: {
              ano: 'asc'
            }
          },
        },
      });

      return response.json(escolas);
    } catch (error) {
      console.error('Erro ao listar escolas:', error);
      return response.status(500).json({ error: 'Erro interno do servidor' });
    }
  }

  async buscarPorId(request: Request, response: Response) {
    try {
      const req = request as RequestWithUsuario;
      const { id } = request.params;

      if (!req.usuario) {
        return response.status(401).json({ error: 'Usuário não autenticado' });
      }

      // Se for um usuário da escola, só pode ver a própria escola
      if (req.usuario.role === 'escola' && id !== req.usuario.escolaId) {
        return response.status(403).json({ error: 'Acesso negado' });
      }

      const escola = await prisma.escola.findUnique({
        where: { id },
        include: {
          usuarios: {
            select: {
              id: true,
              nome: true,
              email: true,
              role: true,
            },
          },
          turmas: {
            select: {
              id: true,
              nome: true,
              ano: true,
            },
          },
        },
      });

      if (!escola) {
        return response.status(404).json({ error: 'Escola não encontrada' });
      }

      return response.json(escola);
    } catch (error) {
      console.error('Erro ao buscar escola por ID:', error);
      return response.status(500).json({ error: 'Erro interno do servidor' });
    }
  }

  async atualizar(request: Request, response: Response) {
    try {
      const req = request as RequestWithUsuario;
      const { id } = request.params;
      const { nome, inep, endereco, telefone, diretor } = request.body;

      if (!req.usuario) {
        return response.status(401).json({ error: 'Usuário não autenticado' });
      }

      // Validação básica dos campos obrigatórios
      if (!nome || !inep || !endereco || !telefone || !diretor) {
        return response.status(400).json({ error: 'Todos os campos são obrigatórios' });
      }

      // Se for um usuário da escola, só pode atualizar a própria escola
      if (req.usuario.role === 'escola' && id !== req.usuario.escolaId) {
        return response.status(403).json({ error: 'Acesso negado' });
      }

      // Verificar se a escola existe
      const escolaExistente = await prisma.escola.findUnique({
        where: { id },
      });

      if (!escolaExistente) {
        return response.status(404).json({ error: 'Escola não encontrada' });
      }

      // Verificar se o INEP já está em uso por outra escola
      if (inep !== escolaExistente.inep) {
        const inepEmUso = await prisma.escola.findUnique({
          where: { inep },
        });

        if (inepEmUso) {
          return response.status(400).json({ error: 'INEP já cadastrado' });
        }
      }

      const escola = await prisma.escola.update({
        where: { id },
        data: {
          nome,
          inep,
          endereco,
          telefone,
          diretor,
        },
        include: {
          usuarios: {
            select: {
              id: true,
              nome: true,
              email: true,
              role: true,
            },
          },
          turmas: {
            select: {
              id: true,
              nome: true,
              ano: true,
            },
          },
        },
      });

      return response.json(escola);
    } catch (error) {
      console.error('Erro ao atualizar escola:', error);
      return response.status(500).json({ error: 'Erro interno do servidor' });
    }
  }

  async deletar(request: Request, response: Response) {
    try {
      const req = request as RequestWithUsuario;
      const { id } = request.params;

      if (!req.usuario) {
        return response.status(401).json({ error: 'Usuário não autenticado' });
      }

      // Se for um usuário da escola, só pode deletar a própria escola
      if (req.usuario.role === 'escola' && id !== req.usuario.escolaId) {
        return response.status(403).json({ error: 'Acesso negado' });
      }

      // Verificar se a escola existe
      const escolaExistente = await prisma.escola.findUnique({
        where: { id },
      });

      if (!escolaExistente) {
        return response.status(404).json({ error: 'Escola não encontrada' });
      }

      await prisma.escola.delete({
        where: { id },
      });

      return response.status(204).send();
    } catch (error) {
      console.error('Erro ao deletar escola:', error);
      return response.status(500).json({ error: 'Erro interno do servidor' });
    }
  }

  async listarTurmas(request: Request, response: Response) {
    try {
      const req = request as RequestWithUsuario;
      const { id } = request.params;

      if (!req.usuario) {
        return response.status(401).json({ error: 'Usuário não autenticado' });
      }

      // Se for um usuário da escola, só pode ver as turmas da própria escola
      if (req.usuario.role === 'escola' && id !== req.usuario.escolaId) {
        return response.status(403).json({ error: 'Acesso negado' });
      }

      const turmas = await prisma.turma.findMany({
        where: { escolaId: id },
        orderBy: {
          ano: 'asc'
        },
        include: {
          alunos: {
            select: {
              id: true,
              nome: true,
              matricula: true,
            },
            orderBy: {
              nome: 'asc'
            }
          },
        },
      });

      return response.json(turmas);
    } catch (error) {
      console.error('Erro ao listar turmas da escola:', error);
      return response.status(500).json({ error: 'Erro interno do servidor' });
    }
  }
}
