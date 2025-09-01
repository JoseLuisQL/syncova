import { prisma } from '../src/config/database';
import { AlmacenCentralService } from '../src/services/AlmacenCentralService';

async function debugAlmacenChanka() {
  console.log('🔍 Depurando ALMACÉN (CHANKA)...\n');

  try {
    // 1. Verificar centros de acopio CHANKA
    console.log('1️⃣ Verificando centros de acopio CHANKA...');
    const centrosAcopio = await prisma.centroAcopio.findMany({
      where: {
        OR: [
          { codigo: 'CHANKA-001' },
          { nombre: { contains: 'CHANKA' } }
        ]
      }
    });

    console.log(`Centros de acopio encontrados: ${centrosAcopio.length}`);
    centrosAcopio.forEach(centro => {
      console.log(`  - ${centro.nombre} (${centro.codigo}) - ID: ${centro.id}`);
    });

    // 2. Verificar establecimientos CHANKA
    console.log('\n2️⃣ Verificando establecimientos CHANKA...');
    const establecimientos = await prisma.establecimiento.findMany({
      where: {
        OR: [
          { codigo: 'CHANKA-EST-001' },
          { nombre: { contains: 'CHANKA' } }
        ]
      }
    });

    console.log(`Establecimientos encontrados: ${establecimientos.length}`);
    establecimientos.forEach(est => {
      console.log(`  - ${est.nombre} (${est.codigo}) - ID: ${est.id} - Tipo: ${est.tipo}`);
    });

    // 3. Probar AlmacenCentralService
    console.log('\n3️⃣ Probando AlmacenCentralService...');
    const almacenResult = await AlmacenCentralService.obtenerIdAlmacenCentral();
    
    if (almacenResult.success) {
      console.log(`✅ AlmacenCentralService devolvió ID: ${almacenResult.data}`);
      
      // Verificar si ese ID existe como establecimiento
      const establecimientoExiste = await prisma.establecimiento.findUnique({
        where: { id: almacenResult.data }
      });
      
      if (establecimientoExiste) {
        console.log(`✅ El ID corresponde a establecimiento: ${establecimientoExiste.nombre} (${establecimientoExiste.codigo})`);
      } else {
        console.log(`❌ El ID NO corresponde a ningún establecimiento`);
        
        // Verificar si es un centro de acopio
        const centroAcopioExiste = await prisma.centroAcopio.findUnique({
          where: { id: almacenResult.data }
        });
        
        if (centroAcopioExiste) {
          console.log(`ℹ️ El ID corresponde a centro de acopio: ${centroAcopioExiste.nombre} (${centroAcopioExiste.codigo})`);
        } else {
          console.log(`❌ El ID NO corresponde a ningún centro de acopio tampoco`);
        }
      }
    } else {
      console.log(`❌ AlmacenCentralService falló: ${almacenResult.error}`);
    }

    // 4. Verificar todos los establecimientos para debug
    console.log('\n4️⃣ Listando todos los establecimientos (primeros 10)...');
    const todosEstablecimientos = await prisma.establecimiento.findMany({
      take: 10,
      select: {
        id: true,
        nombre: true,
        codigo: true,
        tipo: true
      }
    });

    todosEstablecimientos.forEach(est => {
      console.log(`  - ${est.nombre} (${est.codigo}) - ID: ${est.id} - Tipo: ${est.tipo}`);
    });

    console.log('\n🎉 Depuración completada!');

  } catch (error) {
    console.error('❌ Error durante la depuración:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Ejecutar la depuración
debugAlmacenChanka();
