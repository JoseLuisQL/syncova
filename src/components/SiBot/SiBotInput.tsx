import React, { useRef, useEffect } from 'react';
import { ArrowUp, Stop, X } from '@phosphor-icons/react';

interface SiBotInputProps {
  input: string;
  handleInputChange: (e: React.ChangeEvent<HTMLTextAreaElement> | React.ChangeEvent<HTMLInputElement>) => void;
  handleSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
  isLoading: boolean;
  stop?: () => void;
  onClearDraft?: () => void;
}

export const SiBotInput: React.FC<SiBotInputProps> = ({
  input = '',
  handleInputChange,
  handleSubmit,
  isLoading,
  stop,
  onClearDraft,
}) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 128)}px`;
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

  const hasText = Boolean((input || '').trim());

  return (
    <div className="z-10 shrink-0 bg-surface px-4 pb-4 pt-2 font-sans">
      <form
        onSubmit={handleSubmit}
        className="flex items-end gap-2 rounded-2xl bg-surface-soft/90 px-3.5 py-2.5 transition-all duration-150 focus-within:bg-surface-soft focus-within:ring-1 focus-within:ring-brand/35"
      >
        <textarea
          ref={textareaRef}
          value={input}
          onChange={handleInputChange}
          onKeyDown={onKeyDown}
          placeholder="Escribe tu consulta sobre stock, lotes o entregas..."
          aria-label="Consulta para SiBot"
          className="max-h-[128px] min-h-[24px] flex-1 resize-none overflow-y-auto border-0 bg-transparent py-0.5 font-sans text-[13.5px] font-normal leading-relaxed text-ink outline-none placeholder:text-muted focus:ring-0"
          rows={1}
        />

        <div className="flex shrink-0 items-center gap-1">
          {hasText && !isLoading && (
            <button
              type="button"
              onClick={() => {
                if (onClearDraft) {
                  onClearDraft();
                } else {
                  handleInputChange({
                    target: { value: '' },
                  } as React.ChangeEvent<HTMLTextAreaElement>);
                }
                textareaRef.current?.focus();
              }}
              className="flex h-7 w-7 items-center justify-center rounded-lg text-muted transition-colors hover:bg-surface hover:text-ink"
              title="Limpiar texto"
              aria-label="Limpiar texto"
            >
              <X className="h-3.5 w-3.5" weight="bold" />
            </button>
          )}

          {isLoading ? (
            <button
              type="button"
              onClick={stop}
              className="inline-flex h-7 items-center gap-1 whitespace-nowrap shrink-0 rounded-lg bg-[rgb(var(--color-status-danger-bg))] px-2.5 text-[11px] font-semibold text-[rgb(var(--color-status-danger-text))] transition-opacity hover:opacity-90"
              title="Detener respuesta"
              aria-label="Detener respuesta"
            >
              <Stop className="h-3 w-3" weight="fill" />
              <span>Detener</span>
            </button>
          ) : (
            <button
              type="submit"
              disabled={!hasText}
              className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-brand text-white transition-all duration-150 hover:bg-brand-600 active:scale-95 disabled:bg-line/60 disabled:text-muted"
              title="Enviar consulta (Enter)"
              aria-label="Enviar consulta"
            >
              <ArrowUp className="h-3.5 w-3.5" weight="bold" />
            </button>
          )}
        </div>
      </form>
    </div>
  );
};
