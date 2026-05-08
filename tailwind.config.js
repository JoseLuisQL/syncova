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
  amber: {
    50: '#f9fbfc',
    100: '#f1f5f7',
    200: '#e5edf1',
    300: '#cbd9e0',
    400: '#a9bfca',
    500: '#7894a4',
    600: '#4f6b7c',
    700: '#334d5d',
    800: '#243c4c',
    900: '#0f2a3b',
    950: '#06141f',
  },
  rose: {
    50: '#f9fbfc',
    100: '#f1f5f7',
    200: '#e5edf1',
    300: '#cbd9e0',
    400: '#a9bfca',
    500: '#7894a4',
    600: '#4f6b7c',
    700: '#334d5d',
    800: '#243c4c',
    900: '#0f2a3b',
    950: '#06141f',
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
  blue: {
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
