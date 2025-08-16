import { useState, useCallback } from 'react';
import { toast } from 'react-hot-toast';

interface RateLimitState {
  isBlocked: boolean;
  retryAfter: number;
  remainingTime: number;
}

interface UseRateLimitHandlerReturn {
  rateLimitState: RateLimitState;
  handleRateLimitError: (error: any) => boolean;
  resetRateLimit: () => void;
  canRetry: boolean;
}

/**
 * Hook para manejar errores de rate limiting
 */
export const useRateLimitHandler = (): UseRateLimitHandlerReturn => {
  const [rateLimitState, setRateLimitState] = useState<RateLimitState>({
    isBlocked: false,
    retryAfter: 0,
    remainingTime: 0,
  });

  /**
   * Manejar error de rate limiting
   */
  const handleRateLimitError = useCallback((error: any): boolean => {
    if (error.response?.status === 429) {
      const retryAfter = error.response.data?.retryAfter || 300; // 5 minutos por defecto
      const minutes = Math.ceil(retryAfter / 60);
      
      setRateLimitState({
        isBlocked: true,
        retryAfter,
        remainingTime: retryAfter,
      });

      // Mostrar toast con información del rate limit
      toast.error(
        `Demasiados intentos de login. Intente nuevamente en ${minutes} minuto${minutes > 1 ? 's' : ''}`,
        {
          duration: 8000,
          id: 'rate-limit-error',
        }
      );

      // Iniciar countdown
      const interval = setInterval(() => {
        setRateLimitState(prev => {
          const newRemainingTime = prev.remainingTime - 1;
          
          if (newRemainingTime <= 0) {
            clearInterval(interval);
            return {
              isBlocked: false,
              retryAfter: 0,
              remainingTime: 0,
            };
          }
          
          return {
            ...prev,
            remainingTime: newRemainingTime,
          };
        });
      }, 1000);

      return true; // Error fue manejado
    }
    
    return false; // Error no fue manejado
  }, []);

  /**
   * Resetear estado de rate limit
   */
  const resetRateLimit = useCallback(() => {
    setRateLimitState({
      isBlocked: false,
      retryAfter: 0,
      remainingTime: 0,
    });
  }, []);

  /**
   * Verificar si se puede reintentar
   */
  const canRetry = !rateLimitState.isBlocked;

  return {
    rateLimitState,
    handleRateLimitError,
    resetRateLimit,
    canRetry,
  };
};
