-- ============================================================================
-- SCRIPT DE RECONSTRUCCIÓN Y CORRECCIÓN DE VACUNAS 56582 Y 56584
-- ============================================================================
-- Propósito:
--   1. Asegurar registro de vacunas maestras en tabla 'vacunas'.
--   2. Eliminar ajustes manuales erróneos ('CORRECCION_STOCK').
--   3. Reingresar en Kardex los lotes con fecha en JUNIO 2026 (841 y 433 unidades).
--   4. Reencadenar matemáticamente los saldos del Kardex (ingreso junio + salidas vales).
--   5. Recrear los lotes NT9592 y AZ250063 en 'lotes_vacunas' con sus saldos reales (600 y 189).
--   6. Configurar 'stock_inicial_mensual' para que la apertura en Junio (periodo objetivo Julio)
--      sea exactamente 841 para 56582 y 433 para 56584.
--
-- Ejecución en VPS (Docker):
--   docker compose exec -T db psql -U postgres -d sivac < solucion_vps_docker_vacunas.sql
-- ============================================================================

BEGIN;

-- 1. Normalización de enum FormaIngreso en caso de codificación con caracteres especiales
DO $$
DECLARE
  r RECORD;
BEGIN
  FOR r IN (
    SELECT e.enumlabel
    FROM pg_type t
    JOIN pg_enum e ON t.oid = e.enumtypid
    WHERE t.typname = 'FormaIngreso' AND e.enumlabel LIKE '%┬%'
  ) LOOP
    IF r.enumlabel LIKE '1%' THEN
      EXECUTE format('ALTER TYPE "FormaIngreso" RENAME VALUE %L TO %L', r.enumlabel, '1° TRIMESTRE');
    ELSIF r.enumlabel LIKE '2%' THEN
      EXECUTE format('ALTER TYPE "FormaIngreso" RENAME VALUE %L TO %L', r.enumlabel, '2° TRIMESTRE');
    ELSIF r.enumlabel LIKE '3%' THEN
      EXECUTE format('ALTER TYPE "FormaIngreso" RENAME VALUE %L TO %L', r.enumlabel, '3° TRIMESTRE');
    ELSIF r.enumlabel LIKE '4%' THEN
      EXECUTE format('ALTER TYPE "FormaIngreso" RENAME VALUE %L TO %L', r.enumlabel, '4° TRIMESTRE');
    END IF;
  END LOOP;
END $$;

-- 2. Asegurar vacunas maestras en la tabla 'vacunas'
INSERT INTO vacunas (id, nombre, tipo, presentacion, dosis_por_frasco, tiempo_vida_util, temperatura_almacenamiento, estado)
VALUES
  ('a78deab1-d22d-4d7d-81bb-20a39463e99c'::uuid, '56582 - VRS GESTANTE', 'Vacuna', 'Frasco unidosis', 1, 1095, '2°C a 8°C', 'activo'::"EstadoGeneral"),
  ('df71ff65-4b6a-4597-9060-ff62cb246407'::uuid, '56584 - NIRSEVIMAB VRS RN', 'Vacuna', 'Frasco unidosis', 1, 1095, '2°C a 8°C', 'activo'::"EstadoGeneral")
ON CONFLICT (id) DO UPDATE SET
  nombre = EXCLUDED.nombre,
  estado = 'activo'::"EstadoGeneral";

-- 3. Eliminar registros de ajuste manual (CORRECCION_STOCK)
DELETE FROM kardex
WHERE item_id IN ('a78deab1-d22d-4d7d-81bb-20a39463e99c'::uuid, 'df71ff65-4b6a-4597-9060-ff62cb246407'::uuid)
  AND tipo_movimiento = 'ajuste'::"TipoMovimientoKardex"
  AND documento = 'CORRECCION_STOCK';

-- 4. Registrar / actualizar ingreso en Kardex con fecha 15 de JUNIO de 2026
-- Vacuna 56582 (841 unidades)
DO $$
DECLARE
  v_id uuid;
  v_almacen uuid := 'd7247b03-7a22-40e8-a5e4-9a5f56dbe22a';
  v_user uuid := '2ba419eb-b7cb-4c2b-920e-50bdf73509e0';
  v_lote uuid := '05a91305-a22d-4a48-9557-18273215b9cc';
BEGIN
  SELECT id INTO v_id FROM kardex
  WHERE item_id = 'a78deab1-d22d-4d7d-81bb-20a39463e99c'::uuid
    AND tipo_movimiento = 'ingreso'::"TipoMovimientoKardex"
    AND documento = 'PECOSA'
  LIMIT 1;

  IF v_id IS NOT NULL THEN
    UPDATE kardex
    SET fecha_movimiento = '2026-06-15 15:00:00+00',
        cantidad = 841,
        saldo_anterior = 0,
        saldo_actual = 841,
        lote_id = v_lote,
        observaciones = 'Ingreso de lote NT9592 - PECOSA: 58839-2026 (Registro Junio 2026)'
    WHERE id = v_id;
  ELSE
    INSERT INTO kardex (
      id, tipo, item_id, lote_id, tipo_movimiento, cantidad, saldo_anterior, saldo_actual,
      establecimiento_origen_id, establecimiento_destino_id, documento, numero_documento,
      observaciones, usuario_id, fecha_movimiento, created_at
    ) VALUES (
      gen_random_uuid(), 'vacuna', 'a78deab1-d22d-4d7d-81bb-20a39463e99c'::uuid, v_lote,
      'ingreso'::"TipoMovimientoKardex", 841, 0, 841,
      NULL, v_almacen, 'PECOSA', '58839-2026',
      'Ingreso de lote NT9592 - PECOSA: 58839-2026 (Registro Junio 2026)',
      v_user, '2026-06-15 15:00:00+00', '2026-06-15 15:00:00+00'
    );
  END IF;
END $$;

-- Vacuna 56584 (433 unidades)
DO $$
DECLARE
  v_id uuid;
  v_almacen uuid := 'd7247b03-7a22-40e8-a5e4-9a5f56dbe22a';
  v_user uuid := '2ba419eb-b7cb-4c2b-920e-50bdf73509e0';
  v_lote uuid := 'b0e2842e-9104-481c-9e65-f813e0c09b38';
BEGIN
  SELECT id INTO v_id FROM kardex
  WHERE item_id = 'df71ff65-4b6a-4597-9060-ff62cb246407'::uuid
    AND tipo_movimiento = 'ingreso'::"TipoMovimientoKardex"
    AND documento = 'PECOSA'
  LIMIT 1;

  IF v_id IS NOT NULL THEN
    UPDATE kardex
    SET fecha_movimiento = '2026-06-15 15:00:00+00',
        cantidad = 433,
        saldo_anterior = 0,
        saldo_actual = 433,
        lote_id = v_lote,
        observaciones = 'Ingreso de lote AZ250063 - PECOSA: 59074-2026 (Registro Junio 2026)'
    WHERE id = v_id;
  ELSE
    INSERT INTO kardex (
      id, tipo, item_id, lote_id, tipo_movimiento, cantidad, saldo_anterior, saldo_actual,
      establecimiento_origen_id, establecimiento_destino_id, documento, numero_documento,
      observaciones, usuario_id, fecha_movimiento, created_at
    ) VALUES (
      gen_random_uuid(), 'vacuna', 'df71ff65-4b6a-4597-9060-ff62cb246407'::uuid, v_lote,
      'ingreso'::"TipoMovimientoKardex", 433, 0, 433,
      NULL, v_almacen, 'PECOSA', '59074-2026',
      'Ingreso de lote AZ250063 - PECOSA: 59074-2026 (Registro Junio 2026)',
      v_user, '2026-06-15 15:00:00+00', '2026-06-15 15:00:00+00'
    );
  END IF;
END $$;

-- 5. Reencadenar saldos en Kardex para ambas vacunas de forma matemáticamente exacta
DO $$
DECLARE
  v_vacuna_id uuid;
  v_mov RECORD;
  v_saldo integer;
BEGIN
  FOR v_vacuna_id IN SELECT unnest(ARRAY['a78deab1-d22d-4d7d-81bb-20a39463e99c'::uuid, 'df71ff65-4b6a-4597-9060-ff62cb246407'::uuid]) LOOP
    v_saldo := 0;
    FOR v_mov IN (
      SELECT id, tipo_movimiento, cantidad
      FROM kardex
      WHERE item_id = v_vacuna_id
      ORDER BY fecha_movimiento ASC, created_at ASC, id ASC
    ) LOOP
      IF v_mov.tipo_movimiento = 'ingreso' THEN
        UPDATE kardex
        SET saldo_anterior = v_saldo,
            saldo_actual = v_saldo + v_mov.cantidad
        WHERE id = v_mov.id;
        v_saldo := v_saldo + v_mov.cantidad;
      ELSIF v_mov.tipo_movimiento = 'salida' THEN
        UPDATE kardex
        SET saldo_anterior = v_saldo,
            saldo_actual = v_saldo - v_mov.cantidad
        WHERE id = v_mov.id;
        v_saldo := v_saldo - v_mov.cantidad;
      END IF;
    END LOOP;
  END LOOP;
END $$;

-- 6. Recrear lotes en 'lotes_vacunas' con su cantidad inicial y saldo actual real
DO $$
DECLARE
  v_forma "FormaIngreso";
BEGIN
  -- Obtener el valor correspondiente a segundo trimestre del enum
  SELECT enumlabel::"FormaIngreso" INTO v_forma
  FROM pg_enum e
  JOIN pg_type t ON t.oid = e.enumtypid
  WHERE t.typname = 'FormaIngreso' AND (e.enumlabel LIKE '2%' OR e.enumlabel LIKE '%SEGUNDO%')
  LIMIT 1;

  -- Lote 56582: Inicial = 841, Salidas = 241, Saldo actual = 600
  INSERT INTO lotes_vacunas (
    id, numero, vacuna_id, fecha_ingreso, fecha_vencimiento,
    forma_ingreso, comprobante_clase, numero_comprobante,
    cantidad_inicial, cantidad_actual, estado, observaciones
  ) VALUES (
    '05a91305-a22d-4a48-9557-18273215b9cc'::uuid, 'NT9592', 'a78deab1-d22d-4d7d-81bb-20a39463e99c'::uuid,
    '2026-06-15'::date, '2027-12-31'::date,
    v_forma, 'PECOSA'::"ComprobanteClase", '58839-2026',
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

  -- Lote 56584: Inicial = 433, Salidas = 244, Saldo actual = 189
  INSERT INTO lotes_vacunas (
    id, numero, vacuna_id, fecha_ingreso, fecha_vencimiento,
    forma_ingreso, comprobante_clase, numero_comprobante,
    cantidad_inicial, cantidad_actual, estado, observaciones
  ) VALUES (
    'b0e2842e-9104-481c-9e65-f813e0c09b38'::uuid, 'AZ250063', 'df71ff65-4b6a-4597-9060-ff62cb246407'::uuid,
    '2026-06-15'::date, '2027-12-31'::date,
    v_forma, 'PECOSA'::"ComprobanteClase", '59074-2026',
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
END $$;

-- 7. Limpiar y reconstruir snapshots en 'stock_inicial_mensual'
DELETE FROM stock_inicial_mensual
WHERE vacuna_id IN ('a78deab1-d22d-4d7d-81bb-20a39463e99c'::uuid, 'df71ff65-4b6a-4597-9060-ff62cb246407'::uuid);

INSERT INTO stock_inicial_mensual (id, vacuna_id, mes, anio, stock_inicial, fecha_captura, observaciones, created_at)
VALUES
  -- Vacuna 56582 - VRS GESTANTE
  (gen_random_uuid(), 'a78deab1-d22d-4d7d-81bb-20a39463e99c'::uuid, 6, 2026, 841, NOW(), 'Stock apertura junio 2026 (Ingreso PECOSA: 58839-2026)', NOW()),
  (gen_random_uuid(), 'a78deab1-d22d-4d7d-81bb-20a39463e99c'::uuid, 7, 2026, 841, NOW(), 'Stock apertura julio 2026 (Sin salidas en julio)', NOW()),
  (gen_random_uuid(), 'a78deab1-d22d-4d7d-81bb-20a39463e99c'::uuid, 8, 2026, 841, NOW(), 'Stock inicial agosto 2026', NOW()),
  (gen_random_uuid(), 'a78deab1-d22d-4d7d-81bb-20a39463e99c'::uuid, 9, 2026, 600, NOW(), 'Stock inicial septiembre 2026 (descontando 241 dosis de vales)', NOW()),
  (gen_random_uuid(), 'a78deab1-d22d-4d7d-81bb-20a39463e99c'::uuid, 10, 2026, 600, NOW(), 'Stock inicial octubre 2026', NOW()),

  -- Vacuna 56584 - NIRSEVIMAB VRS RN
  (gen_random_uuid(), 'df71ff65-4b6a-4597-9060-ff62cb246407'::uuid, 6, 2026, 433, NOW(), 'Stock apertura junio 2026 (Ingreso PECOSA: 59074-2026)', NOW()),
  (gen_random_uuid(), 'df71ff65-4b6a-4597-9060-ff62cb246407'::uuid, 7, 2026, 433, NOW(), 'Stock apertura julio 2026 (Sin salidas en julio)', NOW()),
  (gen_random_uuid(), 'df71ff65-4b6a-4597-9060-ff62cb246407'::uuid, 8, 2026, 433, NOW(), 'Stock inicial agosto 2026', NOW()),
  (gen_random_uuid(), 'df71ff65-4b6a-4597-9060-ff62cb246407'::uuid, 9, 2026, 239, NOW(), 'Stock inicial septiembre 2026 (descontando 194 dosis de vales)', NOW()),
  (gen_random_uuid(), 'df71ff65-4b6a-4597-9060-ff62cb246407'::uuid, 10, 2026, 189, NOW(), 'Stock inicial octubre 2026 (descontando 50 dosis de vale septiembre)', NOW());

COMMIT;

-- Verificación final informativa
SELECT lv.numero, v.nombre, lv.cantidad_inicial, lv.cantidad_actual, lv.fecha_ingreso, lv.estado
FROM lotes_vacunas lv
JOIN vacunas v ON v.id = lv.vacuna_id
WHERE lv.vacuna_id IN ('a78deab1-d22d-4d7d-81bb-20a39463e99c'::uuid, 'df71ff65-4b6a-4597-9060-ff62cb246407'::uuid);
