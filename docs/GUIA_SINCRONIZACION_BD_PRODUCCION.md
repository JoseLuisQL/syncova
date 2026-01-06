# Guía de Sincronización de BD de Producción - SIVAC

## Descripción

Esta guía documenta los pasos necesarios para sincronizar la base de datos de producción con los cambios del sistema de permisos granulares y la nueva estructura de usuarios.

**Commits relacionados:**
- `ef4dc2fa` - Sistema de permisos granulares (71 permisos, 4 roles)
- `1c2dba67` - Campo `centroAcopioId` en modelo Usuario

---

## Pre-requisitos

1. **Acceso a la base de datos PostgreSQL de producción**
2. **Node.js v18+** instalado
3. **Backend detenido** (importante para evitar conflictos)
4. **Backup de la base de datos** (recomendado)

---

## Pasos de Ejecución

### Paso 1: Detener el Backend

```bash
# Si está corriendo en desarrollo
Ctrl + C

# Si está corriendo como servicio, detenerlo apropiadamente
```

### Paso 2: Ejecutar el Script de Sincronización

```bash
cd backend
node scripts/sync-production-db.js
```

**Este script realiza:**
1. Agrega la columna `centro_acopio_id` a la tabla `usuarios` (si no existe)
2. Limpia permisos y asignaciones anteriores
3. Crea los 71 permisos granulares del sistema
4. Configura los 4 roles predeterminados
5. Asigna permisos a cada rol según su nivel de acceso
6. Actualiza usuarios existentes con su `roleId` correspondiente
7. Verifica la integridad de los datos migrados

**Salida esperada:**
```
╔════════════════════════════════════════════════════════════╗
║     SINCRONIZACIÓN DE BD DE PRODUCCIÓN - SIVAC            ║
╚════════════════════════════════════════════════════════════╝

📊 PASO 1: Verificando estructura de tabla usuarios...
   ✅ Columna, foreign key e índice creados

🧹 PASO 2: Limpiando datos de permisos anteriores...
   ✅ Limpieza completada

📝 PASO 3: Creando permisos granulares...
   ✅ 71 permisos creados

👥 PASO 4: Configurando roles del sistema...
   ✅ 4 roles configurados

🔗 PASO 5: Asignando permisos a roles...
   ✅ 71 permisos asignados a administrador
   ✅ 34 permisos asignados a coordinador
   ✅ 25 permisos asignados a responsable_acopio
   ✅ 14 permisos asignados a operador

👤 PASO 6: Actualizando usuarios existentes...
   ✅ X usuarios actualizados con roleId

✅ PASO 7: Verificando integridad...
   📊 ESTADÍSTICAS DE VERIFICACIÓN:
   ├── Permisos: 71
   ├── Roles: 4
   ├── Asignaciones rol-permiso: 144
   ├── Usuarios con roleId: X
   └── Usuarios sin roleId: 0

╔════════════════════════════════════════════════════════════╗
║        ✅ SINCRONIZACIÓN COMPLETADA EXITOSAMENTE          ║
╚════════════════════════════════════════════════════════════╝
```

### Paso 3: Regenerar el Cliente Prisma

```bash
npx prisma generate
```

**Salida esperada:**
```
✔ Generated Prisma Client (v5.22.0) to .\node_modules\@prisma\client
```

### Paso 4: Reiniciar el Backend

```bash
npm run dev
```

### Paso 5: Verificar el Sistema

1. Abrir el navegador en `http://localhost:5173`
2. Iniciar sesión con un usuario administrador
3. Verificar que el módulo de Usuarios muestra los roles y permisos
4. Verificar que los permisos funcionan correctamente en cada módulo

---

## Estructura de Roles y Permisos

### Roles del Sistema

| Rol | Descripción | Permisos |
|-----|-------------|----------|
| **Administrador** | Acceso completo | 71 permisos (todos) |
| **Coordinador** | Planificación y reportes | 34 permisos |
| **Responsable de Acopio** | Inventario y movimientos | 25 permisos |
| **Operador** | Consultas básicas | 14 permisos |

### Categorías de Permisos

- **Dashboard** (1 permiso)
- **Establecimientos** (8 permisos)
- **Inventario** (10 permisos)
- **Movimientos** (3 permisos)
- **Planificación** (3 permisos)
- **Kardex** (2 permisos)
- **Reportes** (10 permisos)
- **Alertas** (7 permisos)
- **Usuarios** (10 permisos)
- **Configuración** (17 permisos)

---

## Solución de Problemas

### Error: "The column 'X' does not exist"

**Causa:** Desincronización entre el schema de Prisma y la base de datos.

**Solución:**
```bash
# 1. Ejecutar el script de sincronización
node scripts/sync-production-db.js

# 2. Regenerar el cliente Prisma
npx prisma generate
```

### Error: "relation 'X' does not exist"

**Causa:** Las tablas de roles/permisos no existen en la BD.

**Solución:**
```bash
# Ejecutar prisma db push para crear las tablas faltantes
npx prisma db push
```

### Error: "duplicate key value violates unique constraint"

**Causa:** Ya existen datos en las tablas de permisos.

**Solución:** El script ya maneja esto eliminando datos anteriores. Si persiste:
```sql
-- Ejecutar en la BD
DELETE FROM role_permissions;
DELETE FROM permissions;
-- Luego volver a ejecutar el script
```

---

## Scripts Relacionados

| Script | Ubicación | Descripción |
|--------|-----------|-------------|
| `sync-production-db.js` | `backend/scripts/` | Sincronización completa de BD |
| `migrate-permissions-v2.js` | `backend/prisma/seeds/` | Solo migración de permisos |
| `verify-roles-permissions.js` | `backend/prisma/seeds/` | Verificación de integridad |

---

## Notas Importantes

1. **Siempre hacer backup** antes de ejecutar en producción
2. **Detener el backend** antes de ejecutar el script
3. El script es **idempotente** - puede ejecutarse múltiples veces sin problemas
4. Los usuarios existentes mantienen su rol original, solo se les asigna el `roleId`
5. El campo `rol` (enum) se mantiene por compatibilidad

---

## Historial de Cambios

| Fecha | Versión | Cambios |
|-------|---------|---------|
| 2026-01-06 | 1.0 | Creación inicial del script y documentación |

---

*Documento generado para SIVAC - Sistema de Gestión de Vacunas*
