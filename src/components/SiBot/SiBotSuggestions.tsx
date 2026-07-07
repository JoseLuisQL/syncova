import React from 'react';
import { Sparkle } from '@phosphor-icons/react';

interface SiBotSuggestionsProps {
  onSelect: (text: string) => void;
}

const suggestions = [
  "¿Cuántas vacunas tenemos en stock global?",
  "Muestra un gráfico de entregas por mes",
  "¿Cuáles son los lotes próximos a vencer?",
];

export const SiBotSuggestions: React.FC<SiBotSuggestionsProps> = ({ onSelect }) => {
  return (
    <div className="mt-4 flex w-full max-w-[310px] flex-col items-center justify-center gap-2.5">
      <div className="mb-0.5 flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-widest text-muted">
        <Sparkle weight="bold" className="h-3.5 w-3.5 text-brand" />
        Sugerencias para empezar
      </div>
      <div className="flex flex-col w-full space-y-1.5">
        {suggestions.map((text, idx) => (
          <button type="button"
            key={idx}
            onClick={() => onSelect(text)}
            className="flex w-full items-center justify-center rounded-lg border border-line bg-white px-3 py-2 text-center text-sm font-medium leading-snug text-muted-2 outline-none transition hover:border-line-strong hover:bg-surface-soft hover:text-ink active:scale-[0.99]"
          >
            {text}
          </button>
        ))}
      </div>
    </div>
  );
};
