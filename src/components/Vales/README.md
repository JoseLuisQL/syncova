# Módulo 11: VALES DE ENTREGA

## Descripción General

El Módulo de Vales de Entrega es un sistema completo y profesional para la gestión de vales de entrega de vacunas y jeringas por centro de acopio. Permite generar, visualizar, gestionar y revertir vales de manera segura, con afectación automática de stocks de lotes.

## Características Principales

### ✅ Funcionalidades Implementadas

1. **Gestión Completa de Vales**
   - Generación de vales con vista previa
   - Visualización profesional con formato de vale oficial
   - Filtros avanzados (centro de acopio, mes, año, estado)
   - Estados de vale: generado, impreso, entregado

2. **Afectación Automática de Stocks**
   - Afecta stocks de lotes de vacunas (FIFO - primero en vencer)
   - Afecta stocks de lotes de jeringas según multiplicadores
   - Registra movimientos en kardex automáticamente
   - Validaciones de stock disponible antes de generar

3. **Sistema de Multiplicadores de Jeringas**
   - Configuración flexible de jeringas por vacuna
   - Cálculo automático basado en dosis por frasco
   - Soporte para múltiples tipos de jeringas por vacuna
   - Multiplicadores personalizables

4. **Detección de Entregas Adicionales**
   - Detecta automáticamente entregas adicionales
   - Muestra indicadores visuales en la tabla principal
   - Detalle completo en el modal de vale
   - Numeración automática de entregas adicionales

5. **Reversión y Eliminación Segura**
   - Reversión de vales con restauración de stocks
   - Eliminación permanente con confirmaciones múltiples
   - Restauración automática de registros de kardex
   - Validaciones de seguridad

6. **Integración con Movimientos**
   - Botón "Vales por Acopio" en módulo de movimientos
   - Filtros automáticos basados en selección actual
   - Sincronización en tiempo real

## Estructura de Archivos

```
src/components/Vales/
├── Vales.tsx                    # Componente principal
├── ValeDetalleModal.tsx         # Modal de detalle profesional
├── GenerarValeModal.tsx         # Modal de generación con vista previa
├── ValesTestSuite.tsx           # Suite de pruebas
└── README.md                    # Esta documentación

src/services/
├── valesService.ts              # Servicio de comunicación con backend
└── multiplicadoresService.ts    # Servicio de multiplicadores

src/hooks/
├── useVales.ts                  # Hook de gestión de vales
└── useMultiplicadores.ts        # Hook de multiplicadores

src/types/
├── index.ts                     # Tipos principales actualizados
└── multiplicadores.ts           # Tipos específicos de multiplicadores
```

## Uso del Módulo

### 1. Acceso desde Movimientos

```tsx
// En el módulo de movimientos, el botón "Vales por Acopio" abre el módulo
<button onClick={() => setShowValesModal(true)}>
  <Receipt className="h-4 w-4 mr-2" />
  Vales por Acopio
</button>
```

### 2. Uso Independiente

```tsx
import Vales from './components/Vales/Vales';

// Uso básico
<Vales />

// Con filtros iniciales
<Vales
  initialCentroAcopioId="centro-id"
  initialVacunaId="vacuna-id"
  initialMes={6}
  initialAnio={2025}
  onClose={() => console.log('Cerrado')}
/>
```

### 3. Hooks Disponibles

```tsx
import { useVales } from './hooks/useVales';
import { useMultiplicadores } from './hooks/useMultiplicadores';

const MyComponent = () => {
  const {
    vales,
    isLoading,
    generarVale,
    deleteVale,
    revertirVale
  } = useVales();

  const {
    multiplicadores,
    calcularJeringas
  } = useMultiplicadores();
};
```

## API del Servicio

### ValesService

```typescript
// Obtener vales con filtros
ValesService.getVales(filters: ValesFilters)

// Generar vale
ValesService.generarVale(data: GenerarValeDto)

// Vista previa sin afectar stocks
ValesService.getVistaPrevia(centroAcopioId, mes, anio)

// Eliminar vale
ValesService.deleteVale(id: string)

// Revertir vale
ValesService.revertirVale(id: string)
```

### MultiplicadoresService

```typescript
// Obtener configuración de multiplicadores
MultiplicadoresService.getConfiguracionVacuna(vacunaId)

// Calcular jeringas necesarias
MultiplicadoresService.calcularJeringas(vacunaId, cantidad)

// Crear/actualizar multiplicadores
MultiplicadoresService.createMultiplicador(data)
MultiplicadoresService.updateMultiplicador(id, data)
```

## Flujo de Generación de Vales

1. **Selección de Filtros**
   - Usuario selecciona centro de acopio, mes y año
   - Sistema valida que hay movimientos con entregas

2. **Vista Previa**
   - Muestra consolidado sin afectar stocks
   - Permite revisar datos antes de generar
   - Calcula jeringas según multiplicadores

3. **Generación**
   - Afecta stocks de lotes (FIFO)
   - Registra en kardex
   - Crea vale con número único
   - Notifica resultado al usuario

4. **Gestión Post-Generación**
   - Cambio de estados (generado → impreso → entregado)
   - Visualización de detalle profesional
   - Opciones de reversión/eliminación

## Validaciones y Seguridad

### Validaciones de Negocio
- Stock suficiente antes de generar
- Centro de acopio válido
- Período válido (mes/año)
- Movimientos con entregas existentes

### Seguridad
- Confirmaciones múltiples para eliminación
- Mensajes claros sobre consecuencias
- Validación de permisos (TODO: implementar autenticación)
- Logs de auditoría en kardex

## Formato del Vale

El vale sigue el formato oficial requerido:

```
VALE DE ENTREGA DE VACUNAS Y JERINGAS

Centro de Acopio: [NOMBRE]
Responsable de Recojo: [USUARIO]
Fecha: [FECHA]

CONSOLIDADO:
- Lista de todas las vacunas con cantidades totales
- Lista de jeringas calculadas automáticamente

DETALLE POR ESTABLECIMIENTO:
- Cada establecimiento con sus vacunas
- Indicadores de entregas adicionales
- Cantidades base y adicionales separadas

FIRMAS:
- Responsable de Entrega
- Responsable de Recepción
```

## Consideraciones Técnicas

### Performance
- Paginación en listado de vales
- Carga lazy de detalles
- Debounce en filtros de búsqueda
- Optimización de consultas

### Responsividad
- Diseño mobile-first
- Tablas responsive con scroll horizontal
- Modales adaptables a pantalla
- Iconografía clara y consistente

### Mantenibilidad
- Código modular y reutilizable
- Tipos TypeScript completos
- Documentación inline
- Patrones consistentes con el sistema

## Próximas Mejoras

### Funcionalidades Pendientes
- [ ] Impresión directa de vales
- [ ] Exportación a PDF
- [ ] Configuración avanzada de multiplicadores
- [ ] Reportes de vales generados
- [ ] Notificaciones automáticas
- [ ] Integración con sistema de usuarios

### Optimizaciones
- [ ] Cache de vales frecuentes
- [ ] Compresión de imágenes
- [ ] Lazy loading de componentes
- [ ] Service Worker para offline

## Soporte y Mantenimiento

Para cualquier consulta o reporte de bugs:
1. Revisar esta documentación
2. Ejecutar ValesTestSuite para diagnóstico
3. Verificar logs del navegador
4. Contactar al equipo de desarrollo

---

**Versión:** 1.0.0  
**Última actualización:** Julio 2025  
**Desarrollado por:** Augment Agent  
**Estado:** ✅ Completamente funcional
