/**
 * SaBot AI Agent Tools
 * Read-only Prisma queries exposed as AI SDK tools
 */

import { tool } from 'ai';
import { z } from 'zod';
import { prisma } from '@/config/database';

// ─── Helper: format dates ─────────────────────────────────────

function fmtDate(d: Date | null | undefined): string {
  if (!d) return '-';
  return new Date(d).toLocaleDateString('es-PE');
}

// ─── Tools Definition ─────────────────────────────────────────

export function createSibotTools() {
  return {
    // ── 1. Dashboard Stats ──────────────────────────────────
    getDashboardStats: tool({
      description:
        'Obtiene las estadísticas generales del dashboard: total vacunas, establecimientos, usuarios, alertas pendientes, stock crítico, lotes por vencer, entregas del mes, movimientos del último mes.',
      inputSchema: z.object({}),
      execute: async () => {
        const now = new Date();
        const inicioMes = new Date(now.getFullYear(), now.getMonth(), 1);
        const limite30d = new Date();
        limite30d.setDate(limite30d.getDate() + 30);

        const [
          totalVacunas,
          totalEstablecimientos,
          totalUsuarios,
          alertasPendientes,
          lotesProximosVencer,
          entregasMes,
          movimientosUltimoMes,
        ] = await Promise.all([
          prisma.vacuna.count({ where: { estado: 'activo' } }),
          prisma.establecimiento.count({ where: { estado: 'activo' } }),
          prisma.usuario.count({ where: { estado: 'activo' } }),
          prisma.alerta.count({ where: { leida: false } }),
          prisma.loteVacuna.count({
            where: {
              estado: 'disponible',
              fechaVencimiento: { lte: limite30d, gte: now },
            },
          }),
          prisma.movimientoVacuna.aggregate({
            where: {
              anio: now.getFullYear(),
              mes: now.getMonth() + 1,
              entrega: { gt: 0 },
            },
            _sum: { entrega: true },
          }),
          prisma.kardex.count({
            where: { fechaMovimiento: { gte: inicioMes } },
          }),
        ]);

        return {
          totalVacunas,
          totalEstablecimientos,
          totalUsuarios,
          alertasPendientes,
          lotesProximosVencer,
          entregasDelMes: entregasMes._sum.entrega || 0,
          movimientosUltimoMes,
          fechaConsulta: fmtDate(now),
        };
      },
    }),

    // ── 2. Lista de Vacunas ─────────────────────────────────
    getVacunas: tool({
      description:
        'Obtiene la lista de vacunas del sistema con su información y stock (cantidad total de lotes disponibles). Soporta filtro por nombre.',
      inputSchema: z.object({
        buscar: z
          .string()
          .optional()
          .describe('Filtrar vacunas por nombre (búsqueda parcial)'),
        estado: z
          .enum(['activo', 'inactivo', 'todos'])
          .optional()
          .describe('Filtrar por estado'),
      }),
      execute: async ({ buscar, estado }) => {
        const where: any = {};
        if (estado && estado !== 'todos') where.estado = estado;
        else if (!estado) where.estado = 'activo';
        if (buscar) where.nombre = { contains: buscar, mode: 'insensitive' };

        const vacunas = await prisma.vacuna.findMany({
          where,
          include: {
            lotes: {
              where: { estado: 'disponible' },
              select: { cantidadActual: true },
            },
            _count: { select: { planificaciones: true, movimientos: true } },
          },
          orderBy: { nombre: 'asc' },
          take: 50,
        });

        return vacunas.map((v) => ({
          nombre: v.nombre,
          tipo: v.tipo,
          presentacion: v.presentacion,
          dosisPorFrasco: v.dosisPorFrasco,
          temperatura: v.temperaturaAlmacenamiento,
          estado: v.estado,
          stockDisponible: v.lotes.reduce((s, l) => s + l.cantidadActual, 0),
          cantidadLotes: v.lotes.length,
          planificaciones: v._count.planificaciones,
          movimientos: v._count.movimientos,
        }));
      },
    }),

    // ── 3. Lista de Jeringas ────────────────────────────────
    getJeringas: tool({
      description: 'Obtiene la lista de jeringas con stock por lotes.',
      inputSchema: z.object({
        estado: z.enum(['activo', 'inactivo', 'todos']).optional(),
      }),
      execute: async ({ estado }) => {
        const where: any = {};
        if (estado && estado !== 'todos') where.estado = estado;
        else if (!estado) where.estado = 'activo';

        const jeringas = await prisma.jeringa.findMany({
          where,
          include: {
            lotes: {
              where: { estado: 'disponible' },
              select: { cantidadActual: true },
            },
          },
          orderBy: { tipo: 'asc' },
        });

        return jeringas.map((j) => ({
          tipo: j.tipo,
          capacidad: j.capacidad,
          color: j.color,
          estado: j.estado,
          stockDisponible: j.lotes.reduce((s, l) => s + l.cantidadActual, 0),
          cantidadLotes: j.lotes.length,
        }));
      },
    }),

    // ── 4. Lotes de Vacunas ─────────────────────────────────
    getLotesVacunas: tool({
      description:
        'Obtiene los lotes de vacunas con su estado, cantidad actual, fecha de vencimiento. Ideal para verificar stock, vencimientos y trazabilidad.',
      inputSchema: z.object({
        estado: z
          .enum(['disponible', 'vencido', 'agotado', 'todos'])
          .optional()
          .describe('Filtrar por estado del lote'),
        vacunaNombre: z
          .string()
          .optional()
          .describe('Filtrar por nombre de vacuna'),
        soloProximosVencer: z
          .boolean()
          .optional()
          .describe('true para ver solo lotes próximos a vencer (30 días)'),
      }),
      execute: async ({ estado, vacunaNombre, soloProximosVencer }) => {
        const where: any = {};
        if (estado && estado !== 'todos') where.estado = estado;
        if (vacunaNombre)
          where.vacuna = {
            nombre: { contains: vacunaNombre, mode: 'insensitive' },
          };
        if (soloProximosVencer) {
          const limite = new Date();
          limite.setDate(limite.getDate() + 30);
          where.estado = 'disponible';
          where.fechaVencimiento = { lte: limite, gte: new Date() };
        }

        const lotes = await prisma.loteVacuna.findMany({
          where,
          include: { vacuna: { select: { nombre: true, tipo: true } } },
          orderBy: { fechaVencimiento: 'asc' },
          take: 30,
        });

        return lotes.map((l) => ({
          numero: l.numero,
          vacuna: l.vacuna.nombre,
          tipoVacuna: l.vacuna.tipo,
          cantidadInicial: l.cantidadInicial,
          cantidadActual: l.cantidadActual,
          porcentajeRestante:
            l.cantidadInicial > 0
              ? Math.round((l.cantidadActual / l.cantidadInicial) * 100)
              : 0,
          fechaIngreso: fmtDate(l.fechaIngreso),
          fechaVencimiento: fmtDate(l.fechaVencimiento),
          estado: l.estado,
          comprobante: `${l.comprobanteClase} - ${l.numeroComprobante}`,
        }));
      },
    }),

    // ── 5. Establecimientos ─────────────────────────────────
    getEstablecimientos: tool({
      description:
        'Lista de establecimientos de salud con su centro de acopio. Filtra por nombre o tipo.',
      inputSchema: z.object({
        buscar: z
          .string()
          .optional()
          .describe('Buscar por nombre de establecimiento'),
        tipo: z
          .enum(['centro_salud', 'puesto_salud', 'hospital', 'todos'])
          .optional(),
      }),
      execute: async ({ buscar, tipo }) => {
        const where: any = { estado: 'activo' };
        if (buscar)
          where.nombre = { contains: buscar, mode: 'insensitive' };
        if (tipo && tipo !== 'todos') where.tipo = tipo;

        const items = await prisma.establecimiento.findMany({
          where,
          include: {
            centroAcopio: {
              select: { nombre: true, microred: { select: { nombre: true, red: { select: { nombre: true } } } } },
            },
          },
          orderBy: { nombre: 'asc' },
          take: 50,
        });

        return items.map((e) => ({
          nombre: e.nombre,
          tipo: e.tipo,
          codigo: e.codigo,
          direccion: e.direccion,
          responsable: e.responsable,
          centroAcopio: e.centroAcopio?.nombre || '-',
          microred: e.centroAcopio?.microred?.nombre || '-',
          red: e.centroAcopio?.microred?.red?.nombre || '-',
        }));
      },
    }),

    // ── 6. Centros de Acopio ────────────────────────────────
    getCentrosAcopio: tool({
      description:
        'Lista de centros de acopio activos con cantidad de establecimientos.',
      inputSchema: z.object({}),
      execute: async () => {
        const centros = await prisma.centroAcopio.findMany({
          where: { estado: 'activo' },
          include: {
            _count: { select: { establecimientos: true } },
            microred: {
              select: { nombre: true, red: { select: { nombre: true } } },
            },
          },
          orderBy: { nombre: 'asc' },
        });

        return centros.map((c) => ({
          nombre: c.nombre,
          codigo: c.codigo || '-',
          direccion: c.direccion,
          responsable: c.responsable,
          establecimientos: c._count.establecimientos,
          microred: c.microred?.nombre || '-',
          red: c.microred?.red?.nombre || '-',
        }));
      },
    }),

    // ── 7. Redes y Microredes ────────────────────────────────
    getRedesYMicroredes: tool({
      description:
        'Obtiene la jerarquía organizacional completa: redes → microredes → cantidad de centros.',
      inputSchema: z.object({}),
      execute: async () => {
        const redes = await prisma.red.findMany({
          where: { estado: 'activo' },
          include: {
            microredes: {
              where: { estado: 'activo' },
              include: {
                _count: { select: { centrosAcopio: true } },
              },
            },
          },
          orderBy: { nombre: 'asc' },
        });

        return redes.map((r) => ({
          red: r.nombre,
          codigo: r.codigo || '-',
          microredes: r.microredes.map((m) => ({
            nombre: m.nombre,
            codigo: m.codigo || '-',
            centrosAcopio: m._count.centrosAcopio,
          })),
        }));
      },
    }),

    // ── 8. Movimientos ──────────────────────────────────────
    getMovimientos: tool({
      description:
        'Obtiene los movimientos de vacunas por período (mes/año). Muestra saldo anterior, ingresos, salidas, entregas por establecimiento y vacuna.',
      inputSchema: z.object({
        mes: z.number().min(1).max(12).describe('Mes (1-12)'),
        anio: z.number().min(2020).max(2030).describe('Año'),
        vacunaNombre: z
          .string()
          .optional()
          .describe('Filtrar por nombre de vacuna'),
        establecimientoNombre: z
          .string()
          .optional()
          .describe('Filtrar por nombre de establecimiento'),
      }),
      execute: async ({ mes, anio, vacunaNombre, establecimientoNombre }) => {
        const where: any = { mes, anio };
        if (vacunaNombre)
          where.vacuna = {
            nombre: { contains: vacunaNombre, mode: 'insensitive' },
          };
        if (establecimientoNombre)
          where.establecimiento = {
            nombre: { contains: establecimientoNombre, mode: 'insensitive' },
          };

        const movimientos = await prisma.movimientoVacuna.findMany({
          where,
          include: {
            vacuna: { select: { nombre: true } },
            establecimiento: {
              select: { nombre: true, codigo: true },
            },
            entregasAdicionales: {
              select: { cantidad: true, numeroEntrega: true },
            },
          },
          orderBy: [
            { establecimiento: { nombre: 'asc' } },
            { vacuna: { nombre: 'asc' } },
          ],
          take: 100,
        });

        return movimientos.map((m) => {
          const entregasAd = m.entregasAdicionales.reduce(
            (s, e) => s + e.cantidad,
            0,
          );
          const saldo =
            m.saldoAnterior +
            m.transIngreso -
            m.salida -
            m.transSalida +
            m.entrega;
          return {
            establecimiento: m.establecimiento.nombre,
            codigoEstab: m.establecimiento.codigo,
            vacuna: m.vacuna.nombre,
            saldoAnterior: m.saldoAnterior,
            transIngreso: m.transIngreso,
            salida: m.salida,
            transSalida: m.transSalida,
            entregaBase: m.entregaBase ?? m.entrega,
            entregasAdicionales: entregasAd,
            entregaTotal: m.entrega,
            saldoFinal: saldo,
            cantidadEntregasAdicionales: m.entregasAdicionales.length,
          };
        });
      },
    }),

    // ── 9. Planificación Anual ───────────────────────────────
    getPlanificacion: tool({
      description:
        'Consulta las planificaciones anuales de distribución de vacunas. Muestra meta anual, distribución mensual y estado.',
      inputSchema: z.object({
        anio: z.number().min(2020).max(2030).describe('Año'),
        vacunaNombre: z
          .string()
          .optional()
          .describe('Filtrar por nombre de vacuna'),
        estado: z
          .enum(['borrador', 'aprobado', 'ejecutado', 'todos'])
          .optional(),
      }),
      execute: async ({ anio, vacunaNombre, estado }) => {
        const where: any = { anio };
        if (vacunaNombre)
          where.vacuna = {
            nombre: { contains: vacunaNombre, mode: 'insensitive' },
          };
        if (estado && estado !== 'todos') where.estado = estado;

        const plans = await prisma.planificacionAnual.findMany({
          where,
          include: {
            vacuna: { select: { nombre: true } },
            establecimiento: {
              select: { nombre: true, codigo: true },
            },
          },
          orderBy: [
            { establecimiento: { nombre: 'asc' } },
            { vacuna: { nombre: 'asc' } },
          ],
          take: 100,
        });

        return plans.map((p) => ({
          establecimiento: p.establecimiento.nombre,
          vacuna: p.vacuna.nombre,
          anio: p.anio,
          metaAnual: p.metaAnual,
          distribucionMensual: p.distribucionMensual,
          totalDistribuido: p.distribucionMensual.reduce((s, v) => s + v, 0),
          estado: p.estado,
        }));
      },
    }),

    // ── 10. Alertas ─────────────────────────────────────────
    getAlertas: tool({
      description:
        'Obtiene alertas del sistema. Filtra por tipo (vencimiento, stock_bajo, discrepancia, sistema), nivel, o estado de lectura.',
      inputSchema: z.object({
        tipo: z
          .enum(['vencimiento', 'stock_bajo', 'discrepancia', 'sistema', 'todos'])
          .optional(),
        nivel: z
          .enum(['info', 'warning', 'error', 'success', 'todos'])
          .optional(),
        soloNoLeidas: z.boolean().optional().describe('true para solo no leídas'),
      }),
      execute: async ({ tipo, nivel, soloNoLeidas }) => {
        const where: any = {};
        if (tipo && tipo !== 'todos') where.tipo = tipo;
        if (nivel && nivel !== 'todos') where.nivel = nivel;
        if (soloNoLeidas) where.leida = false;

        const alertas = await prisma.alerta.findMany({
          where,
          orderBy: { fechaCreacion: 'desc' },
          take: 20,
        });

        return alertas.map((a) => ({
          titulo: a.titulo,
          descripcion: a.descripcion,
          tipo: a.tipo,
          nivel: a.nivel,
          leida: a.leida,
          fechaCreacion: fmtDate(a.fechaCreacion),
        }));
      },
    }),

    // ── 11. Usuarios ────────────────────────────────────────
    getUsuarios: tool({
      description:
        'Lista usuarios del sistema con su rol y estado. NO incluye contraseñas.',
      inputSchema: z.object({
        rol: z
          .enum([
            'administrador',
            'coordinador',
            'responsable_acopio',
            'operador',
            'todos',
          ])
          .optional(),
        estado: z.enum(['activo', 'inactivo', 'todos']).optional(),
      }),
      execute: async ({ rol, estado }) => {
        const where: any = {};
        if (rol && rol !== 'todos') where.rol = rol;
        if (estado && estado !== 'todos') where.estado = estado;
        else if (!estado) where.estado = 'activo';

        const usuarios = await prisma.usuario.findMany({
          where,
          select: {
            nombres: true,
            apellidos: true,
            usuario: true,
            email: true,
            rol: true,
            estado: true,
            ultimoAcceso: true,
            centroAcopio: { select: { nombre: true } },
          },
          orderBy: { nombres: 'asc' },
          take: 50,
        });

        return usuarios.map((u) => ({
          nombre: `${u.nombres} ${u.apellidos}`,
          usuario: u.usuario,
          email: u.email,
          rol: u.rol,
          estado: u.estado,
          ultimoAcceso: fmtDate(u.ultimoAcceso),
          centroAcopio: u.centroAcopio?.nombre || '-',
        }));
      },
    }),

    // ── 12. Kardex ──────────────────────────────────────────
    getKardex: tool({
      description:
        'Consulta el kardex (historial de movimientos de inventario por lote). Filtra por tipo de movimiento.',
      inputSchema: z.object({
        tipoMovimiento: z
          .enum(['ingreso', 'salida', 'transferencia', 'ajuste', 'todos'])
          .optional(),
        limite: z
          .number()
          .min(5)
          .max(50)
          .optional()
          .describe('Cantidad de registros (default 20)'),
      }),
      execute: async ({ tipoMovimiento, limite }) => {
        const where: any = {};
        if (tipoMovimiento && tipoMovimiento !== 'todos')
          where.tipoMovimiento = tipoMovimiento;

        const registros = await prisma.kardex.findMany({
          where,
          include: {
            usuario: { select: { nombres: true, apellidos: true } },
            establecimientoOrigen: { select: { nombre: true } },
            establecimientoDestino: { select: { nombre: true } },
          },
          orderBy: { fechaMovimiento: 'desc' },
          take: limite || 20,
        });

        return registros.map((k) => ({
          tipo: k.tipo,
          tipoMovimiento: k.tipoMovimiento,
          cantidad: k.cantidad,
          saldoAnterior: k.saldoAnterior,
          saldoActual: k.saldoActual,
          documento: `${k.documento} - ${k.numeroDocumento}`,
          origen: k.establecimientoOrigen?.nombre || '-',
          destino: k.establecimientoDestino?.nombre || '-',
          usuario: k.usuario
            ? `${k.usuario.nombres} ${k.usuario.apellidos}`
            : '-',
          fecha: fmtDate(k.fechaMovimiento),
          observaciones: k.observaciones || '-',
        }));
      },
    }),

    // ── 13. Vales de Entrega ────────────────────────────────
    getValesEntrega: tool({
      description:
        'Obtiene los vales de entrega generados. Filtra por período, centro de acopio, o estado.',
      inputSchema: z.object({
        mes: z.number().min(1).max(12).optional(),
        anio: z.number().min(2020).max(2030).optional(),
        estado: z
          .enum(['generado', 'impreso', 'entregado', 'todos'])
          .optional(),
      }),
      execute: async ({ mes, anio, estado }) => {
        const where: any = {};
        if (mes) where.mes = mes;
        if (anio) where.anio = anio;
        if (estado && estado !== 'todos') where.estado = estado;

        const vales = await prisma.valeEntrega.findMany({
          where,
          include: {
            centroAcopio: { select: { nombre: true } },
            usuario: { select: { nombres: true, apellidos: true } },
            _count: { select: { detalles: true } },
          },
          orderBy: { fechaGeneracion: 'desc' },
          take: 30,
        });

        return vales.map((v) => ({
          numero: v.numero,
          centroAcopio: v.centroAcopio.nombre,
          mes: v.mes,
          anio: v.anio,
          tipoVale: v.tipoVale,
          estado: v.estado,
          totalVacunas: v.totalVacunas,
          totalEstablecimientos: v.totalEstablecimientos,
          detalles: v._count.detalles,
          generadoPor: `${v.usuario.nombres} ${v.usuario.apellidos}`,
          fechaGeneracion: fmtDate(v.fechaGeneracion),
        }));
      },
    }),

    // ── 14. Stock Resumen ───────────────────────────────────
    getStockResumen: tool({
      description:
        'Resumen de stock actual por vacuna: cantidad total disponible, lotes, y estado general. Ideal para gráficos de distribución.',
      inputSchema: z.object({}),
      execute: async () => {
        const vacunas = await prisma.vacuna.findMany({
          where: { estado: 'activo' },
          include: {
            lotes: {
              where: { estado: 'disponible' },
              select: { cantidadActual: true, fechaVencimiento: true },
            },
          },
          orderBy: { nombre: 'asc' },
        });

        const now = new Date();
        const limite30d = new Date();
        limite30d.setDate(limite30d.getDate() + 30);

        return vacunas.map((v) => {
          const stock = v.lotes.reduce((s, l) => s + l.cantidadActual, 0);
          const lotesPorVencer = v.lotes.filter(
            (l) => l.fechaVencimiento <= limite30d && l.fechaVencimiento >= now,
          ).length;
          return {
            vacuna: v.nombre,
            stockTotal: stock,
            cantidadLotes: v.lotes.length,
            lotesPorVencer,
            estado:
              stock === 0
                ? '🔴 Sin stock'
                : lotesPorVencer > 0
                  ? '🟡 Con lotes por vencer'
                  : '🟢 Normal',
          };
        });
      },
    }),

    // ── 15. Estadísticas de Movimientos para Gráficos ───────
    getEstadisticasMovimientos: tool({
      description:
        'Obtiene datos de movimientos agrupados por mes para un año, ideal para generar gráficos de líneas o barras con tendencias.',
      inputSchema: z.object({
        anio: z.number().min(2020).max(2030).describe('Año a consultar'),
      }),
      execute: async ({ anio }) => {
        const meses = [
          'Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun',
          'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic',
        ];

        const data = await prisma.movimientoVacuna.groupBy({
          by: ['mes'],
          where: { anio },
          _sum: {
            entrega: true,
            salida: true,
            transIngreso: true,
            transSalida: true,
          },
          _count: true,
          orderBy: { mes: 'asc' },
        });

        return meses.map((nombre, i) => {
          const mesNum = i + 1;
          const found = data.find((d) => d.mes === mesNum);
          return {
            mes: nombre,
            entregas: found?._sum.entrega || 0,
            salidas: found?._sum.salida || 0,
            ingresosTransf: found?._sum.transIngreso || 0,
            salidasTransf: found?._sum.transSalida || 0,
            totalMovimientos: found?._count || 0,
          };
        });
      },
    }),

    // ── 16. Lotes de Jeringas ───────────────────────────────
    getLotesJeringas: tool({
      description: 'Obtiene los lotes de jeringas con estado y cantidades.',
      inputSchema: z.object({
        estado: z
          .enum(['disponible', 'agotado', 'todos'])
          .optional(),
      }),
      execute: async ({ estado }) => {
        const where: any = {};
        if (estado && estado !== 'todos') where.estado = estado;

        const lotes = await prisma.loteJeringa.findMany({
          where,
          include: {
            jeringa: { select: { tipo: true, capacidad: true, color: true } },
          },
          orderBy: { createdAt: 'desc' },
          take: 30,
        });

        return lotes.map((l) => ({
          numero: l.numero,
          jeringa: `${l.jeringa.tipo} ${l.jeringa.capacidad} (${l.jeringa.color})`,
          cantidadInicial: l.cantidadInicial,
          cantidadActual: l.cantidadActual,
          fechaIngreso: fmtDate(l.fechaIngreso),
          fechaVencimiento: fmtDate(l.fechaVencimiento),
          estado: l.estado,
          comprobante: `${l.comprobanteClase} - ${l.numeroComprobante}`,
        }));
      },
    }),
  };
}
