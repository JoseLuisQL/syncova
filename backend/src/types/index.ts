import { Request } from 'express';

// =====================================================
// TIPOS BASE DE LA BASE DE DATOS
// =====================================================

export type TipoEstablecimiento = 'centro_salud' | 'puesto_salud' | 'hospital';
export type EstadoGeneral = 'activo' | 'inactivo';
export type EstadoPlanificacion = 'borrador' | 'aprobado' | 'ejecutado';
export type EstadoLote = 'disponible' | 'vencido' | 'agotado';
export type FormaIngreso = 'PRIMER_TRIMESTRE' | 'SEGUNDO_TRIMESTRE' | 'TERCER_TRIMESTRE' | 'CUARTO_TRIMESTRE';
export type ComprobanteClase = 'PECOSA' | 'GUIA' | 'TRASLADO' | 'OTROS';
export type RolUsuario = 'administrador' | 'coordinador' | 'responsable_acopio' | 'operador';
export type TipoMovimientoKardex = 'ingreso' | 'salida' | 'transferencia' | 'ajuste';
export type EstadoVale = 'generado' | 'impreso' | 'entregado';
export type TipoAlerta = 'vencimiento' | 'stock_bajo' | 'discrepancia' | 'sistema';
export type NivelAlerta = 'info' | 'warning' | 'error' | 'success';
export type TipoConfiguracion = 'defecto' | 'centro' | 'sistema';

// =====================================================
// INTERFACES DE ENTIDADES
// =====================================================

export interface IRed {
  id: string;
  nombre: string;
  codigo?: string;
  descripcion?: string;
  estado: EstadoGeneral;
  createdAt: Date;
  updatedAt: Date;
}

export interface IMicrored {
  id: string;
  nombre: string;
  codigo?: string;
  descripcion?: string;
  redId: string;
  estado: EstadoGeneral;
  createdAt: Date;
  updatedAt: Date;
}

export interface ICentroAcopio {
  id: string;
  nombre: string;
  codigo?: string;
  microredId?: string;
  direccion: string;
  responsable: string;
  telefono?: string;
  estado: EstadoGeneral;
  createdAt: Date;
  updatedAt: Date;
}

export interface IEstablecimiento {
  id: string;
  nombre: string;
  tipo: TipoEstablecimiento;
  codigo: string;
  centroAcopioId: string;
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
// TIPOS PARA ENTREGA ADICIONAL
// =====================================================

export interface CreateEntregaAdicionalDto {
  movimientoVacunaId: string;
  numeroEntrega: number;
  cantidad: number;
  fechaEntrega: Date;
  motivo?: string | null;
  usuarioId: string;
}

export interface UpdateEntregaAdicionalDto {
  cantidad?: number;
  fechaEntrega?: Date;
  motivo?: string | null;
}

export interface EntregaAdicionalConRelaciones extends IEntregaAdicional {
  movimientoVacuna?: Partial<IMovimientoVacuna> & { id: string; establecimientoId: string; vacunaId: string };
  usuario?: Partial<IUsuario> & { id: string; nombres: string };
}

// =====================================================
// TIPOS PARA DTOs (Data Transfer Objects)
// =====================================================

export interface CreateRedDto {
  nombre: string;
  codigo?: string;
  descripcion?: string;
}

export interface UpdateRedDto {
  nombre?: string;
  codigo?: string;
  descripcion?: string;
  estado?: EstadoGeneral;
}

export interface CreateMicroredDto {
  nombre: string;
  codigo?: string;
  descripcion?: string;
  redId: string;
}

export interface UpdateMicroredDto {
  nombre?: string;
  codigo?: string;
  descripcion?: string;
  redId?: string;
  estado?: EstadoGeneral;
}

export interface CreateCentroAcopioDto {
  nombre: string;
  codigo?: string;
  microredId?: string;
  direccion: string;
  responsable: string;
  telefono?: string;
}

export interface UpdateCentroAcopioDto {
  nombre?: string;
  codigo?: string;
  microredId?: string;
  direccion?: string;
  responsable?: string;
  telefono?: string;
  estado?: EstadoGeneral;
}

export interface CreateEstablecimientoDto {
  nombre: string;
  tipo: TipoEstablecimiento;
  codigo: string;
  centroAcopioId: string;
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
  rol: string; // Código del rol para buscar en la tabla roles
  centroAcopioId?: string;
}

export interface UpdateUsuarioDto {
  nombres?: string;
  apellidos?: string;
  email?: string;
  usuario?: string;
  rol?: RolUsuario;
  centroAcopioId?: string;
  estado?: EstadoGeneral;
}

export interface ChangePasswordDto {
  currentPassword?: string;
  newPassword: string;
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
  usuarioId?: string; // ID del usuario que realiza la modificación (para registro en Kardex)
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
    centroAcopioId: string;
  };
  vacuna: {
    id: string;
    nombre: string;
    tipo: string;
    presentacion: string;
    dosisPorFrasco: number;
  };
}

// =====================================================
// TIPOS PARA ENTIDADES CON RELACIONES
// =====================================================

export interface RedConRelaciones extends IRed {
  microredes?: MicroredConRelaciones[];
}

export interface MicroredConRelaciones extends IMicrored {
  red?: IRed;
  centrosAcopio?: CentroAcopioConRelaciones[];
}

export interface CentroAcopioConRelaciones extends ICentroAcopio {
  microred?: IMicrored;
  establecimientos?: EstablecimientoConRelaciones[];
}

export interface EstablecimientoConRelaciones extends IEstablecimiento {
  centroAcopio?: ICentroAcopio;
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
    permissions?: string[]; // Códigos de permisos del usuario
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
  message?: string;
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
// INTERFACES DE PROGRAMACIÓN ANUAL CENARES
// =====================================================

export interface IProgramacionAnualCenares {
  id: string;
  vacunaId?: string;
  jeringaId?: string;
  anio: number;
  programadoQ1: number;
  programadoQ2: number;
  programadoQ3: number;
  programadoQ4: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateProgramacionAnualCenaresDto {
  vacunaId?: string;
  jeringaId?: string;
  anio: number;
  programadoQ1?: number;
  programadoQ2?: number;
  programadoQ3?: number;
  programadoQ4?: number;
}

export interface UpdateProgramacionAnualCenaresDto {
  programadoQ1?: number;
  programadoQ2?: number;
  programadoQ3?: number;
  programadoQ4?: number;
}

export interface ProgramacionAnualCenaresFilters {
  anio?: number;
  vacunaId?: string;
  jeringaId?: string;
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
  tipoVale?: 'completo' | 'solo_base' | 'solo_adicionales';
  gruposEntregasAdicionales?: string;
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

// =====================================================
// INTERFACES PARA CONFIGURACIÓN JERINGA-VACUNA
// =====================================================

import type { Decimal } from '@prisma/client/runtime/library';

export interface IConfiguracionJeringaVacunaDefecto {
  id: string;
  vacunaId: string;
  jeringaId: string;
  multiplicador: number | Decimal;
  prioridad: number;
  activo: boolean;
  createdAt: Date;
  updatedAt: Date;
  // Relaciones incluidas en respuestas del backend (partial - solo campos selectos)
  vacuna?: Partial<IVacuna> & Pick<IVacuna, 'id' | 'nombre'>;
  jeringa?: Partial<IJeringa> & Pick<IJeringa, 'id' | 'tipo'>;
}

export interface IConfiguracionJeringaVacunaCentro {
  id: string;
  centroAcopioId: string;
  vacunaId: string;
  jeringaId: string;
  multiplicador: number | Decimal;
  prioridad: number;
  activo: boolean;
  createdAt: Date;
  updatedAt: Date;
  // Relaciones incluidas en respuestas del backend (partial - solo campos selectos)
  centroAcopio?: Partial<ICentroAcopio> & Pick<ICentroAcopio, 'id' | 'nombre'>;
  vacuna?: Partial<IVacuna> & Pick<IVacuna, 'id' | 'nombre'>;
  jeringa?: Partial<IJeringa> & Pick<IJeringa, 'id' | 'tipo'>;
}

export interface CreateConfiguracionDefectoDto {
  vacunaId: string;
  jeringaId: string;
  multiplicador: number;
  prioridad?: number;
  activo?: boolean;
}

export interface UpdateConfiguracionDefectoDto {
  multiplicador?: number;
  prioridad?: number;
  activo?: boolean;
}

export interface CreateConfiguracionCentroDto {
  centroAcopioId: string;
  vacunaId: string;
  jeringaId: string;
  multiplicador: number;
  prioridad?: number;
  activo?: boolean;
}

export interface UpdateConfiguracionCentroDto {
  multiplicador?: number;
  prioridad?: number;
  activo?: boolean;
}

export interface ConfiguracionJeringaVacunaFilters {
  vacunaId?: string;
  jeringaId?: string;
  centroAcopioId?: string;
  activo?: boolean;
  tipo?: TipoConfiguracion;
  search?: string;
  page?: number;
  limit?: number;
}

export interface ConfiguracionCalculada {
  vacunaId: string;
  jeringaId: string;
  multiplicador: number;
  prioridad: number;
  origen: TipoConfiguracion;
  configuracionId: string;
}

export interface JeringasCalculadas {
  jeringaId: string;
  jeringa?: {
    id: string;
    tipo: string;
    capacidad: string;
    color: string;
  };
  cantidad: number;
  multiplicador: number;
  prioridad: number;
  origen: TipoConfiguracion;
}

// =====================================================
// ROLES AND PERMISSIONS INTERFACES
// =====================================================

export interface IRole {
  id: string;
  nombre: string;
  descripcion?: string;
  codigo: string;
  estado: EstadoGeneral;
  esDefault: boolean;
  createdAt: Date;
  updatedAt: Date;
  // Información adicional incluida en respuestas
  _count?: {
    usuarios: number;
    rolePermissions: number;
  };
  permissions?: IPermission[];
}

export interface IPermission {
  id: string;
  nombre: string;
  descripcion?: string;
  codigo: string;
  recurso: string;
  accion: string;
  categoria: string;
  estado: EstadoGeneral;
  createdAt: Date;
  updatedAt: Date;
  // Información adicional incluida en respuestas
  _count?: {
    rolePermissions: number;
  };
}

export interface CreateRoleDto {
  nombre: string;
  descripcion?: string;
  codigo: string;
  estado?: EstadoGeneral;
}

export interface UpdateRoleDto {
  nombre?: string;
  descripcion?: string;
  codigo?: string;
  estado?: EstadoGeneral;
}

export interface CreatePermissionDto {
  nombre: string;
  descripcion?: string;
  codigo: string;
  recurso: string;
  accion: string;
  categoria: string;
  estado?: EstadoGeneral;
}

export interface UpdatePermissionDto {
  nombre?: string;
  descripcion?: string;
  codigo?: string;
  recurso?: string;
  accion?: string;
  categoria?: string;
  estado?: EstadoGeneral;
}

export interface RolePermissionAssignment {
  roleId: string;
  permissionIds: string[];
}
