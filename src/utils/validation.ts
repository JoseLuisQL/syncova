import { CreateRedDto, UpdateRedDto, CreateMicroredDto, UpdateMicroredDto, CreateCentroAcopioDto, UpdateCentroAcopioDto } from '../types';

export interface ValidationError {
  field: string;
  message: string;
}

export interface ValidationResult {
  isValid: boolean;
  errors: Record<string, string>;
}

/**
 * Validación para Redes
 */
export const validateRed = (data: CreateRedDto | UpdateRedDto): ValidationResult => {
  const errors: Record<string, string> = {};

  // Nombre es requerido
  if (!data.nombre || data.nombre.trim().length === 0) {
    errors.nombre = 'El nombre es requerido';
  } else if (data.nombre.trim().length < 2) {
    errors.nombre = 'El nombre debe tener al menos 2 caracteres';
  } else if (data.nombre.trim().length > 100) {
    errors.nombre = 'El nombre no puede exceder 100 caracteres';
  }

  // Código es opcional pero si se proporciona debe ser válido
  if (data.codigo && data.codigo.trim().length > 0) {
    if (data.codigo.trim().length < 2) {
      errors.codigo = 'El código debe tener al menos 2 caracteres';
    } else if (data.codigo.trim().length > 20) {
      errors.codigo = 'El código no puede exceder 20 caracteres';
    } else if (!/^[A-Z0-9_-]+$/i.test(data.codigo.trim())) {
      errors.codigo = 'El código solo puede contener letras, números, guiones y guiones bajos';
    }
  }

  // Descripción es opcional pero si se proporciona debe ser válida
  if (data.descripcion && data.descripcion.trim().length > 500) {
    errors.descripcion = 'La descripción no puede exceder 500 caracteres';
  }

  // Estado debe ser válido si se proporciona (solo en actualizaciones)
  if ('estado' in data && data.estado && !['activo', 'inactivo'].includes(data.estado)) {
    errors.estado = 'El estado debe ser "activo" o "inactivo"';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};

/**
 * Validación para Microredes
 */
export const validateMicrored = (data: CreateMicroredDto | UpdateMicroredDto): ValidationResult => {
  const errors: Record<string, string> = {};

  // Nombre es requerido
  if (!data.nombre || data.nombre.trim().length === 0) {
    errors.nombre = 'El nombre es requerido';
  } else if (data.nombre.trim().length < 2) {
    errors.nombre = 'El nombre debe tener al menos 2 caracteres';
  } else if (data.nombre.trim().length > 100) {
    errors.nombre = 'El nombre no puede exceder 100 caracteres';
  }

  // Red ID es requerido para creación
  if ('redId' in data && (!data.redId || data.redId.trim().length === 0)) {
    errors.redId = 'Debe seleccionar una red';
  }

  // Código es opcional pero si se proporciona debe ser válido
  if (data.codigo && data.codigo.trim().length > 0) {
    if (data.codigo.trim().length < 2) {
      errors.codigo = 'El código debe tener al menos 2 caracteres';
    } else if (data.codigo.trim().length > 20) {
      errors.codigo = 'El código no puede exceder 20 caracteres';
    } else if (!/^[A-Z0-9_-]+$/i.test(data.codigo.trim())) {
      errors.codigo = 'El código solo puede contener letras, números, guiones y guiones bajos';
    }
  }

  // Descripción es opcional pero si se proporciona debe ser válida
  if (data.descripcion && data.descripcion.trim().length > 500) {
    errors.descripcion = 'La descripción no puede exceder 500 caracteres';
  }

  // Estado debe ser válido si se proporciona (solo en actualizaciones)
  if ('estado' in data && data.estado && !['activo', 'inactivo'].includes(data.estado)) {
    errors.estado = 'El estado debe ser "activo" o "inactivo"';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};

/**
 * Validación para Centros de Acopio
 */
export const validateCentroAcopio = (data: CreateCentroAcopioDto | UpdateCentroAcopioDto): ValidationResult => {
  const errors: Record<string, string> = {};

  // Nombre es requerido
  if (!data.nombre || data.nombre.trim().length === 0) {
    errors.nombre = 'El nombre es requerido';
  } else if (data.nombre.trim().length < 2) {
    errors.nombre = 'El nombre debe tener al menos 2 caracteres';
  } else if (data.nombre.trim().length > 100) {
    errors.nombre = 'El nombre no puede exceder 100 caracteres';
  }

  // Dirección es requerida
  if (!data.direccion || data.direccion.trim().length === 0) {
    errors.direccion = 'La dirección es requerida';
  } else if (data.direccion.trim().length < 5) {
    errors.direccion = 'La dirección debe tener al menos 5 caracteres';
  } else if (data.direccion.trim().length > 200) {
    errors.direccion = 'La dirección no puede exceder 200 caracteres';
  }

  // Responsable es requerido
  if (!data.responsable || data.responsable.trim().length === 0) {
    errors.responsable = 'El responsable es requerido';
  } else if (data.responsable.trim().length < 2) {
    errors.responsable = 'El nombre del responsable debe tener al menos 2 caracteres';
  } else if (data.responsable.trim().length > 100) {
    errors.responsable = 'El nombre del responsable no puede exceder 100 caracteres';
  } else if (!/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/.test(data.responsable.trim())) {
    errors.responsable = 'El nombre del responsable solo puede contener letras y espacios';
  }

  // Microred ID es opcional pero si se proporciona debe ser válido
  if ('microredId' in data && data.microredId && data.microredId.trim().length === 0) {
    errors.microredId = 'Debe seleccionar una microred válida';
  }

  // Código es opcional pero si se proporciona debe ser válido
  if (data.codigo && data.codigo.trim().length > 0) {
    if (data.codigo.trim().length < 2) {
      errors.codigo = 'El código debe tener al menos 2 caracteres';
    } else if (data.codigo.trim().length > 20) {
      errors.codigo = 'El código no puede exceder 20 caracteres';
    } else if (!/^[A-Z0-9_-]+$/i.test(data.codigo.trim())) {
      errors.codigo = 'El código solo puede contener letras, números, guiones y guiones bajos';
    }
  }

  // Teléfono es opcional pero si se proporciona debe ser válido
  if (data.telefono && data.telefono.trim().length > 0) {
    if (!/^[\d\s+()-]+$/.test(data.telefono.trim())) {
      errors.telefono = 'El teléfono solo puede contener números, espacios, guiones, paréntesis y el signo +';
    } else if (data.telefono.trim().length < 7) {
      errors.telefono = 'El teléfono debe tener al menos 7 dígitos';
    } else if (data.telefono.trim().length > 20) {
      errors.telefono = 'El teléfono no puede exceder 20 caracteres';
    }
  }

  // Estado debe ser válido si se proporciona (solo en actualizaciones)
  if ('estado' in data && data.estado && !['activo', 'inactivo'].includes(data.estado)) {
    errors.estado = 'El estado debe ser "activo" o "inactivo"';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};

/**
 * Validación de campos comunes
 */
export const validateRequired = (value: string, fieldName: string): string | null => {
  if (!value || value.trim().length === 0) {
    return `${fieldName} es requerido`;
  }
  return null;
};

export const validateMinLength = (value: string, minLength: number, fieldName: string): string | null => {
  if (value && value.trim().length < minLength) {
    return `${fieldName} debe tener al menos ${minLength} caracteres`;
  }
  return null;
};

export const validateMaxLength = (value: string, maxLength: number, fieldName: string): string | null => {
  if (value && value.trim().length > maxLength) {
    return `${fieldName} no puede exceder ${maxLength} caracteres`;
  }
  return null;
};

export const validateEmail = (email: string): string | null => {
  if (!email || email.trim().length === 0) {
    return null; // Email es opcional
  }
  
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email.trim())) {
    return 'El formato del email no es válido';
  }
  
  return null;
};

export const validatePhone = (phone: string): string | null => {
  if (!phone || phone.trim().length === 0) {
    return null; // Teléfono es opcional
  }
  
  if (!/^[\d\s+()-]+$/.test(phone.trim())) {
    return 'El teléfono solo puede contener números, espacios, guiones, paréntesis y el signo +';
  }
  
  if (phone.trim().length < 7) {
    return 'El teléfono debe tener al menos 7 dígitos';
  }
  
  if (phone.trim().length > 20) {
    return 'El teléfono no puede exceder 20 caracteres';
  }
  
  return null;
};

/**
 * Sanitizar datos de entrada
 */
export const sanitizeInput = (input: string): string => {
  return input.trim().replace(/\s+/g, ' ');
};

/**
 * Validar que un ID sea válido (UUID)
 */
export const validateId = (id: string, fieldName: string): string | null => {
  if (!id || id.trim().length === 0) {
    return `${fieldName} es requerido`;
  }
  
  // Validación básica de UUID (puede ser más estricta si es necesario)
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  if (!uuidRegex.test(id.trim())) {
    return `${fieldName} no tiene un formato válido`;
  }
  
  return null;
};
