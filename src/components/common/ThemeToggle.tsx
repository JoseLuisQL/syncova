import React, { useCallback, useRef } from 'react';
import { Sun, Moon } from '@phosphor-icons/react';
import { useTheme } from '../../contexts/ThemeContext';

/**
 * ThemeToggle — interruptor de modo día/noche con la animación circle-blur
 * de la View Transitions API (https://theme-toggle.rdsx.dev).
 *
 * El nuevo tema se revela como un círculo difuminado que crece desde el punto
 * de clic. En navegadores sin soporte de View Transitions, el cambio es
 * instantáneo (fallback graceful). Respeta prefers-reduced-motion (la
 * transición se desactiva vía CSS).
 */
interface ThemeToggleProps {
  className?: string;
}

const ThemeToggle: React.FC<ThemeToggleProps> = ({ className = '' }) => {
  const { theme, toggleTheme } = useTheme();
  const btnRef = useRef<HTMLButtonElement>(null);

  const handleClick = useCallback(() => {
    const toggle = () => toggleTheme();

    // View Transitions API: envolver el cambio de tema en una transición.
    // El CSS (::view-transition-new(root) en index.css) define la animación.
    const doc = document as Document & {
      startViewTransition?: (cb: () => void) => { finished: Promise<void> };
    };

    if (typeof doc.startViewTransition === 'function') {
      doc.startViewTransition(toggle);
    } else {
      toggle();
    }
  }, [toggleTheme]);

  const isDark = theme === 'dark';

  return (
    <button
      ref={btnRef}
      type="button"
      onClick={handleClick}
      className={`inline-flex h-9 w-9 items-center justify-center rounded-lg border border-line bg-surface text-ink transition-colors duration-200 hover:bg-surface-soft hover:border-line-strong focus:outline-none focus:ring-2 focus:ring-brand/20 ${className}`}
      aria-label={isDark ? 'Activar modo claro' : 'Activar modo oscuro'}
      title={isDark ? 'Modo claro' : 'Modo oscuro'}
    >
      {isDark ? (
        <Sun className="h-[18px] w-[18px]" weight="bold" aria-hidden="true" />
      ) : (
        <Moon className="h-[18px] w-[18px]" weight="bold" aria-hidden="true" />
      )}
    </button>
  );
};

export default ThemeToggle;
