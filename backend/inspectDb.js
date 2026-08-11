const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function inspect() {
  try {
    const challans = await prisma.challan.findMany({
      where: {
        OR: [
          { totalAmount: { gt: 1000000 } }, // Catch huge amounts
          { items: { some: { qty: { gt: 100000 } } } } // Catch huge quantities
        ]
      },
      include: {
        items: true
      }
    });

    console.log(JSON.stringify(challans, null, 2));
  } catch (error) {
    console.error(error);
  } finally {
    await prisma.$disconnect();
  }
}

inspect();
