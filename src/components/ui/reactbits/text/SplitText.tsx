import React, { useEffect, useMemo, useRef, useState } from 'react';
import { motion, useInView, type Variants, type Transition } from 'motion/react';
import { usePrefersReducedMotion } from '../_shared/prefersReducedMotion';

/**
 * SplitText — adaptación clínica del componente SplitText de React Bits
 * (https://reactbits.dev/text-animations/split-text).
 *
 * Se mantiene la MISMA API de props que el original para ser un reemplazo
 * directo, pero el motor de animación es `motion/react` (ya presente en SIVAC)
 * en lugar de GSAP, para no añadir una dependencia pesada en un sistema
 * gubernamental de salud desplegado en hardware modesto. La filosofía copy-in
 * de React Bits lo permite explícitamente ("the code is yours to play around
 * with — modify styling, functionalities, anything goes").
 *
 * Respeta `prefers-reduced-motion` (WCAG 2.3.3): si el usuario lo solicita,
 * el texto se renderiza estático sin animación.
 */
export interface SplitTextProps {
  text: string;
  className?: string;
  /** Delay entre cada letra/palabra (ms). */
  delay?: number;
  /** Duración de la animación de cada elemento (segundos). */
  duration?: number;
  /** Easing de motion (no es string GSAP). Por defecto un easing clínico sobrio. */
  ease?: Transition['ease'];
  /** Tipo de división. Soporta "chars", "words", "lines" (lines = words por línea simple). */
  splitType?: 'chars' | 'words' | 'lines' | 'words, chars';
  /** Props iniciales de cada elemento (motion). */
  from?: { opacity?: number; y?: number; x?: number; scale?: number; rotate?: number };
  /** Props finales de cada elemento (motion). */
  to?: { opacity?: number; y?: number; x?: number; scale?: number; rotate?: number };
  /** Umbral de IntersectionObserver (0-1). */
  threshold?: number;
  /** rootMargin del IntersectionObserver. */
  rootMargin?: string;
  /** Etiqueta HTML a renderizar. */
  tag?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6' | 'p' | 'span';
  /** Alineación del texto. */
  textAlign?: React.CSSProperties['textAlign'];
  /** Callback cuando todas las animaciones completan. */
  onLetterAnimationComplete?: () => void;
}

const SplitText: React.FC<SplitTextProps> = ({
  text,
  className = '',
  delay = 50,
  duration = 1.25,
  ease = [0, 0, 0.2, 1], // clinical-out, sobrio
  splitType = 'chars',
  from = { opacity: 0, y: 40 },
  to = { opacity: 1, y: 0 },
  threshold = 0.1,
  rootMargin = '-100px',
  tag = 'p',
  textAlign = 'center',
  onLetterAnimationComplete,
}) => {
  const ref = useRef<HTMLElement>(null);
  const reduced = usePrefersReducedMotion();
  const inView = useInView(ref, {
    once: true,
    amount: threshold,
    margin: rootMargin as NonNullable<Parameters<typeof useInView>[1]>['margin'],
  });
  const [completed, setCompleted] = useState(false);

  const Tag = tag as React.ElementType;

  // Divide el texto en unidades según splitType.
  const units = useMemo(() => {
    if (!text) return [] as string[];
    if (splitType === 'words' || splitType === 'lines') {
      return text.split(/(\s+)/); // conserva espacios
    }
    // "chars" y "words, chars" → por caracter
    return Array.from(text);
  }, [text, splitType]);

  useEffect(() => {
    if (inView && !completed && (reduced || units.length === 0)) {
      setCompleted(true);
      onLetterAnimationComplete?.();
    }
  }, [inView, completed, reduced, units.length, onLetterAnimationComplete]);

  const containerVariants: Variants = {
    hidden: {},
    visible: {
      transition: {
        staggerChildren: delay / 1000,
        delayChildren: 0,
      },
    },
  };

  const unitVariants: Variants = {
    hidden: { opacity: from.opacity ?? 0, y: from.y ?? 0, x: from.x ?? 0, scale: from.scale ?? 1, rotate: from.rotate ?? 0 },
    visible: {
      opacity: to.opacity ?? 1,
      y: to.y ?? 0,
      x: to.x ?? 0,
      scale: to.scale ?? 1,
      rotate: to.rotate ?? 0,
      transition: { duration, ease },
    },
  };

  const handleComplete = () => {
    if (completed) return;
    setCompleted(true);
    onLetterAnimationComplete?.();
  };

  // Reduced motion → texto estático, sin envoltorio de animación.
  if (reduced) {
    return (
      <Tag ref={ref} className={className} style={{ textAlign, display: 'inline-block' }}>
        {text}
      </Tag>
    );
  }

  return (
    <Tag
      ref={ref}
      className={className}
      style={{ textAlign, display: 'inline-block' }}
      aria-label={text}
    >
      <motion.span
        style={{ display: 'inline-block', whiteSpace: 'pre-wrap' }}
        variants={containerVariants}
        initial="hidden"
        animate={inView ? 'visible' : 'hidden'}
        onAnimationComplete={handleComplete}
      >
        {units.map((unit, i) => {
          // Espacios: renderizar sin animar para no romper el flow.
          if (/^\s+$/.test(unit)) {
            return (
              <span key={`s-${i}`} style={{ display: 'inline-block', whiteSpace: 'pre' }}>
                {unit}
              </span>
            );
          }
          return (
            <motion.span
              key={`u-${i}`}
              variants={unitVariants}
              style={{ display: 'inline-block', whiteSpace: 'pre' }}
            >
              {unit}
            </motion.span>
          );
        })}
      </motion.span>
    </Tag>
  );
};

export default SplitText;
