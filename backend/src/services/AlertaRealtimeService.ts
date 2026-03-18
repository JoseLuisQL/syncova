import { Response } from 'express';
import { randomUUID } from 'crypto';

interface StreamClient {
  id: string;
  userId: string;
  response: Response;
  heartbeat: NodeJS.Timeout;
}

export class AlertaRealtimeService {
  private static clients = new Map<string, StreamClient>();

  static addClient(userId: string, response: Response): string {
    const clientId = randomUUID();

    response.setHeader('Content-Type', 'text/event-stream');
    response.setHeader('Cache-Control', 'no-cache, no-transform');
    response.setHeader('Connection', 'keep-alive');
    response.setHeader('X-Accel-Buffering', 'no');
    response.flushHeaders?.();

    response.write(`event: connected\n`);
    response.write(`data: ${JSON.stringify({ connected: true, timestamp: new Date().toISOString() })}\n\n`);

    const heartbeat = setInterval(() => {
      try {
        response.write(`event: ping\n`);
        response.write(`data: ${JSON.stringify({ timestamp: new Date().toISOString() })}\n\n`);
      } catch {
        this.removeClient(clientId);
      }
    }, 30000);

    this.clients.set(clientId, {
      id: clientId,
      userId,
      response,
      heartbeat,
    });

    response.on('close', () => {
      this.removeClient(clientId);
    });

    return clientId;
  }

  static removeClient(clientId: string): void {
    const client = this.clients.get(clientId);
    if (!client) return;

    clearInterval(client.heartbeat);
    this.clients.delete(clientId);
  }

  static notifyAlertasChanged(reason: string, payload?: Record<string, unknown>): void {
    const eventPayload = JSON.stringify({
      reason,
      timestamp: new Date().toISOString(),
      ...payload,
    });

    for (const [clientId, client] of this.clients.entries()) {
      try {
        client.response.write(`event: alertas:update\n`);
        client.response.write(`data: ${eventPayload}\n\n`);
      } catch {
        this.removeClient(clientId);
      }
    }
  }
}

export default AlertaRealtimeService;
