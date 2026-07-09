import React, { Component, ErrorInfo, ReactNode } from 'react';
import { Warning, ArrowsClockwise, House, Bug } from '@phosphor-icons/react';
import { logger } from '../../utils/debug';
import DecryptedText from '../ui/reactbits/text/DecryptedText';
import DotGrid from '../ui/reactbits/backgrounds/DotGrid';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
    errorInfo: null
  };

  public static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      error,
      errorInfo: null
    };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    logger.error('Error capturado por ErrorBoundary:', { error, errorInfo });
    
    this.setState({
      error,
      errorInfo
    });

    // Llamar callback personalizado si se proporciona
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }
  }

  private handleRetry = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null
    });
  };

  private handleReload = () => {
    window.location.reload();
  };

  private handleGoHome = () => {
    window.location.href = '/';
  };

  public render() {
    if (this.state.hasError) {
      // Si se proporciona un fallback personalizado, usarlo
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // Fallback por defecto
      return (
        <div className="relative min-h-screen flex flex-col justify-center py-12 sm:px-6 lg:px-8 overflow-hidden bg-app">
          <DotGrid color="rgb(var(--color-ink))" dotSize={1.5} gap={34} opacity={0.08} driftDuration={0} />
          <div className="relative z-10 sm:mx-auto sm:w-full sm:max-w-md">
            <div className="bg-white py-8 px-4 shadow-[0_24px_64px_-42px_rgba(12,15,24,0.5)] border border-line sm:rounded-xl sm:px-10">
              <div className="text-center">
                <Warning weight="fill" className="mx-auto h-14 w-14 text-rose-500 mb-4" aria-hidden="true" />
                <h2 className="text-2xl font-bold text-ink mb-2">
                  <DecryptedText
                    text="¡Oops! Algo salió mal"
                    animateOn="view"
                    speed={40}
                    maxIterations={6}
                    sequential
                    revealDirection="start"
                    className="text-2xl font-bold text-ink"
                  />
                </h2>
                <p className="text-muted-2 mb-6">
                  Ha ocurrido un error inesperado. Por favor, intenta una de las siguientes opciones:
                </p>

                <div className="space-y-3">
                  <button type="button"
                    onClick={this.handleRetry}
                    className="w-full flex justify-center items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-brand hover:bg-brand-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand/20 transition-colors"
                  >
                    <ArrowsClockwise weight="bold" className="h-4 w-4 mr-2" />
                    Reintentar
                  </button>

                  <button type="button"
                    onClick={this.handleReload}
                    className="w-full flex justify-center items-center px-4 py-2 border border-line rounded-md shadow-sm text-sm font-medium text-ink bg-white hover:bg-surface-soft focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand/20 transition-colors"
                  >
                    <ArrowsClockwise weight="bold" className="h-4 w-4 mr-2" />
                    Recargar página
                  </button>

                  <button type="button"
                    onClick={this.handleGoHome}
                    className="w-full flex justify-center items-center px-4 py-2 border border-line rounded-md shadow-sm text-sm font-medium text-ink bg-white hover:bg-surface-soft focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand/20 transition-colors"
                  >
                    <House weight="bold" className="h-4 w-4 mr-2" />
                    Ir al inicio
                  </button>
                </div>

                {/* Información de debug en desarrollo */}
                {import.meta.env.MODE === 'development' && this.state.error && (
                  <details className="mt-6 text-left">
                    <summary className="cursor-pointer text-sm font-medium text-muted-2 hover:text-ink flex items-center">
                      <Bug weight="bold" className="h-4 w-4 mr-2" />
                      Información de debug
                    </summary>
                    <div className="mt-3 p-3 bg-surface-soft rounded-md text-xs">
                      <div className="mb-2">
                        <strong>Error:</strong>
                        <pre className="mt-1 whitespace-pre-wrap text-rose-600">
                          {this.state.error.toString()}
                        </pre>
                      </div>
                      {this.state.errorInfo && (
                        <div>
                          <strong>Stack trace:</strong>
                          <pre className="mt-1 whitespace-pre-wrap text-muted-2 text-xs">
                            {this.state.errorInfo.componentStack}
                          </pre>
                        </div>
                      )}
                    </div>
                  </details>
                )}
              </div>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

// Hook para usar ErrorBoundary de forma funcional
export const useErrorHandler = () => {
  return (error: Error, errorInfo?: ErrorInfo) => {
    logger.error('Error manejado por useErrorHandler:', { error, errorInfo });
    // Aquí podrías enviar el error a un servicio de monitoreo
  };
};

// Componente de error simple para casos específicos
interface SimpleErrorProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
  className?: string;
}

export const SimpleError: React.FC<SimpleErrorProps> = ({
  title = 'Error',
  message = 'Ha ocurrido un error inesperado',
  onRetry,
  className = ''
}) => {
  return (
    <div className={`text-center py-8 ${className}`}>
      <Warning weight="fill" className="mx-auto h-12 w-12 text-red-500 mb-4" />
      <h3 className="text-lg font-semibold text-zinc-900 mb-2">{title}</h3>
      <p className="text-zinc-600 mb-4">{message}</p>
      {onRetry && (
        <button type="button"
          onClick={onRetry}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
        >
          <ArrowsClockwise weight="bold" className="h-4 w-4 mr-2" />
          Reintentar
        </button>
      )}
    </div>
  );
};

// Componente de error para conexión de red
interface NetworkErrorProps {
  onRetry?: () => void;
  className?: string;
}

export const NetworkError: React.FC<NetworkErrorProps> = ({
  onRetry,
  className = ''
}) => {
  return (
    <div className={`text-center py-8 ${className}`}>
      <div className="bg-red-50 border border-red-200 rounded-lg p-6">
        <Warning weight="fill" className="mx-auto h-12 w-12 text-red-500 mb-4" />
        <h3 className="text-lg font-semibold text-red-800 mb-2">
          Error de conexión
        </h3>
        <p className="text-red-600 mb-4">
          No se pudo conectar con el servidor. Verifique su conexión a internet e intente nuevamente.
        </p>
        {onRetry && (
          <button type="button"
            onClick={onRetry}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors"
          >
            <ArrowsClockwise weight="bold" className="h-4 w-4 mr-2" />
            Reintentar conexión
          </button>
        )}
      </div>
    </div>
  );
};

export default ErrorBoundary;
