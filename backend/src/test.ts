import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function test() {
  try {
    const avaliacao = await prisma.avaliacao.create({
      data: {
        nome: 'Teste',
        tipo: 'DIAGNOSTICA_INICIAL',
        disciplina: 'PORTUGUES',
        ano: '1',
        dataAplicacao: new Date()
      }
    });
    console.log('Avaliação criada:', avaliacao);
  } catch (error) {
    console.error('Erro ao criar avaliação:', error);
  } finally {
    await prisma.$disconnect();
  }
}

test(); 