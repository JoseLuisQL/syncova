-- CreateTable
CREATE TABLE "sibot_sessions" (
    "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "local_session_id" VARCHAR(120) NOT NULL,
    "usuario_id" UUID NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "sibot_sessions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sibot_attachments" (
    "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "session_id" UUID NOT NULL,
    "tipo" VARCHAR(32) NOT NULL,
    "mime_type" VARCHAR(150) NOT NULL,
    "nombre_original" VARCHAR(255) NOT NULL,
    "nombre_archivo" VARCHAR(255) NOT NULL,
    "storage_path" TEXT NOT NULL,
    "tamano_bytes" INTEGER NOT NULL,
    "sha256" VARCHAR(64) NOT NULL,
    "metadata" JSONB,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "sibot_attachments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sibot_tool_executions" (
    "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "session_id" UUID,
    "usuario_id" UUID NOT NULL,
    "tool_name" VARCHAR(120) NOT NULL,
    "status" VARCHAR(32) NOT NULL,
    "filters_applied" JSONB,
    "evidence" JSONB,
    "record_count" INTEGER,
    "duration_ms" INTEGER,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "sibot_tool_executions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sibot_security_events" (
    "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "session_id" UUID,
    "usuario_id" UUID NOT NULL,
    "tipo" VARCHAR(80) NOT NULL,
    "severidad" VARCHAR(24) NOT NULL,
    "detalle" JSONB,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "sibot_security_events_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "sibot_sessions_local_session_id_key" ON "sibot_sessions"("local_session_id");

-- CreateIndex
CREATE INDEX "idx_sibot_session_usuario" ON "sibot_sessions"("usuario_id");

-- CreateIndex
CREATE INDEX "idx_sibot_session_updated" ON "sibot_sessions"("updated_at");

-- CreateIndex
CREATE INDEX "idx_sibot_attachment_session" ON "sibot_attachments"("session_id");

-- CreateIndex
CREATE INDEX "idx_sibot_attachment_tipo" ON "sibot_attachments"("tipo");

-- CreateIndex
CREATE INDEX "idx_sibot_attachment_sha256" ON "sibot_attachments"("sha256");

-- CreateIndex
CREATE INDEX "idx_sibot_tool_session" ON "sibot_tool_executions"("session_id");

-- CreateIndex
CREATE INDEX "idx_sibot_tool_usuario" ON "sibot_tool_executions"("usuario_id");

-- CreateIndex
CREATE INDEX "idx_sibot_tool_name_fecha" ON "sibot_tool_executions"("tool_name", "created_at");

-- CreateIndex
CREATE INDEX "idx_sibot_security_session" ON "sibot_security_events"("session_id");

-- CreateIndex
CREATE INDEX "idx_sibot_security_usuario" ON "sibot_security_events"("usuario_id");

-- CreateIndex
CREATE INDEX "idx_sibot_security_tipo_fecha" ON "sibot_security_events"("tipo", "created_at");

-- AddForeignKey
ALTER TABLE "sibot_sessions" ADD CONSTRAINT "sibot_sessions_usuario_id_fkey" FOREIGN KEY ("usuario_id") REFERENCES "usuarios"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sibot_attachments" ADD CONSTRAINT "sibot_attachments_session_id_fkey" FOREIGN KEY ("session_id") REFERENCES "sibot_sessions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sibot_tool_executions" ADD CONSTRAINT "sibot_tool_executions_session_id_fkey" FOREIGN KEY ("session_id") REFERENCES "sibot_sessions"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sibot_tool_executions" ADD CONSTRAINT "sibot_tool_executions_usuario_id_fkey" FOREIGN KEY ("usuario_id") REFERENCES "usuarios"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sibot_security_events" ADD CONSTRAINT "sibot_security_events_session_id_fkey" FOREIGN KEY ("session_id") REFERENCES "sibot_sessions"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sibot_security_events" ADD CONSTRAINT "sibot_security_events_usuario_id_fkey" FOREIGN KEY ("usuario_id") REFERENCES "usuarios"("id") ON DELETE CASCADE ON UPDATE CASCADE;
