# React Bits (componentes copy-in)

Carpeta que aloja componentes copiados desde https://reactbits.dev y
**re-tokenizados** a la paleta "Clinical" de SIVAC (ver `DESIGN.md`).

## Reglas de uso

1. **Máximo 2–3 componentes React Bits por página.** Más sobrecarga de
   animaciones y degrada UX/rendimiento.
2. **Desactivar en móvil** con `useMobileDisable` y renderizar un placeholder
   estático.
3. **Respetar `prefers-reduced-motion`** con `usePrefersReducedMotion`.
4. **Acento único y sin gradientes**: re-tokenizar colores a `brand`/`ink`/
   `surface-soft`. Donde React Bits impone gradiente, aplanar a solid.
5. **No usar en superficies clínicas** (tablas, formularios, kardex, inventario).
   Reservar para momentos de marca (login, hero, estados vacíos, error, carga).

## Motor de animación

Todo lo que anime usa `motion/react` (paquete `motion` v12). **Está prohibido
importar `framer-motion`** (regla ESLint `no-restricted-imports`). `motion/react`
reexporta la misma API (`motion`, `AnimatePresence`, `Variants`).

## Dependencias externas

Algunos componentes de React Bits requieren libs externas (gsap, lenis, ogl).
Instalar **solo** la que exija el componente copiado y listarla aquí:

| Componente | Dep externa | Notas |
|---|---|---|
| _(por completar al copiar)_ | | |

## Estructura

```
_shared/   hooks utilitarios (reduced-motion, mobile)
text/       animaciones de texto (SplitText, CountUp, ...)
components/ tarjetas y elementos (SpotlightCard, TiltedCard, ...)
backgrounds/ fondos (Aurora, DotGrid, ...)
```

## Origen y licencia

- Fuente: https://reactbits.dev
- Licencia: MIT
- Mantenimiento: al actualizar, volver a copiar desde la pestaña Code (TS) y
  re-aplicar la tokenización clínica.
