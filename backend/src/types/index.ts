import { Request } from 'express';

// =====================================================
// TIPOS BASE DE LA BASE DE DATOS
// =====================================================

export type TipoEstablecimiento = 'centro_acopio' | 'centro_salud' | 'puesto_salud';
export type EstadoGeneral = 'activo' | 'inactivo';
export type EstadoPlanificacion = 'borrador' | 'aprobado' | 'ejecutado';
export type EstadoLote = 'disponible' | 'vencido' | 'agotado';
export type FormaIngreso = '1° TRIMESTRE' | '2° TRIMESTRE' | '3° TRIMESTRE' | '4° TRIMESTRE';
export type ComprobanteClase = 'PECOSA' | 'GUIA' | 'TRASLADO' | 'OTROS';
export type RolUsuario = 'administrador' | 'coordinador' | 'responsable_acopio' | 'operador';
export type TipoMovimientoKardex = 'ingreso' | 'salida' | 'transferencia' | 'ajuste';
export type EstadoVale = 'generado' | 'impreso' | 'entregado';
export type TipoAlerta = 'vencimiento' | 'stock_bajo' | 'discrepancia' | 'sistema';
export type NivelAlerta = 'info' | 'warning' | 'error' | 'success';

// =====================================================
// INTERFACES DE ENTIDADES
// =====================================================

export interface IEstablecimiento {
  id: string;
  nombre: string;
  tipo: TipoEstablecimiento;
  codigo: string;
  centroAcopioId?: string;
  direccion: string;
  responsable: string;
  telefono?: string;
  estado: EstadoGeneral;
  createdAt: Date;
  updatedAt: Date;
}

export interface IVacuna {
  id: string;
  nombre: string;
  tipo: string;
  presentacion: string;
  dosisPorFrasco: number;
  tiempoVidaUtil: number;
  temperaturaAlmacenamiento: string;
  estado: EstadoGeneral;
  createdAt: Date;
  updatedAt: Date;
}

export interface IJeringa {
  id: string;
  tipo: string;
  capacidad: string;
  color: string;
  estado: EstadoGeneral;
  createdAt: Date;
  updatedAt: Date;
}

export interface ILoteVacuna {
  id: string;
  numero: string;
  vacunaId: string;
  fechaIngreso: Date;
  fechaVencimiento: Date;
  formaIngreso: FormaIngreso;
  comprobanteClase: ComprobanteClase;
  numeroComprobante: string;
  cantidadInicial: number;
  cantidadActual: number;
  estado: EstadoLote;
  observaciones?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface ILoteJeringa {
  id: string;
  numero: string;
  jeringaId: string;
  fechaIngreso: Date;
  fechaVencimiento?: Date;
  formaIngreso: FormaIngreso;
  comprobanteClase: ComprobanteClase;
  numeroComprobante: string;
  cantidadInicial: number;
  cantidadActual: number;
  estado: EstadoLote;
  observaciones?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface IUsuario {
  id: string;
  nombres: string;
  apellidos: string;
  email: string;
  usuario: string;
  passwordHash: string;
  rol: RolUsuario;
  establecimientoId?: string;
  estado: EstadoGeneral;
  ultimoAcceso?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface IPlanificacionAnual {
  id: string;
  establecimientoId: string;
  vacunaId: string;
  anio: number;
  metaAnual: number;
  distribucionMensual: number[];
  estado: EstadoPlanificacion;
  createdAt: Date;
  updatedAt: Date;
}

export interface IMovimientoVacuna {
  id: string;
  establecimientoId: string;
  vacunaId: string;
  mes: number;
  anio: number;
  saldoAnterior: number;
  transIngreso: number;
  salida: number;
  transSalida: number;
  entrega: number;
  entregaBase?: number | null; // Valor base de planificación (null = usar entrega)
  observaciones?: string;
  fechaMovimiento: Date;
  usuarioId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface IEntregaAdicional {
  id: string;
  movimientoVacunaId: string;
  numeroEntrega: number;
  cantidad: number;
  fechaEntrega: Date;
  motivo?: string | null;
  usuarioId: string;
  createdAt: Date;
  updatedAt?: Date;
}

export interface IAlerta {
  id: string;
  tipo: TipoAlerta;
  titulo: string;
  descripcion: string;
  nivel: NivelAlerta;
  fechaCreacion: Date;
  fechaVencimiento?: Date;
  leida: boolean;
  usuarioId?: string;
  parametros?: any;
  createdAt: Date;
  updatedAt: Date;
}

// =====================================================
// TIPOS PARA DTOs (Data Transfer Objects)
// =====================================================

export interface CreateEstablecimientoDto {
  nombre: string;
  tipo: TipoEstablecimiento;
  codigo: string;
  centroAcopioId?: string;
  direccion: string;
  responsable: string;
  telefono?: string;
}

export interface UpdateEstablecimientoDto {
  nombre?: string;
  tipo?: TipoEstablecimiento;
  codigo?: string;
  centroAcopioId?: string;
  direccion?: string;
  responsable?: string;
  telefono?: string;
  estado?: EstadoGeneral;
}

export interface CreateVacunaDto {
  nombre: string;
  tipo: string;
  presentacion: string;
  dosisPorFrasco: number;
  tiempoVidaUtil: number;
  temperaturaAlmacenamiento: string;
}

export interface UpdateVacunaDto {
  nombre?: string;
  tipo?: string;
  presentacion?: string;
  dosisPorFrasco?: number;
  tiempoVidaUtil?: number;
  temperaturaAlmacenamiento?: string;
  estado?: EstadoGeneral;
}

export interface CreateJeringaDto {
  tipo: string;
  capacidad: string;
  color: string;
}

export interface UpdateJeringaDto {
  tipo?: string;
  capacidad?: string;
  color?: string;
  estado?: EstadoGeneral;
}

export interface CreateUsuarioDto {
  nombres: string;
  apellidos: string;
  email: string;
  usuario: string;
  password: string;
  rol: RolUsuario;
  establecimientoId?: string;
}

export interface UpdateUsuarioDto {
  nombres?: string;
  apellidos?: string;
  email?: string;
  usuario?: string;
  rol?: RolUsuario;
  establecimientoId?: string;
  estado?: EstadoGeneral;
}

export interface ChangePasswordDto {
  currentPassword?: string;
  newPassword: string;
}

export interface CreateUsuarioDto {
  nombres: string;
  apellidos: string;
  email: string;
  usuario: string;
  password: string;
  rol: RolUsuario;
  establecimientoId?: string;
}

export interface UpdateUsuarioDto {
  nombres?: string;
  apellidos?: string;
  email?: string;
  usuario?: string;
  password?: string;
  rol?: RolUsuario;
  establecimientoId?: string;
  estado?: EstadoGeneral;
}

export interface CreateLoteVacunaDto {
  numero: string;
  vacunaId: string;
  fechaIngreso: Date;
  fechaVencimiento: Date;
  formaIngreso: FormaIngreso;
  comprobanteClase: ComprobanteClase;
  numeroComprobante: string;
  cantidadInicial: number;
  cantidadActual: number;
  observaciones?: string;
}

export interface UpdateLoteVacunaDto {
  numero?: string;
  fechaIngreso?: Date;
  fechaVencimiento?: Date;
  formaIngreso?: FormaIngreso;
  comprobanteClase?: ComprobanteClase;
  numeroComprobante?: string;
  cantidadInicial?: number;
  cantidadActual?: number;
  estado?: EstadoLote;
  observaciones?: string;
}

export interface CreateLoteJeringaDto {
  numero: string;
  jeringaId: string;
  fechaIngreso: Date;
  fechaVencimiento?: Date;
  formaIngreso: FormaIngreso;
  comprobanteClase: ComprobanteClase;
  numeroComprobante: string;
  cantidadInicial: number;
  cantidadActual: number;
  observaciones?: string;
}

export interface UpdateLoteJeringaDto {
  numero?: string;
  fechaIngreso?: Date;
  fechaVencimiento?: Date;
  formaIngreso?: FormaIngreso;
  comprobanteClase?: ComprobanteClase;
  numeroComprobante?: string;
  cantidadInicial?: number;
  cantidadActual?: number;
  estado?: EstadoLote;
  observaciones?: string;
}

// =====================================================
// TIPOS PARA PLANIFICACIÓN ANUAL
// =====================================================

export interface CreatePlanificacionDto {
  establecimientoId: string;
  vacunaId: string;
  anio: number;
  metaAnual: number;
  distribucionMensual: number[];
  estado?: EstadoPlanificacion;
}

export interface UpdatePlanificacionDto {
  metaAnual?: number;
  distribucionMensual?: number[];
  estado?: EstadoPlanificacion;
}

export interface PlanificacionFilters {
  establecimientoId?: string;
  vacunaId?: string;
  anio?: number;
  estado?: EstadoPlanificacion | 'todos';
  centroAcopioId?: string;
  search?: string;
  page?: number;
  limit?: number;
}

export interface PlanificacionConRelaciones extends IPlanificacionAnual {
  establecimiento: {
    id: string;
    nombre: string;
    tipo: TipoEstablecimiento;
    codigo: string;
    centroAcopioId?: string;
  };
  vacuna: {
    id: string;
    nombre: string;
    tipo: string;
    presentacion: string;
    dosisPorFrasco: number;
  };
}

export interface EstadisticasPlanificacion {
  totalPlanificaciones: number;
  totalMetaAnual: number;
  planificacionesPorEstado: {
    borrador: number;
    aprobado: number;
    ejecutado: number;
  };
  planificacionesPorVacuna: {
    vacunaId: string;
    vacunaNombre: string;
    totalPlanificaciones: number;
    metaTotal: number;
  }[];
  planificacionesPorEstablecimiento: {
    establecimientoId: string;
    establecimientoNombre: string;
    totalPlanificaciones: number;
    metaTotal: number;
  }[];
}

export interface ImportarPlanificacionDto {
  vacunaId: string;
  anio: number;
  registros: {
    establecimientoId: string;
    metaAnual: number;
    distribucionMensual: number[];
  }[];
}

export interface DistribucionAutomaticaDto {
  vacunaId: string;
  anio: number;
  criterio: 'uniforme' | 'estacional' | 'poblacional' | 'historico';
  establecimientosIds?: string[];
  centroAcopioId?: string;
  factorEstacionalidad?: number;
  reservaSeguridad?: number;
}

export interface LoginDto {
  usuario: string;
  password: string;
}

export interface RefreshTokenDto {
  refreshToken: string;
}

// =====================================================
// TIPOS PARA RESPUESTAS DE API
// =====================================================

export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  error?: string;
  timestamp: string;
}

export interface PaginatedResponse<T = any> {
  success: boolean;
  message: string;
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
  timestamp: string;
}

export interface AuthResponse {
  success: boolean;
  message: string;
  data: {
    user: Omit<IUsuario, 'passwordHash'>;
    token: string;
    expiresIn: string;
  };
  timestamp: string;
}

// =====================================================
// TIPOS PARA MIDDLEWARE Y REQUEST
// =====================================================

export interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    usuario: string;
    rol: RolUsuario;
    establecimientoId?: string;
  };
}

export interface QueryParams {
  page?: string;
  limit?: string;
  search?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  filter?: string;
}

// =====================================================
// TIPOS PARA VALIDACIÓN
// =====================================================

export interface ValidationError {
  field: string;
  message: string;
  value?: any;
}

export interface ServiceResult<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  errors?: ValidationError[];
}

// =====================================================
// TIPOS PARA REPORTES Y ESTADÍSTICAS
// =====================================================

export interface StockVacuna {
  vacunaId: string;
  vacunaNombre: string;
  stockTotal: number;
  totalLotes: number;
  lotesDisponibles: number;
  lotesPorVencer: number;
}

export interface MovimientoCalculado extends IMovimientoVacuna {
  totalSaldo: number;
  saldo: number;
  stock: number;
  promedioConsumo: number;
  disponibilidad: number;
  establecimientoNombre: string;
  vacunaNombre: string;
}

export interface EstadisticasDashboard {
  totalEstablecimientos: number;
  totalVacunas: number;
  totalUsuarios: number;
  alertasPendientes: number;
  stockCritico: number;
  vencimientoProximo: number;
}

// =====================================================
// TIPOS PARA CONFIGURACIÓN
// =====================================================

export interface ConfiguracionSistema {
  id: string;
  clave: string;
  valor: string;
  descripcion?: string;
  tipoDato: string;
  categoria: string;
  esPublico: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// =====================================================
// INTERFACES DE VALES DE ENTREGA
// =====================================================

export interface IValeEntrega {
  id: string;
  numero: string;
  centroAcopioId: string;
  mes: number;
  anio: number;
  fechaGeneracion: Date;
  estado: EstadoVale;
  totalVacunas: number;
  totalEstablecimientos: number;
  usuarioId: string;
  observaciones?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface IValeDetalle {
  id: string;
  valeEntregaId: string;
  establecimientoId: string;
  vacunaId: string;
  cantidadProgramada: number;
  cantidadAdicional: number;
  numeroEntregaAdicional?: number;
  createdAt: Date;
}
