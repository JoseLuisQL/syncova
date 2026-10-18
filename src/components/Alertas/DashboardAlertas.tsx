import React, { memo, useMemo, useState } from 'react';
import {
  Bell,
  WarningOctagon,
  Clock,
  CheckCircle,
  Check,
  ArrowCounterClockwise,
  Eye,
  Trash,
  ArrowRight,
  ShieldWarning,
  Lightning,
} from '@phosphor-icons/react';
import { Alerta } from '../../types';
import {
  AlertInlineStatus,
  AlertMetricItem,
  AlertMetricsGrid,
  AlertSectionCard,
} from './components';
import {
  COMPONENT_STYLES,
  NIVELES_ALERTA,
  TIPOS_ALERTA,
  formatRelativeAlertDate,
} from './constants';

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
    porTipo?: {
      vencimiento: number;
      stock_bajo: number;
      discrepancia: number;
      sistema: number;
    };
    porNivel: { error: number; warning: number; info: number; success: number };
  };
  isLoading?: boolean;
  isGenerating?: boolean;
  error?: string | null;
  onMarcarLeida?: (id: string) => void;
  onMarcarNoLeida?: (id: string) => void;
  onEliminar?: (id: string) => void;
  onInspect?: (alerta: Alerta) => void;
  onNavigateToFilter?: (filter: { tipo?: string; nivel?: string; estado?: string }) => void;
  onGenerarAutomaticas?: () => void;
}

type FeedFilterMode = 'pendientes' | 'criticas' | 'recientes';

const DashboardAlertas: React.FC<DashboardAlertasProps> = memo(({
  alertas,
  estadisticas,
  isLoading = false,
  isGenerating = false,
  error,
  onMarcarLeida,
  onMarcarNoLeida,
  onEliminar,
  onInspect,
  onNavigateToFilter,
  onGenerarAutomaticas,
}) => {
  const [feedMode, setFeedMode] = useState<FeedFilterMode>('pendientes');

  const tasaAtencion = useMemo(() => {
    if (estadisticas.total === 0) return 100;
    const atendidas = Math.max(0, estadisticas.total - estadisticas.noLeidas);
    return Math.round((atendidas / estadisticas.total) * 100);
  }, [estadisticas.noLeidas, estadisticas.total]);

  const riesgoInventarioCount = useMemo(() => {
    const venc = estadisticas.porTipo?.vencimiento ?? alertas.filter((a) => a.tipo === 'vencimiento').length;
    const stock = estadisticas.porTipo?.stock_bajo ?? alertas.filter((a) => a.tipo === 'stock_bajo').length;
    return venc + stock;
  }, [alertas, estadisticas.porTipo]);

  const kpiItems = useMemo<AlertMetricItem[]>(
    () => [
      {
        id: 'pendientes',
        label: 'Pendientes de atención',
        value: estadisticas.noLeidas,
        icon: Clock,
        tone: estadisticas.noLeidas > 0 ? 'warning' : 'neutral',
        description:
          estadisticas.noLeidas > 0
            ? 'Requieren revisión operativa'
            : 'Bandeja al día sin pendientes',
        onClick: () => onNavigateToFilter?.({ estado: 'no_leidas' }),
      },
      {
        id: 'criticas',
        label: 'Incidentes críticos',
        value: estadisticas.criticas,
        icon: WarningOctagon,
        tone: estadisticas.criticas > 0 ? 'danger' : 'neutral',
        description:
          estadisticas.criticas > 0
            ? 'Atención prioritaria inmediata'
            : 'Sin incidentes críticos activos',
        onClick: () => onNavigateToFilter?.({ nivel: 'error' }),
      },
      {
        id: 'riesgo_inventario',
        label: 'Vencimientos y stock bajo',
        value: riesgoInventarioCount,
        icon: ShieldWarning,
        tone: riesgoInventarioCount > 0 ? 'info' : 'neutral',
        description: 'Alertas vinculadas a lotes y saldos',
        onClick: () => onNavigateToFilter?.({ tipo: 'vencimiento' }),
      },
      {
        id: 'tasa_atencion',
        label: 'Tasa de atención',
        value: `${tasaAtencion}%`,
        icon: CheckCircle,
        tone: tasaAtencion >= 80 ? 'success' : 'secondary',
        description: `${estadisticas.hoy} registrada${estadisticas.hoy === 1 ? '' : 's'} hoy · ${estadisticas.total} en total`,
        onClick: () => onNavigateToFilter?.({ estado: 'leidas' }),
      },
    ],
    [
      estadisticas.criticas,
      estadisticas.hoy,
      estadisticas.noLeidas,
      estadisticas.total,
      onNavigateToFilter,
      riesgoInventarioCount,
      tasaAtencion,
    ],
  );

  const alertasFeed = useMemo(() => {
    let list = [...alertas];
    if (feedMode === 'pendientes') {
      list = list.filter((a) => !a.leida);
    } else if (feedMode === 'criticas') {
      list = list.filter((a) => a.nivel === 'error' || a.nivel === 'warning');
    }
    return list.slice(0, 7);
  }, [alertas, feedMode]);

  const distribucionNivel = useMemo(
    () =>
      NIVELES_ALERTA.map((nivel) => {
        const cantidad = estadisticas.porNivel[nivel.id as keyof typeof estadisticas.porNivel] || 0;
        const porcentaje = estadisticas.total > 0 ? Math.round((cantidad / estadisticas.total) * 100) : 0;
        return {
          ...nivel,
          cantidad,
          porcentaje,
        };
      }),
    [estadisticas],
  );

  const distribucionTipo = useMemo(
    () =>
      TIPOS_ALERTA.map((tipo) => {
        const cantidad =
          estadisticas.porTipo?.[tipo.id as keyof NonNullable<typeof estadisticas.porTipo>] ??
          alertas.filter((alerta) => alerta.tipo === tipo.id).length;
        const porcentaje = estadisticas.total > 0 ? Math.round((cantidad / estadisticas.total) * 100) : 0;
        return {
          ...tipo,
          cantidad,
          porcentaje,
        };
      }),
    [alertas, estadisticas],
  );

  if (error) {
    return (
      <AlertSectionCard>
        <AlertInlineStatus
          tone="danger"
          title="No se pudo sincronizar el resumen de alertas"
          description={error}
        />
      </AlertSectionCard>
    );
  }

  return (
    <AlertSectionCard>
      <div className="space-y-5">
        {/* Fila superior de 4 KPIs ejecutivos */}
        <AlertMetricsGrid items={kpiItems} />

        {/* Espacio de trabajo dividido: Triaje Prioritario + Diagnóstico */}
        <div className="grid gap-5 xl:grid-cols-[1.35fr_0.65fr] items-start">
          {/* Columna izquierda: Bandeja de Triaje Prioritario */}
          <section className="rounded-xl border border-line bg-surface p-4 sm:p-5">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-b border-line-soft pb-3.5">
              <div>
                <h2 className="text-base font-semibold text-ink">Bandeja de triaje prioritario</h2>
                <p className="mt-0.5 text-xs text-muted-2">
                  Atiende o inspecciona las alertas directamente desde el panel de monitoreo.
                </p>
              </div>

              <div className="flex items-center gap-1 rounded-lg border border-line bg-surface-soft p-1 self-start sm:self-auto">
                <button
                  type="button"
                  onClick={() => setFeedMode('pendientes')}
                  className={`rounded-md px-2.5 py-1 text-xs font-medium transition-colors whitespace-nowrap ${
                    feedMode === 'pendientes'
                      ? 'bg-surface text-ink font-semibold shadow-2xs'
                      : 'text-muted-2 hover:text-ink'
                  }`}
                >
                  Pendientes ({estadisticas.noLeidas})
                </button>
                <button
                  type="button"
                  onClick={() => setFeedMode('criticas')}
                  className={`rounded-md px-2.5 py-1 text-xs font-medium transition-colors whitespace-nowrap ${
                    feedMode === 'criticas'
                      ? 'bg-surface text-rose-600 dark:text-rose-400 font-semibold shadow-2xs'
                      : 'text-muted-2 hover:text-ink'
                  }`}
                >
                  Críticas ({estadisticas.criticas})
                </button>
                <button
                  type="button"
                  onClick={() => setFeedMode('recientes')}
                  className={`rounded-md px-2.5 py-1 text-xs font-medium transition-colors whitespace-nowrap ${
                    feedMode === 'recientes'
                      ? 'bg-surface text-ink font-semibold shadow-2xs'
                      : 'text-muted-2 hover:text-ink'
                  }`}
                >
                  Todas
                </button>
              </div>
            </div>

            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <div className="h-5 w-5 rounded-full border-2 border-brand border-t-transparent animate-spin" />
              </div>
            ) : alertasFeed.length === 0 ? (
              <div className="my-4 flex flex-col items-center justify-center rounded-xl border border-dashed border-line bg-surface-soft/50 px-4 py-10 text-center">
                <Bell className="h-7 w-7 text-muted" weight="duotone" />
                <p className="mt-2.5 text-sm font-semibold text-ink">
                  {feedMode === 'pendientes'
                    ? 'No tienes alertas pendientes de revisión'
                    : feedMode === 'criticas'
                      ? 'No hay alertas críticas ni advertencias activas'
                      : 'No hay alertas registradas en el sistema'}
                </p>
                <p className="mt-1 max-w-md text-xs text-muted-2">
                  {feedMode === 'pendientes' && estadisticas.total > 0
                    ? 'Todas las alertas registradas ya fueron atendidas. Puedes ver el historial completo o analizar el inventario.'
                    : 'Ejecuta un análisis automático del inventario para detectar lotes próximos a vencer o biológicos con stock bajo.'}
                </p>
                <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
                  {feedMode !== 'recientes' && estadisticas.total > 0 ? (
                    <button
                      type="button"
                      onClick={() => setFeedMode('recientes')}
                      className={COMPONENT_STYLES.button.secondary}
                    >
                      Ver todas las alertas ({estadisticas.total})
                    </button>
                  ) : null}
                  {onGenerarAutomaticas ? (
                    <button
                      type="button"
                      onClick={onGenerarAutomaticas}
                      disabled={isGenerating}
                      className={COMPONENT_STYLES.button.primary}
                    >
                      <Lightning className="h-4 w-4" weight="fill" />
                      <span>{isGenerating ? 'Analizando inventario...' : 'Analizar inventario ahora'}</span>
                    </button>
                  ) : null}
                </div>
              </div>
            ) : (
              <div className="divide-y divide-line-soft">
                {alertasFeed.map((alerta) => {
                  const nivelInfo = NIVELES_ALERTA.find((nivel) => nivel.id === alerta.nivel) || NIVELES_ALERTA[2];
                  const tipoInfo = TIPOS_ALERTA.find((tipo) => tipo.id === alerta.tipo) || TIPOS_ALERTA[3];
                  const Icon = nivelInfo.icon;

                  return (
                    <article
                      key={alerta.id}
                      className="flex flex-col gap-3 py-3.5 transition-colors sm:flex-row sm:items-start sm:justify-between"
                    >
                      <div className="flex items-start gap-3 min-w-0 flex-1">
                        <div className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${nivelInfo.bgColor}`}>
                          <Icon className={`h-4 w-4 ${nivelInfo.color}`} weight="fill" />
                        </div>

                        <div className="min-w-0 flex-1">
                          <div className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
                            <button
                              type="button"
                              onClick={() => onInspect?.(alerta)}
                              className="text-left focus-visible:outline-none group max-w-full"
                            >
                              <p className={`text-sm group-hover:text-brand transition-colors truncate ${!alerta.leida ? 'font-semibold text-ink' : 'font-medium text-muted-2'}`}>
                                {alerta.titulo}
                              </p>
                            </button>
                          </div>

                          <p className="mt-0.5 text-xs sm:text-sm leading-relaxed text-muted-2 line-clamp-2">
                            {alerta.descripcion}
                          </p>

                          {/* Línea de metadatos limpia sin píldoras */}
                          <div className="mt-1.5 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-muted-2">
                            <span className={`font-medium ${nivelInfo.color}`}>{nivelInfo.label}</span>
                            <span aria-hidden="true">·</span>
                            <span>{tipoInfo.label}</span>
                            <span aria-hidden="true">·</span>
                            <span className="font-mono tabular-nums">{formatRelativeAlertDate(alerta.fechaCreacion)}</span>
                            <span aria-hidden="true">·</span>
                            <span className={alerta.leida ? 'text-emerald-600 dark:text-emerald-400 font-medium' : 'text-amber-600 dark:text-amber-400 font-medium'}>
                              {alerta.leida ? 'Atendida' : 'Pendiente'}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Acciones operativas en 1 clic */}
                      <div className="flex items-center gap-1.5 self-end sm:self-center shrink-0">
                        {alerta.leida ? (
                          onMarcarNoLeida ? (
                            <button
                              type="button"
                              onClick={() => onMarcarNoLeida(alerta.id)}
                              className={COMPONENT_STYLES.button.ghost}
                              title="Marcar como pendiente"
                            >
                              <ArrowCounterClockwise className="h-3.5 w-3.5" weight="bold" />
                              <span>Reabrir</span>
                            </button>
                          ) : null
                        ) : onMarcarLeida ? (
                          <button
                            type="button"
                            onClick={() => onMarcarLeida(alerta.id)}
                            className="inline-flex h-8 items-center gap-1.5 rounded-lg border border-emerald-200 dark:border-emerald-800/60 bg-emerald-50/80 dark:bg-emerald-950/40 px-2.5 text-xs font-semibold text-emerald-700 dark:text-emerald-300 transition-colors hover:bg-emerald-100 dark:hover:bg-emerald-950/70"
                            title="Marcar alerta como atendida"
                          >
                            <Check className="h-3.5 w-3.5" weight="bold" />
                            <span>Atender</span>
                          </button>
                        ) : null}

                        {onInspect ? (
                          <button
                            type="button"
                            onClick={() => onInspect(alerta)}
                            className={COMPONENT_STYLES.button.icon}
                            aria-label="Inspeccionar alerta"
                            title="Ver detalle"
                          >
                            <Eye className="h-4 w-4" weight="bold" />
                          </button>
                        ) : null}

                        {onEliminar ? (
                          <button
                            type="button"
                            onClick={() => onEliminar(alerta.id)}
                            className={`${COMPONENT_STYLES.button.icon} ${COMPONENT_STYLES.button.iconDelete}`}
                            aria-label="Eliminar alerta"
                            title="Eliminar alerta"
                          >
                            <Trash className="h-4 w-4" weight="bold" />
                          </button>
                        ) : null}
                      </div>
                    </article>
                  );
                })}
              </div>
            )}

            {alertas.length > 0 && onNavigateToFilter ? (
              <div className="mt-3 border-t border-line-soft pt-3 flex items-center justify-between">
                <span className="text-xs text-muted-2 font-mono tabular-nums">
                  Mostrando {alertasFeed.length} de {alertas.length} alertas
                </span>
                <button
                  type="button"
                  onClick={() => onNavigateToFilter({})}
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-brand hover:underline"
                >
                  <span>Abrir bandeja completa</span>
                  <ArrowRight className="h-3.5 w-3.5" weight="bold" />
                </button>
              </div>
            ) : null}
          </section>

          {/* Columna derecha: Diagnóstico interactivo por Severidad y Categoría */}
          <div className="space-y-4">
            <section className="rounded-xl border border-line bg-surface p-4 sm:p-5">
              <div className="flex items-center justify-between gap-2">
                <div>
                  <h3 className="text-sm font-semibold text-ink">Distribución por severidad</h3>
                  <p className="mt-0.5 text-xs text-muted-2">Haz clic en un nivel para filtrar la bandeja</p>
                </div>
                <span className="font-mono text-xs text-muted-2 tabular-nums">
                  {estadisticas.total} total
                </span>
              </div>

              <div className="mt-4 space-y-3">
                {distribucionNivel.map((nivel) => {
                  const Icon = nivel.icon;
                  return (
                    <button
                      key={nivel.id}
                      type="button"
                      onClick={() => onNavigateToFilter?.({ nivel: nivel.id })}
                      className="w-full text-left group rounded-lg p-2 -mx-2 transition-colors hover:bg-surface-soft focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/20"
                    >
                      <div className="flex items-center justify-between gap-2 text-xs">
                        <div className="flex items-center gap-2">
                          <Icon className={`h-4 w-4 ${nivel.color}`} weight="fill" />
                          <span className="font-medium text-ink group-hover:text-brand transition-colors">
                            {nivel.pluralLabel}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 font-mono tabular-nums">
                          <span className="font-semibold text-ink">{nivel.cantidad}</span>
                          <span className="text-muted w-9 text-right">{nivel.porcentaje}%</span>
                        </div>
                      </div>
                      <div className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-surface-soft border border-line-soft">
                        <div
                          className={`h-full rounded-full transition-all duration-300 ${nivel.barColor}`}
                          style={{ width: `${Math.max(nivel.cantidad > 0 ? 4 : 0, nivel.porcentaje)}%` }}
                        />
                      </div>
                    </button>
                  );
                })}
              </div>
            </section>

            <section className="rounded-xl border border-line bg-surface p-4 sm:p-5">
              <div>
                <h3 className="text-sm font-semibold text-ink">Distribución por categoría</h3>
                <p className="mt-0.5 text-xs text-muted-2">Origen operativo de las notificaciones</p>
              </div>

              <div className="mt-4 space-y-3">
                {distribucionTipo.map((tipo) => {
                  const Icon = tipo.icon;
                  return (
                    <button
                      key={tipo.id}
                      type="button"
                      onClick={() => onNavigateToFilter?.({ tipo: tipo.id })}
                      className="w-full text-left group rounded-lg p-2 -mx-2 transition-colors hover:bg-surface-soft focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/20"
                    >
                      <div className="flex items-center justify-between gap-2 text-xs">
                        <div className="flex items-center gap-2">
                          <Icon className={`h-4 w-4 ${tipo.color}`} weight="fill" />
                          <span className="font-medium text-ink group-hover:text-brand transition-colors">
                            {tipo.pluralLabel}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 font-mono tabular-nums">
                          <span className="font-semibold text-ink">{tipo.cantidad}</span>
                          <span className="text-muted w-9 text-right">{tipo.porcentaje}%</span>
                        </div>
                      </div>
                      <div className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-surface-soft border border-line-soft">
                        <div
                          className={`h-full rounded-full transition-all duration-300 ${tipo.barColor}`}
                          style={{ width: `${Math.max(tipo.cantidad > 0 ? 4 : 0, tipo.porcentaje)}%` }}
                        />
                      </div>
                    </button>
                  );
                })}
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