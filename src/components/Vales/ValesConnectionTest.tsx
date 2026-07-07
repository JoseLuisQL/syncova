import React, { useState, useEffect } from 'react';
import { CheckCircle, Warning, SpinnerGap, ArrowsClockwise, HardDrives, Database } from '@phosphor-icons/react';
import { apiClient } from '../../config/api';

/**
 * Componente de diagnóstico para verificar conectividad con el backend
 */
const ValesConnectionTest: React.FC = () => {
  const [tests, setTests] = useState([
    {
      name: 'Conexión al Backend',
      endpoint: '/health',
      status: 'pending' as 'pending' | 'running' | 'success' | 'error',
      message: '',
      response: null as any
    },
    {
      name: 'API Info',
      endpoint: '/',
      status: 'pending' as 'pending' | 'running' | 'success' | 'error',
      message: '',
      response: null as any
    },
    {
      name: 'Endpoint Vales',
      endpoint: '/vales',
      status: 'pending' as 'pending' | 'running' | 'success' | 'error',
      message: '',
      response: null as any
    },
    {
      name: 'Establecimientos (Centro Acopio)',
      endpoint: '/establecimientos?tipo=centro_acopio&limit=1',
      status: 'pending' as 'pending' | 'running' | 'success' | 'error',
      message: '',
      response: null as any
    }
  ]);

  const [isRunning, setIsRunning] = useState(false);

  const runTest = async (index: number) => {
    setTests(prev => prev.map((test, i) => 
      i === index ? { ...test, status: 'running', message: 'Probando...' } : test
    ));

    try {
      const test = tests[index];
      const response = await apiClient.get(test.endpoint);
      
      setTests(prev => prev.map((t, i) => 
        i === index ? { 
          ...t, 
          status: 'success',
          message: `✅ Conectado - Status: ${response.status}`,
          response: response.data
        } : t
      ));
    } catch (error: any) {
      setTests(prev => prev.map((t, i) => 
        i === index ? { 
          ...t, 
          status: 'error',
          message: `❌ Error: ${error.response?.status || 'Sin conexión'} - ${error.message}`,
          response: error.response?.data || null
        } : t
      ));
    }
  };

  const runAllTests = async () => {
    setIsRunning(true);
    
    for (let i = 0; i < tests.length; i++) {
      await runTest(i);
      // Pequeña pausa entre tests
      await new Promise(resolve => setTimeout(resolve, 500));
    }
    
    setIsRunning(false);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success': return <CheckCircle className="h-5 w-5 text-green-600" />;
      case 'error': return <Warning weight="duotone" className="h-5 w-5 text-red-600" />;
      case 'running': return <SpinnerGap weight="bold" className="h-5 w-5 text-blue-600 animate-spin" />;
      default: return <HardDrives className="h-5 w-5 text-zinc-400" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'success': return 'bg-green-50 border-green-200';
      case 'error': return 'bg-red-50 border-red-200';
      case 'running': return 'bg-blue-50 border-blue-200';
      default: return 'bg-zinc-50 border-zinc-200';
    }
  };

  // Auto-ejecutar tests al montar el componente
  useEffect(() => {
    runAllTests();
  }, []);

  const successCount = tests.filter(t => t.status === 'success').length;
  const errorCount = tests.filter(t => t.status === 'error').length;

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-2xl font-bold text-zinc-900 mb-2 flex items-center justify-center">
          <Database className="h-6 w-6 mr-2" />
          Diagnóstico de Conectividad - Módulo Vales
        </h1>
        <p className="text-zinc-600">
          Verificación de conectividad con el backend y endpoints necesarios
        </p>
      </div>

      {/* Resumen */}
      <div className="bg-white rounded-xl border border-zinc-200 shadow-sm p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-zinc-900">Estado de Conectividad</h2>
          <button type="button"
            onClick={runAllTests}
            disabled={isRunning}
            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
          >
            <ArrowsClockwise className={`h-4 w-4 mr-2 ${isRunning ? 'animate-spin' : ''}`} />
            {isRunning ? 'Probando...' : 'Probar Conexiones'}
          </button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="text-center p-4 bg-zinc-50 rounded-lg">
            <div className="text-2xl font-bold text-zinc-900">{tests.length}</div>
            <div className="text-sm text-zinc-600">Total Tests</div>
          </div>
          <div className="text-center p-4 bg-green-50 rounded-lg">
            <div className="text-2xl font-bold text-green-600">{successCount}</div>
            <div className="text-sm text-green-600">Exitosos</div>
          </div>
          <div className="text-center p-4 bg-red-50 rounded-lg">
            <div className="text-2xl font-bold text-red-600">{errorCount}</div>
            <div className="text-sm text-red-600">Con Error</div>
          </div>
        </div>
      </div>

      {/* Tests Detallados */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold text-zinc-900">Tests Detallados</h2>
        
        {tests.map((test, index) => (
          <div
            key={index}
            className={`border rounded-lg p-4 transition-colors ${getStatusColor(test.status)}`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                {getStatusIcon(test.status)}
                <div>
                  <h3 className="font-medium text-zinc-900">{test.name}</h3>
                  <p className="text-sm text-zinc-600">
                    <code className="bg-zinc-100 px-2 py-1 rounded text-xs">
                      {apiClient.defaults.baseURL}{test.endpoint}
                    </code>
                  </p>
                  {test.message && (
                    <p className={`text-sm mt-1 ${
                      test.status === 'success' ? 'text-green-600' : 
                      test.status === 'error' ? 'text-red-600' : 'text-blue-600'
                    }`}>
                      {test.message}
                    </p>
                  )}
                </div>
              </div>
              <button type="button"
                onClick={() => runTest(index)}
                disabled={test.status === 'running' || isRunning}
                className="px-3 py-1 text-sm bg-white border border-zinc-300 rounded hover:bg-zinc-50 transition-colors disabled:opacity-50"
              >
                {test.status === 'running' ? 'Probando...' : 'Probar'}
              </button>
            </div>

            {/* Mostrar respuesta si existe */}
            {test.response && (
              <details className="mt-3">
                <summary className="text-sm font-medium text-zinc-700 cursor-pointer">
                  Ver respuesta del servidor
                </summary>
                <pre className="mt-2 text-xs bg-zinc-100 p-3 rounded overflow-auto max-h-40">
                  {JSON.stringify(test.response, null, 2)}
                </pre>
              </details>
            )}
          </div>
        ))}
      </div>

      {/* Información de Configuración */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
        <h3 className="font-semibold text-blue-900 mb-3">Información de Configuración</h3>
        <div className="space-y-2 text-sm text-blue-800">
          <div className="flex justify-between">
            <span>Base URL:</span>
            <code className="bg-blue-100 px-2 py-1 rounded">{apiClient.defaults.baseURL}</code>
          </div>
          <div className="flex justify-between">
            <span>Timeout:</span>
            <span>{apiClient.defaults.timeout}ms</span>
          </div>
          <div className="flex justify-between">
            <span>Content-Type:</span>
            <span>{apiClient.defaults.headers['Content-Type']}</span>
          </div>
        </div>
      </div>

      {/* Instrucciones de Solución */}
      {errorCount > 0 && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
          <h3 className="font-semibold text-yellow-900 mb-3">🔧 Posibles Soluciones</h3>
          <ul className="space-y-2 text-sm text-yellow-800">
            <li>• <strong>Backend no iniciado:</strong> Ejecutar <code>npm run dev</code> en la carpeta backend</li>
            <li>• <strong>Puerto incorrecto:</strong> Verificar que el backend esté en puerto 3001</li>
            <li>• <strong>CORS:</strong> Verificar configuración de CORS en el backend</li>
            <li>• <strong>Base de datos:</strong> Verificar que PostgreSQL esté corriendo</li>
            <li>• <strong>Variables de entorno:</strong> Verificar archivo .env en backend</li>
          </ul>
        </div>
      )}
    </div>
  );
};

export default ValesConnectionTest;
