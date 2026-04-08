#!/bin/sh
set -eu

DB_HOST="${POSTGRES_HOST:-db}"
DB_PORT="${POSTGRES_PORT:-5432}"
DB_NAME="${POSTGRES_DB:-sivac}"
DB_USER="${POSTGRES_USER:-postgres}"
RESTORE_FILE_PATH="${DB_RESTORE_FILE:-/docker/sql/init.sql}"
RESTORE_REQUIRED="${DB_RESTORE_REQUIRED:-true}"

export PGPASSWORD="${POSTGRES_PASSWORD:-}"

echo "Esperando a PostgreSQL en ${DB_HOST}:${DB_PORT}..."
until pg_isready -h "${DB_HOST}" -p "${DB_PORT}" -U "${DB_USER}" -d "${DB_NAME}" >/dev/null 2>&1; do
  sleep 2
done

echo "PostgreSQL disponible. Verificando extensiones..."
psql -v ON_ERROR_STOP=1 -h "${DB_HOST}" -p "${DB_PORT}" -U "${DB_USER}" -d "${DB_NAME}" -c 'CREATE EXTENSION IF NOT EXISTS "uuid-ossp";'
psql -v ON_ERROR_STOP=1 -h "${DB_HOST}" -p "${DB_PORT}" -U "${DB_USER}" -d "${DB_NAME}" -c 'CREATE EXTENSION IF NOT EXISTS "pgcrypto";'

TABLE_COUNT="$(psql -tA -h "${DB_HOST}" -p "${DB_PORT}" -U "${DB_USER}" -d "${DB_NAME}" -c "SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = 'public';")"

if [ "${TABLE_COUNT}" -gt 0 ]; then
  echo "La base de datos ya contiene tablas (${TABLE_COUNT}). Se omite la restauración."
  exit 0
fi

if [ ! -f "${RESTORE_FILE_PATH}" ]; then
  if [ "${RESTORE_REQUIRED}" = "true" ]; then
    echo "No se encontró el dump SQL en ${RESTORE_FILE_PATH} y la restauración es obligatoria." >&2
    exit 1
  fi

  echo "No se encontró dump SQL. Se deja la base vacía por configuración."
  exit 0
fi

echo "Restaurando base de datos desde ${RESTORE_FILE_PATH}..."
psql -v ON_ERROR_STOP=1 -h "${DB_HOST}" -p "${DB_PORT}" -U "${DB_USER}" -d "${DB_NAME}" -f "${RESTORE_FILE_PATH}"

FINAL_TABLE_COUNT="$(psql -tA -h "${DB_HOST}" -p "${DB_PORT}" -U "${DB_USER}" -d "${DB_NAME}" -c "SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = 'public';")"

echo "Restauración completada. Tablas públicas detectadas: ${FINAL_TABLE_COUNT}."
