import React, { useMemo } from 'react';
import { usePrefersReducedMotion } from '../_shared/prefersReducedMotion';
import { useMobileDisabled } from '../_shared/useMobileDisable';

/**
 * DotGrid — fondo de puntos sutil, adaptación clínica inspirada en el
 * DotGrid de React Bits (https://reactbits.dev/components/dot-grid).
 *
 * A diferencia del original (canvas + GSAP + InertiaPlugin), esta versión es
 * CSS/SVG puro: un patrón de puntos estático con un desplazamiento vertical
 * muy lento y de baja opacidad. Pensado para hardware modesto (sistema
 * gubernamental de salud en Apurímac) y coherente con DESIGN.md
 * ("flat on purpose", sin gradientes).
 *
 * - `prefers-reduced-motion` → patrón totalmente estático.
 * - móvil (`< sm`) → patrón estático (sin animación) para ahorrar batería/CPU.
 */
export interface DotGridProps {
  /** Color del punto (hex). Default: tinte brand muy apagado. */
  color?: string;
  /** Tamaño del punto en px. */
  dotSize?: number;
  /** Separación entre puntos en px. */
  gap?: number;
  /** Opacidad base del patrón (0-1). */
  opacity?: number;
  /** Duración del desplazamiento lento (segundos). 0 = estático. */
  driftDuration?: number;
  className?: string;
  style?: React.CSSProperties;
}

const DotGrid: React.FC<DotGridProps> = ({
  color = '#7c3aed',
  dotSize = 1.5,
  gap = 28,
  opacity = 0.10,
  driftDuration = 60,
  className = '',
  style,
}) => {
  const reduced = usePrefersReducedMotion();
  const isMobile = useMobileDisabled();
  const animate = !reduced && !isMobile && driftDuration > 0;

  // Patrón de puntos vía radial-gradient repetido (ligero, sin canvas).
  const background = useMemo(
    () => `radial-gradient(${color} ${dotSize}px, transparent ${dotSize}px)`,
    [color, dotSize],
  );

  return (
    <div
      className={className}
      style={{
        position: 'absolute',
        inset: 0,
        // Fondo base: se adapta al tema via CSS var (--color-app) definida en index.css.
        backgroundColor: 'rgb(var(--color-app))',
        backgroundImage: background,
        backgroundSize: `${gap}px ${gap}px`,
        opacity,
        pointerEvents: 'none',
        animation: animate
          ? `rb-dotgrid-drift ${driftDuration}s linear infinite`
          : undefined,
        ...style,
      }}
      aria-hidden="true"
    />
  );
};

export default DotGrid;
