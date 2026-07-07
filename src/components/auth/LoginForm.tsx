import React, { useState, useCallback, useMemo } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { LoginDto } from '../../types';
import { useToastContext } from '../../contexts/ToastContext';
import { useRateLimitHandler } from '../../hooks/useRateLimitHandler';
import { SivacLogo } from '../common/SivacLogo';
import { User, LockKey, Eye, EyeClosed, SpinnerGap, Clock as ClockIcon, WarningCircle, XCircle } from '@phosphor-icons/react';

// ============================================================================
// CONSTANTS
// ============================================================================

const INPUT_BASE_CLASSES =
  'block h-10 w-full rounded-md border bg-white py-2 pl-10 pr-3 text-base font-medium ' +
  'text-ink shadow-none transition-colors duration-150 placeholder:text-[#a0a4ae] ' +
  'focus:outline-none focus:ring-2';

const INPUT_NORMAL_CLASSES = 'border-line hover:border-line-strong focus:border-line-focus-strong focus:ring-line-focus/70';
const INPUT_ERROR_CLASSES = 'border-rose-300 focus:ring-rose-500/10 focus:border-rose-500 bg-rose-50/30';

const LABEL_CLASSES = 'mb-1.5 block text-sm font-medium text-[#424750]';
const ERROR_TEXT_CLASSES = 'mt-1.5 text-xs font-medium text-rose-600 flex items-center gap-1.5';

// ============================================================================
// VALIDATION HELPERS
// ============================================================================

interface ValidationErrors {
  usuario?: string;
  password?: string;
}

const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

const validateLoginForm = (data: LoginDto): ValidationErrors => {
  const errors: ValidationErrors = {};
  const trimmedUsuario = data.usuario.trim();

  if (!trimmedUsuario) {
    errors.usuario = 'El usuario es requerido';
  } else if (trimmedUsuario.length < 3) {
    errors.usuario = 'El usuario debe tener al menos 3 caracteres';
  } else if (trimmedUsuario.includes('@') && !isValidEmail(trimmedUsuario)) {
    errors.usuario = 'El formato del email no es válido';
  } else if (/\s/.test(trimmedUsuario)) {
    errors.usuario = 'El usuario no puede contener espacios';
  }

  if (!data.password) {
    errors.password = 'La contraseña es requerida';
  }

  return errors;
};

// ============================================================================
// FORM INPUT COMPONENTS
// ============================================================================

interface InputFieldProps {
  id: string;
  name: string;
  type: string;
  label: string;
  value: string;
  placeholder: string;
  error?: string;
  autoComplete?: string;
  icon: React.ReactNode;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  rightElement?: React.ReactNode;
}

const InputField: React.FC<InputFieldProps> = ({
  id,
  name,
  type,
  label,
  value,
  placeholder,
  error,
  autoComplete,
  icon,
  onChange,
  rightElement,
}) => {
  const inputClasses = useMemo(
    () => `${INPUT_BASE_CLASSES} ${error ? INPUT_ERROR_CLASSES : INPUT_NORMAL_CLASSES} ${rightElement ? 'pr-12' : ''}`,
    [error, rightElement]
  );

  return (
    <div>
      <label htmlFor={id} className={LABEL_CLASSES}>
        {label} <span className="text-muted">*</span>
      </label>
      <div className="group relative">
        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 transition-colors duration-150">
          <span className={`${error ? 'text-rose-400' : 'text-muted group-focus-within:text-muted-2'}`}>
            {icon}
          </span>
        </div>
        <input
          id={id}
          name={name}
          type={type}
          autoComplete={autoComplete}
          required
          value={value}
          onChange={onChange}
          className={inputClasses}
          placeholder={placeholder}
          aria-invalid={!!error}
          aria-describedby={error ? `${id}-error` : undefined}
        />
        {rightElement && (
          <div className="absolute inset-y-0 right-0 flex items-center pr-2">
            {rightElement}
          </div>
        )}
      </div>
      {error && (
        <p id={`${id}-error`} className={ERROR_TEXT_CLASSES} role="alert">
          <WarningCircle className="w-4 h-4" weight="fill" />
          {error}
        </p>
      )}
    </div>
  );
};

// ============================================================================
// RATE LIMIT ALERT COMPONENT
// ============================================================================

interface RateLimitAlertProps {
  remainingTime: number;
}

const RateLimitAlert: React.FC<RateLimitAlertProps> = ({ remainingTime }) => {
  const minutes = Math.floor(remainingTime / 60);
  const seconds = remainingTime % 60;
  const timeDisplay = `${minutes}:${String(seconds).padStart(2, '0')}`;

  return (
    <div
      className="mt-4 animate-fade-in rounded-md border border-amber-200 bg-amber-50 px-3 py-2.5"
      role="alert"
    >
      <div className="flex items-start gap-3">
        <WarningCircle className="mt-0.5 h-4 w-4 flex-shrink-0 text-amber-600" weight="fill" />
        <div>
          <p className="text-base font-semibold text-amber-900">
            Demasiados intentos
          </p>
          <p className="mt-0.5 text-xs font-medium leading-relaxed text-amber-800">
            Podrá intentar nuevamente en{' '}
            <span className="ml-0.5 rounded bg-amber-100 px-1.5 py-0.5 font-mono font-bold">{timeDisplay}</span>
          </p>
        </div>
      </div>
    </div>
  );
};

// ============================================================================
// SUBMIT BUTTON COMPONENT
// ============================================================================

interface SubmitButtonProps {
  isLoading: boolean;
  canRetry: boolean;
  remainingTime: number;
}

const SubmitButton: React.FC<SubmitButtonProps> = ({ isLoading, canRetry, remainingTime }) => {
  const isDisabled = isLoading || !canRetry;

  const buttonClasses = useMemo(() => {
    const base =
      'flex h-10 w-full items-center justify-center gap-2 rounded-md px-4 text-base ' +
      'font-semibold transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-offset-2';

    if (isDisabled) {
      return `${base} cursor-not-allowed border border-line bg-surface-soft text-muted`;
    }
    return `${base} border border-brand bg-brand text-white hover:bg-brand-600 focus:ring-brand/20`;
  }, [isDisabled]);

  const renderContent = () => {
    if (isLoading) {
      return (
        <>
          <SpinnerGap className="h-5 w-5 animate-spin" weight="bold" />
          <span>Ingresando...</span>
        </>
      );
    }

    if (!canRetry) {
      const minutes = Math.ceil(remainingTime / 60);
      return (
        <>
          <ClockIcon className="h-5 w-5" weight="bold" />
          <span>Espere {minutes} min</span>
        </>
      );
    }

    return <span>Iniciar sesión</span>;
  };

  return (
    <button
      type="submit"
      disabled={isDisabled}
      className={buttonClasses}
      aria-busy={isLoading}
    >
      {renderContent()}
    </button>
  );
};

// ============================================================================
// MAIN LOGIN FORM COMPONENT
// ============================================================================

const LoginForm: React.FC = () => {
  const { login, isLoading } = useAuth();
  const { toast } = useToastContext();
  const { rateLimitState, handleRateLimitError, canRetry } = useRateLimitHandler();

  const [formData, setFormData] = useState<LoginDto>({
    usuario: '',
    password: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<ValidationErrors>({});
  const [authError, setAuthError] = useState<string | null>(null);

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;

    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));

    if (errors[name as keyof ValidationErrors]) {
      setErrors(prev => ({
        ...prev,
        [name]: undefined,
      }));
    }
  }, [errors]);

  const togglePasswordVisibility = useCallback(() => {
    setShowPassword(prev => !prev);
  }, []);

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();

    const validationErrors = validateLoginForm(formData);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    if (!canRetry) {
      const minutes = Math.ceil(rateLimitState.remainingTime / 60);
      toast.error(`Debe esperar ${minutes} minuto${minutes > 1 ? 's' : ''} antes de intentar nuevamente`);
      return;
    }

    try {
      setAuthError(null);
      await login(formData);
      toast.success('Inicio de sesión exitoso');
    } catch (error: unknown) {
      console.error('Error en login:', error);

      if (!handleRateLimitError(error)) {
        const errorMessage = error instanceof Error ? error.message : 'Error al iniciar sesión';
        setAuthError(errorMessage);
        toast.error(errorMessage);
      }
    }
  }, [formData, canRetry, rateLimitState.remainingTime, toast, login, handleRateLimitError]);

  const passwordToggleButton = useMemo(() => (
    <button
      type="button"
      onClick={togglePasswordVisibility}
      className="rounded-[7px] p-1.5 text-muted transition-colors hover:bg-surface-soft hover:text-ink focus:outline-none focus:ring-2 focus:ring-line-focus/70"
      aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
    >
      {showPassword ? <EyeClosed className="w-[18px] h-[18px]" weight="bold" /> : <Eye className="w-[18px] h-[18px]" weight="bold" />}
    </button>
  ), [showPassword, togglePasswordVisibility]);

  return (
    <div className="relative flex min-h-[100dvh] w-full items-center justify-center overflow-hidden bg-[#eef0f3] p-4 font-sans sm:p-8">
      <div className="absolute inset-0 z-0">
        <img
          src="/portada.png"
          alt="SIVAC Background"
          className="absolute inset-0 h-full w-full object-cover object-center"
        />
        <div className="absolute inset-0 bg-ink-soft/35 backdrop-blur-[1px]" />
      </div>

      <div className="relative z-10 w-full max-w-[392px] animate-fade-in-up">
        <div className="overflow-hidden rounded-xl border border-line bg-white shadow-[0_24px_64px_-42px_rgba(12,15,24,0.72)]">
          <div className="border-b border-line-soft px-6 py-5">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-lg border border-line bg-surface-soft">
                <SivacLogo size={30} />
              </div>
              <div>
                <h1 className="text-xl font-semibold leading-6 tracking-[-0.02em] text-ink">
                  SIVAC
                </h1>
                <p className="mt-0.5 text-sm font-medium text-muted-2">
                  Acceso seguro al sistema
                </p>
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit} noValidate className="space-y-4 px-6 py-5">
            <InputField
              id="usuario"
              name="usuario"
              type="text"
              label="Usuario o correo"
              value={formData.usuario}
              placeholder="usuario@mail.com"
              error={errors.usuario}
              autoComplete="username"
              icon={<User className="w-[18px] h-[18px]" weight="bold" />}
              onChange={handleInputChange}
            />

            <InputField
              id="password"
              name="password"
              type={showPassword ? 'text' : 'password'}
              label="Contraseña"
              value={formData.password}
              placeholder="••••••••"
              error={errors.password}
              autoComplete="current-password"
              icon={<LockKey className="w-[18px] h-[18px]" weight="bold" />}
              onChange={handleInputChange}
              rightElement={passwordToggleButton}
            />

            {authError && (
              <div className="rounded-md border border-rose-200 bg-rose-50 px-3 py-2.5" role="alert">
                <p className="flex items-center gap-2 text-base font-medium text-rose-700">
                  <XCircle className="h-4 w-4 flex-shrink-0" weight="fill" />
                  {authError}
                </p>
              </div>
            )}

            <div className="pt-2">
              <SubmitButton
                isLoading={isLoading}
                canRetry={canRetry}
                remainingTime={rateLimitState.remainingTime}
              />
            </div>

            {rateLimitState.isBlocked && (
              <RateLimitAlert remainingTime={rateLimitState.remainingTime} />
            )}
          </form>
        </div>

        <footer className="mt-5 text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.12em] text-white/65">
            Sede • Disa Apurímac II
          </p>
        </footer>

      </div>

    </div>
  );
};

export default LoginForm;
