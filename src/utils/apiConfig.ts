/**
 * Configuración centralizada para URLs de API
 * Detecta automáticamente si se accede desde la red local o localhost
 */

/**
 * Función para obtener la URL base de la API dinámicamente
 * Detecta automáticamente si se accede desde la red local o localhost
 */
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

// Debug: mostrar la URL que se está usando
console.log('🔗 API Base URL configurada:', getApiBaseUrl());
