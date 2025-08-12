import bcrypt from 'bcrypt';

/**
 * Utilidades para manejo de contraseñas
 */
export class PasswordUtils {
  private static readonly SALT_ROUNDS = 12;

  /**
   * Encriptar contraseña
   */
  static async hashPassword(password: string): Promise<string> {
    try {
      return await bcrypt.hash(password, this.SALT_ROUNDS);
    } catch (error) {
      throw new Error('Error al encriptar contraseña');
    }
  }

  /**
   * Verificar contraseña
   */
  static async verifyPassword(password: string, hash: string): Promise<boolean> {
    try {
      return await bcrypt.compare(password, hash);
    } catch (error) {
      throw new Error('Error al verificar contraseña');
    }
  }

  /**
   * Validar fortaleza de contraseña
   */
  static validatePasswordStrength(password: string): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    // Longitud mínima
    if (password.length < 8) {
      errors.push('La contraseña debe tener al menos 8 caracteres');
    }

    // Al menos una letra mayúscula
    if (!/[A-Z]/.test(password)) {
      errors.push('La contraseña debe contener al menos una letra mayúscula');
    }

    // Al menos una letra minúscula
    if (!/[a-z]/.test(password)) {
      errors.push('La contraseña debe contener al menos una letra minúscula');
    }

    // Al menos un número
    if (!/\d/.test(password)) {
      errors.push('La contraseña debe contener al menos un número');
    }

    // Al menos un carácter especial
    if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
      errors.push('La contraseña debe contener al menos un carácter especial');
    }

    // No debe contener espacios
    if (/\s/.test(password)) {
      errors.push('La contraseña no debe contener espacios');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * Generar contraseña temporal
   */
  static generateTemporaryPassword(length: number = 12): string {
    const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const lowercase = 'abcdefghijklmnopqrstuvwxyz';
    const numbers = '0123456789';
    const symbols = '!@#$%^&*';
    
    const allChars = uppercase + lowercase + numbers + symbols;
    
    let password = '';
    
    // Asegurar al menos un carácter de cada tipo
    password += uppercase[Math.floor(Math.random() * uppercase.length)];
    password += lowercase[Math.floor(Math.random() * lowercase.length)];
    password += numbers[Math.floor(Math.random() * numbers.length)];
    password += symbols[Math.floor(Math.random() * symbols.length)];
    
    // Completar con caracteres aleatorios
    for (let i = 4; i < length; i++) {
      password += allChars[Math.floor(Math.random() * allChars.length)];
    }
    
    // Mezclar los caracteres
    return password.split('').sort(() => Math.random() - 0.5).join('');
  }
}
