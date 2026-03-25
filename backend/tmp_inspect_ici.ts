import { prisma } from './src/config/database';

async function main() {
  const rows = await prisma.iciDemidRegistro.findMany({
    where: { anio: 2026 },
    orderBy: { updatedAt: 'desc' },
    take: 20,
    select: {
      establecimientoId: true,
      vacunaId: true,
      anio: true,
      distribucionMensual: true,
      mesesDisponibles: true,
      establecimiento: { select: { nombre: true } },
      vacuna: { select: { nombre: true } },
    },
  });
  console.log(JSON.stringify(rows, null, 2));
  const countWithFeb = await prisma.iciDemidRegistro.count({
    where: {
      anio: 2026,
      mesesDisponibles: {
        has: 2,
      },
    },
  });
  console.log('countWithFeb=', countWithFeb);
}

main()
  .finally(async () => {
    await prisma.$disconnect();
  });
