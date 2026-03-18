import React, { memo } from 'react';
import { Bell } from 'lucide-react';
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
  title = 'No se encontraron alertas',
  description = 'Ajusta filtros o genera nuevas alertas para volver a poblar la vista.',
  action,
}) => (
  <div className="flex flex-col items-center justify-center rounded-[22px] border border-dashed border-slate-200 bg-slate-50/70 px-6 py-14 text-center">
    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">
      <Bell className="h-5 w-5" aria-hidden="true" />
    </div>
    <p className="mt-4 text-sm font-semibold text-slate-900">{title}</p>
    <p className="mt-2 max-w-lg text-sm leading-6 text-slate-500">{description}</p>
    {action ? (
      <button type="button" onClick={action.onClick} className={`${COMPONENT_STYLES.button.primary} mt-5`}>
        {action.label}
      </button>
    ) : null}
  </div>
));

EmptyState.displayName = 'EmptyState';
