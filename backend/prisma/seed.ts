import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  // Criar escola
  const escola = await prisma.escola.create({
    data: {
      nome: 'Escola Exemplo',
      inep: '12345678',
      endereco: 'Rua Exemplo, 123',
      telefone: '(11) 1234-5678',
      diretor: 'Nome do Diretor',
    },
  });

  // Criar usuário da secretaria
  const senhaSecretaria = await bcrypt.hash('admin123', 10);
  await prisma.usuario.create({
    data: {
      nome: 'Administrador',
      email: 'semed.ti1@gmail.com',
      senha: senhaSecretaria,
      role: 'secretaria',
    },
  });

  // Criar usuário da escola
  const senhaEscola = await bcrypt.hash('escola123', 10);
  await prisma.usuario.create({
    data: {
      nome: 'Usuário Escola',
      email: 'escola@smaipa.com',
      senha: senhaEscola,
      role: 'escola',
      escolaId: escola.id,
    },
  });

  console.log('Dados iniciais criados com sucesso!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  }); 