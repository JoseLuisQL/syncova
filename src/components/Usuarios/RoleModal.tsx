import React, { useState, useEffect } from 'react';
import { X, Shield, Loader2, AlertTriangle } from 'lucide-react';
import { Role, CreateRoleDto, UpdateRoleDto } from '../../types';

interface RoleModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CreateRoleDto | UpdateRoleDto) => Promise<void>;
  editingRole?: Role | null;
  isLoading?: boolean;
}

const RoleModal: React.FC<RoleModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  editingRole,
  isLoading = false
}) => {
  const [formData, setFormData] = useState({
    nombre: '',
    descripcion: '',
    codigo: '',
    estado: 'activo' as 'activo' | 'inactivo'
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Resetear formulario cuando cambia el rol en edición
  useEffect(() => {
    if (editingRole) {
      setFormData({
        nombre: editingRole.nombre,
        descripcion: editingRole.descripcion || '',
        codigo: editingRole.codigo,
        estado: editingRole.estado
      });
    } else {
      setFormData({
        nombre: '',
        descripcion: '',
        codigo: '',
        estado: 'activo'
      });
    }
    setErrors({});
  }, [editingRole, isOpen]);

  // Generar código automáticamente basado en el nombre
  const generateCodigo = (nombre: string) => {
    return nombre
      .toLowerCase()
      .replace(/[áàäâ]/g, 'a')
      .replace(/[éèëê]/g, 'e')
      .replace(/[íìïî]/g, 'i')
      .replace(/[óòöô]/g, 'o')
      .replace(/[úùüû]/g, 'u')
      .replace(/ñ/g, 'n')
      .replace(/[^a-z0-9]/g, '_')
      .replace(/_+/g, '_')
      .replace(/^_|_$/g, '');
  };

  const handleNombreChange = (nombre: string) => {
    setFormData(prev => ({
      ...prev,
      nombre,
      // Solo generar código automáticamente si no estamos editando
      codigo: editingRole ? prev.codigo : generateCodigo(nombre)
    }));
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.nombre.trim()) {
      newErrors.nombre = 'El nombre es requerido';
    } else if (formData.nombre.length < 3) {
      newErrors.nombre = 'El nombre debe tener al menos 3 caracteres';
    }

    if (!formData.codigo.trim()) {
      newErrors.codigo = 'El código es requerido';
    } else if (!/^[a-z0-9_]+$/.test(formData.codigo)) {
      newErrors.codigo = 'El código solo puede contener letras minúsculas, números y guiones bajos';
    } else if (formData.codigo.length < 3) {
      newErrors.codigo = 'El código debe tener al menos 3 caracteres';
    }

    if (formData.descripcion && formData.descripcion.length > 500) {
      newErrors.descripcion = 'La descripción no puede exceder 500 caracteres';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    try {
      const submitData = {
        nombre: formData.nombre.trim(),
        descripcion: formData.descripcion.trim() || undefined,
        codigo: formData.codigo.trim(),
        estado: formData.estado
      };

      await onSubmit(submitData);
    } catch (error) {
      // El error se maneja en el componente padre
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="flex-shrink-0 h-10 w-10 bg-purple-100 rounded-full flex items-center justify-center">
              <Shield className="h-5 w-5 text-purple-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">
                {editingRole ? 'Editar Rol' : 'Crear Nuevo Rol'}
              </h3>
              <p className="text-sm text-gray-500">
                {editingRole ? 'Modifica los datos del rol' : 'Completa la información del nuevo rol'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
            disabled={isLoading}
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Nombre */}
          <div>
            <label htmlFor="nombre" className="block text-sm font-medium text-gray-700 mb-1">
              Nombre del Rol *
            </label>
            <input
              type="text"
              id="nombre"
              value={formData.nombre}
              onChange={(e) => handleNombreChange(e.target.value)}
              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent ${
                errors.nombre ? 'border-red-300' : 'border-gray-300'
              }`}
              placeholder="Ej: Supervisor de Inventario"
              disabled={isLoading}
            />
            {errors.nombre && (
              <p className="mt-1 text-sm text-red-600 flex items-center">
                <AlertTriangle className="h-4 w-4 mr-1" />
                {errors.nombre}
              </p>
            )}
          </div>

          {/* Código */}
          <div>
            <label htmlFor="codigo" className="block text-sm font-medium text-gray-700 mb-1">
              Código del Rol *
            </label>
            <input
              type="text"
              id="codigo"
              value={formData.codigo}
              onChange={(e) => setFormData(prev => ({ ...prev, codigo: e.target.value.toLowerCase() }))}
              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent font-mono text-sm ${
                errors.codigo ? 'border-red-300' : 'border-gray-300'
              }`}
              placeholder="supervisor_inventario"
              disabled={isLoading || (editingRole?.esDefault ?? false)}
            />
            {errors.codigo && (
              <p className="mt-1 text-sm text-red-600 flex items-center">
                <AlertTriangle className="h-4 w-4 mr-1" />
                {errors.codigo}
              </p>
            )}
            <p className="mt-1 text-xs text-gray-500">
              Solo letras minúsculas, números y guiones bajos. Se genera automáticamente.
            </p>
          </div>

          {/* Descripción */}
          <div>
            <label htmlFor="descripcion" className="block text-sm font-medium text-gray-700 mb-1">
              Descripción
            </label>
            <textarea
              id="descripcion"
              value={formData.descripcion}
              onChange={(e) => setFormData(prev => ({ ...prev, descripcion: e.target.value }))}
              rows={3}
              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none ${
                errors.descripcion ? 'border-red-300' : 'border-gray-300'
              }`}
              placeholder="Describe las responsabilidades y alcance de este rol..."
              disabled={isLoading}
            />
            {errors.descripcion && (
              <p className="mt-1 text-sm text-red-600 flex items-center">
                <AlertTriangle className="h-4 w-4 mr-1" />
                {errors.descripcion}
              </p>
            )}
            <p className="mt-1 text-xs text-gray-500">
              {formData.descripcion.length}/500 caracteres
            </p>
          </div>

          {/* Estado */}
          <div>
            <label htmlFor="estado" className="block text-sm font-medium text-gray-700 mb-1">
              Estado
            </label>
            <select
              id="estado"
              value={formData.estado}
              onChange={(e) => setFormData(prev => ({ ...prev, estado: e.target.value as 'activo' | 'inactivo' }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              disabled={isLoading}
            >
              <option value="activo">Activo</option>
              <option value="inactivo">Inactivo</option>
            </select>
          </div>

          {/* Botones */}
          <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
              disabled={isLoading}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors flex items-center space-x-2"
              disabled={isLoading}
            >
              {isLoading && <Loader2 className="h-4 w-4 animate-spin" />}
              <span>{editingRole ? 'Actualizar' : 'Crear'} Rol</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RoleModal;
