import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * Script para crear triggers y funciones de PostgreSQL
 * Incluye el trigger para actualizar saldo_anterior automáticamente
 */
async function createDatabaseTriggers() {
  console.log('🔧 Creando funciones y triggers de PostgreSQL...');
  
  try {
    // 1. Crear la función para actualizar saldo anterior del siguiente mes
    console.log('📝 Creando función actualizar_saldo_anterior_siguiente_mes...');
    
    await prisma.$executeRaw`
      CREATE OR REPLACE FUNCTION actualizar_saldo_anterior_siguiente_mes()
      RETURNS TRIGGER AS $$
      DECLARE
          stock_calculado INTEGER;
          siguiente_mes INTEGER;
          siguiente_anio INTEGER;
          movimiento_siguiente_mes RECORD;
      BEGIN
          -- Calcular el stock del movimiento actual
          stock_calculado := NEW.saldo_anterior + NEW.trans_ingreso - NEW.salida - NEW.trans_salida + NEW.entrega;
          
          -- Calcular el siguiente mes y año
          IF NEW.mes = 12 THEN
              siguiente_mes := 1;
              siguiente_anio := NEW.anio + 1;
          ELSE
              siguiente_mes := NEW.mes + 1;
              siguiente_anio := NEW.anio;
          END IF;
          
          -- Buscar y actualizar el movimiento del siguiente mes si existe
          UPDATE movimientos_vacunas
          SET saldo_anterior = stock_calculado,
              updated_at = NOW()
          WHERE establecimiento_id = NEW.establecimiento_id
            AND vacuna_id = NEW.vacuna_id
            AND mes = siguiente_mes
            AND anio = siguiente_anio;
          
          RETURN NEW;
      END;
      $$ language 'plpgsql';
    `;

    console.log('✅ Función actualizar_saldo_anterior_siguiente_mes creada');

    // 2. Eliminar el trigger si existe (para evitar duplicados)
    console.log('🗑️  Eliminando trigger existente si existe...');
    
    await prisma.$executeRaw`
      DROP TRIGGER IF EXISTS actualizar_saldo_anterior_trigger ON movimientos_vacunas;
    `;

    // 3. Crear el trigger
    console.log('🎯 Creando trigger actualizar_saldo_anterior_trigger...');
    
    await prisma.$executeRaw`
      CREATE TRIGGER actualizar_saldo_anterior_trigger
          AFTER INSERT OR UPDATE OF saldo_anterior, trans_ingreso, salida, trans_salida, entrega
          ON movimientos_vacunas
          FOR EACH ROW
          EXECUTE FUNCTION actualizar_saldo_anterior_siguiente_mes();
    `;

    console.log('✅ Trigger actualizar_saldo_anterior_trigger creado');

    // 4. Verificar que el trigger se creó correctamente
    const triggerExists = await prisma.$queryRaw`
      SELECT trigger_name, event_manipulation, event_object_table
      FROM information_schema.triggers 
      WHERE trigger_name = 'actualizar_saldo_anterior_trigger'
        AND event_object_table = 'movimientos_vacunas';
    `;

    if (Array.isArray(triggerExists) && triggerExists.length > 0) {
      console.log('✅ Verificación: Trigger creado correctamente');
      console.log('📊 Detalles del trigger:', triggerExists[0]);
    } else {
      console.log('⚠️  Advertencia: No se pudo verificar la creación del trigger');
    }

    console.log('🎉 Funciones y triggers creados exitosamente');

  } catch (error) {
    console.error('❌ Error al crear funciones y triggers:', error);
    throw error;
  }
}

/**
 * Verificar si los triggers existen
 */
async function verifyTriggers() {
  console.log('🔍 Verificando triggers existentes...');
  
  try {
    const triggers = await prisma.$queryRaw`
      SELECT trigger_name, event_manipulation, event_object_table, action_statement
      FROM information_schema.triggers 
      WHERE event_object_table = 'movimientos_vacunas';
    `;

    console.log('📋 Triggers encontrados:', triggers);
    return triggers;

  } catch (error) {
    console.error('❌ Error al verificar triggers:', error);
    throw error;
  }
}

// Ejecutar la creación de triggers si el script se ejecuta directamente
if (require.main === module) {
  createDatabaseTriggers()
    .then(() => {
      console.log('✅ Triggers creados exitosamente');
      return verifyTriggers();
    })
    .then(() => {
      console.log('🎉 Verificación completada');
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 Error en la creación de triggers:', error);
      process.exit(1);
    })
    .finally(() => {
      prisma.$disconnect();
    });
}

export { createDatabaseTriggers, verifyTriggers };
