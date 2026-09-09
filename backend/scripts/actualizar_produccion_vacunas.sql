-- ============================================================================
-- SCRIPT DE ACTUALIZACIÓN EN PRODUCCIÓN: SEPARACIÓN DE CÓDIGOS DE VACUNAS
-- ============================================================================

-- 1. Agregar columna "codigo" a la tabla vacunas si no existe
ALTER TABLE "vacunas" ADD COLUMN IF NOT EXISTS "codigo" VARCHAR(50);

-- 2. Crear índice para optimizar búsquedas por código
CREATE INDEX IF NOT EXISTS "idx_vacunas_codigo" ON "vacunas"("codigo");

-- 3. Migrar y limpiar códigos existentes que están mezclados con el nombre
-- Patrón 1: "06377 - AMA" o "06420-BCG" o "17734: Pentavalente"
UPDATE "vacunas"
SET
  "codigo" = TRIM(SUBSTRING("nombre" FROM '^([A-Za-z0-9_\-]+)\s*[-:]\s*(.+)$')),
  "nombre" = TRIM(SUBSTRING("nombre" FROM '^[A-Za-z0-9_\-]+\s*[-:]\s*(.+)$'))
WHERE
  ("codigo" IS NULL OR "codigo" = '')
  AND "nombre" ~ '^[A-Za-z0-9_\-]+\s*[-:]\s*.+$';

-- Patrón 2: "[06377] AMA" o "(06377) AMA"
UPDATE "vacunas"
SET
  "codigo" = TRIM(SUBSTRING("nombre" FROM '^[\[\(]([A-Za-z0-9_\-]+)[\]\)]\s*(.+)$')),
  "nombre" = TRIM(SUBSTRING("nombre" FROM '^[\[\(][A-Za-z0-9_\-]+[\]\)]\s*(.+)$'))
WHERE
  ("codigo" IS NULL OR "codigo" = '')
  AND "nombre" ~ '^[\[\(][A-Za-z0-9_\-]+[\]\)]\s*.+$';

-- 4. Asegurar existencia de vacuna ANTIRRABICA (código 50814 de DEMID) si no existe
INSERT INTO "vacunas" (
  "id",
  "codigo",
  "nombre",
  "tipo",
  "presentacion",
  "dosis_por_frasco",
  "tiempo_vida_util",
  "temperatura_almacenamiento",
  "estado",
  "created_at",
  "updated_at"
)
SELECT
  uuid_generate_v4(),
  '50814',
  'ANTIRRABICA',
  'Antirrábica',
  'Frasco 1 dosis',
  1,
  730,
  '+2°C a +8°C',
  'activo',
  NOW(),
  NOW()
WHERE NOT EXISTS (
  SELECT 1 FROM "vacunas" WHERE UPPER("nombre") = 'ANTIRRABICA' OR "codigo" = '50814'
);

-- 5. Verificar resultado
SELECT "id", "codigo", "nombre", "tipo", "estado"
FROM "vacunas"
ORDER BY "nombre" ASC;
