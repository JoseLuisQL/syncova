import { Router } from 'express';
import { MovimientosController } from '@/controllers/MovimientosController';
import { AjusteEntregasController } from '@/controllers/AjusteEntregasController';
import { uploadSingleExcel, handleUploadError } from '@/middleware/upload';

/**
 * Rutas para gestión de movimientos de vacunas
 */
const router = Router();

/**
 * @route GET /api/movimientos/anios-disponibles
 * @desc Obtener años disponibles con movimientos registrados
 * @access Public (TODO: Proteger con autenticación)
 */
router.get('/anios-disponibles', MovimientosController.getAniosDisponibles);

/**
 * @route GET /api/movimientos/progreso-vales
 * @desc Obtener progreso de generación de vales para una vacuna/periodo
 * @access Public (TODO: Proteger con autenticación)
 * @query {string} vacunaId - ID de la vacuna (requerido)
 * @query {number} mes - Mes (1-12) (requerido)
 * @query {number} anio - Año (requerido)
 * @query {string} [centroAcopioId] - ID del centro de acopio (opcional)
 */
router.get('/progreso-vales', MovimientosController.getProgresoVales);

// =====================================================
// RUTAS DE AJUSTE AUTOMÁTICO DE ENTREGAS
// =====================================================

/**
 * @route GET /api/movimientos/ajuste-entregas/datos/:vacunaId/:mes/:anio
 * @desc Obtener datos para el modal de ajuste automático de entregas
 * @access Public (TODO: Proteger con autenticación)
 */
router.get('/ajuste-entregas/datos/:vacunaId/:mes/:anio', AjusteEntregasController.obtenerDatosParaAjuste);

/**
 * @route GET /api/movimientos/ajuste-entregas/verificar/:vacunaId/:mes/:anio
 * @desc Verificar si el ajuste está disponible para una vacuna/periodo
 * @access Public (TODO: Proteger con autenticación)
 */
router.get('/ajuste-entregas/verificar/:vacunaId/:mes/:anio', AjusteEntregasController.verificarDisponibilidad);

/**
 * @route POST /api/movimientos/ajuste-entregas/calcular-opciones
 * @desc Calcular opciones de ajuste automático
 * @access Public (TODO: Proteger con autenticación)
 */
router.post('/ajuste-entregas/calcular-opciones', AjusteEntregasController.calcularOpcionesAjuste);

/**
 * @route POST /api/movimientos/ajuste-entregas/ejecutar
 * @desc Ejecutar ajuste automático de entregas
 * @access Public (TODO: Proteger con autenticación)
 */
router.post('/ajuste-entregas/ejecutar', AjusteEntregasController.ejecutarAjuste);

/**
 * @route GET /api/movimientos/plantilla/vacuna/:vacunaId/anio/:anio
 * @desc Descargar plantilla Excel para importación por vacuna específica
 * @access Public (TODO: Proteger con autenticación)
 * @param {string} vacunaId - ID de la vacuna
 * @param {number} anio - Año de movimientos
 */
router.get('/plantilla/vacuna/:vacunaId/anio/:anio', MovimientosController.descargarPlantillaVacuna);

/**
 * @route GET /api/movimientos/plantilla/masiva/anio/:anio
 * @desc Descargar plantilla Excel masiva para todas las vacunas
 * @access Public (TODO: Proteger con autenticación)
 * @param {number} anio - Año de movimientos
 */
router.get('/plantilla/masiva/anio/:anio', MovimientosController.descargarPlantillaMasiva);

/**
 * @route POST /api/movimientos/importar/vacuna/:vacunaId/anio/:anio
 * @desc Importar movimientos desde archivo Excel por vacuna específica
 * @access Public (TODO: Proteger con autenticación)
 * @param {string} vacunaId - ID de la vacuna
 * @param {number} anio - Año de movimientos
 * @body {file} archivo - Archivo Excel con los movimientos
 */
router.post('/importar/vacuna/:vacunaId/anio/:anio',
  uploadSingleExcel,
  handleUploadError,
  MovimientosController.importarDesdeExcelVacuna
);

/**
 * @route POST /api/movimientos/debug-plantilla/anio/:anio
 * @desc Debug plantilla Excel - mostrar primeras filas
 * @access Public (TODO: Proteger con autenticación)
 * @param {number} anio - Año de movimientos
 * @body {file} archivo - Archivo Excel para debug
 */
router.post('/debug-plantilla/anio/:anio',
  uploadSingleExcel,
  handleUploadError,
  MovimientosController.debugPlantilla
);

/**
 * @route POST /api/movimientos/validar-plantilla/anio/:anio
 * @desc Validar plantilla Excel antes de importar
 * @access Public (TODO: Proteger con autenticación)
 * @param {number} anio - Año de movimientos
 * @body {file} archivo - Archivo Excel para validar
 */
router.post('/validar-plantilla/anio/:anio',
  uploadSingleExcel,
  handleUploadError,
  MovimientosController.validarPlantilla
);

/**
 * @route POST /api/movimientos/importar/masivo/anio/:anio
 * @desc Importar movimientos masivos desde archivo Excel (múltiples hojas)
 * @access Public (TODO: Proteger con autenticación)
 * @param {number} anio - Año de movimientos
 * @body {file} archivo - Archivo Excel con múltiples hojas de movimientos
 */
router.post('/importar/masivo/anio/:anio',
  uploadSingleExcel,
  handleUploadError,
  MovimientosController.importarDesdeExcelMasivo
);

/**
 * @route POST /api/movimientos/reporte-errores
 * @desc Generar reporte de errores en Excel
 * @access Public (TODO: Proteger con autenticación)
 * @body {object} erroresPorVacuna - Datos de errores por vacuna
 */
router.post('/reporte-errores',
  MovimientosController.generarReporteErrores
);

// =====================================================
// RUTAS DE EXPORTACIÓN
// =====================================================

/**
 * @route POST /api/movimientos/exportar/vacuna/:vacunaId
 * @desc Exportar movimientos por vacuna específica a Excel
 * @access Public (TODO: Proteger con autenticación)
 * @param {string} vacunaId - ID de la vacuna
 * @body {number} mes - Mes (1-12)
 * @body {number} anio - Año de movimientos
 * @body {string} [centroAcopioId] - ID del centro de acopio (opcional)
 * @body {string} [establecimientoId] - ID del establecimiento específico (opcional)
 * @body {boolean} [incluirEstablecimientosSinMovimiento] - Incluir establecimientos sin movimiento
 * @body {string} responsableReporte - Nombre del responsable del reporte
 * @body {string} [observaciones] - Observaciones adicionales
 */
router.post('/exportar/vacuna/:vacunaId', MovimientosController.exportarPorVacuna);

/**
 * @route POST /api/movimientos/exportar/todas-vacunas
 * @desc Exportar todas las vacunas a Excel (hojas separadas)
 * @access Public (TODO: Proteger con autenticación)
 * @body {number} mes - Mes (1-12)
 * @body {number} anio - Año de movimientos
 * @body {string} [centroAcopioId] - ID del centro de acopio (opcional)
 * @body {string} [establecimientoId] - ID del establecimiento específico (opcional)
 * @body {boolean} [incluirEstablecimientosSinMovimiento] - Incluir establecimientos sin movimiento
 * @body {string} responsableReporte - Nombre del responsable del reporte
 * @body {string} [observaciones] - Observaciones adicionales
 */
router.post('/exportar/todas-vacunas', MovimientosController.exportarTodasVacunas);

/**
 * @route GET /api/movimientos/estadisticas
 * @desc Obtener estadísticas de movimientos
 * @access Public (TODO: Proteger con autenticación)
 * @query {number} [anio] - Año para filtrar estadísticas
 */
router.get('/estadisticas', MovimientosController.getEstadisticas);

/**
 * @route GET /api/movimientos/stock-disponible
 * @desc Obtener stock disponible por vacuna
 * @access Public (TODO: Proteger con autenticación)
 * @query {string} vacunaId - ID de la vacuna
 * @query {number} mes - Mes (1-12)
 * @query {number} anio - Año
 */
router.get('/stock-disponible', MovimientosController.getStockDisponible);

/**
 * @route POST /api/movimientos/generar-desde-planificacion/:planificacionId
 * @desc Generar movimientos automáticamente desde planificación anual
 * @access Public (TODO: Proteger con autenticación)
 * @param {string} planificacionId - ID de la planificación anual
 * @body {string} usuarioId - ID del usuario que ejecuta la acción
 */
router.post('/generar-desde-planificacion/:planificacionId', MovimientosController.generarDesdeplanificacion);

/**
 * @route POST /api/movimientos/sincronizar-saldo-anterior
 * @desc Sincronizar saldo anterior del siguiente mes manualmente
 * @access Public (TODO: Proteger con autenticación)
 * @body {string} establecimientoId - ID del establecimiento
 * @body {string} vacunaId - ID de la vacuna
 * @body {number} mes - Mes (1-12)
 * @body {number} anio - Año
 */
router.post('/sincronizar-saldo-anterior', MovimientosController.sincronizarSaldoAnterior);

/**
 * @route POST /api/movimientos/actualizar-stock-siguiente-mes
 * @desc 🚀 NUEVA FUNCIONALIDAD: Actualizar stock inicial del siguiente mes automáticamente
 * @desc Calcula el disponible actual (Stock Inicial - Entregas) y lo registra como
 * @desc stock_inicial del siguiente mes en la tabla stock_inicial_mensual
 * @access Public (TODO: Proteger con autenticación)
 * @body {string} vacunaId - ID de la vacuna
 * @body {number} mes - Mes actual (1-12)
 * @body {number} anio - Año actual
 * @example
 * // Ejemplo: Mes actual Abril (4), Stock Inicial: 234, Entregas: 147, Disponible: 87
 * // Resultado: Se registra 87 como stock inicial de Mayo en stock_inicial_mensual
 */
router.post('/actualizar-stock-siguiente-mes', MovimientosController.actualizarStockInicialSiguienteMes);

/**
 * @route GET /api/movimientos
 * @desc Obtener todos los movimientos con filtros opcionales
 * @access Public (TODO: Proteger con autenticación)
 * @query {string} [establecimientoId] - ID del establecimiento
 * @query {string} [vacunaId] - ID de la vacuna
 * @query {number} [mes] - Mes (1-12)
 * @query {number} [anio] - Año de movimiento
 * @query {string} [centroAcopioId] - ID del centro de acopio o 'todos'
 * @query {string} [search] - Búsqueda por texto
 * @query {number} [page=1] - Número de página
 * @query {number} [limit=50] - Límite de resultados por página
 */
router.get('/', MovimientosController.getAll);

/**
 * @route GET /api/movimientos/:id
 * @desc Obtener movimiento por ID
 * @access Public (TODO: Proteger con autenticación)
 * @param {string} id - ID del movimiento
 */
router.get('/:id', MovimientosController.getById);

/**
 * @route POST /api/movimientos
 * @desc Crear nuevo movimiento
 * @access Public (TODO: Proteger con autenticación)
 * @body {CreateMovimientoDto} data - Datos del movimiento a crear
 */
router.post('/', MovimientosController.create);

/**
 * @route PUT /api/movimientos/:id
 * @desc Actualizar movimiento existente
 * @access Public (TODO: Proteger con autenticación)
 * @param {string} id - ID del movimiento
 * @body {UpdateMovimientoDto} data - Datos del movimiento a actualizar
 */
router.put('/:id', MovimientosController.update);

/**
 * @route DELETE /api/movimientos/:id
 * @desc Eliminar movimiento
 * @access Public (TODO: Proteger con autenticación)
 * @param {string} id - ID del movimiento
 */
router.delete('/:id', MovimientosController.delete);

// =====================================================
// RUTAS PARA ENTREGAS ADICIONALES
// =====================================================

/**
 * @route POST /api/movimientos/:movimientoId/entregas-adicionales
 * @desc Crear entrega adicional para un movimiento
 * @access Public (TODO: Proteger con autenticación)
 * @param {string} movimientoId - ID del movimiento de vacuna
 * @body {CreateEntregaAdicionalDto} data - Datos de la entrega adicional
 */
router.post('/:movimientoId/entregas-adicionales', MovimientosController.createEntregaAdicional);

/**
 * @route PUT /api/movimientos/entregas-adicionales/:id
 * @desc Actualizar entrega adicional
 * @access Public (TODO: Proteger con autenticación)
 * @param {string} id - ID de la entrega adicional
 * @body {number} cantidad - Nueva cantidad
 * @body {string} [motivo] - Motivo de la entrega adicional
 */
router.put('/entregas-adicionales/:id', MovimientosController.updateEntregaAdicional);

/**
 * @route DELETE /api/movimientos/entregas-adicionales/:id
 * @desc Eliminar entrega adicional
 * @access Public (TODO: Proteger con autenticación)
 * @param {string} id - ID de la entrega adicional
 */
router.delete('/entregas-adicionales/:id', MovimientosController.deleteEntregaAdicional);

export default router;
