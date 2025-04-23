import { Request, Response } from 'express';
import { prisma } from '../lib/prisma';
import { Prisma } from '@prisma/client';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

export class UsuarioController {
  async criar(request: Request, response: Response) {
    const { nome, email, senha, role, escolaId } = request.body;

    // Verificar se o usuário já existe
    const usuarioExistente = await prisma.usuario.findUnique({
      where: { email },
    });

    if (usuarioExistente) {
      return response.status(400).json({ error: 'E-mail já cadastrado' });
    }

    // Verificar se a escola existe, se for um usuário do tipo escola
    if (role === 'escola' && escolaId) {
      const escola = await prisma.escola.findUnique({
        where: { id: escolaId },
      });

      if (!escola) {
        return response.status(400).json({ error: 'Escola não encontrada' });
      }
    }

    const senhaHash = await bcrypt.hash(senha, 10);

    const usuario = await prisma.usuario.create({
      data: {
        nome,
        email,
        senha: senhaHash,
        role,
        escolaId,
      },
      include: {
        escola: true,
      },
    });

    const { senha: _, ...usuarioSemSenha } = usuario;

    return response.status(201).json(usuarioSemSenha);
  }

  async listarTodos(request: Request, response: Response) {
    // Se for um usuário da escola, só pode ver os usuários da própria escola
    if (request.usuario.role === 'escola') {
      const usuarios = await prisma.usuario.findMany({
        where: { escolaId: request.usuario.escolaId },
        select: {
          id: true,
          nome: true,
          email: true,
          role: true,
          escolaId: true,
          escola: {
            select: {
              id: true,
              nome: true,
            },
          },
        },
      });

      return response.json(usuarios);
    }

    // Se for um usuário da secretaria, pode ver todos os usuários
    const usuarios = await prisma.usuario.findMany({
      select: {
        id: true,
        nome: true,
        email: true,
        role: true,
        escolaId: true,
        escola: {
          select: {
            id: true,
            nome: true,
          },
        },
      },
    });

    return response.json(usuarios);
  }

  async buscarPorId(request: Request, response: Response) {
    const { id } = request.params;

    // Se for um usuário da escola, só pode ver usuários da própria escola
    if (request.usuario.role === 'escola') {
      const usuario = await prisma.usuario.findFirst({
        where: { 
          id,
          escolaId: request.usuario.escolaId,
        },
        select: {
          id: true,
          nome: true,
          email: true,
          role: true,
          escolaId: true,
          escola: {
            select: {
              id: true,
              nome: true,
            },
          },
        },
      });

      if (!usuario) {
        return response.status(404).json({ error: 'Usuário não encontrado' });
      }

      return response.json(usuario);
    }

    // Se for um usuário da secretaria, pode ver qualquer usuário
    const usuario = await prisma.usuario.findUnique({
      where: { id },
      select: {
        id: true,
        nome: true,
        email: true,
        role: true,
        escolaId: true,
        escola: {
          select: {
            id: true,
            nome: true,
          },
        },
      },
    });

    if (!usuario) {
      return response.status(404).json({ error: 'Usuário não encontrado' });
    }

    return response.json(usuario);
  }

  async atualizar(request: Request, response: Response) {
    const { id } = request.params;
    const { nome, email, senha, role, escolaId } = request.body;

    // Verificar se o usuário existe
    const usuarioExistente = await prisma.usuario.findUnique({
      where: { id },
    });

    if (!usuarioExistente) {
      return response.status(404).json({ error: 'Usuário não encontrado' });
    }

    // Se for um usuário da escola, só pode atualizar usuários da própria escola
    if (request.usuario.role === 'escola' && usuarioExistente.escolaId !== request.usuario.escolaId) {
      return response.status(403).json({ error: 'Acesso negado' });
    }

    // Verificar se o e-mail já está em uso por outro usuário
    if (email !== usuarioExistente.email) {
      const emailEmUso = await prisma.usuario.findUnique({
        where: { email },
      });

      if (emailEmUso) {
        return response.status(400).json({ error: 'E-mail já cadastrado' });
      }
    }

    // Verificar se a escola existe, se for um usuário do tipo escola
    if (role === 'escola' && escolaId) {
      const escola = await prisma.escola.findUnique({
        where: { id: escolaId },
      });

      if (!escola) {
        return response.status(400).json({ error: 'Escola não encontrada' });
      }
    }

    // Criando um objeto para a atualização usando tipagem segura
    const data: Prisma.UsuarioUncheckedUpdateInput = {
      nome,
      email,
      role,
      escolaId,
    };

    if (senha) {
      data.senha = await bcrypt.hash(senha, 10);
    }

    const usuario = await prisma.usuario.update({
      where: { id },
      data,
      select: {
        id: true,
        nome: true,
        email: true,
        role: true,
        escolaId: true,
        escola: {
          select: {
            id: true,
            nome: true,
          },
        },
      },
    });

    return response.json(usuario);
  }

  async deletar(request: Request, response: Response) {
    const { id } = request.params;

    // Verificar se o usuário existe
    const usuarioExistente = await prisma.usuario.findUnique({
      where: { id },
    });

    if (!usuarioExistente) {
      return response.status(404).json({ error: 'Usuário não encontrado' });
    }

    // Se for um usuário da escola, só pode deletar usuários da própria escola
    if (request.usuario.role === 'escola' && usuarioExistente.escolaId !== request.usuario.escolaId) {
      return response.status(403).json({ error: 'Acesso negado' });
    }

    await prisma.usuario.delete({
      where: { id },
    });

    return response.status(204).send();
  }

  async login(request: Request, response: Response) {
    const { email, senha } = request.body;

    const usuario = await prisma.usuario.findUnique({
      where: { email },
      include: {
        escola: true,
      },
    });

    if (!usuario) {
      return response.status(401).json({ error: 'Credenciais inválidas' });
    }

    const senhaValida = await bcrypt.compare(senha, usuario.senha);

    if (!senhaValida) {
      return response.status(401).json({ error: 'Credenciais inválidas' });
    }

    const { senha: _, ...usuarioSemSenha } = usuario;

    const token = jwt.sign(
      {
        id: usuario.id,
        role: usuario.role,
        escolaId: usuario.escolaId,
      },
      process.env.JWT_SECRET || 'smaipa-secret',
      {
        subject: usuario.id,
        expiresIn: '1d',
      }
    );

    return response.json({
      usuario: usuarioSemSenha,
      token,
    });
  }
}
