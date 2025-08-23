// =====================================================
// TIPOS PARA REDES
// =====================================================

export interface Red {
  id: string;
  nombre: string;
  codigo?: string;
  descripcion?: string;
  estado: 'activo' | 'inactivo';
  createdAt: Date;
  updatedAt: Date;
  // Relaciones incluidas en respuestas del backend
  microredes?: Microred[];
  _count?: {
    microredes: number;
    centrosAcopio: number;
    establecimientos: number;
  };
}

export interface CreateRedDto {
  nombre: string;
  codigo?: string;
  descripcion?: string;
}

export interface UpdateRedDto {
  nombre?: string;
  codigo?: string;
  descripcion?: string;
  estado?: 'activo' | 'inactivo';
}

export interface RedFilters {
  estado?: 'activo' | 'inactivo' | 'todos';
  search?: string;
  page?: number;
  limit?: number;
}

// =====================================================
// TIPOS PARA MICROREDES
// =====================================================

export interface Microred {
  id: string;
  nombre: string;
  codigo?: string;
  descripcion?: string;
  redId: string;
  estado: 'activo' | 'inactivo';
  createdAt: Date;
  updatedAt: Date;
  // Relaciones incluidas en respuestas del backend
  red?: Red;
  centrosAcopio?: CentroAcopio[];
  _count?: {
    centrosAcopio: number;
    establecimientos: number;
  };
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
  estado?: 'activo' | 'inactivo';
}

export interface MicroredFilters {
  redId?: string;
  estado?: 'activo' | 'inactivo' | 'todos';
  search?: string;
  page?: number;
  limit?: number;
}

// =====================================================
// TIPOS PARA CENTROS DE ACOPIO
// =====================================================

export interface CentroAcopio {
  id: string;
  nombre: string;
  codigo?: string;
  microredId?: string;
  direccion: string;
  responsable: string;
  telefono?: string;
  estado: 'activo' | 'inactivo';
  createdAt: Date;
  updatedAt: Date;
  // Relaciones incluidas en respuestas del backend
  microred?: Microred;
  establecimientos?: Establecimiento[];
  _count?: {
    establecimientos: number;
  };
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
  estado?: 'activo' | 'inactivo';
}

export interface CentroAcopioFilters {
  microredId?: string;
  redId?: string;
  estado?: 'activo' | 'inactivo' | 'todos';
  search?: string;
  page?: number;
  limit?: number;
}

// =====================================================
// TIPOS PARA ESTABLECIMIENTOS
// =====================================================

export interface Establecimiento {
  id: string;
  nombre: string;
  tipo: 'centro_salud' | 'puesto_salud' | 'hospital';
  codigo: string;
  centroAcopioId: string;
  direccion: string;
  responsable: string;
  telefono?: string;
  estado: 'activo' | 'inactivo';
  createdAt: Date;
  updatedAt: Date;
  // Relación con centro de acopio (incluida en respuestas del backend)
  centroAcopio?: CentroAcopio;
}

// DTOs para el backend
export interface CreateEstablecimientoDto {
  nombre: string;
  tipo: 'centro_salud' | 'puesto_salud' | 'hospital';
  codigo: string;
  centroAcopioId: string;
  direccion: string;
  responsable: string;
  telefono?: string;
}

export interface UpdateEstablecimientoDto {
  nombre?: string;
  tipo?: 'centro_salud' | 'puesto_salud' | 'hospital';
  codigo?: string;
  centroAcopioId?: string;
  direccion?: string;
  responsable?: string;
  telefono?: string;
  estado?: 'activo' | 'inactivo';
}

// Filtros para consultas
export interface EstablecimientoFilters {
  tipo?: 'centro_salud' | 'puesto_salud' | 'hospital';
  estado?: 'activo' | 'inactivo' | 'todos';
  search?: string;
  centroAcopioId?: string;
  microredId?: string;
  redId?: string;
  page?: number;
  limit?: number;
  noPagination?: boolean; // NUEVO: Opción para desactivar paginación
}

export interface Vacuna {
  id: string;
  nombre: string;
  tipo: string;
  presentacion: string;
  dosisPorFrasco: number;
  tiempoVidaUtil: number; // en días
  temperaturaAlmacenamiento: string;
  estado: 'activo' | 'inactivo';
  createdAt: Date;
  updatedAt: Date;
  // Información adicional incluida en respuestas del backend
  lotes?: {
    id: string;
    numero: string;
    cantidadActual: number;
    estado: string;
    fechaVencimiento: Date;
  }[];
  _count?: {
    lotes: number;
    planificaciones: number;
    movimientos: number;
  };
}

// DTOs para el backend
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
  estado?: 'activo' | 'inactivo';
}

// DTOs para el backend - Jeringas
export interface CreateJeringaDto {
  tipo: string;
  capacidad: string;
  color: string;
}

export interface UpdateJeringaDto {
  tipo?: string;
  capacidad?: string;
  color?: string;
  estado?: 'activo' | 'inactivo';
}

// Interfaces para Vales de Entrega
export interface ValeEntrega {
  id: string;
  numero: string;
  centroAcopioId: string;
  mes: number;
  anio: number;
  fechaGeneracion: Date;
  estado: 'generado' | 'impreso' | 'entregado';
  tipoVale?: 'completo' | 'solo_base' | 'solo_adicionales';
  gruposEntregasAdicionales?: string;
  totalVacunas: number;
  totalEstablecimientos: number;
  usuarioId: string;
  observaciones?: string;
  createdAt: Date;
  updatedAt: Date;
  centroAcopio: {
    id: string;
    nombre: string;
    codigo: string;
  };
  usuario: {
    id: string;
    nombres: string;
    apellidos: string;
  };
  detalles: ValeDetalle[];
}

export interface ValeDetalle {
  id: string;
  valeEntregaId: string;
  establecimientoId: string;
  vacunaId: string;
  cantidadProgramada: number;
  cantidadAdicional: number;
  cantidadTotal: number;
  numeroEntregaAdicional?: number;
  createdAt: Date;
  establecimiento: {
    id: string;
    nombre: string;
    codigo: string;
  };
  vacuna: {
    id: string;
    nombre: string;
    presentacion: string;
    dosisPorFrasco: number;
  };
}

// Filtros para consultas
export interface VacunaFilters {
  estado?: 'activo' | 'inactivo' | 'todos';
  search?: string;
  tipo?: string;
  page?: number;
  limit?: number;
}

export interface JeringaFilters {
  estado?: 'activo' | 'inactivo' | 'todos';
  search?: string;
  tipo?: string;
  capacidad?: string;
  color?: string;
  page?: number;
  limit?: number;
}

export interface Lote {
  id: string;
  numero: string;
  vacunaId: string;
  fechaIngreso: Date;
  fechaVencimiento: Date;
  formaIngreso: '1° TRIMESTRE' | '2° TRIMESTRE' | '3° TRIMESTRE' | '4° TRIMESTRE';
  comprobanteClase: 'PECOSA' | 'GUIA' | 'TRASLADO' | 'OTROS';
  numeroComprobante: string;
  cantidadInicial: number;
  cantidadActual: number;
  estado: 'disponible' | 'vencido' | 'agotado';
  observaciones?: string;
  createdAt: Date;
  updatedAt: Date;
  // Información adicional incluida en respuestas del backend
  vacuna?: {
    id: string;
    nombre: string;
    tipo: string;
    presentacion: string;
  };
}

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
  }[];
  _count?: {
    lotes: number;
  };
}

export interface LoteJeringa {
  id: string;
  jeringaId: string;
  numero: string;
  fechaIngreso: Date;
  fechaVencimiento?: Date;
  formaIngreso: '1° TRIMESTRE' | '2° TRIMESTRE' | '3° TRIMESTRE' | '4° TRIMESTRE';
  comprobanteClase: 'PECOSA' | 'GUIA' | 'TRASLADO' | 'OTROS';
  numeroComprobante: string;
  cantidadInicial: number;
  cantidadActual: number;
  estado: 'disponible' | 'agotado';
  observaciones?: string;
  createdAt: Date;
  updatedAt: Date;
  // Información adicional incluida en respuestas del backend
  jeringa?: {
    id: string;
    tipo: string;
    capacidad: string;
    color: string;
  };
}

// DTOs para el backend - Lotes de Vacunas
export interface CreateLoteVacunaDto {
  numero: string;
  vacunaId: string;
  fechaIngreso: string; // ISO string
  fechaVencimiento: string; // ISO string
  formaIngreso: '1° TRIMESTRE' | '2° TRIMESTRE' | '3° TRIMESTRE' | '4° TRIMESTRE';
  comprobanteClase: 'PECOSA' | 'GUIA' | 'TRASLADO' | 'OTROS';
  numeroComprobante: string;
  cantidadInicial: number;
  cantidadActual: number;
  observaciones?: string;
}

export interface UpdateLoteVacunaDto {
  numero?: string;
  fechaIngreso?: string;
  fechaVencimiento?: string;
  formaIngreso?: '1° TRIMESTRE' | '2° TRIMESTRE' | '3° TRIMESTRE' | '4° TRIMESTRE';
  comprobanteClase?: 'PECOSA' | 'GUIA' | 'TRASLADO' | 'OTROS';
  numeroComprobante?: string;
  cantidadInicial?: number;
  cantidadActual?: number;
  estado?: 'disponible' | 'vencido' | 'agotado';
  observaciones?: string;
}

// DTOs para el backend - Lotes de Jeringas
export interface CreateLoteJeringaDto {
  numero: string;
  jeringaId: string;
  fechaIngreso: string; // ISO string
  fechaVencimiento?: string; // ISO string opcional
  formaIngreso: '1° TRIMESTRE' | '2° TRIMESTRE' | '3° TRIMESTRE' | '4° TRIMESTRE';
  comprobanteClase: 'PECOSA' | 'GUIA' | 'TRASLADO' | 'OTROS';
  numeroComprobante: string;
  cantidadInicial: number;
  cantidadActual: number;
  observaciones?: string;
}

export interface UpdateLoteJeringaDto {
  numero?: string;
  fechaIngreso?: string;
  fechaVencimiento?: string;
  formaIngreso?: '1° TRIMESTRE' | '2° TRIMESTRE' | '3° TRIMESTRE' | '4° TRIMESTRE';
  comprobanteClase?: 'PECOSA' | 'GUIA' | 'TRASLADO' | 'OTROS';
  numeroComprobante?: string;
  cantidadInicial?: number;
  cantidadActual?: number;
  estado?: 'disponible' | 'agotado';
  observaciones?: string;
}

// Filtros para consultas de lotes
export interface LoteVacunaFilters {
  estado?: 'disponible' | 'vencido' | 'agotado' | 'todos';
  search?: string;
  vacunaId?: string;
  vencimiento?: 'todos' | 'vigente' | 'por_vencer' | 'vencido';
  page?: number;
  limit?: number;
}

export interface LoteJeringaFilters {
  estado?: 'disponible' | 'agotado' | 'todos';
  search?: string;
  jeringaId?: string;
  page?: number;
  limit?: number;
}

// Estadísticas para lotes
export interface LoteVacunaStats {
  total: number;
  disponibles: number;
  vencidos: number;
  agotados: number;
  porVencer: number;
  stockTotal: number;
}

export interface LoteJeringaStats {
  total: number;
  disponibles: number;
  agotados: number;
  stockBajo: number;
  stockTotal: number;
}

export interface MovimientoVacuna {
  id: string;
  establecimientoId: string;
  vacunaId: string;
  mes: number;
  anio: number; // Cambiado de 'año' a 'anio' para coincidir con backend
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

// Movimiento con relaciones incluidas (para respuestas del backend)
export interface MovimientoConRelaciones extends MovimientoVacuna {
  establecimiento: {
    id: string;
    nombre: string;
    tipo: string;
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
  usuario: {
    id: string;
    nombres: string;
    apellidos: string;
    email: string;
  };
  entregasAdicionales: EntregaAdicional[];
}

// Movimiento calculado con campos derivados (para la tabla)
export interface MovimientoCalculado extends MovimientoConRelaciones {
  totalSaldo: number;
  saldo: number;
  stock: number;
  promedioConsumo: number;
  disponibilidad: number;
  // Campos avanzados para manejo de entregas
  entregaBase?: number;
  entregaTotal?: number;
  totalEntregasAdicionales?: number;
}

// DTOs para operaciones CRUD de movimientos
export interface CreateMovimientoDto {
  establecimientoId: string;
  vacunaId: string;
  mes: number;
  anio: number;
  saldoAnterior?: number;
  transIngreso?: number;
  salida?: number;
  transSalida?: number;
  entrega?: number;
  observaciones?: string;
  fechaMovimiento?: Date;
  usuarioId: string;
}

export interface UpdateMovimientoDto {
  saldoAnterior?: number;
  transIngreso?: number;
  salida?: number;
  transSalida?: number;
  entrega?: number;
  observaciones?: string;
  fechaMovimiento?: Date;
}

// Filtros para movimientos
export interface MovimientosFilters {
  establecimientoId?: string;
  vacunaId?: string;
  mes?: number;
  anio?: number;
  centroAcopioId?: string;
  search?: string;
  page?: number;
  limit?: number;
}

// Entrega adicional
export interface EntregaAdicional {
  id: string;
  movimientoVacunaId: string;
  numeroEntrega: number;
  cantidad: number;
  fechaEntrega: Date;
  motivo?: string;
  usuarioId: string;
  createdAt: Date;
}

export interface CreateEntregaAdicionalDto {
  movimientoVacunaId: string;
  numeroEntrega: number;
  cantidad: number;
  fechaEntrega?: Date;
  motivo?: string;
  usuarioId: string;
}

// Estadísticas de movimientos
export interface MovimientosStats {
  resumen: {
    totalMovimientos: number;
    totalEntregas: number;
    anio: number;
  };
  movimientosPorMes: Array<{
    mes: number;
    cantidad: number;
    entregas: number;
  }>;
  entregasPorVacuna: Array<{
    vacunaId: string;
    entregas: number;
    movimientos: number;
  }>;
  movimientosPorEstablecimiento: Array<{
    establecimientoId: string;
    entregas: number;
    movimientos: number;
  }>;
}

export interface PlanificacionAnual {
  id: string;
  establecimientoId: string;
  vacunaId: string;
  anio: number; // Cambiado de 'año' a 'anio' para coincidir con backend
  metaAnual: number;
  distribucionMensual: number[];
  estado: 'borrador' | 'aprobado' | 'ejecutado';
  createdAt: Date;
  updatedAt: Date;
}

// Planificación con relaciones incluidas (para respuestas del backend)
export interface PlanificacionConRelaciones extends PlanificacionAnual {
  establecimiento: {
    id: string;
    nombre: string;
    tipo: 'centro_acopio' | 'centro_salud' | 'puesto_salud';
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

// DTOs para operaciones CRUD de planificación
export interface CreatePlanificacionDto {
  establecimientoId: string;
  vacunaId: string;
  anio: number;
  metaAnual: number;
  distribucionMensual: number[];
  estado?: 'borrador' | 'aprobado' | 'ejecutado';
}

export interface UpdatePlanificacionDto {
  metaAnual?: number;
  distribucionMensual?: number[];
  estado?: 'borrador' | 'aprobado' | 'ejecutado';
}

// Filtros para búsqueda de planificaciones
export interface PlanificacionFilters {
  establecimientoId?: string;
  vacunaId?: string;
  anio?: number;
  estado?: 'borrador' | 'aprobado' | 'ejecutado' | 'todos';
  centroAcopioId?: string;
  search?: string;
  page?: number;
  limit?: number;
}

// Estadísticas de planificación
export interface PlanificacionStats {
  totalPlanificaciones: number;
  planificacionesPorEstado: {
    borrador: number;
    aprobado: number;
    ejecutado: number;
  };
  totalMetaAnual: number;
  promedioMetaPorEstablecimiento: number;
  vacunasMasPlanificadas: {
    vacunaId: string;
    vacunaNombre: string;
    totalPlanificaciones: number;
    totalMeta: number;
  }[];
  establecimientosConMasPlanificaciones: {
    establecimientoId: string;
    establecimientoNombre: string;
    totalPlanificaciones: number;
    totalMeta: number;
  }[];
}

// DTO para importar planificaciones
export interface ImportarPlanificacionDto {
  vacunaId: string;
  anio: number;
  registros: {
    establecimientoId: string;
    metaAnual: number;
    distribucionMensual: number[];
  }[];
}

// DTO para distribución automática
export interface DistribucionAutomaticaDto {
  vacunaId: string;
  anio: number;
  establecimientoIds: string[];
  criterio: 'uniforme' | 'estacional' | 'poblacional' | 'historico' | 'personalizado';
  parametros?: {
    factorEstacionalidad?: number;
    reservaSeguridad?: number;
    mesesAltos?: number[];
    distribucionPersonalizada?: number[];
  };
}

export interface Usuario {
  id: string;
  nombres: string;
  apellidos: string;
  email: string;
  usuario: string;
  rol: 'administrador' | 'coordinador' | 'responsable_acopio' | 'operador';
  establecimientoId?: string;
  estado: 'activo' | 'inactivo';
  ultimoAcceso?: Date;
  createdAt: Date;
  updatedAt: Date;
  // Información adicional incluida en respuestas del backend
  establecimiento?: {
    id: string;
    nombre: string;
    tipo: string;
  };
}

// DTOs para el backend - Usuarios
export interface CreateUsuarioDto {
  nombres: string;
  apellidos: string;
  email: string;
  usuario: string;
  password: string;
  rol: 'administrador' | 'coordinador' | 'responsable_acopio' | 'operador';
  establecimientoId?: string;
}

export interface UpdateUsuarioDto {
  nombres?: string;
  apellidos?: string;
  email?: string;
  usuario?: string;
  rol?: 'administrador' | 'coordinador' | 'responsable_acopio' | 'operador';
  establecimientoId?: string;
  estado?: 'activo' | 'inactivo';
}

export interface ChangePasswordDto {
  currentPassword?: string;
  newPassword: string;
}

// =====================================================
// TIPOS PARA AUTENTICACIÓN
// =====================================================

export interface LoginDto {
  usuario: string;
  password: string;
}

export interface RefreshTokenDto {
  refreshToken: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresIn: string;
}

export interface AuthUser {
  id: string;
  nombres: string;
  apellidos: string;
  email: string;
  usuario: string;
  rol: 'administrador' | 'coordinador' | 'responsable_acopio' | 'operador';
  establecimientoId?: string;
  estado: 'activo' | 'inactivo';
  ultimoAcceso?: Date;
  createdAt: Date;
  updatedAt: Date;
  establecimiento?: {
    id: string;
    nombre: string;
    tipo: string;
  };
}

export interface AuthResponse {
  success: boolean;
  message: string;
  data: {
    user: AuthUser;
    token: string;
    expiresIn: string;
  };
  timestamp: string;
}

export interface AuthContextType {
  user: AuthUser | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (credentials: LoginDto) => Promise<void>;
  logout: () => void;
  refreshToken: () => Promise<void>;
  changePassword: (data: ChangePasswordDto) => Promise<void>;
}

export interface UsuarioFilters {
  estado?: 'activo' | 'inactivo' | 'todos';
  search?: string;
  rol?: 'administrador' | 'coordinador' | 'responsable_acopio' | 'operador' | 'todos';
  establecimientoId?: string;
  page?: number;
  limit?: number;
}

export interface ValeEntrega {
  id: string;
  numero: string;
  centroAcopioId: string;
  mes: number;
  año: number;
  fechaGeneracion: Date;
  estado: 'generado' | 'impreso' | 'entregado';
  totalVacunas: number;
  usuarioId: string;
  observaciones?: string;
}

export interface ValeDetalleEstablecimiento {
  establecimiento: Establecimiento;
  entregas: {
    vacuna: Vacuna;
    cantidad: number;
    entregasAdicionales: number[];
  }[];
}

export interface ValeDetalle {
  id: string;
  numero: string;
  centroAcopio: Establecimiento;
  mes: number;
  año: number;
  fechaGeneracion: Date;
  establecimientos: ValeDetalleEstablecimiento[];
  totalVacunas: number;
  totalEstablecimientos: number;
  actualizaciones: number;
  ultimaActualizacion?: Date;
}

export interface Kardex {
  id: string;
  tipo: 'vacuna' | 'jeringa';
  itemId: string;
  loteId: string;
  tipoMovimiento: 'ingreso' | 'salida' | 'transferencia' | 'ajuste';
  cantidad: number;
  saldoAnterior: number;
  saldoActual: number;
  establecimientoOrigen?: string;
  establecimientoDestino?: string;
  documento: string;
  numeroDocumento: string;
  observaciones?: string;
  usuarioId: string;
  fechaMovimiento: Date;
}

export interface Alerta {
  id: string;
  tipo: 'vencimiento' | 'stock_bajo' | 'discrepancia' | 'sistema';
  titulo: string;
  descripcion: string;
  nivel: 'info' | 'warning' | 'error' | 'success';
  fechaCreacion: Date;
  fechaVencimiento?: Date;
  leida: boolean;
  usuarioId?: string;
  parametros?: Record<string, any>;
}