import React, { useState, useEffect } from 'react';
import {
  Plus, Eye, Warning, CheckCircle, SpinnerGap, Buildings,
  CalendarBlank, Package, FileText, Gear
} from '@phosphor-icons/react';
import { useVales } from '../../hooks/useVales';
import { useMultiplicadores } from '../../hooks/useMultiplicadores';
import { useToastContext } from '../../contexts/ToastContext';
import { useAuth } from '../../contexts/AuthContext';
import { Modal } from '../ui/ModalElements';

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
  const { user } = useAuth();
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

  // Limpiar al cerrar (ajuste durante el render, sin useEffect — evita el
  // flash de estado stale que marca react-doctor).
  const [lastOpen, setLastOpen] = useState(isOpen);
  if (isOpen !== lastOpen) {
    setLastOpen(isOpen);
    if (!isOpen) {
      clearVistaPrevia();
      setShowVistaPrevia(false);
      setShowConfiguracionJeringas(false);
    }
  }



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
        usuarioId: user?.id ?? '',
        observaciones: observaciones || undefined,
        afectarStock: true
      });

      if (result) {
        // Notificación principal de éxito
        toast.success(
          `🎉 Vale de Entrega Generado Exitosamente`,
          `📄 Número: ${result.vale.numero}\n📊 Total: ${result.resumen.totalVacunas} vacunas para ${result.resumen.totalEstablecimientos} establecimientos`
        );

        // Mostrar resumen detallado de stocks afectados
        const totalLotesVacunas = result.stocksAfectadosVacunas?.length || 0;
        const totalLotesJeringas = result.stocksAfectadosJeringas?.length || 0;

        if (totalLotesVacunas > 0 || totalLotesJeringas > 0) {
          toast.info(
            `📦 Stocks Actualizados Correctamente`,
            `💉 Vacunas: ${totalLotesVacunas} lotes afectados\n🩹 Jeringas: ${totalLotesJeringas} lotes afectados`
          );
        }

        // Mostrar errores si los hay
        if (result.errores && result.errores.length > 0) {
          toast.warning(
            `⚠️ Vale generado con advertencias`,
            result.errores.slice(0, 3).join('\n') +
            (result.errores.length > 3 ? `\n... y ${result.errores.length - 3} más` : '')
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

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Generar Vale de Entrega"
      subtitle={`${centroAcopioNombre} • ${meses[mes - 1]} ${anio}`}
      icon={FileText}
      size="xl"
      footer={
        <div className="flex w-full items-center justify-between">
          <button type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-zinc-700 bg-white border border-zinc-300 rounded-lg hover:bg-zinc-50 transition-colors"
          >
            Cancelar
          </button>

          {!showVistaPrevia ? (
            <div className="flex gap-2">
              <button type="button"
                onClick={handleObtenerVistaPrevia}
                disabled={isLoadingPreview || !vistaPrevia}
                className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-blue-700 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100 transition-colors disabled:opacity-50"
                title={!vistaPrevia ? "No hay datos para mostrar vista previa" : "Ver vista previa detallada"}
              >
                {isLoadingPreview ? (
                  <SpinnerGap weight="bold" className="h-4 w-4 animate-spin" />
                ) : (
                  <Eye weight="bold" className="h-4 w-4" />
                )}
                Ver Detalle Completo
              </button>

              <button type="button"
                onClick={handleGenerarVale}
                disabled={isGenerating || !vistaPrevia}
                className="flex items-center gap-2 px-5 py-2 text-sm font-medium text-white bg-teal-600 border border-teal-600 rounded-lg hover:bg-teal-700 transition-colors shadow-sm disabled:opacity-50"
                title={!vistaPrevia ? "No hay datos para generar el vale" : "Generar vale y afectar stocks"}
              >
                {isGenerating ? (
                  <SpinnerGap weight="bold" className="h-4 w-4 animate-spin" />
                ) : (
                  <Plus weight="bold" className="h-4 w-4" />
                )}
                Generar Vale
              </button>
            </div>
          ) : (
            <button type="button"
              onClick={handleGenerarVale}
              disabled={isGenerating || !vistaPrevia}
              className="flex items-center gap-2 px-5 py-2 text-sm font-medium text-white bg-teal-600 border border-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors shadow-sm disabled:opacity-50"
            >
              {isGenerating ? (
                <SpinnerGap weight="bold" className="h-4 w-4 animate-spin" />
              ) : (
                <Plus weight="bold" className="h-4 w-4" />
              )}
              Generar Vale
            </button>
          )}
        </div>
      }
    >
      <div className="space-y-6">
        {!showVistaPrevia ? (
          <div className="space-y-6">
            {/* Información del Vale */}
            <div className="bg-zinc-50 border border-zinc-200 rounded-xl p-4">
              <h4 className="font-semibold text-zinc-900 mb-4 flex items-center gap-2">
                <FileText className="h-5 w-5 text-zinc-500" />
                Resumen Inicial
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-white rounded-lg border border-zinc-200 shadow-sm">
                    <Buildings className="h-4 w-4 text-zinc-600" />
                  </div>
                  <div>
                    <span className="block text-xs font-medium text-zinc-500">Centro de Acopio</span>
                    <span className="font-medium text-zinc-900">{centroAcopioNombre}</span>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-white rounded-lg border border-zinc-200 shadow-sm">
                    <CalendarBlank className="h-4 w-4 text-zinc-600" />
                  </div>
                  <div>
                    <span className="block text-xs font-medium text-zinc-500">Período</span>
                    <span className="font-medium text-zinc-900">{meses[mes - 1]} {anio}</span>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-white rounded-lg border border-zinc-200 shadow-sm">
                    <Package className="h-4 w-4 text-zinc-600" />
                  </div>
                  <div>
                    <span className="block text-xs font-medium text-zinc-500">Estado</span>
                    <span className="font-medium text-zinc-900">Pendiente de generar</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Resumen de Vista Previa */}
            {vistaPrevia && (
              <div className="bg-teal-50 border border-teal-200 rounded-xl p-5">
                <h4 className="font-semibold text-teal-900 mb-4 flex items-center gap-2">
                  <CheckCircle className="h-5 w-5" />
                  Impacto del Vale
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm mb-5">
                  <div className="text-center p-3 bg-white rounded-xl border border-teal-200 shadow-sm">
                    <div className="text-2xl font-bold text-teal-700">
                      {vistaPrevia.consolidado.totalVacunas.toLocaleString()}
                    </div>
                    <div className="text-teal-800 font-medium text-xs uppercase tracking-wide mt-1">Total Biológicos</div>
                  </div>
                  <div className="text-center p-3 bg-white rounded-xl border border-teal-200 shadow-sm">
                    <div className="text-2xl font-bold text-teal-700">
                      {vistaPrevia.consolidado.totalEstablecimientos}
                    </div>
                    <div className="text-teal-800 font-medium text-xs uppercase tracking-wide mt-1">Establecimientos</div>
                  </div>
                  <div className="text-center p-3 bg-white rounded-xl border border-teal-200 shadow-sm">
                    <div className="text-2xl font-bold text-teal-700">
                      {Object.keys(vistaPrevia.consolidado.vacunasPorEstablecimiento).reduce((total, estId) => {
                        return total + Object.keys(vistaPrevia.consolidado.vacunasPorEstablecimiento[estId].vacunas).length;
                      }, 0)}
                    </div>
                    <div className="text-teal-800 font-medium text-xs uppercase tracking-wide mt-1">Tipos de Vacunas</div>
                  </div>
                </div>

                {/* Top 3 vacunas con más cantidad */}
                <div>
                  <h5 className="text-xs font-bold uppercase tracking-wider text-teal-800 mb-2">Principales entregas:</h5>
                  <div className="space-y-2">
                    {Object.values(vistaPrevia.consolidado.vacunasPorEstablecimiento)
                      .flatMap(est => Object.values(est.vacunas))
                      .sort((a, b) => b.cantidadTotal - a.cantidadTotal)
                      .slice(0, 3)
                      .map((vacuna, index) => (
                        <div key={index} className="flex justify-between items-center bg-white/60 p-2 rounded-lg text-sm">
                          <span className="text-teal-900 font-medium">{vacuna.vacuna.nombre}</span>
                          <span className="font-bold text-teal-700 bg-white px-2 py-0.5 rounded-md border border-teal-100 shadow-sm">
                            {vacuna.cantidadTotal.toLocaleString()} unds
                          </span>
                        </div>
                      ))}
                  </div>
                </div>
              </div>
            )}

            {/* Estado de carga de vista previa */}
            {isLoadingPreview && (
              <div className="bg-zinc-50 border border-zinc-200 rounded-xl p-8 flex flex-col items-center justify-center text-zinc-500">
                <SpinnerGap weight="bold" className="h-8 w-8 animate-spin mb-3 text-zinc-400" />
                <span>Analizando consolidado...</span>
              </div>
            )}

            {/* Mensaje si no hay datos para el vale */}
            {!isLoadingPreview && !vistaPrevia && (
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-5">
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-amber-100 rounded-lg text-amber-600">
                    <Warning weight="duotone" className="h-5 w-5" />
                  </div>
                  <div className="text-sm text-amber-800">
                    <p className="font-semibold text-amber-900 mb-1">Sin datos para procesar</p>
                    <p className="mb-3">No se detectaron movimientos programados para este centro en {meses[mes - 1]} {anio}.</p>
                    <ul className="list-disc list-inside space-y-1 text-amber-700/80">
                      <li>Revise la planificación anual del mes indicado</li>
                      <li>Asegúrese de que existan ingresos de vacunas</li>
                      <li>El centro de acopio debe tener establecimientos asociados</li>
                    </ul>
                  </div>
                </div>
              </div>
            )}

            {/* Observaciones */}
            <div>
              <label className="block text-sm font-semibold text-zinc-700 mb-2">
                Observaciones del Vale
              </label>
              <textarea
                value={observaciones}
                onChange={(e) => setObservaciones(e.target.value)}
                rows={3}
                className="w-full px-4 py-3 bg-white border border-zinc-300 rounded-xl focus:ring-2 focus:ring-teal-600 focus:border-transparent text-sm transition-all"
                placeholder="Ej. Entrega extraordinaria por campaña de vacunación..."
              />
            </div>

            {/* Configuración de Jeringas */}
            <div className="bg-zinc-50 border border-zinc-200 rounded-xl p-5">
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-semibold text-zinc-900 flex items-center gap-2">
                  <Gear className="h-5 w-5 text-zinc-500" />
                  Asignación de Jeringas
                </h4>
                <button type="button"
                  onClick={() => setShowConfiguracionJeringas(!showConfiguracionJeringas)}
                  className="px-3 py-1.5 bg-white border border-zinc-200 shadow-sm rounded-lg text-zinc-700 hover:text-zinc-900 hover:bg-zinc-50 text-xs font-semibold transition-colors"
                >
                  {showConfiguracionJeringas ? 'Ocultar' : 'Ver Configuración'}
                </button>
              </div>
              <p className="text-sm text-zinc-600 mb-4">
                El sistema aplicará los multiplicadores establecidos por minsa.
              </p>
              
              {showConfiguracionJeringas && (
                <div className="bg-white rounded-xl p-4 border border-zinc-200 shadow-sm">
                  <h5 className="font-semibold text-xs uppercase tracking-wider text-zinc-500 mb-3">Inventario Disponible</h5>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {jeringasDisponibles.slice(0, 6).map((jeringa) => (
                      <div key={jeringa.id} className="flex items-center justify-between p-3 bg-zinc-50 border border-zinc-100 rounded-lg">
                        <span className="text-sm font-medium text-zinc-800">
                          {jeringa.tipo} {jeringa.capacidad} - {jeringa.color}
                        </span>
                        <span className="text-xs font-bold text-zinc-500 bg-white border border-zinc-200 px-2 py-1 rounded-md">
                          Stock: {jeringa.lotes?.reduce((total: number, lote: any) => total + lote.cantidadActual, 0) || 0}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Advertencias */}
            <div className="bg-rose-50 border border-rose-200 rounded-xl p-5">
              <div className="flex items-start gap-3">
                <div className="p-2 bg-rose-100 rounded-lg text-rose-600">
                  <Warning weight="duotone" className="h-5 w-5" />
                </div>
                <div className="text-sm text-rose-800">
                  <p className="font-semibold text-rose-900 mb-2">Acción Crítica</p>
                  <ul className="list-disc list-inside space-y-1.5 text-rose-700/90">
                    <li>Generará el documento oficial de entrega.</li>
                    <li>Descontará automáticamente (FIFO) del stock actual de biológicos y jeringas.</li>
                    <li>Alterará el balance del Kardex.</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        ) : (
          /* Vista Previa */
          <div className="space-y-6">
            <div className="flex items-center justify-between bg-zinc-50 p-4 border border-zinc-200 rounded-xl">
              <h4 className="text-sm font-semibold text-zinc-900 flex items-center gap-2">
                <Eye className="h-5 w-5 text-zinc-500" />
                Desglose del Documento
              </h4>
              <button type="button"
                onClick={() => setShowVistaPrevia(false)}
                className="text-zinc-600 font-medium hover:text-zinc-900 text-sm flex items-center gap-1 bg-white border border-zinc-200 shadow-sm px-3 py-1.5 rounded-lg transition-colors"
              >
                ← Volver a ajustes
              </button>
            </div>

            {isLoadingPreview ? (
              <div className="flex flex-col items-center justify-center p-12 text-zinc-500">
                <SpinnerGap weight="bold" className="h-8 w-8 animate-spin mb-4 text-zinc-400" />
                <p>Procesando estructura del vale...</p>
              </div>
            ) : vistaPrevia ? (
              <div className="bg-white border border-zinc-200 shadow-sm rounded-xl p-6">
                <div className="text-center mb-8 pb-6 border-b border-zinc-100">
                  <h5 className="text-lg font-black tracking-tight text-zinc-900">VALE DE ENTREGA (VISTA PREVIA)</h5>
                  <p className="text-sm font-medium text-amber-600 mt-1 bg-amber-50 inline-block px-3 py-1 rounded-full border border-amber-200">
                    Borrador - Sin impacto en almacén
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                  <div>
                    <span className="block text-xs font-bold uppercase tracking-wider text-zinc-500 mb-1">Origen</span>
                    <p className="font-medium text-zinc-900">{vistaPrevia.centroAcopio.nombre}</p>
                  </div>
                  <div>
                    <span className="block text-xs font-bold uppercase tracking-wider text-zinc-500 mb-1">Mes Programado</span>
                    <p className="font-medium text-zinc-900">{meses[vistaPrevia.mes - 1]} {vistaPrevia.anio}</p>
                  </div>
                  <div>
                    <span className="block text-xs font-bold uppercase tracking-wider text-zinc-500 mb-1">Total General</span>
                    <p className="font-medium text-zinc-900">
                      {vistaPrevia.consolidado.totalVacunas.toLocaleString()} doc.
                    </p>
                  </div>
                </div>

                <div className="space-y-5">
                  <h6 className="font-semibold text-zinc-900 flex items-center gap-2 mb-4">
                    <Buildings className="h-4 w-4 text-zinc-500" />
                    Distribución por Establecimiento
                  </h6>
                  {Object.entries(vistaPrevia.consolidado.vacunasPorEstablecimiento).map(([estId, estData]) => (
                    <div key={estId} className="border border-zinc-200 rounded-xl overflow-hidden shadow-sm">
                      <div className="bg-zinc-50 px-4 py-3 border-b border-zinc-200">
                        <h6 className="font-bold text-zinc-800 text-sm">{estData.establecimiento.nombre}</h6>
                      </div>
                      <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-4 bg-white">
                        {Object.entries(estData.vacunas).map(([vacId, vacData]) => (
                          <div key={vacId} className="flex justify-between items-center p-3 bg-zinc-50 rounded-lg border border-zinc-100">
                            <span className="text-sm font-medium text-zinc-700">{vacData.vacuna.nombre}</span>
                            <div className="text-right flex flex-col items-end">
                              <span className="font-bold text-zinc-900">{vacData.cantidadTotal.toLocaleString()}</span>
                              <span className="text-xs font-medium text-zinc-500 mt-0.5">
                                {vacData.jeringasNecesarias.toLocaleString()} jeringas estim.
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center p-12 bg-zinc-50 border border-zinc-200 rounded-xl text-zinc-500">
                <Package className="h-12 w-12 text-zinc-300 mb-4" />
                <p>No se encontró información de consolidado.</p>
              </div>
            )}
          </div>
        )}
      </div>
    </Modal>
  );
};

export default GenerarValeModal;
