import React, { memo } from 'react';
import type { IconProps } from '@phosphor-icons/react';
import { motion } from 'framer-motion';
import { DASHBOARD_COLORS } from './constants';

interface StatCardProps {
  label: string;
  value: number;
  icon: React.ElementType<IconProps>;
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
      <div className="animate-pulse border border-zinc-200 bg-white p-5">
        <div className="flex items-center justify-between">
          <div className="space-y-4 flex-1">
            <div className="h-4 w-24 bg-neutral" />
            <div className="h-8 w-16 bg-neutral" />
          </div>
          <div className="h-12 w-12 bg-neutral" />
        </div>
      </div>
    );
  }

  return (
    <motion.div 
      whileHover={{ y: -2 }}
      transition={{ type: "spring", stiffness: 400, damping: 30 }}
      className={`group relative overflow-hidden ${colors.bg} border ${colors.border} p-5`}
      role="region"
      aria-label={`${label}: ${value}`}
    >
      <div className="relative z-10 flex items-start justify-between">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <p className={`font-mono text-[10px] font-semibold uppercase tracking-[0.14em] ${colors.text} opacity-80`}>
              {label}
            </p>
          </div>
          <p className="text-3xl font-semibold leading-none tracking-[-0.03em] text-primary tabular-nums sm:text-display">
            {value.toLocaleString()}
          </p>
          {description && (
            <p className="mt-1 hidden text-sm font-medium text-secondary sm:block">
              {description}
            </p>
          )}
        </div>
        
        <div 
          className="border border-zinc-200 bg-white p-3 text-tertiary transition-colors duration-300 group-hover:border-tertiary"
        >
          <Icon className="h-[22px] w-[22px]" weight="bold" aria-hidden="true" />
        </div>
      </div>
    </motion.div>
  );
});

StatCard.displayName = 'StatCard';

export default StatCard;
