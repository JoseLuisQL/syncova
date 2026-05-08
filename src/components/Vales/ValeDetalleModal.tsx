import React, { useState, useEffect, useMemo, memo } from 'react';
import {
  FileText, Buildings, Package, CalendarBlank, User,
  ArrowCounterClockwise, CheckCircle, Clock, SpinnerGap, FileXls, Syringe, Warning
} from '@phosphor-icons/react';
import { ValeEntrega, ValeDetalle } from '../../services/valesService';
import { useVales } from '../../hooks/useVales';
import { useToastContext } from '../../contexts/ToastContext';
import { ConfiguracionJeringasService, JeringaCalculada } from '../../services/configuracionJeringasService';
import ValeExportModal from './ValeExportModal';
import { MESES } from './constants';
import { Modal } from '../ui/ModalElements';

interface ValeDetalleModalProps {
  vale: ValeEntrega;
  isOpen: boolean;
  onClose: () => void;
}

interface EstablecimientoDetalle {
  establecimiento: {
    id: string;
    nombre: string;
    codigo: string;
  };
  vacunas: {
    [vacunaId: string]: {
      vacuna: {
        id: string;
        nombre: string;
        presentacion: string;
        dosisPorFrasco: number;
      };
      cantidadTotal: number;
      cantidadProgramada: number;
      cantidadAdicional: number;
      entregas: ValeDetalle[];
    };
  };
}

interface ConsolidadoVacuna {
  vacuna: {
    id: string;
    nombre: string;
    presentacion: string;
    dosisPorFrasco: number;
  };
  cantidadTotal: number;
}

// Badge de estado
const EstadoBadge = memo<{ estado: string }>(({ estado }) => {
  const config = {
    generado: { bg: 'bg-cyan-100', text: 'text-cyan-800', icon: Clock },
    impreso: { bg: 'bg-amber-100', text: 'text-amber-800', icon: FileText },
    entregado: { bg: 'bg-emerald-100', text: 'text-emerald-800', icon: CheckCircle },
  }[estado] || { bg: 'bg-gray-100', text: 'text-gray-800', icon: Clock };

  const Icon = config.icon;

  return (
    <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold ${config.bg} ${config.text}`}>
      <Icon className="h-3.5 w-3.5" />
      <span className="capitalize">{estado}</span>
    </span>
  );
});

EstadoBadge.displayName = 'EstadoBadge';

// Tarjeta de información
const InfoCard = memo<{ icon: React.ElementType; label: string; value: string; subvalue?: string }>(
  ({ icon: Icon, label, value, subvalue }) => (
    <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm">
      <div className="flex items-center gap-2 text-gray-500 text-sm mb-1">
        <Icon className="h-4 w-4" />
        <span>{label}</span>
      </div>
      <p className="text-lg font-bold text-gray-900 truncate">{value}</p>
      {subvalue && <p className="text-xs text-gray-500 mt-0.5">{subvalue}</p>}
    </div>
  )
);

InfoCard.displayName = 'InfoCard';

const ValeDetalleModal: React.FC<ValeDetalleModalProps> = ({
  vale,
  isOpen,
  onClose
}) => {
  const { toast } = useToastContext();
  const { isReverting, revertirVale } = useVales();

  const [showExportModal, setShowExportModal] = useState(false);
  const [configuracionJeringas, setConfiguracionJeringas] = useState<{ [vacunaId: string]: JeringaCalculada[] }>({});
  const [isLoadingJeringas, setIsLoadingJeringas] = useState(false);
  const [activeTab, setActiveTab] = useState<'consolidado' | 'detalle'>('consolidado');

  // Cargar configuración de jeringas
  useEffect(() => {
    if (!isOpen || !vale?.detalles) return;

    const cargarJeringas = async () => {
      setIsLoadingJeringas(true);
      try {
        const vacunasMap = new Map<string, number>();
        vale.detalles.forEach(detalle => {
          const vacunaId = detalle.vacunaId;
          const cantidad = (Number(detalle.cantidadProgramada) || 0) + (Number(detalle.cantidadAdicional) || 0);
          vacunasMap.set(vacunaId, (vacunasMap.get(vacunaId) || 0) + cantidad);
        });

        const vacunas = Array.from(vacunasMap.entries()).map(([vacunaId, cantidad]) => ({
          vacunaId,
          cantidad
        }));

        const result = await ConfiguracionJeringasService.obtenerConfiguracionConsolidada(
          vacunas,
          vale.centroAcopioId
        );

        if (result.success && result.data) {
          setConfiguracionJeringas(result.data);
        }
      } catch {
        setConfiguracionJeringas({});
      } finally {
        setIsLoadingJeringas(false);
      }
    };

    cargarJeringas();
  }, [isOpen, vale]);

  // Procesar detalles del vale
  const establecimientosDetalle = useMemo((): EstablecimientoDetalle[] => {
    if (!vale?.detalles?.length) return [];

    const map: { [key: string]: EstablecimientoDetalle } = {};

    vale.detalles.forEach(detalle => {
      const estId = detalle.establecimientoId;
      const vacId = detalle.vacunaId;

      if (!map[estId]) {
        map[estId] = { establecimiento: detalle.establecimiento, vacunas: {} };
      }

      if (!map[estId].vacunas[vacId]) {
        map[estId].vacunas[vacId] = {
          vacuna: detalle.vacuna,
          cantidadTotal: 0,
          cantidadProgramada: 0,
          cantidadAdicional: 0,
          entregas: []
        };
      }

      const cantProg = Number(detalle.cantidadProgramada) || 0;
      const cantAdic = Number(detalle.cantidadAdicional) || 0;

      map[estId].vacunas[vacId].cantidadTotal += cantProg + cantAdic;
      map[estId].vacunas[vacId].cantidadProgramada += cantProg;
      map[estId].vacunas[vacId].cantidadAdicional += cantAdic;
      map[estId].vacunas[vacId].entregas.push(detalle);
    });

    return Object.values(map).sort((a, b) =>
      a.establecimiento.nombre.localeCompare(b.establecimiento.nombre)
    );
  }, [vale?.detalles]);

  // Consolidado de vacunas
  const consolidadoVacunas = useMemo((): ConsolidadoVacuna[] => {
    if (!vale?.detalles?.length) return [];

    const map: { [key: string]: ConsolidadoVacuna } = {};

    vale.detalles.forEach(detalle => {
      const vacId = detalle.vacunaId;
      if (!map[vacId]) {
        map[vacId] = { vacuna: detalle.vacuna, cantidadTotal: 0 };
      }
      const cantProg = Number(detalle.cantidadProgramada) || 0;
      const cantAdic = Number(detalle.cantidadAdicional) || 0;
      map[vacId].cantidadTotal += cantProg + cantAdic;
    });

    return Object.values(map).sort((a, b) => a.vacuna.nombre.localeCompare(b.vacuna.nombre));
  }, [vale?.detalles]);

  // Consolidado de jeringas
  const consolidadoJeringas = useMemo(() => {
    const map: { [id: string]: { tipo: string; capacidad: string; cantidad: number } } = {};

    establecimientosDetalle.forEach(est => {
      Object.entries(est.vacunas).forEach(([vacId, vac]) => {
        const configs = configuracionJeringas[vacId] || [];
        configs.forEach(config => {
          if (config.jeringa) {
            const id = config.jeringa.id;
            if (!map[id]) {
              map[id] = { tipo: config.jeringa.tipo, capacidad: config.jeringa.capacidad, cantidad: 0 };
            }
            map[id].cantidad += Math.ceil(vac.cantidadTotal * config.multiplicador);
          }
        });
      });
    });

    return Object.values(map).sort((a, b) => a.tipo.localeCompare(b.tipo));
  }, [establecimientosDetalle, configuracionJeringas]);

  // Handlers
  const handleRevertir = async () => {
    if (!confirm(`¿Revertir el vale ${vale.numero} a pendiente? Los stocks serán restaurados.`)) return;
    try {
      const success = await revertirVale(vale.id);
      if (success) {
        toast.success('Vale revertido', `Vale ${vale.numero} revertido correctamente.`);
        onClose();
      }
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : 'Error desconocido';
      toast.error('Error', msg);
    }
  };

  const formatNumber = (val: number) => val.toLocaleString('es-PE');

  if (!isOpen || !vale) return null;

  return (
    <>
      <Modal
        isOpen={isOpen}
        onClose={onClose}
        title={`Vale de Entrega N° ${vale.numero}`}
        subtitle={`Generado el ${new Date(vale.fechaGeneracion).toLocaleDateString('es-PE')}`}
        icon={FileText}
        size="xl"
        footer={
          <div className="flex w-full items-center justify-between">
            <div className="text-sm text-zinc-500">
              Generado: {new Date(vale.fechaGeneracion).toLocaleString('es-PE')}
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={handleRevertir}
                disabled={isReverting}
                className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-amber-700 bg-amber-100 hover:bg-amber-200 rounded-lg transition-colors disabled:opacity-50"
              >
                {isReverting ? <SpinnerGap weight="bold" className="h-4 w-4 animate-spin" /> : <ArrowCounterClockwise weight="bold" className="h-4 w-4" />}
                Revertir
              </button>
              <button
                onClick={() => setShowExportModal(true)}
                className="flex items-center gap-2 px-5 py-2 text-sm font-medium text-white bg-zinc-900 border border-zinc-800 hover:bg-zinc-800 rounded-lg shadow-md transition-all"
              >
                <FileXls className="h-4 w-4" />
                Exportar
              </button>
            </div>
          </div>
        }
      >
        <div className="space-y-6">
          <div className="flex items-center gap-2 px-1">
            <EstadoBadge estado={vale.estado} />
          </div>
          {/* Info Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <InfoCard icon={Buildings} label="Centro de Acopio" value={vale.centroAcopio.nombre} subvalue={`Código: ${vale.centroAcopio.codigo}`} />
            <InfoCard icon={User} label="Responsable" value={`${vale.usuario.nombres} ${vale.usuario.apellidos}`} />
            <InfoCard icon={CalendarBlank} label="Período" value={`${MESES[vale.mes - 1]} ${vale.anio}`} subvalue={new Date(vale.fechaGeneracion).toLocaleDateString('es-PE')} />
            <InfoCard icon={Package} label="Total Vacunas" value={formatNumber(vale.totalVacunas)} subvalue={`${vale.totalEstablecimientos} organiz.`} />
          </div>

          <div className="bg-zinc-50 border border-zinc-200 rounded-xl overflow-hidden p-1">
             {/* Tabs */}
             <div className="flex gap-1 border-b border-zinc-200 p-1">
               {[
                 { id: 'consolidado', label: 'Consolidado', icon: Package },
                 { id: 'detalle', label: 'Por Establecimiento', icon: Buildings },
               ].map(tab => (
                 <button
                   key={tab.id}
                   onClick={() => setActiveTab(tab.id as 'consolidado' | 'detalle')}
                   className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium rounded-lg transition-colors ${
                     activeTab === tab.id
                       ? 'bg-white text-zinc-900 shadow border border-zinc-200'
                       : 'text-zinc-500 hover:text-zinc-700 hover:bg-zinc-100'
                   }`}
                 >
                   <tab.icon className="h-4 w-4" />
                   {tab.label}
                 </button>
               ))}
             </div>

             {/* Content view */}
             <div className="p-4 bg-white">
                {!vale.detalles?.length ? (
                  <div className="flex flex-col items-center justify-center py-12 text-zinc-500">
                    <SpinnerGap weight="bold" className="h-8 w-8 animate-spin mb-3" />
                    <p>Cargando detalles...</p>
                  </div>
                ) : activeTab === 'consolidado' ? (
                  <div className="space-y-6">
                    {/* Tabla Vacunas */}
                    <div>
                      <h3 className="flex items-center gap-2 text-sm font-semibold text-zinc-700 mb-3">
                        <Package className="h-4 w-4 text-zinc-600" />
                        Biológicos
                      </h3>
                      <div className="overflow-hidden rounded-[18px] border border-[#e7e7ef] bg-white">
                        <table className="w-full text-sm">
                          <thead className="bg-[#fbfafd]">
                            <tr>
                              <th className="w-12 px-4 py-3 text-left text-[0.78rem] font-medium tracking-[-0.01em] text-[#8b8f9b]">#</th>
                              <th className="px-4 py-3 text-left text-[0.78rem] font-medium tracking-[-0.01em] text-[#8b8f9b]">Vacuna</th>
                              <th className="w-28 px-4 py-3 text-center text-[0.78rem] font-medium tracking-[-0.01em] text-[#8b8f9b]">Cantidad</th>
                              <th className="px-4 py-3 text-left text-[0.78rem] font-medium tracking-[-0.01em] text-[#8b8f9b]">Presentación</th>
                              <th className="w-24 px-4 py-3 text-center text-[0.78rem] font-medium tracking-[-0.01em] text-[#8b8f9b]">Dosis/Fr</th>
                            </tr>
                          </thead>
                          <tbody className="bg-white">
                            {consolidadoVacunas.map((item, idx) => (
                              <tr key={item.vacuna.id} className="border-b border-[#eeeef3] hover:bg-[#fbfafd]">
                                <td className="px-4 py-3 text-zinc-500">{idx + 1}</td>
                                <td className="px-4 py-3 font-medium text-zinc-900">{item.vacuna.nombre}</td>
                                <td className="px-4 py-3 text-center font-bold text-zinc-700">{formatNumber(item.cantidadTotal)}</td>
                                <td className="px-4 py-3 text-zinc-600">{item.vacuna.presentacion}</td>
                                <td className="px-4 py-3 text-center text-zinc-600">{item.vacuna.dosisPorFrasco}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>

                    {/* Tabla Jeringas */}
                    <div>
                      <h3 className="flex items-center gap-2 text-sm font-semibold text-zinc-700 mb-3">
                        <Syringe className="h-4 w-4 text-teal-600" />
                        Jeringas
                        {isLoadingJeringas && <SpinnerGap weight="bold" className="h-4 w-4 animate-spin text-teal-600" />}
                      </h3>
                      <div className="overflow-hidden rounded-[18px] border border-[#e7e7ef] bg-white">
                        <table className="w-full text-sm">
                          <thead className="bg-[#fbfafd]">
                            <tr>
                              <th className="px-4 py-3 text-left text-[0.78rem] font-medium tracking-[-0.01em] text-[#8b8f9b]">Tipo</th>
                              <th className="w-28 px-4 py-3 text-center text-[0.78rem] font-medium tracking-[-0.01em] text-[#8b8f9b]">Capacidad</th>
                              <th className="w-28 px-4 py-3 text-center text-[0.78rem] font-medium tracking-[-0.01em] text-[#8b8f9b]">Cantidad</th>
                            </tr>
                          </thead>
                          <tbody className="bg-white">
                            {consolidadoJeringas.length > 0 ? (
                              consolidadoJeringas.map((item, idx) => (
                                <tr key={idx} className="border-b border-[#eeeef3] hover:bg-[#fbfafd]">
                                  <td className="px-4 py-3 font-medium text-zinc-900">{item.tipo}</td>
                                  <td className="px-4 py-3 text-center text-zinc-600">{item.capacidad}</td>
                                  <td className="px-4 py-3 text-center font-bold text-teal-700">{formatNumber(item.cantidad)}</td>
                                </tr>
                              ))
                            ) : (
                              <tr>
                                <td colSpan={3} className="px-4 py-8 text-center text-zinc-500">
                                  {isLoadingJeringas ? (
                                    <span className="flex items-center justify-center gap-2">
                                      <SpinnerGap weight="bold" className="h-4 w-4 animate-spin" /> Cargando...
                                    </span>
                                  ) : (
                                    <span className="flex flex-col items-center gap-1">
                                      <Warning weight="duotone" className="h-5 w-5 text-amber-500" />
                                      Sin configuración de jeringas
                                    </span>
                                  )}
                                </td>
                              </tr>
                            )}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {establecimientosDetalle.map(est => (
                      <div key={est.establecimiento.id} className="overflow-hidden rounded-[18px] border border-[#e7e7ef] bg-white">
                        <div className="border-b border-[#eeeef3] bg-[#fbfafd] px-4 py-3">
                          <h4 className="font-semibold text-zinc-900">{est.establecimiento.nombre}</h4>
                          <p className="text-xs text-zinc-500">Código: {est.establecimiento.codigo}</p>
                        </div>
                        <table className="w-full text-sm">
                          <thead className="bg-[#fbfafd]">
                            <tr>
                              <th className="w-12 px-4 py-2 text-left text-[0.78rem] font-medium tracking-[-0.01em] text-[#8b8f9b]">#</th>
                              <th className="px-4 py-2 text-left text-[0.78rem] font-medium tracking-[-0.01em] text-[#8b8f9b]">Vacuna</th>
                              <th className="w-28 px-4 py-2 text-center text-[0.78rem] font-medium tracking-[-0.01em] text-[#8b8f9b]">Cantidad</th>
                              <th className="px-4 py-2 text-left text-[0.78rem] font-medium tracking-[-0.01em] text-[#8b8f9b]">Presentación</th>
                            </tr>
                          </thead>
                          <tbody className="bg-white">
                            {Object.values(est.vacunas).map((vac, idx) => (
                              <tr key={vac.vacuna.id} className="border-b border-[#eeeef3] hover:bg-[#fbfafd]">
                                <td className="px-4 py-2 text-zinc-500">{idx + 1}</td>
                                <td className="px-4 py-2">
                                  <span className="font-medium text-zinc-900">{vac.vacuna.nombre}</span>
                                </td>
                                <td className="px-4 py-2 text-center">
                                  <span className="font-bold text-zinc-700">{formatNumber(vac.cantidadTotal)}</span>
                                  {vac.cantidadAdicional > 0 && (
                                    <span className="block text-xs text-zinc-500">+{formatNumber(vac.cantidadAdicional)} adic.</span>
                                  )}
                                </td>
                                <td className="px-4 py-2 text-zinc-600">{vac.vacuna.presentacion}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    ))}
                  </div>
                )}
             </div>
          </div>

          {/* Observaciones */}
          {vale.observaciones && (
            <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl">
              <p className="text-sm font-medium text-amber-800">Observaciones:</p>
              <p className="text-sm text-amber-700 mt-1">{vale.observaciones}</p>
            </div>
          )}
        </div>
      </Modal>

      {/* Modal Exportación */}
      <ValeExportModal
        vale={vale}
        isOpen={showExportModal}
        onClose={() => setShowExportModal(false)}
      />
    </>
  );
};

export default ValeDetalleModal;
