import fs from 'fs';
import dotenv from 'dotenv';
dotenv.config({ path: 'C:/Proyectos/syncova/backend/.env' });
import ExcelJS from 'exceljs';

(async () => {
  const workbook = new ExcelJS.Workbook();
  await workbook.xlsx.load(fs.readFileSync('C:/Proyectos/syncova/ICI DEMID.xlsx'));
  const ws = workbook.worksheets[0];
  const headers = ws.getRow(1).values as Array<string | number | Date | null | undefined>;
  const out: Array<{ index: number; raw: unknown; type: string; parsed: { year: number; month: number } | null }> = [];
  const parseExcelMonthHeader = (value: unknown): { year: number; month: number } | null => {
    if (!value) return null;
    if (typeof value === 'object' && value !== null && 'result' in value) return parseExcelMonthHeader((value as { result?: unknown }).result);
    if (typeof value === 'object' && value !== null && 'text' in value) { const textValue = (value as { text?: unknown }).text; if (textValue) return parseExcelMonthHeader(textValue); }
    if (value instanceof Date && !Number.isNaN(value.getTime())) return { year: value.getUTCFullYear(), month: value.getUTCMonth() + 1 };
    if (typeof value === 'number') { const excelBase = new Date(Date.UTC(1899, 11, 30)); const parsed = new Date(excelBase.getTime() + value * 86400000); return { year: parsed.getUTCFullYear(), month: parsed.getUTCMonth() + 1 }; }
    const raw = String(value).trim();
    const dotOrSlashMatch = raw.match(/^(\d{1,2})[\/.-](\d{1,2})[\/.-](\d{4})$/);
    if (dotOrSlashMatch) return { year: Number(dotOrSlashMatch[3]), month: Number(dotOrSlashMatch[2]) };
    const slashMatch = raw.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
    if (slashMatch) return { year: Number(slashMatch[3]), month: Number(slashMatch[2]) };
    const parsed = new Date(raw);
    if (!Number.isNaN(parsed.getTime())) return { year: parsed.getUTCFullYear(), month: parsed.getUTCMonth() + 1 };
    return null;
  };
  for (let i = 9; i <= 21; i += 1) { const v = headers[i]; out.push({ index: i, raw: v, type: Object.prototype.toString.call(v), parsed: parseExcelMonthHeader(v) }); }
  console.log(JSON.stringify(out, null, 2));
})();
