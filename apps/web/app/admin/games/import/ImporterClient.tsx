'use client';

import React, { useState, useTransition } from 'react';
import { 
  Download, 
  Sparkles, 
  Play, 
  CheckCircle2, 
  AlertCircle, 
  RefreshCw, 
  SlidersHorizontal, 
  ExternalLink, 
  X, 
  CheckSquare, 
  Square,
  Layers,
  Search,
  Globe
} from 'lucide-react';
import Image from 'next/image';
import { FeedProvider, RawGameFeedItem } from '@/lib/game-feeds';
import { fetchFeedPreview, importSingleChunk, finishImportJob } from './actions';

type PreviewItem = RawGameFeedItem & { slug: string; isImported: boolean };

const CATEGORIES = ['All', 'Action', 'Arcade', 'Puzzle', 'Racing', 'Sports', 'Strategy', 'Adventure', 'Board'];
const LIMIT_OPTIONS = [25, 50, 100, 200, 500, 1000, 2000];

export default function ImporterClient() {
  const [provider, setProvider] = useState<FeedProvider>('gamemonetize');
  const [category, setCategory] = useState<string>('All');
  const [limit, setLimit] = useState<number>(50);
  const [customUrl, setCustomUrl] = useState<string>('');
  
  const [games, setGames] = useState<PreviewItem[]>([]);
  const [selectedSlugs, setSelectedSlugs] = useState<Set<string>>(new Set());
  const [searchTerm, setSearchTerm] = useState('');
  
  const [isFetching, startFetching] = useTransition();
  const [isImporting, setIsImporting] = useState(false);
  const [importProgress, setImportProgress] = useState(0);
  const [progressStatus, setProgressStatus] = useState('');
  const [importResult, setImportResult] = useState<{ success: boolean; message: string } | null>(null);
  
  // Test modal state
  const [previewGame, setPreviewGame] = useState<PreviewItem | null>(null);

  // Fetch games from feed
  const handleFetch = () => {
    setImportResult(null);
    startFetching(async () => {
      const res = await fetchFeedPreview(provider, {
        category,
        limit,
        customUrl: provider === 'custom' ? customUrl : undefined
      });

      if (res.success && res.data) {
        setGames(res.data.games);
        // Pre-select all new games by default
        const newSlugs = new Set(res.data.games.filter(g => !g.isImported).map(g => g.slug));
        setSelectedSlugs(newSlugs);
      } else {
        setImportResult({ success: false, message: res.error || 'Failed to fetch feed.' });
      }
    });
  };

  // Toggle single selection
  const toggleSelect = (slug: string) => {
    const next = new Set(selectedSlugs);
    if (next.has(slug)) {
      next.delete(slug);
    } else {
      next.add(slug);
    }
    setSelectedSlugs(next);
  };

  // Select all new
  const handleSelectNew = () => {
    const newSlugs = new Set(games.filter(g => !g.isImported).map(g => g.slug));
    setSelectedSlugs(newSlugs);
  };

  // Select all
  const handleSelectAll = () => {
    setSelectedSlugs(new Set(games.map(g => g.slug)));
  };

  // Deselect all
  const handleDeselectAll = () => {
    setSelectedSlugs(new Set());
  };

  // Execute progressive batch import (chunks of 100 to prevent Cloudflare timeout)
  const handleBatchImport = async () => {
    const toImport = games.filter(g => selectedSlugs.has(g.slug));
    if (toImport.length === 0) return;

    setIsImporting(true);
    setImportProgress(0);
    setProgressStatus(`Preparing ${toImport.length} games for import...`);
    setImportResult(null);

    const chunkSize = 100;
    const totalChunks = Math.ceil(toImport.length / chunkSize);
    let totalImported = 0;
    let failedChunks = 0;

    try {
      for (let i = 0; i < totalChunks; i++) {
        const chunk = toImport.slice(i * chunkSize, (i + 1) * chunkSize);
        setProgressStatus(`Importing chunk ${i + 1} of ${totalChunks} (${totalImported} / ${toImport.length} games saved)...`);
        
        const res = await importSingleChunk(chunk);
        if (res.success) {
          totalImported += res.importedCount;
        } else {
          failedChunks++;
          console.warn(`Chunk ${i + 1} error:`, res.error);
        }

        setImportProgress(Math.round(((i + 1) / totalChunks) * 100));
      }

      await finishImportJob();

      if (totalImported > 0) {
        setImportResult({
          success: true,
          message: `Successfully imported ${totalImported} games into Supabase database! Cache refreshed.`
        });
        // Mark imported games in current state
        setGames(prev => prev.map(g => selectedSlugs.has(g.slug) ? { ...g, isImported: true } : g));
        setSelectedSlugs(new Set());
      } else {
        setImportResult({
          success: false,
          message: 'Failed to import games. Please verify your Supabase database connection.'
        });
      }
    } catch (err: any) {
      console.error('Batch import exception:', err);
      setImportResult({ success: false, message: err?.message || 'Error occurred during import.' });
    } finally {
      setIsImporting(false);
      setProgressStatus('');
    }
  };

  const filteredGames = games.filter(g => 
    g.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
    g.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const newCount = games.filter(g => !g.isImported).length;
  const importedCount = games.filter(g => g.isImported).length;

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-16">
      
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-[#111228] via-[#1D1B4B] to-[#111228] border border-[#6366F1]/30 rounded-3xl p-8 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-purple-600/10 rounded-full blur-[100px] pointer-events-none" />
        
        <div className="relative z-10 max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-400 text-xs font-bold uppercase tracking-wider mb-4">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Automated Feed Ingestion & High-SEO Engine</span>
          </div>
          
          <h1 className="text-3xl md:text-4xl font-extrabold text-white font-outfit mb-3">
            Import Thousands of Games Instantly
          </h1>
          <p className="text-gray-300 text-sm md:text-base leading-relaxed">
            Connect to official global HTML5 Game Distribution feeds. Automatically generates rich keyword descriptions, device control guides, 4-question FAQ schemas, and responsive canonical game pages.
          </p>
        </div>
      </div>

      {/* Control Configuration Bar */}
      <div className="bg-white dark:bg-[#111228] border border-gray-200 dark:border-white/10 rounded-2xl p-6 shadow-xl space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          
          {/* Feed Provider */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-2">
              Feed Network
            </label>
            <select
              value={provider}
              onChange={(e) => setProvider(e.target.value as FeedProvider)}
              className="w-full bg-gray-50 dark:bg-[#0A0B1A] border border-gray-300 dark:border-white/10 rounded-xl px-4 py-2.5 text-sm text-gray-900 dark:text-white font-medium focus:outline-none focus:border-[#6366F1]"
            >
              <option value="gamemonetize">GameMonetize (20,000+ Games)</option>
              <option value="gamedistribution">GameDistribution / Azerion</option>
              <option value="custom">Custom JSON Feed URL</option>
            </select>
          </div>

          {/* Category Filter */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-2">
              Genre / Category
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full bg-gray-50 dark:bg-[#0A0B1A] border border-gray-300 dark:border-white/10 rounded-xl px-4 py-2.5 text-sm text-gray-900 dark:text-white font-medium focus:outline-none focus:border-[#6366F1]"
            >
              {CATEGORIES.map(c => (
                <option key={c} value={c}>{c === 'All' ? 'All Genres' : c}</option>
              ))}
            </select>
          </div>

          {/* Batch Limit */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-2">
              Batch Quantity
            </label>
            <select
              value={limit}
              onChange={(e) => setLimit(parseInt(e.target.value, 10))}
              className="w-full bg-gray-50 dark:bg-[#0A0B1A] border border-gray-300 dark:border-white/10 rounded-xl px-4 py-2.5 text-sm text-gray-900 dark:text-white font-medium focus:outline-none focus:border-[#6366F1]"
            >
              {LIMIT_OPTIONS.map(l => (
                <option key={l} value={l}>{l} Games per fetch</option>
              ))}
            </select>
          </div>

          {/* Fetch CTA */}
          <div className="flex items-end">
            <button
              onClick={handleFetch}
              disabled={isFetching}
              className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-[#6366F1] to-[#8B5CF6] text-white font-bold text-sm px-6 py-2.5 rounded-xl shadow-lg shadow-[#6366F1]/30 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${isFetching ? 'animate-spin' : ''}`} />
              <span>{isFetching ? 'Fetching Feed...' : 'Fetch Games'}</span>
            </button>
          </div>

        </div>

        {/* Custom URL Input if Custom selected */}
        {provider === 'custom' && (
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-2">
              Custom JSON Endpoint URL
            </label>
            <input
              type="url"
              placeholder="https://example.com/games-feed.json"
              value={customUrl}
              onChange={(e) => setCustomUrl(e.target.value)}
              className="w-full bg-gray-50 dark:bg-[#0A0B1A] border border-gray-300 dark:border-white/10 rounded-xl px-4 py-2.5 text-sm text-gray-900 dark:text-white focus:outline-none focus:border-[#6366F1]"
            />
          </div>
        )}
      </div>

      {/* Import Notification Banner */}
      {importResult && (
        <div className={`p-4 rounded-2xl border flex items-center gap-3 ${
          importResult.success 
            ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' 
            : 'bg-red-500/10 border-red-500/30 text-red-400'
        }`}>
          {importResult.success ? <CheckCircle2 className="w-5 h-5 shrink-0" /> : <AlertCircle className="w-5 h-5 shrink-0" />}
          <span className="text-sm font-medium">{importResult.message}</span>
        </div>
      )}

      {/* Progress Bar during Import */}
      {isImporting && (
        <div className="bg-white dark:bg-[#111228] border border-gray-200 dark:border-white/10 rounded-2xl p-6 shadow-xl space-y-3">
          <div className="flex items-center justify-between text-sm">
            <span className="font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-[#6366F1] animate-spin" />
              {progressStatus || 'Ingesting & Enriching SEO Metadata...'}
            </span>
            <span className="font-mono text-[#6366F1] font-bold">{importProgress}%</span>
          </div>
          <div className="w-full h-3 bg-gray-100 dark:bg-white/5 rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-[#6366F1] to-[#8B5CF6] transition-all duration-500 rounded-full" 
              style={{ width: `${importProgress}%` }}
            />
          </div>
        </div>
      )}

      {/* Results & Actions Bar */}
      {games.length > 0 && (
        <div className="space-y-6">
          
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white dark:bg-[#111228] border border-gray-200 dark:border-white/10 p-5 rounded-2xl shadow-lg">
            
            {/* Stats */}
            <div className="flex flex-wrap items-center gap-4 text-xs md:text-sm">
              <div className="flex items-center gap-2">
                <span className="font-bold text-gray-900 dark:text-white">{games.length}</span>
                <span className="text-gray-500">Fetched</span>
              </div>
              <span className="text-gray-400">•</span>
              <div className="flex items-center gap-2">
                <span className="font-bold text-purple-600 dark:text-purple-400">{newCount}</span>
                <span className="text-gray-500">New Games</span>
              </div>
              <span className="text-gray-400">•</span>
              <div className="flex items-center gap-2">
                <span className="font-bold text-emerald-600 dark:text-emerald-400">{importedCount}</span>
                <span className="text-gray-500">Already in DB</span>
              </div>
              <span className="text-gray-400">•</span>
              <div className="flex items-center gap-2 font-bold text-[#6366F1]">
                <span>{selectedSlugs.size}</span>
                <span>Selected</span>
              </div>
            </div>

            {/* Selection Quick Buttons */}
            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={handleSelectNew}
                className="px-3 py-1.5 rounded-lg text-xs font-bold bg-purple-500/10 text-purple-600 dark:text-purple-400 hover:bg-purple-500/20 transition-colors"
              >
                Select New ({newCount})
              </button>
              <button
                onClick={handleSelectAll}
                className="px-3 py-1.5 rounded-lg text-xs font-bold bg-gray-100 dark:bg-white/5 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-white/10 transition-colors"
              >
                Select All
              </button>
              <button
                onClick={handleDeselectAll}
                className="px-3 py-1.5 rounded-lg text-xs font-bold bg-gray-100 dark:bg-white/5 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-white/10 transition-colors"
              >
                Deselect
              </button>
            </div>

            {/* Primary Action Button */}
            <button
              onClick={handleBatchImport}
              disabled={isImporting || selectedSlugs.size === 0}
              className="flex items-center justify-center gap-2 bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-bold text-sm px-6 py-2.5 rounded-xl shadow-lg shadow-emerald-500/30 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50"
            >
              <Download className="w-4 h-4" />
              <span>Import {selectedSlugs.size} Games to Supabase</span>
            </button>

          </div>

          {/* Search Filter for Preview Grid */}
          <div className="relative">
            <Search className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Filter preview list by title or category..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-white dark:bg-[#111228] border border-gray-200 dark:border-white/10 rounded-xl pl-11 pr-4 py-3 text-sm text-gray-900 dark:text-white focus:outline-none focus:border-[#6366F1]"
            />
          </div>

          {/* Games Preview Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {filteredGames.map((game) => {
              const isSelected = selectedSlugs.has(game.slug);

              return (
                <div
                  key={game.slug}
                  onClick={() => toggleSelect(game.slug)}
                  className={`group relative bg-white dark:bg-[#111228] border rounded-2xl p-3 cursor-pointer transition-all duration-300 flex flex-col ${
                    isSelected 
                      ? 'border-[#6366F1] shadow-[0_0_20px_rgba(99,102,241,0.25)] ring-2 ring-[#6366F1]/30' 
                      : 'border-gray-200 dark:border-white/10 hover:border-gray-300 dark:hover:border-white/20'
                  }`}
                >
                  
                  {/* Thumbnail & Badges */}
                  <div className="relative aspect-video w-full rounded-xl overflow-hidden mb-3 bg-gray-100 dark:bg-[#0A0B1A]">
                    {game.thumb ? (
                      <img 
                        src={game.thumb} 
                        alt={game.title} 
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs font-bold">
                        No Preview
                      </div>
                    )}

                    {/* Selection Checkbox Pill */}
                    <div className="absolute top-2 left-2 z-10">
                      <div className={`p-1 rounded-lg backdrop-blur-md transition-colors ${
                        isSelected 
                          ? 'bg-[#6366F1] text-white shadow-md' 
                          : 'bg-black/60 text-white/70 hover:text-white'
                      }`}>
                        {isSelected ? <CheckSquare className="w-4 h-4" /> : <Square className="w-4 h-4" />}
                      </div>
                    </div>

                    {/* Status Badge */}
                    <div className="absolute top-2 right-2 z-10">
                      {game.isImported ? (
                        <span className="px-2 py-0.5 rounded-md bg-emerald-500/90 text-white text-[10px] font-bold shadow">
                          In Database
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded-md bg-purple-500/90 text-white text-[10px] font-bold shadow">
                          New
                        </span>
                      )}
                    </div>

                    {/* Test Play Button */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setPreviewGame(game);
                      }}
                      className="absolute bottom-2 right-2 z-10 p-2 rounded-full bg-white/90 dark:bg-[#0A0B1A]/90 hover:bg-[#6366F1] hover:text-white text-gray-900 dark:text-white transition-all shadow-md"
                      title="Test Play Iframe"
                    >
                      <Play className="w-3.5 h-3.5 fill-current ml-0.5" />
                    </button>
                  </div>

                  {/* Metadata */}
                  <div className="flex flex-col flex-1">
                    <h3 className="font-bold text-sm text-gray-900 dark:text-white line-clamp-1 mb-1">
                      {game.title}
                    </h3>
                    <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400 mt-auto pt-2 border-t border-gray-100 dark:border-white/5">
                      <span className="px-2 py-0.5 rounded bg-gray-100 dark:bg-white/5 font-medium">
                        {game.category}
                      </span>
                      <span className="font-mono text-[11px] text-gray-400">
                        {game.slug.slice(0, 18)}...
                      </span>
                    </div>
                  </div>

                </div>
              );
            })}
          </div>

        </div>
      )}

      {/* Test Play Iframe Modal */}
      {previewGame && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-[#111228] border border-white/10 rounded-3xl w-full max-w-4xl overflow-hidden shadow-2xl flex flex-col">
            <div className="flex items-center justify-between px-6 py-4 border-b border-white/10">
              <div className="flex items-center gap-3">
                <span className="text-white font-bold text-lg font-outfit">{previewGame.title}</span>
                <span className="px-2.5 py-0.5 rounded-md bg-purple-500/20 text-purple-400 text-xs font-bold">
                  {previewGame.category}
                </span>
              </div>
              <button 
                onClick={() => setPreviewGame(null)}
                className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="relative aspect-video w-full bg-black">
              <iframe
                src={previewGame.url}
                className="w-full h-full border-0"
                sandbox="allow-scripts allow-same-origin allow-pointer-lock allow-forms"
                allow="fullscreen; autoplay; gamepad"
                title={previewGame.title}
              />
            </div>

            <div className="p-5 flex items-center justify-between bg-[#0A0B1A]">
              <div className="text-xs text-gray-400 max-w-md line-clamp-1">
                {previewGame.description || 'No description provided.'}
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => {
                    toggleSelect(previewGame.slug);
                    setPreviewGame(null);
                  }}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                    selectedSlugs.has(previewGame.slug)
                      ? 'bg-red-500/20 text-red-400 hover:bg-red-500/30'
                      : 'bg-[#6366F1] text-white hover:bg-[#4F46E5]'
                  }`}
                >
                  {selectedSlugs.has(previewGame.slug) ? 'Deselect Game' : 'Select for Import'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
