CREATE TABLE IF NOT EXISTS "usuarios_centros_acopio" (
  "id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  "usuario_id" UUID NOT NULL REFERENCES "usuarios"("id") ON DELETE CASCADE,
  "centro_acopio_id" UUID NOT NULL REFERENCES "centros_acopio"("id") ON DELETE CASCADE,
  "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT NOW(),
  CONSTRAINT "uk_usuario_centro_acopio" UNIQUE ("usuario_id", "centro_acopio_id")
);

CREATE INDEX IF NOT EXISTS "idx_usuario_centro_usuario"
  ON "usuarios_centros_acopio" ("usuario_id");

CREATE INDEX IF NOT EXISTS "idx_usuario_centro_centro"
  ON "usuarios_centros_acopio" ("centro_acopio_id");
