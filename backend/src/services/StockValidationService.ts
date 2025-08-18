import { PrismaClient } from '@prisma/client';
import { ConfiguracionJeringaVacunaService } from './ConfiguracionJeringaVacunaService';
import { createError } from '@/utils/errors';

const prisma = new PrismaClient();

export interface StockValidationResult {
  success: boolean;
  errors: string[];
  warnings: string[];
  stockDetails: {
    vaccines: VaccineStockDetail[];
    syringes: SyringeStockDetail[];
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
  }[];
}

export interface VaccineRequirement {
  vaccineId: string;
  quantity: number;
}

export class StockValidationService {
  /**
   * Validate stock availability for voucher generation
   */
  static async validateStockForVoucher(
    vaccineRequirements: VaccineRequirement[],
    centroAcopioId?: string
  ): Promise<StockValidationResult> {
    const errors: string[] = [];
    const warnings: string[] = [];
    const vaccineDetails: VaccineStockDetail[] = [];
    const syringeDetails: SyringeStockDetail[] = [];

    try {
      // 1. Validate vaccine stock
      for (const requirement of vaccineRequirements) {
        const vaccineDetail = await this.validateVaccineStock(requirement);
        vaccineDetails.push(vaccineDetail);

        if (!vaccineDetail.sufficient) {
          errors.push(
            `Stock insuficiente de ${vaccineDetail.vaccineName}. ` +
            `Requerido: ${vaccineDetail.requiredQuantity}, ` +
            `Disponible: ${vaccineDetail.availableQuantity}`
          );
        }
      }

      // 2. Validate syringe stock
      for (const requirement of vaccineRequirements) {
        const syringeValidation = await this.validateSyringeStock(
          requirement,
          centroAcopioId
        );
        syringeDetails.push(...syringeValidation.details);

        if (syringeValidation.errors.length > 0) {
          errors.push(...syringeValidation.errors);
        }
        if (syringeValidation.warnings.length > 0) {
          warnings.push(...syringeValidation.warnings);
        }
      }

      return {
        success: errors.length === 0,
        errors,
        warnings,
        stockDetails: {
          vaccines: vaccineDetails,
          syringes: syringeDetails
        }
      };

    } catch (error) {
      console.error('Error validating stock:', error);
      return {
        success: false,
        errors: ['Error interno al validar stock'],
        warnings: [],
        stockDetails: {
          vaccines: vaccineDetails,
          syringes: syringeDetails
        }
      };
    }
  }

  /**
   * Validate vaccine stock availability
   */
  private static async validateVaccineStock(
    requirement: VaccineRequirement
  ): Promise<VaccineStockDetail> {
    // Get vaccine info
    const vaccine = await prisma.vacuna.findUnique({
      where: { id: requirement.vaccineId },
      select: { nombre: true, dosisPorFrasco: true }
    });

    if (!vaccine) {
      throw createError(`Vacuna no encontrada: ${requirement.vaccineId}`, 404);
    }

    // Get available lots (FIFO order)
    const lots = await prisma.loteVacuna.findMany({
      where: {
        vacunaId: requirement.vaccineId,
        estado: 'disponible',
        cantidadActual: { gt: 0 }
      },
      orderBy: [
        { fechaVencimiento: 'asc' },
        { fechaIngreso: 'asc' }
      ],
      select: {
        id: true,
        numero: true,
        cantidadActual: true,
        fechaVencimiento: true
      }
    });

    const availableQuantity = lots.reduce((sum, lot) => sum + lot.cantidadActual, 0);
    const sufficient = availableQuantity >= requirement.quantity;

    return {
      vaccineId: requirement.vaccineId,
      vaccineName: vaccine.nombre,
      requiredQuantity: requirement.quantity,
      availableQuantity,
      sufficient,
      lots: lots.map(lot => ({
        id: lot.id,
        number: lot.numero,
        availableQuantity: lot.cantidadActual,
        expirationDate: lot.fechaVencimiento
      }))
    };
  }

  /**
   * Validate syringe stock availability
   */
  private static async validateSyringeStock(
    requirement: VaccineRequirement,
    centroAcopioId?: string
  ): Promise<{
    details: SyringeStockDetail[];
    errors: string[];
    warnings: string[];
  }> {
    const details: SyringeStockDetail[] = [];
    const errors: string[] = [];
    const warnings: string[] = [];

    try {
      // Get vaccine info for dose calculation
      const vaccine = await prisma.vacuna.findUnique({
        where: { id: requirement.vaccineId },
        select: { nombre: true, dosisPorFrasco: true }
      });

      if (!vaccine) {
        errors.push(`Vacuna no encontrada: ${requirement.vaccineId}`);
        return { details, errors, warnings };
      }

      // Calculate total doses
      const totalDoses = requirement.quantity * vaccine.dosisPorFrasco;

      // Get syringe configuration
      const configResult = await ConfiguracionJeringaVacunaService.calcularJeringasNecesarias(
        requirement.vaccineId,
        requirement.quantity,
        centroAcopioId,
        true // Use fallback to ensure we always get some configuration
      );

      if (!configResult.success || !configResult.data || configResult.data.length === 0) {
        warnings.push(
          `No se encontró configuración de jeringas para ${vaccine.nombre}. ` +
          `Se usará configuración por defecto.`
        );

        // Use default fallback: 1:1 ratio with available syringes
        const defaultSyringes = await this.getDefaultSyringeConfiguration(totalDoses);
        details.push(...defaultSyringes);
      } else {
        // Validate each configured syringe
        for (const syringeConfig of configResult.data) {
          const syringeDetail = await this.validateSpecificSyringeStock(
            syringeConfig.jeringaId,
            syringeConfig.cantidad
          );
          details.push(syringeDetail);

          if (!syringeDetail.sufficient) {
            errors.push(
              `Stock insuficiente de ${syringeDetail.syringeType}. ` +
              `Requerido: ${syringeDetail.requiredQuantity}, ` +
              `Disponible: ${syringeDetail.availableQuantity}`
            );
          }
        }
      }

    } catch (error) {
      console.error('Error validating syringe stock:', error);
      errors.push(`Error validando stock de jeringas para ${vaccine?.nombre || 'vacuna desconocida'}`);
    }

    return { details, errors, warnings };
  }

  /**
   * Validate specific syringe stock
   */
  private static async validateSpecificSyringeStock(
    syringeId: string,
    requiredQuantity: number
  ): Promise<SyringeStockDetail> {
    // Get syringe info
    const syringe = await prisma.jeringa.findUnique({
      where: { id: syringeId },
      select: { tipo: true, capacidad: true, color: true }
    });

    if (!syringe) {
      throw createError(`Jeringa no encontrada: ${syringeId}`, 404);
    }

    // Get available lots (FIFO order)
    const lots = await prisma.loteJeringa.findMany({
      where: {
        jeringaId: syringeId,
        estado: 'disponible',
        cantidadActual: { gt: 0 }
      },
      orderBy: [
        { fechaVencimiento: 'asc' },
        { fechaIngreso: 'asc' }
      ],
      select: {
        id: true,
        numero: true,
        cantidadActual: true,
        fechaVencimiento: true
      }
    });

    const availableQuantity = lots.reduce((sum, lot) => sum + lot.cantidadActual, 0);
    const sufficient = availableQuantity >= requiredQuantity;

    return {
      syringeId,
      syringeType: `${syringe.tipo} ${syringe.capacidad} (${syringe.color})`,
      requiredQuantity,
      availableQuantity,
      sufficient,
      lots: lots.map(lot => ({
        id: lot.id,
        number: lot.numero,
        availableQuantity: lot.cantidadActual,
        expirationDate: lot.fechaVencimiento || undefined
      }))
    };
  }

  /**
   * Get default syringe configuration when no specific configuration exists
   */
  private static async getDefaultSyringeConfiguration(
    totalDoses: number
  ): Promise<SyringeStockDetail[]> {
    // Get available syringes with stock
    const availableSyringes = await prisma.jeringa.findMany({
      where: {
        estado: 'activo',
        lotes: {
          some: {
            estado: 'disponible',
            cantidadActual: { gt: 0 }
          }
        }
      },
      include: {
        lotes: {
          where: {
            estado: 'disponible',
            cantidadActual: { gt: 0 }
          },
          select: {
            id: true,
            numero: true,
            cantidadActual: true,
            fechaVencimiento: true
          },
          orderBy: [
            { fechaVencimiento: 'asc' },
            { fechaIngreso: 'asc' }
          ]
        }
      },
      take: 1 // Use only the first available syringe type
    });

    if (availableSyringes.length === 0) {
      return [];
    }

    const syringe = availableSyringes[0];
    const availableQuantity = syringe.lotes.reduce((sum, lot) => sum + lot.cantidadActual, 0);
    const requiredQuantity = totalDoses; // 1:1 ratio by default

    return [{
      syringeId: syringe.id,
      syringeType: `${syringe.tipo} ${syringe.capacidad} (${syringe.color})`,
      requiredQuantity,
      availableQuantity,
      sufficient: availableQuantity >= requiredQuantity,
      lots: syringe.lotes.map(lot => ({
        id: lot.id,
        number: lot.numero,
        availableQuantity: lot.cantidadActual,
        expirationDate: lot.fechaVencimiento || undefined
      }))
    }];
  }
}
