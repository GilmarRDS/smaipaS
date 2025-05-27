import { Request, Response } from 'express';
import { prisma, Prisma } from '../lib/prisma';
import { RequestWithUsuario } from '../middlewares/auth';

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
      const { codigo, descricao, disciplina, tipo } = request.body;

      if (!req.usuario) {
        return response.status(401).json({ error: 'Usuário não autenticado' });
      }

      // Apenas usuários da secretaria podem criar descritores
      if (req.usuario.role !== 'secretaria') {
        return response.status(403).json({ error: 'Acesso negado' });
      }

      // Validação básica dos campos obrigatórios
      if (!codigo || !descricao || !disciplina || !tipo) {
        return response.status(400).json({ error: 'Todos os campos são obrigatórios' });
      }

      // Verificar se o descritor já existe pelo código
      const descritorExistente = await prisma.descritor.findFirst({
        where: { codigo }
      });

      if (descritorExistente) {
        return response.status(400).json({ error: 'Descritor com este código já cadastrado' });
      }

      // Mapear o valor do tipo para o enum TipoAvaliacao
      const tipoMap: { [key: string]: Prisma.TipoAvaliacao } = {
        'DIAGNOSTICA_INICIAL': Prisma.TipoAvaliacao.DIAGNOSTICA_INICIAL,
        'DIAGNOSTICA_FINAL': Prisma.TipoAvaliacao.DIAGNOSTICA_FINAL,
        'CONCEITO': Prisma.TipoAvaliacao.DIAGNOSTICA_INICIAL // Mapeamento padrão para valores inválidos
      };

      const tipoEnum: Prisma.TipoAvaliacao = tipoMap[tipo.toUpperCase()] || Prisma.TipoAvaliacao.DIAGNOSTICA_INICIAL;

      // Função para remover acentos e normalizar string
      function normalizeString(str: string): string {
        return str.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toUpperCase();
      }

      const disciplinaEnum: Prisma.Disciplina = normalizeString(disciplina) as Prisma.Disciplina;

      const descritor = await prisma.descritor.create({
        data: {
          codigo,
          descricao,
          disciplina: disciplinaEnum,
          tipo: tipoEnum
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
      const { codigo, descricao, disciplina, tipo } = request.body;

      if (!req.usuario) {
        return response.status(401).json({ error: 'Usuário não autenticado' });
      }

      // Apenas usuários da secretaria podem atualizar descritores
      if (req.usuario.role !== 'secretaria') {
        return response.status(403).json({ error: 'Acesso negado' });
      }

      // Validação básica dos campos obrigatórios
      if (!codigo || !descricao || !disciplina || !tipo) {
        return response.status(400).json({ error: 'Todos os campos são obrigatórios' });
      }

      // Verificar se o descritor existe
      const descritorExistente = await prisma.descritor.findUnique({
        where: { id }
      });

      if (!descritorExistente) {
        return response.status(404).json({ error: 'Descritor não encontrado' });
      }

      // Verificar se o código já está em uso por outro descritor
      if (codigo !== descritorExistente.codigo) {
        const codigoEmUso = await prisma.descritor.findFirst({
          where: { codigo }
        });

        if (codigoEmUso) {
          return response.status(400).json({ error: 'Código já cadastrado' });
        }
      }

      const disciplinaEnum: Prisma.Disciplina = normalizeString(disciplina) as Prisma.Disciplina;

      const descritor = await prisma.descritor.update({
        where: { id },
        data: {
          codigo,
          descricao,
          disciplina: disciplinaEnum,
          tipo
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

  // Função para remover acentos e normalizar string
  private normalizeString(str: string): string {
    return str.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toUpperCase();
  }

  async atualizar(request: Request, response: Response) {
    try {
      const req = request as RequestWithUsuario;
      const { id } = request.params;
      const { codigo, descricao, disciplina, tipo } = request.body;

      if (!req.usuario) {
        return response.status(401).json({ error: 'Usuário não autenticado' });
      }

      // Apenas usuários da secretaria podem atualizar descritores
      if (req.usuario.role !== 'secretaria') {
        return response.status(403).json({ error: 'Acesso negado' });
      }

      // Validação básica dos campos obrigatórios
      if (!codigo || !descricao || !disciplina || !tipo) {
        return response.status(400).json({ error: 'Todos os campos são obrigatórios' });
      }

      // Verificar se o descritor existe
      const descritorExistente = await prisma.descritor.findUnique({
        where: { id }
      });

      if (!descritorExistente) {
        return response.status(404).json({ error: 'Descritor não encontrado' });
      }

      // Verificar se o código já está em uso por outro descritor
      if (codigo !== descritorExistente.codigo) {
        const codigoEmUso = await prisma.descritor.findFirst({
          where: { codigo }
        });

        if (codigoEmUso) {
          return response.status(400).json({ error: 'Código já cadastrado' });
        }
      }

      const disciplinaEnum: Prisma.Disciplina = this.normalizeString(disciplina) as Prisma.Disciplina;

      // Mapear o valor do tipo para o enum TipoAvaliacao
      const tipoMap: { [key: string]: Prisma.TipoAvaliacao } = {
        'DIAGNOSTICA_INICIAL': Prisma.TipoAvaliacao.DIAGNOSTICA_INICIAL,
        'DIAGNOSTICA_FINAL': Prisma.TipoAvaliacao.DIAGNOSTICA_FINAL,
        'CONCEITO': Prisma.TipoAvaliacao.DIAGNOSTICA_INICIAL // Mapeamento padrão para valores inválidos
      };

      const tipoEnum: Prisma.TipoAvaliacao = tipoMap[tipo.toUpperCase()] || Prisma.TipoAvaliacao.DIAGNOSTICA_INICIAL;

      const descritor = await prisma.descritor.update({
        where: { id },
        data: {
          codigo,
          descricao,
          disciplina: disciplinaEnum,
          tipo: tipoEnum
        }
      });

      return response.json(descritor);
    } catch (error) {
      console.error('Erro ao atualizar descritor:', error);
      return response.status(500).json({ error: 'Erro interno do servidor' });
    }
  }
}
