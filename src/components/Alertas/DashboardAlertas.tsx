import React, { memo, useMemo } from 'react';
import { Bell } from '@phosphor-icons/react';
import { Alerta } from '../../types';
import { AlertInlineStatus, AlertSectionCard } from './components';
import { NIVELES_ALERTA, TIPOS_ALERTA } from './constants';

interface DashboardAlertasProps {
  alertas: Alerta[];
  estadisticas: {
    total: number;
    noLeidas: number;
    criticas: number;
    advertencias: number;
    informativas: number;
    exitosas: number;
    hoy: number;
    porNivel: { error: number; warning: number; info: number; success: number };
  };
  isLoading?: boolean;
  error?: string | null;
}

const formatearFecha = (fecha: Date | string) => {
  const fechaObj = typeof fecha === 'string' ? new Date(fecha) : fecha;
  if (Number.isNaN(fechaObj.getTime())) return 'Fecha inválida';

  const ahora = new Date();
  const diferencia = ahora.getTime() - fechaObj.getTime();
  const minutos = Math.floor(diferencia / (1000 * 60));
  const horas = Math.floor(diferencia / (1000 * 60 * 60));
  const dias = Math.floor(diferencia / (1000 * 60 * 60 * 24));

  if (minutos < 1) return 'Hace un momento';
  if (minutos < 60) return `Hace ${minutos} min`;
  if (horas < 24) return `Hace ${horas}h`;
  if (dias < 7) return `Hace ${dias}d`;
  return fechaObj.toLocaleDateString('es-PE');
};

const DashboardAlertas: React.FC<DashboardAlertasProps> = memo(({
  alertas,
  estadisticas,
  isLoading = false,
  error,
}) => {
  const alertasRecientes = useMemo(() => alertas.slice(0, 6), [alertas]);

  const distribucionNivel = useMemo(
    () => NIVELES_ALERTA.map((nivel) => ({
      ...nivel,
      cantidad: estadisticas.porNivel[nivel.id as keyof typeof estadisticas.porNivel] || 0,
    })),
    [estadisticas],
  );

  const distribucionTipo = useMemo(
    () => TIPOS_ALERTA.map((tipo) => ({
      ...tipo,
      cantidad: alertas.filter((alerta) => alerta.tipo === tipo.id).length,
    })),
    [alertas],
  );

  if (error) {
    return (
      <AlertSectionCard>
        <AlertInlineStatus tone="danger" title="No se pudo cargar el dashboard" description={error} />
      </AlertSectionCard>
    );
  }

  return (
    <AlertSectionCard>
      <div className="space-y-4">
        <section className="flex flex-wrap items-center gap-2">
          <span className="inline-flex items-center rounded-full bg-zinc-100 px-3 py-1 text-sm font-medium text-zinc-700">
            Total {estadisticas.total}
          </span>
          <span className={`${estadisticas.noLeidas > 0 ? 'bg-zinc-100 text-zinc-900' : 'bg-zinc-100 text-zinc-700'} inline-flex items-center rounded-full px-3 py-1 text-sm font-medium`}>
            Sin leer {estadisticas.noLeidas}
          </span>
          <span className={`${estadisticas.criticas > 0 ? 'bg-rose-50 text-rose-700' : 'bg-zinc-100 text-zinc-700'} inline-flex items-center rounded-full px-3 py-1 text-sm font-medium`}>
            Críticas {estadisticas.criticas}
          </span>
          <span className="inline-flex items-center rounded-full bg-zinc-100 px-3 py-1 text-sm font-medium text-zinc-700">
            Hoy {estadisticas.hoy}
          </span>
        </section>

        <div className="grid gap-4 xl:grid-cols-[1.18fr_0.82fr]">
          <section className="rounded-[22px] border border-zinc-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between gap-3">
              <div>
                <h3 className="text-base font-semibold text-zinc-950">Alertas recientes</h3>
                <p className="mt-1 text-sm text-zinc-500">Últimos eventos relevantes del sistema.</p>
              </div>
              <span className="inline-flex items-center rounded-full bg-zinc-100 px-2.5 py-1 text-xs font-medium text-zinc-700">
                {alertasRecientes.length} visibles
              </span>
            </div>

            {isLoading ? (
              <div className="flex items-center justify-center py-10">
                <div className="h-5 w-5 rounded-full border-2 border-zinc-900 border-t-transparent animate-spin" />
              </div>
            ) : alertasRecientes.length === 0 ? (
              <div className="flex flex-col items-center justify-center rounded-[18px] border border-dashed border-zinc-200 bg-zinc-50/70 px-6 py-10 text-center">
                <Bell className="h-8 w-8 text-zinc-300" weight="duotone" />
                <p className="mt-3 text-sm font-semibold text-zinc-900">No hay alertas recientes</p>
                <p className="mt-1 text-sm text-zinc-500">Cuando se registren eventos aparecerán aquí.</p>
              </div>
            ) : (
              <div className="mt-4 space-y-2.5">
                {alertasRecientes.map((alerta) => {
                  const nivelInfo = NIVELES_ALERTA.find((nivel) => nivel.id === alerta.nivel);
                  const tipoInfo = TIPOS_ALERTA.find((tipo) => tipo.id === alerta.tipo);
                  const Icon = nivelInfo?.icon || Bell;

                  return (
                    <article
                      key={alerta.id}
                      className={`rounded-[16px] border px-3.5 py-3 transition ${
                        alerta.leida
                          ? 'border-zinc-200 bg-zinc-50/70'
                          : 'border-zinc-200 bg-zinc-100/70'
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <div className={`mt-0.5 rounded-xl p-2 ${nivelInfo?.bgColor || 'bg-zinc-100'}`}>
                          <Icon className={`h-4 w-4 ${nivelInfo?.color || 'text-zinc-500'}`} weight="fill" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                            <div className="min-w-0">
                              <p className="truncate text-sm font-semibold text-zinc-950">{alerta.titulo}</p>
                              <p className="mt-1 text-sm leading-6 text-zinc-600">{alerta.descripcion}</p>
                            </div>
                            <span className="text-xs font-medium text-zinc-500">{formatearFecha(alerta.fechaCreacion)}</span>
                          </div>

                          <div className="mt-3 flex flex-wrap items-center gap-2">
                            <span className={alerta.leida ? 'inline-flex items-center rounded-full bg-zinc-100 px-2.5 py-1 text-xs font-medium text-zinc-700' : 'inline-flex items-center rounded-full bg-zinc-100 px-2.5 py-1 text-xs font-medium text-zinc-900'}>
                              {alerta.leida ? 'Leída' : 'Pendiente'}
                            </span>
                            <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ${tipoInfo?.bgColor || 'bg-zinc-100'} ${tipoInfo?.color || 'text-zinc-700'}`}>
                              {tipoInfo?.label || alerta.tipo}
                            </span>
                          </div>
                        </div>
                      </div>
                    </article>
                  );
                })}
              </div>
            )}
          </section>

          <div className="grid gap-5">
            <section className="rounded-[22px] border border-zinc-200 bg-white p-5 shadow-sm">
              <h3 className="text-base font-semibold text-zinc-950">Distribución</h3>
              <div className="mt-4 grid gap-4">
                <div>
                  <p className="mb-2 text-xs font-semibold uppercase tracking-[0.08em] text-zinc-500">Por nivel</p>
                  <div className="space-y-2.5">
                    {distribucionNivel.map((nivel) => {
                      const Icon = nivel.icon;
                      const porcentaje = estadisticas.total > 0 ? (nivel.cantidad / estadisticas.total) * 100 : 0;

                      return (
                        <div key={nivel.id} className="rounded-[14px] border border-zinc-200 bg-zinc-50/70 px-3 py-2.5">
                          <div className="flex items-center justify-between gap-3">
                            <div className="flex items-center gap-2">
                              <div className={`rounded-lg p-2 ${nivel.bgColor}`}>
                                <Icon className={`h-4 w-4 ${nivel.color}`} weight="fill" />
                              </div>
                              <div>
                                <p className="text-sm font-medium text-zinc-900">{nivel.label}</p>
                                <p className="text-xs text-zinc-500">{nivel.cantidad}</p>
                              </div>
                            </div>
                            <p className="text-sm font-semibold text-zinc-900">{porcentaje.toFixed(0)}%</p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div>
                  <p className="mb-2 text-xs font-semibold uppercase tracking-[0.08em] text-zinc-500">Por tipo</p>
                  <div className="space-y-2.5">
                    {distribucionTipo.map((tipo) => {
                      const Icon = tipo.icon;
                      return (
                        <div key={tipo.id} className="flex items-center justify-between rounded-[14px] border border-zinc-200 bg-zinc-50/70 px-3 py-2.5">
                          <div className="flex items-center gap-2">
                            <Icon className={`h-4 w-4 ${tipo.color}`} weight="fill" />
                            <span className="text-sm font-medium text-zinc-900">{tipo.label}</span>
                          </div>
                          <span className="text-sm font-semibold text-zinc-700">{tipo.cantidad}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </section>
          </div>
        </div>
      </div>
    </AlertSectionCard>
  );
});

DashboardAlertas.displayName = 'DashboardAlertas';

export default DashboardAlertas;
 