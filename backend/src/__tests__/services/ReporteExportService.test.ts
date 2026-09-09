import {
  ORDEN_VACUNAS_OFICIAL,
  obtenerOrdenVacuna,
  compararVacunasOrdenOficial,
} from '@/services/ReporteExportService';

describe('ReporteExportService - Orden oficial de vacunas', () => {
  it('debe tener las 20 vacunas estándar en la secuencia normativa exacta', () => {
    expect(ORDEN_VACUNAS_OFICIAL).toEqual([
      'AMA',
      'APO',
      'BCG',
      'DPT',
      'DPTA',
      'Dt Adulto',
      'Dt Pediatrico',
      'HEPATITIS A',
      'HVB Adulto',
      'HVB Pediatrico',
      'Influenza Adulto',
      'Influenza Pediatrica',
      'IPV',
      'Neumococo',
      'Pentavalente',
      'Rotavirus',
      'SPR X 1 DOSIS',
      'SPR X 5 DOSIS',
      'Varicela',
      'VPH',
    ]);
  });

  it('debe ordenar una lista desordenada respetando el orden oficial de 1 a 20', () => {
    const vacunasDesordenadas = [
      'VPH',
      'Pentavalente',
      'AMA',
      'BCG',
      'Rotavirus',
      'APO',
      'DPTA',
      'DPT',
      'Dt Pediatrico',
      'Dt Adulto',
      'HVB Pediatrico',
      'HVB Adulto',
      'HEPATITIS A',
      'IPV',
      'Influenza Pediatrica',
      'Influenza Adulto',
      'Neumococo',
      'Varicela',
      'SPR X 5 DOSIS',
      'SPR X 1 DOSIS',
    ];

    const vacunasOrdenadas = [...vacunasDesordenadas].sort(compararVacunasOrdenOficial);

    expect(vacunasOrdenadas).toEqual([
      'AMA',
      'APO',
      'BCG',
      'DPT',
      'DPTA',
      'Dt Adulto',
      'Dt Pediatrico',
      'HEPATITIS A',
      'HVB Adulto',
      'HVB Pediatrico',
      'Influenza Adulto',
      'Influenza Pediatrica',
      'IPV',
      'Neumococo',
      'Pentavalente',
      'Rotavirus',
      'SPR X 1 DOSIS',
      'SPR X 5 DOSIS',
      'Varicela',
      'VPH',
    ]);
  });

  it('debe colocar cualquier vacuna nueva o adicional al final después de las 20 principales', () => {
    const vacunasConNuevas = [
      'VRS GESTANTE',
      'BCG',
      'VIRUELA',
      'AMA',
      'NIRSEVIMAB VRS RN',
      'VPH',
      'HEXA ACEL',
    ];

    const vacunasOrdenadas = [...vacunasConNuevas].sort(compararVacunasOrdenOficial);

    // AMA (0), BCG (2), VPH (19) primero, luego las nuevas alfabéticamente
    expect(vacunasOrdenadas).toEqual([
      'AMA',
      'BCG',
      'VPH',
      'HEXA ACEL',
      'NIRSEVIMAB VRS RN',
      'VIRUELA',
      'VRS GESTANTE',
    ]);
  });

  it('debe reconocer variaciones de mayúsculas/minúsculas y acentos correctamente', () => {
    expect(obtenerOrdenVacuna('ama')).toBe(0);
    expect(obtenerOrdenVacuna('dt adulto')).toBe(5);
    expect(obtenerOrdenVacuna('DT PEDIÁTRICO')).toBe(6);
    expect(obtenerOrdenVacuna('Hepatitis A')).toBe(7);
    expect(obtenerOrdenVacuna('INFLUENZA PEDIÁTRICA')).toBe(11);
    expect(obtenerOrdenVacuna('spr x 1 dosis')).toBe(16);
    expect(obtenerOrdenVacuna('spr x 5 dosis')).toBe(17);
  });
});
