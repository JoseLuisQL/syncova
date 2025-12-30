/**
 * Movimientos Services Module
 * 
 * This module contains the refactored MovimientosService split into sub-services:
 * - MovimientosQueryService: Query/read operations
 * - MovimientosWriteService: CRUD operations
 * - MovimientosCalculationService: Calculations and sync
 * - MovimientosExcelService: Excel import/export
 * 
 * Note: MovimientosExportService exists separately at the parent services level
 */

export * from './types';
export * from './MovimientosQueryService';
export * from './MovimientosWriteService';
export * from './MovimientosCalculationService';
export * from './MovimientosExcelService';
