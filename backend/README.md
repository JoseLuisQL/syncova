# 🏥 SIVAC Backend - Sistema de Gestión de Vacunas

Backend API para el Sistema de Gestión de Vacunas de DIRESA Apurímac II, desarrollado con Node.js, TypeScript, Express y Prisma.

## 🚀 Características

- **TypeScript**: Tipado estático para mayor seguridad
- **Express.js**: Framework web rápido y minimalista
- **Prisma**: ORM moderno para PostgreSQL
- **JWT**: Autenticación segura con tokens
- **Joi**: Validación robusta de datos
- **Helmet**: Seguridad HTTP
- **Rate Limiting**: Protección contra ataques
- **CORS**: Configuración de recursos cruzados
- **Logging**: Sistema de logs con Morgan

## 📋 Requisitos Previos

- Node.js >= 18.0.0
- npm >= 9.0.0
- PostgreSQL >= 13
- Git

## 🛠️ Instalación

### 1. Clonar el repositorio
```bash
git clone <repository-url>
cd syncova/backend
```

### 2. Instalar dependencias
```bash
npm install
```

### 3. Configurar variables de entorno
```bash
cp .env.example .env
```

Editar `.env` con tus configuraciones:
```env
DATABASE_URL="postgresql://postgres:password@localhost:5432/sivac"
JWT_SECRET="tu_jwt_secret_muy_seguro"
PORT=3001
```

### 4. Configurar base de datos
```bash
# Generar cliente Prisma
npm run db:generate

# Aplicar esquema a la base de datos
npm run db:push

# Ejecutar seeders (opcional)
npm run db:seed
```

### 5. Iniciar servidor
```bash
# Desarrollo
npm run dev

# Producción
npm run build
npm start
```

## 📁 Estructura del Proyecto

```
backend/
├── prisma/
│   ├── schema.prisma          # Esquema de base de datos
│   └── seed.ts               # Datos de prueba
├── src/
│   ├── config/               # Configuraciones
│   │   ├── database.ts       # Conexión a BD
│   │   └── env.ts           # Variables de entorno
│   ├── controllers/          # Controladores de rutas
│   ├── middleware/           # Middlewares personalizados
│   │   ├── auth.ts          # Autenticación
│   │   ├── validation.ts    # Validación
│   │   └── errorHandler.ts  # Manejo de errores
│   ├── routes/              # Definición de rutas
│   ├── services/            # Lógica de negocio
│   ├── types/               # Tipos TypeScript
│   ├── utils/               # Utilidades
│   │   ├── response.ts      # Respuestas estandarizadas
│   │   └── validation.ts    # Validaciones
│   └── index.ts             # Punto de entrada
├── tests/                   # Tests unitarios e integración
├── .env                     # Variables de entorno
├── .env.example            # Ejemplo de variables
├── package.json            # Dependencias y scripts
├── tsconfig.json           # Configuración TypeScript
└── README.md               # Este archivo
```

## 🔧 Scripts Disponibles

```bash
# Desarrollo
npm run dev                 # Iniciar en modo desarrollo
npm run build              # Compilar TypeScript
npm start                  # Iniciar en producción

# Base de datos
npm run db:generate        # Generar cliente Prisma
npm run db:push           # Aplicar esquema
npm run db:migrate        # Crear migración
npm run db:seed           # Ejecutar seeders
npm run db:studio         # Abrir Prisma Studio
npm run db:reset          # Resetear base de datos

# Calidad de código
npm run lint              # Ejecutar ESLint
npm run lint:fix          # Corregir errores de ESLint
npm test                  # Ejecutar tests
npm run test:watch        # Tests en modo watch
```

## 🌐 Endpoints de la API

### Autenticación
- `POST /api/auth/login` - Iniciar sesión
- `POST /api/auth/logout` - Cerrar sesión
- `POST /api/auth/refresh` - Renovar token

### Establecimientos
- `GET /api/establecimientos` - Listar establecimientos
- `POST /api/establecimientos` - Crear establecimiento
- `GET /api/establecimientos/:id` - Obtener establecimiento
- `PUT /api/establecimientos/:id` - Actualizar establecimiento
- `DELETE /api/establecimientos/:id` - Eliminar establecimiento

### Vacunas
- `GET /api/vacunas` - Listar vacunas
- `POST /api/vacunas` - Crear vacuna
- `GET /api/vacunas/:id` - Obtener vacuna
- `PUT /api/vacunas/:id` - Actualizar vacuna
- `DELETE /api/vacunas/:id` - Eliminar vacuna

### Usuarios
- `GET /api/usuarios` - Listar usuarios
- `POST /api/usuarios` - Crear usuario
- `GET /api/usuarios/:id` - Obtener usuario
- `PUT /api/usuarios/:id` - Actualizar usuario
- `DELETE /api/usuarios/:id` - Eliminar usuario

### Planificación
- `GET /api/planificacion` - Listar planificaciones
- `POST /api/planificacion` - Crear planificación
- `GET /api/planificacion/:id` - Obtener planificación
- `PUT /api/planificacion/:id` - Actualizar planificación

### Movimientos
- `GET /api/movimientos` - Listar movimientos
- `POST /api/movimientos` - Crear movimiento
- `GET /api/movimientos/:id` - Obtener movimiento
- `PUT /api/movimientos/:id` - Actualizar movimiento

### Reportes
- `GET /api/reportes/dashboard` - Estadísticas del dashboard
- `GET /api/reportes/stock` - Reporte de stock
- `GET /api/reportes/movimientos` - Reporte de movimientos

### Alertas
- `GET /api/alertas` - Listar alertas
- `POST /api/alertas` - Crear alerta
- `PUT /api/alertas/:id/leer` - Marcar como leída

## 🔐 Autenticación

La API utiliza JWT (JSON Web Tokens) para autenticación. Incluye el token en el header:

```
Authorization: Bearer <token>
```

## 📊 Roles y Permisos

- **Administrador**: Acceso completo al sistema
- **Coordinador**: Gestión de planificación y reportes
- **Responsable de Acopio**: Gestión de movimientos y vales
- **Operador**: Solo lectura de datos básicos

## 🛡️ Seguridad

- Autenticación JWT
- Rate limiting
- Validación de entrada
- Sanitización de datos
- Headers de seguridad (Helmet)
- CORS configurado
- Encriptación de contraseñas (bcrypt)

## 📝 Validación de Datos

Todas las entradas son validadas usando Joi:

```typescript
// Ejemplo de validación
const schema = Joi.object({
  nombre: Joi.string().min(3).max(255).required(),
  email: Joi.string().email().required(),
  edad: Joi.number().integer().min(18).max(100)
});
```

## 🔄 Respuestas de la API

Todas las respuestas siguen un formato estándar:

```json
{
  "success": true,
  "message": "Operación exitosa",
  "data": { ... },
  "timestamp": "2025-01-08T10:00:00.000Z"
}
```

Para errores:
```json
{
  "success": false,
  "message": "Error en la operación",
  "error": "Detalles del error",
  "timestamp": "2025-01-08T10:00:00.000Z"
}
```

## 🧪 Testing

```bash
# Ejecutar todos los tests
npm test

# Tests en modo watch
npm run test:watch

# Coverage
npm run test:coverage
```

## 📈 Monitoreo

- Endpoint de salud: `GET /health`
- Logs estructurados con Morgan
- Métricas de rendimiento
- Monitoreo de base de datos

## 🚀 Despliegue

### Desarrollo
```bash
npm run dev
```

### Producción
```bash
npm run build
npm start
```

### Docker (opcional)
```bash
docker build -t sivac-backend .
docker run -p 3001:3001 sivac-backend
```

## 🤝 Contribución

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 📄 Licencia

Este proyecto está bajo la Licencia MIT - ver el archivo [LICENSE](LICENSE) para detalles.

## 👥 Equipo

- **DIRESA Apurímac II** - Cliente
- **Desarrollador** - Implementación

## 📞 Soporte

Para soporte técnico, contactar a:
- Email: soporte@saludapurimac.gob.pe
- Teléfono: +51 XXX XXX XXX

---

**SIVAC** - Sistema de Gestión de Vacunas © 2025
