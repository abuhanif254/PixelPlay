'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ListPlus,
  Plus,
  Check,
  X,
  Music,
  Sparkles,
  Layers,
  Share2,
} from 'lucide-react';
import { mixtapeManager, CustomMixtape } from '@/lib/mixtape-manager';
import { arcadeAudio } from '@/lib/arcade-audio';

interface MixtapeModalProps {
  gameSlug: string;
  gameTitle: string;
  isOpen: boolean;
  onClose: () => void;
}

export default function MixtapeModal({
  gameSlug,
  gameTitle,
  isOpen,
  onClose,
}: MixtapeModalProps) {
  const [mixtapes, setMixtapes] = useState<CustomMixtape[]>([]);
  const [isCreating, setIsCreating] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [selectedEmoji, setSelectedEmoji] = useState('🕹️');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const emojis = mixtapeManager.getPresetEmojis();

  useEffect(() => {
    if (isOpen) {
      setMixtapes(mixtapeManager.getMixtapes());
      setIsCreating(false);
      setNewTitle('');
    }
  }, [isOpen]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleToggleGame = (mixtape: CustomMixtape) => {
    const isNowAdded = mixtapeManager.toggleGameInMixtape(mixtape.id, gameSlug);
    setMixtapes(mixtapeManager.getMixtapes());

    if (isNowAdded) {
      arcadeAudio.playCoin();
      showToast(`Added to "${mixtape.title}"!`);
    } else {
      arcadeAudio.playBlip();
      showToast(`Removed from "${mixtape.title}".`);
    }
  };

  const handleCreateNew = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    const created = mixtapeManager.createMixtape(
      newTitle.trim(),
      'Custom playlist created by player',
      selectedEmoji,
      gameSlug
    );
    setMixtapes(mixtapeManager.getMixtapes());
    setIsCreating(false);
    setNewTitle('');
    arcadeAudio.playAchievement();
    showToast(`Created "${created.title}" with ${gameTitle}!`);
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-black/75 backdrop-blur-md"
        />

        {/* Modal Container */}
        <motion.div
          initial={{ scale: 0.95, opacity: 0, y: 15 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.95, opacity: 0, y: 15 }}
          className="relative w-full max-w-md rounded-3xl bg-[#111227] border border-white/10 shadow-2xl p-6 text-white overflow-hidden z-10"
        >
          {/* Ambient Glow */}
          <div className="absolute -top-24 -right-24 w-60 h-60 bg-indigo-500/20 rounded-full blur-3xl pointer-events-none" />

          {/* Header */}
          <div className="flex items-center justify-between pb-4 border-b border-white/10">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
                <ListPlus size={20} />
              </div>
              <div>
                <h3 className="text-base sm:text-lg font-black font-outfit">Add to Mixtape</h3>
                <p className="text-xs text-gray-400 truncate max-w-[220px]">
                  Saving: <span className="text-white font-semibold">{gameTitle}</span>
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-1.5 rounded-full hover:bg-white/10 text-gray-400 hover:text-white transition-colors"
            >
              <X size={18} />
            </button>
          </div>

          {/* Toast feedback */}
          {toastMessage && (
            <div className="mt-3 p-2.5 rounded-xl bg-indigo-600/30 border border-indigo-400/40 text-indigo-200 text-xs font-bold text-center animate-fade-in flex items-center justify-center gap-2">
              <Sparkles size={14} className="text-indigo-400" />
              <span>{toastMessage}</span>
            </div>
          )}

          {/* Mixtape List */}
          <div className="my-4 max-h-60 overflow-y-auto pr-1 space-y-2">
            {mixtapes.length === 0 ? (
              <div className="text-center py-6 px-4 rounded-2xl bg-white/5 border border-white/5">
                <Music size={28} className="mx-auto text-gray-500 mb-2" />
                <p className="text-xs font-bold text-gray-300">No Custom Mixtapes Yet</p>
                <p className="text-[11px] text-gray-500 mt-1">
                  Create your first mixtape below to start curating continuous gaming queues!
                </p>
              </div>
            ) : (
              mixtapes.map((mix) => {
                const isIncluded = mix.gameSlugs.includes(gameSlug);
                return (
                  <button
                    key={mix.id}
                    onClick={() => handleToggleGame(mix)}
                    className={`w-full flex items-center justify-between p-3 rounded-2xl border transition-all text-left ${
                      isIncluded
                        ? 'bg-indigo-600/20 border-indigo-500/40 text-white'
                        : 'bg-white/5 border-white/5 hover:bg-white/10 text-gray-300 hover:text-white'
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <span className="text-xl shrink-0">{mix.emoji}</span>
                      <div className="min-w-0">
                        <p className="text-xs font-bold truncate">{mix.title}</p>
                        <p className="text-[10px] text-gray-400 flex items-center gap-1">
                          <Layers size={10} />
                          <span>{mix.gameSlugs.length} games</span>
                        </p>
                      </div>
                    </div>

                    <div
                      className={`w-6 h-6 rounded-lg flex items-center justify-center border transition-all ${
                        isIncluded
                          ? 'bg-indigo-500 border-indigo-400 text-white'
                          : 'border-white/20 text-transparent hover:border-white/40'
                      }`}
                    >
                      <Check size={14} className={isIncluded ? 'opacity-100' : 'opacity-0'} />
                    </div>
                  </button>
                );
              })
            )}
          </div>

          {/* Create New Mixtape Form */}
          {isCreating ? (
            <form onSubmit={handleCreateNew} className="p-3.5 rounded-2xl bg-white/5 border border-white/10 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-indigo-400">New Arcade Mixtape</span>
                <button
                  type="button"
                  onClick={() => setIsCreating(false)}
                  className="text-[11px] text-gray-400 hover:text-white"
                >
                  Cancel
                </button>
              </div>

              {/* Emoji Selector */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-base">
                {emojis.map((e) => (
                  <button
                    key={e}
                    type="button"
                    onClick={() => setSelectedEmoji(e)}
                    className={`p-1.5 rounded-xl transition-all ${
                      selectedEmoji === e ? 'bg-indigo-500/40 scale-110 border border-indigo-400' : 'opacity-60 hover:opacity-100'
                    }`}
                  >
                    {e}
                  </button>
                ))}
              </div>

              <input
                type="text"
                placeholder="Mixtape Name (e.g. Speedrun Favorites)"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                maxLength={40}
                autoFocus
                className="w-full px-3 py-2 rounded-xl bg-black/40 border border-white/10 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500"
              />

              <button
                type="submit"
                disabled={!newTitle.trim()}
                className="w-full py-2.5 rounded-xl bg-indigo-500 hover:bg-indigo-600 disabled:opacity-50 text-white font-bold text-xs transition-colors flex items-center justify-center gap-1.5 shadow-lg"
              >
                <Plus size={14} />
                <span>Save Mixtape with Game</span>
              </button>
            </form>
          ) : (
            <button
              onClick={() => setIsCreating(true)}
              className="w-full py-3 rounded-2xl border border-dashed border-white/20 hover:border-indigo-500/50 hover:bg-indigo-500/10 text-gray-300 hover:text-white font-bold text-xs transition-all flex items-center justify-center gap-2"
            >
              <Plus size={15} />
              <span>Create New Mixtape</span>
            </button>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
