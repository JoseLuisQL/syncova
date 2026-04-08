/**
 * AI Provider Configuration
 * Configurable LLM provider using Vercel AI SDK
 * Integration: Gemini AI (@ai-sdk/google) and OpenAI-compatible APIs
 */

import { createGoogleGenerativeAI } from '@ai-sdk/google';
import { createOpenAICompatible } from '@ai-sdk/openai-compatible';

// ─── Configuration ───────────────────────────────────────────────

interface AIConfig {
  provider: string;
  apiKey: string;
  model: string;
  baseUrl?: string;
}

function getAIConfig(): AIConfig {
  const rawProvider = process.env.AI_PROVIDER || 'google';
  const provider = rawProvider.replace(/['"]/g, '').trim().toLowerCase();

  if (provider === 'openai-compatible') {
    const rawApiKey = process.env.AI_API_KEY || '';
    const apiKey = rawApiKey.replace(/['"]/g, '').trim();
    
    if (!apiKey) {
      console.warn('⚠️  AI_API_KEY no configurada para openai-compatible.');
    }
    return {
      provider,
      apiKey,
      model: (process.env.AI_MODEL || 'gpt-4o').replace(/['"]/g, '').trim(),
      baseUrl: (process.env.AI_BASE_URL || 'https://api.openai.com/v1').replace(/['"]/g, '').trim(),
    };
  }

  // Google defaults
  const apiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY || process.env.SIBOT_GOOGLE_API_KEY || '';
  const model = process.env.SIBOT_GOOGLE_MODEL || 'gemini-1.5-flash';

  if (!apiKey) {
    console.warn('⚠️  LLM API_KEY no configurada. SiBot no estará disponible.');
  }

  return { provider, apiKey, model };
}

// ─── Model Factory ───────────────────────────────────────────────

function createModel() {
  const config = getAIConfig();

  if (config.provider === 'openai-compatible') {
    const openaiCompatible = createOpenAICompatible({
      name: process.env.AI_PROVIDER_NAME?.replace(/['"]/g, '').trim() || 'openaiCompatible',
      apiKey: config.apiKey,
      baseURL: config.baseUrl,
      includeUsage: true,
    });
    return openaiCompatible(config.model);
  }

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
