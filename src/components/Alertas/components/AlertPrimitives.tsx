import React from 'react';
import {
  WarningCircle,
  CheckCircle,
  Icon,
  Check,
  ArrowCounterClockwise,
  Trash,
  Clock,
  CalendarBlank,
  User,
} from '@phosphor-icons/react';
import { Alerta } from '../../../types';
import { Modal } from '../../ui/ModalElements';
import {
  ColorScheme,
  COLORS,
  COMPONENT_STYLES,
  NIVELES_ALERTA,
  TIPOS_ALERTA,
  formatExactAlertDate,
  formatRelativeAlertDate,
} from '../constants';

export interface AlertMetricItem {
  id: string;
  label: string;
  value: React.ReactNode;
  icon: Icon;
  tone?: ColorScheme;
  description?: string;
  onClick?: () => void;
}

export const AlertSectionCard: React.FC<{
  children: React.ReactNode;
}> = ({ children }) => (
  <section className={COMPONENT_STYLES.surface}>
    <div>{children}</div>
  </section>
);

export const AlertMetricsGrid: React.FC<{ items: AlertMetricItem[] }> = ({ items }) => (
  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
    {items.map((item) => {
      const tone = COLORS[item.tone || 'neutral'];
      const IconComponent = item.icon;
      const isInteractive = Boolean(item.onClick);

      return (
        <article
          key={item.id}
          onClick={item.onClick}
          role={isInteractive ? 'button' : undefined}
          tabIndex={isInteractive ? 0 : undefined}
          onKeyDown={
            isInteractive
              ? (e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    item.onClick?.();
                  }
                }
              : undefined
          }
          className={`${COMPONENT_STYLES.stats.card} ${
            isInteractive
              ? 'cursor-pointer hover:border-line-strong hover:bg-surface-soft/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/25'
              : ''
          }`}
        >
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <p className={COMPONENT_STYLES.stats.label}>{item.label}</p>
              <p className={COMPONENT_STYLES.stats.value}>{item.value}</p>
              {item.description ? (
                <p className="mt-1.5 text-xs text-muted-2">{item.description}</p>
              ) : null}
            </div>
            <div className={`${COMPONENT_STYLES.stats.iconWrapper} ${tone.surface} ${tone.border}`}>
              <IconComponent className={`h-4 w-4 ${tone.icon}`} weight="bold" aria-hidden="true" />
            </div>
          </div>
        </article>
      );
    })}
  </div>
);

export const AlertInlineStatus: React.FC<{
  tone?: 'success' | 'warning' | 'danger' | 'info';
  title: string;
  description: string;
  action?: {
    label: string;
    onClick: () => void;
  };
}> = ({ tone = 'info', title, description, action }) => {
  const classes = {
    success:
      'rounded-xl border border-emerald-200 dark:border-emerald-800/60 bg-emerald-50/70 dark:bg-emerald-950/30 p-4 text-emerald-900 dark:text-emerald-200',
    warning: COMPONENT_STYLES.alert.warning,
    danger: COMPONENT_STYLES.alert.error,
    info: COMPONENT_STYLES.alert.info,
  }[tone];

  const IconComponent = tone === 'success' ? CheckCircle : WarningCircle;

  return (
    <div className={classes}>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-3">
          <IconComponent className="mt-0.5 h-4 w-4 shrink-0" weight="fill" />
          <div>
            <p className="text-sm font-semibold">{title}</p>
            <p className="mt-0.5 text-xs sm:text-sm leading-relaxed opacity-90">{description}</p>
          </div>
        </div>
        {action ? (
          <button
            type="button"
            onClick={action.onClick}
            className={COMPONENT_STYLES.button.secondary}
          >
            {action.label}
          </button>
        ) : null}
      </div>
    </div>
  );
};

interface AlertDetailModalProps {
  alerta: Alerta | null;
  onClose: () => void;
  onMarcarLeida?: (id: string) => void;
  onMarcarNoLeida?: (id: string) => void;
  onEliminar?: (id: string) => void;
}

export const AlertDetailModal: React.FC<AlertDetailModalProps> = ({
  alerta,
  onClose,
  onMarcarLeida,
  onMarcarNoLeida,
  onEliminar,
}) => {
  if (!alerta) return null;

  const nivelInfo = NIVELES_ALERTA.find((n) => n.id === alerta.nivel) || NIVELES_ALERTA[2];
  const tipoInfo = TIPOS_ALERTA.find((t) => t.id === alerta.tipo) || TIPOS_ALERTA[3];
  const NivelIcon = nivelInfo.icon;

  const parametrosEntries = alerta.parametros
    ? Object.entries(alerta.parametros).filter(
        ([, val]) => val !== undefined && val !== null && val !== '',
      )
    : [];

  return (
    <Modal
      isOpen={Boolean(alerta)}
      onClose={onClose}
      title={alerta.titulo}
      subtitle={`${tipoInfo.label} · Severidad ${nivelInfo.label.toLowerCase()} · ${formatRelativeAlertDate(alerta.fechaCreacion)}`}
      icon={NivelIcon}
      size="lg"
      footer={(
        <div className="flex flex-wrap items-center justify-between gap-2 w-full">
          <div>
            {onEliminar ? (
              <button
                type="button"
                onClick={() => {
                  onEliminar(alerta.id);
                  onClose();
                }}
                className={COMPONENT_STYLES.button.danger}
              >
                <Trash className="h-4 w-4" weight="bold" />
                <span>Eliminar alerta</span>
              </button>
            ) : null}
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <button type="button" onClick={onClose} className={COMPONENT_STYLES.button.secondary}>
              Cerrar
            </button>
            {alerta.leida ? (
              onMarcarNoLeida ? (
                <button
                  type="button"
                  onClick={() => {
                    onMarcarNoLeida(alerta.id);
                    onClose();
                  }}
                  className={COMPONENT_STYLES.button.secondary}
                >
                  <ArrowCounterClockwise className="h-4 w-4" weight="bold" />
                  <span>Reabrir como pendiente</span>
                </button>
              ) : null
            ) : onMarcarLeida ? (
              <button
                type="button"
                onClick={() => {
                  onMarcarLeida(alerta.id);
                  onClose();
                }}
                className={COMPONENT_STYLES.button.primary}
              >
                <Check className="h-4 w-4" weight="bold" />
                <span>Marcar como atendida</span>
              </button>
            ) : null}
          </div>
        </div>
      )}
    >
      <div className="space-y-4">
        {/* Resumen de estado */}
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-2 border-b border-line-soft pb-3">
          <span className={`inline-flex items-center gap-1.5 font-semibold ${nivelInfo.color}`}>
            <NivelIcon className="h-4 w-4" weight="fill" />
            <span>Nivel {nivelInfo.label}</span>
          </span>
          <span aria-hidden="true">·</span>
          <span className="font-medium text-ink">{tipoInfo.label}</span>
          <span aria-hidden="true">·</span>
          <span className={alerta.leida ? 'text-emerald-600 dark:text-emerald-400 font-medium' : 'text-amber-600 dark:text-amber-400 font-medium'}>
            {alerta.leida ? 'Atendida / Leída' : 'Pendiente de revisión'}
          </span>
        </div>

        {/* Descripción completa */}
        <div className="rounded-xl border border-line bg-surface-soft p-4">
          <p className="text-xs font-medium text-muted-2 mb-1.5">Detalle del incidente</p>
          <p className="text-sm leading-relaxed text-ink whitespace-pre-wrap">
            {alerta.descripcion}
          </p>
        </div>

        {/* Metadatos temporales y responsables */}
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div className="rounded-xl border border-line bg-surface p-3.5">
            <div className="flex items-center gap-2 text-xs text-muted-2">
              <Clock className="h-4 w-4 shrink-0" />
              <span>Fecha de registro</span>
            </div>
            <p className="mt-1 font-mono text-xs sm:text-sm font-semibold text-ink tabular-nums">
              {formatExactAlertDate(alerta.fechaCreacion)}
            </p>
          </div>

          {alerta.fechaVencimiento ? (
            <div className="rounded-xl border border-line bg-surface p-3.5">
              <div className="flex items-center gap-2 text-xs text-muted-2">
                <CalendarBlank className="h-4 w-4 shrink-0 text-amber-600 dark:text-amber-400" />
                <span>Fecha de vencimiento asociada</span>
              </div>
              <p className="mt-1 font-mono text-xs sm:text-sm font-semibold text-ink tabular-nums">
                {new Date(alerta.fechaVencimiento).toLocaleDateString('es-PE', {
                  day: '2-digit',
                  month: 'long',
                  year: 'numeric',
                })}
              </p>
            </div>
          ) : null}

          {alerta.usuario ? (
            <div className="rounded-xl border border-line bg-surface p-3.5">
              <div className="flex items-center gap-2 text-xs text-muted-2">
                <User className="h-4 w-4 shrink-0" />
                <span>Usuario asociado</span>
              </div>
              <p className="mt-1 text-xs sm:text-sm font-semibold text-ink">
                {alerta.usuario.nombres} {alerta.usuario.apellidos} ({alerta.usuario.usuario})
              </p>
            </div>
          ) : null}
        </div>

        {/* Parámetros técnicos adicionales si existen */}
        {parametrosEntries.length > 0 ? (
          <div className="rounded-xl border border-line bg-surface p-4">
            <p className="text-xs font-medium text-muted-2 mb-2.5">Datos operativos vinculados</p>
            <dl className="grid grid-cols-1 gap-2 sm:grid-cols-2 text-xs">
              {parametrosEntries.map(([key, value]) => (
                <div key={key} className="flex items-baseline justify-between gap-2 border-b border-line-soft pb-1.5">
                  <dt className="text-muted-2 capitalize">{key.replace(/_/g, ' ')}</dt>
                  <dd className="font-mono font-medium text-ink tabular-nums truncate max-w-[200px]">
                    {typeof value === 'object' ? JSON.stringify(value) : String(value)}
                  </dd>
                </div>
              ))}
            </dl>
          </div>
        ) : null}
      </div>
    </Modal>
  );
};