import { Router } from 'express';
import { ValeController } from '@/controllers/ValeController';
import { authenticate } from '@/middleware/auth';
import { denyRoles, requireCentroAcopioAssignment } from '@/middleware/accessControl';
import { requirePermissions } from '@/middleware/permissions';

/**
 * Rutas para gestión profesional de Vales de Entrega
 * Módulo 11: VALES DE ENTREGA
 */
const router = Router();
const denyResponsableAcopio = denyRoles(['responsable_acopio']);

router.use(authenticate, requireCentroAcopioAssignment, requirePermissions(['vales:read']));

// =====================================================
// RUTAS PRINCIPALES DE VALES
// =====================================================

/**
 * @route POST /api/vales/generar
 * @desc Generar vale de entrega para un centro de acopio, mes y año específicos
 * @access Public (TODO: Proteger con autenticación)
 * @body {GenerarValeDto} data - Datos para generar el vale
 * @example
 * {
 *   "centroAcopioId": "uuid",
 *   "mes": 1,
 *   "anio": 2024,
 *   "usuarioId": "uuid",
 *   "observaciones": "Vale mensual enero 2024",
 *   "afectarStock": true
 * }
 */
router.post('/generar', requirePermissions(['vales:write']), denyResponsableAcopio, ValeController.generarVale);

/**
 * @route POST /api/vales/validar-stock
 * @desc Validar stock disponible antes de generar vale
 * @access Public (TODO: Proteger con autenticación)
 * @body {object} data - Datos para validación de stock
 * @example
 * {
 *   "centroAcopioId": "uuid",
 *   "mes": 1,
 *   "anio": 2024,
 *   "tipoVale": "solo_base"
 * }
 */
router.post('/validar-stock', requirePermissions(['vales:write']), denyResponsableAcopio, ValeController.validarStock);

/**
 * @route POST /api/vales/vista-previa
 * @desc Obtener vista previa de vale sin generar ni afectar stocks
 * @access Public (TODO: Proteger con autenticación)
 * @body {object} data - Datos para vista previa
 * @example
 * {
 *   "centroAcopioId": "uuid",
 *   "mes": 1,
 *   "anio": 2024
 * }
 */
router.post('/vista-previa', requirePermissions(['vales:write']), denyResponsableAcopio, ValeController.getVistaPrevia);

/**
 * @route GET /api/vales
 * @desc Obtener vales con filtros opcionales
 * @access Public (TODO: Proteger con autenticación)
 * @query {string} [centroAcopioId] - ID del centro de acopio
 * @query {number} [mes] - Mes (1-12)
 * @query {number} [anio] - Año
 * @query {string} [estado] - Estado del vale (generado|impreso|entregado)
 * @query {string} [search] - Búsqueda por número, centro o observaciones
 * @query {number} [page=1] - Página
 * @query {number} [limit=50] - Límite por página
 * @example GET /api/vales?centroAcopioId=uuid&mes=1&anio=2024&estado=generado&page=1&limit=10
 */
router.get('/', ValeController.getVales);

/**
 * @route GET /api/vales/estadisticas
 * @desc Obtener estadísticas de vales
 * @access Public (TODO: Proteger con autenticación)
 * @query {string} [centroAcopioId] - ID del centro de acopio
 * @query {number} [anio] - Año (por defecto año actual)
 * @example GET /api/vales/estadisticas?centroAcopioId=uuid&anio=2024
 */
router.get('/estadisticas', denyResponsableAcopio, ValeController.getEstadisticas);

/**
 * @route GET /api/vales/tipos-generados
 * @desc Obtener tipos de vales ya generados para un período
 * @access Public (TODO: Proteger con autenticación)
 * @query {string} centroAcopioId - ID del centro de acopio
 * @query {number} mes - Mes (1-12)
 * @query {number} anio - Año
 * @example GET /api/vales/tipos-generados?centroAcopioId=uuid&mes=8&anio=2025
 */
router.get('/tipos-generados', denyResponsableAcopio, ValeController.getTiposValesGenerados);

/**
 * @route GET /api/vales/verificar-existencia
 * @desc Verificar si existen vales para un establecimiento específico
 * @access Public (TODO: Proteger con autenticación)
 * @query {string} establecimientoId - ID del establecimiento
 * @query {string} vacunaId - ID de la vacuna
 * @query {number} mes - Mes (1-12)
 * @query {number} anio - Año
 * @example GET /api/vales/verificar-existencia?establecimientoId=uuid&vacunaId=uuid&mes=8&anio=2025
 */
router.get('/verificar-existencia', denyResponsableAcopio, ValeController.verificarValesExistentes);

/**
 * @route POST /api/vales/verificar-existencia-batch
 * @desc Verificar existencia de vales para múltiples establecimientos×meses en UNA sola query.
 *       Reemplaza N×12 llamadas individuales a /verificar-existencia.
 * @access Private
 * @body {string} vacunaId - ID de la vacuna
 * @body {number} anio - Año
 * @body {Array} items - [{ establecimientoId, mes }, ...]
 * @returns {{ claves: string[] }} Claves "establecimientoId-mes" con vales activos
 */
router.post('/verificar-existencia-batch', denyResponsableAcopio, ValeController.verificarValesExistentesBatch);

/**
 * @route GET /api/vales/grupos-entregas-generados
 * @desc Obtener números de grupos de entregas adicionales ya generados en vales
 * @access Public (TODO: Proteger con autenticación)
 * @query {string} centroAcopioId - ID del centro de acopio
 * @query {number} mes - Mes (1-12)
 * @query {number} anio - Año
 * @example GET /api/vales/grupos-entregas-generados?centroAcopioId=uuid&mes=8&anio=2025
 */
router.get('/grupos-entregas-generados', denyResponsableAcopio, ValeController.getGruposEntregasAdicionalesGenerados);

/**
 * @route GET /api/vales/entregas-adicionales-disponibles
 * @desc Obtener entregas adicionales disponibles para un centro de acopio y período
 * @access Public (TODO: Proteger con autenticación)
 * @query {string} centroAcopioId - ID del centro de acopio
 * @query {number} mes - Mes (1-12)
 * @query {number} anio - Año
 * @example GET /api/vales/entregas-adicionales-disponibles?centroAcopioId=uuid&mes=8&anio=2025
 */
router.get('/entregas-adicionales-disponibles', denyResponsableAcopio, ValeController.getEntregasAdicionalesDisponibles);

/**
 * @route GET /api/vales/calcular-impacto-modificacion
 * @desc Calcular el impacto de modificar una entrega sobre stocks y vales
 * @access Public (TODO: Proteger con autenticación)
 * @query {string} establecimientoId - ID del establecimiento
 * @query {string} vacunaId - ID de la vacuna
 * @query {number} mes - Mes (1-12)
 * @query {number} anio - Año
 * @query {number} cantidadActual - Cantidad actual de entrega
 * @query {number} cantidadNueva - Nueva cantidad de entrega
 * @example GET /api/vales/calcular-impacto-modificacion?establecimientoId=uuid&vacunaId=uuid&mes=8&anio=2025&cantidadActual=2&cantidadNueva=1
 */
router.get('/calcular-impacto-modificacion', denyResponsableAcopio, ValeController.calcularImpactoModificacion);

/**
 * @route GET /api/vales/:id
 * @desc Obtener vale por ID con todos sus detalles
 * @access Public (TODO: Proteger con autenticación)
 * @param {string} id - ID del vale
 * @example GET /api/vales/uuid-del-vale
 */
router.get('/:id', ValeController.getValeById);

/**
 * @route PATCH /api/vales/:id/estado
 * @desc Cambiar estado de un vale
 * @access Public (TODO: Proteger con autenticación)
 * @param {string} id - ID del vale
 * @body {object} data - Nuevo estado y usuario
 * @example
 * {
 *   "estado": "impreso",
 *   "usuarioId": "uuid"
 * }
 */
router.patch('/:id/estado', requirePermissions(['vales:write']), denyResponsableAcopio, ValeController.cambiarEstado);

/**
 * @route GET /api/vales/:id/diagnostico
 * @desc Diagnosticar estado de vale para reversión
 * @access Public (TODO: Proteger con autenticación)
 * @param {string} id - ID del vale a diagnosticar
 * @example GET /api/vales/uuid-del-vale/diagnostico
 */
router.get('/:id/diagnostico', denyResponsableAcopio, ValeController.diagnosticarVale);

/**
 * @route POST /api/vales/:id/limpiar-reversion
 * @desc Limpiar estado inconsistente de reversión
 * @access Public (TODO: Proteger con autenticación)
 * @param {string} id - ID del vale a limpiar
 * @example POST /api/vales/uuid-del-vale/limpiar-reversion
 */
router.post('/:id/limpiar-reversion', requirePermissions(['vales:write']), denyResponsableAcopio, ValeController.limpiarEstadoReversion);

/**
 * @route POST /api/vales/:id/revertir
 * @desc Revertir vale y restaurar stocks afectados
 * @access Public (TODO: Proteger con autenticación)
 * @param {string} id - ID del vale a revertir
 * @example POST /api/vales/uuid-del-vale/revertir
 */
router.post('/:id/revertir', requirePermissions(['vales:write']), denyResponsableAcopio, ValeController.revertirVale);

/**
 * @route POST /api/vales/:id/sincronizar
 * @desc Sincronizar vale con movimientos actualizados
 * @access Public (TODO: Proteger con autenticación)
 * @param {string} id - ID del vale a sincronizar
 * @body {object} data - Usuario que realiza la sincronización
 * @example
 * {
 *   "usuarioId": "uuid"
 * }
 */
router.post('/:id/sincronizar', requirePermissions(['vales:write']), denyResponsableAcopio, ValeController.sincronizarVale);

/**
 * @route GET /api/vales/:id/modificaciones
 * @desc Obtener historial de modificaciones de un vale
 * @access Public (TODO: Proteger con autenticación)
 * @param {string} id - ID del vale
 * @example GET /api/vales/uuid-del-vale/modificaciones
 */
router.get('/:id/modificaciones', ValeController.getModificaciones);

// =====================================================
// RUTAS DE EXPORTACIÓN
// =====================================================

/**
 * @route POST /api/vales/:id/export/excel
 * @desc Exportar vale a formato Excel
 * @access Public (TODO: Proteger con autenticación)
 * @param {string} id - ID del vale
 * @body {ValeExportConfig} config - Configuración de exportación
 * @example
 * {
 *   "incluirEntregasBase": true,
 *   "incluirEntregasAdicionales": false,
 *   "responsableRecojo": "Juan Pérez",
 *   "formatoExportacion": "excel"
 * }
 */
router.post('/:id/export/excel', requirePermissions(['vales:write']), denyResponsableAcopio, ValeController.exportarExcel);

/**
 * @route POST /api/vales/export/combined/excel
 * @desc Exportar múltiples vales combinados a formato Excel
 * @access Public (TODO: Proteger con autenticación)
 * @body {object} data - Datos para exportación combinada
 * @example
 * {
 *   "valeIds": ["uuid1", "uuid2", "uuid3"],
 *   "config": {
 *     "incluirEntregasBase": true,
 *     "incluirEntregasAdicionales": false,
 *     "responsableRecojo": "Juan Pérez",
 *     "formatoExportacion": "excel"
 *   }
 * }
 */
router.post('/export/combined/excel', requirePermissions(['vales:write']), denyResponsableAcopio, ValeController.exportarValesCombinados);

/**
 * @route POST /api/vales/:id/export/pdf
 * @desc Exportar vale a formato PDF
 * @access Public (TODO: Proteger con autenticación)
 * @param {string} id - ID del vale
 * @body {ValeExportConfig} config - Configuración de exportación
 * @example
 * {
 *   "incluirEntregasBase": true,
 *   "incluirEntregasAdicionales": true,
 *   "responsableRecojo": "María García",
 *   "formatoExportacion": "pdf"
 * }
 */
router.post('/:id/export/pdf', requirePermissions(['vales:write']), denyResponsableAcopio, ValeController.exportarPDF);

/**
 * @route POST /api/vales/:id/export/preview
 * @desc Obtener vista previa de exportación
 * @access Public (TODO: Proteger con autenticación)
 * @param {string} id - ID del vale
 * @body {Omit<ValeExportConfig, 'formatoExportacion'>} config - Configuración sin formato
 */
router.post('/:id/export/preview', requirePermissions(['vales:write']), denyResponsableAcopio, ValeController.getExportPreview);

/**
 * @route POST /api/vales/auto-sync
 * @desc Sincronización automática en tiempo real
 * @access Public (TODO: Proteger con autenticación)
 * @body {object} data - Datos para sincronización automática
 * @example
 * {
 *   "establecimientoId": "uuid",
 *   "vacunaId": "uuid",
 *   "mes": 12,
 *   "anio": 2024
 * }
 */
router.post('/auto-sync', requirePermissions(['vales:write']), denyResponsableAcopio, ValeController.autoSync);

// =====================================================
// RUTAS FUTURAS (Para implementación posterior)
// =====================================================

/**
 * TODO: Implementar en futuras versiones
 * 
 * @route GET /api/vales/:id/pdf
 * @desc Generar PDF del vale de entrega
 * 
 * @route POST /api/vales/:id/imprimir
 * @desc Marcar vale como impreso y generar PDF
 * 
 * @route POST /api/vales/:id/entregar
 * @desc Marcar vale como entregado
 * 
 * @route GET /api/vales/:id/trazabilidad
 * @desc Obtener trazabilidad completa del vale (stocks afectados, kardex, etc.)
 * 
 * @route POST /api/vales/lote/generar
 * @desc Generar múltiples vales en lote
 * 
 * @route GET /api/vales/reportes/mensual
 * @desc Reporte mensual de vales generados
 * 
 * @route GET /api/vales/reportes/anual
 * @desc Reporte anual de vales generados
 */

export default router;
