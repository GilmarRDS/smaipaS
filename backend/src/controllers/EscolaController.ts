import { Request, Response } from 'express';
import { prisma } from '../lib/prisma';

export class EscolaController {
  async criar(request: Request, response: Response) {
    try {
      const reqWithUser = request as Request & { usuario?: { id: string; role: string; escolaId?: string } };
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
      const reqWithUser = request as Request & { usuario?: { id: string; role: string; escolaId?: string } };
      // Se for um usuário da escola, só pode ver a própria escola
      if (request.usuario.role === 'escola') {
        const escola = await prisma.escola.findUnique({
          where: { id: request.usuario.escolaId },
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

        return response.json([escola]);
      }

      // Se for um usuário da secretaria, pode ver todas as escolas
      const escolas = await prisma.escola.findMany({
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

      return response.json(escolas);
    } catch (error) {
      console.error('Erro ao listar escolas:', error);
      return response.status(500).json({ error: 'Erro interno do servidor' });
    }
  }

  async buscarPorId(request: Request, response: Response) {
    try {
      const reqWithUser = request as Request & { usuario?: { id: string; role: string; escolaId?: string } };
      const { id } = request.params;

      // Se for um usuário da escola, só pode ver a própria escola
      if (request.usuario.role === 'escola' && id !== request.usuario.escolaId) {
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
      const reqWithUser = request as Request & { usuario?: { id: string; role: string; escolaId?: string } };
      const { id } = request.params;
      const { nome, inep, endereco, telefone, diretor } = request.body;

      // Validação básica dos campos obrigatórios
      if (!nome || !inep || !endereco || !telefone || !diretor) {
        return response.status(400).json({ error: 'Todos os campos são obrigatórios' });
      }

      // Se for um usuário da escola, só pode atualizar a própria escola
      if (request.usuario.role === 'escola' && id !== request.usuario.escolaId) {
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
      const reqWithUser = request as Request & { usuario?: { id: string; role: string; escolaId?: string } };
      const { id } = request.params;

      // Apenas usuários da secretaria podem deletar escolas
      if (request.usuario.role !== 'secretaria') {
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
}
