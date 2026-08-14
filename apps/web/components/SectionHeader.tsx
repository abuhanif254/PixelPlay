'use client';

import React from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { View } from '@react-three/drei';

interface SectionHeaderProps {
  title: string;
  subtitle?: string;
  actionText?: string;
  actionHref?: string;
  onActionClick?: () => void;
  icon3d?: React.ReactNode;
}

export const SectionHeader: React.FC<SectionHeaderProps> = ({ 
  title, 
  subtitle, 
  actionText,
  actionHref,
  onActionClick,
  icon3d
}) => {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.4 }}
      className="flex flex-col sm:flex-row sm:items-end justify-between mb-6 gap-4"
    >
      <div className="flex-1">
        <h2 className="text-fluid-2xl md:text-fluid-3xl font-extrabold tracking-tight text-gray-900 dark:text-white flex items-center gap-2 text-balance leading-tight">
          {icon3d && (
            <div className="w-12 h-12 -ml-2 shrink-0 relative">
              <View className="absolute inset-0 z-10 w-[200%] h-[200%] -top-[50%] -left-[50%] pointer-events-none">
                {icon3d}
              </View>
            </div>
          )}
          {title}
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
