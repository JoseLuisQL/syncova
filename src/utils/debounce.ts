/**
 * Función de debounce para retrasar la ejecución de una función
 * hasta que haya pasado un tiempo determinado sin que se vuelva a llamar
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  delay: number
): (...args: Parameters<T>) => void {
  let timeoutId: NodeJS.Timeout;

  return (...args: Parameters<T>) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func(...args), delay);
  };
}

/**
 * Función de debounce que devuelve una promesa
 * Útil para operaciones asíncronas
 */
export function debounceAsync<T extends (...args: any[]) => Promise<any>>(
  func: T,
  delay: number
): (...args: Parameters<T>) => Promise<ReturnType<T>> {
  let timeoutId: NodeJS.Timeout;
  let resolvePromise: (value: ReturnType<T>) => void;
  let rejectPromise: (reason?: any) => void;

  return (...args: Parameters<T>): Promise<ReturnType<T>> => {
    return new Promise((resolve, reject) => {
      clearTimeout(timeoutId);
      resolvePromise = resolve;
      rejectPromise = reject;

      timeoutId = setTimeout(async () => {
        try {
          const result = await func(...args);
          resolvePromise(result);
        } catch (error) {
          rejectPromise(error);
        }
      }, delay);
    });
  };
}
