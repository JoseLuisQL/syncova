import js from '@eslint/js';
import globals from 'globals';
import reactHooks from 'eslint-plugin-react-hooks';
import reactRefresh from 'eslint-plugin-react-refresh';
import tseslint from 'typescript-eslint';

export default tseslint.config(
  {
    ignores: [
      'dist/**',
      'backend/dist/**',
      '.agents/**',
      '.factory/**',
      'docs/**',
      'src/components/Movimientos/Movimientos-old.tsx',
      'src/components/Planificacion/Planificacion-old.tsx',
      'src/components/Reportes/Reportes.old.tsx',
    ],
  },
  {
    extends: [js.configs.recommended, ...tseslint.configs.recommended],
    files: ['src/**/*.{ts,tsx}'],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
    },
    plugins: {
      'react-hooks': reactHooks,
      'react-refresh': reactRefresh,
    },
    rules: {
      ...reactHooks.configs.recommended.rules,
      '@typescript-eslint/no-explicit-any': 'warn',
      '@typescript-eslint/no-unused-vars': [
        'error',
        {
          argsIgnorePattern: '^_',
          varsIgnorePattern: '^_',
        },
      ],
      'react-refresh/only-export-components': [
        'warn',
        { allowConstantExport: true },
      ],
      // Prohibido importar 'framer-motion' directamente: el motor de animación
      // canónico de SIVAC es 'motion' (paquete v12, entry 'motion/react'), que
      // reexporta la misma API. Importar 'framer-motion' generaba una dep
      // transitiva frágil (no declarada en package.json). Ver Fase 0 del plan
      // de integración de React Bits (docs/REACTBITS_INTEGRATION_PLAN.md).
      'no-restricted-imports': [
        'error',
        {
          paths: [
            {
              name: 'framer-motion',
              message: "Usa 'motion/react' (paquete 'motion') en su lugar.",
            },
          ],
        },
      ],
    },
  },
  {
    extends: [js.configs.recommended, ...tseslint.configs.recommended],
    files: ['backend/src/**/*.ts', 'backend/prisma/**/*.ts', 'backend/scripts/**/*.ts'],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.node,
    },
    rules: {
      '@typescript-eslint/no-unused-vars': [
        'error',
        {
          argsIgnorePattern: '^_',
          varsIgnorePattern: '^_',
        },
      ],
    },
  },
  {
    files: ['backend/src/**/*.ts'],
    rules: {
      '@typescript-eslint/no-explicit-any': 'warn',
    },
  },
  {
    files: ['backend/prisma/**/*.ts', 'backend/scripts/**/*.ts', 'backend/src/**/*.d.ts'],
    rules: {
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-unused-vars': 'off',
      '@typescript-eslint/no-require-imports': 'off',
    },
  },
);
