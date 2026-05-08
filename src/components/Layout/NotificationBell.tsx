import React, { useState, useEffect, useRef, useCallback, memo } from 'react';
import { Bell, Check, Warning as AlertTriangle, Info, WarningCircle as AlertOctagon, CheckCircle } from '@phosphor-icons/react';
import { useNavigate } from 'react-router-dom';
import { useAlertasGlobal } from '../../contexts/AlertasContext';
import { NivelAlerta } from '../../types';
import { sileo, SileoState } from 'sileo';

const NIVEL_CONFIG: Record<NivelAlerta, { icon: React.ElementType; color: string; bgColor: string; sileoState: SileoState }> = {
  error: { icon: AlertOctagon, color: 'text-rose-600', bgColor: 'bg-rose-50/80', sileoState: 'error' },
  warning: { icon: AlertTriangle, color: 'text-amber-600', bgColor: 'bg-amber-50/80', sileoState: 'warning' },
  info: { icon: Info, color: 'text-sky-600', bgColor: 'bg-sky-50/80', sileoState: 'info' },
  success: { icon: CheckCircle, color: 'text-emerald-600', bgColor: 'bg-emerald-50/80', sileoState: 'success' },
};

const formatTimeAgo = (fecha: Date | string): string => {
  const fechaObj = typeof fecha === 'string' ? new Date(fecha) : fecha;
  const ahora = new Date();
  const diff = Math.max(0, ahora.getTime() - fechaObj.getTime());
  const mins = Math.floor(diff / 60000);
  const hrs = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);

  if (mins < 1) return 'Ahora';
  if (mins < 60) return `${mins}m`;
  if (hrs < 24) return `${hrs}h`;
  if (days < 7) return `${days}d`;
  return fechaObj.toLocaleDateString('es-PE', { day: '2-digit', month: 'short' });
};

// Genera un sonido profesional (bubble pop / sutil chime)
const playNotificationSound = () => {
  try {
    const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContext) return;
    const ctx = new AudioContext();
    
    if (ctx.state === 'suspended') {
      ctx.resume().catch(() => {});
    }

    const osc = ctx.createOscillator();
    const gainNode = ctx.createGain();

    osc.type = 'sine';
    // Frecuencias brillantes y cortas para un feedback sutil
    osc.frequency.setValueAtTime(600, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(1200, ctx.currentTime + 0.1);

    gainNode.gain.setValueAtTime(0, ctx.currentTime);
    gainNode.gain.linearRampToValueAtTime(0.15, ctx.currentTime + 0.02);
    gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.3);

    osc.connect(gainNode);
    gainNode.connect(ctx.destination);

    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.3);
  } catch {
    // Ignorar errores (policy del navegador o falta de intearcción del usuario)
  }
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

  // Detectar nuevas alertas y mostrar animación, emitir toast y sonido
  useEffect(() => {
    if (count > prevCountRef.current && prevCountRef.current >= 0) {
      setHasNewAlerts(true);
      
      const nuevaAlerta = alertasNoLeidas[0];
      if (nuevaAlerta) {
        playNotificationSound();
        
        const config = NIVEL_CONFIG[nuevaAlerta.nivel];
        sileo.show({
          type: config?.sileoState || 'info',
          title: nuevaAlerta.titulo,
          description: nuevaAlerta.descripcion,
          duration: 6000,
        });
      }

      const timer = setTimeout(() => setHasNewAlerts(false), 2500);
      return () => clearTimeout(timer);
    }
    prevCountRef.current = count;
  }, [count, alertasNoLeidas]);

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
          relative flex h-10 w-10 items-center justify-center rounded-[9px] border
          transition-colors duration-200
          focus:outline-none focus-visible:ring-2 focus-visible:ring-[#dedfea]/70
          ${isOpen ? 'border-[#c7c9d5] bg-[#f8f7fb] text-[#111318]' : 'border-[#dedfea] bg-white text-[#606571] hover:border-[#c7c9d5] hover:text-[#111318]'}
          ${hasNewAlerts ? 'text-[#ff3d73]' : ''}
        `}
        aria-label={`Notificaciones${count > 0 ? ` (${count} no leídas)` : ''}`}
        aria-expanded={isOpen}
      >
        <div className={`transition-transform duration-300 ${hasNewAlerts ? 'scale-110' : 'scale-100'}`}>
          <Bell className="w-5 h-5" weight={count > 0 ? 'fill' : 'regular'} />
        </div>
        
        {count > 0 && (
          <span className={`
            absolute top-1.5 right-1.5
            h-2 w-2 rounded-full
            bg-[#ff3d73] ring-2 ring-white
            ${hasNewAlerts ? 'animate-pulse' : ''}
          `} />
        )}
      </button>

      {isOpen && (
        <div className="
          absolute right-0 mt-2 w-80 sm:w-96
          bg-white shadow-[0_28px_80px_-52px_rgba(12,15,24,0.72)] border border-white/90
          z-50 overflow-hidden rounded-[18px]
          animate-in fade-in slide-in-from-top-2 duration-150 origin-top-right
        ">
          <div className="px-5 py-4 border-b border-[#e7e7ef] bg-white flex items-center justify-between">
            <div className="flex items-center gap-2">
              <h3 className="font-semibold text-[13px] text-[#111318] uppercase tracking-widest">Notificaciones</h3>
              {count > 0 && (
                <span className="px-2 py-0.5 text-[10px] font-semibold bg-[#ff3d73] text-white rounded-full">
                  {displayCount} nuevas
                </span>
              )}
            </div>
            {count > 0 && (
              <button
                onClick={handleMarkAllAsRead}
                className="rounded-[6px] px-1 text-[11px] font-semibold text-[#747986] transition-colors hover:text-[#111318] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#dedfea]/70"
              >
                Marcar leídas
              </button>
            )}
          </div>

          {/* Contenido con scroll elegante */}
          <div className="max-h-[380px] overflow-y-auto overscroll-contain
            [&::-webkit-scrollbar]:w-1.5
            [&::-webkit-scrollbar-track]:bg-transparent
            [&::-webkit-scrollbar-thumb]:bg-[#dfe4eb] [&::-webkit-scrollbar-thumb]:rounded-full hover:[&::-webkit-scrollbar-thumb]:bg-[#c8d1da]
          ">
            {isLoading && recentAlertas.length === 0 ? (
              <div className="flex items-center justify-center py-10">
                <div className="w-5 h-5 border-2 border-[#111318] border-t-transparent rounded-full animate-spin" />
              </div>
            ) : recentAlertas.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center px-4">
                <div className="w-10 h-10 rounded-[9px] bg-[#f8f7fb] flex items-center justify-center mb-3 border border-[#dedfea]">
                  <Check className="w-5 h-5 text-[#8b8f9b]" weight="bold" />
                </div>
                <p className="text-sm font-medium text-[#111318] leading-tight">Estás al día</p>
                <p className="text-[13px] text-[#747986] mt-1">No tienes notificaciones pendientes por leer.</p>
              </div>
            ) : (
              <div className="flex flex-col">
                {recentAlertas.map((alerta) => {
                  const config = NIVEL_CONFIG[alerta.nivel] || NIVEL_CONFIG.info;
                  const Icon = config.icon;
                  const isMarking = markingIds.has(alerta.id);
                  
                  return (
                    <div
                      key={alerta.id}
                      onClick={handleAlertClick}
                      className={`
                        group relative flex items-start gap-3.5 px-5 py-3.5
                        cursor-pointer border-b border-[#e7e7ef] last:border-0
                        transition-colors duration-150
                        hover:bg-[#fbfafd]
                        ${isMarking ? 'opacity-50 pointer-events-none' : ''}
                      `}
                    >
                      <div className={`p-1.5 rounded-[9px] ${config.bgColor} flex-shrink-0 mt-0.5 border border-[#e7e7ef]`}>
                        <Icon className={`w-4 h-4 ${config.color}`} weight="fill" />
                      </div>
                      
                      <div className="flex-1 min-w-0 pt-0.5">
                        <div className="flex items-center justify-between gap-3 mb-1">
                          <p className="text-[13px] font-semibold text-[#111318] truncate pr-4">
                            {alerta.titulo}
                          </p>
                          <span className="text-[11px] font-medium text-[#8b8f9b] flex-shrink-0 tabular-nums">
                            {formatTimeAgo(alerta.fechaCreacion)}
                          </span>
                        </div>
                        <p className="text-[13px] text-[#747986] leading-snug line-clamp-2 pr-6">
                          {alerta.descripcion}
                        </p>
                      </div>

                      <button
                        onClick={(e) => handleMarkAsRead(alerta.id, e)}
                        disabled={isMarking}
                        className={`
                          absolute right-4 top-1/2 -translate-y-1/2
                          p-1.5 rounded-[7px] transition-all
                          opacity-0 group-hover:opacity-100 sm:focus-visible:opacity-100
                          ${isMarking 
                            ? 'text-zinc-300 cursor-not-allowed' 
                            : 'text-[#8b8f9b] hover:text-[#111318] hover:bg-[#f8f7fb] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#dedfea]/70'
                          }
                        `}
                        title="Marcar como leída"
                      >
                        {isMarking ? (
                          <div className="w-4 h-4 border-2 border-zinc-300 border-t-transparent rounded-full animate-spin" />
                        ) : (
                          <Check className="w-4 h-4" weight="bold" />
                        )}
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Footer */}
            <div className="p-2 border-t border-[#e7e7ef] bg-white">
              <button
                onClick={handleViewAll}
                className="
                  w-full py-2.5 text-[12px] font-semibold text-[#606571]
                  hover:text-[#111318] hover:bg-[#f8f7fb] border border-transparent hover:border-[#dedfea]
                  rounded-[9px] transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#dedfea]/70
                "
              >
                Ver todas las notificaciones
              </button>
            </div>
        </div>
      )}
    </div>
  );
});

NotificationBell.displayName = 'NotificationBell';

export default NotificationBell;

