import ExcelJS from 'exceljs';

export interface TableData {
  headers: string[];
  rows: string[][];
}

function cleanCellText(value: string): string {
  return value.replace(/\s+/g, ' ').trim();
}

export function sanitizeFileName(value: string, fallback: string): string {
  const base = value.trim() || fallback;

  return base
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-zA-Z0-9-_ ]/g, '')
    .trim()
    .replace(/\s+/g, '_')
    .slice(0, 80) || fallback;
}

export function extractTableData(table: HTMLTableElement): TableData {
  const headCells = Array.from(table.querySelectorAll('thead tr:first-child th, thead tr:first-child td'))
    .map((cell) => cleanCellText(cell.textContent || ''))
    .filter(Boolean);

  const bodyRows = Array.from(table.querySelectorAll('tbody tr'))
    .map((row) =>
      Array.from(row.querySelectorAll('th, td'))
        .map((cell) => cleanCellText(cell.textContent || '')),
    )
    .filter((row) => row.some(Boolean));

  if (headCells.length > 0) {
    return {
      headers: headCells,
      rows: bodyRows,
    };
  }

  const allRows = Array.from(table.querySelectorAll('tr'))
    .map((row) =>
      Array.from(row.querySelectorAll('th, td'))
        .map((cell) => cleanCellText(cell.textContent || '')),
    )
    .filter((row) => row.some(Boolean));

  return {
    headers: allRows[0] || [],
    rows: allRows.slice(1),
  };
}

function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');

  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export async function exportTableToExcel(table: HTMLTableElement, filename: string) {
  const { headers, rows } = extractTableData(table);

  if (headers.length === 0) {
    throw new Error('La tabla no contiene datos para exportar.');
  }

  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet('Tabla SiBot');

  worksheet.addRow(headers);
  rows.forEach((row) => worksheet.addRow(row));

  const headerRow = worksheet.getRow(1);
  headerRow.font = { bold: true, color: { argb: 'FFFFFFFF' } };
  headerRow.fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'FF0F766E' },
  };
  headerRow.alignment = { vertical: 'middle', horizontal: 'center' };
  headerRow.height = 22;

  worksheet.eachRow((row, rowNumber) => {
    row.eachCell((cell) => {
      cell.border = {
        top: { style: 'thin', color: { argb: 'FFE4E4E7' } },
        left: { style: 'thin', color: { argb: 'FFE4E4E7' } },
        bottom: { style: 'thin', color: { argb: 'FFE4E4E7' } },
        right: { style: 'thin', color: { argb: 'FFE4E4E7' } },
      };
      cell.alignment = { vertical: 'middle', horizontal: 'left', wrapText: true };

      if (rowNumber > 1) {
        cell.fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: rowNumber % 2 === 0 ? 'FFFFFFFF' : 'FFF9FAFB' },
        };
      }
    });
  });

  const columns = headers.map((header, columnIndex) => {
    const contentLengths = rows.map((row) => row[columnIndex]?.length || 0);
    const maxLength = Math.max(header.length, ...contentLengths, 12);

    return {
      width: Math.min(Math.max(maxLength + 2, 12), 32),
    };
  });

  worksheet.columns = columns;
  worksheet.views = [{ state: 'frozen', ySplit: 1 }];

  const buffer = await workbook.xlsx.writeBuffer();
  const blob = new Blob([buffer], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  });

  downloadBlob(blob, filename);
}
