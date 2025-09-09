# 🚀 INSTRUCCIONES DE INICIO - BACKEND SIVAC

## ✅ PASOS PARA COMENZAR

### 1. Verificar Requisitos
- [x] Node.js >= 18.0.0 instalado
- [x] PostgreSQL funcionando en puerto 5432
- [x] Base de datos 'sivac' creada
- [x] Usuario 'postgres' con contraseña 'luis789JLQL@'

### 2. Instalación de Dependencias
```bash
cd backend
npm install
```

### 3. Configuración de Base de Datos
```bash
# Generar cliente Prisma
npm run db:generate

# Aplicar esquema a la base de datos
npm run db:push

# Ejecutar seeders (datos iniciales)
npm run db:seed
```

### 4. Verificar Configuración
```bash
# Iniciar servidor en modo desarrollo
npm run dev
```

### 5. Probar Endpoints
Una vez que el servidor esté funcionando, puedes probar estos endpoints:

#### Endpoints Públicos (sin autenticación):
```bash
# Información del sistema
GET http://localhost:3001/api

# Salud del sistema
GET http://localhost:3001/health

# Configuraciones públicas
GET http://localhost:3001/api/configuracion/public

# Información del sistema
GET http://localhost:3001/api/configuracion/sistema/info

# Categorías de configuración
GET http://localhost:3001/api/configuracion/categorias
```

#### Ejemplos con curl:
```bash
# Verificar que el servidor funciona
curl http://localhost:3001/health

# Obtener configuraciones públicas
curl http://localhost:3001/api/configuracion/public

# Obtener información del sistema
curl http://localhost:3001/api/configuracion/sistema/info
```

---

## 🔧 COMANDOS ÚTILES

### Desarrollo
```bash
npm run dev          # Iniciar en modo desarrollo
npm run build        # Compilar TypeScript
npm start            # Iniciar en producción
```

### Base de Datos
```bash
npm run db:generate  # Generar cliente Prisma
npm run db:push      # Aplicar esquema sin migración
npm run db:migrate   # Crear migración
npm run db:seed      # Ejecutar seeders
npm run db:studio    # Abrir Prisma Studio
npm run db:reset     # Resetear base de datos
```

### Calidad de Código
```bash
npm run lint         # Ejecutar ESLint
npm run lint:fix     # Corregir errores automáticamente
npm test             # Ejecutar tests (cuando estén implementados)
```

---

## 📊 ESTADO ACTUAL

### ✅ Completado
- [x] Estructura base del proyecto
- [x] Configuración de TypeScript y Prisma
- [x] Esquema de base de datos completo
- [x] Middlewares de seguridad y validación
- [x] Sistema de respuestas estandarizadas
- [x] Manejo de errores robusto
- [x] **Módulo 1.1: Configuración del Sistema** ✨

### 🔄 En Progreso
- [ ] Implementación de módulos restantes

### ⏳ Próximos Pasos
1. **Módulo 1.2: Establecimientos** (siguiente)
2. **Módulo 1.3: Vacunas**
3. **Módulo 1.4: Jeringas**

---

## 🧪 TESTING DEL MÓDULO CONFIGURACIÓN

### Endpoints Implementados:

#### 1. Configuraciones Públicas
```bash
GET /api/configuracion/public
```
**Respuesta esperada:**
```json
{
  "success": true,
  "message": "Configuraciones públicas obtenidas exitosamente",
  "data": [
    {
      "id": "uuid",
      "clave": "sistema_nombre",
      "valor": "SIVAC - Sistema de Gestión de Vacunas",
      "descripcion": "Nombre del sistema",
      "tipoDato": "string",
      "categoria": "general",
      "esPublico": true,
      "createdAt": "2025-01-08T...",
      "updatedAt": "2025-01-08T..."
    }
  ],
  "timestamp": "2025-01-08T..."
}
```

#### 2. Información del Sistema
```bash
GET /api/configuracion/sistema/info
```
**Respuesta esperada:**
```json
{
  "success": true,
  "message": "Información del sistema obtenida exitosamente",
  "data": {
    "configuraciones": {
      "sistema_nombre": "SIVAC - Sistema de Gestión de Vacunas",
      "institucion_nombre": "DISA Apurímac II",
      "sistema_version": "1.0.0",
      "items_per_page": 10,
      "theme_default": "light",
      "language_default": "es",
      "password_min_length": 8
    },
    "timestamp": "2025-01-08T..."
  },
  "timestamp": "2025-01-08T..."
}
```

#### 3. Categorías
```bash
GET /api/configuracion/categorias
```
**Respuesta esperada:**
```json
{
  "success": true,
  "message": "Categorías obtenidas exitosamente",
  "data": [
    "general",
    "alertas",
    "reportes",
    "seguridad",
    "interfaz",
    "backup",
    "notificaciones",
    "api"
  ],
  "timestamp": "2025-01-08T..."
}
```

---

## 🔍 VERIFICACIÓN DE FUNCIONAMIENTO

### 1. Verificar que el servidor inicia correctamente
```bash
npm run dev
```
**Salida esperada:**
```
✅ Configuración cargada para entorno: development
✅ Conexión a PostgreSQL establecida correctamente

🚀 Servidor SIVAC iniciado exitosamente
📍 Entorno: development
🌐 URL: http://localhost:3001
📊 API: http://localhost:3001/api
🏥 Salud: http://localhost:3001/health
📝 Versión: v1
⏰ Iniciado: 2025-01-08T...
```

### 2. Verificar endpoints básicos
```bash
# Salud del sistema
curl http://localhost:3001/health

# API info
curl http://localhost:3001/api

# Configuraciones públicas
curl http://localhost:3001/api/configuracion/public
```

### 3. Verificar base de datos
```bash
# Abrir Prisma Studio para ver los datos
npm run db:studio
```

---

## 🚨 SOLUCIÓN DE PROBLEMAS

### Error: "Cannot connect to database"
1. Verificar que PostgreSQL esté funcionando
2. Verificar credenciales en `.env`
3. Verificar que la base de datos 'sivac' exista

### Error: "Port 3001 already in use"
1. Cambiar puerto en `.env`: `PORT=3002`
2. O matar el proceso: `npx kill-port 3001`

### Error: "Prisma schema not found"
1. Ejecutar: `npm run db:generate`
2. Verificar que `prisma/schema.prisma` existe

### Error: "Module not found"
1. Verificar instalación: `npm install`
2. Verificar TypeScript: `npm run build`

---

## 📝 NOTAS IMPORTANTES

1. **Primer módulo completado**: El módulo de Configuración está 100% funcional
2. **Patrón establecido**: Usa este módulo como referencia para los siguientes
3. **Estructura clara**: Servicio → Controlador → Rutas → Validaciones
4. **Seguridad implementada**: Autenticación, autorización y validaciones
5. **Documentación**: Cada endpoint está documentado

---

## 🎯 SIGUIENTE PASO

**Implementar Módulo 1.2: Establecimientos**

Sigue la **GUIA_IMPLEMENTACION_MODULAR.md** para continuar con el siguiente módulo.

¡El primer módulo está funcionando perfectamente! 🎉