import React from 'react';
import { Lightbulb } from '@phosphor-icons/react';

interface SiBotSuggestionsProps {
  onSelect: (text: string) => void;
}

const suggestions = [
  "¿Cuántas vacunas tenemos en stock global?",
  "Muestra un gráfico de barras de entregas por mes en 2026",
  "¿Cuáles son los lotes próximos a vencer?",
];

export const SiBotSuggestions: React.FC<SiBotSuggestionsProps> = ({ onSelect }) => {
  return (
    <div className="flex flex-col gap-2 mt-4 mx-4">
      <div className="flex items-center gap-2 text-zinc-500 text-xs font-medium uppercase tracking-wider mb-2">
        <Lightbulb weight="fill" className="text-amber-500" />
        Sugerencias
      </div>
      <div className="flex flex-wrap gap-2">
        {suggestions.map((s, idx) => (
          <button
            key={idx}
            onClick={() => onSelect(s)}
            className="text-left text-xs bg-white hover:bg-zinc-50 border border-zinc-200 text-zinc-600 px-3 py-2 rounded-xl transition-colors shadow-sm"
          >
            {s}
          </button>
        ))}
      </div>
    </div>
  );
};

