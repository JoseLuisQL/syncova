import { Router } from 'express';
import { UsuarioController } from '@/controllers/UsuarioController';
import { authenticate, authorize } from '@/middleware/auth';

/**
 * Rutas para gestión de usuarios
 */
const router = Router();

router.use(authenticate, authorize(['administrador']));

/**
 * @route GET /api/usuarios
 * @desc Obtener todos los usuarios con filtros opcionales
 * @access Privado (requiere autenticación)
 * @query {string} [estado] - Estado del usuario (activo, inactivo, todos)
 * @query {string} [search] - Búsqueda por nombres, apellidos, email o usuario
 * @query {string} [rol] - Filtro por rol (administrador, coordinador, responsable_acopio, operador, todos)
 * @query {string} [establecimientoId] - Filtro por establecimiento
 * @query {number} [page=1] - Número de página
 * @query {number} [limit=50] - Límite de resultados por página
 */
router.get('/', UsuarioController.getAll);

/**
 * @route GET /api/usuarios/activos
 * @desc Obtener todos los usuarios activos (para selects y formularios)
 * @access Privado (requiere autenticación)
 */
router.get('/activos', UsuarioController.getActivos);

/**
 * @route GET /api/usuarios/stats
 * @desc Obtener estadísticas de usuarios
 * @access Privado (requiere autenticación)
 */
router.get('/stats', UsuarioController.getStats);

/**
 * @route GET /api/usuarios/rol/:rol
 * @desc Obtener usuarios por rol específico
 * @access Privado (requiere autenticación)
 * @param {string} rol - Rol del usuario (administrador, coordinador, responsable_acopio, operador)
 */
router.get('/rol/:rol', UsuarioController.getByRol);

/**
 * @route GET /api/usuarios/:id
 * @desc Obtener usuario por ID
 * @access Privado (requiere autenticación)
 * @param {string} id - ID del usuario
 */
router.get('/:id', UsuarioController.getById);

/**
 * @route POST /api/usuarios
 * @desc Crear nuevo usuario
 * @access Privado (requiere autenticación + permisos)
 * @body {CreateUsuarioDto} data - Datos del usuario
 */
router.post('/', UsuarioController.create);

/**
 * @route PUT /api/usuarios/:id
 * @desc Actualizar usuario
 * @access Privado (requiere autenticación + permisos)
 * @param {string} id - ID del usuario
 * @body {UpdateUsuarioDto} data - Datos a actualizar
 */
router.put('/:id', UsuarioController.update);

/**
 * @route DELETE /api/usuarios/:id
 * @desc Eliminar usuario (soft delete si tiene dependencias)
 * @access Privado (requiere autenticación + permisos)
 * @param {string} id - ID del usuario
 */
router.delete('/:id', UsuarioController.delete);

/**
 * @route POST /api/usuarios/:id/change-password
 * @desc Cambiar contraseña de usuario
 * @access Privado (requiere autenticación)
 * @param {string} id - ID del usuario
 * @body {ChangePasswordDto} data - Datos de cambio de contraseña
 */
router.post('/:id/change-password', UsuarioController.changePassword);

/**
 * @route PATCH /api/usuarios/:id/estado
 * @desc Cambiar estado del usuario (activar/desactivar)
 * @access Privado (requiere autenticación + permisos)
 * @param {string} id - ID del usuario
 * @body {estado: EstadoGeneral} data - Nuevo estado
 */
router.patch('/:id/estado', UsuarioController.changeEstado);

/**
 * @route POST /api/usuarios/:id/ultimo-acceso
 * @desc Actualizar último acceso del usuario
 * @access Privado (requiere autenticación)
 * @param {string} id - ID del usuario
 */
router.post('/:id/ultimo-acceso', UsuarioController.updateUltimoAcceso);

export default router;
