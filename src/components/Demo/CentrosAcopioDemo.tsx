import React from 'react';
import { 
  COLORES_CENTROS_ACOPIO, 
  ORDEN_ESTABLECIMIENTOS,
  getCentroAcopioPorNombre,
  getColoresEstablecimiento 
} from '../../utils/centroAcopioUtils';

/**
 * Componente de demostración para mostrar los colores y agrupación por centros de acopio
 * Este componente muestra cómo se ven los establecimientos organizados y coloreados
 */
const CentrosAcopioDemo: React.FC = () => {
  // Agrupar establecimientos por centro de acopio para la demostración
  const establecimientosPorCentro = ORDEN_ESTABLECIMIENTOS.reduce((grupos, nombreEstablecimiento) => {
    const centro = getCentroAcopioPorNombre(nombreEstablecimiento);
    if (!grupos[centro]) {
      grupos[centro] = [];
    }
    grupos[centro].push(nombreEstablecimiento);
    return grupos;
  }, {} as Record<string, string[]>);

  return (
    <div className="p-6 bg-white rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">
        🎨 Demostración: Colores por Centro de Acopio
      </h2>
      
      <div className="mb-8">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">
          Paleta de Colores Corporativos
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {Object.entries(COLORES_CENTROS_ACOPIO).map(([centro, colores]) => (
            <div key={centro} className={`p-4 rounded-lg border-2 ${colores.bg} ${colores.border}`}>
              <div className="flex items-center mb-2">
                <span className="text-2xl mr-2">{colores.icon}</span>
                <div>
                  <div className={`font-semibold ${colores.text}`}>
                    {centro === 'DEFAULT' ? 'Regional' : centro}
                  </div>
                  <div className="text-xs text-gray-600">{colores.name}</div>
                </div>
              </div>
              <div className={`w-full h-2 rounded ${colores.accent}`}></div>
            </div>
          ))}
        </div>
      </div>

      <div>
        <h3 className="text-lg font-semibold text-gray-800 mb-4">
          Establecimientos Agrupados por Centro de Acopio
        </h3>
        <div className="space-y-6">
          {Object.entries(establecimientosPorCentro).map(([centro, establecimientos]) => {
            const colores = COLORES_CENTROS_ACOPIO[centro as keyof typeof COLORES_CENTROS_ACOPIO];
            
            return (
              <div key={centro} className={`p-4 rounded-lg border-2 ${colores.bg} ${colores.border}`}>
                <div className="flex items-center mb-3">
                  <span className="text-xl mr-2">{colores.icon}</span>
                  <h4 className={`font-bold text-lg ${colores.text}`}>
                    {centro === 'DEFAULT' ? 'Establecimientos Regionales' : `Centro de Acopio: ${centro}`}
                  </h4>
                  <span className={`ml-2 px-2 py-1 rounded-full text-xs font-medium ${colores.accent} text-white`}>
                    {establecimientos.length} establecimientos
                  </span>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                  {establecimientos.map((establecimiento) => {
                    const icono = establecimiento.includes('HOSPITAL') || establecimiento.includes('ESSALUD') 
                      ? '🏥' 
                      : establecimiento.includes('C.S.') 
                        ? '🏥' 
                        : '🏪';
                    
                    return (
                      <div key={establecimiento} className={`p-2 rounded border ${colores.text} bg-white bg-opacity-50`}>
                        <div className="flex items-center">
                          <span className="mr-2">{icono}</span>
                          <span className="text-sm font-medium">{establecimiento}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="mt-8 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <h4 className="font-semibold text-blue-800 mb-2">
          ℹ️ Información del Sistema
        </h4>
        <ul className="text-sm text-blue-700 space-y-1">
          <li>• <strong>Total de establecimientos:</strong> {ORDEN_ESTABLECIMIENTOS.length}</li>
          <li>• <strong>Centros de acopio:</strong> {Object.keys(establecimientosPorCentro).length - 1} (+ Regional)</li>
          <li>• <strong>Colores únicos:</strong> {Object.keys(COLORES_CENTROS_ACOPIO).length}</li>
          <li>• <strong>Ordenamiento:</strong> Hospital → Centro de Salud → Puesto de Salud (por centro)</li>
        </ul>
      </div>
    </div>
  );
};

export default CentrosAcopioDemo;
