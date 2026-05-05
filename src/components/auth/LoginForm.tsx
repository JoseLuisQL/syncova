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
  'block w-full pl-11 pr-4 py-3 rounded-xl border text-zinc-900 placeholder-zinc-400 ' +
  'focus:outline-none focus:ring-[3px] transition-all duration-200 bg-white ' +
  'text-[15px] font-medium shadow-sm';

const INPUT_NORMAL_CLASSES = 'border-zinc-200 hover:border-zinc-300 focus:border-teal-500 focus:ring-teal-500/10';
const INPUT_ERROR_CLASSES = 'border-rose-300 focus:ring-rose-500/10 focus:border-rose-500 bg-rose-50/30';

const LABEL_CLASSES = 'block text-sm font-semibold text-zinc-900 mb-2 tracking-tight';
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
        {label} <span className="text-zinc-400">*</span>
      </label>
      <div className="relative group">
        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none transition-colors duration-200">
          <span className={`${error ? 'text-rose-400' : 'text-zinc-400 group-focus-within:text-zinc-900'}`}>
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
          <div className="absolute inset-y-0 right-0 pr-2.5 flex items-center">
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
      className="mt-5 p-4 bg-amber-50/80 border border-amber-200/60 rounded-xl animate-fade-in"
      role="alert"
    >
      <div className="flex items-start gap-3">
        <WarningCircle className="h-5 w-5 text-amber-500 flex-shrink-0 mt-0.5" weight="fill" />
        <div>
          <p className="text-sm font-semibold text-amber-900 tracking-tight">
            Demasiados intentos
          </p>
          <p className="text-[13px] text-amber-800 mt-0.5 font-medium leading-relaxed">
            Podrá intentar nuevamente en{' '}
            <span className="font-mono font-bold bg-amber-100/50 px-1.5 py-0.5 rounded ml-0.5">{timeDisplay}</span>
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
      'w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-[15px] ' +
      'font-bold transition-all duration-200 focus:outline-none focus:ring-[3px] ' +
      'focus:ring-offset-1 shadow-sm';

    if (isDisabled) {
      return `${base} bg-zinc-100 text-zinc-400 cursor-not-allowed border border-zinc-200/50 shadow-none`;
    }
    return `${base} bg-[#14B8A6] text-white hover:bg-[#0D9488] focus:ring-[#14B8A6]/20 active:scale-[0.98] border border-transparent shadow-md shadow-[#14B8A6]/20`;
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
      className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-700 hover:bg-zinc-100/80 transition-colors focus:outline-none focus:ring-2 focus:ring-zinc-200"
      aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
    >
      {showPassword ? <EyeClosed className="w-[18px] h-[18px]" weight="bold" /> : <Eye className="w-[18px] h-[18px]" weight="bold" />}
    </button>
  ), [showPassword, togglePasswordVisibility]);

  return (
    <div className="relative min-h-[100dvh] w-full flex items-center justify-center font-sans p-4 sm:p-8 overflow-hidden">

      {/* Background Image Layer */}
      <div className="absolute inset-0 z-0">
        <img
          src="/portada.png"
          alt="SIVAC Background"
          className="absolute inset-0 w-full h-full object-cover object-center"
        />
        <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" />
      </div>

      <div className="relative z-10 w-full max-w-[420px] animate-fade-in-up">

        {/* Logo and Header */}
        <div className="flex flex-col items-center mb-8">
          <div className="mb-6 bg-white/10 backdrop-blur-md p-4 rounded-[20px] shadow-xl border border-white/20 flex items-center justify-center">
            <SivacLogo size={80} />
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight text-center drop-shadow-md">
            Acceso a SIVAC
          </h1>
          <p className="text-[15px] font-medium text-blue-100/90 mt-2 text-center max-w-[280px] leading-relaxed drop-shadow">
            Gestión de inventarios y red de frío en tiempo real
          </p>
        </div>

        {/* Form Card */}
        <div className="bg-white/95 backdrop-blur-xl p-7 sm:p-10 rounded-[28px] shadow-[0_24px_48px_rgba(0,0,0,0.4)] border border-white/50 relative overflow-hidden">
          {/* Subtle top accent */}
          <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-blue-500 to-sky-400 opacity-100" />

          <form onSubmit={handleSubmit} noValidate className="space-y-5">
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
              <div className="p-3.5 bg-rose-50/80 border border-rose-200/60 rounded-xl" role="alert">
                <p className="text-[13px] font-semibold text-rose-700 flex items-center gap-2">
                  <XCircle className="w-5 h-5 flex-shrink-0" weight="fill" />
                  {authError}
                </p>
              </div>
            )}

            <div className="pt-3">
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

        {/* Footer */}
        <footer className="mt-10 text-center">
          <p className="text-[11px] font-bold tracking-[0.1em] text-white/50 uppercase drop-shadow-sm">
            Sede • Disa Apurímac II
          </p>
        </footer>

      </div>

    </div>
  );
};

export default LoginForm;
