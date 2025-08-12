import React, { useState, useMemo } from 'react';
import {
  X,
  FileText,
  Download,
  FileSpreadsheet,
  User,
  Package,
  CheckCircle,
  ArrowRight,
  ArrowLeft,
  Eye,
  Settings,
  Loader2
} from 'lucide-react';
import { ValeEntrega } from '../../services/valesService';
import { useToastContext } from '../../contexts/ToastContext';
import ValeExportService, { ValeExportConfig } from '../../services/valeExportService';

interface ValeExportModalProps {
  vale: ValeEntrega;
  isOpen: boolean;
  onClose: () => void;
  // Nuevas props para exportación global
  valesOriginales?: ValeEntrega[]; // Lista de vales originales para exportación global
  esExportacionGlobal?: boolean; // Flag para indicar si es exportación global
}

// Usar la interfaz del servicio con formatoExportacion opcional para el estado local
interface LocalExportConfig extends Omit<ValeExportConfig, 'formatoExportacion'> {
  formatoExportacion: 'excel' | 'pdf' | null;
}

const ValeExportModal: React.FC<ValeExportModalProps> = ({
  vale,
  isOpen,
  onClose,
  valesOriginales = [],
  esExportacionGlobal = false
}) => {
  const { toast } = useToastContext();
  const [currentStep, setCurrentStep] = useState(1);
  const [isExporting, setIsExporting] = useState(false);
  
  const [config, setConfig] = useState<LocalExportConfig>({
    incluirEntregasBase: true,
    incluirEntregasAdicionales: esExportacionGlobal, // Auto-activar para exportación global
    entregasAdicionalesSeleccionadas: [],
    responsableRecojo: `${vale.usuario.nombres} ${vale.usuario.apellidos}`,
    formatoExportacion: null
  });

  // Obtener entregas adicionales disponibles
  const entregasAdicionalesDisponibles = useMemo(() => {
    if (esExportacionGlobal && valesOriginales.length > 0) {
      // Para exportación global, analizar todos los vales originales
      console.log('🔍 Analizando entregas adicionales de', valesOriginales.length, 'vales para exportación global');
      return ValeExportService.obtenerEntregasAdicionalesDisponiblesGlobal(valesOriginales);
    } else {
      // Para exportación individual, analizar solo el vale actual
      return ValeExportService.obtenerEntregasAdicionalesDisponibles(vale);
    }
  }, [vale, esExportacionGlobal, valesOriginales]);

  // Auto-seleccionar todas las entregas adicionales para exportación global
  React.useEffect(() => {
    if (esExportacionGlobal && entregasAdicionalesDisponibles.length > 0) {
      const todasLasEntregas = entregasAdicionalesDisponibles.map(e => e.numero);
      console.log('🔄 Auto-seleccionando entregas adicionales para exportación global:', todasLasEntregas);

      setConfig(prev => ({
        ...prev,
        incluirEntregasAdicionales: true,
        entregasAdicionalesSeleccionadas: todasLasEntregas
      }));
    }
  }, [esExportacionGlobal, entregasAdicionalesDisponibles]);

  // Calcular estadísticas basadas en la configuración usando el servicio
  const estadisticas = useMemo(() => {
    const configParaStats: ValeExportConfig = {
      ...config,
      formatoExportacion: 'excel' // Valor temporal para el cálculo
    };

    if (esExportacionGlobal && valesOriginales.length > 0) {
      // Para exportación global, calcular estadísticas de todos los vales originales
      console.log('📊 Calculando estadísticas globales de', valesOriginales.length, 'vales');
      return ValeExportService.calcularEstadisticasGlobal(valesOriginales, configParaStats);
    } else {
      // Para exportación individual, calcular estadísticas del vale actual
      return ValeExportService.calcularEstadisticas(vale, configParaStats);
    }
  }, [vale, esExportacionGlobal, valesOriginales, config.incluirEntregasBase, config.incluirEntregasAdicionales, config.entregasAdicionalesSeleccionadas]);

  const handleNext = () => {
    if (currentStep === 1) {
      // Validación simplificada y robusta
      const tieneEntregasBase = config.incluirEntregasBase;
      const tieneEntregasAdicionales = config.entregasAdicionalesSeleccionadas.length > 0;

      // Debe tener al menos una opción seleccionada
      if (!tieneEntregasBase && !tieneEntregasAdicionales) {
        toast.error('Debe seleccionar al menos un tipo de entrega para exportar');
        return;
      }

      console.log('✅ Validación exitosa:', {
        entregasBase: tieneEntregasBase,
        entregasAdicionales: tieneEntregasAdicionales,
        seleccionadas: config.entregasAdicionalesSeleccionadas
      });
    }
    
    if (currentStep === 2) {
      if (!config.responsableRecojo.trim()) {
        toast.error('Debe especificar un responsable de recojo');
        return;
      }
    }
    
    setCurrentStep(prev => Math.min(prev + 1, 3));
  };

  const handleBack = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  const handleExport = async (formato: 'excel' | 'pdf') => {
    setIsExporting(true);
    setConfig(prev => ({ ...prev, formatoExportacion: formato }));

    try {
      // Crear configuración completa para el servicio
      const exportConfig: ValeExportConfig = {
        incluirEntregasBase: config.incluirEntregasBase,
        incluirEntregasAdicionales: config.incluirEntregasAdicionales,
        entregasAdicionalesSeleccionadas: config.entregasAdicionalesSeleccionadas,
        responsableRecojo: config.responsableRecojo,
        formatoExportacion: formato
      };

      // Debug: Ver configuración de exportación
      console.log('🚀 Configuración de exportación:', exportConfig);
      console.log('🔍 Entregas adicionales disponibles:', entregasAdicionalesDisponibles);
      console.log('🔍 Es exportación global:', esExportacionGlobal);
      console.log('🔍 Cantidad de vales originales:', valesOriginales.length);

      // Validar configuración
      const errores = ValeExportService.validarConfiguracion(exportConfig);
      if (errores.length > 0) {
        toast.error(`❌ ${errores.join(', ')}`);
        return;
      }

      // Exportar y descargar - detectar si es exportación global
      if (esExportacionGlobal && valesOriginales.length > 0) {
        console.log('🌍 Ejecutando exportación global para', valesOriginales.length, 'vales');

        // Mostrar toast de progreso para exportaciones grandes
        if (valesOriginales.length > 2) {
          toast.info(
            `🔄 Procesando exportación`,
            `Generando archivo combinado de ${valesOriginales.length} vales. Esto puede tomar unos momentos...`,
            { duration: 5000 }
          );
        }

        await ValeExportService.exportarYDescargarGlobal(valesOriginales, exportConfig);
        toast.success(
          `✅ Exportación global completada`,
          `📄 Archivo combinado de ${valesOriginales.length} vales generado exitosamente con todas las vacunas incluidas.`,
          { duration: 8000 }
        );
      } else {
        console.log('📄 Ejecutando exportación individual para vale:', vale.numero);
        await ValeExportService.exportarYDescargar(vale, exportConfig);
        toast.success(`✅ Vale exportado exitosamente en formato ${formato.toUpperCase()}`);
      }

      onClose();
    } catch (error: any) {
      console.error('Error en exportación:', error);
      toast.error(`❌ Error al exportar vale: ${error.message || error}`);
    } finally {
      setIsExporting(false);
    }
  };

  // Funciones para manejar entregas adicionales
  const handleToggleEntregaAdicional = (numeroEntrega: number) => {
    setConfig(prev => {
      const yaSeleccionada = prev.entregasAdicionalesSeleccionadas.includes(numeroEntrega);
      const nuevasSeleccionadas = yaSeleccionada
        ? prev.entregasAdicionalesSeleccionadas.filter(n => n !== numeroEntrega)
        : [...prev.entregasAdicionalesSeleccionadas, numeroEntrega];

      console.log(`🔄 Toggle entrega ${numeroEntrega}:`, {
        yaSeleccionada,
        nuevasSeleccionadas,
        activarFlag: nuevasSeleccionadas.length > 0
      });

      return {
        ...prev,
        entregasAdicionalesSeleccionadas: nuevasSeleccionadas,
        incluirEntregasAdicionales: nuevasSeleccionadas.length > 0
      };
    });
  };

  const handleToggleTodasEntregasAdicionales = () => {
    const todasSeleccionadas = entregasAdicionalesDisponibles.every(entrega =>
      config.entregasAdicionalesSeleccionadas.includes(entrega.numero)
    );

    if (todasSeleccionadas) {
      // Deseleccionar todas
      setConfig(prev => ({
        ...prev,
        entregasAdicionalesSeleccionadas: [],
        incluirEntregasAdicionales: false
      }));
    } else {
      // Seleccionar todas
      setConfig(prev => ({
        ...prev,
        entregasAdicionalesSeleccionadas: entregasAdicionalesDisponibles.map(e => e.numero),
        incluirEntregasAdicionales: true
      }));
    }
  };

  const resetModal = () => {
    setCurrentStep(1);
    setConfig({
      incluirEntregasBase: true,
      incluirEntregasAdicionales: false,
      entregasAdicionalesSeleccionadas: [],
      responsableRecojo: `${vale.usuario.nombres} ${vale.usuario.apellidos}`,
      formatoExportacion: null
    });
  };

  const handleClose = () => {
    resetModal();
    onClose();
  };

  if (!isOpen || !vale) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 animate-fadeIn p-2 sm:p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-[95vw] sm:max-w-3xl lg:max-w-4xl xl:max-w-5xl max-h-[90vh] flex flex-col overflow-hidden transform transition-all duration-300 animate-slideUp">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50 flex-shrink-0">
          <div className="flex items-center space-x-4">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Download className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">
                {esExportacionGlobal ? 'Exportar Vales Combinados' : 'Exportar Vale de Entrega'}
              </h2>
              <p className="text-sm text-gray-600">
                {esExportacionGlobal
                  ? `${valesOriginales.length} vales - ${vale.centroAcopio.nombre}`
                  : `Vale ${vale.numero} - ${vale.centroAcopio.nombre}`
                }
              </p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="p-2 hover:bg-gray-200 rounded-lg transition-colors"
          >
            <X className="h-5 w-5 text-gray-500" />
          </button>
        </div>

        {/* Progress Steps */}
        <div className="px-6 py-4 bg-gray-50 border-b border-gray-200 flex-shrink-0">
          <div className="flex items-center justify-between">
            {[
              { step: 1, title: 'Contenido', icon: Package },
              { step: 2, title: 'Responsable', icon: User },
              { step: 3, title: 'Formato', icon: FileText }
            ].map(({ step, title, icon: Icon }) => (
              <div key={step} className="flex items-center">
                <div className={`flex items-center justify-center w-8 h-8 rounded-full border-2 ${
                  currentStep >= step
                    ? 'bg-blue-600 border-blue-600 text-white'
                    : 'bg-white border-gray-300 text-gray-400'
                }`}>
                  {currentStep > step ? (
                    <CheckCircle className="h-5 w-5" />
                  ) : (
                    <Icon className="h-4 w-4" />
                  )}
                </div>
                <span className={`ml-2 text-sm font-medium ${
                  currentStep >= step ? 'text-blue-600' : 'text-gray-400'
                }`}>
                  {title}
                </span>
                {step < 3 && (
                  <ArrowRight className="h-4 w-4 text-gray-300 mx-4" />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {/* Paso 1: Selección de Contenido */}
          {currentStep === 1 && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Seleccione el contenido a exportar
                </h3>
                <p className="text-sm text-gray-600 mb-6">
                  Elija qué tipos de entregas desea incluir en la exportación
                </p>
              </div>

              <div className="space-y-4">
                {/* Entregas Base */}
                <div className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors">
                  <label className="flex items-start space-x-3 cursor-pointer">
                    <div className="flex items-center h-5">
                      <button
                        type="button"
                        onClick={() => setConfig(prev => ({ ...prev, incluirEntregasBase: !prev.incluirEntregasBase }))}
                        className="flex items-center justify-center w-5 h-5 rounded border-2 border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                      >
                        {config.incluirEntregasBase && (
                          <CheckCircle className="h-4 w-4 text-blue-600" />
                        )}
                      </button>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center space-x-2">
                        <span className="text-sm font-medium text-gray-900">
                          Entregas Base (Programadas)
                        </span>
                        <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                          Recomendado
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 mt-1">
                        Incluye las entregas programadas mensualmente según la planificación
                      </p>
                    </div>
                  </label>
                </div>

                {/* Entregas Adicionales */}
                {entregasAdicionalesDisponibles.length > 0 && (
                  <div className="border border-gray-200 rounded-lg p-4 space-y-4">
                    {/* Header de Entregas Adicionales */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <span className="text-sm font-medium text-gray-900">
                          Entregas Adicionales
                        </span>
                        <span className="px-2 py-1 bg-orange-100 text-orange-800 text-xs rounded-full">
                          Opcional
                        </span>
                        <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                          {entregasAdicionalesDisponibles.length} disponibles
                        </span>
                      </div>

                      {entregasAdicionalesDisponibles.length > 1 && (
                        <button
                          type="button"
                          onClick={handleToggleTodasEntregasAdicionales}
                          className="text-xs text-orange-600 hover:text-orange-700 font-medium"
                        >
                          {entregasAdicionalesDisponibles.every(entrega =>
                            config.entregasAdicionalesSeleccionadas.includes(entrega.numero)
                          ) ? 'Deseleccionar todas' : 'Seleccionar todas'}
                        </button>
                      )}
                    </div>

                    <p className="text-sm text-gray-600">
                      Seleccione las entregas adicionales específicas que desea incluir
                    </p>

                    {/* Lista de Entregas Adicionales */}
                    <div className="space-y-2 max-h-48 overflow-y-auto">
                      {entregasAdicionalesDisponibles.map((entrega) => (
                        <div
                          key={entrega.numero}
                          className="flex items-center justify-between p-3 bg-orange-50 rounded-lg border border-orange-200 hover:bg-orange-100 transition-colors"
                        >
                          <label className="flex items-center space-x-3 cursor-pointer flex-1">
                            <div className="flex items-center h-5">
                              <button
                                type="button"
                                onClick={() => handleToggleEntregaAdicional(entrega.numero)}
                                className="flex items-center justify-center w-5 h-5 rounded border-2 border-orange-600 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2"
                              >
                                {config.entregasAdicionalesSeleccionadas.includes(entrega.numero) && (
                                  <CheckCircle className="h-4 w-4 text-orange-600" />
                                )}
                              </button>
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center space-x-2">
                                <span className="text-sm font-medium text-gray-900">
                                  {entrega.descripcion}
                                </span>
                              </div>
                              <div className="flex items-center space-x-4 text-xs text-gray-600 mt-1">
                                <span>{entrega.totalVacunas.toLocaleString()} vacunas</span>
                                <span>{entrega.totalEstablecimientos} establecimientos</span>
                              </div>
                            </div>
                          </label>
                        </div>
                      ))}
                    </div>

                    {config.entregasAdicionalesSeleccionadas.length > 0 && (
                      <div className="bg-orange-100 border border-orange-200 rounded-lg p-3">
                        <div className="text-sm text-orange-800">
                          <strong>✅ Seleccionadas:</strong> {config.entregasAdicionalesSeleccionadas.length} de {entregasAdicionalesDisponibles.length} entregas adicionales
                        </div>
                        <div className="text-xs text-orange-700 mt-1">
                          <strong>Entregas:</strong> {config.entregasAdicionalesSeleccionadas.sort((a, b) => a - b).join(', ')}
                        </div>
                        <div className="text-xs text-green-700 mt-1 font-medium">
                          ✓ Listo para exportar
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Mensaje cuando no hay entregas adicionales */}
                {entregasAdicionalesDisponibles.length === 0 && (
                  <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                    <div className="flex items-center space-x-2">
                      <span className="text-sm font-medium text-gray-500">
                        Entregas Adicionales
                      </span>
                      <span className="px-2 py-1 bg-gray-200 text-gray-600 text-xs rounded-full">
                        No disponibles
                      </span>
                    </div>
                    <p className="text-sm text-gray-500 mt-1">
                      Este vale no tiene entregas adicionales registradas
                    </p>
                  </div>
                )}
              </div>

              {/* Vista Previa */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-center space-x-2 mb-3">
                  <Eye className="h-5 w-5 text-blue-600" />
                  <span className="font-medium text-blue-900">Vista Previa</span>
                </div>
                <div className="grid grid-cols-3 gap-4 text-sm">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">{estadisticas.totalVacunas.toLocaleString()}</div>
                    <div className="text-blue-800">Vacunas</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">{estadisticas.totalEstablecimientos}</div>
                    <div className="text-blue-800">Establecimientos</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">{estadisticas.totalEntregas}</div>
                    <div className="text-blue-800">Entregas</div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Paso 2: Configuración del Responsable */}
          {currentStep === 2 && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Responsable de Recojo
                </h3>
                <p className="text-sm text-gray-600 mb-6">
                  Configure el responsable que aparecerá en el documento exportado
                </p>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nombre del Responsable
                  </label>
                  <input
                    type="text"
                    value={config.responsableRecojo}
                    onChange={(e) => setConfig(prev => ({ ...prev, responsableRecojo: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Ingrese el nombre del responsable"
                  />
                </div>

                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <div className="flex items-start space-x-2">
                    <Settings className="h-5 w-5 text-yellow-600 mt-0.5" />
                    <div>
                      <h4 className="text-sm font-medium text-yellow-900">Configuración Temporal</h4>
                      <p className="text-sm text-yellow-800 mt-1">
                        Esta modificación solo afecta al documento exportado. 
                        El responsable original del vale permanece sin cambios.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex space-x-3">
                  <button
                    onClick={() => setConfig(prev => ({ ...prev, responsableRecojo: '' }))}
                    className="px-4 py-2 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                  >
                    Limpiar
                  </button>
                  <button
                    onClick={() => setConfig(prev => ({ ...prev, responsableRecojo: `${vale.usuario.nombres} ${vale.usuario.apellidos}` }))}
                    className="px-4 py-2 text-sm bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors"
                  >
                    Restaurar Original
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Paso 3: Formato de Exportación */}
          {currentStep === 3 && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Formato de Exportación
                </h3>
                <p className="text-sm text-gray-600 mb-6">
                  Seleccione el formato en el que desea exportar el vale
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Opción Excel */}
                <button
                  onClick={() => handleExport('excel')}
                  disabled={isExporting}
                  className="p-6 border-2 border-green-200 rounded-lg hover:border-green-400 hover:bg-green-50 transition-all duration-200 text-left disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <div className="flex items-center space-x-4">
                    <div className="p-3 bg-green-100 rounded-lg">
                      <FileSpreadsheet className="h-8 w-8 text-green-600" />
                    </div>
                    <div>
                      <h4 className="text-lg font-semibold text-gray-900">Excel</h4>
                      <p className="text-sm text-gray-600">
                        Formato editable con tablas y cálculos
                      </p>
                      <div className="flex items-center space-x-2 mt-2">
                        <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded">
                          Recomendado
                        </span>
                        <span className="text-xs text-gray-500">
                          .xlsx
                        </span>
                      </div>
                    </div>
                  </div>
                </button>

                {/* Opción PDF */}
                <button
                  onClick={() => handleExport('pdf')}
                  disabled={isExporting}
                  className="p-6 border-2 border-red-200 rounded-lg hover:border-red-400 hover:bg-red-50 transition-all duration-200 text-left disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <div className="flex items-center space-x-4">
                    <div className="p-3 bg-red-100 rounded-lg">
                      <FileText className="h-8 w-8 text-red-600" />
                    </div>
                    <div>
                      <h4 className="text-lg font-semibold text-gray-900">PDF</h4>
                      <p className="text-sm text-gray-600">
                        Formato profesional para impresión
                      </p>
                      <div className="flex items-center space-x-2 mt-2">
                        <span className="px-2 py-1 bg-red-100 text-red-800 text-xs rounded">
                          Oficial
                        </span>
                        <span className="text-xs text-gray-500">
                          .pdf
                        </span>
                      </div>
                    </div>
                  </div>
                </button>
              </div>

              {isExporting && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-center space-x-3">
                    <Loader2 className="h-5 w-5 text-blue-600 animate-spin" />
                    <span className="text-blue-900 font-medium">
                      Generando exportación...
                    </span>
                  </div>
                  <p className="text-sm text-blue-700 mt-2">
                    Por favor espere mientras se procesa el documento
                  </p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-6 border-t border-gray-200 bg-gray-50 flex-shrink-0">
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-600">
              Paso {currentStep} de 3
            </span>
          </div>
          
          <div className="flex items-center space-x-3">
            {currentStep > 1 && (
              <button
                onClick={handleBack}
                disabled={isExporting}
                className="flex items-center px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Anterior
              </button>
            )}
            
            {currentStep < 3 && (
              <button
                onClick={handleNext}
                className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Siguiente
                <ArrowRight className="h-4 w-4 ml-2" />
              </button>
            )}
            
            <button
              onClick={handleClose}
              disabled={isExporting}
              className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Cancelar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ValeExportModal;
