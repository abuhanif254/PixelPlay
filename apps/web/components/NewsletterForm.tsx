"use client";

import React, { useRef } from 'react';
import { useFormState, useFormStatus } from 'react-dom';
import { subscribeToNewsletter } from '@/app/newsletter/actions';
import { Mail, CheckCircle2, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <motion.button 
      type="submit"
      disabled={pending}
      whileHover={{ scale: pending ? 1 : 1.02 }}
      whileTap={{ scale: pending ? 1 : 0.98 }}
      className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-medium rounded-lg py-2.5 text-sm transition-colors shadow-lg shadow-primary/20 flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
    >
      {pending ? (
        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
      ) : (
        'Subscribe Now'
      )}
    </motion.button>
  );
}

export default function NewsletterForm() {
  const [state, formAction] = useFormState(subscribeToNewsletter, null);
  const formRef = useRef<HTMLFormElement>(null);

  if (state?.success) {
    return (
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800/50 rounded-xl p-4 text-center"
      >
        <div className="w-10 h-10 bg-green-100 dark:bg-green-800/50 rounded-full flex items-center justify-center mx-auto mb-2 text-green-600 dark:text-green-400">
          <CheckCircle2 size={20} />
        </div>
        <p className="text-sm font-medium text-green-800 dark:text-green-300">
          You're all set!
        </p>
        <p className="text-xs text-green-600 dark:text-green-400/80 mt-1">
          Thanks for subscribing to our updates.
        </p>
      </motion.div>
    );
  }

  return (
    <form ref={formRef} action={formAction} className="space-y-3">
      
      <AnimatePresence>
        {state?.error && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800/50 text-red-600 dark:text-red-400 p-3 rounded-lg flex items-start gap-2"
          >
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <p className="text-xs font-medium">{state.error}</p>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="relative">
        <Mail className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-black/40 dark:text-white/40" />
        <input 
          type="email" 
          name="email"
          placeholder="Enter your email" 
          className="w-full bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 rounded-lg py-2.5 pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all text-gray-900 dark:text-white"
          required
        />
      </div>
      
      <SubmitButton />
    </form>
  );
}
