import { useState, useEffect } from 'react';

export type Breakpoint = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';

export interface ResponsiveState {
  width: number;
  height: number;
  isMobile: boolean;      // < 768px (md)
  isSmallMobile: boolean; // < 640px (sm)
  isTablet: boolean;      // >= 768px && < 1024px
  isDesktop: boolean;     // >= 1024px (lg)
  breakpoint: Breakpoint;
}

const getBreakpoint = (width: number): Breakpoint => {
  if (width < 640) return 'xs';
  if (width < 768) return 'sm';
  if (width < 1024) return 'md';
  if (width < 1280) return 'lg';
  if (width < 1536) return 'xl';
  return '2xl';
};

export function useResponsive(): ResponsiveState {
  const [state, setState] = useState<ResponsiveState>(() => {
    const width = typeof window !== 'undefined' ? window.innerWidth : 1280;
    const height = typeof window !== 'undefined' ? window.innerHeight : 800;
    return {
      width,
      height,
      isMobile: width < 768,
      isSmallMobile: width < 640,
      isTablet: width >= 768 && width < 1024,
      isDesktop: width >= 1024,
      breakpoint: getBreakpoint(width),
    };
  });

  useEffect(() => {
    if (typeof window === 'undefined') return;

    let rafId: number | null = null;

    const handleResize = () => {
      if (rafId !== null) {
        cancelAnimationFrame(rafId);
      }
      rafId = requestAnimationFrame(() => {
        const width = window.innerWidth;
        const height = window.innerHeight;
        setState((prev) => {
          if (prev.width === width && prev.height === height) return prev;
          return {
            width,
            height,
            isMobile: width < 768,
            isSmallMobile: width < 640,
            isTablet: width >= 768 && width < 1024,
            isDesktop: width >= 1024,
            breakpoint: getBreakpoint(width),
          };
        });
      });
    };

    window.addEventListener('resize', handleResize, { passive: true });
    return () => {
      window.removeEventListener('resize', handleResize);
      if (rafId !== null) {
        cancelAnimationFrame(rafId);
      }
    };
  }, []);

  return state;
}

export default useResponsive;
