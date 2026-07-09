import { readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));

const loadDesignMdTheme = () => {
  try {
    const themePath = resolve(__dirname, 'src/styles/designMdTailwindTheme.json');
    return JSON.parse(readFileSync(themePath, 'utf8'));
  } catch {
    return {};
  }
};

const designMdTheme = loadDesignMdTheme();

const clinicalPalette = {
  teal: {
    50: '#e8f7f5',
    100: '#c8eeea',
    200: '#96ddd5',
    300: '#5ec8bd',
    400: '#2eb2a4',
    500: '#0e9f8e',
    600: '#0e9f8e',
    700: '#0a8276',
    800: '#08665e',
    900: '#064c47',
    950: '#03302d',
  },
  zinc: {
    50: '#f1f5f7',
    100: '#e5edf1',
    200: '#cbd9e0',
    300: '#a9bfca',
    400: '#7894a4',
    500: '#4f6b7c',
    600: '#334d5d',
    700: '#243c4c',
    800: '#0f2a3b',
    900: '#0b1f2d',
    950: '#06141f',
  },
  // Paleta amber restaurada (antes neutralizada a zinc, rompia ~298 usos de warning/advertencia).
  // Valores estandar de Tailwind para que los estados semanticos (warning) se vean ambar reales.
  amber: {
    50: '#fffbeb',
    100: '#fef3c7',
    200: '#fde68a',
    300: '#fcd34d',
    400: '#fbbf24',
    500: '#f59e0b',
    600: '#d97706',
    700: '#b45309',
    800: '#92400e',
    900: '#78350f',
    950: '#451a03',
  },
  // Paleta rose restaurada (antes neutralizada a zinc, rompia ~509 usos de danger/error).
  // Valores estandar de Tailwind para que los estados semanticos (danger) se vean rojos reales.
  rose: {
    50: '#fff1f2',
    100: '#ffe4e6',
    200: '#fecdd3',
    300: '#fda4af',
    400: '#fb7185',
    500: '#f43f5e',
    600: '#e11d48',
    700: '#be123c',
    800: '#9f1239',
    900: '#881337',
    950: '#4c0519',
  },
  emerald: {
    50: '#e8f7f5',
    100: '#c8eeea',
    200: '#96ddd5',
    300: '#5ec8bd',
    400: '#2eb2a4',
    500: '#0e9f8e',
    600: '#0a8276',
    700: '#08665e',
    800: '#064c47',
    900: '#03302d',
    950: '#021f1d',
  },
  // Paleta blue restaurada (antes neutralizada a zinc, rompia ~135 usos de info).
  // Valores estandar de Tailwind para que los estados semanticos (info) se vean azules reales.
  blue: {
    50: '#eff6ff',
    100: '#dbeafe',
    200: '#bfdbfe',
    300: '#93c5fd',
    400: '#60a5fa',
    500: '#3b82f6',
    600: '#2563eb',
    700: '#1d4ed8',
    800: '#1e40af',
    900: '#1e3a8a',
    950: '#172554',
  },
};

/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      ...designMdTheme,
      colors: {
        ...designMdTheme.colors,
        hh: designMdTheme.colors,
        clinical: designMdTheme.colors,
        ...clinicalPalette,
        // Tokens semánticos del sistema. Implementados como CSS variables con
        // soporte de alpha (<alpha-value>) para que `bg-ink/50`, `text-brand/70`
        // etc. funcionen. Las variables se definen en index.css bajo :root
        // (light) y .dark (dark mode), de modo que TODOS los componentes que
        // usan estos tokens se adaptan automáticamente al tema sin tocar cada
        // archivo. Ver DESIGN.md "Motion & React Bits" y la sección de theming.
        brand: {
          DEFAULT: 'rgb(var(--color-brand) / <alpha-value>)',
          600: 'rgb(var(--color-brand-600) / <alpha-value>)',
          50: 'rgb(var(--color-brand-50) / <alpha-value>)',
          100: 'rgb(var(--color-brand-100) / <alpha-value>)',
        },
        ink: {
          DEFAULT: 'rgb(var(--color-ink) / <alpha-value>)',
          soft: 'rgb(var(--color-ink-soft) / <alpha-value>)',
        },
        muted: {
          DEFAULT: 'rgb(var(--color-muted) / <alpha-value>)',
          2: 'rgb(var(--color-muted-2) / <alpha-value>)',
          3: 'rgb(var(--color-muted-3) / <alpha-value>)',
        },
        line: {
          DEFAULT: 'rgb(var(--color-line) / <alpha-value>)',
          soft: 'rgb(var(--color-line-soft) / <alpha-value>)',
          strong: 'rgb(var(--color-line-strong) / <alpha-value>)',
          focus: 'rgb(var(--color-line-focus) / <alpha-value>)',
          'focus-strong': 'rgb(var(--color-line-focus-strong) / <alpha-value>)',
        },
        surface: {
          DEFAULT: 'rgb(var(--color-surface) / <alpha-value>)',
          soft: 'rgb(var(--color-surface-soft) / <alpha-value>)',
          tint: 'rgb(var(--color-surface-tint) / <alpha-value>)',
        },
        // Fondo de la app (page background), token dedicado para dark mode.
        app: 'rgb(var(--color-app) / <alpha-value>)',
      },
      fontFamily: {
        ...designMdTheme.fontFamily,
        sans: ['"IBM Plex Sans"', 'system-ui', '-apple-system', 'BlinkMacSystemFont', '"Segoe UI"', 'Roboto', '"Helvetica Neue"', 'Arial', 'sans-serif'],
        mono: ['"IBM Plex Mono"', '"SFMono-Regular"', 'Consolas', '"Liberation Mono"', 'monospace'],
      },
      fontSize: {
        ...designMdTheme.fontSize,
        // Escala tipográfica canonica del design system de SIVAC.
        // Reemplaza los 12+ valores text-[Npx] arbitrarios por una escala nombrada.
        // Mapeo: xs=11px, sm=12px, base=13px, md=14px, lg=16px, xl=18px, 2xl=24px, display=34px.
        xs: ['0.6875rem', { lineHeight: '1rem' }],
        sm: ['0.75rem', { lineHeight: '1.1rem' }],
        base: ['0.8125rem', { lineHeight: '1.25rem' }],
        md: ['0.875rem', { lineHeight: '1.3rem' }],
        lg: ['1rem', { lineHeight: '1.5rem' }],
        xl: ['1.125rem', { lineHeight: '1.6rem' }],
        '2xl': ['1.5rem', { lineHeight: '2rem' }],
        body: ['0.95rem', { lineHeight: '1.6' }],
        display: ['3.5rem', { letterSpacing: '-0.02em', fontWeight: '600' }],
      },
      borderRadius: {
        ...designMdTheme.borderRadius,
        // Escala de radios canonica del design system de SIVAC.
        // Reemplaza los 20+ valores rounded-[Npx] arbitrarios por una escala nombrada.
        // Mapeo: sm=6px, md=8px, lg=10px, xl=14px, 2xl=16px, 3xl=18px, 4xl=24px.
        // 'full' se mantiene de Tailwind para avatares y pills.
        DEFAULT: '8px',
        sm: '6px',
        md: '8px',
        lg: '10px',
        xl: '14px',
        '2xl': '16px',
        '3xl': '18px',
        '4xl': '24px',
      },
      // Tokens de animación clínicos (sobrios). Los componentes de React Bits
      // (ui/reactbits/) y cualquier superficie animada DEBEN consumir estos
      // tokens en lugar de duraciones/easings sueltos, para mantener la
      // coherencia con DESIGN.md ("flat on purpose", legibilidad hospitalaria).
      // Duraciones cortas (150-400ms), easings estándar, sin rebotes llamativos.
      transitionDuration: {
        ...designMdTheme.transitionDuration,
        fast: '150ms',
        base: '200ms',
        slow: '300ms',
        'motion-1': '600ms', // entradas de texto/hero (React Bits)
        'motion-2': '800ms', // count-up de métricas
      },
      transitionTimingFunction: {
        ...designMdTheme.transitionTimingFunction,
        clinical: 'cubic-bezier(0.4, 0, 0.2, 1)', // Material standard, sobrio
        'clinical-in': 'cubic-bezier(0.4, 0, 1, 1)',
        'clinical-out': 'cubic-bezier(0, 0, 0.2, 1)',
      },
      keyframes: {
        ...designMdTheme.keyframes,
        'fade-in': {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        'fade-in-up': {
          '0%': { opacity: '0', transform: 'translateY(8px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
      animation: {
        ...designMdTheme.animation,
        'fade-in': 'fade-in 200ms cubic-bezier(0, 0, 0.2, 1)',
        'fade-in-up': 'fade-in-up 300ms cubic-bezier(0, 0, 0.2, 1)',
      },
    },
  },
  plugins: [],
};
