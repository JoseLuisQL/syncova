CREATE TABLE IF NOT EXISTS ici_demid_registros (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  establecimiento_id UUID NOT NULL REFERENCES establecimientos(id) ON DELETE CASCADE,
  vacuna_id UUID NOT NULL REFERENCES vacunas(id) ON DELETE RESTRICT,
  anio INTEGER NOT NULL,
  micro_red VARCHAR(255) NOT NULL,
  codigo_med VARCHAR(50) NOT NULL,
  medicamento_original VARCHAR(255) NOT NULL,
  medff VARCHAR(50),
  medtip VARCHAR(50),
  medpet VARCHAR(50),
  medest VARCHAR(50),
  distribucion_mensual INTEGER[] NOT NULL DEFAULT ARRAY[]::INTEGER[],
  meses_disponibles INTEGER[] NOT NULL DEFAULT ARRAY[]::INTEGER[],
  stock_fin INTEGER NOT NULL DEFAULT 0,
  total_distribu INTEGER NOT NULL DEFAULT 0,
  mes_rotacion INTEGER,
  cpma DECIMAL(12,4),
  mes_abastec DECIMAL(12,4),
  disponibilidad VARCHAR(100),
  situacion VARCHAR(100),
  fec_exp DATE,
  requerimiento DECIMAL(12,4),
  ajuste DECIMAL(12,4),
  archivo_nombre VARCHAR(255),
  usuario_id UUID REFERENCES usuarios(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ(6) NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ(6) NOT NULL DEFAULT NOW(),
  CONSTRAINT uk_ici_demid_establecimiento_vacuna_anio UNIQUE (establecimiento_id, vacuna_id, anio)
);

CREATE INDEX IF NOT EXISTS idx_ici_demid_anio
  ON ici_demid_registros (anio);

CREATE INDEX IF NOT EXISTS idx_ici_demid_establecimiento
  ON ici_demid_registros (establecimiento_id);

CREATE INDEX IF NOT EXISTS idx_ici_demid_vacuna
  ON ici_demid_registros (vacuna_id);
