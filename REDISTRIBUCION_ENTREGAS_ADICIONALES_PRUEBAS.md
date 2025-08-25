# Pruebas de Redistribución Automática para Entregas Adicionales

## Descripción
Este documento describe las pruebas para validar la funcionalidad de redistribución automática implementada para entregas adicionales en el módulo de Movimientos.

## Funcionalidad Implementada

### **Redistribución Automática en Entregas Adicionales**
- **Creación**: Al crear una entrega adicional con cantidad > 0, redistribuye automáticamente
- **Actualización**: Al modificar la cantidad de una entrega adicional, redistribuye la diferencia
- **Eliminación**: Al eliminar una entrega adicional, traslada su cantidad al mes siguiente

### **Lógica de Redistribución**
- **Incremento**: Descuenta secuencialmente de meses siguientes
- **Disminución**: Traslada la diferencia al mes siguiente
- **Eliminación**: Traslada toda la cantidad al mes siguiente

## Casos de Prueba para Entregas Adicionales

### **Prueba 1: Creación con Redistribución**
**Escenario**: Crear entrega adicional con cantidad 15
**Datos iniciales**:
- Agosto: Entrega base 10
- Septiembre: 20
- Octubre: 15

**Resultado esperado**:
- Agosto: Entrega base 10 + Entrega adicional 15 = Total 25
- Septiembre: 5 (20 - 15)
- Octubre: 15
- **Toast**: "🔄 Redistribuyendo automáticamente • [Establecimiento] • Entrega adicional • incremento de 15 unidades"
- **Toast**: "✅ Redistribución completada • [Establecimiento] • Entrega adicional actualizada • Entregas redistribuidas automáticamente"

### **Prueba 2: Actualización con Incremento**
**Escenario**: Aumentar entrega adicional de 10 a 20 (+10)
**Datos iniciales**:
- Agosto: Entrega base 15 + Entrega adicional 10 = Total 25
- Septiembre: 15
- Octubre: 10

**Resultado esperado**:
- Agosto: Entrega base 15 + Entrega adicional 20 = Total 35
- Septiembre: 5 (15 - 10)
- Octubre: 10
- **Toast**: "🔄 Redistribuyendo automáticamente • [Establecimiento] • Entrega adicional • incremento de 10 unidades"

### **Prueba 3: Actualización con Disminución**
**Escenario**: Reducir entrega adicional de 20 a 10 (-10)
**Datos iniciales**:
- Agosto: Entrega base 15 + Entrega adicional 20 = Total 35
- Septiembre: 5

**Resultado esperado**:
- Agosto: Entrega base 15 + Entrega adicional 10 = Total 25
- Septiembre: 15 (5 + 10)
- **Toast**: "🔄 Redistribuyendo automáticamente • [Establecimiento] • Entrega adicional • disminución de 10 unidades"

### **Prueba 4: Eliminación de Entrega Adicional**
**Escenario**: Eliminar entrega adicional de 15 unidades
**Datos iniciales**:
- Agosto: Entrega base 10 + Entrega adicional 15 = Total 25
- Septiembre: 5

**Resultado esperado**:
- Agosto: Entrega base 10 = Total 10
- Septiembre: 20 (5 + 15)
- **Toast**: "🔄 Redistribuyendo automáticamente • [Establecimiento] • Eliminando entrega adicional • Trasladando 15 unidades"
- **Toast**: "✅ Redistribución completada • [Establecimiento] • Entrega adicional eliminada • Entregas redistribuidas automáticamente"

### **Prueba 5: Cantidades Insuficientes**
**Escenario**: Crear entrega adicional de 50 cuando solo hay 30 en meses siguientes
**Datos iniciales**:
- Agosto: Entrega base 10
- Septiembre: 15
- Octubre: 15
- Total disponible: 30

**Resultado esperado**:
- **Error**: "❌ Redistribución fallida • [Establecimiento] • No hay cantidades suficientes en los meses siguientes. Faltan 20 unidades por redistribuir."
- **Rollback**: No se crea la entrega adicional

### **Prueba 6: Múltiples Entregas Adicionales**
**Escenario**: Crear segunda entrega adicional cuando ya existe una
**Datos iniciales**:
- Agosto: Entrega base 10 + Entrega adicional #1: 5 = Total 15
- Septiembre: 10

**Acción**: Crear entrega adicional #2 con cantidad 8

**Resultado esperado**:
- Agosto: Entrega base 10 + Entrega adicional #1: 5 + Entrega adicional #2: 8 = Total 23
- Septiembre: 2 (10 - 8)

## Validaciones Específicas para Entregas Adicionales

### **Prueba 7: Validación de Cantidad Negativa**
**Escenario**: Intentar crear entrega adicional con cantidad -5
**Resultado esperado**: Error "La cantidad de entrega adicional no puede ser negativa"

### **Prueba 8: Validación de Límite Máximo**
**Escenario**: Intentar crear entrega adicional con cantidad 150,000
**Resultado esperado**: Error "La cantidad de entrega adicional excede el límite máximo permitido (100,000 unidades)"

### **Prueba 9: Validación de Número de Entrega**
**Escenario**: Intentar crear entrega adicional con número 0 o 100
**Resultado esperado**: Error "El número de entrega debe estar entre 1 y 99"

### **Prueba 10: Número de Entrega Duplicado**
**Escenario**: Intentar crear entrega adicional #2 cuando ya existe #2
**Resultado esperado**: Error "Ya existe una entrega adicional con el número 2"

## Sincronización y Consistencia

### **Prueba 11: Sincronización con Planificaciones**
**Escenario**: Crear/modificar entrega adicional y verificar planificación
**Validación**: 
- Planificación se actualiza automáticamente
- Meta anual refleja el cambio
- Distribución mensual es consistente

### **Prueba 12: Sincronización con Vales**
**Escenario**: Modificar entrega adicional y verificar vales
**Validación**:
- Vales se regeneran automáticamente
- Cantidades en vales coinciden con entregas totales
- Triggers automáticos funcionan

### **Prueba 13: Integridad de Datos**
**Escenario**: Verificar que entrega total = entrega base + suma de entregas adicionales
**Validación**: Consistencia matemática en todo momento

## Casos Edge para Entregas Adicionales

### **Prueba 14: Entrega Adicional en Diciembre**
**Escenario**: Crear entrega adicional en diciembre (debe crear enero del año siguiente)

### **Prueba 15: Eliminación de Última Entrega Adicional**
**Escenario**: Eliminar la única entrega adicional y verificar que entrega_base se limpia

### **Prueba 16: Modificación Simultánea**
**Escenario**: Modificar entrega base y entrega adicional simultáneamente

### **Prueba 17: Transición de Año**
**Escenario**: Entrega adicional en diciembre que redistribuye a enero siguiente

## Feedback Visual Específico

### **Prueba 18: Mensajes de Toast para Entregas Adicionales**
**Validar mensajes específicos**:
- 🔄 "Redistribuyendo automáticamente • [Establecimiento] • Entrega adicional • [operación]"
- ✅ "Redistribución completada • [Establecimiento] • Entrega adicional actualizada"
- ❌ "Redistribución fallida • [Establecimiento] • [error específico]"

### **Prueba 19: Estados de Carga**
**Validar indicadores visuales**:
- Spinner durante procesamiento de entrega adicional
- Deshabilitación de campos durante operación
- Feedback visual diferenciado para entregas adicionales

## Criterios de Aceptación para Entregas Adicionales

✅ **Funcionalidad Core**:
- Redistribución automática en creación, actualización y eliminación
- Validaciones específicas para entregas adicionales
- Rollback automático en caso de error

✅ **Sincronización**:
- Planificaciones se actualizan automáticamente
- Vales se regeneran correctamente
- Consistencia entre entrega base y adicionales

✅ **UX/UI**:
- Feedback visual específico para entregas adicionales
- Mensajes diferenciados por tipo de operación
- Estados de carga apropiados

✅ **Robustez**:
- Manejo de múltiples entregas adicionales
- Validaciones de límites específicas
- Transacciones atómicas para todas las operaciones

## Instrucciones de Prueba

1. **Preparar datos de prueba** con movimientos que tengan entregas adicionales
2. **Ejecutar casos de creación** con diferentes cantidades
3. **Probar modificaciones** de entregas adicionales existentes
4. **Validar eliminaciones** y redistribución automática
5. **Verificar sincronización** con planificaciones y vales
6. **Confirmar feedback visual** específico para entregas adicionales

## Estado de Implementación

- ✅ Backend: Redistribución automática para entregas adicionales
- ✅ Frontend: Feedback visual específico implementado
- ✅ Validaciones: Límites y casos edge cubiertos
- ✅ Sincronización: Bidireccional con planificaciones y vales
- 🔄 Pruebas: Listas para validación completa
