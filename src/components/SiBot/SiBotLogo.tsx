import React, { SVGProps, useId } from 'react';

interface SiBotLogoProps extends SVGProps<SVGSVGElement> {
  aurora?: boolean;
}

export const SiBotLogo: React.FC<SiBotLogoProps> = ({
  className = '',
  aurora = false,
  ...props
}) => {
  const uid = useId().replace(/:/g, '');
  const gradStrokeId = `sibot-aurora-stroke-${uid}`;
  const gradFillId = `sibot-aurora-fill-${uid}`;
  const gradGlowId = `sibot-aurora-glow-${uid}`;

  const strokeValue = aurora ? `url(#${gradStrokeId})` : 'currentColor';
  const fillValue = aurora ? `url(#${gradStrokeId})` : 'currentColor';

  return (
    <svg
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`sibot-svg block overflow-visible ${className}`}
      {...props}
    >
      <defs>
        <linearGradient id={gradStrokeId} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#ffffff">
            <animate
              attributeName="stop-color"
              values="#ffffff;#a5f3fc;#f5d0fe;#ffffff"
              dur="4.5s"
              repeatCount="indefinite"
            />
          </stop>
          <stop offset="50%" stopColor="#e0e7ff">
            <animate
              attributeName="stop-color"
              values="#e0e7ff;#f0abfc;#67e8f9;#e0e7ff"
              dur="4.5s"
              repeatCount="indefinite"
            />
          </stop>
          <stop offset="100%" stopColor="#c4b5fd">
            <animate
              attributeName="stop-color"
              values="#c4b5fd;#6ee7b7;#c4b5fd;#c4b5fd"
              dur="4.5s"
              repeatCount="indefinite"
            />
          </stop>
        </linearGradient>

        <radialGradient id={gradFillId} cx="50%" cy="35%" r="65%">
          <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.32" />
          <stop offset="55%" stopColor="#a855f7" stopOpacity="0.22" />
          <stop offset="100%" stopColor="#ec4899" stopOpacity="0.08" />
        </radialGradient>

        <radialGradient id={gradGlowId} cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#67e8f9" stopOpacity="0.95" />
          <stop offset="100%" stopColor="#a855f7" stopOpacity="0" />
        </radialGradient>
      </defs>

      <style>
        {`
          .sibot-svg {
            cursor: pointer;
          }

          @keyframes sibot-float {
            0%, 100% { transform: translateY(0px); }
            50% { transform: translateY(-3px); }
          }

          @keyframes sibot-float-ear {
            0%, 100% { transform: translateY(0px) rotate(0deg); }
            50% { transform: translateY(-2.5px) rotate(3deg); }
          }

          @keyframes sibot-blink {
            0%, 45%, 49%, 100% { transform: scaleY(1); }
            47% { transform: scaleY(0.1); }
          }

          @keyframes sibot-look {
            0%, 35% { transform: translateX(0); }
            42%, 56% { transform: translateX(-1.8px); }
            66%, 84% { transform: translateX(1.8px); }
            92%, 100% { transform: translateX(0); }
          }

          @keyframes sibot-pulse {
            0%, 100% { opacity: 0.72; transform: scale(0.92); }
            50% { opacity: 1; transform: scale(1.18); }
          }

          @keyframes sibot-sparkle {
            0%, 100% { opacity: 0.25; transform: scale(0.75) rotate(0deg); }
            50% { opacity: 1; transform: scale(1.15) rotate(18deg); }
          }

          .sibot-head-main {
            animation: sibot-float 4.2s ease-in-out infinite;
            transform-origin: 50px 50px;
            transition: transform 0.5s cubic-bezier(0.22, 1, 0.36, 1);
          }
          .group:hover .sibot-head-main,
          .sibot-svg:hover .sibot-head-main {
            transform: translateY(-2.5px) scale(1.04);
          }

          .sibot-face {
            animation: sibot-look 8.5s ease-in-out infinite;
            transform-origin: 50% 50%;
            transition: transform 0.5s cubic-bezier(0.22, 1, 0.36, 1);
          }
          .group:hover .sibot-face,
          .sibot-svg:hover .sibot-face {
            animation: none;
            transform: translateX(0) scale(1.03) translateY(-1px);
          }

          .sibot-eye {
            transform-origin: 50px 48px;
            animation: sibot-blink 5.2s ease-in-out infinite;
          }

          .sibot-light {
            transform-origin: 50px 8px;
            animation: sibot-pulse 2.4s ease-in-out infinite;
          }

          .sibot-sparkle-1 {
            transform-origin: 84px 18px;
            animation: sibot-sparkle 3.1s ease-in-out infinite;
          }

          .sibot-sparkle-2 {
            transform-origin: 16px 22px;
            animation: sibot-sparkle 3.8s ease-in-out infinite 1.2s;
          }

          .sibot-normal-eyes {
            opacity: 1;
            transition: opacity 0.32s ease, transform 0.45s cubic-bezier(0.22, 1, 0.36, 1);
            transform-origin: 50% 50%;
          }
          .sibot-happy-eyes {
            opacity: 0;
            transform: scale(0.72) translateY(2px);
            transform-origin: 50% 50%;
            transition: opacity 0.32s ease, transform 0.45s cubic-bezier(0.22, 1, 0.36, 1);
          }

          .group:hover .sibot-normal-eyes,
          .sibot-svg:hover .sibot-normal-eyes {
            opacity: 0;
            transform: scale(0.72) translateY(2px);
          }
          .group:hover .sibot-happy-eyes,
          .sibot-svg:hover .sibot-happy-eyes {
            opacity: 1;
            transform: scale(1) translateY(0);
          }

          .sibot-mouth {
            transition: transform 0.45s cubic-bezier(0.22, 1, 0.36, 1);
            transform-origin: 50% 50%;
          }
          .group:hover .sibot-mouth,
          .sibot-svg:hover .sibot-mouth {
            transform: translateY(-1.5px) scale(1.08);
          }

          .sibot-cheek {
            transition: all 0.45s cubic-bezier(0.22, 1, 0.36, 1);
            opacity: 0.22;
          }
          .group:hover .sibot-cheek,
          .sibot-svg:hover .sibot-cheek {
            opacity: 0.5;
            transform: scale(1.15);
            transform-origin: 50% 50%;
          }

          .sibot-ear-left {
            animation: sibot-float-ear 3.6s ease-in-out infinite alternate;
            transform-origin: 12px 50px;
          }
          .sibot-ear-right {
            animation: sibot-float-ear 4.1s ease-in-out infinite alternate-reverse;
            transform-origin: 88px 50px;
          }
        `}
      </style>

      <g className="sibot-head-main">
        {/* Destellos IA orbitales en modo Aurora */}
        {aurora && (
          <>
            <path
              d="M84 11 L85.8 16.2 L91 18 L85.8 19.8 L84 25 L82.2 19.8 L77 18 L82.2 16.2 Z"
              fill="#a5f3fc"
              className="sibot-sparkle-1"
            />
            <circle cx="16" cy="22" r="3" fill="#f0abfc" className="sibot-sparkle-2" />
            <circle cx="50" cy="8" r="10" fill={`url(#${gradGlowId})`} className="sibot-light" />
          </>
        )}

        {/* Antena de Conexión IA */}
        <circle cx="50" cy="8" r="4.8" fill={aurora ? '#67e8f9' : fillValue} className="sibot-light" />
        <rect x="47" y="15" width="6" height="5" rx="2.5" fill={fillValue} opacity="0.55" />

        {/* Orejeras Suspendidas Magnéticamente */}
        <g className="sibot-ear-left">
          <rect x="8.5" y="42" width="7" height="18" rx="3.5" fill={fillValue} opacity="0.65" />
        </g>
        <g className="sibot-ear-right">
          <rect x="84.5" y="42" width="7" height="18" rx="3.5" fill={fillValue} opacity="0.65" />
        </g>

        {/* Cabeza del Bot */}
        <rect
          x="20"
          y="24"
          width="60"
          height="56"
          rx="22"
          fill={aurora ? `url(#${gradFillId})` : 'currentColor'}
          fillOpacity={aurora ? '1' : '0.12'}
          stroke={strokeValue}
          strokeWidth="5.5"
        />

        {/* Rostro Expresivo */}
        <g className="sibot-face">
          <circle cx="29" cy="56" r="4.5" fill={aurora ? '#f472b6' : fillValue} className="sibot-cheek" />
          <circle cx="71" cy="56" r="4.5" fill={aurora ? '#38bdf8' : fillValue} className="sibot-cheek" />

          {/* Ojos en estado natural */}
          <g className="sibot-normal-eyes">
            <g className="sibot-eye">
              <rect x="31" y="42" width="8.5" height="12.5" rx="4.25" fill={fillValue} />
              <rect x="60.5" y="42" width="8.5" height="12.5" rx="4.25" fill={fillValue} />
            </g>
          </g>

          {/* Ojos felices al pasar el cursor */}
          <g className="sibot-happy-eyes">
            <path
              d="M 28 47 Q 35 37 42 47"
              stroke={strokeValue}
              strokeWidth="5"
              strokeLinecap="round"
              fill="none"
            />
            <path
              d="M 58 47 Q 65 37 72 47"
              stroke={strokeValue}
              strokeWidth="5"
              strokeLinecap="round"
              fill="none"
            />
          </g>

          {/* Sonrisa */}
          <path
            d="M 43 63 Q 50 71 57 63"
            stroke={strokeValue}
            strokeWidth="4.5"
            strokeLinecap="round"
            fill="none"
            className="sibot-mouth"
          />
        </g>
      </g>
    </svg>
  );
};
