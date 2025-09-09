import React, { useState } from 'react';
import { X } from 'lucide-react';
import { Alerta, CreateAlertaDto, TipoAlerta, NivelAlerta } from '../../types';
import { useAlertas } from '../../hooks/useAlertas';

interface NuevaAlertaModalProps {
  onClose: () => void;
  onCrear?: (alertaData: CreateAlertaDto) => Promise<void>;
  tiposAlerta?: any[];
  nivelesAlerta?: any[];
}

const NuevaAlertaModal: React.FC<NuevaAlertaModalProps> = ({
  onClose,
  onCrear,
  tiposAlerta,
  nivelesAlerta,
}) => {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    tipo: 'sistema' as TipoAlerta,
    nivel: 'info' as NivelAlerta,
    titulo: '',
    descripcion: '',
    fechaVencimiento: '',
    usuarioId: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.titulo.trim()) {
      newErrors.titulo = 'El título es requerido';
    }

    if (!formData.descripcion.trim()) {
      newErrors.descripcion = 'La descripción es requerida';
    }

    if (formData.fechaVencimiento && new Date(formData.fechaVencimiento) < new Date()) {
      newErrors.fechaVencimiento = 'La fecha de vencimiento no puede ser en el pasado';
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
      const alertaData: CreateAlertaDto = {
        tipo: formData.tipo,
        titulo: formData.titulo.trim(),
        descripcion: formData.descripcion.trim(),
        nivel: formData.nivel,
        fechaVencimiento: formData.fechaVencimiento ? new Date(formData.fechaVencimiento) : undefined,
        usuarioId: formData.usuarioId || undefined,
      };

      if (onCrear) {
        await onCrear(alertaData);
      }

      onClose();
    } catch (error) {
      console.error('Error al crear alerta:', error);
      setErrors({ submit: 'Error al crear la alerta. Por favor, inténtalo de nuevo.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl max-w-2xl w-full m-4 shadow-2xl">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">Crear Nueva Alerta</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="h-5 w-5 text-gray-500" />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6">


          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Tipo *</label>
                <select
                  required
                  value={formData.tipo}
                  onChange={(e) => setFormData({...formData, tipo: e.target.value as TipoAlerta})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="vencimiento">Vencimientos</option>
                  <option value="stock_bajo">Stock Bajo</option>
                  <option value="discrepancia">Discrepancias</option>
                  <option value="sistema">Sistema</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Nivel de Criticidad *</label>
                <select
                  required
                  value={formData.nivel}
                  onChange={(e) => setFormData({...formData, nivel: e.target.value as NivelAlerta})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="info">Informativa</option>
                  <option value="warning">Advertencia</option>
                  <option value="error">Crítica</option>
                  <option value="success">Exitosa</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Título *</label>
              <input
                type="text"
                required
                value={formData.titulo}
                onChange={(e) => setFormData({...formData, titulo: e.target.value})}
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.titulo ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Título descriptivo de la alerta"
              />
              {errors.titulo && (
                <p className="mt-1 text-sm text-red-600">{errors.titulo}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Descripción *</label>
              <textarea
                required
                rows={4}
                value={formData.descripcion}
                onChange={(e) => setFormData({...formData, descripcion: e.target.value})}
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.descripcion ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Descripción detallada de la alerta"
              />
              {errors.descripcion && (
                <p className="mt-1 text-sm text-red-600">{errors.descripcion}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Fecha de Vencimiento (Opcional)</label>
              <input
                type="datetime-local"
                value={formData.fechaVencimiento}
                onChange={(e) => setFormData({...formData, fechaVencimiento: e.target.value})}
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.fechaVencimiento ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              {errors.fechaVencimiento && (
                <p className="mt-1 text-sm text-red-600">{errors.fechaVencimiento}</p>
              )}
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Usuario Responsable</label>
              <input
                type="text"
                value={formData.usuarioId}
                onChange={(e) => setFormData({...formData, usuarioId: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="ID del usuario responsable (opcional)"
              />
            </div>
          </div>

          {/* Error de submit */}
          {errors.submit && (
            <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-600">{errors.submit}</p>
            </div>
          )}

          <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200 mt-6">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
            >
              {isSubmitting && (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              )}
              <span>{isSubmitting ? 'Creando...' : 'Crear Alerta'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default NuevaAlertaModal;
