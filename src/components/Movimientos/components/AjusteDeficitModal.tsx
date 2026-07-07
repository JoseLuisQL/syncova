import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Warning,
  Buildings,
  CheckCircle,
  CaretDown,
  CaretUp,
  CircleNotch,
  LockKey,
  Package,
  Sparkle,
  Truck,
  TrendDown,
} from '@phosphor-icons/react';
import { Modal } from '../../Establecimientos/components';
import { MESES, COMPONENT_STYLES } from '../constants';
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
  tone?: 'base' | 'alt' | 'alert';
  icon: React.ReactNode;
}> = ({ label, value, tone = 'base', icon }) => {
  const className =
    tone === 'alert'
      ? 'border-rose-200 bg-white text-rose-900'
      : tone === 'alt'
      ? 'border-line bg-surface-soft text-zinc-900'
      : 'border-line-focus bg-[#f3f0ff] text-brand';

  return (
    <div className={`rounded-xl border px-5 py-4 ${className}`}>
      <div className="flex items-center gap-2 mb-3">
        <div className={`p-1.5 rounded-md ${tone === 'alert' ? 'bg-rose-50 border border-rose-100' : 'bg-white border border-line'}`}>
          {icon}
        </div>
        <p className={`text-[0.65rem] font-bold uppercase tracking-widest ${tone === 'alert' ? 'text-rose-500' : 'text-zinc-500'}`}>{label}</p>
      </div>
      <p className="text-2xl font-semibold tracking-tight">{value}</p>
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
  const [opcionesError, setOpcionesError] = useState<string | null>(null);
  const [opcionSeleccionada, setOpcionSeleccionada] = useState<string | null>(null);
  const [centrosExpandidos, setCentrosExpandidos] = useState<Set<string>>(new Set());
  const mesEntrega = datos?.mesEntrega ?? (mes === 12 ? 1 : mes + 1);
  const anioEntrega = datos?.anioEntrega ?? (mes === 12 ? anio + 1 : anio);

  const getErrorMessage = (error: unknown, fallback: string) => {
    if (
      typeof error === 'object' &&
      error !== null &&
      'response' in error &&
      typeof (error as { response?: unknown }).response === 'object' &&
      (error as { response?: { data?: { message?: string } } }).response?.data?.message
    ) {
      return (error as { response?: { data?: { message?: string } } }).response?.data?.message || fallback;
    }

    if (error instanceof Error && error.message) {
      return error.message;
    }

    return fallback;
  };

  const crearOpcionParcial = (datosActuales: DatosAjusteEntregas): OpcionAjuste | null => {
    const ajustes: AjusteIndividual[] = datosActuales.centrosAcopio.flatMap((centro) =>
      centro.establecimientos.map((establecimiento) => {
        const bloqueado = establecimiento.tieneValeGenerado;
        return {
          movimientoId: establecimiento.movimientoId,
          establecimientoId: establecimiento.establecimientoId,
          establecimientoNombre: establecimiento.establecimientoNombre,
          centroAcopioId: establecimiento.centroAcopioId,
          entregaAntes: establecimiento.entregaActual,
          entregaDespues: bloqueado ? establecimiento.entregaActual : 0,
          diferencia: bloqueado ? 0 : -establecimiento.entregaActual,
          bloqueado,
        };
      }),
    );

    const reduccionTotal = ajustes.reduce(
      (total, ajuste) => total + Math.max(0, ajuste.entregaAntes - ajuste.entregaDespues),
      0,
    );

    if (reduccionTotal <= 0) {
      return null;
    }

    const totalDespues = ajustes.reduce((total, ajuste) => total + ajuste.entregaDespues, 0);

    return {
      id: 'reduccion_parcial_disponible',
      nombre: 'Reducir entregas ajustables',
      descripcion: 'Reduce a cero las entregas que aún no tienen vale generado. Si quedan vales bloqueados, el déficit restante se mantiene informado.',
      esRecomendada: true,
      resultadoDeficit: datosActuales.stockInicial - totalDespues,
      ajustes,
      totalAntes: datosActuales.totalEntregas,
      totalDespues,
      reduccionTotal,
    };
  };

  const cargarDatos = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      setOpcionesError(null);
      setOpciones([]);
      setOpcionSeleccionada(null);

      const response = await AjusteEntregasService.obtenerDatosParaAjuste(vacunaId, mes, anio);

      if (response.success && response.data) {
        const datosAjuste = response.data;
        setDatos(datosAjuste);
        setCentrosExpandidos(new Set(datosAjuste.centrosAcopio.map((centro) => centro.centroAcopioId)));

        if (datosAjuste.puedeAjustar) {
          await calcularOpciones(datosAjuste);
        }
      } else {
        setError(response.message || 'Error al compilar el pipeline de ajuste');
      }
    } catch (error: unknown) {
      setError(getErrorMessage(error, 'Fallo sistémico en la extracción de perfiles de déficit'));
    } finally {
      setIsLoading(false);
    }
  }, [anio, mes, vacunaId]);

  useEffect(() => {
    if (isOpen && vacunaId) {
      void cargarDatos();
    }
  }, [cargarDatos, isOpen, vacunaId]);

  const calcularOpciones = async (datosActuales: DatosAjusteEntregas) => {
    try {
      setIsCalculating(true);
      setOpcionesError(null);
      const response = await AjusteEntregasService.calcularOpcionesAjuste(datosActuales);

      const opcionesCalculadas = response.success && response.data?.length
        ? response.data
        : [crearOpcionParcial(datosActuales)].filter((opcion): opcion is OpcionAjuste => Boolean(opcion));

      if (opcionesCalculadas.length) {
        setOpciones(opcionesCalculadas);
        const recomendada = opcionesCalculadas.find((opcion) => opcion.esRecomendada);
        setOpcionSeleccionada((recomendada || opcionesCalculadas[0]).id);
        setOpcionesError(null);
      } else {
        setOpciones([]);
        setOpcionSeleccionada(null);
        setOpcionesError(response.message || 'No se pudieron generar opciones de corrección para este déficit.');
      }
    } catch (err) {
      const opcionParcial = crearOpcionParcial(datosActuales);
      if (opcionParcial) {
        setOpciones([opcionParcial]);
        setOpcionSeleccionada(opcionParcial.id);
        setOpcionesError(null);
      } else {
        setOpciones([]);
        setOpcionSeleccionada(null);
        setOpcionesError(getErrorMessage(err, 'No se pudieron cargar las opciones de corrección.'));
      }
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
        toast.success(response.data?.mensaje || 'Heurística aplicada y estabilizada');
        onAjusteCompletado();
        onClose();
      } else {
        toast.error(response.message || 'Error grave inyectando la corrección');
      }
    } catch (error: unknown) {
      toast.error(getErrorMessage(error, 'Error de latencia en la mutación'));
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

  return (
    <Modal
      isOpen={isOpen}
      onClose={() => {
        if (!isExecuting) onClose();
      }}
      title="Corrección de déficit"
      subtitle={`${vacunaNombre} | Entrega: ${MESES[mesEntrega - 1]} ${anioEntrega} | Déficit: ${Math.abs(deficit).toLocaleString()} U`}
      icon={TrendDown}
      size="xl"
      footer={
        <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={onClose}
            disabled={isExecuting}
            className={COMPONENT_STYLES.button.secondary}
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={ejecutarAjuste}
            disabled={!opcionSeleccionada || isExecuting || !datos?.puedeAjustar}
            className={COMPONENT_STYLES.button.primary}
          >
            {isExecuting ? <CircleNotch className="h-4 w-4 animate-spin" weight="bold" /> : <CheckCircle className="h-4 w-4" weight="bold" />}
            <span>{isExecuting ? 'Aplicando ajuste...' : 'Aplicar corrección'}</span>
          </button>
        </div>
      }
    >
      {isLoading ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-line bg-white p-8 text-center">
          <CircleNotch className="h-8 w-8 text-zinc-900 animate-spin mb-4" weight="bold" />
          <p className="text-[0.95rem] font-bold tracking-tight text-zinc-900">Calculando opciones de ajuste</p>
          <p className="mt-1 text-sm text-zinc-500">Revisando entregas disponibles para estabilizar el déficit.</p>
        </div>
      ) : error ? (
        <div className="rounded-xl border border-rose-200 bg-rose-50 p-5">
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white border border-rose-200 text-rose-600 shadow-sm">
              <Warning className="h-5 w-5" weight="duotone" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-bold text-rose-900 tracking-tight">Fallo en la extracción</p>
              <p className="mt-1 text-sm text-rose-800/80">{error}</p>
            </div>
          </div>
        </div>
      ) : datos && !datos.puedeAjustar ? (
        <div className="rounded-xl border border-line-focus bg-[#f3f0ff] p-5">
          <div className="flex items-start gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-[12px] border border-line-focus bg-white text-brand">
              <LockKey className="h-6 w-6" weight="fill" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-[0.95rem] font-bold text-ink tracking-tight">Ajuste bloqueado</p>
              <p className="mt-1 text-sm text-muted-2">{datos.motivoNoPuedeAjustar}</p>
            </div>
          </div>
        </div>
      ) : datos ? (
        <div className="space-y-6">
          <section className="grid gap-4 sm:grid-cols-3">
            <SummaryCard
              label="Stock base"
              value={datos.stockInicial.toLocaleString()}
              icon={<Package className="h-4 w-4" weight="duotone" />}
              tone="alt"
            />
            <SummaryCard
              label="Entregas actuales"
              value={datos.totalEntregas.toLocaleString()}
              icon={<Truck className="h-4 w-4" weight="duotone" />}
              tone="base"
            />
            <SummaryCard
              label="Déficit"
              value={Math.abs(datos.deficit).toLocaleString()}
              icon={<TrendDown className="h-4 w-4" weight="bold" />}
              tone="alert"
            />
          </section>

          <div className="flex flex-wrap items-center gap-2 rounded-[12px] border border-line bg-surface-soft px-4 py-3 text-[0.8rem] font-semibold text-muted-2">
            <span>Filtro: {MESES[mes - 1]} {anio}</span>
            <span className="text-zinc-300">→</span>
            <span className="text-ink">Se ajustan entregas de {MESES[mesEntrega - 1]} {anioEntrega}</span>
          </div>

          <section className="rounded-xl border border-line bg-white p-5">
            <div className="mb-5 flex items-center gap-3 border-b border-line-soft pb-3">
              <div className="rounded-lg border border-line bg-surface-soft p-2">
                <Sparkle className="h-4 w-4 text-zinc-900" weight="fill" />
              </div>
              <h3 className="text-[0.85rem] font-bold uppercase tracking-widest text-zinc-900">Opciones de corrección</h3>
              {isCalculating ? <CircleNotch className="h-4 w-4 animate-spin text-zinc-900 ml-auto" weight="bold" /> : null}
            </div>

            {isCalculating ? (
              <div className="rounded-[12px] border border-dashed border-line-strong bg-surface-soft px-4 py-6 text-center">
                <CircleNotch className="mx-auto h-5 w-5 animate-spin text-brand" weight="bold" />
                <p className="mt-2 text-sm font-semibold text-ink">Generando opciones de corrección...</p>
              </div>
            ) : opcionesError ? (
              <div className="rounded-[12px] border border-amber-200 bg-amber-50 px-4 py-4">
                <div className="flex items-start gap-3">
                  <Warning className="mt-0.5 h-5 w-5 shrink-0 text-amber-600" weight="duotone" />
                  <div>
                    <p className="text-sm font-semibold text-amber-900">No se pudieron cargar opciones</p>
                    <p className="mt-1 text-sm text-amber-800">{opcionesError}</p>
                  </div>
                </div>
              </div>
            ) : opciones.length === 0 ? (
              <div className="rounded-[12px] border border-dashed border-line-strong bg-surface-soft px-4 py-6 text-center">
                <p className="text-sm font-semibold text-ink">Sin opciones disponibles</p>
                <p className="mt-1 text-sm text-muted-2">No hay entregas ajustables para este período.</p>
              </div>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2">
                {opciones.map((opcion) => (
                  <button
                    key={opcion.id}
                    type="button"
                    onClick={() => setOpcionSeleccionada(opcion.id)}
                    className={`rounded-xl border p-5 text-left transition-colors ${
                      opcionSeleccionada === opcion.id
                        ? 'border-brand-100 bg-surface-soft text-ink'
                        : 'border-line bg-white hover:border-line-strong hover:bg-surface-soft text-zinc-900'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1">
                        <div className="flex flex-wrap items-center gap-2 mb-1.5">
                          <p className="text-[0.95rem] font-semibold tracking-tight text-zinc-900">{opcion.nombre}</p>
                          {opcion.esRecomendada ? (
                            <span className={`rounded-[7px] px-2 py-0.5 text-[0.6rem] font-semibold uppercase tracking-widest ${
                              opcionSeleccionada === opcion.id ? 'bg-[#f3f0ff] text-brand border border-line-focus' : 'bg-brand text-white'
                            }`}>
                              Recomendado
                            </span>
                          ) : null}
                        </div>
                        <p className="text-[0.75rem] font-medium leading-relaxed text-zinc-500">{opcion.descripcion}</p>
                      </div>
                      <div
                        className={`flex h-6 w-6 mt-1 shrink-0 items-center justify-center rounded-full border-2 ${
                          opcionSeleccionada === opcion.id ? 'bg-brand border-brand' : 'bg-transparent border-zinc-300'
                        }`}
                      >
                        {opcionSeleccionada === opcion.id ? <CheckCircle className="h-5 w-5 text-white" weight="fill" /> : null}
                      </div>
                    </div>

                    <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2">
                      <div>
                        <p className="text-[0.6rem] font-bold uppercase tracking-widest text-zinc-500">Reducción</p>
                        <p className="mt-1 text-lg font-semibold tracking-tight text-rose-600">-{opcion.reduccionTotal.toLocaleString()}</p>
                      </div>
                      <div>
                        <p className="text-[0.6rem] font-bold uppercase tracking-widest text-zinc-500">Déficit restante</p>
                        <p className={`mt-1 text-lg font-semibold tracking-tight ${
                          opcion.resultadoDeficit === 0 
                            ? 'text-zinc-900'
                            : 'text-amber-600'
                        }`}>
                          {Math.abs(opcion.resultadoDeficit).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </section>

          {opcionActual ? (
            <section className="rounded-xl border border-line bg-white p-5">
              <div className="mb-5 flex flex-col gap-4 border-b border-line-soft pb-3 lg:flex-row lg:items-center lg:justify-between">
                <div className="flex items-center gap-3">
                  <div className="rounded-lg border border-line bg-surface-soft p-2">
                    <Buildings className="h-4 w-4 text-zinc-900" weight="duotone" />
                  </div>
                  <h3 className="text-[0.85rem] font-bold uppercase tracking-widest text-zinc-900">Distribución afectada</h3>
                </div>
                <div className="flex flex-wrap gap-2 text-[0.65rem] font-bold uppercase tracking-widest">
                  <span className="rounded-md border border-line bg-white px-2.5 py-1 text-zinc-900">
                    {datos.establecimientosAjustables} ajustables
                  </span>
                  <span className="rounded-md border border-line-focus bg-[#f3f0ff] px-2.5 py-1 text-brand">
                    {datos.establecimientosBloqueados} bloqueados
                  </span>
                </div>
              </div>

              <div className="space-y-3">
                {datos.centrosAcopio.map((centro) => {
                  const ajustesCentro = ajustesPorCentro.get(centro.centroAcopioId) || [];
                  const isExpanded = centrosExpandidos.has(centro.centroAcopioId);

                  return (
                    <div
                      key={centro.centroAcopioId}
                      className={`overflow-hidden rounded-[12px] border transition-colors ${
                        centro.tieneValeGenerado ? 'border-line bg-surface-soft p-1' : 'border-line bg-white hover:border-line-strong'
                      }`}
                    >
                      <button
                        type="button"
                        onClick={() => toggleCentro(centro.centroAcopioId)}
                        className={`flex w-full items-center justify-between gap-3 px-4 py-3 text-left ${centro.tieneValeGenerado ? 'opacity-80' : ''}`}
                      >
                        <div className="flex items-center gap-4">
                          <div className={`flex h-8 w-8 items-center justify-center rounded-[9px] ${centro.tieneValeGenerado ? 'bg-zinc-200 text-zinc-500' : 'bg-[#f3f0ff] text-brand border border-line-focus'}`}>
                            {centro.tieneValeGenerado ? <LockKey className="h-4 w-4" weight="fill" /> : <Buildings className="h-4 w-4" weight="duotone" />}
                          </div>
                          <div>
                            <p className="text-[0.85rem] font-semibold tracking-tight text-zinc-900">{centro.centroAcopioNombre}</p>
                            {centro.tieneValeGenerado ? (
                              <span className="mt-1 inline-flex items-center gap-1 rounded-sm bg-zinc-200 px-1.5 py-0.5 text-[0.6rem] font-bold uppercase tracking-widest text-zinc-700">
                                Vale bloqueado: {centro.valeNumero}
                              </span>
                            ) : null}
                          </div>
                        </div>

                        <div className="flex items-center gap-4">
                          <span className="text-[0.7rem] font-bold tracking-widest text-zinc-400 uppercase">
                            {centro.establecimientos.length} EESS
                          </span>
                          <div className={`p-1 rounded-md transition-colors ${isExpanded ? 'bg-zinc-100 text-zinc-900' : 'bg-transparent text-zinc-400'}`}>
                            {isExpanded ? <CaretUp className="h-4 w-4" weight="bold" /> : <CaretDown className="h-4 w-4" weight="bold" />}
                          </div>
                        </div>
                      </button>

                      {isExpanded ? (
                        <div className="space-y-1.5 border-t border-line-soft bg-surface-soft p-3">
                          {ajustesCentro.map((ajuste) => (
                            <div
                              key={ajuste.movimientoId}
                              className={`flex items-center justify-between rounded-lg border px-4 py-3 transition-colors ${
                                ajuste.bloqueado
                                  ? 'border-line bg-zinc-100/50'
                                  : 'border-line bg-white hover:border-line-strong'
                              }`}
                            >
                              <div className="flex items-center gap-3">
                                {ajuste.bloqueado ? (
                                  <LockKey className="h-3.5 w-3.5 text-zinc-400" weight="fill" />
                                ) : (
                                  <span className="h-2 w-2 rounded-full bg-zinc-300" />
                                )}
                                <p className={`text-[0.85rem] font-bold tracking-tight ${ajuste.bloqueado ? 'text-zinc-500' : 'text-zinc-900'}`}>
                                  {ajuste.establecimientoNombre}
                                </p>
                              </div>
                              
                              <div className="flex items-center gap-3 text-[0.85rem]">
                                <span className={`font-semibold ${ajuste.bloqueado ? 'text-zinc-400' : 'text-zinc-600'}`}>{ajuste.entregaAntes.toLocaleString()}</span>
                                {!ajuste.bloqueado && ajuste.diferencia !== 0 ? (
                                  <>
                                    <span className="text-zinc-300 font-bold">&rarr;</span>
                                    <span className="font-semibold text-zinc-900">{ajuste.entregaDespues.toLocaleString()}</span>
                                    <span
                                      className={`ml-2 rounded-[7px] border px-2 py-0.5 text-[0.7rem] font-semibold ${
                                        ajuste.diferencia < 0
                                          ? 'bg-rose-50 text-rose-700 border-rose-200'
                                          : 'bg-[#f3f0ff] text-brand border-line-focus'
                                      }`}
                                    >
                                      {ajuste.diferencia > 0 ? '+' : ''}
                                      {ajuste.diferencia.toLocaleString()}
                                    </span>
                                  </>
                                ) : (
                                  <span className="ml-2 rounded-[7px] border border-line bg-zinc-50 px-2 py-0.5 text-[0.65rem] font-bold uppercase tracking-widest text-zinc-400">Sin cambios</span>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : null}
                    </div>
                  );
                })}
              </div>

              <div className="mt-5 grid grid-cols-1 gap-4 border-t border-line-soft pt-5 sm:grid-cols-3">
                <div className="rounded-[12px] border border-line bg-surface-soft p-4">
                  <p className="text-[0.65rem] font-bold uppercase tracking-widest text-zinc-500">Entrega actual</p>
                  <p className="mt-1 text-xl font-semibold tracking-tight text-zinc-900">{opcionActual.totalAntes.toLocaleString()}</p>
                </div>
                <div className="rounded-[12px] border border-rose-200 bg-white p-4">
                  <p className="text-[0.65rem] font-bold uppercase tracking-widest text-rose-500">Delta</p>
                  <p className="mt-1 text-xl font-semibold tracking-tight text-rose-600">-{opcionActual.reduccionTotal.toLocaleString()}</p>
                </div>
                <div className="rounded-[12px] border border-line-focus bg-[#f3f0ff] p-4">
                  <p className="text-[0.65rem] font-bold uppercase tracking-widest text-zinc-500">Entrega ajustada</p>
                  <p className="mt-1 text-xl font-semibold tracking-tight text-brand">{opcionActual.totalDespues.toLocaleString()}</p>
                </div>
              </div>
            </section>
          ) : null}
        </div>
      ) : null}
    </Modal>
  );
};

export default AjusteDeficitModal;
