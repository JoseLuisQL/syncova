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

      let totalGeneratedLength = 0;

      for await (const textPart of result.textStream) {
        if (textPart) {
          totalGeneratedLength += textPart.length;
        }
        res.write(textPart);
      }

      // Si el flujo terminó sin texto, inspeccionamos los pasos para dar un diagnóstico más preciso.
      if (totalGeneratedLength === 0) {
        const isCompatible = process.env.AI_PROVIDER === 'openai-compatible';
        const steps = await result.steps.catch(() => null);
        const finalStep = steps?.[steps.length - 1];
        const endedInToolCalls = finalStep?.finishReason === 'tool-calls';

        if (steps?.length) {
          console.warn(
            '⚠️ SaBot finalizó sin texto. Resumen de pasos:',
            steps.map((step: any) => ({
              stepNumber: step.stepNumber,
              finishReason: step.finishReason,
              toolCalls: step.toolCalls?.length ?? 0,
              toolResults: step.toolResults?.length ?? 0,
            })),
          );
        }

        if (isCompatible) {
          const detail = endedInToolCalls
            ? 'El proveedor aceptó la herramienta, pero no completó la respuesta final posterior a la Tool Call.'
            : 'El proveedor no devolvió texto final utilizable para el chat.';

          res.write('\n\n> ⚠️ **Respuesta incompleta del Modelo LLM (OpenAI-Compatible)**\n> ' + detail + ' Modelo actual: `' + (process.env.AI_MODEL || '') + '`.\n\n**Acción recomendada:** verifica que tu proveedor OpenAI-Compatible soporte ciclos multi-step de *Tool Calls* en `/chat/completions` y revisa los logs del backend para el detalle técnico.');
        } else {
          res.write('\n\n> ⚠️ **Límite de Consultas (Cuota)**\n> No se pudo recibir la respuesta del Modelo de Datos. Has agotado la cuota límite o la red falló.\n\n**Solución:** Por favor, espera **1 a 2 minutos** para volver a intentarlo o solicita al Administrador revisar la Key.');
        }
      }

      res.end();
    } catch (error: unknown) {
      console.error('❌ Error en SaBot chat:', error);

      const errorMessage = error instanceof Error ? error.message : String(error);
      const isQuotaError = errorMessage.toLowerCase().includes('quota') || errorMessage.includes('429');

      // If headers not sent yet, send standard JSON error response
      if (!res.headersSent) {
        res.status(isQuotaError ? 429 : 500).json({
          success: false,
          message: isQuotaError ? 'Límite de peticiones de inteligencia artificial alcanzado.' : 'Error interno del agente SaBot.',
          error: errorMessage,
        });
        return;
      }

      // If stream has already started, write the error as markdown straight to the chat UI
      const userFriendlyMessage = isQuotaError
        ? '\n\n> ⚠️ **Límite de uso alcanzado**\n> Has consumido la cuota rápida de la capa gratuita del Agente (Generative AI Rate Limit).\n\n**Solución:** Por favor, espera **1 a 2 minutos** para volver a realizar consultas, el servicio se restaurará automáticamente.'
        : '\n\n> ❌ **Error en el razonamiento del Agente**\n> Ocurrió una interrupción de red al intentar procesar la respuesta. Por favor, reformula tu pregunta.';

      res.write(userFriendlyMessage);
      res.end();
    }
  }
}
