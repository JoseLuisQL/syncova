import { PrismaClient } from '@prisma/client';
import { 
  IProgramacionAnualCenares, 
  CreateProgramacionAnualCenaresDto, 
  UpdateProgramacionAnualCenaresDto,
  ProgramacionAnualCenaresFilters,
  ServiceResult 
} from '../types';

const prisma = new PrismaClient();

/**
 * Servicio para gestión de programación anual CENARES
 * Maneja la programación trimestral de vacunas y jeringas
 */
export class ProgramacionAnualCenaresService {
  
  /**
   * Obtener todas las programaciones con filtros
   */
  static async getAll(filters: ProgramacionAnualCenaresFilters = {}): Promise<ServiceResult<IProgramacionAnualCenares[]>> {
    try {
      const where: any = {};
      
      if (filters.anio) {
        where.anio = filters.anio;
      }
      
      if (filters.vacunaId) {
        where.vacunaId = filters.vacunaId;
      }
      
      if (filters.jeringaId) {
        where.jeringaId = filters.jeringaId;
      }

      const programaciones = await prisma.programacionAnualCenares.findMany({
        where,
        include: {
          vacuna: {
            select: {
              id: true,
              nombre: true,
              tipo: true,
              presentacion: true
            }
          },
          jeringa: {
            select: {
              id: true,
              tipo: true,
              capacidad: true,
              color: true
            }
          }
        },
        orderBy: [
          { anio: 'desc' },
          { vacuna: { nombre: 'asc' } },
          { jeringa: { tipo: 'asc' } }
        ]
      });

      return {
        success: true,
        data: programaciones as IProgramacionAnualCenares[]
      };
    } catch (error) {
      console.error('Error al obtener programaciones CENARES:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Error al obtener programaciones CENARES'
      };
    }
  }

  /**
   * Obtener programación por ID
   */
  static async getById(id: string): Promise<ServiceResult<IProgramacionAnualCenares>> {
    try {
      const programacion = await prisma.programacionAnualCenares.findUnique({
        where: { id },
        include: {
          vacuna: {
            select: {
              id: true,
              nombre: true,
              tipo: true,
              presentacion: true
            }
          },
          jeringa: {
            select: {
              id: true,
              tipo: true,
              capacidad: true,
              color: true
            }
          }
        }
      });

      if (!programacion) {
        return {
          success: false,
          error: 'Programación no encontrada'
        };
      }

      return {
        success: true,
        data: programacion as IProgramacionAnualCenares
      };
    } catch (error) {
      console.error('Error al obtener programación CENARES:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Error al obtener programación CENARES'
      };
    }
  }

  /**
   * Crear nueva programación
   */
  static async create(data: CreateProgramacionAnualCenaresDto): Promise<ServiceResult<IProgramacionAnualCenares>> {
    try {
      // Validaciones
      if (!data.vacunaId && !data.jeringaId) {
        return {
          success: false,
          error: 'Debe especificar vacunaId o jeringaId'
        };
      }

      if (data.vacunaId && data.jeringaId) {
        return {
          success: false,
          error: 'No puede especificar tanto vacunaId como jeringaId'
        };
      }

      if (!data.anio || data.anio < 2020 || data.anio > 2050) {
        return {
          success: false,
          error: 'El año debe estar entre 2020 y 2050'
        };
      }

      // Verificar si ya existe una programación para el mismo ítem y año
      const existingProgramacion = await prisma.programacionAnualCenares.findFirst({
        where: {
          anio: data.anio,
          ...(data.vacunaId ? { vacunaId: data.vacunaId } : { jeringaId: data.jeringaId })
        }
      });

      if (existingProgramacion) {
        return {
          success: false,
          error: 'Ya existe una programación para este ítem en el año especificado'
        };
      }

      const programacion = await prisma.programacionAnualCenares.create({
        data: {
          vacunaId: data.vacunaId || null,
          jeringaId: data.jeringaId || null,
          anio: data.anio,
          programadoQ1: data.programadoQ1 || 0,
          programadoQ2: data.programadoQ2 || 0,
          programadoQ3: data.programadoQ3 || 0,
          programadoQ4: data.programadoQ4 || 0
        },
        include: {
          vacuna: {
            select: {
              id: true,
              nombre: true,
              tipo: true,
              presentacion: true
            }
          },
          jeringa: {
            select: {
              id: true,
              tipo: true,
              capacidad: true,
              color: true
            }
          }
        }
      });

      return {
        success: true,
        data: programacion as IProgramacionAnualCenares
      };
    } catch (error) {
      console.error('Error al crear programación CENARES:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Error al crear programación CENARES'
      };
    }
  }

  /**
   * Actualizar programación existente
   */
  static async update(id: string, data: UpdateProgramacionAnualCenaresDto): Promise<ServiceResult<IProgramacionAnualCenares>> {
    try {
      // Verificar que la programación existe
      const existingProgramacion = await prisma.programacionAnualCenares.findUnique({
        where: { id }
      });

      if (!existingProgramacion) {
        return {
          success: false,
          error: 'Programación no encontrada'
        };
      }

      const programacion = await prisma.programacionAnualCenares.update({
        where: { id },
        data: {
          ...(data.programadoQ1 !== undefined && { programadoQ1: data.programadoQ1 }),
          ...(data.programadoQ2 !== undefined && { programadoQ2: data.programadoQ2 }),
          ...(data.programadoQ3 !== undefined && { programadoQ3: data.programadoQ3 }),
          ...(data.programadoQ4 !== undefined && { programadoQ4: data.programadoQ4 }),
          updatedAt: new Date()
        },
        include: {
          vacuna: {
            select: {
              id: true,
              nombre: true,
              tipo: true,
              presentacion: true
            }
          },
          jeringa: {
            select: {
              id: true,
              tipo: true,
              capacidad: true,
              color: true
            }
          }
        }
      });

      return {
        success: true,
        data: programacion as IProgramacionAnualCenares
      };
    } catch (error) {
      console.error('Error al actualizar programación CENARES:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Error al actualizar programación CENARES'
      };
    }
  }

  /**
   * Eliminar programación
   */
  static async delete(id: string): Promise<ServiceResult<boolean>> {
    try {
      const existingProgramacion = await prisma.programacionAnualCenares.findUnique({
        where: { id }
      });

      if (!existingProgramacion) {
        return {
          success: false,
          error: 'Programación no encontrada'
        };
      }

      await prisma.programacionAnualCenares.delete({
        where: { id }
      });

      return {
        success: true,
        data: true
      };
    } catch (error) {
      console.error('Error al eliminar programación CENARES:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Error al eliminar programación CENARES'
      };
    }
  }

  /**
   * Obtener datos completos para la tabla dinámica de programación y seguimiento
   */
  static async getDatosTablaCompleta(anio: number): Promise<ServiceResult<any>> {
    try {
      // Obtener todas las vacunas activas ordenadas alfabéticamente
      const vacunas = await prisma.vacuna.findMany({
        where: { estado: 'activo' },
        orderBy: { nombre: 'asc' },
        select: {
          id: true,
          nombre: true,
          tipo: true,
          presentacion: true
        }
      });

      // Obtener todas las jeringas activas ordenadas alfabéticamente
      const jeringas = await prisma.jeringa.findMany({
        where: { estado: 'activo' },
        orderBy: { tipo: 'asc' },
        select: {
          id: true,
          tipo: true,
          capacidad: true,
          color: true
        }
      });

      // Obtener programaciones existentes para el año
      const programaciones = await prisma.programacionAnualCenares.findMany({
        where: { anio },
        include: {
          vacuna: {
            select: {
              id: true,
              nombre: true,
              tipo: true,
              presentacion: true
            }
          },
          jeringa: {
            select: {
              id: true,
              tipo: true,
              capacidad: true,
              color: true
            }
          }
        }
      });

      // Crear mapa de programaciones por ítem
      const programacionesMap = new Map();
      programaciones.forEach(prog => {
        const key = prog.vacunaId || prog.jeringaId;
        if (key) {
          programacionesMap.set(key, prog);
        }
      });

      // Obtener saldo del año anterior (Q4)
      const saldosAnteriores = await this.obtenerSaldosAnoAnterior(anio - 1);

      // AJUSTE ESPECIAL PARA AÑO 2025: Sobrescribir saldos 2024 con valores estáticos
      // Esto es necesario porque los datos históricos de 2024 no pueden modificarse en la base de datos
      // y se requieren valores específicos para que los cálculos de 2025 sean correctos
      if (anio === 2025) {
        await this.aplicarSaldos2024Estaticos(saldosAnteriores, vacunas, jeringas);
      }

      // Obtener entregas CENARES por trimestre
      const entregasCenares = await this.obtenerEntregasCenaresPorTrimestre(anio);

      // Obtener datos de consumo de planificación
      const consumoPlanificacion = await this.obtenerConsumoPlanificacion(anio);

      // Construir datos de la tabla
      const datosTabla = [];

      // Agregar vacunas
      for (const vacuna of vacunas) {
        const programacion = programacionesMap.get(vacuna.id);
        const saldoAnterior = saldosAnteriores.get(vacuna.id) || 0;
        const entregas = entregasCenares.get(vacuna.id) || { q1: 0, q2: 0, q3: 0, q4: 0 };
        const consumo = consumoPlanificacion.get(vacuna.id) || { q1: 0, q2: 0, q3: 0, q4: 0 };

        datosTabla.push({
          id: vacuna.id,
          tipo: 'vacuna',
          descripcion: vacuna.nombre,
          saldoAnterior,
          programacion: programacion ? {
            id: programacion.id,
            q1: programacion.programadoQ1,
            q2: programacion.programadoQ2,
            q3: programacion.programadoQ3,
            q4: programacion.programadoQ4
          } : {
            id: null,
            q1: 0,
            q2: 0,
            q3: 0,
            q4: 0
          },
          entregas,
          consumo,
          // Calcular saldos secuenciales
          saldos: this.calcularSaldosSecuenciales(saldoAnterior, entregas, consumo)
        });
      }

      // Agregar jeringas
      for (const jeringa of jeringas) {
        const programacion = programacionesMap.get(jeringa.id);
        const saldoAnterior = saldosAnteriores.get(jeringa.id) || 0;
        const entregas = entregasCenares.get(jeringa.id) || { q1: 0, q2: 0, q3: 0, q4: 0 };
        const consumo = consumoPlanificacion.get(jeringa.id) || { q1: 0, q2: 0, q3: 0, q4: 0 };

        datosTabla.push({
          id: jeringa.id,
          tipo: 'jeringa',
          descripcion: `${jeringa.tipo} - ${jeringa.capacidad}`,
          saldoAnterior,
          programacion: programacion ? {
            id: programacion.id,
            q1: programacion.programadoQ1,
            q2: programacion.programadoQ2,
            q3: programacion.programadoQ3,
            q4: programacion.programadoQ4
          } : {
            id: null,
            q1: 0,
            q2: 0,
            q3: 0,
            q4: 0
          },
          entregas,
          consumo,
          // Calcular saldos secuenciales
          saldos: this.calcularSaldosSecuenciales(saldoAnterior, entregas, consumo)
        });
      }

      return {
        success: true,
        data: {
          anio,
          items: datosTabla,
          resumen: {
            totalVacunas: vacunas.length,
            totalJeringas: jeringas.length,
            totalItems: datosTabla.length,
            programacionesExistentes: programaciones.length
          }
        }
      };
    } catch (error) {
      console.error('Error al obtener datos de tabla completa:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Error al obtener datos de tabla completa'
      };
    }
  }

  /**
   * Obtener saldos del año anterior (Q4)
   */
  private static async obtenerSaldosAnoAnterior(anioAnterior: number): Promise<Map<string, number>> {
    const saldosMap = new Map<string, number>();

    try {
      // Obtener todas las programaciones del año anterior
      const programacionesAnoAnterior = await prisma.programacionAnualCenares.findMany({
        where: { anio: anioAnterior },
        include: {
          vacuna: true,
          jeringa: true
        }
      });

      // Si no hay programaciones del año anterior, retornar mapa vacío
      if (programacionesAnoAnterior.length === 0) {
        return saldosMap;
      }

      // Obtener entregas CENARES del año anterior
      const entregasAnoAnterior = await this.obtenerEntregasCenaresPorTrimestre(anioAnterior);

      // Obtener consumo de planificación del año anterior
      const consumoAnoAnterior = await this.obtenerConsumoPlanificacion(anioAnterior);

      // Calcular saldo Q4 para cada ítem del año anterior
      for (const programacion of programacionesAnoAnterior) {
        const itemId = programacion.vacunaId || programacion.jeringaId;
        if (!itemId) continue;

        // Obtener entregas y consumo para este ítem
        const entregas = entregasAnoAnterior.get(itemId) || { q1: 0, q2: 0, q3: 0, q4: 0 };
        const consumo = consumoAnoAnterior.get(itemId) || { q1: 0, q2: 0, q3: 0, q4: 0 };

        // Calcular saldo inicial del año anterior (recursivamente)
        let saldoInicialAnoAnterior = 0;
        if (anioAnterior > 2020) { // Evitar recursión infinita
          const saldosAnoAnteriorAnterior = await this.obtenerSaldosAnoAnterior(anioAnterior - 1);
          saldoInicialAnoAnterior = saldosAnoAnteriorAnterior.get(itemId) || 0;
        }

        // Calcular saldos secuenciales del año anterior
        const saldosAnoAnterior = this.calcularSaldosSecuenciales(
          saldoInicialAnoAnterior,
          entregas,
          consumo
        );

        // El saldo anterior para el año actual es el Q4 del año anterior
        saldosMap.set(itemId, saldosAnoAnterior.q4);
      }

      // También necesitamos calcular saldos para ítems que no tenían programación
      // pero sí tenían entregas o consumo en el año anterior
      const todasVacunas = await prisma.vacuna.findMany({ where: { estado: 'activo' } });
      const todasJeringas = await prisma.jeringa.findMany({ where: { estado: 'activo' } });

      // Procesar vacunas sin programación
      for (const vacuna of todasVacunas) {
        if (!saldosMap.has(vacuna.id)) {
          const entregas = entregasAnoAnterior.get(vacuna.id) || { q1: 0, q2: 0, q3: 0, q4: 0 };
          const consumo = consumoAnoAnterior.get(vacuna.id) || { q1: 0, q2: 0, q3: 0, q4: 0 };



          // Si hay entregas o consumo, calcular saldo
          if (entregas.q1 + entregas.q2 + entregas.q3 + entregas.q4 > 0 ||
              consumo.q1 + consumo.q2 + consumo.q3 + consumo.q4 > 0) {



            let saldoInicialAnoAnterior = 0;
            if (anioAnterior > 2020) {
              const saldosAnoAnteriorAnterior = await this.obtenerSaldosAnoAnterior(anioAnterior - 1);
              saldoInicialAnoAnterior = saldosAnoAnteriorAnterior.get(vacuna.id) || 0;
            }

            const saldosAnoAnterior = this.calcularSaldosSecuenciales(
              saldoInicialAnoAnterior,
              entregas,
              consumo
            );


            saldosMap.set(vacuna.id, saldosAnoAnterior.q4);
          }
        }
      }

      // Procesar jeringas sin programación
      for (const jeringa of todasJeringas) {
        if (!saldosMap.has(jeringa.id)) {
          const entregas = entregasAnoAnterior.get(jeringa.id) || { q1: 0, q2: 0, q3: 0, q4: 0 };
          const consumo = consumoAnoAnterior.get(jeringa.id) || { q1: 0, q2: 0, q3: 0, q4: 0 };

          // Si hay entregas o consumo, calcular saldo
          if (entregas.q1 + entregas.q2 + entregas.q3 + entregas.q4 > 0 ||
              consumo.q1 + consumo.q2 + consumo.q3 + consumo.q4 > 0) {

            let saldoInicialAnoAnterior = 0;
            if (anioAnterior > 2020) {
              const saldosAnoAnteriorAnterior = await this.obtenerSaldosAnoAnterior(anioAnterior - 1);
              saldoInicialAnoAnterior = saldosAnoAnteriorAnterior.get(jeringa.id) || 0;
            }

            const saldosAnoAnterior = this.calcularSaldosSecuenciales(
              saldoInicialAnoAnterior,
              entregas,
              consumo
            );

            saldosMap.set(jeringa.id, saldosAnoAnterior.q4);
          }
        }
      }

      return saldosMap;
    } catch (error) {
      console.error('Error al obtener saldos año anterior:', error);
      return saldosMap;
    }
  }

  /**
   * Aplicar saldos estáticos de 2024 para el año 2025
   * Este método sobrescribe los saldos calculados con valores fijos necesarios
   * para ajustar los cálculos del año 2025 debido a que los datos históricos
   * de 2024 no pueden modificarse en la base de datos.
   */
  private static async aplicarSaldos2024Estaticos(
    saldosMap: Map<string, number>,
    vacunas: any[],
    jeringas: any[]
  ): Promise<void> {
    try {
      // Mapeo de nombres de vacunas a valores de saldo 2024
      // Los nombres deben coincidir exactamente con las siglas en la base de datos
      const saldos2024: { [key: string]: number } = {
        'AMA': 152,
        'APO': 0,
        'BCG': 250,
        'DPT': 199,
        'DPTA': 318,
        'Dt Adulto': 0,
        'Dt Pediatrico': 2,
        'HEPATITIS A': 0,
        'HVB Adulto': 0,
        'HVB Pediatrico': 84,
        'Influenza Adulto': 0,
        'Influenza Pediatrica': 0,
        'IPV': 1252,
        'Neumococo': 1208,
        'Pentavalente': 716,
        'Rotavirus': 494,
        'SPR X 1 DOSIS': 0,
        'SPR X 5 DOSIS': 0,
        'Varicela': 262,
        'VPH': 389
      };

      // Aplicar saldos estáticos a las vacunas que coincidan
      for (const vacuna of vacunas) {
        const nombreVacuna = vacuna.nombre.trim();

        // Buscar coincidencia exacta (case-sensitive primero)
        if (saldos2024.hasOwnProperty(nombreVacuna)) {
          saldosMap.set(vacuna.id, saldos2024[nombreVacuna]);
          console.log(`✅ Saldo 2024 estático aplicado para ${nombreVacuna}: ${saldos2024[nombreVacuna]}`);
        } else {
          // Intentar coincidencia case-insensitive
          const nombreNormalizado = nombreVacuna.toUpperCase().trim();
          let encontrado = false;

          for (const [nombreSaldo, valor] of Object.entries(saldos2024)) {
            const nombreSaldoNormalizado = nombreSaldo.toUpperCase().trim();

            // Coincidencia exacta case-insensitive
            if (nombreNormalizado === nombreSaldoNormalizado) {
              saldosMap.set(vacuna.id, valor);
              console.log(`✅ Saldo 2024 estático aplicado (case-insensitive) para ${nombreVacuna} -> ${nombreSaldo}: ${valor}`);
              encontrado = true;
              break;
            }

            // Coincidencia parcial (contiene)
            if (nombreNormalizado.includes(nombreSaldoNormalizado) ||
                nombreSaldoNormalizado.includes(nombreNormalizado)) {
              saldosMap.set(vacuna.id, valor);
              console.log(`✅ Saldo 2024 estático aplicado (coincidencia parcial) para ${nombreVacuna} -> ${nombreSaldo}: ${valor}`);
              encontrado = true;
              break;
            }
          }

          if (!encontrado) {
            console.log(`⚠️ No se encontró saldo 2024 estático para: ${nombreVacuna}`);
          }
        }
      }

      console.log('✅ Saldos 2024 estáticos aplicados exitosamente para el año 2025');
    } catch (error) {
      console.error('❌ Error al aplicar saldos 2024 estáticos:', error);
      // No lanzar error, continuar con los saldos calculados
    }
  }

  /**
   * Obtener entregas CENARES por trimestre basado en forma_ingreso de lotes
   */
  private static async obtenerEntregasCenaresPorTrimestre(anio: number): Promise<Map<string, any>> {
    const entregasMap = new Map<string, any>();

    try {
      // Obtener lotes de vacunas del año
      const lotesVacunas = await prisma.loteVacuna.findMany({
        where: {
          fechaIngreso: {
            gte: new Date(`${anio}-01-01`),
            lte: new Date(`${anio}-12-31`)
          }
        },
        select: {
          vacunaId: true,
          cantidadInicial: true,
          formaIngreso: true
        }
      });

      // Obtener lotes de jeringas del año
      const lotesJeringas = await prisma.loteJeringa.findMany({
        where: {
          fechaIngreso: {
            gte: new Date(`${anio}-01-01`),
            lte: new Date(`${anio}-12-31`)
          }
        },
        select: {
          jeringaId: true,
          cantidadInicial: true,
          formaIngreso: true
        }
      });

      // Procesar lotes de vacunas
      for (const lote of lotesVacunas) {
        if (!entregasMap.has(lote.vacunaId)) {
          entregasMap.set(lote.vacunaId, { q1: 0, q2: 0, q3: 0, q4: 0 });
        }

        const entregas = entregasMap.get(lote.vacunaId);
        switch (lote.formaIngreso) {
          case 'PRIMER_TRIMESTRE':
            entregas.q1 += lote.cantidadInicial;
            break;
          case 'SEGUNDO_TRIMESTRE':
            entregas.q2 += lote.cantidadInicial;
            break;
          case 'TERCER_TRIMESTRE':
            entregas.q3 += lote.cantidadInicial;
            break;
          case 'CUARTO_TRIMESTRE':
            entregas.q4 += lote.cantidadInicial;
            break;
        }
      }

      // Procesar lotes de jeringas
      for (const lote of lotesJeringas) {
        if (!entregasMap.has(lote.jeringaId)) {
          entregasMap.set(lote.jeringaId, { q1: 0, q2: 0, q3: 0, q4: 0 });
        }

        const entregas = entregasMap.get(lote.jeringaId);
        switch (lote.formaIngreso) {
          case 'PRIMER_TRIMESTRE':
            entregas.q1 += lote.cantidadInicial;
            break;
          case 'SEGUNDO_TRIMESTRE':
            entregas.q2 += lote.cantidadInicial;
            break;
          case 'TERCER_TRIMESTRE':
            entregas.q3 += lote.cantidadInicial;
            break;
          case 'CUARTO_TRIMESTRE':
            entregas.q4 += lote.cantidadInicial;
            break;
        }
      }

      return entregasMap;
    } catch (error) {
      console.error('Error al obtener entregas CENARES:', error);
      return entregasMap;
    }
  }

  /**
   * Obtener consumo de planificación por trimestre
   */
  private static async obtenerConsumoPlanificacion(anio: number): Promise<Map<string, any>> {
    const consumoMap = new Map<string, any>();

    try {
      // Obtener datos de planificación del año
      const planificaciones = await prisma.planificacionAnual.findMany({
        where: { anio },
        select: {
          vacunaId: true,
          distribucionMensual: true
        }
      });

      // Procesar planificaciones y agrupar por trimestres
      for (const planificacion of planificaciones) {
        const distribucion = planificacion.distribucionMensual;

        // Q1: Enero, Febrero, Marzo (índices 0, 1, 2)
        const q1 = (distribucion[0] || 0) + (distribucion[1] || 0) + (distribucion[2] || 0);
        // Q2: Abril, Mayo, Junio (índices 3, 4, 5)
        const q2 = (distribucion[3] || 0) + (distribucion[4] || 0) + (distribucion[5] || 0);
        // Q3: Julio, Agosto, Septiembre (índices 6, 7, 8)
        const q3 = (distribucion[6] || 0) + (distribucion[7] || 0) + (distribucion[8] || 0);
        // Q4: Octubre, Noviembre, Diciembre (índices 9, 10, 11)
        const q4 = (distribucion[9] || 0) + (distribucion[10] || 0) + (distribucion[11] || 0);

        // FIXED: Accumulate values instead of overwriting
        if (consumoMap.has(planificacion.vacunaId)) {
          const existing = consumoMap.get(planificacion.vacunaId);
          consumoMap.set(planificacion.vacunaId, {
            q1: existing.q1 + q1,
            q2: existing.q2 + q2,
            q3: existing.q3 + q3,
            q4: existing.q4 + q4
          });
        } else {
          consumoMap.set(planificacion.vacunaId, { q1, q2, q3, q4 });
        }
      }
      return consumoMap;
    } catch (error) {
      console.error('Error al obtener consumo planificación:', error);
      return consumoMap;
    }
  }

  /**
   * Calcular saldos secuenciales por trimestre
   */
  private static calcularSaldosSecuenciales(
    saldoAnterior: number,
    entregas: any,
    consumo: any
  ): any {
    let saldoQ1 = saldoAnterior + entregas.q1 - consumo.q1;
    let saldoQ2 = saldoQ1 + entregas.q2 - consumo.q2;
    let saldoQ3 = saldoQ2 + entregas.q3 - consumo.q3;
    let saldoQ4 = saldoQ3 + entregas.q4 - consumo.q4;

    return {
      q1: saldoQ1,
      q2: saldoQ2,
      q3: saldoQ3,
      q4: saldoQ4
    };
  }
}
