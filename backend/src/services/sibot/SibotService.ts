/**
 * SaBot AI Agent Service
 * Orchestration layer: LLM + System Prompt + Tools → streamText
 */

import { streamText, stepCountIs } from 'ai';
import { getAIModel } from './aiConfig';
import { buildSystemPrompt } from './systemPrompt';
import { createSibotTools } from './tools';

export interface SibotMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export interface SibotUserContext {
  id: string;
  usuario: string;
  rol: string;
  centroAcopioId?: string;
  establecimientoId?: string;
}

export class SibotService {
  /**
   * Stream a chat response from the AI agent
   * Implements the full orchestration loop: perceive → reason → act
   */
  static async streamChat(messages: SibotMessage[], userContext: SibotUserContext): Promise<any> {
    const model = getAIModel();
    const systemPrompt = buildSystemPrompt(userContext);
    const tools = createSibotTools();

    const result = streamText({
      model,
      system: systemPrompt,
      messages: messages.map((m) => ({
        role: m.role as 'user' | 'assistant',
        content: m.content,
      })),
      tools,
      toolChoice: 'auto',
      stopWhen: stepCountIs(8), // Allow up to 8 tool calls per response for complex queries
      temperature: 0.3,
      maxOutputTokens: 4096,
    });

    return result;
  }
}
