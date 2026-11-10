import React, { useState, useCallback, useRef } from 'react';
import {
  motion,
  AnimatePresence,
  useMotionValue,
  useSpring,
  useTransform,
} from 'motion/react';
import {
  Eye,
  EyeClosed,
  SpinnerGap,
  Clock as ClockIcon,
  WarningCircle,
  XCircle,
  ArrowRight,
} from '@phosphor-icons/react';
import { useAuth } from '../../contexts/AuthContext';
import { LoginDto } from '../../types';
import { useToastContext } from '../../contexts/ToastContext';
import { useRateLimitHandler } from '../../hooks/useRateLimitHandler';
import ThemeToggle from '../common/ThemeToggle';
import { usePrefersReducedMotion } from '../ui/reactbits/_shared/prefersReducedMotion';

// ============================================================================
// CONSTANTS & CURVES
// ============================================================================

const PRECISION_EASE: [number, number, number, number] = [0.16, 1, 0.3, 1];

// ============================================================================
// ANIMATED SIVAC VECTOR EMBLEM (Shield + Vaccine Vial + Verification Check)
// ============================================================================

interface AnimatedSivacEmblemProps {
  size?: number;
  isAuthenticating?: boolean;
  isFocused?: boolean;
  hasError?: boolean;
  interactive?: boolean;
  reducedMotion: boolean;
}

export const AnimatedSivacEmblem: React.FC<AnimatedSivacEmblemProps> = ({
  size = 64,
  isAuthenticating = false,
  isFocused = false,
  hasError = false,
  interactive = false,
  reducedMotion,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const pointerX = useMotionValue(0);
  const pointerY = useMotionValue(0);

  const springX = useSpring(pointerX, { stiffness: 150, damping: 20, mass: 0.5 });
  const springY = useSpring(pointerY, { stiffness: 150, damping: 20, mass: 0.5 });

  // Subtle multi-plane parallax for inner elements
  const shieldX = useTransform(springX, [-1, 1], [-2.5, 2.5]);
  const shieldY = useTransform(springY, [-1, 1], [-2.5, 2.5]);
  const vialX = useTransform(springX, [-1, 1], [3.5, -3.5]);
  const vialY = useTransform(springY, [-1, 1], [3.5, -3.5]);

  const handleMouseMove = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (!interactive || reducedMotion || !containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const nx = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      const ny = ((e.clientY - rect.top) / rect.height) * 2 - 1;
      pointerX.set(nx);
      pointerY.set(ny);
    },
    [interactive, reducedMotion, pointerX, pointerY]
  );

  const handleMouseLeave = useCallback(() => {
    pointerX.set(0);
    pointerY.set(0);
  }, [pointerX, pointerY]);

  const strokeColor = hasError ? '#e11d48' : '#0E9F8E';

  return (
    <motion.div
      ref={containerRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{ width: size, height: size }}
      animate={
        reducedMotion
          ? undefined
          : {
              scale: isAuthenticating ? 0.96 : isFocused ? 1.03 : 1,
            }
      }
      transition={{ duration: 0.35, ease: PRECISION_EASE }}
      className="relative inline-flex items-center justify-center select-none"
    >
      {/* Outer Precision Containment Frame */}
      <motion.svg
        viewBox="0 0 120 120"
        className="h-full w-full overflow-visible"
        aria-label="Emblema oficial SIVAC"
        role="img"
      >
        {/* Subtle Orbital Calibration Ring (Rotates during authentication) */}
        <motion.circle
          cx="60"
          cy="60"
          r="56"
          fill="none"
          stroke={strokeColor}
          strokeWidth="1"
          strokeDasharray="6 10"
          initial={{ opacity: 0 }}
          animate={
            reducedMotion
              ? { opacity: 0.22 }
              : {
                  opacity: isAuthenticating ? 0.75 : isFocused ? 0.4 : 0.18,
                  rotate: isAuthenticating ? 360 : isFocused ? 45 : 0,
                }
          }
          transition={
            isAuthenticating
              ? {
                  rotate: { duration: 6, repeat: Infinity, ease: 'linear' },
                  opacity: { duration: 0.25 },
                }
              : { duration: 0.9, ease: PRECISION_EASE }
          }
          style={{ transformOrigin: '60px 60px' }}
        />

        {/* Layer 1: SIVAC Institutional Shield */}
        <motion.g
          style={
            interactive && !reducedMotion
              ? { x: shieldX, y: shieldY }
              : undefined
          }
        >
          {/* Soft Shield Surface Fill */}
          <motion.path
            d="M60 12 C45 21 29 25 18 26 V54 C18 82 37 101 60 110 C83 101 102 82 102 54 V26 C91 25 75 21 60 12 Z"
            fill={strokeColor}
            initial={{ fillOpacity: 0 }}
            animate={{
              fillOpacity: isFocused || isAuthenticating ? 0.08 : 0.04,
            }}
            transition={{ duration: 0.5, delay: 0.2, ease: PRECISION_EASE }}
          />

          {/* Shield Outer Contour (Self-Drawing SVG Path) */}
          <motion.path
            d="M60 12 C45 21 29 25 18 26 V54 C18 82 37 101 60 110 C83 101 102 82 102 54 V26 C91 25 75 21 60 12 Z"
            fill="none"
            stroke={strokeColor}
            strokeWidth="4.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            initial={
              reducedMotion
                ? { pathLength: 1, opacity: 1 }
                : { pathLength: 0, opacity: 0 }
            }
            animate={{ pathLength: 1, opacity: 1 }}
            transition={{ duration: 0.95, ease: PRECISION_EASE }}
          />
        </motion.g>

        {/* Layer 2: Vaccine Vial + Verification Checkmark */}
        <motion.g
          style={
            interactive && !reducedMotion ? { x: vialX, y: vialY } : undefined
          }
        >
          {/* Vial Cap */}
          <motion.rect
            x="46"
            y="30"
            width="28"
            height="8.5"
            rx="3.5"
            fill={strokeColor}
            initial={
              reducedMotion
                ? { opacity: 1, y: 0 }
                : { opacity: 0, y: -5 }
            }
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, delay: 0.3, ease: PRECISION_EASE }}
          />

          {/* Vial Body (Clipped cleanly above checkmark intersection, faithful to SIVAC logo) */}
          <motion.path
            d="M44 68 V49 C44 45 49 43 50 40 V38.5 H70 V40 C71 43 76 45 76 49 V58"
            fill="none"
            stroke={strokeColor}
            strokeWidth="4.2"
            strokeLinecap="round"
            strokeLinejoin="round"
            initial={
              reducedMotion
                ? { pathLength: 1, opacity: 1 }
                : { pathLength: 0, opacity: 0 }
            }
            animate={{ pathLength: 1, opacity: 1 }}
            transition={{ duration: 0.65, delay: 0.35, ease: PRECISION_EASE }}
          />

          {/* Verification Checkmark (Draws across the lower shield & vial) */}
          <motion.path
            d="M44 75 L56 87 L87 53"
            fill="none"
            stroke={strokeColor}
            strokeWidth="5.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            initial={
              reducedMotion
                ? { pathLength: 1, opacity: 1 }
                : { pathLength: 0, opacity: 0 }
            }
            animate={{
              pathLength: 1,
              opacity: 1,
              scale: isAuthenticating ? [1, 1.06, 1] : 1,
            }}
            transition={{
              pathLength: { duration: 0.55, delay: 0.6, ease: PRECISION_EASE },
              opacity: { duration: 0.2, delay: 0.6 },
              scale: isAuthenticating
                ? { duration: 1.2, repeat: Infinity, ease: 'easeInOut' }
                : { duration: 0.25 },
            }}
            style={{ transformOrigin: '64px 70px' }}
          />
        </motion.g>
      </motion.svg>
    </motion.div>
  );
};

// ============================================================================
// VALIDATION HELPERS
// ============================================================================

interface ValidationErrors {
  usuario?: string;
  password?: string;
}

const isValidEmail = (email: string): boolean =>
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

const validateLoginForm = (data: LoginDto): ValidationErrors => {
  const errors: ValidationErrors = {};
  const trimmed = data.usuario.trim();

  if (!trimmed) {
    errors.usuario = 'Requerido';
  } else if (trimmed.length < 3) {
    errors.usuario = 'Mínimo 3 caracteres';
  } else if (trimmed.includes('@') && !isValidEmail(trimmed)) {
    errors.usuario = 'Correo no válido';
  } else if (/\s/.test(trimmed)) {
    errors.usuario = 'Sin espacios';
  }

  if (!data.password) {
    errors.password = 'Requerida';
  }

  return errors;
};

// ============================================================================
// PRECISION INPUT FIELD
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
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onFocusChange: (focused: boolean) => void;
  rightElement?: React.ReactNode;
  reducedMotion: boolean;
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
  onChange,
  onFocusChange,
  rightElement,
  reducedMotion,
}) => {
  const [focused, setFocused] = useState(false);

  const handleFocus = () => {
    setFocused(true);
    onFocusChange(true);
  };

  const handleBlur = () => {
    setFocused(false);
    onFocusChange(false);
  };

  return (
    <div className="relative">
      <div className="mb-1.5 flex items-center justify-between">
        <label
          htmlFor={id}
          className={`text-xs font-medium tracking-wide transition-colors duration-150 ${
            error
              ? 'text-status-danger-text'
              : focused
                ? 'text-ink'
                : 'text-muted-2'
          }`}
        >
          {label} <span className="text-muted">*</span>
        </label>

        <AnimatePresence mode="wait" initial={false}>
          {error && (
            <motion.span
              key={`${id}-err`}
              id={`${id}-error`}
              role="alert"
              initial={reducedMotion ? { opacity: 1 } : { opacity: 0, x: 4 }}
              animate={{ opacity: 1, x: 0 }}
              exit={reducedMotion ? { opacity: 0 } : { opacity: 0, x: 4 }}
              transition={{ duration: 0.15, ease: PRECISION_EASE }}
              className="flex items-center gap-1 text-xs font-medium text-status-danger-text"
            >
              <WarningCircle className="h-3.5 w-3.5 shrink-0" weight="fill" />
              {error}
            </motion.span>
          )}
        </AnimatePresence>
      </div>

      <div className="relative">
        <input
          id={id}
          name={name}
          type={type}
          autoComplete={autoComplete}
          required
          value={value}
          onChange={onChange}
          onFocus={handleFocus}
          onBlur={handleBlur}
          placeholder={placeholder}
          aria-invalid={!!error}
          aria-describedby={error ? `${id}-error` : undefined}
          className={`block h-11 w-full rounded-md border bg-surface-soft/40 px-3.5 text-base font-medium text-ink transition-colors duration-150 placeholder:text-muted/45 focus:bg-surface focus:outline-none ${
            rightElement ? 'pr-11' : ''
          } ${
            error
              ? 'border-status-danger-border'
              : focused
                ? 'border-line-strong'
                : 'border-line hover:border-line-strong'
          }`}
        />

        {rightElement && (
          <div className="absolute inset-y-0 right-0 flex items-center pr-1">
            {rightElement}
          </div>
        )}

        {/* Kinetic Bottom Precision Focus Line */}
        <motion.span
          aria-hidden="true"
          initial={false}
          animate={{
            scaleX: focused || !!error ? 1 : 0,
            opacity: focused || !!error ? 1 : 0,
          }}
          transition={{ duration: 0.22, ease: PRECISION_EASE }}
          style={{ originX: 0.5 }}
          className={`pointer-events-none absolute bottom-0 left-1.5 right-1.5 h-[2px] rounded-full ${
            error ? 'bg-status-danger-text' : 'bg-tertiary'
          }`}
        />
      </div>
    </div>
  );
};

// ============================================================================
// MAIN LOGIN COMPONENT
// ============================================================================

const LoginForm: React.FC = () => {
  const { login, isLoading } = useAuth();
  const { toast } = useToastContext();
  const { rateLimitState, handleRateLimitError, canRetry } = useRateLimitHandler();
  const reducedMotion = usePrefersReducedMotion();

  const [formData, setFormData] = useState<LoginDto>({
    usuario: 'admin',
    password: 'Admin123@',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<ValidationErrors>({});
  const [authError, setAuthError] = useState<string | null>(null);
  const [shakeCount, setShakeCount] = useState(0);
  const [focusedFieldCount, setFocusedFieldCount] = useState(0);

  const handleFocusChange = useCallback((isFocused: boolean) => {
    setFocusedFieldCount((prev) => Math.max(0, prev + (isFocused ? 1 : -1)));
  }, []);

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const { name, value } = e.target;
      setFormData((prev) => ({ ...prev, [name]: value }));

      if (errors[name as keyof ValidationErrors]) {
        setErrors((prev) => ({ ...prev, [name]: undefined }));
      }
      if (authError) {
        setAuthError(null);
      }
    },
    [errors, authError]
  );

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();

      const validationErrors = validateLoginForm(formData);
      if (Object.keys(validationErrors).length > 0) {
        setErrors(validationErrors);
        setShakeCount((prev) => prev + 1);
        return;
      }

      if (!canRetry) {
        const minutes = Math.ceil(rateLimitState.remainingTime / 60);
        toast.error(
          `Espere ${minutes} minuto${minutes > 1 ? 's' : ''} antes de reintentar`
        );
        return;
      }

      try {
        setAuthError(null);
        await login(formData);
        toast.success('Acceso concedido');
      } catch (error: unknown) {
        setShakeCount((prev) => prev + 1);
        if (!handleRateLimitError(error)) {
          const message =
            error instanceof Error ? error.message : 'Credenciales inválidas';
          setAuthError(message);
          toast.error(message);
        }
      }
    },
    [
      formData,
      canRetry,
      rateLimitState.remainingTime,
      toast,
      login,
      handleRateLimitError,
    ]
  );

  const isDisabled = isLoading || !canRetry;
  const buttonState = isLoading ? 'loading' : !canRetry ? 'blocked' : 'idle';
  const hasAnyError = !!authError || Object.keys(errors).length > 0;

  const rateLimitClock = `${Math.floor(
    rateLimitState.remainingTime / 60
  )}:${String(rateLimitState.remainingTime % 60).padStart(2, '0')}`;

  return (
    <div className="relative flex min-h-[100dvh] w-full flex-col justify-between overflow-hidden bg-app px-4 py-6 font-sans text-ink selection:bg-tertiary/20 sm:px-8 sm:py-8">
      {/* Subtle Architectural Hairline Grid Backdrop */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.35] dark:opacity-[0.18]"
        style={{
          backgroundImage:
            'linear-gradient(to right, rgb(var(--color-line)) 1px, transparent 1px), linear-gradient(to bottom, rgb(var(--color-line)) 1px, transparent 1px)',
          backgroundSize: '64px 64px',
        }}
        aria-hidden="true"
      />

      {/* Top Bar: Minimalist Theme Switcher */}
      <header className="relative z-10 flex items-center justify-end">
        <ThemeToggle />
      </header>

      {/* Center Authentication Monolith */}
      <main className="relative z-10 mx-auto my-auto w-full max-w-[384px]">
        <motion.div
          initial={reducedMotion ? { opacity: 1 } : { opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, ease: PRECISION_EASE }}
          className="relative overflow-hidden rounded-xl border border-line bg-surface px-6 py-8 sm:px-8 sm:py-9"
        >
          {/* Top Precision Hairline Accent */}
          <motion.div
            aria-hidden="true"
            initial={reducedMotion ? { scaleX: 1 } : { scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ duration: 0.75, delay: 0.15, ease: PRECISION_EASE }}
            style={{ originX: 0.5 }}
            className="absolute inset-x-0 top-0 h-[2px] bg-tertiary"
          />

          {/* Animated SIVAC Brand Focal Point */}
          <div className="mb-7 flex flex-col items-center text-center">
            <AnimatedSivacEmblem
              size={68}
              isAuthenticating={isLoading}
              isFocused={focusedFieldCount > 0}
              hasError={hasAnyError}
              interactive
              reducedMotion={reducedMotion}
            />

            <motion.h1
              initial={reducedMotion ? { opacity: 1 } : { opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.25, ease: PRECISION_EASE }}
              className="mt-3.5 text-xl font-semibold tracking-[0.14em] text-ink"
            >
              SIVAC
            </motion.h1>

            <motion.p
              initial={reducedMotion ? { opacity: 1 } : { opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.4, delay: 0.35, ease: PRECISION_EASE }}
              className="mt-1 font-mono text-xs text-muted-2"
            >
              DISA Apurímac II
            </motion.p>
          </div>

          {/* Credentials Form */}
          <motion.form
            key={shakeCount}
            animate={
              shakeCount > 0 && !reducedMotion
                ? { x: [0, -6, 6, -4, 4, 0] }
                : { x: 0 }
            }
            transition={{ duration: 0.28, ease: PRECISION_EASE }}
            onSubmit={handleSubmit}
            noValidate
            className="space-y-4"
          >
            <InputField
              id="usuario"
              name="usuario"
              type="text"
              label="Usuario o Email"
              value={formData.usuario}
              placeholder="usuario"
              error={errors.usuario}
              autoComplete="username"
              onChange={handleInputChange}
              onFocusChange={handleFocusChange}
              reducedMotion={reducedMotion}
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
              onChange={handleInputChange}
              onFocusChange={handleFocusChange}
              reducedMotion={reducedMotion}
              rightElement={
                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  className="flex h-9 w-9 items-center justify-center rounded-sm text-muted transition-colors duration-150 hover:text-ink focus:outline-none focus-visible:ring-2 focus-visible:ring-line-focus/70"
                  aria-label={
                    showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'
                  }
                >
                  <AnimatePresence mode="wait" initial={false}>
                    <motion.span
                      key={showPassword ? 'shown' : 'hidden'}
                      initial={
                        reducedMotion
                          ? { opacity: 1 }
                          : { opacity: 0, scale: 0.85 }
                      }
                      animate={{ opacity: 1, scale: 1 }}
                      exit={
                        reducedMotion
                          ? { opacity: 0 }
                          : { opacity: 0, scale: 0.85 }
                      }
                      transition={{ duration: 0.12, ease: PRECISION_EASE }}
                      className="flex items-center justify-center"
                    >
                      {showPassword ? (
                        <EyeClosed className="h-[18px] w-[18px]" weight="regular" />
                      ) : (
                        <Eye className="h-[18px] w-[18px]" weight="regular" />
                      )}
                    </motion.span>
                  </AnimatePresence>
                </button>
              }
            />

            {/* Auth Error Notice */}
            <AnimatePresence mode="wait" initial={false}>
              {authError && (
                <motion.div
                  key="auth-error"
                  initial={
                    reducedMotion ? { opacity: 1 } : { opacity: 0, y: -4 }
                  }
                  animate={{ opacity: 1, y: 0 }}
                  exit={reducedMotion ? { opacity: 0 } : { opacity: 0, y: -4 }}
                  transition={{ duration: 0.16, ease: PRECISION_EASE }}
                  className="flex items-center gap-2 rounded-md border border-status-danger-border bg-status-danger-bg px-3 py-2 text-xs font-medium text-status-danger-text"
                  role="alert"
                >
                  <XCircle className="h-4 w-4 shrink-0" weight="fill" />
                  <span>{authError}</span>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Primary Action Button */}
            <div className="pt-2">
              <motion.button
                type="submit"
                disabled={isDisabled}
                whileTap={
                  !isDisabled && !reducedMotion ? { scale: 0.985 } : undefined
                }
                transition={{ duration: 0.12, ease: PRECISION_EASE }}
                aria-busy={isLoading}
                className={`group relative flex h-11 w-full items-center justify-center gap-2 rounded-md px-5 text-base font-semibold transition-colors duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 whitespace-nowrap shrink-0 ${
                  isDisabled
                    ? 'cursor-not-allowed border border-line bg-surface-soft text-muted'
                    : 'border border-ink bg-ink text-surface hover:border-tertiary hover:bg-tertiary hover:text-[#081520] focus-visible:ring-tertiary/40'
                }`}
              >
                <AnimatePresence mode="wait" initial={false}>
                  {buttonState === 'loading' && (
                    <motion.span
                      key="loading"
                      initial={
                        reducedMotion ? { opacity: 1 } : { opacity: 0, y: 4 }
                      }
                      animate={{ opacity: 1, y: 0 }}
                      exit={
                        reducedMotion ? { opacity: 0 } : { opacity: 0, y: -4 }
                      }
                      transition={{ duration: 0.15, ease: PRECISION_EASE }}
                      className="inline-flex items-center gap-2"
                    >
                      <SpinnerGap className="h-4 w-4 animate-spin" weight="bold" />
                      <span>Ingresando...</span>
                    </motion.span>
                  )}

                  {buttonState === 'blocked' && (
                    <motion.span
                      key="blocked"
                      initial={
                        reducedMotion ? { opacity: 1 } : { opacity: 0, y: 4 }
                      }
                      animate={{ opacity: 1, y: 0 }}
                      exit={
                        reducedMotion ? { opacity: 0 } : { opacity: 0, y: -4 }
                      }
                      transition={{ duration: 0.15, ease: PRECISION_EASE }}
                      className="inline-flex items-center gap-2 tabular-nums"
                    >
                      <ClockIcon className="h-4 w-4" weight="bold" />
                      <span>
                        Espere {Math.ceil(rateLimitState.remainingTime / 60)} min
                      </span>
                    </motion.span>
                  )}

                  {buttonState === 'idle' && (
                    <motion.span
                      key="idle"
                      initial={
                        reducedMotion ? { opacity: 1 } : { opacity: 0, y: 4 }
                      }
                      animate={{ opacity: 1, y: 0 }}
                      exit={
                        reducedMotion ? { opacity: 0 } : { opacity: 0, y: -4 }
                      }
                      transition={{ duration: 0.15, ease: PRECISION_EASE }}
                      className="inline-flex items-center gap-2"
                    >
                      <span>Iniciar Sesión</span>
                      <ArrowRight
                        className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5"
                        weight="bold"
                        aria-hidden="true"
                      />
                    </motion.span>
                  )}
                </AnimatePresence>
              </motion.button>
            </div>

            {/* Rate Limit Countdown */}
            <AnimatePresence mode="wait" initial={false}>
              {rateLimitState.isBlocked && (
                <motion.div
                  key="rate-limit"
                  initial={reducedMotion ? { opacity: 1 } : { opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={reducedMotion ? { opacity: 0 } : { opacity: 0, y: 4 }}
                  transition={{ duration: 0.18, ease: PRECISION_EASE }}
                  className="flex items-center justify-between rounded-md border border-status-warning-border bg-status-warning-bg px-3 py-2 text-xs font-medium text-status-warning-text"
                  role="alert"
                >
                  <span>Reintento en</span>
                  <span className="font-mono font-semibold tabular-nums">
                    {rateLimitClock}
                  </span>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.form>
        </motion.div>
      </main>

      {/* Quiet Institutional Footer */}
      <footer className="relative z-10 text-center">
        <p className="font-mono text-xs text-muted">
          Andahuaylas · 2026
        </p>
      </footer>
    </div>
  );
};

export default LoginForm;
