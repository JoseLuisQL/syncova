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
    <div className="z-10 shrink-0 border-t border-[#eeeef3] bg-white p-3 pt-2">
      <form
        onSubmit={handleSubmit}
        className="relative flex items-end gap-1.5 rounded-[14px] border border-[#e7e7ef] bg-white p-1 transition focus-within:border-[#c8bbff] focus-within:ring-2 focus-within:ring-[#7c3aed]/10"
      >
        <textarea
          ref={textareaRef}
          value={input}
          onChange={handleInputChange}
          onKeyDown={onKeyDown}
          placeholder="Consulta sobre lotes, stock..."
          className="max-h-[120px] w-full resize-none overflow-y-hidden border-0 bg-transparent py-[9px] pl-3.5 pr-1 text-[13px] font-medium leading-snug tracking-tight text-[#15171d] outline-none placeholder:text-[#8b8f9b] focus:ring-0"
          rows={1}
          style={{ minHeight: '38px' }}
        />
        
        <div className="flex-shrink-0 flex items-center justify-center p-0.5">
          {isLoading ? (
            <button
              type="button"
              onClick={stop}
              className="flex h-8 w-8 items-center justify-center rounded-[10px] border border-rose-200 bg-rose-50 text-rose-600 transition-colors hover:bg-rose-100"
              title="Detener respuesta"
            >
              <StopCircle className="w-5 h-5 animate-pulse" weight="fill" />
            </button>
          ) : (
             <button
              type="submit"
              disabled={!(input || '').trim()}
              className="flex h-8 w-8 items-center justify-center rounded-[10px] bg-[#7c3aed] text-white shadow-[0_10px_24px_-16px_rgba(124,58,237,0.75)] transition hover:bg-[#6d28d9] active:scale-95 disabled:bg-[#eeeef3] disabled:text-[#8b8f9b] disabled:shadow-none"
             >
                <PaperPlaneRight className="w-4 h-4 ml-0.5" weight="bold" />
             </button>
          )}
        </div>
      </form>
      <div className="mt-1.5 text-center">
        <span className="text-[9px] font-medium tracking-wide text-[#8b8f9b]">Desarrollado para SIVAC • DISA Apurímac II</span>
      </div>
    </div>
  );
};
