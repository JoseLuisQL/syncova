import React from 'react';

/**
 * StarBorder — adaptación clínica del componente StarBorder de React Bits
 * (https://reactbits.dev/animations/star-border).
 *
 * Wrapper que dibuja dos "estrellas" radiales que orbitan por el borde del
 * elemento, dando un efecto de contorno luminoso sutil. Pensado para el botón
 * flotante de SiBot (asistente IA, admin) — el único elemento "futurista"
 * del sistema, aislado del resto clínico.
 *
 * Adaptaciones clínicas:
 * - El contenedor es transparente (no from-black/gray-900 del original).
 * - color por defecto brand (acento), no blanco.
 * - Respeta prefers-reduced-motion (sin animación → estático).
 *
 * Requiere los keyframes `star-movement-top/bottom` (definidos en index.css).
 */
type StarBorderProps<T extends React.ElementType> = React.ComponentPropsWithoutRef<T> & {
  as?: T;
  className?: string;
  children?: React.ReactNode;
  color?: string;
  speed?: React.CSSProperties['animationDuration'];
  thickness?: number;
};

const StarBorder = <T extends React.ElementType = 'div'>({
  as,
  className = '',
  color = '#7c3aed', // brand
  speed = '6s',
  thickness = 2,
  children,
  ...rest
}: StarBorderProps<T>) => {
  const Component = (as || 'div') as React.ElementType;

  return (
    <Component
      className={`relative inline-block overflow-hidden rounded-full ${className}`}
      {...(rest as React.HTMLAttributes<HTMLElement>)}
    >
      <div
        className="absolute w-[300%] h-[50%] opacity-70 bottom-[-11px] right-[-250%] rounded-full animate-star-movement-bottom z-0"
        style={{
          background: `radial-gradient(circle, ${color}, transparent 10%)`,
          animationDuration: speed,
        }}
        aria-hidden="true"
      />
      <div
        className="absolute w-[300%] h-[50%] opacity-70 top-[-10px] left-[-250%] rounded-full animate-star-movement-top z-0"
        style={{
          background: `radial-gradient(circle, ${color}, transparent 10%)`,
          animationDuration: speed,
        }}
        aria-hidden="true"
      />
      <div className="relative z-[1] h-full w-full" style={{ padding: `${thickness}px` }}>
        {children}
      </div>
    </Component>
  );
};

export default StarBorder;
