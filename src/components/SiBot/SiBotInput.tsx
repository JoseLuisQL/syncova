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
    <div className="p-4 border-t border-zinc-200 bg-white">
      <form
        onSubmit={handleSubmit}
        className="relative flex items-end gap-2 bg-zinc-50 border border-zinc-200 rounded-2xl p-2 focus-within:ring-2 focus-within:ring-blue-500/20 focus-within:border-blue-500 transition-all"
      >
        <textarea
          ref={textareaRef}
          value={input}
          onChange={handleInputChange}
          onKeyDown={onKeyDown}
          placeholder="Consulta sobre vacunas, stock o distribución..."
          className="w-full bg-transparent border-0 focus:ring-0 resize-none max-h-[120px] py-2 px-2 text-sm text-zinc-800 placeholder-zinc-400"
          rows={1}
        />
        
        <div className="flex-shrink-0">
          {isLoading ? (
            <button
              type="button"
              onClick={stop}
              className="p-2 rounded-xl text-zinc-400 hover:text-red-500 hover:bg-red-50 transition-colors"
              title="Detener respuesta"
            >
              <StopCircle className="w-5 h-5 animate-pulse" weight="fill" />
            </button>
          ) : (
            <button
              type="submit"
              disabled={!(input || '').trim()}
              className="p-2 rounded-xl bg-blue-600 text-white disabled:bg-zinc-200 disabled:text-zinc-400 hover:bg-blue-700 transition-colors shadow-sm disabled:shadow-none"
            >
              <PaperPlaneRight className="w-5 h-5" weight="fill" />
            </button>
          )}
        </div>
      </form>
      <div className="mt-2 text-center">
        <span className="text-[10px] text-zinc-400">SiBot AI Agent • Asistente SIVAC</span>
      </div>
    </div>
  );
};

