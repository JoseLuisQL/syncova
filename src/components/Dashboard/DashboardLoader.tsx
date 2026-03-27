import React from 'react';
import { motion, Variants } from 'framer-motion';

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.1,
    },
  },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 300, damping: 24 } },
};

export const DashboardLoader: React.FC = () => {
  return (
    <div className="w-full min-h-screen bg-zinc-50/50 p-4 sm:p-6 lg:p-8 flex items-center justify-center">
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="show"
        className="w-full max-w-7xl mx-auto space-y-8"
      >
        {/* Header Skeleton */}
        <motion.div variants={itemVariants} className="flex justify-between items-center mb-8">
          <div className="space-y-3">
            <div className="h-8 w-48 bg-zinc-200/60 rounded-lg animate-pulse" />
            <div className="h-4 w-32 bg-zinc-100 rounded flex-shrink-0 animate-pulse" />
          </div>
          <div className="h-10 w-32 bg-zinc-200/60 rounded-xl animate-pulse" />
        </motion.div>

        {/* Stats Grid Skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {[1, 2, 3, 4].map((i) => (
            <motion.div
              key={i}
              variants={itemVariants}
              className="bg-white rounded-2xl h-[120px] p-5 border border-zinc-100 overflow-hidden relative"
            >
              <div className="absolute inset-0 bg-gradient-to-tr from-zinc-50 to-white animate-pulse" />
              <div className="relative z-10 flex justify-between">
                <div className="space-y-4">
                  <div className="h-4 w-20 bg-zinc-200/80 rounded" />
                  <div className="h-8 w-16 bg-zinc-200/80 rounded" />
                </div>
                <div className="h-12 w-12 rounded-xl bg-zinc-100" />
              </div>
            </motion.div>
          ))}
        </div>

        {/* Charts Skeleton */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {[1, 2].map((i) => (
            <motion.div
              key={`chart-${i}`}
              variants={itemVariants}
              className="bg-white rounded-[24px] h-[380px] border border-zinc-100 overflow-hidden relative p-6"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-zinc-50 to-white cursor-wait" />
               <div className="relative z-10 flex gap-4 items-center mb-8">
                 <div className="w-10 h-10 rounded-xl bg-zinc-200/80 animate-pulse" />
                 <div className="h-5 w-40 bg-zinc-200/80 rounded animate-pulse" />
               </div>
               <div className="relative z-10 w-full h-[60%] bg-zinc-100/50 rounded-xl animate-pulse" />
            </motion.div>
          ))}
        </div>
      </motion.div>
    </div>
  );
};
