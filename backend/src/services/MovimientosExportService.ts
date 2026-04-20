import ExcelJS from 'exceljs';
import { ServiceResult } from '@/types';
import { MovimientosService } from './MovimientosService';
import { EstablecimientoService } from './EstablecimientoService';
import { VacunaService } from './VacunaService';
import {
  ordenarEstablecimientos,
  getCentroAcopioPorNombre,
  getColoresCentroAcopioExcel
} from '@/utils/centroAcopioUtils';

/**
 * Configuración para exportación de movimientos
 */
export interface MovimientosExportConfig {
  mes: number;
  anio: number;
  vacunaId?: string; // Si no se especifica, exporta todas las vacunas
  centroAcopioId?: string; // Filtro por centro de acopio
  centroAcopioIds?: string[];
  establecimientoId?: string; // Filtro por establecimiento específico
  incluirEstablecimientosSinMovimiento: boolean;
  responsableReporte: string;
  observaciones?: string;
}

/**
 * Resultado de exportación Excel
 */
export interface MovimientosExcelResult {
  workbook: ExcelJS.Workbook;
  filename: string;
  size: number;
}

/**
 * Datos de movimiento para exportación
 */
interface MovimientoExportData {
  establecimiento: {
    id: string;
    nombre: string;
    codigo: string;
    tipo: string;
    centroAcopio?: string;
  };
  vacuna: {
    id: string;
    nombre: string;
    tipo: string;
    presentacion: string;
  };
  saldoAnterior: number;
  transIngreso: number;
  totalSaldo: number;
  salida: number;
  transSalida: number;
  saldo: number;
  entregaBase: number;
  entregasAdicionales: Array<{
    numeroEntrega: number;
    cantidad: number;
    fechaEntrega: Date;
    motivo?: string;
  }>;
  entregaTotal: number;
  stock: number;
  promedioConsumo: number;
  disponibilidad: number;
  observaciones?: string;
  fechaMovimiento: Date;
  tieneMovimiento: boolean;
}

/**
 * Servicio para exportación de movimientos de vacunas
 * Genera archivos Excel con diseño profesional siguiendo el patrón de PlanificacionExportService
 */
export class MovimientosExportService {
  /**
   * Exportar movimientos por vacuna específica
   */
  static async exportByVacuna(config: MovimientosExportConfig): Promise<ServiceResult<MovimientosExcelResult>> {
    try {
      console.log('🔄 Iniciando exportación de movimientos por vacuna');
      console.log('📋 Configuración:', JSON.stringify(config, null, 2));

      // Validar configuración
      if (!config.vacunaId) {
        return {
          success: false,
          error: 'ID de vacuna es requerido para exportación por vacuna'
        };
      }

      // Obtener información de la vacuna
      const vacunaResult = await VacunaService.getById(config.vacunaId);
      if (!vacunaResult.success || !vacunaResult.data) {
        return {
          success: false,
          error: 'Vacuna no encontrada'
        };
      }

      // Obtener movimientos de la vacuna
      const filtros: any = {
        vacunaId: config.vacunaId,
        mes: config.mes,
        anio: config.anio,
        limit: 1000
      };

      if (config.centroAcopioId) {
        filtros.centroAcopioId = config.centroAcopioId;
      }

      if (config.centroAcopioIds?.length) {
        filtros.centroAcopioIds = config.centroAcopioIds;
      }

      if (config.establecimientoId) {
        filtros.establecimientoId = config.establecimientoId;
      }

      const movimientosResult = await MovimientosService.getAll(filtros);

      if (!movimientosResult.success) {
        return {
          success: false,
          error: movimientosResult.error || 'Error al obtener movimientos'
        };
      }

      // Obtener todos los establecimientos si se requiere incluir los sin movimiento
      let establecimientos: any[] = [];
      if (config.incluirEstablecimientosSinMovimiento) {
        const filtrosEstablecimientos: any = { limit: 1000 };
        if (config.centroAcopioId) {
          filtrosEstablecimientos.centroAcopioId = config.centroAcopioId;
        }
        if (config.centroAcopioIds?.length) {
          filtrosEstablecimientos.centroAcopioIds = config.centroAcopioIds;
        }

        const establecimientosResult = await EstablecimientoService.getAll(filtrosEstablecimientos);

        if (establecimientosResult.success) {
          establecimientos = establecimientosResult.data?.establecimientos || [];
        }
      }

      // Procesar datos para exportación
      const datosExportacion = this.procesarDatosPorVacuna(
        movimientosResult.data?.movimientos || [],
        establecimientos,
        vacunaResult.data,
        config
      );

      console.log(`📊 Procesados ${datosExportacion.length} registros para exportación`);

      // Crear workbook con diseño profesional
      const workbook = new ExcelJS.Workbook();
      workbook.creator = 'SIVAC - Sistema de Vacunación';
      workbook.created = new Date();
      workbook.company = 'Gobierno Regional de Apurímac';

      // Crear hoja principal
      const worksheet = workbook.addWorksheet(`${vacunaResult.data.nombre} ${this.getMesNombre(config.mes)} ${config.anio}`);

      // Configurar diseño profesional de la hoja
      this.configurarHojaProfesional(worksheet);

      // Agregar encabezado institucional
      this.agregarEncabezadoInstitucional(worksheet, vacunaResult.data, config);

      // Agregar datos de movimientos
      this.agregarDatosMovimientos(worksheet, datosExportacion, 11);

      // Aplicar estilos profesionales
      this.aplicarEstilosProfesionales(worksheet);

      // Calcular tamaño del archivo
      const buffer = await workbook.xlsx.writeBuffer();
      const size = buffer.byteLength;

      // Generar nombre de archivo
      const filename = this.generarNombreArchivo(vacunaResult.data, config);

      console.log(`✅ Exportación completada: ${filename} (${(size / 1024).toFixed(2)} KB)`);

      return {
        success: true,
        data: {
          workbook,
          filename,
          size
        }
      };

    } catch (error) {
      console.error('❌ Error en exportación de movimientos:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Error desconocido en exportación'
      };
    }
  }

  /**
   * Exportar todas las vacunas en un solo archivo
   */
  static async exportAllVacunas(config: MovimientosExportConfig): Promise<ServiceResult<MovimientosExcelResult>> {
    try {
      console.log('🔄 Iniciando exportación de movimientos para todas las vacunas');

      // Obtener todas las vacunas activas
      const vacunasResult = await VacunaService.getAll({ estado: 'activo', limit: 100 });
      if (!vacunasResult.success || !vacunasResult.data?.vacunas) {
        return {
          success: false,
          error: 'Error al obtener vacunas'
        };
      }

      const vacunas = vacunasResult.data.vacunas;
      console.log(`📋 Exportando ${vacunas.length} vacunas`);

      // Crear workbook con diseño profesional
      const workbook = new ExcelJS.Workbook();
      workbook.creator = 'SIVAC - Sistema de Vacunación';
      workbook.created = new Date();
      workbook.company = 'Gobierno Regional de Apurímac';

      // Crear una hoja por cada vacuna
      for (const vacuna of vacunas) {
        await this.agregarHojaVacuna(workbook, vacuna, config);
      }

      // Calcular tamaño del archivo
      const buffer = await workbook.xlsx.writeBuffer();
      const size = buffer.byteLength;

      // Generar nombre de archivo
      const filename = this.generarNombreArchivoGeneral(config);

      console.log(`✅ Exportación completada: ${filename} (${(size / 1024).toFixed(2)} KB)`);

      return {
        success: true,
        data: {
          workbook,
          filename,
          size
        }
      };

    } catch (error) {
      console.error('❌ Error en exportación de movimientos:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Error desconocido en exportación'
      };
    }
  }

  /**
   * Procesar datos de movimientos por vacuna específica
   */
  private static procesarDatosPorVacuna(
    movimientos: any[],
    establecimientos: any[],
    vacuna: any,
    config: MovimientosExportConfig
  ): MovimientoExportData[] {
    const datos: MovimientoExportData[] = [];
    const movimientosMap = new Map();

    // Crear mapa de movimientos existentes
    movimientos.forEach(m => {
      movimientosMap.set(m.establecimientoId, m);
    });

    // Obtener lista completa de establecimientos
    let establecimientosCompletos = establecimientos;
    if (!config.incluirEstablecimientosSinMovimiento) {
      establecimientosCompletos = movimientos.map(m => m.establecimiento);
    }

    // Ordenar establecimientos por centro de acopio
    const establecimientosOrdenados = ordenarEstablecimientos(establecimientosCompletos);

    // Procesar cada establecimiento
    establecimientosOrdenados.forEach(establecimiento => {
      const movimiento = movimientosMap.get(establecimiento.id);
      const centroAcopio = getCentroAcopioPorNombre(establecimiento.nombre);

      // Calcular entregas adicionales
      const entregasAdicionales = movimiento?.entregasAdicionales || [];
      const totalEntregasAdicionales = entregasAdicionales.reduce((sum: number, ea: any) => sum + ea.cantidad, 0);
      const entregaBase = movimiento?.entregaBase ?? movimiento?.entrega ?? 0;
      const entregaTotal = entregaBase + totalEntregasAdicionales;

      datos.push({
        establecimiento: {
          id: establecimiento.id,
          nombre: establecimiento.nombre,
          codigo: establecimiento.codigo,
          tipo: establecimiento.tipo,
          centroAcopio: centroAcopio !== 'DEFAULT' ? centroAcopio : 'Regional'
        },
        vacuna: {
          id: vacuna.id,
          nombre: vacuna.nombre,
          tipo: vacuna.tipo,
          presentacion: vacuna.presentacion
        },
        saldoAnterior: movimiento?.saldoAnterior || 0,
        transIngreso: movimiento?.transIngreso || 0,
        totalSaldo: (movimiento?.saldoAnterior || 0) + (movimiento?.transIngreso || 0),
        salida: movimiento?.salida || 0,
        transSalida: movimiento?.transSalida || 0,
        saldo: ((movimiento?.saldoAnterior || 0) + (movimiento?.transIngreso || 0)) - (movimiento?.salida || 0) - (movimiento?.transSalida || 0),
        entregaBase,
        entregasAdicionales: entregasAdicionales.map((ea: any) => ({
          numeroEntrega: ea.numeroEntrega,
          cantidad: ea.cantidad,
          fechaEntrega: ea.fechaEntrega,
          motivo: ea.motivo
        })),
        entregaTotal,
        stock: ((movimiento?.saldoAnterior || 0) + (movimiento?.transIngreso || 0)) - (movimiento?.salida || 0) - (movimiento?.transSalida || 0) + entregaTotal,
        promedioConsumo: 0, // Se calculará si es necesario
        disponibilidad: 0, // Se calculará si es necesario
        observaciones: movimiento?.observaciones,
        fechaMovimiento: movimiento?.fechaMovimiento || new Date(),
        tieneMovimiento: !!movimiento
      });
    });

    return datos;
  }

  /**
   * Agregar hoja de vacuna al workbook
   */
  private static async agregarHojaVacuna(
    workbook: ExcelJS.Workbook,
    vacuna: any,
    config: MovimientosExportConfig
  ): Promise<void> {
    try {
      // Obtener movimientos de la vacuna
      const movimientosResult = await MovimientosService.getAll({
        vacunaId: vacuna.id,
        mes: config.mes,
        anio: config.anio,
        ...(config.centroAcopioId && { centroAcopioId: config.centroAcopioId }),
        ...(config.establecimientoId && { establecimientoId: config.establecimientoId }),
        limit: 1000
      });

      if (!movimientosResult.success) {
        console.warn(`⚠️ No se pudieron obtener movimientos para vacuna ${vacuna.nombre}`);
        return;
      }

      // Obtener establecimientos si es necesario
      let establecimientos: any[] = [];
      if (config.incluirEstablecimientosSinMovimiento) {
        const establecimientosResult = await EstablecimientoService.getAll({
          ...(config.centroAcopioId && { centroAcopioId: config.centroAcopioId }),
          limit: 1000
        });

        if (establecimientosResult.success) {
          establecimientos = establecimientosResult.data?.establecimientos || [];
        }
      }

      // Procesar datos
      const datosExportacion = this.procesarDatosPorVacuna(
        movimientosResult.data?.movimientos || [],
        establecimientos,
        vacuna,
        config
      );

      // Solo crear hoja si hay datos
      if (datosExportacion.length === 0) {
        console.warn(`⚠️ No hay datos para exportar para vacuna ${vacuna.nombre}`);
        return;
      }

      // Crear hoja
      const worksheet = workbook.addWorksheet(`${vacuna.nombre} ${this.getMesNombre(config.mes)} ${config.anio}`);

      // Configurar diseño profesional de la hoja
      this.configurarHojaProfesional(worksheet);

      // Agregar encabezado institucional
      this.agregarEncabezadoInstitucional(worksheet, vacuna, config);

      // Agregar datos de movimientos
      this.agregarDatosMovimientos(worksheet, datosExportacion, 11);

      // Aplicar estilos profesionales
      this.aplicarEstilosProfesionales(worksheet);

      console.log(`✅ Hoja creada para vacuna: ${vacuna.nombre} (${datosExportacion.length} registros)`);

    } catch (error) {
      console.error(`❌ Error al crear hoja para vacuna ${vacuna.nombre}:`, error);
    }
  }

  /**
   * Configurar diseño profesional de la hoja
   */
  private static configurarHojaProfesional(worksheet: ExcelJS.Worksheet): void {
    // Configurar vista de la hoja con encabezados activados
    worksheet.views = [{
      showGridLines: false,
      showRowColHeaders: true, // Activar encabezados de filas y columnas
      zoomScale: 85
    }];

    // Configurar márgenes para impresión A4
    worksheet.pageSetup = {
      paperSize: 9, // A4
      orientation: 'landscape',
      margins: {
        left: 0.5,
        right: 0.5,
        top: 0.75,
        bottom: 0.75,
        header: 0.3,
        footer: 0.3
      },
      fitToPage: true,
      fitToWidth: 1,
      fitToHeight: 0
    };

    // Configurar encabezados y pies de página
    worksheet.headerFooter = {
      firstHeader: '&C&"Segoe UI,Bold"&14MOVIMIENTOS MENSUALES DE VACUNAS',
      firstFooter: '&L&"Segoe UI"&10Generado: &D &T&R&"Segoe UI"&10Página &P de &N'
    };
  }

  /**
   * Agregar encabezado institucional profesional
   */
  private static agregarEncabezadoInstitucional(
    worksheet: ExcelJS.Worksheet,
    vacuna: any,
    config: MovimientosExportConfig
  ): void {
    // Fondo degradado para toda la sección del encabezado
    for (let row = 1; row <= 8; row++) {
      for (let col = 1; col <= 16; col++) {
        const cell = worksheet.getCell(row, col);
        cell.fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: 'FFF8FAFE' }
        };
      }
    }

    // Logo y encabezado principal (ajustado a 15 columnas)
    worksheet.mergeCells('A1:O1');
    const headerCell1 = worksheet.getCell('A1');
    headerCell1.value = '🏛️ GOBIERNO REGIONAL DE APURÍMAC';
    headerCell1.font = {
      bold: true,
      size: 16,
      color: { argb: 'FF1E3A8A' },
      name: 'Segoe UI'
    };
    headerCell1.alignment = { horizontal: 'center', vertical: 'middle' };

    // Subtítulo institucional (ajustado a 15 columnas)
    worksheet.mergeCells('A2:O2');
    const headerCell2 = worksheet.getCell('A2');
    headerCell2.value = 'DIRECCIÓN REGIONAL DE SALUD APURÍMAC';
    headerCell2.font = {
      bold: true,
      size: 14,
      color: { argb: 'FF374151' },
      name: 'Segoe UI'
    };
    headerCell2.alignment = { horizontal: 'center', vertical: 'middle' };

    // Título del reporte (ajustado a 15 columnas)
    worksheet.mergeCells('A3:O3');
    const titleCell = worksheet.getCell('A3');
    titleCell.value = `MOVIMIENTOS MENSUALES - ${vacuna.nombre.toUpperCase()}`;
    titleCell.font = {
      bold: true,
      size: 16,
      color: { argb: 'FF1F2937' },
      name: 'Segoe UI'
    };
    titleCell.alignment = { horizontal: 'center', vertical: 'middle' };

    // Período del reporte (ajustado a 15 columnas)
    worksheet.mergeCells('A4:O4');
    const periodCell = worksheet.getCell('A4');
    periodCell.value = `PERÍODO: ${this.getMesNombre(config.mes).toUpperCase()} ${config.anio}`;
    periodCell.font = {
      bold: true,
      size: 14,
      color: { argb: 'FF059669' },
      name: 'Segoe UI'
    };
    periodCell.alignment = { horizontal: 'center', vertical: 'middle' };

    // Información adicional
    worksheet.mergeCells('A6:H6');
    const infoCell1 = worksheet.getCell('A6');
    infoCell1.value = `📋 Responsable: ${config.responsableReporte}`;
    infoCell1.font = { size: 11, name: 'Segoe UI', color: { argb: 'FF374151' } };

    worksheet.mergeCells('I6:O6');
    const infoCell2 = worksheet.getCell('I6');
    infoCell2.value = `📅 Generado: ${new Date().toLocaleDateString('es-PE')} ${new Date().toLocaleTimeString('es-PE')}`;
    infoCell2.font = { size: 11, name: 'Segoe UI', color: { argb: 'FF374151' } };
    infoCell2.alignment = { horizontal: 'right' };

    // Observaciones si existen
    if (config.observaciones) {
      worksheet.mergeCells('A7:O7');
      const obsCell = worksheet.getCell('A7');
      obsCell.value = `💬 Observaciones: ${config.observaciones}`;
      obsCell.font = { size: 10, name: 'Segoe UI', color: { argb: 'FF6B7280' }, italic: true };
    }

    // Configurar altura de filas del encabezado
    worksheet.getRow(1).height = 25;
    worksheet.getRow(2).height = 20;
    worksheet.getRow(3).height = 25;
    worksheet.getRow(4).height = 20;
    worksheet.getRow(6).height = 18;
    if (config.observaciones) {
      worksheet.getRow(7).height = 16;
    }
  }

  /**
   * Agregar datos de movimientos con colores por centro de acopio
   */
  private static agregarDatosMovimientos(
    worksheet: ExcelJS.Worksheet,
    datos: MovimientoExportData[],
    filaInicio: number
  ): void {
    // Encabezados de la tabla (sin Observaciones)
    const encabezados = [
      'Código',
      'Establecimiento',
      'Centro de Acopio',
      'Saldo Anterior',
      'Trans. Ingreso',
      'Total Saldo',
      'Salida',
      'Trans. Salida',
      'Saldo',
      'Entrega Base',
      'Entregas Adic.',
      'Entrega Total',
      'Stock',
      'Prom. Consumo',
      'Disponibilidad'
    ];

    // Agregar encabezados con estilo profesional
    encabezados.forEach((encabezado, index) => {
      const cell = worksheet.getCell(filaInicio, index + 1);
      cell.value = encabezado;
      cell.font = {
        bold: true,
        size: 12,
        color: { argb: 'FFFFFFFF' },
        name: 'Segoe UI'
      };
      cell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FF1F2937' }
      };
      cell.alignment = {
        horizontal: 'center',
        vertical: 'middle'
      };
      cell.border = {
        top: { style: 'thin', color: { argb: 'FF374151' } },
        left: { style: 'thin', color: { argb: 'FF374151' } },
        bottom: { style: 'thin', color: { argb: 'FF374151' } },
        right: { style: 'thin', color: { argb: 'FF374151' } }
      };
    });

    // Configurar altura de fila de encabezados
    worksheet.getRow(filaInicio).height = 25;

    // Agregar fila de totales inmediatamente después de los encabezados
    const filaTotales = filaInicio + 1;
    this.agregarFilaTotales(worksheet, datos, filaTotales);

    // Agregar datos con colores por centro de acopio (empezando después de la fila de totales)
    let filaActual = filaInicio + 2; // +1 para encabezados, +1 para totales
    datos.forEach((dato) => {
      // Obtener colores del centro de acopio
      const colores = getColoresCentroAcopioExcel(dato.establecimiento.centroAcopio || 'DEFAULT');

      // Calcular total de entregas adicionales
      const totalEntregasAdicionales = dato.entregasAdicionales.reduce((sum, ea) => sum + ea.cantidad, 0);

      // Datos de la fila (sin observaciones)
      const filaDatos = [
        dato.establecimiento.codigo,
        dato.establecimiento.nombre,
        dato.establecimiento.centroAcopio,
        dato.saldoAnterior,
        dato.transIngreso,
        dato.totalSaldo,
        dato.salida,
        dato.transSalida,
        dato.saldo,
        dato.entregaBase,
        totalEntregasAdicionales,
        dato.entregaTotal,
        dato.stock,
        dato.promedioConsumo,
        dato.disponibilidad
      ];

      // Agregar fila con datos
      const row = worksheet.addRow(filaDatos);

      // Aplicar estilos con colores del centro de acopio
      row.eachCell((cell, colNumber) => {
        // Color de fondo según centro de acopio
        cell.fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: colores.bg }
        };

        // Color de texto
        cell.font = {
          size: 11,
          name: 'Segoe UI',
          color: { argb: colores.text }
        };

        // Alineación según tipo de columna
        if (colNumber >= 4 && colNumber <= 15) { // Columnas numéricas (ajustado sin observaciones)
          cell.alignment = { horizontal: 'center', vertical: 'middle' };
          cell.numFmt = '#,##0';
        } else if (colNumber === 2) { // Nombre del establecimiento
          cell.alignment = { horizontal: 'left', vertical: 'middle' };
        } else {
          cell.alignment = { horizontal: 'center', vertical: 'middle' };
        }

        // Bordes
        cell.border = {
          top: { style: 'thin', color: { argb: 'FFE5E7EB' } },
          left: { style: 'thin', color: { argb: 'FFE5E7EB' } },
          bottom: { style: 'thin', color: { argb: 'FFE5E7EB' } },
          right: { style: 'thin', color: { argb: 'FFE5E7EB' } }
        };
      });

      // Configurar altura de fila
      row.height = 20;
      filaActual++;
    });

    // Agregar fila de totales
    this.agregarFilaTotales(worksheet, datos, filaActual);
  }

  /**
   * Agregar fila de totales
   */
  private static agregarFilaTotales(
    worksheet: ExcelJS.Worksheet,
    datos: MovimientoExportData[],
    fila: number
  ): void {
    // Calcular totales
    const totales = datos.reduce((acc, dato) => ({
      saldoAnterior: acc.saldoAnterior + dato.saldoAnterior,
      transIngreso: acc.transIngreso + dato.transIngreso,
      totalSaldo: acc.totalSaldo + dato.totalSaldo,
      salida: acc.salida + dato.salida,
      transSalida: acc.transSalida + dato.transSalida,
      saldo: acc.saldo + dato.saldo,
      entregaBase: acc.entregaBase + dato.entregaBase,
      entregasAdicionales: acc.entregasAdicionales + dato.entregasAdicionales.reduce((sum, ea) => sum + ea.cantidad, 0),
      entregaTotal: acc.entregaTotal + dato.entregaTotal,
      stock: acc.stock + dato.stock
    }), {
      saldoAnterior: 0,
      transIngreso: 0,
      totalSaldo: 0,
      salida: 0,
      transSalida: 0,
      saldo: 0,
      entregaBase: 0,
      entregasAdicionales: 0,
      entregaTotal: 0,
      stock: 0
    });

    // Datos de la fila de totales (sin observaciones)
    const filaTotales = [
      '',
      'TOTALES GENERALES',
      `${datos.length} establecimientos`,
      totales.saldoAnterior,
      totales.transIngreso,
      totales.totalSaldo,
      totales.salida,
      totales.transSalida,
      totales.saldo,
      totales.entregaBase,
      totales.entregasAdicionales,
      totales.entregaTotal,
      totales.stock,
      '', // Promedio consumo
      '' // Disponibilidad
    ];

    // Agregar fila de totales en la posición específica
    filaTotales.forEach((valor, index) => {
      const cell = worksheet.getCell(fila, index + 1);
      cell.value = valor;
    });

    const row = worksheet.getRow(fila);

    // Aplicar estilos especiales para totales
    row.eachCell((cell, colNumber) => {
      cell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FF1E40AF' }
      };

      cell.font = {
        bold: true,
        size: 12,
        name: 'Segoe UI',
        color: { argb: 'FFFFFFFF' }
      };

      if (colNumber >= 4 && colNumber <= 13) { // Columnas numéricas
        cell.alignment = { horizontal: 'center', vertical: 'middle' };
        cell.numFmt = '#,##0';
      } else {
        cell.alignment = { horizontal: 'center', vertical: 'middle' };
      }

      cell.border = {
        top: { style: 'thick', color: { argb: 'FF1E40AF' } },
        left: { style: 'thin', color: { argb: 'FF1E40AF' } },
        bottom: { style: 'thick', color: { argb: 'FF1E40AF' } },
        right: { style: 'thin', color: { argb: 'FF1E40AF' } }
      };
    });

    row.height = 25;
  }

  /**
   * Aplicar estilos profesionales finales
   */
  private static aplicarEstilosProfesionales(worksheet: ExcelJS.Worksheet): void {
    // Auto-ajustar columnas para mejor visualización (sin observaciones)
    worksheet.columns.forEach((column, index) => {
      if (index === 0) { // Código
        column.width = 18;
      } else if (index === 1) { // Establecimiento
        column.width = 50;
      } else if (index === 2) { // Centro de Acopio
        column.width = 30;
      } else if (index >= 3 && index <= 14) { // Columnas numéricas (ajustado para 15 columnas sin observaciones)
        column.width = 15;
      }
    });

    // Auto-ajustar todas las columnas al contenido para asegurar visibilidad completa
    worksheet.columns.forEach((column, index) => {
      let maxLength = 0;

      // Revisar todas las celdas de la columna para encontrar el contenido más largo
      worksheet.eachRow((row, _rowNumber) => {
        const cell = row.getCell(index + 1);
        if (cell.value) {
          const cellLength = cell.value.toString().length;
          if (cellLength > maxLength) {
            maxLength = cellLength;
          }
        }
      });

      // Establecer ancho mínimo y máximo apropiado
      const minWidth = index === 1 ? 35 : index === 2 ? 25 : 12; // Establecimiento y Centro de Acopio más anchos
      const maxWidth = index === 1 ? 60 : index === 2 ? 35 : 20; // Límites máximos

      // Calcular ancho óptimo con padding
      const optimalWidth = Math.max(minWidth, Math.min(maxWidth, maxLength + 3));
      column.width = optimalWidth;
    });

    // Congelar paneles para mejor navegación (incluir fila de totales)
    worksheet.views = [{
      state: 'frozen' as const,
      xSplit: 3, // Congelar las primeras 3 columnas (Código, Establecimiento, Centro de Acopio)
      ySplit: 12, // Congelar encabezados + fila de totales (11 filas de encabezado + 1 fila de totales)
      showGridLines: false,
      showRowColHeaders: true, // Activar encabezados de filas y columnas
      zoomScale: 85
    }];
  }

  /**
   * Obtener nombre del mes
   */
  private static getMesNombre(mes: number): string {
    const meses = [
      'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
      'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
    ];
    return meses[mes - 1] || 'Mes Inválido';
  }

  /**
   * Generar nombre de archivo para vacuna específica
   */
  private static generarNombreArchivo(vacuna: any, config: MovimientosExportConfig): string {
    const mesNombre = this.getMesNombre(config.mes);
    const fechaHora = new Date().toISOString().slice(0, 16).replace(/[:-]/g, '');
    const vacunaNombre = vacuna.nombre.replace(/[^a-zA-Z0-9]/g, '_');

    return `Movimientos_${vacunaNombre}_${mesNombre}_${config.anio}_${fechaHora}.xlsx`;
  }

  /**
   * Generar nombre de archivo general
   */
  private static generarNombreArchivoGeneral(config: MovimientosExportConfig): string {
    const mesNombre = this.getMesNombre(config.mes);
    const fechaHora = new Date().toISOString().slice(0, 16).replace(/[:-]/g, '');

    return `Movimientos_Todas_Vacunas_${mesNombre}_${config.anio}_${fechaHora}.xlsx`;
  }
}