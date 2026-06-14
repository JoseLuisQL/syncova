import { Router } from 'express';
import { LoteVacunaController } from '@/controllers/LoteVacunaController';
import { authenticate } from '@/middleware/auth';

/**
 * Rutas para gestión de lotes de vacunas
 */
const router = Router();

/**
 * @route GET /api/lotes-vacunas/stats
 * @desc Obtener estadísticas de lotes de vacunas
 * @access Privado (requiere autenticación)
 */
router.get('/stats', LoteVacunaController.getStats);

/**
 * @route GET /api/lotes-vacunas/proximos-vencer
 * @desc Obtener lotes próximos a vencer
 * @access Privado (requiere autenticación)
 * @query {number} [dias=30] - Número de días para considerar próximo a vencer
 */
router.get('/proximos-vencer', LoteVacunaController.getProximosAVencer);

/**
 * @route GET /api/lotes-vacunas/vacuna/:vacunaId
 * @desc Obtener lotes por vacuna específica
 * @access Privado (requiere autenticación)
 * @param {string} vacunaId - ID de la vacuna
 */
router.get('/vacuna/:vacunaId', LoteVacunaController.getByVacuna);

/**
 * @route GET /api/lotes-vacunas
 * @desc Obtener todos los lotes de vacunas con filtros opcionales
 * @access Privado (requiere autenticación)
 * @query {string} [estado] - Estado del lote (disponible, vencido, agotado, todos)
 * @query {string} [search] - Búsqueda por número de lote o comprobante
 * @query {string} [vacunaId] - Filtro por vacuna específica
 * @query {string} [vencimiento] - Filtro por vencimiento (todos, vigente, por_vencer, vencido)
 * @query {number} [page=1] - Número de página
 * @query {number} [limit=1000] - Límite de resultados por página
 */
router.get('/', LoteVacunaController.getAll);

/**
 * @route GET /api/lotes-vacunas/:id
 * @desc Obtener lote de vacuna por ID
 * @access Privado (requiere autenticación)
 * @param {string} id - ID del lote de vacuna
 */
router.get('/:id', LoteVacunaController.getById);

/**
 * @route POST /api/lotes-vacunas
 * @desc Crear nuevo lote de vacuna
 * @access Privado (requiere autenticación + permisos)
 * @body {CreateLoteVacunaDto} data - Datos del lote de vacuna
 */
router.post('/', LoteVacunaController.create);

/**
 * @route PUT /api/lotes-vacunas/:id
 * @desc Actualizar lote de vacuna
 * @access Private - Requiere autenticación para registro en Kardex
 * @param {string} id - ID del lote de vacuna
 * @body {UpdateLoteVacunaDto} data - Datos a actualizar
 */
router.put('/:id', authenticate, LoteVacunaController.update);

/**
 * @route DELETE /api/lotes-vacunas/:id
 * @desc Eliminar lote de vacuna
 * @access Privado (requiere autenticación + permisos)
 * @param {string} id - ID del lote de vacuna
 */
router.delete('/:id', LoteVacunaController.delete);

export default router;
