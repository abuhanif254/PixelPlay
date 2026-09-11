'use client';

import React from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';

interface SectionHeaderProps {
  title: string;
  subtitle?: string;
  actionText?: string;
  actionHref?: string;
  onActionClick?: () => void;
  icon?: React.ReactNode;
  icon3d?: React.ReactNode;
}

export const SectionHeader: React.FC<SectionHeaderProps> = ({ 
  title, 
  subtitle, 
  actionText, 
  actionHref, 
  onActionClick, 
  icon,
  icon3d,
}) => {
  const displayIcon = icon || icon3d;

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.4 }}
      className="flex flex-col sm:flex-row sm:items-end justify-between mb-6 gap-4"
    >
      <div className="flex-1">
        <h2 className="text-fluid-2xl md:text-fluid-3xl font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-300 flex items-center gap-2.5 text-balance leading-tight">
          {displayIcon && (
            <span className="w-8 h-8 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center shrink-0">
              {displayIcon}
            </span>
          )}
          <span>{title}</span>
        </h2>
        {subtitle && (
          <p className="text-gray-500 dark:text-gray-400 mt-1 text-sm md:text-base">
            {subtitle}
          </p>
        )}
      </div>
      
      {actionText && (
        actionHref ? (
          <Link 
            href={actionHref} 
            className="text-accent hover:text-accent/80 font-medium text-sm md:text-base transition-colors whitespace-nowrap"
          >
            {actionText} &rarr;
          </Link>
        ) : (
          <button 
            onClick={onActionClick}
            className="text-accent hover:text-accent/80 font-medium text-sm md:text-base transition-colors whitespace-nowrap"
          >
            {actionText} &rarr;
          </button>
        )
      )}
    </motion.div>
  );
};
