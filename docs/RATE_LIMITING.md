# Rate Limiting en SIVAC

## Descripción

El sistema SIVAC implementa rate limiting para proteger contra ataques de fuerza bruta y abuso de la API. La configuración es diferente entre desarrollo y producción.

## Configuración

### Desarrollo
- **Login**: 50 intentos por 5 minutos
- **Refresh Token**: 100 intentos por 5 minutos  
- **Cambio de Contraseña**: 20 intentos por 1 hora
- **Rate Limiting Global**: 1000 requests por 15 minutos

### Producción
- **Login**: 5 intentos por 15 minutos
- **Refresh Token**: 10 intentos por 5 minutos
- **Cambio de Contraseña**: 3 intentos por 1 hora
- **Rate Limiting Global**: 100 requests por 15 minutos

## Manejo de Errores 429

Cuando se alcanza el límite de rate limiting, el servidor responde con:

```json
{
  "success": false,
  "message": "Demasiados intentos de autenticación. Intente nuevamente en X minutos.",
  "error": "RATE_LIMIT_EXCEEDED",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "retryAfter": 300
}
```

## Frontend

El frontend maneja automáticamente los errores 429:

1. **Detección**: Detecta errores de rate limiting
2. **Feedback Visual**: Muestra mensaje de espera con countdown
3. **Bloqueo de UI**: Deshabilita el botón de login durante el bloqueo
4. **Countdown**: Muestra tiempo restante en tiempo real

## Herramientas de Desarrollo

### Limpiar Rate Limiting

En desarrollo, puedes limpiar el rate limiting usando:

```bash
# Desde el directorio backend
npm run clear-rate-limit

# O directamente
node ../scripts/clear-rate-limit.js
```

### Verificar Estado

Consulta el endpoint de health para ver la configuración actual:

```bash
curl http://localhost:3001/api/auth/health
```

## Solución de Problemas

### Error 429 Frecuente en Desarrollo

1. **Verificar Configuración**: Asegúrate de que `NODE_ENV=development`
2. **Limpiar Rate Limiting**: Ejecuta `npm run clear-rate-limit`
3. **Reiniciar Servidor**: Reinicia el backend para limpiar el store en memoria

### Error 429 en Producción

1. **Esperar**: Respeta los tiempos de espera indicados
2. **Verificar IP**: Confirma que no hay múltiples usuarios desde la misma IP
3. **Logs**: Revisa los logs del servidor para patrones de abuso

## Configuración Personalizada

Para modificar los límites, edita las variables de entorno:

```env
# Rate limiting global
RATE_LIMIT_WINDOW_MS=900000  # 15 minutos
RATE_LIMIT_MAX_REQUESTS=100  # 100 requests

# Los límites específicos se configuran en el código
# backend/src/routes/auth.ts
```

## Monitoreo

El sistema incluye headers estándar de rate limiting:

- `X-RateLimit-Limit`: Límite total
- `X-RateLimit-Remaining`: Requests restantes
- `X-RateLimit-Reset`: Timestamp de reset

## Mejores Prácticas

1. **Desarrollo**: Usa las herramientas de limpieza cuando sea necesario
2. **Testing**: Considera el rate limiting en pruebas automatizadas
3. **Producción**: Monitorea los logs para detectar patrones de abuso
4. **Usuario Final**: Implementa retry logic con backoff exponencial
