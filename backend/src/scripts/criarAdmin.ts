import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function criarAdmin() {
  try {
    console.log('Iniciando criação do usuário admin...');
    
    // Verificar se já existe um usuário admin
    const adminExistente = await prisma.usuario.findFirst({
      where: {
        role: 'secretaria',
      },
    });

    if (adminExistente) {
      console.log('Usuário admin já existe:');
      console.log('Email:', adminExistente.email);
      console.log('Nome:', adminExistente.nome);
      console.log('Role:', adminExistente.role);
      return;
    }

    console.log('Criando novo usuário admin...');
    
    // Criar usuário admin
    const senhaHash = await bcrypt.hash('admin123', 10);
    const admin = await prisma.usuario.create({
      data: {
        nome: 'Administrador',
        email: 'admin@smaipa.com',
        senha: senhaHash,
        role: 'secretaria',
      },
    });

    console.log('Usuário admin criado com sucesso:');
    console.log('Email:', admin.email);
    console.log('Nome:', admin.nome);
    console.log('Role:', admin.role);
  } catch (error) {
    console.error('Erro ao criar usuário admin:', error);
  } finally {
    await prisma.$disconnect();
  }
}

criarAdmin(); 