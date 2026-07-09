# Plan: Integración de React Bits en el frontend de SIVAC

> React Bits (reactbits.dev) **no es una librería NPM tradicional**. Es una
> colección *copy-in* de componentes animados/vistosos (no botones ni inputs
> genéricos) para "destacar visualmente". No se agrega como dependencia: se
> copia el código de cada componente que se necesita y se adapta. Filosofía:
> prop-first, modular, dueño del código.

---

## 0. Diagnóstico y tensión de diseño (leer primero)

El sistema actual está definido en `DESIGN.md` como **"Clinical"**:
- "Hospital-grade legibility, but warm."
- Acento único (terciary `#0E9F8E`), **regla de acento único es load-bearing**.
- **"Don't introduce gradients. This system is flat on purpose."**
- Negativos/grises neutros, claridad extrema, datos densos.

React Bits es lo opuesto por defecto: gradientes, glow, ruido, movimiento.

**⇒ La integración debe ser SELECTIVA, no global.** Se usa React Bits solo en
**superficies de "momento"** (login, hero del dashboard, estados vacíos, carga,
errores, ayuda) donde el impacto emocional justifica la desviación, y **nunca**
en superficies clínicas de datos (tablas, formularios, kardex, inventario).
El sistema de diseño gobierna; React Bits se domestica con los tokens clínicos.

Reglas de oro heredadas de React Bits + DESIGN.md:
1. **Máx. 2–3 componentes React Bits por página.**
2. **Desactivar efectos en móvil** (placeholder estático o `prefers-reduced-motion`).
3. **Respetar acento único y "no gradientes"**: los componentes se re-tokenizan
   a la paleta clinical; donde React Bits impone gradiente, se aplana a solid.
4. **No acoplar dependencias transitivas frágiles** (ver refactor §4).

---

## 1. Estrategia de instalación

No instalar como paquete. Crear una carpeta interna que aisle el código copiado:

```
src/components/ui/reactbits/
  README.md            # origen, versión, licencia MIT, cómo actualizar
  _shared/
    prefersReducedMotion.ts   # hook utilitario
    useMobileDisable.ts       # hook para desactivar en móvil
  text/
    SplitText.tsx
    CountUp.tsx
    DecryptedText.tsx
    GradientText.tsx          # tokenizado: usar color solid, no gradiente
    ScrollReveal.tsx
  components/
    SpotlightCard.tsx
    TiltedCard.tsx
    Counter.tsx
    AnimatedList.tsx
  backgrounds/
    Aurora.tsx                # solo login, en paleta clinical
    DotGrid.tsx               # sutil, neutro
    Particles.tsx             # opcional
```

- Cada componente se **copia desde la pestaña Code (TS + Tailwind)** de reactbits.dev
  y se **re-tokeniza**: reemplazar colores hardcoded por tokens de
  `tailwind.config.js` (`brand`, `surface-soft`, `ink`, `muted`).
- Dependencias externas que algunos componentes necesitan: `gsap`, `lenis`,
  `ogl` (para backgrounds 3D). **Solo instalar las que el componente elegido
  exija**, y listarlas en el README del componente. Evitar backgrounds pesados
  (`LiquidChrome`, `Iridescence`, `Hyperspeed`) — son WebGL y rompen la promesa
  de legibilidad clínica en equipos modestos.

### Migración previa obligatoria (bloquea la integración limpia)

**Bug de dependencia de `motion`:** 5 archivos importan
`from 'framer-motion'` pero `package.json` solo declara `motion` (`^12.38.0`).
Hoy resuelve por transitividad (hoisting), lo cual es **frágil**: cualquier
`npm install` o update puede romper el dashboard.

Afecta a:
- `src/components/Dashboard/Dashboard.tsx`
- `src/components/Dashboard/DashboardLoader.tsx`
- `src/components/Dashboard/PermisosPlanificacion.tsx`
- `src/components/Dashboard/QuickPermissionsSection.tsx`
- `src/components/Dashboard/StatCard.tsx`

⇒ Refactor: unificar a `import { motion } from 'motion/react'` (API del paquete
`motion` v12) en los 5 archivos, y **este será el único motor de animación**
también para los componentes React Bits que usen framer-motion (la mayoría de
los text-animations y cards). Así queda una sola fuente de verdad.

---

## 2. Dónde integrar (por superficie) — mapa de oportunidades

| Superficie | Archivo | Componente React Bits | Justificación |
|---|---|---|---|
| **Login** (fondo + título) | `src/components/auth/LoginForm.tsx` | `Aurora` (bg, paleta clinical) + `SplitText` (título "SIVAC") | Único "momento" de marca; el resto del app es clínico. Sustituye la imagen `portada.png` estática por un fondo dinámico sutil. |
| **Hero del Dashboard** | `src/components/Dashboard/DashboardHeader.tsx` | `SplitText` o `DecryptedText` (saludo/bienvenida) | Un toque, no más. El header ya existe; solo se anima el título. |
| **StatCards (métricas)** | `src/components/Dashboard/StatCard.tsx` | `CountUp` (animación del número) | Ya usa `motion` para hover. Contar de 0→valor profesionaliza sin ruido. Reemplaza `value.toLocaleString()` estático. |
| **Estados vacíos** (listas sin datos) | a crear `src/components/common/EmptyState.tsx` | `SpotlightCard` (contenedor) + ilustración | Los estados vacíos actuales son texto plano; un contenedor con spotlight sutil mejora percepción. |
| **Estados de carga** | `src/components/common/LoadingSkeleton.tsx` + `Dashboard/LoadingStates.tsx` | `AnimatedList` (para feeds de actividad) | El feed de "Actividad reciente" del dashboard puede usar `AnimatedList` para entradas que aparecen progresivamente. |
| **Error Boundary** | `src/components/common/ErrorBoundary.tsx` | `DecryptedText` (mensaje) + `DotGrid` (bg sutil) | Una pantalla de error memorable pero sobria. |
| **SiBot (asistente IA, admin)** | `src/components/SiBot/SiBotFloating.tsx` | `Star Border` (borde del botón flotante) | Es el elemento "futurista" del sistema; encaja sin contradecir lo clínico porque está aislado. |

### Lo que **NO** se toca (superficies clínicas — mantener flat)
- Todas las **tablas** (Inventario, Kardex, Movimientos, Vales, Reportes).
- Todos los **formularios** (Planificación, Configuración, Usuarios).
- **Inputs, selects, modales, toasts** (`src/components/ui/primitives/`): ya
  están bien; React Bits no aporta aquí (no son su dominio).
- **Sidebar y Header** de layout: mantenerlos predecibles para uso diario.

---

## 3. Qué refactorizar (paralelo a la integración)

1. **Unificar `motion`** (§1): migrar `framer-motion` → `motion/react` en 5
   archivos. Es prerequisito y de por sí elimina deuda técnica.
2. **Centralizar tokens de animación**: añadir a `tailwind.config.js` una sección
   `animation`/`transition` clínica (durations cortos 150–300ms, easings
   `cubic-bezier` sobrios) para que los React Bits copiados consuman tokens y no
   valores sueltos. Esto mantiene coherencia con `DESIGN.md`.
3. **`prefers-reduced-motion` global**: hoy los componentes animan
   incondicionalmente. Crear `src/components/ui/reactbits/_shared/prefersReducedMotion.ts`
   y envolver los efectos en una guarda. Accesibilidad (a11y) — requerido en un
   sistema gubernamental de salud.
4. **Gate móvil**: hook `useMobileDisable` para renderizar versión estática de
   backgrounds/text-animations bajo `sm:`. Recomendación explícita de React Bits.
5. **Eliminar `console.log` de producción**: el código copiado de React Bits y
   varios services (`vacunaService.getActivas` tiene 4 `console.log`) dejan
   ruido. Pasar todo por `src/utils/debug.ts` (`logger`) que ya respeta
   `VITE_LOG_LEVEL`. Partir de los services al integrar.
6. **`vite.config.ts` manualChunks**: al añadir gsap/lenis, sumar chunk
   `'gsap': ['gsap']` para no inflar el bundle inicial (los React Bits se cargan
   en rutas lazy, así que igual conviene code-splitting por superficie).

---

## 4. Hoja de ruta por fases (entregable e incremental)

### Fase 0 — Cimientos (1 sesión, sin UI visible)
- [ ] Migrar `framer-motion` → `motion/react` en los 5 archivos. Verificar build.
- [ ] Crear `src/components/ui/reactbits/` + `_shared/` hooks (reduced-motion, mobile).
- [ ] Añadir tokens de animación a `tailwind.config.js`.
- [ ] Definir regla ESLint: prohibir `from 'framer-motion'`.

### Fase 1 — Login (impacto alto, riesgo bajo)
- [ ] Copiar `Aurora` (backgrounds) y `SplitText` (text). Re-tokenizar a clinical.
- [ ] En `LoginForm.tsx`: reemplazar `<img portada.png>` por `<Aurora>` con
      colores `ink`/`brand` muy apagados, overlay existente encima; animar
      título "SIVAC" con `SplitText`.
- [ ] Gate móvil: en `sm:` mostrar fondo sólido `bg-ink`.
- [ ] QA: login funciona, rate-limit intacto, a11y reduced-motion.

### Fase 2 — Dashboard (profesionalismo del dato)
- [ ] `CountUp` en `StatCard.tsx`: animar `value` de 0→valor con
      `duration` ~0.8s, respetando reduced-motion (render directo).
- [ ] `SplitText`/`DecryptedText` en `DashboardHeader.tsx` (solo saludo).
- [ ] `AnimatedList` en `ActividadSection.tsx` si hay feed de actividad.
- [ ] Verificar que `motion` hover existente sigue correcto.

### Fase 3 — Estados transversales (calidad percibida)
- [ ] `EmptyState` con `SpotlightCard` (componente a crear, reusar en todos los
      módulos que hoy muestran "No hay datos").
- [ ] `ErrorBoundary` con `DecryptedText` + `DotGrid`.
- [ ] `LoadingStates` con `AnimatedList` donde aplique.

### Fase 4 — Toque SiBot (opcional, admin)
- [ ] `Star Border` en el botón flotante de `SiBotFloating.tsx`.
- [ ] Validar que no afecta rendimiento del chat IA.

### Fase 5 — Gobierno y docs
- [ ] Actualizar `DESIGN.md`: sección "Motion & React Bits" con las reglas
      (máx 2-3/página, móvil off, acento único, no gradientes).
- [ ] `src/components/ui/reactbits/README.md` con origen, versión y mantenimiento.
- [ ] Lighthouse + react-doctor sobre las superficies tocadas.

---

## 5. Criterios de aceptación

- Build verde (`npm run build`) y lint limpio.
- `framer-motion` ya no aparece en ningún import (solo `motion/react`).
- En móvil y con `prefers-reduced-motion`, **cero** animaciones pesadas.
- Lighthouse Performance no baja más de ~3 pts en login/dashboard.
- Las superficies clínicas (tablas/formularios) visualmente **idénticas** a hoy.
- Tres usuarios piloto (admin/coordinador/operador) no reportan lentitud.

---

## 6. Riesgos y mitigaciones

| Riesgo | Mitigación |
|---|---|
| Romper la identidad "Clinical" | Re-tokenizar todo React Bits a la paleta; revisión con `design:lint`. |
| Inflar bundle / daño de perf | Solo en rutas lazy; `manualChunks`; medir Lighthouse pre/post. |
| WebGL en equipos modestos (Apurímac) | Evitar backgrounds 3D; preferir CSS/SVG (`Aurora`, `DotGrid`). |
| Dependencias transitivas rotas | Fase 0 resuelve `motion`; listar cada dep externa en README. |
| Accesibilidad | Hooks reduced-motion + móvil; audit axe-core. |
