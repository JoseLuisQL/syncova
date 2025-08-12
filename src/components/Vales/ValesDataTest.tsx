import React from 'react';
import { CheckCircle, AlertTriangle, Info } from 'lucide-react';

interface ValesDataTestProps {
  vale: any;
}

/**
 * Componente de prueba para verificar los datos del vale
 */
const ValesDataTest: React.FC<ValesDataTestProps> = ({ vale }) => {
  if (!vale) {
    return (
      <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
        <div className="flex items-center">
          <AlertTriangle className="h-5 w-5 text-red-600 mr-2" />
          <span className="text-red-800 font-medium">No hay vale para analizar</span>
        </div>
      </div>
    );
  }

  const formatNumber = (value: any): string => {
    const num = Number(value);
    if (isNaN(num)) {
      return `❌ NaN (${typeof value}: ${value})`;
    }
    return `✅ ${num.toLocaleString('es-PE')}`;
  };

  const analyzeDetalle = (detalle: any, index: number) => {
    return (
      <div key={index} className="p-3 bg-gray-50 border border-gray-200 rounded-lg">
        <h4 className="font-medium text-gray-900 mb-2">Detalle #{index + 1}</h4>
        <div className="grid grid-cols-2 gap-2 text-sm">
          <div>
            <span className="text-gray-600">Establecimiento:</span>
            <div className="font-medium">{detalle.establecimiento?.nombre || '❌ Sin nombre'}</div>
          </div>
          <div>
            <span className="text-gray-600">Vacuna:</span>
            <div className="font-medium">{detalle.vacuna?.nombre || '❌ Sin nombre'}</div>
          </div>
          <div>
            <span className="text-gray-600">Cantidad Total:</span>
            <div className="font-mono">{formatNumber(detalle.cantidadTotal)}</div>
          </div>
          <div>
            <span className="text-gray-600">Cantidad Programada:</span>
            <div className="font-mono">{formatNumber(detalle.cantidadProgramada)}</div>
          </div>
          <div>
            <span className="text-gray-600">Cantidad Adicional:</span>
            <div className="font-mono">{formatNumber(detalle.cantidadAdicional)}</div>
          </div>
          <div>
            <span className="text-gray-600">Dosis por Frasco:</span>
            <div className="font-mono">{formatNumber(detalle.vacuna?.dosisPorFrasco)}</div>
          </div>
        </div>
        
        {/* Mostrar datos raw */}
        <details className="mt-2">
          <summary className="text-xs text-gray-500 cursor-pointer">Ver datos raw</summary>
          <pre className="text-xs bg-gray-100 p-2 rounded mt-1 overflow-auto max-h-32">
            {JSON.stringify(detalle, null, 2)}
          </pre>
        </details>
      </div>
    );
  };

  return (
    <div className="space-y-4">
      {/* Información del Vale */}
      <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <div className="flex items-center mb-2">
          <Info className="h-5 w-5 text-blue-600 mr-2" />
          <span className="text-blue-800 font-medium">Información del Vale</span>
        </div>
        <div className="grid grid-cols-2 gap-2 text-sm">
          <div>
            <span className="text-blue-600">Número:</span>
            <div className="font-medium">{vale.numero || '❌ Sin número'}</div>
          </div>
          <div>
            <span className="text-blue-600">Estado:</span>
            <div className="font-medium">{vale.estado || '❌ Sin estado'}</div>
          </div>
          <div>
            <span className="text-blue-600">Mes:</span>
            <div className="font-medium">{vale.mes || '❌ Sin mes'}</div>
          </div>
          <div>
            <span className="text-blue-600">Año:</span>
            <div className="font-medium">{vale.anio || '❌ Sin año'}</div>
          </div>
          <div>
            <span className="text-blue-600">Total Vacunas:</span>
            <div className="font-mono">{formatNumber(vale.totalVacunas)}</div>
          </div>
          <div>
            <span className="text-blue-600">Total Establecimientos:</span>
            <div className="font-mono">{formatNumber(vale.totalEstablecimientos)}</div>
          </div>
        </div>
      </div>

      {/* Análisis de Detalles */}
      <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
        <div className="flex items-center mb-2">
          <CheckCircle className="h-5 w-5 text-green-600 mr-2" />
          <span className="text-green-800 font-medium">
            Análisis de Detalles ({vale.detalles?.length || 0} items)
          </span>
        </div>
        
        {!vale.detalles || vale.detalles.length === 0 ? (
          <div className="text-red-600">❌ No hay detalles en el vale</div>
        ) : (
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {vale.detalles.slice(0, 5).map((detalle: any, index: number) => 
              analyzeDetalle(detalle, index)
            )}
            {vale.detalles.length > 5 && (
              <div className="text-center text-gray-500 text-sm">
                ... y {vale.detalles.length - 5} detalles más
              </div>
            )}
          </div>
        )}
      </div>

      {/* Resumen de Problemas */}
      <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
        <div className="flex items-center mb-2">
          <AlertTriangle className="h-5 w-5 text-yellow-600 mr-2" />
          <span className="text-yellow-800 font-medium">Diagnóstico de Problemas</span>
        </div>
        
        <div className="space-y-2 text-sm">
          {!vale.detalles && (
            <div className="text-red-600">❌ Propiedad 'detalles' no existe</div>
          )}
          {vale.detalles && vale.detalles.length === 0 && (
            <div className="text-red-600">❌ Array 'detalles' está vacío</div>
          )}
          {vale.detalles && vale.detalles.some((d: any) => isNaN(Number(d.cantidadTotal))) && (
            <div className="text-red-600">❌ Algunas cantidades totales no son números válidos</div>
          )}
          {vale.detalles && vale.detalles.some((d: any) => !d.vacuna) && (
            <div className="text-red-600">❌ Algunos detalles no tienen información de vacuna</div>
          )}
          {vale.detalles && vale.detalles.some((d: any) => !d.establecimiento) && (
            <div className="text-red-600">❌ Algunos detalles no tienen información de establecimiento</div>
          )}
          
          {vale.detalles && vale.detalles.length > 0 && 
           vale.detalles.every((d: any) => !isNaN(Number(d.cantidadTotal))) &&
           vale.detalles.every((d: any) => d.vacuna && d.establecimiento) && (
            <div className="text-green-600">✅ Todos los datos parecen estar correctos</div>
          )}
        </div>
      </div>

      {/* Datos Raw del Vale */}
      <details className="p-4 bg-gray-50 border border-gray-200 rounded-lg">
        <summary className="font-medium text-gray-700 cursor-pointer">
          Ver datos completos del vale (JSON)
        </summary>
        <pre className="text-xs bg-white p-3 rounded mt-2 overflow-auto max-h-64 border">
          {JSON.stringify(vale, null, 2)}
        </pre>
      </details>
    </div>
  );
};

export default ValesDataTest;
