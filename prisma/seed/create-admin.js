const bcrypt = require('bcrypt');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
  const passwordHash = await bcrypt.hash('123456', 10);

  await prisma.user.upsert({
    where: { email: 'admin@torneo.com' },
    update: {
      name: 'Administrador',
      passwordHash,
      role: 'ADMIN',
    },
    create: {
      name: 'Administrador',
      email: 'admin@torneo.com',
      passwordHash,
      role: 'ADMIN',
    },
  });

  console.log('✅ Admin listo correctamente');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });