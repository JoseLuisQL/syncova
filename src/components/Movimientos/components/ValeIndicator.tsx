import React, { memo } from 'react';
import { Check } from '@phosphor-icons/react';

interface ValeIndicatorProps {
  tieneVale: boolean;
  valeNumero?: string | null;
  size?: 'sm' | 'md';
  showTooltip?: boolean;
}

/**
 * Indicador visual minimalista para mostrar que una entrega tiene vale generado.
 * Tufte Principles / Zinc Aesthetics
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
        bg-[#f3f0ff] text-brand
        rounded-md
        transition-transform duration-200
        hover:scale-105
        cursor-default border border-line-focus
      `}
      title={showTooltip ? tooltipText : undefined}
      aria-label={tooltipText}
      role="status"
    >
      <Check className={iconClasses[size]} weight="bold" />
    </div>
  );
});

ValeIndicator.displayName = 'ValeIndicator';
