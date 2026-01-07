import React, { useState, useEffect, useCallback } from 'react';
import { X, Package, Syringe, Building2, Loader, Check } from 'lucide-react';
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

  useEffect(() => {
    if (isOpen) {
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
  }, [isOpen, editingConfig]);

  const validateForm = useCallback(() => {
    const newErrors: Record<string, string> = {};

    if (!formData.vacunaId) {
      newErrors.vacunaId = 'Seleccione una vacuna';
    }
    if (!formData.jeringaId) {
      newErrors.jeringaId = 'Seleccione una jeringa';
    }
    if (tipo === 'centro' && !formData.centroAcopioId) {
      newErrors.centroAcopioId = 'Seleccione un centro';
    }
    if (formData.multiplicador <= 0) {
      newErrors.multiplicador = 'Debe ser mayor a 0';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [formData, tipo]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

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
        onNotification('success', `Configuración ${editingConfig ? 'actualizada' : 'creada'}`);
        onSuccess();
      } else {
        throw new Error(response.data.message || 'Error al guardar');
      }
    } catch (error: any) {
      const msg = error.response?.data?.message || error.message || 'Error al guardar';
      onNotification('error', msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = useCallback((field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  }, [errors]);

  const handleBackdropClick = useCallback((e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  }, [onClose]);

  if (!isOpen) return null;

  const isEditing = !!editingConfig;
  const selectedVacuna = vacunas.find(v => v.id === formData.vacunaId);
  const selectedJeringa = jeringas.find(j => j.id === formData.jeringaId);

  return (
    <div 
      className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      onClick={handleBackdropClick}
    >
      <div className="bg-white rounded-xl w-full max-w-lg shadow-xl animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">
              {isEditing ? 'Editar' : 'Nueva'} Configuración
            </h2>
            <p className="text-sm text-gray-500">
              {tipo === 'centro' ? 'Configuración por centro' : 'Configuración por defecto'}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Centro de Acopio (solo para tipo centro) */}
          {tipo === 'centro' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Centro de Acopio
              </label>
              <div className="relative">
                <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <select
                  value={formData.centroAcopioId}
                  onChange={(e) => handleChange('centroAcopioId', e.target.value)}
                  disabled={isEditing}
                  className={`w-full pl-10 pr-4 py-2.5 border rounded-lg text-sm appearance-none bg-white
                    focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-colors
                    ${errors.centroAcopioId ? 'border-rose-300 bg-rose-50' : 'border-gray-200'}
                    ${isEditing ? 'bg-gray-50 text-gray-500' : ''}`}
                >
                  <option value="">Seleccionar centro...</option>
                  {centrosAcopio.map(c => (
                    <option key={c.id} value={c.id}>{c.nombre}</option>
                  ))}
                </select>
              </div>
              {errors.centroAcopioId && (
                <p className="mt-1 text-xs text-rose-600">{errors.centroAcopioId}</p>
              )}
            </div>
          )}

          {/* Vacuna */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Vacuna
            </label>
            <div className="relative">
              <Package className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <select
                value={formData.vacunaId}
                onChange={(e) => handleChange('vacunaId', e.target.value)}
                disabled={isEditing}
                className={`w-full pl-10 pr-4 py-2.5 border rounded-lg text-sm appearance-none bg-white
                  focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-colors
                  ${errors.vacunaId ? 'border-rose-300 bg-rose-50' : 'border-gray-200'}
                  ${isEditing ? 'bg-gray-50 text-gray-500' : ''}`}
              >
                <option value="">Seleccionar vacuna...</option>
                {vacunas.map(v => (
                  <option key={v.id} value={v.id}>{v.nombre}</option>
                ))}
              </select>
            </div>
            {errors.vacunaId && (
              <p className="mt-1 text-xs text-rose-600">{errors.vacunaId}</p>
            )}
            {selectedVacuna && (
              <p className="mt-1 text-xs text-gray-500">
                {selectedVacuna.tipo} · {selectedVacuna.dosisPorFrasco} dosis/frasco
              </p>
            )}
          </div>

          {/* Jeringa */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Jeringa
            </label>
            <div className="relative">
              <Syringe className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <select
                value={formData.jeringaId}
                onChange={(e) => handleChange('jeringaId', e.target.value)}
                disabled={isEditing}
                className={`w-full pl-10 pr-4 py-2.5 border rounded-lg text-sm appearance-none bg-white
                  focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-colors
                  ${errors.jeringaId ? 'border-rose-300 bg-rose-50' : 'border-gray-200'}
                  ${isEditing ? 'bg-gray-50 text-gray-500' : ''}`}
              >
                <option value="">Seleccionar jeringa...</option>
                {jeringas.map(j => (
                  <option key={j.id} value={j.id}>{j.tipo} {j.capacidad}</option>
                ))}
              </select>
            </div>
            {errors.jeringaId && (
              <p className="mt-1 text-xs text-rose-600">{errors.jeringaId}</p>
            )}
            {selectedJeringa && (
              <p className="mt-1 text-xs text-gray-500">
                Color: {selectedJeringa.color}
              </p>
            )}
          </div>

          {/* Multiplicador y Prioridad */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Multiplicador
              </label>
              <input
                type="number"
                step="0.1"
                min="0.1"
                value={formData.multiplicador}
                onChange={(e) => handleChange('multiplicador', parseFloat(e.target.value) || 0)}
                className={`w-full px-3 py-2.5 border rounded-lg text-sm
                  focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-colors
                  ${errors.multiplicador ? 'border-rose-300 bg-rose-50' : 'border-gray-200'}`}
              />
              {errors.multiplicador ? (
                <p className="mt-1 text-xs text-rose-600">{errors.multiplicador}</p>
              ) : (
                <p className="mt-1 text-xs text-gray-500">Jeringas por dosis</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Prioridad
              </label>
              <input
                type="number"
                min="1"
                value={formData.prioridad}
                onChange={(e) => handleChange('prioridad', parseInt(e.target.value) || 1)}
                className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm
                  focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-colors"
              />
              <p className="mt-1 text-xs text-gray-500">1 = máxima prioridad</p>
            </div>
          </div>

          {/* Estado activo */}
          <div 
            className={`flex items-center justify-between p-3 rounded-lg border cursor-pointer transition-colors ${
              formData.activo 
                ? 'border-emerald-200 bg-emerald-50' 
                : 'border-gray-200 bg-gray-50'
            }`}
            onClick={() => handleChange('activo', !formData.activo)}
          >
            <div>
              <p className="text-sm font-medium text-gray-900">Estado activo</p>
              <p className="text-xs text-gray-500">
                {formData.activo ? 'Se usará en cálculos' : 'No se usará en cálculos'}
              </p>
            </div>
            <div className={`w-10 h-6 rounded-full p-1 transition-colors ${
              formData.activo ? 'bg-emerald-500' : 'bg-gray-300'
            }`}>
              <div className={`w-4 h-4 bg-white rounded-full shadow transition-transform ${
                formData.activo ? 'translate-x-4' : 'translate-x-0'
              }`} />
            </div>
          </div>
        </form>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-100 bg-gray-50 rounded-b-xl">
          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-200 rounded-lg transition-colors"
          >
            Cancelar
          </button>
          <button
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-teal-600 to-cyan-600 hover:from-teal-700 hover:to-cyan-700 rounded-lg transition-all disabled:opacity-50"
          >
            {isSubmitting ? (
              <Loader className="h-4 w-4 animate-spin" />
            ) : (
              <Check className="h-4 w-4" />
            )}
            {isEditing ? 'Guardar Cambios' : 'Crear Configuración'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfiguracionModal;
