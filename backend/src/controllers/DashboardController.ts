import { Request, Response } from 'express';
import { DashboardService } from '@/services/DashboardService';

/**
 * Controlador para el Dashboard
 */
export class DashboardController {
  /**
   * Obtener todos los datos del dashboard
   */
  static async getDashboardData(req: Request, res: Response): Promise<void> {
    try {
      console.log('🔄 Obteniendo datos completos del dashboard');

      const result = await DashboardService.getDashboardData();

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
  static async getEstadisticas(req: Request, res: Response): Promise<void> {
    try {
      console.info('📊 Obteniendo estadísticas generales del dashboard');

      const result = await DashboardService.getEstadisticasGenerales();

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
  static async getMovimientosMensuales(req: Request, res: Response): Promise<void> {
    try {
      console.info('📈 Obteniendo movimientos mensuales para gráficos');

      const result = await DashboardService.getMovimientosMensuales();

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
  static async getStockPorVacuna(req: Request, res: Response): Promise<void> {
    try {
      console.info('🥧 Obteniendo stock por vacuna para gráfico');

      const result = await DashboardService.getStockPorVacuna();

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
  static async getCentrosAcopioStatus(req: Request, res: Response): Promise<void> {
    try {
      console.info('🏢 Obteniendo estado de centros de acopio');

      const result = await DashboardService.getCentrosAcopioStatus();

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
  static async getCentrosAcopio(req: Request, res: Response): Promise<void> {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 5;

      console.log(`🏢 Obteniendo centros de acopio (página ${page}, límite ${limit})`);

      const result = await DashboardService.getCentrosAcopioStatus(page, limit);

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
  static async getAlertasRecientes(req: Request, res: Response): Promise<void> {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 3;

      console.log(`🚨 Obteniendo alertas recientes (página ${page}, límite ${limit})`);

      const result = await DashboardService.getAlertasRecientes(page, limit);

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
  static async getActividadReciente(req: Request, res: Response): Promise<void> {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 5;

      console.log(`📋 Obteniendo actividad reciente (página ${page}, límite ${limit})`);

      const result = await DashboardService.getActividadReciente(page, limit);

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
