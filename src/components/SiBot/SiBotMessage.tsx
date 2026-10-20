import React, { useState } from 'react';
import {
  ArrowCounterClockwise,
  ArrowUpRight,
  Check,
  Copy,
  PencilSimpleLine,
} from '@phosphor-icons/react';
import { SiBotLogo } from './SiBotLogo';
import { SiBotMarkdown } from './SiBotMarkdown';

interface SiBotMessageProps {
  messageRole: 'user' | 'assistant' | 'system' | 'data';
  content: string;
  onSuggestionSelect?: (text: string) => void;
  onQuotePrompt?: (text: string) => void;
  onRegenerate?: () => void;
  isLastAssistant?: boolean;
  isStreaming?: boolean;
}

export const SiBotMessage: React.FC<SiBotMessageProps> = ({
  messageRole,
  content,
  onSuggestionSelect,
  onQuotePrompt,
  onRegenerate,
  isLastAssistant = false,
  isStreaming = false,
}) => {
  const [copied, setCopied] = useState(false);

  if (messageRole === 'system' || messageRole === 'data') return null;

  const isUser = messageRole === 'user';

  const suggestionRegex = /---\s*\n*\s*\*\*(?:💡\s*)?Sugerencias:\*\*\s*\n([\s\S]*)/i;
  const match = content.match(suggestionRegex);

  let mainContent = content;
  let formattedSuggestions: string[] = [];

  if (match) {
    mainContent = content.substring(0, match.index!).trim();
    if (match[1]) {
      formattedSuggestions = match[1]
        .split('\n')
        .map((line) => line.replace(/^-\s*/, '').replace(/^\[/, '').replace(/\]$/, '').trim())
        .filter((line) => line.length > 5);
    }
  }

  const handleCopy = async () => {
    if (!mainContent.trim()) return;
    try {
      await navigator.clipboard.writeText(mainContent);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      // Ignore clipboard failures silently
    }
  };

  if (isUser) {
    return (
      <div className="flex w-full justify-end font-sans">
        <div className="max-w-[86%] rounded-2xl rounded-tr-xs bg-surface-tint px-4 py-2.5 text-[13.5px] font-medium leading-relaxed text-ink">
          <p className="whitespace-pre-wrap break-words">{mainContent}</p>
        </div>
      </div>
    );
  }

  const isWaitingFirstChunk = !mainContent.trim();

  return (
    <article className="group/message flex w-full flex-col items-start font-sans">
      {/* Encabezado minimalista sin bordes */}
      <div className="mb-2 flex w-full items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-md bg-surface-tint text-brand">
            <SiBotLogo className="h-3.5 w-3.5" />
          </span>
          <span className="text-xs font-semibold tracking-[-0.01em] text-ink">SiBot</span>
          {(isStreaming || isWaitingFirstChunk) && (
            <>
              <span className="text-xs text-muted" aria-hidden="true">·</span>
              <span className="text-[11.5px] font-normal text-muted-2">Analizando datos...</span>
            </>
          )}
        </div>
      </div>

      {/* Renderizador de Markdown optimizado */}
      {isWaitingFirstChunk ? (
        <div className="flex w-full flex-col gap-2 py-1.5">
          <div className="h-2.5 w-3/4 animate-pulse rounded bg-surface-soft" />
          <div className="h-2.5 w-1/2 animate-pulse rounded bg-surface-soft" />
        </div>
      ) : (
        <SiBotMarkdown content={mainContent} isStreaming={isStreaming} />
      )}

      {/* Acciones minimalistas sin bordes */}
      {!isWaitingFirstChunk && !isStreaming && (
        <div className="mt-2 flex items-center gap-1 -ml-1.5 opacity-85 transition-opacity sm:opacity-65 sm:group-hover/message:opacity-100">
          <button
            type="button"
            onClick={() => void handleCopy()}
            className="inline-flex items-center gap-1 whitespace-nowrap shrink-0 rounded-md px-2 py-1 text-[11.5px] font-medium text-muted-2 transition-colors hover:bg-surface-soft hover:text-ink"
            title="Copiar respuesta"
          >
            {copied ? (
              <>
                <Check className="h-3.5 w-3.5 text-[rgb(var(--color-status-success-text))]" weight="bold" />
                <span className="text-[rgb(var(--color-status-success-text))]">Copiado</span>
              </>
            ) : (
              <>
                <Copy className="h-3.5 w-3.5" />
                <span>Copiar</span>
              </>
            )}
          </button>

          {onQuotePrompt && (
            <button
              type="button"
              onClick={() =>
                onQuotePrompt('Profundiza en el análisis anterior mostrando el detalle por lote y establecimiento: ')
              }
              className="inline-flex items-center gap-1 whitespace-nowrap shrink-0 rounded-md px-2 py-1 text-[11.5px] font-medium text-muted-2 transition-colors hover:bg-surface-soft hover:text-ink"
              title="Profundizar análisis"
            >
              <PencilSimpleLine className="h-3.5 w-3.5" />
              <span>Profundizar</span>
            </button>
          )}

          {isLastAssistant && onRegenerate && (
            <button
              type="button"
              onClick={onRegenerate}
              className="inline-flex items-center gap-1 whitespace-nowrap shrink-0 rounded-md px-2 py-1 text-[11.5px] font-medium text-muted-2 transition-colors hover:bg-surface-soft hover:text-ink"
              title="Regenerar respuesta"
            >
              <ArrowCounterClockwise className="h-3.5 w-3.5" />
              <span>Regenerar</span>
            </button>
          )}
        </div>
      )}

      {/* Consultas de seguimiento sin bordes pesados */}
      {formattedSuggestions.length > 0 && !isStreaming && (
        <div className="mt-3 flex w-full flex-col gap-1">
          {formattedSuggestions.slice(0, 3).map((suggestionText, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => onSuggestionSelect && onSuggestionSelect(suggestionText)}
              className="group/chip flex w-full items-center justify-between gap-2 rounded-xl bg-surface-soft/75 px-3 py-2 text-left text-xs font-medium text-muted-2 transition-colors hover:bg-surface-tint/60 hover:text-ink"
            >
              <span className="truncate">{suggestionText}</span>
              <ArrowUpRight
                weight="bold"
                className="h-3.5 w-3.5 shrink-0 text-muted transition-transform group-hover/chip:translate-x-0.5 group-hover/chip:-translate-y-0.5 group-hover/chip:text-brand"
              />
            </button>
          ))}
        </div>
      )}
    </article>
  );
};
