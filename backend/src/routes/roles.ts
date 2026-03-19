import { Router } from 'express';
import { RoleController } from '@/controllers/RoleController';
import { authenticate } from '@/middleware/auth';
import { requirePermissions, validatePermissions } from '@/middleware/permissions';

const router = Router();

/**
 * @route GET /api/roles/stats
 * @desc Obtener estadísticas de roles
 * @access Private (Administradores y Coordinadores)
 */
router.get('/stats', authenticate, requirePermissions(['roles:read']), validatePermissions(['admin']), RoleController.getStats);

/**
 * @route GET /api/roles/codigo/:codigo
 * @desc Obtener un rol por código
 * @access Private (Administradores y Coordinadores)
 */
router.get('/codigo/:codigo', authenticate, requirePermissions(['roles:read']), validatePermissions(['admin']), RoleController.getByCodigo);

/**
 * @route GET /api/roles/:id/permissions
 * @desc Obtener permisos de un rol
 * @access Private (Administradores y Coordinadores)
 */
router.get('/:id/permissions', authenticate, requirePermissions(['roles:read']), validatePermissions(['admin']), RoleController.getRolePermissions);

/**
 * @route POST /api/roles/:id/permissions
 * @desc Asignar permisos a un rol
 * @access Private (Solo Administradores)
 */
router.post('/:id/permissions', authenticate, requirePermissions(['permisos:assign']), validatePermissions(['admin']), RoleController.assignPermissions);

/**
 * @route GET /api/roles
 * @desc Obtener todos los roles con filtros opcionales
 * @access Private (Administradores y Coordinadores)
 * @query {string} [estado] - Estado del rol (activo, inactivo, todos)
 * @query {string} [search] - Búsqueda por nombre, descripción o código
 * @query {boolean} [includePermissions] - Incluir permisos en la respuesta
 * @query {number} [page=1] - Número de página
 * @query {number} [limit=50] - Límite de resultados por página
 */
router.get('/', authenticate, requirePermissions(['roles:read']), validatePermissions(['admin']), RoleController.getAll);

/**
 * @route POST /api/roles
 * @desc Crear nuevo rol
 * @access Private (Solo Administradores)
 * @body {string} nombre - Nombre del rol
 * @body {string} codigo - Código único del rol
 * @body {string} [descripcion] - Descripción del rol
 * @body {string} [estado=activo] - Estado del rol
 */
router.post('/', authenticate, requirePermissions(['roles:write']), validatePermissions(['admin']), RoleController.create);

/**
 * @route GET /api/roles/:id
 * @desc Obtener un rol por ID
 * @access Private (Administradores y Coordinadores)
 * @query {boolean} [includePermissions] - Incluir permisos en la respuesta
 */
router.get('/:id', authenticate, requirePermissions(['roles:read']), validatePermissions(['admin']), RoleController.getById);

/**
 * @route PUT /api/roles/:id
 * @desc Actualizar rol
 * @access Private (Solo Administradores)
 * @body {string} [nombre] - Nombre del rol
 * @body {string} [codigo] - Código del rol
 * @body {string} [descripcion] - Descripción del rol
 * @body {string} [estado] - Estado del rol
 */
router.put('/:id', authenticate, requirePermissions(['roles:write']), validatePermissions(['admin']), RoleController.update);

/**
 * @route DELETE /api/roles/:id
 * @desc Eliminar rol
 * @access Private (Solo Administradores)
 */
router.delete('/:id', authenticate, requirePermissions(['roles:write']), validatePermissions(['admin']), RoleController.delete);

/**
 * @route PATCH /api/roles/:id/estado
 * @desc Cambiar estado del rol
 * @access Private (Solo Administradores)
 * @body {string} estado - Nuevo estado (activo, inactivo)
 */
router.patch('/:id/estado', authenticate, requirePermissions(['roles:write']), validatePermissions(['admin']), RoleController.changeEstado);

export default router;
