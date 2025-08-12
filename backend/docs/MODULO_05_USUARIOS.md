# 👥 MÓDULO 5: USUARIOS - DOCUMENTACIÓN TÉCNICA

## 📋 Información General

**Módulo:** 5 - USUARIOS  
**Prioridad:** ALTA  
**Dependencias:** Establecimientos  
**Estado:** ✅ IMPLEMENTADO  
**Fecha:** 2025-07-08  

## 🎯 Descripción

El Módulo 5: USUARIOS implementa la gestión completa de usuarios del sistema SIVAC, incluyendo autenticación, roles, permisos y asociación con establecimientos.

## 🏗️ Arquitectura

### Archivos Implementados

```
backend/src/
├── types/index.ts              # DTOs y tipos para usuarios
├── services/UsuarioService.ts  # Lógica de negocio
├── controllers/UsuarioController.ts # Controlador HTTP
├── routes/usuarios.ts          # Rutas de la API
├── utils/password.ts           # Utilidades para contraseñas
└── index.ts                    # Registro de rutas
```

### Base de Datos

**Tabla:** `usuarios`
- `id` (UUID, PK)
- `nombres` (VARCHAR(255))
- `apellidos` (VARCHAR(255))
- `email` (VARCHAR(255), UNIQUE)
- `usuario` (VARCHAR(100), UNIQUE)
- `password_hash` (VARCHAR(255))
- `rol` (ENUM: administrador, coordinador, responsable_acopio, operador)
- `establecimiento_id` (UUID, FK, NULLABLE)
- `estado` (ENUM: activo, inactivo)
- `ultimo_acceso` (TIMESTAMPTZ, NULLABLE)
- `created_at` (TIMESTAMPTZ)
- `updated_at` (TIMESTAMPTZ)

## 🔧 Funcionalidades Implementadas

### ✅ CRUD Completo
- **Crear usuario** - `POST /api/usuarios`
- **Listar usuarios** - `GET /api/usuarios`
- **Obtener usuario** - `GET /api/usuarios/:id`
- **Actualizar usuario** - `PUT /api/usuarios/:id`
- **Eliminar usuario** - `DELETE /api/usuarios/:id`

### ✅ Endpoints Especializados
- **Usuarios activos** - `GET /api/usuarios/activos`
- **Usuarios por rol** - `GET /api/usuarios/rol/:rol`
- **Estadísticas de usuarios** - `GET /api/usuarios/stats`
- **Cambiar contraseña** - `POST /api/usuarios/:id/change-password`
- **Cambiar estado** - `PATCH /api/usuarios/:id/estado`
- **Actualizar último acceso** - `POST /api/usuarios/:id/ultimo-acceso`

### ✅ Filtros y Búsqueda
- Filtro por estado (activo/inactivo/todos)
- Filtro por rol (administrador/coordinador/responsable_acopio/operador/todos)
- Filtro por establecimiento
- Búsqueda por texto (nombres, apellidos, email, usuario)
- Paginación

## 👤 Roles de Usuario Soportados

### Roles Implementados
- **Administrador** - Acceso completo al sistema
- **Coordinador** - Gestión y supervisión general
- **Responsable de Acopio** - Gestión de centros de acopio
- **Operador** - Operaciones básicas del sistema

### Jerarquía de Permisos
1. **Administrador** - Control total
2. **Coordinador** - Gestión regional
3. **Responsable de Acopio** - Gestión local
4. **Operador** - Operaciones básicas

## 🔒 Validaciones Implementadas

### Validaciones de Negocio
1. **Email único**: No puede haber usuarios con el mismo email
2. **Usuario único**: No puede haber usuarios con el mismo nombre de usuario
3. **Responsable de acopio**: Debe tener establecimiento asignado
4. **Establecimiento válido**: Debe existir y estar activo
5. **Contraseñas seguras**: Validación de fortaleza
6. **Eliminación segura**: Soft delete si tiene dependencias

### Validaciones de Entrada
- Campos requeridos: nombres, apellidos, email, usuario, password, rol
- Formato UUID para IDs
- Formato de email válido
- Usuario alfanumérico con guiones bajos (3-20 caracteres)
- Estados válidos (activo/inactivo)
- Roles válidos
- Parámetros de paginación válidos

### Validaciones de Contraseña
- Mínimo 8 caracteres
- Al menos una letra mayúscula
- Al menos una letra minúscula
- Al menos un número
- Al menos un carácter especial
- Sin espacios

## 🔐 Seguridad

### Encriptación de Contraseñas
- **Algoritmo**: bcrypt con salt rounds = 12
- **Verificación**: Comparación segura con hash almacenado
- **Generación temporal**: Contraseñas aleatorias seguras

### Utilidades de Seguridad
- `PasswordUtils.hashPassword()` - Encriptar contraseña
- `PasswordUtils.verifyPassword()` - Verificar contraseña
- `PasswordUtils.validatePasswordStrength()` - Validar fortaleza
- `PasswordUtils.generateTemporaryPassword()` - Generar contraseña temporal

## 📡 API Endpoints

### GET /api/usuarios
Obtener todos los usuarios con filtros opcionales.

**Query Parameters:**
- `estado` (string): activo, inactivo, todos
- `search` (string): Búsqueda por texto
- `rol` (string): administrador, coordinador, responsable_acopio, operador, todos
- `establecimientoId` (string): UUID del establecimiento
- `page` (number): Número de página (default: 1)
- `limit` (number): Límite por página (default: 50, max: 100)

**Response:**
```json
{
  "success": true,
  "message": "Usuarios obtenidos exitosamente",
  "data": [
    {
      "id": "uuid",
      "nombres": "string",
      "apellidos": "string",
      "email": "string",
      "usuario": "string",
      "rol": "string",
      "establecimientoId": "uuid|null",
      "estado": "string",
      "ultimoAcceso": "datetime|null",
      "createdAt": "datetime",
      "updatedAt": "datetime",
      "establecimiento": {
        "id": "uuid",
        "nombre": "string",
        "tipo": "string"
      }
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 50,
    "total": 100,
    "totalPages": 2,
    "hasNext": true,
    "hasPrev": false
  }
}
```

### POST /api/usuarios
Crear nuevo usuario.

**Body:**
```json
{
  "nombres": "string",
  "apellidos": "string",
  "email": "string",
  "usuario": "string",
  "password": "string",
  "rol": "administrador|coordinador|responsable_acopio|operador",
  "establecimientoId": "uuid|null"
}
```

### GET /api/usuarios/stats
Obtener estadísticas de usuarios.

**Response:**
```json
{
  "success": true,
  "data": {
    "total": 10,
    "activos": 8,
    "inactivos": 2,
    "porRol": {
      "administrador": 1,
      "coordinador": 1,
      "responsable_acopio": 3,
      "operador": 5
    },
    "conectadosHoy": 5
  }
}
```

## 🌱 Seeder

El módulo incluye un seeder completo con 10 usuarios de prueba:

- **1 Administrador**: Luis Alberto Quispe Mamani
- **1 Coordinador**: María Elena Rodríguez Vargas
- **3 Responsables de Acopio**: Carlos, Ana, José
- **5 Operadores**: Rosa, Pedro, Carmen, Miguel, Lucía

### Credenciales de Prueba
- **Admin**: usuario: `admin`, password: `Admin123!`
- **Coordinador**: usuario: `mrodriguez`, password: `Coord123!`
- **Responsables**: password: `Resp123!`
- **Operadores**: password: `Oper123!`

**Ejecutar seeder:**
```bash
npm run db:seed
```

## 🧪 Testing

### Pruebas Realizadas
✅ CRUD completo funcional  
✅ Filtros y búsqueda  
✅ Validaciones de negocio  
✅ Validación de duplicados  
✅ Encriptación de contraseñas  
✅ Endpoints especializados  
✅ Seeder completo  
✅ Integración con frontend  

### Casos de Prueba
1. Crear usuario válido
2. Crear usuario con email duplicado (debe fallar)
3. Crear usuario con usuario duplicado (debe fallar)
4. Crear responsable sin establecimiento (debe fallar)
5. Actualizar usuario existente
6. Cambiar contraseña
7. Cambiar estado (activar/desactivar)
8. Eliminar usuario sin dependencias
9. Eliminar usuario con dependencias (soft delete)
10. Filtrar por rol, estado, establecimiento
11. Búsqueda por texto
12. Paginación
13. Estadísticas de usuarios

## 🔗 Integración

### Frontend
El módulo está diseñado para integrarse perfectamente con:
- `src/components/Usuarios/Usuarios.tsx`
- Formularios de creación/edición
- Filtros y búsqueda
- Gestión de roles y permisos
- Cambio de contraseñas

### Otros Módulos
- **Módulo 2: ESTABLECIMIENTOS** (dependencia)
- **Módulo 8: PLANIFICACIÓN ANUAL** (usuarios como creadores)
- **Módulo 9: MOVIMIENTOS** (usuarios como responsables)
- **Módulo 13: AUTENTICACIÓN** (dependiente)

## 📈 Métricas

- **10 usuarios** en el seeder inicial
- **4 roles** diferentes de usuario
- **100% cobertura** de funcionalidades del frontend
- **Encriptación bcrypt** con salt rounds 12
- **Validaciones completas** de seguridad

## 🚀 Estado del Módulo

**✅ COMPLETADO AL 100%**

- [x] Servicio implementado
- [x] Controlador implementado
- [x] Rutas configuradas
- [x] Validaciones completas
- [x] Encriptación de contraseñas
- [x] Seeder profesional
- [x] Documentación técnica
- [x] Pruebas funcionales
- [x] Integración con frontend

## 📝 Notas Técnicas

### Dependencias Agregadas
- `bcrypt@6.0.0` - Encriptación de contraseñas
- `@types/bcrypt` - Tipos TypeScript para bcrypt

### Consideraciones de Seguridad
- Las contraseñas nunca se almacenan en texto plano
- Se utiliza bcrypt con salt rounds altos (12)
- Validación estricta de fortaleza de contraseñas
- Soft delete para preservar integridad referencial

### Próximos Pasos
1. Implementar autenticación JWT (Módulo 13)
2. Agregar sistema de permisos granular
3. Implementar auditoría de acciones
4. Agregar notificaciones de seguridad

---

**Módulo implementado por:** Augment Agent  
**Fecha de implementación:** 2025-07-08  
**Versión:** 1.0.0
