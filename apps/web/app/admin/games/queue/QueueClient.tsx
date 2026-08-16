'use client';

import React, { useState } from 'react';
import { approveGame, rejectGame } from '@/app/admin/games/actions';
import { Check, X, Play, ExternalLink } from 'lucide-react';

export default function QueueClient({ initialGames }: { initialGames: any[] }) {
  const [games, setGames] = useState(initialGames);
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState('');
  const [rejectingId, setRejectingId] = useState<string | null>(null);

  const handleApprove = async (id: string) => {
    setLoadingId(id);
    const res = await approveGame(id);
    if (res.success) {
      setGames(games.filter(g => g.id !== id));
    } else {
      alert(res.error);
    }
    setLoadingId(null);
  };

  const handleReject = async (id: string) => {
    if (!rejectReason.trim()) {
      alert('Please provide a reason for rejection.');
      return;
    }
    setLoadingId(id);
    const res = await rejectGame(id, rejectReason);
    if (res.success) {
      setGames(games.filter(g => g.id !== id));
      setRejectingId(null);
      setRejectReason('');
    } else {
      alert(res.error);
    }
    setLoadingId(null);
  };

  return (
    <div className="flex flex-col gap-6">
      {games.map(game => (
        <div key={game.id} className="bg-white dark:bg-[#111228]/80 backdrop-blur-md border border-gray-200 dark:border-white/5 rounded-2xl p-6 shadow-sm flex flex-col md:flex-row gap-6">
          
          {/* Game Thumbnail */}
          <div className="w-full md:w-48 h-32 rounded-xl bg-gray-100 dark:bg-[#0A0B1A] overflow-hidden shrink-0 border border-gray-200 dark:border-white/5 relative group">
            <img 
              src={game.image_url || `https://api.dicebear.com/7.x/identicon/svg?seed=${game.slug}`} 
              alt={game.title} 
              className="w-full h-full object-cover"
            />
            {game.source_url && (
              <a 
                href={game.source_url} 
                target="_blank" 
                rel="noreferrer"
                className="absolute inset-0 bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity text-white"
              >
                <Play size={24} />
              </a>
            )}
          </div>

          {/* Game Details */}
          <div className="flex-1 flex flex-col justify-center">
            <div className="flex items-start justify-between">
              <div>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-1">{game.title}</h2>
                <div className="flex items-center gap-2 mb-3">
                  <span className="px-2 py-1 bg-[#6366F1]/10 text-[#6366F1] text-[10px] font-bold uppercase rounded-lg">
                    {game.category}
                  </span>
                  <span className="text-xs text-gray-400">
                    Submitted {new Date(game.created_at).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </div>
            
            <p className="text-sm text-gray-600 dark:text-gray-300 mb-4 line-clamp-2">
              {game.description || 'No description provided.'}
            </p>

            {game.developer && (
              <div className="flex items-center gap-2 mt-auto">
                <img src={game.developer.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${game.developer.username}`} alt="" className="w-6 h-6 rounded-full" />
                <span className="text-xs font-medium text-gray-700 dark:text-gray-300">
                  Developed by <span className="font-bold">@{game.developer.username}</span>
                </span>
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="w-full md:w-48 flex flex-col justify-center gap-2 shrink-0 border-t md:border-t-0 md:border-l border-gray-100 dark:border-white/5 pt-4 md:pt-0 md:pl-6">
            {rejectingId === game.id ? (
              <div className="flex flex-col gap-2">
                <input 
                  type="text" 
                  placeholder="Reason for rejection..." 
                  value={rejectReason}
                  onChange={e => setRejectReason(e.target.value)}
                  className="w-full bg-gray-50 dark:bg-black/20 border border-gray-200 dark:border-white/10 rounded-lg px-3 py-2 text-xs text-gray-900 dark:text-white focus:outline-none"
                />
                <div className="flex gap-2">
                  <button 
                    onClick={() => handleReject(game.id)}
                    disabled={loadingId === game.id}
                    className="flex-1 bg-red-600 hover:bg-red-700 text-white text-xs font-bold py-2 rounded-lg transition-colors"
                  >
                    Confirm
                  </button>
                  <button 
                    onClick={() => { setRejectingId(null); setRejectReason(''); }}
                    className="flex-1 bg-gray-200 dark:bg-white/10 text-gray-900 dark:text-white text-xs font-bold py-2 rounded-lg hover:bg-gray-300 dark:hover:bg-white/20 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <>
                <button 
                  onClick={() => handleApprove(game.id)}
                  disabled={loadingId === game.id}
                  className="w-full flex items-center justify-center gap-2 bg-[#10B981] hover:bg-[#059669] text-white text-sm font-bold py-2.5 rounded-xl transition-colors disabled:opacity-50"
                >
                  <Check size={16} /> Approve
                </button>
                <button 
                  onClick={() => setRejectingId(game.id)}
                  disabled={loadingId === game.id}
                  className="w-full flex items-center justify-center gap-2 bg-red-50 hover:bg-red-100 text-red-600 dark:bg-red-500/10 dark:hover:bg-red-500/20 dark:text-red-400 text-sm font-bold py-2.5 rounded-xl transition-colors disabled:opacity-50"
                >
                  <X size={16} /> Reject
                </button>
                {game.source_url && (
                  <a 
                    href={game.source_url} 
                    target="_blank" 
                    rel="noreferrer"
                    className="w-full flex items-center justify-center gap-2 bg-gray-50 hover:bg-gray-100 text-gray-600 dark:bg-white/5 dark:hover:bg-white/10 dark:text-gray-300 text-sm font-bold py-2.5 rounded-xl transition-colors"
                  >
                    <ExternalLink size={14} /> Playtest
                  </a>
                )}
              </>
            )}
          </div>

        </div>
      ))}
    </div>
  );
}
