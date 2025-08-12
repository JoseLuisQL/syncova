import { Router } from 'express';
import { VacunaController } from '@/controllers/VacunaController';

/**
 * Rutas para gestión de vacunas
 */
const router = Router();

/**
 * @route GET /api/vacunas
 * @desc Obtener todas las vacunas con filtros opcionales
 * @access Public (TODO: Proteger con autenticación)
 * @query {string} [estado] - Estado de la vacuna (activo, inactivo, todos)
 * @query {string} [search] - Búsqueda por nombre, tipo o presentación
 * @query {string} [tipo] - Filtro por tipo de vacuna
 * @query {number} [page=1] - Número de página
 * @query {number} [limit=1000] - Límite de resultados por página
 */
router.get('/', VacunaController.getAll);

/**
 * @route GET /api/vacunas/activas
 * @desc Obtener todas las vacunas activas (para selects y formularios)
 * @access Public (TODO: Proteger con autenticación)
 */
router.get('/activas', VacunaController.getActivas);

/**
 * @route GET /api/vacunas/stats/stock
 * @desc Obtener estadísticas de stock de vacunas
 * @access Public (TODO: Proteger con autenticación)
 * @query {string} [vacunaId] - ID de vacuna específica (opcional)
 */
router.get('/stats/stock', VacunaController.getStockStats);

/**
 * @route GET /api/vacunas/:id
 * @desc Obtener vacuna por ID
 * @access Public (TODO: Proteger con autenticación)
 * @param {string} id - ID de la vacuna
 */
router.get('/:id', VacunaController.getById);

/**
 * @route POST /api/vacunas
 * @desc Crear nueva vacuna
 * @access Private (TODO: Proteger con autenticación y autorización)
 * @body {CreateVacunaDto} data - Datos de la vacuna
 */
router.post('/', VacunaController.create);

/**
 * @route PUT /api/vacunas/:id
 * @desc Actualizar vacuna
 * @access Private (TODO: Proteger con autenticación y autorización)
 * @param {string} id - ID de la vacuna
 * @body {UpdateVacunaDto} data - Datos a actualizar
 */
router.put('/:id', VacunaController.update);

/**
 * @route DELETE /api/vacunas/:id
 * @desc Eliminar vacuna
 * @access Private (TODO: Proteger con autenticación y autorización)
 * @param {string} id - ID de la vacuna
 */
router.delete('/:id', VacunaController.delete);

export default router;
