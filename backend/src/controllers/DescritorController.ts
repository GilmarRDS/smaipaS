import { Request, Response } from 'express';
import { prisma } from '../lib/prisma';
import { RequestWithUsuario } from '../middlewares/auth';
import { Disciplina } from '@prisma/client';

export class DescritorController {
  async listarTodos(request: Request, response: Response) {
    try {
      const req = request as RequestWithUsuario;
      
      if (!req.usuario) {
        return response.status(401).json({ error: 'Usuário não autenticado' });
      }

      const descritores = await prisma.descritor.findMany({
        orderBy: {
          codigo: 'asc'
        }
      });

      return response.json(descritores);
    } catch (error) {
      console.error('Erro ao listar descritores:', error);
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

      const descritor = await prisma.descritor.findUnique({
        where: { id }
      });

      if (!descritor) {
        return response.status(404).json({ error: 'Descritor não encontrado' });
      }

      return response.json(descritor);
    } catch (error) {
      console.error('Erro ao buscar descritor por ID:', error);
      return response.status(500).json({ error: 'Erro interno do servidor' });
    }
  }

  async criar(request: Request, response: Response) {
    try {
      const req = request as RequestWithUsuario;
      const { codigo, descricao, disciplina, tipo, ano } = request.body;

      if (!req.usuario) {
        return response.status(401).json({ error: 'Usuário não autenticado' });
      }

      // Apenas usuários da secretaria podem criar descritores
      if (req.usuario.role !== 'secretaria') {
        return response.status(403).json({ error: 'Acesso negado' });
      }

      // Validação básica dos campos obrigatórios
      if (!codigo || !descricao || !disciplina || !tipo || !ano) {
        return response.status(400).json({ error: 'Todos os campos são obrigatórios' });
      }

      const descritor = await prisma.descritor.create({
        data: {
          codigo,
          descricao,
          disciplina,
          tipo,
          ano
        }
      });

      return response.status(201).json(descritor);
    } catch (error) {
      console.error('Erro ao criar descritor:', error);
      return response.status(500).json({ error: 'Erro interno do servidor' });
    }
  }

  async atualizar(request: Request, response: Response) {
    try {
      const req = request as RequestWithUsuario;
      const { id } = request.params;
      const { codigo, descricao, disciplina, tipo, ano } = request.body;

      if (!req.usuario) {
        return response.status(401).json({ error: 'Usuário não autenticado' });
      }

      // Apenas usuários da secretaria podem atualizar descritores
      if (req.usuario.role !== 'secretaria') {
        return response.status(403).json({ error: 'Acesso negado' });
      }

      // Validação básica dos campos obrigatórios
      if (!codigo || !descricao || !disciplina || !tipo || !ano) {
        return response.status(400).json({ error: 'Todos os campos são obrigatórios' });
      }

      // Verificar se o descritor existe
      const descritorExistente = await prisma.descritor.findUnique({
        where: { id }
      });

      if (!descritorExistente) {
        return response.status(404).json({ error: 'Descritor não encontrado' });
      }

      const descritor = await prisma.descritor.update({
        where: { id },
        data: {
          codigo,
          descricao,
          disciplina,
          tipo,
          ano
        }
      });

      return response.json(descritor);
    } catch (error) {
      console.error('Erro ao atualizar descritor:', error);
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

      // Apenas usuários da secretaria podem deletar descritores
      if (req.usuario.role !== 'secretaria') {
        return response.status(403).json({ error: 'Acesso negado' });
      }

      // Verificar se o descritor existe
      const descritorExistente = await prisma.descritor.findUnique({
        where: { id }
      });

      if (!descritorExistente) {
        return response.status(404).json({ error: 'Descritor não encontrado' });
      }

      await prisma.descritor.delete({
        where: { id }
      });

      return response.status(204).send();
    } catch (error) {
      console.error('Erro ao deletar descritor:', error);
      return response.status(500).json({ error: 'Erro interno do servidor' });
    }
  }

  async listarPorComponente(request: Request, response: Response) {
    try {
      const req = request as RequestWithUsuario;
      const { componente } = request.params;

      if (!req.usuario) {
        return response.status(401).json({ error: 'Usuário não autenticado' });
      }

      // Validar se o componente é uma disciplina válida
      if (!['PORTUGUES', 'MATEMATICA'].includes(componente.toUpperCase())) {
        return response.status(400).json({ error: 'Componente inválido' });
      }

      const descritores = await prisma.descritor.findMany({
        where: {
          disciplina: componente.toUpperCase() as Disciplina
        },
        orderBy: {
          codigo: 'asc'
        }
      });

      return response.json(descritores);
    } catch (error) {
      console.error('Erro ao listar descritores por componente:', error);
      return response.status(500).json({ error: 'Erro interno do servidor' });
    }
  }
} 