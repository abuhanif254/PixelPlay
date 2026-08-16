'use client';

import React, { useState } from 'react';
import { generateApiKey, revokeApiKey } from '../actions';
import { Key, Trash2, Copy, AlertCircle, CheckCircle } from 'lucide-react';

export default function KeysClient({ keys }: { keys: any[] }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [newKey, setNewKey] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const handleGenerate = async () => {
    setLoading(true);
    setError(null);
    setNewKey(null);
    setCopied(false);

    try {
      const res = await generateApiKey();
      if (res.success && res.key) {
        setNewKey(res.key);
      } else {
        setError(res.error || 'Failed to generate key');
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleRevoke = async (id: string) => {
    if (!confirm('Are you sure you want to revoke this API key? Games using this key will immediately stop working.')) return;
    setLoading(true);
    try {
      await revokeApiKey(id);
      setNewKey(null);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = () => {
    if (newKey) {
      navigator.clipboard.writeText(newKey);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const hasKey = keys && keys.length > 0;

  return (
    <div className="flex flex-col gap-6">
      {error && (
        <div className="p-4 bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 text-red-700 dark:text-red-400 rounded-xl flex items-center gap-2">
          <AlertCircle size={18} />
          <p className="text-sm">{error}</p>
        </div>
      )}

      {newKey && (
        <div className="p-6 bg-green-50 dark:bg-green-500/10 border border-green-200 dark:border-green-500/20 rounded-xl">
          <h3 className="text-green-800 dark:text-green-400 font-bold mb-2 flex items-center gap-2">
            <CheckCircle size={18} />
            New API Key Generated!
          </h3>
          <p className="text-sm text-green-700 dark:text-green-300 mb-4">
            Please copy this key now. For security reasons, <strong>you will not be able to see it again!</strong>
          </p>
          <div className="flex items-center gap-2">
            <code className="flex-1 p-3 bg-white dark:bg-black/40 border border-green-200 dark:border-green-500/30 rounded-lg text-sm font-mono text-gray-900 dark:text-gray-100 break-all">
              {newKey}
            </code>
            <button
              onClick={copyToClipboard}
              className="px-4 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg flex items-center gap-2 transition-colors font-bold text-sm"
            >
              {copied ? <CheckCircle size={16} /> : <Copy size={16} />}
              {copied ? 'Copied' : 'Copy'}
            </button>
          </div>
        </div>
      )}

      {hasKey ? (
        <div className="overflow-x-auto border border-gray-200 dark:border-white/5 rounded-xl">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50/50 dark:bg-black/20 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                <th className="px-6 py-4">Key Hash</th>
                <th className="px-6 py-4">Created At</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-white/5">
              {keys.map((k) => (
                <tr key={k.id} className="hover:bg-gray-50/50 dark:hover:bg-white/5 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <Key className="text-yellow-500" size={18} />
                      <code className="text-sm font-mono text-gray-800 dark:text-gray-300 bg-gray-100 dark:bg-white/10 px-2 py-1 rounded">
                        sp_live_...{k.key_hash.substring(0, 8)}
                      </code>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">
                    {new Date(k.created_at).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button
                      onClick={() => handleRevoke(k.id)}
                      disabled={loading}
                      className="text-red-500 hover:text-red-600 p-2 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg transition-colors disabled:opacity-50"
                      title="Revoke Key"
                    >
                      <Trash2 size={18} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="text-center p-8 border border-dashed border-gray-300 dark:border-white/20 rounded-xl">
          <Key className="mx-auto text-gray-400 mb-3" size={32} />
          <h3 className="text-gray-900 dark:text-white font-bold mb-2">No API Key</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
            You don't have an active Master Key. Generate one to use the Spielcade SDK.
          </p>
          <button
            onClick={handleGenerate}
            disabled={loading}
            className="px-6 py-2.5 bg-[#6366F1] text-white rounded-xl font-bold hover:shadow-[0_0_20px_rgba(99,102,241,0.4)] transition-all disabled:opacity-50 disabled:shadow-none"
          >
            {loading ? 'Generating...' : 'Generate Master Key'}
          </button>
        </div>
      )}

      {hasKey && (
        <div className="mt-4">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            You can only have 1 Master Key at a time. To generate a new one, you must revoke the current one.
          </p>
        </div>
      )}
    </div>
  );
}
