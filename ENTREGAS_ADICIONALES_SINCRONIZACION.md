# Sincronización Automática de Entregas Adicionales con Planificación

## Problema Identificado

Al crear entregas adicionales en el módulo de Movimientos, los valores no se estaban sumando automáticamente al campo `distribucion_mensual` correspondiente en la tabla `planificacion_anual`. Esto causaba inconsistencias entre:

- **Entrega Base**: Valor original de planificación (ej: 10)
- **Entregas Adicionales**: Valores adicionales agregados (ej: 10)
- **Distribución Mensual**: Debería reflejar la suma total (ej: 20)

## Solución Implementada

### 1. Corrección de Endpoints en Frontend

**Archivo**: `src/services/movimientosService.ts`

- ✅ **createEntregaAdicional**: Cambiado de `/entregas-adicionales` a `/movimientos/{id}/entregas-adicionales`
- ✅ **updateEntregaAdicional**: Cambiado de `/entregas-adicionales/{id}` a `/movimientos/entregas-adicionales/{id}`
- ✅ **deleteEntregaAdicional**: Cambiado de `/entregas-adicionales/{id}` a `/movimientos/entregas-adicionales/{id}`

### 2. Lógica de Sincronización en Backend

**Archivo**: `backend/src/services/MovimientosService.ts`

La función `sincronizarConPlanificacion` ya estaba implementada y funciona así:

```typescript
private static async sincronizarConPlanificacion(
  tx: any,
  movimiento: any,
  diferenciaCantidad: number
): Promise<void> {
  // 1. Busca la planificación anual correspondiente
  // 2. Actualiza el mes específico en distribucion_mensual
  // 3. Recalcula la meta anual
  // 4. Guarda los cambios en transacción
}
```

### 3. Flujo de Sincronización

#### Al Crear Entrega Adicional:
1. Se crea la entrega adicional en `entregas_adicionales`
2. Se actualiza el campo `entrega` en `movimientos_vacunas` (suma la cantidad)
3. Se sincroniza automáticamente con `planificacion_anual.distribucion_mensual`
4. Se recalcula la `meta_anual`

#### Al Actualizar Entrega Adicional:
1. Se calcula la diferencia entre valor anterior y nuevo
2. Se actualiza la entrega adicional
3. Se ajusta el campo `entrega` en movimientos
4. Se sincroniza la diferencia con planificación

#### Al Eliminar Entrega Adicional:
1. Se obtiene la cantidad a restar
2. Se elimina la entrega adicional
3. Se ajusta el campo `entrega` en movimientos
4. Se sincroniza la reducción con planificación

### 4. Mensajes de Confirmación Profesionales

**Archivo**: `src/components/Movimientos/Movimientos.tsx`

- ✅ **Crear**: "✅ Entrega adicional creada • {Establecimiento} • Entrega #{Número} • Sincronizado con planificación"
- ✅ **Actualizar**: "✅ Entrega adicional actualizada • Cantidad: {Valor} • Sincronizado con planificación"
- ✅ **Eliminar**: "✅ Entrega adicional eliminada • Planificación actualizada automáticamente"

## Ejemplo de Funcionamiento

### Escenario:
- **Establecimiento**: Centro de Salud A
- **Vacuna**: COVID-19
- **Mes**: Enero 2024
- **Distribución inicial**: 10 dosis

### Proceso:
1. **Estado inicial**:
   - `planificacion_anual.distribucion_mensual[0]` = 10
   - `movimientos_vacunas.entrega` = 10
   - **Vista**: Entrega Base = 10, Entregas Adicionales = []

2. **Crear entrega adicional de 5 dosis**:
   - `entregas_adicionales` → Nueva fila con cantidad = 5
   - `movimientos_vacunas.entrega` = 15 (10 + 5)
   - `planificacion_anual.distribucion_mensual[0]` = 15 (10 + 5)
   - **Vista**: Entrega Base = 10, Entregas Adicionales = [5]

3. **Crear segunda entrega adicional de 3 dosis**:
   - `entregas_adicionales` → Nueva fila con cantidad = 3
   - `movimientos_vacunas.entrega` = 18 (15 + 3)
   - `planificacion_anual.distribucion_mensual[0]` = 18 (15 + 3)
   - **Vista**: Entrega Base = 10, Entregas Adicionales = [5, 3]

## Cálculo de Stock

El stock se calcula correctamente usando:
```typescript
const stock = saldo + movimiento.entrega;
```

Donde `movimiento.entrega` ya incluye la suma de entrega base + entregas adicionales.

## Validaciones Implementadas

- ✅ No se puede modificar entrega base si hay entregas adicionales activas
- ✅ Validación de cantidades positivas
- ✅ Límite máximo de 10 entregas adicionales por movimiento
- ✅ Verificación de existencia de movimiento antes de crear entrega adicional

## Pruebas Recomendadas

1. **Crear entrega adicional**: Verificar que se suma a distribución mensual
2. **Actualizar cantidad**: Verificar que se ajusta la distribución
3. **Eliminar entrega**: Verificar que se resta de la distribución
4. **Múltiples entregas**: Verificar suma acumulativa correcta
5. **Navegación entre módulos**: Verificar consistencia entre Planificación y Movimientos

## Archivos Modificados

- ✅ `src/services/movimientosService.ts` - Endpoints corregidos
- ✅ `src/components/Movimientos/Movimientos.tsx` - Mensajes mejorados
- ✅ `backend/src/services/MovimientosService.ts` - Lógica de sincronización (ya existía)
