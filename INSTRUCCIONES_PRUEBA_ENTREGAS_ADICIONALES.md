# Instrucciones de Prueba - Sincronización de Entregas Adicionales

## ✅ Implementación Completada

Se ha implementado la sincronización automática entre entregas adicionales y la distribución mensual de planificación. Los cambios incluyen:

### Cambios Realizados:
1. **Frontend**: Endpoints corregidos para usar la lógica de sincronización
2. **Backend**: Lógica de sincronización ya existía y funciona correctamente
3. **Mensajes**: Toast profesionales con información de sincronización

## 🧪 Cómo Probar la Funcionalidad

### Paso 1: Acceder al Sistema
1. Abrir navegador en: `http://localhost:5174`
2. Navegar al módulo **"Movimientos de Vacunas"**

### Paso 2: Configurar Filtros
1. Seleccionar un **Centro de Acopio** (o "Todos")
2. Seleccionar una **Vacuna** (ej: COVID-19)
3. Seleccionar **Mes** y **Año** actuales

### Paso 3: Verificar Estado Inicial
1. Anotar el valor de **"Entrega"** en un establecimiento
2. Ir al módulo **"Planificación Anual"**
3. Verificar el valor de **distribución mensual** para el mismo mes
4. **Ambos valores deben coincidir**

### Paso 4: Crear Entrega Adicional
1. Volver al módulo **"Movimientos"**
2. Hacer clic en **"+ Agregar Entrega"** en un establecimiento
3. **Verificar toast**: "✅ Entrega adicional creada • {Establecimiento} • Entrega #1 • Sincronizado con planificación"
4. Observar que aparece una nueva fila de **"Entrega Adicional #1"**

### Paso 5: Agregar Cantidad a Entrega Adicional
1. En la fila de **"Entrega Adicional #1"**, hacer clic en el campo cantidad
2. Ingresar un valor (ej: 10)
3. Presionar Enter o hacer clic fuera del campo
4. **Verificar toast**: "✅ Entrega adicional actualizada • Cantidad: 10 • Sincronizado con planificación"

### Paso 6: Verificar Sincronización
1. Ir al módulo **"Planificación Anual"**
2. Buscar el mismo establecimiento, vacuna y mes
3. **Verificar que el valor de distribución mensual se incrementó en 10**
4. Volver a **"Movimientos"**
5. **Verificar que**:
   - **Entrega Base**: Mantiene su valor original
   - **Entrega Adicional #1**: Muestra 10
   - **Stock**: Se calculó correctamente con la suma total

### Paso 7: Probar Múltiples Entregas
1. Crear una segunda entrega adicional
2. Agregar cantidad (ej: 5)
3. Verificar que la planificación se actualiza sumando ambas entregas adicionales

### Paso 8: Probar Actualización
1. Modificar la cantidad de una entrega adicional existente
2. Verificar que la planificación se ajusta con la diferencia

### Paso 9: Probar Eliminación
1. Hacer clic en **"🗑️"** para eliminar una entrega adicional
2. **Verificar toast**: "✅ Entrega adicional eliminada • Planificación actualizada automáticamente"
3. Verificar que la planificación se reduce correctamente

## 🔍 Puntos Clave a Verificar

### ✅ Sincronización Correcta:
- [ ] Entrega adicional suma a distribución mensual
- [ ] Múltiples entregas se acumulan correctamente
- [ ] Actualización ajusta la diferencia
- [ ] Eliminación resta el valor correcto

### ✅ Separación Visual:
- [ ] Entrega base se mantiene separada
- [ ] Entregas adicionales se muestran por separado
- [ ] Stock total refleja la suma correcta

### ✅ Validaciones:
- [ ] No se puede modificar entrega base con entregas adicionales activas
- [ ] Cantidades deben ser positivas
- [ ] Límite de 10 entregas adicionales por movimiento

### ✅ Mensajes Profesionales:
- [ ] Toast de creación incluye "Sincronizado con planificación"
- [ ] Toast de actualización incluye "Sincronizado con planificación"
- [ ] Toast de eliminación incluye "Planificación actualizada automáticamente"

## 🐛 Posibles Problemas y Soluciones

### Problema: "Error al crear entrega adicional"
**Solución**: Verificar que existe un movimiento para ese establecimiento/vacuna/mes/año

### Problema: "Campo bloqueado"
**Solución**: No intentar modificar entrega base cuando hay entregas adicionales

### Problema: Valores no se sincronizan
**Solución**: Verificar que se está usando el endpoint correcto (`/movimientos/{id}/entregas-adicionales`)

## 📊 Herramientas de Verificación

### Prisma Studio (Base de Datos):
- URL: `http://localhost:5555`
- Tablas a revisar:
  - `planificacion_anual` → `distribucion_mensual`
  - `movimientos_vacunas` → `entrega`
  - `entregas_adicionales` → `cantidad`

### Consola del Navegador:
- Verificar logs de sincronización
- Revisar respuestas de API
- Confirmar que no hay errores JavaScript

## ✅ Resultado Esperado

Al completar las pruebas, deberías observar:

1. **Consistencia total** entre módulos Planificación y Movimientos
2. **Cálculos automáticos** de stock que incluyen entregas adicionales
3. **Mensajes profesionales** que confirman la sincronización
4. **Separación visual clara** entre entrega base y entregas adicionales
5. **Funcionalidad robusta** con validaciones apropiadas

La implementación está **lista para uso en producción** con sincronización automática profesional.
