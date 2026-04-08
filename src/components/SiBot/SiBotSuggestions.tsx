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
    <div className="flex flex-col items-center justify-center gap-2.5 w-full max-w-[300px] mt-4">
      <div className="flex items-center gap-1.5 text-zinc-400 text-[10px] font-semibold uppercase tracking-widest mb-0.5 opacity-80">
        <Sparkle weight="duotone" className="text-zinc-400 w-3.5 h-3.5" />
        Sugerencias para empezar
      </div>
      <div className="flex flex-col w-full space-y-1.5">
        {suggestions.map((text, idx) => (
          <button
            key={idx}
            onClick={() => onSelect(text)}
            className="flex items-center justify-center text-center w-full text-[12px] leading-snug font-medium bg-white border border-zinc-200/80 text-zinc-600 px-3 py-2 rounded-xl transition-all duration-300 hover:border-zinc-300 hover:bg-zinc-50 hover:shadow-[0_4px_20px_-8px_rgba(0,0,0,0.08)] active:scale-[0.98] outline-none"
          >
            {text}
          </button>
        ))}
      </div>
    </div>
  );
};
