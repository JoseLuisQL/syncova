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
  'block w-full pl-11 pr-4 py-3.5 border rounded-xl text-gray-900 placeholder-gray-400 ' +
  'focus:outline-none focus:ring-1 focus:border-gray-900 transition-all duration-200 bg-white ' +
  'text-sm font-medium';

const INPUT_NORMAL_CLASSES = 'border-gray-200 hover:border-gray-300';
const INPUT_ERROR_CLASSES = 'border-rose-300 focus:ring-rose-500 focus:border-rose-500 bg-rose-50/30';

const LABEL_CLASSES = 'block text-sm font-semibold text-gray-900 mb-2 tracking-tight';
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
        {label} <span className="text-gray-400">*</span>
      </label>
      <div className="relative group">
        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none transition-colors duration-200">
          <span className={`${error ? 'text-rose-400' : 'text-gray-400 group-focus-within:text-gray-900'}`}>
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
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
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
      className="mt-4 p-4 bg-amber-50 border border-amber-200 rounded-xl animate-fade-in"
      role="alert"
    >
      <div className="flex items-start gap-3">
        <WarningCircle className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" weight="fill" />
        <div>
          <p className="text-sm font-semibold text-amber-900 tracking-tight">
            Demasiados intentos de login
          </p>
          <p className="text-sm text-amber-800 mt-0.5 font-medium">
            Podrá intentar nuevamente en{' '}
            <span className="font-mono font-bold bg-amber-100 px-1.5 py-0.5 rounded ml-1">{timeDisplay}</span>
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
      'w-full flex items-center justify-center gap-2 py-3.5 px-4 rounded-xl text-sm ' +
      'font-bold text-white transition-all duration-200 focus:outline-none focus:ring-2 ' +
      'focus:ring-offset-2 focus:ring-gray-900 shadow-sm';
    
    if (isDisabled) {
      return `${base} bg-gray-300 text-gray-500 cursor-not-allowed shadow-none`;
    }
    return `${base} bg-gray-900 hover:bg-gray-800 active:scale-[0.98]`;
  }, [isDisabled]);

  const renderContent = () => {
    if (isLoading) {
      return (
        <>
          <SpinnerGap className="h-5 w-5 animate-spin" weight="bold" />
          <span>Iniciando sesión...</span>
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
      className="p-1 rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors focus:outline-none focus:ring-2 focus:ring-gray-900"
      aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
    >
      {showPassword ? <EyeClosed className="w-5 h-5" weight="fill" /> : <Eye className="w-5 h-5" weight="fill" />}
    </button>
  ), [showPassword, togglePasswordVisibility]);

  return (
    <div className="min-h-[100dvh] w-full flex bg-white font-sans overflow-hidden">
      
      {/* Left Axis: Functional Form Layer */}
      <div className="w-full lg:w-[45%] flex flex-col justify-center px-6 sm:px-12 md:px-24">
        <div className="w-full max-w-[400px] mx-auto animate-fade-in-up">
          
          <header className="mb-10 text-left">
            <div className="mb-8 w-14 h-14 bg-gray-900 text-white rounded-2xl flex items-center justify-center shadow-md">
              <SivacLogo size={32} />
            </div>
            <h1 className="text-[2rem] leading-tight font-extrabold text-gray-900 tracking-tighter">
              Bienvenido a SIVAC
            </h1>
            <p className="text-[15px] font-medium text-gray-500 mt-2">
              Ingresa tus credenciales para administrar la cadena de suministros médicos.
            </p>
          </header>

          <form onSubmit={handleSubmit} noValidate className="space-y-6">
            <InputField
              id="usuario"
              name="usuario"
              type="text"
              label="Usuario o correo"
              value={formData.usuario}
              placeholder="ejemplo@minsa.gob.pe"
              error={errors.usuario}
              autoComplete="username"
              icon={<User className="w-5 h-5" weight="duotone" />}
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
              icon={<LockKey className="w-5 h-5" weight="duotone" />}
              onChange={handleInputChange}
              rightElement={passwordToggleButton}
            />

            {authError && (
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl" role="alert">
                <p className="text-sm font-medium text-rose-700 flex items-center gap-2">
                  <XCircle className="w-5 h-5 flex-shrink-0" weight="fill" />
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

          <footer className="mt-12 text-left">
            <p className="text-xs font-semibold tracking-wide text-gray-400 uppercase">
              SEDE • DISA Apurímac II
            </p>
          </footer>
        </div>
      </div>

      {/* Right Axis: Contextual Graphic Layer */}
      <div className="hidden lg:flex lg:w-[55%] relative flex-col justify-end p-12 bg-gray-950">
        <img 
          src="https://picsum.photos/seed/sivac-auth-v3/1000/1400" 
          alt="Instalaciones Médicas Institucionales" 
          className="absolute inset-0 w-full h-full object-cover opacity-[0.35] mix-blend-overlay"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-gray-950 via-gray-950/40 to-transparent" />
        
        <div className="relative z-10 max-w-lg mb-8 animate-fade-in-up" style={{ animationDelay: '200ms' }}>
          <div className="inline-block px-3 py-1.5 mb-6 text-xs font-bold tracking-widest text-emerald-400 uppercase border border-emerald-400/30 rounded-full bg-emerald-400/10 backdrop-blur-sm">
            Sistema Oficial
          </div>
          <h2 className="text-3xl font-extrabold text-white tracking-tight leading-tight">
            Control de inventarios y red de frío en tiempo real.
          </h2>
          <p className="text-gray-400 mt-4 text-[15px] max-w-md font-medium leading-relaxed">
            Plataforma especializada en la monitorización de biológicos y material descartable en toda la red micro-regional, asegurando el abastecimiento ininterrumpido.
          </p>
        </div>
      </div>
      
    </div>
  );
};

export default LoginForm;
