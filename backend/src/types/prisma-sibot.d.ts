import '@prisma/client';

declare module '@prisma/client' {
  interface PrismaClient {
    sibotSession: any;
    sibotSecurityEvent: any;
    sibotToolExecution: any;
  }
}
