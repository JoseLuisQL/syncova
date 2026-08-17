import { prisma } from '@/config/database';
import { MovimientosCalculationService } from '@/services/movimientos/MovimientosCalculationService';

jest.mock('@/config/database', () => ({
  prisma: {
    movimientoVacuna: {
      findUnique: jest.fn(),
      update: jest.fn(),
      create: jest.fn(),
      findFirst: jest.fn(),
    },
    planificacionAnual: {
      findUnique: jest.fn(),
    },
    usuario: {
      findFirst: jest.fn(),
    },
    $transaction: jest.fn(),
  },
}));

describe('MovimientosCalculationService - Entregas adicionales y sincronización de stock', () => {
  const prismaMock = prisma as unknown as {
    movimientoVacuna: {
      findUnique: jest.Mock;
      update: jest.Mock;
      create: jest.Mock;
      findFirst: jest.Mock;
    };
    planificacionAnual: {
      findUnique: jest.Mock;
    };
    usuario: {
      findFirst: jest.Mock;
    };
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('calcula la entrega total sumando entrega base y entregas adicionales', async () => {
    const movimientoId = 'mov-1';
    const tx = {
      movimientoVacuna: {
        findUnique: jest.fn().mockResolvedValue({
          id: movimientoId,
          entrega: 0,
          entregaBase: 0,
          entregasAdicionales: [
            { id: 'ea-1', numeroEntrega: 1, cantidad: 10 },
            { id: 'ea-2', numeroEntrega: 2, cantidad: 5 },
          ],
        }),
      },
    };

    const total = await MovimientosCalculationService.calcularEntregaTotal(tx, movimientoId);
    expect(total).toBe(15);
  });

  it('sincroniza el saldo anterior del mes siguiente considerando la entrega adicional', async () => {
    const establecimientoId = 'est-1';
    const vacunaId = 'vac-1';
    const mes = 7;
    const anio = 2026;

    // Movimiento actual (Mes 7)
    // Saldo anterior = 0, transIngreso = 0, salida = 0, transSalida = 0
    // entregaBase = 0, entregaAdicional #1 = 10 -> entregaTotal = 10
    // Stock calculado = 0 + 0 - 0 - 0 + 10 = 10
    prismaMock.movimientoVacuna.findUnique
      .mockResolvedValueOnce({
        id: 'mov-julio',
        establecimientoId,
        vacunaId,
        mes: 7,
        anio: 2026,
        saldoAnterior: 0,
        transIngreso: 0,
        salida: 0,
        transSalida: 0,
        entrega: 0,
        entregaBase: 0,
        entregasAdicionales: [{ id: 'ea-1', numeroEntrega: 1, cantidad: 10 }],
      })
      // Movimiento siguiente (Mes 8)
      .mockResolvedValueOnce({
        id: 'mov-agosto',
        establecimientoId,
        vacunaId,
        mes: 8,
        anio: 2026,
        saldoAnterior: 0,
        transIngreso: 0,
        salida: 0,
        transSalida: 0,
        entrega: 0,
        entregaBase: null,
        entregasAdicionales: [],
      })
      // Segundo llamado recursivo para mes 8 -> mes 9
      .mockResolvedValueOnce({
        id: 'mov-agosto',
        establecimientoId,
        vacunaId,
        mes: 8,
        anio: 2026,
        saldoAnterior: 10,
        transIngreso: 0,
        salida: 0,
        transSalida: 0,
        entrega: 0,
        entregaBase: null,
        entregasAdicionales: [],
      })
      // Movimiento mes 9
      .mockResolvedValueOnce({
        id: 'mov-septiembre',
        establecimientoId,
        vacunaId,
        mes: 9,
        anio: 2026,
        saldoAnterior: 10,
        transIngreso: 0,
        salida: 0,
        transSalida: 0,
        entrega: 0,
        entregaBase: null,
        entregasAdicionales: [],
      });

    prismaMock.movimientoVacuna.update.mockResolvedValue({});

    const result = await MovimientosCalculationService.sincronizarSaldoAnteriorSiguienteMes(
      establecimientoId,
      vacunaId,
      mes,
      anio
    );

    expect(result.success).toBe(true);
    expect(result.data?.stockCalculado).toBe(10);
    expect(result.data?.actualizado).toBe(true);

    // Verificar que se actualizó el movimiento de agosto con saldoAnterior = 10
    expect(prismaMock.movimientoVacuna.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: 'mov-agosto' },
        data: expect.objectContaining({
          saldoAnterior: 10,
        }),
      })
    );
  });
});
