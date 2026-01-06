import React, { memo } from 'react';
import { Check } from 'lucide-react';

interface ValeIndicatorProps {
  tieneVale: boolean;
  valeNumero?: string | null;
  size?: 'sm' | 'md';
  showTooltip?: boolean;
}

/**
 * Indicador visual minimalista para mostrar que una entrega tiene vale generado.
 * ISO 25010: Usabilidad, Accesibilidad, Consistencia
 */
export const ValeIndicator: React.FC<ValeIndicatorProps> = memo(({
  tieneVale,
  valeNumero,
  size = 'sm',
  showTooltip = true
}) => {
  if (!tieneVale) {
    return null;
  }

  const tooltipText = valeNumero ? `Vale: ${valeNumero}` : 'Vale generado';

  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-5 w-5'
  };

  const iconClasses = {
    sm: 'h-2.5 w-2.5',
    md: 'h-3 w-3'
  };

  return (
    <div 
      className={`
        ${sizeClasses[size]}
        inline-flex items-center justify-center
        bg-teal-500 text-white
        rounded-full
        transition-transform duration-200
        hover:scale-110
        cursor-default
      `}
      title={showTooltip ? tooltipText : undefined}
      aria-label={tooltipText}
      role="status"
    >
      <Check className={iconClasses[size]} strokeWidth={3} />
    </div>
  );
});

ValeIndicator.displayName = 'ValeIndicator';
