import ExcelJS from 'exceljs';
import { prisma } from '@/config/database';
import {
  IciDemidFilters,
  IciDemidImportPreview,
  IciDemidImportResult,
  ServiceResult,
} from '@/types';

const EXCEL_ESTABLECIMIENTO_ALIASES: Record<string, string> = {
  'CHOCCEPUQUIO': 'CHOCCEPUQUIO',
  'LLIUPAPUQUIO': 'LLIUPAPUQUIO',
  'CASCABAMBA': 'CASCABAMBA',
  'MATAPUQUIO': 'MATAPUQUIO',
  'KAQUIABAMBA': 'KAKIABAMBA',
  'KAKIABAMBA': 'KAKIABAMBA',
  'C.S CHOCCEPUQUIO': 'P.S. CHOCCEPUQUIO',
  'C.S. CHOCCEPUQUIO': 'P.S. CHOCCEPUQUIO',
  'C.S LLIUPAPUQUIO': 'P.S. LLIUPAPUQUIO',
  'C.S. LLIUPAPUQUIO': 'P.S. LLIUPAPUQUIO',
  'P.S. CASCABAMBA': 'C.S. CASCABAMBA',
  'P.S CASCABAMBA': 'C.S. CASCABAMBA',
  'P.S. MATAPUQUIO': 'C.S. MATAPUQUIO',
  'P.S MATAPUQUIO': 'C.S. MATAPUQUIO',
  'C.S KAQUIABAMBA': 'C.S. KAKIABAMBA',
  'C.S. KAQUIABAMBA': 'C.S. KAKIABAMBA',
  'P.S. KAQUIABAMBA': 'C.S. KAKIABAMBA',
  'P.S KAQUIABAMBA': 'C.S. KAKIABAMBA',
};

const EXCEL_VACUNA_MAPPING: Record<string, string> = {
  // AMA
  'VACUNA ANTIAMARILICA 10 DOSIS 1000 DIT/0.5 ML': 'AMA',
  'VACUNA ANTIAMARILICA 1000 DIT/0.5 ML 10 DOSIS INYECT': 'AMA',
  'VACUNA ANTIAMARILICA 1000 DIT/0.5 ML 10 DOSIS INY': 'AMA',
  'VACUNA ANTIAMARILICA 1000 DL/0.5 ML INY 10 DOSIS': 'AMA',

  // Neumococo
  'VACUNA ANTINEUMOCOCICA CONJUGADA 13-VALENTE 1 DOSIS': 'Neumococo',
  'VACUNA ANTINEUMOCOCICA CONJUGADA 13-VALENTE 1 DOSIS INYECT': 'Neumococo',
  'VACUNA ANTINEUMOCOCICA CONJUGADA 13-VALENTE 1 DOSIS INY': 'Neumococo',
  'VACUNA CONJUGADA NEUMOCOCICA 13-VALENTE (CRM197) 1 DOSIS INYECT': 'Neumococo',
  'VACUNA ANTINEUMOCOCICA CONJUGADA 13-VALENTE INY 1 DOSIS': 'Neumococo',

  // SPR
  'VACUNA ANTIPAROTIDITIS, RUBEOLA Y SARAMPION 1 DOSIS 700 DCI/0.5 ML': 'SPR X 1 DOSIS',
  'VACUNA ANTIPAROTIDITIS, RUBEOLA Y SARAMPION 700 DCI/0.5 ML 1 DOSIS INY': 'SPR X 1 DOSIS',
  'VACUNA ANTIPAROTIDITIS, RUBEOLA Y SARAMPION 700 DCI/0.5 ML 1 DOSIS INYECT': 'SPR X 1 DOSIS',
  'VACUNA ANTIPAROTIDITIS RUBEOLA Y SARAMPION 700 DCI/0.5 ML INY 1 DOSIS': 'SPR X 1 DOSIS',
  'VACUNA ANTIPAROTIDITIS, RUBEOLA Y SARAMPION 5 DOSIS 700 DCI/0.5 ML': 'SPR X 5 DOSIS',
  'VACUNA ANTIPAROTIDITIS, RUBEOLA Y SARAMPION 700 DCI/0.5 ML 5 DOSIS INY': 'SPR X 5 DOSIS',
  'VACUNA ANTIPAROTIDITIS, RUBEOLA Y SARAMPION 700 DCI/0.5 ML 5 DOSIS INYECT': 'SPR X 5 DOSIS',
  'VACUNA ANTIPAROTIDITIS RUBEOLA Y SARAMPION 5 DOSIS': 'SPR X 5 DOSIS',

  // IPV
  'VACUNA ANTIPOLIOMIELITICA 1 DOSIS 80 LF/0.5 ML': 'IPV',
  'VACUNA ANTIPOLIOMIELITICA 80 LF/0.5 ML 1 DOSIS INYECT': 'IPV',
  'VACUNA ANTIPOLIOMIELITICA 80 LF/0.5 ML 1 DOSIS INY': 'IPV',
  'VACUNA ANTIPOLIOMIELITICA 80 LF/0.5 ML INY 1 DOSIS': 'IPV',

  // APO
  'VACUNA ANTIPOLIOMIELITICA BIVALENTE TIPO 1 Y 3 20 DOSIS': 'APO',
  'VACUNA ANTIPOLIOMIELITICA BIVALENTE TIPO 1 Y 3 20 DOSIS SUSPEN': 'APO',
  'VACUNA ANTIPOLIOMIELITICA BIVALENTE TIPO 1 Y 3 (ORAL) 10 DOSIS SUSPEN': 'APO',
  'VACUNA ANTIPOLIOMIELITICA BIVALENTE TIPO 1 Y 3 SUSPENSION ORAL 20 DOSIS': 'APO',

  // BCG
  'VACUNA ANTITUBERCULOSA (BCG) 10 DOSIS 3200000 U/0.1 ML': 'BCG',
  'VACUNA ANTITUBERCULOSA (BCG) 3200000 U/0.1 ML 10 DOSIS INYECT': 'BCG',
  'VACUNA ANTITUBERCULOSA (BCG) 3200000 U/0.1 ML 10 DOSIS INY': 'BCG',
  'VACUNA ANTITUBERCULOSA (BCG) 3200000 U/0.1 ML INY 10 DOSIS': 'BCG',
  'VACUNA ANTITUBERCULOSA (BCG) 20 DOSIS -': 'BCG',
  'VACUNA ANTITUBERCULOSA (BCG) - 20 DOSIS INYECT': 'BCG',
  'VACUNA ANTITUBERCULOSA (BCG) 20 DOSIS INYECT': 'BCG',

  // Varicela
  'VACUNA ANTIVARICELA 0.7 ML 1350 UFP/0.5 ML': 'Varicela',
  'VACUNA ANTIVARICELA 1350 UFP/0.5 ML 0.7 ML INYECT': 'Varicela',
  'VACUNA ANTIVARICELA 1350 UFP/0.5 ML 0.7 ML INY': 'Varicela',
  'VACUNA ANTIVARICELA 1350 UFP/0.5 ML INY 0.7 ML': 'Varicela',

  // DPT
  'VACUNA CONTRA DIFTERIA, TETANOS Y TOS FERINA (DPT, TRIPLE) 10 DOSIS': 'DPT',
  'VACUNA CONTRA DIFTERIA, TETANOS Y TOS FERINA (DPT, TRIPLE) 10 DOSIS I': 'DPT',
  'VACUNA CONTRA DIFTERIA, TETANOS Y TOS FERINA (DPT, TRIPLE) 10 DOSIS INYECT': 'DPT',
  'VACUNA CONTRA DIFTERIA TETANOS Y TOS FERINA (DPT TRIPLE) INY 10 DOSIS': 'DPT',

  // DPTA
  'VACUNA CONTRA DIFTERIA, TETANOS Y TOS FERINA ACELULAR ADSORBIDA (DPTA)': 'DPTA',
  'VACUNA CONTRA DIFTERIA, TETANOS Y TOS FERINA ACELULAR ADSORBIDA (DPTA) 1 DOSIS 2,5 LF + 5 LF + 8 UG': 'DPTA',
  'VACUNA CONTRA DIFTERIA, TETANOS Y TOS FERINA ACELULAR ADSORBIDA (DPTA) 1 DOSIS 2,5 LF + 5 LF + 8 G': 'DPTA',
  'VACUNA CONTRA DIFTERIA, TETANOS Y TOS FERINA ACELULAR ADSORBIDA (DPTA) 1 DOSIS 2.5 LF + 5 LF + 8 UG': 'DPTA',
  'VACUNA DPTA ACELULAR': 'DPTA',

  // Rotavirus
  'VACUNA CONTRA EL ROTAVIRUS PLV (SUSPENSION ORAL) 1 DOSIS': 'Rotavirus',
  'VACUNA CONTRA EL ROTAVIRUS PLV (SUSPENSION ORAL) 1 DOSIS SUSPEN': 'Rotavirus',
  'VACUNA CONTRA EL ROTAVIRUS PLV 1 DOSIS': 'Rotavirus',

  // SR
  'VACUNA CONTRA EL SARAMPION Y LA RUBEOLA (SR) 1 DOSIS INYECT': 'SR',
  'VACUNA CONTRA EL SARAMPION Y LA RUBEOLA (SR) 10 DOSIS INYECT': 'SR',
  'VACUNA CONTRA EL SARAMPION Y LA RUBEOLA (SR) 1 DOSIS INY': 'SR',
  'VACUNA CONTRA EL SARAMPION Y LA RUBEOLA (SR) 10 DOSIS INY': 'SR',
  'VACUNA SARAMPION Y RUBEOLA (SR)': 'SR',

  // DT Adulto
  'VACUNA CONTRA LA DIFTERIA Y TETANOS (DT ADULTO) 10 DOSIS': 'Dt Adulto',
  'VACUNA CONTRA LA DIFTERIA Y TETANOS (DT ADULTO) 10 DOSIS INYECT': 'Dt Adulto',
  'VACUNA CONTRA LA DIFTERIA Y TETANOS (DT ADULTO) 10 DOSIS INY': 'Dt Adulto',
  'VACUNA CONTRA LA DIFTERIA Y TETANOS (DT ADULTO) INY 10 DOSIS': 'Dt Adulto',

  // DT Pediatrico
  'VACUNA CONTRA LA DIFTERIA Y TETANOS (DT PEDIATRICO) 10 DOSIS INYECT': 'Dt Pediatrico',
  'VACUNA CONTRA LA DIFTERIA Y TETANOS (DT PEDIATRICO) 10 DOSIS INY': 'Dt Pediatrico',
  'VACUNA CONTRA LA DIFTERIA Y TETANOS (DT PEDIATRICO) 10 DOSIS': 'Dt Pediatrico',
  'VACUNA CONTRA LA DIFTERIA Y TETANOS (DT PEDIATRICO) INY 10 DOSIS': 'Dt Pediatrico',

  // Hepatitis A
  'VACUNA CONTRA LA HEPATITIS A 1 DOSIS 720 UI/0.5 ML': 'HEPATITIS A',
  'VACUNA CONTRA LA HEPATITIS A 720 UI/0.5 ML 1 DOSIS INYECT': 'HEPATITIS A',
  'VACUNA CONTRA LA HEPATITIS A 720 UI/0.5 ML 1 DOSIS INY': 'HEPATITIS A',
  'VACUNA CONTRA LA HEPATITIS A 720 UI/0.5 ML INY 1 DOSIS': 'HEPATITIS A',

  // HVB Adulto
  'VACUNA CONTRA LA HEPATITIS B ADULTO 1 DOSIS 20 UG/ML': 'HVB Adulto',
  'VACUNA CONTRA LA HEPATITIS B ADULTO 20 UG/ML 1 DOSIS INYECT': 'HVB Adulto',
  'VACUNA CONTRA LA HEPATITIS B ADULTO 20 UG/ML 1 DOSIS INY': 'HVB Adulto',
  'VACUNA CONTRA LA HEPATITIS B ADULTO 20 UG/ML INY 1 DOSIS': 'HVB Adulto',

  // HVB Pediatrico
  'VACUNA CONTRA LA HEPATITIS B PEDIATRICO 1 DOSIS 10 UG/0.5 ML': 'HVB Pediatrico',
  'VACUNA CONTRA LA HEPATITIS B PEDIATRICO 10 UG/0.5 ML 1 DOSIS INYECT': 'HVB Pediatrico',
  'VACUNA CONTRA LA HEPATITIS B PEDIATRICO 10 UG/0.5 ML 1 DOSIS INY': 'HVB Pediatrico',
  'VACUNA CONTRA LA HEPATITIS B 10 UG/0.5 ML INY 1 DOSIS': 'HVB Pediatrico',

  // Influenza Adulto
  'VACUNA CONTRA LA INFLUENZA ESTACIONARIA - ADULTO 1 DOSIS (0.5 ML)': 'Influenza Adulto',
  'VACUNA CONTRA LA INFLUENZA ESTACIONARIA - ADULTO 1 DOSIS (0.5 ML) INY': 'Influenza Adulto',
  'VACUNA CONTRA LA INFLUENZA ESTACIONARIA - ADULTO 1 DOSIS (0.5 ML) INYECT': 'Influenza Adulto',
  'VACUNA CONTRA LA INFLUENZA TETRAVALENTE ANTIGENO TIPO A (H1N1 + H3N2)': 'Influenza Adulto',

  // Influenza Pediatrica
  'VACUNA CONTRA LA INFLUENZA PEDIATRICO (ANTIGENO TIPO A (H1N1 + H3N2) + ANTIGENO TIPO B 20 DOSIS 90 UG/ML': 'Influenza Pediatrica',
  'VACUNA CONTRA LA INFLUENZA PEDIATRICO (ANTIGENO TIPO A (H1N1 + H3N2) +': 'Influenza Pediatrica',
  'VACUNA CONTRA LA INFLUENZA (ANTIGENO TIPO A (H1N1 + H3N2) + ANTIGENO TIPO B) INY 20 DOSIS PEDIATRICO': 'Influenza Pediatrica',

  // Pentavalente
  'VACUNA DPT, HIB Y VHB (PENTAVALENTE) 1 DOSIS OTROS': 'Pentavalente',
  'VACUNA DPT, HIB Y VHB (PENTAVALENTE) 1 DOSIS': 'Pentavalente',
  'VACUNA DPT, HIB Y VHB (PENTAVALENTE) - 1 DOSIS INYECT': 'Pentavalente',
  'VACUNA DPT, HIB Y VHB (PENTAVALENTE) 1 DOSIS INYECT': 'Pentavalente',
  'VACUNA DPT, HIB Y VHB (PENTAVALENTE) INY 1 DOSIS': 'Pentavalente',

  // HIB
  'VACUNA HAEMOPHILUS INFLUENZAE TIPO B (HIB) 1 DOSIS INYECT': 'HIB',
  'VACUNA HAEMOPHILUS INFLUENZAE TIPO B (HIB) 1 DOSIS INY': 'HIB',
  'VACUNA HAEMOPHILUS INFLUENZAE TIPO B (HIB) 1 DOSIS': 'HIB',

  // VPH
  'VACUNA RECOMBINANTE TETRAVALENTE CONTRA VIRUS DEL PAPILOMA HUMANO TIPO 6, 11, 16 Y 18 (VPH) 0.5 ML': 'VPH',
  'VACUNA RECOMBINANTE TETRAVALENTE CONTRA VIRUS DEL PAPILOMA HUMANO TIPO': 'VPH',
  'VACUNA DEL VIRUS DEL PAPILOMA HUMANO': 'VPH',

  // Antirrabica
  'VACUNA ANTIRRABICA HUMANA INACTIVADA (ANTIGENO PITMAN MOORE CEPA 3218-': 'ANTIRRABICA',
  'VACUNA ANTIRRABICA HUMANA INACTIVADA (ANTIGENO PITMAN MOORE CEPA 3218-VERO) 1 DOSIS OTROS': 'ANTIRRABICA',
  'VACUNA ANTIRRABICA HUMANA INACTIVADA (PREPARADO DE CULTIVO CELULAR WIS': 'ANTIRRABICA',
  'VACUNA ANTIRRABICA HUMANA INACTIVADA (PREPARADO EN CULTIVO CELULAR) 1': 'ANTIRRABICA',
  'VACUNA ANTIRRABICA HUMANA INACTIVADA': 'ANTIRRABICA',
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

  return EXCEL_ESTABLECIMIENTO_ALIASES[normalized] ?? normalized;
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
  .replace(/\uFFFD/g, 'U')
  .replace(/[µμ]/g, 'U')
  .replace(/\b8\s*[UGug\uFFFD]+\b/g, '8 UG')
  .replace(/\b8\s*G\b/g, '8 UG')
  .replace(/\bDPTA\b/g, 'DPTA')
  .replace(/\s+/g, ' ')
  .trim();

const resolveVacuna = (
  medicamentoOriginal: string,
  vacunaMap: Map<string, { id: string; nombre: string }>,
): { id: string; nombre: string } | null => {
  const normalizedKey = normalizeVacunaLookupKey(medicamentoOriginal);
  const normalizedText = normalizeText(medicamentoOriginal);

  // 1. Mapeo directo por diccionario
  const mappedVacunaNombre = EXCEL_VACUNA_MAPPING[normalizedKey] || EXCEL_VACUNA_MAPPING[normalizedText];
  if (mappedVacunaNombre) {
    const found = vacunaMap.get(normalizeVacunaLookupKey(mappedVacunaNombre))
      ?? vacunaMap.get(normalizeText(mappedVacunaNombre));
    if (found) return found;
  }

  // 2. Coincidencia directa en el catálogo
  const directMatch = vacunaMap.get(normalizedKey) ?? vacunaMap.get(normalizedText);
  if (directMatch) return directMatch;

  // 3. Coincidencia por heurísticas del esquema nacional
  let targetCanonicalName: string | null = null;
  if (normalizedKey.includes('AMARILICA')) {
    targetCanonicalName = 'AMA';
  } else if (normalizedKey.includes('NEUMOCOCICA') || normalizedKey.includes('NEUMOCOCO')) {
    targetCanonicalName = 'Neumococo';
  } else if (normalizedKey.includes('PAROTIDITIS')) {
    targetCanonicalName = normalizedKey.includes('5 DOSIS') ? 'SPR X 5 DOSIS' : 'SPR X 1 DOSIS';
  } else if (normalizedKey.includes('SARAMPION') && normalizedKey.includes('RUBEOLA')) {
    if (normalizedKey.includes('PAROTIDITIS') || normalizedKey.includes('SPR')) {
      targetCanonicalName = normalizedKey.includes('5 DOSIS') ? 'SPR X 5 DOSIS' : 'SPR X 1 DOSIS';
    } else {
      targetCanonicalName = 'SR';
    }
  } else if (normalizedKey.includes('POLIOMIELITICA') || normalizedKey.includes('POLIO')) {
    if (
      normalizedKey.includes('BIVALENTE') ||
      normalizedKey.includes('ORAL') ||
      normalizedKey.includes('APO') ||
      normalizedKey.includes('20 DOSIS') ||
      normalizedKey.includes('10 DOSIS SUSPEN')
    ) {
      targetCanonicalName = 'APO';
    } else {
      targetCanonicalName = 'IPV';
    }
  } else if (normalizedKey.includes('RABICA') || normalizedKey.includes('PITMAN MOORE')) {
    targetCanonicalName = 'ANTIRRABICA';
  } else if (normalizedKey.includes('TUBERCULOSA') || normalizedKey.includes('BCG')) {
    targetCanonicalName = 'BCG';
  } else if (normalizedKey.includes('VARICELA')) {
    targetCanonicalName = 'Varicela';
  } else if (
    normalizedKey.includes('DPTA') ||
    (normalizedKey.includes('DIFTERIA') && normalizedKey.includes('TETANOS') && normalizedKey.includes('TOS FERINA') && normalizedKey.includes('ACELULAR'))
  ) {
    targetCanonicalName = 'DPTA';
  } else if (
    normalizedKey.includes('DPT') ||
    (normalizedKey.includes('DIFTERIA') && normalizedKey.includes('TETANOS') && normalizedKey.includes('TOS FERINA'))
  ) {
    targetCanonicalName = 'DPT';
  } else if (normalizedKey.includes('ROTAVIRUS')) {
    targetCanonicalName = 'Rotavirus';
  } else if (normalizedKey.includes('DIFTERIA') && normalizedKey.includes('TETANOS')) {
    if (normalizedKey.includes('PEDIATRICO') || normalizedKey.includes('PEDIAT')) {
      targetCanonicalName = 'Dt Pediatrico';
    } else {
      targetCanonicalName = 'Dt Adulto';
    }
  } else if (normalizedKey.includes('HEPATITIS A')) {
    targetCanonicalName = 'HEPATITIS A';
  } else if (normalizedKey.includes('HEPATITIS B') || normalizedKey.includes('HVB') || normalizedKey.includes('VHB')) {
    if (normalizedKey.includes('PEDIATRICO') || normalizedKey.includes('10 UG') || normalizedKey.includes('PEDIAT')) {
      targetCanonicalName = 'HVB Pediatrico';
    } else {
      targetCanonicalName = 'HVB Adulto';
    }
  } else if (normalizedKey.includes('INFLUENZA')) {
    if (normalizedKey.includes('PEDIATRICO') || normalizedKey.includes('PEDIAT')) {
      targetCanonicalName = 'Influenza Pediatrica';
    } else {
      targetCanonicalName = 'Influenza Adulto';
    }
  } else if (normalizedKey.includes('PENTAVALENTE')) {
    targetCanonicalName = 'Pentavalente';
  } else if (normalizedKey.includes('HAEMOPHILUS') || normalizedKey.includes('HIB')) {
    targetCanonicalName = 'HIB';
  } else if (normalizedKey.includes('PAPILOMA') || normalizedKey.includes('VPH')) {
    targetCanonicalName = 'VPH';
  } else if (normalizedKey.includes('VIRUELA')) {
    targetCanonicalName = 'VIRUELA';
  } else if (normalizedKey.includes('SINCITIAL') || normalizedKey.includes('VRS')) {
    if (normalizedKey.includes('RN') || normalizedKey.includes('NIRSEVIMAB') || normalizedKey.includes('RECIEN NACIDO')) {
      targetCanonicalName = 'VRS RN';
    } else {
      targetCanonicalName = 'VRS GESTANTE';
    }
  } else if (normalizedKey.includes('HEXAVALENTE') || normalizedKey.includes('HEXA')) {
    if (normalizedKey.includes('ACEL')) {
      targetCanonicalName = 'HEXA ACEL';
    } else {
      targetCanonicalName = 'HEXA CEL';
    }
  } else if (normalizedKey.includes('MENINGOCOCO') || normalizedKey.includes('MENINGO')) {
    targetCanonicalName = 'MENINGO';
  }

  if (targetCanonicalName) {
    return vacunaMap.get(normalizeVacunaLookupKey(targetCanonicalName))
      ?? vacunaMap.get(normalizeText(targetCanonicalName))
      ?? null;
  }

  return null;
};

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

      const establecimientoAlias = EXCEL_ESTABLECIMIENTO_ALIASES[normalizeText(establecimientoExcel)]
        ?? EXCEL_ESTABLECIMIENTO_ALIASES[normalizeEstablecimientoKey(establecimientoExcel)]
        ?? establecimientoExcel;
      const establecimiento = establecimientoMap.get(normalizeEstablecimientoKey(establecimientoAlias))
        ?? establecimientoMap.get(normalizeText(establecimientoAlias))
        ?? establecimientoMap.get(normalizeEstablecimientoKey(establecimientoExcel))
        ?? establecimientoMap.get(normalizeText(establecimientoExcel));
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

      const vacuna = resolveVacuna(medicamentoOriginal, vacunaMap);
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
        const existing = operacionesUnicasMap.get(key);

        if (!existing) {
          operacionesUnicasMap.set(key, {
            ...operacion,
            payload: {
              ...operacion.payload,
              distribucionMensual: [...operacion.payload.distribucionMensual],
              mesesDisponibles: [...operacion.payload.mesesDisponibles],
            },
          });
        } else {
          // Consolidar por suma si hay múltiples filas para la misma vacuna (ej. APO 20 dosis + 10 dosis oral)
          const combinedDistribucion = existing.payload.distribucionMensual.map((val, idx) => {
            return (val || 0) + (operacion.payload.distribucionMensual[idx] || 0);
          });

          const combinedMeses = existing.payload.mesesDisponibles.map((val, idx) => {
            return val || operacion.payload.mesesDisponibles[idx] || 0;
          });

          const sumCpma = (existing.payload.cpma !== null || operacion.payload.cpma !== null)
            ? Number(((existing.payload.cpma ?? 0) + (operacion.payload.cpma ?? 0)).toFixed(4))
            : null;

          const sumRequerimiento = (existing.payload.requerimiento !== null || operacion.payload.requerimiento !== null)
            ? Number(((existing.payload.requerimiento ?? 0) + (operacion.payload.requerimiento ?? 0)).toFixed(4))
            : null;

          const sumAjuste = (existing.payload.ajuste !== null || operacion.payload.ajuste !== null)
            ? Number(((existing.payload.ajuste ?? 0) + (operacion.payload.ajuste ?? 0)).toFixed(4))
            : null;

          existing.payload.distribucionMensual = combinedDistribucion;
          existing.payload.mesesDisponibles = combinedMeses;
          existing.payload.stockFin = (existing.payload.stockFin || 0) + (operacion.payload.stockFin || 0);
          existing.payload.totalDistribu = (existing.payload.totalDistribu || 0) + (operacion.payload.totalDistribu || 0);
          existing.payload.cpma = sumCpma;
          existing.payload.requerimiento = sumRequerimiento;
          existing.payload.ajuste = sumAjuste;
          if (operacion.payload.fecExp && (!existing.payload.fecExp || operacion.payload.fecExp > existing.payload.fecExp)) {
            existing.payload.fecExp = operacion.payload.fecExp;
          }
        }
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
