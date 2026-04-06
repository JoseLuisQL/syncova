import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Robot, User } from '@phosphor-icons/react';
import { SiBotChart } from './SiBotChart';

interface SiBotMessageProps {
  role: 'user' | 'assistant' | 'system' | 'data';
  content: string;
}

export const SiBotMessage: React.FC<SiBotMessageProps> = ({ role, content }) => {
  if (role === 'system' || role === 'data') return null;

  const isUser = role === 'user';

  return (
    <div className={`flex w-full mb-6 ${isUser ? 'justify-end' : 'justify-start'}`}>
      <div className={`flex max-w-[85%] ${isUser ? 'flex-row-reverse' : 'flex-row'} items-end gap-2`}>
        {/* Avatar */}
        <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center
          ${isUser ? 'bg-zinc-800 text-white' : 'bg-blue-600 text-white'}`}
        >
          {isUser ? <User weight="bold" /> : <Robot weight="bold" />}
        </div>

        {/* Message Bubble */}
        <div className={`relative px-4 py-3 rounded-2xl text-sm leading-relaxed shadow-sm
          ${isUser 
            ? 'bg-zinc-800 text-white rounded-br-sm' 
            : 'bg-white border border-zinc-200 text-zinc-800 rounded-bl-sm'
          }`}
        >
          <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            components={{
              code({ node, inline, className, children, ...props }: any) {
                const match = /language-(\w+)/.exec(className || '');
                const language = match ? match[1] : '';
                
                // Render custom chart if language is json AND it contains "type" (bar, line, pie)
                if (!inline && language === 'json') {
                  const content = String(children).replace(/\n$/, '');
                  if (content.includes('"type"') && content.includes('"data"')) {
                    return <SiBotChart payload={content} />;
                  }
                }
                
                return !inline ? (
                  <div className="bg-zinc-900 rounded-lg p-3 my-2 overflow-x-auto text-zinc-100 text-xs font-mono">
                    <code className={className} {...props}>{children}</code>
                  </div>
                ) : (
                  <code className="bg-zinc-100 text-zinc-800 px-1.5 py-0.5 rounded text-xs font-mono" {...props}>
                    {children}
                  </code>
                );
              },
              p: ({children}) => <p className="mb-2 last:mb-0">{children}</p>,
              ul: ({children}) => <ul className="list-disc pl-4 mb-2">{children}</ul>,
              ol: ({children}) => <ol className="list-decimal pl-4 mb-2">{children}</ol>,
              li: ({children}) => <li className="mb-1">{children}</li>,
              h3: ({children}) => <h3 className="text-sm font-bold mt-3 mb-1">{children}</h3>,
              h4: ({children}) => <h4 className="text-sm font-semibold mt-2 mb-1">{children}</h4>,
              table: ({children}) => (
                <div className="overflow-x-auto my-3 border border-zinc-200 rounded-lg">
                  <table className="min-w-full text-xs text-left divide-y divide-zinc-200">{children}</table>
                </div>
              ),
              thead: ({children}) => <thead className="bg-zinc-50">{children}</thead>,
              tbody: ({children}) => <tbody className="divide-y divide-zinc-200">{children}</tbody>,
              th: ({children}) => <th className="px-3 py-2 font-medium text-zinc-600">{children}</th>,
              td: ({children}) => <td className="px-3 py-2">{children}</td>,
            }}
          >
            {content}
          </ReactMarkdown>
        </div>
      </div>
    </div>
  );
};

