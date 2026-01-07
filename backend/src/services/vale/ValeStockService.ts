import { prisma } from '@/config/database';
import { createError } from '@/utils/errors';
import { TipoMovimientoKardex } from '@prisma/client';
import { ConfiguracionJeringaVacunaService } from '../ConfiguracionJeringaVacunaService';
import { AlmacenCentralService } from '../AlmacenCentralService';

/**
 * Interface for stock affectation tracking
 */
export interface StockAfectacion {
  loteId: string;
  cantidadAfectada: number;
  saldoAnterior: number;
  saldoNuevo: number;
}

/**
 * Service for Vale stock operations
 * Handles all stock-related operations for vale generation and reversal
 */
export class ValeStockService {
  
  /**
   * Get available lots for stock deduction (FIFO)
   */
  static async obtenerLotesDisponibles(vacunaId: string, cantidadRequerida: number) {
    const lotes = await prisma.loteVacuna.findMany({
      where: {
        vacunaId,
        estado: 'disponible',
        cantidadActual: { gt: 0 }
      },
      orderBy: [
        { fechaVencimiento: 'asc' },
        { fechaIngreso: 'asc' }
      ]
    });

    const lotesAfectar: Array<{ lote: any; cantidadAfectar: number }> = [];
    let cantidadRestante = cantidadRequerida;

    for (const lote of lotes) {
      if (cantidadRestante <= 0) break;

      const cantidadAfectar = Math.min(lote.cantidadActual, cantidadRestante);
      lotesAfectar.push({ lote, cantidadAfectar });
      cantidadRestante -= cantidadAfectar;
    }

    if (cantidadRestante > 0) {
      throw createError(
        `Stock insuficiente. Requerido: ${cantidadRequerida}, Disponible: ${cantidadRequerida - cantidadRestante}`,
        400
      );
    }

    return lotesAfectar;
  }

  /**
   * Get current total stock for a vaccine
   */
  static async obtenerStockTotalVacuna(tx: any, vacunaId: string): Promise<number> {
    const result = await tx.loteVacuna.aggregate({
      where: {
        vacunaId,
        cantidadActual: { gt: 0 }
      },
      _sum: {
        cantidadActual: true
      }
    });

    return result._sum.cantidadActual || 0;
  }

  /**
   * Get current total stock for a syringe
   */
  static async obtenerStockTotalJeringa(tx: any, jeringaId: string): Promise<number> {
    const result = await tx.loteJeringa.aggregate({
      where: {
        jeringaId,
        cantidadActual: { gt: 0 }
      },
      _sum: {
        cantidadActual: true
      }
    });

    return result._sum.cantidadActual || 0;
  }

  /**
   * Affect vaccine stock (original method for compatibility)
   * FIXES sequential balance calculation in Kardex
   */
  static async afectarStockVacunas(
    tx: any,
    vacunaId: string,
    cantidadTotal: number,
    valeNumero: string,
    usuarioId: string,
    establecimientoDestinoId?: string
  ): Promise<StockAfectacion[]> {
    const lotesAfectar = await this.obtenerLotesDisponibles(vacunaId, cantidadTotal);
    const stocksAfectados: StockAfectacion[] = [];

    const almacenCentralResult = await AlmacenCentralService.obtenerIdAlmacenCentral();
    const almacenCentralId = almacenCentralResult.success ? almacenCentralResult.data : null;

    let stockTotalActual = await this.obtenerStockTotalVacuna(tx, vacunaId);
    console.log(`📊 [ValeStockService] Stock total inicial de vacuna ${vacunaId}: ${stockTotalActual} unidades`);

    for (const { lote, cantidadAfectar } of lotesAfectar) {
      const saldoAnteriorLote = lote.cantidadActual;
      const saldoNuevoLote = saldoAnteriorLote - cantidadAfectar;

      await tx.loteVacuna.update({
        where: { id: lote.id },
        data: {
          cantidadActual: saldoNuevoLote,
          estado: saldoNuevoLote === 0 ? 'agotado' : 'disponible'
        }
      });

      const saldoAnteriorMovimiento = stockTotalActual;
      const saldoNuevoMovimiento = stockTotalActual - cantidadAfectar;

      await tx.kardex.create({
        data: {
          tipo: 'vacuna',
          itemId: vacunaId,
          loteId: lote.id,
          tipoMovimiento: TipoMovimientoKardex.salida,
          cantidad: cantidadAfectar,
          saldoAnterior: saldoAnteriorMovimiento,
          saldoActual: saldoNuevoMovimiento,
          establecimientoOrigenId: almacenCentralId,
          establecimientoDestinoId: establecimientoDestinoId,
          documento: 'VALE_ENTREGA',
          numeroDocumento: valeNumero,
          observaciones: `Salida por vale de entrega ${valeNumero}`,
          usuarioId,
          fechaMovimiento: new Date()
        }
      });

      stockTotalActual = saldoNuevoMovimiento;

      stocksAfectados.push({
        loteId: lote.id,
        cantidadAfectada: cantidadAfectar,
        saldoAnterior: saldoAnteriorLote,
        saldoNuevo: saldoNuevoLote
      });

      console.log(`✅ [ValeStockService] Movimiento secuencial: Lote ${lote.numero} - ${cantidadAfectar} unidades (${saldoAnteriorMovimiento} → ${saldoNuevoMovimiento})`);
    }

    console.log(`📊 [ValeStockService] Stock total final de vacuna ${vacunaId}: ${stockTotalActual} unidades`);
    return stocksAfectados;
  }

  /**
   * Affect vaccine stock consolidated for multiple establishments
   */
  static async afectarStockVacunasConsolidado(
    tx: any,
    vacunaId: string,
    establecimientos: Array<{
      establecimientoId: string;
      cantidad: number;
      nombre: string;
    }>,
    valeNumero: string,
    usuarioId: string
  ): Promise<StockAfectacion[]> {
    const cantidadTotal = establecimientos.reduce((sum, est) => sum + est.cantidad, 0);

    console.log(`🔄 [ValeStockService] Procesando stock consolidado para vacuna ${vacunaId}: ${cantidadTotal} unidades distribuidas en ${establecimientos.length} establecimientos`);

    const lotesAfectar = await this.obtenerLotesDisponibles(vacunaId, cantidadTotal);
    const stocksAfectados: StockAfectacion[] = [];

    const almacenCentralResult = await AlmacenCentralService.obtenerIdAlmacenCentral();
    const almacenCentralId = almacenCentralResult.success ? almacenCentralResult.data : null;

    let stockTotalActual = await this.obtenerStockTotalVacuna(tx, vacunaId);
    console.log(`📊 [ValeStockService] Stock total inicial de vacuna ${vacunaId}: ${stockTotalActual} unidades`);

    const establecimientosConRequerimientos = establecimientos.map(est => ({
      ...est,
      vacunasRequeridas: est.cantidad,
      vacunasAsignadas: 0
    }));

    console.log(`🔄 [ValeStockService] Procesando ${establecimientosConRequerimientos.length} establecimientos secuencialmente:`);
    establecimientosConRequerimientos.forEach(est => {
      console.log(`   - ${est.nombre}: ${est.vacunasRequeridas} vacunas requeridas`);
    });

    let vacunasRestantes = cantidadTotal;

    for (const { lote } of lotesAfectar) {
      if (vacunasRestantes <= 0) break;

      const cantidadDisponibleLote = Math.min(lote.cantidadActual, vacunasRestantes);
      let cantidadRestanteLote = cantidadDisponibleLote;

      console.log(`📦 [ValeStockService] Procesando lote ${lote.numero}: ${cantidadDisponibleLote} vacunas disponibles`);

      await tx.loteVacuna.update({
        where: { id: lote.id },
        data: {
          cantidadActual: lote.cantidadActual - cantidadDisponibleLote,
          estado: (lote.cantidadActual - cantidadDisponibleLote) === 0 ? 'agotado' : 'disponible'
        }
      });

      for (const establecimiento of establecimientosConRequerimientos) {
        if (cantidadRestanteLote <= 0) break;

        const vacunasPendientes = establecimiento.vacunasRequeridas - establecimiento.vacunasAsignadas;
        if (vacunasPendientes <= 0) continue;

        const cantidadAsignar = Math.min(cantidadRestanteLote, vacunasPendientes);

        if (cantidadAsignar > 0) {
          const saldoAnteriorMovimiento = stockTotalActual;
          const saldoNuevoMovimiento = stockTotalActual - cantidadAsignar;

          await tx.kardex.create({
            data: {
              tipo: 'vacuna',
              itemId: vacunaId,
              loteId: lote.id,
              tipoMovimiento: TipoMovimientoKardex.salida,
              cantidad: cantidadAsignar,
              saldoAnterior: saldoAnteriorMovimiento,
              saldoActual: saldoNuevoMovimiento,
              establecimientoOrigenId: almacenCentralId,
              establecimientoDestinoId: establecimiento.establecimientoId,
              documento: 'VALE_ENTREGA',
              numeroDocumento: valeNumero,
              observaciones: `Salida por vale de entrega ${valeNumero} - ${establecimiento.nombre} (${establecimiento.vacunasRequeridas} vacunas requeridas)`,
              usuarioId,
              fechaMovimiento: new Date()
            }
          });

          establecimiento.vacunasAsignadas += cantidadAsignar;
          cantidadRestanteLote -= cantidadAsignar;
          stockTotalActual = saldoNuevoMovimiento;

          console.log(`✅ [ValeStockService] ${establecimiento.nombre}: ${cantidadAsignar} vacunas asignadas del lote ${lote.numero} (${establecimiento.vacunasAsignadas}/${establecimiento.vacunasRequeridas} completado)`);
        }
      }

      stocksAfectados.push({
        loteId: lote.id,
        cantidadAfectada: cantidadDisponibleLote,
        saldoAnterior: lote.cantidadActual,
        saldoNuevo: lote.cantidadActual - cantidadDisponibleLote
      });

      vacunasRestantes -= cantidadDisponibleLote;
      console.log(`📊 [ValeStockService] Lote ${lote.numero} procesado: ${cantidadDisponibleLote} vacunas asignadas, ${vacunasRestantes} restantes`);
    }

    if (vacunasRestantes > 0) {
      console.warn(`⚠️ [ValeStockService] Stock insuficiente para vacuna ${vacunaId}: faltan ${vacunasRestantes} unidades`);
    }

    console.log(`✅ [ValeStockService] Stocks de vacunas afectados para vacuna ${vacunaId}: ${stocksAfectados.length} lotes`);
    return stocksAfectados;
  }

  /**
   * Affect syringe stock consolidated for multiple establishments
   */
  static async afectarStockJeringasConsolidado(
    tx: any,
    vacunaId: string,
    establecimientos: Array<{
      establecimientoId: string;
      cantidad: number;
      nombre: string;
    }>,
    valeNumero: string,
    usuarioId: string,
    centroAcopioId?: string
  ): Promise<StockAfectacion[]> {
    const cantidadTotalVacunas = establecimientos.reduce((sum, est) => sum + est.cantidad, 0);

    console.log(`🔍 [ValeStockService] Verificando configuración de jeringas consolidada para vacuna: ${vacunaId}`);

    const vacuna = await tx.vacuna.findUnique({
      where: { id: vacunaId },
      select: { nombre: true, dosisPorFrasco: true }
    });

    if (!vacuna) {
      console.log(`❌ [ValeStockService] Vacuna no encontrada: ${vacunaId}`);
      return [];
    }

    const configResult = await ConfiguracionJeringaVacunaService.getConfiguracionEfectiva(vacunaId, centroAcopioId, false);
    if (!configResult.success || !configResult.data || configResult.data.length === 0) {
      console.log(`⚠️ [ValeStockService] No hay configuración específica de jeringas para ${vacuna.nombre} - omitiendo procesamiento de jeringas consolidado`);
      return [];
    }

    const stocksAfectados: StockAfectacion[] = [];

    for (const jeringaConfig of configResult.data) {
      console.log(`🔄 [ValeStockService] Procesando jeringa consolidada: ${jeringaConfig.jeringaId}, multiplicador: ${jeringaConfig.multiplicador || 1}`);

      try {
        const stocksJeringa = await this.afectarStockJeringaEspecificaConsolidado(
          tx,
          jeringaConfig.jeringaId,
          cantidadTotalVacunas * jeringaConfig.multiplicador,
          valeNumero,
          usuarioId,
          vacunaId,
          jeringaConfig.multiplicador || 1,
          establecimientos
        );
        stocksAfectados.push(...stocksJeringa);
      } catch (error) {
        console.error(`❌ [ValeStockService] Error afectando stock consolidado de jeringa ${jeringaConfig.jeringaId}:`, error);
      }
    }

    console.log(`✅ [ValeStockService] Stocks consolidados de jeringas afectados para ${vacuna.nombre}: ${stocksAfectados.length} lotes`);
    return stocksAfectados;
  }

  /**
   * Affect specific syringe stock consolidated
   */
  static async afectarStockJeringaEspecificaConsolidado(
    tx: any,
    jeringaId: string,
    cantidadNecesaria: number,
    valeNumero: string,
    usuarioId: string,
    vacunaId: string,
    multiplicador: number,
    establecimientos: Array<{
      establecimientoId: string;
      cantidad: number;
      nombre: string;
    }>
  ): Promise<StockAfectacion[]> {
    const lotesJeringas = await tx.loteJeringa.findMany({
      where: {
        jeringaId: jeringaId,
        estado: 'disponible',
        cantidadActual: { gt: 0 }
      },
      orderBy: [
        { fechaVencimiento: 'asc' },
        { fechaIngreso: 'asc' }
      ]
    });

    const stocksAfectados: StockAfectacion[] = [];
    let jeringasRestantes = cantidadNecesaria;

    const almacenCentralResult = await AlmacenCentralService.obtenerIdAlmacenCentral();
    const almacenCentralId = almacenCentralResult.success ? almacenCentralResult.data : null;

    let stockTotalActual = await this.obtenerStockTotalJeringa(tx, jeringaId);
    console.log(`📊 [ValeStockService] Stock total inicial de jeringa ${jeringaId}: ${stockTotalActual} unidades`);

    const establecimientosConRequerimientos = establecimientos.map(est => ({
      ...est,
      jeringasRequeridas: est.cantidad * multiplicador,
      jeringasAsignadas: 0
    }));

    console.log(`🔄 [ValeStockService] Procesando ${establecimientosConRequerimientos.length} establecimientos secuencialmente:`);
    establecimientosConRequerimientos.forEach(est => {
      console.log(`   - ${est.nombre}: ${est.jeringasRequeridas} jeringas requeridas (${est.cantidad} vacunas × ${multiplicador})`);
    });

    for (const lote of lotesJeringas) {
      if (jeringasRestantes <= 0) break;

      const cantidadDisponibleLote = Math.min(lote.cantidadActual, jeringasRestantes);
      let cantidadRestanteLote = cantidadDisponibleLote;

      console.log(`📦 [ValeStockService] Procesando lote ${lote.numero}: ${cantidadDisponibleLote} jeringas disponibles`);

      await tx.loteJeringa.update({
        where: { id: lote.id },
        data: {
          cantidadActual: lote.cantidadActual - cantidadDisponibleLote,
          estado: (lote.cantidadActual - cantidadDisponibleLote) === 0 ? 'agotado' : 'disponible'
        }
      });

      for (const establecimiento of establecimientosConRequerimientos) {
        if (cantidadRestanteLote <= 0) break;

        const jeringasPendientes = establecimiento.jeringasRequeridas - establecimiento.jeringasAsignadas;
        if (jeringasPendientes <= 0) continue;

        const cantidadAsignar = Math.min(cantidadRestanteLote, jeringasPendientes);

        if (cantidadAsignar > 0) {
          const saldoAnteriorMovimiento = stockTotalActual;
          const saldoNuevoMovimiento = stockTotalActual - cantidadAsignar;

          await tx.kardex.create({
            data: {
              tipo: 'jeringa',
              itemId: lote.jeringaId,
              loteId: lote.id,
              tipoMovimiento: TipoMovimientoKardex.salida,
              cantidad: cantidadAsignar,
              saldoAnterior: saldoAnteriorMovimiento,
              saldoActual: saldoNuevoMovimiento,
              establecimientoOrigenId: almacenCentralId,
              establecimientoDestinoId: establecimiento.establecimientoId,
              documento: 'VALE_ENTREGA',
              numeroDocumento: valeNumero,
              observaciones: `Salida por vale de entrega ${valeNumero} - Vacuna: ${vacunaId} - ${establecimiento.nombre} (Multiplicador: ${multiplicador})`,
              usuarioId,
              fechaMovimiento: new Date()
            }
          });

          establecimiento.jeringasAsignadas += cantidadAsignar;
          cantidadRestanteLote -= cantidadAsignar;
          stockTotalActual = saldoNuevoMovimiento;

          console.log(`✅ [ValeStockService] ${establecimiento.nombre}: ${cantidadAsignar} jeringas asignadas del lote ${lote.numero} (${establecimiento.jeringasAsignadas}/${establecimiento.jeringasRequeridas} completado)`);
        }
      }

      stocksAfectados.push({
        loteId: lote.id,
        cantidadAfectada: cantidadDisponibleLote,
        saldoAnterior: lote.cantidadActual,
        saldoNuevo: lote.cantidadActual - cantidadDisponibleLote
      });

      jeringasRestantes -= cantidadDisponibleLote;
      console.log(`📊 [ValeStockService] Lote ${lote.numero} procesado: ${cantidadDisponibleLote} jeringas asignadas, ${jeringasRestantes} restantes`);
    }

    if (jeringasRestantes > 0) {
      throw createError(
        `Stock insuficiente de jeringas. Requerido: ${cantidadNecesaria}, Disponible: ${cantidadNecesaria - jeringasRestantes}`,
        400
      );
    }

    return stocksAfectados;
  }

  /**
   * Affect syringe stock (original method)
   */
  static async afectarStockJeringas(
    tx: any,
    vacunaId: string,
    cantidadVacunas: number,
    valeNumero: string,
    usuarioId: string,
    centroAcopioId?: string,
    establecimientoDestinoId?: string
  ): Promise<StockAfectacion[]> {
    console.log(`🔍 [ValeStockService] Verificando configuración de jeringas para vacuna: ${vacunaId}`);

    const vacuna = await tx.vacuna.findUnique({
      where: { id: vacunaId },
      select: { nombre: true, dosisPorFrasco: true }
    });

    if (!vacuna) {
      console.log(`❌ [ValeStockService] Vacuna no encontrada: ${vacunaId}`);
      return [];
    }

    console.log(`📊 [ValeStockService] Vacuna: ${vacuna.nombre}, Cantidad: ${cantidadVacunas}`);

    const configResult = await ConfiguracionJeringaVacunaService.calcularJeringasNecesarias(
      vacunaId,
      cantidadVacunas,
      centroAcopioId,
      false
    );

    if (!configResult.success || !configResult.data || configResult.data.length === 0) {
      console.log(`⚠️ [ValeStockService] No se encontró configuración específica de jeringas para ${vacuna.nombre}.`);
      console.log(`✅ [ValeStockService] CORRECTO: No se afectará stock de jeringas sin configuración específica.`);
      return [];
    }

    console.log(`✅ [ValeStockService] Configuración específica encontrada para ${vacuna.nombre}: ${configResult.data.length} tipos de jeringas`);
    const stocksAfectados: StockAfectacion[] = [];

    for (const jeringaConfig of configResult.data) {
      console.log(`🔄 [ValeStockService] Procesando jeringa: ${jeringaConfig.jeringaId}, cantidad: ${jeringaConfig.cantidad}, multiplicador: ${jeringaConfig.multiplicador || 1}`);

      try {
        const stocksJeringa = await this.afectarStockJeringaEspecifica(
          tx,
          jeringaConfig.jeringaId,
          jeringaConfig.cantidad,
          valeNumero,
          usuarioId,
          vacunaId,
          jeringaConfig.multiplicador || 1,
          establecimientoDestinoId
        );
        stocksAfectados.push(...stocksJeringa);
      } catch (error) {
        console.error(`❌ [ValeStockService] Error afectando stock de jeringa ${jeringaConfig.jeringaId}:`, error);
      }
    }

    console.log(`✅ [ValeStockService] Stocks de jeringas afectados para ${vacuna.nombre}: ${stocksAfectados.length} lotes`);
    return stocksAfectados;
  }

  /**
   * Affect specific syringe stock
   */
  static async afectarStockJeringaEspecifica(
    tx: any,
    jeringaId: string,
    cantidadNecesaria: number,
    valeNumero: string,
    usuarioId: string,
    vacunaId: string,
    multiplicador: number,
    establecimientoDestinoId?: string
  ): Promise<StockAfectacion[]> {
    const lotesJeringas = await tx.loteJeringa.findMany({
      where: {
        jeringaId: jeringaId,
        estado: 'disponible',
        cantidadActual: { gt: 0 }
      },
      orderBy: [
        { fechaVencimiento: 'asc' },
        { fechaIngreso: 'asc' }
      ]
    });

    const stocksAfectados: StockAfectacion[] = [];
    let jeringasRestantes = cantidadNecesaria;

    const almacenCentralResult = await AlmacenCentralService.obtenerIdAlmacenCentral();
    const almacenCentralId = almacenCentralResult.success ? almacenCentralResult.data : null;

    let stockTotalActual = await this.obtenerStockTotalJeringa(tx, jeringaId);
    console.log(`📊 [ValeStockService] Stock total inicial de jeringa ${jeringaId}: ${stockTotalActual} unidades`);

    for (const lote of lotesJeringas) {
      if (jeringasRestantes <= 0) break;

      const cantidadAfectar = Math.min(lote.cantidadActual, jeringasRestantes);
      const saldoAnteriorLote = lote.cantidadActual;
      const saldoNuevoLote = saldoAnteriorLote - cantidadAfectar;

      await tx.loteJeringa.update({
        where: { id: lote.id },
        data: {
          cantidadActual: saldoNuevoLote,
          estado: saldoNuevoLote === 0 ? 'agotado' : 'disponible'
        }
      });

      const saldoAnteriorMovimiento = stockTotalActual;
      const saldoNuevoMovimiento = stockTotalActual - cantidadAfectar;

      await tx.kardex.create({
        data: {
          tipo: 'jeringa',
          itemId: lote.jeringaId,
          loteId: lote.id,
          tipoMovimiento: TipoMovimientoKardex.salida,
          cantidad: cantidadAfectar,
          saldoAnterior: saldoAnteriorMovimiento,
          saldoActual: saldoNuevoMovimiento,
          establecimientoOrigenId: almacenCentralId,
          establecimientoDestinoId: establecimientoDestinoId,
          documento: 'VALE_ENTREGA',
          numeroDocumento: valeNumero,
          observaciones: `Salida por vale de entrega ${valeNumero} - Vacuna: ${vacunaId} (Multiplicador: ${multiplicador})`,
          usuarioId,
          fechaMovimiento: new Date()
        }
      });

      stocksAfectados.push({
        loteId: lote.id,
        cantidadAfectada: cantidadAfectar,
        saldoAnterior: saldoAnteriorMovimiento,
        saldoNuevo: saldoNuevoMovimiento
      });

      stockTotalActual = saldoNuevoMovimiento;
      jeringasRestantes -= cantidadAfectar;
    }

    if (jeringasRestantes > 0) {
      const jeringa = await tx.jeringa.findUnique({
        where: { id: jeringaId },
        select: { tipo: true, capacidad: true }
      });

      const jeringaInfo = jeringa ? `${jeringa.tipo} ${jeringa.capacidad}` : 'jeringa específica';

      throw createError(
        `Stock insuficiente de ${jeringaInfo}. Requerido: ${cantidadNecesaria}, Disponible: ${cantidadNecesaria - jeringasRestantes}`,
        400
      );
    }

    return stocksAfectados;
  }

  /**
   * Restore vaccine stock (when quantity decreases in vale)
   */
  static async restaurarStockVacunas(
    tx: any,
    vacunaId: string,
    cantidad: number,
    valeNumero: string,
    usuarioId: string
  ): Promise<void> {
    const lotes = await tx.loteVacuna.findMany({
      where: {
        vacunaId,
        estado: { in: ['disponible', 'agotado'] }
      },
      orderBy: { fechaVencimiento: 'asc' }
    });

    // Obtener stock total ANTES de cualquier modificación
    let stockTotalActual = await this.obtenerStockTotalVacuna(tx, vacunaId);
    console.log(`📊 [ValeStockService] Stock total inicial de vacuna ${vacunaId} para restauración: ${stockTotalActual} unidades`);

    let cantidadRestaurar = cantidad;

    for (const lote of lotes) {
      if (cantidadRestaurar <= 0) break;

      const ultimoMovimiento = await tx.kardex.findFirst({
        where: {
          loteId: lote.id,
          tipoMovimiento: TipoMovimientoKardex.salida,
          numeroDocumento: valeNumero
        },
        orderBy: { createdAt: 'desc' }
      });

      if (ultimoMovimiento) {
        const cantidadARestaurar = Math.min(cantidadRestaurar, ultimoMovimiento.cantidad);
        const nuevoSaldoLote = lote.cantidadActual + cantidadARestaurar;

        await tx.loteVacuna.update({
          where: { id: lote.id },
          data: {
            cantidadActual: nuevoSaldoLote,
            estado: nuevoSaldoLote > 0 ? 'disponible' : 'agotado'
          }
        });

        // Calcular saldos basados en stock TOTAL
        const saldoAnteriorMovimiento = stockTotalActual;
        const saldoNuevoMovimiento = stockTotalActual + cantidadARestaurar;

        await tx.kardex.create({
          data: {
            tipo: 'vacuna',
            itemId: vacunaId,
            loteId: lote.id,
            tipoMovimiento: TipoMovimientoKardex.ingreso,
            cantidad: cantidadARestaurar,
            saldoAnterior: saldoAnteriorMovimiento,
            saldoActual: saldoNuevoMovimiento,
            documento: 'VALE_ENTREGA_AJUSTE',
            numeroDocumento: valeNumero,
            observaciones: `Restauración por ajuste de vale ${valeNumero}`,
            usuarioId,
            fechaMovimiento: new Date()
          }
        });

        // Actualizar stock total para el siguiente lote
        stockTotalActual = saldoNuevoMovimiento;
        cantidadRestaurar -= cantidadARestaurar;

        console.log(`✅ [ValeStockService] Restauración secuencial: Lote ${lote.numero} - +${cantidadARestaurar} unidades (${saldoAnteriorMovimiento} → ${saldoNuevoMovimiento})`);
      }
    }

    console.log(`📊 [ValeStockService] Stock total final de vacuna ${vacunaId}: ${stockTotalActual} unidades`);
  }

  /**
   * Restore syringe stock (when quantity decreases in vale)
   */
  static async restaurarStockJeringas(
    tx: any,
    vacunaId: string,
    cantidadVacunas: number,
    valeNumero: string,
    usuarioId: string,
    centroAcopioId?: string
  ): Promise<void> {
    console.log(`🔍 [ValeStockService] Verificando configuración para restaurar jeringas - Vacuna: ${vacunaId}`);

    const configResult = await ConfiguracionJeringaVacunaService.calcularJeringasNecesarias(
      vacunaId,
      cantidadVacunas,
      centroAcopioId,
      false
    );

    if (!configResult.success || !configResult.data || configResult.data.length === 0) {
      console.log(`⚠️ [ValeStockService] No se encontró configuración de jeringas para vacuna ${vacunaId}. No se restaurarán stocks de jeringas.`);
      return;
    }

    console.log(`✅ [ValeStockService] Configuración encontrada. Restaurando stocks de jeringas para ${configResult.data.length} tipos de jeringas`);

    for (const jeringaConfig of configResult.data) {
      const cantidadARestaurar = jeringaConfig.cantidad;

      console.log(`🔄 [ValeStockService] Restaurando jeringa: ${jeringaConfig.jeringaId}, cantidad: ${cantidadARestaurar}`);

      // Obtener stock total ANTES de cualquier modificación
      let stockTotalActual = await this.obtenerStockTotalJeringa(tx, jeringaConfig.jeringaId);
      console.log(`📊 [ValeStockService] Stock total inicial de jeringa ${jeringaConfig.jeringaId} para restauración: ${stockTotalActual} unidades`);

      const lotesJeringa = await tx.loteJeringa.findMany({
        where: {
          jeringaId: jeringaConfig.jeringaId,
          estado: { in: ['disponible', 'agotado'] }
        },
        orderBy: { fechaVencimiento: 'asc' }
      });

      let jeringasRestantes = cantidadARestaurar;

      for (const lote of lotesJeringa) {
        if (jeringasRestantes <= 0) break;

        const ultimoMovimiento = await tx.kardex.findFirst({
          where: {
            loteId: lote.id,
            tipoMovimiento: TipoMovimientoKardex.salida,
            numeroDocumento: valeNumero,
            tipo: 'jeringa'
          },
          orderBy: { createdAt: 'desc' }
        });

        if (ultimoMovimiento) {
          const cantidadARestaurarLote = Math.min(jeringasRestantes, ultimoMovimiento.cantidad);
          const nuevoSaldoLote = lote.cantidadActual + cantidadARestaurarLote;

          await tx.loteJeringa.update({
            where: { id: lote.id },
            data: {
              cantidadActual: nuevoSaldoLote,
              estado: nuevoSaldoLote > 0 ? 'disponible' : 'agotado'
            }
          });

          // Calcular saldos basados en stock TOTAL
          const saldoAnteriorMovimiento = stockTotalActual;
          const saldoNuevoMovimiento = stockTotalActual + cantidadARestaurarLote;

          await tx.kardex.create({
            data: {
              tipo: 'jeringa',
              itemId: jeringaConfig.jeringaId,
              loteId: lote.id,
              tipoMovimiento: TipoMovimientoKardex.ingreso,
              cantidad: cantidadARestaurarLote,
              saldoAnterior: saldoAnteriorMovimiento,
              saldoActual: saldoNuevoMovimiento,
              documento: 'VALE_ENTREGA_AJUSTE',
              numeroDocumento: valeNumero,
              observaciones: `Restauración por ajuste de vale ${valeNumero} - Vacuna: ${vacunaId}`,
              usuarioId,
              fechaMovimiento: new Date()
            }
          });

          // Actualizar stock total para el siguiente lote
          stockTotalActual = saldoNuevoMovimiento;
          jeringasRestantes -= cantidadARestaurarLote;

          console.log(`✅ [ValeStockService] Restauración secuencial: Lote ${lote.numero} - +${cantidadARestaurarLote} unidades (${saldoAnteriorMovimiento} → ${saldoNuevoMovimiento})`);
        }
      }

      console.log(`📊 [ValeStockService] Stock total final de jeringa ${jeringaConfig.jeringaId}: ${stockTotalActual} unidades`);

      if (jeringasRestantes > 0) {
        console.warn(`⚠️ [ValeStockService] No se pudo restaurar completamente la jeringa ${jeringaConfig.jeringaId}. Faltaron: ${jeringasRestantes}`);
      }
    }
  }
}
