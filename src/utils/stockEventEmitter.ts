/**
 * Event Emitter para eventos de stock
 * Permite comunicación entre componentes cuando se actualizan stocks
 */

export interface StockUpdateEvent {
  type: 'vale_generated' | 'stock_updated';
  vacunaId?: string;
  mes?: number;
  anio?: number;
  centroAcopioId?: string;
  allVaccines?: boolean; // Indica si se debe actualizar todas las vacunas
}

type StockEventCallback = (event: StockUpdateEvent) => void;

class StockEventEmitter {
  private listeners: Map<string, StockEventCallback[]> = new Map();

  /**
   * Suscribirse a eventos de stock
   */
  on(eventType: string, callback: StockEventCallback): () => void {
    if (!this.listeners.has(eventType)) {
      this.listeners.set(eventType, []);
    }
    
    this.listeners.get(eventType)!.push(callback);
    
    // Retornar función de cleanup
    return () => {
      const callbacks = this.listeners.get(eventType);
      if (callbacks) {
        const index = callbacks.indexOf(callback);
        if (index > -1) {
          callbacks.splice(index, 1);
        }
      }
    };
  }

  /**
   * Emitir evento de stock
   */
  emit(eventType: string, event: StockUpdateEvent): void {
    console.log(`📡 [StockEventEmitter] Emitiendo evento: ${eventType}`, event);
    
    const callbacks = this.listeners.get(eventType);
    if (callbacks) {
      callbacks.forEach(callback => {
        try {
          callback(event);
        } catch (error) {
          console.error(`❌ [StockEventEmitter] Error ejecutando callback para ${eventType}:`, error);
        }
      });
    }
  }

  /**
   * Emitir evento cuando se genera un vale
   */
  emitValeGenerated(centroAcopioId: string, mes: number, anio: number): void {
    this.emit('vale_generated', {
      type: 'vale_generated',
      centroAcopioId,
      mes,
      anio,
      allVaccines: true // Indica que se debe actualizar todas las vacunas
    });
  }

  /**
   * Emitir evento cuando se actualiza stock específico
   */
  emitStockUpdated(vacunaId: string, mes: number, anio: number): void {
    this.emit('stock_updated', {
      type: 'stock_updated',
      vacunaId,
      mes,
      anio,
      allVaccines: false
    });
  }

  /**
   * Limpiar todos los listeners
   */
  removeAllListeners(): void {
    this.listeners.clear();
  }
}

// Instancia singleton
export const stockEventEmitter = new StockEventEmitter();

/**
 * Hook para usar el event emitter en componentes React
 */
export const useStockEvents = () => {
  return {
    onValeGenerated: (callback: StockEventCallback) => {
      return stockEventEmitter.on('vale_generated', callback);
    },
    onStockUpdated: (callback: StockEventCallback) => {
      return stockEventEmitter.on('stock_updated', callback);
    },
    emitValeGenerated: stockEventEmitter.emitValeGenerated.bind(stockEventEmitter),
    emitStockUpdated: stockEventEmitter.emitStockUpdated.bind(stockEventEmitter)
  };
};
