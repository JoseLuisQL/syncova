-- =====================================================
-- MIGRACIÓN: Configuración Jeringa-Vacuna
-- Descripción: Agrega tablas para configurar multiplicadores de jeringas por vacuna
-- Fecha: 2024-12-17
-- =====================================================

-- Habilitar extensión UUID si no está habilitada
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Verificar que las tablas base existen
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'vacunas') THEN
        RAISE EXCEPTION 'La tabla vacunas no existe. Ejecute primero las migraciones base.';
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'jeringas') THEN
        RAISE EXCEPTION 'La tabla jeringas no existe. Ejecute primero las migraciones base.';
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'centros_acopio') THEN
        RAISE EXCEPTION 'La tabla centros_acopio no existe. Ejecute primero las migraciones base.';
    END IF;
END $$;

-- =====================================================
-- TABLA: configuracion_jeringa_vacuna_defecto
-- =====================================================

CREATE TABLE IF NOT EXISTS configuracion_jeringa_vacuna_defecto (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    vacuna_id UUID NOT NULL,
    jeringa_id UUID NOT NULL,
    multiplicador DECIMAL(10,4) NOT NULL DEFAULT 1.0,
    prioridad INTEGER NOT NULL DEFAULT 1,
    activo BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    
    -- Constraints
    CONSTRAINT chk_multiplicador_positivo_defecto CHECK (multiplicador > 0),
    CONSTRAINT chk_prioridad_positiva_defecto CHECK (prioridad > 0),
    CONSTRAINT uk_vacuna_jeringa_defecto UNIQUE (vacuna_id, jeringa_id),
    
    -- Foreign Keys
    CONSTRAINT fk_config_defecto_vacuna FOREIGN KEY (vacuna_id) REFERENCES vacunas(id) ON DELETE CASCADE,
    CONSTRAINT fk_config_defecto_jeringa FOREIGN KEY (jeringa_id) REFERENCES jeringas(id) ON DELETE CASCADE
);

-- =====================================================
-- TABLA: configuracion_jeringa_vacuna_centro
-- =====================================================

CREATE TABLE IF NOT EXISTS configuracion_jeringa_vacuna_centro (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    centro_acopio_id UUID NOT NULL,
    vacuna_id UUID NOT NULL,
    jeringa_id UUID NOT NULL,
    multiplicador DECIMAL(10,4) NOT NULL DEFAULT 1.0,
    prioridad INTEGER NOT NULL DEFAULT 1,
    activo BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    
    -- Constraints
    CONSTRAINT chk_multiplicador_positivo_centro CHECK (multiplicador > 0),
    CONSTRAINT chk_prioridad_positiva_centro CHECK (prioridad > 0),
    CONSTRAINT uk_centro_vacuna_jeringa UNIQUE (centro_acopio_id, vacuna_id, jeringa_id),
    
    -- Foreign Keys
    CONSTRAINT fk_config_centro_centro FOREIGN KEY (centro_acopio_id) REFERENCES centros_acopio(id) ON DELETE CASCADE,
    CONSTRAINT fk_config_centro_vacuna FOREIGN KEY (vacuna_id) REFERENCES vacunas(id) ON DELETE CASCADE,
    CONSTRAINT fk_config_centro_jeringa FOREIGN KEY (jeringa_id) REFERENCES jeringas(id) ON DELETE CASCADE
);

-- =====================================================
-- ÍNDICES PARA OPTIMIZACIÓN
-- =====================================================

-- Índices para configuracion_jeringa_vacuna_defecto
CREATE INDEX IF NOT EXISTS idx_config_defecto_vacuna ON configuracion_jeringa_vacuna_defecto(vacuna_id);
CREATE INDEX IF NOT EXISTS idx_config_defecto_jeringa ON configuracion_jeringa_vacuna_defecto(jeringa_id);
CREATE INDEX IF NOT EXISTS idx_config_defecto_activo ON configuracion_jeringa_vacuna_defecto(activo);
CREATE INDEX IF NOT EXISTS idx_config_defecto_prioridad ON configuracion_jeringa_vacuna_defecto(vacuna_id, prioridad);

-- Índices para configuracion_jeringa_vacuna_centro
CREATE INDEX IF NOT EXISTS idx_config_centro_centro ON configuracion_jeringa_vacuna_centro(centro_acopio_id);
CREATE INDEX IF NOT EXISTS idx_config_centro_vacuna ON configuracion_jeringa_vacuna_centro(vacuna_id);
CREATE INDEX IF NOT EXISTS idx_config_centro_jeringa ON configuracion_jeringa_vacuna_centro(jeringa_id);
CREATE INDEX IF NOT EXISTS idx_config_centro_activo ON configuracion_jeringa_vacuna_centro(activo);
CREATE INDEX IF NOT EXISTS idx_config_centro_prioridad ON configuracion_jeringa_vacuna_centro(centro_acopio_id, vacuna_id, prioridad);

-- =====================================================
-- TRIGGERS PARA UPDATED_AT
-- =====================================================

-- Función para actualizar updated_at (si no existe)
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers para configuracion_jeringa_vacuna_defecto
DROP TRIGGER IF EXISTS update_configuracion_jeringa_vacuna_defecto_updated_at ON configuracion_jeringa_vacuna_defecto;
CREATE TRIGGER update_configuracion_jeringa_vacuna_defecto_updated_at 
    BEFORE UPDATE ON configuracion_jeringa_vacuna_defecto 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Triggers para configuracion_jeringa_vacuna_centro
DROP TRIGGER IF EXISTS update_configuracion_jeringa_vacuna_centro_updated_at ON configuracion_jeringa_vacuna_centro;
CREATE TRIGGER update_configuracion_jeringa_vacuna_centro_updated_at 
    BEFORE UPDATE ON configuracion_jeringa_vacuna_centro 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- DATOS DE EJEMPLO (OPCIONAL)
-- =====================================================

-- Insertar algunas configuraciones por defecto básicas
-- Solo si las tablas están vacías para evitar duplicados

DO $$
DECLARE
    vacuna_bcg_id UUID;
    vacuna_hvb_ped_id UUID;
    jeringa_1cc_id UUID;
BEGIN
    -- Buscar IDs de vacunas y jeringas existentes
    SELECT id INTO vacuna_bcg_id FROM vacunas WHERE nombre ILIKE '%BCG%' LIMIT 1;
    SELECT id INTO vacuna_hvb_ped_id FROM vacunas WHERE nombre ILIKE '%HVB%Pediatrico%' OR nombre ILIKE '%Hepatitis B%Pediatrico%' LIMIT 1;
    SELECT id INTO jeringa_1cc_id FROM jeringas WHERE capacidad = '1cc' LIMIT 1;
    
    -- Solo insertar si encontramos las entidades y no existen configuraciones
    IF vacuna_bcg_id IS NOT NULL AND jeringa_1cc_id IS NOT NULL THEN
        INSERT INTO configuracion_jeringa_vacuna_defecto (vacuna_id, jeringa_id, multiplicador, prioridad, activo)
        VALUES (vacuna_bcg_id, jeringa_1cc_id, 1.0, 1, TRUE)
        ON CONFLICT (vacuna_id, jeringa_id) DO NOTHING;
    END IF;
    
    IF vacuna_hvb_ped_id IS NOT NULL AND jeringa_1cc_id IS NOT NULL THEN
        INSERT INTO configuracion_jeringa_vacuna_defecto (vacuna_id, jeringa_id, multiplicador, prioridad, activo)
        VALUES (vacuna_hvb_ped_id, jeringa_1cc_id, 1.0, 1, TRUE)
        ON CONFLICT (vacuna_id, jeringa_id) DO NOTHING;
    END IF;
END $$;

-- =====================================================
-- VERIFICACIÓN FINAL
-- =====================================================

-- Verificar que las tablas se crearon correctamente
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'configuracion_jeringa_vacuna_defecto') THEN
        RAISE EXCEPTION 'Error: No se pudo crear la tabla configuracion_jeringa_vacuna_defecto';
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'configuracion_jeringa_vacuna_centro') THEN
        RAISE EXCEPTION 'Error: No se pudo crear la tabla configuracion_jeringa_vacuna_centro';
    END IF;
    
    RAISE NOTICE 'Migración completada exitosamente. Tablas de configuración jeringa-vacuna creadas.';
END $$;
