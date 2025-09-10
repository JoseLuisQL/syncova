# Solución para Acceso en Red Local - Sistema SIVAC

## Problema Identificado

El sistema SIVAC no funcionaba correctamente cuando se accedía desde otro PC en la red local, mostrando errores de conexión:

```
GET http://localhost:3001/api/vacunas net::ERR_CONNECTION_REFUSED
```

## Causa del Problema

El frontend tenía URLs hardcodeadas a `localhost:3001`, lo que solo funciona cuando se accede desde el mismo PC donde está ejecutándose el servidor. Cuando se accede desde otro PC en la red, `localhost` se refiere al PC cliente, no al servidor.

## Solución Implementada

### 1. Configuración Dinámica de URLs

Se creó un archivo centralizado `src/utils/apiConfig.ts` que detecta automáticamente si se está accediendo desde la red local:

```typescript
export const getApiBaseUrl = (): string => {
  // Si hay una variable de entorno definida, usarla
  if (import.meta.env.VITE_API_URL) {
    return import.meta.env.VITE_API_URL;
  }
  
  // Detectar si estamos accediendo desde la red local
  const currentHost = window.location.hostname;
  
  // Si el hostname es una IP de red local (no localhost), usar esa IP para la API
  if (currentHost !== 'localhost' && currentHost !== '127.0.0.1') {
    return `http://${currentHost}:3001/api`;
  }
  
  // Por defecto, usar localhost
  return 'http://localhost:3001/api';
};
```

### 2. Servicios Actualizados

Se actualizaron todos los servicios para usar la configuración dinámica:

- ✅ `src/services/KardexService.ts`
- ✅ `src/services/LotesService.ts`
- ✅ `src/services/redesService.ts`
- ✅ `src/services/microredesService.ts`
- ✅ `src/services/centrosAcopioService.ts`
- ✅ `src/hooks/useRedes.ts`

### 3. Configuración del Backend

El backend ya estaba configurado correctamente:

- ✅ Escucha en `0.0.0.0:3001` (todas las interfaces de red)
- ✅ CORS configurado para permitir todos los orígenes (`*`)
- ✅ Headers apropiados para acceso en red

## Cómo Funciona la Solución

1. **Acceso Local**: Cuando se accede desde `localhost` o `127.0.0.1`, usa `http://localhost:3001/api`
2. **Acceso en Red**: Cuando se accede desde una IP de red (ej: `192.168.1.100`), usa `http://192.168.1.100:3001/api`
3. **Variable de Entorno**: Si se define `VITE_API_URL`, se usa esa URL (útil para configuraciones específicas)

## Instrucciones de Prueba

### Paso 1: Obtener la IP del Servidor

En el PC donde está ejecutándose el backend, ejecutar:

```cmd
ipconfig
```

Buscar la IP de la interfaz de red local (ej: `192.168.1.100`)

### Paso 2: Iniciar el Sistema

1. **Backend** (en el PC servidor):
   ```cmd
   cd backend
   npm run dev
   ```

2. **Frontend** (en el PC servidor):
   ```cmd
   npm run dev
   ```

### Paso 3: Acceder desde Otro PC

1. Abrir navegador en otro PC de la red
2. Ir a `http://[IP_DEL_SERVIDOR]:5173`
   - Ejemplo: `http://192.168.1.100:5173`
3. El sistema debería cargar correctamente sin errores de conexión

### Paso 4: Verificar en Consola

En la consola del navegador debería aparecer:

```
🔗 API Base URL configurada: http://192.168.1.100:3001/api
```

## Configuración Avanzada

### Variable de Entorno Personalizada

Si necesitas una URL específica, crear archivo `.env` en la raíz del proyecto:

```env
VITE_API_URL=http://mi-servidor:3001/api
```

### Configuración de Firewall

Asegúrate de que el puerto 3001 esté abierto en el firewall del PC servidor:

```cmd
# Windows (ejecutar como administrador)
netsh advfirewall firewall add rule name="SIVAC Backend" dir=in action=allow protocol=TCP localport=3001
```

## Verificación de la Solución

### ✅ Checklist de Verificación

- [ ] Backend ejecutándose en `0.0.0.0:3001`
- [ ] Frontend ejecutándose en `0.0.0.0:5173`
- [ ] Acceso local funciona (`localhost:5173`)
- [ ] Acceso en red funciona (`http://[IP]:5173`)
- [ ] No hay errores de conexión en consola
- [ ] Todas las funcionalidades del sistema operan correctamente

### 🔍 Debugging

Si aún hay problemas:

1. **Verificar conectividad**:
   ```cmd
   ping [IP_DEL_SERVIDOR]
   telnet [IP_DEL_SERVIDOR] 3001
   ```

2. **Verificar logs del backend**:
   - Debería mostrar: `🌐 URL Red: http://0.0.0.0:3001`

3. **Verificar consola del navegador**:
   - Debería mostrar: `🔗 API Base URL configurada: http://[IP]:3001/api`

## Archivos Modificados

- `src/utils/apiConfig.ts` (nuevo)
- `src/services/KardexService.ts`
- `src/services/LotesService.ts`
- `src/services/redesService.ts`
- `src/services/microredesService.ts`
- `src/services/centrosAcopioService.ts`
- `src/hooks/useRedes.ts`

## Notas Técnicas

- La detección automática funciona basándose en `window.location.hostname`
- Compatible con IPv4 e IPv6
- Mantiene compatibilidad con desarrollo local
- No requiere configuración adicional en la mayoría de casos
- Funciona con cualquier IP de red local (192.168.x.x, 10.x.x.x, 172.16-31.x.x)

---

**Fecha de Implementación**: $(date)
**Estado**: ✅ Completado y Listo para Pruebas
