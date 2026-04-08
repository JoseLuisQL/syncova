import {
  SIBOT_CASUAL_KEYWORDS,
  SIBOT_DOMAIN_KEYWORDS,
  SIBOT_FOLLOW_UP_KEYWORDS,
  SIBOT_HELP_KEYWORDS,
  SIBOT_MAX_MESSAGE_CHARS,
  SIBOT_MUTATION_TARGET_KEYWORDS,
  SIBOT_UNSAFE_PATTERNS,
  SIBOT_WRITE_PATTERNS,
} from './constants';
import { SibotGuardrailResult } from './types';

function normalize(value: string): string {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/\s+/g, ' ')
    .trim();
}

function includesAny(haystack: string, values: string[]): boolean {
  return values.some((value) => haystack.includes(normalize(value)));
}

export class SibotGuardrailsService {
  static evaluatePrompt(prompt: string, recentMessages: string[] = []): SibotGuardrailResult {
    const trimmedPrompt = prompt.trim();

    if (!trimmedPrompt) {
      return {
        verdict: 'unsafe',
        reason: 'empty_prompt',
        message: 'Necesito una consulta concreta sobre SIVAC para continuar.',
        toolChoice: 'auto',
      };
    }

    if (trimmedPrompt.length > SIBOT_MAX_MESSAGE_CHARS) {
      return {
        verdict: 'unsafe',
        reason: 'prompt_too_long',
        message: 'La consulta es demasiado extensa. Resume tu solicitud y vuelve a intentarlo.',
        toolChoice: 'auto',
      };
    }

    if (SIBOT_UNSAFE_PATTERNS.some((pattern) => pattern.test(trimmedPrompt))) {
      return {
        verdict: 'unsafe',
        reason: 'prompt_injection_detected',
        message: 'No puedo procesar solicitudes que intenten alterar mis reglas, exponer secretos o mostrar instrucciones internas.',
        toolChoice: 'auto',
      };
    }

    const context = normalize([trimmedPrompt, ...recentMessages.slice(-6)].join(' '));
    const isCasual = includesAny(context, SIBOT_CASUAL_KEYWORDS);
    const isHelp = includesAny(context, SIBOT_HELP_KEYWORDS);
    const hasDomainKeyword = includesAny(context, SIBOT_DOMAIN_KEYWORDS);
    const isFollowUp = includesAny(context, SIBOT_FOLLOW_UP_KEYWORDS);
    const hasWriteIntent =
      SIBOT_WRITE_PATTERNS.some((pattern) => pattern.test(trimmedPrompt))
      && includesAny(context, SIBOT_MUTATION_TARGET_KEYWORDS);

    if (hasWriteIntent) {
      return {
        verdict: 'read_only_blocked',
        reason: 'write_intent_blocked',
        message: 'SiBot está en modo solo lectura. Puedo analizar, validar, explicar o diagnosticar, pero no ejecutar cambios en SIVAC.',
        toolChoice: 'auto',
      };
    }

    if (!hasDomainKeyword && !isFollowUp && !isHelp && !isCasual) {
      return {
        verdict: 'out_of_scope',
        reason: 'outside_sivac_domain',
        message: 'Solo puedo responder consultas relacionadas con SIVAC, sus módulos, sus datos y su operación técnica.',
        toolChoice: 'auto',
      };
    }

    if (isCasual || isHelp) {
      return {
        verdict: 'in_scope',
        reason: 'casual_or_help',
        toolChoice: 'auto',
      };
    }

    return {
      verdict: 'in_scope',
      reason: 'domain_query',
      toolChoice: 'required',
    };
  }

  static sanitizeForLog(value: string): string {
    return value.replace(/\s+/g, ' ').trim().slice(0, 300);
  }
}

export default SibotGuardrailsService;
