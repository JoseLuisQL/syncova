/**
 * AI Provider Configuration
 * Configurable LLM provider using Vercel AI SDK
 * Integration: Gemini AI (@ai-sdk/google)
 */

import { createGoogleGenerativeAI } from '@ai-sdk/google';

// ─── Configuration ───────────────────────────────────────────────

interface AIConfig {
  provider: string;
  apiKey: string;
  model: string;
}

function getAIConfig(): AIConfig {
  const provider = 'google';
  const apiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY || process.env.SIBOT_GOOGLE_API_KEY || '';
  const model = process.env.SIBOT_GOOGLE_MODEL || 'gemini-2.5-flash';

  if (!apiKey) {
    console.warn('⚠️  LLM API_KEY no configurada. SiBot no estará disponible.');
  }

  return { provider, apiKey, model };
}

// ─── Model Factory ───────────────────────────────────────────────

function createModel() {
  const config = getAIConfig();

  const google = createGoogleGenerativeAI({
    apiKey: config.apiKey,
  });

  return google(config.model);
}

// ─── Exports ─────────────────────────────────────────────────────

let _model: ReturnType<typeof createModel> | null = null;

export function getAIModel() {
  if (!_model) {
    _model = createModel();
    const config = getAIConfig();
    console.log(`🤖 SiBot AI configurado: provider=${config.provider}, model=${config.model}`);
  }
  return _model;
}

export function isAIConfigured(): boolean {
  const config = getAIConfig();
  return !!config.apiKey;
}
