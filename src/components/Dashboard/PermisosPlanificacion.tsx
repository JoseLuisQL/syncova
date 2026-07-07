import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShieldCheck, CalendarCheck, ArrowSquareOut, Timer, X, CaretDown, ArrowsClockwise } from '@phosphor-icons/react';
import { useToastContext } from '../../contexts/ToastContext';
import {
  PermisoOperativoService,
  TIPOS_PERMISO,
  type PermisosGlobales,
  type TipoPermisoOperativo,
} from '../../services/permisoOperativoService';

const MESES = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre',
];

// ===== Schedule Modal =====
const ScheduleModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  onSave: (fechaActivacion: string, fechaDesactivacion: string | null) => void;
  permisoLabel: string;
}> = ({ isOpen, onClose, onSave, permisoLabel }) => {
  const [fechaActivacion, setFechaActivacion] = useState('');
  const [fechaDesactivacion, setFechaDesactivacion] = useState('');
  const [usarDesactivacion, setUsarDesactivacion] = useState(false);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[300] flex items-center justify-center bg-ink-soft/20 p-4 backdrop-blur-[2px]"
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="flex w-full max-w-md flex-col overflow-hidden rounded-lg border border-line bg-white shadow-[0_22px_54px_-38px_rgba(12,15,24,0.55)]"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-line-soft px-5 py-3.5">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-[7px] border border-line bg-surface-soft text-muted-2">
              <Timer className="h-4 w-4" weight="bold" />
            </div>
            <div>
              <h3 className="text-md font-semibold leading-5 text-ink">Programar activación</h3>
              <p className="text-sm leading-4 text-muted-2">{permisoLabel}</p>
            </div>
          </div>
          <button type="button" onClick={onClose} className="rounded-[7px] p-1.5 text-muted transition-colors hover:bg-surface-soft hover:text-ink">
            <X className="h-4 w-4" weight="bold" />
          </button>
        </div>

        <div className="space-y-4 px-5 py-4">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-[#424750]">
              Fecha y hora de activación
            </label>
            <input
              type="datetime-local"
              value={fechaActivacion}
              onChange={(e) => setFechaActivacion(e.target.value)}
              className="min-h-9 w-full rounded-[7px] border border-line bg-white px-3 py-2 text-base text-ink transition-colors focus:border-line-focus-strong focus:outline-none focus:ring-2 focus:ring-line-focus/70"
            />
          </div>

          <div className="flex items-center gap-3 rounded-md border border-line bg-surface-soft p-3">
            <button
              type="button"
              role="switch"
              aria-checked={usarDesactivacion}
              onClick={() => setUsarDesactivacion(!usarDesactivacion)}
              className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${usarDesactivacion ? 'bg-tertiary' : 'bg-zinc-300'}`}
            >
              <span className={`pointer-events-none inline-block h-4 w-4 rounded-full bg-white shadow ring-0 transition-transform duration-200 ease-in-out ${usarDesactivacion ? 'translate-x-4' : 'translate-x-0'}`} />
            </button>
            <span className="text-base font-semibold text-primary">Programar desactivación automática</span>
          </div>

          {usarDesactivacion && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}>
              <label className="mb-1.5 block text-sm font-medium text-[#424750]">
                Fecha y hora de desactivación
              </label>
              <input
                type="datetime-local"
                value={fechaDesactivacion}
                onChange={(e) => setFechaDesactivacion(e.target.value)}
                min={fechaActivacion}
                className="min-h-9 w-full rounded-[7px] border border-line bg-white px-3 py-2 text-base text-ink transition-colors focus:border-line-focus-strong focus:outline-none focus:ring-2 focus:ring-line-focus/70"
              />
            </motion.div>
          )}
        </div>

        <div className="mt-auto flex items-center justify-end gap-2 border-t border-line-soft bg-surface-soft px-5 py-3">
          <button type="button"
            onClick={onClose}
            className="inline-flex h-9 items-center justify-center rounded-[7px] border border-line bg-white px-3.5 text-base font-semibold text-ink transition-colors hover:bg-white"
          >
            Cancelar
          </button>
          <button type="button"
            onClick={() => {
              if (!fechaActivacion) return;
              onSave(
                new Date(fechaActivacion).toISOString(),
                usarDesactivacion && fechaDesactivacion ? new Date(fechaDesactivacion).toISOString() : null,
              );
              onClose();
            }}
            disabled={!fechaActivacion}
            className="inline-flex h-9 items-center justify-center gap-1.5 rounded-[7px] border border-brand bg-brand px-3.5 text-base font-semibold text-white transition-colors hover:bg-brand-600 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Timer className="h-4 w-4" weight="bold" />
            Programar
          </button>
        </div>
      </motion.div>
    </div>
  );
};

const PermisosPlanificacion: React.FC = () => {
  const [globales, setGlobales] = useState<PermisosGlobales | null>(null);
  const [loading, setLoading] = useState(true);
  const [toggling, setToggling] = useState<string | null>(null);
  const mountedRef = useRef(true);
  const { toast } = useToastContext();

  const [selectedMes, setSelectedMes] = useState(() => {
    const mesActual = new Date().getMonth() + 1;
    return mesActual === 1 ? 12 : mesActual - 1;
  });
  const [selectedAnio, setSelectedAnio] = useState(() => {
    const mesActual = new Date().getMonth() + 1;
    const anioActual = new Date().getFullYear();
    return mesActual === 1 ? anioActual - 1 : anioActual;
  });

  const aniosDisponibles = (() => {
    const currentYear = new Date().getFullYear();
    return [currentYear - 1, currentYear, currentYear + 1];
  })();

  const loadGlobales = useCallback(async () => {
    try {
      setLoading(true);
      const result = await PermisoOperativoService.getResponsablesConPermisos(selectedMes, selectedAnio);
      if (mountedRef.current) setGlobales(result.globales);
    } catch (err) {
      if (mountedRef.current) {
        toast.error(err instanceof Error ? err.message : 'Error al cargar permisos');
      }
    } finally {
      if (mountedRef.current) setLoading(false);
    }
  }, [selectedMes, selectedAnio, toast]);

  useEffect(() => {
    mountedRef.current = true;
    void loadGlobales();
    return () => { mountedRef.current = false; };
  }, [loadGlobales]);

  const handleToggle = async (tipo: TipoPermisoOperativo, habilitado: boolean) => {
    setToggling(tipo);
    try {
      await PermisoOperativoService.togglePermiso({ tipo, mes: selectedMes, anio: selectedAnio, habilitado, usuarioId: null });
      await loadGlobales();
      toast.success(habilitado ? 'Permiso habilitado' : 'Permiso deshabilitado');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Error al cambiar permiso');
    } finally {
      setToggling(null);
    }
  };

  const [scheduleModal, setScheduleModal] = useState<{
    isOpen: boolean;
    label: string;
    tipo: TipoPermisoOperativo;
  } | null>(null);

  const handleSaveSchedule = async (fechaActivacion: string, fechaDesactivacion: string | null) => {
    if (!scheduleModal) return;
    try {
      await PermisoOperativoService.togglePermiso({
        tipo: scheduleModal.tipo,
        mes: selectedMes,
        anio: selectedAnio,
        habilitado: true,
        usuarioId: null,
        programado: true,
        fechaActivacion,
        fechaDesactivacion,
      });
      await loadGlobales();
      toast.success('Permiso programado correctamente');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Error al programar permiso');
    }
  };

  const movPermiso = globales?.[TIPOS_PERMISO.MOVIMIENTOS_EDICION as keyof PermisosGlobales];
  const planPermiso = globales?.[TIPOS_PERMISO.PLANIFICACION_EDICION as keyof PermisosGlobales];

  return (
    <>
      <section className="relative flex h-full flex-col rounded-3xl border border-[#e3e9f0] bg-white p-5 shadow-[0_16px_40px_-34px_rgba(15,42,59,0.55)]">
        <div className="mb-7">
          <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.14em] text-[#9aa4b2]">Control</p>
          <h3 className="mt-1 text-md font-semibold tracking-[-0.02em] text-[#171b22]">Permisos y planificación</h3>
        </div>

        <div className="flex items-center justify-between mb-3">
          <h4 className="text-base font-semibold text-primary">Mis permisos de acceso</h4>
          <div className="flex items-center gap-2">
            <button type="button" 
              onClick={() => void loadGlobales()}
              disabled={loading}
              className={`text-secondary transition-colors hover:text-primary ${loading ? 'animate-spin' : ''}`}
            >
              <ArrowsClockwise size={14} weight="bold" />
            </button>
            <button type="button" className="flex items-center gap-1 text-sm font-semibold text-tertiary hover:text-primary">
              Gestionar <ArrowSquareOut size={14} />
            </button>
          </div>
        </div>

        <div className="flex items-center gap-2 mb-6">
          <div className="relative flex-1">
            <select
              value={selectedMes}
              onChange={(e) => setSelectedMes(Number(e.target.value))}
              disabled={loading}
              className="w-full appearance-none rounded-[12px] border border-[#e3e9f0] bg-[#f8fbfd] py-1.5 pl-3 pr-8 text-sm font-semibold text-[#171b22] transition-colors focus:border-[#0e9f8e] focus:outline-none disabled:opacity-50"
            >
              {MESES.map((mes, i) => (
                <option key={i} value={i + 1}>{mes}</option>
              ))}
            </select>
            <CaretDown className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-zinc-400" size={12} weight="bold" />
          </div>
          <div className="relative flex-[0.7]">
            <select
              value={selectedAnio}
              onChange={(e) => setSelectedAnio(Number(e.target.value))}
              disabled={loading}
              className="w-full appearance-none rounded-[12px] border border-[#e3e9f0] bg-[#f8fbfd] py-1.5 pl-3 pr-8 text-sm font-semibold text-[#171b22] transition-colors focus:border-[#0e9f8e] focus:outline-none disabled:opacity-50"
            >
              {aniosDisponibles.map(anio => (
                <option key={anio} value={anio}>{anio}</option>
              ))}
            </select>
            <CaretDown className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-zinc-400" size={12} weight="bold" />
          </div>
        </div>

        <div className="space-y-6 mb-8 relative">
          {loading && !globales && (
            <div className="absolute inset-0 bg-white/50 backdrop-blur-[1px] z-10 flex items-center justify-center">
              <ArrowsClockwise size={20} className="animate-spin text-tertiary" />
            </div>
          )}
          <div className={`flex items-start gap-3 transition-opacity ${loading ? 'opacity-50' : 'opacity-100'}`}>
            <div className="mt-1 rounded-[12px] border border-[#e3e9f0] bg-[#f8fbfd] p-2">
              <ShieldCheck size={16} className="text-secondary" />
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <h5 className="text-base font-semibold text-primary">Editar Movimientos</h5>
                <button type="button" 
                  onClick={() => handleToggle(TIPOS_PERMISO.MOVIMIENTOS_EDICION as TipoPermisoOperativo, !(movPermiso?.habilitado ?? false))}
                  disabled={toggling === TIPOS_PERMISO.MOVIMIENTOS_EDICION}
                  className={`relative flex h-5 w-9 items-center rounded-full px-0.5 transition-colors disabled:opacity-50 ${movPermiso?.habilitado ? 'bg-[#0e9f8e]' : 'bg-zinc-200'}`}
                >
                  <motion.div 
                    layout
                    className="w-4 h-4 bg-white rounded-full shadow-sm"
                    animate={{ x: movPermiso?.habilitado ? 16 : 0 }}
                    transition={{ type: "spring", stiffness: 500, damping: 30 }}
                  />
                </button>
              </div>
              <p className="mb-2 text-xs text-secondary">Trans., Ingreso, Salida, Trans. Salida</p>
              
              <div className="flex items-center gap-3">
                <button type="button" 
                  onClick={() => setScheduleModal({ isOpen: true, label: 'Editar Movimientos', tipo: TIPOS_PERMISO.MOVIMIENTOS_EDICION as TipoPermisoOperativo })}
                  disabled={toggling === TIPOS_PERMISO.MOVIMIENTOS_EDICION}
                  className="flex items-center gap-1 rounded-lg border border-[#e3e9f0] bg-[#f8fbfd] px-2 py-1 text-xs font-semibold text-[#0e9f8e] transition-colors hover:text-[#0a8276] disabled:opacity-50"
                >
                  <Timer size={13} weight="bold" /> Programar
                </button>
                {movPermiso?.programado && movPermiso.fechaActivacion && (
                  <span className="border border-zinc-200 bg-neutral px-2 py-1 font-mono text-[10px] font-semibold text-secondary">
                    Prog: {new Date(movPermiso.fechaActivacion).toLocaleString('es-PE', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className={`flex items-start gap-3 transition-opacity ${loading ? 'opacity-50' : 'opacity-100'}`}>
            <div className="mt-1 rounded-[12px] border border-[#e3e9f0] bg-[#f8fbfd] p-2">
              <CalendarCheck size={16} className="text-secondary" />
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <h5 className="text-base font-semibold text-primary">Editar Planificaciones</h5>
                <button type="button" 
                  onClick={() => handleToggle(TIPOS_PERMISO.PLANIFICACION_EDICION as TipoPermisoOperativo, !(planPermiso?.habilitado ?? false))}
                  disabled={toggling === TIPOS_PERMISO.PLANIFICACION_EDICION}
                  className={`relative flex h-5 w-9 items-center rounded-full px-0.5 transition-colors disabled:opacity-50 ${planPermiso?.habilitado ? 'bg-[#0e9f8e]' : 'bg-zinc-200'}`}
                >
                  <motion.div 
                    layout
                    className="w-4 h-4 bg-white rounded-full shadow-sm"
                    animate={{ x: planPermiso?.habilitado ? 16 : 0 }}
                    transition={{ type: "spring", stiffness: 500, damping: 30 }}
                  />
                </button>
              </div>
              <p className="mb-2 text-xs text-secondary">Modificar planificaciones anuales</p>
              
              <div className="flex items-center gap-3">
                <button type="button" 
                  onClick={() => setScheduleModal({ isOpen: true, label: 'Editar Planificaciones', tipo: TIPOS_PERMISO.PLANIFICACION_EDICION as TipoPermisoOperativo })}
                  disabled={toggling === TIPOS_PERMISO.PLANIFICACION_EDICION}
                  className="flex items-center gap-1 rounded-lg border border-[#e3e9f0] bg-[#f8fbfd] px-2 py-1 text-xs font-semibold text-[#0e9f8e] transition-colors hover:text-[#0a8276] disabled:opacity-50"
                >
                  <Timer size={13} weight="bold" /> Programar
                </button>
                {planPermiso?.programado && planPermiso.fechaActivacion && (
                  <span className="border border-zinc-200 bg-neutral px-2 py-1 font-mono text-[10px] font-semibold text-secondary">
                    Prog: {new Date(planPermiso.fechaActivacion).toLocaleString('es-PE', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="mt-auto">
          <h4 className="mb-2 text-base font-semibold text-primary">Planificación anual 2026</h4>
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs font-medium text-secondary">Estado general</span>
            <span className="font-mono text-sm font-semibold text-primary">64%</span>
          </div>
          
          <div className="mb-4 h-1.5 w-full overflow-hidden rounded-full bg-[#eef3f6]">
            <div className="h-full rounded-full bg-[#0e9f8e]" style={{ width: '64%' }} />
          </div>

          <div className="grid grid-cols-3 gap-2 mb-6 text-center">
            <div>
              <div className="font-mono text-md font-semibold text-primary">128</div>
              <div className="text-[10px] font-medium uppercase text-secondary">Programado</div>
            </div>
            <div>
              <div className="font-mono text-md font-semibold text-primary">82</div>
              <div className="text-[10px] font-medium uppercase text-secondary">Ejecutado</div>
            </div>
            <div>
              <div className="font-mono text-md font-semibold text-primary">46</div>
              <div className="text-[10px] font-medium uppercase text-secondary">Pendiente</div>
            </div>
          </div>

          <button type="button" className="flex w-full items-center justify-center gap-2 rounded-[12px] border border-[#0a8276] bg-[#0e9f8e] py-2.5 text-base font-semibold text-white transition-colors hover:bg-[#0a8276]">
            <CalendarCheck size={16} />
            Abrir planificación
          </button>
        </div>
      </section>

      <AnimatePresence>
        {scheduleModal && (
          <ScheduleModal
            isOpen={scheduleModal.isOpen}
            onClose={() => setScheduleModal(null)}
            permisoLabel={scheduleModal.label}
            onSave={handleSaveSchedule}
          />
        )}
      </AnimatePresence>
    </>
  );
};

export default PermisosPlanificacion;
