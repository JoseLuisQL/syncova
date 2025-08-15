import { Router } from 'express';
import { CentroAcopioController } from '@/controllers/CentroAcopioController';
import { authenticateToken } from '@/middleware/auth';
import { validatePermissions } from '@/middleware/permissions';

const router = Router();

// Aplicar autenticación a todas las rutas
router.use(authenticateToken);

/**
 * @swagger
 * components:
 *   schemas:
 *     CentroAcopio:
 *       type: object
 *       required:
 *         - nombre
 *         - direccion
 *         - responsable
 *       properties:
 *         id:
 *           type: string
 *           format: uuid
 *           description: ID único del centro de acopio
 *         nombre:
 *           type: string
 *           description: Nombre del centro de acopio
 *         codigo:
 *           type: string
 *           description: Código del centro de acopio
 *         microredId:
 *           type: string
 *           format: uuid
 *           description: ID de la microred a la que pertenece
 *         direccion:
 *           type: string
 *           description: Dirección del centro de acopio
 *         responsable:
 *           type: string
 *           description: Responsable del centro de acopio
 *         telefono:
 *           type: string
 *           description: Teléfono del centro de acopio
 *         estado:
 *           type: string
 *           enum: [activo, inactivo]
 *           description: Estado del centro de acopio
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: Fecha de creación
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           description: Fecha de última actualización
 *     CreateCentroAcopioDto:
 *       type: object
 *       required:
 *         - nombre
 *         - direccion
 *         - responsable
 *       properties:
 *         nombre:
 *           type: string
 *           description: Nombre del centro de acopio
 *         codigo:
 *           type: string
 *           description: Código del centro de acopio
 *         microredId:
 *           type: string
 *           format: uuid
 *           description: ID de la microred a la que pertenece
 *         direccion:
 *           type: string
 *           description: Dirección del centro de acopio
 *         responsable:
 *           type: string
 *           description: Responsable del centro de acopio
 *         telefono:
 *           type: string
 *           description: Teléfono del centro de acopio
 *     UpdateCentroAcopioDto:
 *       type: object
 *       properties:
 *         nombre:
 *           type: string
 *           description: Nombre del centro de acopio
 *         codigo:
 *           type: string
 *           description: Código del centro de acopio
 *         microredId:
 *           type: string
 *           format: uuid
 *           description: ID de la microred a la que pertenece
 *         direccion:
 *           type: string
 *           description: Dirección del centro de acopio
 *         responsable:
 *           type: string
 *           description: Responsable del centro de acopio
 *         telefono:
 *           type: string
 *           description: Teléfono del centro de acopio
 *         estado:
 *           type: string
 *           enum: [activo, inactivo]
 *           description: Estado del centro de acopio
 */

/**
 * @swagger
 * /api/centros-acopio:
 *   get:
 *     summary: Obtener todos los centros de acopio
 *     tags: [Centros de Acopio]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: microredId
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Filtrar por microred
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
 *         description: Buscar por nombre, código o responsable
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
 *         description: Lista de centros de acopio obtenida exitosamente
 *       401:
 *         description: No autorizado
 *       500:
 *         description: Error interno del servidor
 */
router.get('/', validatePermissions(['admin', 'supervisor']), CentroAcopioController.getAll);

/**
 * @swagger
 * /api/centros-acopio/{id}:
 *   get:
 *     summary: Obtener centro de acopio por ID
 *     tags: [Centros de Acopio]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID del centro de acopio
 *     responses:
 *       200:
 *         description: Centro de acopio obtenido exitosamente
 *       404:
 *         description: Centro de acopio no encontrado
 *       401:
 *         description: No autorizado
 *       500:
 *         description: Error interno del servidor
 */
router.get('/:id', validatePermissions(['admin', 'supervisor']), CentroAcopioController.getById);

/**
 * @swagger
 * /api/centros-acopio/microred/{microredId}:
 *   get:
 *     summary: Obtener centros de acopio por microred
 *     tags: [Centros de Acopio]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: microredId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID de la microred
 *     responses:
 *       200:
 *         description: Centros de acopio obtenidos exitosamente
 *       401:
 *         description: No autorizado
 *       500:
 *         description: Error interno del servidor
 */
router.get('/microred/:microredId', validatePermissions(['admin', 'supervisor', 'operador']), CentroAcopioController.getByMicrored);

/**
 * @swagger
 * /api/centros-acopio/red/{redId}:
 *   get:
 *     summary: Obtener centros de acopio por red
 *     tags: [Centros de Acopio]
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
 *         description: Centros de acopio obtenidos exitosamente
 *       401:
 *         description: No autorizado
 *       500:
 *         description: Error interno del servidor
 */
router.get('/red/:redId', validatePermissions(['admin', 'supervisor', 'operador']), CentroAcopioController.getByRed);

/**
 * @swagger
 * /api/centros-acopio:
 *   post:
 *     summary: Crear nuevo centro de acopio
 *     tags: [Centros de Acopio]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateCentroAcopioDto'
 *     responses:
 *       201:
 *         description: Centro de acopio creado exitosamente
 *       400:
 *         description: Datos inválidos
 *       409:
 *         description: Centro de acopio ya existe
 *       401:
 *         description: No autorizado
 *       403:
 *         description: Sin permisos
 *       500:
 *         description: Error interno del servidor
 */
router.post('/', validatePermissions(['admin']), CentroAcopioController.create);

/**
 * @swagger
 * /api/centros-acopio/{id}:
 *   put:
 *     summary: Actualizar centro de acopio
 *     tags: [Centros de Acopio]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID del centro de acopio
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateCentroAcopioDto'
 *     responses:
 *       200:
 *         description: Centro de acopio actualizado exitosamente
 *       400:
 *         description: Datos inválidos
 *       404:
 *         description: Centro de acopio no encontrado
 *       409:
 *         description: Conflicto con datos existentes
 *       401:
 *         description: No autorizado
 *       403:
 *         description: Sin permisos
 *       500:
 *         description: Error interno del servidor
 */
router.put('/:id', validatePermissions(['admin']), CentroAcopioController.update);

/**
 * @swagger
 * /api/centros-acopio/{id}:
 *   delete:
 *     summary: Eliminar centro de acopio
 *     tags: [Centros de Acopio]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID del centro de acopio
 *     responses:
 *       200:
 *         description: Centro de acopio eliminado exitosamente
 *       404:
 *         description: Centro de acopio no encontrado
 *       409:
 *         description: No se puede eliminar (tiene dependencias)
 *       401:
 *         description: No autorizado
 *       403:
 *         description: Sin permisos
 *       500:
 *         description: Error interno del servidor
 */
router.delete('/:id', validatePermissions(['admin']), CentroAcopioController.delete);

export default router;
