import React from 'react';
import { motion } from 'framer-motion';
import { Info } from '@phosphor-icons/react';
import type { StockPorVacuna } from '../../services/dashboardService';

interface StockAvailabilitySectionProps {
  data: StockPorVacuna[];
  isLoading?: boolean;
}

const StockAvailabilitySection: React.FC<StockAvailabilitySectionProps> = ({ data, isLoading }) => {
  if (isLoading) {
    return (
      <div className="bg-white rounded-md border border-zinc-200 p-6 shadow-sm h-full animate-pulse">
        <div className="h-6 w-48 bg-zinc-100 rounded mb-6" />
        <div className="space-y-4">
          {[1,2,3,4,5].map(i => <div key={i} className="h-8 bg-zinc-50 rounded" />)}
        </div>
      </div>
    );
  }

  // Ordenar por stock total y tomar las top
  const sortedData = [...data].sort((a,b) => b.stockTotal - a.stockTotal).slice(0, 6);

  return (
    <motion.div 
      whileHover={{ y: -2 }}
      className="bg-white rounded-md border border-zinc-200 p-6 shadow-sm h-full flex flex-col"
    >
      <div className="flex items-center gap-2 mb-6">
        <h3 className="text-[15px] font-extrabold text-zinc-900 tracking-tight">Disponibilidad en stock</h3>
        <Info size={16} className="text-zinc-400" />
      </div>

      <div className="flex text-[11px] font-bold text-zinc-500 uppercase tracking-wider mb-3 px-1">
        <div className="w-1/3">Vacuna</div>
        <div className="w-1/3 text-center">Stock disponible</div>
        <div className="w-1/3 text-right">Cobertura estimada</div>
      </div>

      <div className="flex-1 space-y-4">
        {sortedData.map((item, i) => {
          // Asumiendo una cobertura base para la UI demo si no viene del backend
          const diasCobertura = Math.max(3, Math.floor(item.stockTotal / 150)); 
          const pct = Math.min(100, (item.stockTotal / (sortedData[0]?.stockTotal || 1)) * 100);
          
          return (
            <div key={i} className="flex items-center text-[13px] font-semibold text-zinc-800">
              <div className="w-1/3 truncate pr-2">{item.vacunaNombre}</div>
              <div className="w-1/3 text-center tabular-nums">{item.stockTotal.toLocaleString()}</div>
              <div className="w-1/3 flex items-center justify-end gap-3">
                <div className="w-16 h-1.5 bg-zinc-100 rounded-full overflow-hidden flex-shrink-0">
                  <div 
                    className="h-full bg-teal-600 rounded-full" 
                    style={{ width: `${pct}%` }} 
                  />
                </div>
                <span className="tabular-nums whitespace-nowrap min-w-[40px] text-right">{diasCobertura} días</span>
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-6 pt-4 border-t border-zinc-100">
        <button className="text-[13px] font-bold text-teal-600 hover:text-teal-700 transition-colors flex items-center gap-1">
          Ver inventario completo <span className="text-lg leading-none">→</span>
        </button>
      </div>
    </motion.div>
  );
};

export default StockAvailabilitySection;
