import React, { memo, useEffect, useMemo, useRef, useState } from 'react';
import {
  WarningCircle,
  Buildings,
  CheckCircle,
  CaretDown,
  CaretRight,
  Clock,
  CircleNotch,
  MapPin,
  Package,
  Plus,
  ArrowsClockwise,
  Truck,
  X,
} from '@phosphor-icons/react';
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
      return <Package className="h-3.5 w-3.5 text-zinc-900" weight="duotone" />;
    case 'adicional':
      return <Plus className="h-3.5 w-3.5 text-zinc-500" weight="bold" />;
    case 'ambos':
      return <WarningCircle className="h-3.5 w-3.5 text-rose-600" weight="duotone" />;
    default:
      return <Package className="h-3.5 w-3.5 text-zinc-900" weight="duotone" />;
  }
};

const getTipoEntregaLabel = (tipo: EstablecimientoPendiente['tipoEntregaPendiente']) => {
  switch (tipo) {
    case 'base':
      return 'Entrega base';
    case 'adicional':
      return 'Entrega adicional';
    case 'ambos':
      return 'Base + adicional';
    default:
      return 'Entrega base';
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
        card: 'border-zinc-200 bg-zinc-50',
        pill: 'bg-zinc-100 text-zinc-700 border border-zinc-200',
        bar: 'bg-zinc-300',
        icon: <Clock className="h-4 w-4 text-zinc-500" />,
        label: 'Pendiente',
      };
    }

    if (progresoVales.estado === 'completo') {
      return {
        card: 'border-[#dedfea] bg-[#f3f0ff]',
        pill: 'bg-white text-[#7c3aed] border border-[#dedfea]',
        bar: 'bg-[#7c3aed]',
        icon: <CheckCircle className="h-4 w-4 text-[#7c3aed]" weight="fill" />,
        label: 'Completo',
      };
    }

    return {
      card: 'border-rose-200 bg-rose-50/80',
      pill: 'bg-white text-rose-700 border border-rose-200',
      bar: 'bg-rose-500',
      icon: <WarningCircle className="h-4 w-4 text-rose-600" weight="duotone" />,
      label: 'Bloqueando',
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
    <div className="relative z-[110]" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setShowDropdown((prev) => !prev)}
        disabled={isLoading}
        className={`flex items-center gap-2.5 rounded-xl px-3 py-2 text-left transition ${
          !progresoVales || progresoVales.estado === 'sin_vales'
            ? 'bg-zinc-100/50 hover:bg-zinc-100'
            : progresoVales.estado === 'completo'
            ? 'bg-[#f3f0ff] hover:bg-[#ede7ff]'
            : 'bg-zinc-100/50 hover:bg-zinc-100 shadow-[inset_0_0_0_1px_rgba(228,228,231,1)]'
        }`}
      >
        <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${
          progresoVales?.estado === 'completo' ? 'border border-[#dedfea] bg-white text-[#7c3aed]' : 'bg-white border border-zinc-200 shadow-sm'
        }`}>
          {isLoading ? <CircleNotch className={`h-4 w-4 animate-spin ${progresoVales?.estado === 'completo' ? 'text-[#7c3aed]' : 'text-zinc-900'}`} weight="bold" /> : <Truck className={`h-4 w-4 ${progresoVales?.estado === 'completo' ? 'text-[#7c3aed]' : 'text-zinc-900'}`} weight="duotone" />}
        </div>
        <div className="min-w-0">
          <p className={`text-[0.6rem] font-bold uppercase tracking-[0.15em] ${progresoVales?.estado === 'completo' ? 'text-[#7c3aed]' : 'text-zinc-500'}`}>Entregas totales</p>
          <p className={`text-[0.95rem] tracking-tight font-semibold ${progresoVales?.estado === 'completo' ? 'text-[#15171d]' : 'text-zinc-900'}`}>
            {totalEntregas.toLocaleString()}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className={`inline-flex rounded-md px-2 py-0.5 text-[0.65rem] font-bold uppercase tracking-widest ${statusConfig.pill}`}>
            {progresoVales?.totalEstablecimientosConEntregas
              ? `${progresoVales.establecimientosConValeCompleto}/${progresoVales.totalEstablecimientosConEntregas}`
              : statusConfig.label}
            {progresoVales?.porcentajeProgreso ? ` ${progresoVales.porcentajeProgreso}%` : ''}
          </span>
          <CaretDown className={`h-3 w-3 transition-transform ${showDropdown ? 'rotate-180' : ''} ${progresoVales?.estado === 'completo' ? 'text-[#7c3aed]' : 'text-zinc-400'}`} weight="bold" />
        </div>
      </button>

      {showDropdown ? (
        <div className="absolute right-0 top-[calc(100%+8px)] z-[180] min-w-[340px] overflow-hidden rounded-[14px] border border-[#e7e7ef] bg-white shadow-[0_24px_60px_-28px_rgba(12,15,24,0.55)]">
          <div className="border-b border-[#eeeef3] bg-[#fbfafd] px-4 py-3">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h3 className="text-[0.85rem] font-bold uppercase tracking-widest text-zinc-900">Validación de vales</h3>
                <p className="mt-1 text-xs text-zinc-500 font-medium">
                  {progresoVales?.totalEstablecimientosConEntregas
                    ? `${progresoVales.establecimientosConValeCompleto} de ${progresoVales.totalEstablecimientosConEntregas} vales bloqueados logísticamente.`
                    : 'Aún no existen flujos transaccionales listos para generar vales.'}
                </p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                {onRefresh ? (
                  <button
                    type="button"
                    onClick={onRefresh}
                    className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-zinc-200 bg-white text-zinc-600 transition hover:bg-zinc-50 hover:text-zinc-900 shadow-sm"
                    title="Forzar sincronización"
                  >
                    <ArrowsClockwise className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} weight="bold" />
                  </button>
                ) : null}
                <button
                  type="button"
                  onClick={() => setShowDropdown(false)}
                  className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-zinc-200 bg-white text-zinc-600 transition hover:bg-zinc-50 hover:text-zinc-900 shadow-sm"
                >
                  <X className="h-4 w-4" weight="bold" />
                </button>
              </div>
            </div>
          </div>

          <div className="max-h-80 overflow-y-auto">
            {isLoading ? (
              <div className="flex flex-col items-center justify-center gap-3 px-4 py-12 text-zinc-500">
                <CircleNotch className="h-6 w-6 animate-spin text-zinc-900" weight="bold" />
                <span className="text-xs font-bold uppercase tracking-widest text-zinc-900">Sincronizando estado...</span>
              </div>
            ) : !progresoVales || progresoVales.totalEstablecimientosConEntregas === 0 ? (
              <div className="flex flex-col items-center justify-center px-4 py-12 text-center">
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl border border-zinc-200 bg-zinc-50 shadow-sm">
                  <Package className="h-5 w-5 text-zinc-400" weight="duotone" />
                </div>
                <p className="text-[0.95rem] font-semibold tracking-tight text-zinc-900">Sin entregas</p>
                <p className="mt-1 text-xs text-zinc-500 font-medium max-w-[200px]">Debes generar entregas para visualizar el progreso del bloqueo.</p>
              </div>
            ) : progresoVales.estado === 'completo' ? (
              <div className="flex flex-col items-center justify-center px-4 py-12 text-center bg-zinc-50">
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-[14px] border border-[#dedfea] bg-[#f3f0ff] text-[#7c3aed]">
                  <CheckCircle className="h-6 w-6" weight="fill" />
                </div>
                <p className="text-[0.95rem] font-semibold tracking-tight text-zinc-900">Bloqueo completado</p>
                <p className="mt-1 text-xs text-zinc-500 font-medium">
                  {progresoVales.totalEstablecimientosConEntregas} vales bloqueados exitosamente.
                </p>
              </div>
            ) : (
              <>
                <div className="flex items-center justify-between border-b border-zinc-100 px-4 py-2.5 text-xs text-zinc-500 bg-zinc-50/50">
                  <span className="font-bold uppercase tracking-widest text-zinc-900">
                    {totalPendientes} pendiente{totalPendientes === 1 ? '' : 's'}
                  </span>
                  <span className="font-bold tracking-tight text-zinc-500">{porcentaje}% bloqueado</span>
                </div>

                <div className="space-y-2 p-3 bg-white">
                  {progresoVales.establecimientosPendientes.map((grupo) => {
                    const isExpanded = expandedCentros.has(grupo.centroAcopio.id);

                    return (
                      <div key={grupo.centroAcopio.id} className="overflow-hidden rounded-[12px] border border-[#e7e7ef] bg-white transition-colors hover:border-[#d7d8e2]">
                        <button
                          type="button"
                          onClick={() => toggleCentro(grupo.centroAcopio.id)}
                          className={`flex w-full items-center gap-3 px-3 py-2.5 text-left transition ${isExpanded ? 'bg-zinc-50' : 'hover:bg-zinc-50'}`}
                        >
                          <div className={`flex items-center justify-center transition-colors ${isExpanded ? 'text-zinc-900' : 'text-zinc-400'}`}>
                            {isExpanded ? <CaretDown className="h-4 w-4" weight="bold" /> : <CaretRight className="h-4 w-4" weight="bold" />}
                          </div>
                          <div className="flex h-8 w-8 items-center justify-center rounded-lg border border-zinc-200 bg-white text-zinc-900 shadow-sm">
                            <Buildings className="h-4 w-4" weight="duotone" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="truncate text-[0.85rem] font-bold text-zinc-900 tracking-tight">{grupo.centroAcopio.nombre}</p>
                            <p className="text-[0.65rem] font-bold tracking-widest text-zinc-500 uppercase">{grupo.centroAcopio.codigo}</p>
                          </div>
                          <span className="rounded-[7px] border border-[#e7e7ef] bg-zinc-100 px-2 py-0.5 text-[0.65rem] font-semibold text-zinc-900">
                            {grupo.totalPendientes}
                          </span>
                        </button>

                        {isExpanded ? (
                          <div className="space-y-2 border-t border-zinc-100 bg-zinc-50/50 p-2.5">
                            {grupo.establecimientos.map((establecimiento) => (
                              <div key={establecimiento.id} className="rounded-[10px] border border-[#e7e7ef] bg-white px-3 py-2.5">
                                <div className="flex items-start gap-3">
                                  <div className="flex h-7 w-7 items-center justify-center rounded-lg border border-zinc-200 bg-zinc-50 text-zinc-400 mt-0.5">
                                    <MapPin className="h-3.5 w-3.5" weight="duotone" />
                                  </div>
                                  <div className="min-w-0 flex-1">
                                    <p className="truncate text-[0.85rem] font-bold text-zinc-900 tracking-tight">{establecimiento.nombre}</p>
                                    <div className="mt-1 flex flex-wrap items-center gap-2 text-[0.65rem] font-bold text-zinc-500 uppercase tracking-widest">
                                      <span>{establecimiento.codigo}</span>
                                      <span className="text-zinc-300">•</span>
                                      <span className="inline-flex items-center gap-1.5 rounded-md bg-zinc-100 border border-zinc-200 px-1.5 py-0.5 text-zinc-600">
                                        {getTipoEntregaIcon(establecimiento.tipoEntregaPendiente)}
                                        {getTipoEntregaLabel(establecimiento.tipoEntregaPendiente)}
                                      </span>
                                    </div>
                                  </div>
                                  <div className="text-right">
                                    <p className="text-[0.95rem] font-semibold tracking-tight text-zinc-900">
                                      {establecimiento.totalCantidadPendiente.toLocaleString()}
                                    </p>
                                    <p className="text-[0.6rem] font-bold uppercase tracking-widest text-zinc-400">unids</p>
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
