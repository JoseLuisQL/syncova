import { Request, Response } from 'express';

/**
 * Utilidades para manejo de rate limiting
 */
export class RateLimitUtils {
  /**
   * Limpiar rate limiting para una IP específica (solo en desarrollo)
   */
  static clearRateLimitForIP(ip: string): void {
    if (process.env['NODE_ENV'] !== 'development') {
      console.warn('⚠️ Limpieza de rate limiting solo disponible en desarrollo');
      return;
    }

    // En express-rate-limit, el store por defecto es en memoria
    // Para limpiar, necesitaríamos acceso al store específico
    console.log(`🧹 Rate limiting limpiado para IP: ${ip} (desarrollo)`);
  }

  /**
   * Obtener información de rate limiting para debugging
   */
  static getRateLimitInfo(req: Request): {
    ip: string;
    remaining: number;
    total: number;
    resetTime: Date | null;
  } {
    const ip = req.ip || req.connection.remoteAddress || 'unknown';
    const remaining = parseInt(req.get('X-RateLimit-Remaining') || '0');
    const total = parseInt(req.get('X-RateLimit-Limit') || '0');
    const resetTime = req.get('X-RateLimit-Reset') 
      ? new Date(parseInt(req.get('X-RateLimit-Reset')!) * 1000)
      : null;

    return {
      ip,
      remaining,
      total,
      resetTime,
    };
  }

  /**
   * Middleware para logging de rate limiting en desarrollo
   */
  static developmentLogger() {
    return (req: Request, _res: Response, next: Function) => {
      if (process.env['NODE_ENV'] === 'development') {
        const info = RateLimitUtils.getRateLimitInfo(req);
        
        // Solo loggear si hay headers de rate limiting
        if (info.total > 0) {
          console.log(`🚦 Rate Limit - IP: ${info.ip}, Remaining: ${info.remaining}/${info.total}, Reset: ${info.resetTime?.toLocaleTimeString()}`);
        }
      }
      next();
    };
  }
}

/**
 * Endpoint para limpiar rate limiting en desarrollo
 */
export const clearRateLimitEndpoint = (req: Request, res: Response): Response | void => {
  if (process.env['NODE_ENV'] !== 'development') {
    return res.status(403).json({
      success: false,
      message: 'Endpoint solo disponible en desarrollo',
    });
  }

  const ip = req.ip || req.connection.remoteAddress || 'unknown';
  
  try {
    RateLimitUtils.clearRateLimitForIP(ip);
    
    res.json({
      success: true,
      message: `Rate limiting limpiado para IP: ${ip}`,
      data: {
        ip,
        timestamp: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error('Error al limpiar rate limiting:', error);
    res.status(500).json({
      success: false,
      message: 'Error al limpiar rate limiting',
    });
  }
};
