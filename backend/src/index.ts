import 'express-async-errors';
import express from 'express';
import path from 'path';
import { config } from '@/config/env';
import { connectDatabase, checkDatabaseHealth } from '@/config/database';
import { setupMiddlewares, setupErrorHandling, healthCheck } from '@/middleware';
import configuracionRoutes from '@/routes/configuracion';
import configuracionJeringaVacunaRoutes from '@/routes/configuracion-jeringa-vacuna';
import establecimientosRoutes from '@/routes/establecimientos';
import redesRoutes from '@/routes/redes';
import microredesRoutes from '@/routes/microredes';
import centrosAcopioRoutes from '@/routes/centros-acopio';
import vacunasRoutes from '@/routes/vacunas';
import jeringasRoutes from '@/routes/jeringas';
import usuariosRoutes from '@/routes/usuarios';
import lotesVacunasRoutes from '@/routes/lotes-vacunas';
import lotesJeringasRoutes from '@/routes/lotes-jeringas';
import planificacionRoutes from '@/routes/planificacion';
import movimientosRoutes from '@/routes/movimientos';
import entregasAdicionalesRoutes from '@/routes/entregas-adicionales';
import valesRoutes from '@/routes/vales';
import kardexRoutes from '@/routes/kardex';
import reportesRoutes from '@/routes/reportes';
import planificacionReportesRoutes from '@/routes/planificacionReportes';
import programacionAnualCenaresRoutes from '@/routes/programacionAnualCenares';
import authRoutes from '@/routes/auth';
import rolesRoutes from '@/routes/roles';
import permissionsRoutes from '@/routes/permissions';
import alertasRoutes from '@/routes/alertas';
import dashboardRoutes from '@/routes/dashboard';
import iciDemidRoutes from '@/routes/ici-demid';
import permisosOperativosRoutes from '@/routes/permisos-operativos';
import sibotRoutes from '@/routes/sibot';
import { PermisoOperativoService } from '@/services/PermisoOperativoService';
import { logBuffer } from '@/services/sibot/logBuffer';

/**
 * Función principal para inicializar el servidor
 */
async function startServer(): Promise<void> {
  // Inicializar interceptor de logs para Inteligencia SaBot
  logBuffer.overrideConsole();

  try {
    // Crear aplicación Express
    const app = express();

    // CRÍTICO: Habilitar trust proxy para que el rate limiter use la IP real del cliente
    // en vez de la IP interna de Traefik. Sin esto, todos los usuarios comparten el mismo
    // bucket de rate limiting (la IP del proxy).
    app.set('trust proxy', 1);

    // Configurar middlewares globales
    setupMiddlewares(app);

    // Ruta de salud del sistema
    app.get('/health', healthCheck);
    app.get('/api/health', healthCheck);

    // Ruta de información de la API
    app.get('/api', (req, res) => {
      res.json({
        success: true,
        message: 'SIVAC API - Sistema de Gestión de Vacunas',
        data: {
          version: config.api.version,
          environment: config.env,
          timestamp: new Date().toISOString(),
          endpoints: {
            health: '/health',
            api: '/api',
            docs: '/api/docs',
            auth: '/api/auth',
            establecimientos: '/api/establecimientos',
            vacunas: '/api/vacunas',
            jeringas: '/api/jeringas',
            usuarios: '/api/usuarios',
            roles: '/api/roles',
            permissions: '/api/permissions',
            'lotes-vacunas': '/api/lotes-vacunas',
            'lotes-jeringas': '/api/lotes-jeringas',
            planificacion: '/api/planificacion',
            movimientos: '/api/movimientos',
            'entregas-adicionales': '/api/entregas-adicionales',
            vales: '/api/vales',
            kardex: '/api/kardex',
            reportes: '/api/reportes',
            'programacion-anual-cenares': '/api/programacion-anual-cenares',
            alertas: '/api/alertas',
            dashboard: '/api/dashboard',
            'ici-demid': '/api/ici-demid',
          },
        },
        timestamp: new Date().toISOString(),
      });
    });

    // Configurar rutas de la API
    app.use('/api/auth', authRoutes);
    app.use('/api/configuracion', configuracionRoutes);

    // Servir archivos estáticos (uploads)
    app.use('/uploads', express.static(path.resolve(process.cwd(), 'uploads')));

    app.use('/api/configuracion-jeringa-vacuna', configuracionJeringaVacunaRoutes);
    app.use('/api/establecimientos', establecimientosRoutes);
    app.use('/api/redes', redesRoutes);
    app.use('/api/microredes', microredesRoutes);
    app.use('/api/centros-acopio', centrosAcopioRoutes);
    app.use('/api/vacunas', vacunasRoutes);
    app.use('/api/jeringas', jeringasRoutes);
    app.use('/api/usuarios', usuariosRoutes);
    app.use('/api/roles', rolesRoutes);
    app.use('/api/permissions', permissionsRoutes);
    app.use('/api/lotes-vacunas', lotesVacunasRoutes);
    app.use('/api/lotes-jeringas', lotesJeringasRoutes);
    app.use('/api/planificacion', planificacionRoutes);
    app.use('/api/movimientos', movimientosRoutes);
    app.use('/api/entregas-adicionales', entregasAdicionalesRoutes);
    app.use('/api/vales', valesRoutes);
    app.use('/api/kardex', kardexRoutes);
    app.use('/api/reportes', reportesRoutes);
    app.use('/api/reportes/planificacion', planificacionReportesRoutes);
    app.use('/api/programacion-anual-cenares', programacionAnualCenaresRoutes);
    app.use('/api/alertas', alertasRoutes);
    app.use('/api/dashboard', dashboardRoutes);
    app.use('/api/ici-demid', iciDemidRoutes);
    app.use('/api/permisos-operativos', permisosOperativosRoutes);
    app.use('/api/sibot', sibotRoutes);

    // Configurar manejo de errores (debe ir al final)
    setupErrorHandling(app);

    // Conectar a la base de datos
    await connectDatabase();

    // Verificar salud de la base de datos
    const dbHealthy = await checkDatabaseHealth();
    if (!dbHealthy) {
      throw new Error('La base de datos no está disponible');
    }

    // Iniciar servidor en todas las interfaces de red
    const server = app.listen(config.port, '0.0.0.0', () => {
      console.log(`
🚀 Servidor SIVAC iniciado exitosamente
📍 Entorno: ${config.env}
🌐 URL Local: http://localhost:${config.port}
🌐 URL Red: http://0.0.0.0:${config.port}
📊 API: http://localhost:${config.port}/api
🏥 Salud: http://localhost:${config.port}/health
📝 Versión: ${config.api.version}
⏰ Iniciado: ${new Date().toISOString()}
📡 Disponible en toda la red local
      `);

      // Cron job: procesar permisos programados cada minuto
      setInterval(async () => {
        try {
          const result = await PermisoOperativoService.procesarPermisosProgramados();
          if (result.activados > 0 || result.desactivados > 0) {
            console.log(`⏰ Permisos programados: ${result.activados} activados, ${result.desactivados} desactivados`);
          }
        } catch (error) {
          console.error('Error procesando permisos programados:', error);
        }
      }, 60_000);
    });

    // Manejo de señales para cierre graceful
    const gracefulShutdown = (signal: string) => {
      console.log(`\n📡 Señal ${signal} recibida. Cerrando servidor...`);
      
      server.close(async () => {
        console.log('🔌 Servidor HTTP cerrado');
        
        try {
          // Aquí puedes agregar más limpieza si es necesario
          console.log('✅ Cierre graceful completado');
          process.exit(0);
        } catch (error) {
          console.error('❌ Error durante el cierre graceful:', error);
          process.exit(1);
        }
      });

      // Forzar cierre después de 30 segundos
      setTimeout(() => {
        console.error('⚠️  Forzando cierre del servidor...');
        process.exit(1);
      }, 30000);
    };

    // Escuchar señales de cierre
    process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
    process.on('SIGINT', () => gracefulShutdown('SIGINT'));

    // Manejo de errores no capturados
    process.on('uncaughtException', (error) => {
      console.error('❌ Excepción no capturada:', error);
      process.exit(1);
    });

    process.on('unhandledRejection', (reason, promise) => {
      console.error('❌ Promesa rechazada no manejada:', reason);
      console.error('En promesa:', promise);
      process.exit(1);
    });

  } catch (error) {
    console.error('❌ Error al iniciar el servidor:', error);
    process.exit(1);
  }
}

// Iniciar el servidor
startServer().catch((error) => {
  console.error('❌ Error fatal al iniciar la aplicación:', error);
  process.exit(1);
});
