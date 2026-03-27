import { Router, Response, NextFunction } from 'express';
import { MovimientosController } from '@/controllers/MovimientosController';
import { AjusteEntregasController } from '@/controllers/AjusteEntregasController';
import { authenticate } from '@/middleware/auth';
import { denyRoles, requireCentroAcopioAssignment } from '@/middleware/accessControl';
import { requirePermissions } from '@/middleware/permissions';
import { uploadSingleExcel, handleUploadError } from '@/middleware/upload';
import { AuthenticatedRequest } from '@/types';
import { PermisoOperativoService, TIPOS_PERMISO } from '@/services/PermisoOperativoService';
import { prisma } from '@/config/database';

/**
 * Rutas para gestión de movimientos de vacunas
 */
const router = Router();
const denyResponsableAcopio = denyRoles(['responsable_acopio']);

/**
 * Middleware: permite a responsable_acopio si tiene permiso operativo de edición.
 * For PUT /:id requests, looks up the movement record in the DB to get the correct
 * mes/anio since the update body doesn't include them.
 * For POST / requests, reads mes/anio from req.body (CreateMovimientoDto has them).
 */
const denyResponsableUnlessMovEdicion = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  if (!req.user || req.user.rol !== 'responsable_acopio') {
    next();
    return;
  }

  let mes: number | undefined;
  let anio: number | undefined;

  // Try body/query first (works for POST / create, which includes mes and anio)
  if (req.body?.mes) mes = parseInt(req.body.mes);
  else if (req.query?.mes) mes = parseInt(req.query.mes as string);

  if (req.body?.anio) anio = parseInt(req.body.anio);
  else if (req.query?.anio) anio = parseInt(req.query.anio as string);

  // For PUT /:id, body won't have mes/anio — look up from the movement record
  if ((!mes || !anio) && req.params?.id && req.method === 'PUT') {
    try {
      const movimiento = await prisma.movimientoVacuna.findUnique({
        where: { id: req.params.id },
        select: { mes: true, anio: true },
      });
      if (movimiento) {
        mes = movimiento.mes;
        anio = movimiento.anio;
      }
    } catch (err) {
      console.error('[denyResponsableUnlessMovEdicion] Error looking up movement:', err);
    }
  }

  // Fallback to current date if still missing
  if (!mes) mes = new Date().getMonth() + 1;
  if (!anio) anio = new Date().getFullYear();

  const tiene = await PermisoOperativoService.verificarPermiso(req.user.id, TIPOS_PERMISO.MOVIMIENTOS_EDICION, mes, anio);
  if (tiene) { next(); return; }
  denyResponsableAcopio(req, res, next);
};

/**
 * Middleware: permite a responsable_acopio si tiene permiso de exportar excel
 */
const denyResponsableUnlessExport = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  if (!req.user || req.user.rol !== 'responsable_acopio') {
    next();
    return;
  }
  const mes = parseInt(req.body?.mes || req.query?.mes as string) || new Date().getMonth() + 1;
  const anio = parseInt(req.body?.anio || req.query?.anio as string) || new Date().getFullYear();
  const tiene = await PermisoOperativoService.verificarPermiso(req.user.id, TIPOS_PERMISO.EXPORTAR_EXCEL, mes, anio);
  if (tiene) { next(); return; }
  denyResponsableAcopio(req, res, next);
};

router.use(authenticate, requireCentroAcopioAssignment, requirePermissions(['movimientos:read']));

/**
 * @route GET /api/movimientos/anios-disponibles
 * @desc Obtener años disponibles con movimientos registrados
 */
router.get('/anios-disponibles', MovimientosController.getAniosDisponibles);

/**
 * @route GET /api/movimientos/progreso-vales
 * @desc Obtener progreso de generación de vales para una vacuna/periodo
 */
router.get('/progreso-vales', denyResponsableAcopio, MovimientosController.getProgresoVales);

// =====================================================
// RUTAS DE AJUSTE AUTOMÁTICO DE ENTREGAS
// =====================================================

router.get('/ajuste-entregas/datos/:vacunaId/:mes/:anio', denyResponsableAcopio, AjusteEntregasController.obtenerDatosParaAjuste);
router.get('/ajuste-entregas/verificar/:vacunaId/:mes/:anio', denyResponsableAcopio, AjusteEntregasController.verificarDisponibilidad);
router.post('/ajuste-entregas/calcular-opciones', requirePermissions(['movimientos:write']), denyResponsableAcopio, AjusteEntregasController.calcularOpcionesAjuste);
router.post('/ajuste-entregas/ejecutar', requirePermissions(['movimientos:write']), denyResponsableAcopio, AjusteEntregasController.ejecutarAjuste);

// =====================================================
// RUTAS DE PLANTILLAS E IMPORTACIÓN
// =====================================================

router.get('/plantilla/vacuna/:vacunaId/anio/:anio', denyResponsableAcopio, MovimientosController.descargarPlantillaVacuna);
router.get('/plantilla/masiva/anio/:anio', denyResponsableAcopio, MovimientosController.descargarPlantillaMasiva);

router.post('/importar/vacuna/:vacunaId/anio/:anio',
  requirePermissions(['movimientos:write']),
  denyResponsableAcopio,
  uploadSingleExcel,
  handleUploadError,
  MovimientosController.importarDesdeExcelVacuna
);

router.post('/debug-plantilla/anio/:anio',
  requirePermissions(['movimientos:write']),
  denyResponsableAcopio,
  uploadSingleExcel,
  handleUploadError,
  MovimientosController.debugPlantilla
);

router.post('/validar-plantilla/anio/:anio',
  requirePermissions(['movimientos:write']),
  denyResponsableAcopio,
  uploadSingleExcel,
  handleUploadError,
  MovimientosController.validarPlantilla
);

router.post('/importar/masivo/anio/:anio',
  requirePermissions(['movimientos:write']),
  denyResponsableAcopio,
  uploadSingleExcel,
  handleUploadError,
  MovimientosController.importarDesdeExcelMasivo
);

router.post('/reporte-errores',
  requirePermissions(['movimientos:write']),
  denyResponsableAcopio,
  MovimientosController.generarReporteErrores
);

// =====================================================
// RUTAS DE EXPORTACIÓN (con permiso operativo condicional)
// =====================================================

router.post('/exportar/vacuna/:vacunaId', requirePermissions(['movimientos:write']), denyResponsableUnlessExport, MovimientosController.exportarPorVacuna);
router.post('/exportar/todas-vacunas', requirePermissions(['movimientos:write']), denyResponsableUnlessExport, MovimientosController.exportarTodasVacunas);

// =====================================================
// ESTADÍSTICAS Y STOCK
// =====================================================

router.get('/estadisticas', denyResponsableAcopio, MovimientosController.getEstadisticas);
router.get('/stock-disponible', denyResponsableAcopio, MovimientosController.getStockDisponible);

// =====================================================
// GENERACIÓN Y SINCRONIZACIÓN
// =====================================================

router.post('/generar-desde-planificacion/:planificacionId', requirePermissions(['movimientos:write']), denyResponsableAcopio, MovimientosController.generarDesdeplanificacion);
router.post('/sincronizar-saldo-anterior', requirePermissions(['movimientos:write']), denyResponsableAcopio, MovimientosController.sincronizarSaldoAnterior);
router.post('/actualizar-stock-siguiente-mes', requirePermissions(['movimientos:write']), denyResponsableAcopio, MovimientosController.actualizarStockInicialSiguienteMes);

// =====================================================
// CRUD DE MOVIMIENTOS
// =====================================================

router.get('/', MovimientosController.getAll);
router.get('/:id', MovimientosController.getById);
router.post('/', requirePermissions(['movimientos:write']), denyResponsableUnlessMovEdicion, MovimientosController.create);

/**
 * PUT - Actualizar movimiento (con permiso operativo condicional para responsables)
 */
router.put('/:id', requirePermissions(['movimientos:write']), denyResponsableUnlessMovEdicion, MovimientosController.update);

router.delete('/:id', requirePermissions(['movimientos:write']), denyResponsableAcopio, MovimientosController.delete);

// =====================================================
// RUTAS PARA ENTREGAS ADICIONALES
// =====================================================

router.post('/:movimientoId/entregas-adicionales', requirePermissions(['movimientos:write']), denyResponsableAcopio, MovimientosController.createEntregaAdicional);
router.put('/entregas-adicionales/:id', requirePermissions(['movimientos:write']), denyResponsableAcopio, MovimientosController.updateEntregaAdicional);
router.delete('/entregas-adicionales/:id', requirePermissions(['movimientos:write']), denyResponsableAcopio, MovimientosController.deleteEntregaAdicional);

export default router;
