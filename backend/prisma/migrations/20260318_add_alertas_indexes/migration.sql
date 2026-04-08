CREATE INDEX IF NOT EXISTS idx_alertas_leida_usuario_fecha
  ON alertas (leida, usuario_id, fecha_creacion DESC);

CREATE INDEX IF NOT EXISTS idx_alertas_tipo_fecha
  ON alertas (tipo, fecha_creacion DESC);

CREATE INDEX IF NOT EXISTS idx_alertas_nivel_fecha
  ON alertas (nivel, fecha_creacion DESC);

CREATE INDEX IF NOT EXISTS idx_alertas_fecha_vencimiento
  ON alertas (fecha_vencimiento);
