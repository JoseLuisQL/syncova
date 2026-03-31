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
  tone?: 'base' | 'alt' | 'alert';
  icon: React.ReactNode;
}> = ({ label, value, tone = 'base', icon }) => {
  const className =
    tone === 'alert'
      ? 'border-rose-200 bg-white text-rose-900 shadow-sm'
      : tone === 'alt'
      ? 'border-teal-200 bg-teal-50 text-teal-900 shadow-sm'
      : 'border-teal-600 bg-teal-600 text-white shadow-sm';

  return (
    <div className={`rounded-[16px] border px-5 py-4 ${className}`}>
      <div className="flex items-center gap-2 mb-3">
        <div className={`p-1.5 rounded-lg ${tone === 'alert' ? 'bg-rose-50 border border-rose-100' : tone === 'base' ? 'bg-white/10' : 'bg-white border border-zinc-200'}`}>
          {icon}
        </div>
        <p className={`text-[0.65rem] font-bold uppercase tracking-widest ${tone === 'base' ? 'text-zinc-400' : tone === 'alert' ? 'text-rose-500' : 'text-zinc-500'}`}>{label}</p>
      </div>
      <p className="text-2xl font-black tracking-tight">{value}</p>
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


  const cargarDatos = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await AjusteEntregasService.obtenerDatosParaAjuste(vacunaId, mes, anio);

      if (response.success && response.data) {
        setDatos(response.data);
        setCentrosExpandidos(new Set(response.data.centrosAcopio.map((centro: any) => centro.centroAcopioId)));

        if (response.data.puedeAjustar) {
          await calcularOpciones(response.data);
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
      const response = await AjusteEntregasService.calcularOpcionesAjuste(datosActuales);

      if (response.success && response.data) {
        setOpciones(response.data);
        const recomendada = response.data.find((opcion: any) => opcion.esRecomendada);
        if (recomendada) {
          setOpcionSeleccionada(recomendada.id);
        }
      }
    } catch (err) {
      console.error('Error inyectando perfiles heúristicos:', err);
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
      title="Corrección Heurística de Déficit"
      subtitle={`${vacunaNombre} | Target: ${MESES[mes - 1]} ${anio} | Balance Cero: ${Math.abs(deficit).toLocaleString()} U`}
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
            Abortar Inyección
          </button>
          <button
            type="button"
            onClick={ejecutarAjuste}
            disabled={!opcionSeleccionada || isExecuting || !datos?.puedeAjustar}
            className={COMPONENT_STYLES.button.primary}
          >
            {isExecuting ? <CircleNotch className="h-4 w-4 animate-spin" weight="bold" /> : <CheckCircle className="h-4 w-4" weight="bold" />}
            <span>{isExecuting ? 'Compilando Delta...' : 'Firmar Corrección'}</span>
          </button>
        </div>
      }
    >
      {isLoading ? (
        <div className="rounded-[16px] border border-zinc-200 bg-white p-8 flex flex-col items-center justify-center text-center shadow-sm">
          <CircleNotch className="h-8 w-8 text-zinc-900 animate-spin mb-4" weight="bold" />
          <p className="text-[0.95rem] font-bold tracking-tight text-zinc-900">Extrayendo topología de transacciones</p>
          <p className="mt-1 text-sm text-zinc-500">Montando el árbol de asignaciones para calcular la heurística óptima.</p>
        </div>
      ) : error ? (
        <div className="rounded-[16px] border border-rose-200 bg-rose-50 p-5 shadow-sm">
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
        <div className="rounded-[16px] border border-teal-600 bg-teal-600 p-5 shadow-sm">
          <div className="flex items-start gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-white/10 text-white border border-white/20">
              <LockKey className="h-6 w-6" weight="fill" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-[0.95rem] font-bold text-white tracking-tight">Capa Bloqueada</p>
              <p className="mt-1 text-sm text-zinc-400">{datos.motivoNoPuedeAjustar}</p>
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
              label="Outflow actual"
              value={datos.totalEntregas.toLocaleString()}
              icon={<Truck className="h-4 w-4" weight="duotone" />}
              tone="base"
            />
            <SummaryCard
              label="Fractura (Déficit)"
              value={Math.abs(datos.deficit).toLocaleString()}
              icon={<TrendDown className="h-4 w-4" weight="bold" />}
              tone="alert"
            />
          </section>

          <section className="rounded-[16px] border border-zinc-200 bg-white p-5 shadow-sm">
            <div className="flex items-center gap-3 mb-5 border-b border-zinc-100 pb-3">
              <div className="p-2 bg-zinc-50 border border-zinc-200 rounded-lg">
                <Sparkle className="h-4 w-4 text-zinc-900" weight="fill" />
              </div>
              <h3 className="text-[0.85rem] font-bold uppercase tracking-widest text-zinc-900">Modelos de Resolución</h3>
              {isCalculating ? <CircleNotch className="h-4 w-4 animate-spin text-zinc-900 ml-auto" weight="bold" /> : null}
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              {opciones.map((opcion) => (
                <button
                  key={opcion.id}
                  type="button"
                  onClick={() => setOpcionSeleccionada(opcion.id)}
                  className={`rounded-[16px] border p-5 text-left transition-all ${
                    opcionSeleccionada === opcion.id
                      ? 'border-teal-600 bg-teal-600 text-white shadow-md'
                      : 'border-zinc-200 bg-zinc-50 hover:border-zinc-300 hover:bg-zinc-100 text-zinc-900'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1">
                      <div className="flex flex-wrap items-center gap-2 mb-1.5">
                        <p className={`text-[0.95rem] font-black tracking-tight ${opcionSeleccionada === opcion.id ? 'text-white' : 'text-zinc-900'}`}>{opcion.nombre}</p>
                        {opcion.esRecomendada ? (
                          <span className={`rounded-md px-2 py-0.5 text-[0.6rem] font-black uppercase tracking-widest ${
                            opcionSeleccionada === opcion.id ? 'bg-white text-teal-700' : 'bg-teal-600 text-white'
                          }`}>
                            Priority
                          </span>
                        ) : null}
                      </div>
                      <p className={`text-[0.75rem] font-medium leading-relaxed ${opcionSeleccionada === opcion.id ? 'text-zinc-400' : 'text-zinc-500'}`}>{opcion.descripcion}</p>
                    </div>
                    <div
                      className={`flex h-6 w-6 mt-1 shrink-0 items-center justify-center rounded-full border-2 ${
                        opcionSeleccionada === opcion.id ? 'bg-white border-white' : 'bg-transparent border-zinc-300'
                      }`}
                    >
                      {opcionSeleccionada === opcion.id ? <CheckCircle className="h-5 w-5 text-zinc-900" weight="fill" /> : null}
                    </div>
                  </div>

                  <div className="mt-5 grid grid-cols-2 gap-4">
                    <div>
                      <p className={`text-[0.6rem] font-bold uppercase tracking-widest ${opcionSeleccionada === opcion.id ? 'text-zinc-400' : 'text-zinc-500'}`}>Descuento</p>
                      <p className={`mt-1 text-lg font-black tracking-tight ${opcionSeleccionada === opcion.id ? 'text-rose-400' : 'text-rose-600'}`}>-{opcion.reduccionTotal.toLocaleString()}</p>
                    </div>
                    <div>
                      <p className={`text-[0.6rem] font-bold uppercase tracking-widest ${opcionSeleccionada === opcion.id ? 'text-zinc-400' : 'text-zinc-500'}`}>Defect remanente</p>
                      <p className={`mt-1 text-lg font-black tracking-tight ${
                        opcion.resultadoDeficit === 0 
                          ? opcionSeleccionada === opcion.id ? 'text-white' : 'text-zinc-900' 
                          : opcionSeleccionada === opcion.id ? 'text-amber-400' : 'text-amber-600'
                      }`}>
                        {opcion.resultadoDeficit.toLocaleString()}
                      </p>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </section>

          {opcionActual ? (
            <section className="rounded-[16px] border border-zinc-200 bg-white p-5 shadow-sm">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between mb-5 border-b border-zinc-100 pb-3">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-zinc-50 border border-zinc-200 rounded-lg">
                    <Buildings className="h-4 w-4 text-zinc-900" weight="duotone" />
                  </div>
                  <h3 className="text-[0.85rem] font-bold uppercase tracking-widest text-zinc-900">Jerarquía Distributiva</h3>
                </div>
                <div className="flex flex-wrap gap-2 text-[0.65rem] font-bold uppercase tracking-widest">
                  <span className="rounded-md border border-zinc-200 bg-white px-2.5 py-1 text-zinc-900 shadow-sm">
                    {datos.establecimientosAjustables} Nodos Flex
                  </span>
                  <span className="rounded-md border border-zinc-900 bg-zinc-900 px-2.5 py-1 text-white shadow-sm">
                    {datos.establecimientosBloqueados} Nodos Locked
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
                      className={`overflow-hidden rounded-xl border transition-all ${
                        centro.tieneValeGenerado ? 'border-zinc-300 bg-zinc-50/70 p-1' : 'border-zinc-200 bg-white shadow-sm hover:border-zinc-300 hover:shadow'
                      }`}
                    >
                      <button
                        type="button"
                        onClick={() => toggleCentro(centro.centroAcopioId)}
                        className={`flex w-full items-center justify-between gap-3 px-4 py-3 text-left ${centro.tieneValeGenerado ? 'opacity-80' : ''}`}
                      >
                        <div className="flex items-center gap-4">
                          <div className={`flex h-8 w-8 items-center justify-center rounded-lg ${centro.tieneValeGenerado ? 'bg-zinc-200 text-zinc-500' : 'bg-teal-600 text-white'}`}>
                            {centro.tieneValeGenerado ? <LockKey className="h-4 w-4" weight="fill" /> : <Buildings className="h-4 w-4" weight="duotone" />}
                          </div>
                          <div>
                            <p className="text-[0.85rem] font-black tracking-tight text-zinc-900">{centro.centroAcopioNombre}</p>
                            {centro.tieneValeGenerado ? (
                              <span className="mt-1 inline-flex items-center gap-1 rounded bg-zinc-200 px-1.5 py-0.5 text-[0.6rem] font-bold uppercase tracking-widest text-zinc-700">
                                Ticket Lock: {centro.valeNumero}
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
                        <div className="space-y-1.5 border-t border-zinc-100 bg-zinc-50/50 p-3">
                          {ajustesCentro.map((ajuste) => (
                            <div
                              key={ajuste.movimientoId}
                              className={`rounded-xl border px-4 py-3 flex items-center justify-between transition-colors ${
                                ajuste.bloqueado
                                  ? 'border-zinc-200 bg-zinc-100/50'
                                  : 'border-zinc-200 bg-white hover:border-zinc-300 shadow-sm'
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
                                <span className={`font-black ${ajuste.bloqueado ? 'text-zinc-400' : 'text-zinc-600'}`}>{ajuste.entregaAntes.toLocaleString()}</span>
                                {!ajuste.bloqueado && ajuste.diferencia !== 0 ? (
                                  <>
                                    <span className="text-zinc-300 font-bold">&rarr;</span>
                                    <span className="font-black text-zinc-900">{ajuste.entregaDespues.toLocaleString()}</span>
                                    <span
                                      className={`ml-2 rounded-md border px-2 py-0.5 text-[0.7rem] font-black ${
                                        ajuste.diferencia < 0
                                          ? 'bg-rose-50 text-rose-700 border-rose-200'
                                          : 'bg-teal-600 text-white border-teal-600'
                                      }`}
                                    >
                                      {ajuste.diferencia > 0 ? '+' : ''}
                                      {ajuste.diferencia.toLocaleString()}
                                    </span>
                                  </>
                                ) : (
                                  <span className="ml-2 text-[0.65rem] font-bold uppercase tracking-widest text-zinc-400 border border-zinc-200 bg-zinc-50 px-2 py-0.5 rounded-md">Static</span>
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

              <div className="mt-5 grid gap-4 grid-cols-3 pt-5 border-t border-zinc-100">
                <div className="p-4 rounded-xl border border-zinc-200 bg-zinc-50">
                  <p className="text-[0.65rem] font-bold uppercase tracking-widest text-zinc-500">Base Allocation</p>
                  <p className="mt-1 text-xl font-black tracking-tight text-zinc-900">{opcionActual.totalAntes.toLocaleString()}</p>
                </div>
                <div className="p-4 rounded-xl border border-rose-200 bg-white shadow-sm ring-1 ring-inset ring-rose-50">
                  <p className="text-[0.65rem] font-bold uppercase tracking-widest text-rose-500">Delta</p>
                  <p className="mt-1 text-xl font-black tracking-tight text-rose-600">-{opcionActual.reduccionTotal.toLocaleString()}</p>
                </div>
                <div className="p-4 rounded-xl border border-teal-600 bg-teal-600 shadow-md">
                  <p className="text-[0.65rem] font-bold uppercase tracking-widest text-zinc-400">Target Resolved</p>
                  <p className="mt-1 text-xl font-black tracking-tight text-white">{opcionActual.totalDespues.toLocaleString()}</p>
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
