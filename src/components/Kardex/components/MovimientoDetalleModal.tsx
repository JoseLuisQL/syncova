import React, { memo, useEffect, useState } from 'react';
import {
  X,
  Calendar,
  Package,
  Hash,
  Building,
  User,
  FileText,
  ArrowUpCircle,
  ArrowDownCircle,
  ArrowRightLeft,
  Settings,
  Activity,
  Loader2,
  Shield,
  Syringe,
  CheckCircle,
  Plus,
  TrendingUp,
  TrendingDown,
  Clock,
  MapPin,
  Clipboard,
} from 'lucide-react';
import { KardexService, DeliveryBreakdown } from '../../../services/KardexService';
import { Establecimiento } from '../../../types';
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
  observaciones?: string;
  establecimientoOrigenId?: string;
  establecimientoDestinoId?: string;
  usuarioId: string;
  item?: { nombre: string };
  lote?: { numero: string; fechaVencimiento?: string };
  usuario?: { nombres: string; apellidos: string; email: string };
  establecimientoOrigen?: { nombre: string };
  establecimientoDestino?: { nombre: string };
}

interface MovimientoDetalleModalProps {
  isOpen: boolean;
  onClose: () => void;
  movimiento: KardexMovimiento | null;
  establecimientos: Establecimiento[];
}

export const MovimientoDetalleModal: React.FC<MovimientoDetalleModalProps> = memo(({
  isOpen,
  onClose,
  movimiento,
  establecimientos,
}) => {
  const [deliveryBreakdown, setDeliveryBreakdown] = useState<DeliveryBreakdown | null>(null);
  const [loadingDelivery, setLoadingDelivery] = useState(false);

  useEffect(() => {
    const handleEscKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscKey);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscKey);
      document.body.style.overflow = 'unset';
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

    if (isOpen && movimiento) {
      loadDeliveryBreakdown();
    }
  }, [isOpen, movimiento]);

  if (!isOpen || !movimiento) return null;

  const getTipoMovimientoConfig = (tipo: string) => {
    switch (tipo) {
      case 'ingreso':
        return { 
          icon: ArrowUpCircle, 
          color: 'text-emerald-600', 
          bg: 'bg-emerald-500',
          bgLight: 'bg-emerald-100',
          label: 'Ingreso',
          gradient: 'from-emerald-500 to-green-500'
        };
      case 'salida':
        return { 
          icon: ArrowDownCircle, 
          color: 'text-rose-600', 
          bg: 'bg-rose-500',
          bgLight: 'bg-rose-100',
          label: 'Salida',
          gradient: 'from-rose-500 to-red-500'
        };
      case 'transferencia':
        return { 
          icon: ArrowRightLeft, 
          color: 'text-cyan-600', 
          bg: 'bg-cyan-500',
          bgLight: 'bg-cyan-100',
          label: 'Transferencia',
          gradient: 'from-cyan-500 to-blue-500'
        };
      case 'ajuste':
        return { 
          icon: Settings, 
          color: 'text-amber-600', 
          bg: 'bg-amber-500',
          bgLight: 'bg-amber-100',
          label: 'Ajuste',
          gradient: 'from-amber-500 to-orange-500'
        };
      default:
        return { 
          icon: Activity, 
          color: 'text-gray-600', 
          bg: 'bg-gray-500',
          bgLight: 'bg-gray-100',
          label: tipo,
          gradient: 'from-gray-500 to-slate-500'
        };
    }
  };

  const getEstablecimientoNombre = (establecimientoId: string | undefined) => {
    if (!establecimientoId) return '-';
    const establecimiento = establecimientos.find((e) => e.id === establecimientoId);
    return establecimiento?.nombre || 'No encontrado';
  };

  const tipoConfig = getTipoMovimientoConfig(movimiento.tipoMovimiento);
  const TipoIcon = tipoConfig.icon;
  const diferencia = movimiento.saldoActual - movimiento.saldoAnterior;
  const isPositive = diferencia > 0;

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return {
      full: date.toLocaleDateString('es-ES', { 
        weekday: 'long', 
        day: 'numeric', 
        month: 'long', 
        year: 'numeric' 
      }),
      time: date.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })
    };
  };

  const movementDate = formatDate(movimiento.fechaMovimiento);

  return (
    <>
      {/* Backdrop */}
      <div
        className={COMPONENT_STYLES.modal.backdrop}
        onClick={onClose}
      />

      {/* Modal */}
      <div className={COMPONENT_STYLES.modal.wrapper}>
        <div 
          className={COMPONENT_STYLES.modal.container}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header con gradiente */}
          <div className={`bg-gradient-to-r ${tipoConfig.gradient} px-6 py-6`}>
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-2xl bg-white/20 backdrop-blur-sm">
                  <TipoIcon className="h-7 w-7 text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-white">Detalle del Movimiento</h2>
                  <div className="flex items-center gap-3 mt-1">
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-white/20 text-white backdrop-blur-sm">
                      {tipoConfig.label}
                    </span>
                    <span className="text-white/80 text-sm font-mono">{movimiento.numeroDocumento}</span>
                  </div>
                </div>
              </div>
              <button
                onClick={onClose}
                className={COMPONENT_STYLES.modal.closeButtonWhite}
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          </div>

          {/* Content */}
          <div className={COMPONENT_STYLES.modal.body}>
            <div className="space-y-5">
              {/* Cards de resumen superiores */}
              <div className="grid grid-cols-3 gap-4">
                {/* Cantidad */}
                <div className={`${COMPONENT_STYLES.stats.card} ${isPositive ? 'bg-gradient-to-br from-emerald-50 to-green-50 border-emerald-200' : 'bg-gradient-to-br from-rose-50 to-red-50 border-rose-200'}`}>
                  <div className="flex items-center gap-3">
                    <div className={`${COMPONENT_STYLES.stats.iconWrapper} ${isPositive ? 'bg-gradient-to-br from-emerald-500 to-green-500' : 'bg-gradient-to-br from-rose-500 to-red-500'}`}>
                      {isPositive ? <TrendingUp className="h-5 w-5 text-white" /> : <TrendingDown className="h-5 w-5 text-white" />}
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Cantidad</p>
                      <p className={`text-2xl font-bold ${isPositive ? 'text-emerald-700' : 'text-rose-700'}`}>
                        {isPositive ? '+' : ''}{movimiento.cantidad.toLocaleString()}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Saldo resultante */}
                <div className={`${COMPONENT_STYLES.stats.card} bg-gradient-to-br from-teal-50 to-cyan-50 border-teal-200`}>
                  <div className="flex items-center gap-3">
                    <div className={`${COMPONENT_STYLES.stats.iconWrapper} bg-gradient-to-br from-teal-500 to-cyan-500`}>
                      <Package className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Saldo Final</p>
                      <p className="text-2xl font-bold text-teal-700">{movimiento.saldoActual.toLocaleString()}</p>
                    </div>
                  </div>
                </div>

                {/* Fecha */}
                <div className={`${COMPONENT_STYLES.stats.card} bg-gradient-to-br from-purple-50 to-violet-50 border-purple-200`}>
                  <div className="flex items-center gap-3">
                    <div className={`${COMPONENT_STYLES.stats.iconWrapper} bg-gradient-to-br from-purple-500 to-violet-500`}>
                      <Clock className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Hora</p>
                      <p className="text-2xl font-bold text-purple-700">{movementDate.time}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Información del Producto */}
              <div className={COMPONENT_STYLES.section.wrapper}>
                <div className={COMPONENT_STYLES.section.header}>
                  <div className={`${COMPONENT_STYLES.section.iconWrapper} ${movimiento.tipo === 'vacuna' ? 'bg-emerald-100' : 'bg-purple-100'}`}>
                    {movimiento.tipo === 'vacuna' ? (
                      <Shield className="h-5 w-5 text-emerald-600" />
                    ) : (
                      <Syringe className="h-5 w-5 text-purple-600" />
                    )}
                  </div>
                  <h3 className={COMPONENT_STYLES.section.title}>Información del Producto</h3>
                </div>

                <div className={COMPONENT_STYLES.section.grid}>
                  <div className={COMPONENT_STYLES.section.row}>
                    <span className={COMPONENT_STYLES.section.label}>Tipo</span>
                    <span className={`${COMPONENT_STYLES.section.value} capitalize`}>{movimiento.tipo}</span>
                  </div>
                  <div className={COMPONENT_STYLES.section.row}>
                    <span className={COMPONENT_STYLES.section.label}>Nombre</span>
                    <span className={COMPONENT_STYLES.section.value}>{movimiento.item?.nombre || 'N/A'}</span>
                  </div>
                  <div className={COMPONENT_STYLES.section.row}>
                    <span className={COMPONENT_STYLES.section.label}>N° Lote</span>
                    <span className={`${COMPONENT_STYLES.section.value} font-mono`}>{movimiento.lote?.numero || 'N/A'}</span>
                  </div>
                  {movimiento.lote?.fechaVencimiento && (
                    <div className={COMPONENT_STYLES.section.row}>
                      <span className={COMPONENT_STYLES.section.label}>Vencimiento</span>
                      <span className={COMPONENT_STYLES.section.value}>
                        {new Date(movimiento.lote.fechaVencimiento).toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' })}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Balance de Stock */}
              <div className={COMPONENT_STYLES.section.wrapper}>
                <div className={COMPONENT_STYLES.section.header}>
                  <div className={`${COMPONENT_STYLES.section.iconWrapper} bg-amber-100`}>
                    <Hash className="h-5 w-5 text-amber-600" />
                  </div>
                  <h3 className={COMPONENT_STYLES.section.title}>Balance de Stock</h3>
                </div>

                <div className="flex items-center justify-center gap-6 py-4">
                  <div className="text-center">
                    <p className="text-xs font-semibold text-gray-400 uppercase mb-1">Antes</p>
                    <p className="text-2xl font-bold text-gray-600">{movimiento.saldoAnterior.toLocaleString()}</p>
                  </div>
                  <div className={`px-4 py-2 rounded-xl ${isPositive ? 'bg-emerald-100' : 'bg-rose-100'}`}>
                    <p className={`text-lg font-bold ${isPositive ? 'text-emerald-600' : 'text-rose-600'}`}>
                      {isPositive ? '+' : ''}{diferencia.toLocaleString()}
                    </p>
                  </div>
                  <div className="text-center">
                    <p className="text-xs font-semibold text-gray-400 uppercase mb-1">Después</p>
                    <p className="text-2xl font-bold text-teal-600">{movimiento.saldoActual.toLocaleString()}</p>
                  </div>
                </div>
              </div>

              {/* Documento */}
              <div className={COMPONENT_STYLES.section.wrapper}>
                <div className={COMPONENT_STYLES.section.header}>
                  <div className={`${COMPONENT_STYLES.section.iconWrapper} bg-blue-100`}>
                    <Clipboard className="h-5 w-5 text-blue-600" />
                  </div>
                  <h3 className={COMPONENT_STYLES.section.title}>Información del Documento</h3>
                </div>

                <div className={COMPONENT_STYLES.section.grid}>
                  <div className={COMPONENT_STYLES.section.row}>
                    <span className={COMPONENT_STYLES.section.label}>Tipo Documento</span>
                    <span className={COMPONENT_STYLES.section.value}>{movimiento.documento}</span>
                  </div>
                  <div className={COMPONENT_STYLES.section.row}>
                    <span className={COMPONENT_STYLES.section.label}>Número</span>
                    <span className={`${COMPONENT_STYLES.section.value} font-mono`}>{movimiento.numeroDocumento}</span>
                  </div>
                  <div className="col-span-2">
                    <div className={COMPONENT_STYLES.section.row}>
                      <span className={COMPONENT_STYLES.section.label}>Fecha y Hora</span>
                      <span className={COMPONENT_STYLES.section.value}>{movementDate.full} - {movementDate.time}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Ubicaciones (si aplica) */}
              {(movimiento.establecimientoOrigenId || movimiento.establecimientoDestinoId) && (
                <div className={COMPONENT_STYLES.section.wrapper}>
                  <div className={COMPONENT_STYLES.section.header}>
                    <div className={`${COMPONENT_STYLES.section.iconWrapper} bg-indigo-100`}>
                      <MapPin className="h-5 w-5 text-indigo-600" />
                    </div>
                    <h3 className={COMPONENT_STYLES.section.title}>Ubicaciones</h3>
                  </div>

                  <div className="space-y-3">
                    {movimiento.establecimientoOrigenId && (
                      <div className={COMPONENT_STYLES.section.row}>
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 rounded-full bg-rose-500"></div>
                          <span className={COMPONENT_STYLES.section.label}>Origen</span>
                        </div>
                        <span className={COMPONENT_STYLES.section.value}>
                          {movimiento.establecimientoOrigen?.nombre || getEstablecimientoNombre(movimiento.establecimientoOrigenId)}
                        </span>
                      </div>
                    )}
                    {movimiento.establecimientoDestinoId && (
                      <div className={COMPONENT_STYLES.section.row}>
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
                          <span className={COMPONENT_STYLES.section.label}>Destino</span>
                        </div>
                        <span className={COMPONENT_STYLES.section.value}>
                          {movimiento.establecimientoDestino?.nombre || getEstablecimientoNombre(movimiento.establecimientoDestinoId)}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Detalles de Entrega (solo para salidas) */}
              {movimiento.tipoMovimiento === 'salida' && (
                <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-xl p-5 border border-amber-200">
                  <div className={COMPONENT_STYLES.section.header}>
                    <div className={`${COMPONENT_STYLES.section.iconWrapper} bg-amber-200`}>
                      <Building className="h-5 w-5 text-amber-700" />
                    </div>
                    <h3 className={COMPONENT_STYLES.section.title}>Distribución de Entrega</h3>
                    {loadingDelivery && <Loader2 className="h-4 w-4 animate-spin text-amber-600 ml-2" />}
                  </div>

                  {loadingDelivery ? (
                    <div className="flex items-center justify-center py-8">
                      <Loader2 className="h-6 w-6 animate-spin text-amber-500 mr-3" />
                      <span className="text-sm text-gray-600">Cargando distribución...</span>
                    </div>
                  ) : deliveryBreakdown ? (
                    <div className="space-y-4 mt-4">
                      {/* Resumen */}
                      <div className="grid grid-cols-3 gap-3">
                        <div className="bg-white rounded-lg p-3 border border-amber-100 text-center">
                          <p className="text-xs font-semibold text-gray-500">Vale</p>
                          <p className="text-sm font-mono font-bold text-gray-900">{deliveryBreakdown.numeroVale}</p>
                        </div>
                        <div className="bg-white rounded-lg p-3 border border-amber-100 text-center">
                          <p className="text-xs font-semibold text-gray-500">Destinos</p>
                          <p className="text-xl font-bold text-amber-600">{deliveryBreakdown.totalEstablecimientos}</p>
                        </div>
                        <div className="bg-white rounded-lg p-3 border border-amber-100 text-center">
                          <p className="text-xs font-semibold text-gray-500">Total</p>
                          <p className="text-xl font-bold text-emerald-600">{deliveryBreakdown.totalVacunas.toLocaleString()}</p>
                        </div>
                      </div>

                      {/* Tabla de distribución */}
                      {deliveryBreakdown.detalles.length > 0 && (
                        <div className="bg-white rounded-xl border border-amber-100 overflow-hidden">
                          <table className="min-w-full">
                            <thead className="bg-amber-50">
                              <tr>
                                <th className="px-4 py-2.5 text-left text-xs font-bold text-gray-600 uppercase">Establecimiento</th>
                                <th className="px-4 py-2.5 text-right text-xs font-bold text-gray-600 uppercase">Cantidad</th>
                                <th className="px-4 py-2.5 text-center text-xs font-bold text-gray-600 uppercase">Tipo</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-amber-50">
                              {deliveryBreakdown.detalles.slice(0, 5).map((detalle, index) => (
                                <tr key={index} className="hover:bg-amber-50/50">
                                  <td className="px-4 py-3">
                                    <p className="text-sm font-medium text-gray-900">{detalle.establecimientoNombre}</p>
                                    <p className="text-xs text-gray-500 font-mono">{detalle.establecimientoCodigo}</p>
                                  </td>
                                  <td className="px-4 py-3 text-right">
                                    <span className="text-sm font-bold text-gray-900">{detalle.cantidadEntregada.toLocaleString()}</span>
                                  </td>
                                  <td className="px-4 py-3 text-center">
                                    {detalle.numeroEntregaAdicional ? (
                                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-100 text-amber-700">
                                        <Plus className="h-3 w-3" />
                                        Adicional
                                      </span>
                                    ) : (
                                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-700">
                                        <CheckCircle className="h-3 w-3" />
                                        Programada
                                      </span>
                                    )}
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                          {deliveryBreakdown.detalles.length > 5 && (
                            <div className="px-4 py-2.5 bg-amber-50 text-center">
                              <span className="text-xs font-medium text-amber-700">
                                +{deliveryBreakdown.detalles.length - 5} establecimientos adicionales
                              </span>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  ) : (
                    <p className="text-sm text-gray-500 text-center py-6">
                      No hay información de distribución disponible
                    </p>
                  )}
                </div>
              )}

              {/* Información de Auditoría */}
              <div className={COMPONENT_STYLES.section.wrapper}>
                <div className={COMPONENT_STYLES.section.header}>
                  <div className={`${COMPONENT_STYLES.section.iconWrapper} bg-gray-200`}>
                    <User className="h-5 w-5 text-gray-600" />
                  </div>
                  <h3 className={COMPONENT_STYLES.section.title}>Registrado por</h3>
                </div>

                <div className={COMPONENT_STYLES.section.grid}>
                  <div className={COMPONENT_STYLES.section.row}>
                    <span className={COMPONENT_STYLES.section.label}>Usuario</span>
                    <span className={COMPONENT_STYLES.section.value}>
                      {movimiento.usuario ? `${movimiento.usuario.nombres} ${movimiento.usuario.apellidos}` : 'N/A'}
                    </span>
                  </div>
                  <div className={COMPONENT_STYLES.section.row}>
                    <span className={COMPONENT_STYLES.section.label}>Email</span>
                    <span className={`${COMPONENT_STYLES.section.value} text-gray-600`}>
                      {movimiento.usuario?.email || 'N/A'}
                    </span>
                  </div>
                </div>

                {movimiento.observaciones && (
                  <div className="mt-4 p-4 bg-white rounded-lg border border-gray-100">
                    <div className="flex items-start gap-2">
                      <FileText className="h-4 w-4 text-gray-400 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="text-xs font-semibold text-gray-500 uppercase mb-1">Observaciones</p>
                        <p className="text-sm text-gray-700">{movimiento.observaciones}</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className={COMPONENT_STYLES.modal.footer}>
            <div className="flex items-center justify-between w-full">
              <span className="text-xs text-gray-400 font-mono">ID: {movimiento.id.slice(0, 8)}...</span>
              <button
                onClick={onClose}
                className={COMPONENT_STYLES.button.primary}
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
});

MovimientoDetalleModal.displayName = 'MovimientoDetalleModal';
