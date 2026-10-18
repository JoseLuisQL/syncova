import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import {
  ArrowCounterClockwise,
  ArrowUpRight,
  Check,
  Copy,
  PencilSimpleLine,
  User,
} from '@phosphor-icons/react';
import { SiBotChart } from './SiBotChart';
import { SiBotLogo } from './SiBotLogo';
import { SiBotTable } from './SiBotTable';

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
      <div className="mb-4 flex w-full flex-col items-end">
        <div className="flex max-w-[88%] flex-row-reverse items-start gap-2.5">
          <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border border-line bg-surface-soft text-muted-2">
            <User weight="bold" className="h-3.5 w-3.5" />
          </div>
          <div className="rounded-2xl rounded-tr-xs bg-ink px-3.5 py-2.5 text-[13px] font-medium leading-relaxed text-zinc-50">
            <p className="whitespace-pre-wrap break-words">{mainContent}</p>
          </div>
        </div>
      </div>
    );
  }

  const isWaitingFirstChunk = !mainContent.trim();

  return (
    <div className="group/message mb-5 flex w-full flex-col items-start">
      <div className="flex w-full items-start gap-2.5">
        {/* Avatar del Copiloto */}
        <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border border-brand/25 bg-surface-tint text-brand">
          <SiBotLogo className="h-4 w-4" />
        </div>

        {/* Contenedor de Respuesta Analítica */}
        <div className="min-w-0 flex-1">
          <div className="mb-1 flex items-center gap-1.5 text-[11px] font-medium text-muted">
            <span className="font-semibold text-ink">SiBot</span>
            <span aria-hidden="true">·</span>
            <span>{isStreaming || isWaitingFirstChunk ? 'Procesando consulta en tiempo real' : 'Asistente analítico SIVAC'}</span>
          </div>

          <div className="w-full overflow-x-hidden rounded-2xl rounded-tl-xs border border-line bg-surface px-4 py-3 text-[13px] leading-relaxed text-ink tabular-nums">
            {isWaitingFirstChunk ? (
              <div className="flex flex-col gap-2 py-1">
                <div className="flex items-center gap-2 text-xs font-semibold text-brand">
                  <span className="inline-block h-3.5 w-3.5 animate-spin rounded-full border-2 border-brand border-r-transparent" />
                  <span>Consultando base de datos SIVAC y verificando lotes...</span>
                </div>
                <div className="space-y-1.5 pt-1">
                  <div className="h-2.5 w-3/4 animate-pulse rounded bg-surface-soft" />
                  <div className="h-2.5 w-1/2 animate-pulse rounded bg-surface-soft" />
                </div>
              </div>
            ) : (
              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                components={{
                  pre: ({ children }) => (
                    <div className="my-0 max-w-full overflow-visible whitespace-normal">{children}</div>
                  ),
                  code({ inline, className, children, ...props }: any) {
                    const matchName = /language-(\w+)/.exec(className || '');
                    const language = matchName ? matchName[1] : '';
                    const contentString = String(children).replace(/\n$/, '');
                    const isChartFence =
                      className?.includes('chart:') || language?.startsWith('chart:');

                    if (!inline && (isChartFence || (language === 'json' && contentString.includes('"data"')))) {
                      let chartType = 'bar';
                      if (className?.includes('chart:')) {
                        chartType = className.split('chart:')[1]?.split(' ')[0] || 'bar';
                      } else if (language?.startsWith('chart:')) {
                        chartType = language.split(':')[1] || 'bar';
                      }

                      return (
                        <SiBotChart
                          payload={contentString}
                          type={chartType as any}
                          isStreaming={isStreaming}
                        />
                      );
                    }

                    return !inline ? (
                      <div className="my-3 max-w-full overflow-x-auto rounded-xl border border-[#2b2f37] bg-ink p-3.5 font-mono text-xs text-zinc-200 tabular-nums">
                        <code className={className} {...props}>
                          {children}
                        </code>
                      </div>
                    ) : (
                      <code
                        className="rounded-md border border-line bg-surface-soft px-1.5 py-0.5 font-mono text-xs font-semibold text-ink tabular-nums"
                        {...props}
                      >
                        {children}
                      </code>
                    );
                  },
                  p: ({ children }) => <p className="mb-2.5 last:mb-0 leading-relaxed">{children}</p>,
                  ul: ({ children }) => (
                    <ul className="mb-2.5 list-disc space-y-1 pl-5 marker:text-muted">{children}</ul>
                  ),
                  ol: ({ children }) => (
                    <ol className="mb-2.5 list-decimal space-y-1 pl-5 font-medium marker:text-muted">
                      {children}
                    </ol>
                  ),
                  li: ({ children }) => <li className="leading-relaxed">{children}</li>,
                  h3: ({ children }) => (
                    <h3 className="mb-2 mt-4 first:mt-0 text-sm font-semibold tracking-tight text-ink">
                      {children}
                    </h3>
                  ),
                  h4: ({ children }) => (
                    <h4 className="mb-1.5 mt-3 first:mt-0 text-[13px] font-semibold tracking-tight text-ink">
                      {children}
                    </h4>
                  ),
                  table: ({ children }) => <SiBotTable>{children}</SiBotTable>,
                  thead: ({ children }) => <thead className="bg-surface-soft">{children}</thead>,
                  tbody: ({ children }) => <tbody className="divide-y divide-line/60 bg-surface">{children}</tbody>,
                  th: ({ children }) => (
                    <th className="whitespace-nowrap border-b border-line bg-surface-soft px-3 py-2 text-[11px] font-semibold text-muted-2">
                      {children}
                    </th>
                  ),
                  td: ({ children }) => (
                    <td className="px-3 py-2 text-xs font-medium text-ink tabular-nums">{children}</td>
                  ),
                  strong: ({ children }) => <strong className="font-semibold text-ink">{children}</strong>,
                }}
              >
                {mainContent}
              </ReactMarkdown>
            )}
          </div>

          {/* Barra de utilidades del mensaje (Copiar, Refinar, Regenerar) */}
          {!isWaitingFirstChunk && !isStreaming && (
            <div className="mt-1.5 flex items-center gap-1 opacity-90 transition-opacity sm:opacity-75 sm:group-hover/message:opacity-100">
              <button
                type="button"
                onClick={() => void handleCopy()}
                className="inline-flex items-center gap-1 whitespace-nowrap shrink-0 rounded-lg px-2 py-1 text-[11px] font-medium text-muted-2 transition-colors hover:bg-surface-soft hover:text-ink"
                title="Copiar respuesta"
              >
                {copied ? (
                  <>
                    <Check className="h-3.5 w-3.5 text-emerald-600" weight="bold" />
                    <span className="text-emerald-600">Copiado</span>
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
                  onClick={() => onQuotePrompt('Profundiza en el análisis anterior mostrando el detalle por lote y establecimiento: ')}
                  className="inline-flex items-center gap-1 whitespace-nowrap shrink-0 rounded-lg px-2 py-1 text-[11px] font-medium text-muted-2 transition-colors hover:bg-surface-soft hover:text-ink"
                  title="Profundizar análisis en el campo de consulta"
                >
                  <PencilSimpleLine className="h-3.5 w-3.5" />
                  <span>Profundizar</span>
                </button>
              )}

              {isLastAssistant && onRegenerate && (
                <button
                  type="button"
                  onClick={onRegenerate}
                  className="inline-flex items-center gap-1 whitespace-nowrap shrink-0 rounded-lg px-2 py-1 text-[11px] font-medium text-muted-2 transition-colors hover:bg-surface-soft hover:text-ink"
                  title="Volver a generar respuesta"
                >
                  <ArrowCounterClockwise className="h-3.5 w-3.5" />
                  <span>Regenerar</span>
                </button>
              )}
            </div>
          )}

          {/* Consultas de seguimiento sugeridas por el modelo */}
          {formattedSuggestions.length > 0 && !isStreaming && (
            <div className="mt-2.5 flex flex-col gap-1.5">
              <span className="text-[11px] font-medium text-muted">
                Consultas de seguimiento
              </span>
              <div className="flex flex-wrap gap-1.5">
                {formattedSuggestions.map((suggestionText, idx) => (
                  <button
                    type="button"
                    key={idx}
                    onClick={() => onSuggestionSelect && onSuggestionSelect(suggestionText)}
                    className="group/chip inline-flex max-w-full items-center gap-1.5 rounded-xl border border-line bg-surface px-3 py-1.5 text-left text-xs font-medium text-muted-2 transition-colors hover:border-brand/40 hover:bg-surface-tint/30 hover:text-ink"
                  >
                    <span className="truncate">{suggestionText}</span>
                    <ArrowUpRight
                      weight="bold"
                      className="h-3.5 w-3.5 shrink-0 text-brand transition-transform group-hover/chip:translate-x-0.5 group-hover/chip:-translate-y-0.5"
                    />
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
