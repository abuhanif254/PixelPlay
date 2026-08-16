"use client";

import React, { useRef } from 'react';
import { useFormState, useFormStatus } from 'react-dom';
import { submitContactForm } from '@/app/contact/actions';
import { Send, CheckCircle2, AlertCircle } from 'lucide-react';
import { motion } from 'framer-motion';

function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      className="w-full bg-[#6366F1] hover:bg-[#5457DF] text-white font-bold py-4 px-6 rounded-xl transition-all shadow-[0_0_20px_rgba(99,102,241,0.3)] hover:shadow-[0_0_30px_rgba(99,102,241,0.5)] flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
    >
      {pending ? (
        <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
      ) : (
        <>
          <span>Send Message</span>
          <Send size={18} />
        </>
      )}
    </button>
  );
}

export default function ContactForm() {
  const [state, formAction] = useFormState(submitContactForm, null);
  const formRef = useRef<HTMLFormElement>(null);

  if (state?.success) {
    return (
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-2xl p-8 text-center"
      >
        <div className="w-16 h-16 bg-green-100 dark:bg-green-800/50 rounded-full flex items-center justify-center mx-auto mb-4 text-green-600 dark:text-green-400">
          <CheckCircle2 size={32} />
        </div>
        <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Message Sent!</h3>
        <p className="text-gray-600 dark:text-gray-400 mb-6">
          Thank you for reaching out. Our support team will get back to you within 24-48 hours.
        </p>
        <button 
          onClick={() => {
            formRef.current?.reset();
            // We can't reset formState natively yet, so we just reload or let user navigate away.
            window.location.reload();
          }}
          className="px-6 py-2 bg-green-600 hover:bg-green-700 text-white font-bold rounded-lg transition-colors"
        >
          Send Another Message
        </button>
      </motion.div>
    );
  }

  return (
    <form ref={formRef} action={formAction} className="space-y-6">
      
      {state?.error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 p-4 rounded-xl flex items-start gap-3">
          <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
          <p className="text-sm font-medium">{state.error}</p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <label htmlFor="name" className="text-sm font-bold text-gray-900 dark:text-white">Your Name</label>
          <input 
            type="text" 
            id="name" 
            name="name" 
            required 
            placeholder="John Doe"
            className="w-full bg-gray-50 dark:bg-[#0A0A1B] border border-gray-200 dark:border-white/10 rounded-xl py-3 px-4 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#6366F1] transition-all"
          />
        </div>
        <div className="space-y-2">
          <label htmlFor="email" className="text-sm font-bold text-gray-900 dark:text-white">Email Address</label>
          <input 
            type="email" 
            id="email" 
            name="email" 
            required 
            placeholder="john@example.com"
            className="w-full bg-gray-50 dark:bg-[#0A0A1B] border border-gray-200 dark:border-white/10 rounded-xl py-3 px-4 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#6366F1] transition-all"
          />
        </div>
      </div>

      <div className="space-y-2">
        <label htmlFor="subject" className="text-sm font-bold text-gray-900 dark:text-white">Subject</label>
        <select 
          id="subject" 
          name="subject" 
          required
          className="w-full bg-gray-50 dark:bg-[#0A0A1B] border border-gray-200 dark:border-white/10 rounded-xl py-3 px-4 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#6366F1] transition-all appearance-none"
        >
          <option value="" disabled selected>Select a topic...</option>
          <option value="General Inquiry">General Inquiry</option>
          <option value="Account Support">Account Support</option>
          <option value="Bug Report">Bug Report</option>
          <option value="Developer Submission">Developer Submission</option>
          <option value="Business Partnership">Business Partnership</option>
        </select>
      </div>

      <div className="space-y-2">
        <label htmlFor="message" className="text-sm font-bold text-gray-900 dark:text-white">Message</label>
        <textarea 
          id="message" 
          name="message" 
          required 
          rows={6}
          placeholder="How can we help you?"
          className="w-full bg-gray-50 dark:bg-[#0A0A1B] border border-gray-200 dark:border-white/10 rounded-xl py-3 px-4 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#6366F1] transition-all resize-y"
        />
      </div>

      <SubmitButton />
      
      <p className="text-xs text-center text-gray-500 dark:text-gray-400 mt-4">
        By submitting this form, you agree to our <a href="/privacy" className="text-[#6366F1] hover:underline">Privacy Policy</a>.
      </p>
    </form>
  );
}
