import React, { SVGProps } from 'react';

export const SiBotLogo: React.FC<SVGProps<SVGSVGElement>> = ({ className = '', ...props }) => {
  return (
    <svg 
      viewBox="0 0 100 100" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg" 
      className={`sibot-svg block overflow-visible ${className}`} 
      {...props}
    >
      <style>
        {`
          /* Base interactiva súper suave */
          .sibot-svg {
             cursor: pointer;
          }
          
          /* Animaciones naturales, distancias cortas y tiempos largos */
          @keyframes sibot-float {
            0%, 100% { transform: translateY(0px); }
            50% { transform: translateY(-2.5px); }
          }
          
          @keyframes sibot-float-ear {
            0%, 100% { transform: translateY(0px) rotate(0deg); }
            50% { transform: translateY(-2px) rotate(2deg); }
          }

          @keyframes sibot-blink {
            0%, 46%, 49%, 100% { transform: scaleY(1); }
            47.5% { transform: scaleY(0.1); }
          }

          @keyframes sibot-look {
            0%, 35% { transform: translateX(0); }
            40%, 55% { transform: translateX(-1.5px); }
            65%, 85% { transform: translateX(1.5px); }
            90%, 100% { transform: translateX(0); }
          }

          @keyframes sibot-pulse {
            0%, 100% { opacity: 0.6; transform: scale(0.95); }
            50% { opacity: 1; transform: scale(1.05); }
          }

          /* Cabezal principal: Movimiento fluido de respiración */
          .sibot-head-main {
            animation: sibot-float 5s ease-in-out infinite;
            transform-origin: 50px 50px;
            transition: transform 0.6s cubic-bezier(0.25, 1, 0.5, 1);
          }
          .sibot-svg:hover .sibot-head-main {
            transform: translateY(-2px);
          }

          /* Rostro: Movimiento sutil buscando al usuario o entorno */
          .sibot-face {
            animation: sibot-look 10s ease-in-out infinite;
            transform-origin: 50% 50%;
            transition: transform 0.6s cubic-bezier(0.25, 1, 0.5, 1);
          }
          .sibot-svg:hover .sibot-face {
            animation: none; 
            transform: translateX(0) scale(1.02) translateY(-1px);
          }

          /* Pestañeos tranquilos */
          .sibot-eye {
            transform-origin: 50px 48px;
            animation: sibot-blink 6s ease-in-out infinite;
          }

          /* Luz superior: Latido de máquina sutil */
          .sibot-light {
            transform-origin: 50px 8px;
            animation: sibot-pulse 3s ease-in-out infinite;
            transition: all 0.5s ease;
          }
          .sibot-svg:hover .sibot-light {
             animation: sibot-pulse 1.5s ease-in-out infinite;
             fill: #ffffff;
          }

          /* Transiciones de forma cruzada orgánica en los ojos */
          .sibot-normal-eyes { 
            opacity: 1; 
            transition: opacity 0.4s ease, transform 0.6s cubic-bezier(0.25, 1, 0.5, 1); 
            transform-origin: 50% 50%;
          }
          .sibot-happy-eyes { 
            opacity: 0; 
            transform: scale(0.7) translateY(2px); 
            transform-origin: 50% 50%; 
            transition: opacity 0.4s ease, transform 0.6s cubic-bezier(0.25, 1, 0.5, 1); 
          }
          
          .sibot-svg:hover .sibot-normal-eyes { opacity: 0; transform: scale(0.7) translateY(2px); }
          .sibot-svg:hover .sibot-happy-eyes { opacity: 1; transform: scale(1) translateY(0); }

          /* Sonrisa suavemente responsiva */
          .sibot-mouth { transition: transform 0.6s cubic-bezier(0.25, 1, 0.5, 1); transform-origin: 50% 50%; }
          .sibot-svg:hover .sibot-mouth { transform: translateY(-1.5px) scale(1.05); }

          /* Rubor sutil sin volverse agresivo */
          .sibot-cheek { transition: all 0.6s cubic-bezier(0.25, 1, 0.5, 1); opacity: 0.15; }
          .sibot-svg:hover .sibot-cheek { opacity: 0.4; transform: scale(1.1); transform-origin: 50% 50%; }

          /* Orejeras asíncronas para simular gravedad y flotabilidad reales */
          .sibot-ear-left { animation: sibot-float-ear 4s ease-in-out infinite alternate; transform-origin: 12px 50px; }
          .sibot-ear-right { animation: sibot-float-ear 4.5s ease-in-out infinite alternate-reverse; transform-origin: 88px 50px; }
        `}
      </style>

      {/* Estructura Principal Flotante agrupada */}
      <g className="sibot-head-main">
        
        {/* --- Holograma de Conexión (Antena Flotante y Luz) --- */}
        <circle cx="50" cy="8" r="4.5" fill="currentColor" className="sibot-light" />
        <rect x="47" y="15" width="6" height="5" rx="2.5" fill="currentColor" opacity="0.4" />

        {/* --- Orejeras Suspendidas Magneticamente (Flotan por fuera de la cabeza) --- */}
        <g className="sibot-ear-left">
          <rect x="9" y="42" width="7" height="18" rx="3.5" fill="currentColor" opacity="0.5" />
        </g>
        <g className="sibot-ear-right">
          <rect x="84" y="42" width="7" height="18" rx="3.5" fill="currentColor" opacity="0.5" />
        </g>

        {/* --- Cabeza del Bot (Simétrica, ancha y estética tipo Mac/AstroBot) --- */}
        <rect x="20" y="24" width="60" height="56" rx="22" fill="currentColor" fillOpacity="0.12" stroke="currentColor" strokeWidth="5.5" />
        
        {/* --- Rostro (Tiene su propia animación para "mirar a los lados") --- */}
        <g className="sibot-face">
          
          {/* Chapitas de Rubor */}
          <circle cx="29" cy="56" r="4.5" fill="currentColor" className="sibot-cheek" />
          <circle cx="71" cy="56" r="4.5" fill="currentColor" className="sibot-cheek" />

          {/* Ojos en estado natural (parpadeando) */}
          <g className="sibot-normal-eyes">
            <g className="sibot-eye">
              <rect x="31" y="42" width="8" height="12" rx="4" fill="currentColor" />
              <rect x="61" y="42" width="8" height="12" rx="4" fill="currentColor" />
            </g>
          </g>

          {/* Ojos Felices y emocionados ( ^  ^ ) que aparecen en el Hover */}
          <g className="sibot-happy-eyes">
            <path d="M 28 47 Q 35 37 42 47" stroke="currentColor" strokeWidth="5" strokeLinecap="round" fill="none" />
            <path d="M 58 47 Q 65 37 72 47" stroke="currentColor" strokeWidth="5" strokeLinecap="round" fill="none" />
          </g>

          {/* Sonrisa simétrica y optimista */}
          <path d="M 43 63 Q 50 71 57 63" stroke="currentColor" strokeWidth="4.5" strokeLinecap="round" fill="none" className="sibot-mouth" />
        </g>
      </g>
    </svg>
  );
};
