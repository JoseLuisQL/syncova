import React, { useState, useEffect, useRef, useCallback, memo } from 'react';
import { Bell, Check, AlertTriangle, Info, AlertOctagon, CheckCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAlertasGlobal } from '../../contexts/AlertasContext';
import { NivelAlerta } from '../../types';

const NIVEL_CONFIG: Record<NivelAlerta, { icon: React.ElementType; color: string; bgColor: string }> = {
  error: { icon: AlertOctagon, color: 'text-rose-600', bgColor: 'bg-rose-100' },
  warning: { icon: AlertTriangle, color: 'text-amber-600', bgColor: 'bg-amber-100' },
  info: { icon: Info, color: 'text-cyan-600', bgColor: 'bg-cyan-100' },
  success: { icon: CheckCircle, color: 'text-emerald-600', bgColor: 'bg-emerald-100' },
};

const formatTimeAgo = (fecha: Date | string): string => {
  const fechaObj = typeof fecha === 'string' ? new Date(fecha) : fecha;
  const ahora = new Date();
  const diff = ahora.getTime() - fechaObj.getTime();
  const mins = Math.floor(diff / 60000);
  const hrs = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);

  if (mins < 1) return 'Ahora';
  if (mins < 60) return `${mins}m`;
  if (hrs < 24) return `${hrs}h`;
  if (days < 7) return `${days}d`;
  return fechaObj.toLocaleDateString('es-PE', { day: '2-digit', month: 'short' });
};

const NotificationBell: React.FC = memo(() => {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [markingIds, setMarkingIds] = useState<Set<string>>(new Set());
  const [hasNewAlerts, setHasNewAlerts] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const prevCountRef = useRef(0);
  
  const { 
    alertasNoLeidas, 
    count,
    isLoading, 
    markAsRead,
    markAllAsRead 
  } = useAlertasGlobal();

  // Detectar nuevas alertas y mostrar animación
  useEffect(() => {
    if (count > prevCountRef.current && prevCountRef.current >= 0) {
      setHasNewAlerts(true);
      const timer = setTimeout(() => setHasNewAlerts(false), 2000);
      return () => clearTimeout(timer);
    }
    prevCountRef.current = count;
  }, [count]);

  // Cerrar dropdown al hacer clic fuera
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleToggle = useCallback(() => {
    setIsOpen(prev => !prev);
  }, []);

  const handleMarkAsRead = useCallback(async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (markingIds.has(id)) return;

    setMarkingIds(prev => new Set(prev).add(id));
    await markAsRead(id);
    setMarkingIds(prev => {
      const next = new Set(prev);
      next.delete(id);
      return next;
    });
  }, [markAsRead, markingIds]);

  const handleMarkAllAsRead = useCallback(async () => {
    await markAllAsRead();
  }, [markAllAsRead]);

  const handleViewAll = useCallback(() => {
    setIsOpen(false);
    navigate('/alertas/alertas');
  }, [navigate]);

  const handleAlertClick = useCallback(() => {
    setIsOpen(false);
    navigate('/alertas/alertas');
  }, [navigate]);

  const displayCount = count > 99 ? '99+' : count;
  const recentAlertas = alertasNoLeidas.slice(0, 5);

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={handleToggle}
        className={`
          relative p-2 rounded-lg
          transition-all duration-200
          focus:outline-none focus:ring-2 focus:ring-teal-500/20
          ${count > 0 
            ? 'text-teal-600 hover:text-teal-700 hover:bg-teal-50' 
            : 'text-gray-400 hover:text-gray-600 hover:bg-gray-50'
          }
          ${hasNewAlerts ? 'animate-bounce' : ''}
        `}
        aria-label={`Ver notificaciones${count > 0 ? ` (${count} no leidas)` : ''}`}
        aria-expanded={isOpen}
      >
        <Bell className={`w-5 h-5 ${hasNewAlerts ? 'text-rose-500' : ''}`} />
        {count > 0 && (
          <span className={`
            absolute -top-0.5 -right-0.5
            min-w-[18px] h-[18px] px-1
            flex items-center justify-center
            text-[10px] font-bold text-white
            bg-rose-500 rounded-full
            ring-2 ring-white
            ${hasNewAlerts ? 'animate-ping' : ''}
          `}>
            {displayCount}
          </span>
        )}
        {hasNewAlerts && count > 0 && (
          <span className="
            absolute -top-0.5 -right-0.5
            min-w-[18px] h-[18px] px-1
            flex items-center justify-center
            text-[10px] font-bold text-white
            bg-rose-500 rounded-full
            ring-2 ring-white
          ">
            {displayCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="
          absolute right-0 mt-2 w-80 sm:w-96
          bg-white rounded-xl shadow-xl border border-gray-200
          z-50 overflow-hidden
          animate-in fade-in slide-in-from-top-2 duration-200
        ">
          {/* Header */}
          <div className="px-4 py-3 border-b border-gray-100 bg-gray-50/80">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Bell className="w-4 h-4 text-teal-600" />
                <h3 className="font-semibold text-gray-900">Notificaciones</h3>
                {count > 0 && (
                  <span className="px-2 py-0.5 text-xs font-medium bg-teal-100 text-teal-700 rounded-full">
                    {count}
                  </span>
                )}
              </div>
              {count > 0 && (
                <button
                  onClick={handleMarkAllAsRead}
                  className="text-xs font-medium text-teal-600 hover:text-teal-800 transition-colors"
                >
                  Marcar todas
                </button>
              )}
            </div>
          </div>

          {/* Content */}
          <div className="max-h-80 overflow-y-auto">
            {isLoading && recentAlertas.length === 0 ? (
              <div className="flex items-center justify-center py-8">
                <div className="w-6 h-6 border-2 border-teal-600 border-t-transparent rounded-full animate-spin" />
              </div>
            ) : recentAlertas.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 text-gray-500">
                <Bell className="w-10 h-10 text-gray-300 mb-2" />
                <p className="text-sm font-medium">Sin notificaciones</p>
                <p className="text-xs text-gray-400">Estas al dia</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-100">
                {recentAlertas.map((alerta) => {
                  const config = NIVEL_CONFIG[alerta.nivel];
                  const Icon = config.icon;
                  const isMarking = markingIds.has(alerta.id);
                  
                  return (
                    <div
                      key={alerta.id}
                      onClick={handleAlertClick}
                      className={`
                        flex items-start gap-3 px-4 py-3
                        hover:bg-gray-50 cursor-pointer
                        transition-all duration-150
                        ${isMarking ? 'opacity-50' : ''}
                      `}
                    >
                      <div className={`p-1.5 rounded-lg ${config.bgColor} flex-shrink-0 mt-0.5`}>
                        <Icon className={`w-4 h-4 ${config.color}`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <p className="text-sm font-medium text-gray-900 truncate">
                            {alerta.titulo}
                          </p>
                          <span className="text-xs text-gray-400 flex-shrink-0">
                            {formatTimeAgo(alerta.fechaCreacion)}
                          </span>
                        </div>
                        <p className="text-xs text-gray-500 line-clamp-2 mt-0.5">
                          {alerta.descripcion}
                        </p>
                      </div>
                      <button
                        onClick={(e) => handleMarkAsRead(alerta.id, e)}
                        disabled={isMarking}
                        className={`
                          p-1.5 rounded-md transition-all flex-shrink-0
                          ${isMarking 
                            ? 'text-gray-300 cursor-not-allowed' 
                            : 'text-gray-400 hover:text-teal-600 hover:bg-teal-50'
                          }
                        `}
                        title="Marcar como leida"
                      >
                        {isMarking ? (
                          <div className="w-4 h-4 border-2 border-gray-300 border-t-transparent rounded-full animate-spin" />
                        ) : (
                          <Check className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="px-4 py-3 border-t border-gray-100 bg-gray-50/80">
            <button
              onClick={handleViewAll}
              className="
                w-full py-2 text-sm font-medium text-teal-600
                hover:text-teal-800 hover:bg-teal-50
                rounded-lg transition-colors
              "
            >
              Ver todas las alertas
            </button>
          </div>
        </div>
      )}
    </div>
  );
});

NotificationBell.displayName = 'NotificationBell';

export default NotificationBell;
