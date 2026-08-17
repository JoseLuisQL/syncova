import { prisma } from '@/config/database';
import { JeringaService } from '@/services/JeringaService';

jest.mock('@/config/database', () => ({
  prisma: {
    jeringa: {
      findFirst: jest.fn(),
      findUnique: jest.fn(),
      findMany: jest.fn(),
      count: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
  },
}));

describe('JeringaService - Manual entry and validation', () => {
  const prismaMock = prisma as unknown as {
    jeringa: {
      findFirst: jest.Mock;
      findUnique: jest.Mock;
      findMany: jest.Mock;
      count: jest.Mock;
      create: jest.Mock;
      update: jest.Mock;
      delete: jest.Mock;
    };
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('permite crear una jeringa con valores personalizados manualmente', async () => {
    prismaMock.jeringa.findFirst.mockResolvedValue(null);
    prismaMock.jeringa.create.mockResolvedValue({
      id: '11111111-1111-4111-8111-111111111111',
      tipo: 'Auto-destructible (AD)',
      capacidad: '0.5 ml - 23G',
      color: 'Azul cielo',
      estado: 'activo',
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    const result = await JeringaService.create({
      tipo: '  Auto-destructible (AD)  ',
      capacidad: '  0.5 ml - 23G  ',
      color: '  Azul cielo  ',
    });

    expect(result.success).toBe(true);
    expect(prismaMock.jeringa.create).toHaveBeenCalledWith({
      data: {
        tipo: 'Auto-destructible (AD)',
        capacidad: '0.5 ml - 23G',
        color: 'Azul cielo',
      },
    });
  });

  it('rechaza si tipo, capacidad o color están vacíos', async () => {
    const resultTipoVacio = await JeringaService.create({
      tipo: '   ',
      capacidad: '1 ml',
      color: 'Transparente',
    });
    expect(resultTipoVacio.success).toBe(false);
    expect(resultTipoVacio.error).toContain('tipo de jeringa');

    const resultCapacidadVacia = await JeringaService.create({
      tipo: 'Desechable',
      capacidad: '   ',
      color: 'Transparente',
    });
    expect(resultCapacidadVacia.success).toBe(false);
    expect(resultCapacidadVacia.error).toContain('capacidad');

    const resultColorVacio = await JeringaService.create({
      tipo: 'Desechable',
      capacidad: '1 ml',
      color: '   ',
    });
    expect(resultColorVacio.success).toBe(false);
    expect(resultColorVacio.error).toContain('color');
  });

  it('rechaza si ya existe una jeringa con la misma combinación tipo/capacidad/color', async () => {
    prismaMock.jeringa.findFirst.mockResolvedValue({
      id: 'existing-id',
      tipo: 'Desechable',
      capacidad: '1 ml',
      color: 'Transparente',
    });

    const result = await JeringaService.create({
      tipo: 'Desechable',
      capacidad: '1 ml',
      color: 'Transparente',
    });

    expect(result.success).toBe(false);
    expect(result.error).toContain('Ya existe una jeringa registrada');
  });

  it('permite actualizar una jeringa con datos editados manualmente', async () => {
    const jeringaId = '11111111-1111-4111-8111-111111111111';
    prismaMock.jeringa.findUnique.mockResolvedValue({
      id: jeringaId,
      tipo: 'Desechable',
      capacidad: '1 ml',
      color: 'Transparente',
      estado: 'activo',
    });
    prismaMock.jeringa.findFirst.mockResolvedValue(null);
    prismaMock.jeringa.update.mockResolvedValue({
      id: jeringaId,
      tipo: 'De seguridad AD',
      capacidad: '0.3 ml',
      color: 'Naranja',
      estado: 'inactivo',
    });

    const result = await JeringaService.update(jeringaId, {
      tipo: '  De seguridad AD  ',
      capacidad: ' 0.3 ml ',
      color: ' Naranja ',
      estado: 'inactivo',
    });

    expect(result.success).toBe(true);
    expect(prismaMock.jeringa.update).toHaveBeenCalledWith({
      where: { id: jeringaId },
      data: {
        tipo: 'De seguridad AD',
        capacidad: '0.3 ml',
        color: 'Naranja',
        estado: 'inactivo',
      },
    });
  });
});
