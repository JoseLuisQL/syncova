import React, { useState, useCallback, useMemo } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { LoginDto } from '../../types';
import { useToastContext } from '../../contexts/ToastContext';
import { useRateLimitHandler } from '../../hooks/useRateLimitHandler';
import SivacLogo from '../common/SivacLogo';

// ============================================================================
// CONSTANTS
// ============================================================================

const INPUT_BASE_CLASSES = 
  'block w-full pl-11 pr-4 py-3.5 border rounded-xl text-gray-900 placeholder-gray-400 ' +
  'focus:outline-none focus:ring-2 focus:border-transparent transition-all duration-200 ' +
  'text-sm sm:text-base';

const INPUT_NORMAL_CLASSES = 'border-gray-200 focus:ring-teal-500 hover:border-gray-300';
const INPUT_ERROR_CLASSES = 'border-red-300 focus:ring-red-500 bg-red-50/30';

const LABEL_CLASSES = 'block text-sm font-medium text-gray-700 mb-2';
const ERROR_TEXT_CLASSES = 'mt-1.5 text-sm text-red-600 flex items-center gap-1.5';

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
// ICON COMPONENTS
// ============================================================================



const UserIcon: React.FC<{ className?: string }> = ({ className = 'h-5 w-5' }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
    />
  </svg>
);

const LockIcon: React.FC<{ className?: string }> = ({ className = 'h-5 w-5' }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
    />
  </svg>
);

const EyeIcon: React.FC<{ className?: string }> = ({ className = 'h-5 w-5' }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
    />
  </svg>
);

const EyeOffIcon: React.FC<{ className?: string }> = ({ className = 'h-5 w-5' }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21"
    />
  </svg>
);

const SpinnerIcon: React.FC<{ className?: string }> = ({ className = 'h-5 w-5' }) => (
  <svg className={`animate-spin ${className}`} fill="none" viewBox="0 0 24 24">
    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
    <path
      className="opacity-75"
      fill="currentColor"
      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
    />
  </svg>
);

const ClockIcon: React.FC<{ className?: string }> = ({ className = 'h-5 w-5' }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
    />
  </svg>
);

const WarningIcon: React.FC<{ className?: string }> = ({ className = 'h-5 w-5' }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
    />
  </svg>
);

const ErrorIcon: React.FC<{ className?: string }> = ({ className = 'h-4 w-4' }) => (
  <svg className={className} fill="currentColor" viewBox="0 0 20 20">
    <path
      fillRule="evenodd"
      d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
      clipRule="evenodd"
    />
  </svg>
);

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
        {label} <span className="text-red-500">*</span>
      </label>
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
          <span className="text-gray-400">{icon}</span>
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
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
            {rightElement}
          </div>
        )}
      </div>
      {error && (
        <p id={`${id}-error`} className={ERROR_TEXT_CLASSES} role="alert">
          <ErrorIcon />
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
      className="mt-4 p-4 bg-amber-50 border border-amber-200 rounded-xl animate-fade-in"
      role="alert"
    >
      <div className="flex items-start gap-3">
        <WarningIcon className="h-5 w-5 text-amber-500 flex-shrink-0 mt-0.5" />
        <div>
          <p className="text-sm font-medium text-amber-800">
            Demasiados intentos de login
          </p>
          <p className="text-sm text-amber-700 mt-1">
            Podrá intentar nuevamente en{' '}
            <span className="font-mono font-semibold">{timeDisplay}</span>
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
      'w-full flex items-center justify-center gap-2 py-3.5 px-4 rounded-xl text-sm sm:text-base ' +
      'font-semibold text-white transition-all duration-200 focus:outline-none focus:ring-2 ' +
      'focus:ring-offset-2 focus:ring-teal-500 shadow-lg';
    
    if (isDisabled) {
      return `${base} bg-gray-400 cursor-not-allowed shadow-none`;
    }
    return `${base} bg-gradient-to-r from-teal-600 to-cyan-600 hover:from-teal-700 hover:to-cyan-700 hover:shadow-xl active:scale-[0.98]`;
  }, [isDisabled]);

  const renderContent = () => {
    if (isLoading) {
      return (
        <>
          <SpinnerIcon className="h-5 w-5" />
          <span>Iniciando sesión...</span>
        </>
      );
    }
    
    if (!canRetry) {
      const minutes = Math.ceil(remainingTime / 60);
      return (
        <>
          <ClockIcon className="h-5 w-5" />
          <span>Espere {minutes} min</span>
        </>
      );
    }
    
    return <span>Iniciar Sesión</span>;
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
      className="text-gray-400 hover:text-gray-600 transition-colors focus:outline-none focus:text-teal-600"
      aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
    >
      {showPassword ? <EyeOffIcon /> : <EyeIcon />}
    </button>
  ), [showPassword, togglePasswordVisibility]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-teal-50 via-cyan-50 to-blue-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full">
        {/* Header */}
        <header className="text-center mb-8">
          <div className="mx-auto h-20 w-20 flex items-center justify-center mb-4 transform hover:scale-105 transition-transform duration-300">
            <SivacLogo size={80} />
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 tracking-tight">
            SIVAC
          </h1>
          <p className="text-base text-gray-600 mt-2">
            Sistema de Gestión de Vacunas
          </p>
          <p className="text-sm text-gray-500 mt-1">
            Inicia sesión para acceder al sistema
          </p>
        </header>

        {/* Form Card */}
        <div className="bg-white rounded-2xl shadow-xl shadow-gray-200/50 p-6 sm:p-8 border border-gray-100">
          <form onSubmit={handleSubmit} noValidate className="space-y-5">
            {/* Username Field */}
            <InputField
              id="usuario"
              name="usuario"
              type="text"
              label="Usuario o Email"
              value={formData.usuario}
              placeholder="Ingresa tu usuario o email"
              error={errors.usuario}
              autoComplete="username"
              icon={<UserIcon />}
              onChange={handleInputChange}
            />

            {/* Password Field */}
            <InputField
              id="password"
              name="password"
              type={showPassword ? 'text' : 'password'}
              label="Contraseña"
              value={formData.password}
              placeholder="Ingresa tu contraseña"
              error={errors.password}
              autoComplete="current-password"
              icon={<LockIcon />}
              onChange={handleInputChange}
              rightElement={passwordToggleButton}
            />

            {/* Auth Error Message */}
            {authError && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-xl" role="alert">
                <p className="text-sm text-red-600 flex items-center gap-2">
                  <ErrorIcon />
                  {authError}
                </p>
              </div>
            )}

            {/* Submit Button */}
            <div className="pt-2">
              <SubmitButton
                isLoading={isLoading}
                canRetry={canRetry}
                remainingTime={rateLimitState.remainingTime}
              />
            </div>

            {/* Rate Limit Alert */}
            {rateLimitState.isBlocked && (
              <RateLimitAlert remainingTime={rateLimitState.remainingTime} />
            )}
          </form>
        </div>

        {/* Footer */}
        <footer className="text-center mt-6">
          <p className="text-xs text-gray-500">
            DISA Apurímac II - Sistema SIVAC v1.0
          </p>
        </footer>
      </div>
    </div>
  );
};

export default LoginForm;
