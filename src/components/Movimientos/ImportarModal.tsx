import React, { useState, useRef } from 'react';
import { X, Download, Upload, FileSpreadsheet, CheckCircle, AlertCircle, Syringe, Layers } from 'lucide-react';
import { Vacuna } from '../../types';
import { COMPONENT_STYLES, COLORS } from './constants';

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
  onGenerarReporteErrores?: (erroresPorVacuna: { vacuna: string; errores: string[] }[]) => Promise<boolean>;
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
  const [selectedAnio, setSelectedAnio] = useState<number>(new Date().getFullYear());
  const [archivo, setArchivo] = useState<File | null>(null);
  const [resultadoImportacion, setResultadoImportacion] = useState<{
    creadas?: number;
    actualizadas?: number;
    errores?: string[];
    totalCreadas?: number;
    totalActualizadas?: number;
    erroresPorVacuna?: { vacuna: string; errores: string[] }[];
    vacunasProcesadas?: number;
  } | null>(null);
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
    if (tipoImportacion === 'vacuna' && !selectedVacuna) return;
    
    const success = tipoImportacion === 'vacuna'
      ? await onDescargarPlantillaVacuna(selectedVacuna, selectedAnio)
      : await onDescargarPlantillaMasiva(selectedAnio);

    if (!success) {
      console.error('Error al descargar plantilla');
    }
  };

  const handleImportar = async () => {
    if (!archivo) return;
    if (tipoImportacion === 'vacuna' && !selectedVacuna) return;

    const resultado = tipoImportacion === 'vacuna'
      ? await onImportarVacuna(selectedVacuna, selectedAnio, archivo)
      : await onImportarMasivo(selectedAnio, archivo);

    if (resultado) {
      setResultadoImportacion(resultado);
      setMostrarResultado(true);
    }
  };

  const resetForm = () => {
    setArchivo(null);
    setResultadoImportacion(null);
    setMostrarResultado(false);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  if (!isOpen) return null;

  const canDownload = tipoImportacion === 'masivo' || selectedVacuna;
  const canImport = archivo && (tipoImportacion === 'masivo' || selectedVacuna);

  return (
    <div className={COMPONENT_STYLES.modal.overlay} onClick={handleClose}>
      <div 
        className="bg-white rounded-2xl max-w-lg w-full shadow-2xl animate-in fade-in zoom-in duration-200 max-h-[90vh] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-5 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-gray-100">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-gradient-to-br from-teal-600 to-cyan-600 p-2.5 rounded-xl shadow-lg">
                <FileSpreadsheet className="h-5 w-5 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900">Importar Movimientos</h3>
                <p className="text-sm text-gray-500">Desde archivo Excel</p>
              </div>
            </div>
            <button
              onClick={handleClose}
              className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-200 rounded-lg transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="px-6 py-5 overflow-y-auto max-h-[calc(90vh-140px)]">
          {!mostrarResultado ? (
            <div className="space-y-5">
              {/* Tipo de importación */}
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => { setTipoImportacion('vacuna'); resetForm(); }}
                  className={`p-4 rounded-xl border-2 text-left transition-all ${
                    tipoImportacion === 'vacuna'
                      ? `${COLORS.primary.border} ${COLORS.primary.bg} border-teal-500`
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <Syringe className={`h-4 w-4 ${tipoImportacion === 'vacuna' ? COLORS.primary.icon : 'text-gray-400'}`} />
                    <span className={`font-semibold text-sm ${tipoImportacion === 'vacuna' ? COLORS.primary.textDark : 'text-gray-700'}`}>
                      Por Vacuna
                    </span>
                  </div>
                  <p className="text-xs text-gray-500">Una vacuna específica</p>
                </button>

                <button
                  type="button"
                  onClick={() => { setTipoImportacion('masivo'); resetForm(); }}
                  className={`p-4 rounded-xl border-2 text-left transition-all ${
                    tipoImportacion === 'masivo'
                      ? `${COLORS.primary.border} ${COLORS.primary.bg} border-teal-500`
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <Layers className={`h-4 w-4 ${tipoImportacion === 'masivo' ? COLORS.primary.icon : 'text-gray-400'}`} />
                    <span className={`font-semibold text-sm ${tipoImportacion === 'masivo' ? COLORS.primary.textDark : 'text-gray-700'}`}>
                      Masivo
                    </span>
                  </div>
                  <p className="text-xs text-gray-500">Todas las vacunas</p>
                </button>
              </div>

              {/* Configuración */}
              <div className="grid grid-cols-2 gap-3">
                {tipoImportacion === 'vacuna' && (
                  <div className="col-span-2">
                    <label className="block text-xs font-medium text-gray-600 mb-1.5">Vacuna</label>
                    <select
                      value={selectedVacuna}
                      onChange={(e) => setSelectedVacuna(e.target.value)}
                      className={`w-full ${COMPONENT_STYLES.select.base} ${COMPONENT_STYLES.select.teal}`}
                    >
                      <option value="">Seleccione una vacuna</option>
                      {vacunas.map((vacuna) => (
                        <option key={vacuna.id} value={vacuna.id}>{vacuna.nombre}</option>
                      ))}
                    </select>
                  </div>
                )}
                <div className={tipoImportacion === 'masivo' ? 'col-span-2' : ''}>
                  <label className="block text-xs font-medium text-gray-600 mb-1.5">Año</label>
                  <select
                    value={selectedAnio}
                    onChange={(e) => setSelectedAnio(parseInt(e.target.value))}
                    className={`w-full ${COMPONENT_STYLES.select.base} ${COMPONENT_STYLES.select.teal}`}
                  >
                    {[2024, 2025, 2026].map((anio) => (
                      <option key={anio} value={anio}>{anio}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Paso 1: Plantilla */}
              <div className={`p-4 rounded-xl ${COLORS.primary.bg} border ${COLORS.primary.border}`}>
                <div className="flex items-center justify-between">
                  <div>
                    <p className={`text-sm font-medium ${COLORS.primary.textDark}`}>1. Descargar plantilla</p>
                    <p className="text-xs text-gray-500 mt-0.5">Complete Trans. Ingreso, Salida, Trans. Salida</p>
                  </div>
                  <button
                    onClick={handleDescargarPlantilla}
                    disabled={isDownloadingTemplate || !canDownload}
                    className={`${COMPONENT_STYLES.button.primary} px-3 py-2 text-xs`}
                  >
                    {isDownloadingTemplate ? (
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <>
                        <Download className="h-4 w-4" />
                        <span>Descargar</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Paso 2: Subir archivo */}
              <div className={`p-4 rounded-xl ${COLORS.success.bg} border ${COLORS.success.border}`}>
                <p className={`text-sm font-medium ${COLORS.success.textDark} mb-2`}>2. Subir archivo completado</p>
                <label className="flex items-center justify-center gap-2 p-3 border-2 border-dashed border-emerald-300 rounded-lg cursor-pointer hover:bg-emerald-100/50 transition-colors">
                  <Upload className="h-4 w-4 text-emerald-600" />
                  <span className="text-sm text-emerald-700">
                    {archivo ? archivo.name : 'Seleccionar archivo .xlsx'}
                  </span>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".xlsx,.xls"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                </label>
              </div>
            </div>
          ) : (
            /* Resultado */
            <div className="space-y-4">
              <div className="flex items-center gap-2 mb-2">
                <CheckCircle className="h-5 w-5 text-emerald-600" />
                <h4 className="font-semibold text-gray-900">Importación completada</h4>
              </div>

              {tipoImportacion === 'vacuna' ? (
                <div className="grid grid-cols-2 gap-3">
                  <div className={`p-4 rounded-xl ${COLORS.success.bg} border ${COLORS.success.border}`}>
                    <p className={`text-2xl font-bold ${COLORS.success.textDark}`}>{resultadoImportacion?.creadas || 0}</p>
                    <p className="text-xs text-emerald-600">Creados</p>
                  </div>
                  <div className={`p-4 rounded-xl ${COLORS.primary.bg} border ${COLORS.primary.border}`}>
                    <p className={`text-2xl font-bold ${COLORS.primary.textDark}`}>{resultadoImportacion?.actualizadas || 0}</p>
                    <p className="text-xs text-teal-600">Actualizados</p>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-3 gap-2">
                  <div className={`p-3 rounded-xl ${COLORS.success.bg} border ${COLORS.success.border} text-center`}>
                    <p className={`text-xl font-bold ${COLORS.success.textDark}`}>{resultadoImportacion?.totalCreadas || 0}</p>
                    <p className="text-xs text-emerald-600">Creados</p>
                  </div>
                  <div className={`p-3 rounded-xl ${COLORS.primary.bg} border ${COLORS.primary.border} text-center`}>
                    <p className={`text-xl font-bold ${COLORS.primary.textDark}`}>{resultadoImportacion?.totalActualizadas || 0}</p>
                    <p className="text-xs text-teal-600">Actualizados</p>
                  </div>
                  <div className={`p-3 rounded-xl ${COLORS.secondary.bg} border ${COLORS.secondary.border} text-center`}>
                    <p className={`text-xl font-bold ${COLORS.secondary.textDark}`}>{resultadoImportacion?.vacunasProcesadas || 0}</p>
                    <p className="text-xs text-cyan-600">Vacunas</p>
                  </div>
                </div>
              )}

              {/* Errores */}
              {((tipoImportacion === 'vacuna' && resultadoImportacion?.errores && resultadoImportacion.errores.length > 0) ||
                (tipoImportacion === 'masivo' && resultadoImportacion?.erroresPorVacuna && resultadoImportacion.erroresPorVacuna.length > 0)) && (
                <div className={`p-4 rounded-xl ${COLORS.danger.bg} border ${COLORS.danger.border}`}>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <AlertCircle className={`h-4 w-4 ${COLORS.danger.icon}`} />
                      <span className={`text-sm font-medium ${COLORS.danger.textDark}`}>
                        {tipoImportacion === 'vacuna' 
                          ? `${resultadoImportacion?.errores?.length || 0} errores`
                          : `${resultadoImportacion?.erroresPorVacuna?.length || 0} vacunas con errores`
                        }
                      </span>
                    </div>
                    {tipoImportacion === 'masivo' && onGenerarReporteErrores && resultadoImportacion?.erroresPorVacuna && (
                      <button
                        onClick={() => onGenerarReporteErrores(resultadoImportacion.erroresPorVacuna!)}
                        className={`${COMPONENT_STYLES.button.danger} px-2 py-1 text-xs`}
                      >
                        <Download className="h-3 w-3" />
                        <span>Reporte</span>
                      </button>
                    )}
                  </div>
                  <div className="max-h-24 overflow-y-auto text-xs text-rose-700 space-y-1">
                    {tipoImportacion === 'vacuna' 
                      ? resultadoImportacion?.errores?.slice(0, 5).map((error, i) => (
                          <p key={i}>• {error}</p>
                        ))
                      : resultadoImportacion?.erroresPorVacuna?.slice(0, 3).map((item, i) => (
                          <p key={i}>• {item.vacuna}: {item.errores.length} errores</p>
                        ))
                    }
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-100 bg-gray-50/50 flex gap-3">
          {!mostrarResultado ? (
            <>
              <button onClick={handleClose} className={`flex-1 ${COMPONENT_STYLES.button.secondary}`}>
                Cancelar
              </button>
              <button
                onClick={handleImportar}
                disabled={!canImport || isImportingExcel}
                className={`flex-1 ${COMPONENT_STYLES.button.success}`}
              >
                {isImportingExcel ? (
                  <div className="flex items-center justify-center gap-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Importando...</span>
                  </div>
                ) : (
                  <>
                    <Upload className="h-4 w-4" />
                    <span>Importar</span>
                  </>
                )}
              </button>
            </>
          ) : (
            <>
              <button
                onClick={() => { setMostrarResultado(false); resetForm(); }}
                className={`flex-1 ${COMPONENT_STYLES.button.secondary}`}
              >
                Importar otro
              </button>
              <button onClick={handleClose} className={`flex-1 ${COMPONENT_STYLES.button.primary}`}>
                Cerrar
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default ImportarModal;
