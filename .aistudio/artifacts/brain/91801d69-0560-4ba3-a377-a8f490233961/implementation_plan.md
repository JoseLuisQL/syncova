# Refactorización Minimalista y Basada en Datos Reales del Dashboard SIVAC

Rediseño integral del módulo de Dashboard de SIVAC (DISA Apurímac II) hacia una interfaz ejecutiva, minimalista y profesional, eliminando cualquier cifra fija o decorativa simulada para mostrar exclusivamente datos reales provenientes del API y habilitar navegación e interacción real en todos los controles.

---

## User Review & Critical Decisions

> [!IMPORTANT]
> Se han incorporado todas las preferencias confirmadas para asegurar una experiencia limpia, precisa y fiel a la operación real de cadena de frío e inmunizaciones.

- **Indicadores Superiores Confirmados**: Las 4 tarjetas principales mostrarán **Stock Total Disponible** (calculado sobre los lotes vigentes de biológicos), **Lotes Próximos a Vencer** (con desglose de stock crítico), **Entregas del Mes** (con total de movimientos registrados) y **Alertas Activas** (pendientes de atención).
- **Estilo Visual Confirmado**: Tarjetas compactas con esquinas ligeramente redondeadas (`rounded-xl`), borde fino de 1px y sombra suave de una sola elevación, reemplazando los bordes excesivamente redondeados (`rounded-3xl`), sombras pesadas y mini-gráficos de barras simulados.
- **Integridad de Datos y Funcionalidad Confirmada**:
  - Eliminación total de cifras estáticas o inventadas (como los porcentajes de tendencia fijos `12.4%`, `82.6%`, las barras decorativas aleatorias, el cálculo ficticio de días de cobertura `stock / 150` y el bloque fijo de planificación `64% / 128 / 82 / 46`).
  - Visualización del estado real por vacuna en inventario: **Stock Actual vs. Stock Mínimo**, cantidad de **Lotes Activos**, **Lotes por Vencer** y estado real (`Normal`, `Bajo`, `Crítico`).
  - Navegación e interacción real en todos los botones (`Ver inventario`, `Gestionar permisos`, `Abrir planificación`, `Ver centros`, `Centro de alertas`, `Ver movimientos`), filtros de rango de meses en el gráfico y paginación en las tablas operativas.

---

## 1. Overview & Core Concept

- **What It Does**: Presenta el panorama operativo en tiempo real de la cadena de suministro de vacunas y jeringas de la DISA Apurímac II, permitiendo monitorear existencias por biológico, flujo mensual de entregas/recepciones, estado de centros de acopio o establecimientos, permisos operativos de edición y alertas críticas.
- **Target Audience / Persona**: Coordinadores de inmunizaciones, administradores regionales y responsables de centros de acopio que requieren datos exactos y auditables al instante sin ruido visual.
- **Key Value**: Transparencia absoluta de los datos (cero métricas fabricadas), lectura rápida gracias a tipografía tabular alineada y acceso directo en un clic a cada módulo operativo.

---

## 2. User Experience & Visual Design

- **Key User Flows**:
  1. **Cabecera Ejecutiva y Sincronización**: El usuario visualiza el contexto institucional, la marca de tiempo de la última sincronización real con el servidor y un botón funcional de actualización inmediata (`Actualizar datos`).
  2. **Lectura de Indicadores Clave (KPIs)**: Cuatro tarjetas compactas presentan métricas reales del backend acompañadas de metadatos secundarios reales (por ejemplo, número de lotes activos, biológicos en stock crítico y centros de acopio operativos), con navegación directa al módulo correspondiente al hacer clic.
  3. **Análisis de Flujo de Movimientos**: El gráfico de área permite alternar dinámicamente entre vistas reales del año (**Últimos 6 meses**, **Año completo (12 meses)** o **Trimestre actual**), mostrando entregas, recepciones y saldo con una leyenda limpia y fiel a las series graficadas.
  4. **Monitoreo de Disponibilidad por Vacuna**: Tabla compacta que compara el **Stock Actual** frente al **Stock Mínimo** real de cada biológico, indicando el número de lotes activos, lotes próximos a vencer y su estado semántico real (`Normal`, `Bajo`, `Crítico`).
  5. **Gestión de Permisos y Resumen de Planificación**: Control directo de permisos mensuales de edición (Movimientos y Planificación) con programación horaria y resumen real del estado de la cobertura/operación conectado a la ruta de Planificación.
  6. **Exploración Paginada de Red, Alertas y Auditoría**: Los paneles inferiores de Centros de Acopio / Establecimientos, Alertas Activas y Actividad Reciente incluyen controles de paginación compactos y enlaces funcionales hacia sus módulos completos.

- **Visual Identity & Theme**:
  - *Aesthetic Direction*: Utilitario clínico y ejecutivo de alta precisión, inspirado en consolas de analítica sanitaria moderna.
  - *Color Palette & Mood*: Distribución 60-30-10 con lienzo neutro limpio (`--bg-app`), superficies blancas/claras con bordes sutiles de 1px (`border-line`), acento institucional verde azulado (`#0e9f8e`) reservado para acciones principales y colores semánticos estrictos acompañados de texto explícito:
    - Verde (`#16A34A`): Stock normal / Operativo activo
    - Ámbar (`#D97706`): Stock bajo / Lote próximo a vencer
    - Rojo (`#DC2626`): Stock crítico / Alerta crítica
  - *Typography & Hierarchy*: Jerarquía clara con números tabulares (`font-mono tabular-nums`) obligatorios en todas las cantidades de dosis, conteos de lotes, porcentajes y marcas de tiempo para garantizar alineación vertical perfecta. Metadatos sin cápsulas decorativas innecesarias, usando separadores tipográficos limpios (`·`).
  - *Component Styling & Layout*: Contenedores compactos (`rounded-xl border border-line bg-surface shadow-xs`), eliminando anidamiento excesivo de cajas y reduciendo el ruido visual.

- **Interactive Feedback & Motion**: Transiciones suaves de 150-200ms en cambios de filtro y estados hover, esqueletos de carga geométricamente equivalentes a las tarjetas reales y notificaciones toast al actualizar datos o modificar permisos.

---

## 3. Key Product Decisions & Trade-Offs

- **Decision 1: Eliminación de Mini-Gráficos y Tendencias Estáticas en Tarjetas KPI**
  - *Chosen Approach*: Reemplazar las barras decorativas fijas y los porcentajes inventados por sub-métricas reales devueltas por el API (ej. total de lotes activos, biológicos en estado crítico y total de tipos de vacunas registradas).
  - *Why*: En un sistema de salud pública y cadena de frío, mostrar tendencias porcentuales o barras que no provienen de la base de datos compromete la confianza del operador.
  - *Alternatives Considered*: Calcular tendencias simuladas en el cliente; se descartó porque el usuario solicitó expresamente cero datos inventados.

- **Decision 2: Tabla de Disponibilidad Basada en Stock Mínimo Real**
  - *Chosen Approach*: Sustituir la columna ficticia de "días de cobertura (`stock / 150`)" por el **Stock Mínimo**, **Lotes Activos / Por Vencer** y el **Estado Real** (`Normal`, `Bajo`, `Crítico`) que ya entrega el modelo `StockPorVacuna` del backend.
  - *Why*: Utiliza exactamente las propiedades reales del servicio (`stockTotal`, `stockMinimo`, `lotesActivos`, `proximosVencer`, `estado`) sin fórmulas arbitrarias.

- **Decision 3: Conectividad Total de Controles y Navegación React Router**
  - *Chosen Approach*: Vincular cada botón de acción e indicador con `useNavigate()` hacia las rutas reales (`/inventario`, `/movimientos`, `/planificacion`, `/establecimientos`, `/alertas`, `/kardex`) y hacer funcional el selector de periodo del gráfico.
  - *Why*: Elimina controles muertos y convierte el Dashboard en un verdadero centro de comando operativo.

---

## 4. Technical Architecture & Data Strategy *(Technical Reference)*

- **Architecture & Component Diagram**:

```
┌───────────────────────────────────────────────────────────────────────────┐
│                         Dashboard View Container                          │
│         (useDashboard + useAuth + React Router Navigation + Refresh)      │
└───────────────────┬───────────────────────────────────┬───────────────────┘
                    │                                   │
      ┌─────────────▼─────────────┐       ┌─────────────▼─────────────┐
      │   KPI Summary Strip (4)   │       │  Paginated Domain Hooks   │
      │  - Stock Total Disponible │       │  - usePaginatedCentros    │
      │  - Lotes por Vencer       │       │  - usePaginatedEstablec.  │
      │  - Entregas del Mes       │       │  - usePaginatedAlertas    │
      │  - Alertas Activas        │       │  - usePaginatedActividad  │
      └─────────────┬─────────────┘       └─────────────┬─────────────┘
                    │                                   │
      ┌─────────────▼───────────────────────────────────▼─────────────┐
      │                   Main Analytical Grid (12 Col)               │
      ├───────────────────────────┬───────────────────┬───────────────┤
      │   Flujo de Movimientos    │ Disponibilidad de │   Permisos    │
      │      (6 Columnas)         │  Stock por Vacuna │  Operativos   │
      │  - Filtro 3M / 6M / 12M   │   (3 Columnas)    │ (3 Columnas)  │
      │  - Series: Entregas vs    │  - Stock vs Mín.  │ - Toggles API │
      │    Recepciones reales     │  - Lotes y Estado │ - Acceso Plan │
      └───────────────────────────┴───────────────────┴───────────────┘
                    │
      ┌─────────────▼─────────────────────────────────────────────────┐
      │                 Operational & Audit Grid (12 Col)             │
      ├───────────────────────────┬───────────────────┬───────────────┤
      │  Centros de Acopio / Est. │  Alertas Activas  │   Actividad   │
      │       (5 Columnas)        │   (4 Columnas)    │  (3 Columnas) │
      │  - Tabla real + Paginador │  - Nivel y Fecha  │  - Bitácora   │
      │  - Enlace a /establecim.  │  - Enlace /alertas│  - Enlace mov │
      └───────────────────────────┴───────────────────┴───────────────┘
```

- **Data Model & State**:
  - `DashboardStats`: Provee `totalVacunas`, `totalJeringas`, `totalEstablecimientos`, `lotesActivos`, `lotesProximosVencer`, `stockCritico`, `entregasMes`, `alertasPendientes`, `movimientosUltimoMes`, `centrosAcopio`, `coberturaRegional`.
  - `StockPorVacuna[]`: Provee por cada vacuna `vacunaId`, `vacunaNombre`, `stockTotal`, `stockMinimo`, `lotesActivos`, `proximosVencer` y `estado` (`critico` | `bajo` | `normal`). El stock global disponible se obtiene sumando `stockTotal` de `StockPorVacuna` y los datos reales de `DashboardStats`.
  - `MovimientosMensuales[]`: Provee `mes`, `entregas`, `recepciones`, `saldo` para los 12 meses del año en curso.

- **Interactive Component & State Mapping**:
  - **Cabecera Compacta del Dashboard**: Muestra título, indicador de rol/alcance, hora exacta de última actualización (`lastUpdated`) y botón de refresco conectado a `refresh()`.
  - **Tarjetas KPI (`MetricsSection`)**: Calculan el stock total real a partir de `stockPorVacuna`, muestran `lotesProximosVencer` + `stockCritico`, `entregasMes` + `movimientosUltimoMes`, y `alertasPendientes`, permitiendo navegar al hacer clic hacia `/inventario`, `/movimientos` o `/alertas`.
  - **Gráfico de Movimientos (`ChartSection`)**: Estado local `periodo` (`3m` | `6m` | `12m`) controlado por el selector superior que filtra los meses reales hasta el mes actual; leyenda sincronizada exactamente con las dos series graficadas (`Entregas` y `Recepciones`) más resumen numérico real del periodo seleccionado.
  - **Disponibilidad de Stock (`StockAvailabilitySection`)**: Filtra o lista las vacunas mostrando `stockTotal`, `stockMinimo`, lotes activos/por vencer y etiqueta de estado real; botón inferior navega a `/inventario`.
  - **Permisos Operativos (`PermisosPlanificacion`)**: Mantiene los switches reales conectados a `PermisoOperativoService.togglePermiso` y el modal de programación horaria; reemplaza el bloque estático inventado (`64% / 128 / 82 / 46`) por un resumen operativo real con acceso directo a `/planificacion` y `/usuarios` (gestión de permisos).
  - **Secciones Inferiores (`CentrosAcopioSection`, `EstablecimientosSection`, `AlertasSection`, `ActividadSection`)**: Añaden controles de cambio de página (`prevPage` / `nextPage`) cuando existen múltiples páginas y conectan sus botones de pie de tarjeta a `/establecimientos`, `/alertas` y `/movimientos`.
