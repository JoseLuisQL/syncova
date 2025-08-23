# Solución para Múltiples Vales de Entregas Adicionales

## Problema Identificado

El sistema estaba experimentando errores de constraint único (P2002) al intentar generar múltiples vales de entregas adicionales para el mismo centro de acopio, mes y año. El error específico era:

```
PrismaClientKnownRequestError: Unique constraint failed on the fields: (`centro_acopio_id`, `mes`, `anio`, `tipo_vale`)
```

## Causa Raíz

1. **Desincronización de Esquemas**: La base de datos no tenía el campo `tipo_vale` ni el enum `TipoVale`, pero el código Prisma intentaba usarlos.

2. **Constraint Único Inadecuado**: El constraint único original no permitía múltiples vales del mismo tipo para el mismo período, lo que impedía generar múltiples vales de entregas adicionales (#1, #2, etc.).

## Solución Implementada

### 1. Migración de Base de Datos

**Archivo**: `backend/migrations/002_add_tipo_vale_support.sql`

La migración agrega:

- **Enum `tipo_vale`**: Con valores `completo`, `solo_base`, `solo_adicionales`
- **Campo `tipo_vale`**: En la tabla `vales_entrega` con valor por defecto `completo`
- **Campo `grupos_entregas_adicionales`**: Para identificar únicamente cada vale de entregas adicionales
- **Constraint único mejorado**: `uk_centro_periodo_tipo_grupos` que incluye el campo de grupos

### 2. Lógica de Identificación Única

Para resolver el problema de múltiples vales de entregas adicionales:

- **Vales `completo` y `solo_base`**: Solo uno permitido por centro/mes/año
- **Vales `solo_adicionales`**: Múltiples permitidos, diferenciados por los grupos de entregas incluidos

#### Ejemplo de Identificación:

```
Vale #1 (solo_adicionales): grupos_entregas_adicionales = "1"
Vale #2 (solo_adicionales): grupos_entregas_adicionales = "2" 
Vale #3 (solo_adicionales): grupos_entregas_adicionales = "1,3"
```

### 3. Actualizaciones de Código

#### ValeService.ts

- **Generación de identificador único**: Al crear vales de `solo_adicionales`, se genera un string con los números de grupos ordenados
- **Validación mejorada**: Verifica grupos específicos en lugar de solo el tipo de vale
- **Compatibilidad**: Mantiene soporte para vales existentes sin el campo `tipo_vale`

#### Prisma Schema

```prisma
model ValeEntrega {
  // ... otros campos
  tipoVale              TipoVale      @default(completo) @map("tipo_vale")
  gruposEntregasAdicionales String?   @map("grupos_entregas_adicionales") @db.Text
  
  @@unique([centroAcopioId, mes, anio, tipoVale, gruposEntregasAdicionales], name: "uk_centro_periodo_tipo_grupos")
}
```

### 4. Aplicación de la Migración

```bash
# Aplicar la migración
npm run db:migrate-tipo-vale

# Verificar que se aplicó correctamente
npm run db:studio
```

## Casos de Uso Soportados

### Escenario 1: Vale Completo
- **Tipo**: `completo`
- **Grupos**: `null`
- **Constraint**: Único por centro/mes/año

### Escenario 2: Vale Solo Base
- **Tipo**: `solo_base`  
- **Grupos**: `null`
- **Constraint**: Único por centro/mes/año

### Escenario 3: Múltiples Vales de Entregas Adicionales
- **Vale #1**: `tipo_vale = 'solo_adicionales'`, `grupos_entregas_adicionales = '1'`
- **Vale #2**: `tipo_vale = 'solo_adicionales'`, `grupos_entregas_adicionales = '2'`
- **Vale #3**: `tipo_vale = 'solo_adicionales'`, `grupos_entregas_adicionales = '1,3'`

Cada combinación es única y permite múltiples vales de entregas adicionales.

## Beneficios de la Solución

1. **Flexibilidad**: Permite generar múltiples vales de entregas adicionales para diferentes grupos
2. **Integridad**: Mantiene la integridad de datos con constraints únicos apropiados
3. **Compatibilidad**: Funciona con vales existentes mediante fallback logic
4. **Escalabilidad**: Soporta cualquier número de grupos de entregas adicionales
5. **Claridad**: Cada vale tiene un identificador único claro

## Validaciones Implementadas

- **Grupos duplicados**: No se pueden generar vales para grupos ya procesados
- **Tipos únicos**: Solo un vale `completo` o `solo_base` por período
- **Combinaciones válidas**: No se puede generar vale `completo` si ya existen vales específicos

## Testing

Para probar la solución:

1. Aplicar la migración
2. Generar vale base para un centro/mes/año
3. Generar vale de entregas adicionales #1 (grupo 1)
4. Generar vale de entregas adicionales #2 (grupo 2)
5. Verificar que ambos se crean exitosamente sin errores de constraint

## Monitoreo

La solución incluye logging detallado para monitorear:
- Creación de vales con tipos específicos
- Validaciones de grupos de entregas
- Errores de constraint (ahora deberían ser mínimos)

## Rollback

Si es necesario revertir:

1. Los vales existentes seguirán funcionando
2. El campo `grupos_entregas_adicionales` puede ser nullable
3. Se puede volver al constraint original si es necesario
