# PRD - SIVAC (Sistema de Gestión de Vacunas)

## Documento de Requisitos del Producto

**Versión:** 1.0.0  
**Fecha:** Enero 2026  
**Organización:** DISA Apurímac II  
**Proyecto:** Syncova / SIVAC

---

## 1. Visión General del Producto

### 1.1 Descripción
SIVAC es un sistema integral de gestión de vacunas diseñado para administrar el inventario, distribución, planificación y seguimiento de vacunas y jeringas en la red de salud de la DISA Apurímac II. El sistema permite el control completo desde el ingreso de lotes hasta la entrega a establecimientos de salud.

### 1.2 Objetivos del Sistema
- Centralizar la gestión de inventario de vacunas y jeringas
- Automatizar la planificación anual de distribución por establecimiento
- Garantizar la trazabilidad completa de movimientos (Kardex)
- Generar reportes profesionales para CENARES y control interno
- Prevenir vencimientos y desabastecimientos mediante alertas automáticas
- Facilitar la generación de vales de entrega

### 1.3 Stack Tecnológico

| Capa | Tecnología |
|------|------------|
| **Frontend** | React 18, TypeScript, Vite, Tailwind CSS, React Router |
| **Backend** | Node.js, Express, TypeScript, Prisma ORM |
| **Base de Datos** | PostgreSQL 13+ |
| **Autenticación** | JWT con bcrypt |
| **Exportaciones** | ExcelJS (Excel), PDFKit (PDF) |
| **Gráficos** | Recharts |

---

## 2. Usuarios y Roles

### 2.1 Roles del Sistema

| Rol | Código | Descripción | Permisos |
|-----|--------|-------------|----------|
| **Administrador** | `administrador` | Acceso completo al sistema | 71 permisos (todos) |
| **Coordinador** | `coordinador` | Gestión de planificación, reportes y coordinación | ~35 permisos |
| **Responsable de Acopio** | `responsable_acopio` | Gestión de inventario, movimientos y stock | ~40 permisos |
| **Operador** | `operador` | Operaciones básicas (principalmente lectura) | ~20 permisos |

### 2.2 Sistema de Permisos
El sistema implementa **71 permisos granulares** organizados por módulo y acción:

**Nomenclatura:** `recurso:accion`

**Acciones disponibles:**
- `:read` - Ver/leer datos
- `:write` - Crear y editar
- `:delete` - Eliminar
- `:export` - Exportar a Excel/PDF
- `:anular` - Anular operaciones
- `:aprobar` - Aprobar solicitudes

---

## 3. Módulos Funcionales

### 3.1 Dashboard
**Ruta:** `/dashboard`

**Funcionalidades:**
- Indicadores principales (KPIs)
  - Total de vacunas en stock
  - Total de jeringas disponibles
  - Establecimientos activos
  - Alertas pendientes
- Gráficos interactivos
  - Movimientos mensuales (línea)
  - Stock por tipo de vacuna (barras)
- Centros de acopio activos
- Alertas recientes
- Actividad del sistema
- Acciones rápidas

---

### 3.2 Establecimientos
**Ruta:** `/establecimientos/*`

**Jerarquía organizacional:**
```
Red de Salud
└── Microred
    └── Centro de Acopio
        └── Establecimiento de Salud
```

**Submódulos:**

| Submódulo | Descripción |
|-----------|-------------|
| **Redes** | Redes de salud (nivel superior) |
| **Microredes** | Agrupaciones de centros de acopio |
| **Centros de Acopio** | Puntos de almacenamiento y distribución |
| **Establecimientos** | Centros de salud, puestos de salud, hospitales |

**Tipos de Establecimiento:**
- `centro_salud`
- `puesto_salud`
- `hospital`

---

### 3.3 Inventario
**Ruta:** `/inventario/*`

**Submódulos:**

#### 3.3.1 Vacunas
- Catálogo de vacunas
- Campos: nombre, tipo, presentación, dosis por frasco, tiempo de vida útil, temperatura de almacenamiento

#### 3.3.2 Jeringas
- Catálogo de jeringas
- Campos: tipo, capacidad, color

#### 3.3.3 Lotes de Vacunas
- Registro de lotes con trazabilidad
- Campos: número de lote, fecha ingreso, fecha vencimiento, forma de ingreso (trimestre), comprobante, cantidad inicial/actual, estado

#### 3.3.4 Lotes de Jeringas
- Similar a lotes de vacunas

#### 3.3.5 Configuración Jeringa-Vacuna
- Mapeo de qué jeringas usar con cada vacuna
- Multiplicador para cálculo automático
- Configuración por defecto y por centro de acopio

**Estados de Lote:**
- `disponible`
- `vencido`
- `agotado`

**Formas de Ingreso:**
- 1° TRIMESTRE
- 2° TRIMESTRE
- 3° TRIMESTRE
- 4° TRIMESTRE

**Clases de Comprobante:**
- PECOSA
- GUÍA
- TRASLADO
- OTROS

---

### 3.4 Movimientos
**Ruta:** `/movimientos`

**Funcionalidades:**
- Registro de movimientos mensuales por establecimiento/vacuna
- Campos del movimiento:
  - Saldo anterior (calculado automáticamente)
  - Transferencia de ingreso
  - Salida
  - Transferencia de salida
  - Entrega (base + adicionales)
- Entregas adicionales con historial
- Validación de stock en tiempo real
- Sincronización bidireccional con planificación

**Tipos de Movimiento Kardex:**
- `ingreso`
- `salida`
- `transferencia`
- `ajuste`

---

### 3.5 Planificación
**Ruta:** `/planificacion/*`

**Funcionalidades:**
- Planificación anual por establecimiento y vacuna
- Meta anual con distribución mensual (array de 12 valores)
- Estados de planificación: `borrador`, `aprobado`, `ejecutado`
- Auto-guardado automático
- Redistribución automática para coherencia anual
- Sincronización con módulo de movimientos

**Programación CENARES:**
- Programación anual por trimestre (Q1, Q2, Q3, Q4)
- Para vacunas y jeringas
- Integración con reportes CENARES

---

### 3.6 Kardex
**Ruta:** `/kardex`

**Funcionalidades:**
- Trazabilidad completa de movimientos por lote
- Historial de: ingresos, salidas, transferencias, ajustes
- Saldo anterior y actual por movimiento
- Exportación a Excel con formato profesional

---

### 3.7 Vales de Entrega
**Ruta:** `/vales` (dentro de movimientos o reportes)

**Funcionalidades:**
- Generación de vales por centro de acopio, mes y año
- Tipos de vale:
  - `completo` - Base + adicionales
  - `solo_base` - Solo entrega programada
  - `solo_adicionales` - Solo entregas adicionales
- Estados: `generado`, `impreso`, `entregado`
- Detalle por establecimiento y vacuna
- Exportación a Excel con plantilla profesional
- Múltiples vales por período (diferentes tipos/grupos)

---

### 3.8 Reportes
**Ruta:** `/reportes/*`

**Tipos de Reportes:**

| Reporte | Descripción |
|---------|-------------|
| **Inventario** | Stock actual por vacuna/jeringa |
| **Movimientos** | Resumen de movimientos por período |
| **Planificación** | Avance de planificación vs ejecución |
| **CENARES** | Reportes oficiales para CENARES |
| **Seguimiento Anual** | Programación y seguimiento anual |

**Características:**
- Filtros por período, establecimiento, vacuna
- Exportación a Excel con formato corporativo
- Gráficos embebidos
- Plantillas profesionales

---

### 3.9 Alertas
**Ruta:** `/alertas/*`

**Tipos de Alerta:**
- `vencimiento` - Lotes próximos a vencer
- `stock_bajo` - Stock por debajo del mínimo
- `discrepancia` - Inconsistencias detectadas
- `sistema` - Alertas del sistema

**Niveles:**
- `info` - Informativo
- `warning` - Advertencia
- `error` - Error/Crítico
- `success` - Éxito

**Funcionalidades:**
- Dashboard de alertas
- Marcar como leída
- Alertas automáticas (programadas)
- Parámetros JSON para datos adicionales

---

### 3.10 Configuración
**Ruta:** `/configuracion`

**Secciones:**
- Configuración general del sistema
- Gestión de usuarios
- Gestión de roles
- Asignación de permisos
- Configuración de notificaciones
- Seguridad
- Respaldos
- Integraciones
- Mantenimiento

---

## 4. Modelo de Datos

### 4.1 Diagrama de Entidades

```
┌─────────────────────────────────────────────────────────────────┐
│                    JERARQUÍA ORGANIZACIONAL                      │
├─────────────────────────────────────────────────────────────────┤
│  Red ──1:N──> Microred ──1:N──> CentroAcopio ──1:N──> Establecimiento │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│                         PRODUCTOS                                │
├─────────────────────────────────────────────────────────────────┤
│  Vacuna ──1:N──> LoteVacuna                                      │
│  Jeringa ──1:N──> LoteJeringa                                    │
│  Vacuna ──N:M──> Jeringa (via ConfiguracionJeringaVacuna)       │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│                        OPERACIONES                               │
├─────────────────────────────────────────────────────────────────┤
│  Establecimiento + Vacuna + Mes/Año ──> MovimientoVacuna        │
│  MovimientoVacuna ──1:N──> EntregaAdicional                     │
│  CentroAcopio + Mes/Año ──> ValeEntrega ──1:N──> ValeDetalle    │
│  Lote + Movimiento ──> Kardex                                    │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│                       PLANIFICACIÓN                              │
├─────────────────────────────────────────────────────────────────┤
│  Establecimiento + Vacuna + Año ──> PlanificacionAnual          │
│  Vacuna/Jeringa + Año ──> ProgramacionAnualCenares              │
│  Vacuna + Mes/Año ──> StockInicialMensual                       │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│                    USUARIOS Y PERMISOS                           │
├─────────────────────────────────────────────────────────────────┤
│  Usuario ──N:1──> Role ──N:M──> Permission (via RolePermission) │
│  Usuario ──N:1──> Establecimiento (opcional)                     │
│  Usuario ──N:1──> CentroAcopio (opcional)                        │
└─────────────────────────────────────────────────────────────────┘
```

### 4.2 Entidades Principales

| Entidad | Descripción | Campos Clave |
|---------|-------------|--------------|
| `Red` | Red de salud | nombre, codigo, estado |
| `Microred` | Microred | nombre, codigo, redId |
| `CentroAcopio` | Centro de acopio | nombre, codigo, microredId, direccion, responsable |
| `Establecimiento` | Establecimiento de salud | nombre, tipo, codigo, centroAcopioId |
| `Vacuna` | Catálogo de vacunas | nombre, tipo, presentacion, dosisPorFrasco |
| `Jeringa` | Catálogo de jeringas | tipo, capacidad, color |
| `LoteVacuna` | Lote de vacuna | numero, vacunaId, fechaVencimiento, cantidadActual |
| `LoteJeringa` | Lote de jeringa | numero, jeringaId, cantidadActual |
| `MovimientoVacuna` | Movimiento mensual | establecimientoId, vacunaId, mes, anio, entrega |
| `EntregaAdicional` | Entrega adicional | movimientoVacunaId, numeroEntrega, cantidad |
| `ValeEntrega` | Vale de entrega | numero, centroAcopioId, mes, anio, tipoVale |
| `ValeDetalle` | Detalle del vale | valeEntregaId, establecimientoId, vacunaId, cantidad |
| `Kardex` | Registro de kardex | tipo, itemId, loteId, tipoMovimiento, saldoActual |
| `PlanificacionAnual` | Plan anual | establecimientoId, vacunaId, anio, metaAnual, distribucionMensual |
| `Usuario` | Usuario del sistema | email, usuario, passwordHash, rol, roleId |
| `Role` | Rol de usuario | nombre, codigo, esDefault |
| `Permission` | Permiso | nombre, codigo, recurso, accion |
| `Alerta` | Alerta del sistema | tipo, titulo, nivel, leida |

---

## 5. API REST

### 5.1 Estructura Base
- **URL Base:** `http://localhost:3001/api`
- **Autenticación:** Bearer Token (JWT)
- **Formato de Respuesta:**
```json
{
  "success": true,
  "message": "Operación exitosa",
  "data": { },
  "timestamp": "2026-01-08T12:00:00Z"
}
```

### 5.2 Endpoints Principales

| Módulo | Endpoints |
|--------|-----------|
| **Auth** | POST /auth/login, POST /auth/logout, GET /auth/profile |
| **Redes** | CRUD /redes |
| **Microredes** | CRUD /microredes |
| **Centros Acopio** | CRUD /centros-acopio |
| **Establecimientos** | CRUD /establecimientos |
| **Vacunas** | CRUD /vacunas |
| **Jeringas** | CRUD /jeringas |
| **Lotes Vacunas** | CRUD /lotes-vacunas |
| **Lotes Jeringas** | CRUD /lotes-jeringas |
| **Movimientos** | CRUD /movimientos, POST /movimientos/entregas-adicionales |
| **Planificación** | CRUD /planificacion, POST /planificacion/aprobar |
| **Kardex** | GET /kardex, GET /kardex/export |
| **Vales** | CRUD /vales, GET /vales/export |
| **Reportes** | GET /reportes/*, GET /reportes/*/export |
| **Alertas** | CRUD /alertas, POST /alertas/marcar-leida |
| **Usuarios** | CRUD /usuarios |
| **Roles** | CRUD /roles |
| **Permisos** | GET /permissions, POST /permissions/assign |
| **Dashboard** | GET /dashboard/estadisticas |
| **Configuración** | CRUD /configuracion |

---

## 6. Requisitos No Funcionales

### 6.1 Seguridad
- **Autenticación:** JWT con expiración configurable
- **Contraseñas:** Hash con bcrypt (factor 10+)
- **Rate Limiting:** Límite de peticiones por IP/usuario
- **Headers:** Helmet para headers de seguridad HTTP
- **CORS:** Configurado para orígenes específicos
- **Validación:** Joi para validación de entrada
- **RBAC:** Control de acceso basado en roles (71 permisos)

### 6.2 Rendimiento
- **Connection Pooling:** Prisma con pool de conexiones
- **Lazy Loading:** Code splitting en frontend
- **Caché:** Datos del dashboard con indicador de staleness
- **Índices:** Índices en campos frecuentemente consultados
- **Timeout:** Configuración de timeout en axios

### 6.3 Usabilidad
- **Responsive:** Diseño adaptativo (mobile-first con Tailwind)
- **Auto-guardado:** En módulo de planificación
- **Validación en tiempo real:** Stock antes de operaciones
- **Mensajes:** En español para el usuario
- **Toast notifications:** Feedback inmediato de acciones

### 6.4 Exportaciones
- **Excel:** Formato profesional con ExcelJS
  - Plantillas corporativas
  - Estilos y colores institucionales
  - Múltiples hojas
  - Fórmulas y totales
- **PDF:** Generación con PDFKit

### 6.5 Integridad de Datos
- **Triggers:** PostgreSQL para saldo_anterior automático
- **Constraints:** Unique constraints para evitar duplicados
- **Validación de stock:** Antes de deducciones
- **Auditoría:** Timestamps en todas las entidades

---

## 7. Arquitectura del Sistema

### 7.1 Estructura de Directorios

```
syncova/
├── src/                          # Frontend React
│   ├── components/               # Componentes por módulo
│   │   ├── Dashboard/
│   │   ├── Establecimientos/
│   │   ├── Inventario/
│   │   ├── Movimientos/
│   │   ├── Planificacion/
│   │   ├── Kardex/
│   │   ├── Vales/
│   │   ├── Reportes/
│   │   ├── Alertas/
│   │   ├── Usuarios/
│   │   ├── Configuracion/
│   │   ├── Layout/
│   │   ├── auth/
│   │   ├── common/
│   │   ├── routing/
│   │   └── ui/
│   ├── hooks/                    # Custom hooks
│   ├── contexts/                 # React Context (Auth, Toast, Alertas)
│   ├── services/                 # API clients (axios)
│   ├── types/                    # TypeScript types
│   └── utils/                    # Utilidades
├── backend/                      # Backend Node.js
│   ├── src/
│   │   ├── controllers/          # Request handlers
│   │   ├── services/             # Business logic
│   │   ├── routes/               # API routes
│   │   ├── middleware/           # Auth, validation, errors
│   │   ├── types/                # Shared types
│   │   ├── config/               # Configuration
│   │   └── utils/                # Helpers
│   └── prisma/
│       ├── schema.prisma         # Database schema
│       └── seeds/                # Seed scripts
└── docs/                         # Documentación
```

### 7.2 Patrón de Capas (Backend)

```
Request → Routes → Middleware → Controllers → Services → Prisma → PostgreSQL
                      ↓
              (Auth, Validation)
                      ↓
              Error Handler → Response
```

### 7.3 Flujo de Datos (Frontend)

```
Component → Custom Hook → API Service → Backend
     ↑                          ↓
     └──── Context (State) ←────┘
```

---

## 8. Flujos de Negocio Principales

### 8.1 Flujo de Ingreso de Lote
1. Usuario accede a Inventario > Lotes
2. Registra nuevo lote (número, vacuna, fechas, cantidad, comprobante)
3. Sistema valida datos
4. Se registra movimiento en Kardex (tipo: ingreso)
5. Stock se actualiza automáticamente

### 8.2 Flujo de Planificación Anual
1. Coordinador accede a Planificación
2. Selecciona año, establecimiento y vacuna
3. Define meta anual
4. Sistema distribuye automáticamente en 12 meses
5. Puede ajustar distribución mensual
6. Auto-guardado cada cambio
7. Aprueba planificación → Estado: aprobado

### 8.3 Flujo de Movimiento/Entrega
1. Responsable accede a Movimientos
2. Selecciona período (mes/año) y establecimiento
3. Sistema carga planificación como base
4. Registra movimientos reales (entradas, salidas)
5. Validación de stock en tiempo real
6. Puede agregar entregas adicionales
7. Sistema sincroniza con planificación

### 8.4 Flujo de Generación de Vale
1. Usuario accede a Vales
2. Selecciona centro de acopio, mes y año
3. Elige tipo de vale (completo, base, adicionales)
4. Sistema genera vale con detalles por establecimiento
5. Exporta a Excel con formato profesional
6. Marca como impreso/entregado

---

## 9. Consideraciones de Implementación

### 9.1 Sincronización Bidireccional
- Planificación → Movimientos: La entrega base se copia de la planificación
- Movimientos → Planificación: Cambios en entrega actualizan distribución
- Campo `entrega_base` preserva valor original de planificación

### 9.2 Validación de Stock
- Antes de cualquier salida se valida stock disponible
- Procesamiento secuencial para deducciones batch
- Alertas automáticas cuando stock < mínimo

### 9.3 Permisos Granulares
- 71 permisos distribuidos en 30+ categorías
- Frontend oculta UI según permisos del usuario
- Backend valida permisos en cada endpoint
- Hook `usePermissions` para verificaciones

---

## 10. Roadmap y Mejoras Futuras

### Fase Actual (v1.0)
- [x] CRUD completo de entidades
- [x] Sistema de planificación anual
- [x] Movimientos con entregas adicionales
- [x] Kardex con trazabilidad
- [x] Vales de entrega
- [x] Reportes con exportación Excel
- [x] Sistema de alertas
- [x] 71 permisos granulares

### Futuras Mejoras
- [ ] Dashboard con más KPIs y gráficos
- [ ] Reportes personalizables
- [ ] Notificaciones push/email
- [ ] API para integración externa
- [ ] App móvil para consultas
- [ ] Importación masiva desde Excel
- [ ] Auditoría detallada de cambios
- [ ] Backup automático programado

---

## 11. Glosario

| Término | Definición |
|---------|------------|
| **CENARES** | Centro Nacional de Abastecimiento de Recursos Estratégicos en Salud |
| **DISA** | Dirección de Salud |
| **Kardex** | Registro de movimientos de inventario por lote |
| **PECOSA** | Pedido Comprobante de Salida |
| **Vale** | Documento de entrega de vacunas a establecimientos |
| **Centro de Acopio** | Punto de almacenamiento y distribución de vacunas |
| **Microred** | Agrupación de centros de acopio |
| **Red** | Red de salud (nivel superior organizacional) |

---

## 12. Contacto y Soporte

**Proyecto:** SIVAC - Sistema de Gestión de Vacunas  
**Organización:** DISA Apurímac II  
**Repositorio:** syncova  

---

*Documento generado automáticamente basado en el análisis del código fuente.*
