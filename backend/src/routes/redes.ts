import { Router } from 'express';
import { RedController } from '@/controllers/RedController';
import { authenticateToken } from '@/middleware/auth';
import { validatePermissions } from '@/middleware/permissions';

const router = Router();

// Aplicar autenticación a todas las rutas
router.use(authenticateToken);

/**
 * @swagger
 * components:
 *   schemas:
 *     Red:
 *       type: object
 *       required:
 *         - nombre
 *       properties:
 *         id:
 *           type: string
 *           format: uuid
 *           description: ID único de la red
 *         nombre:
 *           type: string
 *           description: Nombre de la red
 *         codigo:
 *           type: string
 *           description: Código de la red
 *         descripcion:
 *           type: string
 *           description: Descripción de la red
 *         estado:
 *           type: string
 *           enum: [activo, inactivo]
 *           description: Estado de la red
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: Fecha de creación
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           description: Fecha de última actualización
 *     CreateRedDto:
 *       type: object
 *       required:
 *         - nombre
 *       properties:
 *         nombre:
 *           type: string
 *           description: Nombre de la red
 *         codigo:
 *           type: string
 *           description: Código de la red
 *         descripcion:
 *           type: string
 *           description: Descripción de la red
 *     UpdateRedDto:
 *       type: object
 *       properties:
 *         nombre:
 *           type: string
 *           description: Nombre de la red
 *         codigo:
 *           type: string
 *           description: Código de la red
 *         descripcion:
 *           type: string
 *           description: Descripción de la red
 *         estado:
 *           type: string
 *           enum: [activo, inactivo]
 *           description: Estado de la red
 */

/**
 * @swagger
 * /api/redes:
 *   get:
 *     summary: Obtener todas las redes
 *     tags: [Redes]
 *     security:
 *       - bearerAuth: []
 *     parameters:
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
 *         description: Lista de redes obtenida exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Red'
 *                 pagination:
 *                   type: object
 *                   properties:
 *                     page:
 *                       type: integer
 *                     limit:
 *                       type: integer
 *                     total:
 *                       type: integer
 *                     totalPages:
 *                       type: integer
 *       401:
 *         description: No autorizado
 *       500:
 *         description: Error interno del servidor
 */
router.get('/', validatePermissions(['admin', 'supervisor']), RedController.getAll);

/**
 * @swagger
 * /api/redes/{id}:
 *   get:
 *     summary: Obtener red por ID
 *     tags: [Redes]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID de la red
 *     responses:
 *       200:
 *         description: Red obtenida exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/Red'
 *       404:
 *         description: Red no encontrada
 *       401:
 *         description: No autorizado
 *       500:
 *         description: Error interno del servidor
 */
router.get('/:id', validatePermissions(['admin', 'supervisor']), RedController.getById);

/**
 * @swagger
 * /api/redes:
 *   post:
 *     summary: Crear nueva red
 *     tags: [Redes]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateRedDto'
 *     responses:
 *       201:
 *         description: Red creada exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/Red'
 *                 message:
 *                   type: string
 *       400:
 *         description: Datos inválidos
 *       409:
 *         description: Red ya existe
 *       401:
 *         description: No autorizado
 *       403:
 *         description: Sin permisos
 *       500:
 *         description: Error interno del servidor
 */
router.post('/', validatePermissions(['admin']), RedController.create);

/**
 * @swagger
 * /api/redes/{id}:
 *   put:
 *     summary: Actualizar red
 *     tags: [Redes]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID de la red
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateRedDto'
 *     responses:
 *       200:
 *         description: Red actualizada exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/Red'
 *                 message:
 *                   type: string
 *       400:
 *         description: Datos inválidos
 *       404:
 *         description: Red no encontrada
 *       409:
 *         description: Conflicto con datos existentes
 *       401:
 *         description: No autorizado
 *       403:
 *         description: Sin permisos
 *       500:
 *         description: Error interno del servidor
 */
router.put('/:id', validatePermissions(['admin']), RedController.update);

/**
 * @swagger
 * /api/redes/{id}:
 *   delete:
 *     summary: Eliminar red
 *     tags: [Redes]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID de la red
 *     responses:
 *       200:
 *         description: Red eliminada exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *       404:
 *         description: Red no encontrada
 *       409:
 *         description: No se puede eliminar (tiene dependencias)
 *       401:
 *         description: No autorizado
 *       403:
 *         description: Sin permisos
 *       500:
 *         description: Error interno del servidor
 */
router.delete('/:id', validatePermissions(['admin']), RedController.delete);

export default router;
