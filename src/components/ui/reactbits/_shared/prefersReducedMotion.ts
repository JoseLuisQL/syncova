import { useEffect, useState } from 'react';

/**
 * Detecta si el usuario ha solicitado reducir el movimiento
 * (preferencia del sistema operativo / navegador).
 *
 * Los componentes animados (incl. los copiados de React Bits) DEBEN consultar
 * este hook y renderizar una versión estática cuando sea `true`. Es un
 * requisito de accesibilidad (WCAG 2.3.3) especialmente relevante en un
 * sistema gubernamental de salud.
 */
export function usePrefersReducedMotion(): boolean {
  const [reduced, setReduced] = useState<boolean>(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return false;
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  });

  useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return;

    const mql = window.matchMedia('(prefers-reduced-motion: reduce)');
    const handler = (e: MediaQueryListEvent) => setReduced(e.matches);

    mql.addEventListener('change', handler);
    return () => mql.removeEventListener('change', handler);
  }, []);

  return reduced;
}

export default usePrefersReducedMotion;
