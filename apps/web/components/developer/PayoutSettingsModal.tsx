'use client';

import React, { useState, useEffect } from 'react';
import { 
  DollarSign, 
  CreditCard, 
  CheckCircle2, 
  X, 
  ShieldCheck, 
  AlertCircle, 
  Settings,
  ArrowUpRight
} from 'lucide-react';

interface PayoutSettingsProps {
  currentBalance: number;
}

export default function PayoutSettingsModal({ currentBalance }: PayoutSettingsProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [method, setMethod] = useState<'paypal' | 'stripe' | 'wire'>('paypal');
  const [payoutAccount, setPayoutAccount] = useState('');
  const [taxCertified, setTaxCertified] = useState(true);
  const [savedSuccess, setSavedSuccess] = useState(false);

  useEffect(() => {
    try {
      const saved = localStorage.getItem('spielcade_payout_settings');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.method) setMethod(parsed.method);
        if (parsed.account) setPayoutAccount(parsed.account);
        if (parsed.taxCertified !== undefined) setTaxCertified(parsed.taxCertified);
      }
    } catch {}
  }, []);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    try {
      localStorage.setItem('spielcade_payout_settings', JSON.stringify({
        method,
        account: payoutAccount,
        taxCertified,
        updatedAt: new Date().toISOString()
      }));
      setSavedSuccess(true);
      setTimeout(() => {
        setSavedSuccess(false);
        setIsOpen(false);
      }, 1500);
    } catch (err) {
      console.error(err);
    }
  };

  const threshold = 50.00;
  const progress = Math.min(100, Math.round((currentBalance / threshold) * 100));
  const isEligible = currentBalance >= threshold;

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-emerald-600/25"
      >
        <Settings size={14} /> Payout Settings
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#111228] border border-gray-200 dark:border-white/10 rounded-2xl p-6 max-w-lg w-full shadow-2xl animate-fadeIn">
            
            <div className="flex items-center justify-between border-b border-gray-100 dark:border-white/5 pb-4 mb-5">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center">
                  <CreditCard size={18} />
                </div>
                <div>
                  <h3 className="text-base font-bold font-outfit text-gray-900 dark:text-white">
                    Payout Preferences & Threshold
                  </h3>
                  <p className="text-xs text-gray-500">Configure how you receive your 70% monthly ad revenue.</p>
                </div>
              </div>
              <button 
                onClick={() => setIsOpen(false)}
                className="text-gray-400 hover:text-gray-700 dark:hover:text-white"
              >
                <X size={18} />
              </button>
            </div>

            {/* Threshold Progress Bar */}
            <div className="p-4 bg-gray-50 dark:bg-black/20 rounded-xl border border-gray-200 dark:border-white/5 mb-5">
              <div className="flex items-center justify-between text-xs mb-1.5 font-bold">
                <span className="text-gray-600 dark:text-gray-400">Payout Eligibility Status</span>
                <span className={isEligible ? 'text-emerald-500' : 'text-amber-500'}>
                  ${currentBalance.toFixed(2)} / ${threshold.toFixed(2)} ({progress}%)
                </span>
              </div>
              <div className="w-full h-2 bg-gray-200 dark:bg-white/10 rounded-full overflow-hidden">
                <div 
                  className={`h-full transition-all duration-500 rounded-full ${
                    isEligible ? 'bg-emerald-500' : 'bg-gradient-to-r from-amber-500 to-indigo-500'
                  }`} 
                  style={{ width: `${progress}%` }} 
                />
              </div>
              <p className="text-[11px] text-gray-500 mt-2">
                {isEligible 
                  ? '✓ Threshold reached. Your balance will disburse in the next scheduled monthly cycle.' 
                  : `Earn $${(threshold - currentBalance).toFixed(2)} more to reach the minimum monthly payout threshold.`}
              </p>
            </div>

            <form onSubmit={handleSave} className="space-y-4">
              
              {/* Method Selector */}
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
                  Payout Method
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: 'paypal', label: 'PayPal' },
                    { id: 'stripe', label: 'Stripe Connect' },
                    { id: 'wire', label: 'Direct Wire' }
                  ].map(m => (
                    <button
                      key={m.id}
                      type="button"
                      onClick={() => setMethod(m.id as any)}
                      className={`py-2 px-3 rounded-xl text-xs font-bold transition-all border ${
                        method === m.id
                          ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm'
                          : 'bg-white dark:bg-[#0A0B1A] text-gray-700 dark:text-gray-300 border-gray-200 dark:border-white/10 hover:border-emerald-500'
                      }`}
                    >
                      {m.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Destination Input */}
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">
                  {method === 'paypal' ? 'PayPal Account Email *' : method === 'stripe' ? 'Stripe Account ID / Email *' : 'Bank IBAN / Wire Instructions *'}
                </label>
                <input
                  required
                  type={method === 'paypal' ? 'email' : 'text'}
                  value={payoutAccount}
                  onChange={e => setPayoutAccount(e.target.value)}
                  placeholder={method === 'paypal' ? 'developer@example.com' : method === 'stripe' ? 'acct_1N234...' : 'US89370400440532013000'}
                  className="w-full bg-gray-50 dark:bg-[#0A0B1A] border border-gray-200 dark:border-white/10 rounded-xl px-4 py-2.5 text-xs text-gray-900 dark:text-white focus:outline-none focus:border-emerald-500 transition-colors"
                />
              </div>

              {/* Tax Compliance Checkbox */}
              <div className="flex items-start gap-2.5 pt-1">
                <input
                  type="checkbox"
                  id="taxCert"
                  checked={taxCertified}
                  onChange={e => setTaxCertified(e.target.checked)}
                  className="mt-0.5 rounded border-gray-300 text-emerald-600 focus:ring-emerald-500"
                />
                <label htmlFor="taxCert" className="text-xs text-gray-500 leading-relaxed">
                  I certify under penalty of perjury that I am authorized to receive commercial game royalties and will provide W-8/W-9 documentation upon exceeding platform reporting thresholds.
                </label>
              </div>

              {savedSuccess && (
                <div className="p-3 bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20 text-emerald-700 dark:text-emerald-400 rounded-xl text-xs font-bold flex items-center gap-2">
                  <CheckCircle2 size={14} /> Payout settings updated successfully!
                </div>
              )}

              <div className="pt-4 border-t border-gray-100 dark:border-white/5 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="px-4 py-2 text-xs font-bold rounded-xl border border-gray-300 dark:border-white/10 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-white/5"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-emerald-600/30"
                >
                  Save Settings
                </button>
              </div>

            </form>

          </div>
        </div>
      )}
    </>
  );
}
