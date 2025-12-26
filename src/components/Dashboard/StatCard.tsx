import React, { memo } from 'react';
import { LucideIcon } from 'lucide-react';
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
      <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm animate-pulse">
        <div className="flex items-center justify-between">
          <div className="space-y-3 flex-1">
            <div className="h-4 bg-gray-200 rounded w-24" />
            <div className="h-8 bg-gray-200 rounded w-16" />
          </div>
          <div className="h-12 w-12 bg-gray-200 rounded-xl" />
        </div>
      </div>
    );
  }

  return (
    <div 
      className={`${colors.bg} rounded-2xl p-5 border ${colors.border} transition-all duration-200 hover:shadow-md group`}
      role="region"
      aria-label={`${label}: ${value.toLocaleString()}`}
    >
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <p className={`text-sm font-medium ${colors.text}`}>
            {label}
          </p>
          <p className="text-2xl sm:text-3xl font-bold text-gray-900">
            {value.toLocaleString()}
          </p>
          {description && (
            <p className="text-xs text-gray-500 hidden sm:block">
              {description}
            </p>
          )}
        </div>
        <div 
          className={`p-3 rounded-xl bg-gradient-to-br ${colors.gradient} shadow-lg group-hover:scale-105 transition-transform duration-200`}
        >
          <Icon className="h-6 w-6 text-white" aria-hidden="true" />
        </div>
      </div>
    </div>
  );
});

StatCard.displayName = 'StatCard';

export default StatCard;
