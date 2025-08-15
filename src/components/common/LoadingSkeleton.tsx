import React from 'react';

interface LoadingSkeletonProps {
  rows?: number;
  className?: string;
}

export const TableLoadingSkeleton: React.FC<LoadingSkeletonProps> = ({ 
  rows = 5, 
  className = '' 
}) => {
  return (
    <div className={`animate-pulse ${className}`}>
      <div className="bg-white shadow rounded-lg overflow-hidden">
        {/* Header skeleton */}
        <div className="bg-gray-50 px-6 py-3 border-b border-gray-200">
          <div className="flex space-x-4">
            <div className="h-4 bg-gray-300 rounded w-1/4"></div>
            <div className="h-4 bg-gray-300 rounded w-1/6"></div>
            <div className="h-4 bg-gray-300 rounded w-1/6"></div>
            <div className="h-4 bg-gray-300 rounded w-1/6"></div>
            <div className="h-4 bg-gray-300 rounded w-1/6"></div>
          </div>
        </div>
        
        {/* Rows skeleton */}
        <div className="divide-y divide-gray-200">
          {Array.from({ length: rows }).map((_, index) => (
            <div key={index} className="px-6 py-4">
              <div className="flex items-center space-x-4">
                <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                <div className="h-4 bg-gray-200 rounded w-1/6"></div>
                <div className="h-4 bg-gray-200 rounded w-1/6"></div>
                <div className="h-4 bg-gray-200 rounded w-1/6"></div>
                <div className="flex space-x-2 w-1/6">
                  <div className="h-8 w-8 bg-gray-200 rounded"></div>
                  <div className="h-8 w-8 bg-gray-200 rounded"></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export const CardLoadingSkeleton: React.FC<LoadingSkeletonProps> = ({ 
  rows = 3, 
  className = '' 
}) => {
  return (
    <div className={`animate-pulse ${className}`}>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {Array.from({ length: rows }).map((_, index) => (
          <div key={index} className="bg-white shadow rounded-lg p-6">
            <div className="space-y-3">
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              <div className="h-3 bg-gray-200 rounded w-1/2"></div>
              <div className="h-3 bg-gray-200 rounded w-2/3"></div>
              <div className="flex space-x-2 mt-4">
                <div className="h-8 w-16 bg-gray-200 rounded"></div>
                <div className="h-8 w-16 bg-gray-200 rounded"></div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export const FormLoadingSkeleton: React.FC<{ className?: string }> = ({ 
  className = '' 
}) => {
  return (
    <div className={`animate-pulse ${className}`}>
      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <div className="h-4 bg-gray-200 rounded w-1/4 mb-2"></div>
            <div className="h-10 bg-gray-200 rounded"></div>
          </div>
          <div>
            <div className="h-4 bg-gray-200 rounded w-1/4 mb-2"></div>
            <div className="h-10 bg-gray-200 rounded"></div>
          </div>
        </div>
        <div>
          <div className="h-4 bg-gray-200 rounded w-1/4 mb-2"></div>
          <div className="h-24 bg-gray-200 rounded"></div>
        </div>
        <div className="flex justify-end space-x-3 pt-4">
          <div className="h-10 w-20 bg-gray-200 rounded"></div>
          <div className="h-10 w-20 bg-gray-200 rounded"></div>
        </div>
      </div>
    </div>
  );
};

export const FilterLoadingSkeleton: React.FC<{ className?: string }> = ({ 
  className = '' 
}) => {
  return (
    <div className={`animate-pulse ${className}`}>
      <div className="bg-white p-4 rounded-lg shadow">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
            <div className="h-10 bg-gray-200 rounded"></div>
          </div>
          <div>
            <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
            <div className="h-10 bg-gray-200 rounded"></div>
          </div>
          <div>
            <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
            <div className="h-10 bg-gray-200 rounded"></div>
          </div>
          <div className="flex items-end">
            <div className="h-10 w-full bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    </div>
  );
};

interface StatCardSkeletonProps {
  count?: number;
  className?: string;
}

export const StatCardSkeleton: React.FC<StatCardSkeletonProps> = ({ 
  count = 4, 
  className = '' 
}) => {
  return (
    <div className={`animate-pulse ${className}`}>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {Array.from({ length: count }).map((_, index) => (
          <div key={index} className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="h-8 w-8 bg-gray-200 rounded"></div>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
                  <div className="h-6 bg-gray-200 rounded w-3/4"></div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export const ListLoadingSkeleton: React.FC<LoadingSkeletonProps> = ({ 
  rows = 5, 
  className = '' 
}) => {
  return (
    <div className={`animate-pulse ${className}`}>
      <div className="bg-white shadow rounded-lg">
        <div className="divide-y divide-gray-200">
          {Array.from({ length: rows }).map((_, index) => (
            <div key={index} className="px-6 py-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="h-10 w-10 bg-gray-200 rounded-full"></div>
                  <div className="space-y-1">
                    <div className="h-4 bg-gray-200 rounded w-32"></div>
                    <div className="h-3 bg-gray-200 rounded w-24"></div>
                  </div>
                </div>
                <div className="flex space-x-2">
                  <div className="h-8 w-8 bg-gray-200 rounded"></div>
                  <div className="h-8 w-8 bg-gray-200 rounded"></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export const PageLoadingSkeleton: React.FC<{ className?: string }> = ({ 
  className = '' 
}) => {
  return (
    <div className={`animate-pulse space-y-6 ${className}`}>
      {/* Header skeleton */}
      <div className="space-y-2">
        <div className="h-8 bg-gray-200 rounded w-1/3"></div>
        <div className="h-4 bg-gray-200 rounded w-1/2"></div>
      </div>
      
      {/* Filters skeleton */}
      <FilterLoadingSkeleton />
      
      {/* Stats skeleton */}
      <StatCardSkeleton />
      
      {/* Table skeleton */}
      <TableLoadingSkeleton />
    </div>
  );
};

export default {
  TableLoadingSkeleton,
  CardLoadingSkeleton,
  FormLoadingSkeleton,
  FilterLoadingSkeleton,
  StatCardSkeleton,
  ListLoadingSkeleton,
  PageLoadingSkeleton
};
