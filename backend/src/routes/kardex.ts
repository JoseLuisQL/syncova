import { Router } from 'express';
import { KardexController } from '@/controllers/KardexController';

/**
 * Rutas para gestión del Kardex
 * Módulo 12: KARDEX
 */
const router = Router();

/**
 * @route GET /api/kardex/estadisticas
 * @desc Obtener estadísticas del kardex
 * @access Public (TODO: Proteger con autenticación)
 * @query {string} [tipo] - Tipo de item (vacuna|jeringa)
 * @query {string} [itemId] - ID del item
 * @query {string} [loteId] - ID del lote
 * @query {string} [tipoMovimiento] - Tipo de movimiento (ingreso|salida|transferencia|ajuste)
 * @query {string} [establecimientoOrigenId] - ID del establecimiento origen
 * @query {string} [establecimientoDestinoId] - ID del establecimiento destino
 * @query {string} [fechaInicio] - Fecha de inicio (YYYY-MM-DD)
 * @query {string} [fechaFin] - Fecha de fin (YYYY-MM-DD)
 */
router.get('/estadisticas', KardexController.getEstadisticas);

/**
 * @route GET /api/kardex/consultas-predefinidas
 * @desc Obtener consultas predefinidas del kardex
 * @access Public (TODO: Proteger con autenticación)
 */
router.get('/consultas-predefinidas', KardexController.getConsultasPredefinidas);

/**
 * @route GET /api/kardex/export/stats
 * @desc Obtener estadísticas de exportación del kardex
 * @access Public (TODO: Proteger con autenticación)
 * @query {string} [tipo] - Tipo de item (vacuna|jeringa)
 * @query {string} [itemId] - ID del item
 * @query {string} [loteId] - ID del lote
 * @query {string} [tipoMovimiento] - Tipo de movimiento
 * @query {string} [establecimientoOrigenId] - ID del establecimiento origen
 * @query {string} [establecimientoDestinoId] - ID del establecimiento destino
 * @query {string} [fechaInicio] - Fecha de inicio
 * @query {string} [fechaFin] - Fecha de fin
 * @query {string} [search] - Búsqueda por texto
 */
router.get('/export/stats', KardexController.getExportStats);

/**
 * @route POST /api/kardex/export/excel
 * @desc Exportar kardex a Excel
 * @access Public (TODO: Proteger con autenticación)
 * @body {boolean} [incluirDetalleCompleto=true] - Incluir detalle completo
 * @body {boolean} [incluirTrazabilidad=false] - Incluir trazabilidad
 * @body {boolean} [incluirEstadisticas=true] - Incluir estadísticas
 * @body {object} [filtros] - Filtros para la exportación
 */
router.post('/export/excel', KardexController.exportToExcel);

/**
 * @route POST /api/kardex/export/pdf
 * @desc Exportar kardex a PDF
 * @access Public (TODO: Proteger con autenticación)
 * @body {boolean} [incluirDetalleCompleto=true] - Incluir detalle completo
 * @body {boolean} [incluirTrazabilidad=false] - Incluir trazabilidad
 * @body {boolean} [incluirEstadisticas=false] - Incluir estadísticas
 * @body {object} [filtros] - Filtros para la exportación
 */
router.post('/export/pdf', KardexController.exportToPDF);

/**
 * @route POST /api/kardex/export/csv
 * @desc Exportar kardex a CSV
 * @access Public (TODO: Proteger con autenticación)
 * @body {boolean} [incluirDetalleCompleto=true] - Incluir detalle completo
 * @body {object} [filtros] - Filtros para la exportación
 */
router.post('/export/csv', KardexController.exportToCSV);

/**
 * @route GET /api/kardex/trazabilidad/:loteId
 * @desc Obtener trazabilidad completa de un lote específico
 * @access Public (TODO: Proteger con autenticación)
 * @param {string} loteId - ID del lote
 */
router.get('/trazabilidad/:loteId', KardexController.getTrazabilidadLote);

/**
 * @route POST /api/kardex/generar-automatico
 * @desc Generar movimiento de kardex automáticamente (para uso interno del sistema)
 * @access Public (TODO: Proteger con autenticación)
 * @body {string} tipo - Tipo de item (vacuna|jeringa)
 * @body {string} itemId - ID del item
 * @body {string} loteId - ID del lote
 * @body {string} tipoMovimiento - Tipo de movimiento (ingreso|salida|transferencia|ajuste)
 * @body {number} cantidad - Cantidad del movimiento
 * @body {string} [establecimientoOrigenId] - ID del establecimiento origen
 * @body {string} [establecimientoDestinoId] - ID del establecimiento destino
 * @body {string} documento - Tipo de documento
 * @body {string} numeroDocumento - Número del documento
 * @body {string} [observaciones] - Observaciones del movimiento
 * @body {string} usuarioId - ID del usuario que registra el movimiento
 * @body {string} [fechaMovimiento] - Fecha del movimiento (ISO string)
 */
router.post('/generar-automatico', KardexController.generarMovimientoAutomatico);

/**
 * @route GET /api/kardex
 * @desc Obtener todos los movimientos de kardex con filtros opcionales
 * @access Public (TODO: Proteger con autenticación)
 * @query {string} [tipo] - Tipo de item (vacuna|jeringa)
 * @query {string} [itemId] - ID del item
 * @query {string} [loteId] - ID del lote
 * @query {string} [tipoMovimiento] - Tipo de movimiento (ingreso|salida|transferencia|ajuste)
 * @query {string} [establecimientoOrigenId] - ID del establecimiento origen
 * @query {string} [establecimientoDestinoId] - ID del establecimiento destino
 * @query {string} [fechaInicio] - Fecha de inicio (YYYY-MM-DD)
 * @query {string} [fechaFin] - Fecha de fin (YYYY-MM-DD)
 * @query {string} [search] - Búsqueda por texto en documento, número o observaciones
 * @query {number} [page=1] - Número de página
 * @query {number} [limit=50] - Límite de resultados por página (máximo 100)
 */
router.get('/', KardexController.getAll);

/**
 * @route POST /api/kardex
 * @desc Crear nuevo movimiento de kardex
 * @access Public (TODO: Proteger con autenticación)
 * @body {string} tipo - Tipo de item (vacuna|jeringa)
 * @body {string} itemId - ID del item
 * @body {string} loteId - ID del lote
 * @body {string} tipoMovimiento - Tipo de movimiento (ingreso|salida|transferencia|ajuste)
 * @body {number} cantidad - Cantidad del movimiento
 * @body {number} [saldoAnterior] - Saldo anterior (se calcula automáticamente si no se proporciona)
 * @body {string} [establecimientoOrigenId] - ID del establecimiento origen
 * @body {string} [establecimientoDestinoId] - ID del establecimiento destino
 * @body {string} documento - Tipo de documento
 * @body {string} numeroDocumento - Número del documento
 * @body {string} [observaciones] - Observaciones del movimiento
 * @body {string} usuarioId - ID del usuario que registra el movimiento
 * @body {string} [fechaMovimiento] - Fecha del movimiento (ISO string)
 */
router.post('/', KardexController.create);

/**
 * @route GET /api/kardex/:id
 * @desc Obtener movimiento de kardex por ID
 * @access Public (TODO: Proteger con autenticación)
 * @param {string} id - ID del movimiento de kardex
 */
router.get('/:id', KardexController.getById);

/**
 * @route PUT /api/kardex/:id
 * @desc Actualizar movimiento de kardex
 * @access Public (TODO: Proteger con autenticación)
 * @param {string} id - ID del movimiento de kardex
 * @body {number} [cantidad] - Nueva cantidad del movimiento
 * @body {number} [saldoAnterior] - Nuevo saldo anterior
 * @body {string} [establecimientoOrigenId] - Nuevo ID del establecimiento origen
 * @body {string} [establecimientoDestinoId] - Nuevo ID del establecimiento destino
 * @body {string} [documento] - Nuevo tipo de documento
 * @body {string} [numeroDocumento] - Nuevo número del documento
 * @body {string} [observaciones] - Nuevas observaciones del movimiento
 * @body {string} [fechaMovimiento] - Nueva fecha del movimiento (ISO string)
 */
router.put('/:id', KardexController.update);

/**
 * @route DELETE /api/kardex/:id
 * @desc Eliminar movimiento de kardex
 * @access Public (TODO: Proteger con autenticación)
 * @param {string} id - ID del movimiento de kardex
 */
router.delete('/:id', KardexController.delete);

export default router;
