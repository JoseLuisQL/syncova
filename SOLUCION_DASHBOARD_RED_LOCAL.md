# Solución para Error de Dashboard en Red Local - Sistema SIVAC

## Problema Identificado

Al acceder al dashboard desde la red local, se presentaban errores de parsing JSON:

```
Error fetching centros acopio: SyntaxError: JSON.parse: unexpected character at line 1 column 1 of the JSON data
Error fetching alertas: SyntaxError: JSON.parse: unexpected character at line 1 column 1 of the JSON data
Error fetching actividad: SyntaxError: JSON.parse: unexpected character at line 1 column 1 of the JSON data
```

## Causa del Problema

El hook `usePaginatedDashboard.ts` estaba usando `fetch` directamente con URLs relativas (`/api/dashboard/...`) en lugar de usar el `apiClient` configurado. Esto causaba que las peticiones fueran dirigidas al frontend (puerto 5173) en lugar del backend (puerto 3001), resultando en respuestas HTML en lugar de JSON.

### URLs Problemáticas:
- ❌ `fetch('/api/dashboard/centros-acopio?page=1&limit=5')` → `http://192.168.18.20:5173/api/dashboard/...`
- ✅ `apiClient.get('/dashboard/centros-acopio?page=1&limit=5')` → `http://192.168.18.20:3001/api/dashboard/...`

## Solución Implementada

### 1. Actualización del Hook usePaginatedDashboard.ts

Se reemplazó el uso de `fetch` directo por `apiClient` configurado:

```typescript
// ANTES (problemático)
const response = await fetch(`/api/dashboard/centros-acopio?page=${page}&limit=${initialLimit}`);
const result = await response.json();

// DESPUÉS (corregido)
const response = await apiClient.get(`/dashboard/centros-acopio?page=${page}&limit=${initialLimit}`);
```

### 2. Corrección de Importaciones

Se corrigieron las importaciones para usar rutas relativas correctas:

```typescript
// ANTES
import { apiClient } from '@/config/api';
import type { CentroAcopioStatus, AlertaReciente, ActividadReciente } from '@/types/dashboard';

// DESPUÉS
import { apiClient } from '../config/api';
import type { CentroAcopioStatus, AlertaReciente, ActividadReciente } from '../services/dashboardService';
```

### 3. Funciones Corregidas

Se actualizaron todas las funciones del hook:

- ✅ `usePaginatedCentrosAcopio` - Centros de acopio con paginación
- ✅ `usePaginatedAlertas` - Alertas recientes con paginación  
- ✅ `usePaginatedActividad` - Actividad reciente con paginación

## Verificación de la Solución

### ✅ Checklist de Verificación

- [x] Hook usa `apiClient` en lugar de `fetch` directo
- [x] URLs apuntan al backend (puerto 3001) no al frontend (puerto 5173)
- [x] Importaciones corregidas y sin errores de linting
- [x] Endpoints del dashboard existen en el backend
- [x] Controlador del dashboard implementado correctamente

### 🔍 URLs Corregidas

**Antes (problemático):**
```
GET http://192.168.18.20:5173/api/dashboard/centros-acopio?page=1&limit=5
GET http://192.168.18.20:5173/api/dashboard/alertas?page=1&limit=3
GET http://192.168.18.20:5173/api/dashboard/actividad?page=1&limit=5
```

**Después (correcto):**
```
GET http://192.168.18.20:3001/api/dashboard/centros-acopio?page=1&limit=5
GET http://192.168.18.20:3001/api/dashboard/alertas?page=1&limit=3
GET http://192.168.18.20:3001/api/dashboard/actividad?page=1&limit=5
```

## Cómo Funciona la Solución

1. **Configuración Dinámica**: El `apiClient` usa la configuración dinámica de `apiConfig.ts` que detecta automáticamente la IP de red
2. **URLs Correctas**: Las peticiones van al backend (puerto 3001) en lugar del frontend (puerto 5173)
3. **Respuestas JSON**: El backend devuelve respuestas JSON válidas que se pueden parsear correctamente
4. **Manejo de Errores**: Se mantiene el manejo de errores existente

## Instrucciones de Prueba

### Paso 1: Verificar Backend

Asegúrate de que el backend esté ejecutándose:

```cmd
cd backend
npm run dev
```

Debería mostrar:
```
🌐 URL Red: http://0.0.0.0:3001
```

### Paso 2: Verificar Frontend

Ejecuta el frontend:

```cmd
npm run dev
```

### Paso 3: Acceder al Dashboard

1. Desde otro PC en la red: `http://[IP_DEL_SERVIDOR]:5173`
2. Navegar al dashboard
3. Verificar en la consola del navegador que no hay errores de parsing JSON

### Paso 4: Verificar en Network Tab

En las herramientas de desarrollador, verificar que las peticiones van al puerto 3001:

```
✅ GET http://192.168.18.20:3001/api/dashboard/centros-acopio
✅ GET http://192.168.18.20:3001/api/dashboard/alertas  
✅ GET http://192.168.18.20:3001/api/dashboard/actividad
```

## Archivos Modificados

- `src/hooks/usePaginatedDashboard.ts` - Hook principal con paginación
- `src/utils/apiConfig.ts` - Configuración dinámica de URLs (ya existía)

## Notas Técnicas

- El problema era específico del hook de paginación, no del servicio principal del dashboard
- El `dashboardService.ts` ya usaba `apiClient` correctamente
- La solución mantiene toda la funcionalidad existente de paginación
- Compatible con acceso local y en red

## Debugging

Si aún hay problemas:

1. **Verificar consola del navegador**:
   - No debería haber errores de `JSON.parse`
   - Las URLs deberían apuntar al puerto 3001

2. **Verificar Network Tab**:
   - Las peticiones deberían ir a `http://[IP]:3001/api/dashboard/...`
   - Las respuestas deberían ser JSON válido

3. **Verificar logs del backend**:
   - Debería mostrar las peticiones entrantes del dashboard

---

**Fecha de Implementación**: $(date)
**Estado**: ✅ Completado y Listo para Pruebas
