import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  const passwordHash = await bcrypt.hash('Password123', 10);

  const users = [
    { name: 'Admin User',     email: 'admin@erp.com',     role: 'ADMIN'     as const },
    { name: 'Sales User',     email: 'sales@erp.com',     role: 'SALES'     as const },
    { name: 'Warehouse User', email: 'warehouse@erp.com', role: 'WAREHOUSE' as const },
    { name: 'Accounts User',  email: 'accounts@erp.com',  role: 'ACCOUNTS'  as const },
  ];

  for (const user of users) {
    await prisma.user.upsert({
      where: { email: user.email },
      update: {},
      create: {
        name: user.name,
        email: user.email,
        password: passwordHash,
        role: user.role,
      },
    });
    console.log(`  ✅ ${user.role}: ${user.email} / Password123`);
  }

  console.log('\n🎉 Seed complete!');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
