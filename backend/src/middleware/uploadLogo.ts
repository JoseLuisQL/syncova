import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { Request } from 'express';

// Directorio de uploads para logos - usar ruta relativa al directorio de trabajo
const LOGOS_DIR = path.resolve(process.cwd(), 'uploads/logos');

// Asegurar que el directorio existe
if (!fs.existsSync(LOGOS_DIR)) {
  fs.mkdirSync(LOGOS_DIR, { recursive: true });
}

/**
 * Configuración de almacenamiento para logos
 */
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, LOGOS_DIR);
  },
  filename: (req, file, cb) => {
    // Normalizar nombre: logo_institucional.[extension]
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, `logo_institucional${ext}`);
  }
});

/**
 * Filtro para validar tipos de archivo de imagen
 */
const imageFilter = (req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  const allowedMimes = ['image/jpeg', 'image/jpg', 'image/png'];
  const allowedExts = ['.jpg', '.jpeg', '.png'];
  
  const ext = path.extname(file.originalname).toLowerCase();
  const mimeOk = allowedMimes.includes(file.mimetype);
  const extOk = allowedExts.includes(ext);

  if (mimeOk && extOk) {
    cb(null, true);
  } else {
    cb(new Error('Solo se permiten imágenes PNG, JPG o JPEG'));
  }
};

/**
 * Configuración de multer para logos
 */
export const uploadLogo = multer({
  storage,
  fileFilter: imageFilter,
  limits: {
    fileSize: 2 * 1024 * 1024, // 2MB máximo
    files: 1
  }
});

/**
 * Middleware para subir un solo logo
 */
export const uploadSingleLogo = uploadLogo.single('logo');

/**
 * Obtener la ruta del logo actual si existe
 */
export const getLogoPath = (): string | null => {
  const extensions = ['.png', '.jpg', '.jpeg'];
  
  for (const ext of extensions) {
    const filePath = path.join(LOGOS_DIR, `logo_institucional${ext}`);
    if (fs.existsSync(filePath)) {
      return filePath;
    }
  }
  
  return null;
};

/**
 * Eliminar logo existente
 */
export const deleteExistingLogo = (): boolean => {
  const extensions = ['.png', '.jpg', '.jpeg'];
  let deleted = false;
  
  for (const ext of extensions) {
    const filePath = path.join(LOGOS_DIR, `logo_institucional${ext}`);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
      deleted = true;
    }
  }
  
  return deleted;
};

/**
 * Obtener URL relativa del logo
 */
export const getLogoUrl = (): string | null => {
  const logoPath = getLogoPath();
  if (!logoPath) return null;
  
  const filename = path.basename(logoPath);
  return `/uploads/logos/${filename}`;
};

/**
 * Middleware para manejar errores de multer en logos
 */
export const handleLogoUploadError = (error: any, req: Request, res: any, next: any) => {
  if (error instanceof multer.MulterError) {
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        success: false,
        message: 'La imagen es demasiado grande. Máximo 2MB permitido.',
        timestamp: new Date().toISOString()
      });
    }
    if (error.code === 'LIMIT_FILE_COUNT') {
      return res.status(400).json({
        success: false,
        message: 'Solo se permite subir una imagen a la vez.',
        timestamp: new Date().toISOString()
      });
    }
    if (error.code === 'LIMIT_UNEXPECTED_FILE') {
      return res.status(400).json({
        success: false,
        message: 'Campo de archivo inesperado. Use el campo "logo".',
        timestamp: new Date().toISOString()
      });
    }
  }
  
  if (error.message === 'Solo se permiten imágenes PNG, JPG o JPEG') {
    return res.status(400).json({
      success: false,
      message: error.message,
      timestamp: new Date().toISOString()
    });
  }

  next(error);
};
