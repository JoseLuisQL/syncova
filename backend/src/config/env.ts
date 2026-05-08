import dotenv from 'dotenv';
import Joi from 'joi';

// Cargar variables de entorno
dotenv.config();

// Esquema de validación para variables de entorno
const envSchema = Joi.object({
  NODE_ENV: Joi.string()
    .valid('development', 'production', 'test')
    .default('development'),
  
  PORT: Joi.number()
    .port()
    .default(3001),
  
  DATABASE_URL: Joi.string()
    .required()
    .description('URL de conexión a PostgreSQL'),
  
  JWT_SECRET: Joi.string()
    .min(32)
    .required()
    .description('Clave secreta para JWT'),
  
  JWT_EXPIRES_IN: Joi.string()
    .default('24h')
    .description('Tiempo de expiración del JWT'),
  
  CORS_ORIGIN: Joi.string()
    .default('*')
    .description('Orígenes permitidos para CORS (separados por comas)'),
  
  RATE_LIMIT_WINDOW_MS: Joi.number()
    .positive()
    .default(900000)
    .description('Ventana de tiempo para rate limiting en ms'),
  
  RATE_LIMIT_MAX_REQUESTS: Joi.number()
    .positive()
    .default(5000)
    .description('Máximo número de requests por ventana'),

  TRUST_PROXY: Joi.alternatives()
    .try(Joi.number().integer().min(0), Joi.boolean(), Joi.string())
    .default(1)
    .description('Configuración Express trust proxy para despliegues detrás de reverse proxy'),
  
  LOG_LEVEL: Joi.string()
    .valid('error', 'warn', 'info', 'debug')
    .default('info'),
  
  API_VERSION: Joi.string()
    .default('v1'),
  
  UPLOAD_MAX_SIZE: Joi.number()
    .positive()
    .default(5242880)
    .description('Tamaño máximo de archivo en bytes'),
  
  UPLOAD_ALLOWED_TYPES: Joi.string()
    .default('image/jpeg,image/png,application/pdf,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'),
  
  ALERT_EMAIL_ENABLED: Joi.boolean()
    .default(false),
  
  ALERT_EMAIL_FROM: Joi.string()
    .email()
    .when('ALERT_EMAIL_ENABLED', {
      is: true,
      then: Joi.required(),
      otherwise: Joi.optional()
    }),
  
  ALERT_EMAIL_TO: Joi.string()
    .email()
    .when('ALERT_EMAIL_ENABLED', {
      is: true,
      then: Joi.required(),
      otherwise: Joi.optional()
    }),
  
  BACKUP_ENABLED: Joi.boolean()
    .default(false),
  
  BACKUP_SCHEDULE: Joi.string()
    .default('0 2 * * *'),
  
  BACKUP_RETENTION_DAYS: Joi.number()
    .positive()
    .default(30)
}).unknown();

// Validar variables de entorno
const { error, value: envVars } = envSchema.validate(process.env);

if (error) {
  throw new Error(`❌ Error en configuración de variables de entorno: ${error.message}`);
}

const normalizeTrustProxy = (value: unknown): boolean | number | string => {
  if (typeof value !== 'string') {
    return value as boolean | number;
  }

  const normalized = value.trim();
  if (normalized === 'true') return true;
  if (normalized === 'false') return false;

  const numericValue = Number(normalized);
  if (normalized && Number.isInteger(numericValue)) {
    return numericValue;
  }

  return normalized;
};

// Exportar configuración tipada
export const config = {
  env: envVars.NODE_ENV as 'development' | 'production' | 'test',
  port: envVars.PORT as number,
  database: {
    url: envVars.DATABASE_URL as string,
  },
  jwt: {
    secret: envVars.JWT_SECRET as string,
    expiresIn: envVars.JWT_EXPIRES_IN as string,
  },
  cors: {
    origin: (envVars.CORS_ORIGIN as string).split(',').map(origin => origin.trim()),
  },
  rateLimit: {
    windowMs: envVars.RATE_LIMIT_WINDOW_MS as number,
    maxRequests: envVars.RATE_LIMIT_MAX_REQUESTS as number,
  },
  trustProxy: normalizeTrustProxy(envVars.TRUST_PROXY),
  logging: {
    level: envVars.LOG_LEVEL as string,
  },
  api: {
    version: envVars.API_VERSION as string,
  },
  upload: {
    maxSize: envVars.UPLOAD_MAX_SIZE as number,
    allowedTypes: (envVars.UPLOAD_ALLOWED_TYPES as string).split(','),
  },
  alerts: {
    emailEnabled: envVars.ALERT_EMAIL_ENABLED as boolean,
    emailFrom: envVars.ALERT_EMAIL_FROM as string,
    emailTo: envVars.ALERT_EMAIL_TO as string,
  },
  backup: {
    enabled: envVars.BACKUP_ENABLED as boolean,
    schedule: envVars.BACKUP_SCHEDULE as string,
    retentionDays: envVars.BACKUP_RETENTION_DAYS as number,
  },
} as const;

// Validar configuración crítica en producción
if (config.env === 'production') {
  if (config.jwt.secret.length < 32) {
    throw new Error('❌ JWT_SECRET debe tener al menos 32 caracteres en producción');
  }
  
  if (!config.database.url.includes('postgresql://')) {
    throw new Error('❌ DATABASE_URL debe ser una URL válida de PostgreSQL');
  }
}

console.log(`✅ Configuración cargada para entorno: ${config.env}`);

export default config;
