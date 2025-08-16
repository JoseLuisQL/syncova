#!/usr/bin/env node

/**
 * Script para limpiar rate limiting en desarrollo
 */

const axios = require('axios');

const API_URL = process.env.API_URL || 'http://localhost:3001/api';

async function clearRateLimit() {
  try {
    console.log('🧹 Limpiando rate limiting...');
    
    const response = await axios.post(`${API_URL}/auth/clear-rate-limit`);
    
    if (response.data.success) {
      console.log('✅ Rate limiting limpiado exitosamente');
      console.log(`📍 IP: ${response.data.data.ip}`);
      console.log(`⏰ Timestamp: ${response.data.data.timestamp}`);
    } else {
      console.error('❌ Error al limpiar rate limiting:', response.data.message);
    }
  } catch (error) {
    if (error.response?.status === 403) {
      console.error('❌ Este script solo funciona en modo desarrollo');
    } else if (error.code === 'ECONNREFUSED') {
      console.error('❌ No se puede conectar al servidor. ¿Está ejecutándose?');
    } else {
      console.error('❌ Error:', error.message);
    }
  }
}

// Ejecutar si es llamado directamente
if (require.main === module) {
  clearRateLimit();
}

module.exports = { clearRateLimit };
