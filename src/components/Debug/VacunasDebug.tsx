import React, { useState } from 'react';
import { useVacunas } from '../../hooks/useVacunas';
import NuevoIngreso from '../Inventario/NuevoIngreso';

const VacunasDebug: React.FC = () => {
  const [showModal, setShowModal] = useState(false);
  const { 
    vacunasActivas, 
    loadVacunasActivas, 
    isLoadingActivas, 
    errorActivas 
  } = useVacunas();

  const handleLoadVacunas = async () => {
    console.log('🔄 Cargando vacunas activas manualmente...');
    await loadVacunasActivas();
  };

  const handleSuccess = (tipo: 'vacuna' | 'jeringa', data: any) => {
    console.log('✅ Éxito:', tipo, data);
    alert(`Éxito: ${tipo} registrada correctamente`);
    setShowModal(false);
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Debug: Vacunas Activas</h1>
      
      <div className="bg-white rounded-lg border p-6 mb-6">
        <h2 className="text-lg font-semibold mb-4">Estado Actual</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium mb-2">Estado de Carga:</label>
            <div className={`px-3 py-2 rounded ${isLoadingActivas ? 'bg-yellow-100 text-yellow-800' : 'bg-green-100 text-green-800'}`}>
              {isLoadingActivas ? 'Cargando...' : 'Completado'}
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-2">Total Vacunas Activas:</label>
            <div className="px-3 py-2 bg-blue-100 text-blue-800 rounded">
              {vacunasActivas.length}
            </div>
          </div>
        </div>

        {errorActivas && (
          <div className="mb-4 p-3 bg-red-100 text-red-800 rounded">
            <strong>Error:</strong> {errorActivas}
          </div>
        )}

        <div className="flex gap-4 mb-4">
          <button
            onClick={handleLoadVacunas}
            disabled={isLoadingActivas}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-gray-400"
          >
            {isLoadingActivas ? 'Cargando...' : 'Recargar Vacunas'}
          </button>
          
          <button
            onClick={() => setShowModal(true)}
            className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
          >
            Abrir Modal
          </button>
        </div>

        <div className="border rounded p-4">
          <h3 className="font-medium mb-2">Vacunas Activas:</h3>
          {vacunasActivas.length === 0 ? (
            <p className="text-gray-500">No hay vacunas activas cargadas</p>
          ) : (
            <ul className="space-y-2">
              {vacunasActivas.map(vacuna => (
                <li key={vacuna.id} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                  <span>
                    <strong>{vacuna.nombre}</strong> - {vacuna.presentacion}
                  </span>
                  <span className={`px-2 py-1 rounded text-xs ${
                    vacuna.estado === 'activo' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                  }`}>
                    {vacuna.estado}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      <div className="bg-gray-50 rounded-lg p-6">
        <h2 className="text-lg font-semibold mb-4">Información de Debug</h2>
        <div className="space-y-2 text-sm font-mono">
          <p><strong>API URL:</strong> {import.meta.env.VITE_API_URL}</p>
          <p><strong>Endpoint:</strong> /vacunas/activas</p>
          <p><strong>Estado Loading:</strong> {isLoadingActivas ? 'true' : 'false'}</p>
          <p><strong>Error:</strong> {errorActivas || 'ninguno'}</p>
          <p><strong>Cantidad:</strong> {vacunasActivas.length}</p>
        </div>
      </div>

      {showModal && (
        <NuevoIngreso
          onClose={() => setShowModal(false)}
          onSuccess={handleSuccess}
          vacunas={vacunasActivas}
          jeringas={[]}
          tipoFijo="vacuna"
          isLoadingVacunas={isLoadingActivas}
          isLoadingJeringas={false}
        />
      )}
    </div>
  );
};

export default VacunasDebug;
