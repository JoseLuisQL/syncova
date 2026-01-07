import React, { memo } from 'react';
import {
  Eye,
  Package,
  Loader2,
  ArrowUpCircle,
  ArrowDownCircle,
  ArrowRightLeft,
  Settings,
  Activity,
  FileText,
  Clock,
  Hash,
} from 'lucide-react';
import { Vacuna, Jeringa, Establecimiento } from '../../../types';
import { COMPONENT_STYLES } from '../constants';

interface KardexMovimiento {
  id: string;
  tipo: 'vacuna' | 'jeringa';
  itemId: string;
  loteId: string;
  tipoMovimiento: string;
  cantidad: number;
  saldoAnterior: number;
  saldoActual: number;
  fechaMovimiento: string;
  documento: string;
  numeroDocumento: string;
  item?: { nombre: string };
  lote?: { numero: string };
}

interface KardexTablaProps {
  movimientos: KardexMovimiento[];
  total: number;
  loading: boolean;
  vacunas: Vacuna[];
  jeringas: Jeringa[];
  establecimientos: Establecimiento[];
  onVerDetalle: (movimiento: KardexMovimiento) => void;
  filtrosActivos: boolean;
}

export const KardexTabla: React.FC<KardexTablaProps> = memo(({
  movimientos,
  total,
  loading,
  vacunas,
  jeringas,
  onVerDetalle,
}) => {
  const getItemNombre = (tipo: string, itemId: string) => {
    if (tipo === 'vacuna') {
      const vacuna = vacunas.find((v) => v.id === itemId);
      return vacuna?.nombre || 'Vacuna no encontrada';
    } else {
      const jeringa = jeringas.find((j) => j.id === itemId);
      return jeringa?.tipo || 'Jeringa no encontrada';
    }
  };

  const getTipoMovimientoConfig = (tipo: string) => {
    switch (tipo) {
      case 'ingreso':
        return {
          icon: ArrowUpCircle,
          className: COMPONENT_STYLES.badge.ingreso,
          label: 'Ingreso',
          iconColor: 'text-emerald-500'
        };
      case 'salida':
        return {
          icon: ArrowDownCircle,
          className: COMPONENT_STYLES.badge.salida,
          label: 'Salida',
          iconColor: 'text-rose-500'
        };
      case 'transferencia':
        return {
          icon: ArrowRightLeft,
          className: COMPONENT_STYLES.badge.transferencia,
          label: 'Transferencia',
          iconColor: 'text-cyan-500'
        };
      case 'ajuste':
        return {
          icon: Settings,
          className: COMPONENT_STYLES.badge.ajuste,
          label: 'Ajuste',
          iconColor: 'text-amber-500'
        };
      default:
        return {
          icon: Activity,
          className: COMPONENT_STYLES.badge.neutral,
          label: tipo.charAt(0).toUpperCase() + tipo.slice(1),
          iconColor: 'text-gray-500'
        };
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return {
      date: date.toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' }),
      time: date.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })
    };
  };

  return (
    <div className={COMPONENT_STYLES.table.wrapper}>
      {/* Header de tabla */}
      <div className="px-6 py-4 bg-gradient-to-r from-slate-50 to-gray-50 border-b border-gray-100">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-gradient-to-br from-teal-500 to-cyan-500 shadow-lg shadow-teal-500/20">
              <FileText className="h-4 w-4 text-white" />
            </div>
            <div>
              <h3 className="text-base font-bold text-gray-900">Movimientos del Kardex</h3>
              <p className="text-sm text-gray-500">
                <span className="font-semibold text-teal-600">{total.toLocaleString()}</span> registros encontrados
              </p>
            </div>
          </div>
          {loading && (
            <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-teal-50 text-teal-700">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span className="text-sm font-medium">Actualizando...</span>
            </div>
          )}
        </div>
      </div>

      {/* Tabla */}
      <div className={COMPONENT_STYLES.table.container}>
        <table className={COMPONENT_STYLES.table.base}>
          <thead className={COMPONENT_STYLES.table.header}>
            <tr>
              <th className={COMPONENT_STYLES.table.headerCell}>
                <div className="flex items-center gap-2">
                  <Clock className="h-3.5 w-3.5 text-gray-400" />
                  Fecha
                </div>
              </th>
              <th className={COMPONENT_STYLES.table.headerCell}>Tipo</th>
              <th className={COMPONENT_STYLES.table.headerCell}>
                <div className="flex items-center gap-2">
                  <Package className="h-3.5 w-3.5 text-gray-400" />
                  Producto / Lote
                </div>
              </th>
              <th className={COMPONENT_STYLES.table.headerCell}>
                <div className="flex items-center gap-2">
                  <Hash className="h-3.5 w-3.5 text-gray-400" />
                  Documento
                </div>
              </th>
              <th className={COMPONENT_STYLES.table.headerCellCenter}>Cantidad</th>
              <th className={COMPONENT_STYLES.table.headerCellCenter}>Saldo</th>
              <th className={COMPONENT_STYLES.table.headerCellCenter}>Acciones</th>
            </tr>
          </thead>
          <tbody className={COMPONENT_STYLES.table.body}>
            {loading ? (
              <tr>
                <td colSpan={7}>
                  <div className={COMPONENT_STYLES.empty.wrapper}>
                    <Loader2 className="mx-auto h-10 w-10 animate-spin text-teal-500" />
                    <p className="mt-4 text-sm font-medium text-gray-500">Cargando movimientos...</p>
                  </div>
                </td>
              </tr>
            ) : movimientos.length === 0 ? (
              <tr>
                <td colSpan={7}>
                  <div className={COMPONENT_STYLES.empty.wrapper}>
                    <div className="mx-auto w-20 h-20 rounded-full bg-gradient-to-br from-gray-100 to-gray-50 flex items-center justify-center">
                      <Package className="h-10 w-10 text-gray-300" />
                    </div>
                    <p className={COMPONENT_STYLES.empty.title}>No se encontraron movimientos</p>
                    <p className={COMPONENT_STYLES.empty.description}>
                      Ajusta los filtros o selecciona un período diferente
                    </p>
                  </div>
                </td>
              </tr>
            ) : (
              movimientos.map((movimiento, index) => {
                const tipoConfig = getTipoMovimientoConfig(movimiento.tipoMovimiento);
                const TipoIcon = tipoConfig.icon;
                const dateFormatted = formatDate(movimiento.fechaMovimiento);
                const isPositive = movimiento.cantidad > 0;

                return (
                  <tr
                    key={movimiento.id}
                    className={`${COMPONENT_STYLES.table.row} ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50/30'}`}
                  >
                    {/* Fecha */}
                    <td className={COMPONENT_STYLES.table.cell}>
                      <div className="flex flex-col">
                        <span className="text-sm font-semibold text-gray-900">{dateFormatted.date}</span>
                        <span className="text-xs text-gray-400 font-medium">{dateFormatted.time}</span>
                      </div>
                    </td>

                    {/* Tipo Movimiento */}
                    <td className={COMPONENT_STYLES.table.cell}>
                      <span className={`${COMPONENT_STYLES.badge.base} ${tipoConfig.className}`}>
                        <TipoIcon className="h-3.5 w-3.5" />
                        {tipoConfig.label}
                      </span>
                    </td>

                    {/* Producto / Lote */}
                    <td className={COMPONENT_STYLES.table.cellWrap}>
                      <div className="max-w-xs">
                        <p className="text-sm font-semibold text-gray-900 truncate">
                          {movimiento.item?.nombre || getItemNombre(movimiento.tipo, movimiento.itemId)}
                        </p>
                        <p className="text-xs text-gray-500 font-mono mt-0.5">
                          Lote: {movimiento.lote?.numero || 'N/A'}
                        </p>
                      </div>
                    </td>

                    {/* Documento */}
                    <td className={COMPONENT_STYLES.table.cell}>
                      <div>
                        <p className="text-sm font-medium text-gray-900">{movimiento.documento}</p>
                        <p className="text-xs text-gray-500 font-mono">{movimiento.numeroDocumento}</p>
                      </div>
                    </td>

                    {/* Cantidad */}
                    <td className={`${COMPONENT_STYLES.table.cell} text-center`}>
                      <span className={`inline-flex items-center justify-center min-w-[60px] px-3 py-1.5 rounded-lg text-sm font-bold ${
                        isPositive 
                          ? 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200' 
                          : 'bg-rose-50 text-rose-700 ring-1 ring-rose-200'
                      }`}>
                        {isPositive ? '+' : ''}{movimiento.cantidad.toLocaleString()}
                      </span>
                    </td>

                    {/* Saldo */}
                    <td className={`${COMPONENT_STYLES.table.cell} text-center`}>
                      <div className="inline-flex flex-col items-center gap-1">
                        <div className="flex items-center gap-2 text-xs text-gray-400">
                          <span>{movimiento.saldoAnterior.toLocaleString()}</span>
                          <span>→</span>
                        </div>
                        <span className="text-base font-bold text-teal-600">
                          {movimiento.saldoActual.toLocaleString()}
                        </span>
                      </div>
                    </td>

                    {/* Acciones */}
                    <td className={`${COMPONENT_STYLES.table.cell} text-center`}>
                      <button
                        onClick={() => onVerDetalle(movimiento)}
                        className={`${COMPONENT_STYLES.button.icon} ${COMPONENT_STYLES.button.iconPrimary}`}
                        title="Ver detalles del movimiento"
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
});

KardexTabla.displayName = 'KardexTabla';
