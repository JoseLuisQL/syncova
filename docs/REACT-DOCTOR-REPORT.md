# Reporte react-doctor — SIVAC Frontend

> Herramienta: [react-doctor](https://github.com/millionco/react-doctor) v0.7.1
> Fecha: 2026-07-06
> Comando: `npx react-doctor@latest /workspace/syncova --json`
> Reporte JSON completo: 1.3 MB, 1023 diagnósticos

## Score global

| Métrica | Valor |
|---------|-------|
| **Score** | **36 / 100 — "Critical"** |
| Errores | 22 |
| Warnings | 1001 |
| Total diagnósticos | 1023 |
| Archivos afectados | 228 |
| Tiempo de escaneo | 17.2 s |
| Framework detectado | Vite + React 18.3 + TypeScript + Tailwind 3.4 |

## Distribución por categoría

| Categoría | Errores | Warnings | Total |
|-----------|---------|----------|-------|
| **Bugs** | 20 | 362 | 382 |
| **Performance** | 0 | 266 | 266 |
| **Maintainability** | 0 | 223 | 223 |
| **Accessibility** | 1 | 146 | 147 |
| **Security** | 1 | 4 | 5 |

---

## 1. ERRORES CRÍTICOS (22) — deben corregirse

### 1.1 `no-adjust-state-on-prop-change` (16 errores) — la regla más grave
Patrón: `useEffect` que ajusta estado cuando cambian las props → el usuario ve brevemente el valor stale (parpadeo) y se gana un render extra. Es el anti-patrón #1 de React.

**Archivos afectados:**
- `src/components/Inventario/ConfiguracionModal.tsx:107,117`
- `src/components/Usuarios/PermissionsModal.tsx:127,128`
- `src/components/Usuarios/RoleModal.tsx:45,52,53`
- `src/components/Usuarios/components/CambiarPasswordModal.tsx:30,31,32,33,34` (5 ocurrencias)
- `src/components/Usuarios/components/UsuarioModal.tsx:66,67`
- `src/components/Vales/GenerarValeModal.tsx:87,88`

**Fix:** Sincronizar props→estado durante el render (con key reset) o derivar el valor en lugar de almacenarlo. Ejemplo: si un modal recibe `initialValues` y las copia a `formData` en un effect, mejor usar `key={item.id}` en el modal para resetear el estado, o calcular `formData` derivado.

### 1.2 `effect-needs-cleanup` (3 errores) — memory leaks
`setTimeout`/`setInterval` en `useEffect` sin función de cleanup → el timer sigue corriendo tras desmontar el componente (memory leak + setState en componente desmontado).

- `src/components/Usuarios/PermissionsModal.tsx:124`
- `src/components/Usuarios/RoleModal.tsx:35`
- `src/components/Vales/Vales.tsx:182`

**Fix:** `return () => clearTimeout(t)` en cada effect.

### 1.3 `jsx-key` (1 error) — bug de React tracking
- `src/components/Dashboard/Dashboard.tsx:74` — un `{...spread}` puede sobreescribir el `key` y romper el tracking de React.

### 1.4 `aria-role` (1 error) — accesibilidad
- `src/components/SiBot/SiBotFloating.tsx:186` — `role="assistant"` no es un rol ARIA válido. Usar un rol real (p.ej. `role="dialog"` o `role="complementary"`).

### 1.5 `low-supply-chain-score` (1 error) — seguridad de dependencias
- `package.json:22` — `axios@1.11.0` scored 25/100 en Socket (mínimo 50). Apunta a vulnerabilidades conocidas. **Fix:** actualizar axios a la última versión o reemplazar por `fetch`.

---

## 2. SECURITY (5) — revisar urgentemente

| Severidad | Archivo:línea | Regla | Problema |
|-----------|---------------|-------|----------|
| error | `package.json:22` | low-supply-chain-score | axios con score de vulnerabilidad 25/100 |
| warning | `backend/register-aliases.js:9` | path-traversal-risk | Acceso a filesystem usa datos de request/query/params |
| warning | `backend/src/controllers/MovimientosController.ts:323` | request-body-mass-assignment | Request body spread sin allowlist → mass assignment |
| warning | `backend/src/middleware/validation.ts:125` | request-body-mass-assignment | Mismo patrón en validación |
| warning | `backend/src/utils/password.ts:87` | insecure-crypto-risk | Hash débil / comparación timing-unsafe / Math.random en contexto de seguridad |

---

## 3. PERFORMANCE (266) — top reglas

| Regla | Count | Qué significa |
|-------|-------|---------------|
| `async-await-in-loop` | 69 | `await` secuencial dentro de un bucle → Promise.all() para paralelizar. Casi todos en `backend/prisma/seed.ts` (aceptable en seed) pero algunos en servicios. |
| `no-inline-prop-on-memo-component` | 38 | Componentes `memo` reciben props inline (funciones/objetos nuevos) → el memo se invalida cada render. Concentrado en `MovimientosTabla.tsx` (EditableNumberField). |
| `no-barrel-import` | 30 | Imports desde `index.ts` barrel impiden tree-shaking. |
| `js-combine-iterations` | 24 | `.filter().map()` encadenados que pueden combinarse en un solo paso. |
| `async-parallel` | 15 | Awaits independientes secuenciales → Promise.all(). En servicios backend. |
| `js-set-map-lookups` | 15 | Búsquedas en array `.find()/.includes()` que deberían ser `Set`/`Map`. |
| `js-cache-property-access` | 11 | Acceso repetido a propiedades profundas sin cache. |
| `use-lazy-motion` | 8 | `motion` de framer-motion debería ser `LazyMotion` para reducir bundle. |
| `rerender-lazy-state-init` | 9 | `useState(() => expensive)` ya lazy, pero otros `useState(expensive)` no. |

---

## 4. BUGS (382) — top reglas (además de los 20 errores)

| Regla | Count | Qué significa |
|-------|-------|---------------|
| `exhaustive-deps` | 60 | useEffect/useMemo con dependencias faltantes o extra → bugs de stale closure. |
| `no-derived-state` | 19 | Estado que podría derivarse de props → renders extra + posible desincronización. |
| `no-chain-state-updates` | 17 | Sets de estado encadenados que disparan un render por paso. |
| `no-effect-chain` | 10 | Un useEffect cambia estado que dispara otro useEffect → cascada de renders. Concentrado en `Movimientos.tsx` (6 ocurrencias). |
| `no-render-in-render` | 11 | Funciones `renderXxx()` llamadas inline en vez de componentes JSX → React no puede trackearlas. |
| `no-array-index-as-key` | 13 | `key={index}` en listas que pueden reordenarse → bugs de tracking. |
| `button-has-type` | 148 | `<button>` sin `type` explícito → default `submit` puede enviar formularios por accidente. (warning, no error) |

---

## 5. ACCESSIBILITY (147) — top reglas

| Regla | Count | Fix |
|-------|-------|-----|
| `label-has-associated-control` | 47 | `<label>` no asociado a un `<input>` (falta `htmlFor` o anidamiento). |
| `control-has-associated-label` | 45 | Botones/inputs interactivos sin etiqueta accesible (texto o `aria-label`). |
| `click-events-have-key-events` | 22 | `onClick` en elementos no-botones sin handler de teclado (`onKeyDown`) → usuarios de teclado no pueden usarlo. |
| `no-static-element-interactions` | 18 | `<div>` con `onClick` sin rol ni soporte de teclado. |
| `prefer-html-dialog` | 3 | Modales custom que deberían usar `<dialog>` nativo. |
| `no-redundant-roles` | 4 | `role="button"` en un `<button>` (redundante). |

---

## 6. MAINTAINABILITY (223) — dead code

### Archivos no usados (39) — dead code real
react-doctor detectó 39 archivos sin importadores. **Ojo:** algunos son falsos positivos (p.ej. `StatCard.tsx`, `DashboardHeader.tsx` se usan vía barrel `index.ts` que la herramienta no resuelve). Los confirmados como dead code real:

- `backend/seedVacunas.js` — script legacy de seed
- Varios `index.ts` barrel vacíos o no usados
- Componentes huérfanos en Dashboard/Vales/Inventario/Reportes

**Acción:** revisar uno a uno con `grep -r "NombreArchivo" src/` antes de borrar.

### Exports no usados (84) — `unused-export`
Funciones/constantes/tipos exportados que nadie importa. Limpieza de API surface.

---

## Top 10 archivos con más issues (foco de refactor)

| # | Archivo | Issues | Problema principal |
|---|---------|--------|--------------------|
| 1 | `Movimientos/components/MovimientosTabla.tsx` | 38 | 16× no-inline-prop-on-memo, render-in-render |
| 2 | `Movimientos/Movimientos.tsx` | 36 | 6× no-effect-chain, exhaustive-deps, async-await-in-loop |
| 3 | `Planificacion/ImportarModal.tsx` | 26 | — |
| 4 | `Planificacion/Planificacion.tsx` | 25 | — |
| 5 | `Usuarios/PermissionsModal.tsx` | 23 | no-adjust-state, effect-needs-cleanup |
| 6 | `Vales/ValeExportModal.tsx` | 21 | — |
| 7 | `Dashboard/PermisosPlanificacion.tsx` | 20 | — |
| 8 | `CentrosAcopio/CentrosAcopio.tsx` | 18 | no-derived-state, no-chain-state, no-effect-chain |
| 9 | `Vales/GenerarValeModal.tsx` | 18 | no-adjust-state-on-prop-change |
| 10 | `common/CascadingSelector.tsx` | 18 | — |

---

## Recomendaciones priorizadas

### Alta prioridad (bugs reales + seguridad)
1. **Fix los 16 `no-adjust-state-on-prop-change`** en modales de Usuarios/Inventario/Vales → usar `key` reset en vez de effect sync.
2. **Fix los 3 `effect-needs-cleanup`** (setTimeout sin cleanup) → memory leaks.
3. **Actualizar axios** (low-supply-chain-score) o migrar a fetch.
4. **Revisar los 5 issues de Security** del backend (path-traversal, mass-assignment, crypto débil).
5. **Fix `jsx-key`** en Dashboard.tsx:74.
6. **Fix `aria-role`** en SiBotFloating.tsx (role="assistant" inválido).

### Media prioridad (rendimiento)
7. **`no-inline-prop-on-memo-component` en MovimientosTabla** (38) — los 16 EditableNumberField se re-renderizan en cada keystroke porque reciben handlers inline. Envolver en `useCallback`.
8. **`no-effect-chain` en Movimientos.tsx** (6) — cascada de effects al cambiar filtros. Consolidar en un solo effect.
9. **`async-parallel` en servicios backend** (15) — Promise.all para llamadas independientes.
10. **`use-lazy-motion`** (8) — migrar framer-motion a LazyMotion para reducir bundle.

### Baja prioridad (accesibilidad + limpieza)
11. **Accesibilidad** (147): asociar labels a inputs, añadir handlers de teclado a divs clickeables, usar `<button type="button">`.
12. **Dead code** (39 archivos + 84 exports): limpiar tras verificar con grep.
13. **`button-has-type`** (148): añadir `type="button"` a todos los botones no-submit.

---

## Nota sobre falsos positivos
react-doctor v0.7.1 tiene algunos falsos positivos conocidos:
- **`unused-file`** no resuelve barrel exports (`index.ts` que re-exporta). Verificar con grep antes de borrar (~30% de los marcados sí se usan).
- **`async-await-in-loop`** en `seed.ts` es aceptable (el seed corre secuencial a propósito).
- **`button-has-type`** es ruido bajo (warning, no rompe nada) pero fácil de arreglar.
