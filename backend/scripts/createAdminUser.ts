import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function createAdminUser() {
  const email = 'admin@smaipa.com';
  const password = 'admin123';
  const role = 'secretaria';

  // Check if admin user already exists
  const existingUser = await prisma.usuario.findUnique({
    where: { email },
  });

  if (existingUser) {
    console.log('Usuário admin já existe. Atualizando senha...');
    const hashedPassword = await bcrypt.hash(password, 10);
    await prisma.usuario.update({
      where: { email },
      data: { senha: hashedPassword, role },
    });
    console.log('Senha do usuário admin atualizada com sucesso.');
  } else {
    console.log('Criando usuário admin...');
    const hashedPassword = await bcrypt.hash(password, 10);
    await prisma.usuario.create({
      data: {
        nome: 'Administrador',
        email,
        senha: hashedPassword,
        role,
      },
    });
    console.log('Usuário admin criado com sucesso.');
  }
}

createAdminUser()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
