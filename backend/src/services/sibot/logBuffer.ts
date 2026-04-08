/**
 * Log Buffer Interceptor for SaBot
 * 
 * Intercepta los logs generados en el servidor y los guarda en un Ring Buffer
 * en memoria, permitiendo que AI los lea para diagnóstico de errores o monitoreo.
 */

interface LogEntry {
  timestamp: string;
  level: 'info' | 'warn' | 'error';
  message: string;
}

class LogBufferService {
  private static instance: LogBufferService;
  private readonly MAX_LOGS = 200;
  private logs: LogEntry[] = [];
  private isIntercepted = false;

  // Guarda referencias a los métodos originales
  private originalConsoleLog = console.log;
  private originalConsoleWarn = console.warn;
  private originalConsoleError = console.error;

  private constructor() {}

  public static getInstance(): LogBufferService {
    if (!LogBufferService.instance) {
      LogBufferService.instance = new LogBufferService();
    }
    return LogBufferService.instance;
  }

  private pushLog(level: 'info' | 'warn' | 'error', args: any[]) {
    try {
      const message = args.map(arg => {
        if (typeof arg === 'string') return arg;
        if (arg instanceof Error) return `${arg.message}\n${arg.stack}`;
        try { return JSON.stringify(arg); } catch { return String(arg); }
      }).join(' ');

      this.logs.push({
        timestamp: new Date().toISOString(),
        level,
        message
      });

      // Mantener limite (Ring Buffer)
      if (this.logs.length > this.MAX_LOGS) {
        this.logs.shift();
      }
    } catch (e) {
      // Evitar que el interceptor rompa la app
    }
  }

  /**
   * Sobrescribe los objetos de la consola nativa para capturar la salida.
   */
  public overrideConsole() {
    if (this.isIntercepted) return;
    this.isIntercepted = true;

    console.log = (...args: any[]) => {
      this.pushLog('info', args);
      this.originalConsoleLog.apply(console, args);
    };

    console.warn = (...args: any[]) => {
      this.pushLog('warn', args);
      this.originalConsoleWarn.apply(console, args);
    };

    console.error = (...args: any[]) => {
      this.pushLog('error', args);
      this.originalConsoleError.apply(console, args);
    };
  }

  /**
   * Devuelve los ultimos Logs.
   */
  public getRecentLogs(limit: number = 50): LogEntry[] {
    return this.logs.slice(-limit);
  }
}

export const logBuffer = LogBufferService.getInstance();
