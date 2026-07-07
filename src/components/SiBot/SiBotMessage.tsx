import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { motion } from 'motion/react';
import { Sparkle, User } from '@phosphor-icons/react';
import { SiBotChart } from './SiBotChart';
import { SiBotLogo } from './SiBotLogo';
import { SiBotTable } from './SiBotTable';

interface SiBotMessageProps {
  messageRole: 'user' | 'assistant' | 'system' | 'data';
  content: string;
  onSuggestionSelect?: (text: string) => void;
  isStreaming?: boolean;
}

export const SiBotMessage: React.FC<SiBotMessageProps> = ({
  messageRole,
  content,
  onSuggestionSelect,
  isStreaming = false,
}) => {
  if (messageRole === 'system' || messageRole === 'data') return null;

  const isUser = messageRole === 'user';
  
  const suggestionRegex = /---\s*\n*\s*\*\*(?:💡\s*)?Sugerencias:\*\*\s*\n([\s\S]*)/i;
  const match = content.match(suggestionRegex);
  
  let mainContent = content;
  let formattedSuggestions: string[] = [];
  
  if (match) {
    mainContent = content.substring(0, match.index!).trim();
    if (match[1]) {
      formattedSuggestions = match[1].split('\n')
        // Limpia los guiones y brackets al comienzo y final de la línea
        .map(line => line.replace(/^-\s*/, '').replace(/^\[/, '').replace(/\]$/, '').trim())
        // Filtra líneas vacías
        .filter(line => line.length > 5);
    }
  }

  const hasChartBlock = /```chart:(bar|line|pie)/i.test(mainContent);
  const rowWidthClass = isUser ? 'max-w-[92%]' : hasChartBlock ? 'max-w-[98%]' : 'max-w-[92%]';
  const bubblePaddingClass = hasChartBlock ? 'px-3 py-3' : 'px-4 py-2.5';

  return (
    <div className={`flex flex-col w-full mb-4 ${isUser ? 'items-end' : 'items-start'}`}>
      <div className={`flex w-full ${rowWidthClass} ${isUser ? 'flex-row-reverse' : 'flex-row'} items-end gap-2.5`}>
        {/* Avatar */}
        <div className={`relative flex h-7 w-7 flex-shrink-0 items-center justify-center overflow-hidden rounded-[9px] border
          ${isUser ? 'border-line bg-surface-soft text-muted-2' : 'border-brand-100 bg-surface-soft text-brand'}`}
        >
          {isUser ? <User weight="bold" className="h-4 w-4" /> : <SiBotLogo className="absolute h-4 w-4" />}
        </div>

        {/* Message Bubble */}
        <div className={`relative ${bubblePaddingClass} text-[12.5px] leading-relaxed min-w-0 w-full overflow-x-hidden
          ${isUser 
            ? 'bg-ink text-zinc-50 rounded-xl rounded-br-[4px]' 
            : 'bg-white border border-line text-ink rounded-xl rounded-bl-[4px]'
          }`}
        >
          {!mainContent.trim() && !isUser ? (
             <div className="flex items-center gap-3 h-[24px] px-1 py-0.5">
               <div className="flex gap-1.5 items-center">
                 <motion.div animate={{ scale: [0.8, 1.2, 0.8], opacity: [0.4, 1, 0.4] }} transition={{ repeat: Infinity, duration: 1.4, ease: "easeInOut" }} className="h-1.5 w-1.5 rounded-full bg-brand" />
                 <motion.div animate={{ scale: [0.8, 1.2, 0.8], opacity: [0.4, 1, 0.4] }} transition={{ repeat: Infinity, duration: 1.4, ease: "easeInOut", delay: 0.2 }} className="h-1.5 w-1.5 rounded-full bg-brand" />
                 <motion.div animate={{ scale: [0.8, 1.2, 0.8], opacity: [0.4, 1, 0.4] }} transition={{ repeat: Infinity, duration: 1.4, ease: "easeInOut", delay: 0.4 }} className="h-1.5 w-1.5 rounded-full bg-brand" />
               </div>
               <span className="animate-pulse text-[12.5px] font-medium tracking-wide text-brand">Analizando SIVAC...</span>
             </div>
          ) : (
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              components={{
                pre: ({children}) => <div className="my-0 max-w-full overflow-visible whitespace-normal">{children}</div>,
                code({ inline, className, children, ...props }: any) {
                  const matchName = /language-(\w+)/.exec(className || '');
                  const language = matchName ? matchName[1] : '';
                  const contentString = String(children).replace(/\n$/, '');
                  const isChartFence =
                    className?.includes('chart:') || language?.startsWith('chart:');
                  
                  // Permitimos la instanciacion del Chart interceptando el syntax del markdown
                  if (!inline && (isChartFence || (language === 'json' && contentString.includes('"data"')))) {
                    // Extraemos el tipo de grafico (ej. chart:bar -> bar)
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
                    <div className="my-3 max-w-full overflow-x-auto rounded-[12px] border border-[#2b2f37] bg-ink p-4 font-mono text-base text-zinc-200">
                      <code className={className} {...props}>{children}</code>
                    </div>
                  ) : (
                    <code className="rounded-md border border-line bg-surface-soft px-1.5 py-0.5 font-mono text-base font-medium text-ink" {...props}>
                      {children}
                    </code>
                  );
                },
                p: ({children}) => <p className="mb-3 last:mb-0 tracking-tight">{children}</p>,
                ul: ({children}) => <ul className="list-disc pl-5 mb-3 marker:text-muted space-y-1">{children}</ul>,
                ol: ({children}) => <ol className="list-decimal pl-5 mb-3 marker:text-muted space-y-1 font-medium">{children}</ol>,
                li: ({children}) => <li className="mb-1 leading-relaxed">{children}</li>,
                h3: ({children}) => <h3 className="text-md font-semibold mt-5 mb-2 tracking-tight text-ink">{children}</h3>,
                h4: ({children}) => <h4 className="text-base font-semibold mt-3 mb-1.5 tracking-tight text-ink">{children}</h4>,
                table: ({children}) => <SiBotTable>{children}</SiBotTable>,
                thead: ({children}) => <thead className="bg-surface-soft">{children}</thead>,
                tbody: ({children}) => <tbody className="bg-white">{children}</tbody>,
                th: ({children}) => <th className="whitespace-nowrap border-b border-line-soft bg-surface-soft px-3 py-2 text-[0.78rem] font-medium tracking-[-0.01em] text-muted">{children}</th>,
                td: ({children}) => <td className="min-w-[100px] px-3 py-2 font-medium text-muted-2">{children}</td>,
                strong: ({children}) => <strong className={`font-semibold ${isUser ? 'text-white' : 'text-ink'}`}>{children}</strong>
              }}
            >
              {mainContent}
            </ReactMarkdown>
          )}
        </div>
      </div>

      {/* Renderizamos Sugerencias Extraidas Exclusivamente como Botones Interactivas (Chips) */}
      {formattedSuggestions.length > 0 && !isUser && (
        <div className="ml-[38px] mt-2 flex max-w-[90%] flex-col gap-1.5">
          {formattedSuggestions.map((suggestionText, idx) => (
             <button type="button"
                key={idx}
                onClick={() => onSuggestionSelect && onSuggestionSelect(suggestionText)}
                className="group flex w-fit max-w-full flex-row items-start gap-2 rounded-lg border border-line bg-white py-1.5 pl-2.5 pr-3 text-left text-[11.5px] font-medium text-muted-2 outline-none transition hover:border-line-strong hover:bg-surface-soft hover:text-ink active:scale-[0.99]"
             >
                <Sparkle weight="bold" className="mt-0.5 h-3.5 w-3.5 flex-shrink-0 text-brand transition-colors" />
                <span className="whitespace-normal leading-snug">{suggestionText}</span>
             </button>
          ))}
        </div>
      )}
    </div>
  );
};
