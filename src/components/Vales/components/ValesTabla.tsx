import React, { memo } from 'react';
import { Eye, Download, RotateCcw, Package, Loader2, Receipt, CheckCircle, Plus, Layers } from 'lucide-react';
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
      <span className="inline-flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-semibold bg-teal-100 text-teal-800 border border-teal-200">
        <Layers className="h-3 w-3" />
        <span className="hidden sm:inline">Completo</span>
        <span className="sm:hidden">C</span>
      </span>
    );
  }

  if (hasBase) {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-semibold bg-emerald-100 text-emerald-800 border border-emerald-200">
        <CheckCircle className="h-3 w-3" />
        <span className="hidden sm:inline">Base</span>
        <span className="sm:hidden">B</span>
      </span>
    );
  }

  if (additionalCount > 0) {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-semibold bg-amber-100 text-amber-800 border border-amber-200">
        <Plus className="h-3 w-3" />
        <span className="hidden sm:inline">Adicional #{additionalCount}</span>
        <span className="sm:hidden">A{additionalCount}</span>
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-semibold bg-gray-100 text-gray-600 border border-gray-200">
      <CheckCircle className="h-3 w-3" />
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
    <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${config.bg} ${config.text}`}>
      <Icon className="h-3 w-3" />
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
          <tbody className="divide-y divide-gray-100">
            {isLoading ? (
              <tr>
                <td colSpan={7} className="px-6 py-12 text-center">
                  <div className="flex flex-col items-center gap-3">
                    <Loader2 className="h-8 w-8 animate-spin text-teal-600" />
                    <span className="text-gray-500">Cargando vales...</span>
                  </div>
                </td>
              </tr>
            ) : vales.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-6 py-12 text-center">
                  <Receipt className={COMPONENT_STYLES.table.emptyIcon} />
                  <p className="font-medium text-gray-900">No hay vales para mostrar</p>
                  <p className="text-sm text-gray-500 mt-1">
                    Seleccione filtros o genere un nuevo vale
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
                    <span className="font-semibold text-gray-900">{vale.numero}</span>
                  </td>

                  {/* Centro de Acopio */}
                  <td className={COMPONENT_STYLES.table.cell}>
                    <div>
                      <div className="font-medium text-gray-900 truncate max-w-[200px]">
                        {vale.centroAcopio.nombre}
                      </div>
                      <div className="text-xs text-gray-500">
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
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-teal-100 text-teal-800 rounded text-xs font-medium">
                        <Package className="h-3 w-3" />
                        {vale.totalVacunas.toLocaleString()}
                      </span>
                      <span className="text-xs text-gray-500">
                        {vale.totalEstablecimientos} centros
                      </span>
                    </div>
                  </td>

                  {/* Estado */}
                  <td className={`${COMPONENT_STYLES.table.cell} text-center`}>
                    <EstadoBadge estado={vale.estado} />
                  </td>

                  {/* Fecha */}
                  <td className={`${COMPONENT_STYLES.table.cell} text-center`}>
                    <span className="text-sm text-gray-700">
                      {new Date(vale.fechaGeneracion).toLocaleDateString('es-PE', {
                        day: '2-digit',
                        month: '2-digit',
                        year: '2-digit',
                      })}
                    </span>
                  </td>

                  {/* Acciones */}
                  <td className={`${COMPONENT_STYLES.table.cell} text-center`}>
                    <div className="flex items-center justify-center gap-1">
                      <button
                        onClick={() => onVerDetalle(vale)}
                        className={`${COMPONENT_STYLES.button.icon} ${COMPONENT_STYLES.button.iconView}`}
                        title="Ver detalle"
                        disabled={isProcessing}
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => onExportar(vale)}
                        className={`${COMPONENT_STYLES.button.icon} text-emerald-600 bg-emerald-50 hover:bg-emerald-100`}
                        title="Exportar"
                        disabled={isProcessing}
                      >
                        <Download className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => onRevertir(vale)}
                        className={`${COMPONENT_STYLES.button.icon} text-amber-600 bg-amber-50 hover:bg-amber-100`}
                        title="Revertir"
                        disabled={isProcessing}
                      >
                        <RotateCcw className="h-4 w-4" />
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
