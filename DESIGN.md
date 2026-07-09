---
version: alpha
name: Clinical
description: Hospital-grade legibility, but warm.
colors:
  primary: "#0F2A3B"
  secondary: "#4F6B7C"
  tertiary: "#0E9F8E"
  neutral: "#F1F5F7"
  surface: "#FFFFFF"
  on-primary: "#FFFFFF"
typography:
  display:
    fontFamily: IBM Plex Sans
    fontSize: 3.5rem
    fontWeight: 600
    letterSpacing: "-0.02em"
  h1:
    fontFamily: IBM Plex Sans
    fontSize: 2rem
    fontWeight: 600
  body:
    fontFamily: IBM Plex Sans
    fontSize: 0.95rem
    lineHeight: 1.6
  label:
    fontFamily: IBM Plex Mono
    fontSize: 0.72rem
    letterSpacing: "0.04em"
rounded:
  sm: 4px
  md: 8px
  lg: 12px
spacing:
  sm: 8px
  md: 16px
  lg: 32px
components:
  app-shell:
    backgroundColor: "{colors.neutral}"
    textColor: "{colors.primary}"
  sidebar:
    backgroundColor: "{colors.neutral}"
    textColor: "{colors.primary}"
  card:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.primary}"
    rounded: "{rounded.lg}"
    padding: 24px
  muted-panel:
    backgroundColor: "{colors.neutral}"
    textColor: "{colors.primary}"
    rounded: "{rounded.md}"
    padding: 16px
  button-primary:
    backgroundColor: "{colors.tertiary}"
    textColor: "{colors.primary}"
    typography: "{typography.body}"
    rounded: "{rounded.md}"
    padding: 12px 20px
  button-primary-hover:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.on-primary}"
    rounded: "{rounded.md}"
  button-secondary:
    backgroundColor: "{colors.secondary}"
    textColor: "{colors.on-primary}"
    typography: "{typography.body}"
    rounded: "{rounded.md}"
    padding: 12px
  table-header:
    backgroundColor: "{colors.neutral}"
    textColor: "{colors.primary}"
    typography: "{typography.label}"
  metadata-label:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.secondary}"
    typography: "{typography.label}"
  divider:
    backgroundColor: "{colors.neutral}"
    textColor: "{colors.secondary}"
  metric:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.primary}"
    typography: "{typography.display}"
  highlight:
    backgroundColor: "{colors.tertiary}"
    textColor: "{colors.primary}"
    rounded: "{rounded.md}"
    padding: 8px
---

## Overview

Designed for healthcare and data-heavy interfaces. Neutral greys, thoughtful teal accent, extreme clarity at all sizes.

## Colors

The palette is built around high-contrast neutrals and a single accent that drives interaction.

- **Primary (`#0F2A3B`):** Headlines and core text.
- **Secondary (`#4F6B7C`):** Borders, captions, and metadata.
- **Tertiary (`#0E9F8E`):** The sole driver for interaction. Reserve it.
- **Neutral (`#F1F5F7`):** The page foundation.

## Typography

- **display:** IBM Plex Sans 3.5rem
- **h1:** IBM Plex Sans 2rem
- **body:** IBM Plex Sans 0.95rem
- **label:** IBM Plex Mono 0.72rem

## Do's and Don'ts

- **Do** use Tertiary for exactly one action per screen.
- **Do** let Neutral carry the composition — negative space is a feature.
- **Don't** introduce gradients. This system is flat on purpose.
- **Don't** mix Tertiary with alternate accents; the single-accent rule is load-bearing.

## Motion & React Bits

SIVAC integra componentes de [React Bits](https://reactbits.dev) (copy-in en
`src/components/ui/reactbits/`) para añadir profesionalismo en superficies de
"momento" — **no** en superficies clínicas de datos. El motor de animación
canónico es `motion` (paquete v12, entry `motion/react`); está **prohibido**
importar `framer-motion` (regla ESLint `no-restricted-imports`).

### Reglas
1. **Máx. 2–3 componentes React Bits por página.**
2. **Desactivar en móvil** (`useMobileDisable`) y con `prefers-reduced-motion`
   (`usePrefersReducedMotion`) — WCAG 2.3.3, obligatorio en sistema de salud.
3. **Re-tokenizar**: los componentes consumen `brand`/`ink`/`surface-soft`,
   no colores sueltos. Donde React Bits impone gradiente, aplanar a solid.
4. **No usar en tablas, formularios, inputs, modales** — mantenerlos flat.

### Dónde se aplica
| Superficie | Componente | Ubicación |
|---|---|---|
| Login | `DotGrid` (fondo) + `SplitText` (título) | `auth/LoginForm.tsx` |
| Dashboard métricas | `CountUp` | `Dashboard/StatCard.tsx` |
| Dashboard saludo | `SplitText` | `Dashboard/DashboardHeader.tsx` |
| Estados vacíos | `SpotlightCard` (vía `EmptyState`) | `common/EmptyState.tsx` |
| Error Boundary | `DecryptedText` + `DotGrid` | `common/ErrorBoundary.tsx` |
| SiBot (admin) | `StarBorder` (botón flotante) | `SiBot/SiBotFloating.tsx` |

### Tokens de animación (`tailwind.config.js`)
- Duraciones: `fast` 150ms, `base` 200ms, `slow` 300ms, `motion-1` 600ms,
  `motion-2` 800ms.
- Easings clínicos: `clinical`, `clinical-in`, `clinical-out`
  (`cubic-bezier(0.4, 0, 0.2, 1)` y variantes).
- Keyframes: `fade-in`, `fade-in-up`, `rb-dotgrid-drift`,
  `star-movement-top/bottom`.

Ver `src/components/ui/reactbits/README.md` para detalles de mantenimiento.
