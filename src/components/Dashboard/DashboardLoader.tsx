import React from 'react';
import { motion, Variants } from 'motion/react';
import { MODULE_LAYOUT } from '../../styles/layout';

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
    <div className="flex min-h-screen w-full items-center justify-center bg-neutral p-4 sm:p-6 lg:p-8">
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="show"
        className={`${MODULE_LAYOUT.fullWidth} space-y-8`}
      >
        <motion.div variants={itemVariants} className="flex justify-between items-center mb-8">
          <div className="space-y-3">
            <div className="h-8 w-48 animate-pulse bg-zinc-200/70" />
            <div className="h-4 w-32 flex-shrink-0 animate-pulse bg-white" />
          </div>
          <div className="h-10 w-32 animate-pulse bg-zinc-200/70" />
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {[1, 2, 3, 4].map((i) => (
            <motion.div
              key={i}
              variants={itemVariants}
              className="relative h-[120px] overflow-hidden border border-zinc-200 bg-white p-5"
            >
              <div className="absolute inset-0 animate-pulse bg-white" />
              <div className="relative z-10 flex justify-between">
                <div className="space-y-4">
                  <div className="h-4 w-20 bg-zinc-200/80" />
                  <div className="h-8 w-16 bg-zinc-200/80" />
                </div>
                <div className="h-12 w-12 bg-neutral" />
              </div>
            </motion.div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {[1, 2].map((i) => (
            <motion.div
              key={`chart-${i}`}
              variants={itemVariants}
              className="relative h-[380px] overflow-hidden border border-zinc-200 bg-white p-6"
            >
              <div className="absolute inset-0 cursor-wait bg-white" />
               <div className="relative z-10 flex gap-4 items-center mb-8">
                 <div className="h-10 w-10 animate-pulse bg-zinc-200/80" />
                 <div className="h-5 w-40 animate-pulse bg-zinc-200/80" />
               </div>
               <div className="relative z-10 h-[60%] w-full animate-pulse bg-neutral" />
            </motion.div>
          ))}
        </div>
      </motion.div>
    </div>
  );
};
