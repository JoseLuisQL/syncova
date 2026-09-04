import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';

const prisma = new PrismaClient();

async function main() {
  console.log('🚀 Iniciando script de reconstrucción de lotes, kardex y stock mensual...\n');

  const VACUNA_56582_ID = 'a78deab1-d22d-4d7d-81bb-20a39463e99c'; // VRS GESTANTE
  const VACUNA_56584_ID = 'df71ff65-4b6a-4597-9060-ff62cb246407'; // NIRSEVIMAB VRS RN
  const VACUNA_35019_ID = 'ead4ecfb-51fe-4d8e-9101-de096507302f'; // SR

  const LOTE_56582_ID = '05a91305-a22d-4a48-9557-18273215b9cc';
  const LOTE_56584_ID = 'b0e2842e-9104-481c-9e65-f813e0c09b38';

  const ALMACEN_CENTRAL_EST_ID = 'd7247b03-7a22-40e8-a5e4-9a5f56dbe22a';
  const ADMIN_USUARIO_ID = '2ba419eb-b7cb-4c2b-920e-50bdf73509e0';

  await prisma.$transaction(async (tx) => {
    // -------------------------------------------------------------
    // 1. Asegurar catálogo de vacunas maestras en la tabla vacunas
    // -------------------------------------------------------------
    console.log('📦 Paso 1: Verificando y asegurando vacunas en la tabla vacunas...');
    const countVacunas: any = await tx.$queryRaw`SELECT count(*) FROM vacunas;`;
    if (Number(countVacunas[0].count) === 0) {
      console.log('  Tabla vacunas vacía. Cargando vacunas desde vacunas_dump.sql si existe...');
      const dumpPath = path.join(__dirname, 'vacunas_dump.sql');
      if (fs.existsSync(dumpPath)) {
        const dumpContent = fs.readFileSync(dumpPath, 'utf8');
        const lines = dumpContent.split('\n');
        for (const line of lines) {
          const parts = line.split('\t');
          if (parts.length >= 10 && parts[0].includes('-')) {
            const [id, nombre, tipo, presentacion, dosis_por_frasco, tiempo_vida_util, temperatura, estado] = parts;
            await tx.$executeRaw`
              INSERT INTO vacunas (id, nombre, tipo, presentacion, dosis_por_frasco, tiempo_vida_util, temperatura_almacenamiento, estado)
              VALUES (${id}::uuid, ${nombre}, ${tipo}, ${presentacion}, ${Number(dosis_por_frasco)}, ${Number(tiempo_vida_util)}, ${temperatura}, ${estado}::"EstadoGeneral")
              ON CONFLICT (id) DO NOTHING;
            `;
          }
        }
      }
    }

    // Asegurar específicamente las vacunas en cuestión
    await tx.$executeRaw`
      INSERT INTO vacunas (id, nombre, tipo, presentacion, dosis_por_frasco, tiempo_vida_util, temperatura_almacenamiento, estado)
      VALUES
        (${VACUNA_56582_ID}::uuid, '56582 - VRS GESTANTE', 'Vacuna', 'Frasco unidosis', 1, 1095, '2°C a 8°C', 'activo'::"EstadoGeneral"),
        (${VACUNA_56584_ID}::uuid, '56584 - NIRSEVIMAB VRS RN', 'Vacuna', 'Frasco unidosis', 1, 1095, '2°C a 8°C', 'activo'::"EstadoGeneral"),
        (${VACUNA_35019_ID}::uuid, '35019 - VACUNA CONTRA EL SARAMPION Y LA RUBEOLA (SR)', 'Vacuna', 'Frasco unidosis', 1, 1095, '2°C a 8°C', 'activo'::"EstadoGeneral")
      ON CONFLICT (id) DO UPDATE SET
        nombre = EXCLUDED.nombre,
        estado = 'activo'::"EstadoGeneral";
    `;
    console.log('  ✅ Vacunas verificadas y listas.');

    // -------------------------------------------------------------
    // 2. Limpiar ajustes manuales erróneos en Kardex
    // -------------------------------------------------------------
    console.log('🧹 Paso 2: Eliminando registros de ajuste manual (CORRECCION_STOCK) generados al poner en 0 el stock...');
    const deletedAjustes: any = await tx.$executeRaw`
      DELETE FROM kardex
      WHERE item_id IN (${VACUNA_56582_ID}::uuid, ${VACUNA_56584_ID}::uuid)
        AND tipo_movimiento = 'ajuste'::"TipoMovimientoKardex"
        AND documento = 'CORRECCION_STOCK';
    `;
    console.log(`  ✅ Registros de ajuste eliminados: ${deletedAjustes}`);

    // -------------------------------------------------------------
    // 3. Corregir / Insertar movimiento de INGRESO en Kardex con fecha de JUNIO 2026
    // -------------------------------------------------------------
    console.log('📅 Paso 3: Configurando movimiento de ingreso en Kardex con fecha en junio 2026...');
    const fechaIngresoJunio = new Date('2026-06-15T15:00:00.000Z');

    // Vacuna 56582 (841 unidades)
    const existingIngreso56582: any = await tx.$queryRaw`
      SELECT id FROM kardex
      WHERE item_id = ${VACUNA_56582_ID}::uuid
        AND tipo_movimiento = 'ingreso'::"TipoMovimientoKardex"
        AND documento = 'PECOSA'
      LIMIT 1;
    `;

    if (existingIngreso56582.length > 0) {
      await tx.$executeRaw`
        UPDATE kardex
        SET fecha_movimiento = ${fechaIngresoJunio},
            cantidad = 841,
            saldo_anterior = 0,
            saldo_actual = 841,
            lote_id = ${LOTE_56582_ID}::uuid,
            observaciones = 'Ingreso de lote NT9592 - PECOSA: 58839-2026 (Registro Junio 2026)'
        WHERE id = ${existingIngreso56582[0].id}::uuid;
      `;
    } else {
      await tx.$executeRaw`
        INSERT INTO kardex (
          id, tipo, item_id, lote_id, tipo_movimiento, cantidad, saldo_anterior, saldo_actual,
          establecimiento_origen_id, establecimiento_destino_id, documento, numero_documento,
          observaciones, usuario_id, fecha_movimiento, created_at
        ) VALUES (
          gen_random_uuid(), 'vacuna', ${VACUNA_56582_ID}::uuid, ${LOTE_56582_ID}::uuid,
          'ingreso'::"TipoMovimientoKardex", 841, 0, 841,
          NULL, ${ALMACEN_CENTRAL_EST_ID}::uuid, 'PECOSA', '58839-2026',
          'Ingreso de lote NT9592 - PECOSA: 58839-2026 (Registro Junio 2026)',
          ${ADMIN_USUARIO_ID}::uuid, ${fechaIngresoJunio}, ${fechaIngresoJunio}
        );
      `;
    }

    // Vacuna 56584 (433 unidades)
    const existingIngreso56584: any = await tx.$queryRaw`
      SELECT id FROM kardex
      WHERE item_id = ${VACUNA_56584_ID}::uuid
        AND tipo_movimiento = 'ingreso'::"TipoMovimientoKardex"
        AND documento = 'PECOSA'
      LIMIT 1;
    `;

    if (existingIngreso56584.length > 0) {
      await tx.$executeRaw`
        UPDATE kardex
        SET fecha_movimiento = ${fechaIngresoJunio},
            cantidad = 433,
            saldo_anterior = 0,
            saldo_actual = 433,
            lote_id = ${LOTE_56584_ID}::uuid,
            observaciones = 'Ingreso de lote AZ250063 - PECOSA: 59074-2026 (Registro Junio 2026)'
        WHERE id = ${existingIngreso56584[0].id}::uuid;
      `;
    } else {
      await tx.$executeRaw`
        INSERT INTO kardex (
          id, tipo, item_id, lote_id, tipo_movimiento, cantidad, saldo_anterior, saldo_actual,
          establecimiento_origen_id, establecimiento_destino_id, documento, numero_documento,
          observaciones, usuario_id, fecha_movimiento, created_at
        ) VALUES (
          gen_random_uuid(), 'vacuna', ${VACUNA_56584_ID}::uuid, ${LOTE_56584_ID}::uuid,
          'ingreso'::"TipoMovimientoKardex", 433, 0, 433,
          NULL, ${ALMACEN_CENTRAL_EST_ID}::uuid, 'PECOSA', '59074-2026',
          'Ingreso de lote AZ250063 - PECOSA: 59074-2026 (Registro Junio 2026)',
          ${ADMIN_USUARIO_ID}::uuid, ${fechaIngresoJunio}, ${fechaIngresoJunio}
        );
      `;
    }
    console.log('  ✅ Movimientos de ingreso en junio configurados.');

    // -------------------------------------------------------------
    // 4. Recalcular encadenamiento de saldos de Kardex para ambas vacunas
    // -------------------------------------------------------------
    console.log('🔄 Paso 4: Recalculando encadenamiento de saldos en Kardex para vales emitidos...');

    for (const item of [
      { id: VACUNA_56582_ID, nombre: '56582 - VRS GESTANTE', apertura: 841 },
      { id: VACUNA_56584_ID, nombre: '56584 - NIRSEVIMAB VRS RN', apertura: 433 }
    ]) {
      const movimientos: any = await tx.$queryRaw`
        SELECT id, tipo_movimiento, cantidad, fecha_movimiento
        FROM kardex
        WHERE item_id = ${item.id}::uuid
        ORDER BY fecha_movimiento ASC, created_at ASC, id ASC;
      `;

      let saldoCorriente = 0;
      let totalSalidasVales = 0;

      for (const mov of movimientos) {
        if (mov.tipo_movimiento === 'ingreso') {
          const saldoAnt = saldoCorriente;
          saldoCorriente += Number(mov.cantidad);
          await tx.$executeRaw`
            UPDATE kardex
            SET saldo_anterior = ${saldoAnt},
                saldo_actual = ${saldoCorriente}
            WHERE id = ${mov.id}::uuid;
          `;
        } else if (mov.tipo_movimiento === 'salida') {
          const cant = Number(mov.cantidad);
          totalSalidasVales += cant;
          const saldoAnt = saldoCorriente;
          saldoCorriente -= cant;
          await tx.$executeRaw`
            UPDATE kardex
            SET saldo_anterior = ${saldoAnt},
                saldo_actual = ${saldoCorriente}
            WHERE id = ${mov.id}::uuid;
          `;
        }
      }

      console.log(`  [${item.nombre}]: Ingreso = ${item.apertura} | Total salidas en vales = ${totalSalidasVales} | Saldo final en Kardex = ${saldoCorriente}`);
    }

    // -------------------------------------------------------------
    // 5. Recrear lotes en lotes_vacunas con cantidad inicial y cantidad actual real
    // -------------------------------------------------------------
    console.log('💊 Paso 5: Recreando lotes en la tabla lotes_vacunas...');
    const fechaVencimientoLotes = new Date('2027-12-31T00:00:00.000Z');
    const fechaIngresoLotes = new Date('2026-06-15T00:00:00.000Z');

    // Obtener dinámicamente el valor exacto del enum FormaIngreso en la BD actual
    const forma2Result: any = await tx.$queryRaw`
      SELECT enumlabel FROM pg_enum e
      JOIN pg_type t ON t.oid = e.enumtypid
      WHERE t.typname = 'FormaIngreso' AND (e.enumlabel LIKE '2%' OR e.enumlabel LIKE '%SEGUNDO%')
      LIMIT 1;
    `;
    const forma2Label = forma2Result[0]?.enumlabel || '2° TRIMESTRE';

    // Lote 56582: Inicial = 841, Salidas = 241, Actual = 600
    await tx.$executeRaw`
      INSERT INTO lotes_vacunas (
        id, numero, vacuna_id, fecha_ingreso, fecha_vencimiento,
        forma_ingreso, comprobante_clase, numero_comprobante,
        cantidad_inicial, cantidad_actual, estado, observaciones
      ) VALUES (
        ${LOTE_56582_ID}::uuid, 'NT9592', ${VACUNA_56582_ID}::uuid,
        ${fechaIngresoLotes}, ${fechaVencimientoLotes},
        ${forma2Label}::"FormaIngreso", 'PECOSA'::"ComprobanteClase", '58839-2026',
        841, 600, 'disponible'::"EstadoLote",
        'Lote reingresado con fecha en junio 2026'
      )
      ON CONFLICT (numero) DO UPDATE SET
        vacuna_id = EXCLUDED.vacuna_id,
        fecha_ingreso = EXCLUDED.fecha_ingreso,
        fecha_vencimiento = EXCLUDED.fecha_vencimiento,
        forma_ingreso = EXCLUDED.forma_ingreso,
        comprobante_clase = EXCLUDED.comprobante_clase,
        numero_comprobante = EXCLUDED.numero_comprobante,
        cantidad_inicial = EXCLUDED.cantidad_inicial,
        cantidad_actual = EXCLUDED.cantidad_actual,
        estado = EXCLUDED.estado,
        observaciones = EXCLUDED.observaciones;
    `;

    // Lote 56584: Inicial = 433, Salidas = 244, Actual = 189
    await tx.$executeRaw`
      INSERT INTO lotes_vacunas (
        id, numero, vacuna_id, fecha_ingreso, fecha_vencimiento,
        forma_ingreso, comprobante_clase, numero_comprobante,
        cantidad_inicial, cantidad_actual, estado, observaciones
      ) VALUES (
        ${LOTE_56584_ID}::uuid, 'AZ250063', ${VACUNA_56584_ID}::uuid,
        ${fechaIngresoLotes}, ${fechaVencimientoLotes},
        ${forma2Label}::"FormaIngreso", 'PECOSA'::"ComprobanteClase", '59074-2026',
        433, 189, 'disponible'::"EstadoLote",
        'Lote reingresado con fecha en junio 2026'
      )
      ON CONFLICT (numero) DO UPDATE SET
        vacuna_id = EXCLUDED.vacuna_id,
        fecha_ingreso = EXCLUDED.fecha_ingreso,
        fecha_vencimiento = EXCLUDED.fecha_vencimiento,
        forma_ingreso = EXCLUDED.forma_ingreso,
        comprobante_clase = EXCLUDED.comprobante_clase,
        numero_comprobante = EXCLUDED.numero_comprobante,
        cantidad_inicial = EXCLUDED.cantidad_inicial,
        cantidad_actual = EXCLUDED.cantidad_actual,
        estado = EXCLUDED.estado,
        observaciones = EXCLUDED.observaciones;
    `;
    console.log('  ✅ Lotes recreados exitosamente.');

    // -------------------------------------------------------------
    // 6. Actualizar stock_inicial_mensual para todos los períodos
    // -------------------------------------------------------------
    console.log('📊 Paso 6: Actualizando stock_inicial_mensual para que la apertura refleje las cantidades exactas...');

    // Eliminar registros existentes para estas dos vacunas para reconstruirlos de forma limpia
    await tx.$executeRaw`
      DELETE FROM stock_inicial_mensual
      WHERE vacuna_id IN (${VACUNA_56582_ID}::uuid, ${VACUNA_56584_ID}::uuid);
    `;

    const registrosStockInicial = [
      // Vacuna 56582 - VRS GESTANTE
      // Mes 6 (Junio): Ingresó lote con 841
      { vacunaId: VACUNA_56582_ID, mes: 6, anio: 2026, stock: 841, obs: 'Stock de apertura junio 2026 (Ingreso PECOSA: 58839-2026)' },
      // Mes 7 (Julio - Periodo objetivo al seleccionar Junio en la UI): Apertura = 841 (sin salidas en junio ni julio)
      { vacunaId: VACUNA_56582_ID, mes: 7, anio: 2026, stock: 841, obs: 'Stock de apertura julio 2026 (Sin salidas en julio)' },
      // Mes 8 (Agosto - Periodo objetivo al seleccionar Julio): Apertura = 841 (los vales se emitieron en agosto)
      { vacunaId: VACUNA_56582_ID, mes: 8, anio: 2026, stock: 841, obs: 'Stock inicial agosto 2026' },
      // Mes 9 (Septiembre - Periodo objetivo al seleccionar Agosto): Apertura = 841 - 241 = 600
      { vacunaId: VACUNA_56582_ID, mes: 9, anio: 2026, stock: 600, obs: 'Stock inicial septiembre 2026 (descontando 241 dosis de vales de agosto)' },
      // Mes 10 (Octubre): Apertura = 600
      { vacunaId: VACUNA_56582_ID, mes: 10, anio: 2026, stock: 600, obs: 'Stock inicial octubre 2026' },

      // Vacuna 56584 - NIRSEVIMAB VRS RN
      // Mes 6 (Junio): Ingresó lote con 433
      { vacunaId: VACUNA_56584_ID, mes: 6, anio: 2026, stock: 433, obs: 'Stock de apertura junio 2026 (Ingreso PECOSA: 59074-2026)' },
      // Mes 7 (Julio - Periodo objetivo al seleccionar Junio en la UI): Apertura = 433 (sin salidas en junio ni julio)
      { vacunaId: VACUNA_56584_ID, mes: 7, anio: 2026, stock: 433, obs: 'Stock de apertura julio 2026 (Sin salidas en julio)' },
      // Mes 8 (Agosto - Periodo objetivo al seleccionar Julio): Apertura = 433
      { vacunaId: VACUNA_56584_ID, mes: 8, anio: 2026, stock: 433, obs: 'Stock inicial agosto 2026' },
      // Mes 9 (Septiembre - Periodo objetivo al seleccionar Agosto): Apertura = 433 - 194 = 239
      { vacunaId: VACUNA_56584_ID, mes: 9, anio: 2026, stock: 239, obs: 'Stock inicial septiembre 2026 (descontando 194 dosis de vales de agosto)' },
      // Mes 10 (Octubre): Apertura = 239 - 50 = 189
      { vacunaId: VACUNA_56584_ID, mes: 10, anio: 2026, stock: 189, obs: 'Stock inicial octubre 2026 (descontando 50 dosis de vale de septiembre)' }
    ];

    for (const reg of registrosStockInicial) {
      await tx.$executeRaw`
        INSERT INTO stock_inicial_mensual (
          id, vacuna_id, mes, anio, stock_inicial, fecha_captura, observaciones, created_at
        ) VALUES (
          gen_random_uuid(), ${reg.vacunaId}::uuid, ${reg.mes}, ${reg.anio}, ${reg.stock},
          NOW(), ${reg.obs}, NOW()
        );
      `;
    }
    console.log('  ✅ Tabla stock_inicial_mensual reconstruida con éxito.');
  });

  console.log('\n🎉 ¡PROCESO COMPLETADO SATISFACTORIAMENTE!');
}

main()
  .catch((e) => {
    console.error('❌ Error durante la ejecución del script:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
