import { prisma } from '@/config/database';
import { ServiceResult } from '@/types';
import * as ExcelJS from 'exceljs';

/**
 * Service for Movimientos Excel operations
 * Handles templates, import, export and validation for Excel files
 */
export class MovimientosExcelService {

  /**
   * Validate UUID format
   */
  private static validarUUID(uuid: string): boolean {
    if (!uuid || typeof uuid !== 'string') return false;
    const cleanUuid = uuid.trim();
    if (cleanUuid.length !== 36) return false;
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    return uuidRegex.test(cleanUuid);
  }

  /**
   * Generate Excel template for specific vaccine import
   */
  static async generarPlantillaVacuna(vacunaId: string, anio: number): Promise<ServiceResult<ExcelJS.Workbook>> {
    try {
      if (!vacunaId) {
        return { success: false, error: 'ID de vacuna requerido' };
      }

      if (!anio || anio < 2020 || anio > 2050) {
        return { success: false, error: 'Año debe estar entre 2020 y 2050' };
      }

      const vacuna = await prisma.vacuna.findUnique({
        where: { id: vacunaId },
        select: { id: true, nombre: true, tipo: true, presentacion: true, dosisPorFrasco: true }
      });

      if (!vacuna) {
        return { success: false, error: 'Vacuna no encontrada' };
      }

      const establecimientos = await prisma.establecimiento.findMany({
        where: { estado: 'activo' },
        include: {
          centroAcopio: {
            include: {
              microred: {
                include: { red: true }
              }
            }
          }
        },
        orderBy: [
          { centroAcopio: { microred: { red: { nombre: 'asc' } } } },
          { centroAcopio: { microred: { nombre: 'asc' } } },
          { centroAcopio: { nombre: 'asc' } },
          { tipo: 'asc' },
          { nombre: 'asc' }
        ]
      });

      const workbook = new ExcelJS.Workbook();
      workbook.creator = 'SIVAC - Sistema de Vacunas';
      workbook.created = new Date();

      const worksheet = workbook.addWorksheet(`${vacuna.nombre} - ${anio}`);

      worksheet.columns = [
        { header: 'Establecimiento ID', key: 'establecimientoId', width: 40 },
        { header: 'Establecimiento', key: 'establecimiento', width: 30 },
        { header: 'Tipo', key: 'tipo', width: 15 },
        { header: 'Centro Acopio', key: 'centroAcopio', width: 25 },
        { header: 'Mes', key: 'mes', width: 10 },
        { header: 'Año', key: 'anio', width: 10 },
        { header: 'Trans. Ingreso', key: 'transIngreso', width: 15 },
        { header: 'Salida', key: 'salida', width: 15 },
        { header: 'Trans. Salida', key: 'transSalida', width: 15 },
        { header: 'Observaciones', key: 'observaciones', width: 30 }
      ];

      const headerRow = worksheet.getRow(1);
      headerRow.font = { bold: true, color: { argb: 'FFFFFF' } };
      headerRow.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: '366092' }
      };
      headerRow.alignment = { horizontal: 'center', vertical: 'middle' };

      let rowIndex = 2;
      for (const establecimiento of establecimientos) {
        for (let mes = 1; mes <= 12; mes++) {
          const row = worksheet.addRow({
            establecimientoId: establecimiento.id,
            establecimiento: establecimiento.nombre,
            tipo: establecimiento.tipo.replace('_', ' ').toUpperCase(),
            centroAcopio: establecimiento.centroAcopio?.nombre || '',
            mes: mes,
            anio: anio,
            transIngreso: 0,
            salida: 0,
            transSalida: 0,
            observaciones: ''
          });

          if (rowIndex % 2 === 0) {
            row.fill = {
              type: 'pattern',
              pattern: 'solid',
              fgColor: { argb: 'F8F9FA' }
            };
          }
          rowIndex++;
        }
      }

      worksheet.eachRow((row) => {
        row.eachCell((cell) => {
          cell.border = {
            top: { style: 'thin' },
            left: { style: 'thin' },
            bottom: { style: 'thin' },
            right: { style: 'thin' }
          };
        });
      });

      return { success: true, data: workbook };
    } catch (error) {
      console.error('Error al generar plantilla de vacuna:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Error al generar plantilla' };
    }
  }

  /**
   * Generate massive Excel template for all vaccines
   */
  static async generarPlantillaMasiva(anio: number): Promise<ServiceResult<ExcelJS.Workbook>> {
    try {
      if (!anio || anio < 2020 || anio > 2050) {
        return { success: false, error: 'Año debe estar entre 2020 y 2050' };
      }

      const vacunas = await prisma.vacuna.findMany({
        where: { estado: 'activo' },
        orderBy: { nombre: 'asc' }
      });

      if (vacunas.length === 0) {
        return { success: false, error: 'No se encontraron vacunas activas' };
      }

      const establecimientos = await prisma.establecimiento.findMany({
        where: { estado: 'activo' },
        include: {
          centroAcopio: {
            include: {
              microred: {
                include: { red: true }
              }
            }
          }
        },
        orderBy: [
          { centroAcopio: { microred: { red: { nombre: 'asc' } } } },
          { centroAcopio: { microred: { nombre: 'asc' } } },
          { centroAcopio: { nombre: 'asc' } },
          { tipo: 'asc' },
          { nombre: 'asc' }
        ]
      });

      const workbook = new ExcelJS.Workbook();
      workbook.creator = 'SIVAC - Sistema de Vacunas';
      workbook.created = new Date();

      for (const vacuna of vacunas) {
        const worksheet = workbook.addWorksheet(vacuna.nombre.substring(0, 31));

        worksheet.columns = [
          { header: 'Establecimiento ID', key: 'establecimientoId', width: 40 },
          { header: 'Establecimiento', key: 'establecimiento', width: 30 },
          { header: 'Tipo', key: 'tipo', width: 15 },
          { header: 'Centro Acopio', key: 'centroAcopio', width: 25 },
          { header: 'Mes', key: 'mes', width: 10 },
          { header: 'Año', key: 'anio', width: 10 },
          { header: 'Trans. Ingreso', key: 'transIngreso', width: 15 },
          { header: 'Salida', key: 'salida', width: 15 },
          { header: 'Trans. Salida', key: 'transSalida', width: 15 },
          { header: 'Observaciones', key: 'observaciones', width: 30 }
        ];

        const headerRow = worksheet.getRow(1);
        headerRow.font = { bold: true, color: { argb: 'FFFFFF' } };
        headerRow.fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: '366092' }
        };
        headerRow.alignment = { horizontal: 'center', vertical: 'middle' };

        let rowIndex = 2;
        for (const establecimiento of establecimientos) {
          for (let mes = 1; mes <= 12; mes++) {
            const row = worksheet.addRow({
              establecimientoId: establecimiento.id,
              establecimiento: establecimiento.nombre,
              tipo: establecimiento.tipo.replace('_', ' ').toUpperCase(),
              centroAcopio: establecimiento.centroAcopio?.nombre || '',
              mes: mes,
              anio: anio,
              transIngreso: 0,
              salida: 0,
              transSalida: 0,
              observaciones: ''
            });

            if (rowIndex % 2 === 0) {
              row.fill = {
                type: 'pattern',
                pattern: 'solid',
                fgColor: { argb: 'F8F9FA' }
              };
            }
            rowIndex++;
          }
        }

        worksheet.eachRow((row) => {
          row.eachCell((cell) => {
            cell.border = {
              top: { style: 'thin' },
              left: { style: 'thin' },
              bottom: { style: 'thin' },
              right: { style: 'thin' }
            };
          });
        });
      }

      return { success: true, data: workbook };
    } catch (error) {
      console.error('Error al generar plantilla masiva:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Error al generar plantilla masiva' };
    }
  }

  /**
   * Import movimientos from Excel for specific vaccine
   */
  static async importarDesdeExcelVacuna(
    vacunaId: string,
    anio: number,
    buffer: Buffer
  ): Promise<ServiceResult<{ creadas: number; actualizadas: number; errores: string[] }>> {
    try {
      if (!vacunaId) {
        return { success: false, error: 'ID de vacuna requerido' };
      }

      if (!anio || anio < 2020 || anio > 2050) {
        return { success: false, error: 'Año debe estar entre 2020 y 2050' };
      }

      const vacuna = await prisma.vacuna.findUnique({
        where: { id: vacunaId }
      });

      if (!vacuna) {
        return { success: false, error: 'Vacuna no encontrada' };
      }

      const workbook = new ExcelJS.Workbook();
      await workbook.xlsx.load(buffer as any);

      if (workbook.worksheets.length === 0) {
        return { success: false, error: 'No se encontraron hojas de trabajo en el archivo Excel' };
      }

      const worksheet = workbook.worksheets[0];
      if (!worksheet) {
        return { success: false, error: 'No se pudo acceder a la hoja de trabajo' };
      }

      const errores: string[] = [];
      let creadas = 0;
      let actualizadas = 0;

      const batchSize = 100;
      const totalRows = worksheet.rowCount;

      console.log(`Procesando ${totalRows - 1} filas en lotes de ${batchSize}`);

      for (let startRow = 2; startRow <= totalRows; startRow += batchSize) {
        const endRow = Math.min(startRow + batchSize - 1, totalRows);

        for (let rowNumber = startRow; rowNumber <= endRow; rowNumber++) {
          const row = worksheet.getRow(rowNumber);

          try {
            const rawEstablecimientoId = row.getCell(1).value;
            const establecimientoId = rawEstablecimientoId?.toString().trim();
            const mes = parseInt(row.getCell(5).value?.toString() || '0');
            const anioExcel = parseInt(row.getCell(6).value?.toString() || '0');
            const transIngreso = parseInt(row.getCell(7).value?.toString() || '0');
            const salida = parseInt(row.getCell(8).value?.toString() || '0');
            const transSalida = parseInt(row.getCell(9).value?.toString() || '0');
            const observaciones = row.getCell(10).value?.toString() || '';

            if (!establecimientoId || establecimientoId === '' || establecimientoId === 'undefined' || establecimientoId === 'null') {
              continue;
            }

            if (!this.validarUUID(establecimientoId)) {
              errores.push(`Fila ${rowNumber}: ID de establecimiento "${establecimientoId}" no es un UUID válido`);
              continue;
            }

            if (mes < 1 || mes > 12) {
              errores.push(`Fila ${rowNumber}: Mes debe estar entre 1 y 12`);
              continue;
            }

            if (anioExcel !== anio) {
              errores.push(`Fila ${rowNumber}: Año debe ser ${anio}`);
              continue;
            }

            const establecimiento = await prisma.establecimiento.findUnique({
              where: { id: establecimientoId }
            });

            if (!establecimiento) {
              errores.push(`Fila ${rowNumber}: Establecimiento no encontrado`);
              continue;
            }

            const movimientoExistente = await prisma.movimientoVacuna.findUnique({
              where: {
                uk_movimiento_establecimiento_vacuna_mes_anio: {
                  establecimientoId,
                  vacunaId,
                  mes,
                  anio
                }
              }
            });

            if (movimientoExistente) {
              await prisma.movimientoVacuna.update({
                where: { id: movimientoExistente.id },
                data: {
                  transIngreso,
                  salida,
                  transSalida,
                  observaciones: observaciones || null,
                  updatedAt: new Date()
                }
              });
              actualizadas++;
            } else {
              await prisma.movimientoVacuna.create({
                data: {
                  establecimientoId,
                  vacunaId,
                  mes,
                  anio,
                  transIngreso,
                  salida,
                  transSalida,
                  observaciones: observaciones || null,
                  usuarioId: 'system-import',
                  fechaMovimiento: new Date()
                }
              });
              creadas++;
            }
          } catch (error) {
            errores.push(`Fila ${rowNumber}: ${error instanceof Error ? error.message : 'Error desconocido'}`);
          }
        }
      }

      return { success: true, data: { creadas, actualizadas, errores } };
    } catch (error) {
      console.error('Error al importar desde Excel por vacuna:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Error al importar desde Excel' };
    }
  }

  /**
   * Import massive movimientos from Excel (multiple sheets)
   */
  static async importarDesdeExcelMasivo(
    anio: number,
    buffer: Buffer
  ): Promise<ServiceResult<{
    totalCreadas: number;
    totalActualizadas: number;
    erroresPorVacuna: {
      vacuna: string;
      vacunaId: string;
      errores: string[];
      erroresDetallados: {
        fila: number;
        establecimientoId: string;
        establecimientoNombre: string;
        mes: number;
        error: string;
        tipoError: 'UUID_INVALIDO' | 'ESTABLECIMIENTO_NO_ENCONTRADO' | 'MES_INVALIDO' | 'ANIO_INVALIDO' | 'ERROR_BD' | 'DATOS_FALTANTES';
        datosOriginales: any;
      }[];
    }[];
    vacunasProcesadas: number;
  }>> {
    try {
      if (!anio || anio < 2020 || anio > 2050) {
        return { success: false, error: 'Año debe estar entre 2020 y 2050' };
      }

      const workbook = new ExcelJS.Workbook();
      await workbook.xlsx.load(buffer as any);

      if (workbook.worksheets.length === 0) {
        return { success: false, error: 'No se encontraron hojas de trabajo en el archivo Excel' };
      }

      const vacunas = await prisma.vacuna.findMany({ where: { estado: 'activo' } });
      const vacunaMap = new Map(vacunas.map(v => [v.nombre, v.id]));

      let totalCreadas = 0;
      let totalActualizadas = 0;
      const erroresPorVacuna: any[] = [];
      let vacunasProcesadas = 0;

      for (const worksheet of workbook.worksheets) {
        const nombreVacuna = worksheet.name;
        const erroresVacuna: string[] = [];
        const erroresDetallados: any[] = [];

        try {
          const vacunaId = vacunaMap.get(nombreVacuna);
          if (!vacunaId) {
            erroresVacuna.push(`Vacuna "${nombreVacuna}" no encontrada en el sistema`);
            erroresPorVacuna.push({ vacuna: nombreVacuna, vacunaId: '', errores: erroresVacuna, erroresDetallados: [] });
            continue;
          }

          let creadasVacuna = 0;
          let actualizadasVacuna = 0;
          const batchSize = 50;
          const totalRows = worksheet.rowCount;

          for (let startRow = 2; startRow <= totalRows; startRow += batchSize) {
            const endRow = Math.min(startRow + batchSize - 1, totalRows);

            for (let rowNumber = startRow; rowNumber <= endRow; rowNumber++) {
              const row = worksheet.getRow(rowNumber);

              try {
                const rawEstablecimientoId = row.getCell(1).value;
                const establecimientoId = rawEstablecimientoId?.toString().trim();
                const mes = parseInt(row.getCell(5).value?.toString() || '0');
                const anioExcel = parseInt(row.getCell(6).value?.toString() || '0');
                const transIngreso = parseInt(row.getCell(7).value?.toString() || '0');
                const salida = parseInt(row.getCell(8).value?.toString() || '0');
                const transSalida = parseInt(row.getCell(9).value?.toString() || '0');
                const observaciones = row.getCell(10).value?.toString() || '';

                if (!establecimientoId || establecimientoId === '' || establecimientoId === 'undefined' || establecimientoId === 'null') {
                  erroresDetallados.push({
                    fila: rowNumber,
                    establecimientoId: establecimientoId || 'VACIO',
                    establecimientoNombre: 'N/A',
                    mes: mes,
                    error: 'ID de establecimiento vacío o inválido',
                    tipoError: 'DATOS_FALTANTES',
                    datosOriginales: { rawEstablecimientoId, mes, anioExcel, transIngreso, salida, transSalida }
                  });
                  continue;
                }

                if (!this.validarUUID(establecimientoId)) {
                  const errorMsg = `ID no es UUID válido (longitud: ${establecimientoId.length})`;
                  erroresVacuna.push(`Fila ${rowNumber}: ${errorMsg}`);
                  erroresDetallados.push({
                    fila: rowNumber,
                    establecimientoId: establecimientoId,
                    establecimientoNombre: 'N/A',
                    mes: mes,
                    error: errorMsg,
                    tipoError: 'UUID_INVALIDO',
                    datosOriginales: { rawEstablecimientoId, establecimientoId, mes, anioExcel }
                  });
                  continue;
                }

                if (mes < 1 || mes > 12) {
                  erroresVacuna.push(`Fila ${rowNumber}: Mes inválido`);
                  erroresDetallados.push({
                    fila: rowNumber, establecimientoId, establecimientoNombre: 'N/A', mes,
                    error: `Mes debe estar entre 1 y 12`, tipoError: 'MES_INVALIDO',
                    datosOriginales: { mes, anioExcel }
                  });
                  continue;
                }

                if (anioExcel !== anio) {
                  erroresVacuna.push(`Fila ${rowNumber}: Año inválido`);
                  erroresDetallados.push({
                    fila: rowNumber, establecimientoId, establecimientoNombre: 'N/A', mes,
                    error: `Año debe ser ${anio}`, tipoError: 'ANIO_INVALIDO',
                    datosOriginales: { mes, anioExcel }
                  });
                  continue;
                }

                const establecimiento = await prisma.establecimiento.findUnique({
                  where: { id: establecimientoId },
                  select: { id: true, nombre: true, tipo: true }
                });

                if (!establecimiento) {
                  erroresVacuna.push(`Fila ${rowNumber}: Establecimiento no encontrado`);
                  erroresDetallados.push({
                    fila: rowNumber, establecimientoId, establecimientoNombre: 'NO ENCONTRADO', mes,
                    error: `Establecimiento no encontrado`, tipoError: 'ESTABLECIMIENTO_NO_ENCONTRADO',
                    datosOriginales: { establecimientoId, mes, anioExcel }
                  });
                  continue;
                }

                const movimientoExistente = await prisma.movimientoVacuna.findUnique({
                  where: {
                    uk_movimiento_establecimiento_vacuna_mes_anio: {
                      establecimientoId,
                      vacunaId,
                      mes,
                      anio
                    }
                  }
                });

                try {
                  if (movimientoExistente) {
                    await prisma.movimientoVacuna.update({
                      where: { id: movimientoExistente.id },
                      data: { transIngreso, salida, transSalida, observaciones: observaciones || null, updatedAt: new Date() }
                    });
                    actualizadasVacuna++;
                  } else {
                    await prisma.movimientoVacuna.create({
                      data: {
                        establecimientoId, vacunaId, mes, anio,
                        transIngreso, salida, transSalida,
                        observaciones: observaciones || null,
                        usuarioId: 'system-import',
                        fechaMovimiento: new Date()
                      }
                    });
                    creadasVacuna++;
                  }
                } catch (dbError) {
                  erroresVacuna.push(`Fila ${rowNumber}: Error BD`);
                  erroresDetallados.push({
                    fila: rowNumber, establecimientoId, establecimientoNombre: establecimiento?.nombre || 'N/A', mes,
                    error: dbError instanceof Error ? dbError.message : 'Error BD', tipoError: 'ERROR_BD',
                    datosOriginales: { establecimientoId, vacunaId, mes, anio }
                  });
                }
              } catch (error) {
                erroresVacuna.push(`Fila ${rowNumber}: ${error instanceof Error ? error.message : 'Error desconocido'}`);
              }
            }
          }

          totalCreadas += creadasVacuna;
          totalActualizadas += actualizadasVacuna;
          vacunasProcesadas++;

          if (erroresVacuna.length > 0 || erroresDetallados.length > 0) {
            erroresPorVacuna.push({ vacuna: nombreVacuna, vacunaId: vacunaId || '', errores: erroresVacuna, erroresDetallados });
          }
        } catch (error) {
          erroresVacuna.push(`Error general: ${error instanceof Error ? error.message : 'Error desconocido'}`);
          erroresPorVacuna.push({ vacuna: nombreVacuna, vacunaId: '', errores: erroresVacuna, erroresDetallados: [] });
        }
      }

      return { success: true, data: { totalCreadas, totalActualizadas, erroresPorVacuna, vacunasProcesadas } };
    } catch (error) {
      console.error('Error al importar masivamente desde Excel:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Error al importar masivamente desde Excel' };
    }
  }

  /**
   * Validate Excel template before importing
   */
  static async validarPlantillaExcel(
    anio: number,
    buffer: Buffer
  ): Promise<ServiceResult<{
    valida: boolean;
    errores: string[];
    advertencias: string[];
    estadisticas: {
      totalFilas: number;
      filasConDatos: number;
      establecimientosUnicos: number;
      vacunasEncontradas: number;
    };
  }>> {
    try {
      if (!anio || anio < 2020 || anio > 2050) {
        return { success: false, error: 'Año debe estar entre 2020 y 2050' };
      }

      const workbook = new ExcelJS.Workbook();
      await workbook.xlsx.load(buffer as any);

      if (workbook.worksheets.length === 0) {
        return { success: false, error: 'No se encontraron hojas de trabajo en el archivo Excel' };
      }

      const errores: string[] = [];
      const advertencias: string[] = [];
      let totalFilas = 0;
      let filasConDatos = 0;
      const establecimientosUnicos = new Set<string>();
      const vacunasEncontradas = new Set<string>();

      for (const worksheet of workbook.worksheets) {
        const nombreVacuna = worksheet.name;
        vacunasEncontradas.add(nombreVacuna);

        const headerRow = worksheet.getRow(1);
        const expectedHeaders = [
          'Establecimiento ID', 'Establecimiento', 'Tipo', 'Centro Acopio',
          'Mes', 'Año', 'Trans. Ingreso', 'Salida', 'Trans. Salida', 'Observaciones'
        ];

        for (let i = 0; i < expectedHeaders.length; i++) {
          const cellValue = headerRow.getCell(i + 1).value?.toString();
          if (cellValue !== expectedHeaders[i]) {
            errores.push(`Hoja "${nombreVacuna}": Columna ${i + 1} debe ser "${expectedHeaders[i]}", encontrado "${cellValue}"`);
          }
        }

        for (let rowNumber = 2; rowNumber <= worksheet.rowCount; rowNumber++) {
          const row = worksheet.getRow(rowNumber);
          totalFilas++;

          const establecimientoId = row.getCell(1).value?.toString().trim();
          const mes = row.getCell(5).value?.toString();
          const anioExcel = row.getCell(6).value?.toString();

          if (establecimientoId) {
            filasConDatos++;
            establecimientosUnicos.add(establecimientoId);

            if (!this.validarUUID(establecimientoId)) {
              errores.push(`Hoja "${nombreVacuna}", Fila ${rowNumber}: ID de establecimiento inválido`);
            }

            const mesNum = parseInt(mes || '0');
            if (mesNum < 1 || mesNum > 12) {
              errores.push(`Hoja "${nombreVacuna}", Fila ${rowNumber}: Mes debe estar entre 1 y 12`);
            }

            const anioNum = parseInt(anioExcel || '0');
            if (anioNum !== anio) {
              errores.push(`Hoja "${nombreVacuna}", Fila ${rowNumber}: Año debe ser ${anio}`);
            }
          }
        }
      }

      const valida = errores.length === 0;

      if (filasConDatos === 0) {
        advertencias.push('No se encontraron filas con datos para procesar');
      }

      return {
        success: true,
        data: {
          valida,
          errores,
          advertencias,
          estadisticas: {
            totalFilas,
            filasConDatos,
            establecimientosUnicos: establecimientosUnicos.size,
            vacunasEncontradas: vacunasEncontradas.size
          }
        }
      };
    } catch (error) {
      console.error('Error al validar plantilla Excel:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Error al validar plantilla Excel' };
    }
  }

  /**
   * Debug Excel template - show first rows to identify issues
   */
  static async debugPlantillaExcel(buffer: Buffer): Promise<ServiceResult<any>> {
    try {
      const workbook = new ExcelJS.Workbook();
      await workbook.xlsx.load(buffer as any);

      if (workbook.worksheets.length === 0) {
        return { success: false, error: 'No se encontraron hojas de trabajo en el archivo Excel' };
      }

      const debug: any = {
        totalHojas: workbook.worksheets.length,
        hojas: []
      };

      for (const worksheet of workbook.worksheets) {
        const hojaDebug: any = {
          nombre: worksheet.name,
          totalFilas: worksheet.rowCount,
          primeras5Filas: []
        };

        for (let rowNumber = 1; rowNumber <= Math.min(6, worksheet.rowCount); rowNumber++) {
          const row = worksheet.getRow(rowNumber);
          const filaData: any = { numero: rowNumber, celdas: [] };

          for (let colNumber = 1; colNumber <= 11; colNumber++) {
            const cell = row.getCell(colNumber);
            filaData.celdas.push({
              columna: colNumber,
              valor: cell.value,
              tipo: typeof cell.value,
              texto: cell.value?.toString(),
              longitud: cell.value?.toString().length || 0
            });
          }

          hojaDebug.primeras5Filas.push(filaData);
        }

        debug.hojas.push(hojaDebug);
      }

      return { success: true, data: debug };
    } catch (error) {
      console.error('Error al hacer debug de plantilla Excel:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Error al hacer debug de plantilla Excel' };
    }
  }

  /**
   * Generate error report in Excel format
   */
  static async generarReporteErrores(
    erroresPorVacuna: {
      vacuna: string;
      vacunaId: string;
      errores: string[];
      erroresDetallados: {
        fila: number;
        establecimientoId: string;
        establecimientoNombre: string;
        mes: number;
        error: string;
        tipoError: string;
        datosOriginales: any;
      }[];
    }[]
  ): Promise<ServiceResult<ExcelJS.Workbook>> {
    try {
      const workbook = new ExcelJS.Workbook();
      workbook.creator = 'SIVAC - Sistema de Vacunas';
      workbook.created = new Date();

      const resumenSheet = workbook.addWorksheet('Resumen de Errores');

      resumenSheet.columns = [
        { header: 'Vacuna', key: 'vacuna', width: 25 },
        { header: 'ID Vacuna', key: 'vacunaId', width: 40 },
        { header: 'Total Errores', key: 'totalErrores', width: 15 },
        { header: 'UUID Inválidos', key: 'uuidInvalidos', width: 15 },
        { header: 'Establecimientos No Encontrados', key: 'establecimientosNoEncontrados', width: 30 },
        { header: 'Errores de Mes', key: 'erroresMes', width: 15 },
        { header: 'Errores de Año', key: 'erroresAnio', width: 15 },
        { header: 'Errores de BD', key: 'erroresBD', width: 15 },
        { header: 'Datos Faltantes', key: 'datosFaltantes', width: 15 }
      ];

      const headerRow = resumenSheet.getRow(1);
      headerRow.font = { bold: true, color: { argb: 'FFFFFF' } };
      headerRow.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'D32F2F' } };
      headerRow.alignment = { horizontal: 'center', vertical: 'middle' };

      for (const vacunaError of erroresPorVacuna) {
        const conteoErrores = {
          UUID_INVALIDO: 0,
          ESTABLECIMIENTO_NO_ENCONTRADO: 0,
          MES_INVALIDO: 0,
          ANIO_INVALIDO: 0,
          ERROR_BD: 0,
          DATOS_FALTANTES: 0
        };

        vacunaError.erroresDetallados.forEach(error => {
          if (conteoErrores.hasOwnProperty(error.tipoError)) {
            conteoErrores[error.tipoError as keyof typeof conteoErrores]++;
          }
        });

        resumenSheet.addRow({
          vacuna: vacunaError.vacuna,
          vacunaId: vacunaError.vacunaId,
          totalErrores: vacunaError.erroresDetallados.length,
          uuidInvalidos: conteoErrores.UUID_INVALIDO,
          establecimientosNoEncontrados: conteoErrores.ESTABLECIMIENTO_NO_ENCONTRADO,
          erroresMes: conteoErrores.MES_INVALIDO,
          erroresAnio: conteoErrores.ANIO_INVALIDO,
          erroresBD: conteoErrores.ERROR_BD,
          datosFaltantes: conteoErrores.DATOS_FALTANTES
        });
      }

      const detalleSheet = workbook.addWorksheet('Errores Detallados');

      detalleSheet.columns = [
        { header: 'Vacuna', key: 'vacuna', width: 25 },
        { header: 'Fila Excel', key: 'fila', width: 10 },
        { header: 'Establecimiento ID', key: 'establecimientoId', width: 40 },
        { header: 'Establecimiento Nombre', key: 'establecimientoNombre', width: 30 },
        { header: 'Mes', key: 'mes', width: 10 },
        { header: 'Tipo Error', key: 'tipoError', width: 25 },
        { header: 'Descripción Error', key: 'error', width: 50 },
        { header: 'Trans. Ingreso', key: 'transIngreso', width: 15 },
        { header: 'Salida', key: 'salida', width: 15 },
        { header: 'Trans. Salida', key: 'transSalida', width: 15 }
      ];

      const headerRowDetalle = detalleSheet.getRow(1);
      headerRowDetalle.font = { bold: true, color: { argb: 'FFFFFF' } };
      headerRowDetalle.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF5722' } };
      headerRowDetalle.alignment = { horizontal: 'center', vertical: 'middle' };

      for (const vacunaError of erroresPorVacuna) {
        for (const errorDetalle of vacunaError.erroresDetallados) {
          const row = detalleSheet.addRow({
            vacuna: vacunaError.vacuna,
            fila: errorDetalle.fila,
            establecimientoId: errorDetalle.establecimientoId,
            establecimientoNombre: errorDetalle.establecimientoNombre,
            mes: errorDetalle.mes,
            tipoError: errorDetalle.tipoError,
            error: errorDetalle.error,
            transIngreso: errorDetalle.datosOriginales?.transIngreso || '',
            salida: errorDetalle.datosOriginales?.salida || '',
            transSalida: errorDetalle.datosOriginales?.transSalida || ''
          });

          const fillColor = this.getErrorColor(errorDetalle.tipoError);
          row.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: fillColor } };
        }
      }

      [resumenSheet, detalleSheet].forEach(sheet => {
        sheet.eachRow((row) => {
          row.eachCell((cell) => {
            cell.border = {
              top: { style: 'thin' },
              left: { style: 'thin' },
              bottom: { style: 'thin' },
              right: { style: 'thin' }
            };
          });
        });
      });

      return { success: true, data: workbook };
    } catch (error) {
      console.error('Error al generar reporte de errores:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Error al generar reporte de errores' };
    }
  }

  /**
   * Get color for error type
   */
  private static getErrorColor(tipoError: string): string {
    const colores: Record<string, string> = {
      'UUID_INVALIDO': 'FFCDD2',
      'ESTABLECIMIENTO_NO_ENCONTRADO': 'FFE0B2',
      'MES_INVALIDO': 'F3E5F5',
      'ANIO_INVALIDO': 'E1F5FE',
      'ERROR_BD': 'FFEBEE',
      'DATOS_FALTANTES': 'F9FBE7'
    };
    return colores[tipoError] || 'FFFFFF';
  }
}
