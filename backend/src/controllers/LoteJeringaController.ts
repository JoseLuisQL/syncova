import { Request, Response } from 'express';
import { LoteJeringaService } from '@/services/LoteJeringaService';
import { CreateLoteJeringaDto, UpdateLoteJeringaDto, EstadoLote, FormaIngreso, ComprobanteClase } from '@/types';
import { successResponse, errorResponse, paginatedResponse } from '@/utils/response';
import { validateRequired, validateEnum, validateUUID, validateDate, validateNumber, isRequired, isValidEnum } from '@/utils/validation';

/**
 * Mapear valores del frontend a valores de Prisma para FormaIngreso
 */
const mapFormaIngreso = (formaIngreso: string): string => {
  const mapping: { [key: string]: string } = {
    '1° TRIMESTRE': 'PRIMER_TRIMESTRE',
    '2° TRIMESTRE': 'SEGUNDO_TRIMESTRE',
    '3° TRIMESTRE': 'TERCER_TRIMESTRE',
    '4° TRIMESTRE': 'CUARTO_TRIMESTRE'
  };
  return mapping[formaIngreso] || formaIngreso;
};

/**
 * Controlador para gestión de lotes de jeringas
 */
export class LoteJeringaController {
  /**
   * Obtener todos los lotes de jeringas
   * GET /api/lotes-jeringas
   */
  static async getAll(req: Request, res: Response): Promise<void> {
    try {
      const {
        estado = 'todos',
        search,
        jeringaId,
        page = '1',
        limit = '1000'
      } = req.query;

      // Validaciones de parámetros
      const pageNum = parseInt(page as string, 10);
      const limitNum = parseInt(limit as string, 10);

      if (isNaN(pageNum) || pageNum < 1) {
        errorResponse(res, 'El parámetro page debe ser un número mayor a 0', 400);
        return;
      }

      if (isNaN(limitNum) || limitNum < 1 || limitNum > 1000) {
        errorResponse(res, 'El parámetro limit debe ser un número entre 1 y 1000', 400);
        return;
      }

      if (estado && !['disponible', 'vencido', 'agotado', 'todos'].includes(estado as string)) {
        errorResponse(res, 'Estado inválido', 400);
        return;
      }

      if (jeringaId && !validateUUID(jeringaId as string)) {
        errorResponse(res, 'ID de jeringa inválido', 400);
        return;
      }

      const result = await LoteJeringaService.getAll({
        estado: estado as EstadoLote | 'todos',
        search: search as string,
        jeringaId: jeringaId as string,
        page: pageNum,
        limit: limitNum
      });

      paginatedResponse(res, {
        data: result.data.lotes,
        total: result.data.total,
        page: pageNum,
        limit: limitNum,
        message: result.message
      });
    } catch (error) {
      console.error('Error en LoteJeringaController.getAll:', error);
      errorResponse(res, error.message || 'Error interno del servidor', error.statusCode || 500);
    }
  }

  /**
   * Obtener lote de jeringa por ID
   * GET /api/lotes-jeringas/:id
   */
  static async getById(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;

      if (!validateUUID(id)) {
        errorResponse(res, 'ID de lote inválido', 400);
        return;
      }

      const result = await LoteJeringaService.getById(id);
      successResponse(res, result.data, result.message);
    } catch (error) {
      console.error('Error en LoteJeringaController.getById:', error);
      errorResponse(res, error.message || 'Error interno del servidor', error.statusCode || 500);
    }
  }

  /**
   * Crear nuevo lote de jeringa
   * POST /api/lotes-jeringas
   */
  static async create(req: Request, res: Response): Promise<void> {
    try {
      console.log('📝 Datos recibidos para crear lote de jeringa:', JSON.stringify(req.body, null, 2));

      const {
        numero,
        jeringaId,
        fechaIngreso,
        fechaVencimiento,
        formaIngreso,
        comprobanteClase,
        numeroComprobante,
        cantidadInicial,
        cantidadActual,
        observaciones
      } = req.body;

      // Validaciones de campos requeridos
      if (!isRequired(numero)) {
        console.log(`❌ Número de lote requerido faltante:`, numero);
        errorResponse(res, 'El número de lote es requerido', 400);
        return;
      }

      if (!validateUUID(jeringaId)) {
        console.log(`❌ ID de jeringa inválido:`, jeringaId);
        errorResponse(res, 'ID de jeringa inválido', 400);
        return;
      }

      if (!validateDate(fechaIngreso)) {
        console.log(`❌ Fecha de ingreso inválida:`, fechaIngreso);
        errorResponse(res, 'Fecha de ingreso inválida', 400);
        return;
      }

      if (fechaVencimiento && !validateDate(fechaVencimiento)) {
        console.log(`❌ Fecha de vencimiento inválida:`, fechaVencimiento);
        errorResponse(res, 'Fecha de vencimiento inválida', 400);
        return;
      }

      if (!isValidEnum(formaIngreso, ['1° TRIMESTRE', '2° TRIMESTRE', '3° TRIMESTRE', '4° TRIMESTRE'])) {
        console.log(`❌ Forma de ingreso inválida:`, formaIngreso);
        errorResponse(res, 'Forma de ingreso inválida', 400);
        return;
      }

      if (!isValidEnum(comprobanteClase, ['PECOSA', 'GUIA', 'TRASLADO', 'OTROS'])) {
        console.log(`❌ Clase de comprobante inválida:`, comprobanteClase);
        errorResponse(res, 'Clase de comprobante inválida', 400);
        return;
      }

      if (!isRequired(numeroComprobante)) {
        console.log(`❌ Número de comprobante requerido faltante:`, numeroComprobante);
        errorResponse(res, 'El número de comprobante es requerido', 400);
        return;
      }

      if (!validateNumber(cantidadInicial) || cantidadInicial <= 0) {
        console.log(`❌ Cantidad inicial inválida:`, cantidadInicial, 'tipo:', typeof cantidadInicial);
        errorResponse(res, 'La cantidad inicial debe ser un número mayor a 0', 400);
        return;
      }

      if (!validateNumber(cantidadActual) || cantidadActual < 0) {
        console.log(`❌ Cantidad actual inválida:`, cantidadActual, 'tipo:', typeof cantidadActual);
        errorResponse(res, 'La cantidad actual debe ser un número mayor o igual a 0', 400);
        return;
      }

      if (cantidadActual > cantidadInicial) {
        errorResponse(res, 'La cantidad actual no puede ser mayor a la cantidad inicial', 400);
        return;
      }

      console.log('✅ Todas las validaciones pasaron, creando lote de jeringa...');

      const createData: CreateLoteJeringaDto = {
        numero: numero.trim(),
        jeringaId,
        fechaIngreso: new Date(fechaIngreso),
        fechaVencimiento: fechaVencimiento ? new Date(fechaVencimiento) : undefined,
        formaIngreso: mapFormaIngreso(formaIngreso) as FormaIngreso,
        comprobanteClase: comprobanteClase as ComprobanteClase,
        numeroComprobante: numeroComprobante.trim(),
        cantidadInicial: parseInt(cantidadInicial, 10),
        cantidadActual: parseInt(cantidadActual, 10),
        observaciones: observaciones?.trim() || undefined
      };

      console.log('📦 Datos procesados para crear lote de jeringa:', JSON.stringify(createData, null, 2));

      const result = await LoteJeringaService.create(createData);
      successResponse(res, result.data, result.message, 201);
    } catch (error) {
      console.error('Error en LoteJeringaController.create:', error);
      errorResponse(res, error.message || 'Error interno del servidor', error.statusCode || 500);
    }
  }

  /**
   * Actualizar lote de jeringa
   * PUT /api/lotes-jeringas/:id
   */
  static async update(req: Request, res: Response): Promise<void> {
    try {
      console.log('📝 Datos recibidos para actualizar lote de jeringa:', JSON.stringify(req.body, null, 2));

      const { id } = req.params;
      const {
        numero,
        fechaIngreso,
        fechaVencimiento,
        formaIngreso,
        comprobanteClase,
        numeroComprobante,
        cantidadInicial,
        cantidadActual,
        estado,
        observaciones
      } = req.body;

      if (!validateUUID(id)) {
        errorResponse(res, 'ID de lote inválido', 400);
        return;
      }

      // Construir objeto de actualización solo con campos proporcionados
      const updateData: UpdateLoteJeringaDto = {};

      if (numero !== undefined) {
        if (!isRequired(numero)) {
          console.log(`❌ Número de lote vacío:`, numero);
          errorResponse(res, 'El número de lote no puede estar vacío', 400);
          return;
        }
        updateData.numero = numero.trim();
      }

      if (fechaIngreso !== undefined) {
        if (!validateDate(fechaIngreso)) {
          errorResponse(res, 'Fecha de ingreso inválida', 400);
          return;
        }
        updateData.fechaIngreso = new Date(fechaIngreso);
      }

      if (fechaVencimiento !== undefined) {
        if (fechaVencimiento && !validateDate(fechaVencimiento)) {
          errorResponse(res, 'Fecha de vencimiento inválida', 400);
          return;
        }
        updateData.fechaVencimiento = fechaVencimiento ? new Date(fechaVencimiento) : undefined;
      }

      if (formaIngreso !== undefined) {
        if (!isValidEnum(formaIngreso, ['1° TRIMESTRE', '2° TRIMESTRE', '3° TRIMESTRE', '4° TRIMESTRE'])) {
          console.log(`❌ Forma de ingreso inválida:`, formaIngreso);
          errorResponse(res, 'Forma de ingreso inválida', 400);
          return;
        }
        updateData.formaIngreso = mapFormaIngreso(formaIngreso) as FormaIngreso;
      }

      if (comprobanteClase !== undefined) {
        if (!isValidEnum(comprobanteClase, ['PECOSA', 'GUIA', 'TRASLADO', 'OTROS'])) {
          console.log(`❌ Clase de comprobante inválida:`, comprobanteClase);
          errorResponse(res, 'Clase de comprobante inválida', 400);
          return;
        }
        updateData.comprobanteClase = comprobanteClase as ComprobanteClase;
      }

      if (numeroComprobante !== undefined) {
        if (!isRequired(numeroComprobante)) {
          console.log(`❌ Número de comprobante vacío:`, numeroComprobante);
          errorResponse(res, 'El número de comprobante no puede estar vacío', 400);
          return;
        }
        updateData.numeroComprobante = numeroComprobante.trim();
      }

      if (cantidadInicial !== undefined) {
        if (!validateNumber(cantidadInicial) || cantidadInicial <= 0) {
          console.log(`❌ Cantidad inicial inválida:`, cantidadInicial, 'tipo:', typeof cantidadInicial);
          errorResponse(res, 'La cantidad inicial debe ser un número mayor a 0', 400);
          return;
        }
        updateData.cantidadInicial = parseInt(cantidadInicial, 10);
      }

      if (cantidadActual !== undefined) {
        if (!validateNumber(cantidadActual) || cantidadActual < 0) {
          console.log(`❌ Cantidad actual inválida:`, cantidadActual, 'tipo:', typeof cantidadActual);
          errorResponse(res, 'La cantidad actual debe ser un número mayor o igual a 0', 400);
          return;
        }
        updateData.cantidadActual = parseInt(cantidadActual, 10);
      }

      if (estado !== undefined) {
        if (!isValidEnum(estado, ['disponible', 'vencido', 'agotado'])) {
          console.log(`❌ Estado inválido:`, estado);
          errorResponse(res, 'Estado inválido', 400);
          return;
        }
        updateData.estado = estado as EstadoLote;
      }

      if (observaciones !== undefined) {
        updateData.observaciones = observaciones?.trim() || undefined;
      }

      console.log('✅ Todas las validaciones pasaron, actualizando lote de jeringa...');
      console.log('📦 Datos procesados para actualizar lote de jeringa:', JSON.stringify(updateData, null, 2));

      const result = await LoteJeringaService.update(id, updateData);
      successResponse(res, result.data, result.message);
    } catch (error) {
      console.error('Error en LoteJeringaController.update:', error);
      errorResponse(res, error.message || 'Error interno del servidor', error.statusCode || 500);
    }
  }

  /**
   * Eliminar lote de jeringa
   * DELETE /api/lotes-jeringas/:id
   */
  static async delete(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;

      if (!validateUUID(id)) {
        errorResponse(res, 'ID de lote inválido', 400);
        return;
      }

      const result = await LoteJeringaService.delete(id);
      successResponse(res, null, result.message);
    } catch (error) {
      console.error('Error en LoteJeringaController.delete:', error);
      errorResponse(res, error.message || 'Error interno del servidor', error.statusCode || 500);
    }
  }

  /**
   * Obtener estadísticas de lotes de jeringas
   * GET /api/lotes-jeringas/stats
   */
  static async getStats(req: Request, res: Response): Promise<void> {
    try {
      const result = await LoteJeringaService.getStats();
      successResponse(res, result.data, result.message);
    } catch (error) {
      console.error('Error en LoteJeringaController.getStats:', error);
      errorResponse(res, error.message || 'Error interno del servidor', error.statusCode || 500);
    }
  }

  /**
   * Obtener lotes por jeringa específica
   * GET /api/lotes-jeringas/jeringa/:jeringaId
   */
  static async getByJeringa(req: Request, res: Response): Promise<void> {
    try {
      const { jeringaId } = req.params;

      if (!validateUUID(jeringaId)) {
        errorResponse(res, 'ID de jeringa inválido', 400);
        return;
      }

      const result = await LoteJeringaService.getByJeringa(jeringaId);
      successResponse(res, result.data, result.message);
    } catch (error) {
      console.error('Error en LoteJeringaController.getByJeringa:', error);
      errorResponse(res, error.message || 'Error interno del servidor', error.statusCode || 500);
    }
  }

  /**
   * Obtener lotes con stock bajo
   * GET /api/lotes-jeringas/stock-bajo
   */
  static async getStockBajo(req: Request, res: Response): Promise<void> {
    try {
      const { porcentaje = '20' } = req.query;
      const porcentajeNum = parseInt(porcentaje as string, 10);

      if (isNaN(porcentajeNum) || porcentajeNum < 1 || porcentajeNum > 100) {
        errorResponse(res, 'El porcentaje debe ser un número entre 1 y 100', 400);
        return;
      }

      const result = await LoteJeringaService.getStockBajo(porcentajeNum);
      successResponse(res, result.data, result.message);
    } catch (error) {
      console.error('Error en LoteJeringaController.getStockBajo:', error);
      errorResponse(res, error.message || 'Error interno del servidor', error.statusCode || 500);
    }
  }
}
