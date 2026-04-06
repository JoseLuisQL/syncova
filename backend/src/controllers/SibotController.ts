/**
 * SaBot AI Controller
 * Handles POST /api/sibot/chat with streaming response
 */

import { Response } from 'express';
import { AuthenticatedRequest } from '@/types';
import { SibotService } from '@/services/sibot/SibotService';
import { isAIConfigured } from '@/services/sibot/aiConfig';

export class SibotController {
  /**
   * POST /api/sibot/chat
   * Receives messages array, returns text stream
   */
  static async chat(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      // Verify AI is configured
      if (!isAIConfigured()) {
        res.status(503).json({
          success: false,
          message: 'SaBot no está configurado. Contacte al administrador.',
        });
        return;
      }

      // Verify user is admin
      if (!req.user || req.user.rol !== 'administrador') {
        res.status(403).json({
          success: false,
          message: 'SaBot solo está disponible para administradores.',
        });
        return;
      }

      const { messages } = req.body;

      if (!messages || !Array.isArray(messages) || messages.length === 0) {
        res.status(400).json({
          success: false,
          message: 'Se requiere un array de mensajes.',
        });
        return;
      }

      // Validate message format
      for (const msg of messages) {
        if (!msg.role || !msg.content) {
          res.status(400).json({
            success: false,
            message: 'Cada mensaje debe tener role y content.',
          });
          return;
        }
        if (!['user', 'assistant', 'system'].includes(msg.role)) {
          res.status(400).json({
            success: false,
            message: 'role debe ser user, assistant o system.',
          });
          return;
        }
      }

      // Build user context from authenticated user
      const userContext = {
        id: req.user.id,
        usuario: req.user.usuario,
        rol: req.user.rol,
        centroAcopioId: req.user.centroAcopioId,
        establecimientoId: req.user.establecimientoId,
      };

      const result = await SibotService.streamChat(messages, userContext);

      res.setHeader('Content-Type', 'text/plain; charset=utf-8');
      res.setHeader('Cache-Control', 'no-cache, no-transform');
      res.setHeader('X-Accel-Buffering', 'no');

      for await (const textPart of result.textStream) {
        res.write(textPart);
      }

      res.end();
    } catch (error: unknown) {
      console.error('❌ Error en SaBot chat:', error);

      // If headers not sent yet, send error response
      if (!res.headersSent) {
        res.status(500).json({
          success: false,
          message: 'Error interno del agente SaBot.',
          error: error instanceof Error ? error.message : 'Error desconocido',
        });
      }
    }
  }
}
