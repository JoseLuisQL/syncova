import fs from 'fs';
import path from 'path';
import { Readable } from 'stream';
import { IciDemidService } from '@/services/IciDemidService';

describe('IciDemidService Excel Mapping', () => {
  const rootDir = path.resolve(__dirname, '../../../..');
  const sampleFile1 = path.join(rootDir, 'ICI DEMID.xlsx');
  const sampleFile2 = path.join(rootDir, 'DISPONIBILIDAD MES DE JULIO 2026.xlsx');

  it('should parse and map all records in DISPONIBILIDAD MES DE JULIO 2026.xlsx with zero unmapped errors', async () => {
    if (!fs.existsSync(sampleFile2)) {
      console.warn('File not found, skipping:', sampleFile2);
      return;
    }

    const buffer = fs.readFileSync(sampleFile2);
    const mockFile: Express.Multer.File = {
      buffer,
      originalname: 'DISPONIBILIDAD MES DE JULIO 2026.xlsx',
      fieldname: 'file',
      encoding: '7bit',
      mimetype: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      size: buffer.length,
      destination: '',
      filename: '',
      path: '',
      stream: new Readable(),
    };

    const result = await IciDemidService.previewImport(mockFile);
    expect(result.success).toBe(true);
    expect(result.data).toBeDefined();
    expect(result.data?.establecimientosNoMapeados).toEqual([]);
    expect(result.data?.vacunasNoMapeadas).toEqual([]);
    expect(result.data?.erroresDetalle).toEqual([]);
    expect(result.data?.filasValidas).toBeGreaterThan(0);
  });

  it('should parse and map all records in ICI DEMID.xlsx with zero unmapped errors', async () => {
    if (!fs.existsSync(sampleFile1)) {
      console.warn('File not found, skipping:', sampleFile1);
      return;
    }

    const buffer = fs.readFileSync(sampleFile1);
    const mockFile: Express.Multer.File = {
      buffer,
      originalname: 'ICI DEMID.xlsx',
      fieldname: 'file',
      encoding: '7bit',
      mimetype: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      size: buffer.length,
      destination: '',
      filename: '',
      path: '',
      stream: new Readable(),
    };

    const result = await IciDemidService.previewImport(mockFile);
    expect(result.success).toBe(true);
    expect(result.data).toBeDefined();
    expect(result.data?.establecimientosNoMapeados).toEqual([]);
    expect(result.data?.vacunasNoMapeadas).toEqual([]);
    expect(result.data?.erroresDetalle).toEqual([]);
    expect(result.data?.filasValidas).toBeGreaterThan(0);
  });
});
