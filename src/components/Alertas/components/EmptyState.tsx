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
  description = 'Intenta ajustar los filtros de busqueda',
  action,
}) => (
  <div className="text-center py-12 px-4">
    <Bell className="h-12 w-12 mx-auto text-gray-300 mb-4" aria-hidden="true" />
    <p className="text-lg font-medium text-gray-900 mb-1">{title}</p>
    <p className="text-sm text-gray-500 mb-4">{description}</p>
    {action && (
      <button
        onClick={action.onClick}
        className={COMPONENT_STYLES.button.primary}
      >
        {action.label}
      </button>
    )}
  </div>
));

EmptyState.displayName = 'EmptyState';
