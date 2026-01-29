import React, { memo, useState, useRef, useEffect } from 'react';
import {
  Truck,
  ChevronDown,
  ChevronRight,
  Building2,
  MapPin,
  Package,
  Plus,
  CheckCircle2,
  Clock,
  AlertCircle,
  X,
  Loader2
} from 'lucide-react';
import { ProgresoValesResponse, CentroAcopioConPendientes, EstablecimientoPendiente } from '../../../services/movimientosService';

interface EntregasProgressBadgeProps {
  totalEntregas: number;
  progresoVales: ProgresoValesResponse | null;
  isLoading: boolean;
  onRefresh?: () => void;
}

export const EntregasProgressBadge: React.FC<EntregasProgressBadgeProps> = memo(({
  totalEntregas,
  progresoVales,
  isLoading,
  onRefresh
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

  const toggleCentro = (centroId: string) => {
    setExpandedCentros(prev => {
      const next = new Set(prev);
      if (next.has(centroId)) {
        next.delete(centroId);
      } else {
        next.add(centroId);
      }
      return next;
    });
  };

  const expandAll = () => {
    if (progresoVales) {
      setExpandedCentros(new Set(progresoVales.establecimientosPendientes.map(c => c.centroAcopio.id)));
    }
  };

  const collapseAll = () => {
    setExpandedCentros(new Set());
  };

  const getBadgeColors = () => {
    if (!progresoVales || progresoVales.estado === 'sin_vales') {
      return {
        bg: 'bg-white/20',
        border: 'border-white/20',
        progressBg: 'bg-white/30',
        progressFill: 'bg-white/50'
      };
    }
    if (progresoVales.estado === 'completo') {
      return {
        bg: 'bg-emerald-500/40',
        border: 'border-emerald-300/50',
        progressBg: 'bg-emerald-900/30',
        progressFill: 'bg-emerald-400'
      };
    }
    return {
      bg: 'bg-amber-500/40',
      border: 'border-amber-300/50',
      progressBg: 'bg-amber-900/30',
      progressFill: 'bg-amber-400'
    };
  };

  const getStatusIcon = () => {
    if (!progresoVales || progresoVales.estado === 'sin_vales') {
      return <Clock className="h-3 w-3 text-white/70" />;
    }
    if (progresoVales.estado === 'completo') {
      return <CheckCircle2 className="h-3 w-3 text-emerald-200" />;
    }
    return <AlertCircle className="h-3 w-3 text-amber-200" />;
  };

  const getTipoEntregaIcon = (tipo: EstablecimientoPendiente['tipoEntregaPendiente']) => {
    switch (tipo) {
      case 'base':
        return <Package className="h-3.5 w-3.5 text-blue-500" />;
      case 'adicional':
        return <Plus className="h-3.5 w-3.5 text-purple-500" />;
      case 'ambos':
        return <AlertCircle className="h-3.5 w-3.5 text-orange-500" />;
    }
  };

  const getTipoEntregaLabel = (tipo: EstablecimientoPendiente['tipoEntregaPendiente']) => {
    switch (tipo) {
      case 'base':
        return 'Entrega Base';
      case 'adicional':
        return 'Adicional';
      case 'ambos':
        return 'Base + Adicional';
    }
  };

  const colors = getBadgeColors();
  const porcentaje = progresoVales?.porcentajeProgreso ?? 0;
  const hasPendientes = progresoVales && progresoVales.establecimientosPendientes.length > 0;
  const totalPendientes = progresoVales?.establecimientosPendientes.reduce(
    (sum, c) => sum + c.totalPendientes, 0
  ) ?? 0;

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setShowDropdown(!showDropdown)}
        disabled={isLoading}
        className={`flex items-center gap-3 px-4 py-2 rounded-xl ${colors.bg} ${colors.border} border
                   hover:bg-white/30 transition-all group cursor-pointer relative overflow-hidden`}
      >
        <div className="p-1.5 bg-white/30 rounded-lg">
          {isLoading ? (
            <Loader2 className="h-4 w-4 text-white animate-spin" />
          ) : (
            <Truck className="h-4 w-4 text-white" />
          )}
        </div>
        
        <div className="text-left min-w-[70px]">
          <div className="text-[10px] text-white/80 font-medium uppercase tracking-wide flex items-center gap-1">
            Entregas
            {getStatusIcon()}
          </div>
          <div className="text-lg font-bold text-white leading-none">
            {totalEntregas.toLocaleString()}
          </div>
        </div>

        {progresoVales && progresoVales.totalEstablecimientosConEntregas > 0 && (
          <div className="flex flex-col items-end gap-1">
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] text-white/80 font-medium">
                {progresoVales.establecimientosConValeCompleto}/{progresoVales.totalEstablecimientosConEntregas}
              </span>
              <span className="text-xs font-bold text-white">
                {porcentaje}%
              </span>
            </div>
            <div className={`w-16 h-1.5 rounded-full ${colors.progressBg} overflow-hidden`}>
              <div
                className={`h-full ${colors.progressFill} rounded-full transition-all duration-500 ease-out`}
                style={{ width: `${porcentaje}%` }}
              />
            </div>
          </div>
        )}

        <ChevronDown className={`h-4 w-4 text-white/80 transition-transform ${showDropdown ? 'rotate-180' : ''}`} />
      </button>

      {showDropdown && (
        <div className="absolute top-full left-0 mt-2 w-96 bg-white rounded-2xl shadow-2xl border border-gray-100 z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="bg-gradient-to-r from-teal-500 to-cyan-500 px-4 py-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Truck className="h-5 w-5 text-white" />
                <span className="font-bold text-white">Progreso de Vales</span>
              </div>
              <button
                onClick={() => setShowDropdown(false)}
                className="p-1 hover:bg-white/20 rounded-lg transition-colors"
              >
                <X className="h-4 w-4 text-white" />
              </button>
            </div>
            
            {progresoVales && (
              <div className="mt-2 flex items-center gap-3">
                <div className="flex-1">
                  <div className="flex items-center justify-between text-sm text-white/90 mb-1">
                    <span>
                      {progresoVales.establecimientosConValeCompleto} de {progresoVales.totalEstablecimientosConEntregas} establecimientos
                    </span>
                    <span className="font-bold">{porcentaje}%</span>
                  </div>
                  <div className="w-full h-2 bg-white/30 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-white rounded-full transition-all duration-500"
                      style={{ width: `${porcentaje}%` }}
                    />
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="max-h-80 overflow-y-auto">
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 text-teal-500 animate-spin" />
                <span className="ml-2 text-gray-500">Cargando...</span>
              </div>
            ) : !progresoVales || progresoVales.totalEstablecimientosConEntregas === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 text-gray-400">
                <Package className="h-10 w-10 mb-2 opacity-50" />
                <span className="text-sm">No hay entregas registradas</span>
              </div>
            ) : progresoVales.estado === 'completo' ? (
              <div className="flex flex-col items-center justify-center py-8">
                <div className="p-3 bg-emerald-100 rounded-full mb-3">
                  <CheckCircle2 className="h-8 w-8 text-emerald-500" />
                </div>
                <span className="font-semibold text-emerald-700">Todos los vales generados</span>
                <span className="text-sm text-gray-500 mt-1">
                  {progresoVales.totalEstablecimientosConEntregas} establecimientos con vale
                </span>
              </div>
            ) : (
              <>
                <div className="px-4 py-2 bg-gray-50 border-b border-gray-100 flex items-center justify-between">
                  <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                    {totalPendientes} establecimiento{totalPendientes !== 1 ? 's' : ''} pendiente{totalPendientes !== 1 ? 's' : ''}
                  </span>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={expandAll}
                      className="text-xs text-teal-600 hover:text-teal-700 font-medium"
                    >
                      Expandir
                    </button>
                    <span className="text-gray-300">|</span>
                    <button
                      onClick={collapseAll}
                      className="text-xs text-teal-600 hover:text-teal-700 font-medium"
                    >
                      Colapsar
                    </button>
                  </div>
                </div>

                {progresoVales.establecimientosPendientes.map((grupo) => (
                  <div key={grupo.centroAcopio.id} className="border-b border-gray-100 last:border-b-0">
                    <button
                      onClick={() => toggleCentro(grupo.centroAcopio.id)}
                      className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex items-center justify-center w-6 h-6">
                        {expandedCentros.has(grupo.centroAcopio.id) ? (
                          <ChevronDown className="h-4 w-4 text-gray-400" />
                        ) : (
                          <ChevronRight className="h-4 w-4 text-gray-400" />
                        )}
                      </div>
                      <div className="p-1.5 bg-teal-100 rounded-lg">
                        <Building2 className="h-4 w-4 text-teal-600" />
                      </div>
                      <div className="flex-1 text-left">
                        <div className="font-semibold text-gray-800 text-sm">
                          {grupo.centroAcopio.nombre}
                        </div>
                        <div className="text-xs text-gray-500">
                          {grupo.centroAcopio.codigo}
                        </div>
                      </div>
                      <div className="flex items-center gap-1 px-2 py-1 bg-amber-100 rounded-full">
                        <span className="text-xs font-bold text-amber-700">
                          {grupo.totalPendientes}
                        </span>
                        <span className="text-[10px] text-amber-600">pendiente{grupo.totalPendientes !== 1 ? 's' : ''}</span>
                      </div>
                    </button>

                    {expandedCentros.has(grupo.centroAcopio.id) && (
                      <div className="bg-gray-50 px-4 py-2 space-y-2">
                        {grupo.establecimientos.map((est) => (
                          <div
                            key={est.id}
                            className="flex items-center gap-3 p-3 bg-white rounded-xl border border-gray-100 shadow-sm"
                          >
                            <div className="p-1.5 bg-gray-100 rounded-lg">
                              <MapPin className="h-3.5 w-3.5 text-gray-500" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="font-medium text-gray-800 text-sm truncate">
                                {est.nombre}
                              </div>
                              <div className="flex items-center gap-2 mt-0.5">
                                <span className="text-[10px] text-gray-400">{est.codigo}</span>
                                <span className="text-gray-300">|</span>
                                <div className="flex items-center gap-1">
                                  {getTipoEntregaIcon(est.tipoEntregaPendiente)}
                                  <span className="text-[10px] font-medium text-gray-600">
                                    {getTipoEntregaLabel(est.tipoEntregaPendiente)}
                                  </span>
                                </div>
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="text-sm font-bold text-gray-800">
                                {est.totalCantidadPendiente.toLocaleString()}
                              </div>
                              <div className="text-[10px] text-gray-500">unidades</div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </>
            )}
          </div>

          {onRefresh && (
            <div className="px-4 py-3 bg-gray-50 border-t border-gray-100">
              <button
                onClick={onRefresh}
                disabled={isLoading}
                className="w-full flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium
                         text-teal-600 bg-teal-50 hover:bg-teal-100 rounded-xl transition-colors
                         disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Loader2 className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
                Actualizar progreso
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
});

EntregasProgressBadge.displayName = 'EntregasProgressBadge';
