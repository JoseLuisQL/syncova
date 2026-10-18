# Rediseño Minimalista de SiBot IA con Panel Lateral Acoplado (Push Sidebar)

Refactorización integral de la experiencia de **SiBot IA** en SIVAC para transformarlo de una ventana flotante recargada a un **panel lateral derecho acoplado (docked sidebar)** que desplaza limpiamente el área de trabajo principal, eliminando la redundancia visual y corrigiendo la paleta cromática en modo día y modo noche.

---

## User Review & Critical Decisions

> [!IMPORTANT]
> Estas decisiones recogen tus respuestas confirmadas para garantizar una interfaz limpia, especializada y sin sobrecarga visual:

- **Decisión Confirmada 1 — Botón de Acceso Minimalista**: Se mantiene un botón flotante discreto y estilizado en la esquina inferior derecha para abrir SiBot (`⌘J`). Al abrirse el sidebar derecho, el lanzador flotante se oculta automáticamente para no superponerse con la caja de texto ni generar ruido visual (como ocurría antes con el botón blanco sobre el panel).
- **Decisión Confirmada 2 — Estado Inicial Libre de Ruido**: Se eliminan el segundo ícono repetido de robot, la tarjeta redundante de "Acción contextual", las 4 pestañas de categorías y los chips repetitivos del pie de entrada. En su lugar, la vista inicial muestra únicamente un **saludo breve contextualizado** y **3 sugerencias directas de una sola línea** adaptadas al módulo activo.
- **Decisión Confirmada 3 — Sidebar Derecho con Empuje de Vista (Push Layout)**: Al abrir SiBot en escritorio, el panel se acopla a toda la altura del borde derecho (`400px` por defecto) y empuja suavemente el contenedor principal y la cabecera superior hacia la izquierda. Incluye un botón en la cabecera del panel para **ampliar el ancho (`640px`)** cuando se visualizan tablas anchas o gráficos analíticos.

---

## 1. Overview & Core Concept

- **Qué Hace**: Proporciona un asistente analítico de inmunizaciones integrado de forma nativa en la estructura espacial de SIVAC, permitiendo consultar stock de biológicos, lotes por vencer (FEFO), planificación anual y exportar tablas a Excel sin tapar el contenido operativo de la pantalla.
- **Audiencia Objetivo**: Coordinadores y administradores de cadena de frío de DISA Apurímac II que requieren cruzar datos en tiempo real mientras navegan por Dashboard, Inventario, Movimientos o Kardex.
- **Valor Principal**: Elimina la fatiga visual y la superposición de elementos flotantes mediante un diseño editorial minimalista, jerarquía tipográfica clara y contraste impecable tanto en modo claro como en modo oscuro.

---

## 2. User Experience & Visual Design

### Flujo de Usuario Paso a Paso
1. **Estado Cerrado (Lanzador Discreto)**: En la esquina inferior derecha aparece un botón compacto de una sola línea con el isotipo de SiBot y etiqueta `SiBot IA`. En modo claro y oscuro conserva contraste garantizado sin inversión accidental de colores.
2. **Apertura con Empuje de Vista (Push Sidebar)**: Al hacer clic o presionar `Ctrl/⌘ + J`, el contenedor principal de la aplicación reduce su margen derecho de forma fluida (`transition-all duration-300 ease-out`) cediendo `400px` al panel lateral derecho fijo a pantalla completa (`100dvh`). En pantallas móviles (`< 1024px`), se adapta como un panel deslizable a pantalla completa.
3. **Vista Inicial Minimalista (Zero-State)**:
   - Cabecera superior limpia de una sola fila: indicador de nombre `SiBot`, contexto activo en texto sutil (`· Dashboard`) y acciones directas (Ampliar ancho, Limpiar/Exportar solo cuando hay conversación activa, y Cerrar).
   - Cuerpo central aireado: un saludo conciso de bienvenida y una lista vertical de **3 consultas sugeridas simples** propias del módulo actual, sin subtítulos largos ni cajas anidadas.
4. **Conversación y Visualización Analítica**:
   - **Mensajes del Usuario**: Burbuja compacta alineada a la derecha con fondo de acento sutil y texto legible en ambos temas (corrigiendo el fallo donde `bg-ink` se volvía blanco con texto blanco en modo oscuro).
   - **Respuestas de SiBot**: Diseño editorial limpio sin encajonamiento excesivo ("cards within cards"), con tipografía tabular (`tabular-nums`) para cifras de dosis y lotes, tablas con exportación directa a Excel y gráficos interactivos adaptados al tema activo.
   - **Modo Ampliado (`640px`)**: Con un clic en el ícono de expansión de la cabecera del sidebar, el panel se ensancha suavemente empujando la vista para inspeccionar tablas multicelda o gráficos comparativos con total comodidad.
5. **Compositor Minimalista**: Un único campo de entrada autoajustable con botón de envío integrado a la derecha, sin barras inferiores de botones redundantes.

### Identidad Visual y Sistema de Color (Día / Noche)

| Elemento | Modo Día (Light Mode) | Modo Noche (Dark Mode) | Propósito Visual |
| :--- | :--- | :--- | :--- |
| **Superficie del Sidebar** | `#FFFFFF` (`bg-surface`) | `#161920` / `#1A1D24` (`bg-surface`) | Lienzo limpio separado de la vista principal por un borde de `1px` (`border-line`) |
| **Cabecera y Compositor** | `#FBFAFD` (`bg-surface-soft`) | `#1E222B` (`bg-surface-soft`) | Delimitación estructural sutil sin sombras pesadas |
| **Mensaje del Usuario** | `#7C3AED` (`bg-brand`) con texto `#FFFFFF` | `#6D28D9` / `#7C3AED` con texto `#FFFFFF` | Contraste semántico consistente que nunca se invierte a blanco sobre blanco |
| **Respuesta de SiBot** | Texto `#15171D` sobre fondo transparente/sutil | Texto `#E8E9ED` sobre superficie oscura | Lectura fluida tipo documento analítico sin bordes dobles |
| **Sugerencias Iniciales** | Filas limpias con borde `1px` `#E7E7EF` y hover sutil | Filas con borde `1px` `#2A2D36` y hover `#21242C` | Interacción rápida sin tarjetas sobrecargadas |

---

## 3. Key Product Decisions & Trade-Offs

- **Decisión 1: Estado Global del Sidebar Derecho en el Contexto de Layout**
  - *Enfoque Elegido*: Sincronizar el estado de apertura (`sibotOpen`) y el modo de ancho (`sibotExpanded`: `400px` vs `640px`) en el contexto global de la aplicación para que el contenedor principal aplique margen derecho dinámico (`lg:mr-[400px]` o `lg:mr-[640px]`).
  - *Por Qué*: Permite que tanto la barra superior (`Header`) como el contenido del módulo activo se reacomoden de forma nativa y proporcional sin quedar ocultos detrás de un modal flotante.
  - *Alternativas Descartadas*: Mantener `position: fixed` superpuesto sobre el contenido; se descartó porque tapaba tablas, botones de acción y métricas del lado derecho.
- **Decisión 2: Eliminación de Modificadores y Pestañas en el Compositor y Estado Inicial**
  - *Enfoque Elegido*: Retirar la barra de pestañas (`Inventario | Entregas | Riesgos | Gráficos`), el banner de "Acción contextual" y los botones inferiores del input (`Gráfico | Tabla Excel | Por vencer`), dejando únicamente 3 sugerencias contextuales directas y el campo de texto limpio.
  - *Por Qué*: Esos elementos duplicaban exactamente la misma función en tres lugares distintos dentro de un espacio de `400px`, generando saturación visual.
- **Decisión 3: Corrección de Tokens Semánticos en Modo Oscuro**
  - *Enfoque Elegido*: Reemplazar el uso de `bg-ink text-white` en botones y burbujas de usuario por superficies semánticas explícitas (`bg-brand text-white` y `bg-surface-soft text-ink border-line`).
  - *Por Qué*: En el sistema de diseño de SIVAC, `--color-ink` se invierte automáticamente de `#15171D` (claro) a `#E8E9ED` (oscuro). Usarlo como fondo con texto blanco provocaba bloques blancos ilegibles en modo noche.

---

## 4. Technical Architecture & Data Strategy

### Diagrama de Arquitectura y Layout Espacial

```
┌──────────────────────────────────────────────────────────────────────────────────────┐
│                                  AppContext Global                                   │
│           [ sidebarCollapsed (Izq) | sibotOpen (Der) | sibotExpanded (Der) ]         │
└───────────────────┬──────────────────────────────────────────────┬───────────────────┘
                    │                                              │
                    ▼                                              ▼
┌───────────────────────────────────────────────────┐  ┌───────────────────────────────┐
│Contenedor Principal (Layout)                      │  │Sidebar Derecho SiBot (Docked) │
│• Margen Izq: lg:ml-[100px] / lg:ml-[286px]        │  │• Ancho: 400px (o 640px ampl.) │
│• Margen Der: lg:mr-[400px] / lg:mr-[640px]        │  │• Altura: 100dvh fijo a der.   │
│                                                   │  │• Borde izq: 1px border-line   │
│  ┌─────────────────────────────────────────────┐  │  ├───────────────────────────────┤
│  │ Header Superior (Se ajusta al ancho útil)   │  │  │ 1. Cabecera Minimalista       │
│  └─────────────────────────────────────────────┘  │  │    SiBot · Contexto | [⤢] [✕] │
│  ┌─────────────────────────────────────────────┐  │  ├───────────────────────────────┤
│  │ Vista del Módulo Activo                     │  │  │ 2. Lienzo de Conversación     │
│  │ (Dashboard, Inventario, Movimientos, etc.)  │  │  │    - Estado 0: Saludo +       │
│  │ Empujado limpiamente sin superposición      │  │  │      3 sugerencias simples    │
│  │                                             │  │  │    - Mensajes editoriales     │
│  │                                             │  │  │    - Tablas Excel y Gráficos  │
│  └─────────────────────────────────────────────┘  │  ├───────────────────────────────┤
│                                                   │  │ 3. Input Limpio Integrado     │
│                                      [SiBot ⌘J]◄──┼──│    [ Escribe tu consulta... ↑]│
│                           (Solo visible cerrado)  │  └───────────────────────────────┘
└───────────────────────────────────────────────────┘
```

### Mapeo de Interacciones y Estado
- **Apertura / Cierre (`sibotOpen`)**:
  - Al estar cerrado (`sibotOpen = false`), se muestra el botón flotante minimalista en la esquina inferior derecha y el área principal ocupa el `100%` del ancho disponible.
  - Al abrirse (`sibotOpen = true`), el botón flotante desaparece, el panel derecho entra con una transición suave y el contenedor principal aplica `lg:mr-[400px]`.
- **Cambio de Ancho (`sibotExpanded`)**:
  - El botón de amplitud en la cabecera del sidebar alterna entre `400px` (modo lectura/consulta rápida) y `640px` (modo análisis para tablas y gráficos), actualizando en simultáneo el margen derecho del layout principal.
- **Sugerencias Contextuales Dinámicas**:
  - Según `currentModule` (`dashboard`, `inventario`, `movimientos`, `planificacion`, `kardex`, `alertas`, etc.), se seleccionan automáticamente 3 consultas breves de una línea que al hacer clic disparan `append({ role: 'user', content: prompt })`.
