import { logger } from '@/utils/logger';

describe('logger', () => {
  let logSpy: jest.SpyInstance;
  let warnSpy: jest.SpyInstance;
  let errorSpy: jest.SpyInstance;

  beforeEach(() => {
    logSpy = jest.spyOn(console, 'log').mockImplementation(() => {});
    warnSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});
    errorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    logSpy.mockRestore();
    warnSpy.mockRestore();
    errorSpy.mockRestore();
  });

  it('expone los métodos error/warn/info/debug', () => {
    expect(typeof logger.error).toBe('function');
    expect(typeof logger.warn).toBe('function');
    expect(typeof logger.info).toBe('function');
    expect(typeof logger.debug).toBe('function');
  });

  it('enruta error() a console.error', () => {
    logger.error('algo falló');
    expect(errorSpy).toHaveBeenCalledTimes(1);
  });

  it('enruta warn() a console.warn', () => {
    logger.warn('cuidado');
    expect(warnSpy).toHaveBeenCalledTimes(1);
  });

  it('incluye el mensaje en la salida', () => {
    logger.error('mensaje-unico-de-prueba');
    const call = errorSpy.mock.calls[0];
    expect(JSON.stringify(call)).toContain('mensaje-unico-de-prueba');
  });

  it('error() siempre se emite (nivel más alto), independientemente del LOG_LEVEL', () => {
    logger.error('crítico');
    expect(errorSpy).toHaveBeenCalled();
  });
});
