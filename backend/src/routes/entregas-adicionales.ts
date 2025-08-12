import { Router } from 'express';
import { EntregaAdicionalController } from '@/controllers/EntregaAdicionalController';

/**
 * Rutas para gestión de entregas adicionales
 * Módulo 10: ENTREGAS ADICIONALES
 */
const router = Router();

/**
 * @route GET /api/entregas-adicionales/movimiento/:movimientoId
 * @desc Obtener entregas adicionales por movimiento
 * @access Public (TODO: Proteger con autenticación)
 * @param {string} movimientoId - ID del movimiento de vacuna
 */
router.get('/movimiento/:movimientoId', EntregaAdicionalController.getByMovimiento);

/**
 * @route GET /api/entregas-adicionales/movimiento/:movimientoId/estadisticas
 * @desc Obtener estadísticas de entregas adicionales por movimiento
 * @access Public (TODO: Proteger con autenticación)
 * @param {string} movimientoId - ID del movimiento de vacuna
 */
router.get('/movimiento/:movimientoId/estadisticas', EntregaAdicionalController.getEstadisticasByMovimiento);

/**
 * @route GET /api/entregas-adicionales/:id
 * @desc Obtener entrega adicional por ID
 * @access Public (TODO: Proteger con autenticación)
 * @param {string} id - ID de la entrega adicional
 */
router.get('/:id', EntregaAdicionalController.getById);

/**
 * @route POST /api/entregas-adicionales
 * @desc Crear nueva entrega adicional
 * @access Public (TODO: Proteger con autenticación)
 * @body {CreateEntregaAdicionalDto} data - Datos de la entrega adicional a crear
 */
router.post('/', EntregaAdicionalController.create);

/**
 * @route PUT /api/entregas-adicionales/:id
 * @desc Actualizar entrega adicional existente
 * @access Public (TODO: Proteger con autenticación)
 * @param {string} id - ID de la entrega adicional
 * @body {UpdateEntregaAdicionalDto} data - Datos de la entrega adicional a actualizar
 */
router.put('/:id', EntregaAdicionalController.update);

/**
 * @route DELETE /api/entregas-adicionales/:id
 * @desc Eliminar entrega adicional
 * @access Public (TODO: Proteger con autenticación)
 * @param {string} id - ID de la entrega adicional
 */
router.delete('/:id', EntregaAdicionalController.delete);

export default router;
