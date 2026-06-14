/**
 * Logger estructurado para el backend SIVAC.
 *
 * - Respeta LOG_LEVEL (error < warn < info < debug).
 * - En producción emite JSON de una línea (apto para agregadores de logs).
 * - En desarrollo emite texto legible con timestamp y nivel.
 * - Usa console.* por debajo, de modo que el logBuffer de SiBot sigue
 *   capturando los mensajes para diagnóstico.
 */
import { config } from '@/config/env';

type LogLevel = 'error' | 'warn' | 'info' | 'debug';

const LEVEL_PRIORITY: Record<LogLevel, number> = {
  error: 0,
  warn: 1,
  info: 2,
  debug: 3,
};

const currentLevel = (config.logging.level as LogLevel) in LEVEL_PRIORITY
  ? (config.logging.level as LogLevel)
  : 'info';

const threshold = LEVEL_PRIORITY[currentLevel];

const shouldLog = (level: LogLevel): boolean => LEVEL_PRIORITY[level] <= threshold;

const emit = (level: LogLevel, message: string, meta?: unknown): void => {
  if (!shouldLog(level)) return;

  const sink = level === 'error'
    ? console.error
    : level === 'warn'
      ? console.warn
      : console.log;

  if (config.env === 'production') {
    const payload: Record<string, unknown> = {
      ts: new Date().toISOString(),
      level,
      msg: message,
    };
    if (meta !== undefined) payload.meta = meta;
    sink(JSON.stringify(payload));
  } else {
    const prefix = `[${new Date().toISOString()}] ${level.toUpperCase()}`;
    if (meta !== undefined) {
      sink(`${prefix} ${message}`, meta);
    } else {
      sink(`${prefix} ${message}`);
    }
  }
};

export const logger = {
  error: (message: string, meta?: unknown) => emit('error', message, meta),
  warn: (message: string, meta?: unknown) => emit('warn', message, meta),
  info: (message: string, meta?: unknown) => emit('info', message, meta),
  debug: (message: string, meta?: unknown) => emit('debug', message, meta),
};

export default logger;
