import React, { useState, useEffect, useMemo } from 'react';
import {
  X,
  AlertTriangle,
  CheckCircle2,
  Loader2,
  Package,
  Truck,
  TrendingDown,
  Building2,
  Lock,
  Sparkles,
  ArrowRight,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { MESES } from '../constants';
import { COLORES_CENTROS_ACOPIO } from '../../../utils/centroAcopioUtils';
import { useToastContext } from '../../../contexts/ToastContext';
import { useAuth } from '../../../contexts/AuthContext';
import {
  AjusteEntregasService,
  DatosAjusteEntregas,
  OpcionAjuste,
  AjusteIndividual,
} from '../../../services/ajusteEntregasService';

interface AjusteDeficitModalProps {
  isOpen: boolean;
  onClose: () => void;
  vacunaId: string;
  vacunaNombre: string;
  mes: number;
  anio: number;
  deficit: number;
  onAjusteCompletado: () => void;
}

export const AjusteDeficitModal: React.FC<AjusteDeficitModalProps> = ({
  isOpen,
  onClose,
  vacunaId,
  vacunaNombre,
  mes,
  anio,
  deficit,
  onAjusteCompletado,
}) => {
  const { toast } = useToastContext();
  const { user } = useAuth();

  const [isLoading, setIsLoading] = useState(true);
  const [isCalculating, setIsCalculating] = useState(false);
  const [isExecuting, setIsExecuting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [datos, setDatos] = useState<DatosAjusteEntregas | null>(null);
  const [opciones, setOpciones] = useState<OpcionAjuste[]>([]);
  const [opcionSeleccionada, setOpcionSeleccionada] = useState<string | null>(null);
  const [centrosExpandidos, setCentrosExpandidos] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (isOpen && vacunaId) {
      cargarDatos();
    }
  }, [isOpen, vacunaId, mes, anio]);

  const cargarDatos = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await AjusteEntregasService.obtenerDatosParaAjuste(vacunaId, mes, anio);
      
      if (response.success && response.data) {
        setDatos(response.data);
        
        // Expand all centers by default
        const todosLosCentros = new Set(response.data.centrosAcopio.map(c => c.centroAcopioId));
        setCentrosExpandidos(todosLosCentros);

        // Calculate options automatically
        if (response.data.puedeAjustar) {
          await calcularOpciones(response.data);
        }
      } else {
        setError(response.message || 'Error al cargar datos');
      }
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Error al cargar datos para ajuste');
    } finally {
      setIsLoading(false);
    }
  };

  const calcularOpciones = async (datosActuales: DatosAjusteEntregas) => {
    try {
      setIsCalculating(true);
      
      const response = await AjusteEntregasService.calcularOpcionesAjuste(datosActuales);
      
      if (response.success && response.data) {
        setOpciones(response.data);
        
        // Auto-select recommended option
        const recomendada = response.data.find(o => o.esRecomendada);
        if (recomendada) {
          setOpcionSeleccionada(recomendada.id);
        }
      }
    } catch (err: any) {
      console.error('Error calculando opciones:', err);
    } finally {
      setIsCalculating(false);
    }
  };

  const ejecutarAjuste = async () => {
    if (!opcionSeleccionada || !datos || !user) return;

    const opcion = opciones.find(o => o.id === opcionSeleccionada);
    if (!opcion) return;

    try {
      setIsExecuting(true);

      const ajustesParaEnviar = opcion.ajustes
        .filter(a => !a.bloqueado && a.diferencia !== 0)
        .map(a => ({
          movimientoId: a.movimientoId,
          entregaNueva: a.entregaDespues,
        }));

      const response = await AjusteEntregasService.ejecutarAjuste({
        vacunaId,
        mes,
        anio,
        ajustes: ajustesParaEnviar,
        usuarioId: user.id,
      });

      if (response.success) {
        toast.success(response.data?.mensaje || 'Ajuste ejecutado exitosamente');
        onAjusteCompletado();
        onClose();
      } else {
        toast.error(response.message || 'Error al ejecutar ajuste');
      }
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Error al ejecutar ajuste');
    } finally {
      setIsExecuting(false);
    }
  };

  const toggleCentro = (centroId: string) => {
    setCentrosExpandidos(prev => {
      const nuevo = new Set(prev);
      if (nuevo.has(centroId)) {
        nuevo.delete(centroId);
      } else {
        nuevo.add(centroId);
      }
      return nuevo;
    });
  };

  const opcionActual = useMemo(() => {
    return opciones.find(o => o.id === opcionSeleccionada);
  }, [opciones, opcionSeleccionada]);

  const ajustesPorCentro = useMemo(() => {
    if (!opcionActual) return new Map<string, AjusteIndividual[]>();
    
    const mapa = new Map<string, AjusteIndividual[]>();
    for (const ajuste of opcionActual.ajustes) {
      const lista = mapa.get(ajuste.centroAcopioId) || [];
      lista.push(ajuste);
      mapa.set(ajuste.centroAcopioId, lista);
    }
    return mapa;
  }, [opcionActual]);

  const getColorCentro = (nombre: string) => {
    const nombreUpper = nombre.toUpperCase();
    for (const [key, value] of Object.entries(COLORES_CENTROS_ACOPIO)) {
      if (nombreUpper.includes(key)) {
        return value;
      }
    }
    return COLORES_CENTROS_ACOPIO['DEFAULT'];
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-screen items-center justify-center p-4">
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
        
        <div className="relative w-full max-w-4xl bg-white rounded-2xl shadow-2xl max-h-[90vh] overflow-hidden flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-rose-500 to-orange-500">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-white/20 rounded-xl">
                <TrendingDown className="h-6 w-6 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">
                  Ajuste Automatico de Entregas
                </h2>
                <p className="text-sm text-white/80">
                  {vacunaNombre} - {MESES[mes - 1]} {anio}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/20 rounded-xl transition-colors"
            >
              <X className="h-5 w-5 text-white" />
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {isLoading ? (
              <div className="flex flex-col items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-teal-600 mb-4" />
                <p className="text-gray-600">Cargando datos...</p>
              </div>
            ) : error ? (
              <div className="flex flex-col items-center justify-center py-12">
                <div className="p-4 bg-rose-100 rounded-full mb-4">
                  <AlertTriangle className="h-8 w-8 text-rose-600" />
                </div>
                <p className="text-rose-700 font-medium">{error}</p>
                <button
                  onClick={cargarDatos}
                  className="mt-4 px-4 py-2 bg-rose-600 text-white rounded-lg hover:bg-rose-700"
                >
                  Reintentar
                </button>
              </div>
            ) : datos && !datos.puedeAjustar ? (
              <div className="flex flex-col items-center justify-center py-12">
                <div className="p-4 bg-amber-100 rounded-full mb-4">
                  <Lock className="h-8 w-8 text-amber-600" />
                </div>
                <p className="text-amber-700 font-medium text-center">
                  {datos.motivoNoPuedeAjustar}
                </p>
              </div>
            ) : datos ? (
              <>
                {/* Stock Summary */}
                <div className="grid grid-cols-3 gap-4">
                  <div className="p-4 bg-teal-50 rounded-xl border border-teal-200">
                    <div className="flex items-center gap-2 text-teal-600 mb-1">
                      <Package className="h-4 w-4" />
                      <span className="text-xs font-medium uppercase">Stock Inicial</span>
                    </div>
                    <p className="text-2xl font-bold text-teal-800">
                      {datos.stockInicial.toLocaleString()}
                    </p>
                  </div>
                  <div className="p-4 bg-cyan-50 rounded-xl border border-cyan-200">
                    <div className="flex items-center gap-2 text-cyan-600 mb-1">
                      <Truck className="h-4 w-4" />
                      <span className="text-xs font-medium uppercase">Total Entregas</span>
                    </div>
                    <p className="text-2xl font-bold text-cyan-800">
                      {datos.totalEntregas.toLocaleString()}
                    </p>
                  </div>
                  <div className="p-4 bg-rose-50 rounded-xl border border-rose-200">
                    <div className="flex items-center gap-2 text-rose-600 mb-1">
                      <TrendingDown className="h-4 w-4" />
                      <span className="text-xs font-medium uppercase">Deficit</span>
                    </div>
                    <p className="text-2xl font-bold text-rose-800">
                      {datos.deficit.toLocaleString()}
                    </p>
                  </div>
                </div>

                {/* Adjustment Options */}
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Sparkles className="h-5 w-5 text-amber-500" />
                    <h3 className="font-semibold text-gray-800">Opciones de Ajuste</h3>
                    {isCalculating && <Loader2 className="h-4 w-4 animate-spin text-gray-400" />}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {opciones.map(opcion => (
                      <button
                        key={opcion.id}
                        onClick={() => setOpcionSeleccionada(opcion.id)}
                        className={`p-4 rounded-xl border-2 text-left transition-all ${
                          opcionSeleccionada === opcion.id
                            ? 'border-teal-500 bg-teal-50 ring-2 ring-teal-500/20'
                            : 'border-gray-200 hover:border-gray-300 bg-white'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-semibold text-gray-800">{opcion.nombre}</span>
                              {opcion.esRecomendada && (
                                <span className="px-2 py-0.5 bg-amber-100 text-amber-700 text-xs font-medium rounded-full">
                                  Recomendada
                                </span>
                              )}
                            </div>
                            <p className="text-sm text-gray-600 mt-1">{opcion.descripcion}</p>
                          </div>
                          <div className={`p-1.5 rounded-full ${
                            opcionSeleccionada === opcion.id ? 'bg-teal-500' : 'bg-gray-200'
                          }`}>
                            {opcionSeleccionada === opcion.id && (
                              <CheckCircle2 className="h-4 w-4 text-white" />
                            )}
                          </div>
                        </div>
                        <div className="mt-3 pt-3 border-t border-gray-100 flex items-center justify-between text-sm">
                          <span className="text-gray-500">
                            Reduccion: <span className="font-semibold text-rose-600">-{opcion.reduccionTotal.toLocaleString()}</span>
                          </span>
                          <span className="text-gray-500">
                            Nuevo deficit: <span className={`font-semibold ${opcion.resultadoDeficit === 0 ? 'text-emerald-600' : 'text-amber-600'}`}>
                              {opcion.resultadoDeficit}
                            </span>
                          </span>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Preview by Centro de Acopio */}
                {opcionActual && (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Building2 className="h-5 w-5 text-gray-600" />
                        <h3 className="font-semibold text-gray-800">Vista Previa por Centro de Acopio</h3>
                      </div>
                      <div className="flex items-center gap-4 text-sm">
                        <span className="flex items-center gap-1">
                          <span className="w-3 h-3 bg-emerald-500 rounded-full" />
                          Ajustables: {datos.establecimientosAjustables}
                        </span>
                        <span className="flex items-center gap-1">
                          <Lock className="h-3 w-3 text-gray-400" />
                          Bloqueados: {datos.establecimientosBloqueados}
                        </span>
                      </div>
                    </div>

                    <div className="space-y-2 max-h-64 overflow-y-auto">
                      {datos.centrosAcopio.map(centro => {
                        const colores = getColorCentro(centro.centroAcopioNombre);
                        const ajustesCentro = ajustesPorCentro.get(centro.centroAcopioId) || [];
                        const isExpanded = centrosExpandidos.has(centro.centroAcopioId);

                        return (
                          <div
                            key={centro.centroAcopioId}
                            className={`rounded-xl border overflow-hidden ${
                              centro.tieneValeGenerado ? 'opacity-60' : ''
                            } ${colores.border} ${colores.bg}`}
                          >
                            <button
                              onClick={() => toggleCentro(centro.centroAcopioId)}
                              className="w-full flex items-center justify-between px-4 py-3"
                            >
                              <div className="flex items-center gap-3">
                                <div className={`w-3 h-3 rounded-full ${colores.accent}`} />
                                <span className={`font-semibold ${colores.text}`}>
                                  {centro.centroAcopioNombre}
                                </span>
                                {centro.tieneValeGenerado && (
                                  <span className="flex items-center gap-1 px-2 py-0.5 bg-gray-200 text-gray-600 text-xs rounded-full">
                                    <Lock className="h-3 w-3" />
                                    Vale: {centro.valeNumero}
                                  </span>
                                )}
                              </div>
                              <div className="flex items-center gap-3">
                                <span className="text-sm text-gray-600">
                                  {centro.establecimientos.length} establecimientos
                                </span>
                                {isExpanded ? (
                                  <ChevronUp className="h-4 w-4 text-gray-400" />
                                ) : (
                                  <ChevronDown className="h-4 w-4 text-gray-400" />
                                )}
                              </div>
                            </button>

                            {isExpanded && (
                              <div className="px-4 pb-3 space-y-1">
                                {ajustesCentro.map(ajuste => (
                                  <div
                                    key={ajuste.movimientoId}
                                    className={`flex items-center justify-between py-2 px-3 rounded-lg ${
                                      ajuste.bloqueado ? 'bg-gray-100' : 'bg-white/70'
                                    }`}
                                  >
                                    <div className="flex items-center gap-2">
                                      {ajuste.bloqueado && <Lock className="h-3.5 w-3.5 text-gray-400" />}
                                      <span className={`text-sm ${ajuste.bloqueado ? 'text-gray-500' : 'text-gray-700'}`}>
                                        {ajuste.establecimientoNombre}
                                      </span>
                                    </div>
                                    <div className="flex items-center gap-2 text-sm">
                                      <span className="font-medium text-gray-600">
                                        {ajuste.entregaAntes.toLocaleString()}
                                      </span>
                                      {!ajuste.bloqueado && ajuste.diferencia !== 0 && (
                                        <>
                                          <ArrowRight className="h-3.5 w-3.5 text-gray-400" />
                                          <span className="font-semibold text-teal-700">
                                            {ajuste.entregaDespues.toLocaleString()}
                                          </span>
                                          <span className={`text-xs px-1.5 py-0.5 rounded ${
                                            ajuste.diferencia < 0 ? 'bg-rose-100 text-rose-700' : 'bg-emerald-100 text-emerald-700'
                                          }`}>
                                            {ajuste.diferencia > 0 ? '+' : ''}{ajuste.diferencia.toLocaleString()}
                                          </span>
                                        </>
                                      )}
                                      {ajuste.bloqueado && (
                                        <span className="text-xs text-gray-400 italic">Sin cambios</span>
                                      )}
                                    </div>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Totals Summary */}
                {opcionActual && (
                  <div className="p-4 bg-gray-50 rounded-xl border border-gray-200">
                    <div className="grid grid-cols-3 gap-4 text-center">
                      <div>
                        <p className="text-xs text-gray-500 uppercase mb-1">Antes</p>
                        <p className="text-xl font-bold text-gray-800">
                          {opcionActual.totalAntes.toLocaleString()}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 uppercase mb-1">Reduccion</p>
                        <p className="text-xl font-bold text-rose-600">
                          -{opcionActual.reduccionTotal.toLocaleString()}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 uppercase mb-1">Despues</p>
                        <p className="text-xl font-bold text-emerald-600">
                          {opcionActual.totalDespues.toLocaleString()}
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </>
            ) : null}
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between px-6 py-4 border-t border-gray-200 bg-gray-50">
            <button
              onClick={onClose}
              disabled={isExecuting}
              className="px-4 py-2 text-gray-600 hover:text-gray-800 font-medium disabled:opacity-50"
            >
              Cancelar
            </button>
            <button
              onClick={ejecutarAjuste}
              disabled={!opcionSeleccionada || isExecuting || !datos?.puedeAjustar}
              className="flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-teal-500 to-cyan-500 
                         text-white font-semibold rounded-xl shadow-lg shadow-teal-500/25
                         hover:from-teal-600 hover:to-cyan-600 disabled:opacity-50 disabled:cursor-not-allowed
                         transition-all"
            >
              {isExecuting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Ejecutando...
                </>
              ) : (
                <>
                  <CheckCircle2 className="h-4 w-4" />
                  Confirmar Ajuste
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AjusteDeficitModal;
