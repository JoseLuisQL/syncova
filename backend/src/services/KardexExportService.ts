import ExcelJS from 'exceljs';
import PDFDocument from 'pdfkit';
import { KardexService, KardexFilters } from './KardexService';
import { ServiceResult } from '@/types';
import { prisma } from '@/config/database';

/**
 * Configuración para exportación del kardex
 */
export interface KardexExportConfig {
  incluirDetalleCompleto: boolean;
  incluirTrazabilidad: boolean;
  incluirEstadisticas: boolean;
  formatoExportacion: 'excel' | 'pdf' | 'csv';
  filtros?: KardexFilters;
}

/**
 * Datos de movimiento de kardex para exportación
 */
export interface KardexMovimientoExport {
  id: string;
  fecha: Date;
  tipo: 'vacuna' | 'jeringa';
  itemNombre: string;
  loteNumero: string;
  tipoMovimiento: 'ingreso' | 'salida' | 'transferencia' | 'ajuste';
  cantidad: number;
  saldoAnterior: number;
  stockFinal: number;
  establecimientoOrigen?: string | undefined;
  establecimientoDestino?: string | undefined;
  numeroDocumento: string;
  documento: string;
  observaciones?: string | undefined;
}

/**
 * Resultado de exportación Excel
 */
export interface ExcelExportResult {
  workbook: ExcelJS.Workbook;
  filename: string;
  size: number;
}

/**
 * Resultado de exportación PDF
 */
export interface PDFExportResult {
  buffer: Buffer;
  filename: string;
  size: number;
}

/**
 * Resultado de exportación CSV
 */
export interface CSVExportResult {
  content: string;
  filename: string;
  size: number;
}

/**
 * Estadísticas de exportación
 */
export interface KardexExportStats {
  totalMovimientos: number;
  totalIngresos: number;
  totalSalidas: number;
  totalTransferencias: number;
  totalAjustes: number;
  itemsUnicos: number;
  lotesUnicos: number;
  establecimientosUnicos: number;
}

/**
 * Servicio para exportación del Kardex
 * Maneja la generación de archivos Excel, PDF y CSV con configuraciones personalizadas
 */
class KardexExportService {
  /**
   * Exportar kardex a Excel con hojas separadas por vacuna/jeringa
   * Implementación profesional siguiendo el patrón de ValeExportService
   */
  static async exportToExcel(config: KardexExportConfig): Promise<ServiceResult<ExcelExportResult>> {
    try {
      console.log('🔄 Iniciando exportación de Kardex a Excel');
      console.log('📋 Filtros aplicados:', JSON.stringify(config.filtros, null, 2));

      // Validar que se hayan proporcionado fechas
      if (!config.filtros?.fechaInicio || !config.filtros?.fechaFin) {
        return {
          success: false,
          error: 'Las fechas de inicio y fin son requeridas para la exportación'
        };
      }

      // Obtener movimientos de kardex con todas las relaciones
      const movimientos = await this.obtenerMovimientosParaExportacion(config.filtros);

      if (movimientos.length === 0) {
        return {
          success: false,
          error: 'No se encontraron movimientos para exportar con los filtros aplicados'
        };
      }

      console.log(`📊 Se encontraron ${movimientos.length} movimientos para exportar`);

      // Crear workbook con diseño profesional
      const workbook = new ExcelJS.Workbook();
      workbook.creator = 'SIVAC - Sistema de Vacunación';
      workbook.created = new Date();
      workbook.company = 'Gobierno Regional de Apurímac';

      // Agrupar movimientos por item (vacuna/jeringa)
      const movimientosPorItem = this.agruparMovimientosPorItem(movimientos);

      console.log(`📋 Creando hojas para ${Object.keys(movimientosPorItem).length} items diferentes`);

      // Crear una hoja por cada item
      for (const [itemNombre, movimientosItem] of Object.entries(movimientosPorItem)) {
        await this.crearHojaKardexItem(workbook, itemNombre, movimientosItem, config);
      }

      // Generar nombre de archivo
      const fechaInicio = config.filtros.fechaInicio.toISOString().split('T')[0];
      const fechaFin = config.filtros.fechaFin.toISOString().split('T')[0];
      const filename = `Kardex_${fechaInicio}_${fechaFin}_${new Date().toISOString().split('T')[0]}.xlsx`;

      console.log('✅ Exportación de Kardex completada exitosamente');

      return {
        success: true,
        data: {
          workbook,
          filename,
          size: 0 // Se calculará al escribir
        }
      };

    } catch (error) {
      console.error('❌ Error en KardexExportService.exportToExcel:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Error al exportar Kardex a Excel'
      };
    }
  }

  /**
   * Exportar kardex a PDF
   */
  static async exportToPDF(config: KardexExportConfig): Promise<ServiceResult<PDFExportResult>> {
    try {
      // Obtener datos del kardex
      const result = await KardexService.getAll({
        ...config.filtros,
        page: 1,
        limit: 10000
      });

      if (!result.success || !result.data) {
        return {
          success: false,
          error: 'Error al obtener datos del kardex'
        };
      }

      const { movimientos } = result.data;

      // Crear documento PDF
      const doc = new PDFDocument({ 
        size: 'A4',
        layout: 'landscape',
        margin: 30
      });

      const buffers: Buffer[] = [];
      doc.on('data', buffers.push.bind(buffers));

      // Encabezado
      doc.fontSize(16).font('Helvetica-Bold');
      doc.text('REPORTE DE KARDEX', { align: 'center' });
      doc.fontSize(12).font('Helvetica');
      doc.text(`Generado el: ${new Date().toLocaleString('es-PE')}`, { align: 'center' });
      doc.moveDown();

      // Tabla de movimientos (simplificada para PDF)
      const tableTop = doc.y;
      const itemHeight = 20;
      let currentY = tableTop;

      // Encabezados de tabla
      doc.fontSize(8).font('Helvetica-Bold');
      doc.text('Fecha', 50, currentY, { width: 60 });
      doc.text('Tipo', 110, currentY, { width: 40 });
      doc.text('Item', 150, currentY, { width: 80 });
      doc.text('Movimiento', 230, currentY, { width: 60 });
      doc.text('Cantidad', 290, currentY, { width: 50 });
      doc.text('Saldo', 340, currentY, { width: 50 });
      doc.text('Documento', 390, currentY, { width: 80 });
      doc.text('Usuario', 470, currentY, { width: 80 });

      currentY += itemHeight;

      // Datos
      doc.font('Helvetica');
      movimientos.forEach((movimiento) => {
        if (currentY > 500) { // Nueva página si es necesario
          doc.addPage();
          currentY = 50;
        }

        doc.text(movimiento.fechaMovimiento.toLocaleDateString(), 50, currentY, { width: 60 });
        doc.text(movimiento.tipo, 110, currentY, { width: 40 });
        doc.text(movimiento.item?.nombre || 'N/A', 150, currentY, { width: 80 });
        doc.text(movimiento.tipoMovimiento, 230, currentY, { width: 60 });
        doc.text(movimiento.cantidad.toString(), 290, currentY, { width: 50 });
        doc.text(movimiento.saldoActual.toString(), 340, currentY, { width: 50 });
        doc.text(movimiento.numeroDocumento, 390, currentY, { width: 80 });
        doc.text(`${movimiento.usuario.nombres} ${movimiento.usuario.apellidos}`, 470, currentY, { width: 80 });

        currentY += itemHeight;
      });

      doc.end();

      return new Promise((resolve) => {
        doc.on('end', () => {
          const buffer = Buffer.concat(buffers);
          const timestamp = new Date().toISOString().slice(0, 19).replace(/:/g, '-');
          const filename = `kardex_${timestamp}.pdf`;

          resolve({
            success: true,
            data: {
              buffer,
              filename,
              size: buffer.length
            }
          });
        });
      });
    } catch (error) {
      console.error('Error en KardexExportService.exportToPDF:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Error al exportar a PDF'
      };
    }
  }

  /**
   * Exportar kardex a CSV
   */
  static async exportToCSV(config: KardexExportConfig): Promise<ServiceResult<CSVExportResult>> {
    try {
      // Obtener datos del kardex
      const result = await KardexService.getAll({
        ...config.filtros,
        page: 1,
        limit: 10000
      });

      if (!result.success || !result.data) {
        return {
          success: false,
          error: 'Error al obtener datos del kardex'
        };
      }

      const { movimientos } = result.data;

      // Crear contenido CSV
      const headers = [
        'Fecha y Hora',
        'Tipo',
        'Item',
        'Lote',
        'Tipo Movimiento',
        'Cantidad',
        'Saldo Anterior',
        'Saldo Actual',
        'Establecimiento Origen',
        'Establecimiento Destino',
        'Documento',
        'Número Documento',
        'Observaciones',
        'Usuario'
      ];

      let csvContent = headers.join(',') + '\n';

      movimientos.forEach((movimiento) => {
        const row = [
          `"${movimiento.fechaMovimiento.toLocaleString()}"`,
          `"${movimiento.tipo}"`,
          `"${movimiento.item?.nombre || 'N/A'}"`,
          `"${movimiento.lote?.numero || 'N/A'}"`,
          `"${movimiento.tipoMovimiento}"`,
          movimiento.cantidad,
          movimiento.saldoAnterior,
          movimiento.saldoActual,
          `"${movimiento.establecimientoOrigen?.nombre || '-'}"`,
          `"${movimiento.establecimientoDestino?.nombre || '-'}"`,
          `"${movimiento.documento}"`,
          `"${movimiento.numeroDocumento}"`,
          `"${movimiento.observaciones || '-'}"`,
          `"${movimiento.usuario.nombres} ${movimiento.usuario.apellidos}"`
        ];

        csvContent += row.join(',') + '\n';
      });

      const timestamp = new Date().toISOString().slice(0, 19).replace(/:/g, '-');
      const filename = `kardex_${timestamp}.csv`;

      return {
        success: true,
        data: {
          content: csvContent,
          filename,
          size: Buffer.byteLength(csvContent, 'utf8')
        }
      };
    } catch (error) {
      console.error('Error en KardexExportService.exportToCSV:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Error al exportar a CSV'
      };
    }
  }

  /**
   * Obtener movimientos de kardex para exportación con todas las relaciones
   */
  private static async obtenerMovimientosParaExportacion(filtros: KardexFilters): Promise<KardexMovimientoExport[]> {
    try {
      console.log('🔍 Obteniendo movimientos de kardex para exportación');

      // Construir condiciones WHERE
      const whereConditions: any = {};

      if (filtros.tipo) {
        whereConditions.tipo = filtros.tipo;
      }

      if (filtros.itemId) {
        whereConditions.itemId = filtros.itemId;
      }

      if (filtros.loteId) {
        whereConditions.loteId = filtros.loteId;
      }

      if (filtros.tipoMovimiento) {
        whereConditions.tipoMovimiento = filtros.tipoMovimiento;
      }

      if (filtros.establecimientoOrigenId) {
        whereConditions.establecimientoOrigenId = filtros.establecimientoOrigenId;
      }

      if (filtros.establecimientoDestinoId) {
        whereConditions.establecimientoDestinoId = filtros.establecimientoDestinoId;
      }

      if (filtros.fechaInicio && filtros.fechaFin) {
        // Las fechas ya deben venir convertidas desde el controlador
        whereConditions.fechaMovimiento = {
          gte: filtros.fechaInicio,
          lte: filtros.fechaFin
        };
      }

      // Obtener movimientos con relaciones disponibles
      const movimientos = await prisma.kardex.findMany({
        where: whereConditions,
        include: {
          // Establecimientos
          establecimientoOrigen: {
            select: {
              id: true,
              nombre: true,
              codigo: true,
              tipo: true
            }
          },
          establecimientoDestino: {
            select: {
              id: true,
              nombre: true,
              codigo: true,
              tipo: true
            }
          },
          // Usuario
          usuario: {
            select: {
              nombres: true,
              apellidos: true
            }
          }
        },
        orderBy: [
          { fechaMovimiento: 'asc' },
          { createdAt: 'asc' }
        ]
      });

      // Obtener información de items y lotes por separado
      const itemsInfo = new Map<string, any>();
      const lotesInfo = new Map<string, any>();

      // Recopilar IDs únicos de items y lotes
      const vacunaIds = new Set<string>();
      const jeringaIds = new Set<string>();
      const loteVacunaIds = new Set<string>();
      const loteJeringaIds = new Set<string>();

      movimientos.forEach(mov => {
        if (mov.tipo === 'vacuna') {
          vacunaIds.add(mov.itemId);
          loteVacunaIds.add(mov.loteId);
        } else if (mov.tipo === 'jeringa') {
          jeringaIds.add(mov.itemId);
          loteJeringaIds.add(mov.loteId);
        }
      });

      // Obtener información de vacunas
      if (vacunaIds.size > 0) {
        const vacunas = await prisma.vacuna.findMany({
          where: { id: { in: Array.from(vacunaIds) } },
          select: { id: true, nombre: true, tipo: true, presentacion: true }
        });
        vacunas.forEach(v => itemsInfo.set(v.id, v));
      }

      // Obtener información de jeringas
      if (jeringaIds.size > 0) {
        const jeringas = await prisma.jeringa.findMany({
          where: { id: { in: Array.from(jeringaIds) } },
          select: { id: true, tipo: true, capacidad: true, color: true }
        });
        jeringas.forEach(j => itemsInfo.set(j.id, j));
      }

      // Obtener información de lotes de vacunas
      if (loteVacunaIds.size > 0) {
        const lotesVacunas = await prisma.loteVacuna.findMany({
          where: { id: { in: Array.from(loteVacunaIds) } },
          select: { id: true, numero: true, fechaVencimiento: true, cantidadInicial: true, cantidadActual: true }
        });
        lotesVacunas.forEach(l => lotesInfo.set(l.id, l));
      }

      // Obtener información de lotes de jeringas
      if (loteJeringaIds.size > 0) {
        const lotesJeringas = await prisma.loteJeringa.findMany({
          where: { id: { in: Array.from(loteJeringaIds) } },
          select: { id: true, numero: true, fechaVencimiento: true, cantidadInicial: true, cantidadActual: true }
        });
        lotesJeringas.forEach(l => lotesInfo.set(l.id, l));
      }

      console.log(`📊 Se obtuvieron ${movimientos.length} movimientos de la base de datos`);

      // Transformar a formato de exportación
      const movimientosExport: KardexMovimientoExport[] = movimientos.map(mov => {
        // Determinar el nombre del item usando la información obtenida
        let itemNombre = 'N/A';
        const itemInfo = itemsInfo.get(mov.itemId);
        if (mov.tipo === 'vacuna' && itemInfo) {
          itemNombre = itemInfo.nombre;
        } else if (mov.tipo === 'jeringa' && itemInfo) {
          itemNombre = `${itemInfo.tipo} ${itemInfo.capacidad}`;
        }

        // Determinar el número de lote usando la información obtenida
        let loteNumero = 'N/A';
        const loteInfo = lotesInfo.get(mov.loteId);
        if (loteInfo) {
          loteNumero = loteInfo.numero;
        }

        return {
          id: mov.id,
          fecha: mov.fechaMovimiento,
          tipo: mov.tipo as 'vacuna' | 'jeringa',
          itemNombre,
          loteNumero,
          tipoMovimiento: mov.tipoMovimiento as 'ingreso' | 'salida' | 'transferencia' | 'ajuste',
          cantidad: mov.cantidad,
          saldoAnterior: mov.saldoAnterior,
          stockFinal: mov.saldoActual,
          establecimientoOrigen: mov.establecimientoOrigen?.nombre || undefined,
          establecimientoDestino: mov.establecimientoDestino?.nombre || undefined,
          numeroDocumento: mov.numeroDocumento,
          documento: mov.documento,
          observaciones: mov.observaciones || undefined
        };
      });

      return movimientosExport;

    } catch (error) {
      console.error('❌ Error al obtener movimientos para exportación:', error);
      throw error;
    }
  }

  /**
   * Agrupar movimientos por item (vacuna/jeringa)
   */
  private static agruparMovimientosPorItem(movimientos: KardexMovimientoExport[]): { [itemNombre: string]: KardexMovimientoExport[] } {
    const grupos: { [itemNombre: string]: KardexMovimientoExport[] } = {};

    movimientos.forEach(movimiento => {
      const itemNombre = movimiento.itemNombre;

      if (!grupos[itemNombre]) {
        grupos[itemNombre] = [];
      }

      grupos[itemNombre].push(movimiento);
    });

    // Ordenar movimientos dentro de cada grupo por fecha
    Object.keys(grupos).forEach(itemNombre => {
      const movimientosGrupo = grupos[itemNombre];
      if (movimientosGrupo) {
        movimientosGrupo.sort((a, b) => a.fecha.getTime() - b.fecha.getTime());
      }
    });

    return grupos;
  }

  /**
   * Crear hoja de Excel para un item específico (vacuna/jeringa)
   * Siguiendo el diseño profesional de ValeExportService
   */
  private static async crearHojaKardexItem(
    workbook: ExcelJS.Workbook,
    itemNombre: string,
    movimientos: KardexMovimientoExport[],
    config: KardexExportConfig
  ): Promise<void> {
    try {
      console.log(`📋 Creando hoja para: ${itemNombre} (${movimientos.length} movimientos)`);

      // Crear hoja con nombre seguro para Excel
      const nombreHoja = this.limpiarNombreHoja(itemNombre);
      const worksheet = workbook.addWorksheet(nombreHoja);

      // Configurar diseño profesional de la hoja
      worksheet.views = [{
        showGridLines: false,
        showRowColHeaders: false,
        zoomScale: 85
      }];

      // Configurar columnas con anchos optimizados para impresión A4
      worksheet.columns = [
        { width: 10 },  // A - Fecha (reducido)
        { width: 7 },   // B - Tipo (reducido)
        { width: 18 },  // C - Item (reducido)
        { width: 12 },  // D - Lote (reducido)
        { width: 10 },  // E - Movimiento (reducido)
        { width: 15 },  // F - Tipo Doc (aumentado para VALE_ENTREGA, PECOSA)
        { width: 8 },   // G - Cantidad (reducido)
        { width: 10 },  // H - Saldo Ant. (reducido)
        { width: 10 },  // I - Stock Final (reducido)
        { width: 18 },  // J - Origen (reducido)
        { width: 18 },  // K - Destino (reducido)
        { width: 12 }   // L - N° Doc (reducido)
      ];

      // Agregar encabezado institucional
      this.agregarEncabezadoKardex(worksheet, itemNombre, config);

      // Agregar encabezados de tabla
      const filaHeaders = 12;
      this.agregarHeadersTablaKardex(worksheet, filaHeaders);

      // Agregar datos de movimientos
      let filaActual = filaHeaders + 1;
      movimientos.forEach((movimiento, index) => {
        this.agregarFilaMovimiento(worksheet, filaActual, movimiento, index);
        filaActual++;
      });

      // Configurar página para impresión A4
      worksheet.pageSetup = {
        paperSize: 9, // A4
        orientation: 'landscape', // Horizontal para más columnas
        fitToPage: true,
        fitToWidth: 1,
        fitToHeight: 0, // Permitir múltiples páginas verticalmente si es necesario
        margins: {
          left: 0.5,
          right: 0.5,
          top: 0.75,
          bottom: 0.75,
          header: 0.3,
          footer: 0.3
        },
        printTitlesRow: `${filaHeaders}:${filaHeaders}` // Repetir encabezados en cada página
      };

      // Aplicar bordes y estilos finales
      this.aplicarEstilosFinalesKardex(worksheet, filaHeaders, filaActual - 1);

      console.log(`✅ Hoja creada para ${itemNombre}: ${movimientos.length} movimientos`);

    } catch (error) {
      console.error(`❌ Error al crear hoja para ${itemNombre}:`, error);
      throw error;
    }
  }

  /**
   * Limpiar nombre de hoja para Excel (máximo 31 caracteres, sin caracteres especiales)
   */
  private static limpiarNombreHoja(nombre: string): string {
    return nombre
      .replace(/[\\\/\?\*\[\]]/g, '') // Remover caracteres no permitidos en Excel
      .substring(0, 31) // Máximo 31 caracteres
      .trim();
  }

  /**
   * Agregar encabezado institucional profesional al estilo ValeExportService
   */
  private static agregarEncabezadoKardex(worksheet: ExcelJS.Worksheet, itemNombre: string, config: KardexExportConfig): void {
    // Fondo degradado para toda la sección del encabezado
    for (let row = 1; row <= 6; row++) {
      for (let col = 1; col <= 12; col++) {
        const cell = worksheet.getCell(row, col);
        cell.fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: 'FFF8FAFE' }
        };
      }
    }

    // Logo y encabezado principal
    worksheet.mergeCells('A1:L1');
    const headerCell1 = worksheet.getCell('A1');
    headerCell1.value = '🏛️ GOBIERNO REGIONAL DE APURÍMAC';
    headerCell1.font = {
      bold: true,
      size: 16, // Aumentado de 14 a 16
      color: { argb: 'FF1E3A8A' },
      name: 'Segoe UI'
    };
    headerCell1.alignment = { horizontal: 'center', vertical: 'middle' };
    headerCell1.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FFDBEAFE' }
    };

    worksheet.mergeCells('A2:L2');
    const headerCell2 = worksheet.getCell('A2');
    headerCell2.value = 'DIRECCIÓN SUB REGIONAL DE SALUD CHANKA ANDAHUAYLAS';
    headerCell2.font = {
      bold: true,
      size: 13, // Aumentado de 11 a 13
      color: { argb: 'FF1E40AF' },
      name: 'Segoe UI'
    };
    headerCell2.alignment = { horizontal: 'center', vertical: 'middle' };

    worksheet.mergeCells('A3:L3');
    const headerCell3 = worksheet.getCell('A3');
    headerCell3.value = 'ESTRATEGIA SANITARIA DE INMUNIZACIONES - CADENA DE FRÍO';
    headerCell3.font = {
      bold: true,
      size: 12, // Aumentado de 10 a 12
      color: { argb: 'FF2563EB' },
      name: 'Segoe UI'
    };
    headerCell3.alignment = { horizontal: 'center', vertical: 'middle' };

    worksheet.mergeCells('A4:L4');
    const headerCell4 = worksheet.getCell('A4');
    headerCell4.value = '"Año de la Universalización de la Salud"';
    headerCell4.font = {
      italic: true,
      size: 11, // Aumentado de 9 a 11
      color: { argb: 'FF3B82F6' },
      name: 'Segoe UI'
    };
    headerCell4.alignment = { horizontal: 'center', vertical: 'middle' };

    // Título principal con diseño moderno
    worksheet.mergeCells('A6:L6');
    const titleCell = worksheet.getCell('A6');
    titleCell.value = `📋 KARDEX DE MOVIMIENTOS - ${itemNombre.toUpperCase()}`;
    titleCell.font = {
      bold: true,
      size: 18, // Aumentado de 16 a 18
      color: { argb: 'FFFFFFFF' },
      name: 'Segoe UI'
    };
    titleCell.alignment = { horizontal: 'center', vertical: 'middle' };
    titleCell.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FF1E40AF' }
    };

    // Información del período
    worksheet.mergeCells('A8:L8');
    const infoCell1 = worksheet.getCell('A8');
    const fechaInicio = config.filtros?.fechaInicio?.toLocaleDateString('es-PE') || 'N/A';
    const fechaFin = config.filtros?.fechaFin?.toLocaleDateString('es-PE') || 'N/A';
    infoCell1.value = `📅 Período: ${fechaInicio} - ${fechaFin}`;
    infoCell1.font = {
      bold: true,
      size: 13, // Aumentado de 11 a 13
      color: { argb: 'FF1F2937' },
      name: 'Segoe UI'
    };
    infoCell1.alignment = { horizontal: 'center', vertical: 'middle' };
    infoCell1.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FFF3F4F6' }
    };

    worksheet.mergeCells('A9:L9');
    const infoCell2 = worksheet.getCell('A9');
    infoCell2.value = `📊 Generado el: ${new Date().toLocaleDateString('es-PE', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })}`;
    infoCell2.font = {
      bold: true,
      size: 13, // Aumentado de 11 a 13
      color: { argb: 'FF1F2937' },
      name: 'Segoe UI'
    };
    infoCell2.alignment = { horizontal: 'center', vertical: 'middle' };
    infoCell2.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FFF3F4F6' }
    };

    // Aplicar bordes modernos al encabezado
    for (let row = 1; row <= 9; row++) {
      for (let col = 1; col <= 12; col++) {
        const cell = worksheet.getCell(row, col);
        cell.border = {
          top: { style: 'thin', color: { argb: 'FFE5E7EB' } },
          left: { style: 'thin', color: { argb: 'FFE5E7EB' } },
          bottom: { style: 'thin', color: { argb: 'FFE5E7EB' } },
          right: { style: 'thin', color: { argb: 'FFE5E7EB' } }
        };
      }
    }

    // Ajustar altura de filas para mejor presentación con fuentes más grandes
    worksheet.getRow(1).height = 30; // Aumentado de 25 a 30
    worksheet.getRow(2).height = 24; // Aumentado de 20 a 24
    worksheet.getRow(3).height = 22; // Aumentado de 18 a 22
    worksheet.getRow(4).height = 20; // Aumentado de 16 a 20
    worksheet.getRow(6).height = 35; // Aumentado de 30 a 35
    worksheet.getRow(8).height = 26; // Aumentado de 22 a 26
    worksheet.getRow(9).height = 26; // Aumentado de 22 a 26
  }

  /**
   * Agregar encabezados de tabla de kardex
   */
  private static agregarHeadersTablaKardex(worksheet: ExcelJS.Worksheet, fila: number): void {
    const headers = [
      { col: 'A', text: 'Fecha', width: 12 },
      { col: 'B', text: 'Tipo', width: 8 },
      { col: 'C', text: '💉 Item', width: 20 },
      { col: 'D', text: '📦 Lote', width: 15 },
      { col: 'E', text: 'Movimiento', width: 12 },
      { col: 'F', text: 'Tipo', width: 18 }, // Aumentado para VALE_ENTREGA, PECOSA, etc.
      { col: 'G', text: 'Cantidad', width: 10 },
      { col: 'H', text: 'Saldo Ant.', width: 12 },
      { col: 'I', text: 'Stock Final', width: 12 },
      { col: 'J', text: 'Origen', width: 20 },
      { col: 'K', text: 'Destino', width: 20 },
      { col: 'L', text: 'N° Doc', width: 15 }
    ];

    headers.forEach(header => {
      const cell = worksheet.getCell(`${header.col}${fila}`);
      cell.value = header.text;
      cell.font = {
        bold: true,
        size: 13, // Aumentado de 11 a 13
        color: { argb: 'FFFFFFFF' },
        name: 'Segoe UI'
      };
      cell.alignment = { horizontal: 'center', vertical: 'middle' };
      cell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FF0D9488' }
      };
      cell.border = {
        top: { style: 'medium', color: { argb: 'FF065F46' } },
        left: { style: 'thin', color: { argb: 'FF065F46' } },
        bottom: { style: 'medium', color: { argb: 'FF065F46' } },
        right: { style: 'thin', color: { argb: 'FF065F46' } }
      };
    });

    worksheet.getRow(fila).height = 24; // Aumentado de 20 a 24 para fuentes más grandes
  }

  /**
   * Agregar fila de movimiento de kardex
   */
  private static agregarFilaMovimiento(
    worksheet: ExcelJS.Worksheet,
    fila: number,
    movimiento: KardexMovimientoExport,
    index: number
  ): void {
    const isEvenRow = index % 2 === 0;
    const rowColor = isEvenRow ? 'FFF9FAFB' : 'FFFFFFFF';

    // Datos de la fila
    const datos = [
      { col: 'A', valor: movimiento.fecha.toLocaleDateString('es-PE') },
      { col: 'B', valor: movimiento.tipo.charAt(0).toUpperCase() + movimiento.tipo.slice(1) },
      { col: 'C', valor: movimiento.itemNombre },
      { col: 'D', valor: movimiento.loteNumero },
      { col: 'E', valor: this.getTipoMovimientoTexto(movimiento.tipoMovimiento) },
      { col: 'F', valor: this.formatearTipoDocumento(movimiento.documento) }, // Mostrar PECOSA, VALE_ENTREGA, etc.
      { col: 'G', valor: movimiento.cantidad },
      { col: 'H', valor: movimiento.saldoAnterior },
      { col: 'I', valor: movimiento.stockFinal },
      { col: 'J', valor: movimiento.establecimientoOrigen || '-' },
      { col: 'K', valor: movimiento.establecimientoDestino || '-' },
      { col: 'L', valor: movimiento.numeroDocumento }
    ];

    datos.forEach(dato => {
      const cell = worksheet.getCell(`${dato.col}${fila}`);
      cell.value = dato.valor;

      // Estilos básicos
      cell.font = {
        size: 12, // Aumentado de 10 a 12 para mejor legibilidad al imprimir
        name: 'Segoe UI',
        color: { argb: 'FF374151' }
      };
      cell.alignment = {
        horizontal: dato.col === 'G' || dato.col === 'H' || dato.col === 'I' ? 'center' : 'left',
        vertical: 'middle'
      };
      cell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: rowColor }
      };
      cell.border = {
        top: { style: 'thin', color: { argb: 'FFE5E7EB' } },
        left: { style: 'thin', color: { argb: 'FFE5E7EB' } },
        bottom: { style: 'thin', color: { argb: 'FFE5E7EB' } },
        right: { style: 'thin', color: { argb: 'FFE5E7EB' } }
      };

      // Colores especiales para cantidades según tipo de movimiento
      if (dato.col === 'G') {
        if (movimiento.tipoMovimiento === 'ingreso') {
          cell.font = { ...cell.font, color: { argb: 'FF059669' }, bold: true };
        } else if (movimiento.tipoMovimiento === 'salida') {
          cell.font = { ...cell.font, color: { argb: 'FFDC2626' }, bold: true };
        } else if (movimiento.tipoMovimiento === 'transferencia') {
          cell.font = { ...cell.font, color: { argb: 'FFEA580C' }, bold: true };
        } else if (movimiento.tipoMovimiento === 'ajuste') {
          cell.font = { ...cell.font, color: { argb: 'FFCA8A04' }, bold: true };
        }
      }

      // Colores profesionales para tipo de documento
      if (dato.col === 'F') {
        const tipoDoc = movimiento.documento.toUpperCase();
        if (tipoDoc.includes('PECOSA')) {
          cell.font = { ...cell.font, color: { argb: 'FF059669' }, bold: true }; // Verde para PECOSA
        } else if (tipoDoc.includes('VALE')) {
          cell.font = { ...cell.font, color: { argb: 'FF2563EB' }, bold: true }; // Azul para VALE_ENTREGA
        } else if (tipoDoc.includes('TRANSFERENCIA')) {
          cell.font = { ...cell.font, color: { argb: 'FFEA580C' }, bold: true }; // Naranja para transferencias
        } else if (tipoDoc.includes('AJUSTE')) {
          cell.font = { ...cell.font, color: { argb: 'FFCA8A04' }, bold: true }; // Amarillo para ajustes
        } else {
          cell.font = { ...cell.font, color: { argb: 'FF6B7280' }, bold: true }; // Gris para otros
        }
      }

      // Destacar stock final
      if (dato.col === 'I') {
        cell.font = { ...cell.font, bold: true, color: { argb: 'FF1E40AF' } };
      }
    });

    worksheet.getRow(fila).height = 22; // Aumentado de 18 a 22 para fuentes más grandes
  }

  /**
   * Obtener texto descriptivo del tipo de movimiento
   */
  private static getTipoMovimientoTexto(tipo: string): string {
    const tipos: { [key: string]: string } = {
      'ingreso': 'Ingreso',
      'salida': 'Salida',
      'transferencia': 'Transferencia',
      'ajuste': 'Ajuste'
    };
    return tipos[tipo] || tipo;
  }

  /**
   * Formatear tipo de documento de manera profesional
   */
  private static formatearTipoDocumento(documento: string): string {
    if (!documento) return '-';

    // Convertir a mayúsculas y reemplazar guiones bajos con espacios
    const documentoFormateado = documento.toUpperCase().replace(/_/g, ' ');

    // Mapeo de documentos comunes para mejor presentación
    const tiposDocumento: { [key: string]: string } = {
      'VALE_ENTREGA': 'VALE ENTREGA',
      'VALE ENTREGA': 'VALE ENTREGA',
      'PECOSA': 'PECOSA',
      'NOTA_ENTRADA': 'NOTA ENTRADA',
      'NOTA ENTRADA': 'NOTA ENTRADA',
      'NOTA_SALIDA': 'NOTA SALIDA',
      'NOTA SALIDA': 'NOTA SALIDA',
      'TRANSFERENCIA': 'TRANSFERENCIA',
      'AJUSTE_INVENTARIO': 'AJUSTE INVENTARIO',
      'AJUSTE INVENTARIO': 'AJUSTE INVENTARIO',
      'DEVOLUCION': 'DEVOLUCIÓN',
      'DEVOLUCIÓN': 'DEVOLUCIÓN'
    };

    return tiposDocumento[documentoFormateado] || documentoFormateado;
  }

  /**
   * Aplicar estilos finales a la hoja de kardex
   */
  private static aplicarEstilosFinalesKardex(worksheet: ExcelJS.Worksheet, filaInicio: number, _filaFin: number): void {
    // Ajustar ancho de columnas automáticamente
    worksheet.columns.forEach(column => {
      if (column.eachCell) {
        let maxLength = 0;
        column.eachCell({ includeEmpty: false }, (cell) => {
          const columnLength = cell.value ? cell.value.toString().length : 10;
          if (columnLength > maxLength) {
            maxLength = columnLength;
          }
        });
        column.width = Math.min(Math.max(maxLength + 2, 8), 30);
      }
    });

    // Congelar paneles en la fila de headers
    worksheet.views = [{
      state: 'frozen' as const,
      xSplit: 0,
      ySplit: filaInicio,
      topLeftCell: `A${filaInicio + 1}`,
      activeCell: `A${filaInicio + 1}`,
      showGridLines: false,
      showRowColHeaders: false,
      zoomScale: 85
    }];
  }

  /**
   * Agregar hoja de estadísticas al workbook de Excel
   */
  private static async addEstadisticasSheet(workbook: ExcelJS.Workbook, estadisticas: any): Promise<void> {
    const worksheetStats = workbook.addWorksheet('Estadísticas');

    // Configurar columnas
    worksheetStats.columns = [
      { header: 'Métrica', key: 'metrica', width: 30 },
      { header: 'Valor', key: 'valor', width: 15 }
    ];

    // Estilo del encabezado
    const headerRow = worksheetStats.getRow(1);
    headerRow.font = { bold: true, color: { argb: 'FFFFFF' } };
    headerRow.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: '366092' }
    };

    // Agregar estadísticas generales
    const statsData = [
      { metrica: 'Total de Movimientos', valor: estadisticas.totalMovimientos },
      { metrica: 'Total Ingresos', valor: estadisticas.totalIngresos },
      { metrica: 'Total Salidas', valor: estadisticas.totalSalidas },
      { metrica: 'Total Transferencias', valor: estadisticas.totalTransferencias },
      { metrica: 'Total Ajustes', valor: estadisticas.totalAjustes },
      { metrica: 'Saldo Actual Total', valor: estadisticas.saldoActualTotal }
    ];

    statsData.forEach((stat, index) => {
      const row = worksheetStats.addRow(stat);
      if (index % 2 === 0) {
        row.fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: 'F8F9FA' }
        };
      }
    });

    // Agregar movimientos por tipo si existen
    if (estadisticas.movimientosPorTipo && estadisticas.movimientosPorTipo.length > 0) {
      worksheetStats.addRow({}); // Fila vacía
      worksheetStats.addRow({ metrica: 'MOVIMIENTOS POR TIPO', valor: '' });

      estadisticas.movimientosPorTipo.forEach((item: any) => {
        worksheetStats.addRow({
          metrica: `${item.tipo.charAt(0).toUpperCase() + item.tipo.slice(1)}`,
          valor: item.cantidad
        });
      });
    }

    // Agregar movimientos por mes si existen
    if (estadisticas.movimientosPorMes && estadisticas.movimientosPorMes.length > 0) {
      worksheetStats.addRow({}); // Fila vacía
      worksheetStats.addRow({ metrica: 'MOVIMIENTOS POR MES', valor: '' });

      estadisticas.movimientosPorMes.forEach((item: any) => {
        worksheetStats.addRow({
          metrica: item.mes,
          valor: `I:${item.ingresos} S:${item.salidas} T:${item.transferencias} A:${item.ajustes}`
        });
      });
    }

    // Agregar bordes
    worksheetStats.eachRow((row) => {
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

  /**
   * Obtener estadísticas de exportación
   */
  static async getExportStats(filtros?: KardexFilters): Promise<ServiceResult<KardexExportStats>> {
    try {
      const result = await KardexService.getAll({
        ...filtros,
        page: 1,
        limit: 10000
      });

      if (!result.success || !result.data) {
        return {
          success: false,
          error: 'Error al obtener datos del kardex'
        };
      }

      const { movimientos } = result.data;

      // Calcular estadísticas
      const stats: KardexExportStats = {
        totalMovimientos: movimientos.length,
        totalIngresos: movimientos.filter(m => m.tipoMovimiento === 'ingreso').length,
        totalSalidas: movimientos.filter(m => m.tipoMovimiento === 'salida').length,
        totalTransferencias: movimientos.filter(m => m.tipoMovimiento === 'transferencia').length,
        totalAjustes: movimientos.filter(m => m.tipoMovimiento === 'ajuste').length,
        itemsUnicos: new Set(movimientos.map(m => m.itemId)).size,
        lotesUnicos: new Set(movimientos.map(m => m.loteId)).size,
        establecimientosUnicos: new Set([
          ...movimientos.map(m => m.establecimientoOrigenId).filter(Boolean),
          ...movimientos.map(m => m.establecimientoDestinoId).filter(Boolean)
        ]).size
      };

      return {
        success: true,
        data: stats
      };
    } catch (error) {
      console.error('Error en KardexExportService.getExportStats:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Error al obtener estadísticas de exportación'
      };
    }
  }
}

export { KardexExportService };
