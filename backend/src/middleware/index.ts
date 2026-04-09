import express, { Application } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import compression from 'compression';
import rateLimit from 'express-rate-limit';
import { config } from '@/config/env';
import { errorHandler, notFoundHandler } from './errorHandler';
import { sanitizeInput } from './validation';

/**
 * Configuración de middlewares globales
 */
export const setupMiddlewares = (app: Application): void => {
  // Middleware de seguridad
  app.use(helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        scriptSrc: ["'self'"],
        imgSrc: ["'self'", "data:", "https:"],
      },
    },
    crossOriginEmbedderPolicy: false,
  }));

  // Configuración de CORS
  app.use(cors({
    origin: config.cors.origin.includes('*') ? true : config.cors.origin,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: [
      'Origin',
      'X-Requested-With',
      'Content-Type',
      'Accept',
      'Authorization',
      'Cache-Control',
      'Pragma',
    ],
    exposedHeaders: ['X-Total-Count'],
  }));

  // Rate limiting con configuración diferente para desarrollo
  // NOTA: app.set('trust proxy', 1) debe estar activo para que req.ip sea la IP real del cliente
  const limiter = rateLimit({
    windowMs: config.rateLimit.windowMs,
    max: config.env === 'development' ? config.rateLimit.maxRequests * 10 : config.rateLimit.maxRequests,
    message: {
      success: false,
      message: 'Demasiadas solicitudes desde esta IP, intente nuevamente más tarde',
      timestamp: new Date().toISOString(),
      retryAfter: Math.ceil(config.rateLimit.windowMs / 1000),
    },
    standardHeaders: true,
    legacyHeaders: false,
    skip: (req) => {
      // En producción, solo saltar para rutas de salud
      const healthRoutes = req.path === '/health' || req.path === '/api/health';
      return healthRoutes;
    },
  });

  app.use(limiter);

  // Compresión de respuestas
  app.use(compression({
    filter: (req, res) => {
      if (req.headers['x-no-compression']) {
        return false;
      }
      return compression.filter(req, res);
    },
    threshold: 1024, // Solo comprimir si es mayor a 1KB
  }));

  // Logging de requests
  if (config.env === 'development') {
    app.use(morgan('dev'));
  } else {
    app.use(morgan('combined'));
  }

  // Parsing de JSON y URL encoded
  app.use(express.json({
    limit: '10mb',
  }));

  app.use(express.urlencoded({
    extended: true,
    limit: '10mb',
  }));

  // Sanitización de entrada
  app.use(sanitizeInput);

  // Headers de respuesta personalizados
  app.use((req, res, next) => {
    res.setHeader('X-API-Version', config.api.version);
    res.setHeader('X-Powered-By', 'SIVAC API');
    next();
  });

  // Middleware para manejar preflight requests
  app.options('*', cors());
};

/**
 * Configuración de middlewares de manejo de errores
 * Debe llamarse después de todas las rutas
 */
export const setupErrorHandling = (app: Application): void => {
  // Middleware para rutas no encontradas
  app.use(notFoundHandler);

  // Middleware global de manejo de errores
  app.use(errorHandler);
};

/**
 * Middleware de salud del sistema
 */
export const healthCheck = (req: express.Request, res: express.Response): void => {
  const healthInfo = {
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: config.env,
    version: config.api.version,
    memory: {
      used: Math.round((process.memoryUsage().heapUsed / 1024 / 1024) * 100) / 100,
      total: Math.round((process.memoryUsage().heapTotal / 1024 / 1024) * 100) / 100,
    },
    cpu: process.cpuUsage(),
  };

  res.status(200).json({
    success: true,
    message: 'Sistema funcionando correctamente',
    data: healthInfo,
    timestamp: new Date().toISOString(),
  });
};

/**
 * Middleware para logging de requests en desarrollo
 */
export const requestLogger = (req: express.Request, res: express.Response, next: express.NextFunction): void => {
  if (config.env === 'development') {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`, {
      body: req.body,
      query: req.query,
      params: req.params,
    });
  }
  next();
};

/**
 * Middleware para agregar información de timing a las respuestas
 */
export const responseTime = (req: express.Request, res: express.Response, next: express.NextFunction): void => {
  const start = Date.now();

  res.on('finish', () => {
    const duration = Date.now() - start;
    res.setHeader('X-Response-Time', `${duration}ms`);
    
    if (config.env === 'development') {
      console.log(`${req.method} ${req.path} - ${res.statusCode} - ${duration}ms`);
    }
  });

  next();
};

/**
 * Middleware para validar Content-Type en requests POST/PUT/PATCH
 */
export const validateContentType = (req: express.Request, res: express.Response, next: express.NextFunction): void => {
  if (['POST', 'PUT', 'PATCH'].includes(req.method)) {
    const contentType = req.headers['content-type'];
    
    if (!contentType || !contentType.includes('application/json')) {
      res.status(400).json({
        success: false,
        message: 'Content-Type debe ser application/json',
        timestamp: new Date().toISOString(),
      });
      return;
    }
  }
  
  next();
};

/**
 * Middleware para agregar headers de cache
 */
export const cacheControl = (maxAge: number = 300) => {
  return (req: express.Request, res: express.Response, next: express.NextFunction): void => {
    if (req.method === 'GET') {
      res.setHeader('Cache-Control', `public, max-age=${maxAge}`);
    } else {
      res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
    }
    next();
  };
};

export default {
  setupMiddlewares,
  setupErrorHandling,
  healthCheck,
  requestLogger,
  responseTime,
  validateContentType,
  cacheControl,
};
