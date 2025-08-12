# 🚀 GUÍA DE IMPLEMENTACIÓN MODULAR - BACKEND SIVAC

## 📋 Índice de Implementación

Esta guía te llevará paso a paso para implementar el backend de SIVAC de manera modular y ordenada, evitando errores de tipos y relaciones.

### 🎯 Orden de Implementación Recomendado

```
1. ⚙️  CONFIGURACIÓN INICIAL
2. 🏗️  MÓDULOS BASE (Sin dependencias)
3. 🔗  MÓDULOS CON RELACIONES SIMPLES
4. 📊  MÓDULOS CON LÓGICA COMPLEJA
5. 🔐  AUTENTICACIÓN Y AUTORIZACIÓN
6. 📈  REPORTES Y ESTADÍSTICAS
7. 🚨  ALERTAS Y NOTIFICACIONES
8. 🧪  TESTING Y VALIDACIÓN
```

---

## 📦 FASE 1: CONFIGURACIÓN INICIAL

### ✅ Paso 1.1: Instalación de Dependencias

```bash
cd backend
npm install
```

### ✅ Paso 1.2: Configuración de Base de Datos

```bash
# Generar cliente Prisma
npm run db:generate

# Aplicar esquema a la base de datos
npm run db:push

# Verificar conexión
npm run dev
```

### ✅ Paso 1.3: Verificación del Entorno

- [ ] Variables de entorno configuradas (.env)
- [ ] Base de datos PostgreSQL funcionando
- [ ] Servidor iniciando sin errores
- [ ] Endpoint /health respondiendo

---

## 🏗️ FASE 2: MÓDULOS BASE (Sin dependencias)

### 📍 Módulo 1: CONFIGURACIÓN DEL SISTEMA

**Prioridad:** ALTA | **Dependencias:** Ninguna

#### Archivos a crear:
- `src/services/ConfiguracionService.ts`
- `src/controllers/ConfiguracionController.ts`
- `src/routes/configuracion.ts`

#### Funcionalidades:
- ✅ Obtener configuraciones públicas
- ✅ Gestionar configuraciones del sistema
- ✅ Validación de tipos de datos

---

### 🏥 Módulo 2: ESTABLECIMIENTOS

**Prioridad:** ALTA | **Dependencias:** Ninguna

#### Archivos a crear:
- `src/services/EstablecimientoService.ts`
- `src/controllers/EstablecimientoController.ts`
- `src/routes/establecimientos.ts`

#### Funcionalidades:
- ✅ CRUD completo de establecimientos
- ✅ Validación de jerarquía (centro_acopio → establecimientos)
- ✅ Filtros por tipo y estado
- ✅ Búsqueda por nombre/código

#### Validaciones importantes:
- Centro de acopio no puede tener centro_acopio_id
- Centros/puestos de salud DEBEN tener centro_acopio_id
- Código único por establecimiento

---

### 💉 Módulo 3: VACUNAS

**Prioridad:** ALTA | **Dependencias:** Ninguna

#### Archivos a crear:
- `src/services/VacunaService.ts`
- `src/controllers/VacunaController.ts`
- `src/routes/vacunas.ts`

#### Funcionalidades:
- ✅ CRUD completo de vacunas
- ✅ Gestión de presentaciones y dosis
- ✅ Control de tiempo de vida útil
- ✅ Filtros por tipo y estado

---

### 💊 Módulo 4: JERINGAS

**Prioridad:** MEDIA | **Dependencias:** Ninguna

#### Archivos a crear:
- `src/services/JeringaService.ts`
- `src/controllers/JeringaController.ts`
- `src/routes/jeringas.ts`

#### Funcionalidades:
- ✅ CRUD completo de jeringas
- ✅ Gestión de tipos y capacidades
- ✅ Control de colores y estados

---

## 🔗 FASE 3: MÓDULOS CON RELACIONES SIMPLES

### 👥 Módulo 5: USUARIOS

**Prioridad:** ALTA | **Dependencias:** Establecimientos

#### Archivos a crear:
- `src/services/UsuarioService.ts`
- `src/controllers/UsuarioController.ts`
- `src/routes/usuarios.ts`
- `src/utils/password.ts`

#### Funcionalidades:
- ✅ CRUD completo de usuarios
- ✅ Encriptación de contraseñas (bcrypt)
- ✅ Validación de roles y permisos
- ✅ Asociación con establecimientos

#### Validaciones importantes:
- responsable_acopio DEBE tener establecimiento_id
- Email y usuario únicos
- Contraseñas seguras

---

### 📦 Módulo 6: LOTES DE VACUNAS

**Prioridad:** ALTA | **Dependencias:** Vacunas

#### Archivos a crear:
- `src/services/LoteVacunaService.ts`
- `src/controllers/LoteVacunaController.ts`
- `src/routes/lotes-vacunas.ts`

#### Funcionalidades:
- ✅ CRUD completo de lotes
- ✅ Control de stock (cantidad_inicial/actual)
- ✅ Gestión de vencimientos
- ✅ Estados de lotes

#### Validaciones importantes:
- fecha_vencimiento > fecha_ingreso
- cantidad_actual <= cantidad_inicial
- Número de lote único

---

### 💉 Módulo 7: LOTES DE JERINGAS

**Prioridad:** MEDIA | **Dependencias:** Jeringas

#### Archivos a crear:
- `src/services/LoteJeringaService.ts`
- `src/controllers/LoteJeringaController.ts`
- `src/routes/lotes-jeringas.ts`

#### Funcionalidades:
- ✅ CRUD completo de lotes de jeringas
- ✅ Control de stock
- ✅ Gestión de vencimientos (opcional)

---

## 📊 FASE 4: MÓDULOS CON LÓGICA COMPLEJA

### 📅 Módulo 8: PLANIFICACIÓN ANUAL

**Prioridad:** ALTA | **Dependencias:** Establecimientos, Vacunas, Usuarios

#### Archivos a crear:
- `src/services/PlanificacionService.ts`
- `src/controllers/PlanificacionController.ts`
- `src/routes/planificacion.ts`

#### Funcionalidades:
- ✅ CRUD de planificación anual
- ✅ Distribución mensual (array de 12 elementos)
- ✅ Validación de metas anuales
- ✅ Estados de planificación

#### Validaciones importantes:
- distribucion_mensual.length === 12
- sum(distribucion_mensual) === meta_anual
- Único por establecimiento/vacuna/año

---

### 📈 Módulo 9: MOVIMIENTOS DE VACUNAS

**Prioridad:** ALTA | **Dependencias:** Establecimientos, Vacunas, Usuarios, Planificación

#### Archivos a crear:
- `src/services/MovimientoService.ts`
- `src/controllers/MovimientoController.ts`
- `src/routes/movimientos.ts`

#### Funcionalidades:
- ✅ CRUD de movimientos mensuales
- ✅ Cálculos automáticos (saldo, stock, etc.)
- ✅ Integración con planificación
- ✅ Validación de períodos

#### Cálculos automáticos:
- total_saldo = saldo_anterior + trans_ingreso
- saldo = total_saldo - salida - trans_salida
- stock = saldo + entrega

---

### ➕ Módulo 10: ENTREGAS ADICIONALES

**Prioridad:** ALTA | **Dependencias:** Movimientos, Usuarios

#### Archivos a crear:
- `src/services/EntregaAdicionalService.ts`
- `src/controllers/EntregaAdicionalController.ts`
- `src/routes/entregas-adicionales.ts`

#### Funcionalidades:
- ✅ CRUD de entregas adicionales
- ✅ Múltiples entregas por movimiento
- ✅ Numeración secuencial
- ✅ Motivos y justificaciones

---

### 📋 Módulo 11: VALES DE ENTREGA

**Prioridad:** ALTA | **Dependencias:** Establecimientos, Vacunas, Usuarios, Movimientos

#### Archivos a crear:
- `src/services/ValeService.ts`
- `src/controllers/ValeController.ts`
- `src/routes/vales.ts`

#### Funcionalidades:
- ✅ Generación de vales
- ✅ Detalle por establecimiento/vacuna
- ✅ Estados de vales
- ✅ Numeración automática

---

### 📊 Módulo 12: KARDEX

**Prioridad:** MEDIA | **Dependencias:** Establecimientos, Usuarios, Lotes

#### Archivos a crear:
- `src/services/KardexService.ts`
- `src/controllers/KardexController.ts`
- `src/routes/kardex.ts`

#### Funcionalidades:
- ✅ Registro de movimientos de inventario
- ✅ Trazabilidad completa
- ✅ Saldos automáticos
- ✅ Reportes de kardex

---

## 🔐 FASE 5: AUTENTICACIÓN Y AUTORIZACIÓN

### 🔑 Módulo 13: AUTENTICACIÓN

**Prioridad:** ALTA | **Dependencias:** Usuarios

#### Archivos a crear:
- `src/services/AuthService.ts`
- `src/controllers/AuthController.ts`
- `src/routes/auth.ts`

#### Funcionalidades:
- ✅ Login con JWT
- ✅ Refresh tokens
- ✅ Logout
- ✅ Cambio de contraseña

---

## 📈 FASE 6: REPORTES Y ESTADÍSTICAS

### 📊 Módulo 14: REPORTES

**Prioridad:** MEDIA | **Dependencias:** Todos los módulos anteriores

#### Archivos a crear:
- `src/services/ReporteService.ts`
- `src/controllers/ReporteController.ts`
- `src/routes/reportes.ts`

#### Funcionalidades:
- ✅ Dashboard estadísticas
- ✅ Reportes de stock
- ✅ Reportes de movimientos
- ✅ Exportación a Excel/PDF

---

## 🚨 FASE 7: ALERTAS Y NOTIFICACIONES

### 🔔 Módulo 15: ALERTAS

**Prioridad:** MEDIA | **Dependencias:** Usuarios, Lotes, Movimientos

#### Archivos a crear:
- `src/services/AlertaService.ts`
- `src/controllers/AlertaController.ts`
- `src/routes/alertas.ts`

#### Funcionalidades:
- ✅ Alertas de vencimiento
- ✅ Alertas de stock bajo
- ✅ Alertas de discrepancias
- ✅ Notificaciones automáticas

---

## 🧪 FASE 8: TESTING Y VALIDACIÓN

### ✅ Módulo 16: TESTING

#### Archivos a crear:
- `tests/` (directorio)
- Tests unitarios por servicio
- Tests de integración
- Tests de endpoints

---

## 📝 INSTRUCCIONES DETALLADAS POR FASE

### 🎯 Cómo usar esta guía:

1. **Implementa en orden**: Respeta la secuencia para evitar errores de dependencias
2. **Completa cada fase**: No avances hasta completar todos los módulos de la fase actual
3. **Prueba constantemente**: Ejecuta tests después de cada módulo
4. **Documenta cambios**: Mantén actualizada la documentación

### 🔧 Comandos útiles:

```bash
# Desarrollo
npm run dev

# Generar Prisma
npm run db:generate

# Aplicar cambios de esquema
npm run db:push

# Ejecutar seeders
npm run db:seed

# Ver base de datos
npm run db:studio
```

### 📋 Checklist de validación por módulo:

- [ ] Servicio implementado con todas las operaciones CRUD
- [ ] Controlador con manejo de errores
- [ ] Rutas configuradas y protegidas
- [ ] Validaciones implementadas
- [ ] Tests básicos funcionando
- [ ] Documentación actualizada

---

## 🚀 ¡Comienza la implementación!

**Siguiente paso:** Implementar el Módulo 1 (Configuración del Sistema)

¿Estás listo para comenzar? ¡Vamos a construir el mejor sistema de gestión de vacunas! 💪
