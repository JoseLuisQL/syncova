# CI Pipeline

El archivo `ci.yml` de esta carpeta es el workflow de GitHub Actions propuesto
para el proyecto.

## ⚠️ Acción manual requerida

No se pudo colocar automáticamente en `.github/workflows/` porque el token de
acceso usado por el agente no tiene el scope `workflow` (GitHub bloquea la
creación/edición de workflows sin ese permiso).

Para activarlo:

```bash
mkdir -p .github/workflows
git mv docs/ci/ci.yml .github/workflows/ci.yml
git commit -m "ci: enable GitHub Actions pipeline"
git push
```

(Hazlo con un token que tenga el scope `workflow`, o desde la UI de GitHub.)

## Qué hace

- **frontend**: `npm ci` → `npm run typecheck` → `npm run build`
- **backend**: `npm ci` → `prisma generate` → `tsc --noEmit` → `npm test`

Se ejecuta en push a `main`, ramas `fix/**` y `feat/**`, y en pull requests a `main`.
