-- =====================================================
-- SIVAC - Sistema de Gestión de Vacunas
-- Base de Datos PostgreSQL
-- Diseñado para funcionalidades del frontend
-- =====================================================

-- Crear base de datos (ejecutar como superusuario)
-- CREATE DATABASE sivac;
-- \c sivac;

-- Crear extensiones necesarias
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- TIPOS ENUMERADOS
-- =====================================================

-- Tipos de establecimiento
CREATE TYPE tipo_establecimiento AS ENUM (
    'centro_acopio',
    'centro_salud', 
    'puesto_salud'
);

-- Estados generales
CREATE TYPE estado_general AS ENUM (
    'activo',
    'inactivo'
);

-- Estados de planificación
CREATE TYPE estado_planificacion AS ENUM (
    'borrador',
    'aprobado',
    'ejecutado'
);

-- Estados de lotes
CREATE TYPE estado_lote AS ENUM (
    'disponible',
    'vencido',
    'agotado'
);

-- Formas de ingreso
CREATE TYPE forma_ingreso AS ENUM (
    '1° TRIMESTRE',
    '2° TRIMESTRE', 
    '3° TRIMESTRE',
    '4° TRIMESTRE'
);

-- Clases de comprobante
CREATE TYPE comprobante_clase AS ENUM (
    'PECOSA',
    'GUIA',
    'TRASLADO',
    'OTROS'
);

-- Roles de usuario
CREATE TYPE rol_usuario AS ENUM (
    'administrador',
    'coordinador',
    'responsable_acopio',
    'operador'
);

-- Tipos de movimiento kardex
CREATE TYPE tipo_movimiento_kardex AS ENUM (
    'ingreso',
    'salida',
    'transferencia',
    'ajuste'
);

-- Estados de vale de entrega
CREATE TYPE estado_vale AS ENUM (
    'generado',
    'impreso',
    'entregado'
);

-- Tipos de alerta
CREATE TYPE tipo_alerta AS ENUM (
    'vencimiento',
    'stock_bajo',
    'discrepancia',
    'sistema'
);

-- Niveles de alerta
CREATE TYPE nivel_alerta AS ENUM (
    'info',
    'warning',
    'error',
    'success'
);

-- =====================================================
-- TABLAS PRINCIPALES
-- =====================================================

-- Tabla de establecimientos (centros de acopio y establecimientos de salud)
CREATE TABLE establecimientos (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    nombre VARCHAR(255) NOT NULL,
    tipo tipo_establecimiento NOT NULL,
    codigo VARCHAR(50) NOT NULL UNIQUE,
    centro_acopio_id UUID REFERENCES establecimientos(id),
    direccion TEXT NOT NULL,
    responsable VARCHAR(255) NOT NULL,
    telefono VARCHAR(20),
    estado estado_general NOT NULL DEFAULT 'activo',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    
    -- Constraints
    CONSTRAINT chk_centro_acopio_jerarquia CHECK (
        (tipo = 'centro_acopio' AND centro_acopio_id IS NULL) OR
        (tipo IN ('centro_salud', 'puesto_salud') AND centro_acopio_id IS NOT NULL)
    )
);

-- Tabla de vacunas
CREATE TABLE vacunas (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    nombre VARCHAR(255) NOT NULL,
    tipo VARCHAR(100) NOT NULL,
    presentacion VARCHAR(100) NOT NULL,
    dosis_por_frasco INTEGER NOT NULL DEFAULT 1,
    tiempo_vida_util INTEGER NOT NULL, -- en días
    temperatura_almacenamiento VARCHAR(50) NOT NULL,
    estado estado_general NOT NULL DEFAULT 'activo',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    
    -- Constraints
    CONSTRAINT chk_dosis_positiva CHECK (dosis_por_frasco > 0),
    CONSTRAINT chk_vida_util_positiva CHECK (tiempo_vida_util > 0)
);

-- Tabla de jeringas
CREATE TABLE jeringas (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tipo VARCHAR(100) NOT NULL,
    capacidad VARCHAR(20) NOT NULL,
    color VARCHAR(50) NOT NULL,
    estado estado_general NOT NULL DEFAULT 'activo',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Tabla de lotes de vacunas
CREATE TABLE lotes_vacunas (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    numero VARCHAR(100) NOT NULL UNIQUE,
    vacuna_id UUID NOT NULL REFERENCES vacunas(id),
    fecha_ingreso DATE NOT NULL,
    fecha_vencimiento DATE NOT NULL,
    forma_ingreso forma_ingreso NOT NULL,
    comprobante_clase comprobante_clase NOT NULL,
    numero_comprobante VARCHAR(100) NOT NULL,
    cantidad_inicial INTEGER NOT NULL,
    cantidad_actual INTEGER NOT NULL,
    estado estado_lote NOT NULL DEFAULT 'disponible',
    observaciones TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    
    -- Constraints
    CONSTRAINT chk_cantidades_positivas CHECK (cantidad_inicial > 0 AND cantidad_actual >= 0),
    CONSTRAINT chk_cantidad_actual_valida CHECK (cantidad_actual <= cantidad_inicial),
    CONSTRAINT chk_fechas_validas CHECK (fecha_vencimiento > fecha_ingreso)
);

-- Tabla de lotes de jeringas
CREATE TABLE lotes_jeringas (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    jeringa_id UUID NOT NULL REFERENCES jeringas(id),
    numero VARCHAR(100) NOT NULL UNIQUE,
    fecha_ingreso DATE NOT NULL,
    fecha_vencimiento DATE,
    forma_ingreso forma_ingreso NOT NULL,
    comprobante_clase comprobante_clase NOT NULL,
    numero_comprobante VARCHAR(100) NOT NULL,
    cantidad_inicial INTEGER NOT NULL,
    cantidad_actual INTEGER NOT NULL,
    estado estado_lote NOT NULL DEFAULT 'disponible',
    observaciones TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    
    -- Constraints
    CONSTRAINT chk_cantidades_jeringas_positivas CHECK (cantidad_inicial > 0 AND cantidad_actual >= 0),
    CONSTRAINT chk_cantidad_jeringa_actual_valida CHECK (cantidad_actual <= cantidad_inicial)
);

-- Tabla de usuarios
CREATE TABLE usuarios (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    nombres VARCHAR(255) NOT NULL,
    apellidos VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    usuario VARCHAR(100) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    rol rol_usuario NOT NULL,
    establecimiento_id UUID REFERENCES establecimientos(id),
    estado estado_general NOT NULL DEFAULT 'activo',
    ultimo_acceso TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    
    -- Constraints
    CONSTRAINT chk_responsable_acopio_establecimiento CHECK (
        (rol = 'responsable_acopio' AND establecimiento_id IS NOT NULL) OR
        (rol != 'responsable_acopio')
    )
);

-- Tabla de planificación anual
CREATE TABLE planificacion_anual (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    establecimiento_id UUID NOT NULL REFERENCES establecimientos(id),
    vacuna_id UUID NOT NULL REFERENCES vacunas(id),
    anio INTEGER NOT NULL,
    meta_anual INTEGER NOT NULL,
    distribucion_mensual INTEGER[] NOT NULL, -- Array de 12 elementos (enero a diciembre)
    estado estado_planificacion NOT NULL DEFAULT 'borrador',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    
    -- Constraints
    CONSTRAINT chk_anio_valido CHECK (anio >= 2020 AND anio <= 2050),
    CONSTRAINT chk_meta_positiva CHECK (meta_anual > 0),
    CONSTRAINT chk_distribucion_12_meses CHECK (array_length(distribucion_mensual, 1) = 12),
    CONSTRAINT uk_planificacion_establecimiento_vacuna_anio UNIQUE (establecimiento_id, vacuna_id, anio)
);

-- Tabla de movimientos de vacunas (kardex mensual)
CREATE TABLE movimientos_vacunas (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    establecimiento_id UUID NOT NULL REFERENCES establecimientos(id),
    vacuna_id UUID NOT NULL REFERENCES vacunas(id),
    mes INTEGER NOT NULL CHECK (mes >= 1 AND mes <= 12),
    anio INTEGER NOT NULL CHECK (anio >= 2020 AND anio <= 2050),
    saldo_anterior INTEGER NOT NULL DEFAULT 0,
    trans_ingreso INTEGER NOT NULL DEFAULT 0,
    salida INTEGER NOT NULL DEFAULT 0,
    trans_salida INTEGER NOT NULL DEFAULT 0,
    entrega INTEGER NOT NULL DEFAULT 0, -- Desde planificación + entregas adicionales
    observaciones TEXT,
    fecha_movimiento DATE NOT NULL DEFAULT CURRENT_DATE,
    usuario_id UUID NOT NULL REFERENCES usuarios(id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    
    -- Constraints
    CONSTRAINT uk_movimiento_establecimiento_vacuna_mes_anio UNIQUE (establecimiento_id, vacuna_id, mes, anio)
);

-- Tabla de entregas adicionales
CREATE TABLE entregas_adicionales (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    movimiento_vacuna_id UUID NOT NULL REFERENCES movimientos_vacunas(id),
    numero_entrega INTEGER NOT NULL, -- 1, 2, 3... para múltiples entregas
    cantidad INTEGER NOT NULL,
    fecha_entrega DATE NOT NULL DEFAULT CURRENT_DATE,
    motivo TEXT,
    usuario_id UUID NOT NULL REFERENCES usuarios(id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    -- Constraints
    CONSTRAINT chk_cantidad_entrega_positiva CHECK (cantidad > 0),
    CONSTRAINT chk_numero_entrega_positivo CHECK (numero_entrega > 0),
    CONSTRAINT uk_movimiento_numero_entrega UNIQUE (movimiento_vacuna_id, numero_entrega)
);

-- Tabla de vales de entrega
CREATE TABLE vales_entrega (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    numero VARCHAR(50) NOT NULL UNIQUE,
    centro_acopio_id UUID NOT NULL REFERENCES establecimientos(id),
    mes INTEGER NOT NULL CHECK (mes >= 1 AND mes <= 12),
    anio INTEGER NOT NULL CHECK (anio >= 2020 AND anio <= 2050),
    fecha_generacion TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    estado estado_vale NOT NULL DEFAULT 'generado',
    total_vacunas INTEGER NOT NULL DEFAULT 0,
    total_establecimientos INTEGER NOT NULL DEFAULT 0,
    usuario_id UUID NOT NULL REFERENCES usuarios(id),
    observaciones TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    -- Constraints
    CONSTRAINT chk_totales_positivos CHECK (total_vacunas >= 0 AND total_establecimientos >= 0)
);

-- Tabla de detalle de vales de entrega
CREATE TABLE vales_detalle (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    vale_entrega_id UUID NOT NULL REFERENCES vales_entrega(id),
    establecimiento_id UUID NOT NULL REFERENCES establecimientos(id),
    vacuna_id UUID NOT NULL REFERENCES vacunas(id),
    cantidad_programada INTEGER NOT NULL DEFAULT 0,
    cantidad_adicional INTEGER NOT NULL DEFAULT 0,
    cantidad_total INTEGER GENERATED ALWAYS AS (cantidad_programada + cantidad_adicional) STORED,
    numero_entrega_adicional INTEGER, -- Para identificar qué entrega adicional
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    -- Constraints
    CONSTRAINT chk_cantidades_vale_positivas CHECK (cantidad_programada >= 0 AND cantidad_adicional >= 0),
    CONSTRAINT uk_vale_establecimiento_vacuna UNIQUE (vale_entrega_id, establecimiento_id, vacuna_id, numero_entrega_adicional)
);

-- Tabla de kardex (trazabilidad completa)
CREATE TABLE kardex (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tipo VARCHAR(20) NOT NULL CHECK (tipo IN ('vacuna', 'jeringa')),
    item_id UUID NOT NULL, -- ID de vacuna o jeringa
    lote_id UUID NOT NULL, -- ID de lote_vacunas o lote_jeringas
    tipo_movimiento tipo_movimiento_kardex NOT NULL,
    cantidad INTEGER NOT NULL,
    saldo_anterior INTEGER NOT NULL DEFAULT 0,
    saldo_actual INTEGER NOT NULL,
    establecimiento_origen_id UUID REFERENCES establecimientos(id),
    establecimiento_destino_id UUID REFERENCES establecimientos(id),
    documento VARCHAR(100) NOT NULL,
    numero_documento VARCHAR(100) NOT NULL,
    observaciones TEXT,
    usuario_id UUID NOT NULL REFERENCES usuarios(id),
    fecha_movimiento TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    -- Constraints
    CONSTRAINT chk_cantidad_kardex_positiva CHECK (cantidad > 0),
    CONSTRAINT chk_saldo_actual_positivo CHECK (saldo_actual >= 0),
    CONSTRAINT chk_movimiento_transferencia CHECK (
        (tipo_movimiento = 'transferencia' AND establecimiento_origen_id IS NOT NULL AND establecimiento_destino_id IS NOT NULL) OR
        (tipo_movimiento != 'transferencia')
    )
);

-- Tabla de alertas
CREATE TABLE alertas (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tipo tipo_alerta NOT NULL,
    titulo VARCHAR(255) NOT NULL,
    descripcion TEXT NOT NULL,
    nivel nivel_alerta NOT NULL,
    fecha_creacion TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    fecha_vencimiento TIMESTAMPTZ,
    leida BOOLEAN NOT NULL DEFAULT FALSE,
    usuario_id UUID REFERENCES usuarios(id),
    parametros JSONB, -- Para almacenar parámetros adicionales
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Tabla de configuración del sistema
CREATE TABLE configuracion_sistema (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    clave VARCHAR(100) NOT NULL UNIQUE,
    valor TEXT NOT NULL,
    descripcion TEXT,
    tipo_dato VARCHAR(20) NOT NULL DEFAULT 'string', -- string, number, boolean, json
    categoria VARCHAR(50) NOT NULL DEFAULT 'general',
    es_publico BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- =====================================================
-- ÍNDICES PARA OPTIMIZACIÓN
-- =====================================================

-- Índices para establecimientos
CREATE INDEX idx_establecimientos_tipo ON establecimientos(tipo);
CREATE INDEX idx_establecimientos_centro_acopio ON establecimientos(centro_acopio_id);
CREATE INDEX idx_establecimientos_estado ON establecimientos(estado);

-- Índices para vacunas
CREATE INDEX idx_vacunas_estado ON vacunas(estado);
CREATE INDEX idx_vacunas_tipo ON vacunas(tipo);

-- Índices para lotes
CREATE INDEX idx_lotes_vacunas_vacuna ON lotes_vacunas(vacuna_id);
CREATE INDEX idx_lotes_vacunas_estado ON lotes_vacunas(estado);
CREATE INDEX idx_lotes_vacunas_vencimiento ON lotes_vacunas(fecha_vencimiento);
CREATE INDEX idx_lotes_jeringas_jeringa ON lotes_jeringas(jeringa_id);

-- Índices para usuarios
CREATE INDEX idx_usuarios_rol ON usuarios(rol);
CREATE INDEX idx_usuarios_establecimiento ON usuarios(establecimiento_id);
CREATE INDEX idx_usuarios_estado ON usuarios(estado);

-- Índices para planificación
CREATE INDEX idx_planificacion_establecimiento ON planificacion_anual(establecimiento_id);
CREATE INDEX idx_planificacion_vacuna ON planificacion_anual(vacuna_id);
CREATE INDEX idx_planificacion_anio ON planificacion_anual(anio);

-- Índices para movimientos
CREATE INDEX idx_movimientos_establecimiento ON movimientos_vacunas(establecimiento_id);
CREATE INDEX idx_movimientos_vacuna ON movimientos_vacunas(vacuna_id);
CREATE INDEX idx_movimientos_mes_anio ON movimientos_vacunas(mes, anio);
CREATE INDEX idx_movimientos_fecha ON movimientos_vacunas(fecha_movimiento);

-- Índices para entregas adicionales
CREATE INDEX idx_entregas_adicionales_movimiento ON entregas_adicionales(movimiento_vacuna_id);
CREATE INDEX idx_entregas_adicionales_fecha ON entregas_adicionales(fecha_entrega);

-- Índices para vales
CREATE INDEX idx_vales_centro_acopio ON vales_entrega(centro_acopio_id);
CREATE INDEX idx_vales_mes_anio ON vales_entrega(mes, anio);
CREATE INDEX idx_vales_fecha ON vales_entrega(fecha_generacion);

-- Índices para kardex
CREATE INDEX idx_kardex_tipo_item ON kardex(tipo, item_id);
CREATE INDEX idx_kardex_lote ON kardex(lote_id);
CREATE INDEX idx_kardex_fecha ON kardex(fecha_movimiento);
CREATE INDEX idx_kardex_establecimiento_origen ON kardex(establecimiento_origen_id);
CREATE INDEX idx_kardex_establecimiento_destino ON kardex(establecimiento_destino_id);

-- Índices para alertas
CREATE INDEX idx_alertas_tipo ON alertas(tipo);
CREATE INDEX idx_alertas_nivel ON alertas(nivel);
CREATE INDEX idx_alertas_usuario ON alertas(usuario_id);
CREATE INDEX idx_alertas_leida ON alertas(leida);
CREATE INDEX idx_alertas_fecha ON alertas(fecha_creacion);

-- =====================================================
-- VISTAS PARA CÁLCULOS AUTOMÁTICOS
-- =====================================================

-- Vista para stock actual de vacunas
CREATE VIEW v_stock_vacunas AS
SELECT
    v.id as vacuna_id,
    v.nombre as vacuna_nombre,
    v.tipo as vacuna_tipo,
    v.presentacion,
    COALESCE(SUM(lv.cantidad_actual), 0) as stock_total,
    COUNT(lv.id) as total_lotes,
    COUNT(CASE WHEN lv.estado = 'disponible' THEN 1 END) as lotes_disponibles,
    COUNT(CASE WHEN lv.fecha_vencimiento <= CURRENT_DATE + INTERVAL '30 days' THEN 1 END) as lotes_por_vencer
FROM vacunas v
LEFT JOIN lotes_vacunas lv ON v.id = lv.vacuna_id AND lv.estado = 'disponible'
WHERE v.estado = 'activo'
GROUP BY v.id, v.nombre, v.tipo, v.presentacion;

-- Vista para movimientos con cálculos automáticos
CREATE VIEW v_movimientos_calculados AS
SELECT
    mv.*,
    (mv.saldo_anterior + mv.trans_ingreso) as total_saldo,
    (mv.saldo_anterior + mv.trans_ingreso - mv.salida - mv.trans_salida) as saldo,
    (mv.saldo_anterior + mv.trans_ingreso - mv.salida - mv.trans_salida + mv.entrega) as stock,
    -- Promedio de consumo (últimos 3 meses)
    COALESCE((
        SELECT AVG(mv2.salida + mv2.trans_salida)
        FROM movimientos_vacunas mv2
        WHERE mv2.establecimiento_id = mv.establecimiento_id
        AND mv2.vacuna_id = mv.vacuna_id
        AND (mv2.anio * 12 + mv2.mes) BETWEEN (mv.anio * 12 + mv.mes - 2) AND (mv.anio * 12 + mv.mes)
    ), 0) as promedio_consumo,
    e.nombre as establecimiento_nombre,
    v.nombre as vacuna_nombre
FROM movimientos_vacunas mv
JOIN establecimientos e ON mv.establecimiento_id = e.id
JOIN vacunas v ON mv.vacuna_id = v.id;

-- Vista para entregas totales por movimiento
CREATE VIEW v_entregas_totales AS
SELECT
    mv.id as movimiento_id,
    mv.entrega as entrega_programada,
    COALESCE(SUM(ea.cantidad), 0) as entregas_adicionales_total,
    (mv.entrega + COALESCE(SUM(ea.cantidad), 0)) as entrega_total
FROM movimientos_vacunas mv
LEFT JOIN entregas_adicionales ea ON mv.id = ea.movimiento_vacuna_id
GROUP BY mv.id, mv.entrega;

-- =====================================================
-- FUNCIONES AUXILIARES
-- =====================================================

-- Función para actualizar timestamp de updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- =====================================================
-- FUNCIÓN PARA ACTUALIZACIÓN AUTOMÁTICA DE SALDO ANTERIOR
-- =====================================================

-- Función para actualizar automáticamente el saldo anterior del siguiente mes
-- basado en el stock calculado del mes actual
CREATE OR REPLACE FUNCTION actualizar_saldo_anterior_siguiente_mes()
RETURNS TRIGGER AS $$
DECLARE
    stock_calculado INTEGER;
    siguiente_mes INTEGER;
    siguiente_anio INTEGER;
    movimiento_siguiente_mes RECORD;
BEGIN
    -- Calcular el stock del movimiento actual
    -- Stock = saldo_anterior + trans_ingreso - salida - trans_salida + entrega
    stock_calculado := NEW.saldo_anterior + NEW.trans_ingreso - NEW.salida - NEW.trans_salida + NEW.entrega;

    -- Calcular el siguiente mes y año
    IF NEW.mes = 12 THEN
        siguiente_mes := 1;
        siguiente_anio := NEW.anio + 1;
    ELSE
        siguiente_mes := NEW.mes + 1;
        siguiente_anio := NEW.anio;
    END IF;

    -- Buscar si existe un movimiento para el siguiente mes del mismo establecimiento y vacuna
    SELECT * INTO movimiento_siguiente_mes
    FROM movimientos_vacunas
    WHERE establecimiento_id = NEW.establecimiento_id
      AND vacuna_id = NEW.vacuna_id
      AND mes = siguiente_mes
      AND anio = siguiente_anio;

    -- Si existe el movimiento del siguiente mes, actualizar su saldo_anterior
    IF FOUND THEN
        UPDATE movimientos_vacunas
        SET saldo_anterior = stock_calculado,
            updated_at = NOW()
        WHERE establecimiento_id = NEW.establecimiento_id
          AND vacuna_id = NEW.vacuna_id
          AND mes = siguiente_mes
          AND anio = siguiente_anio;

        -- Log para debugging (opcional)
        RAISE NOTICE 'Saldo anterior actualizado: Establecimiento %, Vacuna %, Mes %/%, Stock: %',
                     NEW.establecimiento_id, NEW.vacuna_id, siguiente_mes, siguiente_anio, stock_calculado;
    END IF;

    RETURN NEW;
END;
$$ language 'plpgsql';

-- =====================================================
-- TRIGGERS PARA UPDATED_AT
-- =====================================================

CREATE TRIGGER update_establecimientos_updated_at BEFORE UPDATE ON establecimientos FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_vacunas_updated_at BEFORE UPDATE ON vacunas FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_jeringas_updated_at BEFORE UPDATE ON jeringas FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_lotes_vacunas_updated_at BEFORE UPDATE ON lotes_vacunas FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_lotes_jeringas_updated_at BEFORE UPDATE ON lotes_jeringas FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_usuarios_updated_at BEFORE UPDATE ON usuarios FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_planificacion_anual_updated_at BEFORE UPDATE ON planificacion_anual FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_movimientos_vacunas_updated_at BEFORE UPDATE ON movimientos_vacunas FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_vales_entrega_updated_at BEFORE UPDATE ON vales_entrega FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_alertas_updated_at BEFORE UPDATE ON alertas FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- TRIGGERS PARA ACTUALIZACIÓN AUTOMÁTICA DE SALDO ANTERIOR
-- =====================================================

-- Trigger para actualizar automáticamente el saldo anterior del siguiente mes
-- Se ejecuta después de INSERT o UPDATE en movimientos_vacunas
-- cuando cambian campos que afectan el cálculo del stock
CREATE TRIGGER actualizar_saldo_anterior_trigger
    AFTER INSERT OR UPDATE OF saldo_anterior, trans_ingreso, salida, trans_salida, entrega
    ON movimientos_vacunas
    FOR EACH ROW
    EXECUTE FUNCTION actualizar_saldo_anterior_siguiente_mes();
CREATE TRIGGER update_configuracion_sistema_updated_at BEFORE UPDATE ON configuracion_sistema FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- DATOS INICIALES (SEEDERS)
-- =====================================================

-- Insertar configuraciones básicas del sistema
INSERT INTO configuracion_sistema (clave, valor, descripcion, tipo_dato, categoria, es_publico) VALUES
('sistema_nombre', 'SIVAC - Sistema de Gestión de Vacunas', 'Nombre del sistema', 'string', 'general', true),
('institucion_nombre', 'DISA Apurímac II', 'Nombre de la institución', 'string', 'general', true),
('timezone', 'America/Lima', 'Zona horaria del sistema', 'string', 'general', false),
('stock_minimo_default', '100', 'Stock mínimo por defecto para alertas', 'number', 'alertas', false),
('dias_alerta_vencimiento', '30', 'Días antes del vencimiento para generar alerta', 'number', 'alertas', false);

-- Insertar centros de acopio
INSERT INTO establecimientos (id, nombre, tipo, codigo, direccion, responsable, telefono, estado) VALUES
('01234567-89ab-cdef-0123-456789abcdef', 'Centro de Acopio San Jerónimo', 'centro_acopio', 'CA-SJ', 'Jr. Lima 123, San Jerónimo', 'Dr. Carlos Mendoza', '983-456-789', 'activo'),
('12345678-9abc-def0-1234-56789abcdef0', 'Centro de Acopio Andahuaylas', 'centro_acopio', 'CA-AND', 'Av. Perú 456, Andahuaylas', 'Dra. María García', '983-654-321', 'activo'),
('23456789-abcd-ef01-2345-6789abcdef01', 'Centro de Acopio Chincheros', 'centro_acopio', 'CA-CH', 'Plaza de Armas 789, Chincheros', 'Lic. José Huamán', '983-789-456', 'activo');

-- Insertar establecimientos de salud bajo San Jerónimo
INSERT INTO establecimientos (id, nombre, tipo, codigo, centro_acopio_id, direccion, responsable, telefono, estado) VALUES
('34567890-bcde-f012-3456-789abcdef012', 'C.S. San Jerónimo', 'centro_salud', 'CS-SJ-001', '01234567-89ab-cdef-0123-456789abcdef', 'Jr. Cusco 234, San Jerónimo', 'Enf. Ana Quispe', '983-111-222', 'activo'),
('45678901-cdef-0123-4567-89abcdef0123', 'P.S. Poltoccsa', 'puesto_salud', 'PS-SJ-002', '01234567-89ab-cdef-0123-456789abcdef', 'Comunidad Poltoccsa', 'Tec. Pedro Choque', '983-333-444', 'activo'),
('56789012-def0-1234-5678-9abcdef01234', 'P.S. Ollabamba', 'puesto_salud', 'PS-SJ-003', '01234567-89ab-cdef-0123-456789abcdef', 'Distrito Ollabamba', 'Enf. Rosa Mamani', '983-555-666', 'activo'),
('67890123-ef01-2345-6789-abcdef012345', 'P.S. Cupisa', 'puesto_salud', 'PS-SJ-004', '01234567-89ab-cdef-0123-456789abcdef', 'Comunidad Cupisa', 'Tec. Luis Condori', '983-777-888', 'activo');

-- Insertar establecimientos de salud bajo Andahuaylas
INSERT INTO establecimientos (id, nombre, tipo, codigo, centro_acopio_id, direccion, responsable, telefono, estado) VALUES
('78901234-f012-3456-789a-bcdef0123456', 'Hospital EsSalud Andahuaylas', 'centro_salud', 'HOSP-AND-001', '12345678-9abc-def0-1234-56789abcdef0', 'Av. Confraternidad 567', 'Dr. Manuel Flores', '983-222-111', 'activo'),
('89012345-0123-4567-89ab-cdef01234567', 'C.S. Andahuaylas', 'centro_salud', 'CS-AND-002', '12345678-9abc-def0-1234-56789abcdef0', 'Jr. Ramón Castilla 890', 'Enf. Carmen Vilca', '983-444-333', 'activo'),
('90123456-1234-5678-9abc-def012345678', 'P.S. Huancas', 'puesto_salud', 'PS-AND-003', '12345678-9abc-def0-1234-56789abcdef0', 'Distrito Huancas', 'Tec. Juan Apaza', '983-666-555', 'activo');

-- Insertar establecimientos de salud bajo Chincheros
INSERT INTO establecimientos (id, nombre, tipo, codigo, centro_acopio_id, direccion, responsable, telefono, estado) VALUES
('a0123456-2345-6789-abcd-ef0123456789', 'C.S. Chincheros', 'centro_salud', 'CS-CH-001', '23456789-abcd-ef01-2345-6789abcdef01', 'Jr. Bolívar 345, Chincheros', 'Enf. Silvia Ramos', '983-888-777', 'activo'),
('b1234567-3456-789a-bcde-f01234567890', 'P.S. Anco Huallo', 'puesto_salud', 'PS-CH-002', '23456789-abcd-ef01-2345-6789abcdef01', 'Distrito Anco Huallo', 'Tec. Miguel Ccopa', '983-999-000', 'activo');

-- Insertar vacunas
INSERT INTO vacunas (id, nombre, tipo, presentacion, dosis_por_frasco, tiempo_vida_util, temperatura_almacenamiento, estado) VALUES
('c2345678-4567-89ab-cdef-012345678901', 'BCG', 'Antituberculosa', 'Frasco multidosis', 10, 1825, '2°C a 8°C', 'activo'),
('d3456789-5678-9abc-def0-123456789012', 'HVB Pediátrico', 'Hepatitis B', 'Frasco unidosis', 1, 1095, '2°C a 8°C', 'activo'),
('e4567890-6789-abcd-ef01-234567890123', 'HVB Adulto', 'Hepatitis B', 'Frasco unidosis', 1, 1095, '2°C a 8°C', 'activo'),
('f5678901-789a-bcde-f012-345678901234', 'Pentavalente', 'Combinada', 'Frasco unidosis', 1, 1095, '2°C a 8°C', 'activo'),
('a6789012-89ab-cdef-0123-456789012345', 'APO (Antipolio)', 'Antipoliomielítica', 'Frasco multidosis', 20, 730, '2°C a 8°C', 'activo'),
('b7890123-9abc-def0-1234-567890123456', 'Neumococo', 'Antineumocócica', 'Frasco unidosis', 1, 1095, '2°C a 8°C', 'activo'),
('c8901234-abcd-ef01-2345-678901234567', 'Rotavirus', 'Antirotavirus', 'Frasco unidosis', 1, 730, '2°C a 8°C', 'activo'),
('d9012345-bcde-f012-3456-789012345678', 'Influenza Pediátrica', 'Antigripal', 'Frasco unidosis', 1, 365, '2°C a 8°C', 'activo'),
('ea123456-cdef-0123-4567-890123456789', 'DPT', 'Triple bacteriana', 'Frasco unidosis', 1, 1095, '2°C a 8°C', 'activo'),
('fb234567-def0-1234-5678-901234567890', 'SPR', 'Triple viral', 'Frasco multidosis', 5, 730, '2°C a 8°C', 'activo');

-- Insertar jeringas
INSERT INTO jeringas (id, tipo, capacidad, color, estado) VALUES
('b1111111-1111-1111-1111-111111111111'::uuid, 'Desechable', '1ml', 'Transparente', 'activo'),
('b2222222-2222-2222-2222-222222222222'::uuid, 'Desechable', '3ml', 'Transparente', 'activo'),
('b3333333-3333-3333-3333-333333333333'::uuid, 'Desechable', '5ml', 'Transparente', 'activo');

-- Insertar usuarios
INSERT INTO usuarios (id, nombres, apellidos, email, usuario, password_hash, rol, establecimiento_id, estado) VALUES
('c1111111-1111-1111-1111-111111111111'::uuid, 'Administrador', 'del Sistema', 'admin@saludapurimac.gob.pe', 'admin', '$2b$10$example_hash_admin', 'administrador', NULL, 'activo'),
('c2222222-2222-2222-2222-222222222222'::uuid, 'María Elena', 'Rodríguez Vargas', 'coordinadora@saludapurimac.gob.pe', 'mrodriguez', '$2b$10$example_hash_coord', 'coordinador', NULL, 'activo'),
('c3333333-3333-3333-3333-333333333333'::uuid, 'Carlos Alberto', 'Mendoza López', 'cmendoza@saludapurimac.gob.pe', 'cmendoza', '$2b$10$example_hash_resp1', 'responsable_acopio', '11111111-1111-1111-1111-111111111111'::uuid, 'activo'),
('c4444444-4444-4444-4444-444444444444'::uuid, 'Ana Patricia', 'García Huamán', 'agarcia@saludapurimac.gob.pe', 'agarcia', '$2b$10$example_hash_resp2', 'responsable_acopio', '22222222-2222-2222-2222-222222222222'::uuid, 'activo'),
('c5555555-5555-5555-5555-555555555555'::uuid, 'José Luis', 'Huamán Ccopa', 'jhuaman@saludapurimac.gob.pe', 'jhuaman', '$2b$10$example_hash_resp3', 'responsable_acopio', '33333333-3333-3333-3333-333333333333'::uuid, 'activo');

-- Insertar lotes de vacunas
INSERT INTO lotes_vacunas (id, numero, vacuna_id, fecha_ingreso, fecha_vencimiento, forma_ingreso, comprobante_clase, numero_comprobante, cantidad_inicial, cantidad_actual, estado, observaciones) VALUES
('d1111111-1111-1111-1111-111111111111'::uuid, 'BCG-2024-001', 'a1111111-1111-1111-1111-111111111111'::uuid, '2024-01-15', '2026-01-15', '1° TRIMESTRE', 'PECOSA', 'P-001-2024', 500, 327, 'disponible', 'Lote en buen estado'),
('d2222222-2222-2222-2222-222222222222'::uuid, 'HVB-PED-2024-001', 'a2222222-2222-2222-2222-222222222222'::uuid, '2024-02-01', '2027-02-01', '1° TRIMESTRE', 'GUIA', 'G-002-2024', 1000, 756, 'disponible', 'Control de temperatura OK'),
('d3333333-3333-3333-3333-333333333333'::uuid, 'PENTA-2024-001', 'a4444444-4444-4444-4444-444444444444'::uuid, '2024-01-20', '2027-01-20', '1° TRIMESTRE', 'PECOSA', 'P-003-2024', 800, 542, 'disponible', 'Almacenamiento adecuado'),
('d4444444-4444-4444-4444-444444444444'::uuid, 'APO-2024-001', 'a5555555-5555-5555-5555-555555555555'::uuid, '2024-03-01', '2026-03-01', '1° TRIMESTRE', 'TRASLADO', 'T-004-2024', 300, 189, 'disponible', 'Verificar temperatura diariamente'),
('d5555555-5555-5555-5555-555555555555'::uuid, 'NEUMO-2024-001', 'a6666666-6666-6666-6666-666666666666'::uuid, '2024-02-15', '2027-02-15', '1° TRIMESTRE', 'PECOSA', 'P-005-2024', 600, 423, 'disponible', 'Lote prioritario para distribución');

-- Insertar planificación anual para 2025
INSERT INTO planificacion_anual (id, establecimiento_id, vacuna_id, anio, meta_anual, distribucion_mensual, estado) VALUES
-- BCG para establecimientos de San Jerónimo
('e1111111-1111-1111-1111-111111111111'::uuid, '44444444-4444-4444-4444-444444444444'::uuid, 'a1111111-1111-1111-1111-111111111111'::uuid, 2025, 144, '{12,12,12,12,12,12,12,12,12,12,12,12}', 'aprobado'),
('e2222222-2222-2222-2222-222222222222'::uuid, '55555555-5555-5555-5555-555555555555'::uuid, 'a1111111-1111-1111-1111-111111111111'::uuid, 2025, 60, '{5,5,5,5,5,5,5,5,5,5,5,5}', 'aprobado'),
-- Pentavalente para establecimientos de Andahuaylas
('e3333333-3333-3333-3333-333333333333'::uuid, '88888888-8888-8888-8888-888888888888'::uuid, 'a4444444-4444-4444-4444-444444444444'::uuid, 2025, 240, '{20,20,20,20,20,20,20,20,20,20,20,20}', 'aprobado'),
('e4444444-4444-4444-4444-444444444444'::uuid, '99999999-9999-9999-9999-999999999999'::uuid, 'a4444444-4444-4444-4444-444444444444'::uuid, 2025, 120, '{10,10,10,10,10,10,10,10,10,10,10,10}', 'aprobado');

-- Insertar movimientos de vacunas para junio 2024
INSERT INTO movimientos_vacunas (id, establecimiento_id, vacuna_id, mes, anio, saldo_anterior, trans_ingreso, salida, trans_salida, entrega, observaciones, fecha_movimiento, usuario_id) VALUES
('f1111111-1111-1111-1111-111111111111'::uuid, '44444444-4444-4444-4444-444444444444'::uuid, 'a1111111-1111-1111-1111-111111111111'::uuid, 6, 2024, 41, 0, 24, 0, 12, 'Movimiento regular de BCG', '2024-06-15', 'c3333333-3333-3333-3333-333333333333'::uuid),
('f2222222-2222-2222-2222-222222222222'::uuid, '88888888-8888-8888-8888-888888888888'::uuid, 'a1111111-1111-1111-1111-111111111111'::uuid, 6, 2024, 112, 0, 30, 0, 0, 'Sin entregas programadas', '2024-06-15', 'c4444444-4444-4444-4444-444444444444'::uuid),
('f3333333-3333-3333-3333-333333333333'::uuid, 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb'::uuid, 'a1111111-1111-1111-1111-111111111111'::uuid, 6, 2024, 35, 0, 8, 0, 10, 'Entrega regular', '2024-06-15', 'c5555555-5555-5555-5555-555555555555'::uuid);

-- Insertar entregas adicionales
INSERT INTO entregas_adicionales (id, movimiento_vacuna_id, numero_entrega, cantidad, fecha_entrega, motivo, usuario_id) VALUES
('g1111111-1111-1111-1111-111111111111'::uuid, 'f1111111-1111-1111-1111-111111111111'::uuid, 1, 15, '2024-06-20', 'Entrega adicional por demanda alta', 'c3333333-3333-3333-3333-333333333333'::uuid),
('g2222222-2222-2222-2222-222222222222'::uuid, 'f1111111-1111-1111-1111-111111111111'::uuid, 2, 8, '2024-06-25', 'Segunda entrega adicional', 'c3333333-3333-3333-3333-333333333333'::uuid);

-- Insertar alertas de ejemplo
INSERT INTO alertas (id, tipo, titulo, descripcion, nivel, fecha_creacion, fecha_vencimiento, leida, usuario_id, parametros) VALUES
('h1111111-1111-1111-1111-111111111111'::uuid, 'vencimiento', 'Vacunas próximas a vencer', 'El lote APO-2024-001 vencerá en 30 días', 'warning', '2024-12-01 10:00:00', '2026-03-01', false, 'c2222222-2222-2222-2222-222222222222'::uuid, '{"loteId": "d4444444-4444-4444-4444-444444444444", "vacunaId": "a5555555-5555-5555-5555-555555555555", "diasVencimiento": 30}'),
('h2222222-2222-2222-2222-222222222222'::uuid, 'stock_bajo', 'Stock bajo de BCG', 'El stock de BCG está por debajo del mínimo (327 unidades)', 'error', '2024-12-10 14:30:00', NULL, false, 'c2222222-2222-2222-2222-222222222222'::uuid, '{"vacunaId": "a1111111-1111-1111-1111-111111111111", "stockActual": 327, "stockMinimo": 400}'),
('h3333333-3333-3333-3333-333333333333'::uuid, 'sistema', 'Actualización completada', 'Se ha completado la actualización del sistema exitosamente', 'success', '2024-12-14 09:00:00', NULL, false, NULL, '{"version": "1.2.0"}');

-- =====================================================
-- COMENTARIOS FINALES
-- =====================================================

/*
INSTRUCCIONES DE USO:

1. Ejecutar este script en PostgreSQL como superusuario
2. Crear un usuario específico para la aplicación:
   CREATE USER sivac_user WITH PASSWORD 'tu_password_seguro';
   GRANT ALL PRIVILEGES ON DATABASE sivac TO sivac_user;
   GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO sivac_user;
   GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO sivac_user;

3. Configurar la conexión en tu aplicación con:
   - Host: localhost (o tu servidor)
   - Database: sivac
   - Username: sivac_user
   - Password: tu_password_seguro
   - Port: 5432

CARACTERÍSTICAS PRINCIPALES:

✅ Estructura jerárquica de establecimientos (centros de acopio → establecimientos)
✅ Gestión completa de vacunas y lotes con trazabilidad
✅ Planificación anual con distribución mensual (arrays de 12 elementos)
✅ Movimientos mensuales con cálculos automáticos en vistas
✅ Sistema de entregas adicionales flexible
✅ Kardex completo para trazabilidad
✅ Sistema de alertas con parámetros JSON
✅ Usuarios con roles y permisos por establecimiento
✅ Vales de entrega con detalle
✅ Configuración del sistema
✅ Índices optimizados para consultas frecuentes
✅ Vistas calculadas para reportes
✅ Triggers automáticos para updated_at
✅ Constraints de integridad de datos
✅ Datos de prueba realistas para 2025

NOTAS IMPORTANTES:

- Se usa 'anio' en lugar de 'año' para evitar problemas de codificación
- Los UUIDs están hardcodeados en los seeders para facilitar las relaciones
- Las contraseñas están hasheadas (usar bcrypt en producción)
- Los arrays de distribución mensual tienen exactamente 12 elementos
- Las vistas calculan automáticamente stock, saldo y promedios
- El sistema soporta múltiples entregas adicionales por movimiento
*/
