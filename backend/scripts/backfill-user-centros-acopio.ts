import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const usuarios = await prisma.usuario.findMany({
    where: {
      centroAcopioId: { not: null },
    },
    select: {
      id: true,
      centroAcopioId: true,
    },
  });

  let synced = 0;

  for (const usuario of usuarios) {
    if (!usuario.centroAcopioId) continue;

    await prisma.usuarioCentroAcopio.upsert({
      where: {
        uk_usuario_centro_acopio: {
          usuarioId: usuario.id,
          centroAcopioId: usuario.centroAcopioId,
        },
      },
      update: {},
      create: {
        usuarioId: usuario.id,
        centroAcopioId: usuario.centroAcopioId,
      },
    });

    synced += 1;
  }

  console.log(`Usuarios sincronizados con centros de acopio asignados: ${synced}`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
