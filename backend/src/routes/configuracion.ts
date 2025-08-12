import { Router } from 'express';
import { ConfiguracionController } from '@/controllers/ConfiguracionController';
import { authenticate, authorize, checkPermissions } from '@/middleware/auth';
import { validate, validateUUID, sanitizeInput } from '@/middleware/validation';
import { ValidationUtil } from '@/utils/validation';
import Joi from 'joi';

const router = Router();

// Esquemas de validación específicos para configuración
const createConfigSchema = Joi.object({
  clave: Joi.string().trim().min(3).max(100).required()
    .pattern(/^[a-zA-Z0-9_]+$/)
    .messages({
      'string.pattern.base': 'La clave solo puede contener letras, números y guiones bajos',
    }),
  valor: Joi.string().trim().max(1000).required(),
  descripcion: Joi.string().trim().max(500).optional(),
  tipoDato: Joi.string().valid('string', 'number', 'boolean', 'json').default('string'),
  categoria: Joi.string().trim().min(2).max(50).default('general'),
  esPublico: Joi.boolean().default(false),
});

const updateConfigSchema = Joi.object({
  valor: Joi.string().trim().max(1000).optional(),
  descripcion: Joi.string().trim().max(500).optional(),
  tipoDato: Joi.string().valid('string', 'number', 'boolean', 'json').optional(),
  categoria: Joi.string().trim().min(2).max(50).optional(),
  esPublico: Joi.boolean().optional(),
}).min(1);

const updateValueSchema = Joi.object({
  valor: Joi.string().trim().max(1000).required(),
});

const bulkUpdateSchema = Joi.object({
  configuraciones: Joi.array().items(
    Joi.object({
      clave: Joi.string().trim().min(3).max(100).required(),
      valor: Joi.string().trim().max(1000).required(),
    })
  ).min(1).max(50).required(),
});

const claveParamSchema = Joi.object({
  clave: Joi.string().trim().min(3).max(100).required()
    .pattern(/^[a-zA-Z0-9_]+$/),
});

const categoriaParamSchema = Joi.object({
  categoria: Joi.string().trim().min(2).max(50).required(),
});

// =====================================================
// RUTAS PÚBLICAS (sin autenticación)
// =====================================================

/**
 * @route GET /api/configuracion/public
 * @desc Obtener configuraciones públicas
 * @access Public
 */
router.get('/public', 
  sanitizeInput,
  ConfiguracionController.getPublicConfigurations
);

/**
 * @route GET /api/configuracion/sistema/info
 * @desc Obtener información del sistema
 * @access Public
 */
router.get('/sistema/info',
  sanitizeInput,
  ConfiguracionController.getSystemInfo
);

/**
 * @route GET /api/configuracion/categorias
 * @desc Obtener categorías disponibles
 * @access Public
 */
router.get('/categorias',
  sanitizeInput,
  ConfiguracionController.getCategories
);

// =====================================================
// RUTAS PROTEGIDAS (requieren autenticación)
// =====================================================

// Middleware de autenticación para todas las rutas siguientes
router.use(authenticate);

/**
 * @route GET /api/configuracion
 * @desc Obtener todas las configuraciones
 * @access Private (Administrador)
 */
router.get('/',
  authorize(['administrador']),
  checkPermissions('read:configuracion'),
  sanitizeInput,
  ConfiguracionController.getAllConfigurations
);

/**
 * @route GET /api/configuracion/:clave
 * @desc Obtener configuración por clave
 * @access Private (Administrador, Coordinador)
 */
router.get('/:clave',
  authorize(['administrador', 'coordinador']),
  checkPermissions('read:configuracion'),
  sanitizeInput,
  validate(claveParamSchema),
  ConfiguracionController.getByKey
);

/**
 * @route GET /api/configuracion/categoria/:categoria
 * @desc Obtener configuraciones por categoría
 * @access Private (Administrador, Coordinador)
 */
router.get('/categoria/:categoria',
  authorize(['administrador', 'coordinador']),
  checkPermissions('read:configuracion'),
  sanitizeInput,
  validate(categoriaParamSchema),
  ConfiguracionController.getByCategory
);

/**
 * @route POST /api/configuracion
 * @desc Crear nueva configuración
 * @access Private (Administrador)
 */
router.post('/',
  authorize(['administrador']),
  checkPermissions('write:configuracion'),
  sanitizeInput,
  validate(createConfigSchema),
  ConfiguracionController.create
);

/**
 * @route PUT /api/configuracion/:id
 * @desc Actualizar configuración completa
 * @access Private (Administrador)
 */
router.put('/:id',
  authorize(['administrador']),
  checkPermissions('write:configuracion'),
  sanitizeInput,
  validateUUID('id'),
  validate(updateConfigSchema),
  ConfiguracionController.update
);

/**
 * @route PATCH /api/configuracion/:clave/valor
 * @desc Actualizar solo el valor de una configuración por clave
 * @access Private (Administrador)
 */
router.patch('/:clave/valor',
  authorize(['administrador']),
  checkPermissions('write:configuracion'),
  sanitizeInput,
  validate(claveParamSchema),
  validate(updateValueSchema),
  ConfiguracionController.updateByKey
);

/**
 * @route PUT /api/configuracion/bulk
 * @desc Actualizar múltiples configuraciones
 * @access Private (Administrador)
 */
router.put('/bulk',
  authorize(['administrador']),
  checkPermissions('write:configuracion'),
  sanitizeInput,
  validate(bulkUpdateSchema),
  ConfiguracionController.bulkUpdate
);

/**
 * @route DELETE /api/configuracion/:id
 * @desc Eliminar configuración
 * @access Private (Administrador)
 */
router.delete('/:id',
  authorize(['administrador']),
  checkPermissions('delete:configuracion'),
  sanitizeInput,
  validateUUID('id'),
  ConfiguracionController.delete
);

// =====================================================
// MIDDLEWARE DE VALIDACIÓN PERSONALIZADA
// =====================================================

/**
 * Middleware para validar que el tipo de dato coincida con el valor
 */
const validateDataType = (req: any, res: any, next: any) => {
  const { valor, tipoDato } = req.body;
  
  if (!valor || !tipoDato) {
    return next();
  }

  try {
    switch (tipoDato) {
      case 'number':
        if (isNaN(parseFloat(valor))) {
          return res.status(400).json({
            success: false,
            message: 'El valor debe ser un número válido',
            timestamp: new Date().toISOString(),
          });
        }
        break;
      
      case 'boolean':
        if (!['true', 'false', '1', '0'].includes(valor.toLowerCase())) {
          return res.status(400).json({
            success: false,
            message: 'El valor debe ser true, false, 1 o 0',
            timestamp: new Date().toISOString(),
          });
        }
        break;
      
      case 'json':
        try {
          JSON.parse(valor);
        } catch {
          return res.status(400).json({
            success: false,
            message: 'El valor debe ser un JSON válido',
            timestamp: new Date().toISOString(),
          });
        }
        break;
    }
    
    next();
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: 'Error de validación de tipo de dato',
      timestamp: new Date().toISOString(),
    });
  }
};

// Aplicar validación de tipo de dato a rutas que lo necesiten
router.use('/', validateDataType);

export default router;
