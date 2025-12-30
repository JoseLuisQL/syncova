import { Request, Response } from 'express';
import { KardexService, KardexFilters, CreateKardexDto, UpdateKardexDto } from '@/services/KardexService';
import { KardexExportService, KardexExportConfig } from '@/services/KardexExportService';
import { ResponseUtil } from '@/utils/response';
import { validateUUID } from '@/utils/validation';
import { TipoMovimientoKardex } from '@prisma/client';

/**
 * Controlador para gestión del Kardex
 * Módulo 12: KARDEX
 */
export class KardexController {
  /**
   * Obtener todos los movimientos de kardex con filtros opcionales
   * GET /api/kardex
   */
  static async getAll(req: Request, res: Response): Promise<void> {
    try {
      const {
        tipo,
        itemId,
        loteId,
        tipoMovimiento,
        establecimientoOrigenId,
        establecimientoDestinoId,
        fechaInicio,
        fechaFin,
        search,
        page = '1',
        limit = '100'
      } = req.query;

      // Validaciones de parámetros
      const pageNum = parseInt(page as string, 10);
      const limitNum = parseInt(limit as string, 10);

      if (isNaN(pageNum) || pageNum < 1) {
        ResponseUtil.error(res, 'El parámetro page debe ser un número mayor a 0', 400);
        return;
      }

      if (isNaN(limitNum) || limitNum < 1 || limitNum > 1000) {
        ResponseUtil.error(res, 'El parámetro limit debe ser un número entre 1 y 1000', 400);
        return;
      }

      // Validar UUIDs si se proporcionan
      if (itemId && !validateUUID(itemId as string)) {
        ResponseUtil.error(res, 'ID de item inválido', 400);
        return;
      }

      if (loteId && !validateUUID(loteId as string)) {
        ResponseUtil.error(res, 'ID de lote inválido', 400);
        return;
      }

      if (establecimientoOrigenId && !validateUUID(establecimientoOrigenId as string)) {
        ResponseUtil.error(res, 'ID de establecimiento origen inválido', 400);
        return;
      }

      if (establecimientoDestinoId && !validateUUID(establecimientoDestinoId as string)) {
        ResponseUtil.error(res, 'ID de establecimiento destino inválido', 400);
        return;
      }

      // Validar tipo
      if (tipo && !['vacuna', 'jeringa'].includes(tipo as string)) {
        ResponseUtil.error(res, 'El tipo debe ser "vacuna" o "jeringa"', 400);
        return;
      }

      // Validar tipo de movimiento
      if (tipoMovimiento && !['ingreso', 'salida', 'transferencia', 'ajuste'].includes(tipoMovimiento as string)) {
        ResponseUtil.error(res, 'Tipo de movimiento inválido', 400);
        return;
      }

      // Validar fechas con manejo correcto de zona horaria
      let fechaInicioDate: Date | undefined;
      let fechaFinDate: Date | undefined;

      if (fechaInicio) {
        // Si solo se proporciona la fecha (YYYY-MM-DD), agregar la hora local
        const fechaStr = (fechaInicio as string).includes('T')
          ? fechaInicio as string
          : `${fechaInicio}T00:00:00`;

        fechaInicioDate = new Date(fechaStr);
        if (isNaN(fechaInicioDate.getTime())) {
          ResponseUtil.error(res, 'Fecha de inicio inválida', 400);
          return;
        }
      }

      if (fechaFin) {
        // Si solo se proporciona la fecha (YYYY-MM-DD), agregar la hora local
        const fechaStr = (fechaFin as string).includes('T')
          ? fechaFin as string
          : `${fechaFin}T23:59:59`;

        fechaFinDate = new Date(fechaStr);
        if (isNaN(fechaFinDate.getTime())) {
          ResponseUtil.error(res, 'Fecha de fin inválida', 400);
          return;
        }
      }

      if (fechaInicioDate && fechaFinDate && fechaInicioDate > fechaFinDate) {
        ResponseUtil.error(res, 'La fecha de inicio no puede ser mayor a la fecha de fin', 400);
        return;
      }

      const filters: KardexFilters = {
        tipo: tipo as 'vacuna' | 'jeringa',
        itemId: itemId as string,
        loteId: loteId as string,
        tipoMovimiento: tipoMovimiento as TipoMovimientoKardex,
        establecimientoOrigenId: establecimientoOrigenId as string,
        establecimientoDestinoId: establecimientoDestinoId as string,
        fechaInicio: fechaInicioDate,
        fechaFin: fechaFinDate,
        search: search as string,
        page: pageNum,
        limit: limitNum
      };

      const result = await KardexService.getAll(filters);

      if (!result.success) {
        ResponseUtil.error(res, result.error || 'Error al obtener movimientos de kardex', 400);
        return;
      }

      ResponseUtil.success(res, result.data, 'Movimientos de kardex obtenidos exitosamente');
    } catch (error) {
      console.error('Error en KardexController.getAll:', error);
      ResponseUtil.error(res, 'Error interno del servidor', 500);
    }
  }

  /**
   * Obtener movimiento de kardex por ID
   * GET /api/kardex/:id
   */
  static async getById(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;

      if (!validateUUID(id)) {
        ResponseUtil.error(res, 'ID de movimiento inválido', 400);
        return;
      }

      const result = await KardexService.getById(id);

      if (!result.success) {
        ResponseUtil.error(res, result.error || 'Error al obtener movimiento de kardex', 404);
        return;
      }

      ResponseUtil.success(res, result.data, 'Movimiento de kardex obtenido exitosamente');
    } catch (error) {
      console.error('Error en KardexController.getById:', error);
      ResponseUtil.error(res, 'Error interno del servidor', 500);
    }
  }

  /**
   * Crear nuevo movimiento de kardex
   * POST /api/kardex
   */
  static async create(req: Request, res: Response): Promise<void> {
    try {
      const data: CreateKardexDto = req.body;

      // Validaciones básicas
      if (!data.tipo || !['vacuna', 'jeringa'].includes(data.tipo)) {
        ResponseUtil.error(res, 'El tipo debe ser "vacuna" o "jeringa"', 400);
        return;
      }

      if (!data.itemId || !validateUUID(data.itemId)) {
        ResponseUtil.error(res, 'ID de item inválido', 400);
        return;
      }

      if (!data.loteId || !validateUUID(data.loteId)) {
        ResponseUtil.error(res, 'ID de lote inválido', 400);
        return;
      }

      if (!data.tipoMovimiento || !['ingreso', 'salida', 'transferencia', 'ajuste'].includes(data.tipoMovimiento)) {
        ResponseUtil.error(res, 'Tipo de movimiento inválido', 400);
        return;
      }

      if (!data.cantidad || data.cantidad <= 0) {
        ResponseUtil.error(res, 'La cantidad debe ser mayor a cero', 400);
        return;
      }

      if (!data.documento || data.documento.trim() === '') {
        ResponseUtil.error(res, 'El documento es requerido', 400);
        return;
      }

      if (!data.numeroDocumento || data.numeroDocumento.trim() === '') {
        ResponseUtil.error(res, 'El número de documento es requerido', 400);
        return;
      }

      if (!data.usuarioId || !validateUUID(data.usuarioId)) {
        ResponseUtil.error(res, 'ID de usuario inválido', 400);
        return;
      }

      if (data.establecimientoOrigenId && !validateUUID(data.establecimientoOrigenId)) {
        ResponseUtil.error(res, 'ID de establecimiento origen inválido', 400);
        return;
      }

      if (data.establecimientoDestinoId && !validateUUID(data.establecimientoDestinoId)) {
        ResponseUtil.error(res, 'ID de establecimiento destino inválido', 400);
        return;
      }

      // Validar fecha de movimiento si se proporciona
      if (data.fechaMovimiento) {
        const fecha = new Date(data.fechaMovimiento);
        if (isNaN(fecha.getTime())) {
          ResponseUtil.error(res, 'Fecha de movimiento inválida', 400);
          return;
        }
        data.fechaMovimiento = fecha;
      }

      const result = await KardexService.create(data);

      if (!result.success) {
        ResponseUtil.error(res, result.error || 'Error al crear movimiento de kardex', 400);
        return;
      }

      ResponseUtil.success(res, result.data, 'Movimiento de kardex creado exitosamente', 201);
    } catch (error) {
      console.error('Error en KardexController.create:', error);
      ResponseUtil.error(res, 'Error interno del servidor', 500);
    }
  }

  /**
   * Actualizar movimiento de kardex
   * PUT /api/kardex/:id
   */
  static async update(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const data: UpdateKardexDto = req.body;

      if (!validateUUID(id)) {
        ResponseUtil.error(res, 'ID de movimiento inválido', 400);
        return;
      }

      // Validaciones opcionales
      if (data.cantidad !== undefined && data.cantidad <= 0) {
        ResponseUtil.error(res, 'La cantidad debe ser mayor a cero', 400);
        return;
      }

      if (data.establecimientoOrigenId && !validateUUID(data.establecimientoOrigenId)) {
        ResponseUtil.error(res, 'ID de establecimiento origen inválido', 400);
        return;
      }

      if (data.establecimientoDestinoId && !validateUUID(data.establecimientoDestinoId)) {
        ResponseUtil.error(res, 'ID de establecimiento destino inválido', 400);
        return;
      }

      if (data.documento !== undefined && data.documento.trim() === '') {
        ResponseUtil.error(res, 'El documento no puede estar vacío', 400);
        return;
      }

      if (data.numeroDocumento !== undefined && data.numeroDocumento.trim() === '') {
        ResponseUtil.error(res, 'El número de documento no puede estar vacío', 400);
        return;
      }

      // Validar fecha de movimiento si se proporciona
      if (data.fechaMovimiento) {
        const fecha = new Date(data.fechaMovimiento);
        if (isNaN(fecha.getTime())) {
          ResponseUtil.error(res, 'Fecha de movimiento inválida', 400);
          return;
        }
        data.fechaMovimiento = fecha;
      }

      const result = await KardexService.update(id, data);

      if (!result.success) {
        ResponseUtil.error(res, result.error || 'Error al actualizar movimiento de kardex', 400);
        return;
      }

      ResponseUtil.success(res, result.data, 'Movimiento de kardex actualizado exitosamente');
    } catch (error) {
      console.error('Error en KardexController.update:', error);
      ResponseUtil.error(res, 'Error interno del servidor', 500);
    }
  }

  /**
   * Eliminar movimiento de kardex
   * DELETE /api/kardex/:id
   */
  static async delete(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;

      if (!validateUUID(id)) {
        ResponseUtil.error(res, 'ID de movimiento inválido', 400);
        return;
      }

      const result = await KardexService.delete(id);

      if (!result.success) {
        ResponseUtil.error(res, result.error || 'Error al eliminar movimiento de kardex', 400);
        return;
      }

      ResponseUtil.success(res, null, 'Movimiento de kardex eliminado exitosamente');
    } catch (error) {
      console.error('Error en KardexController.delete:', error);
      ResponseUtil.error(res, 'Error interno del servidor', 500);
    }
  }

  /**
   * Obtener estadísticas del kardex
   * GET /api/kardex/estadisticas
   */
  static async getEstadisticas(req: Request, res: Response): Promise<void> {
    try {
      const {
        tipo,
        itemId,
        loteId,
        tipoMovimiento,
        establecimientoOrigenId,
        establecimientoDestinoId,
        fechaInicio,
        fechaFin
      } = req.query;

      // Validar UUIDs si se proporcionan
      if (itemId && !validateUUID(itemId as string)) {
        ResponseUtil.error(res, 'ID de item inválido', 400);
        return;
      }

      if (loteId && !validateUUID(loteId as string)) {
        ResponseUtil.error(res, 'ID de lote inválido', 400);
        return;
      }

      if (establecimientoOrigenId && !validateUUID(establecimientoOrigenId as string)) {
        ResponseUtil.error(res, 'ID de establecimiento origen inválido', 400);
        return;
      }

      if (establecimientoDestinoId && !validateUUID(establecimientoDestinoId as string)) {
        ResponseUtil.error(res, 'ID de establecimiento destino inválido', 400);
        return;
      }

      // Validar tipo
      if (tipo && !['vacuna', 'jeringa'].includes(tipo as string)) {
        ResponseUtil.error(res, 'El tipo debe ser "vacuna" o "jeringa"', 400);
        return;
      }

      // Validar tipo de movimiento
      if (tipoMovimiento && !['ingreso', 'salida', 'transferencia', 'ajuste'].includes(tipoMovimiento as string)) {
        ResponseUtil.error(res, 'Tipo de movimiento inválido', 400);
        return;
      }

      // Validar fechas con manejo correcto de zona horaria
      let fechaInicioDate: Date | undefined;
      let fechaFinDate: Date | undefined;

      if (fechaInicio) {
        // Si solo se proporciona la fecha (YYYY-MM-DD), agregar la hora local
        const fechaStr = (fechaInicio as string).includes('T')
          ? fechaInicio as string
          : `${fechaInicio}T00:00:00`;

        fechaInicioDate = new Date(fechaStr);
        if (isNaN(fechaInicioDate.getTime())) {
          ResponseUtil.error(res, 'Fecha de inicio inválida', 400);
          return;
        }
      }

      if (fechaFin) {
        // Si solo se proporciona la fecha (YYYY-MM-DD), agregar la hora local
        const fechaStr = (fechaFin as string).includes('T')
          ? fechaFin as string
          : `${fechaFin}T23:59:59`;

        fechaFinDate = new Date(fechaStr);
        if (isNaN(fechaFinDate.getTime())) {
          ResponseUtil.error(res, 'Fecha de fin inválida', 400);
          return;
        }
      }

      if (fechaInicioDate && fechaFinDate && fechaInicioDate > fechaFinDate) {
        ResponseUtil.error(res, 'La fecha de inicio no puede ser mayor a la fecha de fin', 400);
        return;
      }

      const filters: Omit<KardexFilters, 'page' | 'limit'> = {};

      if (tipo) filters.tipo = tipo as 'vacuna' | 'jeringa';
      if (itemId) filters.itemId = itemId as string;
      if (loteId) filters.loteId = loteId as string;
      if (tipoMovimiento) filters.tipoMovimiento = tipoMovimiento as TipoMovimientoKardex;
      if (establecimientoOrigenId) filters.establecimientoOrigenId = establecimientoOrigenId as string;
      if (establecimientoDestinoId) filters.establecimientoDestinoId = establecimientoDestinoId as string;
      if (fechaInicioDate) filters.fechaInicio = fechaInicioDate;
      if (fechaFinDate) filters.fechaFin = fechaFinDate;

      const result = await KardexService.getEstadisticas(filters);

      if (!result.success) {
        ResponseUtil.error(res, result.error || 'Error al obtener estadísticas del kardex', 400);
        return;
      }

      ResponseUtil.success(res, result.data, 'Estadísticas del kardex obtenidas exitosamente');
    } catch (error) {
      console.error('Error en KardexController.getEstadisticas:', error);
      ResponseUtil.error(res, 'Error interno del servidor', 500);
    }
  }

  /**
   * Obtener trazabilidad de un lote específico
   * GET /api/kardex/trazabilidad/:loteId
   */
  static async getTrazabilidadLote(req: Request, res: Response): Promise<void> {
    try {
      const { loteId } = req.params;

      if (!validateUUID(loteId)) {
        ResponseUtil.error(res, 'ID de lote inválido', 400);
        return;
      }

      const result = await KardexService.getTrazabilidadLote(loteId);

      if (!result.success) {
        ResponseUtil.error(res, result.error || 'Error al obtener trazabilidad del lote', 400);
        return;
      }

      ResponseUtil.success(res, result.data, 'Trazabilidad del lote obtenida exitosamente');
    } catch (error) {
      console.error('Error en KardexController.getTrazabilidadLote:', error);
      ResponseUtil.error(res, 'Error interno del servidor', 500);
    }
  }

  /**
   * Obtener consultas predefinidas
   * GET /api/kardex/consultas-predefinidas
   */
  static async getConsultasPredefinidas(req: Request, res: Response): Promise<void> {
    try {
      const result = await KardexService.getConsultasPredefinidas();

      if (!result.success) {
        ResponseUtil.error(res, result.error || 'Error al obtener consultas predefinidas', 400);
        return;
      }

      ResponseUtil.success(res, result.data, 'Consultas predefinidas obtenidas exitosamente');
    } catch (error) {
      console.error('Error en KardexController.getConsultasPredefinidas:', error);
      ResponseUtil.error(res, 'Error interno del servidor', 500);
    }
  }

  /**
   * Generar movimiento automático (para uso interno del sistema)
   * POST /api/kardex/generar-automatico
   */
  static async generarMovimientoAutomatico(req: Request, res: Response): Promise<void> {
    try {
      const data = req.body;

      // Validaciones básicas
      if (!data.tipo || !['vacuna', 'jeringa'].includes(data.tipo)) {
        ResponseUtil.error(res, 'El tipo debe ser "vacuna" o "jeringa"', 400);
        return;
      }

      if (!data.itemId || !validateUUID(data.itemId)) {
        ResponseUtil.error(res, 'ID de item inválido', 400);
        return;
      }

      if (!data.loteId || !validateUUID(data.loteId)) {
        ResponseUtil.error(res, 'ID de lote inválido', 400);
        return;
      }

      if (!data.tipoMovimiento || !['ingreso', 'salida', 'transferencia', 'ajuste'].includes(data.tipoMovimiento)) {
        ResponseUtil.error(res, 'Tipo de movimiento inválido', 400);
        return;
      }

      if (!data.cantidad || data.cantidad <= 0) {
        ResponseUtil.error(res, 'La cantidad debe ser mayor a cero', 400);
        return;
      }

      if (!data.documento || data.documento.trim() === '') {
        ResponseUtil.error(res, 'El documento es requerido', 400);
        return;
      }

      if (!data.numeroDocumento || data.numeroDocumento.trim() === '') {
        ResponseUtil.error(res, 'El número de documento es requerido', 400);
        return;
      }

      if (!data.usuarioId || !validateUUID(data.usuarioId)) {
        ResponseUtil.error(res, 'ID de usuario inválido', 400);
        return;
      }

      const result = await KardexService.generarMovimientoAutomatico(data);

      if (!result.success) {
        ResponseUtil.error(res, result.error || 'Error al generar movimiento automático', 400);
        return;
      }

      ResponseUtil.success(res, result.data, 'Movimiento automático generado exitosamente', 201);
    } catch (error) {
      console.error('Error en KardexController.generarMovimientoAutomatico:', error);
      ResponseUtil.error(res, 'Error interno del servidor', 500);
    }
  }

  /**
   * Exportar kardex a Excel
   * POST /api/kardex/export/excel
   */
  static async exportToExcel(req: Request, res: Response): Promise<void> {
    try {
      const config: KardexExportConfig = req.body;

      // Validaciones básicas
      if (!config.formatoExportacion) {
        config.formatoExportacion = 'excel';
      }

      // Validar filtros si se proporcionan
      if (config.filtros) {
        const { filtros } = config;

        if (filtros.itemId && !validateUUID(filtros.itemId)) {
          ResponseUtil.error(res, 'ID de item inválido en filtros', 400);
          return;
        }

        if (filtros.loteId && !validateUUID(filtros.loteId)) {
          ResponseUtil.error(res, 'ID de lote inválido en filtros', 400);
          return;
        }

        if (filtros.establecimientoOrigenId && !validateUUID(filtros.establecimientoOrigenId)) {
          ResponseUtil.error(res, 'ID de establecimiento origen inválido en filtros', 400);
          return;
        }

        if (filtros.establecimientoDestinoId && !validateUUID(filtros.establecimientoDestinoId)) {
          ResponseUtil.error(res, 'ID de establecimiento destino inválido en filtros', 400);
          return;
        }

        if (filtros.tipo && !['vacuna', 'jeringa'].includes(filtros.tipo)) {
          ResponseUtil.error(res, 'Tipo inválido en filtros', 400);
          return;
        }

        if (filtros.tipoMovimiento && !['ingreso', 'salida', 'transferencia', 'ajuste'].includes(filtros.tipoMovimiento)) {
          ResponseUtil.error(res, 'Tipo de movimiento inválido en filtros', 400);
          return;
        }

        // Validar y convertir fechas si se proporcionan
        if (filtros.fechaInicio) {
          const fechaInicioVal = filtros.fechaInicio as unknown;
          if (typeof fechaInicioVal === 'string') {
            // Manejar formato YYYY-MM-DD del frontend
            const fechaStr = (fechaInicioVal as string).includes('T')
              ? fechaInicioVal as string
              : `${fechaInicioVal}T00:00:00.000Z`;
            const fecha = new Date(fechaStr);
            if (isNaN(fecha.getTime())) {
              ResponseUtil.error(res, 'Fecha de inicio inválida en filtros', 400);
              return;
            }
            filtros.fechaInicio = fecha;
          }
        }

        if (filtros.fechaFin) {
          const fechaFinVal = filtros.fechaFin as unknown;
          if (typeof fechaFinVal === 'string') {
            // Manejar formato YYYY-MM-DD del frontend
            const fechaStr = (fechaFinVal as string).includes('T')
              ? fechaFinVal as string
              : `${fechaFinVal}T23:59:59.999Z`;
            const fecha = new Date(fechaStr);
            if (isNaN(fecha.getTime())) {
              ResponseUtil.error(res, 'Fecha de fin inválida en filtros', 400);
              return;
            }
            filtros.fechaFin = fecha;
          }
        }
      }

      const result = await KardexExportService.exportToExcel(config);

      if (!result.success) {
        ResponseUtil.error(res, result.error || 'Error al exportar kardex a Excel', 400);
        return;
      }

      // Configurar headers para descarga
      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      res.setHeader('Content-Disposition', `attachment; filename="${result.data!.filename}"`);
      res.setHeader('Content-Length', result.data!.size.toString());

      // Enviar archivo
      const buffer = await result.data!.workbook.xlsx.writeBuffer();
      res.send(buffer);
    } catch (error) {
      console.error('Error en KardexController.exportToExcel:', error);
      ResponseUtil.error(res, 'Error interno del servidor', 500);
    }
  }

  /**
   * Exportar kardex a PDF
   * POST /api/kardex/export/pdf
   */
  static async exportToPDF(req: Request, res: Response): Promise<void> {
    try {
      const config: KardexExportConfig = req.body;
      config.formatoExportacion = 'pdf';

      const result = await KardexExportService.exportToPDF(config);

      if (!result.success) {
        ResponseUtil.error(res, result.error || 'Error al exportar kardex a PDF', 400);
        return;
      }

      // Configurar headers para descarga
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename="${result.data!.filename}"`);
      res.setHeader('Content-Length', result.data!.size.toString());

      // Enviar archivo
      res.send(result.data!.buffer);
    } catch (error) {
      console.error('Error en KardexController.exportToPDF:', error);
      ResponseUtil.error(res, 'Error interno del servidor', 500);
    }
  }

  /**
   * Exportar kardex a CSV
   * POST /api/kardex/export/csv
   */
  static async exportToCSV(req: Request, res: Response): Promise<void> {
    try {
      const config: KardexExportConfig = req.body;
      config.formatoExportacion = 'csv';

      const result = await KardexExportService.exportToCSV(config);

      if (!result.success) {
        ResponseUtil.error(res, result.error || 'Error al exportar kardex a CSV', 400);
        return;
      }

      // Configurar headers para descarga
      res.setHeader('Content-Type', 'text/csv; charset=utf-8');
      res.setHeader('Content-Disposition', `attachment; filename="${result.data!.filename}"`);
      res.setHeader('Content-Length', result.data!.size.toString());

      // Enviar archivo
      res.send(result.data!.content);
    } catch (error) {
      console.error('Error en KardexController.exportToCSV:', error);
      ResponseUtil.error(res, 'Error interno del servidor', 500);
    }
  }

  /**
   * Obtener estadísticas de exportación
   * GET /api/kardex/export/stats
   */
  static async getExportStats(req: Request, res: Response): Promise<void> {
    try {
      const {
        tipo,
        itemId,
        loteId,
        tipoMovimiento,
        establecimientoOrigenId,
        establecimientoDestinoId,
        fechaInicio,
        fechaFin,
        search
      } = req.query;

      // Validar filtros (similar a getAll)
      const filtros: KardexFilters = {};

      if (tipo) filtros.tipo = tipo as 'vacuna' | 'jeringa';
      if (itemId) filtros.itemId = itemId as string;
      if (loteId) filtros.loteId = loteId as string;
      if (tipoMovimiento) filtros.tipoMovimiento = tipoMovimiento as TipoMovimientoKardex;
      if (establecimientoOrigenId) filtros.establecimientoOrigenId = establecimientoOrigenId as string;
      if (establecimientoDestinoId) filtros.establecimientoDestinoId = establecimientoDestinoId as string;
      if (search) filtros.search = search as string;

      if (fechaInicio) {
        const fecha = new Date(fechaInicio as string);
        if (!isNaN(fecha.getTime())) {
          filtros.fechaInicio = fecha;
        }
      }

      if (fechaFin) {
        const fecha = new Date(fechaFin as string);
        if (!isNaN(fecha.getTime())) {
          filtros.fechaFin = fecha;
        }
      }

      const result = await KardexExportService.getExportStats(filtros);

      if (!result.success) {
        ResponseUtil.error(res, result.error || 'Error al obtener estadísticas de exportación', 400);
        return;
      }

      ResponseUtil.success(res, result.data, 'Estadísticas de exportación obtenidas exitosamente');
    } catch (error) {
      console.error('Error en KardexController.getExportStats:', error);
      ResponseUtil.error(res, 'Error interno del servidor', 500);
    }
  }
}
