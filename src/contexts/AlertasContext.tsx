import React, { createContext, useContext, useReducer, useEffect, useCallback, useRef, ReactNode } from 'react';
import { Alerta } from '../types';
import { AlertasService } from '../services/alertasService';
import { useAuth } from './AuthContext';
import AuthService from '../services/authService';
import { getApiBaseUrl } from '../config/api';

interface AlertasState {
  alertasNoLeidas: Alerta[];
  isLoading: boolean;
  error: string | null;
  lastUpdate: Date | null;
}

type AlertasAction =
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ALERTAS'; payload: Alerta[] }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'REMOVE_ALERTA'; payload: string }
  | { type: 'CLEAR_ALL' };

interface AlertasContextType {
  alertasNoLeidas: Alerta[];
  count: number;
  isLoading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
  markAsRead: (id: string) => Promise<boolean>;
  markAllAsRead: () => Promise<boolean>;
}

const initialState: AlertasState = {
  alertasNoLeidas: [],
  isLoading: false,
  error: null,
  lastUpdate: null
};

const alertasReducer = (state: AlertasState, action: AlertasAction): AlertasState => {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };
    case 'SET_ALERTAS':
      return { 
        ...state, 
        alertasNoLeidas: action.payload, 
        isLoading: false, 
        error: null,
        lastUpdate: new Date()
      };
    case 'SET_ERROR':
      return { ...state, error: action.payload, isLoading: false };
    case 'REMOVE_ALERTA':
      return {
        ...state,
        alertasNoLeidas: state.alertasNoLeidas.filter(a => a.id !== action.payload)
      };
    case 'CLEAR_ALL':
      return { ...state, alertasNoLeidas: [] };
    default:
      return state;
  }
};

const AlertasContext = createContext<AlertasContextType | undefined>(undefined);

interface AlertasProviderProps {
  children: ReactNode;
}

export const AlertasProvider: React.FC<AlertasProviderProps> = ({ children }) => {
  const [state, dispatch] = useReducer(alertasReducer, initialState);
  const { isAuthenticated, token } = useAuth();
  const pollingRef = useRef<NodeJS.Timeout | null>(null);
  const eventSourceRef = useRef<EventSource | null>(null);
  const isRefreshingRef = useRef(false);

  const emitAlertasUpdated = useCallback((reason: string) => {
    window.dispatchEvent(new CustomEvent('alertas:updated', {
      detail: { reason, timestamp: new Date().toISOString() }
    }));
  }, []);

  // Obtener alertas no leídas
  const refresh = useCallback(async (reason: string = 'manual') => {
    if (!isAuthenticated) return;
    
    // Evitar llamadas duplicadas simultáneas
    if (isRefreshingRef.current) return;
    isRefreshingRef.current = true;

    try {
      const alertas = await AlertasService.getUnreadForUser();
      dispatch({ type: 'SET_ALERTAS', payload: alertas });
      emitAlertasUpdated(reason);
    } catch (error) {
      console.error('Error al refrescar alertas:', error);
      dispatch({ type: 'SET_ERROR', payload: 'Error al cargar alertas' });
    } finally {
      isRefreshingRef.current = false;
    }
  }, [emitAlertasUpdated, isAuthenticated]);

  const markAsRead = useCallback(async (id: string): Promise<boolean> => {
    // Actualización optimista - remover inmediatamente de la UI
    dispatch({ type: 'REMOVE_ALERTA', payload: id });

    try {
      await AlertasService.markAsRead(id);
      emitAlertasUpdated('mark-read');
      return true;
    } catch (error) {
      console.error('Error al marcar como leída:', error);
      // En caso de error, refrescar para restaurar el estado correcto
      refresh();
      return false;
    }
  }, [emitAlertasUpdated, refresh]);

  const markAllAsRead = useCallback(async (): Promise<boolean> => {
    if (state.alertasNoLeidas.length === 0) return true;

    const ids = state.alertasNoLeidas.map(a => a.id);
    
    // Actualización optimista
    dispatch({ type: 'CLEAR_ALL' });

    try {
      await AlertasService.markMultipleAsRead(ids);
      emitAlertasUpdated('mark-all-read');
      return true;
    } catch (error) {
      console.error('Error al marcar todas como leídas:', error);
      refresh();
      return false;
    }
  }, [emitAlertasUpdated, refresh, state.alertasNoLeidas]);

  useEffect(() => {
    if (!isAuthenticated || !token) {
      if (pollingRef.current) clearInterval(pollingRef.current);
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
        eventSourceRef.current = null;
      }
      return;
    }

    refresh('bootstrap');

    const streamToken = token || AuthService.getToken();
    if (streamToken && typeof EventSource !== 'undefined') {
      const eventSource = new EventSource(`${getApiBaseUrl()}/alertas/stream?token=${encodeURIComponent(streamToken)}`);
      eventSourceRef.current = eventSource;

      eventSource.addEventListener('alertas:update', () => {
        void refresh('realtime');
      });

      eventSource.onerror = () => {
        eventSource.close();
        eventSourceRef.current = null;
      };
    }

    pollingRef.current = setInterval(() => {
      void refresh('poll');
    }, 180000);

    return () => {
      if (pollingRef.current) {
        clearInterval(pollingRef.current);
        pollingRef.current = null;
      }
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
        eventSourceRef.current = null;
      }
    };
  }, [isAuthenticated, refresh, token]);

  const value: AlertasContextType = {
    alertasNoLeidas: state.alertasNoLeidas,
    count: state.alertasNoLeidas.length,
    isLoading: state.isLoading,
    error: state.error,
    refresh,
    markAsRead,
    markAllAsRead
  };

  return (
    <AlertasContext.Provider value={value}>
      {children}
    </AlertasContext.Provider>
  );
};

export const useAlertasGlobal = (): AlertasContextType => {
  const context = useContext(AlertasContext);
  if (!context) {
    throw new Error('useAlertasGlobal debe usarse dentro de AlertasProvider');
  }
  return context;
};

export default AlertasContext;
