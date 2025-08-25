# Pruebas de Redistribución Automática de Entregas

## Descripción
Este documento describe las pruebas para validar la funcionalidad de redistribución automática de entregas implementada en el módulo de Movimientos.

## Funcionalidad Implementada

### **Caso 1: Incremento de Entrega**
- **Lógica**: Al incrementar una entrega, se descuenta secuencialmente de los meses siguientes
- **Validación**: Si no hay cantidades suficientes, se rechaza la operación
- **Sincronización**: Actualiza automáticamente las planificaciones afectadas

### **Caso 2: Disminución de Entrega**
- **Lógica**: Al disminuir una entrega, se traslada la diferencia al mes siguiente
- **Creación**: Si no existe movimiento del mes siguiente, se crea automáticamente
- **Sincronización**: Actualiza automáticamente las planificaciones afectadas

## Casos de Prueba

### **Prueba 1: Incremento Exitoso**
**Escenario**: Incrementar entrega de agosto de 10 a 20 (+10)
**Datos iniciales**:
- Agosto: 10
- Septiembre: 15
- Octubre: 10

**Resultado esperado**:
- Agosto: 20
- Septiembre: 5 (15 - 10)
- Octubre: 10
- **Toast**: "✅ Redistribución completada • [Establecimiento] • Entregas redistribuidas automáticamente"

### **Prueba 2: Incremento con Insuficientes Cantidades**
**Escenario**: Incrementar entrega de agosto de 10 a 50 (+40)
**Datos iniciales**:
- Agosto: 10
- Septiembre: 15
- Octubre: 10
- Total disponible en meses siguientes: 25

**Resultado esperado**:
- **Error**: "❌ Redistribución fallida • [Establecimiento] • No hay cantidades suficientes en los meses siguientes. Faltan 15 unidades por redistribuir."
- **Rollback**: Valores regresan al estado anterior

### **Prueba 3: Disminución con Mes Siguiente Existente**
**Escenario**: Disminuir entrega de agosto de 20 a 10 (-10)
**Datos iniciales**:
- Agosto: 20
- Septiembre: 15

**Resultado esperado**:
- Agosto: 10
- Septiembre: 25 (15 + 10)
- **Toast**: "✅ Redistribución completada • [Establecimiento] • Entregas redistribuidas automáticamente"

### **Prueba 4: Disminución Creando Nuevo Mes**
**Escenario**: Disminuir entrega de diciembre de 20 a 10 (-10)
**Datos iniciales**:
- Diciembre 2024: 20
- Enero 2025: No existe

**Resultado esperado**:
- Diciembre 2024: 10
- Enero 2025: 10 (nuevo movimiento creado)
- **Toast**: "✅ Redistribución completada • [Establecimiento] • Entregas redistribuidas automáticamente"

### **Prueba 5: Validación de Entregas Adicionales**
**Escenario**: Intentar modificar entrega con entregas adicionales activas
**Datos iniciales**:
- Agosto: 20 (con 1 entrega adicional de 5)

**Resultado esperado**:
- **Error**: "🔒 Campo bloqueado • [Establecimiento] • No se puede modificar entrega principal con entregas adicionales activas"
- **Sin cambios**: Valores permanecen iguales

## Validaciones de Límites

### **Prueba 6: Límite de Redistribución**
**Escenario**: Intentar redistribuir más de 10,000 unidades
**Resultado esperado**: Error de límite excedido

### **Prueba 7: Límite de Año**
**Escenario**: Intentar crear movimiento en año > 2050
**Resultado esperado**: Error de límite de año

### **Prueba 8: Valores Negativos**
**Escenario**: Intentar establecer entrega negativa
**Resultado esperado**: Error de validación

## Sincronización con Planificaciones

### **Prueba 9: Sincronización Bidireccional**
**Escenario**: Modificar entrega y verificar actualización en planificación
**Pasos**:
1. Modificar entrega en Movimientos
2. Verificar actualización automática en Planificaciones
3. Confirmar que la meta anual se recalcula correctamente

### **Prueba 10: Consistencia de Datos**
**Escenario**: Verificar que los totales coincidan entre módulos
**Validación**: Suma de entregas mensuales = Meta anual en planificación

## Feedback Visual

### **Prueba 11: Mensajes de Toast**
**Validar que se muestren los mensajes correctos**:
- ℹ️ Información: Durante redistribución
- ✅ Éxito: Redistribución completada
- ❌ Error: Cantidades insuficientes o validaciones fallidas
- 🔒 Bloqueo: Entregas adicionales activas

### **Prueba 12: Estados de Carga**
**Validar indicadores visuales**:
- Spinner durante procesamiento
- Deshabilitación de campos durante operación
- Restauración de estado normal al completar

## Casos Edge

### **Prueba 13: Redistribución en Diciembre**
**Escenario**: Disminuir entrega en diciembre (debe crear enero del año siguiente)

### **Prueba 14: Múltiples Redistribuciones Secuenciales**
**Escenario**: Realizar varias modificaciones seguidas y verificar consistencia

### **Prueba 15: Concurrencia**
**Escenario**: Modificaciones simultáneas por diferentes usuarios

## Criterios de Aceptación

✅ **Funcionalidad Core**:
- Redistribución automática funciona en ambos casos
- Validaciones previenen operaciones inválidas
- Rollback automático en caso de error

✅ **Sincronización**:
- Planificaciones se actualizan automáticamente
- Consistencia de datos entre módulos
- Triggers de vales funcionan correctamente

✅ **UX/UI**:
- Feedback visual claro y profesional
- Mensajes de error informativos
- Estados de carga apropiados

✅ **Robustez**:
- Manejo de errores completo
- Validaciones de límites
- Transacciones atómicas

## Instrucciones de Prueba

1. **Preparar datos de prueba** con establecimientos, vacunas y movimientos
2. **Ejecutar cada caso de prueba** siguiendo los escenarios descritos
3. **Verificar resultados** tanto en frontend como en base de datos
4. **Validar sincronización** revisando módulo de Planificaciones
5. **Confirmar feedback visual** observando mensajes de toast

## Estado de Implementación

- ✅ Backend: Lógica de redistribución implementada
- ✅ Frontend: Integración y feedback visual
- ✅ Validaciones: Límites y casos edge cubiertos
- ✅ Sincronización: Bidireccional con planificaciones
- 🔄 Pruebas: En proceso de validación
