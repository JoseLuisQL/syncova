import React from 'react';
import { 
  AlertTriangle, 
  X, 
  ArrowRight, 
  Package, 
  Syringe, 
  FileText, 
  CheckCircle,
  AlertCircle,
  TrendingUp,
  TrendingDown,
  Loader2
} from 'lucide-react';
import { COMPONENT_STYLES, COLORS } from './constants';
import { ImpactoModificacion } from '../../services/valesService';

interface ConfirmacionModificacionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  onCancel: () => void;
  impacto: ImpactoModificacion | null;
  isLoading?: boolean;
  isProcessing?: boolean;
}

const ConfirmacionModificacionModal: React.FC<ConfirmacionModificacionModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  onCancel,
  impacto,
  isLoading = false,
  isProcessing = false
}) => {
  if (!isOpen) return null;

  const esRestauracion = impacto?.resumen?.diferencia ? impacto.resumen.diferencia < 0 : false;

  return (
    <div className={COMPONENT_STYLES.modal.overlay}>
      <div className="bg-white rounded-2xl max-w-2xl w-full shadow-2xl animate-in fade-in zoom-in duration-200 max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="px-6 py-5 border-b border-gray-100 bg-gradient-to-r from-amber-50 to-orange-50 flex-shrink-0">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className={`p-2.5 rounded-xl bg-amber-100 border border-amber-200`}>
                <AlertTriangle className="h-5 w-5 text-amber-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">
                  Confirmar modificación
                </h3>
                <p className="text-sm text-gray-600 mt-0.5">
                  Esta acción afectará stocks, kardex y vales generados
                </p>
              </div>
            </div>
            {!isProcessing && !isLoading && (
              <button
                onClick={onClose}
                className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-white/50 transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            )}
          </div>
        </div>

        {/* Content */}
        <div className="px-6 py-5 space-y-5 overflow-y-auto flex-1">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-12">
              <Loader2 className="h-8 w-8 text-teal-600 animate-spin mb-3" />
              <p className="text-sm text-gray-600">Calculando impacto de la modificación...</p>
            </div>
          ) : impacto ? (
            <>
              {/* Sección 1: Resumen del Cambio */}
              <div className="space-y-3">
                <h4 className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                  <FileText className="h-4 w-4 text-gray-500" />
                  Resumen del cambio
                </h4>
                <div className="bg-gray-50 rounded-xl p-4 space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-500">Establecimiento</span>
                    <span className="font-medium text-gray-900 text-right max-w-[280px] truncate">
                      {impacto.resumen.establecimientoNombre}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-500">Vacuna</span>
                    <span className="font-medium text-gray-900">{impacto.resumen.vacunaNombre}</span>
                  </div>
                  
                  {/* Cambio visual */}
                  <div className={`flex items-center justify-center gap-4 py-4 px-4 mt-3 rounded-xl border ${
                    esRestauracion 
                      ? 'bg-emerald-50 border-emerald-200' 
                      : 'bg-rose-50 border-rose-200'
                  }`}>
                    <div className="text-center">
                      <p className="text-xs text-gray-500 mb-1">Cantidad Actual</p>
                      <p className="text-2xl font-bold text-gray-700">
                        {impacto.resumen.cantidadActual.toLocaleString()}
                      </p>
                    </div>
                    <ArrowRight className="h-5 w-5 text-gray-400" />
                    <div className="text-center">
                      <p className="text-xs text-gray-500 mb-1">Nueva Cantidad</p>
                      <p className={`text-2xl font-bold ${esRestauracion ? 'text-emerald-600' : 'text-rose-600'}`}>
                        {impacto.resumen.cantidadNueva.toLocaleString()}
                      </p>
                    </div>
                    <div className={`ml-2 px-3 py-1.5 rounded-lg text-sm font-semibold flex items-center gap-1 ${
                      esRestauracion 
                        ? 'bg-emerald-100 text-emerald-700' 
                        : 'bg-rose-100 text-rose-700'
                    }`}>
                      {esRestauracion ? (
                        <TrendingDown className="h-4 w-4" />
                      ) : (
                        <TrendingUp className="h-4 w-4" />
                      )}
                      {impacto.resumen.diferencia > 0 ? '+' : ''}{impacto.resumen.diferencia.toLocaleString()}
                    </div>
                  </div>
                </div>
              </div>

              {/* Sección 2: Impacto en Stock de Vacunas */}
              {impacto.impactoVacunas.lotesAfectados.length > 0 && (
                <div className="space-y-3">
                  <h4 className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                    <Package className="h-4 w-4 text-teal-600" />
                    Impacto en Stock de Vacunas
                    <span className={`ml-auto px-2 py-0.5 text-xs rounded-full ${
                      esRestauracion 
                        ? 'bg-emerald-100 text-emerald-700' 
                        : 'bg-rose-100 text-rose-700'
                    }`}>
                      {esRestauracion ? '+' : '-'}{Math.abs(impacto.impactoVacunas.diferencia)} unidades
                    </span>
                  </h4>
                  <div className="bg-teal-50/50 rounded-xl border border-teal-100 overflow-hidden">
                    <div className="px-4 py-2 bg-teal-100/50 border-b border-teal-100">
                      <div className="grid grid-cols-4 text-xs font-medium text-teal-700">
                        <span>Lote</span>
                        <span className="text-center">Actual</span>
                        <span className="text-center">Después</span>
                        <span className="text-center">Diferencia</span>
                      </div>
                    </div>
                    <div className="divide-y divide-teal-100">
                      {impacto.impactoVacunas.lotesAfectados.slice(0, 3).map((lote) => {
                        const diff = lote.cantidadDespues - lote.cantidadActual;
                        return (
                          <div key={lote.id} className="px-4 py-2.5 grid grid-cols-4 text-sm">
                            <span className="font-medium text-gray-800">{lote.numero}</span>
                            <span className="text-center text-gray-600">{lote.cantidadActual.toLocaleString()}</span>
                            <span className="text-center text-gray-800 font-medium">{lote.cantidadDespues.toLocaleString()}</span>
                            <span className={`text-center font-medium ${diff > 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                              {diff > 0 ? '+' : ''}{diff.toLocaleString()}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                    {impacto.impactoVacunas.lotesAfectados.length > 3 && (
                      <div className="px-4 py-2 text-xs text-teal-600 bg-teal-50 border-t border-teal-100">
                        +{impacto.impactoVacunas.lotesAfectados.length - 3} lotes más
                      </div>
                    )}
                    <div className="px-4 py-2 bg-teal-100/30 border-t border-teal-100">
                      <div className="flex justify-between text-sm">
                        <span className="text-teal-700 font-medium">Stock Total</span>
                        <span className="text-teal-800 font-semibold">
                          {impacto.impactoVacunas.stockTotalActual.toLocaleString()} → {impacto.impactoVacunas.stockTotalDespues.toLocaleString()}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Sección 3: Impacto en Stock de Jeringas */}
              {impacto.impactoJeringas.lotesAfectados.length > 0 && (
                <div className="space-y-3">
                  <h4 className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                    <Syringe className="h-4 w-4 text-cyan-600" />
                    Impacto en Stock de Jeringas
                    <span className={`ml-auto px-2 py-0.5 text-xs rounded-full ${
                      esRestauracion 
                        ? 'bg-emerald-100 text-emerald-700' 
                        : 'bg-rose-100 text-rose-700'
                    }`}>
                      {esRestauracion ? '+' : '-'}{Math.abs(impacto.impactoJeringas.diferencia)} unidades
                    </span>
                  </h4>
                  <div className="bg-cyan-50/50 rounded-xl border border-cyan-100 overflow-hidden">
                    <div className="px-4 py-2 bg-cyan-100/50 border-b border-cyan-100">
                      <div className="grid grid-cols-5 text-xs font-medium text-cyan-700">
                        <span>Tipo</span>
                        <span>Lote</span>
                        <span className="text-center">Actual</span>
                        <span className="text-center">Después</span>
                        <span className="text-center">Dif.</span>
                      </div>
                    </div>
                    <div className="divide-y divide-cyan-100">
                      {impacto.impactoJeringas.lotesAfectados.slice(0, 3).map((lote) => {
                        const diff = lote.cantidadDespues - lote.cantidadActual;
                        return (
                          <div key={lote.id} className="px-4 py-2.5 grid grid-cols-5 text-sm">
                            <span className="font-medium text-gray-800 text-xs">{lote.tipo} {lote.capacidad}</span>
                            <span className="text-gray-600 text-xs">{lote.numero}</span>
                            <span className="text-center text-gray-600">{lote.cantidadActual.toLocaleString()}</span>
                            <span className="text-center text-gray-800 font-medium">{lote.cantidadDespues.toLocaleString()}</span>
                            <span className={`text-center font-medium ${diff > 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                              {diff > 0 ? '+' : ''}{diff.toLocaleString()}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                    {impacto.impactoJeringas.lotesAfectados.length > 3 && (
                      <div className="px-4 py-2 text-xs text-cyan-600 bg-cyan-50 border-t border-cyan-100">
                        +{impacto.impactoJeringas.lotesAfectados.length - 3} lotes más
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Sección 4: Impacto en Kardex */}
              <div className="space-y-3">
                <h4 className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                  <FileText className="h-4 w-4 text-purple-600" />
                  Registro en Kardex
                </h4>
                <div className={`flex items-center gap-3 p-4 rounded-xl border ${
                  impacto.kardex.tipoMovimiento === 'ingreso'
                    ? 'bg-emerald-50 border-emerald-200'
                    : 'bg-amber-50 border-amber-200'
                }`}>
                  {impacto.kardex.tipoMovimiento === 'ingreso' ? (
                    <CheckCircle className="h-5 w-5 text-emerald-600" />
                  ) : (
                    <AlertCircle className="h-5 w-5 text-amber-600" />
                  )}
                  <div>
                    <p className="text-sm font-medium text-gray-800">
                      Se registrarán {impacto.kardex.registrosNuevos} movimiento(s) de {' '}
                      <span className={`font-semibold ${
                        impacto.kardex.tipoMovimiento === 'ingreso' ? 'text-emerald-700' : 'text-amber-700'
                      }`}>
                        {impacto.kardex.tipoMovimiento === 'ingreso' ? 'INGRESO' : 'SALIDA'}
                      </span>
                    </p>
                    <p className="text-xs text-gray-500 mt-0.5">
                      Documento: VALE_ENTREGA_AJUSTE
                    </p>
                  </div>
                </div>
              </div>

              {/* Sección 5: Vales Afectados */}
              {impacto.valesAfectados.length > 0 && (
                <div className="space-y-3">
                  <h4 className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                    <FileText className="h-4 w-4 text-indigo-600" />
                    Vales que serán sincronizados
                    <span className="ml-auto px-2 py-0.5 text-xs rounded-full bg-indigo-100 text-indigo-700">
                      {impacto.valesAfectados.length} vale(s)
                    </span>
                  </h4>
                  <div className="space-y-2">
                    {impacto.valesAfectados.map((vale) => (
                      <div key={vale.id} className="flex items-center justify-between p-3 bg-indigo-50/50 rounded-xl border border-indigo-100">
                        <div>
                          <p className="text-sm font-semibold text-indigo-800">{vale.numero}</p>
                          <p className="text-xs text-gray-500">
                            Generado: {new Date(vale.fechaGeneracion).toLocaleDateString('es-PE')}
                          </p>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          <span className="text-gray-500">{vale.cantidadAnterior}</span>
                          <ArrowRight className="h-4 w-4 text-gray-400" />
                          <span className={`font-semibold ${
                            vale.cantidadNueva < vale.cantidadAnterior ? 'text-rose-600' : 'text-emerald-600'
                          }`}>
                            {vale.cantidadNueva}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Advertencias */}
              {impacto.advertencias.length > 0 && (
                <div className="space-y-2">
                  {impacto.advertencias.map((advertencia, index) => (
                    <div key={index} className="flex gap-2 p-3 rounded-xl bg-amber-50 border border-amber-200">
                      <AlertTriangle className="h-4 w-4 text-amber-600 flex-shrink-0 mt-0.5" />
                      <p className="text-sm text-amber-800">{advertencia}</p>
                    </div>
                  ))}
                </div>
              )}
            </>
          ) : (
            <div className="flex flex-col items-center justify-center py-12">
              <AlertCircle className="h-8 w-8 text-gray-400 mb-3" />
              <p className="text-sm text-gray-600">No se pudo calcular el impacto de la modificación</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-100 flex gap-3 bg-gray-50/50 flex-shrink-0">
          <button
            onClick={onCancel}
            disabled={isProcessing || isLoading}
            className={`flex-1 ${COMPONENT_STYLES.button.secondary}`}
          >
            Cancelar
          </button>
          <button
            onClick={onConfirm}
            disabled={isProcessing || isLoading || !impacto}
            className={`flex-1 ${COMPONENT_STYLES.button.primary}`}
          >
            {isProcessing ? (
              <div className="flex items-center justify-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Procesando...</span>
              </div>
            ) : (
              <div className="flex items-center justify-center gap-2">
                <CheckCircle className="h-4 w-4" />
                <span>Confirmar modificación</span>
              </div>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmacionModificacionModal;
