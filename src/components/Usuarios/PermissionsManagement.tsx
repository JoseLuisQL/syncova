import React, { useCallback, useEffect, useState } from 'react';
import {
  ArrowsClockwise,
  CalendarBlank,
  CaretDown,
  Clock,
  Export,
  Pencil,
  ShieldCheck,
  Table,
  Timer,
  User,
  Users,
  X,
} from '@phosphor-icons/react';
import { useToastContext } from '../../contexts/ToastContext';
import {
  PermisoOperativoService,
  TIPOS_PERMISO,
  type UsuarioConPermisos,
  type PermisosGlobales,
  type TipoPermisoOperativo,
} from '../../services/permisoOperativoService';
import { COMPONENT_STYLES } from './constants';

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
    colorBadge: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  },
  {
    tipo: TIPOS_PERMISO.PLANIFICACION_EDICION as TipoPermisoOperativo,
    label: 'Editar Planificaciones',
    description: 'Modificar planificaciones anuales',
    icon: Pencil,
    colorActive: 'bg-blue-500',
    colorBadge: 'bg-blue-50 text-blue-700 border-blue-200',
  },
  {
    tipo: TIPOS_PERMISO.EXPORTAR_EXCEL as TipoPermisoOperativo,
    label: 'Exportar Excel',
    description: 'Descargar reportes en Excel',
    icon: Export,
    colorActive: 'bg-amber-500',
    colorBadge: 'bg-amber-50 text-amber-700 border-amber-200',
  },
];

// ===== Switch Component =====
const ToggleSwitch: React.FC<{
  checked: boolean;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
  size?: 'sm' | 'md';
  colorClass?: string;
}> = ({ checked, onChange, disabled, size = 'md', colorClass = 'bg-emerald-500' }) => {
  const w = size === 'sm' ? 'w-9' : 'w-11';
  const h = size === 'sm' ? 'h-5' : 'h-6';
  const dot = size === 'sm' ? 'h-3.5 w-3.5' : 'h-5 w-5';
  const translate = size === 'sm' ? 'translate-x-4' : 'translate-x-5';

  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      disabled={disabled}
      onClick={() => onChange(!checked)}
      className={`
        relative inline-flex ${w} ${h} shrink-0 cursor-pointer rounded-full
        border-2 border-transparent transition-colors duration-200 ease-in-out
        focus:outline-none focus:ring-2 focus:ring-zinc-400 focus:ring-offset-2
        disabled:opacity-50 disabled:cursor-not-allowed
        ${checked ? colorClass : 'bg-zinc-200'}
      `}
    >
      <span
        className={`
          pointer-events-none inline-block ${dot} rounded-full bg-white shadow-lg
          ring-0 transition-transform duration-200 ease-in-out
          ${checked ? translate : 'translate-x-0'}
        `}
      />
    </button>
  );
};

// ===== Scheduling Modal =====
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
    <div className={COMPONENT_STYLES.modal.overlay} onClick={onClose}>
      <div className="bg-white rounded-xl max-w-md w-full shadow-2xl ring-1 ring-zinc-200" onClick={e => e.stopPropagation()}>
        <div className={COMPONENT_STYLES.modal.header}>
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-zinc-100 text-zinc-700">
              <Timer className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-zinc-900">Programar activación</h3>
              <p className="text-xs text-zinc-500">{permisoLabel}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-md text-zinc-400 hover:text-zinc-600 hover:bg-zinc-100 transition-colors">
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="px-5 py-5 space-y-4">
          <div>
            <label className="block text-sm font-medium text-zinc-700 mb-1.5">
              Fecha y hora de activación
            </label>
            <input
              type="datetime-local"
              value={fechaActivacion}
              onChange={(e) => setFechaActivacion(e.target.value)}
              className={`${COMPONENT_STYLES.input.base} ${COMPONENT_STYLES.input.normal}`}
            />
          </div>

          <div className="flex items-center gap-3">
            <ToggleSwitch
              checked={usarDesactivacion}
              onChange={setUsarDesactivacion}
              size="sm"
              colorClass="bg-zinc-700"
            />
            <span className="text-sm text-zinc-700">Programar desactivación automática</span>
          </div>

          {usarDesactivacion && (
            <div>
              <label className="block text-sm font-medium text-zinc-700 mb-1.5">
                Fecha y hora de desactivación
              </label>
              <input
                type="datetime-local"
                value={fechaDesactivacion}
                onChange={(e) => setFechaDesactivacion(e.target.value)}
                min={fechaActivacion}
                className={`${COMPONENT_STYLES.input.base} ${COMPONENT_STYLES.input.normal}`}
              />
            </div>
          )}
        </div>

        <div className={COMPONENT_STYLES.modal.footer}>
          <button onClick={onClose} className={COMPONENT_STYLES.button.secondary}>
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
            className={COMPONENT_STYLES.button.primary}
          >
            <Timer className="h-4 w-4" />
            <span>Programar</span>
          </button>
        </div>
      </div>
    </div>
  );
};

// ===== Main Component =====
const PermissionsManagement: React.FC = () => {
  const [usuarios, setUsuarios] = useState<UsuarioConPermisos[]>([]);
  const [globales, setGlobales] = useState<PermisosGlobales | null>(null);
  const [loading, setLoading] = useState(true);
  const [toggling, setToggling] = useState<string | null>(null);

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
    usuarioId: string | null;
    label: string;
  } | null>(null);

  const { toast } = useToastContext();

  const aniosDisponibles = (() => {
    const currentYear = new Date().getFullYear();
    return [currentYear - 1, currentYear, currentYear + 1];
  })();

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const result = await PermisoOperativoService.getResponsablesConPermisos(selectedMes, selectedAnio);
      setUsuarios(result.usuarios);
      setGlobales(result.globales);
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Error al cargar datos';
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  }, [selectedMes, selectedAnio, toast]);

  useEffect(() => {
    void loadData();
  }, [loadData]);

  const handleToggle = async (
    tipo: TipoPermisoOperativo,
    habilitado: boolean,
    usuarioId: string | null = null,
  ) => {
    const key = `${tipo}-${usuarioId || 'global'}`;
    setToggling(key);
    try {
      await PermisoOperativoService.togglePermiso({
        tipo,
        mes: selectedMes,
        anio: selectedAnio,
        habilitado,
        usuarioId,
      });
      await loadData();
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
    usuarioId: string | null,
    fechaActivacion: string,
    fechaDesactivacion: string | null,
  ) => {
    try {
      await PermisoOperativoService.togglePermiso({
        tipo,
        mes: selectedMes,
        anio: selectedAnio,
        habilitado: true,
        usuarioId,
        programado: true,
        fechaActivacion,
        fechaDesactivacion,
      });
      await loadData();
      toast.success('Permiso programado correctamente');
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Error al programar permiso';
      toast.error(msg);
    }
  };

  // ===== Render Loading =====
  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="flex items-center gap-3 text-zinc-600">
          <ArrowsClockwise className="h-5 w-5 animate-spin" />
          <span className="text-sm font-medium">Cargando permisos operativos...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {/* ═══ Header: Period Selector ═══ */}
      <section className="rounded-2xl border border-zinc-200 bg-zinc-50/70 p-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-zinc-900 text-white">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-zinc-900">Permisos Operativos</h3>
              <p className="text-xs text-zinc-500">Habilitar funciones para responsables de centros de acopio</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="relative">
              <select
                value={selectedMes}
                onChange={(e) => setSelectedMes(Number(e.target.value))}
                className="appearance-none rounded-lg border border-zinc-200 bg-white pl-3 pr-8 py-2 text-sm font-medium text-zinc-700 hover:border-zinc-300 focus:outline-none focus:ring-2 focus:ring-zinc-400"
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
                className="appearance-none rounded-lg border border-zinc-200 bg-white pl-3 pr-8 py-2 text-sm font-medium text-zinc-700 hover:border-zinc-300 focus:outline-none focus:ring-2 focus:ring-zinc-400"
              >
                {aniosDisponibles.map(anio => (
                  <option key={anio} value={anio}>{anio}</option>
                ))}
              </select>
              <CaretDown className="pointer-events-none absolute right-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-zinc-400" />
            </div>

            <button onClick={() => void loadData()} className={COMPONENT_STYLES.button.secondary}>
              <ArrowsClockwise className="h-4 w-4" />
            </button>
          </div>
        </div>
      </section>

      {/* ═══ Global Switches ═══ */}
      <section className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm">
        <div className="mb-4 flex items-center gap-2">
          <Users className="h-4 w-4 text-zinc-500" />
          <h4 className="text-sm font-semibold text-zinc-900">Permisos globales</h4>
          <span className="text-xs text-zinc-500">— Aplican a todos los responsables de acopio</span>
        </div>

        <div className="grid gap-3 sm:grid-cols-3">
          {PERMISO_CONFIG.map((config) => {
            const permiso = globales?.[config.tipo as keyof PermisosGlobales];
            const isToggling = toggling === `${config.tipo}-global`;
            const Icon = config.icon;

            return (
              <div
                key={config.tipo}
                className={`
                  rounded-xl border p-4 transition-all duration-200
                  ${permiso?.habilitado ? 'border-emerald-200 bg-emerald-50/50' : 'border-zinc-200 bg-zinc-50/50'}
                `}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className={`
                      flex h-9 w-9 items-center justify-center rounded-xl
                      ${permiso?.habilitado ? 'bg-emerald-100 text-emerald-700' : 'bg-zinc-100 text-zinc-500'}
                    `}>
                      <Icon className="h-4.5 w-4.5" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-zinc-900">{config.label}</p>
                      <p className="text-xs text-zinc-500">{config.description}</p>
                    </div>
                  </div>

                  <ToggleSwitch
                    checked={permiso?.habilitado ?? false}
                    onChange={(checked) => void handleToggle(config.tipo, checked)}
                    disabled={isToggling}
                    colorClass={config.colorActive}
                  />
                </div>

                <div className="mt-3 flex items-center gap-2">
                  <button
                    onClick={() => setScheduleModal({
                      isOpen: true,
                      tipo: config.tipo,
                      usuarioId: null,
                      label: `${config.label} (Global)`,
                    })}
                    className="inline-flex items-center gap-1.5 rounded-lg border border-zinc-200 bg-white px-2.5 py-1.5 text-xs font-medium text-zinc-600 hover:bg-zinc-50 hover:text-zinc-800 transition-colors"
                  >
                    <Timer className="h-3.5 w-3.5" />
                    Programar
                  </button>

                  {permiso?.programado && permiso.fechaActivacion && (
                    <div className="inline-flex items-center gap-1 rounded-lg bg-amber-50 border border-amber-200 px-2 py-1 text-xs text-amber-700">
                      <Clock className="h-3 w-3" />
                      <span>
                        {new Date(permiso.fechaActivacion).toLocaleString('es-PE', {
                          day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit',
                        })}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* ═══ Per-User Permissions ═══ */}
      <section className="rounded-2xl border border-zinc-200 bg-white shadow-sm overflow-hidden">
        <div className="border-b border-zinc-200 bg-zinc-50/70 px-5 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <User className="h-4 w-4 text-zinc-500" />
              <h4 className="text-sm font-semibold text-zinc-900">Permisos individuales</h4>
              <span className="inline-flex items-center rounded-full bg-zinc-100 px-2 py-0.5 text-xs font-medium text-zinc-600">
                {usuarios.length} responsables
              </span>
            </div>
            <div className="flex items-center gap-2 text-xs text-zinc-500">
              <CalendarBlank className="h-3.5 w-3.5" />
              <span>{MESES[selectedMes - 1]} {selectedAnio}</span>
            </div>
          </div>
        </div>

        {usuarios.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-zinc-100">
              <Users className="h-7 w-7 text-zinc-400" />
            </div>
            <p className="mt-3 text-sm font-medium text-zinc-900">Sin responsables</p>
            <p className="mt-1 text-xs text-zinc-500">No hay usuarios con rol de responsable de acopio.</p>
          </div>
        ) : (
          <div className="divide-y divide-zinc-100">
            {/* Table header */}
            <div className="hidden lg:grid grid-cols-[1fr_repeat(3,140px)_80px] items-center gap-2 px-5 py-3 bg-zinc-50/50 text-xs font-semibold uppercase tracking-widest text-zinc-500">
              <span>Usuario</span>
              {PERMISO_CONFIG.map(c => (
                <span key={c.tipo} className="text-center">{c.label.replace('Editar ', '')}</span>
              ))}
              <span className="text-center">Acciones</span>
            </div>

            {usuarios.map((usuario) => (
              <div
                key={usuario.id}
                className="px-5 py-4 hover:bg-zinc-50/50 transition-colors duration-150"
              >
                {/* Desktop layout */}
                <div className="hidden lg:grid grid-cols-[1fr_repeat(3,140px)_80px] items-center gap-2">
                  {/* User info */}
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-blue-50 text-blue-700 text-sm font-bold">
                      {usuario.nombres[0]}{usuario.apellidos[0]}
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-zinc-900 truncate">
                        {usuario.apellidos}, {usuario.nombres}
                      </p>
                      <p className="text-xs text-zinc-500 truncate">
                        {usuario.centrosAcopioAsignados.length > 0
                          ? usuario.centrosAcopioAsignados.map(a => a.centroAcopio.nombre).join(', ')
                          : usuario.centroAcopio?.nombre || 'Sin centro asignado'}
                      </p>
                    </div>
                  </div>

                  {/* Permission toggles */}
                  {PERMISO_CONFIG.map((config) => {
                    const permiso = usuario.permisos[config.tipo as keyof typeof usuario.permisos];
                    const isToggling = toggling === `${config.tipo}-${usuario.id}`;

                    return (
                      <div key={config.tipo} className="flex flex-col items-center gap-1">
                        <ToggleSwitch
                          checked={permiso.habilitado}
                          onChange={(checked) => void handleToggle(config.tipo, checked, usuario.id)}
                          disabled={isToggling}
                          size="sm"
                          colorClass={config.colorActive}
                        />
                        {permiso.esGlobal && permiso.habilitado && (
                          <span className="text-[10px] text-zinc-400 font-medium">Global</span>
                        )}
                        {permiso.programado && (
                          <span className="inline-flex items-center gap-0.5 text-[10px] text-amber-600 font-medium">
                            <Clock className="h-2.5 w-2.5" />
                            Prog.
                          </span>
                        )}
                      </div>
                    );
                  })}

                  {/* Actions */}
                  <div className="flex items-center justify-center">
                    <button
                      onClick={() => setScheduleModal({
                        isOpen: true,
                        tipo: TIPOS_PERMISO.MOVIMIENTOS_EDICION,
                        usuarioId: usuario.id,
                        label: `${usuario.nombres} ${usuario.apellidos}`,
                      })}
                      className="p-1.5 rounded-md text-zinc-400 hover:text-zinc-700 hover:bg-zinc-100 transition-colors"
                      title="Programar permisos"
                    >
                      <Timer className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                {/* Mobile layout */}
                <div className="lg:hidden space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-blue-50 text-blue-700 text-sm font-bold">
                      {usuario.nombres[0]}{usuario.apellidos[0]}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-semibold text-zinc-900 truncate">
                        {usuario.apellidos}, {usuario.nombres}
                      </p>
                      <p className="text-xs text-zinc-500 truncate">
                        {usuario.centrosAcopioAsignados.length > 0
                          ? usuario.centrosAcopioAsignados.map(a => a.centroAcopio.nombre).join(', ')
                          : usuario.centroAcopio?.nombre || 'Sin centro'}
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-2">
                    {PERMISO_CONFIG.map((config) => {
                      const permiso = usuario.permisos[config.tipo as keyof typeof usuario.permisos];
                      const isToggling = toggling === `${config.tipo}-${usuario.id}`;
                      const Icon = config.icon;

                      return (
                        <div key={config.tipo} className="flex flex-col items-center gap-1.5 rounded-lg border border-zinc-100 p-2">
                          <Icon className="h-4 w-4 text-zinc-500" />
                          <span className="text-[10px] font-medium text-zinc-600 text-center leading-tight">
                            {config.label.replace('Editar ', '')}
                          </span>
                          <ToggleSwitch
                            checked={permiso.habilitado}
                            onChange={(checked) => void handleToggle(config.tipo, checked, usuario.id)}
                            disabled={isToggling}
                            size="sm"
                            colorClass={config.colorActive}
                          />
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* ═══ Schedule Modal ═══ */}
      {scheduleModal && (
        <ScheduleModal
          isOpen={scheduleModal.isOpen}
          onClose={() => setScheduleModal(null)}
          permisoLabel={scheduleModal.label}
          onSave={(fechaAct, fechaDesact) => {
            void handleSchedule(
              scheduleModal.tipo,
              scheduleModal.usuarioId,
              fechaAct,
              fechaDesact,
            );
          }}
        />
      )}
    </div>
  );
};

export default PermissionsManagement;