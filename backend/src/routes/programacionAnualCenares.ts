import { Router } from 'express';
import { ProgramacionAnualCenaresController } from '../controllers/ProgramacionAnualCenaresController';

/**
 * Rutas para programación anual CENARES
 */
const router = Router();

/**
 * @route GET /api/programacion-anual-cenares
 * @desc Obtener todas las programaciones con filtros
 * @access Public (TODO: Proteger con autenticación)
 * @query {number} [anio] - Año de programación
 * @query {string} [vacunaId] - ID de la vacuna
 * @query {string} [jeringaId] - ID de la jeringa
 */
router.get('/', ProgramacionAnualCenaresController.getAll);

/**
 * @route GET /api/programacion-anual-cenares/tabla/:anio
 * @desc Obtener datos completos para la tabla dinámica
 * @access Public (TODO: Proteger con autenticación)
 * @param {number} anio - Año de programación
 */
router.get('/tabla/:anio', ProgramacionAnualCenaresController.getDatosTablaCompleta);

/**
 * @route GET /api/programacion-anual-cenares/:id
 * @desc Obtener programación por ID
 * @access Public (TODO: Proteger con autenticación)
 * @param {string} id - ID de la programación
 */
router.get('/:id', ProgramacionAnualCenaresController.getById);

/**
 * @route POST /api/programacion-anual-cenares
 * @desc Crear nueva programación
 * @access Public (TODO: Proteger con autenticación)
 * @body {CreateProgramacionAnualCenaresDto} - Datos de la programación
 */
router.post('/', ProgramacionAnualCenaresController.create);

/**
 * @route PUT /api/programacion-anual-cenares/:id
 * @desc Actualizar programación existente
 * @access Public (TODO: Proteger con autenticación)
 * @param {string} id - ID de la programación
 * @body {UpdateProgramacionAnualCenaresDto} - Datos a actualizar
 */
router.put('/:id', ProgramacionAnualCenaresController.update);

/**
 * @route DELETE /api/programacion-anual-cenares/:id
 * @desc Eliminar programación
 * @access Public (TODO: Proteger con autenticación)
 * @param {string} id - ID de la programación
 */
router.delete('/:id', ProgramacionAnualCenaresController.delete);

export default router;
