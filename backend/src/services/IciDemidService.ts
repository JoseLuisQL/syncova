import ExcelJS from 'exceljs';
import { prisma } from '@/config/database';
import {
  IciDemidFilters,
  IciDemidImportPreview,
  IciDemidImportResult,
  ServiceResult,
} from '@/types';

const EXCEL_ESTABLECIMIENTO_ALIASES: Record<string, string> = {
  'C.S CHOCCEPUQUIO': 'P.S. CHOCCEPUQUIO',
  'C.S LLIUPAPUQUIO': 'P.S. LLIUPAPUQUIO',
  'P.S. CASCABAMBA': 'C.S. CASCABAMBA',
  'P.S. MATAPUQUIO': 'C.S. MATAPUQUIO',
  'C.S KAQUIABAMBA': 'C.S. KAKIABAMBA',
};

const EXCEL_VACUNA_MAPPING: Record<string, string> = {
  'VACUNA ANTIAMARILICA 10 DOSIS 1000 DIT/0.5 ML': 'AMA',
  'VACUNA ANTINEUMOCOCICA CONJUGADA 13-VALENTE 1 DOSIS': 'Neumococo',
  'VACUNA ANTIPAROTIDITIS, RUBEOLA Y SARAMPION 1 DOSIS 700 DCI/0.5 ML': 'SPR X 1 DOSIS',
  'VACUNA ANTIPAROTIDITIS, RUBEOLA Y SARAMPION 5 DOSIS 700 DCI/0.5 ML': 'SPR X 5 DOSIS',
  'VACUNA ANTIPOLIOMIELITICA 1 DOSIS 80 LF/0.5 ML': 'IPV',
  'VACUNA ANTIPOLIOMIELITICA BIVALENTE TIPO 1 Y 3 20 DOSIS': 'APO',
  'VACUNA ANTITUBERCULOSA (BCG) 10 DOSIS 3200000 U/0.1 ML': 'BCG',
  'VACUNA ANTITUBERCULOSA (BCG) 20 DOSIS -': 'BCG',
  'VACUNA ANTIVARICELA 0.7 ML 1350 UFP/0.5 ML': 'Varicela',
  'VACUNA CONTRA DIFTERIA, TETANOS Y TOS FERINA (DPT, TRIPLE) 10 DOSIS': 'DPT',
  'VACUNA CONTRA DIFTERIA, TETANOS Y TOS FERINA ACELULAR ADSORBIDA (DPTA) 1 DOSIS 2,5 LF + 5 LF + 8 UG': 'DPTA',
  'VACUNA CONTRA EL ROTAVIRUS PLV (SUSPENSION ORAL) 1 DOSIS': 'Rotavirus',
  'VACUNA CONTRA LA DIFTERIA Y TETANOS (DT ADULTO) 10 DOSIS': 'Dt Adulto',
  'VACUNA CONTRA LA HEPATITIS A 1 DOSIS 720 UI/0.5 ML': 'HEPATITIS A',
  'VACUNA CONTRA LA HEPATITIS B ADULTO 1 DOSIS 20 UG/ML': 'HVB Adulto',
  'VACUNA CONTRA LA HEPATITIS B PEDIATRICO 1 DOSIS 10 UG/0.5 ML': 'HVB Pediatrico',
  'VACUNA CONTRA LA INFLUENZA ESTACIONARIA - ADULTO 1 DOSIS (0.5 ML)': 'Influenza Adulto',
  'VACUNA CONTRA LA INFLUENZA PEDIATRICO (ANTIGENO TIPO A (H1N1 + H3N2) + ANTIGENO TIPO B 20 DOSIS 90 UG/ML': 'Influenza Pediatrica',
  'VACUNA DPT, HIB Y VHB (PENTAVALENTE) 1 DOSIS OTROS': 'Pentavalente',
  'VACUNA RECOMBINANTE TETRAVALENTE CONTRA VIRUS DEL PAPILOMA HUMANO TIPO 6, 11, 16 Y 18 (VPH) 0.5 ML': 'VPH',
  'VACUNA CONTRA DIFTERIA, TETANOS Y TOS FERINA ACELULAR ADSORBIDA (DPTA) 1 DOSIS 2,5 LF + 5 LF + 8 G': 'DPTA',
};

interface ParsedExcelRow {
  rowNumber: number;
  microRed: string;
  establecimientoExcel: string;
  establecimientoId: string | null;
  codigoMed: string;
  medicamentoOriginal: string;
  vacunaId: string | null;
  medff?: string;
  medtip?: string;
  medpet?: string;
  medest?: string;
  metrics: {
    stockFin: number;
    totalDistribu: number;
    mesRotacion: number | null;
    cpma: number | null;
    mesAbastec: number | null;
    disponibilidad?: string;
    situacion?: string;
    fecExp: Date | null;
    requerimiento: number | null;
    ajuste: number | null;
  };
  years: Map<number, { distribucionMensual: number[]; mesesDisponibles: number[] }>;
}

interface ParsedWorkbookHeaders {
  monthColumns: Array<{ index: number; year: number; month: number }>;
  stockFinColumn: number;
  totalDistribuColumn: number;
  mesRotacionColumn: number;
  cpmaColumn: number;
  mesAbastecColumn: number;
  disponibilidadColumn: number;
  situacionColumn: number;
  fecExpColumn: number;
  requerimientoColumn: number;
  ajusteColumn: number;
}

const normalizeText = (value: unknown): string => String(value ?? '')
  .trim()
  .toUpperCase()
  .normalize('NFD')
  .replace(/[\u0300-\u036f]/g, '')
  .replace(/\s+/g, ' ');

const normalizeEstablecimientoKey = (value: unknown): string => {
  const normalized = normalizeText(value)
    .replace(/\b(?:C|P)\.?\s*S\.?\b/g, '')
    .replace(/\bHOSP\.?\b/g, 'HOSPITAL')
    .replace(/[.-]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

  return normalized;
};

const parseNumber = (value: unknown): number => {
  if (value === null || value === undefined || value === '') return 0;
  if (typeof value === 'number') return Number.isFinite(value) ? value : 0;
  const normalized = String(value).replace(',', '.').trim();
  const parsed = Number(normalized);
  return Number.isFinite(parsed) ? parsed : 0;
};

const parseNullableNumber = (value: unknown): number | null => {
  if (value === null || value === undefined || value === '') return null;
  const parsed = parseNumber(value);
  return Number.isFinite(parsed) ? parsed : null;
};

const parseNullableDate = (value: unknown): Date | null => {
  if (!value) return null;
  if (value instanceof Date && !Number.isNaN(value.getTime())) return value;
  const parsed = new Date(String(value));
  return Number.isNaN(parsed.getTime()) ? null : parsed;
};

const parseExcelMonthHeader = (value: unknown): { year: number; month: number } | null => {
  if (!value) return null;

  if (typeof value === 'object' && value !== null && 'result' in value) {
    return parseExcelMonthHeader((value as { result?: unknown }).result);
  }

  if (typeof value === 'object' && value !== null && 'text' in value) {
    const textValue = (value as { text?: unknown }).text;
    if (textValue) {
      return parseExcelMonthHeader(textValue);
    }
  }

  if (value instanceof Date && !Number.isNaN(value.getTime())) {
    return {
      year: value.getUTCFullYear(),
      month: value.getUTCMonth() + 1,
    };
  }

  if (typeof value === 'number') {
    const excelBase = new Date(Date.UTC(1899, 11, 30));
    const parsed = new Date(excelBase.getTime() + value * 86400000);
    return {
      year: parsed.getUTCFullYear(),
      month: parsed.getUTCMonth() + 1,
    };
  }

  const raw = String(value).trim();
  const dotOrSlashMatch = raw.match(/^(\d{1,2})[/.-](\d{1,2})[/.-](\d{4})$/);
  if (dotOrSlashMatch) {
    return {
      year: Number(dotOrSlashMatch[3]),
      month: Number(dotOrSlashMatch[2]),
    };
  }

  const slashMatch = raw.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
  if (slashMatch) {
    return {
      year: Number(slashMatch[3]),
      month: Number(slashMatch[2]),
    };
  }

  const parsed = new Date(raw);
  if (!Number.isNaN(parsed.getTime())) {
    return {
      year: parsed.getUTCFullYear(),
      month: parsed.getUTCMonth() + 1,
    };
  }

  return null;
};

const normalizeVacunaLookupKey = (value: unknown): string => normalizeText(value)
  .replace(/�/g, 'U')
  .replace(/\b8 U\b/g, '8 UG')
  .replace(/\b8 G\b/g, '8 UG')
  .replace(/\bDPTA\b/g, 'DPTA')
  .replace(/\s+/g, ' ')
  .trim();

const HEADER_MONTH_START_COLUMN = 9;

const buildHeaderLookup = (headers: Array<string | number | Date | null | undefined>): Map<string, number> => {
  const lookup = new Map<string, number>();

  headers.forEach((header, index) => {
    if (!header || index === 0) return;
    const normalized = normalizeText(header);
    if (normalized) {
      lookup.set(normalized, index);
    }
  });

  return lookup;
};

const getRequiredColumn = (lookup: Map<string, number>, names: string[], errorMessage: string): number => {
  for (const name of names) {
    const index = lookup.get(normalizeText(name));
    if (index) {
      return index;
    }
  }

  throw new Error(errorMessage);
};

const parseWorkbookHeaders = (
  headers: Array<string | number | Date | null | undefined>,
): ParsedWorkbookHeaders => {
  const stockFinColumn = getRequiredColumn(
    buildHeaderLookup(headers),
    ['STOCK_FIN', 'STOCK FIN'],
    'Estructura inválida del Excel: no se encontró la columna STOCK_FIN.',
  );

  const monthColumns: Array<{ index: number; year: number; month: number }> = [];
  for (let index = HEADER_MONTH_START_COLUMN; index < stockFinColumn; index += 1) {
    const header = headers[index];
    const parsed = parseExcelMonthHeader(header);
    if (!parsed) {
      throw new Error(`Estructura inválida del Excel: la columna ${index} dentro del bloque mensual no contiene un mes válido.`);
    }
    monthColumns.push({
      index,
      year: parsed.year,
      month: parsed.month,
    });
  }

  if (monthColumns.length === 0) {
    throw new Error('Estructura inválida del Excel: no se detectaron columnas de meses antes de STOCK_FIN.');
  }

  const headerLookup = buildHeaderLookup(headers);

  return {
    monthColumns,
    stockFinColumn,
    totalDistribuColumn: getRequiredColumn(headerLookup, ['TOTAL DISTRIBU'], 'Estructura inválida del Excel: no se encontró la columna TOTAL DISTRIBU.'),
    mesRotacionColumn: getRequiredColumn(headerLookup, ['MES ROTACION'], 'Estructura inválida del Excel: no se encontró la columna MES ROTACION.'),
    cpmaColumn: getRequiredColumn(headerLookup, ['CPMA'], 'Estructura inválida del Excel: no se encontró la columna CPMA.'),
    mesAbastecColumn: getRequiredColumn(headerLookup, ['MES ABASTEC'], 'Estructura inválida del Excel: no se encontró la columna MES ABASTEC.'),
    disponibilidadColumn: getRequiredColumn(headerLookup, ['DISPONIBILIDAD'], 'Estructura inválida del Excel: no se encontró la columna DISPONIBILIDAD.'),
    situacionColumn: getRequiredColumn(headerLookup, ['SITUACION'], 'Estructura inválida del Excel: no se encontró la columna SITUACION.'),
    fecExpColumn: getRequiredColumn(headerLookup, ['FEC_EXP', 'FEC EXP'], 'Estructura inválida del Excel: no se encontró la columna FEC_EXP.'),
    requerimientoColumn: getRequiredColumn(headerLookup, ['REQUERIMIENTO'], 'Estructura inválida del Excel: no se encontró la columna REQUERIMIENTO.'),
    ajusteColumn: getRequiredColumn(headerLookup, ['AJUSTE'], 'Estructura inválida del Excel: no se encontró la columna AJUSTE.'),
  };
};

export class IciDemidService {
  private static async parseWorkbook(buffer: Buffer): Promise<{
    rows: ParsedExcelRow[];
    preview: IciDemidImportPreview;
  }> {
    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.load(buffer as unknown as Parameters<typeof workbook.xlsx.load>[0]);
    const worksheet = workbook.worksheets[0];

    if (!worksheet) {
      throw new Error('El archivo Excel no contiene hojas válidas');
    }

    const establecimientos = await prisma.establecimiento.findMany({
      select: { id: true, nombre: true },
    });
    const vacunas = await prisma.vacuna.findMany({
      select: { id: true, nombre: true },
    });

    const establecimientoMap = new Map<string, { id: string; nombre: string }>();
    establecimientos.forEach((item) => {
      establecimientoMap.set(normalizeText(item.nombre), item);
      establecimientoMap.set(normalizeEstablecimientoKey(item.nombre), item);
    });

    const vacunaMap = new Map<string, { id: string; nombre: string }>();
    vacunas.forEach((item) => {
      vacunaMap.set(normalizeText(item.nombre), item);
      vacunaMap.set(normalizeVacunaLookupKey(item.nombre), item);
    });

    const headerRow = worksheet.getRow(1);
    const headers = headerRow.values as Array<string | number | Date | null | undefined>;
    const parsedHeaders = parseWorkbookHeaders(headers);
    const { monthColumns } = parsedHeaders;

    const establecimientosMapeados = new Map<string, string>();
    const establecimientosNoMapeados = new Set<string>();
    const vacunasMapeadas = new Map<string, string>();
    const vacunasNoMapeadas = new Set<string>();
    const aniosDetectados = new Set<number>();
    const mesesDetectadosPorAnio = new Map<number, Set<number>>();
    const rows: ParsedExcelRow[] = [];
    const erroresDetalle: Array<{
      fila: number;
      tipo: 'establecimiento' | 'vacuna' | 'fila';
      valor: string;
      mensaje: string;
    }> = [];

    monthColumns.forEach(({ year, month }) => {
      aniosDetectados.add(year);
      if (!mesesDetectadosPorAnio.has(year)) {
        mesesDetectadosPorAnio.set(year, new Set<number>());
      }
      mesesDetectadosPorAnio.get(year)?.add(month);
    });

    worksheet.eachRow((row, rowNumber) => {
      if (rowNumber === 1) return;

      const establecimientoExcel = String(row.getCell(2).value ?? '').trim();
      const medicamentoOriginal = String(row.getCell(4).value ?? '').trim();

      if (!establecimientoExcel || !medicamentoOriginal) {
        return;
      }

      const establecimientoAlias = EXCEL_ESTABLECIMIENTO_ALIASES[normalizeText(establecimientoExcel)] ?? establecimientoExcel;
      const establecimiento = establecimientoMap.get(normalizeEstablecimientoKey(establecimientoAlias))
        ?? establecimientoMap.get(normalizeText(establecimientoAlias));
      if (establecimiento) {
        establecimientosMapeados.set(establecimientoExcel, establecimiento.nombre);
      } else {
        establecimientosNoMapeados.add(establecimientoExcel);
        erroresDetalle.push({
          fila: rowNumber,
          tipo: 'establecimiento',
          valor: establecimientoExcel,
          mensaje: `No se encontró un establecimiento equivalente en la base de datos para "${establecimientoExcel}".`,
        });
      }

      const normalizedMedicamento = normalizeVacunaLookupKey(medicamentoOriginal);
      const mappedVacunaNombre = EXCEL_VACUNA_MAPPING[normalizedMedicamento];
      const vacuna = mappedVacunaNombre
        ? vacunaMap.get(normalizeVacunaLookupKey(mappedVacunaNombre)) ?? vacunaMap.get(normalizeText(mappedVacunaNombre))
        : null;
      if (vacuna) {
        vacunasMapeadas.set(medicamentoOriginal, vacuna.nombre);
      } else {
        vacunasNoMapeadas.add(medicamentoOriginal);
        erroresDetalle.push({
          fila: rowNumber,
          tipo: 'vacuna',
          valor: medicamentoOriginal,
          mensaje: `No se encontró una vacuna equivalente en el catálogo para "${medicamentoOriginal}".`,
        });
      }

      const years = new Map<number, { distribucionMensual: number[]; mesesDisponibles: number[] }>();
      monthColumns.forEach(({ index, year, month }) => {
        if (!years.has(year)) {
          years.set(year, {
            distribucionMensual: Array.from({ length: 12 }, () => 0),
            mesesDisponibles: Array.from({ length: 12 }, () => 0),
          });
        }
        const current = years.get(year)!;
        current.distribucionMensual[month - 1] = Math.trunc(parseNumber(row.getCell(index).value));
        current.mesesDisponibles[month - 1] = month;
      });

      rows.push({
        rowNumber,
        microRed: String(row.getCell(1).value ?? '').trim(),
        establecimientoExcel,
        establecimientoId: establecimiento?.id ?? null,
        codigoMed: String(row.getCell(3).value ?? '').trim(),
        medicamentoOriginal,
        vacunaId: vacuna?.id ?? null,
        medff: String(row.getCell(5).value ?? '').trim() || undefined,
        medtip: String(row.getCell(6).value ?? '').trim() || undefined,
        medpet: String(row.getCell(7).value ?? '').trim() || undefined,
        medest: String(row.getCell(8).value ?? '').trim() || undefined,
        metrics: {
          stockFin: Math.trunc(parseNumber(row.getCell(parsedHeaders.stockFinColumn).value)),
          totalDistribu: Math.trunc(parseNumber(row.getCell(parsedHeaders.totalDistribuColumn).value)),
          mesRotacion: parseNullableNumber(row.getCell(parsedHeaders.mesRotacionColumn).value),
          cpma: parseNullableNumber(row.getCell(parsedHeaders.cpmaColumn).value),
          mesAbastec: parseNullableNumber(row.getCell(parsedHeaders.mesAbastecColumn).value),
          disponibilidad: String(row.getCell(parsedHeaders.disponibilidadColumn).value ?? '').trim() || undefined,
          situacion: String(row.getCell(parsedHeaders.situacionColumn).value ?? '').trim() || undefined,
          fecExp: parseNullableDate(row.getCell(parsedHeaders.fecExpColumn).value),
          requerimiento: parseNullableNumber(row.getCell(parsedHeaders.requerimientoColumn).value),
          ajuste: parseNullableNumber(row.getCell(parsedHeaders.ajusteColumn).value),
        },
        years,
      });
    });

    return {
      rows,
      preview: {
        totalFilasExcel: Math.max(worksheet.rowCount - 1, 0),
        filasValidas: rows.length,
        vacunasMapeadas: Array.from(vacunasMapeadas.entries()).map(([excel, sistema]) => ({ excel, sistema })),
        vacunasNoMapeadas: Array.from(vacunasNoMapeadas.values()).sort(),
        establecimientosMapeados: Array.from(establecimientosMapeados.entries()).map(([excel, sistema]) => ({ excel, sistema })),
        establecimientosNoMapeados: Array.from(establecimientosNoMapeados.values()).sort(),
        aniosDetectados: Array.from(aniosDetectados.values()).sort(),
        mesesDetectadosPorAnio: Array.from(mesesDetectadosPorAnio.entries()).reduce<Record<string, number[]>>((acc, [year, months]) => {
          acc[String(year)] = Array.from(months.values()).sort((a, b) => a - b);
          return acc;
        }, {}),
        erroresDetalle: erroresDetalle.sort((a, b) => a.fila - b.fila),
      },
    };
  }

  static async previewImport(file: Express.Multer.File): Promise<ServiceResult<IciDemidImportPreview>> {
    try {
      if (!file?.buffer) {
        return { success: false, error: 'Debe adjuntar un archivo Excel válido', statusCode: 400 };
      }

      const { preview } = await this.parseWorkbook(file.buffer);
      return { success: true, data: preview };
    } catch (error) {
      console.error('Error al previsualizar ICI DEMID:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Error al analizar archivo Excel', statusCode: 500 };
    }
  }

  static async importFromExcel(file: Express.Multer.File, userId?: string): Promise<ServiceResult<IciDemidImportResult>> {
    try {
      if (!file?.buffer) {
        return { success: false, error: 'Debe adjuntar un archivo Excel válido', statusCode: 400 };
      }

      const { rows, preview } = await this.parseWorkbook(file.buffer);

      if (preview.establecimientosNoMapeados.length > 0) {
        return {
          success: false,
          error: 'Existen establecimientos sin mapear en el archivo Excel',
          data: {
            ...preview,
            creados: 0,
            actualizados: 0,
            omitidos: rows.length,
          },
          statusCode: 400,
        };
      }

      let creados = 0;
      let actualizados = 0;
      let omitidos = 0;
      const operaciones = rows.flatMap((row) => {
        if (!row.establecimientoId || !row.vacunaId) {
          omitidos += 1;
          return [];
        }

        return Array.from(row.years.entries()).map(([anio, values]) => ({
          establecimientoId: row.establecimientoId as string,
          vacunaId: row.vacunaId as string,
          anio,
          payload: {
            anio,
            microRed: row.microRed,
            codigoMed: row.codigoMed,
            medicamentoOriginal: row.medicamentoOriginal,
            medff: row.medff,
            medtip: row.medtip,
            medpet: row.medpet,
            medest: row.medest,
            distribucionMensual: values.distribucionMensual,
            mesesDisponibles: values.mesesDisponibles,
            stockFin: row.metrics.stockFin,
            totalDistribu: row.metrics.totalDistribu,
            mesRotacion: row.metrics.mesRotacion ? Math.trunc(row.metrics.mesRotacion) : null,
            cpma: row.metrics.cpma,
            mesAbastec: row.metrics.mesAbastec,
            disponibilidad: row.metrics.disponibilidad,
            situacion: row.metrics.situacion,
            fecExp: row.metrics.fecExp,
            requerimiento: row.metrics.requerimiento,
            ajuste: row.metrics.ajuste,
            archivoNombre: file.originalname,
          },
        }));
      });

      const operacionesUnicasMap = new Map<string, (typeof operaciones)[number]>();
      for (const operacion of operaciones) {
        const key = `${operacion.establecimientoId}-${operacion.vacunaId}-${operacion.anio}`;
        operacionesUnicasMap.set(key, operacion);
      }
      const operacionesUnicas = Array.from(operacionesUnicasMap.values());

      const existentes = await prisma.iciDemidRegistro.findMany({
        where: {
          OR: operacionesUnicas.map((operacion) => ({
            establecimientoId: operacion.establecimientoId,
            vacunaId: operacion.vacunaId,
            anio: operacion.anio,
          })),
        },
        select: {
          id: true,
          establecimientoId: true,
          vacunaId: true,
          anio: true,
        },
      });

      const existentesMap = new Map(
        existentes.map((item) => [`${item.establecimientoId}-${item.vacunaId}-${item.anio}`, item.id]),
      );

      const queries = operacionesUnicas.map((operacion) => {
        const key = `${operacion.establecimientoId}-${operacion.vacunaId}-${operacion.anio}`;
        const existingId = existentesMap.get(key);

        if (existingId) {
          actualizados += 1;
          return prisma.iciDemidRegistro.update({
            where: { id: existingId },
            data: {
              ...operacion.payload,
              establecimiento: { connect: { id: operacion.establecimientoId } },
              vacuna: { connect: { id: operacion.vacunaId } },
              ...(userId ? { usuario: { connect: { id: userId } } } : { usuario: { disconnect: true } }),
            },
          });
        }

        creados += 1;
        return prisma.iciDemidRegistro.create({
          data: {
            ...operacion.payload,
            establecimiento: { connect: { id: operacion.establecimientoId } },
            vacuna: { connect: { id: operacion.vacunaId } },
            ...(userId ? { usuario: { connect: { id: userId } } } : {}),
          },
        });
      });

      const batchSize = 100;
      for (let index = 0; index < queries.length; index += batchSize) {
        await prisma.$transaction(queries.slice(index, index + batchSize));
      }

      omitidos += operaciones.length - operacionesUnicas.length;

      return {
        success: true,
        data: {
          ...preview,
          creados,
          actualizados,
          omitidos,
        },
      };
    } catch (error) {
      console.error('Error al importar ICI DEMID:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Error al importar archivo Excel', statusCode: 500 };
    }
  }

  static async getAniosDisponibles(): Promise<ServiceResult<{ anios: number[] }>> {
    try {
      const result = await prisma.iciDemidRegistro.findMany({
        distinct: ['anio'],
        select: { anio: true },
        orderBy: { anio: 'asc' },
      });

      return {
        success: true,
        data: {
          anios: result.map((item) => item.anio),
        },
      };
    } catch (error) {
      console.error('Error al obtener años ICI DEMID:', error);
      return { success: false, error: 'Error al obtener años disponibles', statusCode: 500 };
    }
  }

  static async getAll(filters: IciDemidFilters): Promise<ServiceResult<{ registros: any[]; total: number }>> {
    try {
      const {
        anio,
        establecimientoId,
        vacunaId,
        centroAcopioId,
        centroAcopioIds,
        page = 1,
        limit = 200,
      } = filters;

      const where: any = {};
      if (anio) where.anio = anio;
      if (establecimientoId) where.establecimientoId = establecimientoId;
      if (vacunaId) where.vacunaId = vacunaId;
      if (centroAcopioIds?.length) {
        where.establecimiento = { centroAcopioId: { in: centroAcopioIds } };
      } else if (centroAcopioId) {
        where.establecimiento = { centroAcopioId };
      }

      const skip = (page - 1) * limit;
      const [registros, total] = await Promise.all([
        prisma.iciDemidRegistro.findMany({
          where,
          include: {
            establecimiento: {
              include: {
                centroAcopio: {
                  select: {
                    id: true,
                    nombre: true,
                    codigo: true,
                  },
                },
              },
            },
            vacuna: true,
          },
          orderBy: [
            { establecimiento: { nombre: 'asc' } },
            { vacuna: { nombre: 'asc' } },
          ],
          skip,
          take: limit,
        }),
        prisma.iciDemidRegistro.count({ where }),
      ]);

      return {
        success: true,
        data: {
          registros,
          total,
        },
      };
    } catch (error) {
      console.error('Error al listar ICI DEMID:', error);
      return { success: false, error: 'Error al obtener registros ICI DEMID', statusCode: 500 };
    }
  }
}

export default IciDemidService;
