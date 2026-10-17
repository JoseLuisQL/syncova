import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import {
  ShieldCheck,
  CalendarCheck,
  ArrowSquareOut,
  Timer,
  CaretDown,
  ArrowsClockwise,
} from '@phosphor-icons/react';
import { useToastContext } from '../../contexts/ToastContext';
import {
  PermisoOperativoService,
  TIPOS_PERMISO,
  type PermisosGlobales,
  type TipoPermisoOperativo,
} from '../../services/permisoOperativoService';
import type { DashboardStats } from '../../services/dashboardService';
import { Modal, FormField, ModalFooter } from '../ui/ModalElements';

const MESES = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre',
];

interface PermisosPlanificacionProps {
  stats?: DashboardStats | null;
}

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
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Programar activación"
      subtitle={permisoLabel}
      icon={Timer}
      size="sm"
      footer={
        <ModalFooter
          onCancel={onClose}
          onSubmit={() => {
            if (!fechaActivacion) return;
            onSave(
              new Date(fechaActivacion).toISOString(),
              usarDesactivacion && fechaDesactivacion
                ? new Date(fechaDesactivacion).toISOString()
                : null
            );
            onClose();
          }}
          cancelLabel="Cancelar"
          submitLabel="Guardar programación"
          submitType="button"
          isDisabled={!fechaActivacion}
        />
      }
    >
      <div className="space-y-4">
        <FormField label="Fecha y hora de activación" required>
          <input
            type="datetime-local"
            value={fechaActivacion}
            onChange={(e) => setFechaActivacion(e.target.value)}
            className="h-9 w-full rounded-lg border border-zinc-200/90 bg-white px-3 text-sm text-zinc-900 transition-colors focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/15 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-100"
          />
        </FormField>

        <div className="flex items-center justify-between gap-3 rounded-lg border border-zinc-200/80 bg-zinc-50/70 px-3.5 py-2.5 dark:border-zinc-800 dark:bg-zinc-900/50">
          <span className="text-xs font-medium text-zinc-700 dark:text-zinc-300">
            Programar desactivación automática
          </span>
          <button
            type="button"
            role="switch"
            aria-checked={usarDesactivacion}
            onClick={() => setUsarDesactivacion(!usarDesactivacion)}
            className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-150 focus:outline-none ${
              usarDesactivacion ? 'bg-brand' : 'bg-zinc-300 dark:bg-zinc-700'
            }`}
          >
            <span
              className={`pointer-events-none inline-block h-4 w-4 rounded-full bg-white shadow transition-transform duration-150 ${
                usarDesactivacion ? 'translate-x-4' : 'translate-x-0'
              }`}
            />
          </button>
        </div>

        {usarDesactivacion && (
          <FormField label="Fecha y hora de desactivación">
            <input
              type="datetime-local"
              value={fechaDesactivacion}
              onChange={(e) => setFechaDesactivacion(e.target.value)}
              min={fechaActivacion}
              className="h-9 w-full rounded-lg border border-zinc-200/90 bg-white px-3 text-sm text-zinc-900 transition-colors focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/15 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-100"
            />
          </FormField>
        )}
      </div>
    </Modal>
  );
};

const PermisosPlanificacion: React.FC<PermisosPlanificacionProps> = ({ stats }) => {
  const navigate = useNavigate();
  const [globales, setGlobales] = useState<PermisosGlobales | null>(null);
  const [loading, setLoading] = useState(true);
  const [toggling, setToggling] = useState<string | null>(null);
  const mountedRef = useRef(true);
  const { toast } = useToastContext();

  const [selectedMes, setSelectedMes] = useState(() => new Date().getMonth() + 1);
  const [selectedAnio, setSelectedAnio] = useState(() => new Date().getFullYear());

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
    return () => {
      mountedRef.current = false;
    };
  }, [loadGlobales]);

  const handleToggle = async (tipo: TipoPermisoOperativo, habilitado: boolean) => {
    setToggling(tipo);
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
  const planResumen = stats?.planificacionResumen;

  return (
    <>
      <section className="relative flex h-full flex-col rounded-xl border border-line bg-surface p-5 shadow-xs">
        <div className="mb-3 flex items-start justify-between gap-2">
          <div>
            <h3 className="text-base font-semibold tracking-tight text-ink">
              Permisos y planificación
            </h3>
            <p className="mt-0.5 text-xs text-muted">
              Habilitación mensual de edición operativa
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => void loadGlobales()}
              disabled={loading}
              title="Actualizar estado de permisos"
              className={`rounded-md p-1 text-muted-2 transition-colors hover:bg-surface-soft hover:text-ink ${
                loading ? 'animate-spin' : ''
              }`}
            >
              <ArrowsClockwise size={14} weight="bold" />
            </button>
            <button
              type="button"
              onClick={() => navigate('/usuarios')}
              className="inline-flex items-center gap-1 text-xs font-medium text-brand transition-colors hover:text-brand-600 whitespace-nowrap shrink-0"
            >
              Usuarios
              <ArrowSquareOut size={13} />
            </button>
          </div>
        </div>

        <div className="mb-4 grid grid-cols-12 gap-2">
          <div className="relative col-span-7">
            <select
              value={selectedMes}
              onChange={(e) => setSelectedMes(Number(e.target.value))}
              disabled={loading}
              aria-label="Seleccionar mes de permiso"
              className="w-full appearance-none rounded-lg border border-line bg-surface-soft py-1.5 pl-2.5 pr-7 text-xs font-medium text-ink transition-colors focus:border-brand focus:outline-none disabled:opacity-50"
            >
              {MESES.map((mes, i) => (
                <option key={i} value={i + 1}>
                  {mes}
                </option>
              ))}
            </select>
            <CaretDown
              className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-muted"
              size={12}
              weight="bold"
            />
          </div>
          <div className="relative col-span-5">
            <select
              value={selectedAnio}
              onChange={(e) => setSelectedAnio(Number(e.target.value))}
              disabled={loading}
              aria-label="Seleccionar año de permiso"
              className="w-full appearance-none rounded-lg border border-line bg-surface-soft py-1.5 pl-2.5 pr-7 font-mono text-xs font-medium text-ink tabular-nums transition-colors focus:border-brand focus:outline-none disabled:opacity-50"
            >
              {aniosDisponibles.map((anio) => (
                <option key={anio} value={anio}>
                  {anio}
                </option>
              ))}
            </select>
            <CaretDown
              className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-muted"
              size={12}
              weight="bold"
            />
          </div>
        </div>

        <div className="relative divide-y divide-line-soft border-y border-line-soft">
          {loading && !globales && (
            <div className="absolute inset-0 z-10 flex items-center justify-center bg-surface/60">
              <ArrowsClockwise size={18} className="animate-spin text-brand" />
            </div>
          )}

          <div className="py-3">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2 min-w-0">
                <ShieldCheck size={16} className="shrink-0 text-brand" weight="duotone" />
                <span className="truncate text-sm font-medium text-ink">
                  Edición de Movimientos
                </span>
              </div>
              <button
                type="button"
                role="switch"
                aria-checked={movPermiso?.habilitado ?? false}
                onClick={() =>
                  handleToggle(
                    TIPOS_PERMISO.MOVIMIENTOS_EDICION as TipoPermisoOperativo,
                    !(movPermiso?.habilitado ?? false)
                  )
                }
                disabled={toggling === TIPOS_PERMISO.MOVIMIENTOS_EDICION}
                className={`relative flex h-5 w-9 shrink-0 items-center rounded-full px-0.5 transition-colors disabled:opacity-50 ${
                  movPermiso?.habilitado ? 'bg-emerald-600' : 'bg-line-strong'
                }`}
              >
                <motion.div
                  layout
                  className="h-4 w-4 rounded-full bg-surface shadow-2xs"
                  animate={{ x: movPermiso?.habilitado ? 16 : 0 }}
                  transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                />
              </button>
            </div>

            <div className="mt-1.5 flex items-center justify-between gap-2 pl-6 text-xs text-muted">
              <span>Ingresos, salidas y transferencias</span>
              <button
                type="button"
                onClick={() =>
                  setScheduleModal({
                    isOpen: true,
                    label: 'Edición de Movimientos',
                    tipo: TIPOS_PERMISO.MOVIMIENTOS_EDICION as TipoPermisoOperativo,
                  })
                }
                disabled={toggling === TIPOS_PERMISO.MOVIMIENTOS_EDICION}
                className="inline-flex items-center gap-1 font-medium text-muted-2 transition-colors hover:text-brand whitespace-nowrap shrink-0"
              >
                <Timer size={12} weight="bold" />
                {movPermiso?.programado && movPermiso.fechaActivacion
                  ? new Date(movPermiso.fechaActivacion).toLocaleDateString('es-PE', {
                      day: '2-digit',
                      month: 'short',
                    })
                  : 'Programar'}
              </button>
            </div>
          </div>

          <div className="py-3">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2 min-w-0">
                <CalendarCheck size={16} className="shrink-0 text-brand" weight="duotone" />
                <span className="truncate text-sm font-medium text-ink">
                  Edición de Planificación
                </span>
              </div>
              <button
                type="button"
                role="switch"
                aria-checked={planPermiso?.habilitado ?? false}
                onClick={() =>
                  handleToggle(
                    TIPOS_PERMISO.PLANIFICACION_EDICION as TipoPermisoOperativo,
                    !(planPermiso?.habilitado ?? false)
                  )
                }
                disabled={toggling === TIPOS_PERMISO.PLANIFICACION_EDICION}
                className={`relative flex h-5 w-9 shrink-0 items-center rounded-full px-0.5 transition-colors disabled:opacity-50 ${
                  planPermiso?.habilitado ? 'bg-emerald-600' : 'bg-line-strong'
                }`}
              >
                <motion.div
                  layout
                  className="h-4 w-4 rounded-full bg-surface shadow-2xs"
                  animate={{ x: planPermiso?.habilitado ? 16 : 0 }}
                  transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                />
              </button>
            </div>

            <div className="mt-1.5 flex items-center justify-between gap-2 pl-6 text-xs text-muted">
              <span>Metas y requerimientos anuales</span>
              <button
                type="button"
                onClick={() =>
                  setScheduleModal({
                    isOpen: true,
                    label: 'Edición de Planificación',
                    tipo: TIPOS_PERMISO.PLANIFICACION_EDICION as TipoPermisoOperativo,
                  })
                }
                disabled={toggling === TIPOS_PERMISO.PLANIFICACION_EDICION}
                className="inline-flex items-center gap-1 font-medium text-muted-2 transition-colors hover:text-brand whitespace-nowrap shrink-0"
              >
                <Timer size={12} weight="bold" />
                {planPermiso?.programado && planPermiso.fechaActivacion
                  ? new Date(planPermiso.fechaActivacion).toLocaleDateString('es-PE', {
                      day: '2-digit',
                      month: 'short',
                    })
                  : 'Programar'}
              </button>
            </div>
          </div>
        </div>

        <div className="mt-auto pt-4">
          {planResumen ? (
            <div className="mb-3 rounded-lg border border-line-soft bg-surface-soft/50 p-3">
              <div className="mb-1.5 flex items-center justify-between text-xs">
                <span className="font-medium text-muted-2">
                  Ejecución anual {planResumen.anio}
                </span>
                <span className="font-mono font-semibold text-ink tabular-nums">
                  {planResumen.porcentajeAvance}%
                </span>
              </div>
              <div className="mb-2.5 h-1.5 w-full overflow-hidden rounded-full bg-surface">
                <div
                  className="h-full rounded-full bg-brand transition-all duration-200"
                  style={{ width: `${planResumen.porcentajeAvance}%` }}
                />
              </div>
              <div className="flex items-center justify-between text-xs text-muted">
                <span>
                  Prog:{' '}
                  <strong className="font-mono font-medium text-ink tabular-nums">
                    {planResumen.dosisProgramadas.toLocaleString('es-PE')}
                  </strong>
                </span>
                <span aria-hidden="true">·</span>
                <span>
                  Entregado:{' '}
                  <strong className="font-mono font-medium text-ink tabular-nums">
                    {planResumen.dosisEjecutadas.toLocaleString('es-PE')}
                  </strong>
                </span>
              </div>
            </div>
          ) : (
            <div className="mb-3 flex items-center justify-between text-xs text-muted">
              <span>Establecimientos activos</span>
              <span className="font-mono font-semibold text-ink tabular-nums">
                {stats?.totalEstablecimientos ?? 0}
              </span>
            </div>
          )}

          <button
            type="button"
            onClick={() => navigate('/planificacion')}
            className="flex w-full items-center justify-center gap-2 rounded-lg border border-brand bg-brand px-4 py-2 text-xs font-semibold text-white transition-colors hover:bg-brand-600 whitespace-nowrap shrink-0"
          >
            <CalendarCheck size={15} weight="bold" />
            Abrir Planificación Anual
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
