import { Router } from 'express';
import { AlertaController } from '@/controllers/AlertaController';
import { authenticate } from '@/middleware/auth';
import { validatePermissions } from '@/middleware/permissions';

const router = Router();

router.get('/stream', AlertaController.stream);

/**
 * @route GET /api/alertas/stats
 * @desc Obtener estadísticas de alertas
 * @access Private (Todos los usuarios autenticados)
 */
router.get('/stats', authenticate, AlertaController.getStats);

/**
 * @route GET /api/alertas/no-leidas
 * @desc Obtener alertas no leídas para el usuario autenticado
 * @access Private (Usuario autenticado)
 */
router.get('/no-leidas', authenticate, AlertaController.getUnreadForUser);

/**
 * @route GET /api/alertas/verificar-y-generar
 * @desc Verificar lotes/stock, generar alertas y devolver no leídas
 * @access Private (Usuario autenticado)
 * @query {number} [diasAnticipacion=30] - Días de anticipación para vencimiento
 * @query {number} [porcentajeMinimo=20] - Porcentaje mínimo de stock
 */
router.get('/verificar-y-generar', authenticate, AlertaController.verifyAndGenerate);

/**
 * @route DELETE /api/alertas/limpiar-antiguas
 * @desc Limpiar alertas antiguas (más de X días)
 * @access Private (Solo Administradores)
 * @query {number} [days=30] - Número de días para considerar alertas como antiguas
 */
router.delete('/limpiar-antiguas', authenticate, validatePermissions(['admin']), AlertaController.cleanupOldAlerts);

/**
 * @route POST /api/alertas/generar-automaticas
 * @desc Generar alertas automáticas (vencimiento y stock bajo)
 * @access Private (Solo Administradores y Coordinadores)
 * @body {number} [diasAnticipacion=30] - Días de anticipación para alertas de vencimiento
 * @body {number} [porcentajeMinimo=20] - Porcentaje mínimo de stock para alertas
 */
router.post('/generar-automaticas', authenticate, validatePermissions(['admin', 'coordinador']), AlertaController.generateAutomatic);

/**
 * @route DELETE /api/alertas/limpiar-resueltas
 * @desc Limpiar alertas que ya no aplican (lotes vencidos, stock recuperado)
 * @access Private (Solo Administradores)
 */
router.delete('/limpiar-resueltas', authenticate, validatePermissions(['admin']), AlertaController.cleanupResolved);

/**
 * @route PUT /api/alertas/leer-multiples
 * @desc Marcar múltiples alertas como leídas
 * @access Private (Todos los usuarios autenticados)
 * @body {string[]} ids - Array de IDs de alertas a marcar como leídas
 */
router.put('/leer-multiples', authenticate, AlertaController.markMultipleAsRead);

/**
 * @route GET /api/alertas
 * @desc Obtener todas las alertas con filtros opcionales
 * @access Private (Todos los usuarios autenticados)
 * @query {string} [tipo] - Filtrar por tipo de alerta
 * @query {string} [nivel] - Filtrar por nivel de alerta
 * @query {boolean} [leida] - Filtrar por estado de lectura
 * @query {string} [usuarioId] - Filtrar por usuario
 * @query {string} [fechaDesde] - Filtrar desde fecha
 * @query {string} [fechaHasta] - Filtrar hasta fecha
 * @query {string} [search] - Búsqueda en título y descripción
 * @query {number} [page=1] - Página para paginación
 * @query {number} [limit=50] - Límite de resultados por página
 */
router.get('/', authenticate, AlertaController.getAll);

/**
 * @route POST /api/alertas
 * @desc Crear nueva alerta
 * @access Private (Todos los usuarios autenticados)
 * @body {string} tipo - Tipo de alerta (vencimiento, stock_bajo, discrepancia, sistema)
 * @body {string} titulo - Título de la alerta
 * @body {string} descripcion - Descripción de la alerta
 * @body {string} nivel - Nivel de alerta (info, warning, error, success)
 * @body {string} [fechaVencimiento] - Fecha de vencimiento opcional
 * @body {string} [usuarioId] - ID del usuario (opcional, por defecto el usuario autenticado)
 * @body {object} [parametros] - Parámetros adicionales en formato JSON
 */
router.post('/', authenticate, AlertaController.create);

/**
 * @route GET /api/alertas/:id
 * @desc Obtener una alerta por ID
 * @access Private (Todos los usuarios autenticados)
 * @param {string} id - ID de la alerta
 */
router.get('/:id', authenticate, AlertaController.getById);

/**
 * @route PUT /api/alertas/:id
 * @desc Actualizar alerta existente
 * @access Private (Todos los usuarios autenticados)
 * @param {string} id - ID de la alerta
 * @body {string} [tipo] - Tipo de alerta
 * @body {string} [titulo] - Título de la alerta
 * @body {string} [descripcion] - Descripción de la alerta
 * @body {string} [nivel] - Nivel de alerta
 * @body {string} [fechaVencimiento] - Fecha de vencimiento
 * @body {boolean} [leida] - Estado de lectura
 * @body {string} [usuarioId] - ID del usuario
 * @body {object} [parametros] - Parámetros adicionales
 */
router.put('/:id', authenticate, AlertaController.update);

/**
 * @route DELETE /api/alertas/:id
 * @desc Eliminar alerta
 * @access Private (Solo Administradores y Coordinadores)
 * @param {string} id - ID de la alerta
 */
router.delete('/:id', authenticate, validatePermissions(['admin', 'coordinador']), AlertaController.delete);

/**
 * @route PUT /api/alertas/:id/leer
 * @desc Marcar alerta como leída
 * @access Private (Todos los usuarios autenticados)
 * @param {string} id - ID de la alerta
 */
router.put('/:id/leer', authenticate, AlertaController.markAsRead);

export default router;
