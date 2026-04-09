# Guía rápida de despliegue SIVAC en VPS Hostinger con Docker Compose

## Objetivo

Desplegar SIVAC en un VPS Hostinger usando:

- Docker Compose
- PostgreSQL en contenedor
- restauración inicial desde `docker/sql/init.sql`
- Traefik ya instalado en Hostinger
- dominio final `https://sivac.qware.me`

---

## Restaurar rápidamente la base de datos con un `init.sql` nuevo

Si reemplazas `docker/sql/init.sql` por un dump nuevo y quieres reinstalar la base completa desde cero, usa:

```bash
cd ~/syncova
docker compose down -v
docker compose up -d --build
```

Esto:

- detiene el stack
- elimina el volumen de PostgreSQL
- crea una base nueva vacía
- vuelve a ejecutar `db-restore`
- importa el nuevo `docker/sql/init.sql`

Verificar restauración:

```bash
docker compose logs db-restore --tail=200
```

Importante: este proceso elimina la base actual del contenedor PostgreSQL.

---

## Requisitos previos

- VPS Hostinger con Docker y Docker Compose
- Traefik ya instalado desde el panel de Hostinger
- subdominio apuntando al VPS:

```dns
A  sivac  ->  82.180.163.171
```

- repositorio privado GitHub accesible desde el VPS
- archivo SQL inicial en formato plano PostgreSQL (`init.sql`)

---

## 1. Clonar el proyecto

```bash
cd ~
git clone https://TU_USUARIO:TOKEN_READ_ONLY@github.com/TU_OWNER/TU_REPO.git syncova
cd ~/syncova
```

---

## 2. Crear el archivo `.env`

```bash
cp .env.example .env
nano .env
```

Usa esta base:

```env
APP_DOMAIN=sivac.qware.me
TRAEFIK_CERTRESOLVER=letsencrypt

VITE_API_URL=/api
VITE_APP_NAME=SIVAC
VITE_APP_VERSION=1.0.0
VITE_LOG_LEVEL=info

FRONTEND_PORT=5173
BACKEND_PORT=3001
FRONTEND_BIND_IP=127.0.0.1
BACKEND_BIND_IP=127.0.0.1

POSTGRES_DB=sivac
POSTGRES_USER=postgres
POSTGRES_PASSWORD=CAMBIAR_PASSWORD_SEGURA
POSTGRES_IMAGE=postgres:17-alpine

JWT_SECRET=CAMBIAR_SECRET_LARGO_DE_32_O_MAS_CARACTERES
JWT_EXPIRES_IN=24h

CORS_ORIGIN=https://sivac.qware.me,http://sivac.qware.me

RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
LOG_LEVEL=info
API_VERSION=v1

DB_RESTORE_FILE=/docker/sql/init.sql
DB_RESTORE_REQUIRED=true

AI_PROVIDER=
AI_BASE_URL=
AI_API_KEY=
AI_MODEL=
GOOGLE_GENERATIVE_AI_API_KEY=
SIBOT_GOOGLE_API_KEY=
```

---

## 3. Colocar el dump SQL inicial

Crear carpeta:

```bash
mkdir -p docker/sql
```

Si vas a pegarlo manualmente:

```bash
nano docker/sql/init.sql
```

Si el archivo es muy grande:

```bash
cat > docker/sql/init.sql
```

Pega todo el contenido y termina con:

```text
Ctrl + D
```

Verifica:

```bash
ls -lah docker/sql
head -n 20 docker/sql/init.sql
```

---

## 4. Confirmar Traefik y resolver SSL

Verifica que Traefik esté corriendo:

```bash
docker ps --format "table {{.Names}}\t{{.Networks}}" | grep traefik
```

En Hostinger normalmente Traefik corre en red `host`, eso es válido.

Revisa el nombre real del resolver ACME:

```bash
docker inspect traefik-traefik-1 --format '{{json .Config.Cmd}}'
```

Busca algo parecido a:

```text
--certificatesresolvers.letsencrypt.acme.email=...
--certificatesresolvers.letsencrypt.acme.storage=...
```

Si el resolver no se llama `letsencrypt`, cambia en `.env`:

```env
TRAEFIK_CERTRESOLVER=EL_NOMBRE_REAL
```

---

## 5. Levantar el sistema

Primera instalación limpia:

```bash
docker compose down -v
docker compose up -d --build
```

---

## 6. Verificar que todo arrancó

```bash
docker compose ps
docker compose logs db-restore --tail=100
docker compose logs backend --tail=100
docker compose logs frontend --tail=100
```

Estado esperado:

- `db` -> `healthy`
- `db-restore` -> `Exited (0)`
- `backend` -> `healthy`
- `frontend` -> `running`

---

## 7. Probar la aplicación

Prueba backend:

```bash
curl -I http://127.0.0.1:3001/health
curl -I https://sivac.qware.me/api/health
```

Prueba frontend:

```text
https://sivac.qware.me
```

---

## 8. Verificar SSL automático

Prueba:

```bash
curl -I https://sivac.qware.me
```

Si sale certificado `self-signed`, revisa Traefik:

```bash
docker logs traefik-traefik-1 --tail=200
```

Debe emitir un certificado real por el resolver configurado en:

```env
TRAEFIK_CERTRESOLVER=letsencrypt
```

Si el resolver correcto tiene otro nombre, actualiza `.env` y recrea:

```bash
docker compose down
docker compose up -d --build
```

---

## 9. Acceso final esperado

- Frontend:

```text
https://sivac.qware.me
```

- API:

```text
https://sivac.qware.me/api
```

- Health:

```text
https://sivac.qware.me/api/health
```

Ya no necesitas usar `:5173` ni `:3001` públicamente.

---

## 10. Actualizaciones futuras

```bash
cd ~/syncova
git pull
docker compose up -d --build
```

Si cambiaste estructura de base o quieres reinstalar desde cero:

```bash
docker compose down -v
docker compose up -d --build
```

---

## 11. Comandos útiles

Ver estado:

```bash
docker compose ps
```

Ver logs:

```bash
docker compose logs backend --tail=200
docker compose logs frontend --tail=200
docker compose logs db-restore --tail=200
docker logs traefik-traefik-1 --tail=200
```

Reiniciar solo un servicio:

```bash
docker compose restart backend
docker compose restart frontend
```

---

## 12. Problemas comunes

### `db-restore` falla

Revisar:

```bash
docker compose logs db-restore --tail=200
```

Causas comunes:

- falta `docker/sql/init.sql`
- dump inválido
- dump generado con otra versión de PostgreSQL

### `network traefik_default declared as external, but could not be found`

En este proyecto ya no se usa red externa de Traefik.  
Haz `git pull` para traer la versión corregida.

### `self-signed certificate`

Traefik no está usando el resolver ACME correcto.  
Revisar:

```bash
docker inspect traefik-traefik-1 --format '{{json .Config.Cmd}}'
docker logs traefik-traefik-1 --tail=200
```

### login falla por CORS

Revisar `.env`:

```env
VITE_API_URL=/api
CORS_ORIGIN=https://sivac.qware.me,http://sivac.qware.me
```

Luego reconstruir:

```bash
docker compose up -d --build frontend backend
```

---

## 13. Recomendación final

Antes de cada despliegue:

```bash
git pull
docker compose ps
docker compose up -d --build
docker compose logs backend --tail=50
docker compose logs frontend --tail=50
```

Con esta configuración, SIVAC queda preparado para producción en Hostinger con Traefik, HTTPS y restauración inicial de base de datos.
