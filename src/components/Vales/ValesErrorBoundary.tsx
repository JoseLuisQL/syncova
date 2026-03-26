import React, { Component, ErrorInfo, ReactNode } from 'react';
import { Warning, ArrowsClockwise, House } from '@phosphor-icons/react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
  errorInfo?: ErrorInfo;
}

/**
 * Error Boundary específico para el módulo de Vales
 * Captura errores y muestra una interfaz de recuperación profesional
 */
class ValesErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    // Actualiza el estado para mostrar la UI de error
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Log del error para debugging
    console.error('🚨 Error en Módulo de Vales:', error);
    console.error('📍 Información del error:', errorInfo);
    
    // Actualizar estado con información detallada
    this.setState({
      error,
      errorInfo
    });

    // Aquí podrías enviar el error a un servicio de logging
    // logErrorToService(error, errorInfo);
  }

  handleRetry = () => {
    // Resetear el estado de error
    this.setState({ hasError: false, error: undefined, errorInfo: undefined });
  };

  handleGoHome = () => {
    // Recargar la página para volver al estado inicial
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      // Si hay un fallback personalizado, usarlo
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // UI de error por defecto
      return (
        <div className="min-h-[400px] flex items-center justify-center p-6">
          <div className="max-w-md w-full bg-white rounded-xl border border-red-200 shadow-lg p-6 text-center">
            {/* Icono de error */}
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Warning weight="duotone" className="h-8 w-8 text-red-600" />
            </div>

            {/* Título */}
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              Error en el Módulo de Vales
            </h2>

            {/* Descripción */}
            <p className="text-gray-600 mb-6">
              Ha ocurrido un error inesperado. Por favor, intenta nuevamente o contacta al soporte técnico.
            </p>

            {/* Detalles del error (solo en desarrollo) */}
            {import.meta.env.MODE === 'development' && this.state.error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-left">
                <h3 className="font-medium text-red-900 mb-2">Detalles del Error:</h3>
                <p className="text-sm text-red-800 font-mono break-all">
                  {this.state.error.message}
                </p>
                {this.state.errorInfo && (
                  <details className="mt-2">
                    <summary className="text-sm text-red-700 cursor-pointer">
                      Stack Trace
                    </summary>
                    <pre className="text-xs text-red-600 mt-2 overflow-auto max-h-32">
                      {this.state.errorInfo.componentStack}
                    </pre>
                  </details>
                )}
              </div>
            )}

            {/* Botones de acción */}
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <button
                onClick={this.handleRetry}
                className="flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <ArrowsClockwise className="h-4 w-4 mr-2" />
                Intentar Nuevamente
              </button>
              
              <button
                onClick={this.handleGoHome}
                className="flex items-center justify-center px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
              >
                <House className="h-4 w-4 mr-2" />
                Recargar Página
              </button>
            </div>

            {/* Información adicional */}
            <div className="mt-6 pt-4 border-t border-gray-200">
              <p className="text-xs text-gray-500">
                Si el problema persiste, por favor contacta al equipo de soporte técnico.
              </p>
              <p className="text-xs text-gray-400 mt-1">
                Error ID: {Date.now().toString(36)}
              </p>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ValesErrorBoundary;

/**
 * Hook para usar el Error Boundary de manera más sencilla
 */
export const withValesErrorBoundary = <P extends object>(
  Component: React.ComponentType<P>
) => {
  const WrappedComponent = (props: P) => (
    <ValesErrorBoundary>
      <Component {...props} />
    </ValesErrorBoundary>
  );

  WrappedComponent.displayName = `withValesErrorBoundary(${Component.displayName || Component.name})`;
  
  return WrappedComponent;
};

/**
 * Componente de error simple para casos específicos
 */
export const ValesErrorFallback: React.FC<{
  error?: Error;
  onRetry?: () => void;
  message?: string;
}> = ({ error, onRetry, message = "Ha ocurrido un error" }) => (
  <div className="p-6 text-center">
    <Warning weight="duotone" className="h-12 w-12 text-red-500 mx-auto mb-4" />
    <h3 className="text-lg font-medium text-gray-900 mb-2">{message}</h3>
    {error && (
      <p className="text-sm text-gray-600 mb-4">{error.message}</p>
    )}
    {onRetry && (
      <button
        onClick={onRetry}
        className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
      >
        <ArrowsClockwise className="h-4 w-4 mr-2" />
        Reintentar
      </button>
    )}
  </div>
);
