/**
 * Script de limpieza de base de datos de producción
 * 
 * Elimina todos los usuarios excepto 'admin' y el rol 'operador'.
 * Maneja correctamente las relaciones de foreign keys.
 * 
 * USO:
 *   Producción:  DATABASE_URL="postgresql://user:pass@host:5432/db" npx tsx scripts/clean-production-db.ts
 *   Local:       npx tsx scripts/clean-production-db.ts
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function cleanDatabase() {
  console.log('🔧 Script de limpieza de base de datos');
  console.log('📌 DATABASE_URL:', process.env.DATABASE_URL?.replace(/\/\/.*@/, '//*****@') || 'No definida');
  console.log('');

  // ========== PASO 1: Verificar estado actual ==========
  const totalUsuarios = await prisma.usuario.count();
  const adminExists = await prisma.usuario.findFirst({ where: { usuario: 'admin' } });

  if (!adminExists) {
    console.error('❌ No se encontró el usuario admin. Abortando para evitar eliminar todos los usuarios.');
    await prisma.$disconnect();
    process.exit(1);
  }

  const nonAdminUsers = await prisma.usuario.findMany({
    where: { usuario: { not: 'admin' } },
    select: { id: true, usuario: true, rol: true, nombres: true, apellidos: true }
  });

  console.log(`📊 Estado actual: ${totalUsuarios} usuarios totales`);
  console.log(`👤 Admin: ${adminExists.nombres} ${adminExists.apellidos} (${adminExists.email})`);
  console.log(`🗑️  Usuarios a eliminar (${nonAdminUsers.length}):`);
  nonAdminUsers.forEach(u => console.log(`   - ${u.usuario} (${u.rol}) - ${u.nombres} ${u.apellidos}`));
  console.log('');

  if (nonAdminUsers.length === 0) {
    console.log('✅ No hay usuarios no-admin para eliminar.');
  } else {
    const nonAdminIds = nonAdminUsers.map(u => u.id);

    // ========== PASO 2: Eliminar registros dependientes ==========
    console.log('🧹 Eliminando registros dependientes...');

    // 2a. ValeDetalle (hijo de ValeEntrega)
    const vales = await prisma.valeEntrega.findMany({
      where: { usuarioId: { in: nonAdminIds } },
      select: { id: true }
    });
    if (vales.length > 0) {
      const valeIds = vales.map(v => v.id);
      const valeDetDel = await prisma.valeDetalle.deleteMany({ where: { valeEntregaId: { in: valeIds } } });
      console.log(`   ✅ ValeDetalle eliminados: ${valeDetDel.count}`);
    }

    // 2b. ValeEntrega
    const valeDel = await prisma.valeEntrega.deleteMany({ where: { usuarioId: { in: nonAdminIds } } });
    console.log(`   ✅ ValeEntrega eliminados: ${valeDel.count}`);

    // 2c. EntregaAdicional
    const entregaDel = await prisma.entregaAdicional.deleteMany({ where: { usuarioId: { in: nonAdminIds } } });
    console.log(`   ✅ EntregaAdicional eliminados: ${entregaDel.count}`);

    // 2d. Kardex
    const kardexDel = await prisma.kardex.deleteMany({ where: { usuarioId: { in: nonAdminIds } } });
    console.log(`   ✅ Kardex eliminados: ${kardexDel.count}`);

    // 2e. MovimientoVacuna
    const movDel = await prisma.movimientoVacuna.deleteMany({ where: { usuarioId: { in: nonAdminIds } } });
    console.log(`   ✅ MovimientoVacuna eliminados: ${movDel.count}`);

    // ========== PASO 3: Eliminar usuarios ==========
    const usersDel = await prisma.usuario.deleteMany({ where: { usuario: { not: 'admin' } } });
    console.log(`\n🗑️  Usuarios eliminados: ${usersDel.count}`);
  }

  // ========== PASO 4: Eliminar rol operador ==========
  console.log('\n🔐 Limpiando roles...');
  const operadorRole = await prisma.role.findUnique({ where: { codigo: 'operador' } });
  if (operadorRole) {
    const permsDel = await prisma.rolePermission.deleteMany({ where: { roleId: operadorRole.id } });
    console.log(`   ✅ Permisos de operador eliminados: ${permsDel.count}`);
    await prisma.role.delete({ where: { codigo: 'operador' } });
    console.log('   ✅ Rol operador eliminado');
  } else {
    console.log('   ℹ️  Rol operador no encontrado (ya fue eliminado)');
  }

  // ========== PASO 5: Verificación final ==========
  console.log('\n' + '='.repeat(50));
  console.log('📊 ESTADO FINAL DE LA BASE DE DATOS');
  console.log('='.repeat(50));

  const finalUsers = await prisma.usuario.findMany({
    select: { usuario: true, rol: true, nombres: true, apellidos: true, email: true }
  });
  console.log(`\n👤 Usuarios (${finalUsers.length}):`);
  finalUsers.forEach(u => console.log(`   ✅ ${u.usuario} | ${u.rol} | ${u.nombres} ${u.apellidos} | ${u.email}`));

  const finalRoles = await prisma.role.findMany({ select: { nombre: true, codigo: true } });
  console.log(`\n🔐 Roles (${finalRoles.length}):`);
  finalRoles.forEach(r => console.log(`   ✅ ${r.nombre} (${r.codigo})`));

  console.log('\n🎉 Limpieza completada exitosamente!');
  await prisma.$disconnect();
}

cleanDatabase().catch(async (e) => {
  console.error('❌ Error durante la limpieza:', e);
  await prisma.$disconnect();
  process.exit(1);
});
