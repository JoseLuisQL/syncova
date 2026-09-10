import {
  ORDEN_VACUNAS_OFICIAL,
  obtenerOrdenVacuna,
  compararVacunasOrdenOficial,
  formatearNombreVacunaConCodigo,
  ReporteExportService,
} from '@/services/ReporteExportService';
import { MovimientosPorEESSItem } from '@/services/ReporteService';
import { ReporteExportConfig } from '@/services/ReporteExportService';

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

describe('ReporteExportService - formatearNombreVacunaConCodigo', () => {
  it('debe concatenar código y nombre separados por un guion', () => {
    expect(formatearNombreVacunaConCodigo('AMA', '06377')).toBe('06377 - AMA');
    expect(formatearNombreVacunaConCodigo('BCG', '06420')).toBe('06420 - BCG');
    expect(formatearNombreVacunaConCodigo('Pentavalente', '17734')).toBe('17734 - Pentavalente');
    expect(formatearNombreVacunaConCodigo('ANTIRRABICA', '50814')).toBe('50814 - ANTIRRABICA');
  });

  it('no debe duplicar el código si el nombre ya lo incluye con guión o dos puntos', () => {
    expect(formatearNombreVacunaConCodigo('06377 - AMA', '06377')).toBe('06377 - AMA');
    expect(formatearNombreVacunaConCodigo('06377-AMA', '06377')).toBe('06377 - AMA');
    expect(formatearNombreVacunaConCodigo('06377: AMA', '06377')).toBe('06377 - AMA');
    expect(formatearNombreVacunaConCodigo('[06377] AMA', '06377')).toBe('06377 - AMA');
  });

  it('debe devolver solo el nombre si el código es nulo, indefinido o vacío', () => {
    expect(formatearNombreVacunaConCodigo('AMA', null)).toBe('AMA');
    expect(formatearNombreVacunaConCodigo('AMA', undefined)).toBe('AMA');
    expect(formatearNombreVacunaConCodigo('AMA', '')).toBe('AMA');
    expect(formatearNombreVacunaConCodigo('AMA', '   ')).toBe('AMA');
  });

  it('debe manejar nombres vacíos o no definidos', () => {
    expect(formatearNombreVacunaConCodigo('', '06377')).toBe('');
  });
});

describe('ReporteExportService - exportarMovimientosPorEESS con código de vacunas en Excel', () => {
  const configMock: ReporteExportConfig = {
    incluirDetalles: true,
    incluirGraficos: false,
    incluirEstadisticas: true,
    formatoFecha: 'dd/mm/yyyy',
    responsableReporte: 'Responsable Test',
  };

  it('debe incluir código y nombre separados por guion en los encabezados y mantener el orden oficial', async () => {
    const dataMock: MovimientosPorEESSItem[] = [
      {
        establecimientoId: 'est-1',
        establecimientoNombre: 'C.S. CHICMO',
        centroAcopioId: 'ca-1',
        centroAcopioNombre: 'Centro Chicmo',
        microredId: 'mr-1',
        microredNombre: 'MICRORED CHICMO',
        redId: 'red-1',
        redNombre: 'RED JOSE MARIA ARGUEDAS',
        vacunas: {
          'vac-vph': {
            vacunaId: 'vac-vph',
            vacunaNombre: 'VPH',
            vacunaCodigo: '54001',
            totalEntrega: 10,
            totalSalidas: 8,
            stock: 2,
          },
          'vac-bcg': {
            vacunaId: 'vac-bcg',
            vacunaNombre: 'BCG',
            vacunaCodigo: '06420',
            totalEntrega: 30,
            totalSalidas: 20,
            stock: 10,
          },
          'vac-ama': {
            vacunaId: 'vac-ama',
            vacunaNombre: 'AMA',
            vacunaCodigo: '06377',
            totalEntrega: 50,
            totalSalidas: 40,
            stock: 10,
          },
          'vac-penta': {
            vacunaId: 'vac-penta',
            vacunaNombre: 'Pentavalente',
            vacunaCodigo: '17734',
            totalEntrega: 25,
            totalSalidas: 15,
            stock: 10,
          },
        },
      },
    ];

    const result = await ReporteExportService.exportarMovimientosPorEESS(dataMock, configMock);
    expect(result.success).toBe(true);
    expect(result.data).toBeDefined();

    const worksheet = result.data!.workbook.getWorksheet('Movimientos por EESS')!;
    expect(worksheet).toBeDefined();

    // Fila 5 es headerRow1 (cuando no hay observaciones)
    const headerRow1 = 5;

    // Col 1: MICRORED, Col 2: DISTRITOS
    expect(worksheet.getCell(headerRow1, 1).value).toBe('MICRORED');
    expect(worksheet.getCell(headerRow1, 2).value).toBe('DISTRITOS');

    // Orden esperado según ORDEN_VACUNAS_OFICIAL:
    // 1° AMA (índice 0) -> Columna 3
    // 2° BCG (índice 2) -> Columna 6
    // 3° Pentavalente (índice 14) -> Columna 9
    // 4° VPH (índice 19) -> Columna 12
    expect(worksheet.getCell(headerRow1, 3).value).toBe('06377 - AMA');
    expect(worksheet.getCell(headerRow1, 6).value).toBe('06420 - BCG');
    expect(worksheet.getCell(headerRow1, 9).value).toBe('17734 - Pentavalente');
    expect(worksheet.getCell(headerRow1, 12).value).toBe('54001 - VPH');

    // Subencabezados en fila 6: Entrega, Salidas, Stock
    const headerRow2 = 6;
    expect(worksheet.getCell(headerRow2, 3).value).toBe('Entrega');
    expect(worksheet.getCell(headerRow2, 4).value).toBe('Salidas');
    expect(worksheet.getCell(headerRow2, 5).value).toBe('Stock');

    expect(worksheet.getCell(headerRow2, 6).value).toBe('Entrega');
    expect(worksheet.getCell(headerRow2, 7).value).toBe('Salidas');
    expect(worksheet.getCell(headerRow2, 8).value).toBe('Stock');
  });

  it('debe funcionar correctamente cuando alguna vacuna no tiene código asignado', async () => {
    const dataMock: MovimientosPorEESSItem[] = [
      {
        establecimientoId: 'est-2',
        establecimientoNombre: 'P.S. HUANCANE',
        centroAcopioId: 'ca-1',
        centroAcopioNombre: 'Centro Chicmo',
        microredId: 'mr-1',
        microredNombre: 'MICRORED CHICMO',
        redId: 'red-1',
        redNombre: 'RED JOSE MARIA ARGUEDAS',
        vacunas: {
          'vac-rotavirus': {
            vacunaId: 'vac-rotavirus',
            vacunaNombre: 'Rotavirus',
            totalEntrega: 12,
            totalSalidas: 6,
            stock: 6,
          },
          'vac-ama': {
            vacunaId: 'vac-ama',
            vacunaNombre: 'AMA',
            vacunaCodigo: '06377',
            totalEntrega: 20,
            totalSalidas: 10,
            stock: 10,
          },
        },
      },
    ];

    const result = await ReporteExportService.exportarMovimientosPorEESS(dataMock, configMock);
    expect(result.success).toBe(true);

    const worksheet = result.data!.workbook.getWorksheet('Movimientos por EESS')!;
    const headerRow1 = 5;

    // Orden esperado: 1° AMA (0), 2° Rotavirus (15)
    expect(worksheet.getCell(headerRow1, 3).value).toBe('06377 - AMA');
    expect(worksheet.getCell(headerRow1, 6).value).toBe('Rotavirus');
  });
});

