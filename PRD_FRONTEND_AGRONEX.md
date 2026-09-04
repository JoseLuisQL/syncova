# PRD — FRONTEND AGRONEX
## Plataforma AgTech de Trazabilidad QR y Gestión Agronómica del Palto Hass
### Aplicación Móvil (Android) + Web (Panel Admin + Portal Público) — React Native / Expo

| Campo | Valor |
|---|---|
| Producto | AGRONEX — Frontend multiplataforma |
| Versión del PRD | 1.0 |
| Alcance | Solo frontend (consume la REST API descrita en la Especificación Técnica AGRONEX) |
| Plataformas | Android 8.0+ (APK vía EAS Build) · Web (Chrome, Safari, Edge; móvil y escritorio) |
| Stack base | Expo SDK 51+ · React Native · TypeScript strict · Expo Router (sobre React Navigation v6) |
| Ámbito | Distrito de Andarapa, Andahuaylas, Apurímac — Perú (Tesis 2026, 14 productores) |
| Idioma de la UI | Español (Perú), lenguaje claro y no técnico para el productor |
| Estilo visual | Original, minimalista, profesional y limpio (Design System "Andar") |

---

## 0. Cómo usar este documento (instrucciones para el agente de IA)

1. **Trabaja fase por fase** (sección 12). No inicies una fase sin cumplir la *Definition of Done* de la anterior.
2. **El diseño es obligatorio**: usa exclusivamente los tokens y componentes del Design System "Andar" (sección 6). No introduzcas librerías de UI (NativeBase, Paper, Tamagui, etc.). Todo componente se construye desde `View`, `Text`, `Pressable` y los tokens.
3. **Maquetación**: cada pantalla de la sección 8 tiene un wireframe y una especificación. Implementa exactamente la estructura indicada; el detalle visual fino debe respetar espaciado, tipografía y color definidos.
4. **Backend**: hasta que el backend esté disponible, desarrolla contra los **mocks** (sección 10.6, MSW + datos semilla). El contrato de API (sección 10.3) es la única fuente de verdad; los endpoints marcados como `[PROPUESTO]` deben confirmarse con backend, pero impleméntalos ya con mocks.
5. **Convenciones**: sección 13. Código en inglés (nombres de archivos, variables, tipos); textos de UI en español dentro de `src/i18n/es.ts`.
6. **Nunca rompas las reglas de negocio** RN-01 a RN-07 (sección 4.4): se validan en el cliente además del servidor.
7. Al terminar cada fase, genera un `CHANGELOG.md` con lo implementado y una lista de pendientes.

---

## 1. Resumen ejecutivo

AGRONEX reemplaza el cuaderno de campo en papel de los productores de palto Hass de Andarapa por una app móvil **offline-first** que registra 6 labores agrícolas con evidencia fotográfica, genera un **código QR único e inmutable por lote** que se imprime en las jabas, y expone un **portal web público** de trazabilidad viva. Un panel de administración web permite al investigador gestionar el padrón y exportar la base de datos a Excel y CSV codificado para IBM SPSS.

El frontend que describe este PRD entrega **tres experiencias** sobre un solo código base:

| Experiencia | Usuario | Plataforma principal | Módulos |
|---|---|---|---|
| **App Productor** | Productor agrícola | Android (APK) + Web responsive | M1, M2 (lectura + lotes propios), M3, M4 |
| **Panel Administrador** | Investigador / Asesor | Web escritorio (también usable en tablet/móvil) | M1, M2 (CRUD total), M3 (todos los lotes), M4, M6 |
| **Portal Público de Trazabilidad** | Comprador / Certificadora / Consumidor | Web móvil (abre al escanear QR), sin login | M5 |

---

## 2. Objetivos, métricas de éxito y no-objetivos

### 2.1 Objetivos del frontend
- O1. Que un productor con baja alfabetización digital registre una labor en **≤ 60 segundos** y **≤ 6 toques**, con o sin internet.
- O2. Que el QR de un lote se genere, visualice y descargue como etiqueta PNG imprimible en **≤ 3 toques** desde el inicio.
- O3. Que la página pública `/trace/{token}` cargue en **< 2 s en 3G/4G** y sea legible en cualquier celular.
- O4. Que el administrador gestione el padrón completo y exporte Excel/SPSS con **un solo clic**.
- O5. Puntaje **SUS ≥ 70** con los 14 productores (RNF Usabilidad Rural).

### 2.2 Métricas de aceptación técnica
- Lighthouse (portal público, móvil): Performance ≥ 85, Accessibility ≥ 95.
- Cero registros perdidos en pruebas de modo avión → reconexión (100 registros).
- Tamaño de APK ≤ 40 MB. Tiempo de arranque en frío ≤ 2.5 s en gama baja (2 GB RAM).
- Cobertura de tests unitarios en lógica de dominio y sincronización ≥ 80 %.

### 2.3 No-objetivos (fuera de alcance de este PRD)
- Implementación del backend, base de datos o infraestructura.
- iOS (arquitectura compatible, pero no se construye ni prueba).
- Registro de usuarios auto-gestionado (solo el Admin crea productores).
- Pagos, marketplace, chat o notificaciones push.

---

## 3. Usuarios, roles y permisos (RBAC en cliente)

| Operación | PRODUCTOR | ADMIN | PÚBLICO |
|---|---|---|---|
| Login con DNI + contraseña | ✅ | ✅ | — |
| Ver parcelas y lotes | Solo propios | Todos | — |
| Crear parcela / lote | Propios | Todos | — |
| Registrar labores y evidencias | Solo lotes propios | Todos los lotes | ❌ |
| Ver/descargar QR de lote | Solo propios | Todos | ❌ |
| Escanear QR con cámara | ✅ | ✅ | ✅ (cámara del celular) |
| Ver portal público `/trace/:token` | ✅ | ✅ | ✅ |
| CRUD de productores | ❌ | ✅ | ❌ |
| Consolidado y exportación Excel/SPSS | ❌ | ✅ | ❌ |

Implementación: el rol viaja en el objeto `user` devuelto por `/auth/login`. El cliente aplica **route guards** (sección 7.3) y **oculta** acciones no permitidas; el servidor sigue siendo la autoridad final.

### 3.1 Perfiles de usuario (para decisiones de UX)

**Productor "Don Julián" (55 años, Sector Chuspi)**  
Usa un Android de gama baja, señal intermitente, dedos gruesos, lee con lentes. Necesita: botones grandes, poco texto, íconos reconocibles, confirmaciones claras ("Guardado. Se enviará cuando haya señal").

**Administrador "Ing. Rocío" (investigadora)**  
Trabaja en laptop. Necesita: tablas con filtros, ver todo el padrón de un vistazo, exportar datos y auditar registros con fotos.

**Comprador "Sr. Quispe" (acopiador)**  
Escanea desde su celular en el mercado. Necesita: ver en 5 segundos origen, productor, última cosecha y que hay registros con fotos.

---

## 4. Dominio funcional (síntesis del documento técnico)

### 4.1 Jerarquía
`Productor (1) → Parcela (N) → Lote (N, unidad QR) → Actividades (N) → QR dinámico e inmutable`

### 4.2 Entidades y tipos TypeScript (fuente de verdad del frontend)

```ts
// src/types/domain.ts
export type Role = 'ADMIN' | 'PRODUCTOR';

export interface User {
  id: number;
  dni: string;               // 8 dígitos
  nombres: string;
  apellidos: string;
  telefono?: string | null;
  sector_andarapa: string;
  rol: Role;
  created_at: string;        // ISO
}

export interface Producer extends Omit<User, 'rol'> {
  rol: 'PRODUCTOR';
  parcelas_count?: number;
  lotes_count?: number;
}

export interface Parcel {
  id: number;
  productor_id: number;
  nombre_parcela: string;
  sector: string;
  area_total_ha: number;     // > 0
  created_at: string;
  lotes?: Lot[];
}

export interface Lot {
  id: number;
  parcela_id: number;
  codigo_lote: string;       // LOTE-AND-001 (autogenerado por backend)
  cultivo: string;           // 'Palto Hass'
  patron_portainjerto: 'Duke 7' | 'Topa Topa' | string;
  ano_plantacion: number;    // >= 2000
  area_lote_ha: number;      // > 0
  num_arboles: number;       // > 0
  qr_token: string;          // UUID v4 inmutable
  created_at: string;
  // derivados en cliente
  densidad?: number;         // num_arboles / area_lote_ha
  ultima_actividad?: Activity | null;
  total_actividades?: number;
}

export type ActivityType =
  | 'RIEGO' | 'FERTILIZACION' | 'PODA' | 'CONTROL_PLAGAS'
  | 'APLICACION_INSUMOS' | 'COSECHA' | 'POSTCOSECHA';

export interface Activity {
  id: number;
  lote_id: number;
  tipo_actividad: ActivityType;
  fecha_actividad: string;   // YYYY-MM-DD, no futura (RN-04)
  responsable: string;
  insumo_producto?: string | null;
  cantidad_dosis?: string | null;
  observaciones?: string | null;
  evidencia_url?: string | null;
  detalle_tecnico: ActivityDetail;
  created_at: string;
}

// Detalle técnico tipado por tipo (se serializa en JSONB detalle_tecnico)
export type ActivityDetail =
  | { tipo: 'RIEGO'; metodo: 'GOTEO' | 'GRAVEDAD' | 'ASPERSION'; horas: number; volumen_m3?: number }
  | { tipo: 'FERTILIZACION'; clase: 'ORGANICO' | 'QUIMICO'; metodo: 'SUELO' | 'FERTIRRIEGO' }
  | { tipo: 'PODA'; tipo_poda: 'FORMACION' | 'PRODUCCION' | 'SANITARIA'; deshierbe: boolean }
  | { tipo: 'CONTROL_PLAGAS'; plaga: string; ingrediente_activo?: string; periodo_carencia_dias?: number }
  | { tipo: 'APLICACION_INSUMOS'; objetivo?: string }
  | { tipo: 'COSECHA'; num_jabas: number; peso_kg: number; calidad?: 'PRIMERA' | 'SEGUNDA' | 'DESCARTE' | 'MIXTA' }
  | { tipo: 'POSTCOSECHA'; seleccion?: string; peso_final_kg?: number; comprador_destino?: string; lote_acopio?: string };

// Ficha pública (respuesta de GET /public/trace/:token)
export interface PublicTrace {
  lote: Pick<Lot, 'codigo_lote' | 'cultivo' | 'patron_portainjerto' | 'ano_plantacion' | 'area_lote_ha' | 'num_arboles'>;
  parcela: Pick<Parcel, 'nombre_parcela' | 'sector'>;
  productor: { nombres: string; apellidos: string; sector_andarapa: string };
  origen: { distrito: 'Andarapa'; provincia: 'Andahuaylas'; region: 'Apurímac'; pais: 'Perú' };
  bpa: { sello: boolean; criterios_cumplidos: string[] };
  resumen: { total_actividades: number; ultima_cosecha?: { fecha: string; peso_kg: number; num_jabas: number } | null; actualizado_en: string };
  actividades: Activity[];   // orden cronológico descendente
}
```

### 4.3 Catálogo de las 6 labores (+ postcosecha) y sus formularios

| Tipo | Etiqueta UI | Ícono (lucide) | Color chip | Campos específicos (además de fecha, responsable, observaciones, foto) | Obligatorios |
|---|---|---|---|---|---|
| RIEGO | Riego | `Droplets` | `info` | Método (Goteo/Gravedad/Aspersión), Horas, Volumen m³ (opc.) | método, horas |
| FERTILIZACION | Abono / Fertilización | `Sprout` | `earth` | Clase (Orgánico/Químico), Producto, Dosis, Método (Suelo/Fertirriego) | producto, dosis (RN-05) |
| PODA | Poda y labores culturales | `Scissors` | `brand` | Tipo de poda (Formación/Producción/Sanitaria), Deshierbe (sí/no) | tipo_poda |
| CONTROL_PLAGAS | Control de plagas | `Bug` | `warning` | Plaga (arañita roja, trips, Phytophthora, otra), Producto, Ingrediente activo, Dosis, Periodo de carencia (días) | plaga, producto, dosis (RN-05) |
| APLICACION_INSUMOS | Otros insumos | `FlaskConical` | `neutral` | Producto, Dosis, Objetivo | producto, dosis |
| COSECHA | Cosecha | `Package` | `accent` | N° de jabas, Peso neto (kg), Calidad | jabas > 0, kg > 0 (RN-07) |
| POSTCOSECHA | Postcosecha y embalaje | `Truck` | `neutral` | Selección, Peso final (kg), Comprador/Destino, Lote de acopio | ninguno obligatorio |

### 4.4 Reglas de negocio validadas en el cliente
- **RN-01** DNI: exactamente 8 dígitos numéricos (login y formularios de productor).
- **RN-02** Jerarquía: no se puede crear un lote sin parcela seleccionada; no se puede crear parcela sin productor (admin) o sin sesión de productor.
- **RN-03** QR inmutable: la UI **nunca** ofrece "regenerar QR". El token se muestra como solo lectura.
- **RN-04** Fecha de actividad ≤ hoy (DatePicker con `maximumDate = hoy`, y validación zod).
- **RN-05** Fertilización y control de plagas exigen producto y dosis.
- **RN-06** No se muestran botones de eliminar parcela/lote si tienen actividades; si el servidor rechaza, mostrar mensaje explicativo.
- **RN-07** Cosecha: jabas y kilos estrictamente > 0.
- Densidad (RF-2.04): `densidad = num_arboles / area_lote_ha`, formateada con 0 decimales y unidad "árb/ha", con badge: < 150 "Baja", 150–400 "Media", > 400 "Alta" (solo informativo).

---

## 5. Stack tecnológico y decisiones de arquitectura

| Área | Decisión | Justificación |
|---|---|---|
| Framework | **Expo SDK 51+** (managed), React Native 0.74+, **TypeScript strict** | Web + Android desde un código base; EAS Build para APK |
| Navegación | **Expo Router v3** (file-based; construido sobre React Navigation v6) | URLs reales en web (`/trace/:token`), deep links en Android, stacks/tabs nativos |
| Estado servidor | **TanStack Query v5** | Caché, reintentos, `persistQueryClient` para lectura offline |
| Estado cliente | **Zustand** (auth, red, cola de sync, UI) | Simple, sin boilerplate |
| Formularios | **react-hook-form + zod** | Validación tipada de RN-01..07 |
| HTTP | `fetch` envuelto en `apiClient` (interceptores de JWT, errores normalizados) | Sin dependencias pesadas |
| Persistencia local | **expo-sqlite** (cola offline + espejo de lotes/actividades) · **expo-secure-store** (JWT nativo) · `localStorage` (JWT web) | Cumple RF-1.03 y M20 offline-first |
| Conectividad | `@react-native-community/netinfo` | Listener global para sincronización |
| QR generación | `react-native-qrcode-svg` (vectorial) | RF-4.01 / 4.03 |
| Etiqueta PNG | Nativo: `react-native-view-shot` · Web: `html-to-image` | Captura del componente `QRLabelTemplate` |
| Guardar/compartir | `expo-file-system`, `expo-media-library`, `expo-sharing` · Web: `<a download>` | RF-4.03 |
| Escáner QR | Nativo: `expo-camera` (`CameraView` + `barcodeScannerSettings`) · Web: `html5-qrcode` | RF-4.04 |
| Fotos | `expo-image-picker` (cámara + galería), `expo-image-manipulator` (redimensionar a 1280 px, JPEG 0.7) | Evidencias ligeras para 3G |
| Íconos | `lucide-react-native` | Trazo fino y consistente con estilo minimalista |
| Tipografía | `expo-font` con **Manrope** (títulos) e **Inter** (cuerpo) | Ver sección 6 |
| Tablas web | Componente propio `DataTable` (virtualizado con `FlashList` en móvil) | Sin dependencias de UI |
| Mocks | **MSW** (web) + `msw/native` (Android) + datos semilla | Desarrollo independiente del backend |
| Tests | Jest + `@testing-library/react-native`; Playwright para web (smoke) | Calidad |
| Lint/format | ESLint (expo config) + Prettier + import-sort; Husky pre-commit | Consistencia |

### 5.1 Arquitectura del cliente (capas)

```
┌──────────────────────────────────────────────────────────────┐
│ app/  (Expo Router: rutas, layouts, guards)                  │
├──────────────────────────────────────────────────────────────┤
│ features/<dominio>/   screens · components · hooks · schemas │
│   auth · producers · parcels · lots · activities · qr ·      │
│   trace · reports · sync · profile                           │
├──────────────────────────────────────────────────────────────┤
│ design-system/   tokens · primitives · components · layout   │
├──────────────────────────────────────────────────────────────┤
│ services/   api (client + endpoints) · db (sqlite) · storage │
│             · files · camera · network                       │
├──────────────────────────────────────────────────────────────┤
│ store/ (zustand)   authStore · networkStore · syncStore · ui │
├──────────────────────────────────────────────────────────────┤
│ types/ · utils/ · i18n/ · mocks/ · config/                   │
└──────────────────────────────────────────────────────────────┘
Regla: las pantallas nunca llaman a fetch/sqlite directamente; siempre vía hooks de feature
(useLots, useCreateActivity…) que orquestan TanStack Query + repositorios.
```

### 5.2 Estructura de carpetas

```
agronex-frontend/
├─ app/
│  ├─ _layout.tsx                 # Providers, fuentes, SplashScreen, NetInfo, AuthGate
│  ├─ index.tsx                   # Redirección por rol / sesión
│  ├─ +not-found.tsx
│  ├─ (auth)/
│  │  └─ login.tsx
│  ├─ (producer)/                 # Guard: rol PRODUCTOR (o ADMIN en "modo campo")
│  │  ├─ _layout.tsx              # Tabs inferiores (móvil) / top-nav (web)
│  │  ├─ lotes/
│  │  │  ├─ index.tsx             # Tab 1: Mis Lotes
│  │  │  ├─ [id].tsx              # Detalle de lote + línea de tiempo
│  │  │  └─ nuevo.tsx             # Wizard crear lote (y parcela si no hay)
│  │  ├─ parcelas/nueva.tsx
│  │  ├─ registrar/
│  │  │  ├─ index.tsx             # Tab 2: selector de labor
│  │  │  └─ [tipo].tsx            # Formulario dinámico por tipo
│  │  ├─ qr/
│  │  │  ├─ index.tsx             # Tab 3: Mis Códigos QR
│  │  │  └─ [loteId].tsx          # Vista QR + descargar etiqueta
│  │  └─ perfil/index.tsx         # Tab 4: Perfil, sincronización, cerrar sesión
│  ├─ (admin)/                    # Guard: rol ADMIN
│  │  ├─ _layout.tsx              # Sidebar (web) / Drawer (móvil)
│  │  ├─ dashboard.tsx
│  │  ├─ productores/{index,nuevo,[id]}.tsx
│  │  ├─ parcelas/index.tsx
│  │  ├─ lotes/{index,[id]}.tsx
│  │  ├─ actividades/index.tsx    # Consolidado con filtros (RF-6.01)
│  │  └─ reportes/index.tsx       # Exportaciones (RF-6.02/6.03)
│  ├─ actividades/[id].tsx        # Detalle de actividad (ambos roles)
│  ├─ escanear.tsx                # Escáner QR (modal fullscreen)
│  ├─ sincronizacion.tsx          # Centro de sincronización
│  └─ trace/[token].tsx           # PORTAL PÚBLICO (sin guard)
├─ src/
│  ├─ design-system/
│  │  ├─ tokens/{colors,typography,spacing,radius,shadows,motion}.ts
│  │  ├─ theme/{ThemeProvider.tsx,useTheme.ts}
│  │  ├─ primitives/{Box,Stack,Text,Pressable}.tsx
│  │  ├─ components/…             # catálogo sección 6.7
│  │  └─ layout/{Screen,TopBar,TabBar,Sidebar,Container,Responsive}.tsx
│  ├─ features/
│  │  ├─ auth/{screens,components,hooks,schemas}
│  │  ├─ producers/…  parcels/…  lots/…  activities/…  qr/…  trace/…  reports/…  sync/…  profile/…
│  ├─ services/
│  │  ├─ api/{client.ts,endpoints.ts,errors.ts,upload.ts}
│  │  ├─ db/{sqlite.ts,schema.ts,repositories/*.ts}
│  │  ├─ storage/{secure.ts,secure.web.ts,kv.ts}
│  │  ├─ files/{saveImage.ts,saveImage.web.ts,download.ts}
│  │  ├─ camera/{Scanner.tsx,Scanner.web.tsx,pickEvidence.ts}
│  │  └─ network/{netinfo.ts}
│  ├─ store/{authStore,networkStore,syncStore,uiStore}.ts
│  ├─ i18n/es.ts
│  ├─ config/{env.ts,constants.ts,breakpoints.ts}
│  ├─ mocks/{handlers.ts,seed.ts,browser.ts,native.ts}
│  ├─ types/{domain.ts,api.ts,navigation.ts}
│  └─ utils/{format,date,validators,density,qrUrl}.ts
├─ assets/{fonts,images,icons}
├─ __tests__/
├─ app.json · eas.json · tsconfig.json · .env.example · README.md
```

### 5.3 Configuración de entorno

```
# .env.example
EXPO_PUBLIC_API_URL=https://api.agronex.andarapa.pe/api/v1
EXPO_PUBLIC_TRACE_BASE_URL=https://agronex.andarapa.pe/trace
EXPO_PUBLIC_USE_MOCKS=true
EXPO_PUBLIC_APP_ENV=development
```

`app.json` relevante: `scheme: "agronex"`, `web.output: "static"`, `android.package: "pe.andarapa.agronex"`, `android.intentFilters` para `https://agronex.andarapa.pe/trace/*` (App Links), permisos `CAMERA`, `READ/WRITE_MEDIA_IMAGES`. Íconos adaptativos y splash generados desde el logotipo (sección 6.1).

---

## 6. Design System "Andar" — identidad visual original

### 6.1 Concepto
Nombre interno: **Andar** (de Andarapa; también "andar" = recorrer el camino del fruto). Estética **minimalista agro-técnica**: fondos casi blancos con tinte cálido (papel de cuaderno), un solo verde profundo como color de marca (piel del Hass madura), un acento lima (pulpa) usado con moderación, tierra como color secundario, líneas finas en lugar de sombras, esquinas suaves, mucho aire, tipografía grande.

**Logotipo**: wordmark "AGRONEX" en Manrope 800, tracking +2 %, con el símbolo: un círculo verde-900 con un cuarto de círculo lima (semilla del palto) desplazado 4 px hacia arriba-derecha. Isotipo mínimo: el círculo con la "semilla". Se entrega como SVG en `assets/images/logo.svg` y `mark.svg` (el agente debe crearlos con estas especificaciones).

**Principios**
1. *Una acción principal por pantalla*, siempre visible (botón de 56 dp o FAB).
2. *Texto primero, ícono de apoyo*: nunca un ícono sin etiqueta en acciones críticas.
3. *Estados siempre visibles*: sin señal, pendiente de sincronizar, sincronizado.
4. *Sin ruido*: sin degradados, sin sombras profundas, sin bordes de 2 px, máximo 2 pesos tipográficos por bloque.
5. *Consistente entre móvil y web*: mismos componentes; cambia el layout, no el lenguaje.

### 6.2 Color

```ts
// src/design-system/tokens/colors.ts
export const palette = {
  brand:   { 900:'#13301F', 800:'#1A3F2A', 700:'#22553A', 600:'#2B6B48', 500:'#3A8A5C', 300:'#8FC2A3', 100:'#DDEEE3', 50:'#F1F7F3' },
  accent:  { 600:'#8FA83C', 500:'#B4CF55', 300:'#D3E48E', 100:'#EEF4D6', 50:'#F7FAEA' },   // lima / pulpa
  earth:   { 700:'#5E4630', 500:'#8C6A48', 300:'#C4A98C', 100:'#F1E9DF', 50:'#F8F4EE' },   // tierra
  neutral: { 0:'#FFFFFF', 50:'#FAFAF7', 100:'#F3F3EE', 200:'#E6E6DF', 300:'#CFCFC6', 400:'#A9A99F', 500:'#80807A', 600:'#5F5F59', 700:'#45453F', 800:'#2B2B27', 900:'#191A17' },
  success: { 600:'#2E7D4F', 100:'#E1F2E8' },
  warning: { 600:'#B7791F', 100:'#FBF0DA' },
  danger:  { 600:'#B8402F', 100:'#F9E3DF' },
  info:    { 600:'#2F6690', 100:'#E1ECF4' },
} as const;

export const semantic = {
  bg:            palette.neutral[50],   // fondo de pantalla
  surface:       palette.neutral[0],    // tarjetas
  surfaceMuted:  palette.neutral[100],
  border:        palette.neutral[200],
  borderStrong:  palette.neutral[300],
  textPrimary:   palette.neutral[900],
  textSecondary: palette.neutral[600],
  textMuted:     palette.neutral[400],
  textOnBrand:   palette.neutral[0],
  primary:       palette.brand[700],
  primaryHover:  palette.brand[800],
  primarySoft:   palette.brand[50],
  accent:        palette.accent[500],
  accentSoft:    palette.accent[100],
  focus:         palette.brand[500],
  overlay:       'rgba(25,26,23,0.48)',
} as const;

export const activityColor: Record<ActivityType, { fg: string; bg: string }> = {
  RIEGO:              { fg: palette.info[600],    bg: palette.info[100] },
  FERTILIZACION:      { fg: palette.earth[700],   bg: palette.earth[100] },
  PODA:               { fg: palette.brand[700],   bg: palette.brand[100] },
  CONTROL_PLAGAS:     { fg: palette.warning[600], bg: palette.warning[100] },
  APLICACION_INSUMOS: { fg: palette.neutral[700], bg: palette.neutral[100] },
  COSECHA:            { fg: palette.accent[600],  bg: palette.accent[100] },
  POSTCOSECHA:        { fg: palette.neutral[600], bg: palette.neutral[100] },
};
```

Contraste: todo texto sobre fondo cumple **WCAG AA (≥ 4.5:1)**. `brand.700` sobre blanco = 8.1:1. Nunca usar `accent.500` como fondo de texto blanco (usar `accent.100` de fondo con texto `accent.600`/`neutral.900`).

Modo oscuro: **no** en v1 (los productores usan la app a pleno sol; prioridad al contraste alto en claro). Tokens listos para extenderse.

### 6.3 Tipografía

| Token | Fuente | Tamaño/Interlínea | Peso | Uso |
|---|---|---|---|---|
| `display` | Manrope | 32 / 40 | 700 | Números grandes (kg cosechados, QR) |
| `h1` | Manrope | 26 / 32 | 700 | Título de pantalla |
| `h2` | Manrope | 22 / 28 | 700 | Título de sección/tarjeta |
| `h3` | Manrope | 18 / 24 | 600 | Subtítulos, encabezados de lista |
| `bodyLg` | Inter | 18 / 26 | 400/500 | Texto principal en flujo productor |
| `body` | Inter | 16 / 24 | 400/500 | Texto general |
| `bodySm` | Inter | 14 / 20 | 400/500 | Secundario, metadatos |
| `caption` | Inter | 12 / 16 | 500 | Etiquetas, chips (mayúsculas con tracking +4 %) |
| `mono` | JetBrains Mono (o `monospace`) | 14 / 20 | 500 | Códigos de lote, tokens, DNI |

Reglas: tamaño mínimo en la app productor = 14; respetar `allowFontScaling` hasta 1.3×; títulos siempre en *sentence case* ("Registrar riego", no "Registrar Riego").

### 6.4 Espaciado, radios, bordes, sombras, movimiento

```ts
export const space = { 0:0, 1:4, 2:8, 3:12, 4:16, 5:20, 6:24, 7:32, 8:40, 9:48, 10:64 };
export const radius = { sm:8, md:12, lg:16, xl:24, full:999 };
export const border = { hairline: StyleSheet.hairlineWidth, thin: 1 };
export const shadow = {
  none: {},
  fab:  { elevation: 6, shadowColor:'#191A17', shadowOpacity:0.18, shadowRadius:12, shadowOffset:{width:0,height:6} },
  modal:{ elevation: 12, shadowColor:'#191A17', shadowOpacity:0.24, shadowRadius:24, shadowOffset:{width:0,height:12} },
};
export const motion = { fast:120, base:200, slow:320, easing:'cubic-bezier(0.2,0,0,1)' };
```

- Tarjetas: `surface` + borde `thin border`, radio `lg`, padding `space[4]`. **Sin sombra**.
- Separadores: hairline `border`.
- Márgenes de pantalla: 16 (móvil), 24 (tablet), 32 (web).
- Grid web: 12 columnas, gutter 24, `maxWidth` de contenido 1200 (admin) / 720 (productor web) / 640 (portal público).

### 6.5 Iconografía e ilustración
- Lucide, trazo 1.75, tamaño 20 (inline), 24 (botones), 28 (tabs), 40 (selector de labor).
- Estados vacíos: ilustración lineal monocroma (trazo `neutral.300`, relleno `brand.50`) generada como SVG simple (árbol de palto estilizado, cuaderno, QR). No usar stock 3D ni fotografías de banco.

### 6.6 Accesibilidad y usabilidad rural (RNF)
- Área táctil mínima **48×48 dp**; acciones primarias **56 dp**.
- `accessibilityLabel` y `accessibilityRole` en todo control.
- Foco visible en web (anillo 2 px `focus`).
- Feedback háptico (`expo-haptics`) en guardar/escaneo exitoso.
- Teclado numérico para DNI, dosis, kg, horas.
- Copy: frases cortas, verbo primero, sin anglicismos ("Guardar", "Tomar foto", "Sin señal: se guardó en tu celular").

### 6.7 Catálogo de componentes (todos en `src/design-system/components`)

| Componente | Variantes / Props clave | Notas |
|---|---|---|
| `Button` | `variant: primary\|secondary\|ghost\|danger\|accent` · `size: lg(56)\|md(48)\|sm(40)` · `leftIcon` · `loading` · `fullWidth` | Primary = fondo `primary`, texto blanco, radio `md`. Secondary = borde `borderStrong`, texto `textPrimary`. |
| `IconButton` | `size 48` · `variant ghost\|outline` | Siempre con `accessibilityLabel` |
| `FAB` | Ícono + etiqueta corta ("Registrar") | Sombra `fab`, color `primary`, esquina inferior derecha |
| `TextField` | `label` · `helper` · `error` · `prefix/suffix` · `keyboardType` · `mono` | Altura 56, borde 1 px, foco borde `focus` 2 px |
| `NumberField` | `unit` (kg, h, m³) · `step` · botones `−/+` de 48 dp | Para productores: pueden ajustar sin teclado |
| `PasswordField` | Toggle ver/ocultar | |
| `SelectField` | Móvil: abre `BottomSheet` con opciones grandes · Web: menú desplegable | Opciones con ícono opcional |
| `SegmentedControl` | 2–4 opciones | Método de riego, clase de abono |
| `ChoiceCard` | Tarjeta grande seleccionable (ícono 40 + título + descripción) | Selector de tipo de labor |
| `DateField` | Nativo: `@react-native-community/datetimepicker` · Web: `<input type="date">` | `max = hoy` (RN-04); atajos "Hoy", "Ayer" |
| `Switch` / `Checkbox` | 48 dp | Deshierbe, recordar sesión |
| `Chip` | `tone: brand\|accent\|earth\|info\|warning\|danger\|neutral` · `icon` | Tipo de actividad, estado sync |
| `Badge` | Numérico / punto | Pendientes de sincronizar en tab Perfil |
| `Card` | `padded` · `pressable` · `header` | |
| `ListRow` | `leading` · `title` · `subtitle` · `trailing` · `chevron` | Altura mín. 64 |
| `StatTile` | `label` · `value` · `unit` · `hint` | Área, árboles, densidad |
| `Timeline` / `TimelineItem` | Punto coloreado por tipo, fecha, título, meta, miniatura | Detalle de lote y portal público |
| `PhotoPicker` | "Tomar foto" / "Elegir de galería" · previsualización · quitar | Comprime a 1280 px |
| `PhotoViewer` | Lightbox con zoom | |
| `QRCodeView` | Tamaño, quiet zone, color `neutral.900` | Envuelve `react-native-qrcode-svg` |
| `QRLabelTemplate` | Componente imprimible (sección 8.13) | Capturado a PNG |
| `TopBar` | `title` · `back` · `actions` · `subtitle` | Fondo `bg`, sin sombra, borde inferior hairline al hacer scroll |
| `TabBar` | 4 tabs, ícono 28 + etiqueta 12, activo `primary` con píldora `primarySoft` | Altura 64 + safe area |
| `Sidebar` (web) | 264 px; logo, navegación, usuario abajo; colapsable a 72 px | Admin |
| `DataTable` | Columnas tipadas, orden, paginación, selección, fila clicable, `emptyState` | Admin web; en móvil renderiza `ListRow`s |
| `FilterBar` | Chips de filtro + rango de fechas + búsqueda | |
| `SearchBar` | Altura 48, ícono `Search`, limpiar | |
| `EmptyState` | Ilustración + título + texto + CTA | |
| `Skeleton` | Bloques animados (`opacity` 0.4↔0.8) | |
| `Toast` | `success\|error\|info`, 3.5 s, accesible | Zustand `uiStore` |
| `Banner` | `offline` (fondo `warning.100`) · `syncing` · `info` | Persistente arriba |
| `BottomSheet` / `Modal` / `ConfirmDialog` | Fondo `overlay`, radio `xl` superior | |
| `Stepper` (wizard) | Pasos 1–3 con etiqueta | Crear lote |
| `Avatar` | Iniciales sobre `brand.100` | |
| `Divider`, `Spacer`, `Container`, `Responsive` (`hide/show` por breakpoint) | | |

Breakpoints: `sm < 640` · `md 640–1023` · `lg ≥ 1024` · `xl ≥ 1440` (hook `useBreakpoint()` con `useWindowDimensions`).

---

## 7. Mapa de navegación

### 7.1 Diagrama

```
Arranque
 └─ index → ¿token válido? ─ no ─▶ (auth)/login
                          ─ sí ─▶ rol PRODUCTOR ─▶ (producer)/lotes
                                  rol ADMIN     ─▶ (admin)/dashboard  (web) | (admin)/dashboard en drawer (móvil)

(producer) Tabs ─┬─ Lotes ──▶ lotes/[id] ──▶ actividades/[id]
                 │            └─ lotes/nuevo (wizard) ──▶ parcelas/nueva
                 ├─ Registrar ──▶ registrar/[tipo] ──▶ éxito ──▶ lotes/[id]
                 ├─ QR ──▶ qr/[loteId] ──▶ descargar / compartir / abrir portal
                 └─ Perfil ──▶ sincronizacion · cerrar sesión
     Global: escanear (modal) ──▶ trace/[token]

(admin) Sidebar ─┬─ Dashboard
                 ├─ Productores ──▶ productores/[id] (parcelas y lotes) ──▶ productores/nuevo | editar
                 ├─ Parcelas
                 ├─ Lotes ──▶ lotes/[id] (timeline + QR)
                 ├─ Actividades (consolidado) ──▶ actividades/[id]
                 ├─ Reportes (Excel / SPSS)
                 └─ Modo campo (abre (producer) con lotes de todos)

trace/[token]  (público, sin sesión)  ·  +not-found
```

### 7.2 Correspondencia con la especificación técnica
- **AuthStack** = `(auth)/login`.
- **ProducerTabStack** = `(producer)/_layout` con Tabs: Mis Lotes · Registrar · Mis QR (+ Perfil, añadido para sincronización y cierre de sesión, RF-1.03).
- **PublicStack** = `trace/[token]`.
- **AdminStack** (añadido; requerido por RF-2.01 y M6) = `(admin)/*`.

### 7.3 Guards y deep links
- `AuthGate` en `app/_layout.tsx`: lee token de `secureStorage`, valida con `GET /auth/me` (si hay red; si no, confía en token no expirado y datos cacheados), y expone `status: 'loading' | 'anon' | 'authed'`.
- `(producer)/_layout`: redirige a login si `anon`; permite ADMIN (modo campo).
- `(admin)/_layout`: redirige a `(producer)` si rol ≠ ADMIN.
- `trace/[token]`: sin guard; funciona con o sin sesión. Deep link `agronex://trace/:token` y App Link `https://agronex.andarapa.pe/trace/:token`.
- Token expirado (401) → limpiar sesión, toast "Tu sesión venció. Ingresa de nuevo", ir a login conservando la ruta destino.

---

## 8. Maquetación completa (móvil y web)

Convenciones de los wireframes: `[ ]` botón · `( )` control de selección · `⌂ ✎ ▦ ☺` íconos de tabs · `≡` menú · `◔` avatar · `▮` chip · `┄` separador. Ancho móvil de referencia 360×800 dp; web 1440×900.

### 8.1 Splash y Login — `(auth)/login`

**Móvil**
```
┌────────────────────────────────────┐
│                                    │
│            ●  AGRONEX              │  ← isotipo 40 + wordmark h1
│   Trazabilidad del palto Hass      │  ← bodySm textSecondary
│           Andarapa · Apurímac      │
│                                    │
│  ┌──────────────────────────────┐  │
│  │ DNI                          │  │  ← TextField mono, teclado numérico, máx 8
│  │ 7 0 8 2 9 1 4 5              │  │
│  └──────────────────────────────┘  │
│  ┌──────────────────────────────┐  │
│  │ Contraseña              👁   │  │  ← PasswordField
│  └──────────────────────────────┘  │
│  ( ) Recordar mi sesión            │
│                                    │
│  [        Ingresar        ]        │  ← Button primary lg, fullWidth
│                                    │
│  ¿Olvidaste tu contraseña?         │  ← link ghost → BottomSheet:
│  "Comunícate con el asesor:        │     texto informativo (sin flujo de reset)
│   +51 9xx xxx xxx"                 │
│                                    │
│  ┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄  │
│  [ ▣ Escanear un código QR ]       │  ← Button secondary → /escanear (público)
│                                    │
│           v1.0 · Tesis 2026        │
└────────────────────────────────────┘
```
**Web**: layout dividido. Izquierda (40 %, fondo `brand.900`): wordmark en blanco, frase, patrón geométrico sutil de círculos-semilla en `brand.800`. Derecha: la misma tarjeta de login centrada, ancho 420.

Estados: error de credenciales → texto `danger` bajo el formulario "DNI o contraseña incorrectos"; sin red → Banner "Sin conexión. Necesitas señal para ingresar la primera vez"; loading → botón con spinner y deshabilitado; validación en vivo de RN-01.

### 8.2 Tab Mis Lotes — `(producer)/lotes/index`

**Móvil**
```
┌────────────────────────────────────┐
│ ▮ Sin señal · 3 registros por enviar│ ← Banner (solo si aplica)
│ Hola, Julián                 ◔  ▣  │ ← saludo h2 · avatar · IconButton escanear
│ Mis lotes                          │ ← h1
│                                    │
│ ┌────────────┐ ┌────────────┐      │ ← StatTiles horizontales (scroll)
│ │ 2 parcelas │ │ 3 lotes    │ …    │
│ └────────────┘ └────────────┘      │
│                                    │
│ Los Eucaliptos · Chuspi · 1.5 ha   │ ← encabezado de parcela h3 + meta
│ ┌──────────────────────────────┐   │
│ │ LOTE-AND-001            ▸   │   │ ← Card pressable
│ │ Palto Hass · Duke 7 · 2019   │   │
│ │ 400 árb · 1.0 ha · 400 árb/ha│   │
│ │ ▮ Riego hace 2 días  ▮ 18 reg│   │ ← chips: última labor + total
│ └──────────────────────────────┘   │
│ ┌──────────────────────────────┐   │
│ │ LOTE-AND-002            ▸   │   │
│ │ …                            │   │
│ └──────────────────────────────┘   │
│ El Mirador · Pucará · 0.8 ha       │
│ ┌──────────────────────────────┐   │
│ │ …                            │   │
│ └──────────────────────────────┘   │
│                                    │
│                      [ + Nuevo lote]│ ← FAB
├────────────────────────────────────┤
│  ⌂ Lotes   ✎ Registrar  ▦ QR  ☺ Perfil │ ← TabBar
└────────────────────────────────────┘
```
- Pull-to-refresh. Skeleton de 3 tarjetas en carga. Estado vacío: ilustración + "Aún no tienes lotes" + `[Crear mi primer lote]`.
- **Web (productor)**: contenedor 720 centrado; parcelas como secciones; en `lg` las tarjetas de lote van en grid de 2 columnas.

### 8.3 Detalle de lote — `(producer)/lotes/[id]`

```
┌────────────────────────────────────┐
│ ‹  LOTE-AND-001            ▦  ⋮    │ ← TopBar: volver · título mono · ver QR · menú (editar)
│ Los Eucaliptos · Sector Chuspi     │
│ Palto Hass · Duke 7 · Plantado 2019│
│                                    │
│ ┌───────┐ ┌───────┐ ┌───────┐      │ ← StatTiles
│ │1.0 ha │ │400 árb│ │400/ha │      │
│ │Área   │ │Árboles│ │Densid.│▮Media│
│ └───────┘ └───────┘ └───────┘      │
│                                    │
│ ┌──────────────────────────────┐   │ ← Card resumen cosecha (si existe)
│ │ Última cosecha  12 abr 2026  │   │
│ │ 1,240 kg · 62 jabas · Primera│   │  display para kg
│ └──────────────────────────────┘   │
│                                    │
│ Historial de labores      Filtrar ▾│ ← h3 + chips de tipo
│ ▮Todas ▮Riego ▮Abono ▮Poda ▮Plagas… │
│                                    │
│ Abril 2026                         │ ← agrupado por mes
│ ● Riego por goteo · 4 h            │ ← TimelineItem (punto color tipo)
│   14 abr · Julián Q. · ▮ Pendiente │    chip estado sync si aplica
│ ● Abono orgánico · Guano 2.5 kg/pl │
│   09 abr · Julián Q.        [foto] │ ← miniatura 56×56
│ Marzo 2026                         │
│ ● Control de plagas · Trips        │
│   28 mar · Ing. Rocío       [foto] │
│ …                                  │
│                                    │
│                  [ + Registrar labor ]│ ← FAB (preselecciona este lote)
└────────────────────────────────────┘
```
- Menú ⋮: "Editar datos del lote" (no permite tocar `qr_token`), "Ver ficha pública", "Eliminar lote" (solo si `total_actividades === 0`, RN-06).
- Web: dos columnas en `lg` — izquierda (380 px) ficha + QR pequeño con botón "Descargar etiqueta"; derecha, timeline.

### 8.4 Crear lote (wizard) — `(producer)/lotes/nuevo`

```
Paso 1 de 3 · Parcela           Paso 2 de 3 · Datos del lote        Paso 3 de 3 · Confirmar
┌──────────────────────┐        ┌──────────────────────┐             ┌──────────────────────┐
│ ‹ Nuevo lote         │        │ ‹ Nuevo lote         │             │ ‹ Nuevo lote         │
│ ●──○──○              │        │ ●──●──○              │             │ ●──●──●              │
│ ¿En qué parcela está?│        │ Año de plantación    │             │ Revisa los datos     │
│ ( ) Los Eucaliptos   │        │ [ 2019 ] ▾           │             │ Parcela  Los Eucalip.│
│     Chuspi · 1.5 ha  │        │ Área del lote (ha)   │             │ Año      2019        │
│ ( ) El Mirador       │        │ [ − ] 1.00 [ + ]     │             │ Área     1.00 ha     │
│     Pucará · 0.8 ha  │        │ Número de árboles    │             │ Árboles  400         │
│ ┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄  │        │ [ − ] 400  [ + ]     │             │ Densidad 400 árb/ha  │
│ [ + Crear nueva      │        │ Portainjerto         │             │ Portainj. Duke 7     │
│     parcela ]        │        │ (●) Duke 7 ( ) Topa T│             │ ┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄  │
│                      │        │ Densidad: 400 árb/ha │             │ El código de lote y  │
│                      │        │ ▮ Media              │  ← cálculo  │ su QR se generarán   │
│                      │        │                      │    en vivo  │ automáticamente.     │
│ [    Continuar     ] │        │ [    Continuar     ] │             │ [  Crear lote  ]     │
└──────────────────────┘        └──────────────────────┘             └──────────────────────┘
```
- Validaciones: área > 0, árboles > 0, año ≥ 2000 y ≤ año actual. Área del lote ≤ área de la parcela (advertencia no bloqueante).
- Éxito: pantalla `LotCreatedScreen` con el QR grande, código `LOTE-AND-00X` y botones `[Descargar etiqueta]` `[Ir al lote]`.
- Offline: crear lote **requiere conexión** (el código y el token los emite el servidor). Si no hay red, mostrar EmptyState "Necesitas señal para crear un lote nuevo" con botón "Reintentar".

### 8.5 Nueva parcela — `(producer)/parcelas/nueva` (también usada por Admin con selector de productor)

Formulario de una pantalla: Nombre del predio · Sector (SelectField con sectores de Andarapa + "Otro") · Área total (NumberField ha, 2 decimales) · Cultivo (solo lectura "Palto Hass — *Persea americana*") · `[Guardar parcela]`. Admin: campo adicional "Productor" (SelectField con búsqueda por nombre/DNI).

### 8.6 Tab Registrar — `(producer)/registrar/index`

```
┌────────────────────────────────────┐
│ Registrar labor                    │ ← h1
│ ¿Qué trabajo hiciste hoy?          │ ← bodyLg textSecondary
│                                    │
│ ┌──────────────┐ ┌──────────────┐  │ ← ChoiceCards 2 columnas, alto 112
│ │  💧 Riego     │ │  🌱 Abono    │  │    (íconos lucide, no emojis)
│ │  Agua al lote │ │  Fertilizar  │  │
│ └──────────────┘ └──────────────┘  │
│ ┌──────────────┐ ┌──────────────┐  │
│ │  ✂ Poda       │ │  🐛 Plagas   │  │
│ └──────────────┘ └──────────────┘  │
│ ┌──────────────┐ ┌──────────────┐  │
│ │  ⚗ Insumos    │ │  📦 Cosecha  │  │  ← Cosecha con borde accent
│ └──────────────┘ └──────────────┘  │
│ ┌────────────────────────────────┐ │
│ │  🚚 Postcosecha y embalaje     │ │
│ └────────────────────────────────┘ │
│                                    │
│ Últimos registros                  │ ← h3
│ ● Riego · LOTE-AND-001 · hoy  ▮Pend│
│ ● Abono · LOTE-AND-002 · ayer      │
└────────────────────────────────────┘
```

### 8.7 Formulario dinámico de labor — `(producer)/registrar/[tipo]`

Ejemplo RIEGO (la estructura es común; el bloque "Datos específicos" cambia por tipo según 4.3):
```
┌────────────────────────────────────┐
│ ‹  Registrar riego                 │
│                                    │
│ Lote                               │
│ [ LOTE-AND-001 · Los Eucaliptos ▾] │ ← SelectField (preseleccionado si viene de un lote;
│                                    │    si solo hay 1 lote, fijo)
│ Fecha                              │
│ [ Hoy, 15 abr 2026 ▾ ] Hoy | Ayer  │ ← DateField + atajos, max hoy
│                                    │
│ Datos del riego                    │ ← h3
│ Método                             │
│ [ Goteo | Gravedad | Aspersión ]   │ ← SegmentedControl
│ Horas de riego                     │
│ [ − ]   4   [ + ]  h               │ ← NumberField step 0.5
│ Volumen estimado (opcional)        │
│ [        ] m³                      │
│                                    │
│ Responsable                        │
│ [ Julián Quispe            ]       │ ← prellenado con el usuario, editable
│ Observaciones (opcional)           │
│ [                            ]     │ ← multilínea, 3 líneas
│                                    │
│ Foto de evidencia (opcional)       │
│ [ 📷 Tomar foto ] [ 🖼 Galería ]    │ ← PhotoPicker; preview 96×96 con ✕
│                                    │
│ [        Guardar registro       ]  │ ← sticky bottom, primary lg
└────────────────────────────────────┘
```
Bloques específicos:
- **FERTILIZACION**: Clase `[Orgánico | Químico]` · Producto (TextField, sugerencias: Guano de isla, Compost, Urea, Fosfato diamónico, Sulfato de potasio) · Dosis (TextField con sufijo seleccionable kg/planta · g/planta · L/ha) · Método `[Suelo | Fertirriego]`. Foto **recomendada** (texto "Sube la foto del saco o comprobante").
- **PODA**: Tipo `[Formación | Producción | Sanitaria]` · Switch "Incluyó deshierbe".
- **CONTROL_PLAGAS**: Plaga (SelectField: Arañita roja, Trips, Phytophthora, Queresa, Otra → campo libre) · Producto · Ingrediente activo (opcional) · Dosis · Periodo de carencia (NumberField días, opcional, con hint "Días que deben pasar antes de cosechar").
- **APLICACION_INSUMOS**: Producto · Dosis · Objetivo (opcional).
- **COSECHA**: N° de jabas (NumberField entero, +/−) · Peso neto (NumberField kg, 1 decimal) · Calidad `[Primera | Segunda | Descarte | Mixta]` · texto de ayuda "Promedio: X kg por jaba" calculado en vivo.
- **POSTCOSECHA**: Selección (texto) · Peso final kg · Comprador/destino · Lote de acopio.

Comportamiento al guardar:
1. Validar con zod (RN-04, 05, 07).
2. Si hay red → `POST /labors` (con foto subida antes vía `POST /uploads` `[PROPUESTO]`); toast "Registro guardado" + háptico.
3. Si no hay red → escribir en SQLite `sync_status='PENDING'`, foto en `documentDirectory/evidence/`, toast "Guardado en tu celular. Se enviará cuando haya señal".
4. Navegar a `lotes/[id]` con el nuevo ítem arriba (chip `Pendiente` si aplica).
5. Modal de éxito con `[Registrar otra labor]` `[Ver lote]`.

### 8.8 Detalle de actividad — `actividades/[id]`
TopBar con chip de tipo; fecha grande (h2); tarjeta con pares etiqueta/valor (Lote, Responsable, Producto, Dosis, detalle técnico legible); foto a ancho completo (tap → PhotoViewer); observaciones; pie con "Registrado el … · Sincronizado/Pendiente". Sin edición ni borrado en v1 (integridad del cuaderno de campo); Admin ve botón "Reportar inconsistencia" que solo copia el ID al portapapeles (placeholder).

### 8.9 Tab Mis Códigos QR — `(producer)/qr/index`

```
┌────────────────────────────────────┐
│ Mis códigos QR                     │
│ Un código por lote. Nunca cambia.  │ ← bodySm (refuerza RN-03)
│                                    │
│ ┌──────────────────────────────┐   │
│ │ ▣ [QR 96]  LOTE-AND-001      │   │ ← ListRow con QR pequeño
│ │            Los Eucaliptos    │   │
│ │            [Ver] [Descargar] │   │
│ └──────────────────────────────┘   │
│ ┌──────────────────────────────┐   │
│ │ ▣ [QR 96]  LOTE-AND-002 …    │   │
│ └──────────────────────────────┘   │
│                                    │
│ [ ▣ Escanear un código ]           │ ← secondary
└────────────────────────────────────┘
```

### 8.10 Vista QR de lote — `(producer)/qr/[loteId]`

```
┌────────────────────────────────────┐
│ ‹  Código QR del lote              │
│                                    │
│   ┌──────────────────────────┐     │ ← Card blanca, QR 240×240, quiet zone 16
│   │                          │     │
│   │        ▣▣▣  QR  ▣▣▣       │     │
│   │                          │     │
│   │   LOTE-AND-001           │     │ ← mono h3
│   │   Julián Quispe          │     │
│   │   Palto Hass · Andarapa  │     │
│   └──────────────────────────┘     │
│                                    │
│ agronex.andarapa.pe/trace/c8a2e1d0…│ ← URL truncada + ícono copiar
│                                    │
│ [   ⤓ Descargar etiqueta (PNG)  ]  │ ← primary lg
│ [   ⇪ Compartir ]  [ ⧉ Ver ficha ] │ ← secondary md ×2
│                                    │
│ ℹ Pega la etiqueta en cada jaba.   │ ← Banner info
│   El QR mostrará siempre la        │
│   información actualizada.         │
└────────────────────────────────────┘
```
- "Descargar etiqueta" captura `QRLabelTemplate` (8.13) → PNG; nativo: guarda en galería (álbum "AGRONEX") + hoja de compartir; web: descarga `LOTE-AND-001-etiqueta.png`.
- Tamaño de etiqueta seleccionable en BottomSheet: **Jaba (10×13 cm)** / **Caja de exportación (7×9 cm)** / **Hoja A4 (6 etiquetas)** `[PROPUESTO v1.1]` — v1 implementa Jaba.

### 8.11 Escáner — `escanear` (modal fullscreen)
Cámara a pantalla completa, máscara oscura `overlay` con ventana 260×260 de esquinas redondeadas y guías `accent`; texto superior "Apunta al código QR de la jaba"; botones: cerrar (48 dp), linterna, "Ingresar código manualmente" (abre TextField para pegar URL/token). Al detectar: háptico, vibración de la ventana en `accent`, extraer token (`/trace/([0-9a-f-]{36})`), navegar a `trace/[token]`. Si no es un QR de AGRONEX → toast "Este código no es de AGRONEX". Web: `Scanner.web.tsx` con `html5-qrcode` y selector de cámara. Permiso denegado → EmptyState con "Abrir ajustes".

### 8.12 Tab Perfil — `(producer)/perfil/index`
Avatar + nombre + DNI (mono) + sector; Card "Sincronización" con estado (`● Todo sincronizado` / `● 3 registros pendientes` `[Sincronizar ahora]`) → `sincronizacion`; ListRows: "Ver ficha pública de mis lotes", "Ayuda y contacto del asesor", "Acerca de AGRONEX (v1.0)"; botón `[Cerrar sesión]` (danger ghost) con ConfirmDialog que advierte si hay pendientes ("Tienes 3 registros sin enviar. Si cierras sesión no se perderán, pero se enviarán cuando vuelvas a ingresar").

### 8.13 Centro de sincronización — `sincronizacion`
Lista de operaciones pendientes/fallidas (tipo, lote, fecha, tamaño de foto, estado `PENDING | SYNCING | SYNCED | FAILED` con motivo), botón `[Reintentar todo]`, último sync exitoso, toggle "Sincronizar fotos solo con Wi-Fi" (default off). Los ítems `SYNCED` se muestran 24 h y luego se purgan.

### 8.14 Plantilla de etiqueta QR — `QRLabelTemplate` (offscreen, 1200×1600 px @300 dpi ≈ 10×13.5 cm)
```
┌──────────────────────────────────────┐
│ ● AGRONEX            TRAZABILIDAD QR │ ← franja superior brand.900, texto blanco caption
├──────────────────────────────────────┤
│                                      │
│              ▣▣▣▣▣▣▣▣                │ ← QR 800×800, error correction 'M'
│              ▣▣ QR ▣▣                │    color neutral.900 sobre blanco
│              ▣▣▣▣▣▣▣▣                │
│                                      │
│  LOTE-AND-001                        │ ← mono 64 px
│  Julián Quispe Huamán                │ ← Manrope 44 px
│  Palto Hass · Duke 7 · Plantado 2019 │ ← Inter 32 px
│  Los Eucaliptos · Sector Chuspi      │
│  Andarapa · Andahuaylas · Apurímac   │
├──────────────────────────────────────┤
│ Escanea para ver el historial vivo   │ ← franja inferior accent.100
│ agronex.andarapa.pe/trace/…          │    caption mono
└──────────────────────────────────────┘
```
Sin fotografías, sin degradados, márgenes 60 px, líneas de corte opcionales en bordes.

### 8.15 Portal Público de Trazabilidad — `trace/[token]` (web móvil primero; también renderiza en la app)

```
┌────────────────────────────────────┐
│ ● AGRONEX        Trazabilidad viva │ ← barra simple 56 px, sin login
├────────────────────────────────────┤
│ ▮ ORIGEN VERIFICADO                │ ← chip accent
│ Palto Hass                          │ ← h1
│ LOTE-AND-001                        │ ← mono h3
│ Andarapa · Andahuaylas · Apurímac   │
│ ┌──────────────────────────────┐    │
│ │ ◔ Julián Quispe H.           │    │ ← Card productor
│ │   Productor · Sector Chuspi  │    │
│ │   Parcela Los Eucaliptos     │    │
│ └──────────────────────────────┘    │
│ ┌────────┐┌────────┐┌────────┐     │ ← StatTiles 3 cols
│ │ 1.0 ha ││ 400 árb││ 2019   │     │
│ │ Área   ││ Árboles││Plantado│     │
│ └────────┘└────────┘└────────┘     │
│                                    │
│ ┌──────────────────────────────┐   │ ← Card BPA (borde brand, ícono ShieldCheck)
│ │ ✓ Buenas Prácticas Agrícolas  │   │
│ │ 18 labores registradas con    │   │
│ │ evidencia · Actualizado hoy   │   │
│ │ ✓ Riego  ✓ Nutrición  ✓ Sanidad│   │ ← criterios_cumplidos como chips
│ │ ✓ Poda   ✓ Cosecha            │   │
│ └──────────────────────────────┘   │
│                                    │
│ Última cosecha                     │ ← h3
│ 1,240 kg · 62 jabas · 12 abr 2026  │ ← display kg
│                                    │
│ Historial del lote     ▮Todas ▮… │ ← filtros por tipo (chips scroll)
│ Abril 2026                         │
│ ● Riego por goteo · 4 h · 14 abr   │
│ ● Fertilización orgánica · Guano   │
│   2.5 kg/planta · 09 abr   [foto]  │ ← miniatura → lightbox
│ Marzo 2026                         │
│ ● Control de trips · Producto X    │
│   Carencia 7 días · 28 mar  [foto] │
│ …                    [Ver más]     │ ← paginación local de 20
│                                    │
├────────────────────────────────────┤
│ Verificado por AGRONEX · Tesis 2026│
│ Datos vivos desde la base de datos │
│ Actualizado: 15 abr 2026 10:32     │
│ ¿Eres productor? Ingresar          │
└────────────────────────────────────┘
```
- Escritorio (`lg`): contenedor 960; columna izquierda 340 (ficha, productor, stats, BPA fijos con `position: sticky`), derecha timeline.
- Estados: token inválido → página 404 propia "Este código no corresponde a ningún lote de AGRONEX"; sin red → mensaje + reintentar; loading → skeleton.
- Privacidad: se muestra nombre y primera inicial del apellido paterno; teléfono y DNI **nunca** se muestran.
- SEO/metadata: `<title>LOTE-AND-001 · Palto Hass de Andarapa · AGRONEX</title>`, Open Graph con isotipo; `robots: index` solo en esta ruta.
- Performance: imágenes con `expo-image`, `contentFit cover`, thumbnails 320 px, lazy; JSON de la ficha cacheado 60 s.

### 8.16 Panel Admin — layout — `(admin)/_layout`

**Web ≥ lg**
```
┌──────────┬───────────────────────────────────────────────────────────────┐
│ ● AGRONEX│  Título de sección                        🔍 Buscar   ◔ Rocío │ ← TopBar 64
│          ├───────────────────────────────────────────────────────────────┤
│ ▦ Dashbrd│                                                               │
│ ☺ Product│                                                               │
│ ▢ Parcela│                 Contenido (maxWidth 1200, padding 32)         │
│ ▣ Lotes  │                                                               │
│ ✎ Activid│                                                               │
│ ⤓ Reporte│                                                               │
│ ┄┄┄┄┄┄┄┄ │                                                               │
│ ▶ Modo   │                                                               │
│   campo  │                                                               │
│          │                                                               │
│ ◔ Rocío  │                                                               │
│  Admin   │                                                               │
│  Salir   │                                                               │
└──────────┴───────────────────────────────────────────────────────────────┘
```
Sidebar 264 px fondo `surface`, borde derecho hairline, ítem activo con píldora `primarySoft` y texto `primary`. En `< lg`: TopBar con `≡` que abre Drawer con los mismos ítems.

### 8.17 Admin · Dashboard — `(admin)/dashboard`
- Fila de 4 StatTiles: Productores (14), Parcelas, Lotes, Labores registradas (con delta "+12 esta semana").
- Card "Adopción por productor" (Instrumento 1, ítem 7–8): tabla compacta productor → registros en periodo → chip Alta/Media/Baja (> 5 / 3–5 / < 3 en los últimos 30 días).
- Card "Labores por tipo" (barras horizontales simples, componente propio con `View`s; sin librería de charts).
- Card "Actividad reciente" (últimas 10 labores, con foto en miniatura) → detalle.
- Card "Lotes sin registros en 30 días" (alerta suave).

### 8.18 Admin · Productores — `(admin)/productores/*`
- **Lista**: SearchBar (nombre/DNI), FilterBar por sector, DataTable: Productor (avatar + nombre) · DNI (mono) · Sector · Teléfono · Parcelas · Lotes · Última labor · Acciones (Ver, Editar). Botón `[+ Nuevo productor]` arriba a la derecha. Móvil: ListRows.
- **Nuevo/Editar** (`productores/nuevo`, `productores/[id]?edit`): formulario en Card de 640: DNI (RN-01, único; error si el servidor devuelve 409 "Este DNI ya está registrado") · Nombres · Apellidos · Teléfono (9 dígitos, opcional) · Sector (SelectField) · Contraseña inicial (solo al crear; botón "Generar" → 8 caracteres; mostrar una vez con "Copiar") · Rol (solo lectura "Productor"). `[Guardar]`.
- **Detalle** (`productores/[id]`): cabecera con datos; tabs internos "Parcelas y lotes" (árbol Parcela → Lotes con acciones Ver QR / Ver lote / `+ Lote`) · "Labores" (tabla filtrada) · botón `[+ Nueva parcela]`.

### 8.19 Admin · Parcelas y Lotes — `(admin)/parcelas`, `(admin)/lotes`
- Parcelas: DataTable Productor · Parcela · Sector · Área · Lotes · Creada. Filtro por productor/sector.
- Lotes: DataTable Código (mono) · Productor · Parcela · Año · Área · Árboles · Densidad (chip) · Labores · QR (ícono → vista QR modal con descargar). Detalle `(admin)/lotes/[id]` reutiliza la pantalla de detalle de lote (8.3) en layout de 2 columnas.

### 8.20 Admin · Consolidado de actividades — `(admin)/actividades` (RF-6.01)
```
┌──────────────────────────────────────────────────────────────────────┐
│ Consolidado de labores                              [⤓ Exportar vista]│
│ ┌────────────┐┌───────────┐┌────────────┐┌──────────────┐┌─────────┐│ ← FilterBar
│ │Productor ▾ ││ Lote ▾    ││ Tipo ▾     ││ 01/03–15/04 ▾││ Con foto││
│ └────────────┘└───────────┘└────────────┘└──────────────┘└─────────┘│
│ 184 registros                                                        │
│ ┌──────────────────────────────────────────────────────────────────┐ │
│ │ Fecha ▾ │ Tipo      │ Lote        │ Productor   │ Producto/Dosis │📷│ │
│ │ 15 abr  │ ▮Riego    │ LOTE-AND-001│ J. Quispe   │ Goteo · 4 h    │  │ │
│ │ 14 abr  │ ▮Abono    │ LOTE-AND-003│ M. Huamán   │ Guano 2.5 kg/pl│ ▣│ │
│ │ …                                                                 │ │
│ └──────────────────────────────────────────────────────────────────┘ │
│                                        ‹ 1 2 3 … 10 ›  25 por página │
└──────────────────────────────────────────────────────────────────────┘
```
Fila → `actividades/[id]`. "Exportar vista" descarga CSV de la vista filtrada generado **en cliente** (papaparse ligero o función propia).

### 8.21 Admin · Reportes — `(admin)/reportes` (RF-6.02, RF-6.03)
Dos Cards grandes lado a lado:
- **Base de datos completa (Excel .xlsx)**: descripción "Hojas: Productores, Parcelas, Lotes, Actividades"; `[⤓ Descargar Excel]` → `GET /reports/export/excel` (blob → descarga; en móvil `FileSystem.downloadAsync` + `Sharing`).
- **Matriz codificada para SPSS (CSV)**: descripción de variables (pretest/postest), `[⤓ Descargar CSV SPSS]` → `GET /reports/export/spss`. Debajo, tabla "Diccionario de codificación" (solo lectura, texto estático provisto por el backend o `i18n`).
- Card secundaria "Instrumentos de la investigación": enlaces informativos a la Lista de Verificación e Instrumento 2 (contenido estático de la tesis).
- Historial de descargas (local, últimos 10, en `kv` storage).

### 8.22 Estados globales y pantallas de sistema
- `+not-found`: ilustración, "Página no encontrada", botón "Ir al inicio".
- Error de red genérico: `ErrorState` con "Reintentar".
- Actualización disponible (expo-updates): Banner discreto "Hay una nueva versión. Toca para actualizar".
- Sin permisos de cámara/galería: EmptyState con instrucción.

---

## 9. Flujos de usuario críticos (happy path + errores)

### F1 — Registrar riego sin señal (≤ 6 toques)
1. Tab Registrar → 2. ChoiceCard "Riego" → 3. (lote fijo o selector) → 4. Método (tap) → 5. Horas (+ +) → 6. Guardar.  
Sin red: SQLite `PENDING`, toast, ítem visible con chip. Al recuperar red: `syncStore.flush()` → `POST /labors/sync` → chips desaparecen, toast "3 registros enviados".

### F2 — Crear lote e imprimir etiqueta
Lotes → FAB → wizard 3 pasos → `LotCreatedScreen` → Descargar etiqueta → hoja de compartir/impresión.

### F3 — Comprador escanea
Cámara nativa del celular → App Link/URL → `trace/[token]` en < 2 s → ve productor, BPA, última cosecha, timeline con fotos.

### F4 — Admin registra productor y su primer lote
Productores → Nuevo → guardar (copia contraseña) → Detalle productor → + Nueva parcela → + Lote → QR generado.

### F5 — Admin exporta para SPSS
Reportes → Descargar CSV SPSS → archivo `agronex_spss_2026-04-15.csv`.

Errores transversales: 401 (sesión) · 403 ("No tienes permiso para ver este lote") · 409 (DNI duplicado) · 422 (mapear errores de campo del backend `{ errors: { campo: 'mensaje' } }` a los TextFields) · 5xx ("El servidor no responde. Tus datos están seguros en el celular").

---

## 10. Datos, API y offline-first

### 10.1 Cliente HTTP
```ts
// src/services/api/client.ts (resumen de contrato)
apiClient.get<T>(path, { params, auth?: boolean })
apiClient.post<T>(path, body, { auth?, formData? })
// - añade Authorization: Bearer <jwt> desde authStore
// - timeout 15 s; reintento 1 vez en GET si error de red
// - normaliza a ApiError { status, code, message, fieldErrors? }
// - en 401 → authStore.logout('expired')
```

### 10.2 Capa de datos por feature (TanStack Query)
| Hook | Query key | Fuente |
|---|---|---|
| `useMe()` | `['me']` | `GET /auth/me` |
| `useParcelsWithLots()` | `['parcels']` | `GET /parcels` (incluye lotes) → espejo en SQLite para offline |
| `useLot(id)` | `['lot', id]` | derivado de `parcels` + `GET /lots/:id/labors` |
| `useLotActivities(id)` | `['lot', id, 'labors']` | `GET /lots/:id/labors` + merge con pendientes locales |
| `useCreateActivity()` | mutation | online: `POST /labors` · offline: repo SQLite + cola |
| `useProducers()` | `['producers', filters]` | `GET /producers` |
| `usePublicTrace(token)` | `['trace', token]` | `GET /public/trace/:token` (staleTime 60 s) |
| `useConsolidated(filters)` | `['activities', filters]` | `GET /activities` `[PROPUESTO]` |
| `useExport(kind)` | mutation | `GET /reports/export/{excel|spss}` (blob) |

`persistQueryClient` con storage `expo-sqlite`/`localStorage` para que Lotes y Detalle carguen offline con datos de la última sesión.

### 10.3 Contrato de API consumido

| Método | Ruta | Auth | Uso en frontend | Estado |
|---|---|---|---|---|
| POST | `/auth/login` | — | Login `{dni,password}` → `{token,user}` | Spec |
| GET | `/auth/me` | JWT | Validar sesión | Spec |
| GET | `/producers` | Admin | Lista (query `q`, `sector`, `page`) | Spec |
| POST | `/producers` | Admin | Crear `{dni,nombres,apellidos,telefono,sector,password}` | Spec (password añadido) |
| GET | `/producers/:id` | Admin | Detalle con parcelas y lotes | `[PROPUESTO]` |
| PUT | `/producers/:id` | Admin | Editar | `[PROPUESTO]` |
| GET | `/parcels` | JWT | Parcelas + lotes del usuario (admin: `?productor_id=`) | Spec |
| POST | `/parcels` | JWT | Crear parcela (y opcionalmente lote) | Spec |
| POST | `/lots` | JWT | Crear lote en parcela existente `{parcela_id, ano_plantacion, area_lote_ha, num_arboles, patron_portainjerto}` → devuelve `codigo_lote`, `qr_token` | `[PROPUESTO]` (la spec lo hace vía `/parcels`) |
| PUT | `/lots/:id` | JWT | Editar datos no críticos (nunca `qr_token`) | `[PROPUESTO]` |
| DELETE | `/lots/:id`, `/parcels/:id` | JWT | Solo si sin actividades (RN-06) | `[PROPUESTO]` |
| POST | `/labors` | JWT | Crear actividad | Spec |
| POST | `/labors/sync` | JWT | Lote de actividades pendientes `[{client_id, ...}]` → `[{client_id, id, status}]` | Spec (M20) |
| GET | `/lots/:id/labors` | JWT | Historial | Spec |
| GET | `/activities` | Admin | Consolidado con filtros y paginación | `[PROPUESTO]` |
| GET | `/activities/:id` | JWT | Detalle | `[PROPUESTO]` |
| POST | `/uploads` | JWT | multipart `file` → `{url}` | `[PROPUESTO]`; fallback: `foto_base64` en `/labors` |
| GET | `/public/trace/:token` | — | Portal público | Spec |
| GET | `/reports/export/excel` | Admin | Blob xlsx | Spec |
| GET | `/reports/export/spss` | Admin | Blob csv | Spec |
| GET | `/reports/summary` | Admin | Métricas del dashboard | `[PROPUESTO]`; fallback: calcular en cliente |

### 10.4 Esquema SQLite local
```sql
CREATE TABLE IF NOT EXISTS lots_cache (id INTEGER PRIMARY KEY, json TEXT NOT NULL, updated_at TEXT NOT NULL);
CREATE TABLE IF NOT EXISTS activities_cache (id INTEGER PRIMARY KEY, lote_id INTEGER NOT NULL, json TEXT NOT NULL, updated_at TEXT NOT NULL);
CREATE TABLE IF NOT EXISTS pending_activities (
  client_id TEXT PRIMARY KEY,              -- uuid v4 generado en cliente (idempotencia)
  lote_id INTEGER NOT NULL,
  payload_json TEXT NOT NULL,              -- body de POST /labors sin foto
  photo_local_uri TEXT,
  sync_status TEXT NOT NULL DEFAULT 'PENDING', -- PENDING | SYNCING | SYNCED | FAILED
  attempts INTEGER NOT NULL DEFAULT 0,
  last_error TEXT,
  created_at TEXT NOT NULL,
  synced_at TEXT
);
CREATE INDEX IF NOT EXISTS idx_pending_status ON pending_activities(sync_status);
```

### 10.5 Algoritmo de sincronización (`src/features/sync/syncEngine.ts`)
1. Disparadores: NetInfo `isInternetReachable` pasa a `true`; app vuelve a foreground; botón "Sincronizar ahora"; cada 5 min si hay pendientes.
2. Mutex: una sola ejecución concurrente (`syncStore.isSyncing`).
3. Tomar hasta 20 `PENDING|FAILED (attempts<5)` ordenadas por `created_at`; marcar `SYNCING`.
4. Para cada ítem con foto: `POST /uploads` → `evidencia_url` (si "solo Wi-Fi" activo y no hay Wi-Fi, enviar sin foto y dejar un ítem derivado `PENDING_PHOTO` `[v1.1]`; en v1: esperar Wi-Fi para el ítem completo).
5. `POST /labors/sync` con el lote; por cada respuesta `ok` → `SYNCED` (guardar `server_id`), invalidar `['lot', lote_id, 'labors']` y `['parcels']`; `error` → `FAILED` con `last_error`, `attempts+1`, backoff exponencial (30 s · 2^n, máx 30 min).
6. Idempotencia: el servidor debe respetar `client_id`; el cliente nunca reenvía un ítem `SYNCED`.
7. Conflictos: modelo append-only (no hay edición), por lo que no existen conflictos de escritura; para lecturas, **servidor gana**.
8. UI: `Badge` en tab Perfil con conteo; `Banner` "Enviando 3 registros…" durante `SYNCING`; toast al finalizar.
9. Web: la cola usa `localStorage`/IndexedDB vía `kv` (mismo motor, adaptador distinto); las fotos en web se envían inmediatamente o se guardan como base64 en IndexedDB (límite 5 pendientes).

### 10.6 Mocks y datos semilla
- `src/mocks/seed.ts`: 1 admin (`DNI 00000001 / admin123`), 14 productores (`DNI 7082914x / 12345678`), 18 parcelas, 24 lotes (`LOTE-AND-001…024`, tokens UUID fijos), ~200 actividades de los 7 tipos distribuidas en 6 meses con URLs de fotos locales (`assets/images/mock/*.jpg`, generar 6 imágenes placeholder neutras).
- `handlers.ts` implementa todos los endpoints de 10.3 con latencia 300–800 ms, errores simulados (`?fail=1`), y paginación.
- Activación por `EXPO_PUBLIC_USE_MOCKS=true` en `app/_layout.tsx` antes de montar la app.

---

## 11. Textos de la interfaz (i18n/es.ts — extracto obligatorio)

```ts
export const es = {
  common: { save:'Guardar', cancel:'Cancelar', continue:'Continuar', back:'Volver', retry:'Reintentar', today:'Hoy', yesterday:'Ayer', optional:'(opcional)', loading:'Cargando…' },
  auth: { title:'Ingresar', dni:'DNI', password:'Contraseña', remember:'Recordar mi sesión', submit:'Ingresar', invalid:'DNI o contraseña incorrectos', dniFormat:'El DNI debe tener 8 números', forgot:'¿Olvidaste tu contraseña?', forgotHelp:'Comunícate con el asesor del proyecto para restablecerla.' },
  lots: { title:'Mis lotes', empty:'Aún no tienes lotes', emptyCta:'Crear mi primer lote', density:'Densidad', trees:'Árboles', area:'Área', lastActivity:'Última labor', newLot:'Nuevo lote', needOnline:'Necesitas señal para crear un lote nuevo' },
  activities: { title:'Registrar labor', question:'¿Qué trabajo hiciste hoy?', saved:'Registro guardado', savedOffline:'Guardado en tu celular. Se enviará cuando haya señal', dateFuture:'La fecha no puede ser futura', productRequired:'Indica el producto aplicado', doseRequired:'Indica la dosis aplicada', positive:'Debe ser mayor a cero', photo:'Foto de evidencia', takePhoto:'Tomar foto', gallery:'Galería' },
  qr: { title:'Mis códigos QR', subtitle:'Un código por lote. Nunca cambia.', download:'Descargar etiqueta (PNG)', share:'Compartir', openTrace:'Ver ficha pública', hint:'Pega la etiqueta en cada jaba. El QR mostrará siempre la información actualizada.', saved:'Etiqueta guardada en tu galería' },
  scan: { hint:'Apunta al código QR de la jaba', notAgronex:'Este código no es de AGRONEX', manual:'Ingresar código manualmente' },
  sync: { pending:(n:number)=>`${n} registros por enviar`, syncing:'Enviando registros…', done:(n:number)=>`${n} registros enviados`, offline:'Sin conexión', allSynced:'Todo sincronizado', syncNow:'Sincronizar ahora' },
  trace: { verified:'ORIGEN VERIFICADO', bpa:'Buenas Prácticas Agrícolas', lastHarvest:'Última cosecha', history:'Historial del lote', notFound:'Este código no corresponde a ningún lote de AGRONEX', footer:'Verificado por AGRONEX · Datos vivos desde la base de datos' },
  admin: { dashboard:'Panel', producers:'Productores', parcels:'Parcelas', lots:'Lotes', activities:'Labores', reports:'Reportes', fieldMode:'Modo campo', newProducer:'Nuevo productor', dniTaken:'Este DNI ya está registrado', exportExcel:'Descargar Excel', exportSpss:'Descargar CSV SPSS' },
} as const;
```

---

## 12. Plan de desarrollo fase por fase

Duración total estimada: **8 semanas** (alineado con los 4 sprints de la especificación; cada sprint = 2 fases). Cada fase incluye tareas, artefactos y *Definition of Done (DoD)*.

### Fase 0 — Fundaciones (Semana 1, días 1–3)
**Objetivo**: proyecto ejecutable en Android y Web con Design System base.
- Crear proyecto Expo SDK 51 (`npx create-expo-app -t tabs@51` → limpiar) con TypeScript strict, Expo Router, alias `@/`.
- Configurar ESLint, Prettier, Husky, Jest, `@testing-library/react-native`, MSW.
- Implementar tokens (colores, tipografía con carga de Manrope/Inter/JetBrains Mono, espaciado, radios, sombras, motion) y `ThemeProvider`, `useTheme`, `useBreakpoint`.
- Primitivas: `Box`, `Stack (row/col, gap)`, `Text (variant)`, `Pressable (con estados)`.
- Componentes base: `Button`, `IconButton`, `TextField`, `PasswordField`, `Chip`, `Card`, `ListRow`, `Screen`, `TopBar`, `Toast`, `Skeleton`, `EmptyState`, `Divider`.
- Pantalla `design-system/playground` (solo dev) que muestre todos los componentes y variantes.
- `.env`, `config/env.ts`, `app.json` (scheme, package, permisos, splash/ícono con isotipo), `eas.json` (perfiles `preview` APK y `production`).
- `mocks/seed.ts` + `handlers.ts` completos.
**DoD**: `npx expo start --web` y `--android` muestran el playground; lint y tests pasan; README con comandos.

### Fase 1 — Autenticación, shell de navegación y guards (Semana 1, días 4–5 y Semana 2)
**Objetivo**: M1 completo en cliente y esqueleto de todas las rutas.
- `authStore` (token, user, status), `secureStorage` (native/web), `apiClient` con interceptores y `ApiError`.
- Pantalla Login (8.1) móvil y web, con validación RN-01, estados de error/carga/offline.
- `AuthGate`, `index.tsx` redirección por rol, layouts `(producer)` (TabBar 4 tabs) y `(admin)` (Sidebar/Drawer), rutas vacías con placeholders `EmptyState "Próximamente"`.
- `networkStore` con NetInfo y `Banner` offline global.
- Perfil (8.12) con cerrar sesión (RF-1.03).
- Tests: validación DNI, flujo login (mock), guard de rutas.
**DoD**: login/logout funcionan en Android y Web con mocks; token persiste al reiniciar; ADMIN entra al panel y PRODUCTOR a tabs; sesión expirada redirige.

### Fase 2 — Padrón, parcelas y lotes (Semana 3)
**Objetivo**: M2 (RF-2.01 a 2.04) para productor y admin.
- Hooks `useParcelsWithLots`, `useCreateParcel`, `useCreateLot`, `useProducers`, `useProducer`, `useCreateProducer`, `useUpdateProducer`.
- Pantallas: Mis Lotes (8.2) con StatTiles, agrupación por parcela, skeleton, vacío, pull-to-refresh; Detalle de lote (8.3) **sin timeline aún** (placeholder); Wizard Nuevo lote (8.4) + `LotCreatedScreen`; Nueva parcela (8.5).
- Admin: Productores lista/nuevo/editar/detalle (8.18), Parcelas y Lotes (8.19) con `DataTable`, `FilterBar`, `SearchBar`, paginación.
- Util `density()` + chip de nivel; validaciones zod (área, árboles, año, DNI único vía 409).
- Componentes nuevos: `NumberField`, `SelectField` (+`BottomSheet`), `SegmentedControl`, `Stepper`, `StatTile`, `DataTable`, `Sidebar`, `Avatar`, `ConfirmDialog`.
**DoD**: un admin crea productor → parcela → lote; el productor ve sus lotes con densidad calculada; tablas admin filtran y paginan; responsive verificado en 360/768/1440.

### Fase 3 — Cuaderno de campo digital (Semana 4)
**Objetivo**: M3 (RF-3.01 a 3.06) online.
- Esquemas zod por tipo (`activitySchemas.ts`) y mapeo `formValues → ApiLaborBody` (`insumo_producto`, `cantidad_dosis`, `detalle_tecnico`).
- Tab Registrar (8.6) con `ChoiceCard` y últimos registros; formulario dinámico (8.7) para los 7 tipos con `DateField` (max hoy), `PhotoPicker` (compresión), sticky save, modal de éxito.
- `pickEvidence.ts` (cámara/galería, permisos) y `upload.ts` (multipart a `/uploads`, con fallback base64 configurable).
- `Timeline` en Detalle de lote (8.3) con filtro por tipo y agrupación por mes; Detalle de actividad (8.8) con `PhotoViewer`.
- Admin: Consolidado (8.20) con filtros y export CSV local; FAB "Registrar" desde detalle de lote admin.
- Tests: reglas RN-04/05/07 en esquemas; mapeo de detalle técnico.
**DoD**: se registran las 7 labores con foto y aparecen en la timeline y en el consolidado; registrar riego toma ≤ 6 toques desde el tab; formularios usables con teclado numérico.

### Fase 4 — Motor QR y escáner (Semana 5)
**Objetivo**: M4 (RF-4.01 a 4.04).
- `qrUrl(token)`, `QRCodeView`, Tab Mis QR (8.9), Vista QR de lote (8.10).
- `QRLabelTemplate` (8.14) + captura PNG (view-shot nativo / html-to-image web) + guardar en galería/compartir/descargar; tamaño Jaba.
- Escáner (8.11) nativo (`expo-camera`) y web (`html5-qrcode`), entrada manual, parseo de token, deep link a `trace/[token]`.
- App Links en `app.json` y manejo de `Linking` inicial.
- Admin: modal QR desde tabla de lotes; QR en columna izquierda del detalle.
**DoD**: etiqueta PNG 1200×1600 legible por lectores estándar; escaneo < 1 s en dispositivo real; el mismo lote muestra siempre la misma URL (RN-03 verificado en tests).

### Fase 5 — Portal público de trazabilidad (Semana 6)
**Objetivo**: M5 (RF-5.01 a 5.03).
- `usePublicTrace`, pantalla `trace/[token]` (8.15) móvil y escritorio, estados 404/offline/skeleton, filtros de timeline, lightbox, paginación local.
- Metadatos/Open Graph, `robots`, título dinámico; `expo-image` con thumbnails.
- Página `+not-found` y `ErrorState` globales.
- Auditoría Lighthouse móvil ≥ 85/95; pruebas de 3G con throttling.
**DoD**: al abrir la URL desde cámara nativa en un celular sin la app se ve la ficha completa en < 2 s con datos mock; accesibilidad AA verificada (contraste, roles, foco).

### Fase 6 — Offline-first y sincronización (Semana 7, días 1–3)
**Objetivo**: M20 completo.
- `sqlite.ts`, `schema.ts`, repositorios (`pendingActivitiesRepo`, `lotsCacheRepo`), adaptador web (`kv` IndexedDB).
- `syncEngine.ts` con disparadores, mutex, backoff, idempotencia por `client_id`, invalidaciones; `syncStore`.
- Integración en `useCreateActivity` (rama offline), merge de pendientes en `useLotActivities`, chips de estado, `Badge` en Perfil, `Banner` de sincronización, Centro de sincronización (8.13) con "Solo Wi-Fi para fotos".
- `persistQueryClient` para lectura offline de lotes/actividades.
- Tests: 100 registros en modo avión → reconexión → 100 `SYNCED`, sin duplicados; fallo parcial → reintentos con backoff.
**DoD**: demostración grabada: registrar 5 labores con foto en modo avión, cerrar app, reabrir, activar red → todo sincroniza sin intervención.

### Fase 7 — Reportes, dashboard admin y modo campo (Semana 7, días 4–5)
**Objetivo**: M6 (RF-6.01 a 6.03) y cierre funcional del admin.
- Reportes (8.21): descargas Excel/SPSS (blob web; `FileSystem` + `Sharing` móvil), historial local, diccionario de codificación.
- Dashboard (8.17): StatTiles, adopción por productor (Alta/Media/Baja), labores por tipo (barras propias), actividad reciente, lotes inactivos; usa `/reports/summary` o cálculo en cliente.
- "Modo campo" para admin (abre `(producer)` con selector de productor en la cabecera).
**DoD**: el admin descarga ambos archivos en web y Android; dashboard refleja los datos semilla; navegación admin completa sin placeholders.

### Fase 8 — Calidad, pulido y despliegue (Semana 8)
**Objetivo**: entregar APK y web de producción.
- Revisión de diseño pantalla por pantalla contra la sección 8 (checklist de espaciado, tipografía, tamaños táctiles ≥ 48 dp, copy en `es.ts`).
- Accesibilidad: labels, foco, escalado de fuente 1.3×, contraste.
- Performance: `FlashList` en listas largas, memoización, imágenes, bundle web (`expo export -p web`, análisis de tamaño), Hermes.
- Tests E2E: Playwright web (login, crear lote, registrar labor, portal público, export); smoke en Android (Maestro opcional).
- Manejo de `expo-updates` (Banner de actualización), pantallas de sistema, telemetría mínima local de errores (sin servicios externos en v1).
- Build: `eas build -p android --profile preview` (APK) y `production`; `expo export -p web` y despliegue estático (Nginx/Vercel) con rewrite a `index.html`; configurar dominio `agronex.andarapa.pe` y archivo `.well-known/assetlinks.json` para App Links.
- Documentación: README (setup, scripts, entornos), `docs/DESIGN_SYSTEM.md`, `docs/OFFLINE_SYNC.md`, `docs/API_CONTRACT.md` (con los `[PROPUESTO]` resueltos), guía de capturas para la matriz de evidencias de la tesis (RF-1..6 ↔ CU-01..08).
**DoD**: APK instalable en Android 8+; web desplegada; todos los criterios de 2.2 medidos y documentados; CHANGELOG final.

### Resumen de cronograma
| Sprint (spec) | Fases | Semanas | Entregable |
|---|---|---|---|
| Sprint 1 | 0, 1 | 1–2 | Base + Login + navegación |
| Sprint 2 | 2, 3 | 3–4 | Padrón, lotes, cuaderno de campo |
| Sprint 3 | 4, 5 | 5–6 | QR, escáner, portal público |
| Sprint 4 | 6, 7, 8 | 7–8 | Offline, reportes, despliegue |

---

## 13. Convenciones de código y Definition of Done global

- **Nombres**: componentes `PascalCase.tsx`; hooks `useX.ts`; utilidades `camelCase.ts`; archivos de ruta según Expo Router. Un componente por archivo. Exports nombrados (excepto rutas).
- **Estilos**: `StyleSheet.create` con tokens; nada de valores mágicos (colores/espaciados literales prohibidos fuera de `tokens/`). Sin estilos inline salvo dinámicos.
- **Plataforma**: usar sufijos `.web.tsx` / `.native.tsx` solo en `services/` y `design-system/` (nunca en pantallas). `Platform.select` mínimo.
- **Tipos**: `strict: true`, sin `any`; respuestas de API validadas con zod en `endpoints.ts`.
- **Estado**: server state en TanStack Query; nunca duplicar en Zustand.
- **Textos**: siempre desde `i18n/es.ts`.
- **Accesibilidad**: todo `Pressable` con `accessibilityRole` y `accessibilityLabel`.
- **Commits**: Conventional Commits (`feat(activities): formulario de riego`). Una PR/commit por tarea de fase.
- **Tests**: cada hook de dominio y esquema zod con test unitario; cada pantalla principal con test de render + interacción básica.
- **DoD de cualquier tarea**: tipa, lint limpio, test verde, funciona en Android y Web, revisada contra la maquetación, textos en `es.ts`, sin `console.log`.

---

## 14. Riesgos y mitigaciones

| Riesgo | Impacto | Mitigación |
|---|---|---|
| Backend no disponible a tiempo | Bloqueo de integración | MSW + contrato 10.3; adaptadores finos en `endpoints.ts` |
| Subida de fotos en 3G lenta | Frustración, colas largas | Compresión 1280 px/0.7, opción "solo Wi-Fi", envío diferido |
| Captura PNG en web inconsistente | Etiqueta ilegible | Render de etiqueta a tamaño fijo en contenedor offscreen; test visual |
| Gama baja Android | Lentitud | Hermes, FlashList, evitar re-render de timeline, imágenes lazy |
| Productores olvidan contraseña | Bloqueo de uso | Sesión de 30 días "recordada", flujo de contacto con asesor, admin puede reestablecer `[PROPUESTO PUT /producers/:id/password]` |
| App Links no verificados | El QR abre navegador y no la app | Aceptable: el portal web es la experiencia diseñada para el comprador; App Links son mejora |

---

## 15. Anexos

### 15.1 Checklist de evidencias para la tesis (mapeo RF ↔ pantallas)
| RF | Pantalla(s) | Evidencia a capturar |
|---|---|---|
| RF-1.01–1.03 | 8.1, 8.12 | Login exitoso, sesión persistente, cierre de sesión |
| RF-2.01–2.04 | 8.2, 8.3, 8.4, 8.18, 8.19 | Padrón de 14 productores, lote con densidad |
| RF-3.01–3.06 | 8.6, 8.7, 8.8 | 7 registros con foto en timeline |
| RF-4.01–4.04 | 8.9, 8.10, 8.11, 8.14 | Etiqueta PNG, foto de jaba, escaneo |
| RF-5.01–5.03 | 8.15 | Portal público en celular, sello BPA |
| RF-6.01–6.03 | 8.17, 8.20, 8.21 | Consolidado filtrado, archivos Excel y CSV SPSS |
| M20 | 8.13 | Registros pendientes → sincronizados |

### 15.2 Scripts esperados en `package.json`
```
"start": "expo start", "android": "expo run:android", "web": "expo start --web",
"lint": "eslint . --ext .ts,.tsx", "typecheck": "tsc --noEmit", "test": "jest",
"test:e2e": "playwright test", "build:web": "expo export -p web",
"build:apk": "eas build -p android --profile preview", "mocks": "EXPO_PUBLIC_USE_MOCKS=true expo start"
```

### 15.3 Datos de prueba (semilla)
- Admin: DNI `00000001` / `admin123`
- Productor demo: DNI `70829145` / `12345678` — Julián Quispe Huamán, Sector Chuspi, parcelas "Los Eucaliptos" (1.5 ha) y "El Mirador" (0.8 ha), lotes `LOTE-AND-001`, `002`, `003`.
- Token público demo: `c8a2e1d0-6b1f-4f4e-9b0a-1d2f3e4a5b6c` → `LOTE-AND-001`.

---

*Fin del PRD. Este documento es la referencia única para el desarrollo del frontend de AGRONEX; cualquier desviación debe registrarse en `docs/DECISIONS.md` con su justificación.*