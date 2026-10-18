import React from 'react';
import { ArrowUpRight } from '@phosphor-icons/react';

interface SiBotSuggestionsProps {
  onSelect: (text: string) => void;
  currentModule?: string;
}

interface SuggestionItem {
  label: string;
  prompt: string;
}

const MODULE_SUGGESTIONS: Record<string, SuggestionItem[]> = {
  dashboard: [
    {
      label: 'Resumen ejecutivo de stock y alertas activas',
      prompt: 'Dame un diagnóstico ejecutivo del estado actual de SIVAC: stock total, lotes por vencer y alertas críticas.',
    },
    {
      label: 'Balance global de vacunas y jeringas en tabla',
      prompt: '¿Cuántas vacunas y jeringas tenemos disponibles en stock global actualmente? Muestra una tabla detallada.',
    },
    {
      label: 'Lotes próximos a vencer en los siguientes 60 días',
      prompt: '¿Cuáles son los lotes de vacunas y jeringas próximos a vencer en los siguientes 60 días? Ordénalos por fecha de caducidad.',
    },
  ],
  inventario: [
    {
      label: 'Stock disponible agrupado por centro de acopio',
      prompt: 'Muestra la distribución actual de stock de vacunas agrupada por centro de acopio en una tabla.',
    },
    {
      label: 'Relación actual entre vacunas y jeringas en almacén',
      prompt: '¿Cuál es el stock actual de jeringas descartables por medida y su relación con las vacunas en almacén?',
    },
    {
      label: 'Biológicos en nivel crítico o próximos a vencer',
      prompt: 'Analiza el inventario actual de vacunas y jeringas: ¿qué biológicos tienen stock crítico y cuáles tienen lotes próximos a vencer?',
    },
  ],
  movimientos: [
    {
      label: 'Resumen de últimos ingresos y despachos registrados',
      prompt: 'Resume los últimos movimientos de ingreso y salida registrados en el sistema con cantidades y destinos.',
    },
    {
      label: 'Gráfico de evolución mensual de entregas',
      prompt: 'Muestra un gráfico de barras con el volumen de entregas de vacunas por mes.',
    },
    {
      label: 'Despachos acumulados por Red y Microred',
      prompt: '¿Qué redes y microredes han recibido mayor volumen de dosis este trimestre? Muéstralo en tabla.',
    },
  ],
  planificacion: [
    {
      label: 'Avance de entregas frente a la meta anual',
      prompt: '¿Cómo va el avance de entregas frente a la planificación anual por establecimiento?',
    },
    {
      label: 'Establecimientos con menor cobertura de entrega',
      prompt: 'Analiza el avance de la planificación anual de vacunas e identifica los establecimientos con menor porcentaje de entrega.',
    },
    {
      label: 'Gráfico comparativo de dosis planificadas vs entregadas',
      prompt: 'Muestra un gráfico comparando las dosis planificadas frente a las dosis entregadas de las principales vacunas.',
    },
  ],
  kardex: [
    {
      label: 'Tabla de entradas, salidas y saldos actuales',
      prompt: 'Muestra un resumen de entradas, salidas y saldos actuales de las principales vacunas en formato tabla.',
    },
    {
      label: 'Trazabilidad de lotes con mayor rotación',
      prompt: '¿Cuáles son los lotes de vacunas con mayor movimiento de salida reciente según el Kardex?',
    },
    {
      label: 'Verificación de consistencia de saldos por lote',
      prompt: 'Verifica el estado actual de saldos de vacunas y jeringas por lote activo en el almacén.',
    },
  ],
  alertas: [
    {
      label: 'Priorización FEFO de lotes próximos a caducar',
      prompt: 'Lista los lotes con vencimiento más cercano y las alertas de stock crítico ordenados por prioridad de atención.',
    },
    {
      label: 'Detección de biológicos en quiebre de stock',
      prompt: 'Identifica qué vacunas se encuentran en nivel de stock crítico o agotado y requieren reposición urgente.',
    },
    {
      label: 'Diagnóstico ejecutivo de alertas activas',
      prompt: 'Dame un resumen ejecutivo de las alertas activas más urgentes del sistema y qué acciones recomiendas.',
    },
  ],
  establecimientos: [
    {
      label: 'Distribución de establecimientos por Red y Microred',
      prompt: '¿Cómo están distribuidos los establecimientos por Red y Microred y cuáles tienen mayor demanda planificada?',
    },
    {
      label: 'Comparativa de inventario entre centros de acopio',
      prompt: 'Muestra la distribución actual de stock de vacunas agrupada por centro de acopio en una tabla.',
    },
    {
      label: 'Cobertura de despachos hacia establecimientos',
      prompt: 'Resume las entregas recientes realizadas a los establecimientos de salud con cantidades y lotes.',
    },
  ],
  reportes: [
    {
      label: 'Tabla consolidada de inventario para exportar a Excel',
      prompt: 'Genera una tabla consolidada de inventario de vacunas con stock actual, lotes activos y estado de abastecimiento para exportar a Excel.',
    },
    {
      label: 'Gráfico de las 8 vacunas con mayor disponibilidad',
      prompt: 'Genera un gráfico con las 8 vacunas de mayor stock disponible en el sistema.',
    },
    {
      label: 'Reporte ejecutivo de cumplimiento anual',
      prompt: 'Genera una tabla resumen con el avance porcentual de entregas frente a la meta anual por biológico.',
    },
  ],
  'ici-demid': [
    {
      label: 'Indicadores clave de disponibilidad mensual ICI-DEMID',
      prompt: 'Resume los indicadores clave de disponibilidad y consumo mensual de biológicos para el control ICI-DEMID.',
    },
    {
      label: 'Tabla de saldos y vencimientos por biológico',
      prompt: 'Muestra en una tabla los saldos disponibles y fechas de vencimiento de los lotes activos para el reporte ICI-DEMID.',
    },
    {
      label: 'Análisis de biológicos en sobrestock o substock',
      prompt: 'Identifica qué vacunas presentan riesgo de desabastecimiento o vencimiento próximo según el inventario actual.',
    },
  ],
};

export const SiBotSuggestions: React.FC<SiBotSuggestionsProps> = ({
  onSelect,
  currentModule = 'dashboard',
}) => {
  const suggestions = MODULE_SUGGESTIONS[currentModule] || MODULE_SUGGESTIONS.dashboard;

  return (
    <div className="flex w-full flex-col gap-2 font-sans">
      <span className="px-1 text-[11.5px] font-medium text-muted">
        Consultas sugeridas
      </span>
      <div className="flex flex-col gap-1.5">
        {suggestions.map((item, idx) => (
          <button
            key={idx}
            type="button"
            onClick={() => onSelect(item.prompt)}
            className="group flex w-full items-center justify-between gap-3 rounded-xl bg-surface-soft/85 px-3.5 py-2.5 text-left transition-colors duration-150 hover:bg-surface-tint/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/30"
          >
            <span className="truncate text-[13px] font-medium text-ink transition-colors group-hover:text-brand">
              {item.label}
            </span>
            <ArrowUpRight
              className="h-3.5 w-3.5 shrink-0 text-muted transition-transform duration-150 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-brand"
              weight="bold"
            />
          </button>
        ))}
      </div>
    </div>
  );
};
