/**
 * Script de limpieza de base de datos de producción (SEGURO)
 * 
 * Solo elimina usuarios que NO tienen dependencias en:
 *   - ValeEntrega, Kardex, MovimientoVacuna, EntregaAdicional
 *   - PermisoOperativo (como creador)
 * 
 * Los usuarios CON dependencias se PRESERVAN intactos.
 * Relaciones con cascade (UsuarioCentroAcopio, PermisoOperativo del usuario)
 * y relaciones nullable (Alerta, IciDemidRegistro) se manejan automáticamente.
 * 
 * USO:
 *   Producción:  DATABASE_URL="postgresql://user:pass@host:5432/db" npx tsx scripts/clean-production-db.ts
 *   Local:       npx tsx scripts/clean-production-db.ts
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function cleanDatabase() {
  console.log('🔧 Script de limpieza de base de datos (MODO SEGURO)');
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
  console.log('');

  if (nonAdminUsers.length === 0) {
    console.log('✅ No hay usuarios no-admin para evaluar.');
  } else {
    // ========== PASO 2: Evaluar dependencias de cada usuario ==========
    console.log('🔍 Evaluando dependencias de cada usuario...\n');

    const usersToDelete: typeof nonAdminUsers = [];
    const usersToKeep: Array<typeof nonAdminUsers[0] & { dependencies: string[] }> = [];

    for (const user of nonAdminUsers) {
      const dependencies: string[] = [];

      // Verificar ValeEntrega
      const valeCount = await prisma.valeEntrega.count({ where: { usuarioId: user.id } });
      if (valeCount > 0) dependencies.push(`${valeCount} ValeEntrega`);

      // Verificar Kardex
      const kardexCount = await prisma.kardex.count({ where: { usuarioId: user.id } });
      if (kardexCount > 0) dependencies.push(`${kardexCount} Kardex`);

      // Verificar MovimientoVacuna
      const movCount = await prisma.movimientoVacuna.count({ where: { usuarioId: user.id } });
      if (movCount > 0) dependencies.push(`${movCount} MovimientoVacuna`);

      // Verificar EntregaAdicional
      const entregaCount = await prisma.entregaAdicional.count({ where: { usuarioId: user.id } });
      if (entregaCount > 0) dependencies.push(`${entregaCount} EntregaAdicional`);

      // Verificar PermisoOperativo como creador (creadoPorId - FK requerido sin cascade)
      const permisoCreadorCount = await prisma.permisoOperativo.count({ where: { creadoPorId: user.id } });
      if (permisoCreadorCount > 0) dependencies.push(`${permisoCreadorCount} PermisoOperativo (creador)`);

      if (dependencies.length > 0) {
        usersToKeep.push({ ...user, dependencies });
      } else {
        usersToDelete.push(user);
      }
    }

    // ========== Mostrar resultados del análisis ==========
    if (usersToKeep.length > 0) {
      console.log(`🛡️  Usuarios PROTEGIDOS (${usersToKeep.length}) - tienen dependencias:`);
      usersToKeep.forEach(u => {
        console.log(`   ✅ ${u.usuario} (${u.rol}) - ${u.nombres} ${u.apellidos}`);
        console.log(`      └─ ${u.dependencies.join(', ')}`);
      });
      console.log('');
    }

    if (usersToDelete.length > 0) {
      console.log(`🗑️  Usuarios a ELIMINAR (${usersToDelete.length}) - sin dependencias:`);
      usersToDelete.forEach(u => {
        console.log(`   - ${u.usuario} (${u.rol}) - ${u.nombres} ${u.apellidos}`);
      });
      console.log('');

      // ========== PASO 3: Eliminar usuarios sin dependencias ==========
      const deleteIds = usersToDelete.map(u => u.id);

      console.log('🧹 Limpiando registros seguros antes de eliminar...');

      // Alertas: FK opcional, simplemente desvincular
      const alertasUpdated = await prisma.alerta.updateMany({
        where: { usuarioId: { in: deleteIds } },
        data: { usuarioId: null }
      });
      if (alertasUpdated.count > 0) {
        console.log(`   ✅ Alertas desvinculadas: ${alertasUpdated.count}`);
      }

      // IciDemidRegistro: FK opcional con onDelete: SetNull, desvincular
      const iciUpdated = await prisma.iciDemidRegistro.updateMany({
        where: { usuarioId: { in: deleteIds } },
        data: { usuarioId: null }
      });
      if (iciUpdated.count > 0) {
        console.log(`   ✅ IciDemidRegistro desvinculados: ${iciUpdated.count}`);
      }

      // UsuarioCentroAcopio: tiene onDelete: Cascade, se elimina automáticamente
      // PermisoOperativo (como usuario): tiene onDelete: Cascade, se elimina automáticamente

      // Eliminar usuarios
      const usersDel = await prisma.usuario.deleteMany({
        where: { id: { in: deleteIds } }
      });
      console.log(`\n🗑️  Usuarios eliminados: ${usersDel.count}`);
    } else {
      console.log('ℹ️  Todos los usuarios no-admin tienen dependencias. No se eliminó ninguno.');
    }
  }

  // ========== PASO 4: Eliminar rol operador ==========
  console.log('\n🔐 Limpiando roles...');
  const operadorRole = await prisma.role.findUnique({ where: { codigo: 'operador' } });
  if (operadorRole) {
    // Verificar que ningún usuario use este rol antes de eliminarlo
    const usersWithOperador = await prisma.usuario.count({ where: { roleId: operadorRole.id } });
    if (usersWithOperador > 0) {
      console.log(`   ⚠️  Rol operador NO eliminado: ${usersWithOperador} usuario(s) aún lo usan`);
    } else {
      const permsDel = await prisma.rolePermission.deleteMany({ where: { roleId: operadorRole.id } });
      console.log(`   ✅ Permisos de operador eliminados: ${permsDel.count}`);
      await prisma.role.delete({ where: { codigo: 'operador' } });
      console.log('   ✅ Rol operador eliminado');
    }
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
