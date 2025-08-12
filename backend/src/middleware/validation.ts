import { Request, Response, NextFunction } from 'express';
import Joi from 'joi';
import { ResponseUtil } from '@/utils/response';
import { ValidationUtil } from '@/utils/validation';

/**
 * Middleware de validación genérico
 */
export const validate = (schema: Joi.ObjectSchema) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    const { isValid, errors, value } = ValidationUtil.validate(req.body, schema);

    if (!isValid) {
      ResponseUtil.validationError(
        res,
        'Error de validación en los datos enviados',
        errors
      );
      return;
    }

    // Reemplazar req.body con los datos validados y sanitizados
    req.body = value;
    next();
  };
};

/**
 * Middleware de validación para parámetros de URL
 */
export const validateParams = (schema: Joi.ObjectSchema) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    const { isValid, errors, value } = ValidationUtil.validate(req.params, schema);

    if (!isValid) {
      ResponseUtil.validationError(
        res,
        'Error de validación en los parámetros de la URL',
        errors
      );
      return;
    }

    req.params = value;
    next();
  };
};

/**
 * Middleware de validación para query parameters
 */
export const validateQuery = (schema: Joi.ObjectSchema) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    const { isValid, errors, value } = ValidationUtil.validate(req.query, schema);

    if (!isValid) {
      ResponseUtil.validationError(
        res,
        'Error de validación en los parámetros de consulta',
        errors
      );
      return;
    }

    req.query = value;
    next();
  };
};

/**
 * Middleware para validar UUID en parámetros
 */
export const validateUUID = (paramName: string = 'id') => {
  return (req: Request, res: Response, next: NextFunction): void => {
    const paramValue = req.params[paramName];
    
    if (!paramValue) {
      ResponseUtil.validationError(
        res,
        `Parámetro ${paramName} es requerido`
      );
      return;
    }

    const schema = Joi.object({
      [paramName]: ValidationUtil.schemas.uuid.required(),
    });

    const { isValid, errors } = ValidationUtil.validate(
      { [paramName]: paramValue },
      schema
    );

    if (!isValid) {
      ResponseUtil.validationError(
        res,
        `El parámetro ${paramName} debe ser un UUID válido`,
        errors
      );
      return;
    }

    next();
  };
};

/**
 * Middleware para validar paginación
 */
export const validatePagination = (req: Request, res: Response, next: NextFunction): void => {
  const { isValid, errors, value } = ValidationUtil.validate(
    req.query,
    ValidationUtil.schemas.pagination
  );

  if (!isValid) {
    ResponseUtil.validationError(
      res,
      'Error de validación en los parámetros de paginación',
      errors
    );
    return;
  }

  req.query = { ...req.query, ...value };
  next();
};

/**
 * Middleware para validar parámetros de búsqueda
 */
export const validateSearch = (req: Request, res: Response, next: NextFunction): void => {
  const { isValid, errors, value } = ValidationUtil.validate(
    req.query,
    ValidationUtil.schemas.search
  );

  if (!isValid) {
    ResponseUtil.validationError(
      res,
      'Error de validación en los parámetros de búsqueda',
      errors
    );
    return;
  }

  req.query = { ...req.query, ...value };
  next();
};

/**
 * Middleware para validar fechas
 */
export const validateDateRange = (
  startDateParam: string = 'startDate',
  endDateParam: string = 'endDate'
) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    const startDate = req.query[startDateParam] as string;
    const endDate = req.query[endDateParam] as string;

    if (startDate && endDate) {
      const start = new Date(startDate);
      const end = new Date(endDate);

      if (isNaN(start.getTime()) || isNaN(end.getTime())) {
        ResponseUtil.validationError(
          res,
          'Las fechas proporcionadas no son válidas'
        );
        return;
      }

      if (start > end) {
        ResponseUtil.validationError(
          res,
          'La fecha de inicio no puede ser posterior a la fecha de fin'
        );
        return;
      }

      // Agregar fechas parseadas al query
      req.query[startDateParam] = start.toISOString();
      req.query[endDateParam] = end.toISOString();
    }

    next();
  };
};

/**
 * Middleware para validar año
 */
export const validateYear = (paramName: string = 'anio') => {
  return (req: Request, res: Response, next: NextFunction): void => {
    const yearValue = req.params[paramName] || req.query[paramName] || req.body[paramName];
    
    if (yearValue) {
      const year = parseInt(yearValue as string, 10);
      
      if (isNaN(year) || !ValidationUtil.isValidYear(year)) {
        ResponseUtil.validationError(
          res,
          `El año debe estar entre 2020 y ${new Date().getFullYear() + 5}`
        );
        return;
      }
    }

    next();
  };
};

/**
 * Middleware para validar mes
 */
export const validateMonth = (paramName: string = 'mes') => {
  return (req: Request, res: Response, next: NextFunction): void => {
    const monthValue = req.params[paramName] || req.query[paramName] || req.body[paramName];
    
    if (monthValue) {
      const month = parseInt(monthValue as string, 10);
      
      if (isNaN(month) || !ValidationUtil.isValidMonth(month)) {
        ResponseUtil.validationError(
          res,
          'El mes debe estar entre 1 y 12'
        );
        return;
      }
    }

    next();
  };
};

/**
 * Middleware para validar que los campos requeridos estén presentes
 */
export const requireFields = (fields: string[]) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    const missingFields: string[] = [];

    for (const field of fields) {
      if (!req.body[field] && req.body[field] !== 0 && req.body[field] !== false) {
        missingFields.push(field);
      }
    }

    if (missingFields.length > 0) {
      ResponseUtil.validationError(
        res,
        `Campos requeridos faltantes: ${missingFields.join(', ')}`
      );
      return;
    }

    next();
  };
};

/**
 * Middleware para sanitizar entrada
 */
export const sanitizeInput = (req: Request, res: Response, next: NextFunction): void => {
  // Función recursiva para sanitizar objetos
  const sanitize = (obj: any): any => {
    if (typeof obj === 'string') {
      return obj.trim();
    }
    
    if (Array.isArray(obj)) {
      return obj.map(sanitize);
    }
    
    if (obj && typeof obj === 'object') {
      const sanitized: any = {};
      for (const [key, value] of Object.entries(obj)) {
        sanitized[key] = sanitize(value);
      }
      return sanitized;
    }
    
    return obj;
  };

  // Sanitizar body, query y params
  if (req.body) {
    req.body = sanitize(req.body);
  }
  
  if (req.query) {
    req.query = sanitize(req.query);
  }
  
  if (req.params) {
    req.params = sanitize(req.params);
  }

  next();
};

/**
 * Middleware para validar archivos subidos
 */
export const validateFile = (
  allowedTypes: string[] = ['image/jpeg', 'image/png', 'application/pdf'],
  maxSize: number = 5 * 1024 * 1024 // 5MB por defecto
) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.file) {
      next();
      return;
    }

    // Validar tipo de archivo
    if (!allowedTypes.includes(req.file.mimetype)) {
      ResponseUtil.validationError(
        res,
        `Tipo de archivo no permitido. Tipos permitidos: ${allowedTypes.join(', ')}`
      );
      return;
    }

    // Validar tamaño
    if (req.file.size > maxSize) {
      ResponseUtil.validationError(
        res,
        `El archivo es demasiado grande. Tamaño máximo: ${maxSize / (1024 * 1024)}MB`
      );
      return;
    }

    next();
  };
};

export default {
  validate,
  validateParams,
  validateQuery,
  validateUUID,
  validatePagination,
  validateSearch,
  validateDateRange,
  validateYear,
  validateMonth,
  requireFields,
  sanitizeInput,
  validateFile,
};
