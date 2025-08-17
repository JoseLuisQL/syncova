-- =====================================================
-- MIGRACIÓN SIMPLE: Configuración Jeringa-Vacuna
-- Descripción: Agrega tablas básicas para configurar multiplicadores de jeringas por vacuna
-- Fecha: 2024-12-17
-- =====================================================

-- Habilitar extensión UUID si no está habilitada
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- TABLA: configuracion_jeringa_vacuna_defecto
-- =====================================================

CREATE TABLE configuracion_jeringa_vacuna_defecto (
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

CREATE TABLE configuracion_jeringa_vacuna_centro (
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
CREATE INDEX idx_config_defecto_vacuna ON configuracion_jeringa_vacuna_defecto(vacuna_id);
CREATE INDEX idx_config_defecto_jeringa ON configuracion_jeringa_vacuna_defecto(jeringa_id);
CREATE INDEX idx_config_defecto_activo ON configuracion_jeringa_vacuna_defecto(activo);
CREATE INDEX idx_config_defecto_prioridad ON configuracion_jeringa_vacuna_defecto(vacuna_id, prioridad);

-- Índices para configuracion_jeringa_vacuna_centro
CREATE INDEX idx_config_centro_centro ON configuracion_jeringa_vacuna_centro(centro_acopio_id);
CREATE INDEX idx_config_centro_vacuna ON configuracion_jeringa_vacuna_centro(vacuna_id);
CREATE INDEX idx_config_centro_jeringa ON configuracion_jeringa_vacuna_centro(jeringa_id);
CREATE INDEX idx_config_centro_activo ON configuracion_jeringa_vacuna_centro(activo);
CREATE INDEX idx_config_centro_prioridad ON configuracion_jeringa_vacuna_centro(centro_acopio_id, vacuna_id, prioridad);
