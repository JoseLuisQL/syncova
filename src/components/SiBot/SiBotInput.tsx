import React, { useRef, useEffect } from 'react';
import { PaperPlaneRight, StopCircle } from '@phosphor-icons/react';

interface SiBotInputProps {
  input: string;
  handleInputChange: (e: React.ChangeEvent<HTMLTextAreaElement> | React.ChangeEvent<HTMLInputElement>) => void;
  handleSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
  isLoading: boolean;
  stop?: () => void;
}

export const SiBotInput: React.FC<SiBotInputProps> = ({
  input = '',
  handleInputChange,
  handleSubmit,
  isLoading,
  stop
}) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 120)}px`;
    }
  }, [input]);

  const onKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if ((input || '').trim() && !isLoading) {
        handleSubmit(e as unknown as React.FormEvent<HTMLFormElement>);
      }
    }
  };

  return (
    <div className="p-3 pt-2 bg-zinc-50/50 backdrop-blur-xl shrink-0 z-10 border-t border-zinc-200/50">
      <form
        onSubmit={handleSubmit}
        className="relative flex items-end gap-1.5 bg-white hover:bg-white focus-within:bg-white border border-zinc-200/80 rounded-[1.25rem] p-1 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.06)] focus-within:shadow-[0_8px_30px_-6px_rgba(0,0,0,0.1)] focus-within:border-teal-500/30 transition-all duration-300"
      >
        <textarea
          ref={textareaRef}
          value={input}
          onChange={handleInputChange}
          onKeyDown={onKeyDown}
          placeholder="Consulta sobre lotes, stock..."
          className="w-full bg-transparent border-0 focus:ring-0 resize-none max-h-[120px] py-[9px] pl-3.5 pr-1 text-[13px] text-zinc-800 placeholder-zinc-400 font-medium tracking-tight outline-none overflow-y-hidden leading-snug"
          rows={1}
          style={{ minHeight: '38px' }}
        />
        
        <div className="flex-shrink-0 flex items-center justify-center p-0.5">
          {isLoading ? (
            <button
              type="button"
              onClick={stop}
              className="flex items-center justify-center w-8 h-8 rounded-full bg-zinc-100 text-zinc-500 hover:text-red-500 hover:bg-red-50 transition-colors"
              title="Detener respuesta"
            >
              <StopCircle className="w-5 h-5 animate-pulse" weight="fill" />
            </button>
          ) : (
             <button
              type="submit"
              disabled={!(input || '').trim()}
              className="flex items-center justify-center w-8 h-8 rounded-full bg-zinc-900 text-white disabled:bg-zinc-200 disabled:text-zinc-400 transition-all duration-300 ease-out hover:scale-[1.03] active:scale-95 disabled:scale-100 disabled:hover:scale-100 shadow-[0_4px_10px_rgba(0,0,0,0.1)] disabled:shadow-none"
             >
                <PaperPlaneRight className="w-4 h-4 ml-0.5" weight="bold" />
             </button>
          )}
        </div>
      </form>
      <div className="mt-1.5 text-center">
        <span className="text-[9px] text-zinc-400 font-medium tracking-wide">Desarrollado para SIVAC • DISA Apurímac II</span>
      </div>
    </div>
  );
};
