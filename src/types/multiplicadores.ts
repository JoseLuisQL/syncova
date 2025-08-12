/**
 * Tipos para el sistema de multiplicadores de jeringas
 * Permite configurar qué jeringas y en qué cantidades se necesitan para cada vacuna
 */

export interface Jeringa {
  id: string;
  tipo: string;
  capacidad: string;
  color: string;
  estado: 'activo' | 'inactivo';
  createdAt: Date;
  updatedAt: Date;
  // Información adicional incluida en respuestas del backend
  lotes?: {
    id: string;
    numero: string;
    cantidadActual: number;
    estado: string;
    fechaVencimiento?: Date;
  }[];
  _count?: {
    lotes: number;
  };
}

export interface MultiplicadorJeringa {
  id: string;
  vacunaId: string;
  jeringaId: string;
  multiplicador: number; // Cantidad de jeringas por dosis de vacuna
  activo: boolean;
  createdAt: Date;
  updatedAt: Date;
  // Relaciones
  vacuna: {
    id: string;
    nombre: string;
    dosisPorFrasco: number;
  };
  jeringa: {
    id: string;
    tipo: string;
    capacidad: string;
    color: string;
  };
}

export interface CreateMultiplicadorDto {
  vacunaId: string;
  jeringaId: string;
  multiplicador: number;
}

export interface UpdateMultiplicadorDto {
  multiplicador?: number;
  activo?: boolean;
}

export interface MultiplicadorFilters {
  vacunaId?: string;
  jeringaId?: string;
  activo?: boolean;
  search?: string;
  page?: number;
  limit?: number;
}

/**
 * Configuración de multiplicadores para una vacuna específica
 * Usado en el frontend para mostrar y editar la configuración
 */
export interface ConfiguracionMultiplicadores {
  vacunaId: string;
  vacuna: {
    id: string;
    nombre: string;
    dosisPorFrasco: number;
  };
  multiplicadores: MultiplicadorJeringa[];
  jeringasDisponibles: Jeringa[];
}

/**
 * Cálculo de jeringas necesarias para un vale
 * Basado en los multiplicadores configurados
 */
export interface CalculoJeringas {
  vacunaId: string;
  cantidadVacunas: number;
  jeringas: {
    jeringaId: string;
    jeringa: {
      id: string;
      tipo: string;
      capacidad: string;
      color: string;
    };
    cantidadNecesaria: number; // cantidadVacunas * dosisPorFrasco * multiplicador
    multiplicador: number;
  }[];
  totalJeringas: number;
}

/**
 * Resumen de jeringas para el detalle del vale
 * Agrupa todas las jeringas necesarias por tipo
 */
export interface ResumenJeringasVale {
  [jeringaId: string]: {
    jeringa: {
      id: string;
      tipo: string;
      capacidad: string;
      color: string;
    };
    cantidadTotal: number;
    detalleVacunas: {
      vacunaId: string;
      vacunaNombre: string;
      cantidadVacunas: number;
      multiplicador: number;
      cantidadJeringas: number;
    }[];
  };
}

/**
 * Configuración por defecto para multiplicadores
 * Se usa cuando no hay configuración específica para una vacuna
 */
export const MULTIPLICADOR_DEFAULT = 1;

/**
 * Tipos de jeringas más comunes en el sistema
 */
export const TIPOS_JERINGA_COMUNES = [
  'Jeringa autoretractil 1cc 27 G x 1/2"',
  'Jeringa autoretractil 1cc 25 G x 5/8"',
  'Jeringa autoretractil 1cc 25 G x 1"',
  'Jeringa 5cc con aguja 21 G X 1 1/2"',
  'Jeringa 3 mL con aguja 23 G X 1"'
] as const;
