import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { ChangePasswordDto } from '../../types';
import { useToastContext } from '../../contexts/ToastContext';

/**
 * Props del modal de cambio de contraseña
 */
interface ChangePasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
}

/**
 * Componente modal para cambiar contraseña
 */
const ChangePasswordModal: React.FC<ChangePasswordModalProps> = ({ isOpen, onClose }) => {
  const { changePassword, isLoading } = useAuth();
  const { toast } = useToastContext();
  
  const [formData, setFormData] = useState<ChangePasswordDto>({
    currentPassword: '',
    newPassword: '',
  });
  
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  /**
   * Resetear formulario
   */
  const resetForm = () => {
    setFormData({
      currentPassword: '',
      newPassword: '',
    });
    setConfirmPassword('');
    setErrors({});
    setShowPasswords({
      current: false,
      new: false,
      confirm: false,
    });
  };

  /**
   * Manejar cambios en los campos del formulario
   */
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    
    if (name === 'confirmPassword') {
      setConfirmPassword(value);
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value,
      }));
    }
    
    // Limpiar error del campo cuando el usuario empiece a escribir
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: '',
      }));
    }
  };

  /**
   * Validar fortaleza de contraseña
   */
  const validatePasswordStrength = (password: string): string[] => {
    const errors: string[] = [];
    
    if (password.length < 8) {
      errors.push('Debe tener al menos 8 caracteres');
    }
    if (!/[A-Z]/.test(password)) {
      errors.push('Debe contener al menos una letra mayúscula');
    }
    if (!/[a-z]/.test(password)) {
      errors.push('Debe contener al menos una letra minúscula');
    }
    if (!/\d/.test(password)) {
      errors.push('Debe contener al menos un número');
    }
    
    return errors;
  };

  /**
   * Validar formulario
   */
  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    // Validar contraseña actual
    if (!formData.currentPassword) {
      newErrors.currentPassword = 'La contraseña actual es requerida';
    }

    // Validar nueva contraseña
    if (!formData.newPassword) {
      newErrors.newPassword = 'La nueva contraseña es requerida';
    } else {
      const strengthErrors = validatePasswordStrength(formData.newPassword);
      if (strengthErrors.length > 0) {
        newErrors.newPassword = strengthErrors.join(', ');
      }
    }

    // Validar confirmación de contraseña
    if (!confirmPassword) {
      newErrors.confirmPassword = 'Confirma la nueva contraseña';
    } else if (confirmPassword !== formData.newPassword) {
      newErrors.confirmPassword = 'Las contraseñas no coinciden';
    }

    // Validar que la nueva contraseña sea diferente a la actual
    if (formData.currentPassword && formData.newPassword && formData.currentPassword === formData.newPassword) {
      newErrors.newPassword = 'La nueva contraseña debe ser diferente a la actual';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  /**
   * Manejar envío del formulario
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      await changePassword(formData);
      toast.success('Contraseña cambiada exitosamente');
      resetForm();
      onClose();
    } catch (error: any) {
      console.error('Error al cambiar contraseña:', error);
      toast.error(error.message || 'Error al cambiar contraseña');
    }
  };

  /**
   * Manejar cierre del modal
   */
  const handleClose = () => {
    resetForm();
    onClose();
  };

  /**
   * Toggle visibilidad de contraseña
   */
  const togglePasswordVisibility = (field: 'current' | 'new' | 'confirm') => {
    setShowPasswords(prev => ({
      ...prev,
      [field]: !prev[field],
    }));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">
            Cambiar Contraseña
          </h3>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Formulario */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Contraseña actual */}
          <div>
            <label htmlFor="currentPassword" className="block text-sm font-medium text-gray-700 mb-1">
              Contraseña Actual
            </label>
            <div className="relative">
              <input
                id="currentPassword"
                name="currentPassword"
                type={showPasswords.current ? 'text' : 'password'}
                value={formData.currentPassword}
                onChange={handleInputChange}
                className={`block w-full pr-10 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 ${
                  errors.currentPassword ? 'border-red-300' : 'border-gray-300'
                }`}
                placeholder="Ingresa tu contraseña actual"
              />
              <button
                type="button"
                className="absolute inset-y-0 right-0 pr-3 flex items-center"
                onClick={() => togglePasswordVisibility('current')}
              >
                {showPasswords.current ? (
                  <svg className="h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" />
                  </svg>
                ) : (
                  <svg className="h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                )}
              </button>
            </div>
            {errors.currentPassword && (
              <p className="mt-1 text-sm text-red-600">{errors.currentPassword}</p>
            )}
          </div>

          {/* Nueva contraseña */}
          <div>
            <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700 mb-1">
              Nueva Contraseña
            </label>
            <div className="relative">
              <input
                id="newPassword"
                name="newPassword"
                type={showPasswords.new ? 'text' : 'password'}
                value={formData.newPassword}
                onChange={handleInputChange}
                className={`block w-full pr-10 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 ${
                  errors.newPassword ? 'border-red-300' : 'border-gray-300'
                }`}
                placeholder="Ingresa tu nueva contraseña"
              />
              <button
                type="button"
                className="absolute inset-y-0 right-0 pr-3 flex items-center"
                onClick={() => togglePasswordVisibility('new')}
              >
                {showPasswords.new ? (
                  <svg className="h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" />
                  </svg>
                ) : (
                  <svg className="h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                )}
              </button>
            </div>
            {errors.newPassword && (
              <p className="mt-1 text-sm text-red-600">{errors.newPassword}</p>
            )}
          </div>

          {/* Confirmar nueva contraseña */}
          <div>
            <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
              Confirmar Nueva Contraseña
            </label>
            <div className="relative">
              <input
                id="confirmPassword"
                name="confirmPassword"
                type={showPasswords.confirm ? 'text' : 'password'}
                value={confirmPassword}
                onChange={handleInputChange}
                className={`block w-full pr-10 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 ${
                  errors.confirmPassword ? 'border-red-300' : 'border-gray-300'
                }`}
                placeholder="Confirma tu nueva contraseña"
              />
              <button
                type="button"
                className="absolute inset-y-0 right-0 pr-3 flex items-center"
                onClick={() => togglePasswordVisibility('confirm')}
              >
                {showPasswords.confirm ? (
                  <svg className="h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" />
                  </svg>
                ) : (
                  <svg className="h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                )}
              </button>
            </div>
            {errors.confirmPassword && (
              <p className="mt-1 text-sm text-red-600">{errors.confirmPassword}</p>
            )}
          </div>

          {/* Requisitos de contraseña */}
          <div className="bg-gray-50 p-3 rounded-md">
            <p className="text-xs text-gray-600 mb-1">La nueva contraseña debe cumplir:</p>
            <ul className="text-xs text-gray-500 space-y-1">
              <li>• Al menos 8 caracteres</li>
              <li>• Una letra mayúscula</li>
              <li>• Una letra minúscula</li>
              <li>• Un número</li>
            </ul>
          </div>

          {/* Botones */}
          <div className="flex space-x-3 pt-4">
            <button
              type="button"
              onClick={handleClose}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className={`flex-1 px-4 py-2 border border-transparent rounded-md text-sm font-medium text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors ${
                isLoading
                  ? 'bg-indigo-400 cursor-not-allowed'
                  : 'bg-indigo-600 hover:bg-indigo-700'
              }`}
            >
              {isLoading ? 'Cambiando...' : 'Cambiar Contraseña'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ChangePasswordModal;
