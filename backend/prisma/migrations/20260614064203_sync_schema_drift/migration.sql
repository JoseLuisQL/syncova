-- DropForeignKey
ALTER TABLE "ici_demid_registros" DROP CONSTRAINT "ici_demid_registros_establecimiento_id_fkey";

-- DropForeignKey
ALTER TABLE "ici_demid_registros" DROP CONSTRAINT "ici_demid_registros_usuario_id_fkey";

-- DropForeignKey
ALTER TABLE "ici_demid_registros" DROP CONSTRAINT "ici_demid_registros_vacuna_id_fkey";

-- DropIndex
DROP INDEX "idx_alertas_leida_usuario_fecha";

-- DropIndex
DROP INDEX "idx_alertas_nivel_fecha";

-- DropIndex
DROP INDEX "idx_alertas_tipo_fecha";

-- DropIndex
DROP INDEX "idx_movimientos_vacunas_version";

-- DropIndex
DROP INDEX "programacion_anual_cenares_anio_jeringa_id_key";

-- DropIndex
DROP INDEX "programacion_anual_cenares_anio_vacuna_id_key";

-- AlterTable
ALTER TABLE "movimientos_vacunas" DROP COLUMN "version";

-- AlterTable
ALTER TABLE "programacion_anual_cenares" DROP COLUMN "programado_t1",
DROP COLUMN "programado_t2",
DROP COLUMN "programado_t3",
DROP COLUMN "programado_t4",
ADD COLUMN     "programado_q1" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "programado_q2" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "programado_q3" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "programado_q4" INTEGER NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "usuarios" ADD COLUMN     "centro_acopio_id" UUID;

-- CreateTable
CREATE TABLE "usuarios_centros_acopio" (
    "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "usuario_id" UUID NOT NULL,
    "centro_acopio_id" UUID NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "usuarios_centros_acopio_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "stock_inicial_mensual" (
    "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "vacuna_id" UUID NOT NULL,
    "mes" INTEGER NOT NULL,
    "anio" INTEGER NOT NULL,
    "stock_inicial" INTEGER NOT NULL,
    "fecha_captura" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "observaciones" TEXT,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "stock_inicial_mensual_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "permisos_operativos" (
    "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "tipo" VARCHAR(50) NOT NULL,
    "usuario_id" UUID,
    "mes" INTEGER NOT NULL,
    "anio" INTEGER NOT NULL,
    "habilitado" BOOLEAN NOT NULL DEFAULT false,
    "programado" BOOLEAN NOT NULL DEFAULT false,
    "fecha_activacion" TIMESTAMPTZ(6),
    "fecha_desactivacion" TIMESTAMPTZ(6),
    "creado_por_id" UUID NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "permisos_operativos_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "idx_usuario_centro_usuario" ON "usuarios_centros_acopio"("usuario_id");

-- CreateIndex
CREATE INDEX "idx_usuario_centro_centro" ON "usuarios_centros_acopio"("centro_acopio_id");

-- CreateIndex
CREATE UNIQUE INDEX "usuarios_centros_acopio_usuario_id_centro_acopio_id_key" ON "usuarios_centros_acopio"("usuario_id", "centro_acopio_id");

-- CreateIndex
CREATE INDEX "idx_stock_inicial_vacuna" ON "stock_inicial_mensual"("vacuna_id");

-- CreateIndex
CREATE INDEX "idx_stock_inicial_periodo" ON "stock_inicial_mensual"("mes", "anio");

-- CreateIndex
CREATE UNIQUE INDEX "stock_inicial_mensual_vacuna_id_mes_anio_key" ON "stock_inicial_mensual"("vacuna_id", "mes", "anio");

-- CreateIndex
CREATE INDEX "idx_permiso_operativo_tipo_periodo" ON "permisos_operativos"("tipo", "mes", "anio");

-- CreateIndex
CREATE INDEX "idx_permiso_operativo_usuario" ON "permisos_operativos"("usuario_id");

-- CreateIndex
CREATE INDEX "idx_permiso_operativo_programado" ON "permisos_operativos"("habilitado", "fecha_activacion");

-- CreateIndex
CREATE UNIQUE INDEX "permisos_operativos_tipo_usuario_id_mes_anio_key" ON "permisos_operativos"("tipo", "usuario_id", "mes", "anio");

-- CreateIndex
CREATE INDEX "idx_alertas_leida_usuario_fecha" ON "alertas"("leida", "usuario_id", "fecha_creacion");

-- CreateIndex
CREATE INDEX "idx_alertas_tipo_fecha" ON "alertas"("tipo", "fecha_creacion");

-- CreateIndex
CREATE INDEX "idx_alertas_nivel_fecha" ON "alertas"("nivel", "fecha_creacion");

-- CreateIndex
CREATE INDEX "idx_programacion_cenares_anio" ON "programacion_anual_cenares"("anio");

-- CreateIndex
CREATE INDEX "idx_programacion_cenares_vacuna" ON "programacion_anual_cenares"("vacuna_id");

-- CreateIndex
CREATE INDEX "idx_programacion_cenares_jeringa" ON "programacion_anual_cenares"("jeringa_id");

-- CreateIndex
CREATE UNIQUE INDEX "programacion_anual_cenares_vacuna_id_anio_key" ON "programacion_anual_cenares"("vacuna_id", "anio");

-- CreateIndex
CREATE UNIQUE INDEX "programacion_anual_cenares_jeringa_id_anio_key" ON "programacion_anual_cenares"("jeringa_id", "anio");

-- CreateIndex
CREATE INDEX "idx_usuario_centro_acopio" ON "usuarios"("centro_acopio_id");

-- AddForeignKey
ALTER TABLE "usuarios" ADD CONSTRAINT "usuarios_centro_acopio_id_fkey" FOREIGN KEY ("centro_acopio_id") REFERENCES "centros_acopio"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "usuarios_centros_acopio" ADD CONSTRAINT "usuarios_centros_acopio_usuario_id_fkey" FOREIGN KEY ("usuario_id") REFERENCES "usuarios"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "usuarios_centros_acopio" ADD CONSTRAINT "usuarios_centros_acopio_centro_acopio_id_fkey" FOREIGN KEY ("centro_acopio_id") REFERENCES "centros_acopio"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ici_demid_registros" ADD CONSTRAINT "ici_demid_registros_establecimiento_id_fkey" FOREIGN KEY ("establecimiento_id") REFERENCES "establecimientos"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ici_demid_registros" ADD CONSTRAINT "ici_demid_registros_vacuna_id_fkey" FOREIGN KEY ("vacuna_id") REFERENCES "vacunas"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ici_demid_registros" ADD CONSTRAINT "ici_demid_registros_usuario_id_fkey" FOREIGN KEY ("usuario_id") REFERENCES "usuarios"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "stock_inicial_mensual" ADD CONSTRAINT "stock_inicial_mensual_vacuna_id_fkey" FOREIGN KEY ("vacuna_id") REFERENCES "vacunas"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "permisos_operativos" ADD CONSTRAINT "permisos_operativos_usuario_id_fkey" FOREIGN KEY ("usuario_id") REFERENCES "usuarios"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "permisos_operativos" ADD CONSTRAINT "permisos_operativos_creado_por_id_fkey" FOREIGN KEY ("creado_por_id") REFERENCES "usuarios"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- RenameIndex
ALTER INDEX "uk_ici_demid_establecimiento_vacuna_anio" RENAME TO "ici_demid_registros_establecimiento_id_vacuna_id_anio_key";

