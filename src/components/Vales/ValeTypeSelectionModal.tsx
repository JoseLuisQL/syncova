import React, { useState, useEffect } from 'react';
import {
  X,
  FileText,
  Package,
  Plus,
  CheckCircle,
  AlertCircle,
  Building2,
  Calendar,
  Loader2,
  ChevronRight,
  RefreshCw
} from 'lucide-react';
import { ValesService, EntregaAdicionalInfo, ValeTypeSelectionConfig, GrupoEntregaAdicional } from '../../services/valesService';
import { useToastContext } from '../../contexts/ToastContext';

interface ValeTypeSelectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (config: ValeTypeSelectionConfig) => void;
  centroAcopioId: string;
  centroAcopioNombre: string;
  mes: number;
  anio: number;
}

const ValeTypeSelectionModal: React.FC<ValeTypeSelectionModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  centroAcopioId,
  centroAcopioNombre,
  mes,
  anio
}) => {
  const { toast } = useToastContext();
  const [isLoading, setIsLoading] = useState(false);
  const [entregasAdicionales, setEntregasAdicionales] = useState<EntregaAdicionalInfo[]>([]);
  const [gruposEntregasAdicionales, setGruposEntregasAdicionales] = useState<GrupoEntregaAdicional[]>([]);
  const [gruposGenerados, setGruposGenerados] = useState<number[]>([]);
  const [tiposGenerados, setTiposGenerados] = useState<string[]>([]);
  const [config, setConfig] = useState<ValeTypeSelectionConfig>({
    tipoVale: 'solo_base',
    entregasAdicionalesSeleccionadas: [],
    gruposEntregasSeleccionados: []
  });

  // Constantes
  const meses = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
  ];

  // Cargar datos necesarios - SIEMPRE refrescar cuando se abre el modal
  useEffect(() => {
    if (isOpen) {
      console.log('🔄 Modal abierto - Cargando datos frescos...');
      loadData();
    }
  }, [isOpen, centroAcopioId, mes, anio]);

  // También refrescar cuando cambian los parámetros críticos
  useEffect(() => {
    if (isOpen) {
      console.log('🔄 Parámetros cambiaron - Recargando datos...');
      loadData();
    }
  }, [centroAcopioId, mes, anio]);

  const loadData = async () => {
    console.log(`🔄 Cargando datos frescos para modal - Centro: ${centroAcopioId}, Período: ${mes}/${anio}`);
    setIsLoading(true);
    try {
      // Cargar tipos de vales ya generados
      const tiposResponse = await ValesService.getTiposValesGenerados(centroAcopioId, mes, anio);
      if (tiposResponse.success && tiposResponse.data) {
        setTiposGenerados(tiposResponse.data);
        console.log('✅ Tipos de vales ya generados:', tiposResponse.data);
      } else {
        console.warn('⚠️ Error al obtener tipos generados:', tiposResponse.error);
        setTiposGenerados([]);
      }

      // Cargar grupos de entregas adicionales ya generados
      const gruposGeneradosResponse = await ValesService.getGruposEntregasAdicionalesGenerados(centroAcopioId, mes, anio);
      if (gruposGeneradosResponse.success && gruposGeneradosResponse.data) {
        setGruposGenerados(gruposGeneradosResponse.data);
        console.log('✅ Grupos de entregas adicionales ya generados:', gruposGeneradosResponse.data);
      } else {
        console.warn('⚠️ Error al obtener grupos generados:', gruposGeneradosResponse.error);
        setGruposGenerados([]);
      }

      // Cargar entregas adicionales disponibles
      const entregasResponse = await ValesService.getEntregasAdicionalesDisponibles(centroAcopioId, mes, anio);
      if (entregasResponse.success && entregasResponse.data) {
        setEntregasAdicionales(entregasResponse.data);

        // Agrupar entregas adicionales por número
        const gruposMap = new Map<number, GrupoEntregaAdicional>();

        entregasResponse.data.forEach((entrega: EntregaAdicionalInfo) => {
          const numeroEntrega = entrega.numeroEntrega;

          if (!gruposMap.has(numeroEntrega)) {
            gruposMap.set(numeroEntrega, {
              numeroEntrega,
              totalVacunas: 0,
              totalEstablecimientos: 0,
              entregas: []
            });
          }

          const grupo = gruposMap.get(numeroEntrega)!;
          grupo.totalVacunas += entrega.cantidad;
          grupo.entregas.push(entrega);
        });

        // Calcular total de establecimientos únicos por grupo
        gruposMap.forEach(grupo => {
          const establecimientosUnicos = new Set(grupo.entregas.map(e => e.establecimientoId));
          grupo.totalEstablecimientos = establecimientosUnicos.size;
        });

        const gruposArray = Array.from(gruposMap.values()).sort((a, b) => a.numeroEntrega - b.numeroEntrega);
        setGruposEntregasAdicionales(gruposArray);

        console.log('✅ Grupos de entregas adicionales disponibles:', gruposArray);
        console.log('📊 Resumen de grupos:');
        gruposArray.forEach(grupo => {
          const yaGenerado = gruposGeneradosResponse.data?.includes(grupo.numeroEntrega);
          console.log(`  - Grupo #${grupo.numeroEntrega}: ${grupo.totalVacunas} vacunas, ${grupo.totalEstablecimientos} establecimientos ${yaGenerado ? '(YA GENERADO)' : '(DISPONIBLE)'}`);
        });
      } else {
        setEntregasAdicionales([]);
        setGruposEntregasAdicionales([]);
      }
    } catch (error: any) {
      console.error('Error cargando datos:', error);
      toast.error('Error al cargar datos necesarios');
      setEntregasAdicionales([]);
      setGruposEntregasAdicionales([]);
      setGruposGenerados([]);
      setTiposGenerados([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleTipoValeChange = (tipo: 'solo_base' | 'solo_adicionales') => {
    // Validaciones específicas por tipo
    if (tipo === 'solo_adicionales') {
      if (getGruposDisponibles().length === 0) {
        toast.warning('No hay grupos de entregas adicionales disponibles');
        return;
      }
    } else {
      if (tiposGenerados.includes(tipo)) {
        toast.warning(`El vale de tipo "${tipo}" ya ha sido generado`);
        return;
      }
    }

    setConfig(prev => ({
      tipoVale: tipo,
      entregasAdicionalesSeleccionadas: [],
      gruposEntregasSeleccionados: tipo === 'solo_adicionales'
        ? getGruposDisponibles().map(g => g.numeroEntrega)
        : []
    }));
  };

  const handleGrupoEntregaToggle = (numeroEntrega: number) => {
    setConfig(prev => {
      const isSelected = prev.gruposEntregasSeleccionados.includes(numeroEntrega);
      const nuevosGrupos = isSelected
        ? prev.gruposEntregasSeleccionados.filter(num => num !== numeroEntrega)
        : [...prev.gruposEntregasSeleccionados, numeroEntrega];

      // También actualizar las entregas individuales para compatibilidad
      const entregasDelGrupo = gruposEntregasAdicionales
        .find(g => g.numeroEntrega === numeroEntrega)?.entregas || [];

      let nuevasEntregas = prev.entregasAdicionalesSeleccionadas;

      if (isSelected) {
        // Remover entregas del grupo
        nuevasEntregas = nuevasEntregas.filter(id =>
          !entregasDelGrupo.some(e => e.id === id)
        );
      } else {
        // Agregar entregas del grupo
        const idsDelGrupo = entregasDelGrupo.map(e => e.id);
        nuevasEntregas = [...nuevasEntregas, ...idsDelGrupo];
      }

      return {
        ...prev,
        gruposEntregasSeleccionados: nuevosGrupos,
        entregasAdicionalesSeleccionadas: nuevasEntregas
      };
    });
  };

  const handleConfirm = () => {
    // Validaciones específicas por tipo
    if (config.tipoVale === 'solo_adicionales') {
      if (config.gruposEntregasSeleccionados.length === 0) {
        toast.error('Debe seleccionar al menos un grupo de entregas adicionales');
        return;
      }
      if (getGruposDisponibles().length === 0) {
        toast.error('No hay grupos de entregas adicionales disponibles para generar');
        return;
      }
    } else {
      // Para otros tipos, verificar disponibilidad tradicional
      if (!isTipoDisponible(config.tipoVale)) {
        toast.error(`El vale de tipo "${config.tipoVale}" ya ha sido generado`);
        return;
      }
    }

    onConfirm(config);
    onClose();
  };

  // Funciones auxiliares para el manejo de grupos
  const getGruposDisponibles = (): GrupoEntregaAdicional[] => {
    return gruposEntregasAdicionales.filter(grupo =>
      !gruposGenerados.includes(grupo.numeroEntrega)
    );
  };

  const isGrupoGenerado = (numeroEntrega: number): boolean => {
    return gruposGenerados.includes(numeroEntrega);
  };

  const getGrupoInfo = (numeroEntrega: number): GrupoEntregaAdicional | undefined => {
    return gruposEntregasAdicionales.find(g => g.numeroEntrega === numeroEntrega);
  };

  // Funciones para verificar disponibilidad
  const isTipoDisponible = (tipo: string) => {
    // Para entregas adicionales, verificar si hay grupos disponibles
    if (tipo === 'solo_adicionales') {
      return getGruposDisponibles().length > 0;
    }
    // Para otros tipos, verificar si no han sido generados
    return !tiposGenerados.includes(tipo);
  };

  const getTipoValeDescription = (tipo: string) => {
    const baseDescription = {
      'solo_base': 'Solo incluye las entregas base programadas en la planificación anual',
      'solo_adicionales': 'Solo incluye las entregas adicionales seleccionadas'
    }[tipo] || '';

    // Para entregas adicionales, mostrar información específica de grupos
    if (tipo === 'solo_adicionales') {
      if (getGruposDisponibles().length === 0 && gruposEntregasAdicionales.length > 0) {
        return `${baseDescription} (Todos los grupos ya generados)`;
      } else if (gruposEntregasAdicionales.length === 0) {
        return `${baseDescription} (Sin entregas adicionales disponibles)`;
      }
      return baseDescription;
    }

    // Para otros tipos, verificar si ya fueron generados
    if (tiposGenerados.includes(tipo)) {
      return `${baseDescription} (Ya generado)`;
    }

    return baseDescription;
  };

  const getOpcionesDisponibles = () => {
    const opciones = [];

    if (!tiposGenerados.includes('solo_base')) {
      opciones.push('solo_base');
    }
    // Permitir "solo_adicionales" si hay grupos disponibles (no generados)
    if (getGruposDisponibles().length > 0) {
      opciones.push('solo_adicionales');
    }

    return opciones;
  };

  const hayOpcionesDisponibles = () => {
    return getOpcionesDisponibles().length > 0;
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 animate-fadeIn">
      <div className="bg-white rounded-xl shadow-xl max-w-4xl w-full mx-4 max-h-[90vh] flex flex-col overflow-hidden transform transition-all duration-300 animate-slideUp">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50 flex-shrink-0">
          <div className="flex items-center space-x-4">
            <div className="p-2 bg-blue-100 rounded-lg">
              <FileText className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">
                Seleccionar Tipo de Vale de Entrega
              </h2>
              <div className="flex items-center space-x-4 mt-1 text-sm text-gray-600">
                <div className="flex items-center">
                  <Building2 className="h-4 w-4 mr-1" />
                  <span>{centroAcopioNombre}</span>
                </div>
                <span>•</span>
                <div className="flex items-center">
                  <Calendar className="h-4 w-4 mr-1" />
                  <span>{meses[mes - 1]} {anio}</span>
                </div>
              </div>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={loadData}
              disabled={isLoading}
              className="p-2 hover:bg-gray-200 rounded-lg transition-colors disabled:opacity-50"
              title="Actualizar datos"
            >
              <RefreshCw className={`h-5 w-5 text-gray-500 ${isLoading ? 'animate-spin' : ''}`} />
            </button>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-200 rounded-lg transition-colors"
            >
              <X className="h-5 w-5 text-gray-500" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-blue-600 mr-3" />
              <span className="text-gray-600">Cargando entregas adicionales disponibles...</span>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Información */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-start">
                  <AlertCircle className="h-5 w-5 text-blue-600 mr-3 mt-0.5 flex-shrink-0" />
                  <div>
                    <h3 className="font-semibold text-blue-900 mb-1">
                      Seleccione el tipo de vale que desea generar
                    </h3>
                    <p className="text-blue-800 text-sm">
                      Puede generar un vale completo con todas las entregas, solo entregas base, 
                      o únicamente entregas adicionales específicas según sus necesidades operativas.
                    </p>
                  </div>
                </div>
              </div>

              {/* Opciones de tipo de vale */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Tipo de Vale</h3>

                {/* Solo Entregas Base */}
                <div
                  className={`border-2 rounded-lg p-4 transition-all ${
                    tiposGenerados.includes('solo_base')
                      ? 'border-gray-300 bg-gray-100 cursor-not-allowed opacity-60'
                      : config.tipoVale === 'solo_base'
                        ? 'border-green-500 bg-green-50 cursor-pointer'
                        : 'border-gray-200 hover:border-gray-300 cursor-pointer'
                  }`}
                  onClick={() => !tiposGenerados.includes('solo_base') && handleTipoValeChange('solo_base')}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className={`w-4 h-4 rounded-full border-2 mr-3 ${
                        config.tipoVale === 'solo_base' && !tiposGenerados.includes('solo_base')
                          ? 'border-green-500 bg-green-500'
                          : 'border-gray-300'
                      }`}>
                        {config.tipoVale === 'solo_base' && !tiposGenerados.includes('solo_base') && (
                          <div className="w-full h-full rounded-full bg-white scale-50"></div>
                        )}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center space-x-2">
                          <h4 className={`font-semibold ${tiposGenerados.includes('solo_base') ? 'text-gray-500' : 'text-gray-900'}`}>
                            Solo Entregas Base
                          </h4>
                          {tiposGenerados.includes('solo_base') && (
                            <span className="px-2 py-1 text-xs bg-gray-200 text-gray-600 rounded-full">
                              Ya generado
                            </span>
                          )}
                        </div>
                        <p className={`text-sm ${tiposGenerados.includes('solo_base') ? 'text-gray-500' : 'text-gray-600'}`}>
                          {getTipoValeDescription('solo_base')}
                        </p>
                      </div>
                    </div>
                    <CheckCircle className={`h-5 w-5 ${!isTipoDisponible('solo_base') ? 'text-gray-400' : 'text-gray-400'}`} />
                  </div>
                </div>

                {/* Solo Entregas Adicionales */}
                <div
                  className={`border-2 rounded-lg p-4 transition-all ${
                    getGruposDisponibles().length === 0
                      ? 'border-gray-300 bg-gray-100 cursor-not-allowed opacity-60'
                      : config.tipoVale === 'solo_adicionales'
                        ? 'border-orange-500 bg-orange-50 cursor-pointer'
                        : 'border-gray-200 hover:border-gray-300 cursor-pointer'
                  }`}
                  onClick={() => getGruposDisponibles().length > 0 && handleTipoValeChange('solo_adicionales')}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className={`w-4 h-4 rounded-full border-2 mr-3 ${
                        config.tipoVale === 'solo_adicionales' && getGruposDisponibles().length > 0
                          ? 'border-orange-500 bg-orange-500'
                          : 'border-gray-300'
                      }`}>
                        {config.tipoVale === 'solo_adicionales' && getGruposDisponibles().length > 0 && (
                          <div className="w-full h-full rounded-full bg-white scale-50"></div>
                        )}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center space-x-2">
                          <h4 className={`font-semibold ${getGruposDisponibles().length === 0 ? 'text-gray-500' : 'text-gray-900'}`}>
                            Solo Entregas Adicionales
                          </h4>
                          {getGruposDisponibles().length === 0 && gruposEntregasAdicionales.length > 0 && (
                            <span className="px-2 py-1 text-xs bg-gray-200 text-gray-600 rounded-full">
                              Todos los grupos ya generados
                            </span>
                          )}
                          {getGruposDisponibles().length === 0 && gruposEntregasAdicionales.length === 0 && (
                            <span className="px-2 py-1 text-xs bg-yellow-200 text-yellow-700 rounded-full">
                              Sin entregas adicionales
                            </span>
                          )}
                          {getGruposDisponibles().length > 0 && (
                            <span className="px-2 py-1 text-xs bg-blue-100 text-blue-700 rounded-full">
                              {getGruposDisponibles().length} grupo(s) disponible(s)
                            </span>
                          )}
                        </div>
                        <p className={`text-sm ${getGruposDisponibles().length === 0 ? 'text-gray-500' : 'text-gray-600'}`}>
                          {getTipoValeDescription('solo_adicionales')}
                        </p>
                      </div>
                    </div>
                    <Plus className={`h-5 w-5 ${getGruposDisponibles().length === 0 ? 'text-gray-400' : 'text-gray-400'}`} />
                  </div>
                </div>
              </div>

              {/* Mensaje cuando no hay opciones disponibles */}
              {!isLoading && !hayOpcionesDisponibles() && (
                <div className="mt-6 text-center py-8 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <AlertCircle className="h-8 w-8 text-yellow-600 mx-auto mb-3" />
                  <h3 className="font-semibold text-yellow-900 mb-2">
                    No hay tipos de vales disponibles
                  </h3>
                  <p className="text-yellow-800 text-sm mb-4">
                    Todos los tipos de vales ya han sido generados para este período.
                  </p>
                  <div className="space-y-2 text-xs text-yellow-700">
                    <p><strong>Tipos ya generados:</strong></p>
                    <div className="flex flex-wrap justify-center gap-2">
                      {tiposGenerados.map(tipo => (
                        <span key={tipo} className="px-2 py-1 bg-yellow-200 text-yellow-800 rounded-full">
                          {tipo === 'solo_base' ? 'Solo Base' :
                           'Solo Adicionales'}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Lista de grupos de entregas adicionales (solo si se selecciona "solo_adicionales") */}
              {config.tipoVale === 'solo_adicionales' && (
                <div className="mt-6">
                  <h4 className="text-md font-semibold text-gray-900 mb-4">
                    Seleccionar Grupos de Entregas Adicionales
                  </h4>
                  {getGruposDisponibles().length === 0 ? (
                    <div className="text-center py-8 bg-gray-50 rounded-lg">
                      <AlertCircle className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                      <p className="text-gray-600 font-medium">
                        No hay grupos de entregas adicionales disponibles
                      </p>
                      <p className="text-gray-500 text-sm mt-1">
                        {gruposEntregasAdicionales.length === 0
                          ? 'No existen entregas adicionales para este período'
                          : 'Todos los grupos ya han sido generados en vales anteriores'
                        }
                      </p>
                      {gruposGenerados.length > 0 && (
                        <div className="mt-3">
                          <p className="text-xs text-gray-500 mb-2">Grupos ya generados:</p>
                          <div className="flex flex-wrap justify-center gap-1">
                            {gruposGenerados.map(numero => (
                              <span key={numero} className="px-2 py-1 text-xs bg-gray-200 text-gray-600 rounded-full">
                                Grupo #{numero}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="space-y-3 max-h-60 overflow-y-auto">
                      {getGruposDisponibles().map((grupo) => (
                        <div
                          key={grupo.numeroEntrega}
                          className={`border-2 rounded-lg p-4 cursor-pointer transition-all ${
                            config.gruposEntregasSeleccionados.includes(grupo.numeroEntrega)
                              ? 'border-orange-500 bg-orange-50'
                              : 'border-gray-200 hover:border-orange-200'
                          }`}
                          onClick={() => handleGrupoEntregaToggle(grupo.numeroEntrega)}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center">
                              <input
                                type="checkbox"
                                checked={config.gruposEntregasSeleccionados.includes(grupo.numeroEntrega)}
                                onChange={() => handleGrupoEntregaToggle(grupo.numeroEntrega)}
                                className="mr-3 h-4 w-4 text-orange-600 focus:ring-orange-500 border-gray-300 rounded"
                              />
                              <div className="flex-1">
                                <div className="flex items-center space-x-3">
                                  <h5 className="font-semibold text-gray-900">
                                    Entrega Adicional #{grupo.numeroEntrega}
                                  </h5>
                                  <span className="px-2 py-1 text-xs bg-orange-100 text-orange-700 rounded-full font-medium">
                                    {grupo.totalVacunas.toLocaleString()} vacunas
                                  </span>
                                  <span className="px-2 py-1 text-xs bg-blue-100 text-blue-700 rounded-full font-medium">
                                    {grupo.totalEstablecimientos} establecimiento(s)
                                  </span>
                                </div>
                                <div className="mt-2 text-sm text-gray-600">
                                  <p className="font-medium">Incluye entregas para:</p>
                                  <div className="mt-1 space-y-1">
                                    {grupo.entregas.slice(0, 3).map((entrega, index) => (
                                      <div key={entrega.id} className="flex items-center space-x-2">
                                        <span className="text-gray-700">{entrega.establecimientoNombre}</span>
                                        <span className="text-gray-500">•</span>
                                        <span className="text-gray-600">{entrega.vacunaNombre}</span>
                                        <span className="text-gray-500">•</span>
                                        <span className="font-medium text-orange-600">
                                          {entrega.cantidad.toLocaleString()} unidades
                                        </span>
                                      </div>
                                    ))}
                                    {grupo.entregas.length > 3 && (
                                      <p className="text-xs text-gray-500 italic">
                                        ... y {grupo.entregas.length - 3} entrega(s) más
                                      </p>
                                    )}
                                  </div>
                                </div>
                              </div>
                            </div>
                            <ChevronRight className="h-5 w-5 text-gray-400" />
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-6 border-t border-gray-200 bg-gray-50 flex-shrink-0">
          <div className="text-sm text-gray-600">
            {config.tipoVale === 'solo_adicionales' && config.gruposEntregasSeleccionados.length > 0 && (
              <div className="space-y-1">
                <span className="font-medium">
                  {config.gruposEntregasSeleccionados.length} grupo(s) seleccionado(s):
                </span>
                <div className="flex flex-wrap gap-1">
                  {config.gruposEntregasSeleccionados.map(numero => {
                    const grupo = getGrupoInfo(numero);
                    return (
                      <span key={numero} className="px-2 py-1 text-xs bg-orange-100 text-orange-700 rounded-full">
                        Grupo #{numero} ({grupo?.totalVacunas.toLocaleString() || 0} vacunas)
                      </span>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
          <div className="flex items-center space-x-3">
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancelar
            </button>
            <button
              onClick={handleConfirm}
              disabled={
                !hayOpcionesDisponibles() ||
                (config.tipoVale === 'solo_adicionales' && (
                  config.gruposEntregasSeleccionados.length === 0 ||
                  getGruposDisponibles().length === 0
                )) ||
                (config.tipoVale !== 'solo_adicionales' && !isTipoDisponible(config.tipoVale))
              }
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center"
            >
              <FileText className="h-4 w-4 mr-2" />
              {!hayOpcionesDisponibles() ? 'No hay opciones disponibles' : 'Generar Vale'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ValeTypeSelectionModal;
