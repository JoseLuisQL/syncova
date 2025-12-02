import { Request, Response } from 'express';
import { ValeService, GenerarValeDto, ValesFilters } from '@/services/ValeService';
import { ValeExportService } from '@/services/ValeExportService';
import { StockValidationService, VaccineRequirement } from '@/services/StockValidationService';
import { ResponseUtil } from '@/utils/response';
import { validateUUID } from '@/utils/validation';
import { EstadoVale } from '@prisma/client';

/**
 * Controlador para gestión profesional de Vales de Entrega
 * Módulo 11: VALES DE ENTREGA
 */
export class ValeController {

  /**
   * Generar vale de entrega
   * POST /api/vales/generar
   */
  static async generarVale(req: Request, res: Response): Promise<void> {
    try {
      const data: GenerarValeDto = req.body;

      // Validaciones básicas
      if (!data.centroAcopioId || !validateUUID(data.centroAcopioId)) {
        ResponseUtil.error(res, 'ID de centro de acopio inválido', 400);
        return;
      }

      // Permitir usuario temporal para generación automática
      if (!data.usuarioId || (data.usuarioId !== 'temp-user-id' && !validateUUID(data.usuarioId))) {
        ResponseUtil.error(res, 'ID de usuario inválido', 400);
        return;
      }

      if (!data.mes || data.mes < 1 || data.mes > 12) {
        ResponseUtil.error(res, 'Mes debe estar entre 1 y 12', 400);
        return;
      }

      if (!data.anio || data.anio < 2020) {
        ResponseUtil.error(res, 'Año inválido', 400);
        return;
      }

      const result = await ValeService.generarVale(data);

      if (!result.success) {
        ResponseUtil.error(res, result.error || 'Error al generar vale', 400);
        return;
      }

      ResponseUtil.success(res, result.data, 'Vale generado exitosamente');
    } catch (error) {
      console.error('Error en ValeController.generarVale:', error);
      ResponseUtil.error(res, 'Error interno del servidor', 500);
    }
  }

  /**
   * Validar stock disponible antes de generar vale
   * POST /api/vales/validar-stock
   */
  static async validarStock(req: Request, res: Response): Promise<void> {
    try {
      const { centroAcopioId, mes, anio, tipoVale, entregasAdicionalesSeleccionadas, gruposEntregasSeleccionados } = req.body;

      // Validaciones básicas
      if (!centroAcopioId || !validateUUID(centroAcopioId)) {
        ResponseUtil.error(res, 'ID de centro de acopio inválido', 400);
        return;
      }

      if (!mes || mes < 1 || mes > 12) {
        ResponseUtil.error(res, 'Mes debe estar entre 1 y 12', 400);
        return;
      }

      if (!anio || anio < 2020) {
        ResponseUtil.error(res, 'Año inválido', 400);
        return;
      }

      // Obtener movimientos para el vale según el tipo especificado
      const tipoValeEfectivo = tipoVale || 'completo';
      const movimientos = await ValeService.obtenerMovimientosParaVale(
        centroAcopioId,
        mes,
        anio,
        tipoValeEfectivo,
        entregasAdicionalesSeleccionadas,
        gruposEntregasSeleccionados
      );

      if (movimientos.length === 0) {
        ResponseUtil.error(res, 'No hay movimientos con entregas para validar', 400);
        return;
      }

      // Preparar requerimientos de vacunas SEGÚN EL TIPO DE VALE
      const vaccineRequirements: VaccineRequirement[] = movimientos.map(mov => {
        let quantity = 0;
        
        switch (tipoValeEfectivo) {
          case 'solo_base':
            // Solo entrega base programada
            quantity = mov.entrega || 0;
            break;
          case 'solo_adicionales':
            // Solo entregas adicionales (filtradas por grupos si aplica)
            quantity = mov.entregasAdicionales?.reduce((sum, ea) => sum + ea.cantidad, 0) || 0;
            break;
          case 'completo':
          default:
            // Entrega base + entregas adicionales
            quantity = (mov.entrega || 0) + (mov.entregasAdicionales?.reduce((sum, ea) => sum + ea.cantidad, 0) || 0);
            break;
        }
        
        return {
          vaccineId: mov.vacunaId,
          quantity
        };
      }).filter(req => req.quantity > 0);

      // Validar stock
      const stockValidation = await StockValidationService.validateStockForVoucher(
        vaccineRequirements,
        centroAcopioId
      );

      ResponseUtil.success(res, stockValidation, 'Validación de stock completada');
    } catch (error) {
      console.error('Error en ValeController.validarStock:', error);
      ResponseUtil.error(res, 'Error interno del servidor', 500);
    }
  }

  /**
   * Obtener vales con filtros
   * GET /api/vales
   */
  static async getVales(req: Request, res: Response): Promise<void> {
    try {
      const filters: ValesFilters = {
        centroAcopioId: req.query.centroAcopioId as string,
        mes: req.query.mes ? parseInt(req.query.mes as string) : undefined,
        anio: req.query.anio ? parseInt(req.query.anio as string) : undefined,
        estado: req.query.estado as EstadoVale,
        search: req.query.search as string,
        page: req.query.page ? parseInt(req.query.page as string) : 1,
        limit: req.query.limit ? parseInt(req.query.limit as string) : 50
      };

      // Validar UUID si se proporciona
      if (filters.centroAcopioId && !validateUUID(filters.centroAcopioId)) {
        ResponseUtil.error(res, 'ID de centro de acopio inválido', 400);
        return;
      }

      // Validar estado si se proporciona
      if (filters.estado && !Object.values(EstadoVale).includes(filters.estado)) {
        ResponseUtil.error(res, 'Estado de vale inválido', 400);
        return;
      }

      const result = await ValeService.getVales(filters);

      if (!result.success) {
        ResponseUtil.error(res, result.error || 'Error al obtener vales', 400);
        return;
      }

      ResponseUtil.success(res, result.data, 'Vales obtenidos exitosamente');
    } catch (error) {
      console.error('Error en ValeController.getVales:', error);
      ResponseUtil.error(res, 'Error interno del servidor', 500);
    }
  }

  /**
   * Obtener vale por ID
   * GET /api/vales/:id
   */
  static async getValeById(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;

      if (!validateUUID(id)) {
        ResponseUtil.error(res, 'ID de vale inválido', 400);
        return;
      }

      const result = await ValeService.getValeById(id);

      if (!result.success) {
        ResponseUtil.error(res, result.error || 'Error al obtener vale', result.error === 'Vale no encontrado' ? 404 : 400);
        return;
      }

      ResponseUtil.success(res, result.data, 'Vale obtenido exitosamente');
    } catch (error) {
      console.error('Error en ValeController.getValeById:', error);
      ResponseUtil.error(res, 'Error interno del servidor', 500);
    }
  }

  /**
   * Cambiar estado de vale
   * PATCH /api/vales/:id/estado
   */
  static async cambiarEstado(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const { estado, usuarioId } = req.body;

      if (!validateUUID(id)) {
        ResponseUtil.error(res, 'ID de vale inválido', 400);
        return;
      }

      if (!estado || !Object.values(EstadoVale).includes(estado)) {
        ResponseUtil.error(res, 'Estado de vale inválido', 400);
        return;
      }

      if (!usuarioId || !validateUUID(usuarioId)) {
        ResponseUtil.error(res, 'ID de usuario inválido', 400);
        return;
      }

      const result = await ValeService.cambiarEstado(id, estado, usuarioId);

      if (!result.success) {
        ResponseUtil.error(res, result.error || 'Error al cambiar estado del vale', 400);
        return;
      }

      ResponseUtil.success(res, result.data, 'Estado del vale actualizado exitosamente');
    } catch (error) {
      console.error('Error en ValeController.cambiarEstado:', error);
      ResponseUtil.error(res, 'Error interno del servidor', 500);
    }
  }

  /**
   * Diagnosticar estado de vale para reversión
   * GET /api/vales/:id/diagnostico
   */
  static async diagnosticarVale(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      console.log(`🔍 [ValeController] Diagnosticando vale: ${id}`);

      if (!validateUUID(id)) {
        ResponseUtil.error(res, 'ID de vale inválido', 400);
        return;
      }

      const result = await ValeService.diagnosticarEstadoVale(id);

      if (!result.success) {
        ResponseUtil.error(res, result.error || 'Error al diagnosticar vale', 404);
        return;
      }

      ResponseUtil.success(res, result.data, 'Diagnóstico completado');
    } catch (error) {
      console.error('❌ [ValeController] Error en diagnosticarVale:', error);
      ResponseUtil.error(res, 'Error interno del servidor', 500);
    }
  }

  /**
   * Limpiar estado inconsistente de reversión
   * POST /api/vales/:id/limpiar-reversion
   */
  static async limpiarEstadoReversion(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      console.log(`🧹 [ValeController] Limpiando estado de reversión: ${id}`);

      if (!validateUUID(id)) {
        ResponseUtil.error(res, 'ID de vale inválido', 400);
        return;
      }

      const result = await ValeService.limpiarEstadoReversion(id);

      if (!result.success) {
        ResponseUtil.error(res, result.error || 'Error al limpiar estado', 400);
        return;
      }

      ResponseUtil.success(res, result.data, 'Estado de reversión limpiado exitosamente');
    } catch (error) {
      console.error('❌ [ValeController] Error en limpiarEstadoReversion:', error);
      ResponseUtil.error(res, 'Error interno del servidor', 500);
    }
  }

  /**
   * Revertir vale y restaurar stocks
   * POST /api/vales/:id/revertir
   */
  static async revertirVale(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      console.log(`🔄 [ValeController] Iniciando reversión de vale: ${id}`);

      if (!validateUUID(id)) {
        console.log(`❌ [ValeController] ID de vale inválido: ${id}`);
        ResponseUtil.error(res, 'ID de vale inválido', 400);
        return;
      }

      console.log(`✅ [ValeController] ID válido, llamando al servicio...`);
      const result = await ValeService.revertirVale(id);
      console.log(`📋 [ValeController] Resultado del servicio:`, result);

      if (!result.success) {
        const statusCode = result.error === 'Vale no encontrado' ? 404 : 400;
        console.log(`❌ [ValeController] Error del servicio: ${result.error} (Status: ${statusCode})`);
        ResponseUtil.error(res, result.error || 'Error al revertir vale', statusCode);
        return;
      }

      console.log(`✅ [ValeController] Reversión exitosa`);
      ResponseUtil.success(res, result.data, 'Vale revertido exitosamente');
    } catch (error) {
      console.error('❌ [ValeController] Error crítico en revertirVale:', error);
      console.error('❌ [ValeController] Stack trace:', error instanceof Error ? error.stack : 'No stack trace');
      ResponseUtil.error(res, 'Error interno del servidor', 500);
    }
  }

  /**
   * Obtener estadísticas de vales
   * GET /api/vales/estadisticas
   */
  static async getEstadisticas(req: Request, res: Response): Promise<void> {
    try {
      const { centroAcopioId, anio } = req.query;

      // Validar parámetros
      if (centroAcopioId && !validateUUID(centroAcopioId as string)) {
        ResponseUtil.error(res, 'ID de centro de acopio inválido', 400);
        return;
      }

      const anioNum = anio ? parseInt(anio as string) : new Date().getFullYear();
      if (isNaN(anioNum) || anioNum < 2020) {
        ResponseUtil.error(res, 'Año inválido', 400);
        return;
      }

      // Obtener estadísticas básicas
      const filters: ValesFilters = {
        centroAcopioId: centroAcopioId as string,
        anio: anioNum
      };

      const result = await ValeService.getVales(filters);

      if (!result.success) {
        ResponseUtil.error(res, result.error || 'Error al obtener estadísticas', 400);
        return;
      }

      // Calcular estadísticas
      const vales = result.data.vales;
      const estadisticas = {
        resumen: {
          totalVales: vales.length,
          totalVacunas: vales.reduce((sum, vale) => sum + vale.totalVacunas, 0),
          totalEstablecimientos: vales.reduce((sum, vale) => sum + vale.totalEstablecimientos, 0),
          anio: anioNum
        },
        valesPorMes: Array.from({ length: 12 }, (_, i) => {
          const mes = i + 1;
          const valesMes = vales.filter(v => v.mes === mes);
          return {
            mes,
            cantidad: valesMes.length,
            vacunas: valesMes.reduce((sum, vale) => sum + vale.totalVacunas, 0),
            establecimientos: valesMes.reduce((sum, vale) => sum + vale.totalEstablecimientos, 0)
          };
        }),
        valesPorEstado: Object.values(EstadoVale).map(estado => ({
          estado,
          cantidad: vales.filter(v => v.estado === estado).length,
          vacunas: vales.filter(v => v.estado === estado).reduce((sum, vale) => sum + vale.totalVacunas, 0)
        })),
        centrosAcopio: vales.reduce((acc: any[], vale) => {
          const existente = acc.find(c => c.centroAcopioId === vale.centroAcopioId);
          if (existente) {
            existente.vales++;
            existente.vacunas += vale.totalVacunas;
            existente.establecimientos += vale.totalEstablecimientos;
          } else {
            acc.push({
              centroAcopioId: vale.centroAcopioId,
              nombre: vale.centroAcopio.nombre,
              codigo: vale.centroAcopio.codigo,
              vales: 1,
              vacunas: vale.totalVacunas,
              establecimientos: vale.totalEstablecimientos
            });
          }
          return acc;
        }, [])
      };

      ResponseUtil.success(res, estadisticas, 'Estadísticas obtenidas exitosamente');
    } catch (error) {
      console.error('Error en ValeController.getEstadisticas:', error);
      ResponseUtil.error(res, 'Error interno del servidor', 500);
    }
  }

  /**
   * Obtener vista previa de vale (sin generar)
   * POST /api/vales/vista-previa
   */
  static async getVistaPrevia(req: Request, res: Response): Promise<void> {
    try {
      const { centroAcopioId, mes, anio } = req.body;

      // Validaciones básicas
      if (!centroAcopioId || !validateUUID(centroAcopioId)) {
        ResponseUtil.error(res, 'ID de centro de acopio inválido', 400);
        return;
      }

      if (!mes || mes < 1 || mes > 12) {
        ResponseUtil.error(res, 'Mes debe estar entre 1 y 12', 400);
        return;
      }

      if (!anio || anio < 2020) {
        ResponseUtil.error(res, 'Año inválido', 400);
        return;
      }

      // Simular generación sin afectar stocks
      const data: GenerarValeDto = {
        centroAcopioId,
        mes,
        anio,
        usuarioId: 'temp-user-id', // Usuario temporal para vista previa
        afectarStock: false // No afectar stocks en vista previa
      };

      const result = await ValeService.generarVale(data);

      if (!result.success) {
        ResponseUtil.error(res, result.error || 'Error al generar vista previa', 400);
        return;
      }

      ResponseUtil.success(res, result.data, 'Vista previa generada exitosamente');
    } catch (error) {
      console.error('Error en ValeController.getVistaPrevia:', error);
      ResponseUtil.error(res, 'Error interno del servidor', 500);
    }
  }

  /**
   * Sincronizar vale con movimientos actualizados
   * POST /api/vales/:id/sincronizar
   */
  static async sincronizarVale(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const { usuarioId } = req.body;

      console.log(`🔄 [ValeController] Iniciando sincronización de vale: ${id}`);

      if (!validateUUID(id)) {
        ResponseUtil.error(res, 'ID de vale inválido', 400);
        return;
      }

      // Manejar usuario temporal hasta implementar autenticación completa
      let usuarioIdFinal = usuarioId;
      if (!usuarioId || usuarioId === 'temp-user-id' || !validateUUID(usuarioId)) {
        // Usar el primer usuario administrador disponible
        usuarioIdFinal = 'temp-user-id'; // El servicio lo manejará
      }

      const result = await ValeService.sincronizarValeConMovimientos(id, usuarioIdFinal);

      if (!result.success) {
        console.log(`❌ [ValeController] Error en sincronización: ${result.error}`);
        ResponseUtil.error(res, result.error || 'Error al sincronizar vale', 400);
        return;
      }

      console.log(`✅ [ValeController] Vale sincronizado exitosamente. Modificaciones: ${result.data.modificaciones.length}`);

      ResponseUtil.success(res, result.data, 'Vale sincronizado exitosamente');
    } catch (error) {
      console.error('Error en ValeController.sincronizarVale:', error);
      ResponseUtil.error(res, 'Error interno del servidor', 500);
    }
  }

  /**
   * Obtener historial de modificaciones de un vale
   * GET /api/vales/:id/modificaciones
   */
  static async getModificaciones(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;

      if (!validateUUID(id)) {
        ResponseUtil.error(res, 'ID de vale inválido', 400);
        return;
      }

      const result = await ValeService.obtenerHistorialModificaciones(id);

      if (!result.success) {
        ResponseUtil.error(res, result.error || 'Error al obtener modificaciones', 400);
        return;
      }

      ResponseUtil.success(res, result.data, 'Historial de modificaciones obtenido exitosamente');
    } catch (error) {
      console.error('Error en ValeController.getModificaciones:', error);
      ResponseUtil.error(res, 'Error interno del servidor', 500);
    }
  }

  /**
   * Obtener tipos de vales ya generados para un período
   * GET /api/vales/tipos-generados
   */
  static async getTiposValesGenerados(req: Request, res: Response): Promise<void> {
    try {
      const { centroAcopioId, mes, anio } = req.query;

      // Validaciones básicas
      if (!centroAcopioId || !validateUUID(centroAcopioId as string)) {
        ResponseUtil.error(res, 'ID de centro de acopio inválido', 400);
        return;
      }

      const mesNum = parseInt(mes as string);
      const anioNum = parseInt(anio as string);

      if (!mesNum || mesNum < 1 || mesNum > 12) {
        ResponseUtil.error(res, 'Mes debe estar entre 1 y 12', 400);
        return;
      }

      if (!anioNum || anioNum < 2020) {
        ResponseUtil.error(res, 'Año inválido', 400);
        return;
      }

      const result = await ValeService.getTiposValesGenerados(
        centroAcopioId as string,
        mesNum,
        anioNum
      );

      if (!result.success) {
        ResponseUtil.error(res, result.error || 'Error al obtener tipos de vales generados', 400);
        return;
      }

      ResponseUtil.success(res, result.data, 'Tipos de vales generados obtenidos exitosamente');
    } catch (error) {
      console.error('Error en ValeController.getTiposValesGenerados:', error);
      ResponseUtil.error(res, 'Error interno del servidor', 500);
    }
  }

  /**
   * Verificar si existen vales para un establecimiento específico
   * GET /api/vales/verificar-existencia
   */
  static async verificarValesExistentes(req: Request, res: Response): Promise<void> {
    try {
      const { establecimientoId, vacunaId, mes, anio } = req.query;

      // Validaciones básicas
      if (!establecimientoId || !validateUUID(establecimientoId as string)) {
        ResponseUtil.error(res, 'ID de establecimiento inválido', 400);
        return;
      }

      if (!vacunaId || !validateUUID(vacunaId as string)) {
        ResponseUtil.error(res, 'ID de vacuna inválido', 400);
        return;
      }

      const mesNum = parseInt(mes as string);
      const anioNum = parseInt(anio as string);

      if (!mesNum || mesNum < 1 || mesNum > 12) {
        ResponseUtil.error(res, 'Mes debe estar entre 1 y 12', 400);
        return;
      }

      if (!anioNum || anioNum < 2020) {
        ResponseUtil.error(res, 'Año inválido', 400);
        return;
      }

      const result = await ValeService.verificarValesExistentesParaEstablecimiento(
        establecimientoId as string,
        vacunaId as string,
        mesNum,
        anioNum
      );

      if (!result.success) {
        ResponseUtil.error(res, result.error || 'Error al verificar vales existentes', 400);
        return;
      }

      ResponseUtil.success(res, result.data, 'Verificación de vales existentes completada');
    } catch (error) {
      console.error('Error en ValeController.verificarValesExistentes:', error);
      ResponseUtil.error(res, 'Error interno del servidor', 500);
    }
  }

  /**
   * Obtener grupos de entregas adicionales ya generados
   * GET /api/vales/grupos-entregas-generados
   */
  static async getGruposEntregasAdicionalesGenerados(req: Request, res: Response): Promise<void> {
    try {
      const { centroAcopioId, mes, anio } = req.query;

      // Validaciones básicas
      if (!centroAcopioId || !validateUUID(centroAcopioId as string)) {
        ResponseUtil.error(res, 'ID de centro de acopio inválido', 400);
        return;
      }

      const mesNum = parseInt(mes as string);
      const anioNum = parseInt(anio as string);

      if (!mesNum || mesNum < 1 || mesNum > 12) {
        ResponseUtil.error(res, 'Mes debe estar entre 1 y 12', 400);
        return;
      }

      if (!anioNum || anioNum < 2020) {
        ResponseUtil.error(res, 'Año inválido', 400);
        return;
      }

      const result = await ValeService.getGruposEntregasAdicionalesGenerados(
        centroAcopioId as string,
        mesNum,
        anioNum
      );

      if (!result.success) {
        ResponseUtil.error(res, result.error || 'Error al obtener grupos generados', 400);
        return;
      }

      ResponseUtil.success(res, result.data, 'Grupos de entregas adicionales generados obtenidos exitosamente');
    } catch (error) {
      console.error('Error en ValeController.getGruposEntregasAdicionalesGenerados:', error);
      ResponseUtil.error(res, 'Error interno del servidor', 500);
    }
  }

  /**
   * Obtener entregas adicionales disponibles para un centro de acopio y período
   * GET /api/vales/entregas-adicionales-disponibles
   */
  static async getEntregasAdicionalesDisponibles(req: Request, res: Response): Promise<void> {
    try {
      const { centroAcopioId, mes, anio } = req.query;

      // Validaciones básicas
      if (!centroAcopioId || !validateUUID(centroAcopioId as string)) {
        ResponseUtil.error(res, 'ID de centro de acopio inválido', 400);
        return;
      }

      const mesNum = parseInt(mes as string);
      const anioNum = parseInt(anio as string);

      if (!mesNum || mesNum < 1 || mesNum > 12) {
        ResponseUtil.error(res, 'Mes debe estar entre 1 y 12', 400);
        return;
      }

      if (!anioNum || anioNum < 2020) {
        ResponseUtil.error(res, 'Año inválido', 400);
        return;
      }

      const result = await ValeService.getEntregasAdicionalesDisponibles(
        centroAcopioId as string,
        mesNum,
        anioNum
      );

      if (!result.success) {
        ResponseUtil.error(res, result.error || 'Error al obtener entregas adicionales', 400);
        return;
      }

      ResponseUtil.success(res, result.data, 'Entregas adicionales obtenidas exitosamente');
    } catch (error) {
      console.error('Error en ValeController.getEntregasAdicionalesDisponibles:', error);
      ResponseUtil.error(res, 'Error interno del servidor', 500);
    }
  }

  /**
   * Sincronización automática en tiempo real
   * POST /api/vales/auto-sync
   */
  static async autoSync(req: Request, res: Response): Promise<void> {
    try {
      const { establecimientoId, vacunaId, mes, anio } = req.body;

      console.log(`🔄 [ValeController] Sincronización automática solicitada: ${establecimientoId}, ${mes}/${anio}`);

      // Validaciones básicas
      if (!establecimientoId || !vacunaId || !mes || !anio) {
        ResponseUtil.error(res, 'establecimientoId, vacunaId, mes y anio son requeridos', 400);
        return;
      }

      if (!validateUUID(establecimientoId) || !validateUUID(vacunaId)) {
        ResponseUtil.error(res, 'IDs inválidos', 400);
        return;
      }

      if (mes < 1 || mes > 12) {
        ResponseUtil.error(res, 'El mes debe estar entre 1 y 12', 400);
        return;
      }

      if (anio < 2020 || anio > 2050) {
        ResponseUtil.error(res, 'El año debe estar entre 2020 y 2050', 400);
        return;
      }

      const result = await ValeService.sincronizarValesAutomaticamente(
        establecimientoId,
        vacunaId,
        mes,
        anio,
        'system-auto-sync'
      );

      if (!result.success) {
        console.log(`❌ [ValeController] Error en sincronización automática: ${result.error}`);
        ResponseUtil.error(res, result.error || 'Error en sincronización automática', 400);
        return;
      }

      const { valesSincronizados, errores } = result.data;

      // Calcular total de modificaciones (simplificado)
      const modificaciones = valesSincronizados * 2; // Estimación

      console.log(`✅ [ValeController] Sincronización automática completada: ${valesSincronizados} vales`);

      ResponseUtil.success(res, {
        valesSincronizados,
        modificaciones,
        errores
      }, 'Sincronización automática completada');
    } catch (error) {
      console.error('Error en ValeController.autoSync:', error);
      ResponseUtil.error(res, 'Error interno del servidor', 500);
    }
  }

  // =====================================================
  // MÉTODOS DE EXPORTACIÓN
  // =====================================================

  /**
   * Exportar vale a Excel
   * POST /api/vales/:id/export/excel
   */
  static async exportarExcel(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const config = req.body;

      console.log('🔍 Exportar Excel - ID:', id);
      console.log('🔍 Exportar Excel - Config recibida:', JSON.stringify(config, null, 2));

      if (!validateUUID(id)) {
        ResponseUtil.error(res, 'ID de vale inválido', 400);
        return;
      }

      // Validar configuración
      const errores = ValeExportService.validarConfiguracion(config);
      console.log('🔍 Errores de validación:', errores);

      if (errores.length > 0) {
        ResponseUtil.error(res, errores.join(', '), 400);
        return;
      }

      const result = await ValeExportService.exportarExcel(id, config);

      if (!result.success || !result.data) {
        ResponseUtil.error(res, result.error || 'Error al generar Excel', 400);
        return;
      }

      // Configurar headers para descarga
      const filename = result.data.filename;
      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
      res.setHeader('Access-Control-Expose-Headers', 'Content-Disposition');

      // Escribir el archivo Excel al response
      await result.data.workbook.xlsx.write(res);
      res.end();

    } catch (error) {
      console.error('Error en ValeController.exportarExcel:', error);
      ResponseUtil.error(res, 'Error interno del servidor', 500);
    }
  }

  /**
   * Exportar múltiples vales combinados a Excel
   * POST /api/vales/export/combined/excel
   * NUEVA FUNCIÓN para exportación global con agregación correcta
   */
  static async exportarValesCombinados(req: Request, res: Response): Promise<void> {
    try {
      const { valeIds, config } = req.body;

      console.log('🔍 Exportar Vales Combinados - IDs:', valeIds);
      console.log('🔍 Exportar Vales Combinados - Config:', JSON.stringify(config, null, 2));

      // Validar que se proporcionen IDs de vales
      if (!Array.isArray(valeIds) || valeIds.length === 0) {
        ResponseUtil.error(res, 'Se requiere al menos un ID de vale', 400);
        return;
      }

      // Validar que todos los IDs sean UUIDs válidos
      for (const id of valeIds) {
        if (!validateUUID(id)) {
          ResponseUtil.error(res, `ID de vale inválido: ${id}`, 400);
          return;
        }
      }

      // Validar configuración
      const errores = ValeExportService.validarConfiguracion(config);
      if (errores.length > 0) {
        ResponseUtil.error(res, errores.join(', '), 400);
        return;
      }

      const result = await ValeExportService.exportarValesCombinados(valeIds, config);

      if (!result.success || !result.data) {
        ResponseUtil.error(res, result.error || 'Error al generar Excel combinado', 400);
        return;
      }

      // Configurar headers para descarga
      const filename = result.data.filename;
      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
      res.setHeader('Access-Control-Expose-Headers', 'Content-Disposition');

      // Escribir el archivo Excel al response
      await result.data.workbook.xlsx.write(res);
      res.end();

    } catch (error) {
      console.error('Error en ValeController.exportarValesCombinados:', error);
      ResponseUtil.error(res, 'Error interno del servidor', 500);
    }
  }

  /**
   * Exportar vale a PDF
   * POST /api/vales/:id/export/pdf
   */
  static async exportarPDF(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const config = req.body;

      if (!validateUUID(id)) {
        ResponseUtil.error(res, 'ID de vale inválido', 400);
        return;
      }

      // Validar configuración
      const errores = ValeExportService.validarConfiguracion(config);
      if (errores.length > 0) {
        ResponseUtil.error(res, errores.join(', '), 400);
        return;
      }

      const result = await ValeExportService.exportarPDF(id, config);

      if (!result.success || !result.data) {
        ResponseUtil.error(res, result.error || 'Error al generar PDF', 400);
        return;
      }

      // Configurar headers para descarga
      const filename = result.data.filename;
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
      res.setHeader('Access-Control-Expose-Headers', 'Content-Disposition');

      // Enviar el buffer PDF
      res.send(result.data.buffer);

    } catch (error) {
      console.error('Error en ValeController.exportarPDF:', error);
      ResponseUtil.error(res, 'Error interno del servidor', 500);
    }
  }

  /**
   * Obtener vista previa de exportación
   * POST /api/vales/:id/export/preview
   */
  static async getExportPreview(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const config = req.body;

      if (!validateUUID(id)) {
        ResponseUtil.error(res, 'ID de vale inválido', 400);
        return;
      }

      const result = await ValeExportService.getExportPreview(id, config);

      if (!result.success) {
        ResponseUtil.error(res, result.error || 'Error al generar vista previa', 400);
        return;
      }

      ResponseUtil.success(res, result.data, 'Vista previa generada exitosamente');

    } catch (error) {
      console.error('Error en ValeController.getExportPreview:', error);
      ResponseUtil.error(res, 'Error interno del servidor', 500);
    }
  }
}
