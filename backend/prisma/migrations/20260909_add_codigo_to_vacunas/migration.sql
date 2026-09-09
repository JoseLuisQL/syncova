-- AlterTable: Agregar columna codigo a vacunas
ALTER TABLE "vacunas" ADD COLUMN IF NOT EXISTS "codigo" VARCHAR(50);

-- CreateIndex
CREATE INDEX IF NOT EXISTS "idx_vacunas_codigo" ON "vacunas"("codigo");

-- Migración de datos existentes:
-- 1. Si el nombre tiene formato "CODIGO - NOMBRE" (ej: "02541 - AMA" o "BCG - BCG"):
UPDATE "vacunas"
SET
  "codigo" = TRIM(SUBSTRING("nombre" FROM '^([A-Za-z0-9_\-]+)\s*[-:]\s*(.+)$')),
  "nombre" = TRIM(SUBSTRING("nombre" FROM '^[A-Za-z0-9_\-]+\s*[-:]\s*(.+)$'))
WHERE
  ("codigo" IS NULL OR "codigo" = '')
  AND "nombre" ~ '^[A-Za-z0-9_\-]+\s*[-:]\s*.+$';

-- 2. Si el nombre tiene formato "[CODIGO] NOMBRE":
UPDATE "vacunas"
SET
  "codigo" = TRIM(SUBSTRING("nombre" FROM '^\[([A-Za-z0-9_\-]+)\]\s*(.+)$')),
  "nombre" = TRIM(SUBSTRING("nombre" FROM '^\[[A-Za-z0-9_\-]+\]\s*(.+)$'))
WHERE
  ("codigo" IS NULL OR "codigo" = '')
  AND "nombre" ~ '^\[[A-Za-z0-9_\-]+\]\s*.+$';
