import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function migrarCodigosVacunas() {
  console.log('🚀 Iniciando migración y separación de códigos de vacunas...');

  try {
    // 1. Asegurar que la columna existe en la base de datos PostgreSQL
    console.log('1️⃣ Asegurando existencia de columna codigo en vacunas...');
    await prisma.$executeRawUnsafe(`
      ALTER TABLE "vacunas" ADD COLUMN IF NOT EXISTS "codigo" VARCHAR(50);
    `);
    await prisma.$executeRawUnsafe(`
      CREATE INDEX IF NOT EXISTS "idx_vacunas_codigo" ON "vacunas"("codigo");
    `);
    console.log('✅ Columna e índice verificados');

    // 2. Obtener todas las vacunas actuales
    const vacunas: Array<{ id: string; nombre: string; codigo?: string | null }> =
      await prisma.$queryRawUnsafe(`
        SELECT id, nombre, codigo FROM "vacunas" ORDER BY nombre ASC;
      `);

    console.log(`📋 Total de vacunas encontradas: ${vacunas.length}`);

    let actualizadas = 0;

    for (const v of vacunas) {
      const nombreActual = v.nombre.trim();
      let codigoExtraido: string | null = v.codigo || null;
      let nuevoNombre: string = nombreActual;

      // Patrón 1: "02541 - AMA" o "02541-AMA" o "COD123: Pentavalente"
      const matchGuion = nombreActual.match(/^([A-Za-z0-9_\-]+)\s*[-:]\s*(.+)$/);
      if (matchGuion && (!codigoExtraido || codigoExtraido.trim() === '')) {
        // Verificar si la primera parte parece código (número o siglas cortas como 02541, COD123, etc.)
        const candidataCodigo = matchGuion[1].trim();
        const candidataNombre = matchGuion[2].trim();

        // Si el primer bloque tiene números o es un código claro
        if (/\d/.test(candidataCodigo) || candidataCodigo.length <= 10) {
          codigoExtraido = candidataCodigo;
          nuevoNombre = candidataNombre;
        }
      }

      // Patrón 2: "[02541] AMA" o "(02541) AMA"
      const matchCorchetes = nombreActual.match(/^[\[\(]([A-Za-z0-9_\-]+)[\]\)]\s*(.+)$/);
      if (matchCorchetes && (!codigoExtraido || codigoExtraido.trim() === '')) {
        codigoExtraido = matchCorchetes[1].trim();
        nuevoNombre = matchCorchetes[2].trim();
      }

      // Si se extrajo un código o cambió el nombre
      if (codigoExtraido !== v.codigo || nuevoNombre !== nombreActual) {
        console.log(`🔄 Actualizando vacuna ID ${v.id}:`);
        console.log(`   Nombre anterior: "${nombreActual}"`);
        console.log(`   Nuevo nombre:    "${nuevoNombre}"`);
        console.log(`   Código asignado: "${codigoExtraido}"`);

        await prisma.$executeRawUnsafe(
          `UPDATE "vacunas" SET "nombre" = $1, "codigo" = $2, "updated_at" = NOW() WHERE "id"::text = $3`,
          nuevoNombre,
          codigoExtraido,
          v.id
        );
        actualizadas++;
      }
    }

    console.log(`🎉 Migración completada exitosamente. Vacunas actualizadas: ${actualizadas}/${vacunas.length}`);

    // Mostrar estado actual de vacunas
    const vacunasFinales: Array<{ id: string; nombre: string; codigo?: string | null }> =
      await prisma.$queryRawUnsafe(`
        SELECT id, nombre, codigo FROM "vacunas" ORDER BY nombre ASC;
      `);
    console.log('\n📊 Estado resultante de vacunas:');
    vacunasFinales.forEach((vf, idx) => {
      console.log(`  ${idx + 1}. [${vf.codigo || 'SIN CÓDIGO'}] ${vf.nombre}`);
    });

  } catch (error) {
    console.error('❌ Error durante la migración de vacunas:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

migrarCodigosVacunas();
