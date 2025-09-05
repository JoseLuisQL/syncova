import ExcelJS from 'exceljs';
import { ServiceResult } from '@/types';
import { PlanificacionService } from './PlanificacionService';
import { EstablecimientoService } from './EstablecimientoService';
import { VacunaService } from './VacunaService';
import {
  ordenarEstablecimientos,
  getCentroAcopioPorNombre,
  getColoresCentroAcopioExcel
} from '@/utils/centroAcopioUtils';

/**
 * Configuración para exportación de planificación
 */
export interface PlanificacionExportConfig {
  anio: number;
  vacunaId?: string; // Si no se especifica, exporta todas las vacunas
  centroAcopioId?: string; // Filtro por centro de acopio
  incluirEstablecimientosSinProgramacion: boolean;
  responsableReporte: string;
  observaciones?: string;
}

/**
 * Resultado de exportación Excel
 */
export interface PlanificacionExcelResult {
  workbook: ExcelJS.Workbook;
  filename: string;
  size: number;
}

/**
 * Datos de planificación para exportación
 */
interface PlanificacionExportData {
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
  distribucionMensual: number[];
  metaAnual: number;
  estado: string;
}

/**
 * Servicio para exportación de planificación a Excel
 * Implementa diseño profesional siguiendo el patrón de ValeExportService
 */
export class PlanificacionExportService {
  /**
   * Exportar planificación por vacuna específica a Excel
   */
  static async exportarPorVacuna(
    config: PlanificacionExportConfig
  ): Promise<ServiceResult<PlanificacionExcelResult>> {
    try {
      console.log('🔄 Exportando planificación por vacuna a Excel:', config);

      if (!config.vacunaId) {
        return {
          success: false,
          error: 'ID de vacuna requerido para exportación por vacuna'
        };
      }

      // Obtener datos de la vacuna
      const vacunaResult = await VacunaService.getById(config.vacunaId);
      if (!vacunaResult.success || !vacunaResult.data) {
        return {
          success: false,
          error: 'Vacuna no encontrada'
        };
      }

      // Obtener planificaciones de la vacuna
      const planificacionesResult = await PlanificacionService.getByVacunaAndYear(
        config.vacunaId,
        config.anio,
        config.centroAcopioId
      );

      if (!planificacionesResult.success) {
        return {
          success: false,
          error: planificacionesResult.error || 'Error al obtener planificaciones'
        };
      }

      // Obtener todos los establecimientos si se requiere incluir los sin programación
      let establecimientos: any[] = [];
      if (config.incluirEstablecimientosSinProgramacion) {
        const establecimientosResult = await EstablecimientoService.getAll({
          centroAcopioId: config.centroAcopioId,
          limit: 1000
        });

        if (establecimientosResult.success) {
          establecimientos = establecimientosResult.data?.establecimientos || [];
        }
      }

      // Procesar datos para exportación
      const datosExportacion = this.procesarDatosPorVacuna(
        planificacionesResult.data || [],
        establecimientos,
        vacunaResult.data,
        config
      );

      // Crear workbook con diseño profesional
      const workbook = new ExcelJS.Workbook();
      workbook.creator = 'SIVAC - Sistema de Vacunación';
      workbook.created = new Date();
      workbook.company = 'Gobierno Regional de Apurímac';

      // Crear hoja principal
      const worksheet = workbook.addWorksheet(`${vacunaResult.data.nombre} ${config.anio}`);

      // Configurar diseño profesional de la hoja
      this.configurarHojaProfesional(worksheet);

      // Agregar encabezado institucional
      this.agregarEncabezadoInstitucional(worksheet, vacunaResult.data, config);

      // Agregar datos de planificación
      this.agregarDatosPlanificacion(worksheet, datosExportacion, 11);

      // Aplicar estilos profesionales
      this.aplicarEstilosProfesionales(worksheet);

      // Generar nombre de archivo
      const filename = this.generarNombreArchivo(vacunaResult.data.nombre, config);

      console.log('✅ Exportación por vacuna generada exitosamente');

      return {
        success: true,
        data: {
          workbook,
          filename,
          size: 0 // Se calculará al escribir
        }
      };

    } catch (error) {
      console.error('❌ Error al exportar planificación por vacuna:', error);
      return {
        success: false,
        error: `Error al generar Excel: ${error instanceof Error ? error.message : 'Error desconocido'}`
      };
    }
  }

  /**
   * Exportar todas las vacunas a Excel (hojas separadas)
   */
  static async exportarTodasVacunas(
    config: PlanificacionExportConfig
  ): Promise<ServiceResult<PlanificacionExcelResult>> {
    try {
      console.log('🔄 Exportando todas las vacunas a Excel:', config);

      // Obtener todas las vacunas activas
      const vacunasResult = await VacunaService.getAll({ estado: 'activo', limit: 100 });
      if (!vacunasResult.success || !vacunasResult.data?.vacunas.length) {
        return {
          success: false,
          error: 'No se encontraron vacunas activas'
        };
      }

      // Crear workbook con diseño profesional
      const workbook = new ExcelJS.Workbook();
      workbook.creator = 'SIVAC - Sistema de Vacunación';
      workbook.created = new Date();
      workbook.company = 'Gobierno Regional de Apurímac';

      // Procesar cada vacuna en una hoja separada
      for (const vacuna of vacunasResult.data.vacunas) {
        await this.agregarHojaVacuna(workbook, vacuna, config);
      }

      // Generar nombre de archivo
      const filename = this.generarNombreArchivoCompleto(config);

      console.log('✅ Exportación de todas las vacunas generada exitosamente');

      return {
        success: true,
        data: {
          workbook,
          filename,
          size: 0 // Se calculará al escribir
        }
      };

    } catch (error) {
      console.error('❌ Error al exportar todas las vacunas:', error);
      return {
        success: false,
        error: `Error al generar Excel: ${error instanceof Error ? error.message : 'Error desconocido'}`
      };
    }
  }

  /**
   * Procesar datos de planificación por vacuna específica
   */
  private static procesarDatosPorVacuna(
    planificaciones: any[],
    establecimientos: any[],
    vacuna: any,
    config: PlanificacionExportConfig
  ): PlanificacionExportData[] {
    const datos: PlanificacionExportData[] = [];
    const planificacionesMap = new Map();

    // Crear mapa de planificaciones existentes
    planificaciones.forEach(p => {
      planificacionesMap.set(p.establecimientoId, p);
    });

    // Obtener lista completa de establecimientos
    let establecimientosCompletos = establecimientos;
    if (!config.incluirEstablecimientosSinProgramacion) {
      establecimientosCompletos = planificaciones.map(p => p.establecimiento);
    }

    // Filtrar establecimientos que no sean centros de acopio
    const establecimientosFiltrados = establecimientosCompletos.filter(e => e.tipo !== 'centro_acopio');

    // Aplicar ordenamiento profesional
    const establecimientosOrdenados = ordenarEstablecimientos(establecimientosFiltrados);

    // Procesar cada establecimiento
    establecimientosOrdenados.forEach(establecimiento => {
      const planificacion = planificacionesMap.get(establecimiento.id);
      const centroAcopio = getCentroAcopioPorNombre(establecimiento.nombre);

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
        distribucionMensual: planificacion?.distribucionMensual || Array(12).fill(0),
        metaAnual: planificacion?.metaAnual || 0,
        estado: planificacion?.estado || 'sin_programar'
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
    config: PlanificacionExportConfig
  ): Promise<void> {
    try {
      // Obtener planificaciones de la vacuna
      const planificacionesResult = await PlanificacionService.getByVacunaAndYear(
        vacuna.id,
        config.anio,
        config.centroAcopioId
      );

      if (!planificacionesResult.success) {
        console.warn(`⚠️ No se pudieron obtener planificaciones para vacuna ${vacuna.nombre}`);
        return;
      }

      // Obtener establecimientos si es necesario
      let establecimientos: any[] = [];
      if (config.incluirEstablecimientosSinProgramacion) {
        const establecimientosResult = await EstablecimientoService.getAll({
          centroAcopioId: config.centroAcopioId,
          limit: 1000
        });

        if (establecimientosResult.success) {
          establecimientos = establecimientosResult.data?.establecimientos || [];
        }
      }

      // Procesar datos
      const datosExportacion = this.procesarDatosPorVacuna(
        planificacionesResult.data || [],
        establecimientos,
        vacuna,
        config
      );

      // Crear hoja con nombre seguro para Excel
      const nombreHoja = this.limpiarNombreHoja(vacuna.nombre);
      const worksheet = workbook.addWorksheet(nombreHoja);

      // Configurar y llenar la hoja
      this.configurarHojaProfesional(worksheet);
      this.agregarEncabezadoInstitucional(worksheet, vacuna, config);
      this.agregarDatosPlanificacion(worksheet, datosExportacion, 11);
      this.aplicarEstilosProfesionales(worksheet);

    } catch (error) {
      console.error(`❌ Error al procesar vacuna ${vacuna.nombre}:`, error);
    }
  }

  /**
   * Configurar diseño profesional de la hoja
   */
  private static configurarHojaProfesional(worksheet: ExcelJS.Worksheet): void {
    // Configurar vista de la hoja
    worksheet.views = [{
      showGridLines: false,
      showRowColHeaders: false,
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
      firstHeader: '&C&"Segoe UI,Bold"&14PROGRAMACIÓN ANUAL DE VACUNAS',
      firstFooter: '&L&"Segoe UI"&10Generado: &D &T&R&"Segoe UI"&10Página &P de &N'
    };
  }

  /**
   * Agregar encabezado institucional profesional
   */
  private static agregarEncabezadoInstitucional(
    worksheet: ExcelJS.Worksheet,
    vacuna: any,
    config: PlanificacionExportConfig
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

    // Logo y encabezado principal
    worksheet.mergeCells('A1:P1');
    const headerCell1 = worksheet.getCell('A1');
    headerCell1.value = '🏛️ GOBIERNO REGIONAL DE APURÍMAC';
    headerCell1.font = {
      bold: true,
      size: 16,
      color: { argb: 'FF1E3A8A' },
      name: 'Segoe UI'
    };
    headerCell1.alignment = { horizontal: 'center', vertical: 'middle' };

    // Subtítulo institucional
    worksheet.mergeCells('A2:P2');
    const headerCell2 = worksheet.getCell('A2');
    headerCell2.value = 'DIRECCIÓN REGIONAL DE SALUD - SIVAC';
    headerCell2.font = {
      bold: true,
      size: 14,
      color: { argb: 'FF374151' },
      name: 'Segoe UI'
    };
    headerCell2.alignment = { horizontal: 'center', vertical: 'middle' };

    // Título del reporte
    worksheet.mergeCells('A3:P3');
    const titleCell = worksheet.getCell('A3');
    titleCell.value = `PROGRAMACIÓN ANUAL DE VACUNAS - ${vacuna.nombre.toUpperCase()}`;
    titleCell.font = {
      bold: true,
      size: 14,
      color: { argb: 'FF059669' },
      name: 'Segoe UI'
    };
    titleCell.alignment = { horizontal: 'center', vertical: 'middle' };

    // Información del reporte
    worksheet.mergeCells('A5:H5');
    const infoCell1 = worksheet.getCell('A5');
    infoCell1.value = `📅 Año de Programación: ${config.anio}`;
    infoCell1.font = { size: 12, bold: true, color: { argb: 'FF374151' }, name: 'Segoe UI' };

    worksheet.mergeCells('I5:P5');
    const infoCell2 = worksheet.getCell('I5');
    infoCell2.value = `💉 Vacuna: ${vacuna.nombre} (${vacuna.presentacion})`;
    infoCell2.font = { size: 12, bold: true, color: { argb: 'FF374151' }, name: 'Segoe UI' };

    // Información adicional
    worksheet.mergeCells('A6:H6');
    const infoCell3 = worksheet.getCell('A6');
    infoCell3.value = `👤 Responsable: ${config.responsableReporte}`;
    infoCell3.font = { size: 11, color: { argb: 'FF6B7280' }, name: 'Segoe UI' };

    worksheet.mergeCells('I6:P6');
    const infoCell4 = worksheet.getCell('I6');
    const fechaGeneracion = new Date().toLocaleDateString('es-PE', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
    infoCell4.value = `📊 Generado: ${fechaGeneracion}`;
    infoCell4.font = { size: 11, color: { argb: 'FF6B7280' }, name: 'Segoe UI' };

    // Observaciones si existen
    if (config.observaciones) {
      worksheet.mergeCells('A7:P7');
      const obsCell = worksheet.getCell('A7');
      obsCell.value = `📝 Observaciones: ${config.observaciones}`;
      obsCell.font = { size: 11, italic: true, color: { argb: 'FF6B7280' }, name: 'Segoe UI' };
    }
  }

  /**
   * Agregar datos de planificación con formato profesional
   */
  private static agregarDatosPlanificacion(
    worksheet: ExcelJS.Worksheet,
    datos: PlanificacionExportData[],
    filaInicio: number
  ): void {
    // Definir encabezados de columnas
    const encabezados = [
      'Código',
      'Establecimiento',
      'Centro de Acopio',
      'Enero',
      'Febrero',
      'Marzo',
      'Abril',
      'Mayo',
      'Junio',
      'Julio',
      'Agosto',
      'Septiembre',
      'Octubre',
      'Noviembre',
      'Diciembre',
      'Total Anual'
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

    // Agregar datos con colores por centro de acopio
    let filaActual = filaInicio + 1;
    datos.forEach((dato) => {
      // Obtener colores del centro de acopio - usar siempre el color del centro
      const colores = getColoresCentroAcopioExcel(dato.establecimiento.centroAcopio || 'DEFAULT');

      // Datos de la fila
      const filaDatos = [
        dato.establecimiento.codigo,
        dato.establecimiento.nombre,
        dato.establecimiento.centroAcopio,
        ...dato.distribucionMensual,
        dato.metaAnual
      ];

      filaDatos.forEach((valor, colIndex) => {
        const cell = worksheet.getCell(filaActual, colIndex + 1);
        cell.value = valor;

        // Estilos básicos
        cell.font = {
          size: 11,
          name: 'Segoe UI',
          color: { argb: colIndex < 3 ? colores.text : 'FF374151' }
        };

        cell.alignment = {
          horizontal: colIndex < 3 ? 'left' : 'center',
          vertical: 'middle'
        };

        // Usar siempre el color de fondo del centro de acopio
        cell.fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: colores.bg }
        };

        cell.border = {
          top: { style: 'thin', color: { argb: 'FFE5E7EB' } },
          left: { style: 'thin', color: { argb: 'FFE5E7EB' } },
          bottom: { style: 'thin', color: { argb: 'FFE5E7EB' } },
          right: { style: 'thin', color: { argb: 'FFE5E7EB' } }
        };

        // Destacar totales importantes manteniendo el color del centro pero más intenso
        if (colIndex === filaDatos.length - 1 && typeof valor === 'number' && valor > 0) {
          // Mantener el color del centro pero hacer el texto más oscuro para destacar
          cell.font = {
            ...cell.font,
            bold: true,
            color: { argb: colores.text }
          };
        }
      });

      worksheet.getRow(filaActual).height = 20;
      filaActual++;
    });

    // Agregar fila de totales
    this.agregarFilaTotales(worksheet, datos, filaActual);
  }

  /**
   * Agregar fila de totales al final de los datos
   */
  private static agregarFilaTotales(
    worksheet: ExcelJS.Worksheet,
    datos: PlanificacionExportData[],
    fila: number
  ): void {
    // Calcular totales por mes
    const totalesMensuales = Array(12).fill(0);
    let totalGeneral = 0;

    datos.forEach(dato => {
      dato.distribucionMensual.forEach((valor, index) => {
        totalesMensuales[index] += valor;
      });
      totalGeneral += dato.metaAnual;
    });

    // Agregar fila de totales
    const filaTotales = [
      '',
      'TOTAL GENERAL',
      '',
      ...totalesMensuales,
      totalGeneral
    ];

    filaTotales.forEach((valor, colIndex) => {
      const cell = worksheet.getCell(fila, colIndex + 1);
      cell.value = valor;

      cell.font = {
        bold: true,
        size: 12,
        color: { argb: 'FFFFFFFF' },
        name: 'Segoe UI'
      };

      cell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FF059669' }
      };

      cell.alignment = {
        horizontal: 'center',
        vertical: 'middle'
      };

      cell.border = {
        top: { style: 'thick', color: { argb: 'FF374151' } },
        left: { style: 'thin', color: { argb: 'FF374151' } },
        bottom: { style: 'thick', color: { argb: 'FF374151' } },
        right: { style: 'thin', color: { argb: 'FF374151' } }
      };
    });

    worksheet.getRow(fila).height = 25;
  }

  /**
   * Aplicar estilos profesionales finales
   */
  private static aplicarEstilosProfesionales(worksheet: ExcelJS.Worksheet): void {
    // Auto-ajustar columnas para mejor visualización
    worksheet.columns.forEach((column, index) => {
      if (index === 0) { // Código
        column.width = 15;
      } else if (index === 1) { // Establecimiento
        column.width = 45;
      } else if (index === 2) { // Centro de Acopio
        column.width = 25;
      } else if (index < 15) { // Meses
        column.width = 12;
      } else { // Total
        column.width = 15;
      }
    });

    // Congelar paneles para mejor navegación
    worksheet.views = [{
      state: 'frozen' as const,
      xSplit: 3, // Congelar las primeras 3 columnas
      ySplit: 11, // Congelar las primeras 11 filas (encabezados)
      showGridLines: false,
      showRowColHeaders: false,
      zoomScale: 85
    }];
  }

  /**
   * Limpiar nombre de hoja para Excel
   */
  private static limpiarNombreHoja(nombre: string): string {
    return nombre
      .replace(/[\\/?*[\]]/g, '') // Remover caracteres no válidos
      .substring(0, 31) // Límite de Excel para nombres de hoja
      .trim();
  }

  /**
   * Generar nombre de archivo para vacuna específica
   */
  private static generarNombreArchivo(nombreVacuna: string, config: PlanificacionExportConfig): string {
    const fecha = new Date().toISOString().split('T')[0];
    const nombreLimpio = nombreVacuna.replace(/[^a-zA-Z0-9]/g, '_');
    return `Programacion_${nombreLimpio}_${config.anio}_${fecha}.xlsx`;
  }

  /**
   * Generar nombre de archivo para exportación completa
   */
  private static generarNombreArchivoCompleto(config: PlanificacionExportConfig): string {
    const fecha = new Date().toISOString().split('T')[0];
    return `Programacion_Completa_${config.anio}_${fecha}.xlsx`;
  }
}
