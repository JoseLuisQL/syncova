-- =====================================================
-- SCRIPT DIRECTO: Reparar Constraints de Vales
-- Descripción: Elimina constraints problemáticos y crea el correcto
-- Fecha: 2024-12-23
-- =====================================================

-- Mostrar constraints actuales
SELECT 
    tc.constraint_name,
    tc.constraint_type,
    string_agg(kcu.column_name, ', ' ORDER BY kcu.ordinal_position) as columns
FROM information_schema.table_constraints tc
JOIN information_schema.key_column_usage kcu 
    ON tc.constraint_name = kcu.constraint_name
WHERE tc.table_name = 'vales_entrega' 
    AND tc.constraint_type = 'UNIQUE'
GROUP BY tc.constraint_name, tc.constraint_type
ORDER BY tc.constraint_name;

-- Eliminar cualquier constraint único que incluya centro_acopio_id, mes, anio, tipo_vale 
-- pero NO incluya grupos_entregas_adicionales
DO $$
DECLARE
    constraint_record RECORD;
BEGIN
    -- Buscar constraints problemáticos
    FOR constraint_record IN
        SELECT tc.constraint_name
        FROM information_schema.table_constraints tc
        JOIN information_schema.key_column_usage kcu 
            ON tc.constraint_name = kcu.constraint_name
        WHERE tc.table_name = 'vales_entrega' 
            AND tc.constraint_type = 'UNIQUE'
            AND tc.constraint_name != 'vales_entrega_numero_key'  -- No tocar el constraint del número
        GROUP BY tc.constraint_name
        HAVING 
            -- Debe incluir estas columnas
            bool_and(kcu.column_name IN ('centro_acopio_id', 'mes', 'anio', 'tipo_vale')) = true
            AND
            -- Pero NO debe incluir grupos_entregas_adicionales
            bool_and(kcu.column_name != 'grupos_entregas_adicionales') = true
    LOOP
        RAISE NOTICE 'Eliminando constraint problemático: %', constraint_record.constraint_name;
        EXECUTE 'ALTER TABLE vales_entrega DROP CONSTRAINT ' || quote_ident(constraint_record.constraint_name);
    END LOOP;
END $$;

-- Crear el constraint correcto si no existe
DO $$
BEGIN
    -- Verificar si ya existe un constraint correcto
    IF NOT EXISTS (
        SELECT 1
        FROM information_schema.table_constraints tc
        JOIN information_schema.key_column_usage kcu 
            ON tc.constraint_name = kcu.constraint_name
        WHERE tc.table_name = 'vales_entrega' 
            AND tc.constraint_type = 'UNIQUE'
        GROUP BY tc.constraint_name
        HAVING 
            -- Debe incluir exactamente estas 5 columnas
            array_agg(kcu.column_name ORDER BY kcu.column_name) = 
            ARRAY['anio', 'centro_acopio_id', 'grupos_entregas_adicionales', 'mes', 'tipo_vale']
    ) THEN
        RAISE NOTICE 'Creando constraint correcto: uk_centro_periodo_tipo_grupos';
        ALTER TABLE vales_entrega 
        ADD CONSTRAINT uk_centro_periodo_tipo_grupos 
        UNIQUE (centro_acopio_id, mes, anio, tipo_vale, grupos_entregas_adicionales);
    ELSE
        RAISE NOTICE 'Ya existe un constraint correcto';
    END IF;
END $$;

-- Verificación final
SELECT 
    tc.constraint_name,
    tc.constraint_type,
    string_agg(kcu.column_name, ', ' ORDER BY kcu.ordinal_position) as columns,
    CASE 
        WHEN string_agg(kcu.column_name, ', ' ORDER BY kcu.ordinal_position) LIKE '%grupos_entregas_adicionales%' 
        THEN '✅ CORRECTO'
        WHEN string_agg(kcu.column_name, ', ' ORDER BY kcu.ordinal_position) LIKE '%centro_acopio_id%' 
             AND string_agg(kcu.column_name, ', ' ORDER BY kcu.ordinal_position) LIKE '%tipo_vale%'
        THEN '❌ PROBLEMÁTICO'
        ELSE '✅ OK'
    END as status
FROM information_schema.table_constraints tc
JOIN information_schema.key_column_usage kcu 
    ON tc.constraint_name = kcu.constraint_name
WHERE tc.table_name = 'vales_entrega' 
    AND tc.constraint_type = 'UNIQUE'
GROUP BY tc.constraint_name, tc.constraint_type
ORDER BY tc.constraint_name;
