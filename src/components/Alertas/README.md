# Módulo de Alertas - Diseño Premium

## Descripción General

El módulo de Alertas ha sido completamente refactorizado siguiendo el patrón de diseño premium utilizado en otros módulos del sistema como Inventario, Establecimientos, Movimientos, Planificación y Usuarios.

## Estructura del Módulo

### Componentes Principales

- **AlertasModule.tsx**: Componente principal que maneja la navegación y estructura general
- **DashboardAlertas.tsx**: Vista de dashboard con estadísticas y resumen
- **GestionAlertas.tsx**: Gestión completa de alertas con filtros avanzados
- **ConfiguracionAlertas.tsx**: Configuración del sistema de alertas
- **ReportesAlertas.tsx**: Análisis estadístico y reportes
- **NuevaAlertaModal.tsx**: Modal para crear nuevas alertas

### Organización Jerárquica

El módulo está organizado en 3 categorías principales:

#### 1. Monitoreo en Tiempo Real
- **Dashboard**: Vista general del sistema
- **Gestión de Alertas**: Administrar alertas activas

#### 2. Gestión y Análisis
- **Reportes y Análisis**: Estadísticas y tendencias

#### 3. Configuración
- **Configuración**: Parámetros del sistema

## Características Premium

### Diseño Visual
- **Gradientes modernos**: Fondos con gradientes suaves
- **Tarjetas elevadas**: Sombras y bordes redondeados
- **Colores consistentes**: Paleta de colores coherente con el sistema
- **Iconografía**: Iconos descriptivos para cada sección

### Navegación
- **Rutas anidadas**: `/alertas/dashboard`, `/alertas/alertas`, etc.
- **Navegación visual**: Indicadores de sección activa
- **Breadcrumbs**: Navegación contextual

### Funcionalidades
- **Filtros avanzados**: Por tipo, nivel, estado y búsqueda
- **Acciones en lote**: Selección múltiple y acciones masivas
- **Estadísticas en tiempo real**: Métricas actualizadas
- **Configuración granular**: Control detallado de alertas automáticas

## Rutas del Módulo

```typescript
ALERTAS: {
  ROOT: '/alertas',
  DASHBOARD: '/alertas/dashboard',
  ALERTAS: '/alertas/alertas',
  REPORTES: '/alertas/reportes',
  CONFIGURACION: '/alertas/configuracion'
}
```

## Tipos de Alertas Soportados

1. **Vencimientos**: Vacunas próximas a vencer
2. **Stock Bajo**: Inventario por debajo del mínimo
3. **Discrepancias**: Diferencias en movimientos
4. **Sistema**: Alertas técnicas y operativas

## Niveles de Criticidad

1. **Críticas** (error): Requieren atención inmediata
2. **Advertencias** (warning): Situaciones que requieren revisión
3. **Informativas** (info): Información general
4. **Exitosas** (success): Confirmaciones y completaciones

## Mejoras Implementadas

### Eliminación de Redundancias
- Removida información duplicada en vistas
- Consolidación de controles similares
- Optimización de la presentación de datos

### Organización Profesional
- Separación clara de responsabilidades
- Componentes modulares y reutilizables
- Estructura de archivos organizada

### Consistencia Visual
- Siguiendo los patrones de otros módulos premium
- Colores, tipografía y espaciado consistentes
- Interacciones uniformes

## Configuraciones Disponibles

### Canales de Notificación
- Email
- SMS
- Push (navegador)
- Sonido
- Escritorio

### Alertas Automáticas
- Vencimientos (con días de anticipación)
- Stock bajo (con porcentaje mínimo)
- Temperatura fuera de rango
- Fallos de conexión
- Accesos no autorizados

## Reportes y Análisis

### Métricas Principales
- Total de alertas en período
- Promedio diario
- Distribución por nivel y tipo
- Tendencias temporales

### Exportación
- Excel
- PDF
- Envío por email
- Reportes programados

## Uso del Módulo

1. **Acceso**: Navegar a `/alertas` (redirige automáticamente a `/alertas/dashboard`)
2. **Dashboard**: Vista general con estadísticas principales
3. **Gestión**: Administrar alertas individuales o en lote
4. **Configuración**: Personalizar comportamiento del sistema
5. **Reportes**: Análisis estadístico y exportación

## Integración con el Sistema

El módulo está completamente integrado con:
- Sistema de routing
- Hooks de navegación
- Contexto de autenticación
- Patrones de diseño del sistema
- Tipos TypeScript globales
