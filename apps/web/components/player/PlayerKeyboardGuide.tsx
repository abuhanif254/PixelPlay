'use client';

import React from 'react';
import { HelpCircle, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { SHORTCUTS } from './types';

export interface PlayerKeyboardGuideProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function PlayerKeyboardGuide({ isOpen, onClose }: PlayerKeyboardGuideProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          key="shortcuts"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          transition={{ duration: 0.2 }}
          className="absolute inset-0 z-[200] flex items-center justify-center bg-black/85 backdrop-blur-sm p-4"
          onClick={onClose}
        >
          <div
            className="bg-[#111228] border border-white/10 rounded-2xl p-6 shadow-2xl max-w-xs w-full"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-white font-bold text-sm font-outfit flex items-center gap-2">
                <HelpCircle size={16} className="text-[#6366F1]" /> Keyboard Shortcuts
              </h3>
              <button
                onClick={onClose}
                className="text-white/40 hover:text-white transition-colors"
                aria-label="Close shortcuts guide"
              >
                <X size={16} />
              </button>
            </div>
            <div className="grid grid-cols-1 gap-2">
              {SHORTCUTS.map(({ key, label }) => (
                <div key={key} className="flex items-center justify-between py-1 border-b border-white/5 last:border-0">
                  <span className="text-gray-400 text-xs">{label}</span>
                  <kbd className="px-2.5 py-1 bg-white/10 border border-white/15 rounded-md text-white text-xs font-mono font-bold shadow-sm">
                    {key}
                  </kbd>
                </div>
              ))}
            </div>
            <p className="text-gray-500 text-[11px] text-center mt-4">Auto-closes in 5s • Press ? to toggle</p>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
