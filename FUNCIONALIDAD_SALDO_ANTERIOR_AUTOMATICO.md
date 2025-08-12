# Funcionalidad de Actualización Automática de Saldo Anterior

## Descripción

Esta funcionalidad implementa la actualización automática del campo `saldo_anterior` del siguiente mes en la tabla `movimientos_vacunas` cuando se modifica el stock calculado de un establecimiento en el mes actual.

## Cómo Funciona

### Fórmula del Stock Calculado
```
Stock = saldo_anterior + trans_ingreso - salida - trans_salida + entrega
```

### Proceso Automático
1. Cuando se actualiza cualquier campo que afecta el cálculo del stock (`saldo_anterior`, `trans_ingreso`, `salida`, `trans_salida`, `entrega`)
2. El trigger de base de datos calcula automáticamente el nuevo stock
3. Busca si existe un movimiento para el siguiente mes del mismo establecimiento y vacuna
4. Si existe, actualiza el campo `saldo_anterior` del siguiente mes con el stock calculado del mes actual

## Implementación Técnica

### 1. Base de Datos

#### Función PostgreSQL
```sql
CREATE OR REPLACE FUNCTION actualizar_saldo_anterior_siguiente_mes()
RETURNS TRIGGER AS $$
DECLARE
    stock_calculado INTEGER;
    siguiente_mes INTEGER;
    siguiente_anio INTEGER;
    movimiento_siguiente_mes RECORD;
BEGIN
    -- Calcular el stock del movimiento actual
    stock_calculado := NEW.saldo_anterior + NEW.trans_ingreso - NEW.salida - NEW.trans_salida + NEW.entrega;
    
    -- Calcular el siguiente mes y año
    IF NEW.mes = 12 THEN
        siguiente_mes := 1;
        siguiente_anio := NEW.anio + 1;
    ELSE
        siguiente_mes := NEW.mes + 1;
        siguiente_anio := NEW.anio;
    END IF;
    
    -- Buscar y actualizar el movimiento del siguiente mes si existe
    UPDATE movimientos_vacunas
    SET saldo_anterior = stock_calculado,
        updated_at = NOW()
    WHERE establecimiento_id = NEW.establecimiento_id
      AND vacuna_id = NEW.vacuna_id
      AND mes = siguiente_mes
      AND anio = siguiente_anio;
    
    RETURN NEW;
END;
$$ language 'plpgsql';
```

#### Trigger
```sql
CREATE TRIGGER actualizar_saldo_anterior_trigger
    AFTER INSERT OR UPDATE OF saldo_anterior, trans_ingreso, salida, trans_salida, entrega
    ON movimientos_vacunas
    FOR EACH ROW
    EXECUTE FUNCTION actualizar_saldo_anterior_siguiente_mes();
```

### 2. Backend (Node.js/TypeScript)

#### Servicio
- Método `sincronizarSaldoAnteriorSiguienteMes()` para sincronización manual si es necesario
- El trigger se ejecuta automáticamente, pero el método permite verificación manual

#### Controlador
- Endpoint `POST /api/movimientos/sincronizar-saldo-anterior` para sincronización manual

### 3. Frontend (React/TypeScript)

#### Funcionalidad Automática
- Después de actualizar cualquier campo que afecte el stock, el frontend recarga automáticamente los datos
- Delay de 500ms para permitir que el trigger de base de datos se ejecute
- Toast de confirmación profesional

## Ejemplo de Uso

### Escenario
1. **Establecimiento A** tiene un movimiento en **Enero 2024**:
   - Saldo anterior: 100
   - Trans ingreso: 50
   - Salida: 20
   - Trans salida: 10
   - Entrega: 30
   - **Stock calculado: 150**

2. **Establecimiento A** tiene un movimiento en **Febrero 2024**:
   - Saldo anterior: 0 (inicial)

### Proceso Automático
1. Usuario actualiza la "Entrega" de Enero de 30 a 40
2. Nuevo stock calculado de Enero: 160 (100+50-20-10+40)
3. **Automáticamente** el saldo anterior de Febrero se actualiza a 160
4. Frontend recarga los datos y muestra el cambio inmediatamente

## Beneficios

1. **Consistencia de Datos**: Garantiza que el saldo anterior siempre refleje el stock real del mes anterior
2. **Tiempo Real**: Los cambios se reflejan inmediatamente sin intervención manual
3. **Automatización**: Elimina la necesidad de cálculos manuales
4. **Integridad**: Mantiene la trazabilidad completa del inventario mes a mes

## Campos Monitoreados

El trigger se ejecuta cuando se modifican estos campos:
- `saldo_anterior`
- `trans_ingreso`
- `salida`
- `trans_salida`
- `entrega`

## Consideraciones

1. **Orden de Creación**: Los movimientos deben crearse en orden cronológico para máxima efectividad
2. **Rendimiento**: El trigger es eficiente y solo actualiza registros cuando es necesario
3. **Logs**: La función incluye logs opcionales para debugging
4. **Transacciones**: Todas las operaciones son transaccionales para garantizar consistencia

## Pruebas

Utilizar los scripts de prueba incluidos:
- `test_saldo_anterior_automatico.sql`: Prueba completa con datos de ejemplo
- `test_trigger_simple.sql`: Verificación básica de la funcionalidad

## Mantenimiento

La funcionalidad es completamente automática y no requiere mantenimiento regular. Los logs de la base de datos pueden monitorearse para verificar el correcto funcionamiento.
