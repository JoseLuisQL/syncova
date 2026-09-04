import { TipoMovimientoKardex } from '@prisma/client';
import { prisma } from '@/config/database';
import { LoteVacunaService } from '@/services/LoteVacunaService';
import { HttpError } from '@/middleware/errorHandler';

jest.mock('@/config/database', () => ({
  prisma: {
    loteVacuna: {
      findUnique: jest.fn(),
      delete: jest.fn(),
      update: jest.fn(),
    },
    kardex: {
      findFirst: jest.fn(),
      deleteMany: jest.fn(),
    },
    $transaction: jest.fn(),
  },
}));

jest.mock('@/services/AlmacenCentralService', () => ({
  AlmacenCentralService: {
    obtenerIdAlmacenCentral: jest.fn(),
  },
}));

describe('LoteVacunaService - Protección contra descuadres y borrado', () => {
  const prismaMock = prisma as unknown as {
    loteVacuna: {
      findUnique: jest.Mock;
      delete: jest.Mock;
      update: jest.Mock;
    };
    kardex: {
      findFirst: jest.Mock;
      deleteMany: jest.Mock;
    };
    $transaction: jest.Mock;
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('delete', () => {
    const loteId = '11111111-1111-4111-8111-111111111111';

    it('bloquea la eliminación si el lote ya tiene dosis distribuidas (cantidadActual < cantidadInicial)', async () => {
      prismaMock.loteVacuna.findUnique.mockResolvedValue({
        id: loteId,
        numero: 'NT9592',
        cantidadInicial: 841,
        cantidadActual: 600, // 241 distribuidas
      });

      await expect(LoteVacunaService.delete(loteId)).rejects.toThrow(HttpError);
      await expect(LoteVacunaService.delete(loteId)).rejects.toThrow(
        /No se puede eliminar el lote porque ya tiene 241 dosis distribuidas/
      );

      expect(prismaMock.loteVacuna.delete).not.toHaveBeenCalled();
      expect(prismaMock.$transaction).not.toHaveBeenCalled();
    });

    it('bloquea la eliminación si el lote tiene movimientos de salida registrados en Kardex', async () => {
      prismaMock.loteVacuna.findUnique.mockResolvedValue({
        id: loteId,
        numero: 'AZ250063',
        cantidadInicial: 433,
        cantidadActual: 433,
      });

      prismaMock.kardex.findFirst.mockResolvedValue({
        id: 'kardex-1',
        loteId,
        tipoMovimiento: TipoMovimientoKardex.salida,
        documento: 'VALE_ENTREGA',
      });

      await expect(LoteVacunaService.delete(loteId)).rejects.toThrow(HttpError);
      await expect(LoteVacunaService.delete(loteId)).rejects.toThrow(
        /No se puede eliminar el lote porque cuenta con movimientos de salida o vales de entrega registrados en el Kardex/
      );

      expect(prismaMock.loteVacuna.delete).not.toHaveBeenCalled();
    });

    it('permite la eliminación segura en transacción de un lote intacto limpiando su ingreso en Kardex', async () => {
      prismaMock.loteVacuna.findUnique.mockResolvedValue({
        id: loteId,
        numero: 'LOTE-NUEVO-001',
        cantidadInicial: 100,
        cantidadActual: 100,
      });

      prismaMock.kardex.findFirst.mockResolvedValue(null);

      const tx = {
        kardex: {
          deleteMany: jest.fn().mockResolvedValue({ count: 1 }),
        },
        loteVacuna: {
          delete: jest.fn().mockResolvedValue({ id: loteId }),
        },
      };

      prismaMock.$transaction.mockImplementation(async (cb) => cb(tx));

      const result = await LoteVacunaService.delete(loteId);

      expect(result.success).toBe(true);
      expect(tx.kardex.deleteMany).toHaveBeenCalledWith({ where: { loteId } });
      expect(tx.loteVacuna.delete).toHaveBeenCalledWith({ where: { id: loteId } });
    });
  });

  describe('update - inmutabilidad de cantidadInicial en lotes distribuidos', () => {
    const loteId = '11111111-1111-4111-8111-111111111111';

    it('bloquea la modificación de cantidadInicial si el lote ya tiene dosis distribuidas', async () => {
      prismaMock.loteVacuna.findUnique.mockResolvedValue({
        id: loteId,
        numero: 'NT9592',
        cantidadInicial: 841,
        cantidadActual: 600,
        fechaIngreso: new Date('2026-06-15'),
        fechaVencimiento: new Date('2027-06-15'),
      });

      await expect(
        LoteVacunaService.update(loteId, {
          cantidadInicial: 800, // Intentar cambiar la cantidad inicial
        })
      ).rejects.toThrow(
        /No se puede modificar la cantidad inicial de un lote que ya tiene dosis distribuidas/
      );
    });
  });
});
