#!/usr/bin/env node

/**
 * Script para limpiar rate limiting en desarrollo
 */

import axios from 'axios';

const API_URL = process.env.API_URL || 'http://localhost:3001/api';

async function clearRateLimit() {
  try {
    console.log('🧹 Limpiando rate limiting...');

    const response = await axios.post(`${API_URL}/auth/clear-rate-limit`);

    if (response.data.success) {
      console.log('✅ Rate limiting limpiado exitosamente');
      console.log(`📍 IP: ${response.data.data.ip}`);
      console.log(`⏰ Timestamp: ${response.data.data.timestamp}`);
      process.exit(0);
    } else {
      console.error('❌ Error al limpiar rate limiting:', response.data.message);
      process.exit(1);
    }
  } catch (error) {
    if (error.response?.status === 403) {
      console.error('❌ Este script solo funciona en modo desarrollo');
    } else if (error.code === 'ECONNREFUSED') {
      console.error('❌ No se puede conectar al servidor. ¿Está ejecutándose?');
    } else {
      console.error('❌ Error:', error.message);
      console.error('❌ Detalles:', error.response?.data || error);
    }
    process.exit(1);
  }
}

// Ejecutar si es llamado directamente
clearRateLimit();

export { clearRateLimit };
