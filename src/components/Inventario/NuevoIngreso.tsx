import React, { useState } from 'react';
import { X, Package, Syringe, ChevronRight, CheckCircle, AlertCircle, Calendar, FileText, Hash, Truck } from 'lucide-react';
import { Vacuna, Jeringa, Lote, LoteJeringa } from '../../types';

interface NuevoIngresoProps {
  onClose: () => void;
  onSuccess: (tipo: 'vacuna' | 'jeringa', data: any) => void;
  vacunas: Vacuna[];
  jeringas: Jeringa[];
  tipoFijo?: 'vacuna' | 'jeringa'; // Nuevo prop para forzar un tipo específico
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
  const [step, setStep] = useState(tipoFijo ? 2 : 1); // Saltar paso 1 si el tipo está fijo
  const [tipo, setTipo] = useState<'vacuna' | 'jeringa' | null>(tipoFijo || null);

  // Debug: Log props to console
  React.useEffect(() => {
    console.log('🔍 NuevoIngreso Debug Info:');
    console.log('- tipoFijo:', tipoFijo);
    console.log('- vacunas:', vacunas);
    console.log('- jeringas:', jeringas);
    console.log('- vacunas activas:', vacunas.filter(v => v.estado === 'activo'));
    console.log('- jeringas activas:', jeringas.filter(j => j.estado === 'activo'));
    console.log('- isLoadingVacunas:', isLoadingVacunas);
    console.log('- isLoadingJeringas:', isLoadingJeringas);
  }, [vacunas, jeringas, tipoFijo, isLoadingVacunas, isLoadingJeringas]);
  const [formData, setFormData] = useState({
    // Campos comunes
    numero: '',
    fechaIngreso: new Date().toISOString().split('T')[0],
    fechaVencimiento: '',
    formaIngreso: '1° TRIMESTRE' as '1° TRIMESTRE' | '2° TRIMESTRE' | '3° TRIMESTRE' | '4° TRIMESTRE',
    comprobanteClase: 'PECOSA' as 'PECOSA' | 'GUIA' | 'TRASLADO' | 'OTROS',
    numeroComprobante: '',
    cantidadInicial: 0,
    observaciones: '',
    // Específicos
    vacunaId: '',
    jeringaId: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateStep = (currentStep: number): boolean => {
    const newErrors: Record<string, string> = {};

    if (currentStep === 1) {
      if (!tipo) {
        newErrors.tipo = 'Debe seleccionar un tipo de ingreso';
      }
    }

    if (currentStep === 2) {
      if (tipo === 'vacuna' && !formData.vacunaId) {
        newErrors.vacunaId = 'Debe seleccionar una vacuna';
      }
      if (tipo === 'jeringa' && !formData.jeringaId) {
        newErrors.jeringaId = 'Debe seleccionar una jeringa';
      }
      if (!formData.numero.trim()) {
        newErrors.numero = 'El número de lote es obligatorio';
      }
      // La fecha de vencimiento es obligatoria solo para vacunas
      if (tipo === 'vacuna' && !formData.fechaVencimiento) {
        newErrors.fechaVencimiento = 'La fecha de vencimiento es obligatoria para vacunas';
      } else if (formData.fechaVencimiento) {
        const vencimiento = new Date(formData.fechaVencimiento);
        const hoy = new Date();
        if (vencimiento <= hoy) {
          newErrors.fechaVencimiento = 'La fecha de vencimiento debe ser posterior a hoy';
        }
      }
      if (!formData.numeroComprobante.trim()) {
        newErrors.numeroComprobante = 'El número de comprobante es obligatorio';
      }
      if (formData.cantidadInicial <= 0) {
        newErrors.cantidadInicial = 'La cantidad debe ser mayor a 0';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep(step)) {
      setStep(step + 1);
    }
  };

  const handleBack = () => {
    setStep(step - 1);
    setErrors({});
  };

  const generateLoteNumber = () => {
    const prefix = tipo === 'vacuna' 
      ? vacunas.find(v => v.id === formData.vacunaId)?.nombre.substring(0, 3).toUpperCase() || 'VAC'
      : 'JER';
    const year = new Date().getFullYear();
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    return `${prefix}-${year}-${random}`;
  };

  const handleSubmit = () => {
    if (!validateStep(2)) return;

    const baseData = {
      id: Date.now().toString(),
      numero: formData.numero,
      fechaIngreso: new Date(formData.fechaIngreso),
      fechaVencimiento: new Date(formData.fechaVencimiento),
      formaIngreso: formData.formaIngreso,
      comprobanteClase: formData.comprobanteClase,
      numeroComprobante: formData.numeroComprobante,
      cantidadInicial: formData.cantidadInicial,
      cantidadActual: formData.cantidadInicial,
      estado: 'disponible' as const,
      observaciones: formData.observaciones,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    if (tipo === 'vacuna') {
      const loteVacuna: Lote = {
        ...baseData,
        vacunaId: formData.vacunaId,
        fechaVencimiento: new Date(formData.fechaVencimiento), // Asegurar que existe para vacunas
      };
      onSuccess('vacuna', loteVacuna);
    } else {
      const loteJeringa: LoteJeringa = {
        ...baseData,
        jeringaId: formData.jeringaId,
        fechaVencimiento: formData.fechaVencimiento ? new Date(formData.fechaVencimiento) : undefined,
      };
      onSuccess('jeringa', loteJeringa);
    }

    setStep(3);
  };

  const handleFinish = () => {
    onClose();
  };

  const selectedVacuna = vacunas.find(v => v.id === formData.vacunaId);
  const selectedJeringa = jeringas.find(j => j.id === formData.jeringaId);

  // Helper function to render product selection dropdown
  const renderProductSelect = () => {
    const isVacuna = tipo === 'vacuna';
    const items = isVacuna ? vacunas : jeringas;
    // Para vacunas, no filtrar porque ya vienen activas del endpoint /activas
    // Para jeringas, sí filtrar por estado activo
    const activeItems = isVacuna ? items : items.filter(item => item.estado === 'activo');
    const fieldName = isVacuna ? 'vacunaId' : 'jeringaId';
    const currentValue = isVacuna ? formData.vacunaId : formData.jeringaId;
    const isLoading = isVacuna ? isLoadingVacunas : isLoadingJeringas;

    // Check if we have any active items
    const hasActiveItems = activeItems.length > 0;

    return (
      <div className="relative">
        <select
          value={currentValue}
          onChange={(e) => setFormData({
            ...formData,
            [fieldName]: e.target.value
          })}
          disabled={!hasActiveItems || isLoading}
          className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
            errors[fieldName] ? 'border-red-300' : 'border-gray-300'
          } ${(!hasActiveItems || isLoading) ? 'bg-gray-100 cursor-not-allowed' : ''}`}
        >
          <option value="">
            {isLoading
              ? `Cargando ${isVacuna ? 'vacunas' : 'jeringas'}...`
              : hasActiveItems
                ? `Seleccionar ${isVacuna ? 'vacuna' : 'jeringa'}`
                : `No hay ${isVacuna ? 'vacunas' : 'jeringas'} activas disponibles`
            }
          </option>
          {!isLoading && activeItems.map(item => {
            if (isVacuna) {
              const vacuna = item as Vacuna;
              return (
                <option key={vacuna.id} value={vacuna.id}>
                  {(vacuna.nombre || 'Sin nombre')} - {(vacuna.presentacion || 'Sin presentación')}
                </option>
              );
            } else {
              const jeringa = item as Jeringa;
              return (
                <option key={jeringa.id} value={jeringa.id}>
                  {(jeringa.tipo || 'Sin tipo')} {(jeringa.capacidad || '')} - {(jeringa.color || 'Sin color')}
                </option>
              );
            }
          })}
        </select>

        {/* Show helpful message when no items available */}
        {!isLoading && !hasActiveItems && (
          <div className="mt-1">
            <p className="text-gray-500 text-sm">
              No hay {isVacuna ? 'vacunas' : 'jeringas'} activas disponibles.
            </p>
            <p className="text-blue-600 text-xs mt-1">
              💡 Sugerencia: Verifique que existan {isVacuna ? 'vacunas' : 'jeringas'} con estado "activo" en el sistema.
            </p>
          </div>
        )}

        {/* Show loading state */}
        {isLoading && (
          <p className="text-blue-500 text-sm mt-1">
            <span className="inline-block animate-spin mr-2">⏳</span>
            Cargando {isVacuna ? 'vacunas' : 'jeringas'}...
          </p>
        )}
      </div>
    );
  };

  // Helper function to check if there are active options available
  const hasActiveOptions = () => {
    const items = tipo === 'vacuna' ? vacunas : jeringas;
    // Para vacunas, no filtrar porque ya vienen activas del endpoint /activas
    // Para jeringas, sí filtrar por estado activo
    const activeItems = tipo === 'vacuna' ? items : items.filter(item => item.estado === 'activo');
    return activeItems.length > 0;
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl max-w-2xl w-full m-4 max-h-[90vh] overflow-y-auto shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Nuevo Ingreso de Inventario</h2>
            <p className="text-sm text-gray-600 mt-1">Proceso simplificado en {step === 3 ? '3' : '2'} pasos</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Progress Bar */}
        <div className="px-6 py-4 bg-gray-50">
          <div className="flex items-center">
            <div className={`flex items-center justify-center w-8 h-8 rounded-full ${
              step >= 1 ? 'bg-blue-600 text-white' : 'bg-gray-300 text-gray-600'
            }`}>
              1
            </div>
            <div className={`flex-1 h-1 mx-2 ${step >= 2 ? 'bg-blue-600' : 'bg-gray-300'}`}></div>
            <div className={`flex items-center justify-center w-8 h-8 rounded-full ${
              step >= 2 ? 'bg-blue-600 text-white' : 'bg-gray-300 text-gray-600'
            }`}>
              2
            </div>
            <div className={`flex-1 h-1 mx-2 ${step >= 3 ? 'bg-green-600' : 'bg-gray-300'}`}></div>
            <div className={`flex items-center justify-center w-8 h-8 rounded-full ${
              step >= 3 ? 'bg-green-600 text-white' : 'bg-gray-300 text-gray-600'
            }`}>
              <CheckCircle className="h-5 w-5" />
            </div>
          </div>
          <div className="flex justify-between mt-2 text-xs text-gray-600">
            <span>Tipo</span>
            <span>Datos</span>
            <span>Confirmación</span>
          </div>
        </div>

        <div className="p-6">
          {/* Step 1: Selección de Tipo (solo si no está fijo) */}
          {step === 1 && !tipoFijo && (
            <div className="space-y-6">
              <div className="text-center">
                <h3 className="text-lg font-medium text-gray-900 mb-2">¿Qué desea ingresar?</h3>
                <p className="text-gray-600">Seleccione el tipo de producto que va a registrar</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <button
                  onClick={() => setTipo('vacuna')}
                  className={`p-6 border-2 rounded-lg transition-all ${
                    tipo === 'vacuna'
                      ? 'border-blue-500 bg-blue-50 text-blue-700'
                      : 'border-gray-200 hover:border-gray-300 text-gray-700'
                  }`}
                >
                  <Package className="h-12 w-12 mx-auto mb-3" />
                  <h4 className="font-medium mb-2">Vacunas</h4>
                  <p className="text-sm opacity-75">Registrar nuevo lote de vacunas</p>
                </button>

                <button
                  onClick={() => setTipo('jeringa')}
                  className={`p-6 border-2 rounded-lg transition-all ${
                    tipo === 'jeringa'
                      ? 'border-purple-500 bg-purple-50 text-purple-700'
                      : 'border-gray-200 hover:border-gray-300 text-gray-700'
                  }`}
                >
                  <Syringe className="h-12 w-12 mx-auto mb-3" />
                  <h4 className="font-medium mb-2">Jeringas</h4>
                  <p className="text-sm opacity-75">Registrar nuevo lote de jeringas</p>
                </button>
              </div>

              {errors.tipo && (
                <div className="flex items-center text-red-600 text-sm">
                  <AlertCircle className="h-4 w-4 mr-2" />
                  {errors.tipo}
                </div>
              )}

              <div className="flex justify-end">
                <button
                  onClick={handleNext}
                  disabled={!tipo}
                  className="flex items-center px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
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
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Datos del {tipo === 'vacuna' ? 'Lote de Vacuna' : 'Lote de Jeringa'}
                </h3>
                <p className="text-gray-600">Complete la información del nuevo lote</p>
              </div>

              <div className="space-y-4">
                {/* Selección de Producto */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {tipo === 'vacuna' ? 'Vacuna' : 'Jeringa'} *
                  </label>
                  {renderProductSelect()}
                  {errors[tipo === 'vacuna' ? 'vacunaId' : 'jeringaId'] && (
                    <p className="text-red-600 text-sm mt-1">{errors[tipo === 'vacuna' ? 'vacunaId' : 'jeringaId']}</p>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Número de Lote */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <Hash className="h-4 w-4 inline mr-1" />
                      Número de Lote *
                    </label>
                    <div className="flex">
                      <input
                        type="text"
                        value={formData.numero}
                        onChange={(e) => setFormData({...formData, numero: e.target.value})}
                        className={`flex-1 px-3 py-2 border rounded-l-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                          errors.numero ? 'border-red-300' : 'border-gray-300'
                        }`}
                        placeholder="Ej: BCG-2024-001"
                      />
                      <button
                        type="button"
                        onClick={() => setFormData({...formData, numero: generateLoteNumber()})}
                        className="px-3 py-2 bg-gray-100 border border-l-0 border-gray-300 rounded-r-lg hover:bg-gray-200 transition-colors text-sm"
                        title="Generar automáticamente"
                      >
                        Auto
                      </button>
                    </div>
                    {errors.numero && (
                      <p className="text-red-600 text-sm mt-1">{errors.numero}</p>
                    )}
                  </div>

                  {/* Cantidad */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Cantidad Inicial *
                    </label>
                    <input
                      type="number"
                      min="1"
                      value={formData.cantidadInicial || ''}
                      onChange={(e) => setFormData({...formData, cantidadInicial: parseInt(e.target.value) || 0})}
                      className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                        errors.cantidadInicial ? 'border-red-300' : 'border-gray-300'
                      }`}
                      placeholder="0"
                    />
                    {errors.cantidadInicial && (
                      <p className="text-red-600 text-sm mt-1">{errors.cantidadInicial}</p>
                    )}
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
                      onChange={(e) => setFormData({...formData, fechaIngreso: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                      onChange={(e) => setFormData({...formData, fechaVencimiento: e.target.value})}
                      className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                        errors.fechaVencimiento ? 'border-red-300' : 'border-gray-300'
                      }`}
                    />
                    {errors.fechaVencimiento && (
                      <p className="text-red-600 text-sm mt-1">{errors.fechaVencimiento}</p>
                    )}
                    {tipo === 'jeringa' && (
                      <p className="text-gray-500 text-xs mt-1">
                        Las jeringas pueden no tener fecha de vencimiento
                      </p>
                    )}
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
                      onChange={(e) => setFormData({...formData, formaIngreso: e.target.value as any})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="1° TRIMESTRE">1° TRIMESTRE</option>
                      <option value="2° TRIMESTRE">2° TRIMESTRE</option>
                      <option value="3° TRIMESTRE">3° TRIMESTRE</option>
                      <option value="4° TRIMESTRE">4° TRIMESTRE</option>
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
                      onChange={(e) => setFormData({...formData, comprobanteClase: e.target.value as any})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="PECOSA">PECOSA</option>
                      <option value="GUIA">GUÍA</option>
                      <option value="TRASLADO">TRASLADO</option>
                      <option value="OTROS">OTROS</option>
                    </select>
                  </div>
                </div>

                {/* Número de Comprobante */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Número de Comprobante *
                  </label>
                  <input
                    type="text"
                    value={formData.numeroComprobante}
                    onChange={(e) => setFormData({...formData, numeroComprobante: e.target.value})}
                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      errors.numeroComprobante ? 'border-red-300' : 'border-gray-300'
                    }`}
                    placeholder="Ej: P-001-2024"
                  />
                  {errors.numeroComprobante && (
                    <p className="text-red-600 text-sm mt-1">{errors.numeroComprobante}</p>
                  )}
                </div>

                {/* Observaciones */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Observaciones
                  </label>
                  <textarea
                    value={formData.observaciones}
                    onChange={(e) => setFormData({...formData, observaciones: e.target.value})}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Observaciones adicionales (opcional)"
                  />
                </div>
              </div>

              <div className="flex justify-between">
                <button
                  onClick={handleBack}
                  className="px-6 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Anterior
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={!hasActiveOptions()}
                  className={`px-6 py-2 rounded-lg transition-colors ${
                    hasActiveOptions()
                      ? 'bg-green-600 text-white hover:bg-green-700'
                      : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  }`}
                >
                  Registrar Ingreso
                </button>
              </div>
            </div>
          )}

          {/* Step 3: Confirmación */}
          {step === 3 && (
            <div className="space-y-6 text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
              
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">¡Ingreso Registrado Exitosamente!</h3>
                <p className="text-gray-600">
                  El lote <strong>{formData.numero}</strong> ha sido registrado correctamente
                </p>
              </div>

              <div className="bg-gray-50 rounded-lg p-4 text-left">
                <h4 className="font-medium text-gray-900 mb-3">Resumen del ingreso:</h4>
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
                  <div className="flex justify-between">
                    <span className="text-gray-600">Vencimiento:</span>
                    <span className="font-medium">{new Date(formData.fechaVencimiento).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>

              <button
                onClick={handleFinish}
                className="px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Finalizar
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default NuevoIngreso;