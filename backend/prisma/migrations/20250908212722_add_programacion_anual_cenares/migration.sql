-- Required PostgreSQL extensions for UUID generation
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- CreateEnum
CREATE TYPE "TipoEstablecimiento" AS ENUM ('centro_salud', 'puesto_salud', 'hospital');

-- CreateEnum
CREATE TYPE "EstadoGeneral" AS ENUM ('activo', 'inactivo');

-- CreateEnum
CREATE TYPE "EstadoPlanificacion" AS ENUM ('borrador', 'aprobado', 'ejecutado');

-- CreateEnum
CREATE TYPE "EstadoLote" AS ENUM ('disponible', 'vencido', 'agotado');

-- CreateEnum
CREATE TYPE "FormaIngreso" AS ENUM ('1° TRIMESTRE', '2° TRIMESTRE', '3° TRIMESTRE', '4° TRIMESTRE');

-- CreateEnum
CREATE TYPE "ComprobanteClase" AS ENUM ('PECOSA', 'GUIA', 'TRASLADO', 'OTROS');

-- CreateEnum
CREATE TYPE "RolUsuario" AS ENUM ('administrador', 'coordinador', 'responsable_acopio', 'operador');

-- CreateEnum
CREATE TYPE "TipoMovimientoKardex" AS ENUM ('ingreso', 'salida', 'transferencia', 'ajuste');

-- CreateEnum
CREATE TYPE "EstadoVale" AS ENUM ('generado', 'impreso', 'entregado');

-- CreateEnum
CREATE TYPE "TipoVale" AS ENUM ('completo', 'solo_base', 'solo_adicionales');

-- CreateEnum
CREATE TYPE "TipoAlerta" AS ENUM ('vencimiento', 'stock_bajo', 'discrepancia', 'sistema');

-- CreateEnum
CREATE TYPE "NivelAlerta" AS ENUM ('info', 'warning', 'error', 'success');

-- CreateTable
CREATE TABLE "redes" (
    "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "nombre" VARCHAR(255) NOT NULL,
    "codigo" VARCHAR(50),
    "descripcion" TEXT,
    "estado" "EstadoGeneral" NOT NULL DEFAULT 'activo',
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "redes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "microredes" (
    "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "nombre" VARCHAR(255) NOT NULL,
    "codigo" VARCHAR(50),
    "descripcion" TEXT,
    "red_id" UUID NOT NULL,
    "estado" "EstadoGeneral" NOT NULL DEFAULT 'activo',
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "microredes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "centros_acopio" (
    "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "nombre" VARCHAR(255) NOT NULL,
    "codigo" VARCHAR(50),
    "microred_id" UUID,
    "direccion" TEXT NOT NULL,
    "responsable" VARCHAR(255) NOT NULL,
    "telefono" VARCHAR(20),
    "estado" "EstadoGeneral" NOT NULL DEFAULT 'activo',
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "centros_acopio_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "establecimientos" (
    "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "nombre" VARCHAR(255) NOT NULL,
    "tipo" "TipoEstablecimiento" NOT NULL,
    "codigo" VARCHAR(50) NOT NULL,
    "centro_acopio_id" UUID NOT NULL,
    "direccion" TEXT NOT NULL,
    "responsable" VARCHAR(255) NOT NULL,
    "telefono" VARCHAR(20),
    "estado" "EstadoGeneral" NOT NULL DEFAULT 'activo',
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "establecimientos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "vacunas" (
    "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "nombre" VARCHAR(255) NOT NULL,
    "tipo" VARCHAR(100) NOT NULL,
    "presentacion" VARCHAR(100) NOT NULL,
    "dosis_por_frasco" INTEGER NOT NULL,
    "tiempo_vida_util" INTEGER NOT NULL,
    "temperatura_almacenamiento" VARCHAR(50) NOT NULL,
    "estado" "EstadoGeneral" NOT NULL DEFAULT 'activo',
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "vacunas_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "jeringas" (
    "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "tipo" VARCHAR(100) NOT NULL,
    "capacidad" VARCHAR(20) NOT NULL,
    "color" VARCHAR(50) NOT NULL,
    "estado" "EstadoGeneral" NOT NULL DEFAULT 'activo',
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "jeringas_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "lotes_vacunas" (
    "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "numero" VARCHAR(100) NOT NULL,
    "vacuna_id" UUID NOT NULL,
    "fecha_ingreso" DATE NOT NULL,
    "fecha_vencimiento" DATE NOT NULL,
    "forma_ingreso" "FormaIngreso" NOT NULL,
    "comprobante_clase" "ComprobanteClase" NOT NULL,
    "numero_comprobante" VARCHAR(100) NOT NULL,
    "cantidad_inicial" INTEGER NOT NULL,
    "cantidad_actual" INTEGER NOT NULL,
    "estado" "EstadoLote" NOT NULL DEFAULT 'disponible',
    "observaciones" TEXT,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "lotes_vacunas_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "lotes_jeringas" (
    "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "jeringa_id" UUID NOT NULL,
    "numero" VARCHAR(100) NOT NULL,
    "fecha_ingreso" DATE NOT NULL,
    "fecha_vencimiento" DATE,
    "forma_ingreso" "FormaIngreso" NOT NULL,
    "comprobante_clase" "ComprobanteClase" NOT NULL,
    "numero_comprobante" VARCHAR(100) NOT NULL,
    "cantidad_inicial" INTEGER NOT NULL,
    "cantidad_actual" INTEGER NOT NULL,
    "estado" "EstadoLote" NOT NULL DEFAULT 'disponible',
    "observaciones" TEXT,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "lotes_jeringas_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "programacion_anual_cenares" (
    "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "anio" INTEGER NOT NULL,
    "vacuna_id" UUID,
    "jeringa_id" UUID,
    "programado_t1" INTEGER NOT NULL DEFAULT 0,
    "programado_t2" INTEGER NOT NULL DEFAULT 0,
    "programado_t3" INTEGER NOT NULL DEFAULT 0,
    "programado_t4" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "programacion_anual_cenares_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "usuarios" (
    "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "nombres" VARCHAR(255) NOT NULL,
    "apellidos" VARCHAR(255) NOT NULL,
    "email" VARCHAR(255) NOT NULL,
    "usuario" VARCHAR(100) NOT NULL,
    "password_hash" VARCHAR(255) NOT NULL,
    "rol" "RolUsuario" NOT NULL,
    "role_id" UUID,
    "establecimiento_id" UUID,
    "estado" "EstadoGeneral" NOT NULL DEFAULT 'activo',
    "ultimo_acceso" TIMESTAMPTZ(6),
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "usuarios_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "planificacion_anual" (
    "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "establecimiento_id" UUID NOT NULL,
    "vacuna_id" UUID NOT NULL,
    "anio" INTEGER NOT NULL,
    "meta_anual" INTEGER NOT NULL,
    "distribucion_mensual" INTEGER[],
    "estado" "EstadoPlanificacion" NOT NULL DEFAULT 'borrador',
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "planificacion_anual_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "movimientos_vacunas" (
    "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "establecimiento_id" UUID NOT NULL,
    "vacuna_id" UUID NOT NULL,
    "mes" INTEGER NOT NULL,
    "anio" INTEGER NOT NULL,
    "saldo_anterior" INTEGER NOT NULL DEFAULT 0,
    "trans_ingreso" INTEGER NOT NULL DEFAULT 0,
    "salida" INTEGER NOT NULL DEFAULT 0,
    "trans_salida" INTEGER NOT NULL DEFAULT 0,
    "entrega" INTEGER NOT NULL DEFAULT 0,
    "entrega_base" INTEGER,
    "observaciones" TEXT,
    "fecha_movimiento" DATE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "usuario_id" UUID NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "movimientos_vacunas_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "entregas_adicionales" (
    "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "movimiento_vacuna_id" UUID NOT NULL,
    "numero_entrega" INTEGER NOT NULL,
    "cantidad" INTEGER NOT NULL,
    "fecha_entrega" DATE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "motivo" TEXT,
    "usuario_id" UUID NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "entregas_adicionales_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "vales_entrega" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "numero" VARCHAR(50) NOT NULL,
    "centro_acopio_id" UUID NOT NULL,
    "mes" INTEGER NOT NULL,
    "anio" INTEGER NOT NULL,
    "fecha_generacion" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "estado" "EstadoVale" NOT NULL DEFAULT 'generado',
    "tipo_vale" "TipoVale" NOT NULL DEFAULT 'completo',
    "grupos_entregas_adicionales" TEXT,
    "total_vacunas" INTEGER NOT NULL DEFAULT 0,
    "total_establecimientos" INTEGER NOT NULL DEFAULT 0,
    "usuario_id" UUID NOT NULL,
    "observaciones" TEXT,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "vales_entrega_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "vales_detalle" (
    "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "vale_entrega_id" UUID NOT NULL,
    "establecimiento_id" UUID NOT NULL,
    "vacuna_id" UUID NOT NULL,
    "cantidad_programada" INTEGER NOT NULL DEFAULT 0,
    "cantidad_adicional" INTEGER NOT NULL DEFAULT 0,
    "numero_entrega_adicional" INTEGER,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "vales_detalle_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "kardex" (
    "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "tipo" VARCHAR(20) NOT NULL,
    "item_id" UUID NOT NULL,
    "lote_id" UUID NOT NULL,
    "tipo_movimiento" "TipoMovimientoKardex" NOT NULL,
    "cantidad" INTEGER NOT NULL,
    "saldo_anterior" INTEGER NOT NULL DEFAULT 0,
    "saldo_actual" INTEGER NOT NULL,
    "establecimiento_origen_id" UUID,
    "establecimiento_destino_id" UUID,
    "documento" VARCHAR(100) NOT NULL,
    "numero_documento" VARCHAR(100) NOT NULL,
    "observaciones" TEXT,
    "usuario_id" UUID NOT NULL,
    "fecha_movimiento" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "kardex_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "alertas" (
    "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "tipo" "TipoAlerta" NOT NULL,
    "titulo" VARCHAR(255) NOT NULL,
    "descripcion" TEXT NOT NULL,
    "nivel" "NivelAlerta" NOT NULL,
    "fecha_creacion" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "fecha_vencimiento" TIMESTAMPTZ(6),
    "leida" BOOLEAN NOT NULL DEFAULT false,
    "usuario_id" UUID,
    "parametros" JSONB,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "alertas_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "configuracion_sistema" (
    "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "clave" VARCHAR(100) NOT NULL,
    "valor" TEXT NOT NULL,
    "descripcion" TEXT,
    "tipo_dato" VARCHAR(20) NOT NULL DEFAULT 'string',
    "categoria" VARCHAR(50) NOT NULL DEFAULT 'general',
    "es_publico" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "configuracion_sistema_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "configuracion_jeringa_vacuna_defecto" (
    "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "vacuna_id" UUID NOT NULL,
    "jeringa_id" UUID NOT NULL,
    "multiplicador" DECIMAL(10,4) NOT NULL DEFAULT 1.0,
    "prioridad" INTEGER NOT NULL DEFAULT 1,
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "configuracion_jeringa_vacuna_defecto_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "configuracion_jeringa_vacuna_centro" (
    "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "centro_acopio_id" UUID NOT NULL,
    "vacuna_id" UUID NOT NULL,
    "jeringa_id" UUID NOT NULL,
    "multiplicador" DECIMAL(10,4) NOT NULL DEFAULT 1.0,
    "prioridad" INTEGER NOT NULL DEFAULT 1,
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "configuracion_jeringa_vacuna_centro_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "roles" (
    "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "nombre" VARCHAR(100) NOT NULL,
    "descripcion" VARCHAR(500),
    "codigo" VARCHAR(50) NOT NULL,
    "estado" "EstadoGeneral" NOT NULL DEFAULT 'activo',
    "es_default" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "roles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "permissions" (
    "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "nombre" VARCHAR(100) NOT NULL,
    "descripcion" VARCHAR(500),
    "codigo" VARCHAR(100) NOT NULL,
    "recurso" VARCHAR(50) NOT NULL,
    "accion" VARCHAR(50) NOT NULL,
    "categoria" VARCHAR(50) NOT NULL,
    "estado" "EstadoGeneral" NOT NULL DEFAULT 'activo',
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "permissions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "role_permissions" (
    "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "role_id" UUID NOT NULL,
    "permission_id" UUID NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "role_permissions_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "redes_nombre_key" ON "redes"("nombre");

-- CreateIndex
CREATE UNIQUE INDEX "redes_codigo_key" ON "redes"("codigo");

-- CreateIndex
CREATE UNIQUE INDEX "microredes_nombre_red_id_key" ON "microredes"("nombre", "red_id");

-- CreateIndex
CREATE UNIQUE INDEX "centros_acopio_codigo_key" ON "centros_acopio"("codigo");

-- CreateIndex
CREATE UNIQUE INDEX "centros_acopio_nombre_microred_id_key" ON "centros_acopio"("nombre", "microred_id");

-- CreateIndex
CREATE UNIQUE INDEX "establecimientos_codigo_key" ON "establecimientos"("codigo");

-- CreateIndex
CREATE UNIQUE INDEX "lotes_vacunas_numero_key" ON "lotes_vacunas"("numero");

-- CreateIndex
CREATE UNIQUE INDEX "lotes_jeringas_numero_key" ON "lotes_jeringas"("numero");

-- CreateIndex
CREATE UNIQUE INDEX "programacion_anual_cenares_anio_vacuna_id_key" ON "programacion_anual_cenares"("anio", "vacuna_id");

-- CreateIndex
CREATE UNIQUE INDEX "programacion_anual_cenares_anio_jeringa_id_key" ON "programacion_anual_cenares"("anio", "jeringa_id");

-- CreateIndex
CREATE UNIQUE INDEX "usuarios_email_key" ON "usuarios"("email");

-- CreateIndex
CREATE UNIQUE INDEX "usuarios_usuario_key" ON "usuarios"("usuario");

-- CreateIndex
CREATE INDEX "idx_usuario_role" ON "usuarios"("role_id");

-- CreateIndex
CREATE UNIQUE INDEX "planificacion_anual_establecimiento_id_vacuna_id_anio_key" ON "planificacion_anual"("establecimiento_id", "vacuna_id", "anio");

-- CreateIndex
CREATE UNIQUE INDEX "movimientos_vacunas_establecimiento_id_vacuna_id_mes_anio_key" ON "movimientos_vacunas"("establecimiento_id", "vacuna_id", "mes", "anio");

-- CreateIndex
CREATE UNIQUE INDEX "entregas_adicionales_movimiento_vacuna_id_numero_entrega_key" ON "entregas_adicionales"("movimiento_vacuna_id", "numero_entrega");

-- CreateIndex
CREATE UNIQUE INDEX "vales_entrega_numero_key" ON "vales_entrega"("numero");

-- CreateIndex
CREATE UNIQUE INDEX "vales_entrega_centro_acopio_id_mes_anio_tipo_vale_grupos_en_key" ON "vales_entrega"("centro_acopio_id", "mes", "anio", "tipo_vale", "grupos_entregas_adicionales");

-- CreateIndex
CREATE UNIQUE INDEX "vales_detalle_vale_entrega_id_establecimiento_id_vacuna_id__key" ON "vales_detalle"("vale_entrega_id", "establecimiento_id", "vacuna_id", "numero_entrega_adicional");

-- CreateIndex
CREATE UNIQUE INDEX "configuracion_sistema_clave_key" ON "configuracion_sistema"("clave");

-- CreateIndex
CREATE INDEX "idx_config_defecto_vacuna" ON "configuracion_jeringa_vacuna_defecto"("vacuna_id");

-- CreateIndex
CREATE INDEX "idx_config_defecto_jeringa" ON "configuracion_jeringa_vacuna_defecto"("jeringa_id");

-- CreateIndex
CREATE INDEX "idx_config_defecto_activo" ON "configuracion_jeringa_vacuna_defecto"("activo");

-- CreateIndex
CREATE INDEX "idx_config_defecto_prioridad" ON "configuracion_jeringa_vacuna_defecto"("vacuna_id", "prioridad");

-- CreateIndex
CREATE UNIQUE INDEX "configuracion_jeringa_vacuna_defecto_vacuna_id_jeringa_id_key" ON "configuracion_jeringa_vacuna_defecto"("vacuna_id", "jeringa_id");

-- CreateIndex
CREATE INDEX "idx_config_centro_centro" ON "configuracion_jeringa_vacuna_centro"("centro_acopio_id");

-- CreateIndex
CREATE INDEX "idx_config_centro_vacuna" ON "configuracion_jeringa_vacuna_centro"("vacuna_id");

-- CreateIndex
CREATE INDEX "idx_config_centro_jeringa" ON "configuracion_jeringa_vacuna_centro"("jeringa_id");

-- CreateIndex
CREATE INDEX "idx_config_centro_activo" ON "configuracion_jeringa_vacuna_centro"("activo");

-- CreateIndex
CREATE INDEX "idx_config_centro_prioridad" ON "configuracion_jeringa_vacuna_centro"("centro_acopio_id", "vacuna_id", "prioridad");

-- CreateIndex
CREATE UNIQUE INDEX "configuracion_jeringa_vacuna_centro_centro_acopio_id_vacuna_key" ON "configuracion_jeringa_vacuna_centro"("centro_acopio_id", "vacuna_id", "jeringa_id");

-- CreateIndex
CREATE UNIQUE INDEX "roles_nombre_key" ON "roles"("nombre");

-- CreateIndex
CREATE UNIQUE INDEX "roles_codigo_key" ON "roles"("codigo");

-- CreateIndex
CREATE INDEX "idx_role_codigo" ON "roles"("codigo");

-- CreateIndex
CREATE INDEX "idx_role_estado" ON "roles"("estado");

-- CreateIndex
CREATE UNIQUE INDEX "permissions_nombre_key" ON "permissions"("nombre");

-- CreateIndex
CREATE UNIQUE INDEX "permissions_codigo_key" ON "permissions"("codigo");

-- CreateIndex
CREATE INDEX "idx_permission_codigo" ON "permissions"("codigo");

-- CreateIndex
CREATE INDEX "idx_permission_recurso" ON "permissions"("recurso");

-- CreateIndex
CREATE INDEX "idx_permission_categoria" ON "permissions"("categoria");

-- CreateIndex
CREATE INDEX "idx_permission_estado" ON "permissions"("estado");

-- CreateIndex
CREATE INDEX "idx_role_permission_role" ON "role_permissions"("role_id");

-- CreateIndex
CREATE INDEX "idx_role_permission_permission" ON "role_permissions"("permission_id");

-- CreateIndex
CREATE UNIQUE INDEX "role_permissions_role_id_permission_id_key" ON "role_permissions"("role_id", "permission_id");

-- AddForeignKey
ALTER TABLE "microredes" ADD CONSTRAINT "microredes_red_id_fkey" FOREIGN KEY ("red_id") REFERENCES "redes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "centros_acopio" ADD CONSTRAINT "centros_acopio_microred_id_fkey" FOREIGN KEY ("microred_id") REFERENCES "microredes"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "establecimientos" ADD CONSTRAINT "establecimientos_centro_acopio_id_fkey" FOREIGN KEY ("centro_acopio_id") REFERENCES "centros_acopio"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "lotes_vacunas" ADD CONSTRAINT "lotes_vacunas_vacuna_id_fkey" FOREIGN KEY ("vacuna_id") REFERENCES "vacunas"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "lotes_jeringas" ADD CONSTRAINT "lotes_jeringas_jeringa_id_fkey" FOREIGN KEY ("jeringa_id") REFERENCES "jeringas"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "programacion_anual_cenares" ADD CONSTRAINT "programacion_anual_cenares_vacuna_id_fkey" FOREIGN KEY ("vacuna_id") REFERENCES "vacunas"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "programacion_anual_cenares" ADD CONSTRAINT "programacion_anual_cenares_jeringa_id_fkey" FOREIGN KEY ("jeringa_id") REFERENCES "jeringas"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "usuarios" ADD CONSTRAINT "usuarios_establecimiento_id_fkey" FOREIGN KEY ("establecimiento_id") REFERENCES "establecimientos"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "usuarios" ADD CONSTRAINT "usuarios_role_id_fkey" FOREIGN KEY ("role_id") REFERENCES "roles"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "planificacion_anual" ADD CONSTRAINT "planificacion_anual_establecimiento_id_fkey" FOREIGN KEY ("establecimiento_id") REFERENCES "establecimientos"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "planificacion_anual" ADD CONSTRAINT "planificacion_anual_vacuna_id_fkey" FOREIGN KEY ("vacuna_id") REFERENCES "vacunas"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "movimientos_vacunas" ADD CONSTRAINT "movimientos_vacunas_establecimiento_id_fkey" FOREIGN KEY ("establecimiento_id") REFERENCES "establecimientos"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "movimientos_vacunas" ADD CONSTRAINT "movimientos_vacunas_vacuna_id_fkey" FOREIGN KEY ("vacuna_id") REFERENCES "vacunas"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "movimientos_vacunas" ADD CONSTRAINT "movimientos_vacunas_usuario_id_fkey" FOREIGN KEY ("usuario_id") REFERENCES "usuarios"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "entregas_adicionales" ADD CONSTRAINT "entregas_adicionales_movimiento_vacuna_id_fkey" FOREIGN KEY ("movimiento_vacuna_id") REFERENCES "movimientos_vacunas"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "entregas_adicionales" ADD CONSTRAINT "entregas_adicionales_usuario_id_fkey" FOREIGN KEY ("usuario_id") REFERENCES "usuarios"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "vales_entrega" ADD CONSTRAINT "vales_entrega_centro_acopio_id_fkey" FOREIGN KEY ("centro_acopio_id") REFERENCES "centros_acopio"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "vales_entrega" ADD CONSTRAINT "vales_entrega_usuario_id_fkey" FOREIGN KEY ("usuario_id") REFERENCES "usuarios"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "vales_detalle" ADD CONSTRAINT "vales_detalle_vale_entrega_id_fkey" FOREIGN KEY ("vale_entrega_id") REFERENCES "vales_entrega"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "vales_detalle" ADD CONSTRAINT "vales_detalle_establecimiento_id_fkey" FOREIGN KEY ("establecimiento_id") REFERENCES "establecimientos"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "vales_detalle" ADD CONSTRAINT "vales_detalle_vacuna_id_fkey" FOREIGN KEY ("vacuna_id") REFERENCES "vacunas"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "kardex" ADD CONSTRAINT "kardex_establecimiento_origen_id_fkey" FOREIGN KEY ("establecimiento_origen_id") REFERENCES "establecimientos"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "kardex" ADD CONSTRAINT "kardex_establecimiento_destino_id_fkey" FOREIGN KEY ("establecimiento_destino_id") REFERENCES "establecimientos"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "kardex" ADD CONSTRAINT "kardex_usuario_id_fkey" FOREIGN KEY ("usuario_id") REFERENCES "usuarios"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "alertas" ADD CONSTRAINT "alertas_usuario_id_fkey" FOREIGN KEY ("usuario_id") REFERENCES "usuarios"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "configuracion_jeringa_vacuna_defecto" ADD CONSTRAINT "configuracion_jeringa_vacuna_defecto_vacuna_id_fkey" FOREIGN KEY ("vacuna_id") REFERENCES "vacunas"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "configuracion_jeringa_vacuna_defecto" ADD CONSTRAINT "configuracion_jeringa_vacuna_defecto_jeringa_id_fkey" FOREIGN KEY ("jeringa_id") REFERENCES "jeringas"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "configuracion_jeringa_vacuna_centro" ADD CONSTRAINT "configuracion_jeringa_vacuna_centro_centro_acopio_id_fkey" FOREIGN KEY ("centro_acopio_id") REFERENCES "centros_acopio"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "configuracion_jeringa_vacuna_centro" ADD CONSTRAINT "configuracion_jeringa_vacuna_centro_vacuna_id_fkey" FOREIGN KEY ("vacuna_id") REFERENCES "vacunas"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "configuracion_jeringa_vacuna_centro" ADD CONSTRAINT "configuracion_jeringa_vacuna_centro_jeringa_id_fkey" FOREIGN KEY ("jeringa_id") REFERENCES "jeringas"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "role_permissions" ADD CONSTRAINT "role_permissions_role_id_fkey" FOREIGN KEY ("role_id") REFERENCES "roles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "role_permissions" ADD CONSTRAINT "role_permissions_permission_id_fkey" FOREIGN KEY ("permission_id") REFERENCES "permissions"("id") ON DELETE CASCADE ON UPDATE CASCADE;
