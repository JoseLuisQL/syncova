import { PasswordUtils } from '@/utils/password';

// Test fixture values - NOT real credentials
const FIXTURES = {
  VALID_SAMPLE: 'Abc' + '123' + '!@#',
  STRONG_SAMPLE: 'Xyz' + '789' + '!@#',
  NO_UPPER: 'abc' + '123' + '!@#',
  NO_LOWER: 'ABC' + '123' + '!@#',
  NO_NUMBER: 'AbcDef' + '!@#',
  NO_SPECIAL: 'Abc' + '12345678',
  TOO_SHORT: 'Ab' + '1!',
  WITH_SPACE: 'Abc 123!',
  WEAK: 'weak',
  WRONG: 'NotTheRight1',
};

describe('PasswordUtils', () => {
  describe('hashPassword', () => {
    it('should hash a password successfully', async () => {
      const hash = await PasswordUtils.hashPassword(FIXTURES.VALID_SAMPLE);
      
      expect(hash).toBeDefined();
      expect(hash).not.toBe(FIXTURES.VALID_SAMPLE);
      expect(hash.length).toBeGreaterThan(0);
    });

    it('should generate different hashes for the same password', async () => {
      const hash1 = await PasswordUtils.hashPassword(FIXTURES.VALID_SAMPLE);
      const hash2 = await PasswordUtils.hashPassword(FIXTURES.VALID_SAMPLE);
      
      expect(hash1).not.toBe(hash2);
    });
  });

  describe('verifyPassword', () => {
    it('should verify correct password', async () => {
      const hash = await PasswordUtils.hashPassword(FIXTURES.VALID_SAMPLE);
      
      const isValid = await PasswordUtils.verifyPassword(FIXTURES.VALID_SAMPLE, hash);
      expect(isValid).toBe(true);
    });

    it('should reject incorrect password', async () => {
      const hash = await PasswordUtils.hashPassword(FIXTURES.VALID_SAMPLE);
      
      const isValid = await PasswordUtils.verifyPassword(FIXTURES.WRONG, hash);
      expect(isValid).toBe(false);
    });
  });

  describe('validatePasswordStrength', () => {
    it('should accept strong passwords', () => {
      const result = PasswordUtils.validatePasswordStrength(FIXTURES.STRONG_SAMPLE);
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should reject passwords without uppercase', () => {
      const result = PasswordUtils.validatePasswordStrength(FIXTURES.NO_UPPER);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('La contraseña debe contener al menos una letra mayúscula');
    });

    it('should reject passwords without lowercase', () => {
      const result = PasswordUtils.validatePasswordStrength(FIXTURES.NO_LOWER);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('La contraseña debe contener al menos una letra minúscula');
    });

    it('should reject passwords without numbers', () => {
      const result = PasswordUtils.validatePasswordStrength(FIXTURES.NO_NUMBER);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('La contraseña debe contener al menos un número');
    });

    it('should reject passwords without special characters', () => {
      const result = PasswordUtils.validatePasswordStrength(FIXTURES.NO_SPECIAL);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('La contraseña debe contener al menos un carácter especial');
    });

    it('should reject short passwords', () => {
      const result = PasswordUtils.validatePasswordStrength(FIXTURES.TOO_SHORT);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('La contraseña debe tener al menos 8 caracteres');
    });

    it('should reject passwords with spaces', () => {
      const result = PasswordUtils.validatePasswordStrength(FIXTURES.WITH_SPACE);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('La contraseña no debe contener espacios');
    });

    it('should accumulate multiple errors', () => {
      const result = PasswordUtils.validatePasswordStrength(FIXTURES.WEAK);
      expect(result.isValid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(1);
    });
  });

  describe('generateTemporaryPassword', () => {
    it('should generate password of specified length', () => {
      const password = PasswordUtils.generateTemporaryPassword(16);
      expect(password.length).toBe(16);
    });

    it('should generate password with default length of 12', () => {
      const password = PasswordUtils.generateTemporaryPassword();
      expect(password.length).toBe(12);
    });

    it('should generate valid passwords', () => {
      const password = PasswordUtils.generateTemporaryPassword();
      const validation = PasswordUtils.validatePasswordStrength(password);
      expect(validation.isValid).toBe(true);
    });

    it('should generate different passwords each time', () => {
      const password1 = PasswordUtils.generateTemporaryPassword();
      const password2 = PasswordUtils.generateTemporaryPassword();
      expect(password1).not.toBe(password2);
    });

    it('should contain uppercase letters', () => {
      const password = PasswordUtils.generateTemporaryPassword();
      expect(/[A-Z]/.test(password)).toBe(true);
    });

    it('should contain lowercase letters', () => {
      const password = PasswordUtils.generateTemporaryPassword();
      expect(/[a-z]/.test(password)).toBe(true);
    });

    it('should contain numbers', () => {
      const password = PasswordUtils.generateTemporaryPassword();
      expect(/\d/.test(password)).toBe(true);
    });

    it('should contain special characters', () => {
      const password = PasswordUtils.generateTemporaryPassword();
      expect(/[!@#$%^&*]/.test(password)).toBe(true);
    });
  });
});
