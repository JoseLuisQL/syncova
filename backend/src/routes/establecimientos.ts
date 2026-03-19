import { Router } from 'express';
import { EstablecimientoController } from '@/controllers/EstablecimientoController';
import { authenticate } from '@/middleware/auth';
import { requireCentroAcopioAssignment } from '@/middleware/accessControl';
import { requirePermissions } from '@/middleware/permissions';

/**
 * Rutas para gestión de establecimientos
 */
const router = Router();

router.use(authenticate, requireCentroAcopioAssignment);

/**
 * @route GET /api/establecimientos
 * @desc Obtener todos los establecimientos con filtros opcionales
 * @access Public (TODO: Proteger con autenticación)
 * @query {string} [tipo] - Tipo de establecimiento (centro_acopio, centro_salud, puesto_salud)
 * @query {string} [estado] - Estado del establecimiento (activo, inactivo, todos)
 * @query {string} [search] - Búsqueda por nombre, código o responsable
 * @query {string} [centroAcopioId] - ID del centro de acopio
 * @query {number} [page=1] - Número de página
 * @query {number} [limit=50] - Límite de resultados por página
 */
router.get('/', requirePermissions(['establecimientos:read']), EstablecimientoController.getAll);

/**
 * @route GET /api/establecimientos/centros-acopio
 * @desc Obtener todos los centros de acopio
 * @access Public (TODO: Proteger con autenticación)
 */
router.get('/centros-acopio', requirePermissions(['establecimientos:read']), EstablecimientoController.getCentrosAcopio);

/**
 * @route GET /api/establecimientos/opciones-jerarquicas
 * @desc Obtener opciones jerárquicas para formularios (redes, microredes, centros de acopio)
 * @access Public (TODO: Proteger con autenticación)
 */
router.get('/opciones-jerarquicas', requirePermissions(['establecimientos:read']), EstablecimientoController.getOpcionesJerarquicas);

/**
 * @route GET /api/establecimientos/centro-acopio/:centroAcopioId
 * @desc Obtener establecimientos por centro de acopio
 * @access Public (TODO: Proteger con autenticación)
 * @param {string} centroAcopioId - ID del centro de acopio
 */
router.get('/centro-acopio/:centroAcopioId', requirePermissions(['establecimientos:read']), EstablecimientoController.getByCentroAcopio);

/**
 * @route GET /api/establecimientos/codigo/:codigo
 * @desc Obtener establecimiento por código
 * @access Public (TODO: Proteger con autenticación)
 * @param {string} codigo - Código del establecimiento
 */
router.get('/codigo/:codigo', requirePermissions(['establecimientos:read']), EstablecimientoController.getByCodigo);

/**
 * @route GET /api/establecimientos/:id
 * @desc Obtener establecimiento por ID
 * @access Public (TODO: Proteger con autenticación)
 * @param {string} id - ID del establecimiento
 */
router.get('/:id', requirePermissions(['establecimientos:read']), EstablecimientoController.getById);

/**
 * @route POST /api/establecimientos
 * @desc Crear nuevo establecimiento
 * @access Private (TODO: Proteger con autenticación y autorización)
 * @body {CreateEstablecimientoDto} data - Datos del establecimiento
 */
router.post('/', requirePermissions(['establecimientos:write']), EstablecimientoController.create);

/**
 * @route PUT /api/establecimientos/:id
 * @desc Actualizar establecimiento
 * @access Private (TODO: Proteger con autenticación y autorización)
 * @param {string} id - ID del establecimiento
 * @body {UpdateEstablecimientoDto} data - Datos a actualizar
 */
router.put('/:id', requirePermissions(['establecimientos:write']), EstablecimientoController.update);

/**
 * @route DELETE /api/establecimientos/:id
 * @desc Eliminar establecimiento
 * @access Private (TODO: Proteger con autenticación y autorización)
 * @param {string} id - ID del establecimiento
 */
router.delete('/:id', requirePermissions(['establecimientos:write']), EstablecimientoController.delete);

export default router;
