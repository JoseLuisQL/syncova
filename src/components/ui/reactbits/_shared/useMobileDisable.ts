import { useEffect, useState } from 'react';

/**
 * Indica si el viewport actual está por debajo del breakpoint `sm` de Tailwind
 * (640px por defecto).
 *
 * Los efectos visuales pesados de React Bits (backgrounds, tilt, partículas)
 * deben desactivarse en móvil según la recomendación oficial de la librería y
 * para no degradar el rendimiento en dispositivos modestos.
 */
export function useMobileDisabled(breakpointPx = 640): boolean {
  const [isMobile, setIsMobile] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false;
    return window.innerWidth < breakpointPx;
  });

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const handler = () => setIsMobile(window.innerWidth < breakpointPx);
    window.addEventListener('resize', handler);
    return () => window.removeEventListener('resize', handler);
  }, [breakpointPx]);

  return isMobile;
}

export default useMobileDisabled;
