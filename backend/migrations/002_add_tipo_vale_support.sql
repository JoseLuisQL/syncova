-- =====================================================
-- MIGRACIÓN: Soporte para Tipos de Vale
-- Descripción: Agrega el enum tipo_vale y el campo tipo_vale a la tabla vales_entrega
-- Fecha: 2024-12-23
-- =====================================================

-- Habilitar extensión UUID si no está habilitada
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- CREAR ENUM TIPO_VALE
-- =====================================================

-- Crear el enum tipo_vale si no existe
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'tipo_vale') THEN
        CREATE TYPE tipo_vale AS ENUM (
            'completo',
            'solo_base', 
            'solo_adicionales'
        );
        RAISE NOTICE 'Enum tipo_vale creado exitosamente';
    ELSE
        RAISE NOTICE 'Enum tipo_vale ya existe, omitiendo creación';
    END IF;
END $$;

-- =====================================================
-- AGREGAR CAMPO TIPO_VALE A TABLA VALES_ENTREGA
-- =====================================================

-- Agregar la columna tipo_vale si no existe
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'vales_entrega' 
        AND column_name = 'tipo_vale'
    ) THEN
        -- Agregar la columna con valor por defecto
        ALTER TABLE vales_entrega 
        ADD COLUMN tipo_vale tipo_vale NOT NULL DEFAULT 'completo';
        
        RAISE NOTICE 'Columna tipo_vale agregada a tabla vales_entrega';
    ELSE
        RAISE NOTICE 'Columna tipo_vale ya existe en tabla vales_entrega';
    END IF;
END $$;

-- =====================================================
-- ACTUALIZAR CONSTRAINT ÚNICO
-- =====================================================

-- Eliminar el constraint único anterior si existe (solo centro_acopio_id, mes, anio)
DO $$
BEGIN
    -- Buscar constraints únicos existentes en la tabla vales_entrega
    IF EXISTS (
        SELECT 1 FROM information_schema.table_constraints tc
        JOIN information_schema.key_column_usage kcu ON tc.constraint_name = kcu.constraint_name
        WHERE tc.table_name = 'vales_entrega' 
        AND tc.constraint_type = 'UNIQUE'
        AND kcu.column_name IN ('centro_acopio_id', 'mes', 'anio')
        AND tc.constraint_name != 'uk_centro_periodo_tipo'
    ) THEN
        -- Obtener el nombre del constraint existente
        DECLARE
            constraint_name_to_drop TEXT;
        BEGIN
            SELECT tc.constraint_name INTO constraint_name_to_drop
            FROM information_schema.table_constraints tc
            JOIN information_schema.key_column_usage kcu ON tc.constraint_name = kcu.constraint_name
            WHERE tc.table_name = 'vales_entrega' 
            AND tc.constraint_type = 'UNIQUE'
            AND kcu.column_name IN ('centro_acopio_id', 'mes', 'anio')
            AND tc.constraint_name != 'uk_centro_periodo_tipo'
            LIMIT 1;
            
            IF constraint_name_to_drop IS NOT NULL THEN
                EXECUTE 'ALTER TABLE vales_entrega DROP CONSTRAINT ' || constraint_name_to_drop;
                RAISE NOTICE 'Constraint único anterior % eliminado', constraint_name_to_drop;
            END IF;
        END;
    END IF;
END $$;

-- Agregar campo para identificador único de grupos de entregas adicionales
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'vales_entrega'
        AND column_name = 'grupos_entregas_adicionales'
    ) THEN
        -- Agregar la columna para almacenar los grupos de entregas adicionales como texto
        ALTER TABLE vales_entrega
        ADD COLUMN grupos_entregas_adicionales TEXT;

        RAISE NOTICE 'Columna grupos_entregas_adicionales agregada a tabla vales_entrega';
    ELSE
        RAISE NOTICE 'Columna grupos_entregas_adicionales ya existe en tabla vales_entrega';
    END IF;
END $$;

-- Crear el nuevo constraint único que maneja múltiples vales de entregas adicionales
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints
        WHERE table_name = 'vales_entrega'
        AND constraint_name = 'uk_centro_periodo_tipo_grupos'
    ) THEN
        -- Para vales completo y solo_base: único por centro/mes/año/tipo
        -- Para vales solo_adicionales: único por centro/mes/año/tipo/grupos
        ALTER TABLE vales_entrega
        ADD CONSTRAINT uk_centro_periodo_tipo_grupos
        UNIQUE (centro_acopio_id, mes, anio, tipo_vale, grupos_entregas_adicionales);

        RAISE NOTICE 'Constraint único uk_centro_periodo_tipo_grupos creado exitosamente';
    ELSE
        RAISE NOTICE 'Constraint único uk_centro_periodo_tipo_grupos ya existe';
    END IF;
END $$;

-- =====================================================
-- CREAR ÍNDICES ADICIONALES
-- =====================================================

-- Crear índice para tipo_vale si no existe
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_indexes 
        WHERE tablename = 'vales_entrega' 
        AND indexname = 'idx_vales_tipo_vale'
    ) THEN
        CREATE INDEX idx_vales_tipo_vale ON vales_entrega(tipo_vale);
        RAISE NOTICE 'Índice idx_vales_tipo_vale creado exitosamente';
    ELSE
        RAISE NOTICE 'Índice idx_vales_tipo_vale ya existe';
    END IF;
END $$;

-- Crear índice compuesto para consultas frecuentes
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_indexes 
        WHERE tablename = 'vales_entrega' 
        AND indexname = 'idx_vales_centro_periodo_tipo'
    ) THEN
        CREATE INDEX idx_vales_centro_periodo_tipo ON vales_entrega(centro_acopio_id, mes, anio, tipo_vale);
        RAISE NOTICE 'Índice idx_vales_centro_periodo_tipo creado exitosamente';
    ELSE
        RAISE NOTICE 'Índice idx_vales_centro_periodo_tipo ya existe';
    END IF;
END $$;

-- =====================================================
-- VERIFICACIÓN FINAL
-- =====================================================

-- Verificar que todo se creó correctamente
DO $$
DECLARE
    enum_exists BOOLEAN;
    column_exists BOOLEAN;
    constraint_exists BOOLEAN;
BEGIN
    -- Verificar enum
    SELECT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'tipo_vale') INTO enum_exists;
    
    -- Verificar columna
    SELECT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'vales_entrega' AND column_name = 'tipo_vale'
    ) INTO column_exists;
    
    -- Verificar constraint
    SELECT EXISTS (
        SELECT 1 FROM information_schema.table_constraints
        WHERE table_name = 'vales_entrega' AND constraint_name = 'uk_centro_periodo_tipo_grupos'
    ) INTO constraint_exists;
    
    -- Mostrar resultados
    RAISE NOTICE '=== VERIFICACIÓN FINAL ===';
    RAISE NOTICE 'Enum tipo_vale existe: %', enum_exists;
    RAISE NOTICE 'Columna tipo_vale existe: %', column_exists;
    RAISE NOTICE 'Constraint uk_centro_periodo_tipo_grupos existe: %', constraint_exists;
    
    IF enum_exists AND column_exists AND constraint_exists THEN
        RAISE NOTICE '✅ Migración completada exitosamente';
    ELSE
        RAISE EXCEPTION '❌ Error en la migración: algunos elementos no se crearon correctamente';
    END IF;
END $$;
