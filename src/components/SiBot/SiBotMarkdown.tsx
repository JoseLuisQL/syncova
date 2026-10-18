import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Check, Copy, TerminalWindow } from '@phosphor-icons/react';
import { SiBotChart } from './SiBotChart';
import { SiBotTable } from './SiBotTable';

interface SiBotMarkdownProps {
  content: string;
  isStreaming?: boolean;
}

interface CodeBlockProps {
  language: string;
  code: string;
}

const CodeBlock: React.FC<CodeBlockProps> = ({ language, code }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      // Ignore clipboard errors silently
    }
  };

  const displayLang = language && language !== 'text' ? language : 'código';

  return (
    <div className="my-3 w-full overflow-hidden rounded-xl bg-surface-soft/80">
      <div className="flex items-center justify-between gap-2 px-3.5 py-1.5 text-[11px] text-muted-2">
        <div className="flex items-center gap-1.5 font-mono">
          <TerminalWindow className="h-3.5 w-3.5 text-brand" weight="duotone" />
          <span className="font-medium tracking-tight">{displayLang}</span>
        </div>

        <button
          type="button"
          onClick={() => void handleCopy()}
          className="inline-flex items-center gap-1 whitespace-nowrap shrink-0 rounded-md px-2 py-0.5 font-sans text-[11px] font-medium text-muted-2 transition-colors hover:bg-surface hover:text-ink"
          title="Copiar bloque de código"
        >
          {copied ? (
            <>
              <Check className="h-3 w-3 text-[rgb(var(--color-status-success-text))]" weight="bold" />
              <span className="text-[rgb(var(--color-status-success-text))]">Copiado</span>
            </>
          ) : (
            <>
              <Copy className="h-3 w-3" />
              <span>Copiar</span>
            </>
          )}
        </button>
      </div>

      <div className="overflow-x-auto bg-surface-soft px-3.5 py-3 scrollbar-thin">
        <pre className="m-0 font-mono text-[12px] font-normal leading-[1.6] text-ink tabular-nums">
          <code className="font-mono">{code}</code>
        </pre>
      </div>
    </div>
  );
};

export const SiBotMarkdown: React.FC<SiBotMarkdownProps> = ({
  content,
  isStreaming = false,
}) => {
  return (
    <div className="w-full overflow-x-hidden font-sans text-[13.5px] font-normal leading-[1.65] text-ink tabular-nums">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          pre: ({ children }) => (
            <div className="my-0 max-w-full overflow-visible whitespace-normal">
              {children}
            </div>
          ),
          code({ className, children, ...props }: any) {
            const matchName = /language-([\w:-]+)/.exec(className || '');
            const language = matchName ? matchName[1] : '';
            const contentString = String(children).replace(/\n$/, '');
            const isChartFence =
              className?.includes('chart:') || language?.startsWith('chart:');

            const isBlockCode = Boolean(
              isChartFence ||
                className?.includes('language-') ||
                contentString.includes('\n'),
            );

            if (
              isBlockCode &&
              (isChartFence || (language === 'json' && contentString.includes('"data"')))
            ) {
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

            if (isBlockCode) {
              return <CodeBlock language={language} code={contentString} />;
            }

            return (
              <code
                className="inline rounded-md bg-surface-tint px-1.5 py-0.5 font-mono text-[12px] font-medium text-brand tabular-nums"
                {...props}
              >
                {children}
              </code>
            );
          },
          p: ({ children }) => (
            <p className="mb-3 last:mb-0 font-sans text-[13.5px] leading-[1.65] text-ink">
              {children}
            </p>
          ),
          ul: ({ children }) => (
            <ul className="mb-3 list-disc space-y-1.5 pl-4 font-sans marker:text-brand [&_ol]:mt-1.5 [&_ul]:mt-1.5">
              {children}
            </ul>
          ),
          ol: ({ children }) => (
            <ol className="mb-3 list-decimal space-y-1.5 pl-4 font-sans font-medium marker:font-mono marker:text-brand [&_ol]:mt-1.5 [&_ul]:mt-1.5">
              {children}
            </ol>
          ),
          li: ({ children }) => (
            <li className="font-sans text-[13.5px] font-normal leading-[1.6] text-ink">
              {children}
            </li>
          ),
          h1: ({ children }) => (
            <h1 className="mb-2.5 mt-4 first:mt-0 font-sans text-base font-semibold tracking-[-0.015em] text-ink [text-wrap:balance]">
              {children}
            </h1>
          ),
          h2: ({ children }) => (
            <h2 className="mb-2 mt-3.5 first:mt-0 font-sans text-[15px] font-semibold tracking-[-0.015em] text-ink [text-wrap:balance]">
              {children}
            </h2>
          ),
          h3: ({ children }) => (
            <h3 className="mb-2 mt-3.5 first:mt-0 font-sans text-[14.5px] font-semibold tracking-[-0.015em] text-ink [text-wrap:balance]">
              {children}
            </h3>
          ),
          h4: ({ children }) => (
            <h4 className="mb-1.5 mt-3 first:mt-0 font-sans text-[13.5px] font-semibold tracking-[-0.01em] text-ink">
              {children}
            </h4>
          ),
          blockquote: ({ children }) => (
            <blockquote className="my-3 rounded-xl bg-surface-soft/75 px-3.5 py-2.5 font-sans text-[13px] leading-relaxed text-muted-2">
              {children}
            </blockquote>
          ),
          hr: () => <hr className="my-3.5 h-px border-0 bg-line-soft" />,
          table: ({ children }) => <SiBotTable>{children}</SiBotTable>,
          thead: ({ children }) => <thead className="bg-surface-soft/80">{children}</thead>,
          tbody: ({ children }) => (
            <tbody className="divide-y divide-line-soft bg-surface">{children}</tbody>
          ),
          tr: ({ children }) => (
            <tr className="transition-colors hover:bg-surface-soft/45">{children}</tr>
          ),
          th: ({ children }) => (
            <th className="whitespace-nowrap px-3 py-2 font-sans text-[11px] font-semibold text-muted-2">
              {children}
            </th>
          ),
          td: ({ children }) => {
            const rawText = React.Children.toArray(children)
              .map((c) => (typeof c === 'string' || typeof c === 'number' ? String(c) : ''))
              .join('')
              .trim();
            const isNumeric = /^[\d.,+%()-]+$/.test(rawText) && rawText.length > 0;

            return (
              <td
                className={`px-3 py-2 text-xs text-ink tabular-nums ${
                  isNumeric ? 'text-right font-mono font-medium' : 'font-sans font-normal'
                }`}
              >
                {children}
              </td>
            );
          },
          strong: ({ children }) => (
            <strong className="font-sans font-semibold text-ink">{children}</strong>
          ),
          em: ({ children }) => (
            <em className="not-italic font-normal text-muted-2">{children}</em>
          ),
          a: ({ href, children }) => (
            <a
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium text-brand underline decoration-brand/40 underline-offset-2 transition-colors hover:decoration-brand"
            >
              {children}
            </a>
          ),
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
};
