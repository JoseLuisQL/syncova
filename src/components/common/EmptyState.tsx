import React from 'react';
import type { IconProps } from '@phosphor-icons/react';
import SpotlightCard from '../ui/reactbits/components/SpotlightCard';

/**
 * EmptyState — estado vacío reutilizable para listas/tablas sin datos.
 *
 * Usa SpotlightCard de React Bits (re-tokenizado a paleta clínica) como
 * contenedor para dar un toque profesional sin romper la sobriedad del
 * sistema. Pensado para reemplazar los estados vacíos de texto plano que
 * hoy están dispersos por los módulos.
 */
export interface EmptyStateProps {
  icon?: React.ElementType<IconProps>;
  title: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
}

const EmptyState: React.FC<EmptyStateProps> = ({
  icon: Icon,
  title,
  description,
  action,
  className = '',
}) => {
  return (
    <div className={`flex items-center justify-center py-12 px-4 ${className}`}>
      <SpotlightCard className="max-w-md w-full text-center" spotlightColor="rgba(124, 58, 237, 0.10)">
        {Icon && (
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full border border-line bg-surface-soft text-muted-2">
            <Icon className="h-7 w-7" weight="duotone" aria-hidden="true" />
          </div>
        )}
        <h3 className="text-lg font-semibold text-ink">{title}</h3>
        {description && (
          <p className="mt-2 text-sm font-medium text-muted-2 leading-relaxed">
            {description}
          </p>
        )}
        {action && <div className="mt-5">{action}</div>}
      </SpotlightCard>
    </div>
  );
};

export default EmptyState;
