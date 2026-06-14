import { Router } from 'express';
import { VacunaController } from '@/controllers/VacunaController';
import { authenticate } from '@/middleware/auth';
import { requireCentroAcopioAssignment } from '@/middleware/accessControl';
import { requirePermissions } from '@/middleware/permissions';

/**
 * Rutas para gestión de vacunas
 */
const router = Router();

router.use(authenticate, requireCentroAcopioAssignment);

/**
 * @route GET /api/vacunas
 * @desc Obtener todas las vacunas con filtros opcionales
 * @access Privado (requiere autenticación)
 * @query {string} [estado] - Estado de la vacuna (activo, inactivo, todos)
 * @query {string} [search] - Búsqueda por nombre, tipo o presentación
 * @query {string} [tipo] - Filtro por tipo de vacuna
 * @query {number} [page=1] - Número de página
 * @query {number} [limit=1000] - Límite de resultados por página
 */
router.get('/', requirePermissions(['vacunas:read']), VacunaController.getAll);

/**
 * @route GET /api/vacunas/activas
 * @desc Obtener todas las vacunas activas (para selects y formularios)
 * @access Privado (requiere autenticación)
 */
router.get('/activas', requirePermissions(['vacunas:read']), VacunaController.getActivas);

/**
 * @route GET /api/vacunas/stats/stock
 * @desc Obtener estadísticas de stock de vacunas
 * @access Privado (requiere autenticación)
 * @query {string} [vacunaId] - ID de vacuna específica (opcional)
 */
router.get('/stats/stock', requirePermissions(['vacunas:read']), VacunaController.getStockStats);

/**
 * @route GET /api/vacunas/:id
 * @desc Obtener vacuna por ID
 * @access Privado (requiere autenticación)
 * @param {string} id - ID de la vacuna
 */
router.get('/:id', requirePermissions(['vacunas:read']), VacunaController.getById);

/**
 * @route POST /api/vacunas
 * @desc Crear nueva vacuna
 * @access Privado (requiere autenticación + permisos)
 * @body {CreateVacunaDto} data - Datos de la vacuna
 */
router.post('/', requirePermissions(['vacunas:write']), VacunaController.create);

/**
 * @route PUT /api/vacunas/:id
 * @desc Actualizar vacuna
 * @access Privado (requiere autenticación + permisos)
 * @param {string} id - ID de la vacuna
 * @body {UpdateVacunaDto} data - Datos a actualizar
 */
router.put('/:id', requirePermissions(['vacunas:write']), VacunaController.update);

/**
 * @route DELETE /api/vacunas/:id
 * @desc Eliminar vacuna
 * @access Privado (requiere autenticación + permisos)
 * @param {string} id - ID de la vacuna
 */
router.delete('/:id', requirePermissions(['vacunas:write']), VacunaController.delete);

export default router;
