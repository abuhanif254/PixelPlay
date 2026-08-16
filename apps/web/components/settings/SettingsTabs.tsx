'use client';

import React, { useState } from 'react';
import { Shield, Key, Mail, UserX, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { updateEmail, updatePassword, deleteAccount } from '@/app/settings/actions';
import { motion, AnimatePresence } from 'framer-motion';

export default function SettingsTabs({ userEmail }: { userEmail: string }) {
  const [activeTab, setActiveTab] = useState<'security' | 'danger'>('security');
  
  // States for Email Form
  const [email, setEmail] = useState(userEmail);
  const [emailLoading, setEmailLoading] = useState(false);
  const [emailMessage, setEmailMessage] = useState({ type: '', text: '' });

  // States for Password Form
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [passwordMessage, setPasswordMessage] = useState({ type: '', text: '' });

  // States for Delete Account
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const handleUpdateEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    setEmailLoading(true);
    setEmailMessage({ type: '', text: '' });
    
    const formData = new FormData();
    formData.append('email', email);
    
    const res = await updateEmail(null, formData);
    if (res.success) {
      setEmailMessage({ type: 'success', text: res.message || 'Check your inbox to confirm.' });
    } else {
      setEmailMessage({ type: 'error', text: res.error || 'Failed to update email.' });
    }
    setEmailLoading(false);
  };

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordLoading(true);
    setPasswordMessage({ type: '', text: '' });
    
    if (password !== confirmPassword) {
      setPasswordMessage({ type: 'error', text: 'Passwords do not match.' });
      setPasswordLoading(false);
      return;
    }

    const formData = new FormData();
    formData.append('password', password);
    formData.append('confirmPassword', confirmPassword);
    
    const res = await updatePassword(null, formData);
    if (res.success) {
      setPasswordMessage({ type: 'success', text: res.message || 'Password updated.' });
      setPassword('');
      setConfirmPassword('');
    } else {
      setPasswordMessage({ type: 'error', text: res.error || 'Failed to update password.' });
    }
    setPasswordLoading(false);
  };

  const handleDeleteAccount = async () => {
    setDeleteLoading(true);
    await deleteAccount();
    // Redirect happens in server action
  };

  const inputCls = 'w-full bg-gray-50 dark:bg-black/20 border border-gray-200 dark:border-white/10 rounded-xl px-4 py-3 text-sm text-gray-900 dark:text-white focus:outline-none focus:border-[#6366F1] transition-colors';

  return (
    <div className="flex flex-col md:flex-row min-h-[500px]">
      
      {/* Sidebar Navigation */}
      <div className="w-full md:w-64 border-b md:border-b-0 md:border-r border-gray-200 dark:border-white/10 p-6 flex flex-row md:flex-col gap-2 overflow-x-auto">
        <button
          onClick={() => setActiveTab('security')}
          className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all whitespace-nowrap ${
            activeTab === 'security' 
              ? 'bg-[#6366F1] text-white shadow-md' 
              : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-white/5'
          }`}
        >
          <Shield size={18} /> Security
        </button>
        <button
          onClick={() => setActiveTab('danger')}
          className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all whitespace-nowrap ${
            activeTab === 'danger' 
              ? 'bg-red-500 text-white shadow-md' 
              : 'text-red-500/70 hover:bg-red-50 dark:hover:bg-red-500/10'
          }`}
        >
          <UserX size={18} /> Danger Zone
        </button>
      </div>

      {/* Content Area */}
      <div className="flex-1 p-6 md:p-10">
        
        {/* SECURITY TAB */}
        {activeTab === 'security' && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="max-w-xl space-y-10">
            
            {/* Update Email */}
            <section>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2 flex items-center gap-2">
                <Mail className="text-[#6366F1]" size={20} /> Update Email Address
              </h2>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
                Change the email address associated with your account. We will send a confirmation link to your new address.
              </p>
              
              <form onSubmit={handleUpdateEmail} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 mb-2 uppercase tracking-wider">New Email Address</label>
                  <input 
                    type="email" 
                    value={email} 
                    onChange={e => setEmail(e.target.value)} 
                    className={inputCls} 
                    required 
                  />
                </div>
                
                {emailMessage.text && (
                  <div className={`p-3 rounded-xl text-sm flex items-start gap-2 ${emailMessage.type === 'error' ? 'bg-red-50 text-red-600 dark:bg-red-500/10 dark:text-red-400' : 'bg-green-50 text-green-600 dark:bg-green-500/10 dark:text-green-400'}`}>
                    {emailMessage.type === 'error' ? <AlertTriangle size={16} className="mt-0.5 shrink-0" /> : <CheckCircle2 size={16} className="mt-0.5 shrink-0" />}
                    <span>{emailMessage.text}</span>
                  </div>
                )}
                
                <button 
                  type="submit" 
                  disabled={emailLoading || email === userEmail}
                  className="px-6 py-2.5 bg-[#6366F1] hover:bg-[#5457DF] text-white text-sm font-bold rounded-xl transition-colors disabled:opacity-50"
                >
                  {emailLoading ? 'Updating...' : 'Update Email'}
                </button>
              </form>
            </section>

            <hr className="border-gray-200 dark:border-white/10" />

            {/* Update Password */}
            <section>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2 flex items-center gap-2">
                <Key className="text-[#6366F1]" size={20} /> Change Password
              </h2>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
                Ensure your account is using a long, random password to stay secure.
              </p>
              
              <form onSubmit={handleUpdatePassword} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 mb-2 uppercase tracking-wider">New Password</label>
                    <input 
                      type="password" 
                      value={password} 
                      onChange={e => setPassword(e.target.value)} 
                      className={inputCls} 
                      required 
                      minLength={6}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 mb-2 uppercase tracking-wider">Confirm Password</label>
                    <input 
                      type="password" 
                      value={confirmPassword} 
                      onChange={e => setConfirmPassword(e.target.value)} 
                      className={inputCls} 
                      required 
                      minLength={6}
                    />
                  </div>
                </div>

                {passwordMessage.text && (
                  <div className={`p-3 rounded-xl text-sm flex items-start gap-2 ${passwordMessage.type === 'error' ? 'bg-red-50 text-red-600 dark:bg-red-500/10 dark:text-red-400' : 'bg-green-50 text-green-600 dark:bg-green-500/10 dark:text-green-400'}`}>
                    {passwordMessage.type === 'error' ? <AlertTriangle size={16} className="mt-0.5 shrink-0" /> : <CheckCircle2 size={16} className="mt-0.5 shrink-0" />}
                    <span>{passwordMessage.text}</span>
                  </div>
                )}
                
                <button 
                  type="submit" 
                  disabled={passwordLoading || !password || !confirmPassword}
                  className="px-6 py-2.5 bg-[#6366F1] hover:bg-[#5457DF] text-white text-sm font-bold rounded-xl transition-colors disabled:opacity-50"
                >
                  {passwordLoading ? 'Updating...' : 'Update Password'}
                </button>
              </form>
            </section>
          </motion.div>
        )}

        {/* DANGER ZONE TAB */}
        {activeTab === 'danger' && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="max-w-xl">
            <h2 className="text-xl font-bold text-red-600 dark:text-red-500 mb-2 flex items-center gap-2">
              <AlertTriangle size={20} /> Danger Zone
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
              Once you delete your account, there is no going back. Please be certain. All your scores, achievements, and published games will be anonymized or removed.
            </p>

            {!showDeleteConfirm ? (
              <button 
                onClick={() => setShowDeleteConfirm(true)}
                className="px-6 py-3 bg-red-50 hover:bg-red-100 dark:bg-red-500/10 dark:hover:bg-red-500/20 text-red-600 dark:text-red-500 text-sm font-bold rounded-xl transition-colors border border-red-200 dark:border-red-500/30"
              >
                Delete Account
              </button>
            ) : (
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800/50 p-6 rounded-2xl">
                <h3 className="font-bold text-red-900 dark:text-red-400 mb-2">Are you absolutely sure?</h3>
                <p className="text-sm text-red-700 dark:text-red-300/80 mb-6">
                  This action cannot be undone. This will permanently delete your account and remove your data from our servers.
                </p>
                <div className="flex gap-3">
                  <button 
                    onClick={handleDeleteAccount}
                    disabled={deleteLoading}
                    className="flex-1 px-4 py-2.5 bg-red-600 hover:bg-red-700 text-white text-sm font-bold rounded-xl transition-colors disabled:opacity-50"
                  >
                    {deleteLoading ? 'Deleting...' : 'Yes, delete my account'}
                  </button>
                  <button 
                    onClick={() => setShowDeleteConfirm(false)}
                    disabled={deleteLoading}
                    className="flex-1 px-4 py-2.5 bg-white dark:bg-black/20 border border-gray-200 dark:border-white/10 text-gray-700 dark:text-gray-300 text-sm font-bold rounded-xl hover:bg-gray-50 dark:hover:bg-white/5 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </motion.div>
        )}

      </div>
    </div>
  );
}
