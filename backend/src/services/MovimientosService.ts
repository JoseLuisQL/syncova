/**
 * MovimientosService Facade
 * 
 * This facade maintains backward compatibility with the original monolithic service
 * by re-exporting all methods from the refactored sub-services.
 * 
 * Sub-services:
 * - MovimientosQueryService: Query/read operations (getAll, getById)
 * - MovimientosWriteService: CRUD operations (create, update, delete, entregas adicionales)
 * - MovimientosCalculationService: Calculations and synchronization
 * - MovimientosExcelService: Excel templates, import/export
 */

import { ServiceResult } from '@/types';
import { IMovimientoVacuna, IEntregaAdicional } from '@/types';
import * as ExcelJS from 'exceljs';

import { MovimientosQueryService } from './movimientos/MovimientosQueryService';
import { MovimientosWriteService } from './movimientos/MovimientosWriteService';
import { MovimientosCalculationService } from './movimientos/MovimientosCalculationService';
import { MovimientosExcelService } from './movimientos/MovimientosExcelService';

// Re-export types for backward compatibility
export {
  MovimientosFilters,
  CreateMovimientoDto,
  UpdateMovimientoDto,
  CreateEntregaAdicionalDto,
  MovimientoConRelaciones
} from './movimientos/types';

/**
 * Facade class that delegates to sub-services
 */
export class MovimientosService {

  // ==================== Query Operations ====================

  static async getAll(filters?: any): Promise<ServiceResult<{ movimientos: any[]; total: number }>> {
    return MovimientosQueryService.getAll(filters);
  }

  static async getById(id: string): Promise<ServiceResult<any>> {
    return MovimientosQueryService.getById(id);
  }

  // ==================== Write Operations ====================

  static async create(data: any): Promise<ServiceResult<IMovimientoVacuna>> {
    return MovimientosWriteService.create(data);
  }

  static async update(id: string, data: any): Promise<ServiceResult<IMovimientoVacuna>> {
    return MovimientosWriteService.update(id, data);
  }

  static async delete(id: string): Promise<ServiceResult<void>> {
    return MovimientosWriteService.delete(id);
  }

  static async createEntregaAdicional(data: any): Promise<ServiceResult<IEntregaAdicional>> {
    return MovimientosWriteService.createEntregaAdicional(data);
  }

  static async updateEntregaAdicional(
    id: string,
    cantidad: number,
    motivo?: string,
    usuarioId?: string,
    skipRedistribucion?: boolean
  ): Promise<ServiceResult<IEntregaAdicional>> {
    return MovimientosWriteService.updateEntregaAdicional(id, cantidad, motivo, usuarioId, skipRedistribucion);
  }

  static async deleteEntregaAdicional(id: string): Promise<ServiceResult<void>> {
    return MovimientosWriteService.deleteEntregaAdicional(id);
  }

  static async generarMovimientosDesdeplanificacion(
    planificacionId: string,
    usuarioId: string
  ): Promise<ServiceResult<{ creados: number; actualizados: number; errores: string[] }>> {
    return MovimientosWriteService.generarMovimientosDesdeplanificacion(planificacionId, usuarioId);
  }

  // ==================== Calculation Operations ====================

  static async getEstadisticas(anio?: number): Promise<ServiceResult<any>> {
    return MovimientosCalculationService.getEstadisticas(anio);
  }

  static async getStockDisponible(
    vacunaId: string,
    mes: number,
    anio: number
  ): Promise<ServiceResult<{
    stockInicialHistorico: number | null;
    stockInicialOriginal: number | null;
    ingresosLotesDelMes: number;
    fechaCapturaStockInicial: Date | null;
    stockActual: number;
    totalEntregas: number;
    stockDisponible: number;
    estado: 'bueno' | 'medio' | 'critico';
    tieneHistorialInicial: boolean;
    lotes: Array<{
      id: string;
      numero: string;
      cantidadActual: number;
      fechaVencimiento: Date;
      estado: string;
    }>;
  }>> {
    return MovimientosCalculationService.getStockDisponible(vacunaId, mes, anio);
  }

  static async sincronizarSaldoAnteriorSiguienteMes(
    establecimientoId: string,
    vacunaId: string,
    mes: number,
    anio: number
  ): Promise<ServiceResult<{ actualizado: boolean; stockCalculado: number }>> {
    return MovimientosCalculationService.sincronizarSaldoAnteriorSiguienteMes(
      establecimientoId,
      vacunaId,
      mes,
      anio
    );
  }

  static async actualizarStockInicialSiguienteMes(
    vacunaId: string,
    mes: number,
    anio: number
  ): Promise<ServiceResult<{
    mesActual: { mes: number; anio: number; stockInicial: number; entregas: number; disponible: number };
    mesSiguiente: { mes: number; anio: number; stockInicialRegistrado: number };
    mensaje: string;
  }>> {
    return MovimientosCalculationService.actualizarStockInicialSiguienteMes(vacunaId, mes, anio);
  }

  // ==================== Excel Operations ====================

  static async generarPlantillaVacuna(vacunaId: string, anio: number): Promise<ServiceResult<ExcelJS.Workbook>> {
    return MovimientosExcelService.generarPlantillaVacuna(vacunaId, anio);
  }

  static async generarPlantillaMasiva(anio: number): Promise<ServiceResult<ExcelJS.Workbook>> {
    return MovimientosExcelService.generarPlantillaMasiva(anio);
  }

  static async importarDesdeExcelVacuna(
    vacunaId: string,
    anio: number,
    buffer: Buffer
  ): Promise<ServiceResult<{ creadas: number; actualizadas: number; errores: string[] }>> {
    return MovimientosExcelService.importarDesdeExcelVacuna(vacunaId, anio, buffer);
  }

  static async importarDesdeExcelMasivo(
    anio: number,
    buffer: Buffer
  ): Promise<ServiceResult<{
    totalCreadas: number;
    totalActualizadas: number;
    erroresPorVacuna: any[];
    vacunasProcesadas: number;
  }>> {
    return MovimientosExcelService.importarDesdeExcelMasivo(anio, buffer);
  }

  static async validarPlantillaExcel(
    anio: number,
    buffer: Buffer
  ): Promise<ServiceResult<{
    valida: boolean;
    errores: string[];
    advertencias: string[];
    estadisticas: {
      totalFilas: number;
      filasConDatos: number;
      establecimientosUnicos: number;
      vacunasEncontradas: number;
    };
  }>> {
    return MovimientosExcelService.validarPlantillaExcel(anio, buffer);
  }

  static async debugPlantillaExcel(buffer: Buffer): Promise<ServiceResult<any>> {
    return MovimientosExcelService.debugPlantillaExcel(buffer);
  }

  static async generarReporteErrores(erroresPorVacuna: any[]): Promise<ServiceResult<ExcelJS.Workbook>> {
    return MovimientosExcelService.generarReporteErrores(erroresPorVacuna);
  }
}
