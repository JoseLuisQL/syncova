import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShieldCheck, CalendarCheck, CloudArrowUp, ArrowSquareOut, Timer, X, CaretDown, ArrowsClockwise } from '@phosphor-icons/react';
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
      className="fixed inset-0 z-50 flex items-center justify-center bg-zinc-900/40 backdrop-blur-sm"
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white rounded-md max-w-md w-full shadow-xl ring-1 ring-zinc-200 mx-4 flex flex-col"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-5 py-4 border-b border-zinc-100">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-md bg-zinc-50 border border-zinc-200 text-zinc-700">
              <Timer className="h-5 w-5" weight="bold" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-zinc-900">Programar activación</h3>
              <p className="text-xs text-zinc-500 font-medium">{permisoLabel}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-md text-zinc-400 hover:text-zinc-600 hover:bg-zinc-100 transition-colors">
            <X className="h-4 w-4" weight="bold" />
          </button>
        </div>

        <div className="px-5 py-5 space-y-5">
          <div>
            <label className="block text-[13px] font-bold text-zinc-800 mb-1.5">
              Fecha y hora de activación
            </label>
            <input
              type="datetime-local"
              value={fechaActivacion}
              onChange={(e) => setFechaActivacion(e.target.value)}
              className="w-full rounded-md border border-zinc-200 bg-white px-3 py-2 text-[13px] text-zinc-700 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all"
            />
          </div>

          <div className="flex items-center gap-3 bg-zinc-50 p-3 rounded-md border border-zinc-100">
            <button
              type="button"
              role="switch"
              aria-checked={usarDesactivacion}
              onClick={() => setUsarDesactivacion(!usarDesactivacion)}
              className={`relative inline-flex w-9 h-5 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${usarDesactivacion ? 'bg-teal-600' : 'bg-zinc-300'}`}
            >
              <span className={`pointer-events-none inline-block h-4 w-4 rounded-full bg-white shadow ring-0 transition-transform duration-200 ease-in-out ${usarDesactivacion ? 'translate-x-4' : 'translate-x-0'}`} />
            </button>
            <span className="text-[13px] font-bold text-zinc-700">Programar desactivación automática</span>
          </div>

          {usarDesactivacion && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}>
              <label className="block text-[13px] font-bold text-zinc-800 mb-1.5">
                Fecha y hora de desactivación
              </label>
              <input
                type="datetime-local"
                value={fechaDesactivacion}
                onChange={(e) => setFechaDesactivacion(e.target.value)}
                min={fechaActivacion}
                className="w-full rounded-md border border-zinc-200 bg-white px-3 py-2 text-[13px] text-zinc-700 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all"
              />
            </motion.div>
          )}
        </div>

        <div className="flex items-center justify-end gap-2 px-5 py-4 border-t border-zinc-100 bg-zinc-50/50 rounded-b-md mt-auto">
          <button
            onClick={onClose}
            className="inline-flex items-center justify-center rounded-md border border-zinc-200 bg-white px-4 py-2 text-[13px] font-bold text-zinc-600 hover:bg-zinc-50 transition-colors"
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
            className="inline-flex items-center justify-center gap-1.5 rounded-md px-4 py-2 text-[13px] font-bold bg-teal-600 text-white hover:bg-teal-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
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
      <motion.div 
        whileHover={{ y: -2 }}
        className="bg-white rounded-md border border-zinc-200 p-6 shadow-sm h-full flex flex-col relative"
      >
        <div className="flex items-center gap-2 mb-8">
          <CloudArrowUp size={18} className="text-zinc-400" />
          <h3 className="text-[15px] font-extrabold text-zinc-900 tracking-tight">Permisos y planificación</h3>
        </div>

        <div className="flex items-center justify-between mb-3">
          <h4 className="text-[13px] font-bold text-zinc-800">Mis permisos de acceso</h4>
          <div className="flex items-center gap-2">
            <button 
              onClick={() => void loadGlobales()}
              disabled={loading}
              className={`text-zinc-400 hover:text-zinc-700 transition-colors ${loading ? 'animate-spin' : ''}`}
            >
              <ArrowsClockwise size={14} weight="bold" />
            </button>
            <button className="text-[12px] font-semibold text-teal-600 hover:text-teal-700 flex items-center gap-1">
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
              className="w-full appearance-none rounded-md border border-zinc-200 bg-zinc-50 pl-3 pr-8 py-1.5 text-[12px] font-bold text-zinc-700 focus:outline-none focus:ring-2 focus:ring-teal-500 transition-colors disabled:opacity-50"
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
              className="w-full appearance-none rounded-md border border-zinc-200 bg-zinc-50 pl-3 pr-8 py-1.5 text-[12px] font-bold text-zinc-700 focus:outline-none focus:ring-2 focus:ring-teal-500 transition-colors disabled:opacity-50"
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
              <ArrowsClockwise size={20} className="animate-spin text-teal-600" />
            </div>
          )}
          <div className={`flex items-start gap-3 transition-opacity ${loading ? 'opacity-50' : 'opacity-100'}`}>
            <div className="p-2 bg-zinc-50 rounded-md border border-zinc-100 mt-1">
              <ShieldCheck size={16} className="text-zinc-500" />
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <h5 className="text-[13px] font-bold text-zinc-800">Editar Movimientos</h5>
                <button 
                  onClick={() => handleToggle(TIPOS_PERMISO.MOVIMIENTOS_EDICION as TipoPermisoOperativo, !(movPermiso?.habilitado ?? false))}
                  disabled={toggling === TIPOS_PERMISO.MOVIMIENTOS_EDICION}
                  className={`w-9 h-5 rounded-full transition-colors relative flex items-center px-0.5 disabled:opacity-50 ${movPermiso?.habilitado ? 'bg-teal-600' : 'bg-zinc-200'}`}
                >
                  <motion.div 
                    layout
                    className="w-4 h-4 bg-white rounded-full shadow-sm"
                    animate={{ x: movPermiso?.habilitado ? 16 : 0 }}
                    transition={{ type: "spring", stiffness: 500, damping: 30 }}
                  />
                </button>
              </div>
              <p className="text-[11px] text-zinc-500 mb-2">Trans., Ingreso, Salida, Trans. Salida</p>
              
              <div className="flex items-center gap-3">
                <button 
                  onClick={() => setScheduleModal({ isOpen: true, label: 'Editar Movimientos', tipo: TIPOS_PERMISO.MOVIMIENTOS_EDICION as TipoPermisoOperativo })}
                  disabled={toggling === TIPOS_PERMISO.MOVIMIENTOS_EDICION}
                  className="text-[11px] font-bold text-teal-600 hover:text-teal-700 transition-colors flex items-center gap-1 bg-teal-50 px-2 py-1 rounded-md disabled:opacity-50"
                >
                  <Timer size={13} weight="bold" /> Programar
                </button>
                {movPermiso?.programado && movPermiso.fechaActivacion && (
                  <span className="text-[10px] font-bold text-amber-600 bg-amber-50 border border-amber-100 px-2 py-1 rounded-md">
                    Prog: {new Date(movPermiso.fechaActivacion).toLocaleString('es-PE', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className={`flex items-start gap-3 transition-opacity ${loading ? 'opacity-50' : 'opacity-100'}`}>
            <div className="p-2 bg-zinc-50 rounded-md border border-zinc-100 mt-1">
              <CalendarCheck size={16} className="text-zinc-500" />
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <h5 className="text-[13px] font-bold text-zinc-800">Editar Planificaciones</h5>
                <button 
                  onClick={() => handleToggle(TIPOS_PERMISO.PLANIFICACION_EDICION as TipoPermisoOperativo, !(planPermiso?.habilitado ?? false))}
                  disabled={toggling === TIPOS_PERMISO.PLANIFICACION_EDICION}
                  className={`w-9 h-5 rounded-full transition-colors relative flex items-center px-0.5 disabled:opacity-50 ${planPermiso?.habilitado ? 'bg-teal-600' : 'bg-zinc-200'}`}
                >
                  <motion.div 
                    layout
                    className="w-4 h-4 bg-white rounded-full shadow-sm"
                    animate={{ x: planPermiso?.habilitado ? 16 : 0 }}
                    transition={{ type: "spring", stiffness: 500, damping: 30 }}
                  />
                </button>
              </div>
              <p className="text-[11px] text-zinc-500 mb-2">Modificar planificaciones anuales</p>
              
              <div className="flex items-center gap-3">
                <button 
                  onClick={() => setScheduleModal({ isOpen: true, label: 'Editar Planificaciones', tipo: TIPOS_PERMISO.PLANIFICACION_EDICION as TipoPermisoOperativo })}
                  disabled={toggling === TIPOS_PERMISO.PLANIFICACION_EDICION}
                  className="text-[11px] font-bold text-teal-600 hover:text-teal-700 transition-colors flex items-center gap-1 bg-teal-50 px-2 py-1 rounded-md disabled:opacity-50"
                >
                  <Timer size={13} weight="bold" /> Programar
                </button>
                {planPermiso?.programado && planPermiso.fechaActivacion && (
                  <span className="text-[10px] font-bold text-amber-600 bg-amber-50 border border-amber-100 px-2 py-1 rounded-md">
                    Prog: {new Date(planPermiso.fechaActivacion).toLocaleString('es-PE', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="mt-auto">
          <h4 className="text-[13px] font-bold text-zinc-800 mb-2">Planificación anual 2026</h4>
          <div className="flex items-center justify-between mb-1">
            <span className="text-[11px] font-medium text-zinc-500">Estado general</span>
            <span className="text-[12px] font-bold text-zinc-900">64%</span>
          </div>
          
          <div className="h-1.5 w-full bg-zinc-100 rounded-full mb-4 overflow-hidden">
            <div className="h-full bg-teal-600 rounded-full" style={{ width: '64%' }} />
          </div>

          <div className="grid grid-cols-3 gap-2 mb-6 text-center">
            <div>
              <div className="text-[15px] font-extrabold text-zinc-900">128</div>
              <div className="text-[10px] text-zinc-500 font-medium uppercase">Programado</div>
            </div>
            <div>
              <div className="text-[15px] font-extrabold text-zinc-900">82</div>
              <div className="text-[10px] text-zinc-500 font-medium uppercase">Ejecutado</div>
            </div>
            <div>
              <div className="text-[15px] font-extrabold text-zinc-900">46</div>
              <div className="text-[10px] text-zinc-500 font-medium uppercase">Pendiente</div>
            </div>
          </div>

          <button className="w-full bg-teal-600 hover:bg-teal-700 text-white font-bold text-[13px] py-2.5 rounded-md transition-colors flex items-center justify-center gap-2">
            <CalendarCheck size={16} />
            Abrir planificación
          </button>
        </div>
      </motion.div>

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
