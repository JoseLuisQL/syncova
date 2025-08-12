# Scripts de Base de Datos - SIVAC

Este directorio contiene scripts para la configuración y migración de la base de datos del sistema SIVAC.

## Scripts Disponibles

### 1. `migrate-entrega-base.ts`
Migra los datos existentes de la columna `entrega` a `entrega_base` para movimientos que tienen entregas adicionales.

**Uso:**
```bash
npm run db:migrate-entrega-base
```

**Qué hace:**
- Copia el valor de `entrega` a `entrega_base` solo para movimientos que tienen entregas adicionales asociadas
- Proporciona un resumen de los registros migrados
- Verifica que la migración se haya completado correctamente

### 2. `create-triggers.ts`
Crea funciones y triggers de PostgreSQL para automatización de procesos.

**Uso:**
```bash
npm run db:create-triggers
```

**Qué hace:**
- Crea la función `actualizar_saldo_anterior_siguiente_mes()`
- Crea el trigger `actualizar_saldo_anterior_trigger`
- Verifica que los triggers se hayan creado correctamente
- Proporciona logs detallados del proceso

### 3. `setup-database.ts`
Script de configuración inicial completa de la base de datos.

**Uso:**
```bash
npm run db:setup
```

**Qué hace:**
- Verifica la conexión a la base de datos
- Ejecuta la migración de `entrega_base` si hay datos existentes
- Crea funciones y triggers de PostgreSQL
- Verifica las configuraciones del sistema
- Proporciona un resumen completo del estado de la base de datos

## Flujo de Configuración Inicial

Para configurar la base de datos por primera vez:

1. **Configurar variables de entorno:**
   ```bash
   cp .env.example .env
   # Editar .env con tus configuraciones
   ```

2. **Ejecutar migraciones de Prisma:**
   ```bash
   npm run db:migrate
   ```

3. **Ejecutar el seeder (datos iniciales):**
   ```bash
   npm run db:seed
   ```

4. **Ejecutar configuración adicional:**
   ```bash
   npm run db:setup
   ```

## Comandos de Base de Datos Disponibles

```bash
# Desarrollo
npm run db:migrate        # Ejecutar migraciones en desarrollo
npm run db:seed          # Poblar base de datos con datos iniciales
npm run db:setup         # Configuración completa inicial
npm run db:migrate-entrega-base  # Solo migración de entrega_base
npm run db:create-triggers       # Solo crear triggers y funciones

# Utilidades
npm run db:generate      # Generar cliente Prisma
npm run db:push          # Sincronizar esquema sin migraciones
npm run db:studio        # Abrir Prisma Studio
npm run db:reset         # Resetear base de datos completamente
```

## Notas Importantes

- **Backup:** Siempre haz un backup de tu base de datos antes de ejecutar migraciones en producción
- **Entorno:** Los scripts detectan automáticamente si hay datos existentes antes de ejecutar migraciones
- **Verificación:** Todos los scripts incluyen verificaciones y reportes de estado
- **Logs:** Los scripts proporcionan logs detallados del proceso de migración
- **Triggers:** Los triggers se crean automáticamente y actualizan el saldo_anterior del siguiente mes
- **Automatización:** Una vez configurado, el sistema maneja automáticamente los cálculos de stock

## Solución de Problemas

### Error de conexión a la base de datos
Verifica que:
- PostgreSQL esté ejecutándose
- Las credenciales en `.env` sean correctas
- La base de datos especificada exista

### Error en migración de entrega_base
Si la migración falla:
1. Verifica que la tabla `movimientos_vacunas` exista
2. Verifica que la tabla `entregas_adicionales` exista
3. Ejecuta `npm run db:studio` para inspeccionar los datos

### Datos inconsistentes después de la migración
Ejecuta el script de verificación:
```bash
npm run db:migrate-entrega-base
```
El script mostrará un resumen y detectará inconsistencias.
