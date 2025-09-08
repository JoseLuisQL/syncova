import { Router } from 'express';
import { PermissionController } from '@/controllers/PermissionController';
import { authenticate } from '@/middleware/auth';
import { validatePermissions } from '@/middleware/permissions';

const router = Router();

/**
 * @route GET /api/permissions/stats
 * @desc Obtener estadísticas de permisos
 * @access Private (Administradores y Coordinadores)
 */
router.get('/stats', authenticate, validatePermissions(['admin', 'supervisor']), PermissionController.getStats);

/**
 * @route GET /api/permissions/categorias
 * @desc Obtener categorías de permisos
 * @access Private (Administradores y Coordinadores)
 */
router.get('/categorias', authenticate, validatePermissions(['admin', 'supervisor']), PermissionController.getCategorias);

/**
 * @route GET /api/permissions/recursos
 * @desc Obtener recursos de permisos
 * @access Private (Administradores y Coordinadores)
 */
router.get('/recursos', authenticate, validatePermissions(['admin', 'supervisor']), PermissionController.getRecursos);

/**
 * @route GET /api/permissions/acciones
 * @desc Obtener acciones de permisos
 * @access Private (Administradores y Coordinadores)
 */
router.get('/acciones', authenticate, validatePermissions(['admin', 'supervisor']), PermissionController.getAcciones);

/**
 * @route GET /api/permissions/grouped
 * @desc Obtener permisos agrupados por categoría
 * @access Private (Administradores y Coordinadores)
 */
router.get('/grouped', authenticate, validatePermissions(['admin', 'supervisor']), PermissionController.getGroupedByCategory);

/**
 * @route GET /api/permissions/codigo/:codigo
 * @desc Obtener un permiso por código
 * @access Private (Administradores y Coordinadores)
 */
router.get('/codigo/:codigo', authenticate, validatePermissions(['admin', 'supervisor']), PermissionController.getByCodigo);

/**
 * @route GET /api/permissions
 * @desc Obtener todos los permisos con filtros opcionales
 * @access Private (Administradores y Coordinadores)
 * @query {string} [estado] - Estado del permiso (activo, inactivo, todos)
 * @query {string} [search] - Búsqueda por nombre, descripción, código, recurso o categoría
 * @query {string} [categoria] - Filtro por categoría
 * @query {string} [recurso] - Filtro por recurso
 * @query {string} [accion] - Filtro por acción
 * @query {number} [page=1] - Número de página
 * @query {number} [limit=100] - Límite de resultados por página
 */
router.get('/', authenticate, validatePermissions(['admin', 'supervisor']), PermissionController.getAll);

/**
 * @route POST /api/permissions
 * @desc Crear nuevo permiso
 * @access Private (Solo Administradores)
 * @body {string} nombre - Nombre del permiso
 * @body {string} codigo - Código único del permiso
 * @body {string} recurso - Recurso al que aplica el permiso
 * @body {string} accion - Acción que permite el permiso
 * @body {string} categoria - Categoría del permiso
 * @body {string} [descripcion] - Descripción del permiso
 * @body {string} [estado=activo] - Estado del permiso
 */
router.post('/', authenticate, validatePermissions(['admin']), PermissionController.create);

/**
 * @route GET /api/permissions/:id
 * @desc Obtener un permiso por ID
 * @access Private (Administradores y Coordinadores)
 */
router.get('/:id', authenticate, validatePermissions(['admin', 'supervisor']), PermissionController.getById);

/**
 * @route PUT /api/permissions/:id
 * @desc Actualizar permiso
 * @access Private (Solo Administradores)
 * @body {string} [nombre] - Nombre del permiso
 * @body {string} [codigo] - Código del permiso
 * @body {string} [recurso] - Recurso del permiso
 * @body {string} [accion] - Acción del permiso
 * @body {string} [categoria] - Categoría del permiso
 * @body {string} [descripcion] - Descripción del permiso
 * @body {string} [estado] - Estado del permiso
 */
router.put('/:id', authenticate, validatePermissions(['admin']), PermissionController.update);

/**
 * @route DELETE /api/permissions/:id
 * @desc Eliminar permiso
 * @access Private (Solo Administradores)
 */
router.delete('/:id', authenticate, validatePermissions(['admin']), PermissionController.delete);

/**
 * @route PATCH /api/permissions/:id/estado
 * @desc Cambiar estado del permiso
 * @access Private (Solo Administradores)
 * @body {string} estado - Nuevo estado (activo, inactivo)
 */
router.patch('/:id/estado', authenticate, validatePermissions(['admin']), PermissionController.changeEstado);

export default router;
