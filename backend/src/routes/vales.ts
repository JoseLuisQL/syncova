import { Router } from 'express';
import { ValeController } from '@/controllers/ValeController';

/**
 * Rutas para gestión profesional de Vales de Entrega
 * Módulo 11: VALES DE ENTREGA
 */
const router = Router();

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
router.post('/generar', ValeController.generarVale);

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
router.post('/validar-stock', ValeController.validarStock);

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
router.post('/vista-previa', ValeController.getVistaPrevia);

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
router.get('/estadisticas', ValeController.getEstadisticas);

/**
 * @route GET /api/vales/tipos-generados
 * @desc Obtener tipos de vales ya generados para un período
 * @access Public (TODO: Proteger con autenticación)
 * @query {string} centroAcopioId - ID del centro de acopio
 * @query {number} mes - Mes (1-12)
 * @query {number} anio - Año
 * @example GET /api/vales/tipos-generados?centroAcopioId=uuid&mes=8&anio=2025
 */
router.get('/tipos-generados', ValeController.getTiposValesGenerados);

/**
 * @route GET /api/vales/grupos-entregas-generados
 * @desc Obtener números de grupos de entregas adicionales ya generados en vales
 * @access Public (TODO: Proteger con autenticación)
 * @query {string} centroAcopioId - ID del centro de acopio
 * @query {number} mes - Mes (1-12)
 * @query {number} anio - Año
 * @example GET /api/vales/grupos-entregas-generados?centroAcopioId=uuid&mes=8&anio=2025
 */
router.get('/grupos-entregas-generados', ValeController.getGruposEntregasAdicionalesGenerados);

/**
 * @route GET /api/vales/entregas-adicionales-disponibles
 * @desc Obtener entregas adicionales disponibles para un centro de acopio y período
 * @access Public (TODO: Proteger con autenticación)
 * @query {string} centroAcopioId - ID del centro de acopio
 * @query {number} mes - Mes (1-12)
 * @query {number} anio - Año
 * @example GET /api/vales/entregas-adicionales-disponibles?centroAcopioId=uuid&mes=8&anio=2025
 */
router.get('/entregas-adicionales-disponibles', ValeController.getEntregasAdicionalesDisponibles);

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
router.patch('/:id/estado', ValeController.cambiarEstado);

/**
 * @route GET /api/vales/:id/diagnostico
 * @desc Diagnosticar estado de vale para reversión
 * @access Public (TODO: Proteger con autenticación)
 * @param {string} id - ID del vale a diagnosticar
 * @example GET /api/vales/uuid-del-vale/diagnostico
 */
router.get('/:id/diagnostico', ValeController.diagnosticarVale);

/**
 * @route POST /api/vales/:id/limpiar-reversion
 * @desc Limpiar estado inconsistente de reversión
 * @access Public (TODO: Proteger con autenticación)
 * @param {string} id - ID del vale a limpiar
 * @example POST /api/vales/uuid-del-vale/limpiar-reversion
 */
router.post('/:id/limpiar-reversion', ValeController.limpiarEstadoReversion);

/**
 * @route POST /api/vales/:id/revertir
 * @desc Revertir vale y restaurar stocks afectados
 * @access Public (TODO: Proteger con autenticación)
 * @param {string} id - ID del vale a revertir
 * @example POST /api/vales/uuid-del-vale/revertir
 */
router.post('/:id/revertir', ValeController.revertirVale);

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
router.post('/:id/sincronizar', ValeController.sincronizarVale);

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
router.post('/:id/export/excel', ValeController.exportarExcel);

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
router.post('/export/combined/excel', ValeController.exportarValesCombinados);

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
router.post('/:id/export/pdf', ValeController.exportarPDF);

/**
 * @route POST /api/vales/:id/export/preview
 * @desc Obtener vista previa de exportación
 * @access Public (TODO: Proteger con autenticación)
 * @param {string} id - ID del vale
 * @body {Omit<ValeExportConfig, 'formatoExportacion'>} config - Configuración sin formato
 */
router.post('/:id/export/preview', ValeController.getExportPreview);

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
router.post('/auto-sync', ValeController.autoSync);

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
