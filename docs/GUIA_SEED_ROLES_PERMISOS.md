# Guía de Configuración de Roles y Permisos - SIVAC

## Resumen
Este documento describe cómo inicializar el sistema de roles y permisos en la base de datos de producción.

El sistema implementa **permisos granulares por módulo y sección**, permitiendo control fino sobre qué usuarios pueden ver y acceder a cada parte del sistema.

---

## Prerrequisitos

1. Acceso a la carpeta del proyecto backend
2. Node.js instalado
3. Base de datos PostgreSQL configurada y accesible
4. Variables de entorno configuradas (especialmente `DATABASE_URL`)

---

## Comandos para Ejecutar

### Paso 1: Navegar al directorio del backend

```powershell
cd C:\Proyectos\syncova\backend
```

### Paso 2: Ejecutar la migración de permisos v2 (granulares)

```powershell
node prisma/seeds/migrate-permissions-v2.js
```

**Salida esperada:**
```
🚀 Iniciando migración a permisos granulares v2...
🗑️  Limpiando permisos antiguos...
📝 Creando 71 permisos granulares...
👥 Creando/actualizando roles...
🔗 Asignando permisos a roles...
🔄 Actualizando usuarios existentes...
✅ Migración completada exitosamente
   - 71 permisos creados
   - 4 roles configurados
   - 144 asignaciones de permisos
   - X usuarios actualizados
```

### Paso 3: Verificar la instalación (opcional)

```powershell
node prisma/seeds/verify-roles-permissions.js
```

**Salida esperada:**
```
🔍 Verificando datos de roles y permisos...

📊 RESUMEN DE DATOS:
────────────────────────────────────────
   Roles:              4
   Permisos:           71
   Role-Permissions:   144
   Usuarios con Role:  X / X  (todos los usuarios)
────────────────────────────────────────
```

---

## ¿Qué hace el seed?

### 1. Crea 71 Permisos Granulares organizados por módulo:

| Módulo | Permisos | Descripción |
|--------|----------|-------------|
| **Dashboard** | 1 | Lectura del dashboard principal |
| **Redes** | 2 | Ver y gestionar redes de salud |
| **Microredes** | 2 | Ver y gestionar microredes |
| **Centros de Acopio** | 2 | Ver y gestionar centros de acopio |
| **Establecimientos** | 2 | Ver y gestionar establecimientos |
| **Vacunas** | 2 | Ver y gestionar catálogo de vacunas |
| **Jeringas** | 2 | Ver y gestionar catálogo de jeringas |
| **Lotes Vacunas** | 2 | Ver y gestionar lotes de vacunas |
| **Lotes Jeringas** | 2 | Ver y gestionar lotes de jeringas |
| **Config. Jeringas** | 2 | Ver y gestionar configuración de jeringas |
| **Ingreso Inventario** | 1 | Registrar nuevos ingresos de inventario |
| **Movimientos** | 3 | Ver, gestionar y anular movimientos |
| **Planificación** | 3 | Ver, gestionar y aprobar planificación |
| **Kardex** | 2 | Ver y exportar kardex |
| **Reportes Inventario** | 2 | Ver y exportar reportes de inventario |
| **Reportes Movimientos** | 2 | Ver y exportar reportes de movimientos |
| **Reportes Planificación** | 2 | Ver y exportar reportes de planificación |
| **Reportes CENARES** | 2 | Ver y exportar reportes CENARES |
| **Reportes Config** | 2 | Ver y gestionar configuración de reportes |
| **Alertas Dashboard** | 1 | Ver dashboard de alertas |
| **Alertas** | 3 | Ver, gestionar y marcar alertas |
| **Alertas Reportes** | 1 | Ver reportes de alertas |
| **Alertas Config** | 2 | Ver y gestionar configuración de alertas |
| **Usuarios** | 6 | CRUD completo, contraseñas y estados |
| **Roles** | 2 | Ver y gestionar roles |
| **Permisos** | 2 | Ver y asignar permisos |
| **Config. General** | 2 | Ver y gestionar configuración general |
| **Config. Notificaciones** | 2 | Ver y gestionar notificaciones |
| **Config. Seguridad** | 2 | Ver y gestionar seguridad |
| **Config. Respaldos** | 2 | Ver y gestionar respaldos |
| **Config. Sistema** | 2 | Ver y gestionar configuración del sistema |
| **Config. Mantenimiento** | 2 | Ver y gestionar mantenimiento |
| **Config. Integraciones** | 2 | Ver y gestionar integraciones |
| **Config. Avanzado** | 2 | Ver y gestionar configuración avanzada |

### 2. Crea 4 Roles con permisos asignados:

| Rol | Descripción | Cantidad de Permisos |
|-----|-------------|---------------------|
| **Administrador** | Acceso completo al sistema | 71 (todos) |
| **Coordinador** | Gestión de planificación, reportes y coordinación | ~35 |
| **Responsable de Acopio** | Gestión de inventario, movimientos y stock | ~40 |
| **Operador** | Operaciones básicas (principalmente lectura) | ~20 |

### 3. Actualiza usuarios existentes:
- Vincula cada usuario con su rol correspondiente según el campo `rol` (enum)
- Actualiza el campo `roleId` con el ID del rol de la tabla `roles`

---

## Funcionamiento del Sistema de Permisos

### Backend (AuthService)
- Al hacer login o getProfile, el backend incluye un array `permissions` con los códigos de permisos del usuario
- Los permisos se obtienen de la relación: Usuario → Role → RolePermissions → Permission

### Frontend (usePermissions hook)
El hook `usePermissions` provee:

```typescript
const {
  hasPermission,      // Verificar permiso específico
  hasAnyPermission,   // Tiene al menos uno de varios permisos
  hasAllPermissions,  // Tiene todos los permisos indicados
  canAccessModule,    // Puede ver un módulo del menú
  canAccessSection,   // Puede ver una sección de un módulo
  canWrite,           // Puede crear/editar un recurso
  canDelete,          // Puede eliminar un recurso
  canExport,          // Puede exportar un recurso
} = usePermissions();
```

### Ocultamiento de UI
El sistema oculta automáticamente:
1. **Módulos del menú lateral** - Si el usuario no tiene ningún permiso del módulo
2. **Tabs/secciones internas** - Si el usuario no tiene el permiso de lectura de la sección
3. **Botones de acción** - Crear, Editar, Eliminar, Exportar según permisos `:write`, `:delete`, `:export`

---

## Nomenclatura de Permisos

Los permisos siguen el patrón: `recurso:accion`

### Acciones comunes:
- `:read` - Ver/leer datos
- `:write` - Crear y editar
- `:update` - Solo editar
- `:delete` - Eliminar
- `:export` - Exportar a Excel/PDF
- `:anular` - Anular operaciones
- `:aprobar` - Aprobar solicitudes
- `:marcar` - Marcar como leído
- `:assign` - Asignar (permisos a roles)
- `:password` - Cambiar contraseñas
- `:estado` - Cambiar estado activo/inactivo

### Ejemplos:
- `usuarios:read` - Ver lista de usuarios
- `usuarios:write` - Crear usuarios
- `usuarios:delete` - Eliminar usuarios
- `movimientos:anular` - Anular movimientos
- `planificacion:aprobar` - Aprobar planificación

---

## Seguridad del Script

El script usa `upsert` (update + insert):
- ✅ **Seguro para ejecutar múltiples veces**
- ✅ Si el registro ya existe → lo actualiza
- ✅ Si el registro no existe → lo crea
- ✅ No duplica datos
- ⚠️ **NOTA:** La migración v2 elimina permisos antiguos antes de crear los nuevos

---

## Para otra base de datos de producción

1. **Configurar la variable de entorno `DATABASE_URL`:**

   ```powershell
   # Windows PowerShell
   $env:DATABASE_URL = "postgresql://usuario:password@host:puerto/database"
   ```

   O editar el archivo `.env` en la carpeta backend:
   ```
   DATABASE_URL="postgresql://usuario:password@host:puerto/database"
   ```

2. **Ejecutar la migración:**
   ```powershell
   cd C:\Proyectos\syncova\backend
   node prisma/seeds/migrate-permissions-v2.js
   ```

3. **Verificar:**
   ```powershell
   node prisma/seeds/verify-roles-permissions.js
   ```

---

## Troubleshooting

### Error: Cannot find module '@prisma/client'
```powershell
npm install
npx prisma generate
```

### Error de conexión a la base de datos
Verificar que `DATABASE_URL` esté correctamente configurado y que la base de datos sea accesible.

### Usuarios sin roleId después del seed
Esto puede pasar si el código del rol del usuario no coincide exactamente con los códigos definidos (administrador, coordinador, responsable_acopio, operador). Verificar manualmente:

```sql
SELECT id, usuario, rol FROM usuarios WHERE role_id IS NULL;
```

### El menú/secciones no se ocultan correctamente
1. Verificar que el backend esté devolviendo los permisos en el login
2. Revisar la consola del navegador para ver los permisos del usuario
3. Verificar que los códigos de permisos coincidan entre backend y frontend

---

## Archivos relacionados

### Backend
- `backend/prisma/seeds/migrate-permissions-v2.js` - Migración principal (71 permisos)
- `backend/prisma/seeds/verify-roles-permissions.js` - Script de verificación
- `backend/prisma/schema.prisma` - Modelos Role, Permission, RolePermission
- `backend/src/services/AuthService.ts` - Incluye permisos en login/getProfile

### Frontend
- `src/hooks/usePermissions.ts` - Hook principal de permisos
- `src/types/index.ts` - Tipo AuthUser con permissions
- `src/components/Layout/Sidebar.tsx` - Filtrado de menú
- Cada módulo filtra sus secciones internas usando `canAccessSection`

---

## Historial de Versiones

### v2.0 - 2025-12-29 (Actual)
- **71 permisos granulares** por módulo y sección
- Permisos incluidos en respuesta de login/getProfile
- Hook `usePermissions` para frontend
- Ocultamiento automático de UI según permisos
- 4 roles con permisos diferenciados

### v1.0 - 2025-12-29 (Anterior)
- 28 permisos generales
- Sistema básico de roles
- Sin filtrado dinámico de UI
