import React, { useState } from 'react';
import {
  ArrowUpRight,
  ChartBar,
  Compass,
  Package,
  ShieldWarning,
  Truck,
  type Icon,
} from '@phosphor-icons/react';

interface SiBotSuggestionsProps {
  onSelect: (text: string) => void;
  currentModule?: string;
  isExpanded?: boolean;
}

type CategoryId = 'inventario' | 'entregas' | 'alertas' | 'analitica';

interface PromptItem {
  title: string;
  prompt: string;
  detail: string;
}

const CATEGORY_CONFIG: Array<{
  id: CategoryId;
  label: string;
  icon: Icon;
}> = [
  { id: 'inventario', label: 'Inventario', icon: Package },
  { id: 'entregas', label: 'Entregas', icon: Truck },
  { id: 'alertas', label: 'Riesgos', icon: ShieldWarning },
  { id: 'analitica', label: 'Gráficos', icon: ChartBar },
];

const PROMPTS_BY_CATEGORY: Record<CategoryId, PromptItem[]> = {
  inventario: [
    {
      title: 'Balance de stock global por biológico',
      prompt: '¿Cuántas vacunas y jeringas tenemos disponibles en stock global actualmente? Muestra una tabla detallada.',
      detail: 'Consolidado actual de dosis, lotes activos y disponibilidad',
    },
    {
      title: 'Disponibilidad por Centro de Acopio',
      prompt: 'Muestra la distribución actual de stock de vacunas agrupada por centro de acopio en una tabla.',
      detail: 'Comparativa de inventario entre almacenes y redes',
    },
    {
      title: 'Consulta de jeringas y diluyentes',
      prompt: '¿Cuál es el stock actual de jeringas descartables por medida y su relación con las vacunas en almacén?',
      detail: 'Verificación de insumos complementarios de inmunización',
    },
  ],
  entregas: [
    {
      title: 'Historial de movimientos recientes',
      prompt: 'Resume los últimos movimientos de ingreso y salida registrados en el sistema con cantidades y destinos.',
      detail: 'Trazabilidad de transferencias, vales y despachos',
    },
    {
      title: 'Cumplimiento de planificación anual',
      prompt: '¿Cómo va el avance de entregas frente a la planificación anual por establecimiento?',
      detail: 'Brechas de distribución mensual y cobertura',
    },
    {
      title: 'Despachos por Red y Microred',
      prompt: '¿Qué redes y microredes han recibido mayor volumen de dosis este trimestre? Muéstralo en tabla.',
      detail: 'Distribución territorial de biológicos en Apurímac II',
    },
  ],
  alertas: [
    {
      title: 'Lotes próximos a vencer (FEFO)',
      prompt: '¿Cuáles son los lotes de vacunas y jeringas próximos a vencer en los siguientes 60 días? Ordénalos por fecha de caducidad.',
      detail: 'Priorización de salida por caducidad temprana',
    },
    {
      title: 'Detección de stock crítico o quiebre',
      prompt: 'Identifica qué vacunas se encuentran en nivel de stock crítico o agotado y requieren reposición urgente.',
      detail: 'Prevención de desabastecimiento en cadena de frío',
    },
    {
      title: 'Auditoría de alertas activas',
      prompt: 'Dame un resumen ejecutivo de las alertas activas más urgentes del sistema y qué acciones recomiendas.',
      detail: 'Diagnóstico inmediato de incidencias operativas',
    },
  ],
  analitica: [
    {
      title: 'Gráfico de evolución de entregas',
      prompt: 'Muestra un gráfico de barras con el volumen de entregas de vacunas por mes.',
      detail: 'Visualización comparativa de tendencias de despacho',
    },
    {
      title: 'Distribución porcentual de inventario',
      prompt: 'Genera un gráfico con las 8 vacunas de mayor stock disponible en el sistema.',
      detail: 'Composición visual de la capacidad almacenada',
    },
    {
      title: 'Comparativa de consumo vs. meta',
      prompt: 'Muestra un gráfico comparando las dosis planificadas frente a las dosis entregadas de las principales vacunas.',
      detail: 'Rendimiento gráfico de ejecución presupuestal y metas',
    },
  ],
};

const MODULE_CONTEXT_PROMPTS: Record<string, { label: string; prompt: string }> = {
  dashboard: {
    label: 'Resumen ejecutivo del panel principal',
    prompt: 'Dame un diagnóstico ejecutivo del estado actual de SIVAC: stock total, lotes por vencer y alertas críticas.',
  },
  inventario: {
    label: 'Analizar catálogo y lotes en Inventario',
    prompt: 'Analiza el inventario actual de vacunas y jeringas: ¿qué biológicos tienen mayor stock y cuáles tienen lotes próximos a vencer?',
  },
  movimientos: {
    label: 'Analizar flujo de Movimientos y Entregas',
    prompt: 'Resume las entregas y movimientos recientes de vacunas y muestra un gráfico de salidas por mes.',
  },
  planificacion: {
    label: 'Evaluar metas de Planificación Anual',
    prompt: 'Analiza el avance de la planificación anual de vacunas e identifica los establecimientos con menor porcentaje de entrega.',
  },
  kardex: {
    label: 'Consultar trazabilidad y saldos Kardex',
    prompt: 'Muestra un resumen de entradas, salidas y saldos actuales de las principales vacunas en formato tabla.',
  },
  alertas: {
    label: 'Priorizar Alertas y vencimientos críticos',
    prompt: 'Lista los lotes con vencimiento más cercano y las alertas de stock crítico ordenados por prioridad de atención.',
  },
  establecimientos: {
    label: 'Cobertura por Redes y Establecimientos',
    prompt: '¿Cómo están distribuidos los establecimientos por Red y Microred y cuáles tienen mayor demanda planificada?',
  },
  reportes: {
    label: 'Generar tabla consolidada para reporte',
    prompt: 'Genera una tabla consolidada de inventario de vacunas con stock actual, lotes activos y estado de abastecimiento para exportar a Excel.',
  },
  'ici-demid': {
    label: 'Analizar consumo integrado ICI-DEMID',
    prompt: 'Resume los indicadores clave de disponibilidad y consumo mensual de biológicos para el control ICI-DEMID.',
  },
};

export const SiBotSuggestions: React.FC<SiBotSuggestionsProps> = ({
  onSelect,
  currentModule = 'dashboard',
  isExpanded = false,
}) => {
  const [activeCategory, setActiveCategory] = useState<CategoryId>('inventario');
  const contextualAction = MODULE_CONTEXT_PROMPTS[currentModule] || MODULE_CONTEXT_PROMPTS.dashboard;
  const activePrompts = PROMPTS_BY_CATEGORY[activeCategory];

  return (
    <div className={`w-full ${isExpanded ? 'max-w-2xl' : 'max-w-full'} flex flex-col gap-3.5 text-left`}>
      {/* Acción Contextual según el módulo activo */}
      <button
        type="button"
        onClick={() => onSelect(contextualAction.prompt)}
        className="group flex w-full items-center justify-between gap-3 rounded-xl border border-line bg-surface-soft/80 px-3.5 py-2.5 text-left transition-colors duration-150 hover:border-brand/40 hover:bg-surface-tint/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/30"
      >
        <div className="flex min-w-0 items-center gap-2.5">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-line bg-surface text-brand">
            <Compass className="h-4 w-4" weight="duotone" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-1.5 text-[11px] font-medium text-muted">
              <span>Acción contextual</span>
              <span aria-hidden="true">·</span>
              <span className="capitalize text-brand">{currentModule.replace('-', ' ')}</span>
            </div>
            <p className="truncate text-xs font-semibold text-ink">
              {contextualAction.label}
            </p>
          </div>
        </div>
        <ArrowUpRight
          className="h-4 w-4 shrink-0 text-muted transition-transform duration-150 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-brand"
          weight="bold"
        />
      </button>

      {/* Selector de Categorías Analíticas */}
      <div className="flex items-center gap-1 rounded-xl border border-line bg-surface-soft p-1">
        {CATEGORY_CONFIG.map((category) => {
          const Icon = category.icon;
          const isActive = activeCategory === category.id;
          return (
            <button
              key={category.id}
              type="button"
              onClick={() => setActiveCategory(category.id)}
              className={`flex flex-1 items-center justify-center gap-1.5 whitespace-nowrap shrink-0 rounded-lg px-2 py-1.5 text-xs font-semibold transition-colors duration-150 ${
                isActive
                  ? 'bg-surface text-ink shadow-xs border border-line/80'
                  : 'text-muted-2 hover:text-ink'
              }`}
            >
              <Icon className={`h-3.5 w-3.5 shrink-0 ${isActive ? 'text-brand' : 'text-muted'}`} weight={isActive ? 'duotone' : 'regular'} />
              <span>{category.label}</span>
            </button>
          );
        })}
      </div>

      {/* Lista de Consultas Especializadas */}
      <div className={`grid gap-2 ${isExpanded ? 'sm:grid-cols-3' : 'grid-cols-1'}`}>
        {activePrompts.map((item, idx) => (
          <button
            key={idx}
            type="button"
            onClick={() => onSelect(item.prompt)}
            className="group flex flex-col justify-between gap-1.5 rounded-xl border border-line bg-surface p-3 text-left transition-colors duration-150 hover:border-line-strong hover:bg-surface-soft/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/30"
          >
            <div className="flex w-full items-start justify-between gap-2">
              <span className="text-xs font-semibold leading-snug text-ink group-hover:text-brand transition-colors">
                {item.title}
              </span>
              <ArrowUpRight
                className="mt-0.5 h-3.5 w-3.5 shrink-0 text-muted opacity-60 transition-all duration-150 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-brand group-hover:opacity-100"
                weight="bold"
              />
            </div>
            <p className="text-[11px] leading-relaxed text-muted-2 line-clamp-2">
              {item.detail}
            </p>
          </button>
        ))}
      </div>
    </div>
  );
};
