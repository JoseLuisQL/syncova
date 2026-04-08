import { prisma } from '@/config/database';
import { Prisma } from '@prisma/client';
import {
  SibotCitation,
  SibotToolExecutionLog,
} from './types';

function toJsonValue(value: unknown): Prisma.InputJsonValue | Prisma.NullableJsonNullValueInput {
  if (value === undefined || value === null) {
    return Prisma.JsonNull;
  }

  return value as Prisma.InputJsonValue;
}

export class SibotStorageService {
  static validateSessionId(sessionId: string): boolean {
    return /^[a-zA-Z0-9_-]{8,120}$/.test(sessionId);
  }

  static async ensureSession(localSessionId: string, usuarioId: string) {
    const existing = await prisma.sibotSession.findUnique({
      where: { localSessionId },
    });

    if (existing) {
      if (existing.usuarioId !== usuarioId) {
        throw new Error('La sesión solicitada no pertenece al usuario autenticado.');
      }

      return prisma.sibotSession.update({
        where: { id: existing.id },
        data: { updatedAt: new Date() },
      });
    }

    return prisma.sibotSession.create({
      data: {
        localSessionId,
        usuarioId,
      },
    });
  }

  static async logSecurityEvent(
    sessionId: string,
    usuarioId: string,
    payload: {
      type: string;
      severity: 'warning' | 'error';
      detail?: Record<string, unknown>;
    },
  ): Promise<void> {
    const session = await this.ensureSession(sessionId, usuarioId);

    await prisma.sibotSecurityEvent.create({
      data: {
        sessionId: session.id,
        usuarioId,
        tipo: payload.type,
        severidad: payload.severity,
        detalle: toJsonValue(payload.detail),
      },
    });
  }

  static async logToolExecution(
    sessionId: string,
    usuarioId: string,
    log: SibotToolExecutionLog,
  ): Promise<void> {
    const session = await this.ensureSession(sessionId, usuarioId);

    await prisma.sibotToolExecution.create({
      data: {
        sessionId: session.id,
        usuarioId,
        toolName: log.toolName,
        status: log.status,
        filtersApplied: toJsonValue(log.filtersApplied),
        evidence: toJsonValue({
          summary: log.summary,
          citations: (log.citations || []).map((citation: SibotCitation) => ({
            module: citation.module,
            source: citation.source,
            title: citation.title,
            period: citation.period || null,
          })),
          period: log.period || null,
        }),
        recordCount: log.recordCount ?? null,
        durationMs: log.durationMs ?? null,
      },
    });
  }
}

export default SibotStorageService;
