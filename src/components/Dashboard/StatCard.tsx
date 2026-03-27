import React, { memo } from 'react';
import { LucideIcon } from 'lucide-react';
import { motion } from 'framer-motion';
import { DASHBOARD_COLORS } from './constants';

interface StatCardProps {
  label: string;
  value: number;
  icon: LucideIcon;
  colorScheme: keyof typeof DASHBOARD_COLORS;
  description?: string;
  isLoading?: boolean;
}

const StatCard: React.FC<StatCardProps> = memo(({
  label,
  value,
  icon: Icon,
  colorScheme,
  description,
  isLoading = false,
}) => {
  const colors = DASHBOARD_COLORS[colorScheme];

  if (isLoading) {
    return (
      <div className="bg-white rounded-[20px] p-6 border border-zinc-100/80 shadow-sm animate-pulse">
        <div className="flex items-center justify-between">
          <div className="space-y-4 flex-1">
            <div className="h-4 bg-zinc-100 rounded w-24" />
            <div className="h-8 bg-zinc-100 rounded w-16" />
          </div>
          <div className="h-12 w-12 bg-zinc-50 rounded-[14px]" />
        </div>
      </div>
    );
  }

  // Premium glass/gradient aesthetic
  return (
    <motion.div 
      whileHover={{ y: -4, scale: 1.01 }}
      transition={{ type: "spring", stiffness: 400, damping: 30 }}
      className={`relative overflow-hidden ${colors.bg} rounded-[20px] p-6 border ${colors.border} group`}
      role="region"
      aria-label={`${label}: ${value}`}
    >
      {/* Decorative gradient orb in background */}
      <div className={`absolute -right-8 -top-8 w-32 h-32 bg-gradient-to-br ${colors.gradient} opacity-[0.04] rounded-full blur-2xl group-hover:opacity-10 transition-opacity duration-500`} />
      
      <div className="relative z-10 flex items-start justify-between">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <p className={`text-[13px] font-bold uppercase tracking-wider ${colors.text} opacity-80`}>
              {label}
            </p>
          </div>
          <p className="text-3xl sm:text-[34px] font-extrabold text-zinc-950 tabular-nums tracking-tight leading-none">
            {value.toLocaleString()}
          </p>
          {description && (
            <p className="text-[12px] font-medium text-zinc-500 mt-1 hidden sm:block">
              {description}
            </p>
          )}
        </div>
        
        <div 
          className={`p-3.5 rounded-[16px] bg-gradient-to-br ${colors.gradient} shadow-[0_8px_16px_-6px_rgba(0,0,0,0.15)] group-hover:shadow-[0_12px_20px_-8px_rgba(0,0,0,0.25)] transition-all duration-300 transform group-hover:-rotate-3`}
        >
          <Icon className="h-[22px] w-[22px] text-white" strokeWidth={2.5} aria-hidden="true" />
        </div>
      </div>
    </motion.div>
  );
});

StatCard.displayName = 'StatCard';

export default StatCard;
