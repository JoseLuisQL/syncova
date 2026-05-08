import { TipoMovimientoKardex } from '@prisma/client';
import { prisma } from '@/config/database';
import { AlmacenCentralService } from '@/services/AlmacenCentralService';
import { LoteVacunaService } from '@/services/LoteVacunaService';

jest.mock('@/config/database', () => ({
  prisma: {
    loteVacuna: {
      findUnique: jest.fn(),
      update: jest.fn(),
    },
    $transaction: jest.fn(),
  },
}));

jest.mock('@/services/AlmacenCentralService', () => ({
  AlmacenCentralService: {
    obtenerIdAlmacenCentral: jest.fn(),
  },
}));

describe('LoteVacunaService stock correction', () => {
  const prismaMock = prisma as unknown as {
    loteVacuna: {
      findUnique: jest.Mock;
      update: jest.Mock;
    };
    $transaction: jest.Mock;
  };

  const almacenCentralMock = AlmacenCentralService.obtenerIdAlmacenCentral as jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('persiste el nuevo stock y registra una corrección negativa en Kardex', async () => {
    const loteId = '11111111-1111-4111-8111-111111111111';
    const vacunaId = '22222222-2222-4222-8222-222222222222';
    const usuarioId = '33333333-3333-4333-8333-333333333333';
    const almacenCentralId = '44444444-4444-4444-8444-444444444444';
    const fechaVencimiento = new Date('2027-12-31');

    prismaMock.loteVacuna.findUnique.mockResolvedValue({
      id: loteId,
      numero: 'Y3HES31',
      vacunaId,
      fechaIngreso: new Date('2026-01-01'),
      fechaVencimiento,
      cantidadInicial: 200,
      cantidadActual: 154,
      estado: 'disponible',
    });
    almacenCentralMock.mockResolvedValue({ success: true, data: almacenCentralId });

    const tx = {
      loteVacuna: {
        update: jest.fn().mockResolvedValue({
          id: loteId,
          numero: 'Y3HES31',
          vacunaId,
          fechaVencimiento,
          cantidadInicial: 200,
          cantidadActual: 151,
          estado: 'disponible',
          vacuna: {
            id: vacunaId,
            nombre: 'AMA',
            tipo: 'VACUNA',
            presentacion: 'Frasco 10 dosis',
          },
        }),
      },
      kardex: {
        create: jest.fn().mockResolvedValue({}),
      },
    };
    prismaMock.$transaction.mockImplementation(async (callback) => callback(tx));

    const result = await LoteVacunaService.update(loteId, {
      cantidadActual: 151,
      usuarioId,
    });

    expect(result.success).toBe(true);
    expect(tx.loteVacuna.update).toHaveBeenCalledWith(expect.objectContaining({
      where: { id: loteId },
      data: expect.objectContaining({
        cantidadActual: 151,
        estado: 'disponible',
      }),
    }));
    expect(tx.kardex.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        tipo: 'vacuna',
        itemId: vacunaId,
        loteId,
        tipoMovimiento: TipoMovimientoKardex.ajuste,
        cantidad: -3,
        saldoAnterior: 154,
        saldoActual: 151,
        establecimientoOrigenId: almacenCentralId,
        establecimientoDestinoId: null,
        documento: 'CORRECCION_STOCK',
        numeroDocumento: 'Y3HES31',
        usuarioId,
      }),
    });
  });
});
