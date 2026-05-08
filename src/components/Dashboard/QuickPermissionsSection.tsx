import React, { memo, useState, useEffect, useCallback, useRef } from 'react';
import {
  ShieldCheck,
  Table,
  Pencil,
  Timer,
  Clock,
  CaretDown,
  ArrowsClockwise,
  X,
} from '@phosphor-icons/react';
import { motion } from 'framer-motion';
import { useToastContext } from '../../contexts/ToastContext';
import {
  PermisoOperativoService,
  TIPOS_PERMISO,
  type PermisosGlobales,
  type TipoPermisoOperativo,
} from '../../services/permisoOperativoService';

// ===== Config =====
const MESES = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre',
];

const PERMISO_CONFIG = [
  {
    tipo: TIPOS_PERMISO.MOVIMIENTOS_EDICION as TipoPermisoOperativo,
    label: 'Editar Movimientos',
    description: 'Trans. Ingreso, Salida, Trans. Salida',
    icon: Table,
    colorActive: 'bg-emerald-500',
    colorIcon: {
      on: 'bg-emerald-100 text-emerald-700',
      off: 'bg-zinc-100 text-zinc-400',
    },
    borderOn: 'border-emerald-200 bg-emerald-50/40',
  },
  {
    tipo: TIPOS_PERMISO.PLANIFICACION_EDICION as TipoPermisoOperativo,
    label: 'Editar Planificaciones',
    description: 'Modificar planificaciones anuales',
    icon: Pencil,
    colorActive: 'bg-blue-500',
    colorIcon: {
      on: 'bg-blue-100 text-blue-700',
      off: 'bg-zinc-100 text-zinc-400',
    },
    borderOn: 'border-blue-200 bg-blue-50/40',
  },
];

// ===== Toggle Switch =====
const ToggleSwitch: React.FC<{
  checked: boolean;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
  colorClass?: string;
}> = ({ checked, onChange, disabled, colorClass = 'bg-emerald-500' }) => (
  <button
    type="button"
    role="switch"
    aria-checked={checked}
    disabled={disabled}
    onClick={() => onChange(!checked)}
    className={`
      relative inline-flex w-11 h-6 shrink-0 cursor-pointer rounded-full
      border-2 border-transparent transition-colors duration-200 ease-in-out
      focus:outline-none focus:ring-2 focus:ring-zinc-400 focus:ring-offset-2
      disabled:opacity-50 disabled:cursor-not-allowed
      ${checked ? colorClass : 'bg-zinc-200'}
    `}
  >
    <span
      className={`
        pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow-lg
        ring-0 transition-transform duration-200 ease-in-out
        ${checked ? 'translate-x-5' : 'translate-x-0'}
      `}
    />
  </button>
);

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
      className="fixed inset-0 z-[300] flex items-center justify-center bg-[#111318]/20 p-4 backdrop-blur-[2px]"
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="w-full max-w-md overflow-hidden rounded-[10px] border border-[#e7e7ef] bg-white shadow-[0_22px_54px_-38px_rgba(12,15,24,0.55)]"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-[#eeeef3] px-5 py-3.5">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-[7px] border border-[#e7e7ef] bg-[#fbfafd] text-[#606571]">
              <Timer className="h-4 w-4" />
            </div>
            <div>
              <h3 className="text-[15px] font-semibold leading-5 text-[#15171d]">Programar activación</h3>
              <p className="text-[12px] leading-4 text-[#606571]">{permisoLabel}</p>
            </div>
          </div>
          <button onClick={onClose} className="rounded-[7px] p-1.5 text-[#8b8f9b] transition-colors hover:bg-[#fbfafd] hover:text-[#15171d]">
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="space-y-4 px-5 py-4">
          <div>
            <label className="mb-1.5 block text-[12px] font-medium text-[#424750]">
              Fecha y hora de activación
            </label>
            <input
              type="datetime-local"
              value={fechaActivacion}
              onChange={(e) => setFechaActivacion(e.target.value)}
              className="min-h-9 w-full rounded-[7px] border border-[#e7e7ef] bg-white px-3 py-2 text-[13px] text-[#15171d] focus:border-[#babdca] focus:outline-none focus:ring-2 focus:ring-[#dedfea]/70"
            />
          </div>

          <div className="flex items-center gap-3">
            <ToggleSwitch
              checked={usarDesactivacion}
              onChange={setUsarDesactivacion}
              colorClass="bg-[#7c3aed]"
            />
            <span className="text-sm text-zinc-700">Programar desactivación automática</span>
          </div>

          {usarDesactivacion && (
            <div>
              <label className="mb-1.5 block text-[12px] font-medium text-[#424750]">
                Fecha y hora de desactivación
              </label>
              <input
                type="datetime-local"
                value={fechaDesactivacion}
                onChange={(e) => setFechaDesactivacion(e.target.value)}
                min={fechaActivacion}
                className="min-h-9 w-full rounded-[7px] border border-[#e7e7ef] bg-white px-3 py-2 text-[13px] text-[#15171d] focus:border-[#babdca] focus:outline-none focus:ring-2 focus:ring-[#dedfea]/70"
              />
            </div>
          )}
        </div>

        <div className="flex items-center justify-end gap-2 border-t border-[#eeeef3] bg-[#fbfafd] px-5 py-3">
          <button
            onClick={onClose}
            className="inline-flex h-9 items-center gap-1.5 rounded-[7px] border border-[#e7e7ef] bg-white px-3.5 text-[13px] font-semibold text-[#15171d] transition-colors hover:bg-white"
          >
            Cancelar
          </button>
          <button
            onClick={() => {
              if (!fechaActivacion) return;
              onSave(
                new Date(fechaActivacion).toISOString(),
                usarDesactivacion && fechaDesactivacion ? new Date(fechaDesactivacion).toISOString() : null,
              );
              onClose();
            }}
            disabled={!fechaActivacion}
            className="inline-flex h-9 items-center gap-1.5 rounded-[7px] bg-[#7c3aed] px-3.5 text-[13px] font-semibold text-white transition-colors hover:bg-[#6d28d9] disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Timer className="h-3.5 w-3.5" />
            Programar
          </button>
        </div>
      </motion.div>
    </div>
  );
};

// ===== Main Component =====
const QuickPermissionsSection: React.FC = memo(() => {
  const [globales, setGlobales] = useState<PermisosGlobales | null>(null);
  const [loading, setLoading] = useState(true);
  const [toggling, setToggling] = useState<string | null>(null);
  const mountedRef = useRef(true);

  const [selectedMes, setSelectedMes] = useState(() => {
    const mesActual = new Date().getMonth() + 1;
    return mesActual === 1 ? 12 : mesActual - 1;
  });
  const [selectedAnio, setSelectedAnio] = useState(() => {
    const mesActual = new Date().getMonth() + 1;
    const anioActual = new Date().getFullYear();
    return mesActual === 1 ? anioActual - 1 : anioActual;
  });

  const [scheduleModal, setScheduleModal] = useState<{
    isOpen: boolean;
    tipo: TipoPermisoOperativo;
    label: string;
  } | null>(null);

  const { toast } = useToastContext();

  const aniosDisponibles = (() => {
    const currentYear = new Date().getFullYear();
    return [currentYear - 1, currentYear, currentYear + 1];
  })();

  const loadGlobales = useCallback(async () => {
    try {
      setLoading(true);
      const result = await PermisoOperativoService.getResponsablesConPermisos(selectedMes, selectedAnio);
      if (mountedRef.current) {
        setGlobales(result.globales);
      }
    } catch (err) {
      if (mountedRef.current) {
        const msg = err instanceof Error ? err.message : 'Error al cargar permisos';
        toast.error(msg);
      }
    } finally {
      if (mountedRef.current) {
        setLoading(false);
      }
    }
  }, [selectedMes, selectedAnio, toast]);

  useEffect(() => {
    mountedRef.current = true;
    void loadGlobales();
    return () => { mountedRef.current = false; };
  }, [loadGlobales]);

  const handleToggle = async (tipo: TipoPermisoOperativo, habilitado: boolean) => {
    const key = `${tipo}-global`;
    setToggling(key);
    try {
      await PermisoOperativoService.togglePermiso({
        tipo,
        mes: selectedMes,
        anio: selectedAnio,
        habilitado,
        usuarioId: null,
      });
      await loadGlobales();
      toast.success(habilitado ? 'Permiso habilitado' : 'Permiso deshabilitado');
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Error al cambiar permiso';
      toast.error(msg);
    } finally {
      setToggling(null);
    }
  };

  const handleSchedule = async (
    tipo: TipoPermisoOperativo,
    fechaActivacion: string,
    fechaDesactivacion: string | null,
  ) => {
    try {
      await PermisoOperativoService.togglePermiso({
        tipo,
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
      const msg = err instanceof Error ? err.message : 'Error al programar permiso';
      toast.error(msg);
    }
  };

  // Skeleton while loading
  if (loading && !globales) {
    return (
      <section className="bg-white rounded-2xl border border-zinc-200/60 shadow-sm p-6">
        <div className="animate-pulse space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-zinc-100" />
            <div className="space-y-2">
              <div className="h-4 w-48 bg-zinc-100 rounded-lg" />
              <div className="h-3 w-72 bg-zinc-50 rounded-lg" />
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
            <div className="h-[100px] bg-zinc-50 rounded-xl border border-zinc-100" />
            <div className="h-[100px] bg-zinc-50 rounded-xl border border-zinc-100" />
          </div>
        </div>
      </section>
    );
  }

  return (
    <>
      <motion.section
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, ease: [0.25, 0.1, 0.25, 1] }}
        className="bg-white rounded-[24px] border border-zinc-200/60 shadow-sm overflow-hidden hover:shadow-[0_8px_30px_rgb(0,0,0,0.04)] transition-all duration-300"
        aria-label="Permisos operativos globales"
      >
        {/* ═══ Header ═══ */}
        <header className="px-6 py-4 border-b border-zinc-100 bg-zinc-50/50">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-[14px] bg-teal-600 flex items-center justify-center shadow-sm">
                <ShieldCheck className="h-5 w-5 text-white" weight="bold" />
              </div>
              <div>
                <h3 className="text-[15px] font-extrabold text-zinc-900 tracking-tight">
                  Permisos Globales
                </h3>
                <p className="text-[12px] font-medium text-zinc-400 mt-0.5">
                  Aplican a todos los responsables de acopio
                </p>
              </div>
            </div>

            {/* Period Selector */}
            <div className="flex items-center gap-2">
              <div className="relative">
                <select
                  value={selectedMes}
                  onChange={(e) => setSelectedMes(Number(e.target.value))}
                  className="appearance-none rounded-lg border border-zinc-200 bg-white pl-3 pr-8 py-2 text-[13px] font-medium text-zinc-700 hover:border-zinc-300 focus:outline-none focus:ring-2 focus:ring-zinc-400 transition-colors"
                >
                  {MESES.map((mes, i) => (
                    <option key={i} value={i + 1}>{mes}</option>
                  ))}
                </select>
                <CaretDown className="pointer-events-none absolute right-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-zinc-400" />
              </div>

              <div className="relative">
                <select
                  value={selectedAnio}
                  onChange={(e) => setSelectedAnio(Number(e.target.value))}
                  className="appearance-none rounded-lg border border-zinc-200 bg-white pl-3 pr-8 py-2 text-[13px] font-medium text-zinc-700 hover:border-zinc-300 focus:outline-none focus:ring-2 focus:ring-zinc-400 transition-colors"
                >
                  {aniosDisponibles.map(anio => (
                    <option key={anio} value={anio}>{anio}</option>
                  ))}
                </select>
                <CaretDown className="pointer-events-none absolute right-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-zinc-400" />
              </div>

              <button
                onClick={() => void loadGlobales()}
                disabled={loading}
                className="flex items-center justify-center p-2 rounded-lg border border-zinc-200 bg-white text-zinc-500 hover:text-zinc-900 hover:border-zinc-300 disabled:opacity-50 transition-all"
                aria-label="Recargar permisos"
              >
                <ArrowsClockwise className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} weight="bold" />
              </button>
            </div>
          </div>
        </header>

        {/* ═══ Permission Cards ═══ */}
        <div className="p-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {PERMISO_CONFIG.map((config) => {
              const permiso = globales?.[config.tipo as keyof PermisosGlobales];
              const isToggling = toggling === `${config.tipo}-global`;
              const isEnabled = permiso?.habilitado ?? false;
              const Icon = config.icon;

              return (
                <motion.div
                  key={config.tipo}
                  whileHover={{ y: -1 }}
                  transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                  className={`
                    rounded-xl border p-5 transition-all duration-200
                    ${isEnabled ? config.borderOn : 'border-zinc-200 bg-zinc-50/30'}
                  `}
                >
                  {/* Top: Icon + Switch */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className={`
                        flex h-10 w-10 items-center justify-center rounded-xl transition-colors duration-200
                        ${isEnabled ? config.colorIcon.on : config.colorIcon.off}
                      `}>
                        <Icon className="h-5 w-5" weight="fill" />
                      </div>
                      <div>
                        <p className="text-[14px] font-bold text-zinc-900 tracking-tight">{config.label}</p>
                        <p className="text-[12px] font-medium text-zinc-500 mt-0.5">{config.description}</p>
                      </div>
                    </div>

                    <ToggleSwitch
                      checked={isEnabled}
                      onChange={(checked) => void handleToggle(config.tipo, checked)}
                      disabled={isToggling}
                      colorClass={config.colorActive}
                    />
                  </div>

                  {/* Bottom: Schedule button + scheduled info */}
                  <div className="mt-4 flex items-center gap-2">
                    <button
                      onClick={() => setScheduleModal({
                        isOpen: true,
                        tipo: config.tipo,
                        label: `${config.label} (Global)`,
                      })}
                      className="inline-flex items-center gap-1.5 rounded-lg border border-zinc-200 bg-white px-2.5 py-1.5 text-[11px] font-bold text-zinc-500 hover:bg-zinc-50 hover:text-zinc-800 transition-colors uppercase tracking-wider"
                    >
                      <Timer className="h-3.5 w-3.5" />
                      Programar
                    </button>

                    {permiso?.programado && permiso.fechaActivacion && (
                      <div className="inline-flex items-center gap-1 rounded-lg bg-amber-50 border border-amber-200 px-2 py-1 text-[11px] font-bold text-amber-700">
                        <Clock className="h-3 w-3" />
                        <span>
                          {new Date(permiso.fechaActivacion).toLocaleString('es-PE', {
                            day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit',
                          })}
                        </span>
                      </div>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </motion.section>

      {/* ═══ Schedule Modal ═══ */}
      {scheduleModal && (
        <ScheduleModal
          isOpen={scheduleModal.isOpen}
          onClose={() => setScheduleModal(null)}
          permisoLabel={scheduleModal.label}
          onSave={(fechaAct, fechaDesact) => {
            void handleSchedule(scheduleModal.tipo, fechaAct, fechaDesact);
          }}
        />
      )}
    </>
  );
});

QuickPermissionsSection.displayName = 'QuickPermissionsSection';

export default QuickPermissionsSection;
