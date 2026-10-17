import React, { useState, useCallback, useMemo, memo } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { ChangePasswordDto } from '../../types';
import { useToastContext } from '../../contexts/ToastContext';
import { Shield, Eye, EyeClosed, Check } from '@phosphor-icons/react';
import { Modal, ModalFooter, FormField } from '../ui/ModalElements';
import { MODAL_STYLES } from '../ui/ModalConstants';

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

  const handleSubmit = useCallback(async (e?: React.FormEvent) => {
    e?.preventDefault();
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

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Cambiar contraseña"
      subtitle="Actualiza tu credencial de acceso de forma segura"
      icon={Shield}
      size="sm"
      footer={
        <ModalFooter
          onCancel={handleClose}
          onSubmit={() => void handleSubmit()}
          submitType="button"
          submitLabel={isLoading ? 'Cambiando...' : 'Guardar nueva contraseña'}
          isLoading={isLoading}
        />
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <FormField
          id="currentPassword"
          label="Contraseña actual"
          required
          error={errors.currentPassword}
        >
          <div className="relative">
            <input
              id="currentPassword"
              name="currentPassword"
              type={showPasswords.current ? 'text' : 'password'}
              value={formData.currentPassword}
              onChange={handleInputChange}
              className={`${MODAL_STYLES.input.base} pr-10 ${
                errors.currentPassword ? MODAL_STYLES.input.error : MODAL_STYLES.input.normal
              }`}
              placeholder="Ingresa tu contraseña actual"
              aria-invalid={!!errors.currentPassword}
            />
            <button
              type="button"
              onClick={() => togglePassword('current')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 rounded-lg p-1 text-muted transition-colors hover:bg-surface-soft hover:text-ink"
              aria-label={showPasswords.current ? 'Ocultar contraseña' : 'Mostrar contraseña'}
            >
              {showPasswords.current ? <EyeClosed className="h-4 w-4" weight="bold" /> : <Eye className="h-4 w-4" weight="bold" />}
            </button>
          </div>
        </FormField>

        <div>
          <FormField
            id="newPassword"
            label="Nueva contraseña"
            required
            error={errors.newPassword}
          >
            <div className="relative">
              <input
                id="newPassword"
                name="newPassword"
                type={showPasswords.new ? 'text' : 'password'}
                value={formData.newPassword}
                onChange={handleInputChange}
                className={`${MODAL_STYLES.input.base} pr-10 ${
                  errors.newPassword ? MODAL_STYLES.input.error : MODAL_STYLES.input.normal
                }`}
                placeholder="Ingresa tu nueva contraseña"
                aria-invalid={!!errors.newPassword}
              />
              <button
                type="button"
                onClick={() => togglePassword('new')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 rounded-lg p-1 text-muted transition-colors hover:bg-surface-soft hover:text-ink"
                aria-label={showPasswords.new ? 'Ocultar contraseña' : 'Mostrar contraseña'}
              >
                {showPasswords.new ? <EyeClosed className="h-4 w-4" weight="bold" /> : <Eye className="h-4 w-4" weight="bold" />}
              </button>
            </div>
          </FormField>

          {formData.newPassword && (
            <div className="mt-2.5 flex items-center gap-3">
              <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-surface-soft">
                <div
                  className={`h-full transition-all duration-300 ${getStrengthColor(passwordStrength.score)}`}
                  style={{ width: `${(passwordStrength.score / 4) * 100}%` }}
                />
              </div>
              <span
                className={`text-[11px] font-semibold uppercase tracking-wider ${
                  passwordStrength.score <= 2 ? 'text-amber-600' : 'text-emerald-600'
                }`}
              >
                {getStrengthLabel(passwordStrength.score)}
              </span>
            </div>
          )}
        </div>

        <FormField
          id="confirmPassword"
          label="Confirmar nueva contraseña"
          required
          error={errors.confirmPassword}
        >
          <div className="relative">
            <input
              id="confirmPassword"
              name="confirmPassword"
              type={showPasswords.confirm ? 'text' : 'password'}
              value={confirmPassword}
              onChange={handleInputChange}
              className={`${MODAL_STYLES.input.base} pr-16 ${
                errors.confirmPassword
                  ? MODAL_STYLES.input.error
                  : confirmPassword && confirmPassword === formData.newPassword
                  ? 'border-emerald-300 focus:border-emerald-500 focus:ring-emerald-500/20'
                  : MODAL_STYLES.input.normal
              }`}
              placeholder="Confirma tu nueva contraseña"
              aria-invalid={!!errors.confirmPassword}
            />
            {confirmPassword && confirmPassword === formData.newPassword && (
              <div className="pointer-events-none absolute right-9 top-1/2 -translate-y-1/2">
                <Check className="h-4 w-4 text-emerald-500" weight="bold" />
              </div>
            )}
            <button
              type="button"
              onClick={() => togglePassword('confirm')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 rounded-lg p-1 text-muted transition-colors hover:bg-surface-soft hover:text-ink"
              aria-label={showPasswords.confirm ? 'Ocultar contraseña' : 'Mostrar contraseña'}
            >
              {showPasswords.confirm ? <EyeClosed className="h-4 w-4" weight="bold" /> : <Eye className="h-4 w-4" weight="bold" />}
            </button>
          </div>
        </FormField>

        <div className="rounded-xl border border-line-soft bg-surface-soft/60 p-3.5">
          <p className="mb-2.5 text-[11px] font-semibold uppercase tracking-[0.04em] text-muted">
            Requisitos de seguridad
          </p>
          <div className="grid grid-cols-2 gap-2">
            {[
              { key: 'length', label: '8+ caracteres' },
              { key: 'uppercase', label: '1 Mayúscula' },
              { key: 'lowercase', label: '1 Minúscula' },
              { key: 'number', label: '1 Número' },
            ].map(({ key, label }) => {
              const met = passwordStrength.checks[key as keyof typeof passwordStrength.checks];
              return (
                <div
                  key={key}
                  className={`flex items-center gap-2 text-xs font-medium transition-colors ${
                    met ? 'text-emerald-700 dark:text-emerald-400' : 'text-muted'
                  }`}
                >
                  <div
                    className={`flex h-4 w-4 items-center justify-center rounded-md border transition-colors ${
                      met
                        ? 'border-emerald-200 bg-emerald-50 text-emerald-600 dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-400'
                        : 'border-line bg-surface text-muted'
                    }`}
                  >
                    <Check className="h-2.5 w-2.5" weight="bold" />
                  </div>
                  {label}
                </div>
              );
            })}
          </div>
        </div>
      </form>
    </Modal>
  );
});

ChangePasswordModal.displayName = 'ChangePasswordModal';

export default ChangePasswordModal;

