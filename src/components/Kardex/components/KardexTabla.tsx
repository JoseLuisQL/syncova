import React, { memo, useMemo } from 'react';
import { BookOpenText, Clock, FileText } from '@phosphor-icons/react';
import {
  ActionButtons,
  EmptyState,
} from '../../Inventario/components/SharedComponents';
import {
  DataTable,
  TableCell,
  TableHeader,
  TableRow,
} from '../../Inventario/components/FilterAndTable';
import { Establecimiento, Jeringa, Vacuna } from '../../../types';
import { COMPONENT_STYLES, getMovimientoConfig } from '../constants';

interface KardexMovimiento {
  id: string;
  tipo: 'vacuna' | 'jeringa';
  itemId: string;
  loteId: string;
  tipoMovimiento: string;
  cantidad: number;
  saldoAnterior: number;
  saldoActual: number;
  fechaMovimiento: string | Date;
  documento: string;
  numeroDocumento: string;
  observaciones?: string;
  establecimientoOrigenId?: string;
  establecimientoDestinoId?: string;
  item?: { nombre: string; tipo?: string };
  lote?: { numero: string; fechaVencimiento?: string | Date | null };
  establecimientoOrigen?: { nombre: string };
  establecimientoDestino?: { nombre: string };
}

interface KardexTablaProps {
  movimientos: KardexMovimiento[];
  total: number;
  loading: boolean;
  vacunas: Vacuna[];
  jeringas: Jeringa[];
  establecimientos: Establecimiento[];
  onVerDetalle: (movimiento: KardexMovimiento) => void;
}

const TABLE_COLUMNS = [
  { key: 'fecha', label: 'Fecha / hora' },
  { key: 'movimiento', label: 'Movimiento' },
  { key: 'producto', label: 'Producto / lote' },
  { key: 'documento', label: 'Documento' },
  { key: 'entrada', label: 'Entrada', align: 'right' as const },
  { key: 'salida', label: 'Salida', align: 'right' as const },
  { key: 'saldo', label: 'Saldo', align: 'right' as const },
  { key: 'acciones', label: 'Acciones', align: 'right' as const },
] as const;

const formatDate = (value: string | Date) => {
  const date = value instanceof Date ? value : new Date(value);

  return {
    date: date.toLocaleDateString('es-PE', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    }),
    time: date.toLocaleTimeString('es-PE', {
      hour: '2-digit',
      minute: '2-digit',
    }),
  };
};

const formatShortDate = (value?: string | Date | null) => {
  if (!value) return 'Sin vencimiento';

  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return 'Sin vencimiento';

  return date.toLocaleDateString('es-PE', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
};

const KardexTablaComponent: React.FC<KardexTablaProps> = ({
  movimientos,
  total,
  loading,
  vacunas,
  jeringas,
  establecimientos,
  onVerDetalle,
}) => {
  const establecimientosMap = useMemo(
    () => new Map(establecimientos.map((establecimiento) => [establecimiento.id, establecimiento.nombre])),
    [establecimientos],
  );

  const getItemNombre = (movimiento: KardexMovimiento) => {
    if (movimiento.item?.nombre) {
      return movimiento.item.nombre;
    }

    if (movimiento.tipo === 'vacuna') {
      return vacunas.find((vacuna) => vacuna.id === movimiento.itemId)?.nombre || 'Producto sin referencia';
    }

    return jeringas.find((jeringa) => jeringa.id === movimiento.itemId)?.tipo || 'Producto sin referencia';
  };

  const getOrigenDestino = (movimiento: KardexMovimiento) => {
    const origen = movimiento.establecimientoOrigen?.nombre
      || (movimiento.establecimientoOrigenId
        ? establecimientosMap.get(movimiento.establecimientoOrigenId)
        : '');
    const destino = movimiento.establecimientoDestino?.nombre
      || (movimiento.establecimientoDestinoId
        ? establecimientosMap.get(movimiento.establecimientoDestinoId)
        : '');

    return { origen, destino };
  };

  const desktopTable = (
    <DataTable
      isLoading={loading}
      loadingMessage="Cargando movimientos del kardex..."
      skeletonRows={6}
      skeletonColumns={TABLE_COLUMNS.length}
      loadingVariant="table"
    >
      <table className="min-w-full">
        <TableHeader columns={TABLE_COLUMNS as unknown as Array<{ key: string; label: string; align?: 'left' | 'center' | 'right' }>} />
        <tbody className="bg-white">
          {movimientos.length === 0 ? (
            <tr>
              <td colSpan={TABLE_COLUMNS.length}>
                <EmptyState
                  icon={BookOpenText}
                  title="No se encontraron movimientos"
                  description="Pruebe otro rango de fechas o ajuste los filtros avanzados para ubicar un movimiento específico."
                />
              </td>
            </tr>
          ) : (
            movimientos.map((movimiento) => {
              const movementConfig = getMovimientoConfig(movimiento.tipoMovimiento);
              const Icon = movementConfig.icon;
              const date = formatDate(movimiento.fechaMovimiento);
              const delta = movimiento.saldoActual - movimiento.saldoAnterior;
              const entrada = delta > 0 ? delta : null;
              const salida = delta < 0 ? Math.abs(delta) : null;
              const itemNombre = getItemNombre(movimiento);
              const { origen, destino } = getOrigenDestino(movimiento);
              const loteNumero = movimiento.lote?.numero || 'Sin lote';
              const vencimiento = movimiento.lote?.fechaVencimiento
                ? formatShortDate(movimiento.lote.fechaVencimiento)
                : '';

              return (
                <TableRow key={movimiento.id}>
                  <TableCell>
                    <div className="space-y-1">
                      <p className="text-sm font-semibold text-zinc-900">{date.date}</p>
                      <p className="text-xs text-zinc-500">{date.time}</p>
                    </div>
                  </TableCell>

                  <TableCell>
                    <div className="space-y-2">
                      <span className={movementConfig.badgeClassName}>
                        <Icon className="h-3.5 w-3.5" />
                        <span>{movementConfig.label}</span>
                      </span>
                      <p className="text-xs uppercase tracking-[0.08em] text-zinc-400">{movimiento.tipo}</p>
                    </div>
                  </TableCell>

                  <TableCell>
                    <div className="max-w-[300px] space-y-1">
                      <p className="truncate text-sm font-semibold text-zinc-900">{itemNombre}</p>
                      <p className="truncate text-xs text-zinc-500">
                        Lote: <span className="font-medium text-zinc-700">{loteNumero}</span>
                        {vencimiento ? ` · Vence ${vencimiento}` : ''}
                      </p>
                      {origen || destino ? (
                        <p className="truncate text-xs text-zinc-400">
                          {origen ? `Origen: ${origen}` : 'Origen: sin referencia'}
                          {destino ? ` · Destino: ${destino}` : ''}
                        </p>
                      ) : null}
                    </div>
                  </TableCell>

                  <TableCell>
                    <div className="space-y-1">
                      <p className="text-sm font-semibold text-zinc-900">{movimiento.documento}</p>
                      <p className="font-medium tabular-nums tracking-tight text-xs text-zinc-500">{movimiento.numeroDocumento}</p>
                    </div>
                  </TableCell>

                  <TableCell align="right">
                    <span className="font-medium tabular-nums tracking-tight text-sm font-semibold text-emerald-700">
                      {entrada ? entrada.toLocaleString() : '—'}
                    </span>
                  </TableCell>

                  <TableCell align="right">
                    <span className="font-medium tabular-nums tracking-tight text-sm font-semibold text-rose-700">
                      {salida ? salida.toLocaleString() : '—'}
                    </span>
                  </TableCell>

                  <TableCell align="right">
                    <div className="space-y-1">
                      <p className="font-medium tabular-nums tracking-tight text-base font-semibold text-zinc-900">
                        {movimiento.saldoActual.toLocaleString()}
                      </p>
                      <p className="font-medium tabular-nums tracking-tight text-xs text-zinc-500">
                        antes {movimiento.saldoAnterior.toLocaleString()}
                      </p>
                    </div>
                  </TableCell>

                  <TableCell align="right">
                    <ActionButtons onView={() => onVerDetalle(movimiento)} />
                  </TableCell>
                </TableRow>
              );
            })
          )}
        </tbody>
      </table>
    </DataTable>
  );

  return (
    <section className="w-full">
      <div className="bg-white rounded-2xl border border-zinc-200/80 shadow-sm overflow-hidden">
        <div className="border-b border-zinc-100 flex flex-col gap-3 px-5 py-4 sm:flex-row sm:items-center sm:justify-between bg-zinc-50/50">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-teal-50 text-teal-600 shadow-sm ring-1 ring-teal-100/50">
              <FileText className="h-6 w-6" aria-hidden="true" weight="duotone" />
            </div>
            <div className="flex flex-col">
              <h2 className="text-[1.05rem] font-bold text-zinc-900 tracking-tight">Movimientos del kardex</h2>
              <p className="text-sm text-zinc-500 font-medium mt-0.5">
                {total.toLocaleString()} registros encontrados para auditoría y seguimiento.
              </p>
            </div>
          </div>
          <div className="inline-flex items-center gap-2 rounded-full border border-zinc-200/80 bg-white px-3 py-1.5 shadow-sm text-sm text-zinc-500">
            <Clock className="h-4 w-4 text-zinc-400" />
            <span className="font-medium">Vista compacta de saldos</span>
          </div>
        </div>

        <div className="hidden lg:block bg-white">{desktopTable}</div>

      <div className="space-y-3 p-4 lg:hidden">
        {loading ? (
          <DataTable isLoading loadingMessage="Cargando movimientos del kardex..." skeletonRows={4} loadingVariant="cards" />
        ) : movimientos.length === 0 ? (
          <div className={COMPONENT_STYLES.panel}>
            <EmptyState
              icon={BookOpenText}
              title="No se encontraron movimientos"
              description="Pruebe otro rango de fechas o ajuste los filtros avanzados para ubicar un movimiento específico."
            />
          </div>
        ) : (
          movimientos.map((movimiento) => {
            const movementConfig = getMovimientoConfig(movimiento.tipoMovimiento);
            const Icon = movementConfig.icon;
            const date = formatDate(movimiento.fechaMovimiento);
            const delta = movimiento.saldoActual - movimiento.saldoAnterior;
            const entrada = delta > 0 ? delta : null;
            const salida = delta < 0 ? Math.abs(delta) : null;
            const itemNombre = getItemNombre(movimiento);
            const { origen, destino } = getOrigenDestino(movimiento);

            return (
              <article key={movimiento.id} className={`${COMPONENT_STYLES.panel} p-4`}>
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-zinc-900">{itemNombre}</p>
                    <p className="mt-1 text-xs text-zinc-500">
                      {date.date} · {date.time}
                    </p>
                  </div>
                  <span className={movementConfig.badgeClassName}>
                    <Icon className="h-3.5 w-3.5" />
                    <span>{movementConfig.label}</span>
                  </span>
                </div>

                <div className="mt-3 space-y-1 text-sm text-zinc-600">
                  <p>
                    Documento: <span className="font-medium text-zinc-900">{movimiento.documento}</span>
                  </p>
                  <p className="font-medium tabular-nums tracking-tight text-xs text-zinc-500">{movimiento.numeroDocumento}</p>
                  <p>
                    Lote: <span className="font-medium text-zinc-900">{movimiento.lote?.numero || 'Sin lote'}</span>
                  </p>
                  {origen || destino ? (
                    <p className="text-xs text-zinc-500">
                      {origen ? `Origen ${origen}` : 'Origen sin referencia'}
                      {destino ? ` · Destino ${destino}` : ''}
                    </p>
                  ) : null}
                </div>

                <div className="mt-3 grid grid-cols-3 gap-2 text-sm">
                  <div className="rounded-none border border-zinc-200 bg-zinc-50/70 p-3">
                    <p className="text-xs uppercase tracking-[0.08em] text-zinc-500">Entrada</p>
                    <p className="mt-2 font-medium tabular-nums tracking-tight text-base font-semibold text-emerald-700">
                      {entrada ? entrada.toLocaleString() : '—'}
                    </p>
                  </div>
                  <div className="rounded-none border border-zinc-200 bg-zinc-50/70 p-3">
                    <p className="text-xs uppercase tracking-[0.08em] text-zinc-500">Salida</p>
                    <p className="mt-2 font-medium tabular-nums tracking-tight text-base font-semibold text-rose-700">
                      {salida ? salida.toLocaleString() : '—'}
                    </p>
                  </div>
                  <div className="rounded-none border border-zinc-200 bg-zinc-50/70 p-3">
                    <p className="text-xs uppercase tracking-[0.08em] text-zinc-500">Saldo</p>
                    <p className="mt-2 font-medium tabular-nums tracking-tight text-base font-semibold text-zinc-900">
                      {movimiento.saldoActual.toLocaleString()}
                    </p>
                  </div>
                </div>

                <div className="mt-4 flex justify-end">
                  <ActionButtons onView={() => onVerDetalle(movimiento)} />
                </div>
              </article>
            );
          })
        )}
        </div>
      </div>
    </section>
  );
};

export const KardexTabla = memo(KardexTablaComponent);
KardexTabla.displayName = 'KardexTabla';
 