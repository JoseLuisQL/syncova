import React, { useState, useCallback, useMemo, memo } from 'react';
import { X, Package, Syringe, ChevronRight, CheckCircle, AlertCircle, Calendar, FileText, Hash, Truck } from 'lucide-react';
import { Vacuna, Jeringa } from '../../types';
import { COMPONENT_STYLES } from './constants';

interface NuevoIngresoProps {
  onClose: () => void;
  onSuccess: (tipo: 'vacuna' | 'jeringa', data: any) => Promise<void> | void;
  vacunas: Vacuna[];
  jeringas: Jeringa[];
  tipoFijo?: 'vacuna' | 'jeringa';
  isLoadingVacunas?: boolean;
  isLoadingJeringas?: boolean;
}

const NuevoIngreso: React.FC<NuevoIngresoProps> = ({
  onClose,
  onSuccess,
  vacunas,
  jeringas,
  tipoFijo,
  isLoadingVacunas = false,
  isLoadingJeringas = false
}) => {
  const [step, setStep] = useState(tipoFijo ? 2 : 1);
  const [tipo, setTipo] = useState<'vacuna' | 'jeringa' | null>(tipoFijo || null);

  const [formData, setFormData] = useState({
    numero: '',
    fechaIngreso: new Date().toISOString().split('T')[0],
    fechaVencimiento: '',
    formaIngreso: '1° TRIMESTRE' as '1° TRIMESTRE' | '2° TRIMESTRE' | '3° TRIMESTRE' | '4° TRIMESTRE',
    comprobanteClase: 'PECOSA' as 'PECOSA' | 'GUIA' | 'TRASLADO' | 'OTROS',
    numeroComprobante: '',
    cantidadInicial: 0,
    observaciones: '',
    vacunaId: '',
    jeringaId: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateStep = useCallback((currentStep: number): boolean => {
    const newErrors: Record<string, string> = {};

    if (currentStep === 1 && !tipo) {
      newErrors.tipo = 'Debe seleccionar un tipo de ingreso';
    }

    if (currentStep === 2) {
      if (tipo === 'vacuna' && !formData.vacunaId) {
        newErrors.vacunaId = 'Debe seleccionar una vacuna';
      }
      if (tipo === 'jeringa' && !formData.jeringaId) {
        newErrors.jeringaId = 'Debe seleccionar una jeringa';
      }
      if (!formData.numero.trim()) {
        newErrors.numero = 'El numero de lote es obligatorio';
      }
      if (tipo === 'vacuna' && !formData.fechaVencimiento) {
        newErrors.fechaVencimiento = 'La fecha de vencimiento es obligatoria para vacunas';
      } else if (formData.fechaVencimiento) {
        const vencimiento = new Date(formData.fechaVencimiento);
        if (vencimiento <= new Date()) {
          newErrors.fechaVencimiento = 'La fecha de vencimiento debe ser posterior a hoy';
        }
      }
      if (!formData.numeroComprobante.trim()) {
        newErrors.numeroComprobante = 'El numero de comprobante es obligatorio';
      }
      if (formData.cantidadInicial <= 0) {
        newErrors.cantidadInicial = 'La cantidad debe ser mayor a 0';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [tipo, formData]);

  const handleNext = useCallback(() => {
    if (validateStep(step)) {
      setStep(step + 1);
    }
  }, [step, validateStep]);

  const handleBack = useCallback(() => {
    setStep(step - 1);
    setErrors({});
  }, [step]);

  const generateLoteNumber = useCallback(() => {
    const prefix = tipo === 'vacuna'
      ? vacunas.find(v => v.id === formData.vacunaId)?.nombre.substring(0, 3).toUpperCase() || 'VAC'
      : 'JER';
    const year = new Date().getFullYear();
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    return `${prefix}-${year}-${random}`;
  }, [tipo, vacunas, formData.vacunaId]);

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = useCallback(async () => {
    if (!validateStep(2)) return;

    const baseData = {
      numero: formData.numero,
      fechaIngreso: formData.fechaIngreso,
      fechaVencimiento: formData.fechaVencimiento || undefined,
      formaIngreso: formData.formaIngreso,
      comprobanteClase: formData.comprobanteClase,
      numeroComprobante: formData.numeroComprobante,
      cantidadInicial: formData.cantidadInicial,
      observaciones: formData.observaciones,
    };

    setIsSubmitting(true);
    try {
      if (tipo === 'vacuna') {
        const loteVacuna = {
          ...baseData,
          vacunaId: formData.vacunaId,
          fechaVencimiento: formData.fechaVencimiento,
        };
        await onSuccess('vacuna', loteVacuna);
      } else {
        const loteJeringa = {
          ...baseData,
          jeringaId: formData.jeringaId,
        };
        await onSuccess('jeringa', loteJeringa);
      }
      setStep(3);
    } catch (error) {
      // El error se maneja en el padre con toast
    } finally {
      setIsSubmitting(false);
    }
  }, [formData, tipo, validateStep, onSuccess]);

  const activeItems = useMemo(() => {
    if (tipo === 'vacuna') return vacunas;
    return jeringas.filter(j => j.estado === 'activo');
  }, [tipo, vacunas, jeringas]);

  const hasActiveOptions = activeItems.length > 0;
  const isLoading = tipo === 'vacuna' ? isLoadingVacunas : isLoadingJeringas;

  const selectedVacuna = useMemo(() => vacunas.find(v => v.id === formData.vacunaId), [vacunas, formData.vacunaId]);
  const selectedJeringa = useMemo(() => jeringas.find(j => j.id === formData.jeringaId), [jeringas, formData.jeringaId]);

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50" onClick={onClose}>
      <div className="bg-white rounded-2xl max-w-2xl w-full m-4 max-h-[90vh] overflow-y-auto shadow-2xl" onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <div>
            <h2 className="text-xl font-bold text-gray-900">Nuevo Ingreso de Inventario</h2>
            <p className="text-sm text-gray-600 mt-1">Proceso en {step === 3 ? '3' : '2'} pasos</p>
          </div>
          <button onClick={onClose} className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Progress Bar */}
        <div className="px-6 py-4 bg-gradient-to-r from-teal-50 to-cyan-50">
          <div className="flex items-center">
            <StepIndicator step={1} currentStep={step} />
            <div className={`flex-1 h-1 mx-2 rounded ${step >= 2 ? 'bg-teal-500' : 'bg-gray-200'}`} />
            <StepIndicator step={2} currentStep={step} />
            <div className={`flex-1 h-1 mx-2 rounded ${step >= 3 ? 'bg-emerald-500' : 'bg-gray-200'}`} />
            <div className={`flex items-center justify-center w-8 h-8 rounded-full ${
              step >= 3 ? 'bg-emerald-500 text-white' : 'bg-gray-200 text-gray-500'
            }`}>
              <CheckCircle className="h-5 w-5" />
            </div>
          </div>
          <div className="flex justify-between mt-2 text-xs text-gray-600">
            <span>Tipo</span>
            <span>Datos</span>
            <span>Confirmacion</span>
          </div>
        </div>

        <div className="p-6">
          {/* Step 1: Seleccion de Tipo */}
          {step === 1 && !tipoFijo && (
            <div className="space-y-6">
              <div className="text-center">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Que desea ingresar?</h3>
                <p className="text-gray-600">Seleccione el tipo de producto</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <TipoCard
                  tipo="vacuna"
                  selected={tipo === 'vacuna'}
                  onClick={() => setTipo('vacuna')}
                  icon={Package}
                  title="Vacunas"
                  description="Registrar nuevo lote de vacunas"
                />
                <TipoCard
                  tipo="jeringa"
                  selected={tipo === 'jeringa'}
                  onClick={() => setTipo('jeringa')}
                  icon={Syringe}
                  title="Jeringas"
                  description="Registrar nuevo lote de jeringas"
                />
              </div>

              {errors.tipo && (
                <div className="flex items-center text-rose-600 text-sm">
                  <AlertCircle className="h-4 w-4 mr-2" />
                  {errors.tipo}
                </div>
              )}

              <div className="flex justify-end">
                <button
                  onClick={handleNext}
                  disabled={!tipo}
                  className={COMPONENT_STYLES.button.primary}
                >
                  Siguiente
                  <ChevronRight className="h-4 w-4 ml-2" />
                </button>
              </div>
            </div>
          )}

          {/* Step 2: Formulario de Datos */}
          {step === 2 && (
            <div className="space-y-6">
              <div className="text-center">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Datos del {tipo === 'vacuna' ? 'Lote de Vacuna' : 'Lote de Jeringa'}
                </h3>
                <p className="text-gray-600">Complete la informacion del nuevo lote</p>
              </div>

              <div className="space-y-4">
                {/* Seleccion de Producto */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {tipo === 'vacuna' ? 'Vacuna' : 'Jeringa'} *
                  </label>
                  <select
                    value={tipo === 'vacuna' ? formData.vacunaId : formData.jeringaId}
                    onChange={(e) => setFormData({ ...formData, [tipo === 'vacuna' ? 'vacunaId' : 'jeringaId']: e.target.value })}
                    disabled={!hasActiveOptions || isLoading}
                    className={`${COMPONENT_STYLES.input.base} ${
                      errors[tipo === 'vacuna' ? 'vacunaId' : 'jeringaId'] ? 'border-rose-300' : ''
                    } ${(!hasActiveOptions || isLoading) ? 'bg-gray-100 cursor-not-allowed' : ''}`}
                  >
                    <option value="">
                      {isLoading
                        ? `Cargando ${tipo === 'vacuna' ? 'vacunas' : 'jeringas'}...`
                        : hasActiveOptions
                          ? `Seleccionar ${tipo === 'vacuna' ? 'vacuna' : 'jeringa'}`
                          : `No hay ${tipo === 'vacuna' ? 'vacunas' : 'jeringas'} activas disponibles`
                      }
                    </option>
                    {!isLoading && activeItems.map(item => (
                      tipo === 'vacuna' ? (
                        <option key={item.id} value={item.id}>
                          {(item as Vacuna).nombre} - {(item as Vacuna).presentacion}
                        </option>
                      ) : (
                        <option key={item.id} value={item.id}>
                          {(item as Jeringa).tipo} {(item as Jeringa).capacidad} - {(item as Jeringa).color}
                        </option>
                      )
                    ))}
                  </select>
                  {errors[tipo === 'vacuna' ? 'vacunaId' : 'jeringaId'] && (
                    <p className="text-rose-600 text-sm mt-1">{errors[tipo === 'vacuna' ? 'vacunaId' : 'jeringaId']}</p>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Numero de Lote */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <Hash className="h-4 w-4 inline mr-1" />
                      Numero de Lote *
                    </label>
                    <div className="flex">
                      <input
                        type="text"
                        value={formData.numero}
                        onChange={(e) => setFormData({ ...formData, numero: e.target.value })}
                        className={`flex-1 ${COMPONENT_STYLES.input.base} rounded-r-none ${errors.numero ? 'border-rose-300' : ''}`}
                        placeholder="Ej: BCG-2024-001"
                      />
                      <button
                        type="button"
                        onClick={() => setFormData({ ...formData, numero: generateLoteNumber() })}
                        className="px-3 py-2 bg-gray-100 border border-l-0 border-gray-200 rounded-r-xl hover:bg-gray-200 transition-colors text-sm font-medium text-gray-600"
                      >
                        Auto
                      </button>
                    </div>
                    {errors.numero && <p className="text-rose-600 text-sm mt-1">{errors.numero}</p>}
                  </div>

                  {/* Cantidad */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Cantidad Inicial *</label>
                    <input
                      type="number"
                      min="1"
                      value={formData.cantidadInicial || ''}
                      onChange={(e) => setFormData({ ...formData, cantidadInicial: parseInt(e.target.value) || 0 })}
                      className={`${COMPONENT_STYLES.input.base} ${errors.cantidadInicial ? 'border-rose-300' : ''}`}
                      placeholder="0"
                    />
                    {errors.cantidadInicial && <p className="text-rose-600 text-sm mt-1">{errors.cantidadInicial}</p>}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Fecha de Ingreso */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <Calendar className="h-4 w-4 inline mr-1" />
                      Fecha de Ingreso
                    </label>
                    <input
                      type="date"
                      value={formData.fechaIngreso}
                      onChange={(e) => setFormData({ ...formData, fechaIngreso: e.target.value })}
                      className={COMPONENT_STYLES.input.base}
                    />
                  </div>

                  {/* Fecha de Vencimiento */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <Calendar className="h-4 w-4 inline mr-1" />
                      Fecha de Vencimiento {tipo === 'vacuna' ? '*' : '(Opcional)'}
                    </label>
                    <input
                      type="date"
                      value={formData.fechaVencimiento}
                      onChange={(e) => setFormData({ ...formData, fechaVencimiento: e.target.value })}
                      className={`${COMPONENT_STYLES.input.base} ${errors.fechaVencimiento ? 'border-rose-300' : ''}`}
                    />
                    {errors.fechaVencimiento && <p className="text-rose-600 text-sm mt-1">{errors.fechaVencimiento}</p>}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Forma de Ingreso */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <Truck className="h-4 w-4 inline mr-1" />
                      Forma de Ingreso
                    </label>
                    <select
                      value={formData.formaIngreso}
                      onChange={(e) => setFormData({ ...formData, formaIngreso: e.target.value as any })}
                      className={COMPONENT_STYLES.input.base}
                    >
                      <option value="1° TRIMESTRE">1 TRIMESTRE</option>
                      <option value="2° TRIMESTRE">2 TRIMESTRE</option>
                      <option value="3° TRIMESTRE">3 TRIMESTRE</option>
                      <option value="4° TRIMESTRE">4 TRIMESTRE</option>
                    </select>
                  </div>

                  {/* Clase de Comprobante */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <FileText className="h-4 w-4 inline mr-1" />
                      Tipo de Comprobante
                    </label>
                    <select
                      value={formData.comprobanteClase}
                      onChange={(e) => setFormData({ ...formData, comprobanteClase: e.target.value as any })}
                      className={COMPONENT_STYLES.input.base}
                    >
                      <option value="PECOSA">PECOSA</option>
                      <option value="GUIA">GUIA</option>
                      <option value="TRASLADO">TRASLADO</option>
                      <option value="OTROS">OTROS</option>
                    </select>
                  </div>
                </div>

                {/* Numero de Comprobante */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Numero de Comprobante *</label>
                  <input
                    type="text"
                    value={formData.numeroComprobante}
                    onChange={(e) => setFormData({ ...formData, numeroComprobante: e.target.value })}
                    className={`${COMPONENT_STYLES.input.base} ${errors.numeroComprobante ? 'border-rose-300' : ''}`}
                    placeholder="Ej: P-001-2024"
                  />
                  {errors.numeroComprobante && <p className="text-rose-600 text-sm mt-1">{errors.numeroComprobante}</p>}
                </div>

                {/* Observaciones */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Observaciones</label>
                  <textarea
                    value={formData.observaciones}
                    onChange={(e) => setFormData({ ...formData, observaciones: e.target.value })}
                    rows={3}
                    className={COMPONENT_STYLES.input.base}
                    placeholder="Observaciones adicionales (opcional)"
                  />
                </div>
              </div>

              <div className="flex justify-between">
                {!tipoFijo && (
                  <button onClick={handleBack} className={COMPONENT_STYLES.button.secondary}>
                    Anterior
                  </button>
                )}
                <button
                  onClick={handleSubmit}
                  disabled={!hasActiveOptions || isSubmitting}
                  className={`${tipoFijo ? 'ml-auto' : ''} ${hasActiveOptions && !isSubmitting ? COMPONENT_STYLES.button.success : 'px-4 py-2 bg-gray-300 text-gray-500 rounded-xl cursor-not-allowed'}`}
                >
                  {isSubmitting ? 'Registrando...' : 'Registrar Ingreso'}
                </button>
              </div>
            </div>
          )}

          {/* Step 3: Confirmacion */}
          {step === 3 && (
            <div className="space-y-6 text-center">
              <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto">
                <CheckCircle className="h-8 w-8 text-emerald-600" />
              </div>

              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Ingreso Registrado Exitosamente</h3>
                <p className="text-gray-600">
                  El lote <strong>{formData.numero}</strong> ha sido registrado correctamente
                </p>
              </div>

              <div className="bg-gradient-to-r from-teal-50 to-cyan-50 rounded-xl p-4 text-left">
                <h4 className="font-semibold text-gray-900 mb-3">Resumen del ingreso:</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Tipo:</span>
                    <span className="font-medium">{tipo === 'vacuna' ? 'Vacuna' : 'Jeringa'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Producto:</span>
                    <span className="font-medium">
                      {tipo === 'vacuna' ? selectedVacuna?.nombre : `${selectedJeringa?.tipo} ${selectedJeringa?.capacidad}`}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Lote:</span>
                    <span className="font-medium">{formData.numero}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Cantidad:</span>
                    <span className="font-medium">{formData.cantidadInicial.toLocaleString()}</span>
                  </div>
                  {formData.fechaVencimiento && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Vencimiento:</span>
                      <span className="font-medium">{new Date(formData.fechaVencimiento).toLocaleDateString()}</span>
                    </div>
                  )}
                </div>
              </div>

              <button onClick={onClose} className={COMPONENT_STYLES.button.primary}>
                Finalizar
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// ============================================================================
// SUB-COMPONENTS
// ============================================================================

const StepIndicator: React.FC<{ step: number; currentStep: number }> = memo(({ step, currentStep }) => (
  <div className={`flex items-center justify-center w-8 h-8 rounded-full font-semibold text-sm ${
    currentStep >= step ? 'bg-teal-500 text-white' : 'bg-gray-200 text-gray-500'
  }`}>
    {step}
  </div>
));

StepIndicator.displayName = 'StepIndicator';

interface TipoCardProps {
  tipo: 'vacuna' | 'jeringa';
  selected: boolean;
  onClick: () => void;
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  description: string;
}

const TipoCard: React.FC<TipoCardProps> = memo(({ tipo, selected, onClick, icon: Icon, title, description }) => (
  <button
    onClick={onClick}
    className={`p-6 border-2 rounded-xl transition-all ${
      selected
        ? tipo === 'vacuna'
          ? 'border-teal-500 bg-teal-50 text-teal-700'
          : 'border-cyan-500 bg-cyan-50 text-cyan-700'
        : 'border-gray-200 hover:border-gray-300 text-gray-700 hover:bg-gray-50'
    }`}
  >
    <div className={`w-12 h-12 mx-auto mb-3 rounded-xl flex items-center justify-center ${
      selected
        ? tipo === 'vacuna' ? 'bg-teal-500' : 'bg-cyan-500'
        : 'bg-gray-100'
    }`}>
      <Icon className={`h-6 w-6 ${selected ? 'text-white' : 'text-gray-500'}`} />
    </div>
    <h4 className="font-semibold mb-2">{title}</h4>
    <p className="text-sm opacity-75">{description}</p>
  </button>
));

TipoCard.displayName = 'TipoCard';

export default NuevoIngreso;
