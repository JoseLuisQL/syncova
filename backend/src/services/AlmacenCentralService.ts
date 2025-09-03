import { prisma } from '@/config/database';
import { ServiceResult } from '@/types';

/**
 * Servicio utilitario para manejar el almacén central (CHANKA)
 * Este servicio proporciona funciones para obtener información del almacén central
 * que se utiliza como establecimiento por defecto en operaciones de Kardex
 */
export class AlmacenCentralService {
  private static readonly ALMACEN_CENTRAL_CODIGO = 'CHANKA-001';
  private static readonly ALMACEN_CENTRAL_ESTABLECIMIENTO_CODIGO = 'CHANKA-EST-001';
  private static readonly ALMACEN_CENTRAL_NOMBRE = 'ALMACÉN (CHANKA)';

  // Cache para evitar consultas repetidas
  private static almacenCentralCache: { id: string; nombre: string } | null = null;

  /**
   * Limpiar cache del almacén central
   * Útil cuando se detecta que los datos han cambiado (ej: después de seeder)
   */
  static limpiarCache(): void {
    console.log('🧹 [AlmacenCentralService] Limpiando cache del almacén central');
    this.almacenCentralCache = null;
  }

  /**
   * Verificar si el establecimiento en cache aún existe en la BD
   * @returns Promise<boolean>
   */
  private static async verificarCacheValido(): Promise<boolean> {
    if (!this.almacenCentralCache) {
      return false;
    }

    try {
      const establecimiento = await prisma.establecimiento.findUnique({
        where: { id: this.almacenCentralCache.id },
        select: { id: true }
      });

      return !!establecimiento;
    } catch (error) {
      console.warn('⚠️ [AlmacenCentralService] Error verificando cache:', error);
      return false;
    }
  }

  /**
   * Obtener el ID del almacén central (CHANKA) como establecimiento para Kardex
   * @returns Promise<ServiceResult<string>> - ID del establecimiento del almacén central
   */
  static async obtenerIdAlmacenCentral(): Promise<ServiceResult<string>> {
    try {
      // Verificar cache primero y validar que aún existe
      if (this.almacenCentralCache) {
        const cacheValido = await this.verificarCacheValido();
        if (cacheValido) {
          console.log(`✅ [AlmacenCentralService] Usando cache válido: ${this.almacenCentralCache.id}`);
          return {
            success: true,
            data: this.almacenCentralCache.id
          };
        } else {
          console.log('🧹 [AlmacenCentralService] Cache inválido detectado, limpiando...');
          this.limpiarCache();
        }
      }

      // Buscar directamente el establecimiento de ALMACÉN (CHANKA)
      const establecimientoAlmacen = await prisma.establecimiento.findUnique({
        where: { codigo: this.ALMACEN_CENTRAL_ESTABLECIMIENTO_CODIGO },
        select: { id: true, nombre: true }
      });

      if (establecimientoAlmacen) {
        // Guardar en cache
        this.almacenCentralCache = {
          id: establecimientoAlmacen.id,
          nombre: establecimientoAlmacen.nombre
        };

        console.log(`✅ [AlmacenCentralService] Establecimiento ALMACÉN (CHANKA) encontrado: ${establecimientoAlmacen.nombre} (${establecimientoAlmacen.id})`);

        return {
          success: true,
          data: establecimientoAlmacen.id
        };
      }

      // Si no existe el establecimiento, intentar crearlo automáticamente
      console.log('🔄 [AlmacenCentralService] Establecimiento no encontrado, intentando crear/recuperar...');
      const crearResult = await this.garantizarAlmacenCentral();

      if (!crearResult.success) {
        return crearResult;
      }

      // Buscar nuevamente el establecimiento después de garantizar su existencia
      const establecimientoAlmacenNuevo = await prisma.establecimiento.findUnique({
        where: { codigo: this.ALMACEN_CENTRAL_ESTABLECIMIENTO_CODIGO },
        select: { id: true, nombre: true }
      });

      if (!establecimientoAlmacenNuevo) {
        console.error(`❌ [AlmacenCentralService] No se pudo crear/encontrar el establecimiento ALMACÉN (CHANKA)`);
        return {
          success: false,
          error: `No se pudo crear/encontrar el establecimiento ${this.ALMACEN_CENTRAL_NOMBRE}`
        };
      }

      // Guardar en cache
      this.almacenCentralCache = {
        id: establecimientoAlmacenNuevo.id,
        nombre: establecimientoAlmacenNuevo.nombre
      };

      console.log(`✅ [AlmacenCentralService] Establecimiento ALMACÉN (CHANKA) creado/recuperado: ${establecimientoAlmacenNuevo.nombre} (${establecimientoAlmacenNuevo.id})`);

      return {
        success: true,
        data: establecimientoAlmacenNuevo.id
      };

      // Si tiene establecimientos asociados, usar el primero
      let establecimientoId = almacenCentral.id; // Por defecto usar el ID del centro de acopio

      if (almacenCentral.establecimientos && almacenCentral.establecimientos.length > 0) {
        establecimientoId = almacenCentral.establecimientos[0].id;
        console.log(`✅ [AlmacenCentralService] Usando establecimiento asociado: ${establecimientoId}`);
      } else {
        console.log(`ℹ️ [AlmacenCentralService] Usando centro de acopio como establecimiento: ${establecimientoId}`);
      }

      // Guardar en cache
      this.almacenCentralCache = {
        id: establecimientoId,
        nombre: almacenCentral.nombre
      };

      console.log(`✅ [AlmacenCentralService] Almacén central encontrado: ${almacenCentral.nombre} (${establecimientoId})`);

      return {
        success: true,
        data: establecimientoId
      };
    } catch (error) {
      console.error('❌ [AlmacenCentralService] Error al obtener ID del almacén central:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Error al obtener almacén central'
      };
    }
  }

  /**
   * Obtener información completa del almacén central
   * @returns Promise<ServiceResult<{id: string, nombre: string}>>
   */
  static async obtenerAlmacenCentral(): Promise<ServiceResult<{ id: string; nombre: string }>> {
    try {
      // Verificar cache primero
      if (this.almacenCentralCache) {
        return {
          success: true,
          data: this.almacenCentralCache
        };
      }

      // Buscar el almacén central
      const almacenCentral = await prisma.centroAcopio.findUnique({
        where: { codigo: this.ALMACEN_CENTRAL_CODIGO },
        select: { id: true, nombre: true }
      });

      if (!almacenCentral) {
        return {
          success: false,
          error: `Almacén central ${this.ALMACEN_CENTRAL_NOMBRE} no encontrado en el sistema`
        };
      }

      // Guardar en cache
      this.almacenCentralCache = {
        id: almacenCentral.id,
        nombre: almacenCentral.nombre
      };

      return {
        success: true,
        data: this.almacenCentralCache
      };
    } catch (error) {
      console.error('❌ [AlmacenCentralService] Error al obtener almacén central:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Error al obtener almacén central'
      };
    }
  }

  /**
   * Verificar si existe el almacén central en el sistema
   * @returns Promise<ServiceResult<boolean>>
   */
  static async verificarExistenciaAlmacenCentral(): Promise<ServiceResult<boolean>> {
    try {
      const almacenCentral = await prisma.centroAcopio.findUnique({
        where: { codigo: this.ALMACEN_CENTRAL_CODIGO },
        select: { id: true }
      });

      return {
        success: true,
        data: !!almacenCentral
      };
    } catch (error) {
      console.error('❌ [AlmacenCentralService] Error al verificar existencia del almacén central:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Error al verificar almacén central'
      };
    }
  }

  /**
   * Limpiar cache del almacén central
   * Útil cuando se actualiza la información del almacén central
   */
  static limpiarCache(): void {
    this.almacenCentralCache = null;
    console.log('🧹 [AlmacenCentralService] Cache del almacén central limpiado');
  }

  /**
   * Crear el almacén central si no existe (para uso en migraciones/seeders)
   * @returns Promise<ServiceResult<string>> - ID del almacén central creado o existente
   */
  static async crearAlmacenCentralSiNoExiste(): Promise<ServiceResult<string>> {
    try {
      // Verificar si ya existe
      const existeResult = await this.verificarExistenciaAlmacenCentral();
      if (!existeResult.success) {
        return existeResult as ServiceResult<string>;
      }

      if (existeResult.data) {
        // Ya existe, obtener su ID
        const idResult = await this.obtenerIdAlmacenCentral();
        return idResult;
      }

      // No existe, crearlo
      const almacenCentral = await prisma.centroAcopio.create({
        data: {
          nombre: this.ALMACEN_CENTRAL_NOMBRE,
          codigo: this.ALMACEN_CENTRAL_CODIGO,
          direccion: 'Almacén Central, Apurímac',
          responsable: 'Administrador Central',
          telefono: '083-400000'
        }
      });

      // Actualizar cache
      this.almacenCentralCache = {
        id: almacenCentral.id,
        nombre: almacenCentral.nombre
      };

      console.log(`✅ [AlmacenCentralService] Almacén central creado: ${almacenCentral.nombre} (${almacenCentral.id})`);

      return {
        success: true,
        data: almacenCentral.id
      };
    } catch (error) {
      console.error('❌ [AlmacenCentralService] Error al crear almacén central:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Error al crear almacén central'
      };
    }
  }

  /**
   * Garantizar que existe el almacén central completo (centro de acopio + establecimiento)
   * Crea ambos si no existen
   * @returns Promise<ServiceResult<string>> - ID del establecimiento del almacén central
   */
  static async garantizarAlmacenCentral(): Promise<ServiceResult<string>> {
    try {
      console.log('🔄 [AlmacenCentralService] Garantizando existencia del almacén central...');

      // 1. Verificar/crear centro de acopio
      let centroAcopio = await prisma.centroAcopio.findUnique({
        where: { codigo: this.ALMACEN_CENTRAL_CODIGO },
        select: { id: true, nombre: true }
      });

      if (!centroAcopio) {
        console.log('📦 [AlmacenCentralService] Creando centro de acopio ALMACÉN (CHANKA)...');
        centroAcopio = await prisma.centroAcopio.create({
          data: {
            nombre: this.ALMACEN_CENTRAL_NOMBRE,
            codigo: this.ALMACEN_CENTRAL_CODIGO,
            direccion: 'Almacén Central, Apurímac',
            responsable: 'Administrador Central',
            telefono: '083-400000'
          },
          select: { id: true, nombre: true }
        });
        console.log(`✅ [AlmacenCentralService] Centro de acopio creado: ${centroAcopio.id}`);
      } else {
        console.log(`✅ [AlmacenCentralService] Centro de acopio encontrado: ${centroAcopio.id}`);
      }

      // 2. Verificar/crear establecimiento
      let establecimiento = await prisma.establecimiento.findUnique({
        where: { codigo: this.ALMACEN_CENTRAL_ESTABLECIMIENTO_CODIGO },
        select: { id: true, nombre: true }
      });

      if (!establecimiento) {
        console.log('🏥 [AlmacenCentralService] Creando establecimiento ALMACÉN (CHANKA)...');
        establecimiento = await prisma.establecimiento.create({
          data: {
            nombre: this.ALMACEN_CENTRAL_NOMBRE,
            tipo: 'hospital',
            codigo: this.ALMACEN_CENTRAL_ESTABLECIMIENTO_CODIGO,
            centroAcopioId: centroAcopio.id,
            direccion: 'Almacén Central, Apurímac',
            responsable: 'Administrador Central',
            telefono: '083-400000',
            estado: 'activo'
          },
          select: { id: true, nombre: true }
        });
        console.log(`✅ [AlmacenCentralService] Establecimiento creado: ${establecimiento.id}`);
      } else {
        console.log(`✅ [AlmacenCentralService] Establecimiento encontrado: ${establecimiento.id}`);
      }

      // 3. Actualizar cache
      this.almacenCentralCache = {
        id: establecimiento.id,
        nombre: establecimiento.nombre
      };

      console.log(`✅ [AlmacenCentralService] Almacén central garantizado: ${establecimiento.nombre} (${establecimiento.id})`);

      return {
        success: true,
        data: establecimiento.id
      };
    } catch (error) {
      console.error('❌ [AlmacenCentralService] Error al garantizar almacén central:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Error al garantizar almacén central'
      };
    }
  }
}
