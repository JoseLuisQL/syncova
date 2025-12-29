import React, { useState, useCallback, useMemo, memo } from 'react';
import { createPortal } from 'react-dom';
import { useAuth } from '../../contexts/AuthContext';
import { ChangePasswordDto } from '../../types';
import { useToastContext } from '../../contexts/ToastContext';
import { X, Shield, Eye, EyeOff, Check, AlertCircle, Loader2 } from 'lucide-react';

interface ChangePasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const ChangePasswordModal: React.FC<ChangePasswordModalProps> = memo(({ isOpen, onClose }) => {
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

  const resetForm = useCallback(() => {
    setFormData({ currentPassword: '', newPassword: '' });
    setConfirmPassword('');
    setErrors({});
    setShowPasswords({ current: false, new: false, confirm: false });
  }, []);

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    
    if (name === 'confirmPassword') {
      setConfirmPassword(value);
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
    
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  }, [errors]);

  // Password strength validation
  const passwordStrength = useMemo(() => {
    const password = formData.newPassword;
    const checks = {
      length: password.length >= 8,
      uppercase: /[A-Z]/.test(password),
      lowercase: /[a-z]/.test(password),
      number: /\d/.test(password),
    };
    const score = Object.values(checks).filter(Boolean).length;
    return { checks, score };
  }, [formData.newPassword]);

  const getStrengthColor = (score: number): string => {
    if (score <= 1) return 'bg-rose-500';
    if (score <= 2) return 'bg-amber-500';
    if (score <= 3) return 'bg-teal-400';
    return 'bg-teal-500';
  };

  const getStrengthLabel = (score: number): string => {
    if (score <= 1) return 'Muy débil';
    if (score <= 2) return 'Débil';
    if (score <= 3) return 'Buena';
    return 'Fuerte';
  };

  const validateForm = useCallback((): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.currentPassword) {
      newErrors.currentPassword = 'Ingresa tu contraseña actual';
    }

    if (!formData.newPassword) {
      newErrors.newPassword = 'Ingresa una nueva contraseña';
    } else if (passwordStrength.score < 4) {
      newErrors.newPassword = 'La contraseña no cumple los requisitos';
    }

    if (!confirmPassword) {
      newErrors.confirmPassword = 'Confirma la nueva contraseña';
    } else if (confirmPassword !== formData.newPassword) {
      newErrors.confirmPassword = 'Las contraseñas no coinciden';
    }

    if (formData.currentPassword && formData.newPassword && 
        formData.currentPassword === formData.newPassword) {
      newErrors.newPassword = 'Debe ser diferente a la actual';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [formData, confirmPassword, passwordStrength.score]);

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      await changePassword(formData);
      toast.success('Contraseña actualizada correctamente');
      resetForm();
      onClose();
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Error al cambiar contraseña';
      toast.error(errorMessage);
    }
  }, [validateForm, changePassword, formData, toast, resetForm, onClose]);

  const handleClose = useCallback(() => {
    resetForm();
    onClose();
  }, [resetForm, onClose]);

  const togglePassword = useCallback((field: 'current' | 'new' | 'confirm') => {
    setShowPasswords(prev => ({ ...prev, [field]: !prev[field] }));
  }, []);

  if (!isOpen) return null;

  const modalContent = (
    <div 
      className="fixed inset-0 bg-gray-900/40 backdrop-blur-[2px] flex items-center justify-center p-4 z-[100]"
      onClick={(e) => e.target === e.currentTarget && handleClose()}
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
    >
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
        {/* Header */}
        <div className="px-6 py-5 border-b border-gray-100 bg-gradient-to-br from-gray-50 to-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-teal-500 to-cyan-600 flex items-center justify-center shadow-md">
                <Shield className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 id="modal-title" className="text-lg font-semibold text-gray-800">
                  Cambiar Contraseña
                </h3>
                <p className="text-xs text-gray-500">Actualiza tu contraseña de acceso</p>
              </div>
            </div>
            <button
              onClick={handleClose}
              className="p-2 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
              aria-label="Cerrar"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Current Password */}
          <div>
            <label htmlFor="currentPassword" className="block text-sm font-medium text-gray-700 mb-1.5">
              Contraseña Actual
            </label>
            <div className="relative">
              <input
                id="currentPassword"
                name="currentPassword"
                type={showPasswords.current ? 'text' : 'password'}
                value={formData.currentPassword}
                onChange={handleInputChange}
                className={`
                  w-full px-4 py-2.5 pr-10 rounded-xl border text-sm
                  transition-all duration-200
                  focus:outline-none focus:ring-2 focus:ring-offset-0
                  ${errors.currentPassword 
                    ? 'border-rose-300 focus:ring-rose-500/20 focus:border-rose-500' 
                    : 'border-gray-200 focus:ring-teal-500/20 focus:border-teal-500 hover:border-gray-300'
                  }
                `}
                placeholder="Ingresa tu contraseña actual"
                aria-invalid={!!errors.currentPassword}
              />
              <button
                type="button"
                onClick={() => togglePassword('current')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                aria-label={showPasswords.current ? 'Ocultar contraseña' : 'Mostrar contraseña'}
              >
                {showPasswords.current ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            {errors.currentPassword && (
              <p className="mt-1.5 text-xs text-rose-600 flex items-center gap-1">
                <AlertCircle className="w-3 h-3" />
                {errors.currentPassword}
              </p>
            )}
          </div>

          {/* New Password */}
          <div>
            <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700 mb-1.5">
              Nueva Contraseña
            </label>
            <div className="relative">
              <input
                id="newPassword"
                name="newPassword"
                type={showPasswords.new ? 'text' : 'password'}
                value={formData.newPassword}
                onChange={handleInputChange}
                className={`
                  w-full px-4 py-2.5 pr-10 rounded-xl border text-sm
                  transition-all duration-200
                  focus:outline-none focus:ring-2 focus:ring-offset-0
                  ${errors.newPassword 
                    ? 'border-rose-300 focus:ring-rose-500/20 focus:border-rose-500' 
                    : 'border-gray-200 focus:ring-teal-500/20 focus:border-teal-500 hover:border-gray-300'
                  }
                `}
                placeholder="Ingresa tu nueva contraseña"
                aria-invalid={!!errors.newPassword}
              />
              <button
                type="button"
                onClick={() => togglePassword('new')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
              >
                {showPasswords.new ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            
            {/* Password Strength Indicator */}
            {formData.newPassword && (
              <div className="mt-2 space-y-2">
                <div className="flex items-center gap-2">
                  <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                    <div 
                      className={`h-full transition-all duration-300 ${getStrengthColor(passwordStrength.score)}`}
                      style={{ width: `${(passwordStrength.score / 4) * 100}%` }}
                    />
                  </div>
                  <span className={`text-xs font-medium ${
                    passwordStrength.score <= 2 ? 'text-amber-600' : 'text-teal-600'
                  }`}>
                    {getStrengthLabel(passwordStrength.score)}
                  </span>
                </div>
              </div>
            )}
            
            {errors.newPassword && (
              <p className="mt-1.5 text-xs text-rose-600 flex items-center gap-1">
                <AlertCircle className="w-3 h-3" />
                {errors.newPassword}
              </p>
            )}
          </div>

          {/* Confirm Password */}
          <div>
            <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1.5">
              Confirmar Nueva Contraseña
            </label>
            <div className="relative">
              <input
                id="confirmPassword"
                name="confirmPassword"
                type={showPasswords.confirm ? 'text' : 'password'}
                value={confirmPassword}
                onChange={handleInputChange}
                className={`
                  w-full px-4 py-2.5 pr-10 rounded-xl border text-sm
                  transition-all duration-200
                  focus:outline-none focus:ring-2 focus:ring-offset-0
                  ${errors.confirmPassword 
                    ? 'border-rose-300 focus:ring-rose-500/20 focus:border-rose-500' 
                    : confirmPassword && confirmPassword === formData.newPassword
                      ? 'border-teal-300 focus:ring-teal-500/20 focus:border-teal-500'
                      : 'border-gray-200 focus:ring-teal-500/20 focus:border-teal-500 hover:border-gray-300'
                  }
                `}
                placeholder="Confirma tu nueva contraseña"
                aria-invalid={!!errors.confirmPassword}
              />
              <button
                type="button"
                onClick={() => togglePassword('confirm')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
              >
                {showPasswords.confirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
              {confirmPassword && confirmPassword === formData.newPassword && (
                <div className="absolute right-10 top-1/2 -translate-y-1/2">
                  <Check className="w-4 h-4 text-teal-500" />
                </div>
              )}
            </div>
            {errors.confirmPassword && (
              <p className="mt-1.5 text-xs text-rose-600 flex items-center gap-1">
                <AlertCircle className="w-3 h-3" />
                {errors.confirmPassword}
              </p>
            )}
          </div>

          {/* Password Requirements */}
          <div className="bg-gray-50 rounded-xl p-4">
            <p className="text-xs font-medium text-gray-600 mb-2">Requisitos de contraseña:</p>
            <div className="grid grid-cols-2 gap-2">
              {[
                { key: 'length', label: 'Mínimo 8 caracteres' },
                { key: 'uppercase', label: 'Una mayúscula' },
                { key: 'lowercase', label: 'Una minúscula' },
                { key: 'number', label: 'Un número' },
              ].map(({ key, label }) => (
                <div 
                  key={key}
                  className={`flex items-center gap-1.5 text-xs ${
                    passwordStrength.checks[key as keyof typeof passwordStrength.checks]
                      ? 'text-teal-600'
                      : 'text-gray-400'
                  }`}
                >
                  <div className={`w-3.5 h-3.5 rounded-full flex items-center justify-center ${
                    passwordStrength.checks[key as keyof typeof passwordStrength.checks]
                      ? 'bg-teal-100'
                      : 'bg-gray-100'
                  }`}>
                    <Check className="w-2 h-2" />
                  </div>
                  {label}
                </div>
              ))}
            </div>
          </div>

          {/* Buttons */}
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={handleClose}
              className="
                flex-1 px-4 py-2.5 rounded-xl
                text-sm font-medium text-gray-700
                bg-white border border-gray-200
                hover:bg-gray-50 hover:border-gray-300
                transition-all duration-200
                focus:outline-none focus:ring-2 focus:ring-gray-500/20
              "
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="
                flex-1 px-4 py-2.5 rounded-xl
                text-sm font-medium text-white
                bg-gradient-to-r from-teal-500 to-cyan-600
                hover:from-teal-600 hover:to-cyan-700
                shadow-md shadow-teal-500/20
                transition-all duration-200
                focus:outline-none focus:ring-2 focus:ring-teal-500/50
                disabled:opacity-50 disabled:cursor-not-allowed
                flex items-center justify-center gap-2
              "
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Cambiando...
                </>
              ) : (
                'Cambiar Contraseña'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
});

ChangePasswordModal.displayName = 'ChangePasswordModal';

export default ChangePasswordModal;
