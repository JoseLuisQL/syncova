import { 
  ValidationUtil, 
  validateRequired, 
  validateEnum, 
  validateUUID, 
  validateRange, 
  validateLength, 
  validateDate, 
  validateNumber,
  isRequired,
  isValidEnum
} from '@/utils/validation';

describe('ValidationUtil', () => {
  describe('isValidYear', () => {
    it('should return true for valid years', () => {
      expect(ValidationUtil.isValidYear(2020)).toBe(true);
      expect(ValidationUtil.isValidYear(2024)).toBe(true);
      expect(ValidationUtil.isValidYear(2025)).toBe(true);
    });

    it('should return false for years before 2020', () => {
      expect(ValidationUtil.isValidYear(2019)).toBe(false);
      expect(ValidationUtil.isValidYear(2000)).toBe(false);
    });

    it('should return false for years too far in the future', () => {
      const currentYear = new Date().getFullYear();
      expect(ValidationUtil.isValidYear(currentYear + 10)).toBe(false);
    });
  });

  describe('isValidMonth', () => {
    it('should return true for valid months (1-12)', () => {
      for (let i = 1; i <= 12; i++) {
        expect(ValidationUtil.isValidMonth(i)).toBe(true);
      }
    });

    it('should return false for invalid months', () => {
      expect(ValidationUtil.isValidMonth(0)).toBe(false);
      expect(ValidationUtil.isValidMonth(13)).toBe(false);
      expect(ValidationUtil.isValidMonth(-1)).toBe(false);
    });
  });

  describe('isNotFutureDate', () => {
    it('should return true for past dates', () => {
      const pastDate = new Date('2020-01-01');
      expect(ValidationUtil.isNotFutureDate(pastDate)).toBe(true);
    });

    it('should return true for today', () => {
      const today = new Date();
      expect(ValidationUtil.isNotFutureDate(today)).toBe(true);
    });

    it('should return false for future dates', () => {
      const futureDate = new Date();
      futureDate.setFullYear(futureDate.getFullYear() + 1);
      expect(ValidationUtil.isNotFutureDate(futureDate)).toBe(false);
    });
  });

  describe('isValidExpirationDate', () => {
    it('should return true when expiration is after entry date', () => {
      const entryDate = new Date('2024-01-01');
      const expirationDate = new Date('2025-01-01');
      expect(ValidationUtil.isValidExpirationDate(expirationDate, entryDate)).toBe(true);
    });

    it('should return false when expiration is before entry date', () => {
      const entryDate = new Date('2025-01-01');
      const expirationDate = new Date('2024-01-01');
      expect(ValidationUtil.isValidExpirationDate(expirationDate, entryDate)).toBe(false);
    });

    it('should return false when dates are equal', () => {
      const date = new Date('2024-01-01');
      expect(ValidationUtil.isValidExpirationDate(date, date)).toBe(false);
    });
  });

  describe('isValidMonthlyDistribution', () => {
    it('should return true when distribution sums to annual goal', () => {
      const distribution = [100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100];
      expect(ValidationUtil.isValidMonthlyDistribution(distribution, 1200)).toBe(true);
    });

    it('should return false when distribution does not sum to annual goal', () => {
      const distribution = [100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100];
      expect(ValidationUtil.isValidMonthlyDistribution(distribution, 1000)).toBe(false);
    });
  });

  describe('isValidEmail', () => {
    it('should return true for valid emails', () => {
      expect(ValidationUtil.isValidEmail('test@example.com')).toBe(true);
      expect(ValidationUtil.isValidEmail('user.name@domain.co')).toBe(true);
    });

    it('should return false for invalid emails', () => {
      expect(ValidationUtil.isValidEmail('invalid')).toBe(false);
      expect(ValidationUtil.isValidEmail('test@')).toBe(false);
      expect(ValidationUtil.isValidEmail('@domain.com')).toBe(false);
    });
  });

  describe('isValidPhone', () => {
    it('should return true for valid phone numbers', () => {
      expect(ValidationUtil.isValidPhone('123456789')).toBe(true);
      expect(ValidationUtil.isValidPhone('+51 999 888 777')).toBe(true);
      expect(ValidationUtil.isValidPhone('(01) 234-5678')).toBe(true);
    });

    it('should return false for invalid phone numbers', () => {
      expect(ValidationUtil.isValidPhone('abc')).toBe(false);
      expect(ValidationUtil.isValidPhone('123')).toBe(false);
    });
  });

  describe('isStrongPassword', () => {
    it('should return valid for strong passwords', () => {
      const result = ValidationUtil.isStrongPassword('Test@1234');
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should return errors for weak passwords', () => {
      const result = ValidationUtil.isStrongPassword('weak');
      expect(result.isValid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
    });

    it('should require uppercase letters', () => {
      const result = ValidationUtil.isStrongPassword('test@1234');
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('La contraseña debe contener al menos una letra mayúscula');
    });

    it('should require lowercase letters', () => {
      const result = ValidationUtil.isStrongPassword('TEST@1234');
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('La contraseña debe contener al menos una letra minúscula');
    });

    it('should require numbers', () => {
      const result = ValidationUtil.isStrongPassword('TestTest@');
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('La contraseña debe contener al menos un número');
    });

    it('should require special characters', () => {
      const result = ValidationUtil.isStrongPassword('TestTest1234');
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('La contraseña debe contener al menos un carácter especial');
    });
  });
});

describe('Simple Validation Functions', () => {
  describe('validateRequired', () => {
    it('should return null for non-empty values', () => {
      expect(validateRequired('value', 'field')).toBeNull();
      expect(validateRequired(0, 'field')).toBeNull();
      expect(validateRequired(false, 'field')).toBeNull();
    });

    it('should return error for empty values', () => {
      expect(validateRequired(null, 'field')).toBe('El campo field es requerido');
      expect(validateRequired(undefined, 'field')).toBe('El campo field es requerido');
      expect(validateRequired('', 'field')).toBe('El campo field es requerido');
    });
  });

  describe('validateEnum', () => {
    it('should return null for valid enum values', () => {
      expect(validateEnum('active', ['active', 'inactive'], 'status')).toBeNull();
    });

    it('should return error for invalid enum values', () => {
      const result = validateEnum('unknown', ['active', 'inactive'], 'status');
      expect(result).toBe('El campo status debe ser uno de: active, inactive');
    });
  });

  describe('validateUUID', () => {
    it('should return true for valid UUIDs', () => {
      expect(validateUUID('123e4567-e89b-12d3-a456-426614174000')).toBe(true);
      expect(validateUUID('550e8400-e29b-41d4-a716-446655440000')).toBe(true);
    });

    it('should return false for invalid UUIDs', () => {
      expect(validateUUID('invalid-uuid')).toBe(false);
      expect(validateUUID('12345')).toBe(false);
      expect(validateUUID(null)).toBe(false);
      expect(validateUUID(undefined)).toBe(false);
      expect(validateUUID('')).toBe(false);
    });
  });

  describe('validateRange', () => {
    it('should return null for values in range', () => {
      expect(validateRange(5, 1, 10, 'value')).toBeNull();
      expect(validateRange(1, 1, 10, 'value')).toBeNull();
      expect(validateRange(10, 1, 10, 'value')).toBeNull();
    });

    it('should return error for values out of range', () => {
      expect(validateRange(0, 1, 10, 'value')).toBe('El campo value debe estar entre 1 y 10');
      expect(validateRange(11, 1, 10, 'value')).toBe('El campo value debe estar entre 1 y 10');
    });
  });

  describe('validateLength', () => {
    it('should return null for strings with valid length', () => {
      expect(validateLength('test', 2, 10, 'field')).toBeNull();
    });

    it('should return error for strings with invalid length', () => {
      expect(validateLength('a', 2, 10, 'field')).toBe('El campo field debe tener entre 2 y 10 caracteres');
      expect(validateLength('12345678901', 2, 10, 'field')).toBe('El campo field debe tener entre 2 y 10 caracteres');
    });
  });

  describe('validateDate', () => {
    it('should return true for valid dates', () => {
      expect(validateDate('2024-01-01')).toBe(true);
      expect(validateDate(new Date())).toBe(true);
    });

    it('should return false for invalid dates', () => {
      expect(validateDate('invalid')).toBe(false);
      expect(validateDate(null)).toBe(false);
      expect(validateDate(undefined)).toBe(false);
    });
  });

  describe('validateNumber', () => {
    it('should return true for valid numbers', () => {
      expect(validateNumber(123)).toBe(true);
      expect(validateNumber('123')).toBe(true);
      expect(validateNumber(0)).toBe(true);
      expect(validateNumber(-5)).toBe(true);
    });

    it('should return false for invalid numbers', () => {
      expect(validateNumber('abc')).toBe(false);
      expect(validateNumber(NaN)).toBe(false);
      expect(validateNumber(Infinity)).toBe(false);
    });
  });

  describe('isRequired', () => {
    it('should return true for non-empty values', () => {
      expect(isRequired('value')).toBe(true);
      expect(isRequired(0)).toBe(true);
      expect(isRequired(false)).toBe(true);
    });

    it('should return false for empty values', () => {
      expect(isRequired(null)).toBe(false);
      expect(isRequired(undefined)).toBe(false);
      expect(isRequired('')).toBe(false);
    });
  });

  describe('isValidEnum', () => {
    it('should return true for valid enum values', () => {
      expect(isValidEnum('active', ['active', 'inactive'])).toBe(true);
    });

    it('should return false for invalid enum values', () => {
      expect(isValidEnum('unknown', ['active', 'inactive'])).toBe(false);
    });
  });
});
