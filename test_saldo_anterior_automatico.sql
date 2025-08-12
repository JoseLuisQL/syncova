-- =====================================================
-- SCRIPT DE PRUEBA PARA FUNCIONALIDAD DE SALDO ANTERIOR AUTOMÁTICO
-- =====================================================

-- Este script prueba la funcionalidad de actualización automática del saldo anterior
-- del siguiente mes cuando se actualiza el stock de un movimiento

-- =====================================================
-- 1. PREPARAR DATOS DE PRUEBA
-- =====================================================

-- Obtener IDs de prueba (ajustar según tu base de datos)
DO $$
DECLARE
    test_establecimiento_id UUID;
    test_vacuna_id UUID;
    test_usuario_id UUID;
BEGIN
    -- Obtener el primer establecimiento disponible
    SELECT id INTO test_establecimiento_id FROM establecimientos LIMIT 1;
    
    -- Obtener la primera vacuna disponible
    SELECT id INTO test_vacuna_id FROM vacunas LIMIT 1;
    
    -- Obtener el primer usuario disponible
    SELECT id INTO test_usuario_id FROM usuarios LIMIT 1;
    
    -- Mostrar los IDs que se usarán para las pruebas
    RAISE NOTICE 'IDs de prueba:';
    RAISE NOTICE 'Establecimiento: %', test_establecimiento_id;
    RAISE NOTICE 'Vacuna: %', test_vacuna_id;
    RAISE NOTICE 'Usuario: %', test_usuario_id;
    
    -- Limpiar datos de prueba anteriores si existen
    DELETE FROM movimientos_vacunas 
    WHERE establecimiento_id = test_establecimiento_id 
      AND vacuna_id = test_vacuna_id 
      AND anio = 2024 
      AND mes IN (11, 12);
    
    -- =====================================================
    -- 2. CREAR MOVIMIENTO DE NOVIEMBRE 2024
    -- =====================================================
    
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
        usuario_id,
        observaciones
    ) VALUES (
        test_establecimiento_id,
        test_vacuna_id,
        11, -- Noviembre
        2024,
        100, -- Saldo anterior
        50,  -- Trans ingreso
        20,  -- Salida
        10,  -- Trans salida
        30,  -- Entrega
        test_usuario_id,
        'Movimiento de prueba - Noviembre 2024'
    );
    
    RAISE NOTICE 'Movimiento de Noviembre 2024 creado';
    
    -- =====================================================
    -- 3. CREAR MOVIMIENTO DE DICIEMBRE 2024 (SIN SALDO ANTERIOR)
    -- =====================================================
    
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
        usuario_id,
        observaciones
    ) VALUES (
        test_establecimiento_id,
        test_vacuna_id,
        12, -- Diciembre
        2024,
        0,   -- Saldo anterior inicial (debería actualizarse automáticamente)
        25,  -- Trans ingreso
        15,  -- Salida
        5,   -- Trans salida
        20,  -- Entrega
        test_usuario_id,
        'Movimiento de prueba - Diciembre 2024'
    );
    
    RAISE NOTICE 'Movimiento de Diciembre 2024 creado';
    
    -- =====================================================
    -- 4. VERIFICAR ESTADO INICIAL
    -- =====================================================
    
    RAISE NOTICE '=== ESTADO INICIAL ===';
    
    -- Mostrar movimiento de Noviembre
    PERFORM (
        SELECT RAISE(NOTICE, 'Noviembre 2024 - Stock calculado: %', 
                     (saldo_anterior + trans_ingreso - salida - trans_salida + entrega))
        FROM movimientos_vacunas 
        WHERE establecimiento_id = test_establecimiento_id 
          AND vacuna_id = test_vacuna_id 
          AND mes = 11 AND anio = 2024
    );
    
    -- Mostrar saldo anterior de Diciembre (antes de la actualización)
    PERFORM (
        SELECT RAISE(NOTICE, 'Diciembre 2024 - Saldo anterior inicial: %', saldo_anterior)
        FROM movimientos_vacunas 
        WHERE establecimiento_id = test_establecimiento_id 
          AND vacuna_id = test_vacuna_id 
          AND mes = 12 AND anio = 2024
    );
    
    -- =====================================================
    -- 5. ACTUALIZAR MOVIMIENTO DE NOVIEMBRE (TRIGGER SE EJECUTARÁ)
    -- =====================================================
    
    RAISE NOTICE '=== ACTUALIZANDO MOVIMIENTO DE NOVIEMBRE ===';
    
    -- Actualizar el campo entrega (esto debería disparar el trigger)
    UPDATE movimientos_vacunas 
    SET entrega = 40, -- Cambiar de 30 a 40
        observaciones = 'Movimiento actualizado - Trigger debería ejecutarse'
    WHERE establecimiento_id = test_establecimiento_id 
      AND vacuna_id = test_vacuna_id 
      AND mes = 11 AND anio = 2024;
    
    RAISE NOTICE 'Movimiento de Noviembre actualizado';
    
    -- =====================================================
    -- 6. VERIFICAR RESULTADO FINAL
    -- =====================================================
    
    RAISE NOTICE '=== RESULTADO FINAL ===';
    
    -- Mostrar nuevo stock calculado de Noviembre
    PERFORM (
        SELECT RAISE(NOTICE, 'Noviembre 2024 - Nuevo stock calculado: %', 
                     (saldo_anterior + trans_ingreso - salida - trans_salida + entrega))
        FROM movimientos_vacunas 
        WHERE establecimiento_id = test_establecimiento_id 
          AND vacuna_id = test_vacuna_id 
          AND mes = 11 AND anio = 2024
    );
    
    -- Mostrar saldo anterior actualizado de Diciembre
    PERFORM (
        SELECT RAISE(NOTICE, 'Diciembre 2024 - Saldo anterior actualizado: %', saldo_anterior)
        FROM movimientos_vacunas 
        WHERE establecimiento_id = test_establecimiento_id 
          AND vacuna_id = test_vacuna_id 
          AND mes = 12 AND anio = 2024
    );
    
    -- Verificar que la actualización fue correcta
    IF (SELECT saldo_anterior FROM movimientos_vacunas 
        WHERE establecimiento_id = test_establecimiento_id 
          AND vacuna_id = test_vacuna_id 
          AND mes = 12 AND anio = 2024) = 150 THEN -- 100+50-20-10+40 = 160, pero verificar cálculo real
        RAISE NOTICE '✅ PRUEBA EXITOSA: El saldo anterior se actualizó correctamente';
    ELSE
        RAISE NOTICE '❌ PRUEBA FALLIDA: El saldo anterior no se actualizó como se esperaba';
    END IF;
    
    RAISE NOTICE '=== PRUEBA COMPLETADA ===';
    
END $$;

-- =====================================================
-- 7. CONSULTA FINAL PARA VERIFICAR MANUALMENTE
-- =====================================================

-- Consulta para ver los resultados finales
SELECT 
    e.nombre as establecimiento,
    v.nombre as vacuna,
    mv.mes,
    mv.anio,
    mv.saldo_anterior,
    mv.trans_ingreso,
    mv.salida,
    mv.trans_salida,
    mv.entrega,
    (mv.saldo_anterior + mv.trans_ingreso - mv.salida - mv.trans_salida + mv.entrega) as stock_calculado,
    mv.observaciones,
    mv.updated_at
FROM movimientos_vacunas mv
JOIN establecimientos e ON mv.establecimiento_id = e.id
JOIN vacunas v ON mv.vacuna_id = v.id
WHERE mv.anio = 2024 
  AND mv.mes IN (11, 12)
ORDER BY mv.mes;
