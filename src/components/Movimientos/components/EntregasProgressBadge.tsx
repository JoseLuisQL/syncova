import React, { memo, useEffect, useMemo, useRef, useState } from 'react';
import {
  AlertCircle,
  Building2,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  Clock,
  Loader2,
  MapPin,
  Package,
  Plus,
  RefreshCw,
  Truck,
  X,
} from 'lucide-react';
import { ProgresoValesResponse, EstablecimientoPendiente } from '../../../services/movimientosService';

interface EntregasProgressBadgeProps {
  totalEntregas: number;
  progresoVales: ProgresoValesResponse | null;
  isLoading: boolean;
  onRefresh?: () => void;
}

const getTipoEntregaIcon = (tipo: EstablecimientoPendiente['tipoEntregaPendiente']) => {
  switch (tipo) {
    case 'base':
      return <Package className="h-3.5 w-3.5 text-teal-600" />;
    case 'adicional':
      return <Plus className="h-3.5 w-3.5 text-amber-600" />;
    case 'ambos':
      return <AlertCircle className="h-3.5 w-3.5 text-rose-600" />;
    default:
      return <Package className="h-3.5 w-3.5 text-teal-600" />;
  }
};

const getTipoEntregaLabel = (tipo: EstablecimientoPendiente['tipoEntregaPendiente']) => {
  switch (tipo) {
    case 'base':
      return 'Base';
    case 'adicional':
      return 'Adicional';
    case 'ambos':
      return 'Base + adicional';
    default:
      return 'Base';
  }
};

export const EntregasProgressBadge: React.FC<EntregasProgressBadgeProps> = memo(({
  totalEntregas,
  progresoVales,
  isLoading,
  onRefresh,
}) => {
  const [showDropdown, setShowDropdown] = useState(false);
  const [expandedCentros, setExpandedCentros] = useState<Set<string>>(new Set());
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const porcentaje = progresoVales?.porcentajeProgreso ?? 0;
  const totalPendientes = useMemo(
    () =>
      progresoVales?.establecimientosPendientes.reduce(
        (acumulado, grupo) => acumulado + grupo.totalPendientes,
        0,
      ) ?? 0,
    [progresoVales?.establecimientosPendientes],
  );

  const statusConfig = useMemo(() => {
    if (!progresoVales || progresoVales.estado === 'sin_vales') {
      return {
        card: 'border-slate-200 bg-slate-50/80',
        pill: 'bg-slate-100 text-slate-700',
        bar: 'bg-slate-300',
        icon: <Clock className="h-4 w-4 text-slate-500" />,
        label: 'Sin vales',
      };
    }

    if (progresoVales.estado === 'completo') {
      return {
        card: 'border-emerald-200 bg-emerald-50/80',
        pill: 'bg-emerald-100 text-emerald-700',
        bar: 'bg-emerald-500',
        icon: <CheckCircle2 className="h-4 w-4 text-emerald-600" />,
        label: 'Completo',
      };
    }

    return {
      card: 'border-amber-200 bg-amber-50/80',
      pill: 'bg-amber-100 text-amber-700',
      bar: 'bg-amber-500',
      icon: <AlertCircle className="h-4 w-4 text-amber-600" />,
      label: 'En progreso',
    };
  }, [progresoVales]);

  const toggleCentro = (centroId: string) => {
    setExpandedCentros((prev) => {
      const next = new Set(prev);
      if (next.has(centroId)) {
        next.delete(centroId);
      } else {
        next.add(centroId);
      }
      return next;
    });
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setShowDropdown((prev) => !prev)}
        disabled={isLoading}
        className="flex items-center gap-2.5 rounded-xl bg-white/10 px-3 py-2 text-left transition hover:bg-white/15"
      >
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white/20">
          {isLoading ? <Loader2 className="h-4 w-4 animate-spin text-white" /> : <Truck className="h-4 w-4 text-white" />}
        </div>
        <div className="min-w-0">
          <p className="text-[0.6rem] font-bold uppercase tracking-[0.15em] text-white/70">Entregas</p>
          <p className="text-sm font-bold text-white">
            {totalEntregas.toLocaleString()}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className={`inline-flex rounded-full px-2 py-0.5 text-[0.65rem] font-semibold ${
            !progresoVales || progresoVales.estado === 'sin_vales'
              ? 'bg-white/15 text-white/80'
              : progresoVales.estado === 'completo'
                ? 'bg-emerald-400/30 text-white'
                : 'bg-amber-400/30 text-white'
          }`}>
            {progresoVales?.totalEstablecimientosConEntregas
              ? `${progresoVales.establecimientosConValeCompleto}/${progresoVales.totalEstablecimientosConEntregas}`
              : statusConfig.label}
            {progresoVales?.porcentajeProgreso ? ` ${progresoVales.porcentajeProgreso}%` : ''}
          </span>
          <ChevronDown className={`h-3 w-3 text-white/50 transition-transform ${showDropdown ? 'rotate-180' : ''}`} />
        </div>
      </button>

      {showDropdown ? (
        <div className="absolute right-0 top-full z-40 mt-1.5 min-w-[340px] overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xl">
          <div className="border-b border-slate-100 bg-slate-50/80 px-3 py-2.5">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h3 className="text-sm font-semibold text-slate-900">Progreso de vales</h3>
                <p className="mt-1 text-xs text-slate-500">
                  {progresoVales?.totalEstablecimientosConEntregas
                    ? `${progresoVales.establecimientosConValeCompleto} de ${progresoVales.totalEstablecimientosConEntregas} establecimientos con vale generado`
                    : 'Aún no hay establecimientos con entrega registrada'}
                </p>
              </div>
              <div className="flex items-center gap-2">
                {onRefresh ? (
                  <button
                    type="button"
                    onClick={onRefresh}
                    className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 transition hover:bg-slate-50"
                    title="Actualizar progreso"
                  >
                    <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
                  </button>
                ) : null}
                <button
                  type="button"
                  onClick={() => setShowDropdown(false)}
                  className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 transition hover:bg-slate-50"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>

          <div className="max-h-80 overflow-y-auto">
            {isLoading ? (
              <div className="flex items-center justify-center gap-2 px-4 py-10 text-sm text-slate-500">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Cargando progreso...</span>
              </div>
            ) : !progresoVales || progresoVales.totalEstablecimientosConEntregas === 0 ? (
              <div className="flex flex-col items-center justify-center px-4 py-10 text-center">
                <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-2xl border border-slate-200 bg-slate-50 text-slate-400">
                  <Package className="h-5 w-5" />
                </div>
                <p className="text-sm font-semibold text-slate-800">No hay entregas registradas</p>
                <p className="mt-1 text-xs text-slate-500">El avance aparecerá cuando existan entregas para vales.</p>
              </div>
            ) : progresoVales.estado === 'completo' ? (
              <div className="flex flex-col items-center justify-center px-4 py-10 text-center">
                <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-2xl border border-emerald-200 bg-emerald-50 text-emerald-600">
                  <CheckCircle2 className="h-6 w-6" />
                </div>
                <p className="text-sm font-semibold text-emerald-900">Todos los vales fueron generados</p>
                <p className="mt-1 text-xs text-slate-500">
                  {progresoVales.totalEstablecimientosConEntregas} establecimientos procesados.
                </p>
              </div>
            ) : (
              <>
                <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3 text-xs text-slate-500">
                  <span className="font-semibold uppercase tracking-[0.12em]">
                    {totalPendientes} pendiente{totalPendientes === 1 ? '' : 's'}
                  </span>
                  <span>{porcentaje}% completado</span>
                </div>

                <div className="space-y-2 p-3">
                  {progresoVales.establecimientosPendientes.map((grupo) => {
                    const isExpanded = expandedCentros.has(grupo.centroAcopio.id);

                    return (
                      <div key={grupo.centroAcopio.id} className="overflow-hidden rounded-[18px] border border-slate-200 bg-slate-50/70">
                        <button
                          type="button"
                          onClick={() => toggleCentro(grupo.centroAcopio.id)}
                          className="flex w-full items-center gap-3 px-4 py-3 text-left transition hover:bg-slate-50"
                        >
                          <div className="flex h-7 w-7 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-500">
                            {isExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                          </div>
                          <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-teal-200 bg-white text-teal-600">
                            <Building2 className="h-4 w-4" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="truncate text-sm font-semibold text-slate-800">{grupo.centroAcopio.nombre}</p>
                            <p className="text-xs text-slate-500">{grupo.centroAcopio.codigo}</p>
                          </div>
                          <span className="rounded-full bg-amber-100 px-2.5 py-1 text-xs font-semibold text-amber-700">
                            {grupo.totalPendientes}
                          </span>
                        </button>

                        {isExpanded ? (
                          <div className="space-y-2 border-t border-slate-200 bg-white/70 p-3">
                            {grupo.establecimientos.map((establecimiento) => (
                              <div key={establecimiento.id} className="rounded-2xl border border-slate-200 bg-white px-3 py-2.5">
                                <div className="flex items-start gap-3">
                                  <div className="mt-0.5 flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 bg-slate-50 text-slate-500">
                                    <MapPin className="h-3.5 w-3.5" />
                                  </div>
                                  <div className="min-w-0 flex-1">
                                    <p className="truncate text-sm font-semibold text-slate-800">{establecimiento.nombre}</p>
                                    <div className="mt-1 flex flex-wrap items-center gap-2 text-[11px] text-slate-500">
                                      <span>{establecimiento.codigo}</span>
                                      <span className="text-slate-300">•</span>
                                      <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2 py-0.5 text-slate-600">
                                        {getTipoEntregaIcon(establecimiento.tipoEntregaPendiente)}
                                        {getTipoEntregaLabel(establecimiento.tipoEntregaPendiente)}
                                      </span>
                                    </div>
                                  </div>
                                  <div className="text-right">
                                    <p className="text-sm font-semibold text-slate-900">
                                      {establecimiento.totalCantidadPendiente.toLocaleString()}
                                    </p>
                                    <p className="text-[11px] text-slate-500">unidades</p>
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
              </>
            )}
          </div>
        </div>
      ) : null}
    </div>
  );
});

EntregasProgressBadge.displayName = 'EntregasProgressBadge';
