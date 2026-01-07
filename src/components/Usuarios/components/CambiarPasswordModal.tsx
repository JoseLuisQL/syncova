import React, { useState, memo } from 'react';
import { X, Loader2, Eye, EyeOff, Key } from 'lucide-react';
import { Usuario } from '../../../types';
import { COMPONENT_STYLES } from '../constants';

interface CambiarPasswordModalProps {
  usuario: Usuario;
  isOpen: boolean;
  isLoading: boolean;
  onClose: () => void;
  onSubmit: (newPassword: string) => void;
}

const CambiarPasswordModal: React.FC<CambiarPasswordModalProps> = memo(({
  usuario,
  isOpen,
  isLoading,
  onClose,
  onSubmit,
}) => {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!password) {
      newErrors.password = 'Contraseña requerida';
    } else if (password.length < 8) {
      newErrors.password = 'Mínimo 8 caracteres';
    }

    if (!confirmPassword) {
      newErrors.confirmPassword = 'Confirme la contraseña';
    } else if (password !== confirmPassword) {
      newErrors.confirmPassword = 'Las contraseñas no coinciden';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      onSubmit(password);
      setPassword('');
      setConfirmPassword('');
    }
  };

  const handleClose = () => {
    setPassword('');
    setConfirmPassword('');
    setErrors({});
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className={COMPONENT_STYLES.modal.overlay} onClick={handleClose}>
      <div
        className={COMPONENT_STYLES.modal.container}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className={COMPONENT_STYLES.modal.header}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-amber-100">
                <Key className="h-5 w-5 text-amber-600" />
              </div>
              <div>
                <h2 className={COMPONENT_STYLES.modal.headerTitle}>
                  Cambiar Contraseña
                </h2>
                <p className="text-sm text-gray-500">
                  {usuario.nombres} {usuario.apellidos}
                </p>
              </div>
            </div>
            <button
              onClick={handleClose}
              className="p-2 hover:bg-gray-200 rounded-lg transition-colors"
            >
              <X className="h-5 w-5 text-gray-500" />
            </button>
          </div>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className={COMPONENT_STYLES.modal.body}>
          <div className="space-y-4">
            {/* Nueva Contraseña */}
            <div>
              <label className={COMPONENT_STYLES.input.label}>Nueva Contraseña *</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (errors.password) setErrors(prev => ({ ...prev, password: '' }));
                  }}
                  className={`${COMPONENT_STYLES.input.base} ${
                    errors.password ? COMPONENT_STYLES.input.error : COMPONENT_STYLES.input.normal
                  } pr-10`}
                  placeholder="Mínimo 8 caracteres"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {errors.password && (
                <p className={COMPONENT_STYLES.input.errorText}>{errors.password}</p>
              )}
            </div>

            {/* Confirmar Contraseña */}
            <div>
              <label className={COMPONENT_STYLES.input.label}>Confirmar Contraseña *</label>
              <div className="relative">
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => {
                    setConfirmPassword(e.target.value);
                    if (errors.confirmPassword) setErrors(prev => ({ ...prev, confirmPassword: '' }));
                  }}
                  className={`${COMPONENT_STYLES.input.base} ${
                    errors.confirmPassword ? COMPONENT_STYLES.input.error : COMPONENT_STYLES.input.normal
                  } pr-10`}
                  placeholder="Repita la contraseña"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {errors.confirmPassword && (
                <p className={COMPONENT_STYLES.input.errorText}>{errors.confirmPassword}</p>
              )}
            </div>

            {/* Información de seguridad */}
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
              <p className="text-sm text-amber-800 font-medium mb-2">Requisitos de contraseña:</p>
              <ul className="text-xs text-amber-700 space-y-1 list-disc list-inside">
                <li>Mínimo 8 caracteres</li>
                <li>Se recomienda incluir mayúsculas, minúsculas y números</li>
              </ul>
            </div>
          </div>
        </form>

        {/* Footer */}
        <div className={COMPONENT_STYLES.modal.footer}>
          <button
            type="button"
            onClick={handleClose}
            className={COMPONENT_STYLES.button.secondary}
            disabled={isLoading}
          >
            Cancelar
          </button>
          <button
            onClick={handleSubmit}
            className={COMPONENT_STYLES.button.warning}
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Guardando...
              </>
            ) : (
              <>
                <Key className="h-4 w-4" />
                Cambiar Contraseña
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
});

CambiarPasswordModal.displayName = 'CambiarPasswordModal';

export default CambiarPasswordModal;
