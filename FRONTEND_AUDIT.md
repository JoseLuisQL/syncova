# SIVAC / Syncova - Analisis de Diseno Frontend

**Repo:** https://github.com/JoseLuisQL/syncova.git
**App:** SIVAC - Sistema de Gestion de Vacunas (DISA Apurimac II)
**Stack:** React 18 + TypeScript + Vite 5 + Tailwind CSS 3 + React Router 6
**Dev server:** `npm run dev` en http://localhost:5173 (corriendo, HTTP 200)
**Fecha del analisis:** 2026-07-07

---

## Design Read (segun metodologia de auditoria)

> *Reading this as: government health logistics dashboard (SIVAC / DISA Apurimac II) for public-sector health workers, with a clinical-but-administrative language, leaning toward a custom Tailwind component system (Linear / Vercel-inspired) that has drifted away from its DESIGN.md clinical-teal intent.*

**Diales inferidos del sitio actual (auditoria, no baseline):**
- `DESIGN_VARIANCE: 3-4` - grids simetricos, layout admin predecible
- `MOTION_INTENSITY: 3-4` - algunos fades con framer-motion en Dashboard, mayormente estatico
- `VISUAL_DENSITY: 5-6` - tablas densas, paneles admin cargados

**Modo de rediseno detectado:** Redesign - Overhaul (la deuda visual es estructural: no hay design system unificado, hay 3 paletas compitiendo). Preservar IA, contenido, rutas, copy.

---

## 1. Resumen ejecutivo

El frontend de SIVAC es **funcionalmente solido** (arquitectura correcta, code-splitting, contexts, hooks por feature, formularios con validacion) pero sufre una **fragmentacion critica del design system**: tres paletas de color distintas conviven sin coordinacion, las paletas semanticas (rose/amber/blue) estan neutralizadas a gris por la config de Tailwind rompiendo cientos de componentes, y no existe una component library unificada (cada vista reescribe sus propias clases con hex literales).

**Hallazgo mas grave:** ~800 referencias a `rose-*` (509) y `amber-*` (298) se renderizan como gris porque `tailwind.config.js` reemplaza esas paletas por copias de zinc. Botones de eliminar, asteriscos de requerido, alertas de error y stock critico se ven grises en lugar de rojos/ambars.

**Recomendacion de direccion:** Adoptar el sistema purpura-grey "Linear-like" de facto (es el 90% del codigo), restaurar las paletas semanticas rose/amber/blue para que funcionen como colores de estado, y consolidar las 3 escalas de gris (zinc/gray/slate) en una sola. Es menos trabajo que restaurar el Clinical teal del DESIGN.md y refleja lo ya construido.

---

## 2. Stack y arquitectura

### 2.1 Frontend (`src/`)
- React 18 + TypeScript (strict mode) + Vite 5
- Tailwind CSS 3.4 + PostCSS + autoprefixer
- React Router 6 con rutas protegidas por rol
- 21 directorios de features bajo `src/components/`
- 11 modulos: Dashboard, Establecimientos, Inventario, Movimientos, Planificacion, ICI DEMID, Kardex, Reportes, Alertas, Usuarios, Configuracion
- Code-splitting por modulo via `React.lazy` en `src/components/routing/AppRoutes.tsx`
- Contextos: App, Auth, Toast, Alertas
- Iconografia mixta: `@phosphor-icons/react` (mayoria) + `lucide-react` (Dashboard, Toast, StatCard)
- Fuentes: IBM Plex Sans + IBM Plex Mono via `@fontsource` (autohospedadas, correcto)
- Animacion: `motion` (framer-motion alias) + animaciones CSS custom

### 2.2 Backend (no analizado a fondo, sin DB levantada)
- Node + Express + TypeScript + Prisma ORM + PostgreSQL
- Puerto 3001, JWT + RBAC, Joi validation, Helmet, rate limiting

### 2.3 Lo que esta bien (preservar)
- Arquitectura de code-splitting y lazy loading por modulo
- Contextos bien separados (Auth, Toast, Alertas, App)
- `LoginForm`: validacion cliente, rate-limit handling, accesibilidad (aria-invalid, aria-describedby, focus management)
- `ModalElements.tsx`: API limpia y reutilizable (Modal, SideSheet, FormField, TextInput, SelectInput, MultiSelectInput, DateInput, DeleteConfirmModal, ModalFooter)
- `Sidebar`: colapsable, responsive, tooltips, badges, user menu con click-outside, accesibilidad
- `designTokens.ts`: estructura correcta (surfaces / text / border / semantic / chart)
- `index.css`: respetas `prefers-reduced-motion`, usa `100dvh` (no `h-screen`)

---

## 3. Hallazgos criticos

### 3.1 CRITICO - Tres sistemas de diseño compitiendo

El `DESIGN.md` define un sistema "Clinical" (teal `#0E9F8E` unico, zinc clinical `#0F2A3B` / `#4F6B7C`, neutro `#F1F5F7`, IBM Plex). Pero el codigo real usa **tres paletas distintas** sin coordinar:

| Sistema | Paleta | Uso (aprox) | Donde |
|---|---|---|---|
| **Clinical (DESIGN.md)** | teal `#0E9F8E`, primary `#0F2A3B`, secondary `#4F6B7C`, neutral `#F1F5F7` | ~62 referencias | `designTokens.ts`, `StatCard`, `index.css`, `DESIGN.md`. Casi testimonial. |
| **Purpura-grey "Linear-like"** | accent `#7c3aed`, text `#15171d`, border `#e7e7ef`, hover `#fbfafd`, muted `#8b8f9b` | ~2000+ referencias | `ModalConstants.ts`, `Sidebar`, `Header`, `Inventario/constants.ts`, `LoginForm`, todos los modals. **Sistema de facto.** |
| **Slate "Vercel-like"** | bg `#f8fafc`, border `#dfe4eb`, text `#111827`, teal distinto `#35bfa8` / `#34bda6` | ~141 referencias | `DashboardHeader.tsx`, `GestionVacunas.tsx`. Un cuarto teal que no es el clinical. |

**Cuantificacion de hex literals en `src/`** (top 15):

| Hex | Count | Rol |
|---|---|---|
| `#e7e7ef` | 466 | border purpura-grey |
| `#15171d` | 316 | texto primario purpura-grey |
| `#fbfafd` | 291 | hover / surface soft purpura-grey |
| `#7c3aed` | 205 | accent purpura (boton primario) |
| `#606571` | 169 | texto secundario purpura-grey |
| `#eeeef3` | 146 | divider purpura-grey |
| `#8b8f9b` | 143 | muted purpura-grey |
| `#dedfea` | 124 | border focus purpura-grey |
| `#d7d8e2` | 104 | border hover purpura-grey |
| `#babdca` | 53 | border focus-strong purpura-grey |
| `#111318` | 48 | overlay / texto oscuro purpura-grey |
| `#747986` | 42 | texto terciario purpura-grey |
| `#6d28d9` | 27 | accent hover purpura |
| `#4F6B7C` | 29 | secondary clinical (casi no se usa) |
| `#0F2A3B` | 14 | primary clinical (casi no se usa) |

**Color de fondo del body segun componente:**
- `App.tsx`: `bg-[#f0eff4]` (purpura-grey lavanda)
- `index.css` body: `var(--clinical-neutral)` = `#f1f5f7` (clinical)
- `designTokens.ts` surfaces.app: `bg-zinc-50`
- `DashboardHeader`: `bg-[#f8fafc]` (slate)
- `Dashboard.tsx`: `bg-[#f0eff4]` + `text-[#111827]`

Resultado: cada vista se ve de un color de fondo distinto. El usuario percibe que "cambio de sitio" al navegar.

### 3.2 CRITICO - Paletas semanticas neutralizadas (bugs visuales)

`tailwind.config.js` lineas 45-96 reemplazan `amber`, `rose` y `blue` por copias exactas de `zinc`. La intencion fue "forzar acento unico teal", pero la consecuencia es que **cualquier `bg-rose-*`, `text-amber-*`, `bg-blue-*` se renderiza como gris**.

**Uso real de paletas semanticas en `src/`:**

| Familia | Usos | Estado actual |
|---|---|---|
| `rose-*` | 509 | ROTO - se renderiza gris |
| `amber-*` | 298 | ROTO - se renderiza gris |
| `blue-*` | 135 | ROTO - se renderiza gris |
| `emerald-*` | 198 | OK - mapeado a teal clinical |
| `teal-*` | 192 | OK - paleta clinical real |
| `purple/indigo/violet` | 28 | mezclado con `#7c3aed` literal |

**Componentes rotos confirmados (ejemplos):**

1. **`DeleteConfirmModal`** (`ModalElements.tsx` linea 738): boton `bg-rose-600` para "Eliminar" se ve gris. No comunica peligro.
2. **`DeleteConfirmModal`** warning icon `bg-rose-50 text-rose-600` (linea 718): gris sobre gris.
3. **Asteriscos de requerido** `text-rose-500` en `FormField` (linea 207), `LoginForm` (linea 98): grises, no rojos.
4. **`LoginForm` alerta de error** `bg-rose-50 text-rose-700` (linea 364): gris, no comunica error.
5. **`LoginForm` rate-limit alert** `bg-amber-50 text-amber-900` (linea 150): gris, no comunica advertencia.
6. **`GestionVacunas` stock cero** `text-rose-700` (linea 231, 326): gris. Mientras stock positivo `text-emerald-700` si es teal. Asimetrico y confuso.
7. **`DESIGN_TOKENS.semantic.warning/danger/info`** (`designTokens.ts` lineas 49-71): todos se resuelven a gris. Solo `success` (emerald -> teal) sobrevive.
8. **`COMPONENT_STYLES.button.iconDelete`** `border-rose-200 bg-rose-50 text-rose-700` (`Inventario/constants.ts` linea 142): boton de eliminar gris.
9. **`ALERT_LEVEL_CONFIG.critico`** `bg-rose-900` (Dashboard/constants.ts linea 119): gris.
10. **`ConfirmationDialog`** body `bg-gray-50` + texto `text-gray-700` (usa gray, otro gris mas).

### 3.3 ALTO - Tres escalas de gris mezcladas

| Escala | Usos | Donde |
|---|---|---|
| `zinc` | 2049 | mayoria del app, designTokens, Inventario |
| `gray` | 243 | `LoadingSkeleton`, `ConfirmationDialog`, algunos legacy |
| `slate` | 141 | `GestionVacunas`, `DashboardHeader` |

Visualmente casi identicas (#fafafa vs #fafaf9 vs #f8fafc) pero rompen consistencia, aumentan superficie de mantenimiento y complican un futuro dark mode (cada escala tendria su propio mapeo).

### 3.4 ALTO - Radios descontrolados (Shape Consistency Lock roto)

`DESIGN.md` define 3 radios: `sm: 4px`, `md: 8px`, `lg: 12px`. El codigo usa **20+ valores distintos**:

| Radio | Usos |
|---|---|
| `rounded-full` | 200 |
| `rounded-xl` | 136 |
| `rounded-[14px]` | 125 |
| `rounded-lg` | 123 |
| `rounded-[8px]` | 115 |
| `rounded-[9px]` | 84 |
| `rounded-[10px]` | 78 |
| `rounded-[7px]` | 72 |
| `rounded-2xl` | 68 |
| `rounded-[12px]` | 60 |
| `rounded-[18px]` | 37 |
| `rounded-md` | 29 |
| `rounded-[22px]`, `[24px]`, `[16px]`, `[5px]`, `[6px]`, `[4px]`, `[28px]` | 8-16 c/u |

No hay regla documentada. Botones usan `[7px]`, `[8px]`, `[9px]`, `xl`, `2xl`, `full` segun el componente. Tarjetas usan `[14px]`, `[18px]`, `2xl`, `lg`. Inputs usan `[7px]`, `[8px]`, `[9px]`, `lg`.

### 3.5 MEDIO - Escala tipografica atomica (12 tamanos arbitrarios)

`DESIGN.md` define 4 tamaños: display (3.5rem), h1 (2rem), body (0.95rem), label (0.72rem). El codigo usa **12 tamaños `text-[Npx]` distintos**:

| Tamano | Usos |
|---|---|
| `text-[13px]` | 89 |
| `text-[12px]` | 86 |
| `text-[11px]` | 40 |
| `text-[10px]` | 40 |
| `text-[15px]` | 27 |
| `text-[14px]` | 5 |
| `text-[11.5px]` | 5 |
| `text-[9px]`, `[18px]`, `[12.5px]`, `[34px]`, `[25px]`, `[22px]` | 1-3 c/u |

No hay escala centralizada. Los tokens del DESIGN.md (`text-display`, `text-h1`, `text-body`, `text-label`) estan definidos en `designMdTailwindTheme.json` y `tailwind.config.js` pero casi no se usan.

### 3.6 MEDIO - Tres fuentes de verdad para estilos (sin component library)

No existe un `Button`, `Card`, `Table`, `Badge` reutilizable. Cada vista reescribe sus clases. Hay 3 constantes de estilos duplicadas:

1. **`src/styles/designTokens.ts`** (`DESIGN_TOKENS`, `DESIGN_GRADIENTS`, `DESIGN_COLOR_SCALES`) - usado por Dashboard e Inventario. Estructura correcta pero sufrre el problema de paletas neutralizadas.
2. **`src/components/ui/ModalConstants.ts`** (`MODAL_STYLES`) - usado por todos los modals. Purpura-grey, duplica logica de designTokens.
3. **`src/components/Inventario/constants.ts`** (`COMPONENT_STYLES`, `COLORS`) - duplica MODAL_STYLES con variantes propias. Define su propio `pageBackground`, `surface`, `panel`, `badge`, `table`, `filter`, `pagination`, `nav`.

Mas hex literales dispersos en cada componente (Sidebar, Header, DashboardHeader, GestionVacunas, etc.).

### 3.7 BAJO - Hack de accesibilidad en index.css

`index.css` lineas 98-104:
```css
.bg-teal-600.text-white,
.bg-teal-700.text-white,
.bg-teal-600 .text-white,
.bg-teal-700 .text-white {
  color: var(--clinical-primary);  /* #0f2a3b - texto oscuro */
}
```

Esto fuerza que los botones teal con texto blanco pasen a texto oscuro. Contradicte el DESIGN.md (donde `button-primary` es `tertiary` bg + `primary` text, intencionalmente oscuro sobre teal) pero se aplica globalmente a cualquier `.bg-teal-600.text-white`, rompiendo componentes de terceros o futuros. Es un parche fragil.

### 3.8 BAJO - Doble sistema de Toasts

- `react-hot-toast` esta en `package.json` dependencies pero no se encontro uso directo en los componentes analizados.
- `src/components/ui/Toast.tsx` + `ToastContainer.tsx` + `src/styles/toast.css` es un sistema custom con progreso animado y a11y (`role="alert"`, `aria-live="polite"`).
- `toast.css` usa hex literales estandar (`#10b981` emerald, `#ef4444` red, `#f59e0b` amber, `#3b82f6` blue) que SI funcionan (no dependen de Tailwind).
- El `Toast.tsx` (componente React) usa `border-l-emerald-500`, `text-rose-500`, `border-l-amber-500`, `border-l-blue-500` que estan neutralizados a gris.

Convendria consolidar en un solo sistema y alinear colores.

---

## 4. Analisis por componente

### 4.1 Layout / App Shell

**`src/App.tsx`**
- Estructura correcta: AppProvider > ToastProvider > AuthProvider > AlertasProvider > ProtectedRoute > (Sidebar + main con Header + AppRoutes + SiBotFloating)
- `bg-[#f0eff4]` discrepa con `#f1f5f7` del body y `bg-zinc-50` de designTokens.
- Margin del main ligado a `sidebarCollapsed` (`lg:ml-[100px]` o `lg:ml-[286px]`): correcto, responsivo.
- `min-h-[100dvh]`: correcto (no usa `h-screen`).
- StrictMode deshabilitado con comentario (temporal, doble montaje en dev).
- SiBotFloating solo para `rol === 'administrador'`: logica de permisos en App, correcto.

**`src/components/Layout/Sidebar.tsx`** (359 lineas)
- Calidad alta: colapsable, responsive (overlay en mobile con backdrop blur), tooltips en modo colapsado, badges de alertas, user menu con click-outside y Escape.
- **Ignora por completo el sistema Clinical.** Usa hex purpura-grey: `#15171d`, `#f7f6fb`, `#fbfafd`, `#111318`, `#ff3d73` (rosa para badges de notificaciones, un tercer acento).
- Iconos `@phosphor-icons/react` con `weight="duotone"` en activo y `"regular"` en inactivo: buen detalle jerarquico.
- Agrupacion de menu en 3 grupos (primary, secondary, utility) con separadores `border-t border-[#e7e7ef]`.
- Avatar con iniciales + dot de estado `bg-[#ff3d73]`: tercer color de acento (rosa) no documentado.
- Search input con hints de teclado (`⌘` + `F`): detalle pro, pero no hay handler real (decorativo).

**`src/components/Layout/Header.tsx`** (38 lineas)
- Minimalista y correcto: sticky, rounded, breadcrumbs + notification bell + mobile menu toggle.
- Mismo sistema purpura-grey que el Sidebar.
- Altura 64px: dentro del cap de 80px.

**`src/components/Layout/constants.ts`**
- `MENU_SECTIONS` con 4 secciones (Principal, Gestion, Reportes, Sistema) y 11 items: IA correcta.
- `BREADCRUMBS_STYLES` usa `focus:ring-[#34bda6]/20`: otro teal distinto (`#34bda6`) al clinical (`#0e9f8e`) y al dashboardHeader (`#35bfa8`). **3 teals distintos en el app.**

### 4.2 Componentes UI (`src/components/ui/`)

**`ModalElements.tsx`** (758 lineas) - el componente mas reutilizable del app
- API limpia: `Modal`, `SideSheet`, `ModalFooter`, `FormField`, `FormSection`, `TextInput`, `TextArea`, `SelectInput`, `MultiSelectInput`, `DateInput`, `DeleteConfirmModal`.
- `MultiSelectInput`: bien hecho (busqueda, seleccionar todo, chips con limite, expandir/colapsar, keyboard escape, click outside). Usa `#7c3aed` purpura como accent de seleccion (tercer sistema).
- `DeleteConfirmModal`: usa `bg-rose-600` (ROTO - gris) para boton eliminar, `bg-rose-50 text-rose-600` (ROTO) para icono warning. Deberia ser rojo.
- Validacion de errores con `text-rose-600` y `border-rose-300`: ROTO - gris.
- Tamaños `sm/md/lg/xl` para modals: bien.
- `ModalFooter` con `flex-row-reverse`: patron correcto (primario a la derecha).

**`ModalConstants.ts`** (34 lineas)
- `MODAL_STYLES.button.primary` = `bg-[#7c3aed]` purpura. No es teal clinical.
- `MODAL_STYLES.input.error` = `border-rose-300 focus:border-rose-300 focus:ring-rose-100`: ROTO.
- Overlay `bg-[#111318]/20 backdrop-blur-[2px]`: correcto, sutil.

**`Toast.tsx`**
- 4 tipos (success/error/warning/info) con iconos `lucide-react` (CheckCircle, AlertTriangle, XCircle, Info).
- Usa `border-l-emerald-500`, `border-l-rose-500`, `border-l-amber-500`, `border-l-blue-500`: success OK (teal), los otros 3 ROTOS (gris).
- Progreso animado con `requestAnimationFrame` + `requestAnimationFrame` loop que toca `useState` (`setProgress`): **patron prohibido** segun skill Section 5.D (rAF loops que tocan React state causan re-renders por frame). Deberia usar `useMotionValue` o CSS animation.
- `aria-live="polite"` + `role="alert"`: accesibilidad correcta.
- Auto-dismiss con `duration`: bien.

**`ToastContainer.tsx`**
- 4 posiciones, `maxVisible: 4`, `pointer-events-none` en container con `pointer-events-auto` en items: correcto.

### 4.3 Common components

**`Breadcrumbs.tsx`**
- Usa `BREADCRUMBS_STYLES` de Layout/constants. Responsive (oculta intermedios en mobile).
- `aria-current="page"` en ultimo: accesibilidad correcta.

**`ConfirmationDialog.tsx`**
- Usa `Modal` + `ModalFooter` (composicion correcta).
- Body con `bg-gray-50` + `text-gray-700`: usa `gray` (cuarto gris, ademas de zinc/slate).
- Hook `useConfirmationDialog` conveniente para consumidores.
- `DeleteConfirmation` wrapper especifico.

**`LoadingSkeleton.tsx`** (224 lineas)
- 7 skeletons: Table, Card, Form, Filter, StatCard, List, Page.
- Todos usan `bg-gray-200`, `bg-gray-300`, `bg-gray-50`: escala `gray` (no zinc ni slate).
- `animate-pulse` de Tailwind: correcto, simple.
- Estructura correcta pero visualmente desconecta del resto (gris distinto).

### 4.4 Dashboard

**`Dashboard.tsx`**
- `framer-motion` con `AnimatePresence` para transiciones loading/error/content: correcto.
- Layout grid `lg:grid-cols-12` con secciones: MetricsSection, ChartSection (lazy), StockAvailabilitySection, PermisosPlanificacion, CentrosAcopioSection/EstablecimientosSection (segun rol), AlertasSection, ActividadSection.
- `bg-[#f0eff4] text-[#111827]`: slate, no purpura-grey ni clinical.
- `ChartSection` lazy-loaded: correcto (recharts es pesado).

**`StatCard.tsx`**
- Usa `DASHBOARD_COLORS` con `DESIGN_TOKENS`. Es el componente mas "clinical" del app.
- `motion.div whileHover={{ y: -2 }}`: micro-interaccion tactil, correcta.
- Icono en caja `border-zinc-200 bg-white` con `text-tertiary` y hover `group-hover:border-tertiary`: buen detalle.
- Pero `DASHBOARD_COLORS.success` usa `text-emerald-800` (mapeado a teal) mientras `danger` usa `text-rose-800` (ROTO - gris). Asimetrico.

**`DashboardHeader.tsx`**
- Cuarto sistema: slate `#f8fafc`, `#dfe4eb`, `#111827`, teal `#35bfa8` / `#34bda6`.
- Boton "Nuevo" `bg-[#35bfa8]` con `shadow-[0_10px_20px_-14px_rgba(53,191,168,0.75)]`: teal con glow (skill Section 9.A desaconseja glows).
- Boton "Exportar CSV" y "Actualizar": outline slate.
- Input search con `⌘ K` hint: decorativo, no funcional.
- "Desactualizado" badge: bien.

### 4.5 Inventario (vista con tablas)

**`GestionVacunas.tsx`** (612 lineas) - patron representative de las vistas CRUD
- Estructura correcta: FilterBar + DataTable (desktop) / cards (mobile) + SideSheet de detalle + Modal de create/edit + DeleteConfirmModal.
- Responsive: tabla desktop, cards mobile. Bien.
- **Cuarta paleta:** `text-slate-900`, `text-slate-500`, `border-slate-200`, `bg-slate-50/70`, `rounded-2xl`. Convive con `COMPONENT_STYLES` (purpura-grey) en el mismo componente.
- `text-rose-700` para stock cero: ROTO (gris). `text-emerald-700` para stock positivo: OK (teal). **Inconsistencia semantica grave**: el usuario no distingue stock critico de stock sano por color.
- Badges `COMPONENT_STYLES.badge.warning` / `.danger` usan dots `before:bg-amber-400` / `before:bg-rose-500`: los dots SI se ven (amber-400 y rose-500 no estan neutralizados? verificar - en config, amber y rose 50-950 son todos zinc, asi que si estan rotos).
- Validacion de formulario en `VacunaModal`: correcta, con errores inline.
- `getStockInfo` calcula stockTotal, lotesActivos, lotesVencidos, lotesPorVencer: logica de negocio en componente, podria ser hook.

**`Inventario/constants.ts`** (281 lineas)
- `COMPONENT_STYLES`: duplica `MODAL_STYLES` con variantes. Define `button.primary` = `bg-[#7c3aed]` (purpura, igual que ModalConstants).
- `button.success` = `bg-emerald-600`: ROTO si emerald esta neutralizado? No - emerald SI esta bien mapeado en config (lineas 71-83), es teal real. OK.
- `button.iconDelete` = `border-rose-200 bg-rose-50 text-rose-700`: ROTO.
- `badge.active` usa `before:bg-emerald-500`: OK. `badge.inactive` usa `before:bg-rose-500`: ROTO.
- `nav.tabActive` = `bg-teal-50 text-teal-700`: OK (clinical).

### 4.6 Auth

**`LoginForm.tsx`** (398 lineas)
- El componente mas consistente visualmente (todo purpura-grey, sin mezclas).
- Validacion cliente robusta: usuario requerido, min 3 chars, email format si tiene `@`, no espacios, password requerida.
- Rate-limit handling con countdown: buena UX.
- Toggle password visibility: correcto.
- `aria-invalid`, `aria-describedby`, `role="alert"`: accesibilidad correcta.
- Fondo con imagen `/portada.png` + overlay `bg-[#111318]/35 backdrop-blur-[1px]`: correcto.
- **Errores semanticos rotos:** alerta de error `bg-rose-50 text-rose-700` (gris), rate-limit `bg-amber-50 text-amber-900` (gris), icono error `text-rose-400` (gris). No comunican urgencia.
- Boton primario `bg-[#7c3aed]` purpura: consistente con el resto del app.
- Footer `text-white/65` sobre overlay oscuro: contraste OK.

---

## 5. Mapa de fragmentacion (resumen visual)

```
                    SISTEMA CLINICAL (DESIGN.md)          SISTEMA PURPURA-GREY (de facto)        SISTEMA SLATE (Dashboard/Vacunas)
                    --------------------------------       -----------------------------------   ----------------------------------
Colores              teal #0E9F8E                          purpura #7c3aed                      teal #35bfa8 / #34bda6
                    primary #0F2A3B                       text #15171d                         text #111827
                    secondary #4F6B7C                     border #e7e7ef                       border #dfe4eb
                    neutral #F1F5F7                       hover #fbfafd                        bg #f8fafc
                                                           muted #8b8f9b
                                                           accent rosa #ff3d73 (badges)

Usos                ~62                                   ~2000+                               ~141

Donde                designTokens.ts, StatCard,            ModalConstants, Sidebar, Header,     DashboardHeader, GestionVacunas
                    index.css, DESIGN.md                   Inventario/constants, LoginForm,
                                                           todos los modals

Gris                 zinc (mapeado)                        zinc + hex literales                 slate

Funciona?            Parcialmente (teal OK,               SI (es lo que se ve)                 SI pero aislado
                    resto testimonial)

Semanticos           success OK (emerald->teal)            rose/amber/blue ROTOS (gris)         rose/amber ROTOS (gris)
                    warning/danger/info ROTOS
```

---

## 6. Pre-Flight Check (auditando el estado actual, no una salida nueva)

Aplicando la matriz de la Seccion 14 del skill (adaptada a admin dashboard, no landing):

- [x] Brief inference declarada (Design Read arriba)
- [x] Dial values explicitos (3-4 / 3-4 / 5-6, inferidos del sitio actual)
- [ ] **Design system unificado**: FALLA - 3 sistemas compitiendo
- [x] Redesign mode detectado (Overhaul, preservar IA/contenido/rutas)
- [x] Zero em-dashes en el codigo (no se encontraron)
- [x] Page Theme Lock: light mode unificado (no hay dark mode)
- [ ] **Color Consistency Lock**: FALLA - 3 teals distintos, purpura + teal + rosa + slate mezclados
- [ ] **Shape Consistency Lock**: FALLA - 20+ radios distintos sin regla
- [ ] **Button Contrast Check**: FALLA en botones rose neutralizados (gris sobre gris no comunica danger)
- [x] CTA Button Wrap: OK (labels cortos)
- [ ] **Form Contrast Check**: FALLA - placeholders y error text rose neutralizados
- [x] Serif discipline: N/A (usa IBM Plex Sans, sans-serif)
- [x] Hero fits viewport: N/A (es dashboard, no landing)
- [ ] **Eyebrow count**: revisar - `FormSection` usa `uppercase tracking-[0.12em]`, StatCard usa `uppercase tracking-[0.14em]`, DashboardHeader usa `uppercase tracking-[0.12em]`. Posible exceso en admin UI (la regla es para landing, pero aun asi denso).
- [x] Navigation on one line: OK (Sidebar vertical, Header horizontal)
- [x] Real images: OK (login usa `/portada.png`, no div-based fake screenshots)
- [x] Icons from allowed library: OK (Phosphor + Lucide, aunque skill desaconseja Lucide)
- [x] One icon family: FALLA menor - Phosphor y Lucide mezclados
- [x] Viewport stability: OK (`min-h-[100dvh]`)
- [x] Empty/loading/error states: OK (skeletons, ErrorState, EmptyState)
- [ ] **Reduced motion**: parcial - `index.css` y `toast.css` lo respetan, pero `Toast.tsx` rAF loop no
- [ ] **Dark mode**: FALLA - no existe (skill lo exige para consumer-facing; salud es consumer-facing)
- [x] useEffect cleanups: OK en Sidebar (click-outside), MultiSelectInput
- [ ] **No `window.addEventListener('scroll')`**: verificar (no se encontro en componentes analizados, pero App.tsx usa `window.scrollTo` en useLayoutEffect - aceptable, no es listener)
- [x] Core Web Vitals: plausible (code-splitting, lazy loading, fonts autohospedadas)

**Fallos bloqueantes para considerar el frontend "pulido":** design system unificado, color consistency, shape consistency, button contrast (semanticos rotos), form contrast, dark mode.

---

## 7. Recomendaciones (priorizadas)

### 7.1 Direccion estrategica (decidir una)

**Opcion A (recomendada - menor esfuerzo, mayor coherencia):**
Adoptar el sistema purpura-grey "Linear-like" de facto como canon. Actualizar `DESIGN.md` para reflejarlo. Restaurar las paletas `rose`, `amber`, `blue` en `tailwind.config.js` para que funcionen como colores semanticos de estado (peligro, advertencia, info). Consolidar `zinc` + `gray` + `slate` en una sola escala (zinc). Migrar `#7c3aed` a un token `accent` centralizado.

**Opcion B (mayor alineacion con marca salud):**
Restaurar el Clinical teal del DESIGN.md. Migrar todos los `#7c3aed` purpura a `teal-600`. Eliminar hex literales y usar tokens. Mayor trabajo (~2000 referencias a cambiar) pero alinea con la identidad "salud / hospital" de DISA Apurimac.

### 7.2 Quick wins (independientes de la direccion)

1. **Restaurar paletas semanticas en `tailwind.config.js`** (borrar las 3 neutralizaciones de amber/rose/blue). Esto solo arregla ~800 componentes rotos. 1 linea de config, impacto masivo.
2. **Consolidar escalas de gris**: buscar-reemplazar `gray-*` -> `zinc-*` y `slate-*` -> `zinc-*` en `src/`. ~384 reemplazos.
3. **Eliminar el hack de `index.css` lineas 98-104** y arreglar los botones teal que dependian de el cambiando `text-white` a `text-primary` directamente.
4. **Unificar los 3 teals** (`#0e9f8e`, `#35bfa8`, `#34bda6`) en uno solo.
5. **Crear una component library minima**: `Button`, `Card`, `Badge`, `Table`, `Input` reutilizables que envuelvan los tokens. Evita que cada vista reescriba clases.
6. **Arreglar `Toast.tsx` rAF loop**: reemplazar `useState` + `requestAnimationFrame` por `useMotionValue` de Motion o una animacion CSS de `width`.
7. **Estandarizar radios**: definir 4 niveles (ej. `4px / 8px / 12px / 16px` + `full` para avatares) y migrar los 20+ valores arbitrarios.
8. **Estandarizar tipografia**: definir escala (ej. `xs 11px / sm 12px / base 13px / md 14px / lg 16px / xl 18px / 2xl 24px / display 34px`) y migrar los 12 `text-[Npx]` arbitrarios.
9. **Dark mode**: anadir `dark:` variants. Salud es consumer-facing; el skill lo exige.
10. **Unificar fuente de iconos**: elegir Phosphor O Lucide (no ambos). Phosphor es el mas usado y el skill lo prioriza.

### 7.3 Modernizacion levers (orden sugerido, segun skill Seccion 11.D)

1. **Color recalibration** (mayor riesgo visual, mayor impacto): restaurar semanticos, consolidar gris, unificar teal. Es el lever 3 pero aqui es bloqueante.
2. **Typography refresh**: escala centralizada, aplicar tokens del DESIGN.md.
3. **Spacing & rhythm**: unificar padding de secciones (actualmente `p-4 sm:p-6` en algunos, `px-4 py-4 sm:px-5` en otros).
4. **Component library**: extraer Button/Card/Badge/Table/Input reutilizables.
5. **Motion layer**: ya hay framer-motion en Dashboard; extender a transiciones de ruta y hover de botones primarios.
6. **Dark mode**: ultimo lever, requiere tokens consolidados primero.

---

## 8. Nota de seguridad

El usuario compartio un GitHub PAT (`github_pat_11ASKJA3I0...`) en texto plano en el chat inicial. Ese token quedo expuesto en el historial de la conversacion. **Recomendacion: revocarlo de inmediato** en GitHub Settings > Developer settings > Personal access tokens, y generar uno nuevo.

No se guardo el token en memoria ni en archivos. Para uso futuro (acceso a repos privados, CI, etc.), usar `kortix secrets request` para que el usuario lo ingrese via modal seguro sin exponerlo en chat.

---

## 9. Estado del entorno

- Repo clonado en `/workspace/syncova`
- Dependencias instaladas (`npm install`, 521 paquetes, 10 vulnerabilidades: 1 low, 6 moderate, 3 high - considerar `npm audit fix`)
- Dev server corriendo en http://localhost:5173 (PTY `vite-dev`, PID 737, HTTP 200 confirmado)
- Screenshot del login guardado en `/workspace/syncova/login-page.png`
- Backend no levantado (requiere PostgreSQL; sin DB disponible en este sandbox)
- Memoria del proyecto actualizada en `.kortix/memory/syncova-frontend-audit.md`

**Para detener el dev server:** `pty_kill` con id `pty_f39f4f1ae001SEv38Bd2wKKkX6`.

**Para reconstruir tras cambios:** `npm run build` en `/workspace/syncova` (tsc + vite build).

**Para lint:** `npm run lint` en `/workspace/syncova`.
