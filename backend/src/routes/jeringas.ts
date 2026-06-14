import { Router } from 'express';
import { JeringaController } from '@/controllers/JeringaController';

/**
 * Rutas para gestión de jeringas
 */
const router = Router();

/**
 * @route GET /api/jeringas
 * @desc Obtener todas las jeringas con filtros opcionales
 * @access Privado (requiere autenticación)
 * @query {string} [estado] - Estado de la jeringa (activo, inactivo, todos)
 * @query {string} [search] - Búsqueda por tipo, capacidad o color
 * @query {string} [tipo] - Filtro por tipo de jeringa
 * @query {string} [capacidad] - Filtro por capacidad
 * @query {string} [color] - Filtro por color
 * @query {number} [page=1] - Número de página
 * @query {number} [limit=1000] - Límite de resultados por página
 */
router.get('/', JeringaController.getAll);

/**
 * @route GET /api/jeringas/activas
 * @desc Obtener todas las jeringas activas (para selects y formularios)
 * @access Privado (requiere autenticación)
 */
router.get('/activas', JeringaController.getActivas);

/**
 * @route GET /api/jeringas/stats/stock
 * @desc Obtener estadísticas de stock de jeringas
 * @access Privado (requiere autenticación)
 * @query {string} [jeringaId] - ID de jeringa específica (opcional)
 */
router.get('/stats/stock', JeringaController.getStockStats);

/**
 * @route GET /api/jeringas/:id
 * @desc Obtener jeringa por ID
 * @access Privado (requiere autenticación)
 * @param {string} id - ID de la jeringa
 */
router.get('/:id', JeringaController.getById);

/**
 * @route POST /api/jeringas
 * @desc Crear nueva jeringa
 * @access Private (TODO: Proteger con autenticación y autorización)
 * @body {CreateJeringaDto} data - Datos de la jeringa
 */
router.post('/', JeringaController.create);

/**
 * @route PUT /api/jeringas/:id
 * @desc Actualizar jeringa
 * @access Private (TODO: Proteger con autenticación y autorización)
 * @param {string} id - ID de la jeringa
 * @body {UpdateJeringaDto} data - Datos a actualizar
 */
router.put('/:id', JeringaController.update);

/**
 * @route DELETE /api/jeringas/:id
 * @desc Eliminar jeringa
 * @access Private (TODO: Proteger con autenticación y autorización)
 * @param {string} id - ID de la jeringa
 */
router.delete('/:id', JeringaController.delete);

export default router;
