import { useCallback, useEffect, useRef } from 'react';

/**
 * Hook simplificado para sincronización automática de vales en tiempo real
 * Versión temporal para evitar problemas de dependencias
 */
export const useAutoSync = () => {
  const syncTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastSyncRef = useRef<{ [key: string]: number }>({});

  /**
   * Trigger para cuando cambia una entrega base
   */
  const onEntregaBaseChanged = useCallback((
    establecimientoId: string,
    vacunaId: string,
    mes: number,
    anio: number
  ) => {
    console.log(`🔔 [useAutoSync] TRIGGER: Entrega base modificada - ${establecimientoId}, ${mes}/${anio}`);
    // Por ahora solo logueamos, la sincronización se maneja en el backend
  }, []);

  /**
   * Trigger para cuando cambia una entrega adicional
   */
  const onEntregaAdicionalChanged = useCallback((
    establecimientoId: string,
    vacunaId: string,
    mes: number,
    anio: number
  ) => {
    console.log(`🔔 [useAutoSync] TRIGGER: Entrega adicional modificada - ${establecimientoId}, ${mes}/${anio}`);
    // Por ahora solo logueamos, la sincronización se maneja en el backend
  }, []);

  /**
   * Trigger silencioso para verificaciones en segundo plano
   */
  const onDataChanged = useCallback((
    establecimientoId: string,
    vacunaId: string,
    mes: number,
    anio: number
  ) => {
    console.log(`🔔 [useAutoSync] TRIGGER: Datos modificados - ${establecimientoId}, ${mes}/${anio}`);
    // Por ahora solo logueamos, la sincronización se maneja en el backend
  }, []);

  /**
   * Función manual de trigger
   */
  const triggerAutoSync = useCallback(async (
    establecimientoId: string,
    vacunaId: string,
    mes: number,
    anio: number,
    showNotification: boolean = true
  ) => {
    console.log(`🚀 [useAutoSync] Trigger manual - ${establecimientoId}, ${mes}/${anio}`);
    // Por ahora solo logueamos, la sincronización se maneja en el backend
  }, []);

  /**
   * Limpiar timeouts al desmontar el componente
   */
  useEffect(() => {
    return () => {
      if (syncTimeoutRef.current) {
        clearTimeout(syncTimeoutRef.current);
      }
    };
  }, []);

  return {
    // Triggers principales
    onEntregaBaseChanged,
    onEntregaAdicionalChanged,
    onDataChanged,

    // Función manual
    triggerAutoSync
  };
};

export default useAutoSync;
