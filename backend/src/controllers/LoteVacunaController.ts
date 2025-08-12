import { Request, Response } from 'express';
import { LoteVacunaService } from '@/services/LoteVacunaService';
import { CreateLoteVacunaDto, UpdateLoteVacunaDto, EstadoLote, FormaIngreso, ComprobanteClase } from '@/types';
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
 * Controlador para gestión de lotes de vacunas
 */
export class LoteVacunaController {
  /**
   * Obtener todos los lotes de vacunas
   * GET /api/lotes-vacunas
   */
  static async getAll(req: Request, res: Response): Promise<void> {
    try {
      const {
        estado = 'todos',
        search,
        vacunaId,
        vencimiento = 'todos',
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

      if (vencimiento && !['todos', 'vigente', 'por_vencer', 'vencido'].includes(vencimiento as string)) {
        errorResponse(res, 'Filtro de vencimiento inválido', 400);
        return;
      }

      if (vacunaId && !validateUUID(vacunaId as string)) {
        errorResponse(res, 'ID de vacuna inválido', 400);
        return;
      }

      const result = await LoteVacunaService.getAll({
        estado: estado as EstadoLote | 'todos',
        search: search as string,
        vacunaId: vacunaId as string,
        vencimiento: vencimiento as 'todos' | 'vigente' | 'por_vencer' | 'vencido',
        page: pageNum,
        limit: limitNum
      });

      if (result.success) {
        paginatedResponse(res, {
          data: result.data.lotes,
          total: result.data.total,
          page: pageNum,
          limit: limitNum,
          message: result.message
        });
      } else {
        errorResponse(res, result.message, 500);
      }
    } catch (error: any) {
      console.error('Error en LoteVacunaController.getAll:', error);
      errorResponse(res, error.message || 'Error interno del servidor', error.statusCode || 500);
    }
  }

  /**
   * Obtener estadísticas de lotes de vacunas
   * GET /api/lotes-vacunas/stats
   */
  static async getStats(req: Request, res: Response): Promise<void> {
    try {
      const result = await LoteVacunaService.getStats();

      if (result.success) {
        successResponse(res, result.data, result.message);
      } else {
        errorResponse(res, result.message, 500);
      }
    } catch (error: any) {
      console.error('Error en LoteVacunaController.getStats:', error);
      errorResponse(res, error.message || 'Error interno del servidor', error.statusCode || 500);
    }
  }

  /**
   * Obtener lote de vacuna por ID
   * GET /api/lotes-vacunas/:id
   */
  static async getById(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;

      if (!validateUUID(id)) {
        errorResponse(res, 'ID de lote inválido', 400);
        return;
      }

      const result = await LoteVacunaService.getById(id);

      if (result.success) {
        successResponse(res, result.data, result.message);
      } else {
        errorResponse(res, result.message, 404);
      }
    } catch (error: any) {
      console.error('Error en LoteVacunaController.getById:', error);
      errorResponse(res, error.message || 'Error interno del servidor', error.statusCode || 500);
    }
  }

  /**
   * Crear nuevo lote de vacuna
   * POST /api/lotes-vacunas
   */
  static async create(req: Request, res: Response): Promise<void> {
    try {
      console.log('📝 Datos recibidos para crear lote de vacuna:', JSON.stringify(req.body, null, 2));

      const {
        numero,
        vacunaId,
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
      const requiredFields = [
        { field: numero, name: 'numero' },
        { field: vacunaId, name: 'vacunaId' },
        { field: fechaIngreso, name: 'fechaIngreso' },
        { field: fechaVencimiento, name: 'fechaVencimiento' },
        { field: formaIngreso, name: 'formaIngreso' },
        { field: comprobanteClase, name: 'comprobanteClase' },
        { field: numeroComprobante, name: 'numeroComprobante' },
        { field: cantidadInicial, name: 'cantidadInicial' },
        { field: cantidadActual, name: 'cantidadActual' }
      ];

      for (const { field, name } of requiredFields) {
        if (!isRequired(field)) {
          console.log(`❌ Campo requerido faltante: ${name}, valor:`, field);
          errorResponse(res, `El campo ${name} es requerido`, 400);
          return;
        }
      }

      // Validaciones específicas
      if (!validateUUID(vacunaId)) {
        console.log(`❌ ID de vacuna inválido:`, vacunaId);
        errorResponse(res, 'ID de vacuna inválido', 400);
        return;
      }

      if (!validateDate(fechaIngreso)) {
        console.log(`❌ Fecha de ingreso inválida:`, fechaIngreso);
        errorResponse(res, 'Fecha de ingreso inválida', 400);
        return;
      }

      if (!validateDate(fechaVencimiento)) {
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

      console.log('✅ Todas las validaciones pasaron, creando lote...');

      const loteData: CreateLoteVacunaDto = {
        numero: numero.trim(),
        vacunaId,
        fechaIngreso: new Date(fechaIngreso),
        fechaVencimiento: new Date(fechaVencimiento),
        formaIngreso: mapFormaIngreso(formaIngreso) as FormaIngreso,
        comprobanteClase: comprobanteClase as ComprobanteClase,
        numeroComprobante: numeroComprobante.trim(),
        cantidadInicial: parseInt(cantidadInicial, 10),
        cantidadActual: parseInt(cantidadActual, 10),
        observaciones: observaciones?.trim() || undefined
      };

      console.log('📦 Datos procesados para crear lote:', JSON.stringify(loteData, null, 2));

      const result = await LoteVacunaService.create(loteData);

      if (result.success) {
        successResponse(res, result.data, result.message, 201);
      } else {
        errorResponse(res, result.message, 400);
      }
    } catch (error: any) {
      console.error('Error en LoteVacunaController.create:', error);
      errorResponse(res, error.message || 'Error interno del servidor', error.statusCode || 500);
    }
  }

  /**
   * Actualizar lote de vacuna
   * PUT /api/lotes-vacunas/:id
   */
  static async update(req: Request, res: Response): Promise<void> {
    try {
      console.log('📝 Datos recibidos para actualizar lote de vacuna:', JSON.stringify(req.body, null, 2));

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
      const updateData: UpdateLoteVacunaDto = {};

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
        if (!validateDate(fechaVencimiento)) {
          errorResponse(res, 'Fecha de vencimiento inválida', 400);
          return;
        }
        updateData.fechaVencimiento = new Date(fechaVencimiento);
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

      console.log('✅ Todas las validaciones pasaron, actualizando lote de vacuna...');
      console.log('📦 Datos procesados para actualizar lote de vacuna:', JSON.stringify(updateData, null, 2));

      const result = await LoteVacunaService.update(id, updateData);

      if (result.success) {
        successResponse(res, result.data, result.message);
      } else {
        errorResponse(res, result.message, 400);
      }
    } catch (error: any) {
      console.error('Error en LoteVacunaController.update:', error);
      errorResponse(res, error.message || 'Error interno del servidor', error.statusCode || 500);
    }
  }

  /**
   * Eliminar lote de vacuna
   * DELETE /api/lotes-vacunas/:id
   */
  static async delete(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;

      if (!validateUUID(id)) {
        errorResponse(res, 'ID de lote inválido', 400);
        return;
      }

      const result = await LoteVacunaService.delete(id);

      if (result.success) {
        successResponse(res, null, result.message);
      } else {
        errorResponse(res, result.message, 400);
      }
    } catch (error: any) {
      console.error('Error en LoteVacunaController.delete:', error);
      errorResponse(res, error.message || 'Error interno del servidor', error.statusCode || 500);
    }
  }

  /**
   * Obtener lotes por vacuna
   * GET /api/lotes-vacunas/vacuna/:vacunaId
   */
  static async getByVacuna(req: Request, res: Response): Promise<void> {
    try {
      const { vacunaId } = req.params;

      if (!validateUUID(vacunaId)) {
        errorResponse(res, 'ID de vacuna inválido', 400);
        return;
      }

      const result = await LoteVacunaService.getByVacuna(vacunaId);

      if (result.success) {
        successResponse(res, result.data, result.message);
      } else {
        errorResponse(res, result.message, 500);
      }
    } catch (error: any) {
      console.error('Error en LoteVacunaController.getByVacuna:', error);
      errorResponse(res, error.message || 'Error interno del servidor', error.statusCode || 500);
    }
  }

  /**
   * Obtener lotes próximos a vencer
   * GET /api/lotes-vacunas/proximos-vencer
   */
  static async getProximosAVencer(req: Request, res: Response): Promise<void> {
    try {
      const { dias = '30' } = req.query;
      const diasNum = parseInt(dias as string, 10);

      if (isNaN(diasNum) || diasNum < 1 || diasNum > 365) {
        errorResponse(res, 'El parámetro días debe ser un número entre 1 y 365', 400);
        return;
      }

      const result = await LoteVacunaService.getProximosAVencer(diasNum);

      if (result.success) {
        successResponse(res, result.data, result.message);
      } else {
        errorResponse(res, result.message, 500);
      }
    } catch (error: any) {
      console.error('Error en LoteVacunaController.getProximosAVencer:', error);
      errorResponse(res, error.message || 'Error interno del servidor', error.statusCode || 500);
    }
  }
}
