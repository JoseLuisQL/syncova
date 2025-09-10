import { ApiResponse, apiClient } from '../config/api';

/**
 * Interfaz para validación de stock
 */
export interface StockValidationResult {
  success: boolean;
  errors: string[];
  warnings: string[];
  stockDetails: {
    vaccines: VaccineStockDetail[];
    syringes: SyringeStockDetail[];
  };
  expiredLots: {
    vaccines: ExpiredLotDetail[];
    syringes: ExpiredLotDetail[];
  };
}

export interface VaccineStockDetail {
  vaccineId: string;
  vaccineName: string;
  requiredQuantity: number;
  availableQuantity: number;
  sufficient: boolean;
  lots: {
    id: string;
    number: string;
    availableQuantity: number;
    expirationDate: Date;
    isExpired: boolean;
    daysUntilExpiration: number;
  }[];
}

export interface SyringeStockDetail {
  syringeId: string;
  syringeType: string;
  requiredQuantity: number;
  availableQuantity: number;
  sufficient: boolean;
  lots: {
    id: string;
    number: string;
    availableQuantity: number;
    expirationDate?: Date;
    isExpired?: boolean;
    daysUntilExpiration?: number;
  }[];
}

export interface ExpiredLotDetail {
  id: string;
  number: string;
  itemName: string;
  itemType: 'vaccine' | 'syringe';
  expirationDate: Date;
  availableQuantity: number;
  daysExpired: number;
}

export interface StockValidationRequest {
  centroAcopioId: string;
  mes: number;
  anio: number;
  tipoVale?: 'completo' | 'solo_base' | 'solo_adicionales';
  entregasAdicionalesSeleccionadas?: string[];
  gruposEntregasSeleccionados?: number[];
}

/**
 * Servicio para validación de stock antes de generar vales
 */
export class StockValidationService {

  /**
   * Validar stock disponible antes de generar vale
   */
  static async validateStockForVoucher(
    request: StockValidationRequest
  ): Promise<ApiResponse<StockValidationResult>> {
    try {
      const response = await apiClient.post('/vales/validar-stock', request);

      return {
        success: true,
        data: response.data.data
      };
    } catch (error: any) {
      console.error('Error validating stock:', error);
      
      // Manejar diferentes tipos de errores
      if (error.response) {
        // Error de respuesta del servidor
        return {
          success: false,
          error: error.response.data?.message || 'Error al validar stock'
        };
      } else if (error.request) {
        // Error de conexión
        return {
          success: false,
          error: 'Error de conexión al validar stock. Verifique que el servidor esté ejecutándose.'
        };
      } else {
        // Otros errores
        return {
          success: false,
          error: 'Error inesperado al validar stock'
        };
      }
    }
  }

  /**
   * Formatear mensaje de error para vacunas con stock insuficiente
   */
  static formatInsufficientVaccinesMessage(vaccines: VaccineStockDetail[]): string {
    const insufficientVaccines = vaccines.filter(v => !v.sufficient);
    
    if (insufficientVaccines.length === 0) return '';

    const vaccineList = insufficientVaccines
      .map(v => `• ${v.vaccineName}: Requerido ${v.requiredQuantity}, Disponible ${v.availableQuantity}`)
      .join('\n');

    return `Las siguientes vacunas no tienen stock suficiente:\n\n${vaccineList}`;
  }

  /**
   * Formatear mensaje de error para jeringas con stock insuficiente
   */
  static formatInsufficientSyringesMessage(syringes: SyringeStockDetail[]): string {
    const insufficientSyringes = syringes.filter(s => !s.sufficient);
    
    if (insufficientSyringes.length === 0) return '';

    const syringeList = insufficientSyringes
      .map(s => `• ${s.syringeType}: Requerido ${s.requiredQuantity}, Disponible ${s.availableQuantity}`)
      .join('\n');

    return `Las siguientes jeringas no tienen stock suficiente:\n\n${syringeList}`;
  }

  /**
   * Formatear mensaje de error para lotes vencidos
   */
  static formatExpiredLotsMessage(expiredLots: { vaccines: ExpiredLotDetail[]; syringes: ExpiredLotDetail[] }): string {
    const messages: string[] = [];

    if (expiredLots.vaccines.length > 0) {
      const vaccineList = expiredLots.vaccines
        .map(lot => `• ${lot.itemName} - Lote ${lot.number} (vencido hace ${lot.daysExpired} días)`)
        .join('\n');
      messages.push(`Vacunas con lotes vencidos:\n${vaccineList}`);
    }

    if (expiredLots.syringes.length > 0) {
      const syringeList = expiredLots.syringes
        .map(lot => `• ${lot.itemName} - Lote ${lot.number} (vencido hace ${lot.daysExpired} días)`)
        .join('\n');
      messages.push(`Jeringas con lotes vencidos:\n${syringeList}`);
    }

    return messages.join('\n\n');
  }

  /**
   * Generar mensaje de recomendación para solucionar problemas de stock
   */
  static generateRecommendationMessage(
    hasInsufficientStock: boolean,
    hasExpiredLots: boolean
  ): string {
    const recommendations: string[] = [];

    if (hasInsufficientStock) {
      recommendations.push('📦 Ingrese nuevos lotes de stock para las vacunas y/o jeringas faltantes');
    }

    if (hasExpiredLots) {
      recommendations.push('🔄 Actualice o reemplace los lotes vencidos antes de continuar');
    }

    if (recommendations.length === 0) return '';

    return `\n\nRecomendaciones:\n${recommendations.join('\n')}`;
  }
}
