import React, { useState, useRef } from 'react';
import { Vacuna } from '../../types';

interface ImportarModalProps {
  isOpen: boolean;
  onClose: () => void;
  vacunas: Vacuna[];
  onDescargarPlantillaVacuna: (vacunaId: string, anio: number) => Promise<boolean>;
  onDescargarPlantillaMasiva: (anio: number) => Promise<boolean>;
  onImportarVacuna: (vacunaId: string, anio: number, archivo: File) => Promise<{
    creadas: number;
    actualizadas: number;
    errores: string[];
  } | null>;
  onImportarMasivo: (anio: number, archivo: File) => Promise<{
    totalCreadas: number;
    totalActualizadas: number;
    erroresPorVacuna: { vacuna: string; errores: string[] }[];
    vacunasProcesadas: number;
  } | null>;
  onGenerarReporteErrores?: (erroresPorVacuna: any[]) => Promise<boolean>;
  isDownloadingTemplate: boolean;
  isImportingExcel: boolean;
}

type TipoImportacion = 'vacuna' | 'masivo';

const ImportarModal: React.FC<ImportarModalProps> = ({
  isOpen,
  onClose,
  vacunas,
  onDescargarPlantillaVacuna,
  onDescargarPlantillaMasiva,
  onImportarVacuna,
  onImportarMasivo,
  onGenerarReporteErrores,
  isDownloadingTemplate,
  isImportingExcel
}) => {
  const [tipoImportacion, setTipoImportacion] = useState<TipoImportacion>('vacuna');
  const [selectedVacuna, setSelectedVacuna] = useState<string>('');
  const [selectedAnio, setSelectedAnio] = useState<number>(2025);
  const [archivo, setArchivo] = useState<File | null>(null);
  const [resultadoImportacion, setResultadoImportacion] = useState<any>(null);
  const [mostrarResultado, setMostrarResultado] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setArchivo(file);
      setResultadoImportacion(null);
      setMostrarResultado(false);
    }
  };

  const handleDescargarPlantilla = async () => {
    try {
      let success = false;
      
      if (tipoImportacion === 'vacuna') {
        if (!selectedVacuna) {
          alert('Por favor seleccione una vacuna');
          return;
        }
        success = await onDescargarPlantillaVacuna(selectedVacuna, selectedAnio);
      } else {
        success = await onDescargarPlantillaMasiva(selectedAnio);
      }

      if (success) {
        alert('Plantilla descargada exitosamente');
      }
    } catch (error) {
      console.error('Error al descargar plantilla:', error);
      alert('Error al descargar plantilla');
    }
  };

  const handleImportar = async () => {
    if (!archivo) {
      alert('Por favor seleccione un archivo Excel');
      return;
    }

    try {
      let resultado = null;

      if (tipoImportacion === 'vacuna') {
        if (!selectedVacuna) {
          alert('Por favor seleccione una vacuna');
          return;
        }
        resultado = await onImportarVacuna(selectedVacuna, selectedAnio, archivo);
      } else {
        resultado = await onImportarMasivo(selectedAnio, archivo);
      }

      if (resultado) {
        setResultadoImportacion(resultado);
        setMostrarResultado(true);
      }
    } catch (error) {
      console.error('Error al importar:', error);
    }
  };

  const resetForm = () => {
    setArchivo(null);
    setResultadoImportacion(null);
    setMostrarResultado(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-semibold text-gray-900">
            Importar Movimientos desde Excel
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="p-6">
          {!mostrarResultado ? (
            <>
              {/* Tipo de importación */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Tipo de Importación
                </label>
                <div className="grid grid-cols-2 gap-4">
                  <button
                    type="button"
                    onClick={() => {
                      setTipoImportacion('vacuna');
                      resetForm();
                    }}
                    className={`p-4 border-2 rounded-lg text-center transition-colors ${
                      tipoImportacion === 'vacuna'
                        ? 'border-blue-500 bg-blue-50 text-blue-700'
                        : 'border-gray-300 hover:border-gray-400'
                    }`}
                  >
                    <div className="font-medium">Por Vacuna</div>
                    <div className="text-sm text-gray-500 mt-1">
                      Importar movimientos de una vacuna específica
                    </div>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setTipoImportacion('masivo');
                      resetForm();
                    }}
                    className={`p-4 border-2 rounded-lg text-center transition-colors ${
                      tipoImportacion === 'masivo'
                        ? 'border-blue-500 bg-blue-50 text-blue-700'
                        : 'border-gray-300 hover:border-gray-400'
                    }`}
                  >
                    <div className="font-medium">Masivo</div>
                    <div className="text-sm text-gray-500 mt-1">
                      Importar movimientos de todas las vacunas
                    </div>
                  </button>
                </div>
              </div>

              {/* Selección de vacuna (solo para tipo 'vacuna') */}
              {tipoImportacion === 'vacuna' && (
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Vacuna
                  </label>
                  <select
                    value={selectedVacuna}
                    onChange={(e) => setSelectedVacuna(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Seleccione una vacuna</option>
                    {vacunas.map((vacuna) => (
                      <option key={vacuna.id} value={vacuna.id}>
                        {vacuna.nombre}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Año */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Año
                </label>
                <input
                  type="number"
                  min="2020"
                  max="2050"
                  value={selectedAnio}
                  onChange={(e) => setSelectedAnio(parseInt(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Paso 1: Descargar plantilla */}
              <div className="mb-6 p-4 bg-blue-50 rounded-lg">
                <h3 className="font-medium text-blue-900 mb-2">
                  Paso 1: Descargar Plantilla Excel
                </h3>
                <p className="text-sm text-blue-700 mb-3">
                  Descargue la plantilla Excel, complete los datos de movimientos (Trans. Ingreso, Salida, Trans. Salida) y guarde el archivo.
                  <br />
                  <strong>Nota:</strong> El saldo anterior se calcula automáticamente, no debe ser importado.
                </p>
                <button
                  onClick={handleDescargarPlantilla}
                  disabled={isDownloadingTemplate || (tipoImportacion === 'vacuna' && !selectedVacuna)}
                  className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {isDownloadingTemplate ? 'Descargando...' : 'Descargar Plantilla'}
                </button>
              </div>

              {/* Paso 2: Subir archivo */}
              <div className="mb-6 p-4 bg-green-50 rounded-lg">
                <h3 className="font-medium text-green-900 mb-2">
                  Paso 2: Subir Archivo Excel Completado
                </h3>
                <p className="text-sm text-green-700 mb-3">
                  Seleccione el archivo Excel con los datos de movimientos completados (Trans. Ingreso, Salida, Trans. Salida).
                </p>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".xlsx,.xls"
                  onChange={handleFileChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                />
                {archivo && (
                  <p className="text-sm text-green-600 mt-2">
                    Archivo seleccionado: {archivo.name}
                  </p>
                )}
              </div>

              {/* Botones de acción */}
              <div className="flex justify-end space-x-3">
                <button
                  onClick={onClose}
                  className="px-4 py-2 text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleImportar}
                  disabled={!archivo || isImportingExcel || (tipoImportacion === 'vacuna' && !selectedVacuna)}
                  className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {isImportingExcel ? 'Importando...' : 'Importar Movimientos'}
                </button>
              </div>
            </>
          ) : (
            /* Resultado de importación */
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Resultado de la Importación
              </h3>
              
              {tipoImportacion === 'vacuna' ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-green-50 p-4 rounded-lg">
                      <div className="text-2xl font-bold text-green-600">
                        {resultadoImportacion.creadas}
                      </div>
                      <div className="text-sm text-green-700">Movimientos Creados</div>
                    </div>
                    <div className="bg-blue-50 p-4 rounded-lg">
                      <div className="text-2xl font-bold text-blue-600">
                        {resultadoImportacion.actualizadas}
                      </div>
                      <div className="text-sm text-blue-700">Movimientos Actualizados</div>
                    </div>
                  </div>
                  
                  {resultadoImportacion.errores && resultadoImportacion.errores.length > 0 && (
                    <div className="bg-red-50 p-4 rounded-lg">
                      <h4 className="font-medium text-red-900 mb-2">Errores encontrados:</h4>
                      <ul className="text-sm text-red-700 space-y-1">
                        {resultadoImportacion.errores.map((error: string, index: number) => (
                          <li key={index}>• {error}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="grid grid-cols-3 gap-4">
                    <div className="bg-green-50 p-4 rounded-lg">
                      <div className="text-2xl font-bold text-green-600">
                        {resultadoImportacion.totalCreadas}
                      </div>
                      <div className="text-sm text-green-700">Total Creados</div>
                    </div>
                    <div className="bg-blue-50 p-4 rounded-lg">
                      <div className="text-2xl font-bold text-blue-600">
                        {resultadoImportacion.totalActualizadas}
                      </div>
                      <div className="text-sm text-blue-700">Total Actualizados</div>
                    </div>
                    <div className="bg-purple-50 p-4 rounded-lg">
                      <div className="text-2xl font-bold text-purple-600">
                        {resultadoImportacion.vacunasProcesadas}
                      </div>
                      <div className="text-sm text-purple-700">Vacunas Procesadas</div>
                    </div>
                  </div>
                  
                  {resultadoImportacion.erroresPorVacuna && resultadoImportacion.erroresPorVacuna.length > 0 && (
                    <div className="bg-red-50 p-4 rounded-lg">
                      <div className="flex justify-between items-center mb-2">
                        <h4 className="font-medium text-red-900">Errores por vacuna:</h4>
                        {onGenerarReporteErrores && (
                          <button
                            onClick={async () => {
                              try {
                                await onGenerarReporteErrores(resultadoImportacion.erroresPorVacuna);
                                alert('Reporte de errores descargado exitosamente');
                              } catch (error) {
                                console.error('Error al generar reporte:', error);
                                alert('Error al generar reporte de errores');
                              }
                            }}
                            className="bg-red-600 text-white px-3 py-1 rounded text-sm hover:bg-red-700 transition-colors"
                            title="Descargar reporte detallado de errores en Excel"
                          >
                            📊 Descargar Reporte Detallado
                          </button>
                        )}
                      </div>
                      <div className="space-y-2">
                        {resultadoImportacion.erroresPorVacuna.slice(0, 5).map((item: any, index: number) => (
                          <div key={index} className="text-sm">
                            <div className="font-medium text-red-800">{item.vacuna} ({item.errores?.length || 0} errores):</div>
                            <ul className="text-red-700 ml-4">
                              {(item.errores || []).slice(0, 3).map((error: string, errorIndex: number) => (
                                <li key={errorIndex}>• {error}</li>
                              ))}
                              {(item.errores || []).length > 3 && (
                                <li className="text-red-600 italic">... y {(item.errores || []).length - 3} errores más</li>
                              )}
                            </ul>
                          </div>
                        ))}
                        {resultadoImportacion.erroresPorVacuna.length > 5 && (
                          <div className="text-red-600 italic text-sm">
                            ... y {resultadoImportacion.erroresPorVacuna.length - 5} vacunas más con errores
                          </div>
                        )}
                        <div className="mt-3 p-2 bg-yellow-50 border border-yellow-200 rounded text-sm text-yellow-800">
                          💡 <strong>Tip:</strong> Descarga el reporte detallado para ver todos los errores con información específica de cada fila, establecimiento y tipo de error.
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}
              
              <div className="flex justify-end space-x-3 mt-6">
                <button
                  onClick={() => {
                    setMostrarResultado(false);
                    resetForm();
                  }}
                  className="px-4 py-2 text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
                >
                  Importar Otro Archivo
                </button>
                <button
                  onClick={onClose}
                  className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
                >
                  Cerrar
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ImportarModal;
