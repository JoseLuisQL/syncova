import React, { useState, useEffect } from 'react';
import { X, Package, Syringe, Building2, AlertCircle, Loader } from 'lucide-react';
import { apiClient } from '../../config/api';

interface Vacuna {
  id: string;
  nombre: string;
  tipo: string;
  presentacion: string;
  dosisPorFrasco: number;
}

interface Jeringa {
  id: string;
  tipo: string;
  capacidad: string;
  color: string;
}

interface CentroAcopio {
  id: string;
  nombre: string;
  codigo: string;
}

interface ConfiguracionDefecto {
  id: string;
  vacunaId: string;
  jeringaId: string;
  multiplicador: number;
  prioridad: number;
  activo: boolean;
  vacuna?: Vacuna;
  jeringa?: Jeringa;
}

interface ConfiguracionCentro {
  id: string;
  centroAcopioId: string;
  vacunaId: string;
  jeringaId: string;
  multiplicador: number;
  prioridad: number;
  activo: boolean;
  centroAcopio?: CentroAcopio;
  vacuna?: Vacuna;
  jeringa?: Jeringa;
}

interface ConfiguracionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  tipo: 'defecto' | 'centro';
  editingConfig?: ConfiguracionDefecto | ConfiguracionCentro | null;
  vacunas: Vacuna[];
  jeringas: Jeringa[];
  centrosAcopio: CentroAcopio[];
  onNotification: (type: 'success' | 'error' | 'info', message: string) => void;
}

const ConfiguracionModal: React.FC<ConfiguracionModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  tipo,
  editingConfig,
  vacunas,
  jeringas,
  centrosAcopio,
  onNotification
}) => {
  const [formData, setFormData] = useState({
    centroAcopioId: '',
    vacunaId: '',
    jeringaId: '',
    multiplicador: 1.0,
    prioridad: 1,
    activo: true
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Resetear formulario cuando se abre/cierra el modal
  useEffect(() => {
    if (isOpen) {
      console.log('🔄 Modal abierto, datos recibidos:');
      console.log('📦 Vacunas en modal:', vacunas.length, vacunas);
      console.log('💉 Jeringas en modal:', jeringas.length, jeringas);
      console.log('🏥 Centros en modal:', centrosAcopio.length, centrosAcopio);

      if (editingConfig) {
        setFormData({
          centroAcopioId: (editingConfig as ConfiguracionCentro).centroAcopioId || '',
          vacunaId: editingConfig.vacunaId,
          jeringaId: editingConfig.jeringaId,
          multiplicador: editingConfig.multiplicador,
          prioridad: editingConfig.prioridad,
          activo: editingConfig.activo
        });
      } else {
        setFormData({
          centroAcopioId: '',
          vacunaId: '',
          jeringaId: '',
          multiplicador: 1.0,
          prioridad: 1,
          activo: true
        });
      }
      setErrors({});
    }
  }, [isOpen, editingConfig, vacunas, jeringas, centrosAcopio]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.vacunaId) {
      newErrors.vacunaId = 'La vacuna es requerida';
    }

    if (!formData.jeringaId) {
      newErrors.jeringaId = 'La jeringa es requerida';
    }

    if (tipo === 'centro' && !formData.centroAcopioId) {
      newErrors.centroAcopioId = 'El centro de acopio es requerido';
    }

    if (formData.multiplicador <= 0) {
      newErrors.multiplicador = 'El multiplicador debe ser mayor a 0';
    }

    if (formData.prioridad <= 0) {
      newErrors.prioridad = 'La prioridad debe ser mayor a 0';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      const endpoint = editingConfig
        ? `/configuracion-jeringa-vacuna/${tipo}/${editingConfig.id}`
        : `/configuracion-jeringa-vacuna/${tipo}`;

      const payload = tipo === 'centro'
        ? formData
        : {
            vacunaId: formData.vacunaId,
            jeringaId: formData.jeringaId,
            multiplicador: formData.multiplicador,
            prioridad: formData.prioridad,
            activo: formData.activo
          };

      const response = editingConfig
        ? await apiClient.put(endpoint, payload)
        : await apiClient.post(endpoint, payload);

      if (response.data.success) {
        onNotification('success', `Configuración ${editingConfig ? 'actualizada' : 'creada'} exitosamente`);
        onSuccess();
      } else {
        throw new Error(response.data.message || 'Error al guardar configuración');
      }
    } catch (error: any) {
      console.error('Error al guardar configuración:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Error al guardar configuración';
      onNotification('error', errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                {tipo === 'centro' ? (
                  <Building2 className="h-6 w-6 text-blue-600" />
                ) : (
                  <Package className="h-6 w-6 text-blue-600" />
                )}
              </div>
              <div>
                <h2 className="text-xl font-semibold text-gray-900">
                  {editingConfig ? 'Editar' : 'Nueva'} Configuración {tipo === 'centro' ? 'por Centro' : 'por Defecto'}
                </h2>
                <p className="text-gray-600">
                  {tipo === 'centro' 
                    ? 'Configure un multiplicador específico para un centro de acopio.'
                    : 'Configure el multiplicador por defecto para una combinación vacuna-jeringa.'
                  }
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 p-1 rounded hover:bg-gray-100"
            >
              <X className="h-6 w-6" />
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Centro de Acopio (solo para configuraciones por centro) */}
            {tipo === 'centro' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Building2 className="inline h-4 w-4 mr-1" />
                  Centro de Acopio *
                </label>
                <select
                  value={formData.centroAcopioId}
                  onChange={(e) => handleInputChange('centroAcopioId', e.target.value)}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.centroAcopioId ? 'border-red-300' : 'border-gray-300'
                  }`}
                  disabled={!!editingConfig}
                >
                  <option value="">Seleccione un centro de acopio</option>
                  {centrosAcopio.map(centro => (
                    <option key={centro.id} value={centro.id}>
                      {centro.nombre} ({centro.codigo})
                    </option>
                  ))}
                </select>
                {errors.centroAcopioId && (
                  <p className="mt-1 text-sm text-red-600 flex items-center">
                    <AlertCircle className="h-4 w-4 mr-1" />
                    {errors.centroAcopioId}
                  </p>
                )}
              </div>
            )}

            {/* Vacuna */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Package className="inline h-4 w-4 mr-1" />
                Vacuna * (Disponibles: {vacunas.length})
              </label>
              <select
                value={formData.vacunaId}
                onChange={(e) => handleInputChange('vacunaId', e.target.value)}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  errors.vacunaId ? 'border-red-300' : 'border-gray-300'
                }`}
                disabled={!!editingConfig}
              >
                <option value="">
                  {vacunas.length === 0 ? 'Cargando vacunas...' : 'Seleccione una vacuna'}
                </option>
                {vacunas.map(vacuna => (
                  <option key={vacuna.id} value={vacuna.id}>
                    {vacuna.nombre} - {vacuna.tipo} ({vacuna.dosisPorFrasco} dosis/frasco)
                  </option>
                ))}
              </select>
              {errors.vacunaId && (
                <p className="mt-1 text-sm text-red-600 flex items-center">
                  <AlertCircle className="h-4 w-4 mr-1" />
                  {errors.vacunaId}
                </p>
              )}
            </div>

            {/* Jeringa */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Syringe className="inline h-4 w-4 mr-1" />
                Jeringa * (Disponibles: {jeringas.length})
              </label>
              <select
                value={formData.jeringaId}
                onChange={(e) => handleInputChange('jeringaId', e.target.value)}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  errors.jeringaId ? 'border-red-300' : 'border-gray-300'
                }`}
                disabled={!!editingConfig}
              >
                <option value="">
                  {jeringas.length === 0 ? 'Cargando jeringas...' : 'Seleccione una jeringa'}
                </option>
                {jeringas.map(jeringa => (
                  <option key={jeringa.id} value={jeringa.id}>
                    {jeringa.tipo} {jeringa.capacidad} - {jeringa.color}
                  </option>
                ))}
              </select>
              {errors.jeringaId && (
                <p className="mt-1 text-sm text-red-600 flex items-center">
                  <AlertCircle className="h-4 w-4 mr-1" />
                  {errors.jeringaId}
                </p>
              )}
            </div>

            {/* Multiplicador y Prioridad en la misma fila */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Multiplicador *
                </label>
                <input
                  type="number"
                  step="0.1"
                  min="0.1"
                  value={formData.multiplicador}
                  onChange={(e) => handleInputChange('multiplicador', parseFloat(e.target.value) || 0)}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.multiplicador ? 'border-red-300' : 'border-gray-300'
                  }`}
                  placeholder="1.0"
                />
                {errors.multiplicador && (
                  <p className="mt-1 text-sm text-red-600 flex items-center">
                    <AlertCircle className="h-4 w-4 mr-1" />
                    {errors.multiplicador}
                  </p>
                )}
                <p className="mt-1 text-xs text-gray-500">
                  Cantidad de jeringas por dosis de vacuna
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Prioridad *
                </label>
                <input
                  type="number"
                  min="1"
                  value={formData.prioridad}
                  onChange={(e) => handleInputChange('prioridad', parseInt(e.target.value) || 1)}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.prioridad ? 'border-red-300' : 'border-gray-300'
                  }`}
                  placeholder="1"
                />
                {errors.prioridad && (
                  <p className="mt-1 text-sm text-red-600 flex items-center">
                    <AlertCircle className="h-4 w-4 mr-1" />
                    {errors.prioridad}
                  </p>
                )}
                <p className="mt-1 text-xs text-gray-500">
                  Orden de selección (menor número = mayor prioridad)
                </p>
              </div>
            </div>

            {/* Estado */}
            <div>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={formData.activo}
                  onChange={(e) => handleInputChange('activo', e.target.checked)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <span className="ml-2 text-sm text-gray-700">
                  Configuración activa
                </span>
              </label>
              <p className="mt-1 text-xs text-gray-500">
                Solo las configuraciones activas se utilizan en los cálculos
              </p>
            </div>

            {/* Botones */}
            <div className="flex justify-end gap-3 pt-6 border-t">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                disabled={isSubmitting}
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {isSubmitting && <Loader className="h-4 w-4 animate-spin" />}
                {editingConfig ? 'Actualizar' : 'Crear'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ConfiguracionModal;
