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
  theme: {
    extend: {
      ...designMdTheme,
      colors: {
        ...designMdTheme.colors,
        hh: designMdTheme.colors,
        clinical: designMdTheme.colors,
        ...clinicalPalette,
      },
      fontFamily: {
        ...designMdTheme.fontFamily,
        sans: ['"IBM Plex Sans"', 'system-ui', '-apple-system', 'BlinkMacSystemFont', '"Segoe UI"', 'Roboto', '"Helvetica Neue"', 'Arial', 'sans-serif'],
        mono: ['"IBM Plex Mono"', '"SFMono-Regular"', 'Consolas', '"Liberation Mono"', 'monospace'],
      },
      fontSize: {
        ...designMdTheme.fontSize,
        body: ['0.95rem', { lineHeight: '1.6' }],
      },
    },
  },
  plugins: [],
};
