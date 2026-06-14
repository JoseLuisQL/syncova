import {
  getCentroAcopioPorNombre,
  getColoresCentroAcopioExcel,
  ordenarEstablecimientos,
  ORDEN_ESTABLECIMIENTOS,
} from '@/utils/centroAcopioUtils';

describe('centroAcopioUtils', () => {
  describe('getCentroAcopioPorNombre', () => {
    it('devuelve el centro de acopio mapeado para un establecimiento conocido', () => {
      expect(getCentroAcopioPorNombre('C.S. HUANCABAMBA')).toBe('HUANCABAMBA');
      expect(getCentroAcopioPorNombre('P.S. SACCLAYA')).toBe('HUANCABAMBA');
    });

    it('devuelve DEFAULT para establecimientos no mapeados', () => {
      expect(getCentroAcopioPorNombre('ESTABLECIMIENTO INEXISTENTE')).toBe('DEFAULT');
      expect(getCentroAcopioPorNombre('')).toBe('DEFAULT');
    });
  });

  describe('getColoresCentroAcopioExcel', () => {
    it('devuelve un objeto de colores para un centro conocido o el DEFAULT', () => {
      const colores = getColoresCentroAcopioExcel('HUANCABAMBA');
      expect(colores).toBeDefined();
      expect(typeof colores).toBe('object');
    });

    it('cae en DEFAULT cuando el centro no existe', () => {
      const fallback = getColoresCentroAcopioExcel('NO_EXISTE');
      const def = getColoresCentroAcopioExcel('DEFAULT');
      expect(fallback).toEqual(def);
    });
  });

  describe('ordenarEstablecimientos', () => {
    it('ordena según el orden predefinido cuando ambos están en la lista', () => {
      const entrada = [
        { nombre: 'C.S. ANDAHUAYLAS' },
        { nombre: 'HOSPITAL ANDAHUAYLAS' },
      ];
      const ordenado = ordenarEstablecimientos(entrada);
      expect(ordenado[0].nombre).toBe('HOSPITAL ANDAHUAYLAS');
      expect(ordenado[1].nombre).toBe('C.S. ANDAHUAYLAS');
    });

    it('coloca los establecimientos conocidos antes que los desconocidos', () => {
      const entrada = [
        { nombre: 'ZZZ ESTABLECIMIENTO DESCONOCIDO' },
        { nombre: 'HOSPITAL ANDAHUAYLAS' },
      ];
      const ordenado = ordenarEstablecimientos(entrada);
      expect(ordenado[0].nombre).toBe('HOSPITAL ANDAHUAYLAS');
      expect(ordenado[1].nombre).toBe('ZZZ ESTABLECIMIENTO DESCONOCIDO');
    });

    it('ordena alfabéticamente los desconocidos entre sí', () => {
      const entrada = [
        { nombre: 'ZETA DESCONOCIDO' },
        { nombre: 'ALFA DESCONOCIDO' },
      ];
      const ordenado = ordenarEstablecimientos(entrada);
      expect(ordenado[0].nombre).toBe('ALFA DESCONOCIDO');
      expect(ordenado[1].nombre).toBe('ZETA DESCONOCIDO');
    });

    it('maneja nombres null/undefined sin lanzar errores', () => {
      const entrada = [
        { nombre: null },
        { nombre: 'HOSPITAL ANDAHUAYLAS' },
        { nombre: undefined },
      ];
      expect(() => ordenarEstablecimientos(entrada)).not.toThrow();
      const ordenado = ordenarEstablecimientos(entrada);
      expect(ordenado[0].nombre).toBe('HOSPITAL ANDAHUAYLAS');
    });
  });

  describe('ORDEN_ESTABLECIMIENTOS', () => {
    it('es un array no vacío y sin duplicados', () => {
      expect(Array.isArray(ORDEN_ESTABLECIMIENTOS)).toBe(true);
      expect(ORDEN_ESTABLECIMIENTOS.length).toBeGreaterThan(0);
      const unicos = new Set(ORDEN_ESTABLECIMIENTOS);
      expect(unicos.size).toBe(ORDEN_ESTABLECIMIENTOS.length);
    });
  });
});
