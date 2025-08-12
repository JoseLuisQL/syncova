-- =====================================================
-- PRUEBA SIMPLE DEL TRIGGER DE SALDO ANTERIOR AUTOMÁTICO
-- =====================================================

-- Verificar que la función existe
SELECT proname, prosrc 
FROM pg_proc 
WHERE proname = 'actualizar_saldo_anterior_siguiente_mes';

-- Verificar que el trigger existe
SELECT tgname, tgrelid::regclass, tgfoid::regproc
FROM pg_trigger 
WHERE tgname = 'actualizar_saldo_anterior_trigger';

-- Ejemplo de prueba manual (ajustar IDs según tu base de datos)
-- 1. Insertar un movimiento de prueba para enero 2024
-- 2. Insertar un movimiento de prueba para febrero 2024
-- 3. Actualizar el movimiento de enero y verificar que febrero se actualiza

-- NOTA: Reemplazar los UUIDs con valores reales de tu base de datos
/*
-- Ejemplo de uso:
INSERT INTO movimientos_vacunas (
    establecimiento_id,
    vacuna_id,
    mes,
    anio,
    saldo_anterior,
    trans_ingreso,
    salida,
    trans_salida,
    entrega,
    usuario_id
) VALUES (
    'tu-establecimiento-id-aqui',
    'tu-vacuna-id-aqui',
    1, -- Enero
    2024,
    100,
    50,
    20,
    10,
    30,
    'tu-usuario-id-aqui'
);

-- Insertar movimiento de febrero
INSERT INTO movimientos_vacunas (
    establecimiento_id,
    vacuna_id,
    mes,
    anio,
    saldo_anterior,
    trans_ingreso,
    salida,
    trans_salida,
    entrega,
    usuario_id
) VALUES (
    'tu-establecimiento-id-aqui',
    'tu-vacuna-id-aqui',
    2, -- Febrero
    2024,
    0, -- Esto debería actualizarse automáticamente
    25,
    15,
    5,
    20,
    'tu-usuario-id-aqui'
);

-- Actualizar enero (esto debería disparar el trigger)
UPDATE movimientos_vacunas 
SET entrega = 40 
WHERE establecimiento_id = 'tu-establecimiento-id-aqui'
  AND vacuna_id = 'tu-vacuna-id-aqui'
  AND mes = 1 
  AND anio = 2024;

-- Verificar resultado
SELECT 
    mes,
    saldo_anterior,
    trans_ingreso,
    salida,
    trans_salida,
    entrega,
    (saldo_anterior + trans_ingreso - salida - trans_salida + entrega) as stock_calculado
FROM movimientos_vacunas 
WHERE establecimiento_id = 'tu-establecimiento-id-aqui'
  AND vacuna_id = 'tu-vacuna-id-aqui'
  AND anio = 2024
  AND mes IN (1, 2)
ORDER BY mes;
*/
