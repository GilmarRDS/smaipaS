import { Request, Response } from 'express';
import { prisma } from '../prisma';

export class DescritorController {
  async listar(req: Request, res: Response) {
    try {
      const descritores = await prisma.descritor.findMany();
      return res.json(descritores);
    } catch (error) {
      console.error('Erro ao listar descritores:', error);
      return res.status(500).json({ error: 'Erro ao listar descritores' });
    }
  }

  async obterPorId(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const descritor = await prisma.descritor.findUnique({
        where: { id },
      });

      if (!descritor) {
        return res.status(404).json({ error: 'Descritor não encontrado' });
      }

      return res.json(descritor);
    } catch (error) {
      console.error('Erro ao obter descritor:', error);
      return res.status(500).json({ error: 'Erro ao obter descritor' });
    }
  }

  async criar(req: Request, res: Response) {
    try {
      const { codigo, descricao, disciplina, tipo, ciclo } = req.body;

      const descritor = await prisma.descritor.create({
        data: {
          codigo,
          descricao,
          disciplina,
          tipo,
        },
      });

      return res.status(201).json(descritor);
    } catch (error) {
      console.error('Erro ao criar descritor:', error);
      return res.status(500).json({ error: 'Erro ao criar descritor' });
    }
  }

  async atualizar(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { codigo, descricao, disciplina, tipo, ciclo } = req.body;

      const descritor = await prisma.descritor.update({
        where: { id },
        data: {
          codigo,
          descricao,
          disciplina,
          tipo,
        },
      });

      return res.json(descritor);
    } catch (error) {
      console.error('Erro ao atualizar descritor:', error);
      return res.status(500).json({ error: 'Erro ao atualizar descritor' });
    }
  }

  async deletar(req: Request, res: Response) {
    try {
      const { id } = req.params;

      await prisma.descritor.delete({
        where: { id },
      });

      return res.status(204).send();
    } catch (error) {
      console.error('Erro ao deletar descritor:', error);
      return res.status(500).json({ error: 'Erro ao deletar descritor' });
    }
  }
} 