# Sincronización Bidireccional entre Planificación y Movimientos

## Descripción

Esta funcionalidad implementa la sincronización automática bidireccional entre el módulo de **Planificación Anual** y el módulo de **Movimientos de Vacunas**, asegurando que los campos de entrega se mantengan consistentes entre ambos módulos.

## Cómo Funciona

### Sincronización Automática

#### 1. Desde Planificación → Movimientos
- **Cuándo**: Al actualizar la distribución mensual en el módulo de Planificación
- **Qué se actualiza**: El campo `entrega` en la tabla `movimientos_vacunas`
- **Proceso**:
  1. Usuario modifica un valor de distribución mensual en Planificación
  2. Sistema calcula la diferencia entre el valor anterior y el nuevo
  3. Busca el movimiento correspondiente (establecimiento, vacuna, mes, año)
  4. Actualiza el campo `entrega` del movimiento con el nuevo valor
  5. Si no existe movimiento y el valor es > 0, registra que se necesita crear

#### 2. Desde Movimientos → Planificación
- **Cuándo**: Al actualizar el campo `entrega` en el módulo de Movimientos
- **Qué se actualiza**: El array `distribucion_mensual` en la tabla `planificacion_anual`
- **Proceso**:
  1. Usuario modifica el campo `entrega` en Movimientos
  2. Sistema calcula la diferencia entre el valor anterior y el nuevo
  3. Busca la planificación anual correspondiente
  4. Actualiza el mes correspondiente en `distribucion_mensual`
  5. Recalcula la `meta_anual` sumando todos los meses

### Sincronización Manual

#### Botón "Sincronizar Movimientos" en Planificación
- **Ubicación**: Módulo de Planificación, barra de botones superior
- **Función**: Corrige inconsistencias entre planificación y movimientos
- **Proceso**:
  1. Recorre todas las planificaciones del establecimiento/vacuna/año actual
  2. Compara cada mes de la distribución con el campo entrega del movimiento
  3. Actualiza los movimientos que tengan diferencias
  4. Muestra resumen de cambios realizados

## Implementación Técnica

### Backend

#### Servicios Modificados

**PlanificacionService.ts**
```typescript
// Función principal de actualización con sincronización
static async update(id: string, data: UpdatePlanificacionDto)

// Función de sincronización con movimientos
private static async sincronizarConMovimientos(tx, planificacionAnterior, nuevaDistribucion)

// Función de sincronización manual
static async sincronizarConMovimientosManual(planificacionId: string)
```

**MovimientosService.ts**
```typescript
// Función principal de actualización con sincronización
static async update(id: string, data: UpdateMovimientoDto)

// Función de sincronización con planificación (ya existía)
private static async sincronizarConPlanificacion(tx, movimiento, diferenciaCantidad)
```

#### Controladores

**PlanificacionController.ts**
```typescript
// Endpoint para sincronización manual
static async sincronizarConMovimientos(req: Request, res: Response)
```

#### Rutas Nuevas
```
POST /api/planificacion/:id/sincronizar-movimientos
```

### Frontend

#### Servicios

**planificacionService.ts**
```typescript
// Método para sincronización manual
static async sincronizarConMovimientos(planificacionId: string)
```

#### Componentes Modificados

**Planificacion.tsx**
- Agregado botón "Sincronizar Movimientos"
- Función `handleSincronizarConMovimientos()`
- Mensajes de confirmación profesionales

**Movimientos.tsx**
- Mensajes mejorados que indican sincronización automática
- Indicación especial cuando se actualiza el campo "entrega"

## Casos de Uso

### Escenario 1: Actualización desde Planificación
1. Usuario abre módulo de Planificación
2. Modifica distribución de enero de 100 a 150 dosis
3. Sistema automáticamente:
   - Actualiza planificación con nuevo valor (150)
   - Busca movimiento de enero correspondiente
   - Actualiza campo `entrega` de 100 a 150
   - Recalcula stock del mes siguiente

### Escenario 2: Actualización desde Movimientos
1. Usuario abre módulo de Movimientos
2. Modifica campo "Entrega" de enero de 150 a 120 dosis
3. Sistema automáticamente:
   - Actualiza movimiento con nuevo valor (120)
   - Busca planificación anual correspondiente
   - Actualiza enero en `distribucion_mensual` de 150 a 120
   - Recalcula `meta_anual` restando 30 del total

### Escenario 3: Corrección de Inconsistencias
1. Usuario detecta diferencias entre módulos
2. Hace clic en "Sincronizar Movimientos" en Planificación
3. Sistema:
   - Compara todos los meses de la planificación con movimientos
   - Actualiza movimientos que tengan diferencias
   - Muestra resumen: "5 movimientos actualizados"

## Beneficios

### Para el Usuario
- **Consistencia**: Los datos siempre están sincronizados entre módulos
- **Eficiencia**: No necesita actualizar manualmente en ambos lugares
- **Confiabilidad**: Reduce errores humanos por inconsistencias
- **Transparencia**: Mensajes claros indican cuándo ocurre sincronización

### Para el Sistema
- **Integridad**: Mantiene relaciones consistentes entre tablas
- **Automatización**: Reduce intervención manual
- **Trazabilidad**: Logs detallados de sincronizaciones
- **Flexibilidad**: Sincronización manual disponible cuando sea necesaria

## Consideraciones Técnicas

### Transacciones
- Todas las operaciones de sincronización usan transacciones de base de datos
- Si falla la sincronización, se revierte la operación principal
- Garantiza consistencia de datos

### Manejo de Errores
- Errores de sincronización no interrumpen la operación principal
- Se registran en logs para debugging
- Usuario recibe notificación si hay problemas

### Performance
- Sincronización solo ocurre cuando hay cambios reales
- Operaciones optimizadas para minimizar consultas a BD
- Debounce en frontend para evitar múltiples llamadas

### Validaciones
- Verificación de existencia de registros antes de actualizar
- Validación de rangos de valores (no negativos)
- Comprobación de permisos y estados

## Mensajes de Usuario

### Éxito
- ✅ Entrega actualizada • [Establecimiento] • Valor: [cantidad] • Sincronizado con planificación
- ✅ Sincronización completada • [X] movimientos actualizados

### Advertencias
- ⚠️ Sincronización con errores • [X] errores encontrados
- ℹ️ No se encontraron diferencias para sincronizar

### Errores
- ❌ Error en sincronización • [mensaje específico]
- ❌ Error al actualizar entrega • [detalles del error]
