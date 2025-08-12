import multer from 'multer';
import { Request } from 'express';

/**
 * Configuración de multer para subida de archivos Excel
 */
const storage = multer.memoryStorage();

/**
 * Filtro para validar tipos de archivo
 */
const fileFilter = (req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  // Permitir solo archivos Excel
  if (
    file.mimetype === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' ||
    file.mimetype === 'application/vnd.ms-excel' ||
    file.originalname.endsWith('.xlsx') ||
    file.originalname.endsWith('.xls')
  ) {
    cb(null, true);
  } else {
    cb(new Error('Solo se permiten archivos Excel (.xlsx, .xls)'));
  }
};

/**
 * Configuración de multer para archivos Excel
 */
export const uploadExcel = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB máximo
    files: 1 // Solo un archivo
  }
});

/**
 * Middleware para subir un solo archivo Excel
 */
export const uploadSingleExcel = uploadExcel.single('archivo');

/**
 * Middleware para manejar errores de multer
 */
export const handleUploadError = (error: any, req: Request, res: any, next: any) => {
  if (error instanceof multer.MulterError) {
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        success: false,
        error: 'El archivo es demasiado grande. Máximo 10MB permitido.'
      });
    }
    if (error.code === 'LIMIT_FILE_COUNT') {
      return res.status(400).json({
        success: false,
        error: 'Solo se permite subir un archivo a la vez.'
      });
    }
    if (error.code === 'LIMIT_UNEXPECTED_FILE') {
      return res.status(400).json({
        success: false,
        error: 'Campo de archivo inesperado. Use el campo "archivo".'
      });
    }
  }
  
  if (error.message === 'Solo se permiten archivos Excel (.xlsx, .xls)') {
    return res.status(400).json({
      success: false,
      error: error.message
    });
  }

  next(error);
};
