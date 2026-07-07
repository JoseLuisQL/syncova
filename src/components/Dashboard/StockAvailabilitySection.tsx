import React from 'react';
import type { StockPorVacuna } from '../../services/dashboardService';

interface StockAvailabilitySectionProps {
  data: StockPorVacuna[];
  isLoading?: boolean;
}

const StockAvailabilitySection: React.FC<StockAvailabilitySectionProps> = ({ data, isLoading }) => {
  if (isLoading) {
    return (
      <div className="h-full animate-pulse rounded-[18px] border border-[#e3e9f0] bg-white p-5">
        <div className="mb-6 h-5 w-48 rounded bg-[#eef3f6]" />
        <div className="space-y-4">
          {[1,2,3,4,5].map(i => <div key={i} className="h-8 rounded bg-[#eef3f6]" />)}
        </div>
      </div>
    );
  }

  // Ordenar por stock total y tomar las top
  const sortedData = [...data].sort((a,b) => b.stockTotal - a.stockTotal).slice(0, 6);

  return (
    <section className="flex h-full flex-col rounded-[18px] border border-[#e3e9f0] bg-white p-5 shadow-[0_16px_40px_-34px_rgba(15,42,59,0.55)]">
      <div className="mb-6">
        <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.14em] text-[#9aa4b2]">Inventario</p>
        <h3 className="mt-1 text-[15px] font-semibold tracking-[-0.02em] text-[#171b22]">Disponibilidad en stock</h3>
      </div>

      <div className="mb-3 flex px-1 font-mono text-[10px] font-semibold uppercase tracking-[0.12em] text-secondary">
        <div className="w-1/3">Vacuna</div>
        <div className="w-1/3 text-center">Stock</div>
        <div className="w-1/3 text-right">Cobertura</div>
      </div>

      <div className="flex-1 divide-y divide-zinc-100">
        {sortedData.map((item, i) => {
          const diasCobertura = Math.max(3, Math.floor(item.stockTotal / 150)); 
          const pct = Math.min(100, (item.stockTotal / (sortedData[0]?.stockTotal || 1)) * 100);
          
          return (
            <div key={i} className="flex items-center py-3 text-[13px] font-medium text-primary">
              <div className="w-1/3 min-w-0 truncate pr-2">{item.vacunaNombre}</div>
              <div className="w-1/3 text-center font-mono tabular-nums">{item.stockTotal.toLocaleString()}</div>
              <div className="flex w-1/3 items-center justify-end gap-2 sm:gap-3">
                <div className="h-1.5 w-12 flex-shrink-0 overflow-hidden rounded-full bg-[#eef3f6] sm:w-16">
                  <div 
                    className="h-full rounded-full bg-[#0e9f8e]" 
                    style={{ width: `${pct}%` }} 
                  />
                </div>
                <span className="min-w-[42px] whitespace-nowrap text-right font-mono text-[12px] text-secondary tabular-nums">{diasCobertura}d</span>
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-5 border-t border-zinc-100 pt-4">
        <button type="button" className="flex items-center gap-1 text-[13px] font-semibold text-[#0e9f8e] transition-colors hover:text-[#0a8276]">
          Ver inventario completo <span className="text-lg leading-none">→</span>
        </button>
      </div>
    </section>
  );
};

export default StockAvailabilitySection;
