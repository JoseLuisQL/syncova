import React, { useState, useEffect, useMemo } from 'react';
import {
  X,
  FileText,
  Building2,
  Package,
  Calendar,
  User,
  Download,
  Printer,
  XCircle,
  RotateCcw,
  AlertTriangle,
  CheckCircle,
  Clock,
  Loader2,
  FileSpreadsheet
} from 'lucide-react';
import { ValeEntrega, ValeDetalle } from '../../services/valesService';
import { useVales } from '../../hooks/useVales';
import { useToastContext } from '../../contexts/ToastContext';
import ValesDataTest from './ValesDataTest';
import ValeExportModal from './ValeExportModal';

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
      entregasAdicionales: ValeDetalle[];
      jeringas: {
        [jeringaId: string]: {
          jeringa: {
            id: string;
            tipo: string;
            capacidad: string;
            color: string;
          };
          cantidad: number;
        };
      };
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
  jeringasTotal: number;
}

const ValeDetalleModal: React.FC<ValeDetalleModalProps> = ({
  vale,
  isOpen,
  onClose
}) => {
  const { toast } = useToastContext();
  const {
    isDeleting,
    isReverting,
    deleteVale,
    revertirVale,
    cambiarEstado
  } = useVales();

  const [isChangingState, setIsChangingState] = useState(false);
  const [showDebug, setShowDebug] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);

  // Constantes
  const meses = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
  ];

  // Función para formatear números de manera segura
  const formatNumber = (value: any): string => {
    const num = Number(value);
    if (isNaN(num)) {
      console.warn('⚠️ Valor no numérico:', value);
      return '0';
    }
    return num.toLocaleString('es-PE');
  };

  // Procesar detalles del vale para crear estructura organizada
  const establecimientosDetalle = useMemo((): EstablecimientoDetalle[] => {
    if (!vale || !vale.detalles || vale.detalles.length === 0) {
      return [];
    }

    // Debug: Ver qué datos están llegando
    console.log('🔍 Vale detalles:', vale.detalles);
    console.log('🔍 Primer detalle:', vale.detalles[0]);

    // Análisis detallado del primer detalle
    if (vale.detalles[0]) {
      const primer = vale.detalles[0];
      console.log('🔍 Análisis detallado del primer detalle:');
      console.log('  - cantidadTotal:', primer.cantidadTotal, typeof primer.cantidadTotal);
      console.log('  - cantidadProgramada:', primer.cantidadProgramada, typeof primer.cantidadProgramada);
      console.log('  - cantidadAdicional:', primer.cantidadAdicional, typeof primer.cantidadAdicional);
      console.log('  - vacuna:', primer.vacuna);
      console.log('  - establecimiento:', primer.establecimiento);
      console.log('  - Todas las propiedades:', Object.keys(primer));
    }

    const establecimientosMap: { [key: string]: EstablecimientoDetalle } = {};

    vale.detalles.forEach(detalle => {
      const estId = detalle.establecimientoId;
      const vacId = detalle.vacunaId;

      // Inicializar establecimiento si no existe
      if (!establecimientosMap[estId]) {
        establecimientosMap[estId] = {
          establecimiento: detalle.establecimiento,
          vacunas: {}
        };
      }

      // Inicializar vacuna si no existe
      if (!establecimientosMap[estId].vacunas[vacId]) {
        establecimientosMap[estId].vacunas[vacId] = {
          vacuna: detalle.vacuna,
          cantidadTotal: 0,
          cantidadProgramada: 0,
          cantidadAdicional: 0,
          entregas: [],
          entregasAdicionales: [],
          jeringas: {}
        };
      }

      // Agregar detalle con validación de números
      const vacunaDetalle = establecimientosMap[estId].vacunas[vacId];
      const cantidadProgramada = Number(detalle.cantidadProgramada) || 0;
      const cantidadAdicional = Number(detalle.cantidadAdicional) || 0;
      // Calcular cantidadTotal si no viene del backend (columna calculada)
      const cantidadTotal = Number(detalle.cantidadTotal) || (cantidadProgramada + cantidadAdicional);

      // Debug detallado para el primer detalle
      if (vale.detalles.indexOf(detalle) === 0) {
        console.log('🔍 Procesando primer detalle:');
        console.log('  - cantidadProgramada raw:', detalle.cantidadProgramada, '→ parsed:', cantidadProgramada);
        console.log('  - cantidadAdicional raw:', detalle.cantidadAdicional, '→ parsed:', cantidadAdicional);
        console.log('  - cantidadTotal raw:', detalle.cantidadTotal, '→ calculated:', cantidadTotal);
      }

      vacunaDetalle.cantidadTotal += cantidadTotal;
      vacunaDetalle.cantidadProgramada += cantidadProgramada;
      vacunaDetalle.cantidadAdicional += cantidadAdicional;
      vacunaDetalle.entregas.push(detalle);

      // Separar entregas adicionales
      if (detalle.numeroEntregaAdicional && Number(detalle.numeroEntregaAdicional) > 0) {
        vacunaDetalle.entregasAdicionales.push(detalle);
      }

      // Calcular jeringas necesarias con validación de números
      const dosisPorFrasco = Number(detalle.vacuna?.dosisPorFrasco) || 1;
      const jeringasNecesarias = cantidadTotal * dosisPorFrasco;

      // Simular jeringas por tipo (esto vendría del sistema de multiplicadores)
      const jeringaSimulada = {
        id: 'jeringa-1ml',
        tipo: 'Jeringa autoretractil',
        capacidad: '1ml',
        color: 'Transparente'
      };

      if (!vacunaDetalle.jeringas[jeringaSimulada.id]) {
        vacunaDetalle.jeringas[jeringaSimulada.id] = {
          jeringa: jeringaSimulada,
          cantidad: 0
        };
      }
      vacunaDetalle.jeringas[jeringaSimulada.id].cantidad += jeringasNecesarias;
    });

    return Object.values(establecimientosMap).sort((a, b) => 
      a.establecimiento.nombre.localeCompare(b.establecimiento.nombre)
    );
  }, [vale.detalles]);

  // Consolidado general de vacunas
  const consolidadoVacunas = useMemo((): ConsolidadoVacuna[] => {
    if (!vale || !vale.detalles || vale.detalles.length === 0) {
      return [];
    }

    const vacunasMap: { [key: string]: ConsolidadoVacuna } = {};

    vale.detalles.forEach(detalle => {
      const vacId = detalle.vacunaId;

      if (!vacunasMap[vacId]) {
        vacunasMap[vacId] = {
          vacuna: detalle.vacuna,
          cantidadTotal: 0,
          jeringasTotal: 0
        };
      }

      const cantidadProgramada = Number(detalle.cantidadProgramada) || 0;
      const cantidadAdicional = Number(detalle.cantidadAdicional) || 0;
      const cantidadTotal = Number(detalle.cantidadTotal) || (cantidadProgramada + cantidadAdicional);
      const dosisPorFrasco = Number(detalle.vacuna?.dosisPorFrasco) || 1;

      vacunasMap[vacId].cantidadTotal += cantidadTotal;
      vacunasMap[vacId].jeringasTotal += cantidadTotal * dosisPorFrasco;
    });

    return Object.values(vacunasMap).sort((a, b) => 
      a.vacuna.nombre.localeCompare(b.vacuna.nombre)
    );
  }, [vale.detalles]);

  // Funciones de manejo
  const handleEliminarVale = async () => {
    const confirmMessage = `⚠️ ELIMINAR VALE ${vale.numero}

Esta acción:
• Eliminará permanentemente el vale de la base de datos
• Restaurará automáticamente todos los stocks de lotes afectados
• Eliminará los registros del kardex relacionados
• NO SE PUEDE DESHACER

¿Está completamente seguro de continuar?`;

    if (!confirm(confirmMessage)) {
      return;
    }

    // Confirmación adicional para vales con muchas vacunas
    if (vale.totalVacunas > 100) {
      const secondConfirm = `Este vale tiene ${vale.totalVacunas} vacunas. ¿Confirma la eliminación?`;
      if (!confirm(secondConfirm)) {
        return;
      }
    }

    try {
      const success = await deleteVale(vale.id);
      if (success) {
        toast.success(`✅ Vale ${vale.numero} eliminado exitosamente`);
        toast.info(`📦 Stocks de lotes restaurados automáticamente`);
        onClose();
      }
    } catch (error: any) {
      toast.error(`❌ Error al eliminar vale: ${error.message}`);
    }
  };

  const handleRevertirVale = async () => {
    const confirmMessage = `🔄 REVERTIR VALE ${vale.numero}

Esta acción:
• Cambiará el estado del vale a "pendiente"
• Restaurará automáticamente todos los stocks de lotes afectados
• Eliminará los registros del kardex relacionados
• Permitirá regenerar el vale posteriormente

¿Está seguro de revertir este vale?`;

    if (!confirm(confirmMessage)) {
      return;
    }

    try {
      const success = await revertirVale(vale.id);
      if (success) {
        toast.success(`✅ Vale ${vale.numero} revertido exitosamente`);
        toast.info(`📦 Stocks de lotes restaurados automáticamente`);
        onClose();
      }
    } catch (error: any) {
      toast.error(`❌ Error al revertir vale: ${error.message}`);
    }
  };

  const handleCambiarEstado = async (nuevoEstado: 'generado' | 'impreso' | 'entregado') => {
    setIsChangingState(true);
    try {
      const result = await cambiarEstado(vale.id, nuevoEstado);
      if (result) {
        toast.success(`✅ Estado cambiado a ${nuevoEstado}`);
      }
    } catch (error: any) {
      toast.error(`❌ Error al cambiar estado: ${error.message}`);
    } finally {
      setIsChangingState(false);
    }
  };

  const getEstadoColor = (estado: string) => {
    switch (estado) {
      case 'generado': return 'bg-blue-100 text-blue-800';
      case 'impreso': return 'bg-yellow-100 text-yellow-800';
      case 'entregado': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getEstadoIcon = (estado: string) => {
    switch (estado) {
      case 'generado': return <Clock className="h-4 w-4" />;
      case 'impreso': return <FileText className="h-4 w-4" />;
      case 'entregado': return <CheckCircle className="h-4 w-4" />;
      default: return <AlertTriangle className="h-4 w-4" />;
    }
  };

  if (!isOpen || !vale) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 animate-fadeIn p-1 sm:p-2">
      <div className="bg-white rounded-xl shadow-xl w-[98vw] max-w-none max-h-[98vh] flex flex-col overflow-hidden transform transition-all duration-300 animate-slideUp">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-gray-50 flex-shrink-0">
          <div className="flex items-center space-x-4">
            <div className="p-2 bg-blue-100 rounded-lg">
              <FileText className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">
                VALE DE ENTREGA DE VACUNAS Y JERINGAS
              </h2>
              <div className="flex items-center space-x-4 mt-1 text-sm text-gray-600">
                <span>Número: <strong>{vale.numero}</strong></span>
                <span>•</span>
                <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getEstadoColor(vale.estado)}`}>
                  {getEstadoIcon(vale.estado)}
                  <span className="ml-1 capitalize">{vale.estado}</span>
                </span>
              </div>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setShowDebug(!showDebug)}
              className="px-3 py-1 text-xs bg-orange-100 text-orange-700 rounded-lg hover:bg-orange-200 transition-colors"
            >
              🔍 Debug
            </button>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-200 rounded-lg transition-colors"
            >
              <X className="h-5 w-5 text-gray-500" />
            </button>
          </div>
        </div>

        {/* Información del Vale */}
        <div className="p-6 border-b border-gray-200 bg-blue-50 flex-shrink-0">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <div className="flex items-center mb-2">
                <Building2 className="h-5 w-5 text-blue-600 mr-2" />
                <span className="font-semibold text-gray-900">Centro de Acopio</span>
              </div>
              <p className="text-lg font-bold text-blue-900">{vale.centroAcopio.nombre}</p>
              <p className="text-sm text-gray-600">Código: {vale.centroAcopio.codigo}</p>
            </div>
            <div>
              <div className="flex items-center mb-2">
                <User className="h-5 w-5 text-blue-600 mr-2" />
                <span className="font-semibold text-gray-900">Responsable de Recojo</span>
              </div>
              <p className="text-lg font-bold text-blue-900">
                {vale.usuario.nombres} {vale.usuario.apellidos}
              </p>
            </div>
            <div>
              <div className="flex items-center mb-2">
                <Calendar className="h-5 w-5 text-blue-600 mr-2" />
                <span className="font-semibold text-gray-900">Fecha</span>
              </div>
              <p className="text-lg font-bold text-blue-900">
                {new Date(vale.fechaGeneracion).toLocaleDateString('es-PE', {
                  day: '2-digit',
                  month: '2-digit',
                  year: 'numeric'
                })}
              </p>
              <p className="text-sm text-gray-600">
                Período: {meses[vale.mes - 1]} {vale.anio}
              </p>
            </div>
          </div>
        </div>

        {/* Contenido Principal */}
        <div className="flex-1 overflow-y-auto p-6">
          {showDebug && (
            <div className="mb-6">
              <ValesDataTest vale={vale} />
            </div>
          )}

          {(!vale.detalles || vale.detalles.length === 0) ? (
            <div className="text-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-blue-600 mx-auto mb-4" />
              <p className="text-gray-600">Cargando detalles del vale...</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Consolidado General */}
            <div>
              <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
                <Package className="h-5 w-5 mr-2" />
                CONSOLIDADO
              </h3>
              <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[600px] text-sm">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left font-semibold text-gray-900 w-16">Nº</th>
                        <th className="px-6 py-3 text-left font-semibold text-gray-900 min-w-[300px]">Biológicos</th>
                        <th className="px-6 py-3 text-center font-semibold text-gray-900 min-w-[120px]">Cantidad</th>
                        <th className="px-6 py-3 text-left font-semibold text-gray-900 min-w-[150px]">Presentación</th>
                        <th className="px-6 py-3 text-center font-semibold text-gray-900 min-w-[100px]">Dosis/Frasco</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {consolidadoVacunas.map((item, index) => (
                        <tr key={item.vacuna.id} className="hover:bg-gray-50">
                          <td className="px-6 py-3 text-gray-900 font-medium">{index + 1}</td>
                          <td className="px-6 py-3 text-gray-900 font-semibold">{item.vacuna.nombre}</td>
                          <td className="px-6 py-3 text-center font-bold text-blue-600 text-lg">
                            {formatNumber(item.cantidadTotal)}
                          </td>
                          <td className="px-6 py-3 text-gray-700">{item.vacuna.presentacion}</td>
                          <td className="px-6 py-3 text-center text-gray-700 font-medium">{item.vacuna.dosisPorFrasco}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Jeringas Consolidado */}
              <h4 className="text-md font-bold text-gray-900 mt-6 mb-3">Jeringas</h4>
              <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[400px] text-sm">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left font-semibold text-gray-900 min-w-[250px]">Tipo de Jeringa</th>
                        <th className="px-6 py-3 text-center font-semibold text-gray-900 min-w-[120px]">Cantidad Total</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      <tr className="hover:bg-gray-50">
                        <td className="px-6 py-3 text-gray-900 font-semibold">Jeringa autoretractil 1cc 27 G x 1/2"</td>
                        <td className="px-6 py-3 text-center font-bold text-green-600 text-lg">
                          {consolidadoVacunas.reduce((total, item) => total + item.jeringasTotal, 0).toLocaleString()}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            {/* Detalle por Establecimiento */}
            <div>
              <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
                <Building2 className="h-5 w-5 mr-2" />
                DETALLE POR ESTABLECIMIENTO
              </h3>
              <div className="space-y-6">
                {establecimientosDetalle.map((estDetalle) => (
                  <div key={estDetalle.establecimiento.id} className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                    <div className="bg-blue-50 px-4 py-3 border-b border-gray-200">
                      <h4 className="font-bold text-blue-900">
                        {estDetalle.establecimiento.nombre}
                      </h4>
                      <p className="text-sm text-blue-700">
                        Código: {estDetalle.establecimiento.codigo}
                      </p>
                    </div>
                    <div className="overflow-x-auto">
                      <table className="w-full min-w-[800px] text-sm">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-6 py-3 text-left font-semibold text-gray-900 w-16">Nº</th>
                            <th className="px-6 py-3 text-left font-semibold text-gray-900 min-w-[300px]">Biológicos</th>
                            <th className="px-6 py-3 text-center font-semibold text-gray-900 min-w-[150px]">Cantidad</th>
                            <th className="px-6 py-3 text-left font-semibold text-gray-900 min-w-[200px]">Presentación</th>
                            <th className="px-6 py-3 text-center font-semibold text-gray-900 min-w-[120px]">Dosis/Frasco</th>
                          </tr>
                        </thead>
                      <tbody className="divide-y divide-gray-200">
                        {Object.values(estDetalle.vacunas).map((vacDetalle, index) => (
                          <tr key={vacDetalle.vacuna.id} className="hover:bg-gray-50">
                            <td className="px-6 py-3 text-gray-900 font-medium">{index + 1}</td>
                            <td className="px-6 py-3 text-gray-900">
                              <div className="font-semibold">{vacDetalle.vacuna.nombre}</div>
                            </td>
                            <td className="px-6 py-3 text-center">
                              <div className="font-bold text-blue-600 text-lg">
                                {formatNumber(vacDetalle.cantidadTotal)}
                              </div>
                              {vacDetalle.cantidadProgramada > 0 && (
                                <div className="text-xs text-gray-600">
                                  Base: {formatNumber(vacDetalle.cantidadProgramada)}
                                </div>
                              )}
                              {vacDetalle.cantidadAdicional > 0 && (
                                <div className="text-xs text-orange-600">
                                  + {formatNumber(vacDetalle.cantidadAdicional)} adicional
                                </div>
                              )}
                              {vacDetalle.entregasAdicionales.length > 0 && (
                                <div className="text-xs text-purple-600 mt-1">
                                  {vacDetalle.entregasAdicionales.length} entrega(s) adicional(es)
                                </div>
                              )}
                            </td>
                            <td className="px-6 py-3 text-gray-700">
                              {vacDetalle.vacuna.presentacion}
                            </td>
                            <td className="px-6 py-3 text-center text-gray-700 font-medium">
                              {vacDetalle.vacuna.dosisPorFrasco}
                            </td>
                          </tr>
                        ))}
                        </tbody>
                      </table>
                    </div>

                    {/* Mostrar entregas adicionales si existen */}
                    {Object.values(estDetalle.vacunas).some(vac => vac.entregasAdicionales.length > 0) && (
                      <div className="mt-4 p-3 bg-orange-50 border border-orange-200 rounded-lg">
                        <h5 className="text-sm font-semibold text-orange-900 mb-2">Entregas Adicionales:</h5>
                        <div className="space-y-2">
                          {Object.values(estDetalle.vacunas).map((vacDetalle) =>
                            vacDetalle.entregasAdicionales.map((entregaAdicional, idx) => (
                              <div key={`${vacDetalle.vacuna.id}-${idx}`} className="flex justify-between items-center text-sm">
                                <span className="text-orange-800">
                                  {vacDetalle.vacuna.nombre} - Entrega #{entregaAdicional.numeroEntregaAdicional}
                                </span>
                                <span className="font-bold text-orange-900">
                                  +{formatNumber(entregaAdicional.cantidadAdicional)}
                                </span>
                              </div>
                            ))
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
          )}

          {/* Observaciones */}
          {vale.observaciones && (
            <div className="mt-8 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <h4 className="font-semibold text-yellow-900 mb-2">Observaciones:</h4>
              <p className="text-yellow-800">{vale.observaciones}</p>
            </div>
          )}


        </div>

        {/* Footer con Acciones */}
        <div className="flex items-center justify-between p-6 border-t border-gray-200 bg-gray-50 flex-shrink-0">
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-600">Estado:</span>
            <div className="flex space-x-2">
              {['generado', 'impreso', 'entregado'].map((estado) => (
                <button
                  key={estado}
                  onClick={() => handleCambiarEstado(estado as any)}
                  disabled={vale.estado === estado || isChangingState}
                  className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                    vale.estado === estado
                      ? getEstadoColor(estado)
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  } disabled:opacity-50 disabled:cursor-not-allowed`}
                >
                  {isChangingState ? (
                    <Loader2 className="h-3 w-3 animate-spin" />
                  ) : (
                    estado.charAt(0).toUpperCase() + estado.slice(1)
                  )}
                </button>
              ))}
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            <button
              onClick={() => setShowExportModal(true)}
              className="flex items-center px-6 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
            >
              <FileSpreadsheet className="h-4 w-4 mr-2" />
              Exportar Vale
            </button>
            <button
              onClick={handleRevertirVale}
              disabled={isReverting}
              className="flex items-center px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
              title="Revertir vale a estado pendiente (restaura stocks)"
            >
              {isReverting ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <RotateCcw className="h-4 w-4 mr-2" />
              )}
              Revertir a Pendiente
            </button>
            <button
              onClick={handleEliminarVale}
              disabled={isDeleting}
              className="flex items-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed border-2 border-red-700 shadow-sm"
              title="PELIGRO: Eliminar vale permanentemente (restaura stocks)"
            >
              {isDeleting ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <>
                  <AlertTriangle className="h-4 w-4 mr-1" />
                  <XCircle className="h-4 w-4 mr-2" />
                </>
              )}
              Eliminar Permanentemente
            </button>
          </div>
        </div>
      </div>

      {/* Modal de Exportación */}
      <ValeExportModal
        vale={vale}
        isOpen={showExportModal}
        onClose={() => setShowExportModal(false)}
      />
    </div>
  );
};

export default ValeDetalleModal;
