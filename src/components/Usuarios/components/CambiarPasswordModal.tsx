import React, { memo, useEffect, useState } from 'react';
import { Eye, EyeOff, KeyRound, ShieldCheck } from 'lucide-react';
import { Usuario } from '../../../types';
import { COMPONENT_STYLES } from '../constants';
import { FormField, FormSection, Modal, ModalFooter } from './ModalComponents';

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

  useEffect(() => {
    if (isOpen) {
      setPassword('');
      setConfirmPassword('');
      setShowPassword(false);
      setShowConfirmPassword(false);
      setErrors({});
    }
  }, [isOpen, usuario.id]);

  const validateForm = () => {
    const nextErrors: Record<string, string> = {};

    if (!password) {
      nextErrors.password = 'Ingrese una nueva contraseña.';
    } else if (password.length < 8) {
      nextErrors.password = 'La contraseña debe tener al menos 8 caracteres.';
    }

    if (!confirmPassword) {
      nextErrors.confirmPassword = 'Confirme la nueva contraseña.';
    } else if (password !== confirmPassword) {
      nextErrors.confirmPassword = 'Las contraseñas no coinciden.';
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = () => {
    if (!validateForm()) {
      return;
    }

    onSubmit(password);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Actualizar contraseña"
      subtitle={`${usuario.nombres} ${usuario.apellidos} · @${usuario.usuario}`}
      icon={KeyRound}
      size="md"
      footer={(
        <ModalFooter
          onCancel={onClose}
          onSubmit={handleSubmit}
          submitType="button"
          submitLabel="Guardar contraseña"
          isLoading={isLoading}
          submitClassName={COMPONENT_STYLES.button.warning}
        />
      )}
    >
      <div className="space-y-4">
        <div className="rounded-[22px] border border-cyan-200 bg-cyan-50/80 p-4">
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white text-cyan-700 shadow-sm">
              <ShieldCheck className="h-4 w-4" aria-hidden="true" />
            </div>
            <div>
              <p className="text-sm font-semibold text-cyan-900">Actualización controlada</p>
              <p className="mt-1 text-sm text-cyan-800">
                Este cambio impacta el acceso inmediato del usuario. Usa una contraseña temporal segura si el restablecimiento
                será comunicado por otro canal.
              </p>
            </div>
          </div>
        </div>

        <FormSection title="Nueva credencial" description="Define la nueva contraseña y confirma el valor antes de guardarlo.">
          <div className="space-y-4">
            <FormField
              id="password-new"
              label="Nueva contraseña"
              required
              error={errors.password}
              helpText="Mínimo 8 caracteres. Se recomienda combinar mayúsculas, minúsculas y números."
            >
              <div className="relative">
                <input
                  id="password-new"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(event) => {
                    setPassword(event.target.value);
                    if (errors.password) {
                      setErrors((prev) => ({ ...prev, password: '' }));
                    }
                  }}
                  className={`${COMPONENT_STYLES.input.base} ${
                    errors.password ? COMPONENT_STYLES.input.error : COMPONENT_STYLES.input.normal
                  } pr-11`}
                  placeholder="Ingrese la nueva contraseña"
                  aria-invalid={Boolean(errors.password)}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 transition-colors hover:text-slate-600"
                  aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </FormField>

            <FormField
              id="password-confirm"
              label="Confirmar contraseña"
              required
              error={errors.confirmPassword}
            >
              <div className="relative">
                <input
                  id="password-confirm"
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(event) => {
                    setConfirmPassword(event.target.value);
                    if (errors.confirmPassword) {
                      setErrors((prev) => ({ ...prev, confirmPassword: '' }));
                    }
                  }}
                  className={`${COMPONENT_STYLES.input.base} ${
                    errors.confirmPassword ? COMPONENT_STYLES.input.error : COMPONENT_STYLES.input.normal
                  } pr-11`}
                  placeholder="Repita la nueva contraseña"
                  aria-invalid={Boolean(errors.confirmPassword)}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword((prev) => !prev)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 transition-colors hover:text-slate-600"
                  aria-label={showConfirmPassword ? 'Ocultar confirmación' : 'Mostrar confirmación'}
                >
                  {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </FormField>
          </div>
        </FormSection>
      </div>
    </Modal>
  );
});

CambiarPasswordModal.displayName = 'CambiarPasswordModal';

export default CambiarPasswordModal;
