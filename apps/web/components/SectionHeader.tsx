'use client';

import React from 'react';
import { motion } from 'framer-motion';

interface SectionHeaderProps {
  title: string;
  subtitle?: string;
  actionText?: string;
  onActionClick?: () => void;
}

export const SectionHeader: React.FC<SectionHeaderProps> = ({ 
  title, 
  subtitle, 
  actionText, 
  onActionClick 
}) => {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.4 }}
      className="flex flex-col sm:flex-row sm:items-end justify-between mb-6 gap-4"
    >
      <div>
        <h2 className="text-fluid-2xl md:text-fluid-3xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
          {title}
        </h2>
        {subtitle && (
          <p className="text-gray-500 dark:text-gray-400 mt-1 text-sm md:text-base">
            {subtitle}
          </p>
        )}
      </div>
      
      {actionText && (
        <button 
          onClick={onActionClick}
          className="text-accent hover:text-accent/80 font-medium text-sm md:text-base transition-colors whitespace-nowrap"
        >
          {actionText} &rarr;
        </button>
      )}
    </motion.div>
  );
};
