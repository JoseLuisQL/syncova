import { Router } from 'express';
import { MicroredController } from '@/controllers/MicroredController';
import { authenticateToken } from '@/middleware/auth';
import { validatePermissions } from '@/middleware/permissions';

const router = Router();

// Aplicar autenticación a todas las rutas
router.use(authenticateToken);

/**
 * @swagger
 * components:
 *   schemas:
 *     Microred:
 *       type: object
 *       required:
 *         - nombre
 *         - redId
 *       properties:
 *         id:
 *           type: string
 *           format: uuid
 *           description: ID único de la microred
 *         nombre:
 *           type: string
 *           description: Nombre de la microred
 *         codigo:
 *           type: string
 *           description: Código de la microred
 *         descripcion:
 *           type: string
 *           description: Descripción de la microred
 *         redId:
 *           type: string
 *           format: uuid
 *           description: ID de la red a la que pertenece
 *         estado:
 *           type: string
 *           enum: [activo, inactivo]
 *           description: Estado de la microred
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: Fecha de creación
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           description: Fecha de última actualización
 *     CreateMicroredDto:
 *       type: object
 *       required:
 *         - nombre
 *         - redId
 *       properties:
 *         nombre:
 *           type: string
 *           description: Nombre de la microred
 *         codigo:
 *           type: string
 *           description: Código de la microred
 *         descripcion:
 *           type: string
 *           description: Descripción de la microred
 *         redId:
 *           type: string
 *           format: uuid
 *           description: ID de la red a la que pertenece
 *     UpdateMicroredDto:
 *       type: object
 *       properties:
 *         nombre:
 *           type: string
 *           description: Nombre de la microred
 *         codigo:
 *           type: string
 *           description: Código de la microred
 *         descripcion:
 *           type: string
 *           description: Descripción de la microred
 *         redId:
 *           type: string
 *           format: uuid
 *           description: ID de la red a la que pertenece
 *         estado:
 *           type: string
 *           enum: [activo, inactivo]
 *           description: Estado de la microred
 */

/**
 * @swagger
 * /api/microredes:
 *   get:
 *     summary: Obtener todas las microredes
 *     tags: [Microredes]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: redId
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Filtrar por red
 *       - in: query
 *         name: estado
 *         schema:
 *           type: string
 *           enum: [activo, inactivo, todos]
 *         description: Filtrar por estado
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Buscar por nombre, código o descripción
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *         description: Número de página
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *           default: 50
 *         description: Elementos por página
 *     responses:
 *       200:
 *         description: Lista de microredes obtenida exitosamente
 *       401:
 *         description: No autorizado
 *       500:
 *         description: Error interno del servidor
 */
router.get('/', validatePermissions(['admin', 'supervisor']), MicroredController.getAll);

/**
 * @swagger
 * /api/microredes/{id}:
 *   get:
 *     summary: Obtener microred por ID
 *     tags: [Microredes]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID de la microred
 *     responses:
 *       200:
 *         description: Microred obtenida exitosamente
 *       404:
 *         description: Microred no encontrada
 *       401:
 *         description: No autorizado
 *       500:
 *         description: Error interno del servidor
 */
router.get('/:id', validatePermissions(['admin', 'supervisor']), MicroredController.getById);

/**
 * @swagger
 * /api/microredes/red/{redId}:
 *   get:
 *     summary: Obtener microredes por red
 *     tags: [Microredes]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: redId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID de la red
 *     responses:
 *       200:
 *         description: Microredes obtenidas exitosamente
 *       401:
 *         description: No autorizado
 *       500:
 *         description: Error interno del servidor
 */
router.get('/red/:redId', validatePermissions(['admin', 'supervisor', 'operador']), MicroredController.getByRed);

/**
 * @swagger
 * /api/microredes:
 *   post:
 *     summary: Crear nueva microred
 *     tags: [Microredes]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateMicroredDto'
 *     responses:
 *       201:
 *         description: Microred creada exitosamente
 *       400:
 *         description: Datos inválidos
 *       409:
 *         description: Microred ya existe
 *       401:
 *         description: No autorizado
 *       403:
 *         description: Sin permisos
 *       500:
 *         description: Error interno del servidor
 */
router.post('/', validatePermissions(['admin']), MicroredController.create);

/**
 * @swagger
 * /api/microredes/{id}:
 *   put:
 *     summary: Actualizar microred
 *     tags: [Microredes]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID de la microred
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateMicroredDto'
 *     responses:
 *       200:
 *         description: Microred actualizada exitosamente
 *       400:
 *         description: Datos inválidos
 *       404:
 *         description: Microred no encontrada
 *       409:
 *         description: Conflicto con datos existentes
 *       401:
 *         description: No autorizado
 *       403:
 *         description: Sin permisos
 *       500:
 *         description: Error interno del servidor
 */
router.put('/:id', validatePermissions(['admin']), MicroredController.update);

/**
 * @swagger
 * /api/microredes/{id}:
 *   delete:
 *     summary: Eliminar microred
 *     tags: [Microredes]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID de la microred
 *     responses:
 *       200:
 *         description: Microred eliminada exitosamente
 *       404:
 *         description: Microred no encontrada
 *       409:
 *         description: No se puede eliminar (tiene dependencias)
 *       401:
 *         description: No autorizado
 *       403:
 *         description: Sin permisos
 *       500:
 *         description: Error interno del servidor
 */
router.delete('/:id', validatePermissions(['admin']), MicroredController.delete);

export default router;
