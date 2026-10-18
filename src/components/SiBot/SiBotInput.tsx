import React, { useRef, useEffect } from 'react';
import {
  ArrowUp,
  ChartBar,
  ClockCountdown,
  Stop,
  Table,
  X,
} from '@phosphor-icons/react';

interface SiBotInputProps {
  input: string;
  handleInputChange: (e: React.ChangeEvent<HTMLTextAreaElement> | React.ChangeEvent<HTMLInputElement>) => void;
  handleSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
  isLoading: boolean;
  stop?: () => void;
  onQuickAction?: (promptText: string) => void;
  onClearDraft?: () => void;
}

const COMPOSER_MODIFIERS = [
  {
    label: 'Gráfico',
    icon: ChartBar,
    suffix: ' Muéstralo en un gráfico comparativo.',
    defaultPrompt: 'Muestra un gráfico de barras con el stock actual de las principales vacunas.',
  },
  {
    label: 'Tabla Excel',
    icon: Table,
    suffix: ' Presenta los resultados en una tabla estructurada.',
    defaultPrompt: 'Genera una tabla detallada del inventario actual de vacunas y lotes disponibles.',
  },
  {
    label: 'Por vencer',
    icon: ClockCountdown,
    suffix: ' Prioriza los lotes próximos a vencer.',
    defaultPrompt: '¿Cuáles son los lotes de vacunas y jeringas próximos a vencer en los siguientes 60 días?',
  },
];

export const SiBotInput: React.FC<SiBotInputProps> = ({
  input = '',
  handleInputChange,
  handleSubmit,
  isLoading,
  stop,
  onQuickAction,
  onClearDraft,
}) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 132)}px`;
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

  const handleModifierClick = (modifier: (typeof COMPOSER_MODIFIERS)[number]) => {
    if (isLoading) return;
    const trimmed = input.trim();
    if (trimmed) {
      const nextValue = `${trimmed}${modifier.suffix}`;
      const syntheticEvent = {
        target: { value: nextValue },
      } as React.ChangeEvent<HTMLTextAreaElement>;
      handleInputChange(syntheticEvent);
      textareaRef.current?.focus();
    } else if (onQuickAction) {
      onQuickAction(modifier.defaultPrompt);
    }
  };

  const hasText = Boolean((input || '').trim());

  return (
    <div className="z-10 shrink-0 border-t border-line bg-surface px-3.5 pb-3 pt-2.5 sm:px-4">
      <form
        onSubmit={handleSubmit}
        className="flex flex-col rounded-2xl border border-line-focus bg-surface-soft/40 transition-colors focus-within:border-brand/50 focus-within:bg-surface"
      >
        <div className="relative flex items-start px-3.5 pt-2.5 pb-1">
          <textarea
            ref={textareaRef}
            value={input}
            onChange={handleInputChange}
            onKeyDown={onKeyDown}
            placeholder="Pregunta sobre stock, lotes, entregas o solicita un gráfico..."
            aria-label="Consulta para SiBot"
            className="max-h-[132px] min-h-[40px] w-full resize-none overflow-y-auto border-0 bg-transparent pr-6 text-[13.5px] font-medium leading-relaxed text-ink outline-none placeholder:text-muted focus:ring-0"
            rows={1}
          />
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
              className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-md text-muted transition-colors hover:bg-surface-soft hover:text-ink"
              title="Limpiar texto"
              aria-label="Limpiar texto"
            >
              <X className="h-3.5 w-3.5" weight="bold" />
            </button>
          )}
        </div>

        {/* Barra inferior del compositor: Modificadores rápidos + Acción de envío */}
        <div className="flex items-center justify-between gap-2 border-t border-line/60 px-2.5 py-1.5">
          <div className="flex items-center gap-1 overflow-x-auto no-scrollbar">
            {COMPOSER_MODIFIERS.map((mod) => {
              const Icon = mod.icon;
              return (
                <button
                  key={mod.label}
                  type="button"
                  disabled={isLoading}
                  onClick={() => handleModifierClick(mod)}
                  className="inline-flex items-center gap-1 whitespace-nowrap shrink-0 rounded-lg border border-transparent px-2 py-1 text-[11px] font-medium text-muted-2 transition-colors hover:border-line hover:bg-surface hover:text-ink disabled:opacity-45"
                  title={hasText ? `Añadir al mensaje: "${mod.suffix.trim()}"` : mod.defaultPrompt}
                >
                  <Icon className="h-3.5 w-3.5 text-brand" weight="duotone" />
                  <span>{mod.label}</span>
                </button>
              );
            })}
          </div>

          <div className="flex shrink-0 items-center gap-2">
            <span className="hidden text-[10px] font-medium text-muted sm:inline">
              ↵ Enviar
            </span>

            {isLoading ? (
              <button
                type="button"
                onClick={stop}
                className="inline-flex h-8 items-center gap-1.5 whitespace-nowrap shrink-0 rounded-xl border border-rose-200 bg-rose-50 px-2.5 text-xs font-semibold text-rose-600 transition-colors hover:bg-rose-100"
                title="Detener generación"
                aria-label="Detener generación"
              >
                <Stop className="h-3.5 w-3.5" weight="fill" />
                <span>Detener</span>
              </button>
            ) : (
              <button
                type="submit"
                disabled={!hasText}
                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-brand text-white transition-all duration-150 hover:bg-brand-600 active:scale-95 disabled:bg-line disabled:text-muted"
                title="Enviar consulta (Enter)"
                aria-label="Enviar consulta"
              >
                <ArrowUp className="h-4 w-4" weight="bold" />
              </button>
            )}
          </div>
        </div>
      </form>
    </div>
  );
};
