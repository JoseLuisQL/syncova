const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function cleanup() {
  try {
    const result = await prisma.loteVacuna.deleteMany({
      where: {
        numero: {
          startsWith: 'TEST-BALANCE-'
        }
      }
    });
    
    console.log(`Cleaned up ${result.count} test batches`);
  } catch (error) {
    console.error('Error cleaning up:', error);
  } finally {
    await prisma.$disconnect();
  }
}

cleanup();
