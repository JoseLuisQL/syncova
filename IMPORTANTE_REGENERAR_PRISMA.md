# IMPORTANTE: Regenerar Cliente Prisma

## Accion Requerida

Despues de los cambios realizados en el schema de Prisma (agregado campo `centroAcopioId` a la tabla `usuarios`), es necesario regenerar el cliente de Prisma.

## Pasos a seguir:

1. **Detener el backend** si esta corriendo

2. **Ejecutar el siguiente comando:**

```bash
cd backend
npx prisma generate
```

3. **Reiniciar el backend**

```bash
npm run dev
```

## Nota

Este paso es necesario porque el archivo `query_engine-windows.dll.node` estaba bloqueado mientras el backend estaba en ejecucion. Una vez detenido el servidor, el comando `prisma generate` podra completarse correctamente.

---

*Este archivo puede ser eliminado una vez ejecutado el comando.*
