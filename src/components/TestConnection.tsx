import React, { useState, useEffect } from 'react';
import { CheckCircle, XCircle, Loader2, RefreshCw } from 'lucide-react';
import { checkBackendConnection } from '../utils/debug';
import { apiClient } from '../config/api';

interface ConnectionTestProps {
  onClose: () => void;
}

const TestConnection: React.FC<ConnectionTestProps> = ({ onClose }) => {
  const [tests, setTests] = useState({
    backend: { status: 'loading', message: '', time: 0 },
    health: { status: 'loading', message: '', time: 0 },
    establecimientos: { status: 'loading', message: '', time: 0 }
  });

  const runTests = async () => {
    // Reset tests
    setTests({
      backend: { status: 'loading', message: '', time: 0 },
      health: { status: 'loading', message: '', time: 0 },
      establecimientos: { status: 'loading', message: '', time: 0 }
    });

    // Test 1: Backend Connection
    try {
      const start = Date.now();
      const connected = await checkBackendConnection();
      const time = Date.now() - start;
      
      setTests(prev => ({
        ...prev,
        backend: {
          status: connected ? 'success' : 'error',
          message: connected ? 'Conexión exitosa' : 'No se pudo conectar',
          time
        }
      }));
    } catch (error) {
      setTests(prev => ({
        ...prev,
        backend: {
          status: 'error',
          message: 'Error de conexión',
          time: 0
        }
      }));
    }

    // Test 2: Health Endpoint
    try {
      const start = Date.now();
      const response = await fetch(`${import.meta.env.VITE_API_URL?.replace('/api', '')}/health`);
      const time = Date.now() - start;
      
      setTests(prev => ({
        ...prev,
        health: {
          status: response.ok ? 'success' : 'error',
          message: response.ok ? `Status: ${response.status}` : `Error: ${response.status}`,
          time
        }
      }));
    } catch (error) {
      setTests(prev => ({
        ...prev,
        health: {
          status: 'error',
          message: 'Error al conectar con /health',
          time: 0
        }
      }));
    }

    // Test 3: Establecimientos API
    try {
      const start = Date.now();
      const response = await apiClient.get('/establecimientos?limit=1');
      const time = Date.now() - start;
      
      setTests(prev => ({
        ...prev,
        establecimientos: {
          status: response.status === 200 ? 'success' : 'error',
          message: response.status === 200 ? 
            `API funcionando - ${response.data?.data?.total || 0} establecimientos` : 
            `Error: ${response.status}`,
          time
        }
      }));
    } catch (error: any) {
      setTests(prev => ({
        ...prev,
        establecimientos: {
          status: 'error',
          message: error?.response?.data?.error || error?.message || 'Error desconocido',
          time: 0
        }
      }));
    }
  };

  useEffect(() => {
    runTests();
  }, []);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'loading':
        return <Loader2 className="h-5 w-5 animate-spin text-blue-500" />;
      case 'success':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'error':
        return <XCircle className="h-5 w-5 text-red-500" />;
      default:
        return null;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'success':
        return 'text-green-600';
      case 'error':
        return 'text-red-600';
      default:
        return 'text-gray-600';
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg max-w-md w-full m-4">
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-900">
              Prueba de Conexión
            </h2>
            <button
              onClick={runTests}
              className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
            >
              <RefreshCw className="h-5 w-5" />
            </button>
          </div>
          
          <div className="space-y-4">
            {Object.entries(tests).map(([key, test]) => (
              <div key={key} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center">
                  {getStatusIcon(test.status)}
                  <div className="ml-3">
                    <p className="font-medium text-gray-900 capitalize">
                      {key === 'establecimientos' ? 'API Establecimientos' : key}
                    </p>
                    <p className={`text-sm ${getStatusColor(test.status)}`}>
                      {test.message}
                    </p>
                  </div>
                </div>
                {test.time > 0 && (
                  <span className="text-xs text-gray-500">
                    {test.time}ms
                  </span>
                )}
              </div>
            ))}
          </div>
          
          <div className="mt-6 flex justify-end">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
            >
              Cerrar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TestConnection;
