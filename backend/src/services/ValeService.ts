/**
 * ValeService - Facade for Vale operations
 * 
 * This service has been refactored and split into sub-services:
 * - ValeValidationService: Validation operations
 * - ValeQueryService: Query/read operations
 * - ValeStockService: Stock management operations
 * - ValeGenerationService: Vale generation and lifecycle operations
 * 
 * This file maintains backward compatibility by re-exporting all functionality
 * from the sub-services through a unified ValeService class.
 * 
 * For new code, prefer importing from specific sub-services:
 * import { ValeGenerationService } from '@/services/vale';
 */

// Import sub-services
import { ValeValidationService } from './vale/ValeValidationService';
import { 
  ValeQueryService,
  ValeEntregaConRelaciones,
  ValeDetalleConRelaciones,
  ValesFilters
} from './vale/ValeQueryService';
import { ValeStockService, StockAfectacion } from './vale/ValeStockService';
import { 
  ValeGenerationService,
  GenerarValeDto,
  ResumenGeneracion,
  ModificacionVale
} from './vale/ValeGenerationService';
import { ValeSyncService } from './vale/ValeSyncService';

// Re-export types for backward compatibility
export type {
  ValeEntregaConRelaciones,
  ValeDetalleConRelaciones,
  ValesFilters,
  StockAfectacion,
  GenerarValeDto,
  ResumenGeneracion,
  ModificacionVale
};

/**
 * ValeService - Unified facade for all Vale operations
 * Maintains backward compatibility with existing code
 */
export class ValeService {
  
  // ==================== VALIDATION METHODS ====================
  
  static validateGenerarValeData = ValeValidationService.validateGenerarValeData;
  static validarIntegridadVale = ValeValidationService.validarIntegridadVale;
  static verificarValesExistentesParaEstablecimiento = ValeValidationService.verificarValesExistentesParaEstablecimiento;
  
  // ==================== QUERY METHODS ====================
  
  static getVales = ValeQueryService.getVales;
  static getValeById = ValeQueryService.getValeById;
  static diagnosticarEstadoVale = ValeQueryService.diagnosticarEstadoVale;
  static getTiposValesGenerados = ValeQueryService.getTiposValesGenerados;
  static getGruposEntregasAdicionalesGenerados = ValeQueryService.getGruposEntregasAdicionalesGenerados;
  static getEntregasAdicionalesDisponibles = ValeQueryService.getEntregasAdicionalesDisponibles;
  static getModificaciones = ValeQueryService.getModificaciones;
  static obtenerHistorialModificaciones = ValeQueryService.getModificaciones;
  static obtenerMovimientosParaVale = ValeQueryService.obtenerMovimientosParaVale;
  
  // ==================== GENERATION METHODS ====================
  
  static generarVale = ValeGenerationService.generarVale;
  static revertirVale = ValeGenerationService.revertirVale;
  static cambiarEstado = ValeGenerationService.cambiarEstado;
  static limpiarEstadoReversion = ValeGenerationService.limpiarEstadoReversion;
  
  // ==================== SYNC METHODS ====================
  
  static sincronizarValeConMovimientos = ValeSyncService.sincronizarValeConMovimientos;
  static sincronizarValesAutomaticamente = ValeSyncService.sincronizarValesAutomaticamente;
  static onMovimientoActualizado = ValeSyncService.onMovimientoActualizado;
  static onEntregaAdicionalCambiada = ValeSyncService.onEntregaAdicionalCambiada;
  static sincronizarValesDeEntregasAdicionales = ValeSyncService.sincronizarValesDeEntregasAdicionales;
  
  // ==================== STOCK METHODS (Internal use) ====================
  // These are typically used internally but exposed for backward compatibility
  
  static obtenerLotesDisponibles = ValeStockService.obtenerLotesDisponibles;
  static afectarStockVacunas = ValeStockService.afectarStockVacunas;
  static afectarStockVacunasConsolidado = ValeStockService.afectarStockVacunasConsolidado;
  static afectarStockJeringas = ValeStockService.afectarStockJeringas;
  static afectarStockJeringasConsolidado = ValeStockService.afectarStockJeringasConsolidado;
  static restaurarStockVacunas = ValeStockService.restaurarStockVacunas;
  static restaurarStockJeringas = ValeStockService.restaurarStockJeringas;
  static obtenerStockTotalVacuna = ValeStockService.obtenerStockTotalVacuna;
  static obtenerStockTotalJeringa = ValeStockService.obtenerStockTotalJeringa;
}
