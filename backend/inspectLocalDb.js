const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkLocal() {
  const challans = await prisma.challan.findMany({
    where: {
      challanNo: {
        in: ['CHL-2026-0008', 'CHL-2026-0009', 'CHL-2026-0015']
      }
    }
  });
  console.log('Local challans found:', challans.length);
  console.log(challans);
  await prisma.$disconnect();
}
checkLocal();
