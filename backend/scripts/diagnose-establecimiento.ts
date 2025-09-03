import { PrismaClient } from '@prisma/client';
import { AlmacenCentralService } from '../src/services/AlmacenCentralService';

const prisma = new PrismaClient();

async function diagnosticarEstablecimiento() {
  try {
    console.log('🔍 Diagnosticando problema de establecimiento...\n');

    // 1. Verificar establecimientos existentes
    console.log('1️⃣ Verificando establecimientos existentes:');
    const establecimientos = await prisma.establecimiento.findMany({
      select: {
        id: true,
        nombre: true,
        codigo: true,
        tipo: true,
        estado: true
      }
    });

    console.log(`📊 Total de establecimientos: ${establecimientos.length}`);
    establecimientos.forEach(est => {
      console.log(`  - ${est.nombre} (${est.codigo}) - Tipo: ${est.tipo} - Estado: ${est.estado} - ID: ${est.id}`);
    });

    // 2. Verificar centros de acopio
    console.log('\n2️⃣ Verificando centros de acopio:');
    const centrosAcopio = await prisma.centroAcopio.findMany({
      select: {
        id: true,
        nombre: true,
        codigo: true
      }
    });

    console.log(`📊 Total de centros de acopio: ${centrosAcopio.length}`);
    centrosAcopio.forEach(centro => {
      console.log(`  - ${centro.nombre} (${centro.codigo}) - ID: ${centro.id}`);
    });

    // 3. Probar AlmacenCentralService
    console.log('\n3️⃣ Probando AlmacenCentralService.obtenerIdAlmacenCentral():');
    const almacenResult = await AlmacenCentralService.obtenerIdAlmacenCentral();
    
    if (almacenResult.success) {
      console.log(`✅ Almacén central encontrado: ${almacenResult.data}`);
      
      // Verificar que el establecimiento existe
      const establecimiento = await prisma.establecimiento.findUnique({
        where: { id: almacenResult.data },
        select: {
          id: true,
          nombre: true,
          codigo: true,
          tipo: true,
          estado: true
        }
      });
      
      if (establecimiento) {
        console.log(`✅ Establecimiento válido: ${establecimiento.nombre} (${establecimiento.codigo})`);
        console.log(`   - Tipo: ${establecimiento.tipo}`);
        console.log(`   - Estado: ${establecimiento.estado}`);
      } else {
        console.log(`❌ ERROR: El ID ${almacenResult.data} no corresponde a un establecimiento válido`);
      }
    } else {
      console.log(`❌ Error al obtener almacén central: ${almacenResult.error}`);
    }

    // 4. Buscar específicamente el establecimiento CHANKA
    console.log('\n4️⃣ Buscando establecimiento CHANKA específicamente:');
    const chanka = await prisma.establecimiento.findUnique({
      where: { codigo: 'CHANKA' },
      select: {
        id: true,
        nombre: true,
        codigo: true,
        tipo: true,
        estado: true
      }
    });

    if (chanka) {
      console.log(`✅ Establecimiento CHANKA encontrado:`);
      console.log(`   - ID: ${chanka.id}`);
      console.log(`   - Nombre: ${chanka.nombre}`);
      console.log(`   - Tipo: ${chanka.tipo}`);
      console.log(`   - Estado: ${chanka.estado}`);
    } else {
      console.log(`❌ Establecimiento CHANKA no encontrado`);
    }

    // 5. Verificar usuarios administradores
    console.log('\n5️⃣ Verificando usuarios administradores:');
    const admins = await prisma.usuario.findMany({
      where: {
        rol: 'administrador',
        estado: 'activo'
      },
      select: {
        id: true,
        nombres: true,
        apellidos: true,
        usuario: true,
        rol: true,
        estado: true
      }
    });

    console.log(`📊 Total de administradores activos: ${admins.length}`);
    admins.forEach(admin => {
      console.log(`  - ${admin.nombres} ${admin.apellidos} (${admin.usuario}) - ID: ${admin.id}`);
    });

  } catch (error) {
    console.error('❌ Error durante el diagnóstico:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Ejecutar diagnóstico
diagnosticarEstablecimiento();
