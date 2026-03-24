import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  AlertTriangle,
  Building2,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Loader2,
  Lock,
  Package,
  Sparkles,
  Truck,
  TrendingDown,
} from 'lucide-react';
import { Modal } from '../../Establecimientos/components';
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

const SummaryCard: React.FC<{
  label: string;
  value: string;
  tone?: 'teal' | 'cyan' | 'rose';
  icon: React.ReactNode;
}> = ({ label, value, tone = 'teal', icon }) => {
  const className =
    tone === 'cyan'
      ? 'border-cyan-200 bg-cyan-50 text-cyan-900'
      : tone === 'rose'
      ? 'border-rose-200 bg-rose-50 text-rose-900'
      : 'border-teal-200 bg-teal-50 text-teal-900';

  return (
    <div className={`rounded-[20px] border px-4 py-3 ${className}`}>
      <div className="flex items-center gap-2">
        {icon}
        <p className="text-[0.7rem] font-semibold uppercase tracking-[0.12em] text-slate-500">{label}</p>
      </div>
      <p className="mt-2 text-2xl font-semibold">{value}</p>
    </div>
  );
};

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

  const getErrorMessage = (error: unknown, fallback: string) => {
    if (error instanceof Error && error.message) {
      return error.message;
    }

    if (
      typeof error === 'object' &&
      error !== null &&
      'response' in error &&
      typeof (error as { response?: unknown }).response === 'object' &&
      (error as { response?: { data?: { message?: string } } }).response?.data?.message
    ) {
      return (error as { response?: { data?: { message?: string } } }).response?.data?.message || fallback;
    }

    return fallback;
  };

  useEffect(() => {
    if (isOpen && vacunaId) {
      void cargarDatos();
    }
  }, [cargarDatos, isOpen, vacunaId]);

  const cargarDatos = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await AjusteEntregasService.obtenerDatosParaAjuste(vacunaId, mes, anio);

      if (response.success && response.data) {
        setDatos(response.data);
        setCentrosExpandidos(new Set(response.data.centrosAcopio.map((centro) => centro.centroAcopioId)));

        if (response.data.puedeAjustar) {
          await calcularOpciones(response.data);
        }
      } else {
        setError(response.message || 'Error al cargar datos');
      }
    } catch (error: unknown) {
      setError(getErrorMessage(error, 'Error al cargar datos para ajuste'));
    } finally {
      setIsLoading(false);
    }
  }, [anio, mes, vacunaId]);

  const calcularOpciones = async (datosActuales: DatosAjusteEntregas) => {
    try {
      setIsCalculating(true);
      const response = await AjusteEntregasService.calcularOpcionesAjuste(datosActuales);

      if (response.success && response.data) {
        setOpciones(response.data);
        const recomendada = response.data.find((opcion) => opcion.esRecomendada);
        if (recomendada) {
          setOpcionSeleccionada(recomendada.id);
        }
      }
    } catch (err) {
      console.error('Error calculando opciones:', err);
    } finally {
      setIsCalculating(false);
    }
  };

  const ejecutarAjuste = async () => {
    if (!opcionSeleccionada || !datos || !user) return;

    const opcion = opciones.find((item) => item.id === opcionSeleccionada);
    if (!opcion) return;

    try {
      setIsExecuting(true);

      const ajustesParaEnviar = opcion.ajustes
        .filter((ajuste) => !ajuste.bloqueado && ajuste.diferencia !== 0)
        .map((ajuste) => ({
          movimientoId: ajuste.movimientoId,
          entregaNueva: ajuste.entregaDespues,
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
    } catch (error: unknown) {
      toast.error(getErrorMessage(error, 'Error al ejecutar ajuste'));
    } finally {
      setIsExecuting(false);
    }
  };

  const toggleCentro = (centroId: string) => {
    setCentrosExpandidos((prev) => {
      const next = new Set(prev);
      if (next.has(centroId)) {
        next.delete(centroId);
      } else {
        next.add(centroId);
      }
      return next;
    });
  };

  const opcionActual = useMemo(
    () => opciones.find((opcion) => opcion.id === opcionSeleccionada),
    [opcionSeleccionada, opciones],
  );

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
    return COLORES_CENTROS_ACOPIO.DEFAULT;
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={() => {
        if (!isExecuting) onClose();
      }}
      title="Ajuste por déficit"
      subtitle={`${vacunaNombre} · ${MESES[mes - 1]} ${anio} · Déficit ${Math.abs(deficit).toLocaleString()} unidades`}
      icon={TrendingDown}
      size="xl"
      footer={
        <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={onClose}
            disabled={isExecuting}
            className="inline-flex min-h-[44px] items-center justify-center rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={ejecutarAjuste}
            disabled={!opcionSeleccionada || isExecuting || !datos?.puedeAjustar}
            className="inline-flex min-h-[44px] items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-teal-600 to-cyan-600 px-4 py-2 text-sm font-medium text-white shadow-sm transition hover:from-teal-700 hover:to-cyan-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isExecuting ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4" />}
            <span>{isExecuting ? 'Ejecutando...' : 'Confirmar ajuste'}</span>
          </button>
        </div>
      }
    >
      {isLoading ? (
        <div className="inventory-loading-shell rounded-[22px] border border-slate-200 bg-slate-50/70 p-5">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl border border-teal-200 bg-white text-teal-600 inventory-breathe">
              <Loader2 className="h-4 w-4 animate-spin" />
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-900">Cargando datos de ajuste</p>
              <p className="text-xs text-slate-500">Preparando opciones y agrupaciones por centro.</p>
            </div>
          </div>
        </div>
      ) : error ? (
        <div className="rounded-[22px] border border-rose-200 bg-rose-50/70 p-5">
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl border border-rose-200 bg-white text-rose-600">
              <AlertTriangle className="h-4 w-4" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold text-rose-900">No se pudo preparar el ajuste</p>
              <p className="mt-1 text-sm text-rose-700">{error}</p>
            </div>
          </div>
        </div>
      ) : datos && !datos.puedeAjustar ? (
        <div className="rounded-[22px] border border-amber-200 bg-amber-50/70 p-5">
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl border border-amber-200 bg-white text-amber-600">
              <Lock className="h-4 w-4" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold text-amber-900">Ajuste no disponible</p>
              <p className="mt-1 text-sm text-amber-700">{datos.motivoNoPuedeAjustar}</p>
            </div>
          </div>
        </div>
      ) : datos ? (
        <div className="space-y-5">
          <section className="grid gap-3 sm:grid-cols-3">
            <SummaryCard
              label="Stock inicial"
              value={datos.stockInicial.toLocaleString()}
              icon={<Package className="h-4 w-4 text-teal-600" />}
            />
            <SummaryCard
              label="Total entregas"
              value={datos.totalEntregas.toLocaleString()}
              tone="cyan"
              icon={<Truck className="h-4 w-4 text-cyan-600" />}
            />
            <SummaryCard
              label="Déficit"
              value={Math.abs(datos.deficit).toLocaleString()}
              tone="rose"
              icon={<TrendingDown className="h-4 w-4 text-rose-600" />}
            />
          </section>

          <section className="rounded-[22px] border border-slate-200 bg-white p-4">
            <div className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-amber-500" />
              <h3 className="text-sm font-semibold text-slate-900">Opciones de ajuste</h3>
              {isCalculating ? <Loader2 className="h-4 w-4 animate-spin text-slate-400" /> : null}
            </div>

            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              {opciones.map((opcion) => (
                <button
                  key={opcion.id}
                  type="button"
                  onClick={() => setOpcionSeleccionada(opcion.id)}
                  className={`rounded-[20px] border p-4 text-left transition ${
                    opcionSeleccionada === opcion.id
                      ? 'border-teal-200 bg-teal-50/80 shadow-sm'
                      : 'border-slate-200 bg-slate-50/70 hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="text-sm font-semibold text-slate-900">{opcion.nombre}</p>
                        {opcion.esRecomendada ? (
                          <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[11px] font-semibold text-amber-700">
                            Recomendada
                          </span>
                        ) : null}
                      </div>
                      <p className="mt-1 text-sm text-slate-500">{opcion.descripcion}</p>
                    </div>
                    <div
                      className={`flex h-7 w-7 items-center justify-center rounded-full ${
                        opcionSeleccionada === opcion.id ? 'bg-teal-600 text-white' : 'bg-slate-200 text-slate-400'
                      }`}
                    >
                      {opcionSeleccionada === opcion.id ? <CheckCircle2 className="h-4 w-4" /> : <span className="h-2.5 w-2.5 rounded-full bg-current" />}
                    </div>
                  </div>

                  <div className="mt-4 grid gap-3 sm:grid-cols-2">
                    <div className="rounded-[16px] border border-slate-200 bg-white px-3 py-2.5">
                      <p className="text-[0.7rem] font-semibold uppercase tracking-[0.12em] text-slate-500">Reducción</p>
                      <p className="mt-1 text-sm font-semibold text-rose-700">-{opcion.reduccionTotal.toLocaleString()}</p>
                    </div>
                    <div className="rounded-[16px] border border-slate-200 bg-white px-3 py-2.5">
                      <p className="text-[0.7rem] font-semibold uppercase tracking-[0.12em] text-slate-500">Déficit restante</p>
                      <p className={`mt-1 text-sm font-semibold ${opcion.resultadoDeficit === 0 ? 'text-emerald-700' : 'text-amber-700'}`}>
                        {opcion.resultadoDeficit.toLocaleString()}
                      </p>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </section>

          {opcionActual ? (
            <section className="rounded-[22px] border border-slate-200 bg-white p-4">
              <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                <div className="flex items-center gap-2">
                  <Building2 className="h-4 w-4 text-slate-600" />
                  <h3 className="text-sm font-semibold text-slate-900">Vista previa por centro de acopio</h3>
                </div>
                <div className="flex flex-wrap gap-2 text-xs">
                  <span className="rounded-full bg-emerald-100 px-2.5 py-1 font-semibold text-emerald-700">
                    Ajustables: {datos.establecimientosAjustables}
                  </span>
                  <span className="rounded-full bg-slate-100 px-2.5 py-1 font-semibold text-slate-600">
                    Bloqueados: {datos.establecimientosBloqueados}
                  </span>
                </div>
              </div>

              <div className="mt-4 space-y-3">
                {datos.centrosAcopio.map((centro) => {
                  const colores = getColorCentro(centro.centroAcopioNombre);
                  const ajustesCentro = ajustesPorCentro.get(centro.centroAcopioId) || [];
                  const isExpanded = centrosExpandidos.has(centro.centroAcopioId);

                  return (
                    <div
                      key={centro.centroAcopioId}
                      className={`overflow-hidden rounded-[20px] border ${colores.border} ${colores.bg} ${
                        centro.tieneValeGenerado ? 'opacity-70' : ''
                      }`}
                    >
                      <button
                        type="button"
                        onClick={() => toggleCentro(centro.centroAcopioId)}
                        className="flex w-full items-center justify-between gap-3 px-4 py-3 text-left"
                      >
                        <div className="flex items-center gap-3">
                          <span className={`h-3 w-3 rounded-full ${colores.accent}`} />
                          <div>
                            <p className={`text-sm font-semibold ${colores.text}`}>{centro.centroAcopioNombre}</p>
                            {centro.tieneValeGenerado ? (
                              <span className="mt-1 inline-flex items-center gap-1 rounded-full bg-white/70 px-2 py-0.5 text-[11px] font-semibold text-slate-600">
                                <Lock className="h-3 w-3" />
                                Vale: {centro.valeNumero}
                              </span>
                            ) : null}
                          </div>
                        </div>

                        <div className="flex items-center gap-3">
                          <span className="text-xs font-medium text-slate-600">
                            {centro.establecimientos.length} establecimientos
                          </span>
                          {isExpanded ? <ChevronUp className="h-4 w-4 text-slate-400" /> : <ChevronDown className="h-4 w-4 text-slate-400" />}
                        </div>
                      </button>

                      {isExpanded ? (
                        <div className="space-y-2 border-t border-white/60 bg-white/40 px-4 py-3">
                          {ajustesCentro.map((ajuste) => (
                            <div
                              key={ajuste.movimientoId}
                              className={`rounded-[18px] border px-3 py-2.5 ${
                                ajuste.bloqueado
                                  ? 'border-slate-200 bg-slate-100/80'
                                  : 'border-white/80 bg-white/80'
                              }`}
                            >
                              <div className="flex flex-col gap-2 lg:flex-row lg:items-center lg:justify-between">
                                <div className="flex items-center gap-2">
                                  {ajuste.bloqueado ? <Lock className="h-3.5 w-3.5 text-slate-400" /> : null}
                                  <p className={`text-sm font-medium ${ajuste.bloqueado ? 'text-slate-500' : 'text-slate-800'}`}>
                                    {ajuste.establecimientoNombre}
                                  </p>
                                </div>
                                <div className="flex items-center gap-2 text-sm">
                                  <span className="font-medium text-slate-600">{ajuste.entregaAntes.toLocaleString()}</span>
                                  {!ajuste.bloqueado && ajuste.diferencia !== 0 ? (
                                    <>
                                      <span className="text-slate-400">→</span>
                                      <span className="font-semibold text-slate-900">{ajuste.entregaDespues.toLocaleString()}</span>
                                      <span
                                        className={`rounded-full px-2 py-0.5 text-[11px] font-semibold ${
                                          ajuste.diferencia < 0
                                            ? 'bg-rose-100 text-rose-700'
                                            : 'bg-emerald-100 text-emerald-700'
                                        }`}
                                      >
                                        {ajuste.diferencia > 0 ? '+' : ''}
                                        {ajuste.diferencia.toLocaleString()}
                                      </span>
                                    </>
                                  ) : (
                                    <span className="text-xs italic text-slate-400">Sin cambios</span>
                                  )}
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : null}
                    </div>
                  );
                })}
              </div>

              <div className="mt-4 grid gap-3 sm:grid-cols-3">
                <SummaryCard label="Antes" value={opcionActual.totalAntes.toLocaleString()} icon={<Package className="h-4 w-4 text-teal-600" />} />
                <SummaryCard label="Reducción" value={`-${opcionActual.reduccionTotal.toLocaleString()}`} tone="rose" icon={<TrendingDown className="h-4 w-4 text-rose-600" />} />
                <SummaryCard label="Después" value={opcionActual.totalDespues.toLocaleString()} tone="cyan" icon={<CheckCircle2 className="h-4 w-4 text-cyan-600" />} />
              </div>
            </section>
          ) : null}
        </div>
      ) : null}
    </Modal>
  );
};

export default AjusteDeficitModal;
