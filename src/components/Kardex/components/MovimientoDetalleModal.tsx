import React, { memo, useEffect, useMemo, useState } from 'react';
import { ArrowsLeftRight, Clipboard, MapPin, Package, Shield, User } from '@phosphor-icons/react';
import {
  KeyValueGrid,
} from '../../Inventario/components/SharedComponents';
import { SideSheet } from '../../ui/ModalElements';
import { DeliveryBreakdown, KardexService } from '../../../services/KardexService';
import { Establecimiento } from '../../../types';
import { COMPONENT_STYLES, getMovimientoConfig } from '../constants';

import type { KardexMovimientoUI } from '../types';
type KardexMovimiento = KardexMovimientoUI;

interface MovimientoDetalleModalProps {
  isOpen: boolean;
  onClose: () => void;
  movimiento: KardexMovimiento | null;
  establecimientos: Establecimiento[];
}

const formatDateTime = (value: string | Date) => {
  const date = value instanceof Date ? value : new Date(value);

  return {
    full: date.toLocaleDateString('es-PE', {
      weekday: 'long',
      day: '2-digit',
      month: 'long',
      year: 'numeric',
    }),
    time: date.toLocaleTimeString('es-PE', {
      hour: '2-digit',
      minute: '2-digit',
    }),
  };
};

const formatDate = (value?: string | Date | null) => {
  if (!value) return 'Sin dato';

  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return 'Sin dato';

  return date.toLocaleDateString('es-PE', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
};

const SectionCard: React.FC<{
  title: string;
  icon: React.ElementType;
  children: React.ReactNode;
}> = ({ title, icon: Icon, children }) => (
  <section className="mt-8 border-t border-zinc-100 pt-6 last:mb-0">
    <header className="mb-4 flex items-center gap-2">
      <Icon className="h-5 w-5 text-zinc-400" />
      <h3 className="text-sm font-semibold text-zinc-900">{title}</h3>
    </header>
    {children}
  </section>
);

const MovimientoDetalleModalComponent: React.FC<MovimientoDetalleModalProps> = ({
  isOpen,
  onClose,
  movimiento,
  establecimientos,
}) => {
  const [deliveryBreakdown, setDeliveryBreakdown] = useState<DeliveryBreakdown | null>(null);
  const [loadingDelivery, setLoadingDelivery] = useState(false);

  useEffect(() => {
    if (!isOpen) {
      return undefined;
    }

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    document.addEventListener('keydown', handleEscape);

    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen, onClose]);

  useEffect(() => {
    const loadDeliveryBreakdown = async () => {
      if (!movimiento || movimiento.tipoMovimiento !== 'salida' || !movimiento.numeroDocumento) {
        setDeliveryBreakdown(null);
        return;
      }

      setLoadingDelivery(true);

      try {
        const breakdown = await KardexService.getDeliveryBreakdown(movimiento.numeroDocumento);
        setDeliveryBreakdown(breakdown);
      } catch {
        setDeliveryBreakdown(null);
      } finally {
        setLoadingDelivery(false);
      }
    };

    if (isOpen) {
      void loadDeliveryBreakdown();
    }
  }, [isOpen, movimiento]);

  const establecimientosMap = useMemo(
    () => new Map(establecimientos.map((establecimiento) => [establecimiento.id, establecimiento.nombre])),
    [establecimientos],
  );

  if (!isOpen || !movimiento) {
    return null;
  }

  const movementConfig = getMovimientoConfig(movimiento.tipoMovimiento);
  const fechaMovimiento = formatDateTime(movimiento.fechaMovimiento);
  const delta = movimiento.saldoActual - movimiento.saldoAnterior;
  const origen = movimiento.establecimientoOrigen?.nombre
    || (movimiento.establecimientoOrigenId
      ? establecimientosMap.get(movimiento.establecimientoOrigenId)
      : '')
    || 'Sin referencia';
  const destino = movimiento.establecimientoDestino?.nombre
    || (movimiento.establecimientoDestinoId
      ? establecimientosMap.get(movimiento.establecimientoDestinoId)
      : '')
    || 'Sin referencia';
  const usuario = movimiento.usuario
    ? `${movimiento.usuario.nombres} ${movimiento.usuario.apellidos}`.trim()
    : 'Sin referencia';

  return (
    <SideSheet
      isOpen={isOpen}
      onClose={onClose}
      title={movimiento.item?.nombre || 'Detalle de movimiento'}
      subtitle={`${movementConfig.label} · ${movimiento.documento} ${movimiento.numeroDocumento}`}
      icon={movementConfig.icon}
      footer={
        <div className="flex flex-col gap-2 sm:flex-row sm:justify-between">
          <span className="font-medium tabular-nums tracking-tight text-xs text-zinc-400">ID {movimiento.id.slice(0, 8)}...</span>
          <button type="button" onClick={onClose} className={COMPONENT_STYLES.button.primary}>
            Cerrar
          </button>
        </div>
      }
    >
      <div className="space-y-6">
        <div className="grid grid-cols-1 divide-y divide-zinc-100 rounded-lg border border-zinc-200 bg-white sm:grid-cols-3 sm:divide-x sm:divide-y-0">
          <div className="px-5 py-4 sm:p-5">
            <dt className="text-sm font-medium text-zinc-500">Cantidad</dt>
            <dd className={`mt-1 text-2xl font-semibold tracking-tight ${delta >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
              {delta >= 0 ? '+' : '-'}
              {Math.abs(delta).toLocaleString()}
            </dd>
          </div>
          <div className="px-5 py-4 sm:p-5">
            <dt className="text-sm font-medium text-zinc-500">Saldo final</dt>
            <dd className="mt-1 text-2xl font-semibold tracking-tight text-zinc-900">
              {movimiento.saldoActual.toLocaleString()}
            </dd>
          </div>
          <div className="px-5 py-4 sm:p-5">
            <dt className="text-sm font-medium text-zinc-500">Fecha / hora</dt>
            <dd className="mt-1 text-lg font-semibold tracking-tight text-zinc-900">{fechaMovimiento.time}</dd>
            <dd className="mt-0.5 text-xs text-zinc-500">{fechaMovimiento.full}</dd>
          </div>
        </div>

        <SectionCard title="Resumen del movimiento" icon={Shield}>
          <KeyValueGrid
            columns={2}
            items={[
              { label: 'Tipo de movimiento', value: <span className={movementConfig.badgeClassName}>{movementConfig.label}</span> },
              { label: 'Producto', value: <span className="font-medium">{movimiento.item?.nombre || 'Sin referencia'}</span> },
              { label: 'Naturaleza', value: <span className="capitalize">{movimiento.tipo}</span> },
              { label: 'Cantidad registrada', value: <span className="font-medium tabular-nums tracking-tight">{movimiento.cantidad.toLocaleString()}</span> },
            ]}
          />
        </SectionCard>

        <SectionCard title="Producto y lote" icon={Package}>
          <KeyValueGrid
            columns={2}
            items={[
              { label: 'Producto', value: <span className="font-medium">{movimiento.item?.nombre || 'Sin referencia'}</span> },
              { label: 'Lote', value: <span className="font-medium tabular-nums tracking-tight">{movimiento.lote?.numero || 'Sin lote'}</span> },
              { label: 'Vencimiento', value: <span>{formatDate(movimiento.lote?.fechaVencimiento)}</span> },
              { label: 'Saldo anterior', value: <span className="font-medium tabular-nums tracking-tight">{movimiento.saldoAnterior.toLocaleString()}</span> },
            ]}
          />
        </SectionCard>

        <SectionCard title="Documento y trazabilidad" icon={Clipboard}>
          <KeyValueGrid
            columns={2}
            items={[
              { label: 'Documento', value: <span className="font-medium">{movimiento.documento}</span> },
              { label: 'Número', value: <span className="font-medium tabular-nums tracking-tight">{movimiento.numeroDocumento}</span> },
              { label: 'Fecha', value: <span>{fechaMovimiento.full}</span> },
              { label: 'Hora', value: <span>{fechaMovimiento.time}</span> },
            ]}
          />
        </SectionCard>

        {(movimiento.establecimientoOrigenId || movimiento.establecimientoDestinoId) ? (
          <SectionCard title="Ubicaciones" icon={MapPin}>
            <KeyValueGrid
              columns={2}
              items={[
                { label: 'Origen', value: <span>{origen}</span> },
                { label: 'Destino', value: <span>{destino}</span> },
              ]}
            />
          </SectionCard>
        ) : null}

        {movimiento.tipoMovimiento === 'salida' ? (
          <SectionCard title="Distribución de entrega" icon={ArrowsLeftRight}>
            {loadingDelivery ? (
              <div className="rounded-lg border border-zinc-100 bg-zinc-50 px-4 py-5 text-sm text-zinc-500">
                Cargando distribución del vale...
              </div>
            ) : deliveryBreakdown ? (
              <div className="space-y-4">
                <KeyValueGrid
                  columns={3}
                  items={[
                    { label: 'Vale', value: <span className="font-medium tabular-nums tracking-tight">{deliveryBreakdown.numeroVale}</span> },
                    { label: 'Destinos', value: <span className="font-medium">{deliveryBreakdown.totalEstablecimientos}</span> },
                    { label: 'Total entregado', value: <span className="font-medium">{deliveryBreakdown.totalVacunas.toLocaleString()}</span> },
                  ]}
                />

                <div className="mt-4 overflow-hidden rounded-3xl border border-line bg-white">
                  <div className="overflow-x-auto">
                    <table className="min-w-full">
                      <thead className={COMPONENT_STYLES.table.header}>
                        <tr>
                          <th className={COMPONENT_STYLES.table.headerCell}>Establecimiento</th>
                          <th className={COMPONENT_STYLES.table.headerCell}>Código</th>
                          <th className={`${COMPONENT_STYLES.table.headerCell} text-right`}>Cantidad</th>
                          <th className={COMPONENT_STYLES.table.headerCell}>Tipo</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white">
                        {deliveryBreakdown.detalles.map((detalle) => (
                          <tr key={`${detalle.establecimientoId}-${detalle.vacunaId}-${detalle.cantidadEntregada}`} className={COMPONENT_STYLES.table.row}>
                            <td className={COMPONENT_STYLES.table.cell}>
                              <p className="text-sm font-medium text-zinc-900">{detalle.establecimientoNombre}</p>
                            </td>
                            <td className={COMPONENT_STYLES.table.cell}>
                              <p className="font-medium tabular-nums tracking-tight text-xs text-zinc-500">{detalle.establecimientoCodigo}</p>
                            </td>
                            <td className={`${COMPONENT_STYLES.table.cell} text-right`}>
                              <span className="font-medium tabular-nums tracking-tight text-sm font-semibold text-zinc-900">
                                {detalle.cantidadEntregada.toLocaleString()}
                              </span>
                            </td>
                            <td className={COMPONENT_STYLES.table.cell}>
                              {detalle.numeroEntregaAdicional ? (
                                <span className={COMPONENT_STYLES.badge.warning}>
                                  Adicional
                                </span>
                              ) : (
                                <span className={COMPONENT_STYLES.badge.active}>
                                  Programada
                                </span>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            ) : (
              <div className="rounded-lg border border-zinc-100 bg-zinc-50 px-4 py-5 text-sm text-zinc-500">
                No se encontró un desglose adicional para este movimiento.
              </div>
            )}
          </SectionCard>
        ) : null}

        <SectionCard title="Auditoría y observaciones" icon={User}>
          <KeyValueGrid
            columns={2}
            items={[
              { label: 'Registrado por', value: <span className="font-medium">{usuario}</span> },
              {
                label: 'Correo',
                value: <span>{movimiento.usuario?.email || 'Sin correo registrado'}</span>,
              },
            ]}
          />

          <div className="mt-6 rounded-lg border border-zinc-200 bg-zinc-50 p-4">
            <div className="mb-2 flex items-center gap-2 text-zinc-500">
              <span className="text-sm font-medium">Observaciones</span>
            </div>
            <p className="text-sm text-zinc-700">
              {movimiento.observaciones || 'Sin observaciones registradas para este movimiento.'}
            </p>
          </div>
        </SectionCard>
      </div>
    </SideSheet>
  );
};

export const MovimientoDetalleModal = memo(MovimientoDetalleModalComponent);
MovimientoDetalleModal.displayName = 'MovimientoDetalleModal';
 