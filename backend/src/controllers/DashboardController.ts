import { Response } from 'express';
import { DashboardService } from '@/services/DashboardService';
import { getScopedCentroAcopioId } from '@/middleware/accessControl';
import { AuthenticatedRequest } from '@/types';

/**
 * Controlador para el Dashboard
 */
export class DashboardController {
  /**
   * Obtener todos los datos del dashboard
   */
  static async getDashboardData(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      console.log('🔄 Obteniendo datos completos del dashboard');
      const scopedCentroAcopioId = getScopedCentroAcopioId(req);

      const result = await DashboardService.getDashboardData(scopedCentroAcopioId);

      if (!result.success) {
        console.error('❌ Error al obtener datos del dashboard:', result.error);
        res.status(500).json({
          success: false,
          message: result.error || 'Error interno del servidor',
          data: null
        });
        return;
      }

      console.info('✅ Datos del dashboard obtenidos exitosamente');
      res.status(200).json({
        success: true,
        message: 'Datos del dashboard obtenidos exitosamente',
        data: result.data
      });
    } catch (error) {
      console.error('❌ Error inesperado en getDashboardData:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor',
        data: null
      });
    }
  }

  /**
   * Obtener solo las estadísticas generales
   */
  static async getEstadisticas(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      console.info('📊 Obteniendo estadísticas generales del dashboard');
      const scopedCentroAcopioId = getScopedCentroAcopioId(req);

      const result = await DashboardService.getEstadisticasGenerales(scopedCentroAcopioId);

      if (!result.success) {
        console.error('❌ Error al obtener estadísticas:', result.error);
        res.status(500).json({
          success: false,
          message: result.error || 'Error interno del servidor',
          data: null
        });
        return;
      }

      console.info('✅ Estadísticas obtenidas exitosamente');
      res.status(200).json({
        success: true,
        message: 'Estadísticas obtenidas exitosamente',
        data: result.data
      });
    } catch (error) {
      console.error('❌ Error inesperado en getEstadisticas:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor',
        data: null
      });
    }
  }

  /**
   * Obtener datos de movimientos mensuales para gráficos
   */
  static async getMovimientosMensuales(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      console.info('📈 Obteniendo movimientos mensuales para gráficos');
      const scopedCentroAcopioId = getScopedCentroAcopioId(req);

      const result = await DashboardService.getMovimientosMensuales(scopedCentroAcopioId);

      if (!result.success) {
        console.error('❌ Error al obtener movimientos mensuales:', result.error);
        res.status(500).json({
          success: false,
          message: result.error || 'Error interno del servidor',
          data: null
        });
        return;
      }

      console.info('✅ Movimientos mensuales obtenidos exitosamente');
      res.status(200).json({
        success: true,
        message: 'Movimientos mensuales obtenidos exitosamente',
        data: result.data
      });
    } catch (error) {
      console.error('❌ Error inesperado en getMovimientosMensuales:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor',
        data: null
      });
    }
  }

  /**
   * Obtener datos de stock por vacuna para gráfico de torta
   */
  static async getStockPorVacuna(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      console.info('🥧 Obteniendo stock por vacuna para gráfico');
      const scopedCentroAcopioId = getScopedCentroAcopioId(req);

      const result = await DashboardService.getStockPorVacuna(scopedCentroAcopioId);

      if (!result.success) {
        console.error('❌ Error al obtener stock por vacuna:', result.error);
        res.status(500).json({
          success: false,
          message: result.error || 'Error interno del servidor',
          data: null
        });
        return;
      }

      console.info('✅ Stock por vacuna obtenido exitosamente');
      res.status(200).json({
        success: true,
        message: 'Stock por vacuna obtenido exitosamente',
        data: result.data
      });
    } catch (error) {
      console.error('❌ Error inesperado en getStockPorVacuna:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor',
        data: null
      });
    }
  }

  /**
   * Obtener estado de centros de acopio
   */
  static async getCentrosAcopioStatus(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      console.info('🏢 Obteniendo estado de centros de acopio');
      const scopedCentroAcopioId = getScopedCentroAcopioId(req);

      const result = await DashboardService.getCentrosAcopioStatus(1, 5, scopedCentroAcopioId);

      if (!result.success) {
        console.error('❌ Error al obtener estado de centros de acopio:', result.error);
        res.status(500).json({
          success: false,
          message: result.error || 'Error interno del servidor',
          data: null
        });
        return;
      }

      console.info('✅ Estado de centros de acopio obtenido exitosamente');
      res.status(200).json({
        success: true,
        message: 'Estado de centros de acopio obtenido exitosamente',
        data: result.data
      });
    } catch (error) {
      console.error('❌ Error inesperado en getCentrosAcopioStatus:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor',
        data: null
      });
    }
  }

  /**
   * Obtener centros de acopio con paginación
   */
  static async getCentrosAcopio(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 5;
      const scopedCentroAcopioId = getScopedCentroAcopioId(req);

      console.log(`🏢 Obteniendo centros de acopio (página ${page}, límite ${limit})`);

      const result = await DashboardService.getCentrosAcopioStatus(page, limit, scopedCentroAcopioId);

      if (!result.success) {
        console.error('❌ Error al obtener centros de acopio:', result.error);
        res.status(500).json({
          success: false,
          message: result.error || 'Error al obtener centros de acopio',
          data: null
        });
        return;
      }

      console.info('✅ Centros de acopio obtenidos exitosamente');
      res.status(200).json({
        success: true,
        message: 'Centros de acopio obtenidos exitosamente',
        data: result.data
      });
    } catch (error) {
      console.error('❌ Error inesperado en getCentrosAcopio:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor',
        data: null
      });
    }
  }

  /**
   * Obtener alertas recientes con paginación
   */
  static async getAlertasRecientes(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 3;
      const scopedCentroAcopioId = getScopedCentroAcopioId(req);

      console.log(`🚨 Obteniendo alertas recientes (página ${page}, límite ${limit})`);

      const result = await DashboardService.getAlertasRecientes(page, limit, scopedCentroAcopioId);

      if (!result.success) {
        console.error('❌ Error al obtener alertas recientes:', result.error);
        res.status(500).json({
          success: false,
          message: result.error || 'Error al obtener alertas recientes',
          data: null
        });
        return;
      }

      console.info('✅ Alertas recientes obtenidas exitosamente');
      res.status(200).json({
        success: true,
        message: 'Alertas recientes obtenidas exitosamente',
        data: result.data
      });
    } catch (error) {
      console.error('❌ Error inesperado en getAlertasRecientes:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor',
        data: null
      });
    }
  }

  /**
   * Obtener actividad reciente con paginación
   */
  static async getActividadReciente(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 5;
      const scopedCentroAcopioId = getScopedCentroAcopioId(req);

      console.log(`📋 Obteniendo actividad reciente (página ${page}, límite ${limit})`);

      const result = await DashboardService.getActividadReciente(page, limit, scopedCentroAcopioId);

      if (!result.success) {
        console.error('❌ Error al obtener actividad reciente:', result.error);
        res.status(500).json({
          success: false,
          message: result.error || 'Error al obtener actividad reciente',
          data: null
        });
        return;
      }

      console.info('✅ Actividad reciente obtenida exitosamente');
      res.status(200).json({
        success: true,
        message: 'Actividad reciente obtenida exitosamente',
        data: result.data
      });
    } catch (error) {
      console.error('❌ Error inesperado en getActividadReciente:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor',
        data: null
      });
    }
  }
}
