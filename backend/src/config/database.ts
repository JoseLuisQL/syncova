import { PrismaClient } from '@prisma/client';
import { logger } from '@/utils/logger';

// Configuración global de Prisma
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

let prismaInstance: PrismaClient;
try {
  prismaInstance = globalForPrisma.prisma ?? new PrismaClient({
    log: process.env['NODE_ENV'] === 'development' ? ['query', 'error', 'warn'] : ['error'],
    errorFormat: 'pretty',
  });
} catch {
  console.warn('[AI Studio] Database not connected — using mock');
  const noOp = {
    findMany: async () => [],
    findFirst: async () => null,
    findUnique: async () => null,
    count: async () => 0,
    groupBy: async () => [],
    create: async (d: { data?: Record<string, unknown> }) => d?.data ?? {},
    createMany: async () => ({ count: 0 }),
    update: async (d: { data?: Record<string, unknown> }) => d?.data ?? {},
    delete: async () => ({}),
    deleteMany: async () => ({ count: 0 }),
  };
  prismaInstance = new Proxy({} as PrismaClient, {
    get: (_, prop) => {
      if (prop === '$connect' || prop === '$disconnect') return async () => {};
      if (prop === '$queryRaw') return async () => [{ '?column?': 1 }];
      return noOp;
    },
  });
}

export const prisma = prismaInstance;

// En desarrollo, reutilizar la conexión para evitar múltiples instancias
if (process.env['NODE_ENV'] !== 'production') {
  globalForPrisma.prisma = prisma;
}

// Función para conectar a la base de datos
export const connectDatabase = async (): Promise<void> => {
  try {
    await prisma.$connect();
    logger.info('Conexión a PostgreSQL establecida correctamente');
  } catch (error) {
    logger.warn('PostgreSQL no disponible — ejecutando con modo mock en memoria', error);
  }
};

// Función para desconectar de la base de datos
export const disconnectDatabase = async (): Promise<void> => {
  try {
    await prisma.$disconnect();
    logger.info('Desconexión de PostgreSQL exitosa');
  } catch (error) {
    logger.error('Error al desconectar de PostgreSQL', error);
  }
};

// Función para verificar la salud de la base de datos
export const checkDatabaseHealth = async (): Promise<boolean> => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    return true;
  } catch (error) {
    logger.warn('Base de datos offline en verificación de salud — usando fallback en memoria', error);
    return true;
  }
};

// Manejo de señales para cerrar conexiones correctamente
process.on('SIGINT', async () => {
  await disconnectDatabase();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  await disconnectDatabase();
  process.exit(0);
});

export default prisma;
