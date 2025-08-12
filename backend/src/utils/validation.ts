import Joi from 'joi';
import { ValidationError } from '@/types';

/**
 * Utilidades para validación de datos
 */
export class ValidationUtil {
  /**
   * Valida datos usando un esquema Joi
   */
  static validate<T>(
    data: any,
    schema: Joi.ObjectSchema<T>
  ): { isValid: boolean; errors?: ValidationError[]; value?: T } {
    const { error, value } = schema.validate(data, {
      abortEarly: false,
      stripUnknown: true,
      convert: true,
    });

    if (error) {
      const errors: ValidationError[] = error.details.map((detail) => ({
        field: detail.path.join('.'),
        message: detail.message,
        value: detail.context?.value,
      }));

      return { isValid: false, errors };
    }

    return { isValid: true, value };
  }

  /**
   * Esquemas de validación comunes
   */
  static schemas = {
    // UUID válido
    uuid: Joi.string().uuid({ version: 'uuidv4' }),

    // Paginación
    pagination: Joi.object({
      page: Joi.number().integer().min(1).default(1),
      limit: Joi.number().integer().min(1).max(100).default(10),
    }),

    // Búsqueda y filtros
    search: Joi.object({
      search: Joi.string().trim().max(255).optional(),
      sortBy: Joi.string().trim().max(50).optional(),
      sortOrder: Joi.string().valid('asc', 'desc').default('asc'),
      filter: Joi.string().trim().max(100).optional(),
    }),

    // Establecimiento
    createEstablecimiento: Joi.object({
      nombre: Joi.string().trim().min(3).max(255).required(),
      tipo: Joi.string().valid('centro_acopio', 'centro_salud', 'puesto_salud').required(),
      codigo: Joi.string().trim().min(2).max(50).required(),
      centroAcopioId: Joi.string().uuid().optional().allow(null),
      direccion: Joi.string().trim().min(10).max(500).required(),
      responsable: Joi.string().trim().min(3).max(255).required(),
      telefono: Joi.string().trim().pattern(/^[0-9\-\+\s\(\)]+$/).max(20).optional(),
    }),

    updateEstablecimiento: Joi.object({
      nombre: Joi.string().trim().min(3).max(255).optional(),
      tipo: Joi.string().valid('centro_acopio', 'centro_salud', 'puesto_salud').optional(),
      codigo: Joi.string().trim().min(2).max(50).optional(),
      centroAcopioId: Joi.string().uuid().optional().allow(null),
      direccion: Joi.string().trim().min(10).max(500).optional(),
      responsable: Joi.string().trim().min(3).max(255).optional(),
      telefono: Joi.string().trim().pattern(/^[0-9\-\+\s\(\)]+$/).max(20).optional(),
      estado: Joi.string().valid('activo', 'inactivo').optional(),
    }),

    // Vacuna
    createVacuna: Joi.object({
      nombre: Joi.string().trim().min(2).max(255).required(),
      tipo: Joi.string().trim().min(2).max(100).required(),
      presentacion: Joi.string().trim().min(2).max(100).required(),
      dosisPorFrasco: Joi.number().integer().min(1).max(100).required(),
      tiempoVidaUtil: Joi.number().integer().min(1).max(3650).required(),
      temperaturaAlmacenamiento: Joi.string().trim().min(3).max(50).required(),
    }),

    updateVacuna: Joi.object({
      nombre: Joi.string().trim().min(2).max(255).optional(),
      tipo: Joi.string().trim().min(2).max(100).optional(),
      presentacion: Joi.string().trim().min(2).max(100).optional(),
      dosisPorFrasco: Joi.number().integer().min(1).max(100).optional(),
      tiempoVidaUtil: Joi.number().integer().min(1).max(3650).optional(),
      temperaturaAlmacenamiento: Joi.string().trim().min(3).max(50).optional(),
      estado: Joi.string().valid('activo', 'inactivo').optional(),
    }),

    // Usuario
    createUsuario: Joi.object({
      nombres: Joi.string().trim().min(2).max(255).required(),
      apellidos: Joi.string().trim().min(2).max(255).required(),
      email: Joi.string().email().max(255).required(),
      usuario: Joi.string().trim().min(3).max(100).alphanum().required(),
      password: Joi.string().min(8).max(128).required(),
      rol: Joi.string().valid('administrador', 'coordinador', 'responsable_acopio', 'operador').required(),
      establecimientoId: Joi.string().uuid().optional().allow(null),
    }),

    updateUsuario: Joi.object({
      nombres: Joi.string().trim().min(2).max(255).optional(),
      apellidos: Joi.string().trim().min(2).max(255).optional(),
      email: Joi.string().email().max(255).optional(),
      usuario: Joi.string().trim().min(3).max(100).alphanum().optional(),
      password: Joi.string().min(8).max(128).optional(),
      rol: Joi.string().valid('administrador', 'coordinador', 'responsable_acopio', 'operador').optional(),
      establecimientoId: Joi.string().uuid().optional().allow(null),
      estado: Joi.string().valid('activo', 'inactivo').optional(),
    }),

    // Autenticación
    login: Joi.object({
      usuario: Joi.string().trim().min(3).max(100).required(),
      password: Joi.string().min(1).max(128).required(),
    }),

    // Lote de vacuna
    createLoteVacuna: Joi.object({
      numero: Joi.string().trim().min(3).max(100).required(),
      vacunaId: Joi.string().uuid().required(),
      fechaIngreso: Joi.date().max('now').required(),
      fechaVencimiento: Joi.date().greater(Joi.ref('fechaIngreso')).required(),
      formaIngreso: Joi.string().valid('1° TRIMESTRE', '2° TRIMESTRE', '3° TRIMESTRE', '4° TRIMESTRE').required(),
      comprobanteClase: Joi.string().valid('PECOSA', 'GUIA', 'TRASLADO', 'OTROS').required(),
      numeroComprobante: Joi.string().trim().min(3).max(100).required(),
      cantidadInicial: Joi.number().integer().min(1).max(1000000).required(),
      cantidadActual: Joi.number().integer().min(0).max(Joi.ref('cantidadInicial')).required(),
      observaciones: Joi.string().trim().max(1000).optional(),
    }),

    // Planificación anual
    createPlanificacion: Joi.object({
      establecimientoId: Joi.string().uuid().required(),
      vacunaId: Joi.string().uuid().required(),
      anio: Joi.number().integer().min(2020).max(2050).required(),
      metaAnual: Joi.number().integer().min(1).max(1000000).required(),
      distribucionMensual: Joi.array().items(
        Joi.number().integer().min(0).max(100000)
      ).length(12).required(),
    }),

    // Movimiento de vacuna
    createMovimiento: Joi.object({
      establecimientoId: Joi.string().uuid().required(),
      vacunaId: Joi.string().uuid().required(),
      mes: Joi.number().integer().min(1).max(12).required(),
      anio: Joi.number().integer().min(2020).max(2050).required(),
      saldoAnterior: Joi.number().integer().min(0).default(0),
      transIngreso: Joi.number().integer().min(0).default(0),
      salida: Joi.number().integer().min(0).default(0),
      transSalida: Joi.number().integer().min(0).default(0),
      entrega: Joi.number().integer().min(0).default(0),
      observaciones: Joi.string().trim().max(1000).optional(),
      fechaMovimiento: Joi.date().max('now').default('now'),
    }),

    // Entrega adicional
    createEntregaAdicional: Joi.object({
      movimientoVacunaId: Joi.string().uuid().required(),
      numeroEntrega: Joi.number().integer().min(1).max(100).required(),
      cantidad: Joi.number().integer().min(1).max(100000).required(),
      fechaEntrega: Joi.date().max('now').default('now'),
      motivo: Joi.string().trim().max(500).optional(),
    }),
  };

  /**
   * Valida que un año sea válido para el sistema
   */
  static isValidYear(year: number): boolean {
    const currentYear = new Date().getFullYear();
    return year >= 2020 && year <= currentYear + 5;
  }

  /**
   * Valida que un mes sea válido
   */
  static isValidMonth(month: number): boolean {
    return month >= 1 && month <= 12;
  }

  /**
   * Valida que una fecha no sea futura
   */
  static isNotFutureDate(date: Date): boolean {
    return date <= new Date();
  }

  /**
   * Valida que una fecha de vencimiento sea posterior a la fecha de ingreso
   */
  static isValidExpirationDate(expirationDate: Date, entryDate: Date): boolean {
    return expirationDate > entryDate;
  }

  /**
   * Valida que la distribución mensual sume la meta anual
   */
  static isValidMonthlyDistribution(distribution: number[], annualGoal: number): boolean {
    const sum = distribution.reduce((acc, curr) => acc + curr, 0);
    return sum === annualGoal;
  }

  /**
   * Valida formato de email
   */
  static isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  /**
   * Valida formato de teléfono
   */
  static isValidPhone(phone: string): boolean {
    const phoneRegex = /^[0-9\-\+\s\(\)]+$/;
    return phoneRegex.test(phone) && phone.length >= 7 && phone.length <= 20;
  }

  /**
   * Valida que una contraseña sea segura
   */
  static isStrongPassword(password: string): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (password.length < 8) {
      errors.push('La contraseña debe tener al menos 8 caracteres');
    }

    if (!/[A-Z]/.test(password)) {
      errors.push('La contraseña debe contener al menos una letra mayúscula');
    }

    if (!/[a-z]/.test(password)) {
      errors.push('La contraseña debe contener al menos una letra minúscula');
    }

    if (!/[0-9]/.test(password)) {
      errors.push('La contraseña debe contener al menos un número');
    }

    if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
      errors.push('La contraseña debe contener al menos un carácter especial');
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }
}

export default ValidationUtil;

// =====================================================
// FUNCIONES DE VALIDACIÓN SIMPLES
// =====================================================

/**
 * Valida que un campo requerido no esté vacío
 */
export function validateRequired(value: any, fieldName: string): string | null {
  if (value === undefined || value === null || value === '') {
    return `El campo ${fieldName} es requerido`;
  }
  return null;
}

/**
 * Valida que un valor esté en una lista de valores permitidos
 */
export function validateEnum(value: any, allowedValues: any[], fieldName: string): string | null {
  if (!allowedValues.includes(value)) {
    return `El campo ${fieldName} debe ser uno de: ${allowedValues.join(', ')}`;
  }
  return null;
}

/**
 * Valida que un valor sea un UUID válido
 */
export function validateUUID(value: any): boolean {
  if (!value) return false;
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(value);
}

/**
 * Valida que un número esté en un rango
 */
export function validateRange(value: number, min: number, max: number, fieldName: string): string | null {
  if (value < min || value > max) {
    return `El campo ${fieldName} debe estar entre ${min} y ${max}`;
  }
  return null;
}

/**
 * Valida longitud de string
 */
export function validateLength(value: string, min: number, max: number, fieldName: string): string | null {
  if (value.length < min || value.length > max) {
    return `El campo ${fieldName} debe tener entre ${min} y ${max} caracteres`;
  }
  return null;
}

/**
 * Valida que un valor sea una fecha válida
 */
export function validateDate(value: any): boolean {
  if (!value) return false;
  const date = new Date(value);
  return !isNaN(date.getTime());
}

/**
 * Valida que un valor sea un número válido
 */
export function validateNumber(value: any): boolean {
  return !isNaN(Number(value)) && isFinite(Number(value));
}

/**
 * Versión simplificada de validateRequired que retorna boolean
 */
export function isRequired(value: any): boolean {
  return value !== undefined && value !== null && value !== '';
}

/**
 * Versión simplificada de validateEnum que retorna boolean
 */
export function isValidEnum(value: any, allowedValues: any[]): boolean {
  return allowedValues.includes(value);
}
