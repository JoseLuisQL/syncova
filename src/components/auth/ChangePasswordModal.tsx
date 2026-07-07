import React, { useState, useCallback, useMemo, memo } from 'react';
import { createPortal } from 'react-dom';
import { useAuth } from '../../contexts/AuthContext';
import { ChangePasswordDto } from '../../types';
import { useToastContext } from '../../contexts/ToastContext';
import { X, Shield, Eye, EyeClosed, Check, WarningCircle, SpinnerGap } from '@phosphor-icons/react';

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
    if (score <= 3) return 'bg-emerald-400';
    return 'bg-emerald-500';
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
      className="fixed inset-0 z-[300] flex items-center justify-center bg-ink-soft/20 p-4 backdrop-blur-[2px]"
      onClick={(e) => e.target === e.currentTarget && handleClose()}
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
    >
      <div className="w-full max-w-md overflow-hidden rounded-lg border border-line bg-white shadow-[0_22px_54px_-38px_rgba(12,15,24,0.55)] animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="border-b border-line-soft bg-white px-5 py-3.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-[7px] border border-line bg-surface-soft text-muted-2">
                <Shield className="h-4 w-4" weight="duotone" />
              </div>
              <div>
                <h3 id="modal-title" className="text-md font-semibold leading-5 tracking-[-0.01em] text-ink">
                  Cambiar Contraseña
                </h3>
                <p className="mt-1 text-sm leading-4 text-muted-2">Actualiza tu acceso permanentemente</p>
              </div>
            </div>
            <button type="button"
              onClick={handleClose}
              className="rounded-[7px] border border-transparent p-1.5 text-muted transition-all hover:bg-surface-soft hover:text-ink focus:outline-none focus:ring-2 focus:ring-line-focus/70"
              aria-label="Cerrar"
            >
              <X className="h-4 w-4" weight="bold" />
            </button>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4 px-5 py-4">
          {/* Current Password */}
          <div>
            <label htmlFor="currentPassword" className="mb-1.5 block text-sm font-medium text-[#424750]">
              Contraseña Actual
            </label>
            <div className="relative group/input">
              <input
                id="currentPassword"
                name="currentPassword"
                type={showPasswords.current ? 'text' : 'password'}
                value={formData.currentPassword}
                onChange={handleInputChange}
                className={`
                  min-h-9 w-full rounded-[7px] border bg-white px-3 py-2 pr-10 text-base font-medium
                  transition-all duration-200
                  focus:outline-none focus:ring-2 focus:ring-offset-0
                  ${errors.currentPassword 
                    ? 'border-rose-300 focus:ring-rose-500 focus:border-rose-500 bg-rose-50/20' 
                    : 'border-line focus:ring-line-focus/70 focus:border-line-focus-strong group-hover/input:border-line-strong'
                  }
                `}
                placeholder="Ingresa tu contraseña actual"
                aria-invalid={!!errors.currentPassword}
              />
              <button
                type="button"
                onClick={() => togglePassword('current')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-900 transition-colors focus:outline-none rounded-md p-1"
                aria-label={showPasswords.current ? 'Ocultar contraseña' : 'Mostrar contraseña'}
              >
                {showPasswords.current ? <EyeClosed className="w-5 h-5" weight="fill" /> : <Eye className="w-5 h-5" weight="fill" />}
              </button>
            </div>
            {errors.currentPassword && (
              <p className="mt-1.5 text-base font-medium text-rose-600 flex items-center gap-1.5">
                <WarningCircle className="w-4 h-4" weight="fill" />
                {errors.currentPassword}
              </p>
            )}
          </div>

          {/* New Password */}
          <div>
            <label htmlFor="newPassword" className="mb-1.5 block text-sm font-medium text-[#424750]">
              Nueva Contraseña
            </label>
            <div className="relative group/input">
              <input
                id="newPassword"
                name="newPassword"
                type={showPasswords.new ? 'text' : 'password'}
                value={formData.newPassword}
                onChange={handleInputChange}
                className={`
                  min-h-9 w-full rounded-[7px] border bg-white px-3 py-2 pr-10 text-base font-medium
                  transition-all duration-200
                  focus:outline-none focus:ring-2 focus:ring-offset-0
                  ${errors.newPassword 
                    ? 'border-rose-300 focus:ring-rose-500 focus:border-rose-500 bg-rose-50/20' 
                    : 'border-line focus:ring-line-focus/70 focus:border-line-focus-strong group-hover/input:border-line-strong'
                  }
                `}
                placeholder="Ingresa tu nueva contraseña"
                aria-invalid={!!errors.newPassword}
              />
              <button
                type="button"
                onClick={() => togglePassword('new')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-900 transition-colors focus:outline-none rounded-md p-1"
              >
                {showPasswords.new ? <EyeClosed className="w-5 h-5" weight="fill" /> : <Eye className="w-5 h-5" weight="fill" />}
              </button>
            </div>
            
            {/* Password Strength Indicator */}
            {formData.newPassword && (
              <div className="mt-3 space-y-2">
                <div className="flex items-center gap-3">
                  <div className="flex-1 h-1 bg-zinc-100 rounded-full overflow-hidden">
                    <div 
                      className={`h-full transition-all duration-300 ${getStrengthColor(passwordStrength.score)}`}
                      style={{ width: `${(passwordStrength.score / 4) * 100}%` }}
                    />
                  </div>
                  <span className={`text-xs font-bold uppercase tracking-wider ${
                    passwordStrength.score <= 2 ? 'text-amber-600' : 'text-emerald-600'
                  }`}>
                    {getStrengthLabel(passwordStrength.score)}
                  </span>
                </div>
              </div>
            )}
            
            {errors.newPassword && (
              <p className="mt-1.5 text-base font-medium text-rose-600 flex items-center gap-1.5">
                <WarningCircle className="w-4 h-4" weight="fill" />
                {errors.newPassword}
              </p>
            )}
          </div>

          {/* Confirm Password */}
          <div>
            <label htmlFor="confirmPassword" className="mb-1.5 block text-sm font-medium text-[#424750]">
              Confirmar Nueva Contraseña
            </label>
            <div className="relative group/input">
              <input
                id="confirmPassword"
                name="confirmPassword"
                type={showPasswords.confirm ? 'text' : 'password'}
                value={confirmPassword}
                onChange={handleInputChange}
                className={`
                  min-h-9 w-full rounded-[7px] border bg-white px-3 py-2 pr-10 text-base font-medium
                  transition-all duration-200
                  focus:outline-none focus:ring-2 focus:ring-offset-0
                  ${errors.confirmPassword 
                    ? 'border-rose-300 focus:ring-rose-500 focus:border-rose-500 bg-rose-50/20' 
                    : confirmPassword && confirmPassword === formData.newPassword
                      ? 'border-emerald-300 focus:ring-emerald-500 focus:border-emerald-500 bg-emerald-50/10'
                      : 'border-line focus:ring-line-focus/70 focus:border-line-focus-strong group-hover/input:border-line-strong'
                  }
                `}
                placeholder="Confirma tu nueva contraseña"
                aria-invalid={!!errors.confirmPassword}
              />
              <button
                type="button"
                onClick={() => togglePassword('confirm')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-900 transition-colors focus:outline-none rounded-md p-1"
              >
                {showPasswords.confirm ? <EyeClosed className="w-5 h-5" weight="fill" /> : <Eye className="w-5 h-5" weight="fill" />}
              </button>
              {confirmPassword && confirmPassword === formData.newPassword && (
                <div className="absolute right-10 top-1/2 -translate-y-1/2">
                  <Check className="w-5 h-5 text-emerald-500" weight="bold" />
                </div>
              )}
            </div>
            {errors.confirmPassword && (
              <p className="mt-1.5 text-base font-medium text-rose-600 flex items-center gap-1.5">
                <WarningCircle className="w-4 h-4" weight="fill" />
                {errors.confirmPassword}
              </p>
            )}
          </div>

          {/* Password Requirements */}
          <div className="rounded-md border border-line bg-surface-soft p-3">
            <p className="text-xs font-bold uppercase tracking-wider text-zinc-500 mb-3">Requisitos obligatorios</p>
            <div className="grid grid-cols-2 gap-y-2 gap-x-2">
              {[
                { key: 'length', label: '8+ caracteres' },
                { key: 'uppercase', label: '1 Mayúscula' },
                { key: 'lowercase', label: '1 Minúscula' },
                { key: 'number', label: '1 Número' },
              ].map(({ key, label }) => (
                <div 
                  key={key}
                  className={`flex items-center gap-2 text-base font-medium transition-colors duration-300 ${
                    passwordStrength.checks[key as keyof typeof passwordStrength.checks]
                      ? 'text-emerald-700'
                      : 'text-zinc-500'
                  }`}
                >
                  <div className={`w-4 h-4 rounded-[4px] flex items-center justify-center transition-colors duration-300 ${
                    passwordStrength.checks[key as keyof typeof passwordStrength.checks]
                      ? 'bg-emerald-100/80 text-emerald-600'
                      : 'bg-zinc-200/50 text-zinc-400'
                  }`}>
                    <Check className="w-3 h-3" weight="bold" />
                  </div>
                  {label}
                </div>
              ))}
            </div>
          </div>

          {/* Buttons */}
          <div className="flex gap-2 border-t border-line-soft bg-surface-soft px-5 py-3 -mx-5 -mb-4">
            <button
              type="button"
              onClick={handleClose}
              className="
                h-9 flex-none rounded-[7px]
                border border-line bg-white px-3.5
                text-base font-semibold text-ink
                hover:bg-surface-soft
                transition-all duration-200
                focus:outline-none focus:ring-2 focus:ring-line-focus/70
              "
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="
                h-9 flex-1 rounded-[7px] px-3.5
                text-base font-semibold text-white
                bg-brand hover:bg-brand-600
                shadow-none
                transition-all duration-200
                focus:outline-none focus:ring-2 focus:ring-brand/20 focus:ring-offset-2
                disabled:opacity-50 disabled:cursor-not-allowed
                flex items-center justify-center gap-2
              "
            >
              {isLoading ? (
                <>
                  <SpinnerGap className="w-5 h-5 animate-spin" weight="bold" />
                  Cambiando...
                </>
              ) : (
                'Guardar nueva contraseña'
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
