import React, { useState, useRef } from 'react';
import {
  X,
  Upload,
  Download,
  FileSpreadsheet,
  CheckCircle,
  AlertTriangle,
  Loader2,
  Package,
  Calendar,
  Users,
  Target
} from 'lucide-react';
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

  const handleClose = () => {
    setArchivo(null);
    setResultadoImportacion(null);
    setMostrarResultado(false);
    setSelectedVacuna('');
    onClose();
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
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
        // El archivo se descarga automáticamente
      }
    } catch (error) {
      console.error('Error al descargar plantilla:', error);
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
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-6 rounded-t-xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Upload className="h-8 w-8" />
              <div>
                <h2 className="text-2xl font-bold">Importar Programación de Vacunas</h2>
                <p className="text-blue-100 mt-1">
                  Importe programación desde archivos Excel de manera profesional
                </p>
              </div>
            </div>
            <button
              onClick={handleClose}
              className="text-white hover:text-gray-200 transition-colors"
            >
              <X className="h-6 w-6" />
            </button>
          </div>
        </div>

        <div className="p-6">
          {!mostrarResultado ? (
            <>
              {/* Tipo de Importación */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <Target className="h-5 w-5 mr-2 text-blue-600" />
                  Tipo de Importación
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div
                    className={`border-2 rounded-lg p-4 cursor-pointer transition-all ${
                      tipoImportacion === 'vacuna'
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                    onClick={() => {
                      setTipoImportacion('vacuna');
                      resetForm();
                    }}
                  >
                    <div className="flex items-center space-x-3">
                      <Package className="h-8 w-8 text-blue-600" />
                      <div>
                        <h4 className="font-semibold text-gray-900">Por Vacuna Específica</h4>
                        <p className="text-sm text-gray-600">
                          Importar programación para una vacuna en particular
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  <div
                    className={`border-2 rounded-lg p-4 cursor-pointer transition-all ${
                      tipoImportacion === 'masivo'
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                    onClick={() => {
                      setTipoImportacion('masivo');
                      resetForm();
                    }}
                  >
                    <div className="flex items-center space-x-3">
                      <Users className="h-8 w-8 text-green-600" />
                      <div>
                        <h4 className="font-semibold text-gray-900">Importación Masiva</h4>
                        <p className="text-sm text-gray-600">
                          Importar todas las vacunas desde un archivo con múltiples hojas
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Configuración */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <Calendar className="h-5 w-5 mr-2 text-blue-600" />
                  Configuración
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {tipoImportacion === 'vacuna' && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Vacuna
                      </label>
                      <select
                        value={selectedVacuna}
                        onChange={(e) => setSelectedVacuna(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="">Seleccione una vacuna</option>
                        {vacunas.map((vacuna) => (
                          <option key={vacuna.id} value={vacuna.id}>
                            💉 {vacuna.nombre}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Año
                    </label>
                    <select
                      value={selectedAnio}
                      onChange={(e) => setSelectedAnio(Number(e.target.value))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value={2025}>📅 2025</option>
                      <option value={2026}>📅 2026</option>
                      <option value={2024}>📅 2024</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Descargar Plantilla */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <Download className="h-5 w-5 mr-2 text-blue-600" />
                  Descargar Plantilla
                </h3>
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <p className="text-blue-800 mb-4">
                    {tipoImportacion === 'vacuna'
                      ? 'Descargue la plantilla Excel para la vacuna seleccionada y complete los datos de programación.'
                      : 'Descargue la plantilla Excel masiva que contiene hojas separadas para todas las vacunas activas.'
                    }
                  </p>
                  <button
                    onClick={handleDescargarPlantilla}
                    disabled={isDownloadingTemplate || (tipoImportacion === 'vacuna' && !selectedVacuna)}
                    className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-blue-400 disabled:cursor-not-allowed transition-colors"
                  >
                    {isDownloadingTemplate ? (
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                      <Download className="h-4 w-4 mr-2" />
                    )}
                    {isDownloadingTemplate ? 'Descargando...' : 'Descargar Plantilla Excel'}
                  </button>
                </div>
              </div>

              {/* Subir Archivo */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <FileSpreadsheet className="h-5 w-5 mr-2 text-blue-600" />
                  Subir Archivo Excel
                </h3>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-400 transition-colors">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".xlsx,.xls"
                    onChange={handleFileSelect}
                    className="hidden"
                  />
                  
                  {archivo ? (
                    <div className="flex items-center justify-center space-x-3">
                      <FileSpreadsheet className="h-8 w-8 text-green-600" />
                      <div>
                        <p className="font-medium text-gray-900">{archivo.name}</p>
                        <p className="text-sm text-gray-600">
                          {(archivo.size / 1024 / 1024).toFixed(2)} MB
                        </p>
                      </div>
                      <button
                        onClick={() => {
                          setArchivo(null);
                          if (fileInputRef.current) fileInputRef.current.value = '';
                        }}
                        className="text-red-600 hover:text-red-800"
                      >
                        <X className="h-5 w-5" />
                      </button>
                    </div>
                  ) : (
                    <div>
                      <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-600 mb-2">
                        Haga clic para seleccionar el archivo Excel con la programación
                      </p>
                      <button
                        onClick={() => fileInputRef.current?.click()}
                        className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                      >
                        Seleccionar Archivo
                      </button>
                      <p className="text-xs text-gray-500 mt-2">
                        Solo archivos .xlsx y .xls (máximo 10MB)
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Botones de Acción */}
              <div className="flex justify-end space-x-4">
                <button
                  onClick={handleClose}
                  className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleImportar}
                  disabled={
                    isImportingExcel || 
                    !archivo || 
                    (tipoImportacion === 'vacuna' && !selectedVacuna)
                  }
                  className="flex items-center px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-green-400 disabled:cursor-not-allowed transition-colors"
                >
                  {isImportingExcel ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <Upload className="h-4 w-4 mr-2" />
                  )}
                  {isImportingExcel ? 'Importando...' : 'Importar Programación'}
                </button>
              </div>
            </>
          ) : (
            /* Resultado de Importación */
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <CheckCircle className="h-5 w-5 mr-2 text-green-600" />
                Resultado de la Importación
              </h3>
              
              {tipoImportacion === 'vacuna' ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-green-600">
                          {resultadoImportacion.creadas}
                        </div>
                        <div className="text-sm text-green-800">Creadas</div>
                      </div>
                    </div>
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-blue-600">
                          {resultadoImportacion.actualizadas}
                        </div>
                        <div className="text-sm text-blue-800">Actualizadas</div>
                      </div>
                    </div>
                    <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-red-600">
                          {resultadoImportacion.errores?.length || 0}
                        </div>
                        <div className="text-sm text-red-800">Errores</div>
                      </div>
                    </div>
                  </div>

                  {resultadoImportacion.errores && resultadoImportacion.errores.length > 0 && (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                      <h4 className="font-medium text-red-800 mb-2 flex items-center">
                        <AlertTriangle className="h-4 w-4 mr-2" />
                        Errores encontrados:
                      </h4>
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
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-green-600">
                          {resultadoImportacion.totalCreadas}
                        </div>
                        <div className="text-sm text-green-800">Total Creadas</div>
                      </div>
                    </div>
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-blue-600">
                          {resultadoImportacion.totalActualizadas}
                        </div>
                        <div className="text-sm text-blue-800">Total Actualizadas</div>
                      </div>
                    </div>
                    <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-purple-600">
                          {resultadoImportacion.vacunasProcesadas}
                        </div>
                        <div className="text-sm text-purple-800">Vacunas Procesadas</div>
                      </div>
                    </div>
                    <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-red-600">
                          {resultadoImportacion.erroresPorVacuna?.length || 0}
                        </div>
                        <div className="text-sm text-red-800">Vacunas con Errores</div>
                      </div>
                    </div>
                  </div>

                  {resultadoImportacion.erroresPorVacuna && resultadoImportacion.erroresPorVacuna.length > 0 && (
                    <div className="space-y-3">
                      <h4 className="font-medium text-red-800 flex items-center">
                        <AlertTriangle className="h-4 w-4 mr-2" />
                        Errores por vacuna:
                      </h4>
                      {resultadoImportacion.erroresPorVacuna.map((vacunaError: any, index: number) => (
                        <div key={index} className="bg-red-50 border border-red-200 rounded-lg p-3">
                          <h5 className="font-medium text-red-800 mb-2">{vacunaError.vacuna}</h5>
                          <ul className="text-sm text-red-700 space-y-1">
                            {vacunaError.errores.map((error: string, errorIndex: number) => (
                              <li key={errorIndex}>• {error}</li>
                            ))}
                          </ul>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              <div className="flex justify-end space-x-4 mt-6">
                <button
                  onClick={() => setMostrarResultado(false)}
                  className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Importar Otro Archivo
                </button>
                <button
                  onClick={handleClose}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
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
