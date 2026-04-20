import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { motion } from 'motion/react';
import { Sparkle, User } from '@phosphor-icons/react';
import { SiBotChart } from './SiBotChart';
import { SiBotLogo } from './SiBotLogo';
import { SiBotTable } from './SiBotTable';

interface SiBotMessageProps {
  role: 'user' | 'assistant' | 'system' | 'data';
  content: string;
  onSuggestionSelect?: (text: string) => void;
  isStreaming?: boolean;
}

export const SiBotMessage: React.FC<SiBotMessageProps> = ({
  role,
  content,
  onSuggestionSelect,
  isStreaming = false,
}) => {
  if (role === 'system' || role === 'data') return null;

  const isUser = role === 'user';
  
  // Extraemos las sugerencias generadas por la IA
  // La IA envía algo parecido a: "--- \n **💡 Sugerencias:** \n - ¿Cual es el stock? \n"
  const suggestionRegex = /---\s*\n*\s*\*\*💡\s*Sugerencias:\*\*\s*\n([\s\S]*)/i;
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
        <div className={`flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center shadow-sm relative overflow-hidden border border-zinc-200/50
          ${isUser ? 'bg-zinc-100 text-zinc-600' : 'bg-teal-600 text-white'}`}
        >
          {isUser ? <User weight="bold" className="w-4 h-4" /> : <SiBotLogo className="w-4 h-4 absolute" />}
        </div>

        {/* Message Bubble */}
        <div className={`relative ${bubblePaddingClass} text-[12.5px] leading-relaxed min-w-0 w-full overflow-x-hidden
          ${isUser 
            ? 'bg-zinc-900 text-zinc-50 rounded-[1.25rem] rounded-br-[0.25rem] shadow-[0_4px_20px_-8px_rgba(0,0,0,0.15)]' 
            : 'bg-white border-[1.5px] border-zinc-100 text-zinc-800 rounded-[1.25rem] rounded-bl-[0.25rem] shadow-[0_2px_14px_-6px_rgba(0,0,0,0.06)]'
          }`}
        >
          {!mainContent.trim() && !isUser ? (
             <div className="flex items-center gap-3 h-[24px] px-1 py-0.5">
               <div className="flex gap-1.5 items-center">
                 <motion.div animate={{ scale: [0.8, 1.2, 0.8], opacity: [0.4, 1, 0.4] }} transition={{ repeat: Infinity, duration: 1.4, ease: "easeInOut" }} className="w-1.5 h-1.5 bg-teal-500 rounded-full" />
                 <motion.div animate={{ scale: [0.8, 1.2, 0.8], opacity: [0.4, 1, 0.4] }} transition={{ repeat: Infinity, duration: 1.4, ease: "easeInOut", delay: 0.2 }} className="w-1.5 h-1.5 bg-teal-500 rounded-full" />
                 <motion.div animate={{ scale: [0.8, 1.2, 0.8], opacity: [0.4, 1, 0.4] }} transition={{ repeat: Infinity, duration: 1.4, ease: "easeInOut", delay: 0.4 }} className="w-1.5 h-1.5 bg-teal-500 rounded-full" />
               </div>
               <span className="text-[12.5px] font-medium text-teal-600/90 tracking-wide animate-pulse">Analizando SIVAC...</span>
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
                    <div className="bg-zinc-950 rounded-xl p-4 my-3 overflow-x-auto text-zinc-200 text-[13px] font-mono border border-zinc-800 shadow-inner max-w-full">
                      <code className={className} {...props}>{children}</code>
                    </div>
                  ) : (
                    <code className="bg-zinc-100 text-zinc-800 px-1.5 py-0.5 rounded-md text-[13px] font-mono font-medium border border-zinc-200/50" {...props}>
                      {children}
                    </code>
                  );
                },
                p: ({children}) => <p className="mb-3 last:mb-0 tracking-tight">{children}</p>,
                ul: ({children}) => <ul className="list-disc pl-5 mb-3 marker:text-zinc-400 space-y-1">{children}</ul>,
                ol: ({children}) => <ol className="list-decimal pl-5 mb-3 marker:text-zinc-400 space-y-1 font-medium">{children}</ol>,
                li: ({children}) => <li className="mb-1 leading-relaxed">{children}</li>,
                h3: ({children}) => <h3 className="text-[15px] font-bold mt-5 mb-2 tracking-tight text-zinc-900">{children}</h3>,
                h4: ({children}) => <h4 className="text-[13px] font-semibold mt-3 mb-1.5 tracking-tight text-zinc-800">{children}</h4>,
                table: ({children}) => <SiBotTable>{children}</SiBotTable>,
                thead: ({children}) => <thead className="bg-zinc-50/80">{children}</thead>,
                tbody: ({children}) => <tbody className="divide-y divide-zinc-200/60 bg-white">{children}</tbody>,
                th: ({children}) => <th className="px-3 py-2 font-semibold text-zinc-700 whitespace-nowrap bg-zinc-50/80 border-b border-zinc-200 tracking-tight">{children}</th>,
                td: ({children}) => <td className="px-3 py-2 text-zinc-600 font-medium min-w-[100px]">{children}</td>,
                strong: ({children}) => <strong className="font-semibold text-zinc-900">{children}</strong>
              }}
            >
              {mainContent}
            </ReactMarkdown>
          )}
        </div>
      </div>

      {/* Renderizamos Sugerencias Extraidas Exclusivamente como Botones Interactivas (Chips) */}
      {formattedSuggestions.length > 0 && !isUser && (
        <div className="flex flex-col gap-1.5 mt-2 ml-[38px] max-w-[90%]">
          {formattedSuggestions.map((suggestionText, idx) => (
             <button
                key={idx}
                onClick={() => onSuggestionSelect && onSuggestionSelect(suggestionText)}
                className="group flex flex-row items-start gap-2 text-left text-[11.5px] bg-white border border-zinc-200/80 text-zinc-600 pl-2.5 pr-3 py-1.5 rounded-[0.85rem] transition-all duration-300 hover:border-zinc-300 hover:bg-zinc-50 hover:shadow-[0_4px_15px_-5px_rgba(0,0,0,0.05)] hover:-translate-y-[1px] active:translate-y-0 active:scale-[0.98] outline-none font-medium w-fit max-w-full"
             >
                <Sparkle weight="fill" className="text-zinc-300 group-hover:text-amber-500 transition-colors flex-shrink-0 w-3.5 h-3.5 mt-0.5" />
                <span className="whitespace-normal leading-snug">{suggestionText}</span>
             </button>
          ))}
        </div>
      )}
    </div>
  );
};
