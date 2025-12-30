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
    const expiredVaccineLots: ExpiredLotDetail[] = [];
    const expiredSyringeLots: ExpiredLotDetail[] = [];

    try {
      // 1. Validate vaccine stock and check for expired lots
      for (const requirement of vaccineRequirements) {
        const vaccineDetail = await this.validateVaccineStock(requirement);
        vaccineDetails.push(vaccineDetail);

        // Check for insufficient stock
        if (!vaccineDetail.sufficient) {
          errors.push(
            `Stock insuficiente de ${vaccineDetail.vaccineName}. ` +
            `Requerido: ${vaccineDetail.requiredQuantity}, ` +
            `Disponible: ${vaccineDetail.availableQuantity}`
          );
        }

        // Check for expired lots
        const expiredLots = vaccineDetail.lots.filter(lot => lot.isExpired);
        if (expiredLots.length > 0) {
          expiredLots.forEach(lot => {
            expiredVaccineLots.push({
              id: lot.id,
              number: lot.number,
              itemName: vaccineDetail.vaccineName,
              itemType: 'vaccine',
              expirationDate: lot.expirationDate,
              availableQuantity: lot.availableQuantity,
              daysExpired: Math.abs(lot.daysUntilExpiration)
            });
          });

          errors.push(
            `La vacuna ${vaccineDetail.vaccineName} tiene lotes vencidos que deben ser actualizados antes de generar el vale`
          );
        }
      }

      // 2. Validate syringe stock and check for expired lots
      for (const requirement of vaccineRequirements) {
        const syringeValidation = await this.validateSyringeStock(
          requirement,
          centroAcopioId
        );
        syringeDetails.push(...syringeValidation.details);

        // Check for insufficient stock
        if (syringeValidation.errors.length > 0) {
          errors.push(...syringeValidation.errors);
        }
        if (syringeValidation.warnings.length > 0) {
          warnings.push(...syringeValidation.warnings);
        }

        // Check for expired syringe lots
        syringeValidation.details.forEach(syringeDetail => {
          const expiredLots = syringeDetail.lots.filter(lot => lot.isExpired);
          if (expiredLots.length > 0) {
            expiredLots.forEach(lot => {
              if (lot.expirationDate && lot.daysUntilExpiration !== undefined) {
                expiredSyringeLots.push({
                  id: lot.id,
                  number: lot.number,
                  itemName: syringeDetail.syringeType,
                  itemType: 'syringe',
                  expirationDate: lot.expirationDate,
                  availableQuantity: lot.availableQuantity,
                  daysExpired: Math.abs(lot.daysUntilExpiration)
                });
              }
            });

            errors.push(
              `Las jeringas ${syringeDetail.syringeType} tienen lotes vencidos que deben ser actualizados antes de generar el vale`
            );
          }
        });
      }

      return {
        success: errors.length === 0,
        errors,
        warnings,
        stockDetails: {
          vaccines: vaccineDetails,
          syringes: syringeDetails
        },
        expiredLots: {
          vaccines: expiredVaccineLots,
          syringes: expiredSyringeLots
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
        },
        expiredLots: {
          vaccines: expiredVaccineLots,
          syringes: expiredSyringeLots
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

    const today = new Date();
    const availableQuantity = lots.reduce((sum, lot) => sum + lot.cantidadActual, 0);
    const sufficient = availableQuantity >= requirement.quantity;

    return {
      vaccineId: requirement.vaccineId,
      vaccineName: vaccine.nombre,
      requiredQuantity: requirement.quantity,
      availableQuantity,
      sufficient,
      lots: lots.map(lot => {
        const expirationDate = new Date(lot.fechaVencimiento);
        const timeDiff = expirationDate.getTime() - today.getTime();
        const daysUntilExpiration = Math.ceil(timeDiff / (1000 * 3600 * 24));
        const isExpired = daysUntilExpiration < 0;

        return {
          id: lot.id,
          number: lot.numero,
          availableQuantity: lot.cantidadActual,
          expirationDate: lot.fechaVencimiento,
          isExpired,
          daysUntilExpiration
        };
      })
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
      errors.push(`Error validando stock de jeringas para vacuna ${requirement.vaccineId}`);
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

    const today = new Date();
    const availableQuantity = lots.reduce((sum, lot) => sum + lot.cantidadActual, 0);
    const sufficient = availableQuantity >= requiredQuantity;

    return {
      syringeId,
      syringeType: `${syringe.tipo} ${syringe.capacidad} (${syringe.color})`,
      requiredQuantity,
      availableQuantity,
      sufficient,
      lots: lots.map(lot => {
        if (!lot.fechaVencimiento) {
          return {
            id: lot.id,
            number: lot.numero,
            availableQuantity: lot.cantidadActual,
            expirationDate: undefined,
            isExpired: false,
            daysUntilExpiration: undefined
          };
        }

        const expirationDate = new Date(lot.fechaVencimiento);
        const timeDiff = expirationDate.getTime() - today.getTime();
        const daysUntilExpiration = Math.ceil(timeDiff / (1000 * 3600 * 24));
        const isExpired = daysUntilExpiration < 0;

        return {
          id: lot.id,
          number: lot.numero,
          availableQuantity: lot.cantidadActual,
          expirationDate: lot.fechaVencimiento,
          isExpired,
          daysUntilExpiration
        };
      })
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

    const today = new Date();

    return [{
      syringeId: syringe.id,
      syringeType: `${syringe.tipo} ${syringe.capacidad} (${syringe.color})`,
      requiredQuantity,
      availableQuantity,
      sufficient: availableQuantity >= requiredQuantity,
      lots: syringe.lotes.map(lot => {
        if (!lot.fechaVencimiento) {
          return {
            id: lot.id,
            number: lot.numero,
            availableQuantity: lot.cantidadActual,
            expirationDate: undefined,
            isExpired: false,
            daysUntilExpiration: undefined
          };
        }

        const expirationDate = new Date(lot.fechaVencimiento);
        const timeDiff = expirationDate.getTime() - today.getTime();
        const daysUntilExpiration = Math.ceil(timeDiff / (1000 * 3600 * 24));
        const isExpired = daysUntilExpiration < 0;

        return {
          id: lot.id,
          number: lot.numero,
          availableQuantity: lot.cantidadActual,
          expirationDate: lot.fechaVencimiento,
          isExpired,
          daysUntilExpiration
        };
      })
    }];
  }
}
