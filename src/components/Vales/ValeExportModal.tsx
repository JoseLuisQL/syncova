import React, { useState, useMemo, useEffect, useCallback, memo } from 'react';
import {
  FileText, DownloadSimple, FileXls, User, Package, CheckCircle, ArrowRight, ArrowLeft, Eye, Gear, SpinnerGap
} from '@phosphor-icons/react';
import { ValeEntrega } from '../../services/valesService';
import { useToastContext } from '../../contexts/ToastContext';
import ValeExportService, { ValeExportConfig } from '../../services/valeExportService';
import { Modal, FormSection } from '../ui/ModalElements';
import { MODAL_STYLES } from '../ui/ModalConstants';

interface ValeExportModalProps {
  vale: ValeEntrega;
  isOpen: boolean;
  onClose: () => void;
  valesOriginales?: ValeEntrega[];
  esExportacionGlobal?: boolean;
  esExportacionIndividual?: boolean;
}

interface LocalExportConfig extends Omit<ValeExportConfig, 'formatoExportacion'> {
  formatoExportacion: 'excel' | 'pdf' | null;
}

// Componente de paso del wizard
const StepIndicator = memo<{
  step: number;
  currentStep: number;
  title: string;
  icon: React.ElementType;
  isLast?: boolean;
}>(({ step, currentStep, title, icon: Icon, isLast }) => (
  <div className="flex items-center">
    <div className={`flex items-center justify-center w-8 h-8 rounded-full border-2 ${
      currentStep >= step
        ? 'bg-teal-600 border-teal-600 text-white'
        : 'bg-white border-gray-300 text-gray-400'
    }`}>
      {currentStep > step ? (
        <CheckCircle weight="bold" className="h-5 w-5" />
      ) : (
        <Icon className="h-4 w-4" />
      )}
    </div>
    <span className={`ml-2 text-sm font-medium ${
      currentStep >= step ? 'text-zinc-600' : 'text-gray-400'
    }`}>
      {title}
    </span>
    {!isLast && <ArrowRight className="h-4 w-4 text-gray-300 mx-4" />}
  </div>
));

StepIndicator.displayName = 'StepIndicator';

// Componente de checkbox personalizado
const CheckboxOption = memo<{
  checked: boolean;
  onChange: () => void;
  label: string;
  description?: string;
  badge?: { text: string; color: string };
  color?: 'teal' | 'amber';
}>(({ checked, onChange, label, description, badge, color = 'teal' }) => {
  const colorClasses = color === 'teal'
    ? { border: 'border-teal-600', icon: 'text-zinc-600', bg: 'hover:bg-zinc-50' }
    : { border: 'border-amber-600', icon: 'text-zinc-600', bg: 'hover:bg-amber-50' };

  return (
    <label className={`flex items-start space-x-3 cursor-pointer p-3 rounded-lg ${colorClasses.bg} transition-colors`}>
      <button
        type="button"
        onClick={onChange}
        className={`flex items-center justify-center w-5 h-5 rounded border-2 ${colorClasses.border} focus:outline-none focus:ring-2 focus:ring-offset-2`}
      >
        {checked && <CheckCircle weight="bold" className={`h-4 w-4 ${colorClasses.icon}`} />}
      </button>
      <div className="flex-1">
        <div className="flex items-center space-x-2">
          <span className="text-sm font-medium text-gray-900">{label}</span>
          {badge && (
            <span className={`px-2 py-0.5 text-xs rounded-full ${badge.color}`}>
              {badge.text}
            </span>
          )}
        </div>
        {description && (
          <p className="text-sm text-gray-600 mt-0.5">{description}</p>
        )}
      </div>
    </label>
  );
});

CheckboxOption.displayName = 'CheckboxOption';

// Componente de formato de exportación
const FormatOption = memo<{
  format: 'excel' | 'pdf';
  isExporting: boolean;
  onExport: (format: 'excel' | 'pdf') => void;
}>(({ format, isExporting, onExport }) => {
  const isExcel = format === 'excel';
  const config = isExcel
    ? {
        icon: FileXls,
        title: 'Excel',
        description: 'Formato editable con tablas y cálculos',
        badge: 'Recomendado',
        extension: '.xlsx',
        colors: 'border-green-200 hover:border-green-400 hover:bg-green-50',
        iconBg: 'bg-green-100',
        iconColor: 'text-green-600',
        badgeColor: 'bg-green-100 text-green-800'
      }
    : {
        icon: FileText,
        title: 'PDF',
        description: 'Formato profesional para impresión',
        badge: 'Oficial',
        extension: '.pdf',
        colors: 'border-red-200 hover:border-red-400 hover:bg-red-50',
        iconBg: 'bg-red-100',
        iconColor: 'text-red-600',
        badgeColor: 'bg-red-100 text-red-800'
      };

  const Icon = config.icon;

  return (
    <button
      onClick={() => onExport(format)}
      disabled={isExporting}
      className={`p-6 border-2 rounded-xl ${config.colors} transition-all text-left disabled:opacity-50 disabled:cursor-not-allowed`}
    >
      <div className="flex items-center space-x-4">
        <div className={`p-3 ${config.iconBg} rounded-lg`}>
          <Icon className={`h-8 w-8 ${config.iconColor}`} />
        </div>
        <div>
          <h4 className="text-lg font-semibold text-gray-900">{config.title}</h4>
          <p className="text-sm text-gray-600">{config.description}</p>
          <div className="flex items-center space-x-2 mt-2">
            <span className={`px-2 py-1 text-xs rounded ${config.badgeColor}`}>
              {config.badge}
            </span>
            <span className="text-xs text-gray-500">{config.extension}</span>
          </div>
        </div>
      </div>
    </button>
  );
});

FormatOption.displayName = 'FormatOption';

const ValeExportModal: React.FC<ValeExportModalProps> = ({
  vale,
  isOpen,
  onClose,
  valesOriginales = [],
  esExportacionGlobal = false,
  esExportacionIndividual = false
}) => {
  const { toast } = useToastContext();
  const startStep = (esExportacionGlobal || esExportacionIndividual) ? 2 : 1;
  const [currentStep, setCurrentStep] = useState(startStep);
  const [isExporting, setIsExporting] = useState(false);

  const [config, setConfig] = useState<LocalExportConfig>({
    incluirEntregasBase: true,
    incluirEntregasAdicionales: esExportacionGlobal || esExportacionIndividual,
    entregasAdicionalesSeleccionadas: [],
    responsableRecojo: `${vale.usuario.nombres} ${vale.usuario.apellidos}`,
    formatoExportacion: null
  });

  // Entregas adicionales disponibles
  const entregasAdicionalesDisponibles = useMemo(() => {
    if (esExportacionGlobal && valesOriginales.length > 0) {
      return ValeExportService.obtenerEntregasAdicionalesDisponiblesGlobal(valesOriginales);
    }
    return ValeExportService.obtenerEntregasAdicionalesDisponibles(vale);
  }, [vale, esExportacionGlobal, valesOriginales]);

  // Auto-seleccionar entregas para exportaciones desde tabla
  useEffect(() => {
    if ((esExportacionGlobal || esExportacionIndividual) && entregasAdicionalesDisponibles.length > 0) {
      setConfig(prev => ({
        ...prev,
        incluirEntregasAdicionales: true,
        entregasAdicionalesSeleccionadas: entregasAdicionalesDisponibles.map(e => e.numero)
      }));
    }
  }, [esExportacionGlobal, esExportacionIndividual, entregasAdicionalesDisponibles]);

  // Estadísticas
  const estadisticas = useMemo(() => {
    const configParaStats: ValeExportConfig = { ...config, formatoExportacion: 'excel' };
    if (esExportacionGlobal && valesOriginales.length > 0) {
      return ValeExportService.calcularEstadisticasGlobal(valesOriginales, configParaStats);
    }
    return ValeExportService.calcularEstadisticas(vale, configParaStats);
  }, [vale, esExportacionGlobal, valesOriginales, config]);

  // Handlers
  const handleNext = useCallback(() => {
    if (currentStep === 1) {
      const tieneEntregas = config.incluirEntregasBase || config.entregasAdicionalesSeleccionadas.length > 0;
      if (!tieneEntregas) {
        toast.error('Debe seleccionar al menos un tipo de entrega');
        return;
      }
    }
    if (currentStep === 2 && !config.responsableRecojo.trim()) {
      toast.error('Debe especificar un responsable de recojo');
      return;
    }
    setCurrentStep(prev => Math.min(prev + 1, 3));
  }, [currentStep, config, toast]);

  const handleBack = useCallback(() => {
    if ((esExportacionGlobal || esExportacionIndividual) && currentStep === 2) return;
    setCurrentStep(prev => Math.max(prev - 1, 1));
  }, [esExportacionGlobal, esExportacionIndividual, currentStep]);

  const handleExport = useCallback(async (formato: 'excel' | 'pdf') => {
    setIsExporting(true);
    try {
      const exportConfig: ValeExportConfig = { ...config, formatoExportacion: formato };
      const errores = ValeExportService.validarConfiguracion(exportConfig);

      if (errores.length > 0) {
        toast.error(errores.join(', '));
        return;
      }

      if (esExportacionGlobal && valesOriginales.length > 0) {
        if (valesOriginales.length > 2) {
          toast.info('Procesando exportación', `Generando archivo de ${valesOriginales.length} vales...`, { duration: 5000 });
        }
        await ValeExportService.exportarYDescargarGlobal(valesOriginales, exportConfig);
        toast.success('Exportación completada', `Archivo de ${valesOriginales.length} vales generado`, { duration: 6000 });
      } else {
        await ValeExportService.exportarYDescargar(vale, exportConfig);
        toast.success(`Vale exportado en formato ${formato.toUpperCase()}`);
      }
      onClose();
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : 'Error desconocido';
      toast.error(`Error al exportar: ${msg}`);
    } finally {
      setIsExporting(false);
    }
  }, [config, esExportacionGlobal, valesOriginales, vale, onClose, toast]);

  const handleToggleEntrega = useCallback((numero: number) => {
    setConfig(prev => {
      const yaSeleccionada = prev.entregasAdicionalesSeleccionadas.includes(numero);
      const nuevas = yaSeleccionada
        ? prev.entregasAdicionalesSeleccionadas.filter(n => n !== numero)
        : [...prev.entregasAdicionalesSeleccionadas, numero];
      return {
        ...prev,
        entregasAdicionalesSeleccionadas: nuevas,
        incluirEntregasAdicionales: nuevas.length > 0
      };
    });
  }, []);

  const handleToggleTodas = useCallback(() => {
    const todasSeleccionadas = entregasAdicionalesDisponibles.every(e =>
      config.entregasAdicionalesSeleccionadas.includes(e.numero)
    );
    setConfig(prev => ({
      ...prev,
      entregasAdicionalesSeleccionadas: todasSeleccionadas ? [] : entregasAdicionalesDisponibles.map(e => e.numero),
      incluirEntregasAdicionales: !todasSeleccionadas
    }));
  }, [entregasAdicionalesDisponibles, config.entregasAdicionalesSeleccionadas]);

  const handleClose = useCallback(() => {
    setCurrentStep(startStep);
    setConfig({
      incluirEntregasBase: true,
      incluirEntregasAdicionales: false,
      entregasAdicionalesSeleccionadas: [],
      responsableRecojo: `${vale.usuario.nombres} ${vale.usuario.apellidos}`,
      formatoExportacion: null
    });
    onClose();
  }, [startStep, vale, onClose]);

  if (!isOpen || !vale) return null;

  const isFromTable = esExportacionGlobal || esExportacionIndividual;
  const totalSteps = isFromTable ? 2 : 3;
  const displayStep = isFromTable ? currentStep - 1 : currentStep;

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title={esExportacionGlobal ? 'Exportar Vales Combinados' : `Exportar Vale "${vale.numero}"`}
      subtitle={esExportacionGlobal
        ? `${valesOriginales.length} vales - ${vale.centroAcopio.nombre}`
        : `Vale ${vale.numero} - ${vale.centroAcopio.nombre}`}
      icon={DownloadSimple}
      size="lg"
      footer={
        <div className="flex w-full items-center justify-between">
          <span className="text-sm font-medium text-zinc-600">Paso {displayStep} de {totalSteps}</span>

          <div className="flex items-center gap-3">
            {currentStep > 1 && !(isFromTable && currentStep === 2) && (
              <button
                onClick={handleBack}
                disabled={isExporting}
                className={MODAL_STYLES.button.secondary}
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Anterior
              </button>
            )}

            {currentStep < 3 && (
              <button
                onClick={handleNext}
                className={MODAL_STYLES.button.primary}
              >
                Siguiente
                <ArrowRight className="h-4 w-4 ml-2" />
              </button>
            )}

            <button
              onClick={handleClose}
              disabled={isExporting}
              className={MODAL_STYLES.button.secondary}
            >
              Cancelar
            </button>
          </div>
        </div>
      }
    >
      {/* Progress Steps */}
      <div className="mb-6 flex items-center justify-center border-b border-zinc-100 pb-4">
        {!isFromTable && (
          <StepIndicator step={1} currentStep={currentStep} title="Contenido" icon={Package} />
        )}
        <StepIndicator step={2} currentStep={currentStep} title="Responsable" icon={User} isLast={isFromTable && currentStep < 3} />
        <StepIndicator step={3} currentStep={currentStep} title="Formato" icon={FileText} isLast />
      </div>

      <div className="space-y-6">
        {/* Paso 1: Contenido */}
        {currentStep === 1 && !isFromTable && (
          <div className="space-y-6">
            <FormSection title="Contenido de Exportación" description="Elija qué entregas desea incluir en la exportación">
              <div className="space-y-3">
                {/* Entregas Base */}
                <div className="border border-zinc-200 rounded-xl p-4">
                  <CheckboxOption
                    checked={config.incluirEntregasBase}
                    onChange={() => setConfig(prev => ({ ...prev, incluirEntregasBase: !prev.incluirEntregasBase }))}
                    label="Entregas Base (Programadas)"
                    description="Entregas programadas según la planificación mensual"
                    badge={{ text: 'Recomendado', color: 'bg-zinc-100 text-teal-800' }}
                    color="teal"
                  />
                </div>

                {/* Entregas Adicionales */}
                {entregasAdicionalesDisponibles.length > 0 && (
                  <div className="border border-zinc-200 rounded-xl p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-zinc-900">Entregas Adicionales</span>
                        <span className="px-2 py-0.5 bg-amber-100 text-amber-800 text-xs rounded-full">
                          {entregasAdicionalesDisponibles.length} disponibles
                        </span>
                      </div>
                      {entregasAdicionalesDisponibles.length > 1 && (
                        <button
                          onClick={handleToggleTodas}
                          className="text-xs text-zinc-600 hover:text-amber-700 font-medium"
                        >
                          {entregasAdicionalesDisponibles.every(e => config.entregasAdicionalesSeleccionadas.includes(e.numero))
                            ? 'Deseleccionar todas'
                            : 'Seleccionar todas'}
                        </button>
                      )}
                    </div>

                    <div className="space-y-2 max-h-48 overflow-y-auto pr-2">
                      {entregasAdicionalesDisponibles.map(entrega => (
                        <div
                          key={entrega.numero}
                          className="flex items-center justify-between p-3 bg-zinc-50 rounded-lg border border-zinc-200"
                        >
                          <CheckboxOption
                            checked={config.entregasAdicionalesSeleccionadas.includes(entrega.numero)}
                            onChange={() => handleToggleEntrega(entrega.numero)}
                            label={entrega.descripcion}
                            description={`${entrega.totalVacunas.toLocaleString()} vacunas • ${entrega.totalEstablecimientos} establecimientos`}
                            color="amber"
                          />
                        </div>
                      ))}
                    </div>

                    {config.entregasAdicionalesSeleccionadas.length > 0 && (
                      <div className="bg-amber-100 border border-amber-200 rounded-lg p-3 text-sm text-amber-800">
                        <strong>Seleccionadas:</strong> {config.entregasAdicionalesSeleccionadas.length} de {entregasAdicionalesDisponibles.length}
                      </div>
                    )}
                  </div>
                )}

                {entregasAdicionalesDisponibles.length === 0 && (
                  <div className="border border-zinc-200 rounded-xl p-4 bg-zinc-50">
                    <span className="text-sm text-zinc-500">No hay entregas adicionales para este vale</span>
                  </div>
                )}
              </div>
            </FormSection>

            {/* Vista Previa */}
            <div className="bg-zinc-50 border border-zinc-200 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-3">
                <Eye className="h-5 w-5 text-zinc-600" />
                <span className="font-medium text-teal-800">Vista Previa</span>
              </div>
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <div className="text-2xl font-bold text-zinc-900">{estadisticas.totalVacunas.toLocaleString()}</div>
                  <div className="text-sm text-zinc-600">Vacunas</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-zinc-900">{estadisticas.totalEstablecimientos}</div>
                  <div className="text-sm text-zinc-600">Establecimientos</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-zinc-900">{estadisticas.totalEntregas}</div>
                  <div className="text-sm text-zinc-600">Entregas</div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Paso 2: Responsable */}
        {currentStep === 2 && (
          <div className="space-y-6">
            {isFromTable && (
              <div className="bg-zinc-50 border border-zinc-200 rounded-xl p-4">
                <div className="flex items-start gap-3">
                  <CheckCircle weight="bold" className="h-5 w-5 text-zinc-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-sm font-semibold text-teal-900">Contenido seleccionado</h4>
                    <p className="text-sm text-zinc-700 mt-1">
                      {esExportacionGlobal
                        ? `Se exportarán ${valesOriginales.length} vales con todas las entregas.`
                        : `Se exportará el vale "${vale.numero}" con todas las entregas.`}
                    </p>
                  </div>
                </div>
              </div>
            )}

            <FormSection title="Responsable de Recojo" description="Configure el responsable del documento impreso">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-zinc-700 mb-2">
                    Nombre del Responsable
                  </label>
                  <input
                    type="text"
                    value={config.responsableRecojo}
                    onChange={e => setConfig(prev => ({ ...prev, responsableRecojo: e.target.value }))}
                    className={MODAL_STYLES.input.base}
                    placeholder="Ingrese el nombre del responsable"
                  />
                </div>

                <div className="bg-zinc-50 border border-zinc-200 rounded-xl p-4">
                  <div className="flex items-start gap-2">
                    <Gear className="h-5 w-5 text-zinc-600 mt-0.5" />
                    <div>
                      <h4 className="text-sm font-medium text-zinc-900">Configuración Temporal</h4>
                      <p className="text-sm text-zinc-600 mt-1">
                        Esta modificación solo afecta al documento exportado.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={() => setConfig(prev => ({ ...prev, responsableRecojo: '' }))}
                    className="px-4 py-2 text-sm bg-zinc-100 text-zinc-700 rounded-lg hover:bg-zinc-200 transition-colors"
                  >
                    Limpiar
                  </button>
                  <button
                    onClick={() => setConfig(prev => ({ ...prev, responsableRecojo: `${vale.usuario.nombres} ${vale.usuario.apellidos}` }))}
                    className="px-4 py-2 text-sm bg-zinc-100 text-zinc-700 rounded-lg hover:bg-zinc-200 transition-colors"
                  >
                    Restaurar Original
                  </button>
                </div>
              </div>
            </FormSection>
          </div>
        )}

        {/* Paso 3: Formato */}
        {currentStep === 3 && (
          <div className="space-y-6">
            <FormSection title="Formato de Exportación" description="Seleccione la extensión final de los Vales solicitados">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormatOption format="excel" isExporting={isExporting} onExport={handleExport} />
                <FormatOption format="pdf" isExporting={isExporting} onExport={handleExport} />
              </div>
            </FormSection>

            {isExporting && (
              <div className="bg-zinc-50 border border-zinc-200 rounded-xl p-4">
                <div className="flex items-center gap-3">
                  <SpinnerGap weight="bold" className="h-5 w-5 text-zinc-600 animate-spin" />
                  <span className="text-zinc-900 font-medium">Generando exportación...</span>
                </div>
                <p className="text-sm text-zinc-700 mt-2">Por favor espere mientras se procesan los lotes y establecimientos</p>
              </div>
            )}
          </div>
        )}
      </div>
    </Modal>
  );
};

export default ValeExportModal;
