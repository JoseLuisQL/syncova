import React, { memo } from 'react';
import { Eye, Download, ArrowCounterClockwise, Package, SpinnerGap, Receipt, CheckCircle, Plus, Stack, CalendarBlank, Buildings } from '@phosphor-icons/react';
import { COMPONENT_STYLES, ESTADOS_VALE, MESES } from '../constants';
import { ValeEntrega } from '../../../services/valesService';

interface ValesTablaProps {
  vales: ValeEntrega[];
  isLoading: boolean;
  isReverting: boolean;
  onVerDetalle: (vale: ValeEntrega) => void;
  onExportar: (vale: ValeEntrega) => void;
  onRevertir: (vale: ValeEntrega) => void;
}

// Analizar tipos de entrega del vale
const analyzeDeliveryTypes = (vale: ValeEntrega) => {
  let hasBase = false;
  const additionalGroups = new Set<number>();

  vale.detalles?.forEach(detalle => {
    if (detalle.cantidadProgramada > 0) hasBase = true;
    if (detalle.cantidadAdicional > 0 && detalle.numeroEntregaAdicional) {
      additionalGroups.add(detalle.numeroEntregaAdicional);
    }
  });

  return { hasBase, additionalCount: additionalGroups.size };
};

// Componente de badge de tipo
const TipoBadge: React.FC<{ vale: ValeEntrega }> = memo(({ vale }) => {
  const { hasBase, additionalCount } = analyzeDeliveryTypes(vale);

  if (hasBase && additionalCount > 0) {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-md border border-line bg-surface-soft px-2.5 py-1 text-xs font-medium text-ink">
        <Stack weight="bold" className="h-3 w-3" />
        <span>Completo</span>
      </span>
    );
  }

  if (hasBase) {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-md border border-line bg-surface-soft px-2.5 py-1 text-xs font-medium text-ink">
        <CheckCircle weight="bold" className="h-3 w-3" />
        <span>Base</span>
      </span>
    );
  }

  if (additionalCount > 0) {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-md border border-line bg-surface-soft px-2.5 py-1 text-xs font-medium text-ink">
        <Plus weight="bold" className="h-3 w-3" />
        <span>Adic. #{additionalCount}</span>
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-1.5 rounded-md border border-line bg-surface-soft px-2.5 py-1 text-xs font-medium text-ink">
      <CheckCircle weight="bold" className="h-3 w-3" />
      <span>Base</span>
    </span>
  );
});

TipoBadge.displayName = 'TipoBadge';

// Componente de badge de estado
const EstadoBadge: React.FC<{ estado: string }> = memo(({ estado }) => {
  const config = ESTADOS_VALE[estado as keyof typeof ESTADOS_VALE] || ESTADOS_VALE.generado;
  const Icon = config.icon;

  return (
    <span className="inline-flex items-center gap-1.5 rounded-md border border-line bg-surface-soft px-2.5 py-1 text-xs font-medium text-ink">
      <Icon weight="bold" className="h-3.5 w-3.5" />
      <span>{config.label}</span>
    </span>
  );
});

EstadoBadge.displayName = 'EstadoBadge';

export const ValesTabla: React.FC<ValesTablaProps> = memo(({
  vales,
  isLoading,
  isReverting,
  onVerDetalle,
  onExportar,
  onRevertir,
}) => {
  const isProcessing = isReverting;

  if (isLoading) {
    return (
      <div className={`${COMPONENT_STYLES.table.container} px-6 py-12 text-center`}>
        <div className="flex flex-col items-center gap-3">
          <SpinnerGap weight="bold" className="h-8 w-8 animate-spin text-muted" />
          <span className="text-sm font-medium text-muted-2">Cargando vales...</span>
        </div>
      </div>
    );
  }

  if (vales.length === 0) {
    return (
      <div className={`${COMPONENT_STYLES.table.container} px-6 py-16 text-center`}>
        <Receipt weight="duotone" className="mx-auto h-12 w-12 text-muted mb-4" />
        <p className="text-base font-semibold tracking-tight text-ink">Sin vales generados</p>
        <p className="mt-1 text-sm text-muted">
          Use el botón Generar Vale para crear el documento de este centro y periodo.
        </p>
      </div>
    );
  }

  return (
    <>
      {/* Vista de Tarjetas Automática para Móviles (< md) */}
      <div className="grid grid-cols-1 gap-3 md:hidden">
        {vales.map((vale) => (
          <article
            key={`mobile-vale-${vale.id}`}
            className="rounded-xl border border-line bg-surface p-3.5 shadow-2xs transition-colors"
          >
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-sm font-black tracking-tight text-ink">
                    N° {vale.numero}
                  </span>
                  <TipoBadge vale={vale} />
                </div>
                <div className="mt-1 flex items-center gap-1.5 text-xs font-semibold text-ink">
                  <Buildings weight="duotone" className="h-3.5 w-3.5 shrink-0 text-muted" />
                  <span className="truncate">{vale.centroAcopio.nombre}</span>
                </div>
              </div>
              <EstadoBadge estado={vale.estado} />
            </div>

            <div className="mt-3 grid grid-cols-2 gap-2 rounded-lg border border-line-soft bg-surface-soft/60 p-2.5 text-xs">
              <div>
                <span className="block text-[10px] font-semibold uppercase tracking-wider text-muted">
                  Total Vacunas
                </span>
                <div className="mt-1 flex items-center gap-1.5">
                  <span className="inline-flex items-center gap-1 rounded bg-teal-600 px-1.5 py-0.5 text-[11px] font-bold tabular-nums text-white">
                    <Package weight="bold" className="h-3 w-3" />
                    {vale.totalVacunas.toLocaleString('en-US')}
                  </span>
                  <span className="text-[11px] font-medium text-muted-2">
                    ({vale.totalEstablecimientos} estab.)
                  </span>
                </div>
              </div>
              <div>
                <span className="block text-[10px] font-semibold uppercase tracking-wider text-muted">
                  Período / Emisión
                </span>
                <div className="mt-1 flex items-center gap-1 font-medium text-ink">
                  <CalendarBlank weight="duotone" className="h-3.5 w-3.5 text-muted" />
                  <span>
                    {MESES[vale.mes - 1]?.slice(0, 3)} {vale.anio} ·{' '}
                    {new Date(vale.fechaGeneracion).toLocaleDateString('es-PE', {
                      day: '2-digit',
                      month: '2-digit',
                    })}
                  </span>
                </div>
              </div>
            </div>

            <div className="mt-3 flex items-center justify-end gap-2 border-t border-line-soft pt-2.5">
              <button
                type="button"
                onClick={() => onVerDetalle(vale)}
                disabled={isProcessing}
                className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-lg border border-line bg-surface px-3 py-1.5 text-xs font-semibold text-ink transition-colors hover:bg-surface-soft disabled:opacity-50"
              >
                <Eye weight="bold" className="h-3.5 w-3.5" />
                <span>Detalle</span>
              </button>
              <button
                type="button"
                onClick={() => onExportar(vale)}
                disabled={isProcessing}
                className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-lg border border-line bg-surface px-3 py-1.5 text-xs font-semibold text-ink transition-colors hover:bg-surface-soft disabled:opacity-50"
              >
                <Download weight="bold" className="h-3.5 w-3.5" />
                <span>Exportar</span>
              </button>
              <button
                type="button"
                onClick={() => onRevertir(vale)}
                disabled={isProcessing}
                className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-line bg-surface text-rose-600 transition-colors hover:bg-rose-50 disabled:opacity-50"
                title="Revertir vale"
                aria-label="Revertir vale"
              >
                <ArrowCounterClockwise weight="bold" className="h-4 w-4" />
              </button>
            </div>
          </article>
        ))}
      </div>

      {/* Vista de Tabla para Tablet y Escritorio (>= md) */}
      <div className={`hidden md:block ${COMPONENT_STYLES.table.container}`}>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[700px]">
            <thead className={COMPONENT_STYLES.table.header}>
              <tr>
                <th className={`${COMPONENT_STYLES.table.headerCell} w-32`}>Numero</th>
                <th className={`${COMPONENT_STYLES.table.headerCell} min-w-[180px]`}>Centro de Acopio</th>
                <th className={`${COMPONENT_STYLES.table.headerCell} text-center w-28`}>Tipo</th>
                <th className={`${COMPONENT_STYLES.table.headerCell} text-center w-32`}>Totales</th>
                <th className={`${COMPONENT_STYLES.table.headerCell} text-center w-28`}>Estado</th>
                <th className={`${COMPONENT_STYLES.table.headerCell} text-center w-28`}>Fecha</th>
                <th className={`${COMPONENT_STYLES.table.headerCell} text-center w-32`}>Acciones</th>
              </tr>
            </thead>
            <tbody className="bg-surface">
              {vales.map((vale) => (
                <tr
                  key={vale.id}
                  className={COMPONENT_STYLES.table.row}
                >
                  {/* Numero */}
                  <td className={COMPONENT_STYLES.table.cell}>
                    <span className="font-black tracking-tight text-ink">{vale.numero}</span>
                  </td>

                  {/* Centro de Acopio */}
                  <td className={COMPONENT_STYLES.table.cell}>
                    <div>
                      <div className="font-bold text-ink truncate max-w-[200px] text-xs">
                        {vale.centroAcopio.nombre}
                      </div>
                      <div className="text-[0.65rem] font-semibold text-muted uppercase tracking-wider mt-0.5">
                        {MESES[vale.mes - 1]} {vale.anio}
                      </div>
                    </div>
                  </td>

                  {/* Tipo */}
                  <td className={`${COMPONENT_STYLES.table.cell} text-center`}>
                    <TipoBadge vale={vale} />
                  </td>

                  {/* Totales */}
                  <td className={`${COMPONENT_STYLES.table.cell} text-center`}>
                    <div className="flex flex-col items-center gap-1">
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-teal-600 text-white rounded-[4px] text-[0.7rem] font-bold tabular-nums tracking-tight">
                        <Package weight="bold" className="h-3 w-3" />
                        {vale.totalVacunas.toLocaleString('en-US')}
                      </span>
                      <span className="text-[0.65rem] font-semibold text-muted-2 uppercase tracking-widest">
                        {vale.totalEstablecimientos} CENTROS
                      </span>
                    </div>
                  </td>

                  {/* Estado */}
                  <td className={`${COMPONENT_STYLES.table.cell} text-center`}>
                    <EstadoBadge estado={vale.estado} />
                  </td>

                  {/* Fecha */}
                  <td className={`${COMPONENT_STYLES.table.cell} text-center`}>
                    <span className="text-[0.75rem] font-semibold text-muted-2 tabular-nums">
                      {new Date(vale.fechaGeneracion).toLocaleDateString('es-PE', {
                        day: '2-digit',
                        month: '2-digit',
                        year: 'numeric',
                      })}
                    </span>
                  </td>

                  {/* Acciones */}
                  <td className={`${COMPONENT_STYLES.table.cell} text-center`}>
                    <div className="flex items-center justify-center gap-1.5">
                      <button type="button"
                        onClick={() => onVerDetalle(vale)}
                        className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-transparent text-muted-2 hover:bg-surface-soft hover:text-ink transition-colors"
                        title="Ver detalle"
                        disabled={isProcessing}
                      >
                        <Eye weight="bold" className="h-4 w-4" />
                      </button>
                      <button type="button"
                        onClick={() => onExportar(vale)}
                        className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-transparent text-muted-2 hover:bg-surface-soft hover:text-ink transition-colors"
                        title="Exportar"
                        disabled={isProcessing}
                      >
                        <Download weight="bold" className="h-4 w-4" />
                      </button>
                      <button type="button"
                        onClick={() => onRevertir(vale)}
                        className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-transparent text-muted-2 hover:bg-rose-50/20 hover:text-rose-500 transition-colors"
                        title="Revertir"
                        disabled={isProcessing}
                      >
                        <ArrowCounterClockwise weight="bold" className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
});

ValesTabla.displayName = 'ValesTabla';
