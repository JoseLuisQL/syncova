import { Router } from 'express';
import { ConfiguracionJeringaVacunaController } from '@/controllers/ConfiguracionJeringaVacunaController';

/**
 * Rutas para gestión de configuraciones jeringa-vacuna
 */
const router = Router();

// =====================================================
// RUTAS PARA CONFIGURACIONES POR DEFECTO
// =====================================================

/**
 * @route GET /api/configuracion-jeringa-vacuna/defecto
 * @desc Obtener todas las configuraciones por defecto con filtros opcionales
 * @access Public (TODO: Proteger con autenticación)
 * @query {string} [vacunaId] - ID de la vacuna
 * @query {string} [jeringaId] - ID de la jeringa
 * @query {boolean} [activo] - Estado activo/inactivo
 * @query {string} [search] - Búsqueda por nombre de vacuna o tipo de jeringa
 * @query {number} [page=1] - Número de página
 * @query {number} [limit=100] - Límite de resultados por página
 */
router.get('/defecto', ConfiguracionJeringaVacunaController.getAllDefecto);

/**
 * @route POST /api/configuracion-jeringa-vacuna/defecto
 * @desc Crear nueva configuración por defecto
 * @access Public (TODO: Proteger con autenticación)
 * @body {string} vacunaId - ID de la vacuna (requerido)
 * @body {string} jeringaId - ID de la jeringa (requerido)
 * @body {number} multiplicador - Multiplicador para el cálculo (requerido)
 * @body {number} [prioridad=1] - Prioridad de la configuración
 * @body {boolean} [activo=true] - Estado de la configuración
 */
router.post('/defecto', ConfiguracionJeringaVacunaController.createDefecto);

/**
 * @route PUT /api/configuracion-jeringa-vacuna/defecto/:id
 * @desc Actualizar configuración por defecto
 * @access Public (TODO: Proteger con autenticación)
 * @param {string} id - ID de la configuración
 * @body {number} [multiplicador] - Nuevo multiplicador
 * @body {number} [prioridad] - Nueva prioridad
 * @body {boolean} [activo] - Nuevo estado
 */
router.put('/defecto/:id', ConfiguracionJeringaVacunaController.updateDefecto);

/**
 * @route DELETE /api/configuracion-jeringa-vacuna/defecto/:id
 * @desc Eliminar configuración por defecto
 * @access Public (TODO: Proteger con autenticación)
 * @param {string} id - ID de la configuración
 */
router.delete('/defecto/:id', ConfiguracionJeringaVacunaController.deleteDefecto);

// =====================================================
// RUTAS PARA CONFIGURACIONES POR CENTRO DE ACOPIO
// =====================================================

/**
 * @route GET /api/configuracion-jeringa-vacuna/centro
 * @desc Obtener todas las configuraciones por centro de acopio con filtros opcionales
 * @access Public (TODO: Proteger con autenticación)
 * @query {string} [centroAcopioId] - ID del centro de acopio
 * @query {string} [vacunaId] - ID de la vacuna
 * @query {string} [jeringaId] - ID de la jeringa
 * @query {boolean} [activo] - Estado activo/inactivo
 * @query {string} [search] - Búsqueda por nombre de centro, vacuna o jeringa
 * @query {number} [page=1] - Número de página
 * @query {number} [limit=100] - Límite de resultados por página
 */
router.get('/centro', ConfiguracionJeringaVacunaController.getAllCentro);

/**
 * @route POST /api/configuracion-jeringa-vacuna/centro
 * @desc Crear nueva configuración por centro de acopio
 * @access Public (TODO: Proteger con autenticación)
 * @body {string} centroAcopioId - ID del centro de acopio (requerido)
 * @body {string} vacunaId - ID de la vacuna (requerido)
 * @body {string} jeringaId - ID de la jeringa (requerido)
 * @body {number} multiplicador - Multiplicador para el cálculo (requerido)
 * @body {number} [prioridad=1] - Prioridad de la configuración
 * @body {boolean} [activo=true] - Estado de la configuración
 */
router.post('/centro', ConfiguracionJeringaVacunaController.createCentro);

/**
 * @route PUT /api/configuracion-jeringa-vacuna/centro/:id
 * @desc Actualizar configuración por centro de acopio
 * @access Public (TODO: Proteger con autenticación)
 * @param {string} id - ID de la configuración
 * @body {number} [multiplicador] - Nuevo multiplicador
 * @body {number} [prioridad] - Nueva prioridad
 * @body {boolean} [activo] - Nuevo estado
 */
router.put('/centro/:id', ConfiguracionJeringaVacunaController.updateCentro);

/**
 * @route DELETE /api/configuracion-jeringa-vacuna/centro/:id
 * @desc Eliminar configuración por centro de acopio
 * @access Public (TODO: Proteger con autenticación)
 * @param {string} id - ID de la configuración
 */
router.delete('/centro/:id', ConfiguracionJeringaVacunaController.deleteCentro);

// =====================================================
// RUTAS PARA CÁLCULOS Y CONFIGURACIÓN EFECTIVA
// =====================================================

/**
 * @route GET /api/configuracion-jeringa-vacuna/efectiva/:vacunaId
 * @desc Obtener configuración efectiva para una vacuna (con fallback)
 * @access Public (TODO: Proteger con autenticación)
 * @param {string} vacunaId - ID de la vacuna
 * @query {string} [centroAcopioId] - ID del centro de acopio para configuración específica
 */
router.get('/efectiva/:vacunaId', ConfiguracionJeringaVacunaController.getConfiguracionEfectiva);

/**
 * @route POST /api/configuracion-jeringa-vacuna/calcular
 * @desc Calcular jeringas necesarias para una cantidad de vacunas
 * @access Public (TODO: Proteger con autenticación)
 * @body {string} vacunaId - ID de la vacuna (requerido)
 * @body {number} cantidadVacunas - Cantidad de vacunas (requerido)
 * @body {string} [centroAcopioId] - ID del centro de acopio para configuración específica
 */
router.post('/calcular', ConfiguracionJeringaVacunaController.calcularJeringas);

export default router;
