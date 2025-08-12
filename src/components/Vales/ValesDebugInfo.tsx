import React from 'react';
import { AlertTriangle, CheckCircle, Info } from 'lucide-react';

/**
 * Componente de debug para el módulo de Vales
 * Ayuda a diagnosticar problemas comunes
 */

interface ValesDebugInfoProps {
  vale?: any;
  isOpen?: boolean;
  showDetails?: boolean;
}

const ValesDebugInfo: React.FC<ValesDebugInfoProps> = ({ 
  vale, 
  isOpen = false, 
  showDetails = false 
}) => {
  if (!showDetails) return null;

  const checks = [
    {
      name: 'Vale existe',
      status: vale ? 'success' : 'error',
      message: vale ? 'Vale está definido' : 'Vale es null o undefined'
    },
    {
      name: 'Vale tiene ID',
      status: vale?.id ? 'success' : 'error',
      message: vale?.id ? `ID: ${vale.id}` : 'Vale no tiene ID válido'
    },
    {
      name: 'Vale tiene detalles',
      status: vale?.detalles ? 'success' : 'error',
      message: vale?.detalles ? `${vale.detalles.length} detalles` : 'Vale no tiene detalles'
    },
    {
      name: 'Detalles es array',
      status: Array.isArray(vale?.detalles) ? 'success' : 'error',
      message: Array.isArray(vale?.detalles) ? 'Detalles es un array válido' : 'Detalles no es un array'
    },
    {
      name: 'Modal está abierto',
      status: isOpen ? 'success' : 'info',
      message: isOpen ? 'Modal está abierto' : 'Modal está cerrado'
    }
  ];

  const getIcon = (status: string) => {
    switch (status) {
      case 'success': return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'error': return <AlertTriangle className="h-4 w-4 text-red-600" />;
      default: return <Info className="h-4 w-4 text-blue-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'success': return 'bg-green-50 border-green-200';
      case 'error': return 'bg-red-50 border-red-200';
      default: return 'bg-blue-50 border-blue-200';
    }
  };

  return (
    <div className="fixed bottom-4 right-4 max-w-sm bg-white border border-gray-200 rounded-lg shadow-lg p-4 z-50">
      <h3 className="font-semibold text-gray-900 mb-3">🔍 Debug Info - Vales</h3>
      
      <div className="space-y-2">
        {checks.map((check, index) => (
          <div 
            key={index}
            className={`flex items-center space-x-2 p-2 rounded border ${getStatusColor(check.status)}`}
          >
            {getIcon(check.status)}
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900">{check.name}</p>
              <p className="text-xs text-gray-600 truncate">{check.message}</p>
            </div>
          </div>
        ))}
      </div>

      {vale && (
        <details className="mt-3">
          <summary className="text-sm font-medium text-gray-700 cursor-pointer">
            Ver datos del vale
          </summary>
          <pre className="mt-2 text-xs bg-gray-100 p-2 rounded overflow-auto max-h-32">
            {JSON.stringify({
              id: vale.id,
              numero: vale.numero,
              estado: vale.estado,
              detallesCount: vale.detalles?.length || 0,
              centroAcopio: vale.centroAcopio?.nombre,
              totalVacunas: vale.totalVacunas
            }, null, 2)}
          </pre>
        </details>
      )}

      <div className="mt-3 text-xs text-gray-500">
        Timestamp: {new Date().toLocaleTimeString()}
      </div>
    </div>
  );
};

export default ValesDebugInfo;
