import { Router } from 'express';
import { LoteJeringaController } from '@/controllers/LoteJeringaController';

/**
 * Rutas para gestión de lotes de jeringas
 */
const router = Router();

/**
 * @route GET /api/lotes-jeringas/stats
 * @desc Obtener estadísticas de lotes de jeringas
 * @access Privado (requiere autenticación)
 */
router.get('/stats', LoteJeringaController.getStats);

/**
 * @route GET /api/lotes-jeringas/stock-bajo
 * @desc Obtener lotes con stock bajo
 * @access Privado (requiere autenticación)
 * @query {number} [porcentaje=20] - Porcentaje para considerar stock bajo
 */
router.get('/stock-bajo', LoteJeringaController.getStockBajo);

/**
 * @route GET /api/lotes-jeringas/jeringa/:jeringaId
 * @desc Obtener lotes por jeringa específica
 * @access Privado (requiere autenticación)
 * @param {string} jeringaId - ID de la jeringa
 */
router.get('/jeringa/:jeringaId', LoteJeringaController.getByJeringa);

/**
 * @route GET /api/lotes-jeringas
 * @desc Obtener todos los lotes de jeringas con filtros opcionales
 * @access Privado (requiere autenticación)
 * @query {string} [estado] - Estado del lote (disponible, vencido, agotado, todos)
 * @query {string} [search] - Búsqueda por número de lote o comprobante
 * @query {string} [jeringaId] - Filtro por jeringa específica
 * @query {number} [page=1] - Número de página
 * @query {number} [limit=1000] - Límite de resultados por página
 */
router.get('/', LoteJeringaController.getAll);

/**
 * @route GET /api/lotes-jeringas/:id
 * @desc Obtener lote de jeringa por ID
 * @access Privado (requiere autenticación)
 * @param {string} id - ID del lote de jeringa
 */
router.get('/:id', LoteJeringaController.getById);

/**
 * @route POST /api/lotes-jeringas
 * @desc Crear nuevo lote de jeringa
 * @access Privado (requiere autenticación + permisos)
 * @body {CreateLoteJeringaDto} data - Datos del lote de jeringa
 */
router.post('/', LoteJeringaController.create);

/**
 * @route PUT /api/lotes-jeringas/:id
 * @desc Actualizar lote de jeringa
 * @access Privado (requiere autenticación + permisos)
 * @param {string} id - ID del lote de jeringa
 * @body {UpdateLoteJeringaDto} data - Datos a actualizar
 */
router.put('/:id', LoteJeringaController.update);

/**
 * @route DELETE /api/lotes-jeringas/:id
 * @desc Eliminar lote de jeringa
 * @access Privado (requiere autenticación + permisos)
 * @param {string} id - ID del lote de jeringa
 */
router.delete('/:id', LoteJeringaController.delete);

export default router;
