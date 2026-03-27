import { Router } from 'express';
import { PermisoOperativoController } from '@/controllers/PermisoOperativoController';
import { authenticate, authorize } from '@/middleware/auth';

const router = Router();

// Todas las rutas requieren autenticación
router.use(authenticate);

/**
 * @route GET /api/permisos-operativos/mis-permisos
 * @desc Obtener los permisos activos del usuario autenticado (para responsables)
 * @access Authenticated
 */
router.get('/mis-permisos', PermisoOperativoController.getMisPermisos);

// Las siguientes rutas son solo para administradores
router.use(authorize(['administrador']));

/**
 * @route GET /api/permisos-operativos
 * @desc Listar responsables de acopio con sus permisos del período
 * @query {number} mes - Mes (1-12)
 * @query {number} anio - Año
 * @access Admin only
 */
router.get('/', PermisoOperativoController.getResponsablesConPermisos);

/**
 * @route POST /api/permisos-operativos/toggle
 * @desc Activar/desactivar un permiso operativo
 * @body {string} tipo - Tipo de permiso
 * @body {number} mes - Mes (1-12)
 * @body {number} anio - Año
 * @body {boolean} habilitado - Estado
 * @body {string} [usuarioId] - ID del usuario (null = todos)
 * @body {boolean} [programado] - Si es programado
 * @body {string} [fechaActivacion] - Fecha de activación automática
 * @body {string} [fechaDesactivacion] - Fecha de desactivación automática
 * @access Admin only
 */
router.post('/toggle', PermisoOperativoController.togglePermiso);

/**
 * @route GET /api/permisos-operativos/usuario/:usuarioId
 * @desc Obtener permisos de un usuario específico
 * @access Admin only
 */
router.get('/usuario/:usuarioId', PermisoOperativoController.getPermisosUsuario);

/**
 * @route POST /api/permisos-operativos/procesar-programados
 * @desc Procesar permisos programados manualmente
 * @access Admin only
 */
router.post('/procesar-programados', PermisoOperativoController.procesarProgramados);

export default router;
