# Plan de Corrección por Fases — SIVAC

**Objetivo:** resolver todos los bugs y problemas detectados en el análisis del proyecto, de forma incremental y segura.

**Estrategia de ramas:** todo el trabajo se hace en una rama dedicada (p. ej. `fix/saneamiento-integral`) creada desde `main`. Al **completar cada fase** se hace un `commit` descriptivo y se hace `push` de esa rama a GitHub. Cada fase deja el repo en estado funcional (compila + arranca).

**Regla de oro de cada fase:** antes de commitear se verifica que (1) backend hace `tsc --noEmit` sin errores, (2) la app arranca, (3) la fase no rompe lo anterior.

---

## Fase 0 — Preparación
- Crear rama `fix/saneamiento-integral` desde `main`.
- Añadir este plan al repo.
- Baseline: confirmar estado actual (backend compila, frontend tiene 360 errores TS, build pasa).

**Commit:** `chore: add correction plan and create working branch`

---

## Fase 1 — Higiene y limpieza (riesgo bajo)
Elimina ruido sin tocar lógica de negocio.

1. Borrar archivos muertos:
   - `src/components/**/**-old.tsx` y `*.old.tsx` (Movimientos-old, Reportes.old, Planificacion-old, etc.).
   - `backend/tmp_*.ts/js`, `backend/test-qware.ts`, `backend/scripts/debug-*.ts`.
   - Scripts sueltos raíz: `replace-zinc.js`, `force_hmr.cjs`, `refactor_modals_imports.cjs`.
   - Revisar/limpiar `tests/legacy/` (mover lo útil, borrar el resto).
2. Reemplazar la credencial real en `backend/.env.example` por placeholder.
3. Limpiar comentarios obsoletos/engañosos (`@access Public (TODO: Proteger)` en rutas ya protegidas).

**Verificación:** confirmar que ningún archivo borrado es importado en runtime (grep de imports antes de borrar).
**Commit:** `chore: remove dead code, debug scripts and fix leaked example credential`

---

## Fase 2 — Fiabilidad y seguridad del backend (riesgo medio)
1. **Unificar autorización:** eliminar el sistema de permisos hardcodeado (`checkPermissions` en `middleware/auth.ts`) y dejar solo el basado en BD (`middleware/permissions.ts` → `requirePermissions`). Verificar que ninguna ruta dependa del viejo.
2. **No tumbar el proceso:** cambiar `unhandledRejection` para loguear en vez de `process.exit(1)`. Revisar `uncaughtException` (mantener exit controlado o reinicio supervisado).
3. **Endurecer logging sensible:** `requestLogger` deja de volcar `req.body` completo (datos sensibles); registrar solo método/ruta/status.

**Verificación:** `tsc --noEmit` backend OK; smoke test de login + un endpoint protegido por rol no-admin.
**Commit:** `fix: unify RBAC on DB permissions, harden process error handling and request logging`

---

## Fase 3 — Migraciones de base de datos reproducibles (riesgo medio)
1. Generar una migración Prisma formal que sincronice el `schema.prisma` con la BD (las columnas/constraints que hoy solo entran con `db push`: `usuarios.centro_acopio_id`, uniques de `programacion_anual_cenares`, etc.).
2. Verificar el flujo limpio: `migrate reset` → `migrate deploy` → `db:seed` sin errores.
3. Documentar en `backend/README.md` el arranque correcto (sin `db push` manual).

**Verificación:** seed completo desde BD vacía solo con migraciones.
**Commit:** `fix: add formal Prisma migration to sync schema and make seed reproducible`

---

## Fase 4 — Type safety del frontend (riesgo medio-alto, el más grande)
1. Resolver los **360 errores de TypeScript**:
   - Módulos inexistentes (`../types/api`, `@/types`) → crear/corregir las rutas de tipos.
   - Tipos rotos en `usuarioService`, `planificacionService`, `valesService`, `movimientosService`, `planificacionReportesService`, `multiplicadoresService`, `valeExportService`.
2. Añadir `npm run typecheck` (`tsc -p tsconfig.app.json --noEmit`) como script.
3. Hacer que el build falle si hay errores de tipos (gate real).

**Verificación:** `tsc -p tsconfig.app.json --noEmit` con 0 errores; `npm run build` OK; app arranca y carga datos.
**Commit (puede partirse en sub-commits por servicio):** `fix: resolve all frontend TypeScript errors and enforce typecheck`

---

## Fase 5 — Rendimiento del frontend (riesgo bajo)
1. Code splitting por ruta con `React.lazy` + `Suspense` (Dashboard, Movimientos, Reportes, Planificación, etc.).
2. `manualChunks` para separar vendor pesado (recharts, exceljs, motion).
3. Objetivo: bajar el bundle inicial muy por debajo de los 3.35 MB actuales.

**Verificación:** `npm run build` muestra varios chunks; bundle inicial reducido; navegación funciona.
**Commit:** `perf: add route-based code splitting and vendor chunking`

---

## Fase 6 — Logger estructurado y reducción de ruido (riesgo bajo-medio)
1. Introducir logger estructurado (pino o similar) en backend.
2. Reemplazar los `console.log` críticos (550) por niveles (`info/warn/error`), respetando `LOG_LEVEL`.
3. Mantener salida legible en dev.

**Verificación:** arranque y requests logean por el nuevo logger; sin `console.log` sueltos en rutas/servicios principales.
**Commit:** `refactor: introduce structured logging and remove ad-hoc console logs`

---

## Fase 7 — Tests de lógica crítica + CI (riesgo bajo)
1. Tests backend para: validación de stock, deducciones de movimientos, cálculo de vales, Kardex/saldo anterior.
2. Mantener/ampliar el test RBAC del frontend (`tests/ui/usuarios-rbac.spec.ts`).
3. Workflow CI (GitHub Actions): `typecheck` + `lint` + `test` + `build` en cada push/PR.

**Verificación:** `npm test` (backend) verde; workflow CI definido.
**Commit:** `test: add critical business-logic tests and CI pipeline`

---

## Fase 8 — Reducción de `any` y pulido final (riesgo medio, opcional/iterativo)
1. Reducir progresivamente los 437 `any` (248 backend + 189 frontend) en zonas críticas (servicios, controllers, tipos compartidos).
2. Barrido final de TODO/FIXME (169): resolver o convertir en issues.
3. Revisión de consistencia general.

**Verificación:** `tsc` en ambos lados OK; conteo de `any` reducido significativamente.
**Commit:** `refactor: reduce any usage and resolve outstanding TODOs`

---

## Resumen de fases

| Fase | Tema | Riesgo | Commit al terminar |
|---|---|---|---|
| 0 | Preparación + rama | — | ✅ push |
| 1 | Higiene / limpieza | Bajo | ✅ push |
| 2 | Backend fiabilidad/seguridad | Medio | ✅ push |
| 3 | Migraciones reproducibles | Medio | ✅ push |
| 4 | Type safety frontend (360 errores) | Medio-alto | ✅ push |
| 5 | Code splitting / performance | Bajo | ✅ push |
| 6 | Logger estructurado | Bajo-medio | ✅ push |
| 7 | Tests críticos + CI | Bajo | ✅ push |
| 8 | Reducción `any` + pulido | Medio | ✅ push |

**Cada fase = 1 push a la rama dedicada en GitHub.** Al final, opcionalmente, se abre un Pull Request de la rama hacia `main` para revisión y merge.
