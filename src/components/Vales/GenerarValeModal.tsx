import React, { useState, useEffect } from 'react';
import {
  X,
  Plus,
  Eye,
  AlertTriangle,
  CheckCircle,
  Loader2,
  Building2,
  Building,
  Calendar,
  Package,
  FileText,
  Settings,
  Syringe
} from 'lucide-react';
import { useVales } from '../../hooks/useVales';
import { useMultiplicadores } from '../../hooks/useMultiplicadores';
import { useToastContext } from '../../contexts/ToastContext';
import { VistaPrevia } from '../../services/valesService';

interface GenerarValeModalProps {
  isOpen: boolean;
  onClose: () => void;
  centroAcopioId: string;
  centroAcopioNombre: string;
  mes: number;
  anio: number;
  onValeGenerado?: () => void;
}

const GenerarValeModal: React.FC<GenerarValeModalProps> = ({
  isOpen,
  onClose,
  centroAcopioId,
  centroAcopioNombre,
  mes,
  anio,
  onValeGenerado
}) => {
  const { toast } = useToastContext();
  const {
    isGenerating,
    isLoadingPreview,
    vistaPrevia,
    generarVale,
    getVistaPrevia,
    clearVistaPrevia
  } = useVales();

  const {
    loadJeringasDisponibles,
    jeringasDisponibles
  } = useMultiplicadores();

  const [showVistaPrevia, setShowVistaPrevia] = useState(false);
  const [showConfiguracionJeringas, setShowConfiguracionJeringas] = useState(false);
  const [observaciones, setObservaciones] = useState('');

  // Constantes
  const meses = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
  ];

  // Cargar datos iniciales y vista previa automática
  useEffect(() => {
    if (isOpen) {
      loadJeringasDisponibles();
      setObservaciones(`Vale generado para ${meses[mes - 1]} ${anio}`);

      // Cargar vista previa automáticamente
      handleObtenerVistaPreviaAutomatica();
    }
  }, [isOpen, mes, anio, loadJeringasDisponibles]);

  // Función para cargar vista previa automáticamente (sin mostrar errores molestos)
  const handleObtenerVistaPreviaAutomatica = async () => {
    try {
      const result = await getVistaPrevia(centroAcopioId, mes, anio);
      if (result) {
        // No activar showVistaPrevia automáticamente, solo cargar los datos
        // El usuario puede decidir si quiere ver la vista previa completa
        console.log('✅ Vista previa cargada automáticamente');
      }
    } catch (error: any) {
      // Log silencioso para debug, sin mostrar toast de error
      console.warn('⚠️ No se pudo cargar vista previa automática:', error.message);
    }
  };

  // Limpiar al cerrar
  useEffect(() => {
    if (!isOpen) {
      clearVistaPrevia();
      setShowVistaPrevia(false);
      setShowConfiguracionJeringas(false);
    }
  }, [isOpen, clearVistaPrevia]);



  const handleObtenerVistaPrevia = async () => {
    // Si ya tenemos datos de vista previa, solo mostrar la vista detallada
    if (vistaPrevia) {
      setShowVistaPrevia(true);
      return;
    }

    // Si no tenemos datos, obtenerlos
    try {
      const result = await getVistaPrevia(centroAcopioId, mes, anio);
      if (result) {
        setShowVistaPrevia(true);
      } else {
        toast.error('❌ No se pudo obtener la vista previa');
      }
    } catch (error: any) {
      console.error('❌ Error al obtener vista previa:', error);
      toast.error(`❌ Error al obtener vista previa: ${error.message}`);
    }
  };

  const handleGenerarVale = async () => {
    try {
      const result = await generarVale({
        centroAcopioId,
        mes,
        anio,
        usuarioId: 'temp-user-id', // TODO: Obtener del contexto de usuario
        observaciones: observaciones || undefined,
        afectarStock: true
      });

      if (result) {
        // Notificación principal de éxito
        toast.success(
          `🎉 Vale de Entrega Generado Exitosamente\n` +
          `📄 Número: ${result.vale.numero}\n` +
          `📊 Total: ${result.resumen.totalVacunas} vacunas para ${result.resumen.totalEstablecimientos} establecimientos`,
          {
            duration: 6000,
            style: {
              background: '#10B981',
              color: 'white',
              fontWeight: '500',
              fontSize: '14px',
              maxWidth: '400px',
              whiteSpace: 'pre-line'
            }
          }
        );

        // Mostrar resumen detallado de stocks afectados
        const totalLotesVacunas = result.stocksAfectadosVacunas?.length || 0;
        const totalLotesJeringas = result.stocksAfectadosJeringas?.length || 0;

        if (totalLotesVacunas > 0 || totalLotesJeringas > 0) {
          toast.info(
            `📦 Stocks Actualizados Correctamente\n` +
            `💉 Vacunas: ${totalLotesVacunas} lotes afectados\n` +
            `🩹 Jeringas: ${totalLotesJeringas} lotes afectados`,
            {
              duration: 5000,
              style: {
                background: '#3B82F6',
                color: 'white',
                fontSize: '13px',
                maxWidth: '350px',
                whiteSpace: 'pre-line'
              }
            }
          );
        }

        // Mostrar errores si los hay
        if (result.errores && result.errores.length > 0) {
          toast.warning(
            `⚠️ Vale generado con advertencias:\n` +
            result.errores.slice(0, 3).join('\n') +
            (result.errores.length > 3 ? `\n... y ${result.errores.length - 3} más` : ''),
            {
              duration: 8000,
              style: {
                background: '#F59E0B',
                color: 'white',
                fontSize: '13px',
                maxWidth: '400px',
                whiteSpace: 'pre-line'
              }
            }
          );
        }

        // Cerrar modal y actualizar lista
        onValeGenerado?.();
        onClose();
      }
    } catch (error: any) {
      console.error('❌ Error al generar vale:', error);

      // Mostrar mensaje de error específico del backend
      const errorMessage = error.message || 'Error desconocido al generar vale';

      // Personalizar mensajes para errores comunes
      if (errorMessage.includes('Ya existe un vale')) {
        toast.error(`❌ ${errorMessage}`);
      } else if (errorMessage.includes('No hay movimientos')) {
        toast.error('❌ No hay datos de planificación para generar el vale en este período');
      } else if (errorMessage.includes('No hay usuarios activos')) {
        toast.error('❌ Error de configuración: No hay usuarios activos en el sistema');
      } else {
        toast.error(`❌ Error al generar vale: ${errorMessage}`);
      }
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-2 sm:p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-[95vw] sm:max-w-4xl lg:max-w-5xl xl:max-w-6xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Generar Vale de Entrega</h3>
            <p className="text-sm text-gray-600 mt-1">
              {centroAcopioNombre} • {meses[mes - 1]} {anio}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="h-5 w-5 text-gray-500" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">


          {!showVistaPrevia ? (
            <div className="space-y-6">
              {/* Configuración Inicial */}
              {/* Información del Vale */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h4 className="font-medium text-blue-900 mb-3 flex items-center">
                  <FileText className="h-5 w-5 mr-2" />
                  Información del Vale
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-blue-800">
                  <div className="flex items-center">
                    <Building2 className="h-4 w-4 mr-2" />
                    <div>
                      <span className="font-medium">Centro de Acopio:</span>
                      <div>{centroAcopioNombre}</div>
                    </div>
                  </div>
                  <div className="flex items-center">
                    <Calendar className="h-4 w-4 mr-2" />
                    <div>
                      <span className="font-medium">Período:</span>
                      <div>{meses[mes - 1]} {anio}</div>
                    </div>
                  </div>
                  <div className="flex items-center">
                    <Package className="h-4 w-4 mr-2" />
                    <div>
                      <span className="font-medium">Estado:</span>
                      <div>Pendiente de generar</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Resumen de Vista Previa */}
              {vistaPrevia && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <h4 className="font-medium text-green-900 mb-3 flex items-center">
                    <CheckCircle className="h-5 w-5 mr-2" />
                    Resumen del Vale a Generar
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                    <div className="text-center p-3 bg-white rounded-lg border border-green-200">
                      <div className="text-2xl font-bold text-green-600">
                        {vistaPrevia.consolidado.totalVacunas.toLocaleString()}
                      </div>
                      <div className="text-green-800 font-medium">Total Vacunas</div>
                    </div>
                    <div className="text-center p-3 bg-white rounded-lg border border-green-200">
                      <div className="text-2xl font-bold text-green-600">
                        {vistaPrevia.consolidado.totalEstablecimientos}
                      </div>
                      <div className="text-green-800 font-medium">Establecimientos</div>
                    </div>
                    <div className="text-center p-3 bg-white rounded-lg border border-green-200">
                      <div className="text-2xl font-bold text-green-600">
                        {Object.keys(vistaPrevia.consolidado.vacunasPorEstablecimiento).reduce((total, estId) => {
                          return total + Object.keys(vistaPrevia.consolidado.vacunasPorEstablecimiento[estId].vacunas).length;
                        }, 0)}
                      </div>
                      <div className="text-green-800 font-medium">Tipos de Vacunas</div>
                    </div>
                  </div>

                  {/* Top 3 vacunas con más cantidad */}
                  <div className="mt-4">
                    <h5 className="text-sm font-medium text-green-900 mb-2">Principales vacunas a entregar:</h5>
                    <div className="space-y-1">
                      {Object.values(vistaPrevia.consolidado.vacunasPorEstablecimiento)
                        .flatMap(est => Object.values(est.vacunas))
                        .sort((a, b) => b.cantidadTotal - a.cantidadTotal)
                        .slice(0, 3)
                        .map((vacuna, index) => (
                          <div key={index} className="flex justify-between items-center text-sm">
                            <span className="text-green-800">{vacuna.vacuna.nombre}</span>
                            <span className="font-bold text-green-600">
                              {vacuna.cantidadTotal.toLocaleString()} unidades
                            </span>
                          </div>
                        ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Estado de carga de vista previa */}
              {isLoadingPreview && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-center justify-center">
                    <Loader2 className="h-5 w-5 animate-spin text-blue-600 mr-2" />
                    <span className="text-blue-800">Cargando información del vale...</span>
                  </div>
                </div>
              )}

              {/* Mensaje si no hay datos para el vale */}
              {!isLoadingPreview && !vistaPrevia && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <div className="flex items-start">
                    <AlertTriangle className="h-5 w-5 text-yellow-600 mr-2 mt-0.5" />
                    <div className="text-sm text-yellow-800">
                      <p className="font-medium mb-1">No hay datos para generar el vale</p>
                      <p>No se encontraron movimientos de vacunas programados para este centro de acopio en {meses[mes - 1]} {anio}.</p>
                      <p className="mt-2">Verifique que:</p>
                      <ul className="list-disc list-inside mt-1 space-y-1">
                        <li>Exista planificación anual para este período</li>
                        <li>Haya movimientos de vacunas registrados</li>
                        <li>El centro de acopio tenga establecimientos asignados</li>
                      </ul>
                    </div>
                  </div>
                </div>
              )}

              {/* Observaciones */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Observaciones
                </label>
                <textarea
                  value={observaciones}
                  onChange={(e) => setObservaciones(e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Observaciones adicionales para el vale..."
                />
              </div>

              {/* Configuración de Jeringas */}
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-medium text-yellow-900 flex items-center">
                    <Settings className="h-5 w-5 mr-2" />
                    Configuración de Jeringas
                  </h4>
                  <button
                    onClick={() => setShowConfiguracionJeringas(!showConfiguracionJeringas)}
                    className="text-yellow-700 hover:text-yellow-900 text-sm font-medium"
                  >
                    {showConfiguracionJeringas ? 'Ocultar' : 'Configurar'}
                  </button>
                </div>
                <p className="text-sm text-yellow-800 mb-3">
                  Se utilizará la configuración de multiplicadores por defecto. 
                  Las jeringas se calcularán automáticamente según las dosis por frasco de cada vacuna.
                </p>
                
                {showConfiguracionJeringas && (
                  <div className="bg-white rounded-lg p-4 border border-yellow-300">
                    <h5 className="font-medium text-gray-900 mb-3">Jeringas Disponibles</h5>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {jeringasDisponibles.slice(0, 6).map((jeringa) => (
                        <div key={jeringa.id} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                          <span className="text-sm text-gray-700">
                            {jeringa.tipo} {jeringa.capacidad} - {jeringa.color}
                          </span>
                          <span className="text-xs text-gray-500">
                            Stock: {jeringa.lotes?.reduce((total, lote) => total + lote.cantidadActual, 0) || 0}
                          </span>
                        </div>
                      ))}
                    </div>
                    <p className="text-xs text-gray-600 mt-2">
                      💡 La configuración avanzada de multiplicadores estará disponible próximamente
                    </p>
                  </div>
                )}
              </div>

              {/* Advertencias */}
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <div className="flex items-start">
                  <AlertTriangle className="h-5 w-5 text-red-600 mr-2 mt-0.5" />
                  <div className="text-sm text-red-800">
                    <p className="font-medium mb-2">Importante - Antes de generar el vale:</p>
                    <ul className="list-disc list-inside space-y-1">
                      <li>Se generará el vale con todas las entregas programadas y adicionales</li>
                      <li>Se afectarán automáticamente los stocks de lotes (FIFO - primero en vencer)</li>
                      <li>Se registrarán movimientos en el kardex de vacunas y jeringas</li>
                      <li>Esta acción solo se puede revertir eliminando el vale completo</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            /* Vista Previa */
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h4 className="text-lg font-semibold text-gray-900">Vista Previa del Vale</h4>
                <button
                  onClick={() => setShowVistaPrevia(false)}
                  className="text-gray-600 hover:text-gray-800 text-sm"
                >
                  ← Volver a configuración
                </button>
              </div>

              {isLoadingPreview ? (
                <div className="text-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin text-blue-600 mx-auto mb-4" />
                  <p className="text-gray-600">Cargando vista previa detallada...</p>
                </div>
              ) : vistaPrevia ? (
                <div className="bg-white border border-gray-200 rounded-lg p-6">
                  <div className="text-center mb-6">
                    <h5 className="text-lg font-bold text-gray-900">VALE DE ENTREGA DE VACUNAS Y JERINGAS</h5>
                    <p className="text-sm text-gray-600 mt-2">Vista previa - No afecta stocks</p>

                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6 p-4 bg-blue-50 rounded-lg">
                    <div>
                      <span className="text-sm font-medium text-blue-900">Centro de Acopio:</span>
                      <p className="font-bold text-blue-900">{vistaPrevia.centroAcopio.nombre}</p>
                    </div>
                    <div>
                      <span className="text-sm font-medium text-blue-900">Período:</span>
                      <p className="font-bold text-blue-900">{meses[vistaPrevia.mes - 1]} {vistaPrevia.anio}</p>
                    </div>
                    <div>
                      <span className="text-sm font-medium text-blue-900">Totales:</span>
                      <p className="font-bold text-blue-900">
                        {vistaPrevia.consolidado.totalVacunas} vacunas • {vistaPrevia.consolidado.totalEstablecimientos} establecimientos
                      </p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h6 className="font-semibold text-gray-900">Consolidado por Establecimiento:</h6>
                    {Object.entries(vistaPrevia.consolidado.vacunasPorEstablecimiento).map(([estId, estData]) => (
                      <div key={estId} className="border border-gray-200 rounded-lg p-4">
                        <h7 className="font-medium text-gray-900 mb-2">{estData.establecimiento.nombre}</h7>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {Object.entries(estData.vacunas).map(([vacId, vacData]) => (
                            <div key={vacId} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                              <span className="text-sm text-gray-700">{vacData.vacuna.nombre}</span>
                              <div className="text-right">
                                <span className="font-bold text-blue-600">{vacData.cantidadTotal}</span>
                                <div className="text-xs text-gray-500">
                                  {vacData.jeringasNecesarias} jeringas
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">No hay datos disponibles para mostrar</p>
                </div>
              )}
            </div>
          )}
        </div>


        {/* Footer */}
        <div className="flex justify-end space-x-3 p-6 border-t border-gray-200 bg-gray-50">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
          >
            Cancelar
          </button>

          {!showVistaPrevia ? (
            <div className="flex space-x-3">
              {/* Botón Vista Previa Detallada */}
              <button
                onClick={handleObtenerVistaPrevia}
                disabled={isLoadingPreview || !vistaPrevia}
                className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                title={!vistaPrevia ? "No hay datos para mostrar vista previa" : "Ver vista previa detallada"}
              >
                {isLoadingPreview ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Cargando...
                  </>
                ) : (
                  <>
                    <Eye className="h-4 w-4 mr-2" />
                    Ver Detalle Completo
                  </>
                )}
              </button>

              {/* Botón Generar Vale */}
              <button
                onClick={handleGenerarVale}
                disabled={isGenerating || !vistaPrevia}
                className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                title={!vistaPrevia ? "No hay datos para generar el vale" : "Generar vale y afectar stocks"}
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Generando...
                  </>
                ) : (
                  <>
                    <Plus className="h-4 w-4 mr-2" />
                    Generar Vale
                  </>
                )}
              </button>
            </div>
          ) : (
            <button
              onClick={handleGenerarVale}
              disabled={isGenerating || !vistaPrevia}
              className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Generando...
                </>
              ) : (
                <>
                  <Plus className="h-4 w-4 mr-2" />
                  Generar Vale
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default GenerarValeModal;
