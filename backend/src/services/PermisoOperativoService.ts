import { prisma } from '@/config/database';

// Tipos de permisos operativos
export const TIPOS_PERMISO = {
  MOVIMIENTOS_EDICION: 'movimientos_edicion',
  PLANIFICACION_EDICION: 'planificacion_edicion',
  EXPORTAR_EXCEL: 'exportar_excel',
} as const;

export type TipoPermisoOperativo = typeof TIPOS_PERMISO[keyof typeof TIPOS_PERMISO];

interface TogglePermisoDto {
  tipo: TipoPermisoOperativo;
  mes: number;
  anio: number;
  habilitado: boolean;
  usuarioId?: string | null; // null = aplica a todos
  programado?: boolean;
  fechaActivacion?: Date | null;
  fechaDesactivacion?: Date | null;
  creadoPorId: string;
}

interface UsuarioConPermisos {
  id: string;
  nombres: string;
  apellidos: string;
  usuario: string;
  email: string;
  estado: string;
  centroAcopio: { id: string; nombre: string } | null;
  centrosAcopioAsignados: Array<{ centroAcopio: { id: string; nombre: string } }>;
  permisos: {
    movimientos_edicion: PermisoInfo;
    planificacion_edicion: PermisoInfo;
    exportar_excel: PermisoInfo;
  };
}

interface PermisoInfo {
  habilitado: boolean;
  programado: boolean;
  fechaActivacion: Date | null;
  fechaDesactivacion: Date | null;
  esGlobal: boolean; // true si viene de un permiso sin usuarioId
}

interface PermisosGlobales {
  movimientos_edicion: PermisoInfo;
  planificacion_edicion: PermisoInfo;
  exportar_excel: PermisoInfo;
}

export class PermisoOperativoService {

  /**
   * Listar todos los responsables de acopio con sus permisos para un mes/año
   */
  static async getResponsablesConPermisos(
    mes: number,
    anio: number,
  ): Promise<{ usuarios: UsuarioConPermisos[]; globales: PermisosGlobales }> {
    // Obtener usuarios responsables de acopio activos
    const usuarios = await prisma.usuario.findMany({
      where: {
        rol: 'responsable_acopio',
        estado: 'activo',
      },
      select: {
        id: true,
        nombres: true,
        apellidos: true,
        usuario: true,
        email: true,
        estado: true,
        centroAcopio: { select: { id: true, nombre: true } },
        centrosAcopioAsignados: {
          select: {
            centroAcopio: { select: { id: true, nombre: true } },
          },
        },
      },
      orderBy: [{ apellidos: 'asc' }, { nombres: 'asc' }],
    });

    // Obtener todos los permisos para el período
    const permisos = await prisma.permisoOperativo.findMany({
      where: { mes, anio },
    });

    // Separar permisos globales (sin usuarioId) e individuales
    const permisosGlobalesDb = permisos.filter(p => p.usuarioId === null);
    const permisosIndividualesDb = permisos.filter(p => p.usuarioId !== null);

    // Construir permisos globales
    const buildPermisoInfo = (
      tipo: TipoPermisoOperativo,
      list: typeof permisos,
      esGlobal: boolean,
    ): PermisoInfo => {
      const permiso = list.find(p => p.tipo === tipo);
      return {
        habilitado: permiso?.habilitado ?? false,
        programado: permiso?.programado ?? false,
        fechaActivacion: permiso?.fechaActivacion ?? null,
        fechaDesactivacion: permiso?.fechaDesactivacion ?? null,
        esGlobal,
      };
    };

    const globales: PermisosGlobales = {
      movimientos_edicion: buildPermisoInfo(TIPOS_PERMISO.MOVIMIENTOS_EDICION, permisosGlobalesDb, true),
      planificacion_edicion: buildPermisoInfo(TIPOS_PERMISO.PLANIFICACION_EDICION, permisosGlobalesDb, true),
      exportar_excel: buildPermisoInfo(TIPOS_PERMISO.EXPORTAR_EXCEL, permisosGlobalesDb, true),
    };

    // Construir respuesta por usuario
    const usuariosConPermisos: UsuarioConPermisos[] = usuarios.map(u => {
      const permisosUsuario = permisosIndividualesDb.filter(p => p.usuarioId === u.id);

      const getPermisoEfectivo = (tipo: TipoPermisoOperativo): PermisoInfo => {
        const individual = permisosUsuario.find(p => p.tipo === tipo);
        if (individual) {
          return {
            habilitado: individual.habilitado,
            programado: individual.programado,
            fechaActivacion: individual.fechaActivacion,
            fechaDesactivacion: individual.fechaDesactivacion,
            esGlobal: false,
          };
        }
        // Heredar del global
        return globales[tipo as keyof PermisosGlobales];
      };

      return {
        id: u.id,
        nombres: u.nombres,
        apellidos: u.apellidos,
        usuario: u.usuario,
        email: u.email,
        estado: u.estado,
        centroAcopio: u.centroAcopio,
        centrosAcopioAsignados: u.centrosAcopioAsignados,
        permisos: {
          movimientos_edicion: getPermisoEfectivo(TIPOS_PERMISO.MOVIMIENTOS_EDICION),
          planificacion_edicion: getPermisoEfectivo(TIPOS_PERMISO.PLANIFICACION_EDICION),
          exportar_excel: getPermisoEfectivo(TIPOS_PERMISO.EXPORTAR_EXCEL),
        },
      };
    });

    return { usuarios: usuariosConPermisos, globales };
  }

  /**
   * Activar/desactivar un permiso operativo
   */
  static async togglePermiso(dto: TogglePermisoDto) {
    const { tipo, mes, anio, habilitado, usuarioId, programado, fechaActivacion, fechaDesactivacion, creadoPorId } = dto;

    const data = {
      habilitado: programado ? false : habilitado,
      programado: programado ?? false,
      fechaActivacion: fechaActivacion ?? null,
      fechaDesactivacion: fechaDesactivacion ?? null,
      creadoPorId,
    };

    // Prisma no soporta null en unique where de upsert, usar findFirst + create/update
    const existing = await prisma.permisoOperativo.findFirst({
      where: {
        tipo,
        usuarioId: usuarioId ?? null,
        mes,
        anio,
      },
    });

    if (existing) {
      return prisma.permisoOperativo.update({
        where: { id: existing.id },
        data,
      });
    }

    return prisma.permisoOperativo.create({
      data: {
        tipo,
        usuarioId: usuarioId ?? null,
        mes,
        anio,
        ...data,
      },
    });
  }

  /**
   * Verificar si un usuario tiene un permiso habilitado
   */
  static async verificarPermiso(
    usuarioId: string,
    tipo: TipoPermisoOperativo,
    mes: number,
    anio: number,
  ): Promise<boolean> {
    // Primero verificar permiso individual
    const individual = await prisma.permisoOperativo.findFirst({
      where: { tipo, usuarioId, mes, anio, habilitado: true },
    });

    if (individual) return true;

    // Verificar permiso global
    const global = await prisma.permisoOperativo.findFirst({
      where: { tipo, usuarioId: null, mes, anio, habilitado: true },
    });

    // Solo aplicar global si no hay individual que lo sobreescriba
    if (global) {
      const individualOverride = await prisma.permisoOperativo.findFirst({
        where: { tipo, usuarioId, mes, anio },
      });
      // Si no hay override individual, el global aplica
      if (!individualOverride) return true;
    }

    return false;
  }

  /**
   * Obtener todos los permisos activos de un usuario para un período
   */
  static async getPermisosUsuario(
    usuarioId: string,
    mes: number,
    anio: number,
  ): Promise<Record<string, boolean>> {
    const tipos = Object.values(TIPOS_PERMISO);
    const result: Record<string, boolean> = {};

    for (const tipo of tipos) {
      result[tipo] = await this.verificarPermiso(usuarioId, tipo, mes, anio);
    }

    return result;
  }

  /**
   * Procesar permisos programados: activar/desactivar según fechas
   */
  static async procesarPermisosProgramados(): Promise<{ activados: number; desactivados: number }> {
    const ahora = new Date();
    let activados = 0;
    let desactivados = 0;

    // Activar permisos programados cuya fecha de activación ya pasó
    const porActivar = await prisma.permisoOperativo.findMany({
      where: {
        programado: true,
        habilitado: false,
        fechaActivacion: { lte: ahora },
      },
    });

    for (const permiso of porActivar) {
      await prisma.permisoOperativo.update({
        where: { id: permiso.id },
        data: { habilitado: true, programado: !!permiso.fechaDesactivacion },
      });
      activados++;
    }

    // Desactivar permisos cuya fecha de desactivación ya pasó
    const porDesactivar = await prisma.permisoOperativo.findMany({
      where: {
        habilitado: true,
        fechaDesactivacion: { lte: ahora, not: null },
      },
    });

    for (const permiso of porDesactivar) {
      await prisma.permisoOperativo.update({
        where: { id: permiso.id },
        data: { habilitado: false, programado: false },
      });
      desactivados++;
    }

    return { activados, desactivados };
  }
}
