import React, { memo } from 'react';
import { Eye, Download, ArrowCounterClockwise, Package, SpinnerGap, Receipt, CheckCircle, Plus, Stack } from '@phosphor-icons/react';
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
      <span className="inline-flex items-center gap-1.5 rounded-[8px] border border-[#e7e7ef] bg-white px-2.5 py-1 text-xs font-medium text-[#15171d]">
        <Stack weight="bold" className="h-3 w-3" />
        <span className="hidden sm:inline">Completo</span>
        <span className="sm:hidden">C</span>
      </span>
    );
  }

  if (hasBase) {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-[8px] border border-[#e7e7ef] bg-white px-2.5 py-1 text-xs font-medium text-[#15171d]">
        <CheckCircle weight="bold" className="h-3 w-3" />
        <span className="hidden sm:inline">Base</span>
        <span className="sm:hidden">B</span>
      </span>
    );
  }

  if (additionalCount > 0) {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-[8px] border border-[#e7e7ef] bg-white px-2.5 py-1 text-xs font-medium text-[#15171d]">
        <Plus weight="bold" className="h-3 w-3" />
        <span className="hidden sm:inline">Adic. #{additionalCount}</span>
        <span className="sm:hidden">A{additionalCount}</span>
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-1.5 rounded-[8px] border border-[#e7e7ef] bg-white px-2.5 py-1 text-xs font-medium text-[#15171d]">
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
    <span className="inline-flex items-center gap-1.5 rounded-[8px] border border-[#e7e7ef] bg-white px-2.5 py-1 text-xs font-medium text-[#15171d]">
      <Icon weight="bold" className="h-3.5 w-3.5" />
      <span className="hidden sm:inline">{config.label}</span>
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

  return (
    <div className={COMPONENT_STYLES.table.container}>
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
          <tbody className="bg-white">
            {isLoading ? (
              <tr>
                <td colSpan={7} className="px-6 py-12 text-center">
                  <div className="flex flex-col items-center gap-3">
                    <SpinnerGap weight="bold" className="h-8 w-8 animate-spin text-zinc-400" />
                    <span className="text-sm font-medium text-zinc-500">Renderizando matriz Tufte-Style...</span>
                  </div>
                </td>
              </tr>
            ) : vales.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-6 py-16 text-center">
                  <Receipt weight="duotone" className="mx-auto h-12 w-12 text-zinc-200 mb-4" />
                  <p className="text-base font-black tracking-tight text-zinc-900">Cuadrícula vacía</p>
                  <p className="mt-1 text-sm text-zinc-500">
                    Seleccione filtros o inyecte un nuevo vale
                  </p>
                </td>
              </tr>
            ) : (
              vales.map((vale) => (
                <tr
                  key={vale.id}
                  className={COMPONENT_STYLES.table.row}
                >
                  {/* Numero */}
                  <td className={COMPONENT_STYLES.table.cell}>
                    <span className="font-black tracking-tight text-zinc-900">{vale.numero}</span>
                  </td>

                  {/* Centro de Acopio */}
                  <td className={COMPONENT_STYLES.table.cell}>
                    <div>
                      <div className="font-bold text-zinc-900 truncate max-w-[200px] text-xs">
                        {vale.centroAcopio.nombre}
                      </div>
                      <div className="text-[0.65rem] font-semibold text-zinc-400 uppercase tracking-wider mt-0.5">
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
                      <span className="text-[0.65rem] font-semibold text-zinc-500 uppercase tracking-widest">
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
                    <span className="text-[0.75rem] font-semibold text-zinc-600 tabular-nums">
                      {new Date(vale.fechaGeneracion).toLocaleDateString('es-PE', {
                        day: '2-digit',
                        month: '2-digit',
                        year: 'numeric',
                      })}
                    </span>
                  </td>

                  {/* Acciones */}
                  <td className={`${COMPONENT_STYLES.table.cell} text-center`}>
                    <div className="flex items-center justify-center gap-1.5 opacity-60 hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => onVerDetalle(vale)}
                        className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-transparent text-zinc-500 hover:bg-zinc-100 hover:text-zinc-900 transition-colors"
                        title="Ver detalle"
                        disabled={isProcessing}
                      >
                        <Eye weight="bold" className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => onExportar(vale)}
                        className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-transparent text-zinc-500 hover:bg-zinc-100 hover:text-zinc-900 transition-colors"
                        title="Exportar"
                        disabled={isProcessing}
                      >
                        <Download weight="bold" className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => onRevertir(vale)}
                        className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-transparent text-zinc-500 hover:bg-rose-50 hover:text-rose-600 transition-colors"
                        title="Revertir"
                        disabled={isProcessing}
                      >
                        <ArrowCounterClockwise weight="bold" className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
});

ValesTabla.displayName = 'ValesTabla';
