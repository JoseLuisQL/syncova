import ExcelJS from 'exceljs';
import { ServiceResult } from '@/types';
import { 
  PlanificacionReportesService,
  PlanificacionReportesFilters,
  ProgramacionAnualData,
  CumplimientoMetasData,
  ProyeccionDemandaData,
  DistribucionGeograficaData
} from './PlanificacionReportesService';
import {
  getColoresCentroAcopioExcel
} from '@/utils/centroAcopioUtils';

/**
 * Configuración para exportación de reportes de planificación
 */
export interface PlanificacionReportesExportConfig {
  anio: number;
  vacunaId?: string;
  centroAcopioId?: string;
  responsableReporte: string;
  observaciones?: string;
  tipoReporte: 'programacion_anual' | 'cumplimiento_metas' | 'proyeccion_demanda' | 'distribucion_geografica';
}

/**
 * Resultado de exportación Excel
 */
export interface PlanificacionReportesExcelResult {
  workbook: ExcelJS.Workbook;
  filename: string;
  size: number;
}

/**
 * Servicio para exportación de reportes de planificación a Excel
 * Implementa diseño profesional siguiendo el patrón de PlanificacionExportService
 */
export class PlanificacionReportesExportService {
  /**
   * Exportar reporte de programación anual
   */
  static async exportarProgramacionAnual(
    config: PlanificacionReportesExportConfig
  ): Promise<ServiceResult<PlanificacionReportesExcelResult>> {
    try {
      console.log('🔄 Exportando reporte de programación anual a Excel:', config);

      // Obtener datos del reporte
      const filters: PlanificacionReportesFilters = {
        anio: config.anio,
        ...(config.vacunaId && { vacunaId: config.vacunaId }),
        ...(config.centroAcopioId && { centroAcopioId: config.centroAcopioId })
      };

      const result = await PlanificacionReportesService.generarProgramacionAnual(filters);
      if (!result.success || !result.data) {
        return {
          success: false,
          error: result.error || 'Error al obtener datos del reporte'
        };
      }

      // Crear workbook con diseño profesional
      const workbook = new ExcelJS.Workbook();
      workbook.creator = 'SIVAC - Sistema de Vacunación';
      workbook.created = new Date();
      workbook.company = 'Gobierno Regional de Apurímac';

      // Crear hoja principal
      const worksheet = workbook.addWorksheet('Programación Anual');

      // Configurar diseño profesional de la hoja
      this.configurarHojaProfesional(worksheet);

      // Agregar encabezado institucional
      this.agregarEncabezadoInstitucional(worksheet, 'Programación Anual', config);

      // Agregar datos de programación
      this.agregarDatosProgramacionAnual(worksheet, result.data, 11);

      // Aplicar estilos profesionales
      this.aplicarEstilosProfesionales(worksheet);

      // Generar nombre de archivo
      const filename = this.generarNombreArchivo('programacion_anual', config);

      console.log('✅ Exportación de programación anual generada exitosamente');

      return {
        success: true,
        data: {
          workbook,
          filename,
          size: 0 // Se calculará al escribir
        }
      };
    } catch (error) {
      console.error('❌ Error al exportar programación anual:', error);
      return {
        success: false,
        error: 'Error al generar exportación de programación anual'
      };
    }
  }

  /**
   * Exportar reporte de cumplimiento de metas
   */
  static async exportarCumplimientoMetas(
    config: PlanificacionReportesExportConfig
  ): Promise<ServiceResult<PlanificacionReportesExcelResult>> {
    try {
      console.log('🔄 Exportando reporte de cumplimiento de metas a Excel:', config);

      // Obtener datos del reporte
      const filters: PlanificacionReportesFilters = {
        anio: config.anio,
        ...(config.vacunaId && { vacunaId: config.vacunaId }),
        ...(config.centroAcopioId && { centroAcopioId: config.centroAcopioId })
      };

      const result = await PlanificacionReportesService.generarCumplimientoMetas(filters);
      if (!result.success || !result.data) {
        return {
          success: false,
          error: result.error || 'Error al obtener datos del reporte'
        };
      }

      // Crear workbook con diseño profesional
      const workbook = new ExcelJS.Workbook();
      workbook.creator = 'SIVAC - Sistema de Vacunación';
      workbook.created = new Date();
      workbook.company = 'Gobierno Regional de Apurímac';

      // Crear hoja principal
      const worksheet = workbook.addWorksheet('Cumplimiento de Metas');

      // Configurar diseño profesional de la hoja
      this.configurarHojaProfesional(worksheet);

      // Agregar encabezado institucional
      this.agregarEncabezadoInstitucional(worksheet, 'Cumplimiento de Metas', config);

      // Agregar datos de cumplimiento
      this.agregarDatosCumplimientoMetas(worksheet, result.data, 11);

      // Aplicar estilos profesionales
      this.aplicarEstilosProfesionales(worksheet);

      // Generar nombre de archivo
      const filename = this.generarNombreArchivo('cumplimiento_metas', config);

      console.log('✅ Exportación de cumplimiento de metas generada exitosamente');

      return {
        success: true,
        data: {
          workbook,
          filename,
          size: 0 // Se calculará al escribir
        }
      };
    } catch (error) {
      console.error('❌ Error al exportar cumplimiento de metas:', error);
      return {
        success: false,
        error: 'Error al generar exportación de cumplimiento de metas'
      };
    }
  }

  /**
   * Exportar reporte de proyección de demanda
   */
  static async exportarProyeccionDemanda(
    config: PlanificacionReportesExportConfig
  ): Promise<ServiceResult<PlanificacionReportesExcelResult>> {
    try {
      console.log('🔄 Exportando reporte de proyección de demanda a Excel:', config);

      // Obtener datos del reporte
      const filters: PlanificacionReportesFilters = {
        anio: config.anio,
        ...(config.vacunaId && { vacunaId: config.vacunaId }),
        ...(config.centroAcopioId && { centroAcopioId: config.centroAcopioId })
      };

      const result = await PlanificacionReportesService.generarProyeccionDemanda(filters);
      if (!result.success || !result.data) {
        return {
          success: false,
          error: result.error || 'Error al obtener datos del reporte'
        };
      }

      // Crear workbook con diseño profesional
      const workbook = new ExcelJS.Workbook();
      workbook.creator = 'SIVAC - Sistema de Vacunación';
      workbook.created = new Date();
      workbook.company = 'Gobierno Regional de Apurímac';

      // Crear hoja principal
      const worksheet = workbook.addWorksheet('Proyección de Demanda');

      // Configurar diseño profesional de la hoja
      this.configurarHojaProfesional(worksheet);

      // Agregar encabezado institucional
      this.agregarEncabezadoInstitucional(worksheet, 'Proyección de Demanda', config);

      // Agregar datos de proyección
      this.agregarDatosProyeccionDemanda(worksheet, result.data, 11);

      // Aplicar estilos profesionales
      this.aplicarEstilosProfesionales(worksheet);

      // Generar nombre de archivo
      const filename = this.generarNombreArchivo('proyeccion_demanda', config);

      console.log('✅ Exportación de proyección de demanda generada exitosamente');

      return {
        success: true,
        data: {
          workbook,
          filename,
          size: 0 // Se calculará al escribir
        }
      };
    } catch (error) {
      console.error('❌ Error al exportar proyección de demanda:', error);
      return {
        success: false,
        error: 'Error al generar exportación de proyección de demanda'
      };
    }
  }

  /**
   * Exportar reporte de distribución geográfica
   */
  static async exportarDistribucionGeografica(
    config: PlanificacionReportesExportConfig
  ): Promise<ServiceResult<PlanificacionReportesExcelResult>> {
    try {
      console.log('🔄 Exportando reporte de distribución geográfica a Excel:', config);

      // Obtener datos del reporte
      const filters: PlanificacionReportesFilters = {
        anio: config.anio,
        ...(config.vacunaId && { vacunaId: config.vacunaId }),
        ...(config.centroAcopioId && { centroAcopioId: config.centroAcopioId })
      };

      const result = await PlanificacionReportesService.generarDistribucionGeografica(filters);
      if (!result.success || !result.data) {
        return {
          success: false,
          error: result.error || 'Error al obtener datos del reporte'
        };
      }

      // Crear workbook con diseño profesional
      const workbook = new ExcelJS.Workbook();
      workbook.creator = 'SIVAC - Sistema de Vacunación';
      workbook.created = new Date();
      workbook.company = 'Gobierno Regional de Apurímac';

      // Crear hoja principal
      const worksheet = workbook.addWorksheet('Distribución Geográfica');

      // Configurar diseño profesional de la hoja
      this.configurarHojaProfesional(worksheet);

      // Agregar encabezado institucional
      this.agregarEncabezadoInstitucional(worksheet, 'Distribución Geográfica', config);

      // Agregar datos de distribución
      this.agregarDatosDistribucionGeografica(worksheet, result.data, 11);

      // Aplicar estilos profesionales
      this.aplicarEstilosProfesionales(worksheet);

      // Generar nombre de archivo
      const filename = this.generarNombreArchivo('distribucion_geografica', config);

      console.log('✅ Exportación de distribución geográfica generada exitosamente');

      return {
        success: true,
        data: {
          workbook,
          filename,
          size: 0 // Se calculará al escribir
        }
      };
    } catch (error) {
      console.error('❌ Error al exportar distribución geográfica:', error);
      return {
        success: false,
        error: 'Error al generar exportación de distribución geográfica'
      };
    }
  }

  /**
   * Configurar diseño profesional de la hoja
   */
  private static configurarHojaProfesional(worksheet: ExcelJS.Worksheet): void {
    // Configurar página
    worksheet.pageSetup = {
      paperSize: 9, // A4
      orientation: 'landscape',
      fitToPage: true,
      fitToWidth: 1,
      fitToHeight: 0,
      margins: {
        left: 0.7,
        right: 0.7,
        top: 0.75,
        bottom: 0.75,
        header: 0.3,
        footer: 0.3
      }
    };

    // Configurar vista
    worksheet.views = [{
      state: 'frozen',
      xSplit: 0,
      ySplit: 10, // Congelar las primeras 10 filas (encabezado)
      showGridLines: true,
      zoomScale: 85
    }];

    // Configurar propiedades de impresión
    worksheet.headerFooter.oddHeader = '&C&"Arial,Bold"&14SIVAC - Sistema de Vacunación';
    worksheet.headerFooter.oddFooter = '&L&"Arial"&10Página &P de &N&R&"Arial"&10&D &T';
  }

  /**
   * Agregar encabezado institucional
   */
  private static agregarEncabezadoInstitucional(
    worksheet: ExcelJS.Worksheet,
    tipoReporte: string,
    config: PlanificacionReportesExportConfig
  ): void {
    // Título principal
    worksheet.mergeCells('A1:P1');
    const tituloCell = worksheet.getCell('A1');
    tituloCell.value = 'GOBIERNO REGIONAL DE APURÍMAC';
    tituloCell.font = { name: 'Arial', size: 16, bold: true, color: { argb: '1F4E79' } };
    tituloCell.alignment = { horizontal: 'center', vertical: 'middle' };
    tituloCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'E7F3FF' } };

    // Subtítulo
    worksheet.mergeCells('A2:P2');
    const subtituloCell = worksheet.getCell('A2');
    subtituloCell.value = 'DIRECCIÓN REGIONAL DE SALUD - SIVAC';
    subtituloCell.font = { name: 'Arial', size: 14, bold: true, color: { argb: '1F4E79' } };
    subtituloCell.alignment = { horizontal: 'center', vertical: 'middle' };
    subtituloCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'F0F8FF' } };

    // Título del reporte
    worksheet.mergeCells('A4:P4');
    const reporteTituloCell = worksheet.getCell('A4');
    reporteTituloCell.value = `REPORTE DE ${tipoReporte.toUpperCase()}`;
    reporteTituloCell.font = { name: 'Arial', size: 14, bold: true, color: { argb: '2F5597' } };
    reporteTituloCell.alignment = { horizontal: 'center', vertical: 'middle' };
    reporteTituloCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'D9E7F2' } };

    // Información del reporte
    worksheet.getCell('A6').value = 'Año:';
    worksheet.getCell('B6').value = config.anio;
    worksheet.getCell('A7').value = 'Fecha de generación:';
    worksheet.getCell('B7').value = new Date().toLocaleDateString('es-PE');
    worksheet.getCell('A8').value = 'Responsable:';
    worksheet.getCell('B8').value = config.responsableReporte;

    if (config.observaciones) {
      worksheet.getCell('A9').value = 'Observaciones:';
      worksheet.getCell('B9').value = config.observaciones;
    }

    // Aplicar estilos a las etiquetas
    ['A6', 'A7', 'A8', 'A9'].forEach(cell => {
      const cellObj = worksheet.getCell(cell);
      cellObj.font = { name: 'Arial', size: 10, bold: true };
      cellObj.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'F2F2F2' } };
    });

    // Aplicar estilos a los valores
    ['B6', 'B7', 'B8', 'B9'].forEach(cell => {
      const cellObj = worksheet.getCell(cell);
      cellObj.font = { name: 'Arial', size: 10 };
    });
  }

  /**
   * Agregar datos de programación anual
   */
  private static agregarDatosProgramacionAnual(
    worksheet: ExcelJS.Worksheet,
    datos: ProgramacionAnualData[],
    startRow: number
  ): void {
    // Encabezados de columnas
    const headers = [
      'Centro de Acopio',
      'Establecimiento',
      'Código',
      'Tipo',
      'Vacuna',
      'Meta Anual',
      'Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun',
      'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic',
      'Estado',
      'Observaciones'
    ];

    // Agregar encabezados
    headers.forEach((header, index) => {
      const cell = worksheet.getCell(startRow, index + 1);
      cell.value = header;
      cell.font = { name: 'Arial', size: 10, bold: true, color: { argb: 'FFFFFF' } };
      cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: '4472C4' } };
      cell.alignment = { horizontal: 'center', vertical: 'middle', wrapText: true };
      cell.border = {
        top: { style: 'thin' },
        left: { style: 'thin' },
        bottom: { style: 'thin' },
        right: { style: 'thin' }
      };
    });

    // Agrupar datos por centro de acopio
    const datosPorCentro = new Map<string, ProgramacionAnualData[]>();

    datos.forEach(dato => {
      const centroNombre = dato.establecimiento.centroAcopio || 'Sin Centro Asignado';
      if (!datosPorCentro.has(centroNombre)) {
        datosPorCentro.set(centroNombre, []);
      }
      datosPorCentro.get(centroNombre)!.push(dato);
    });

    // Ordenar centros de acopio
    const centrosOrdenados = Array.from(datosPorCentro.keys()).sort((a, b) => {
      const nombreA = a || '';
      const nombreB = b || '';
      return nombreA.localeCompare(nombreB);
    });

    let currentRow = startRow + 1;

    for (const centroNombre of centrosOrdenados) {
      const establecimientosData = datosPorCentro.get(centroNombre) || [];
      const colores = getColoresCentroAcopioExcel(centroNombre);

      // Ordenar establecimientos dentro del centro
      const establecimientosOrdenados = establecimientosData.sort((a, b) => {
        const nombreA = a.establecimiento.nombre || '';
        const nombreB = b.establecimiento.nombre || '';
        return nombreA.localeCompare(nombreB);
      });

      for (const dato of establecimientosOrdenados) {
        const row = worksheet.getRow(currentRow);

        // Llenar datos
        row.getCell(1).value = dato.establecimiento.centroAcopio || 'Sin asignar';
        row.getCell(2).value = dato.establecimiento.nombre;
        row.getCell(3).value = dato.establecimiento.codigo;
        row.getCell(4).value = dato.establecimiento.tipo;
        row.getCell(5).value = dato.vacuna.nombre;
        row.getCell(6).value = dato.metaAnual;

        // Distribución mensual
        dato.distribucionMensual.forEach((cantidad, index) => {
          row.getCell(7 + index).value = cantidad;
        });

        row.getCell(19).value = dato.estado;
        row.getCell(20).value = dato.observaciones || '';

        // Aplicar estilos
        for (let col = 1; col <= 20; col++) {
          const cell = row.getCell(col);
          cell.font = { name: 'Arial', size: 9 };
          cell.alignment = { horizontal: col >= 6 && col <= 18 ? 'center' : 'left', vertical: 'middle' };
          cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: colores.bg } };
          cell.border = {
            top: { style: 'thin' },
            left: { style: 'thin' },
            bottom: { style: 'thin' },
            right: { style: 'thin' }
          };

          // Formato numérico para cantidades
          if (col >= 6 && col <= 18) {
            cell.numFmt = '#,##0';
          }
        }

        currentRow++;
      }
    }

    // Ajustar ancho de columnas
    worksheet.columns = [
      { width: 20 }, // Centro de Acopio
      { width: 25 }, // Establecimiento
      { width: 12 }, // Código
      { width: 15 }, // Tipo
      { width: 20 }, // Vacuna
      { width: 12 }, // Meta Anual
      { width: 8 }, { width: 8 }, { width: 8 }, { width: 8 }, // Ene-Abr
      { width: 8 }, { width: 8 }, { width: 8 }, { width: 8 }, // May-Ago
      { width: 8 }, { width: 8 }, { width: 8 }, { width: 8 }, // Sep-Dic
      { width: 12 }, // Estado
      { width: 25 }  // Observaciones
    ];
  }

  /**
   * Agregar datos de cumplimiento de metas
   */
  private static agregarDatosCumplimientoMetas(
    worksheet: ExcelJS.Worksheet,
    datos: CumplimientoMetasData[],
    startRow: number
  ): void {
    // Encabezados de columnas
    const headers = [
      'Centro de Acopio',
      'Establecimiento',
      'Vacuna',
      'Meta Anual',
      'Programado Acum.',
      'Entregado Acum.',
      '% Cumplimiento',
      'Diferencia',
      'Tendencia',
      'Proyección Anual',
      'Alertas'
    ];

    // Agregar encabezados
    headers.forEach((header, index) => {
      const cell = worksheet.getCell(startRow, index + 1);
      cell.value = header;
      cell.font = { name: 'Arial', size: 10, bold: true, color: { argb: 'FFFFFF' } };
      cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: '70AD47' } };
      cell.alignment = { horizontal: 'center', vertical: 'middle', wrapText: true };
      cell.border = {
        top: { style: 'thin' },
        left: { style: 'thin' },
        bottom: { style: 'thin' },
        right: { style: 'thin' }
      };
    });

    // Agrupar datos por centro de acopio
    const datosPorCentro = new Map<string, CumplimientoMetasData[]>();

    datos.forEach(dato => {
      const centroNombre = dato.establecimiento.centroAcopio || 'Sin Centro Asignado';
      if (!datosPorCentro.has(centroNombre)) {
        datosPorCentro.set(centroNombre, []);
      }
      datosPorCentro.get(centroNombre)!.push(dato);
    });

    // Ordenar centros de acopio
    const centrosOrdenados = Array.from(datosPorCentro.keys()).sort((a, b) => {
      const nombreA = a || '';
      const nombreB = b || '';
      return nombreA.localeCompare(nombreB);
    });

    let currentRow = startRow + 1;

    for (const centroNombre of centrosOrdenados) {
      const establecimientosData = datosPorCentro.get(centroNombre) || [];
      const colores = getColoresCentroAcopioExcel(centroNombre);

      // Ordenar establecimientos dentro del centro
      const establecimientosOrdenados = establecimientosData.sort((a, b) => {
        const nombreA = a.establecimiento.nombre || '';
        const nombreB = b.establecimiento.nombre || '';
        return nombreA.localeCompare(nombreB);
      });

      for (const dato of establecimientosOrdenados) {
        const row = worksheet.getRow(currentRow);

        // Llenar datos
        row.getCell(1).value = dato.establecimiento.centroAcopio || 'Sin asignar';
        row.getCell(2).value = dato.establecimiento.nombre;
        row.getCell(3).value = dato.vacuna.nombre;
        row.getCell(4).value = dato.metaAnual;
        row.getCell(5).value = dato.programadoAcumulado;
        row.getCell(6).value = dato.entregadoAcumulado;
        row.getCell(7).value = dato.porcentajeCumplimiento;
        row.getCell(8).value = dato.diferencia;
        row.getCell(9).value = dato.tendencia;
        row.getCell(10).value = dato.proyeccionAnual;
        row.getCell(11).value = dato.alertas.join('; ');

        // Aplicar estilos
        for (let col = 1; col <= 11; col++) {
          const cell = row.getCell(col);
          cell.font = { name: 'Arial', size: 9 };
          cell.alignment = { horizontal: col >= 4 && col <= 10 ? 'center' : 'left', vertical: 'middle' };
          cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: colores.bg } };
          cell.border = {
            top: { style: 'thin' },
            left: { style: 'thin' },
            bottom: { style: 'thin' },
            right: { style: 'thin' }
          };

          // Formato numérico
          if (col >= 4 && col <= 6 || col === 8 || col === 10) {
            cell.numFmt = '#,##0';
          } else if (col === 7) {
            cell.numFmt = '0.00%';
            cell.value = dato.porcentajeCumplimiento / 100;
          }

          // Colores condicionales para cumplimiento
          if (col === 7) {
            if (dato.porcentajeCumplimiento >= 95) {
              cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'C6EFCE' } };
            } else if (dato.porcentajeCumplimiento < 80) {
              cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFC7CE' } };
            }
          }
        }

        currentRow++;
      }
    }

    // Ajustar ancho de columnas
    worksheet.columns = [
      { width: 20 }, // Centro de Acopio
      { width: 25 }, // Establecimiento
      { width: 20 }, // Vacuna
      { width: 12 }, // Meta Anual
      { width: 15 }, // Programado Acum.
      { width: 15 }, // Entregado Acum.
      { width: 12 }, // % Cumplimiento
      { width: 12 }, // Diferencia
      { width: 12 }, // Tendencia
      { width: 15 }, // Proyección Anual
      { width: 30 }  // Alertas
    ];
  }

  /**
   * Agregar datos de proyección de demanda
   */
  private static agregarDatosProyeccionDemanda(
    worksheet: ExcelJS.Worksheet,
    datos: ProyeccionDemandaData[],
    startRow: number
  ): void {
    // Encabezados de columnas
    const headers = [
      'Centro de Acopio',
      'Establecimiento',
      'Vacuna',
      'Promedio Mensual',
      'Tendencia',
      'Proyección Próximo Año',
      'Factor Estacionalidad',
      'Recomendación Stock',
      'Nivel de Riesgo',
      'Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun',
      'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'
    ];

    // Agregar encabezados
    headers.forEach((header, index) => {
      const cell = worksheet.getCell(startRow, index + 1);
      cell.value = header;
      cell.font = { name: 'Arial', size: 10, bold: true, color: { argb: 'FFFFFF' } };
      cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFC000' } };
      cell.alignment = { horizontal: 'center', vertical: 'middle', wrapText: true };
      cell.border = {
        top: { style: 'thin' },
        left: { style: 'thin' },
        bottom: { style: 'thin' },
        right: { style: 'thin' }
      };
    });

    // Agrupar datos por centro de acopio
    const datosPorCentro = new Map<string, ProyeccionDemandaData[]>();

    datos.forEach(dato => {
      const centroNombre = dato.establecimiento.centroAcopio || 'Sin Centro Asignado';
      if (!datosPorCentro.has(centroNombre)) {
        datosPorCentro.set(centroNombre, []);
      }
      datosPorCentro.get(centroNombre)!.push(dato);
    });

    // Ordenar centros de acopio
    const centrosOrdenados = Array.from(datosPorCentro.keys()).sort((a, b) => {
      const nombreA = a || '';
      const nombreB = b || '';
      return nombreA.localeCompare(nombreB);
    });

    let currentRow = startRow + 1;

    for (const centroNombre of centrosOrdenados) {
      const establecimientosData = datosPorCentro.get(centroNombre) || [];
      const colores = getColoresCentroAcopioExcel(centroNombre);

      // Ordenar establecimientos dentro del centro
      const establecimientosOrdenados = establecimientosData.sort((a, b) => {
        const nombreA = a.establecimiento.nombre || '';
        const nombreB = b.establecimiento.nombre || '';
        return nombreA.localeCompare(nombreB);
      });

      for (const dato of establecimientosOrdenados) {
        const row = worksheet.getRow(currentRow);

        // Llenar datos principales
        row.getCell(1).value = dato.establecimiento.centroAcopio || 'Sin asignar';
        row.getCell(2).value = dato.establecimiento.nombre;
        row.getCell(3).value = dato.vacuna.nombre;
        row.getCell(4).value = dato.promedioMensual;
        row.getCell(5).value = dato.tendenciaConsumo;
        row.getCell(6).value = dato.proyeccionProximoAnio;
        row.getCell(7).value = dato.factorEstacionalidad;
        row.getCell(8).value = dato.recomendacionStock;
        row.getCell(9).value = dato.nivelRiesgo;

        // Consumo histórico mensual
        dato.consumoHistorico.forEach((consumo: number, index: number) => {
          row.getCell(10 + index).value = consumo;
        });

        // Aplicar estilos
        for (let col = 1; col <= 21; col++) {
          const cell = row.getCell(col);
          cell.font = { name: 'Arial', size: 9 };
          cell.alignment = { horizontal: col >= 4 && col <= 8 || col >= 10 ? 'center' : 'left', vertical: 'middle' };
          cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: colores.bg } };
          cell.border = {
            top: { style: 'thin' },
            left: { style: 'thin' },
            bottom: { style: 'thin' },
            right: { style: 'thin' }
          };

          // Formato numérico
          if (col >= 4 && col <= 6 || col === 8 || col >= 10) {
            cell.numFmt = '#,##0';
          } else if (col === 7) {
            cell.numFmt = '0.00';
          }

          // Colores condicionales para nivel de riesgo
          if (col === 9) {
            if (dato.nivelRiesgo === 'alto') {
              cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFC7CE' } };
            } else if (dato.nivelRiesgo === 'medio') {
              cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFEB9C' } };
            } else {
              cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'C6EFCE' } };
            }
          }
        }

        currentRow++;
      }
    }
  }

  /**
   * Agregar datos de distribución geográfica
   */
  private static agregarDatosDistribucionGeografica(
    worksheet: ExcelJS.Worksheet,
    datos: DistribucionGeograficaData[],
    startRow: number
  ): void {
    // Encabezados de columnas
    const headers = [
      'Centro de Acopio',
      'Total Establecimientos',
      'Establecimientos Activos',
      'Cobertura Poblacional (%)',
      'Eficiencia Distribución (%)',
      'Tiempo Promedio Entrega (días)',
      'Satisfacción Usuarios (%)',
      'Latitud',
      'Longitud',
      'Vacunas Atendidas',
      'Meta Total',
      'Entregado Total',
      'Cobertura General (%)'
    ];

    // Agregar encabezados
    headers.forEach((header, index) => {
      const cell = worksheet.getCell(startRow, index + 1);
      cell.value = header;
      cell.font = { name: 'Arial', size: 10, bold: true, color: { argb: 'FFFFFF' } };
      cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'E74C3C' } };
      cell.alignment = { horizontal: 'center', vertical: 'middle', wrapText: true };
      cell.border = {
        top: { style: 'thin' },
        left: { style: 'thin' },
        bottom: { style: 'thin' },
        right: { style: 'thin' }
      };
    });

    let currentRow = startRow + 1;

    for (const dato of datos) {
      const row = worksheet.getRow(currentRow);

      // Calcular totales
      const metaTotal = dato.vacunas.reduce((sum, v) => sum + v.metaTotal, 0);
      const entregadoTotal = dato.vacunas.reduce((sum, v) => sum + v.entregadoTotal, 0);
      const coberturaGeneral = metaTotal > 0 ? (entregadoTotal / metaTotal) * 100 : 0;

      // Llenar datos
      row.getCell(1).value = dato.centroAcopio.nombre;
      row.getCell(2).value = dato.totalEstablecimientos;
      row.getCell(3).value = dato.establecimientosActivos;
      row.getCell(4).value = dato.indicadores.coberturaPoblacional;
      row.getCell(5).value = dato.indicadores.eficienciaDistribucion;
      row.getCell(6).value = dato.indicadores.tiempoPromedioEntrega;
      row.getCell(7).value = dato.indicadores.satisfaccionUsuarios;
      row.getCell(8).value = dato.coordenadas?.latitud || '';
      row.getCell(9).value = dato.coordenadas?.longitud || '';
      row.getCell(10).value = dato.vacunas.length;
      row.getCell(11).value = metaTotal;
      row.getCell(12).value = entregadoTotal;
      row.getCell(13).value = coberturaGeneral;

      // Aplicar estilos
      for (let col = 1; col <= 13; col++) {
        const cell = row.getCell(col);
        cell.font = { name: 'Arial', size: 9 };
        cell.alignment = { horizontal: col >= 2 ? 'center' : 'left', vertical: 'middle' };
        cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'F8F9FA' } };
        cell.border = {
          top: { style: 'thin' },
          left: { style: 'thin' },
          bottom: { style: 'thin' },
          right: { style: 'thin' }
        };

        // Formato numérico
        if (col === 2 || col === 3 || col === 10 || col === 11 || col === 12) {
          cell.numFmt = '#,##0';
        } else if (col >= 4 && col <= 7 || col === 13) {
          cell.numFmt = '0.00';
        } else if (col === 8 || col === 9) {
          cell.numFmt = '0.000000';
        }

        // Colores condicionales para cobertura
        if (col === 13) {
          if (coberturaGeneral >= 95) {
            cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'C6EFCE' } };
          } else if (coberturaGeneral < 80) {
            cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFC7CE' } };
          }
        }
      }

      currentRow++;
    }

    // Ajustar ancho de columnas
    worksheet.columns = [
      { width: 25 }, // Centro de Acopio
      { width: 12 }, // Total Establecimientos
      { width: 12 }, // Establecimientos Activos
      { width: 15 }, // Cobertura Poblacional
      { width: 15 }, // Eficiencia Distribución
      { width: 15 }, // Tiempo Promedio Entrega
      { width: 15 }, // Satisfacción Usuarios
      { width: 12 }, // Latitud
      { width: 12 }, // Longitud
      { width: 12 }, // Vacunas Atendidas
      { width: 12 }, // Meta Total
      { width: 12 }, // Entregado Total
      { width: 15 }  // Cobertura General
    ];
  }

  /**
   * Aplicar estilos profesionales
   */
  private static aplicarEstilosProfesionales(worksheet: ExcelJS.Worksheet): void {
    // Aplicar bordes a todas las celdas con datos
    worksheet.eachRow((row, rowNumber) => {
      if (rowNumber >= 11) { // Desde la fila de datos
        row.eachCell((cell) => {
          if (!cell.border) {
            cell.border = {
              top: { style: 'thin' },
              left: { style: 'thin' },
              bottom: { style: 'thin' },
              right: { style: 'thin' }
            };
          }
        });
      }
    });

    // Configurar altura de filas
    worksheet.getRow(1).height = 25; // Título principal
    worksheet.getRow(2).height = 20; // Subtítulo
    worksheet.getRow(4).height = 20; // Título del reporte
    worksheet.getRow(11).height = 30; // Encabezados de columnas
  }

  /**
   * Generar nombre de archivo
   */
  private static generarNombreArchivo(
    tipoReporte: string,
    config: PlanificacionReportesExportConfig
  ): string {
    const fecha = new Date().toISOString().split('T')[0];
    const tipo = tipoReporte.replace(/_/g, '-');
    return `reporte-planificacion-${tipo}-${config.anio}-${fecha}.xlsx`;
  }
}
