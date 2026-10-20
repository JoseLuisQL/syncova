import React, { memo } from 'react';
import { Bell, Lightning } from '@phosphor-icons/react';
import { COMPONENT_STYLES } from '../constants';

interface EmptyStateProps {
  title?: string;
  description?: string;
  action?: {
    label: string;
    onClick: () => void;
  };
}

export const EmptyState: React.FC<EmptyStateProps> = memo(({
  title = 'No se encontraron alertas activas',
  description = 'Ajusta los filtros aplicados o ejecuta un diagnóstico de inventario para evaluar lotes próximos a vencer y niveles de stock.',
  action,
}) => (
  <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-line bg-surface-soft/60 px-6 py-12 text-center">
    <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-line bg-surface text-muted-2">
      <Bell className="h-5 w-5" aria-hidden="true" weight="duotone" />
    </div>
    <p className="mt-3.5 text-sm font-semibold text-ink">{title}</p>
    <p className="mt-1.5 max-w-md text-xs sm:text-sm leading-relaxed text-muted-2">{description}</p>
    {action ? (
      <button type="button" onClick={action.onClick} className={`${COMPONENT_STYLES.button.primary} mt-4`}>
        <Lightning className="h-4 w-4" weight="fill" />
        <span>{action.label}</span>
      </button>
    ) : null}
  </div>
));

EmptyState.displayName = 'EmptyState';