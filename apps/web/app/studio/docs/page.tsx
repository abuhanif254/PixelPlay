import React from 'react';
import { Terminal, Code, CheckCircle, Lightbulb } from 'lucide-react';

export default function StudioDocsPage() {
  return (
    <div className="bg-white dark:bg-[#111228] rounded-2xl border border-gray-200 dark:border-white/5 shadow-xl overflow-hidden">
      
      <div className="p-6 border-b border-gray-100 dark:border-white/5 bg-gray-50/50 dark:bg-black/20">
        <h2 className="text-xl font-bold font-outfit text-gray-900 dark:text-white flex items-center gap-2">
          <Terminal size={20} className="text-[#6366F1]" />
          PixelPlay Plugin SDK
        </h2>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Learn how to integrate your HTML5 game with the PixelPlay platform.</p>
      </div>

      <div className="p-6 flex flex-col gap-8">
        
        {/* Intro */}
        <section>
          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-3">Overview</h3>
          <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed mb-4">
            The PixelPlay SDK is a lightweight JavaScript library that allows your iFrame-hosted game to securely communicate with the parent platform using the <code>window.postMessage</code> protocol. This allows your game to submit high scores and unlock achievements without needing direct database access.
          </p>
          <div className="flex items-start gap-3 p-4 bg-yellow-50 dark:bg-yellow-500/10 border border-yellow-200 dark:border-yellow-500/20 rounded-xl">
            <Lightbulb className="text-yellow-600 dark:text-yellow-500 shrink-0 mt-0.5" size={18} />
            <p className="text-sm text-yellow-800 dark:text-yellow-400 font-medium">
              Your game must be hosted on an HTTPS server and allow embedding via the <code>X-Frame-Options</code> header.
            </p>
          </div>
        </section>

        {/* Setup */}
        <section>
          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-3">1. Installation</h3>
          <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed mb-3">
            Include the SDK script tag in the <code>&lt;head&gt;</code> of your game's HTML file. The script is hosted globally on our CDN.
          </p>
          <div className="bg-gray-900 rounded-xl p-4 overflow-x-auto border border-gray-800">
            <pre className="text-sm font-mono text-green-400">
              <code>&lt;script src="https://pixelplay.com/pixelplay-sdk.js"&gt;&lt;/script&gt;</code>
            </pre>
          </div>
        </section>

        {/* Usage */}
        <section>
          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-3">2. Initializing the Game</h3>
          <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed mb-3">
            Once your game's assets are loaded and it's ready to be played, tell the platform to remove the loading screen.
          </p>
          <div className="bg-gray-900 rounded-xl p-4 overflow-x-auto border border-gray-800 mb-4">
            <pre className="text-sm font-mono text-blue-300">
              <code>{`if (window.PixelPlay) {
  PixelPlay.gameReady();
}`}</code>
            </pre>
          </div>
        </section>

        {/* Submitting Scores */}
        <section>
          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-3">3. Submitting Scores</h3>
          <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed mb-3">
            When the player finishes a run or dies, submit their final integer score to the platform. We handle saving it to the database and updating the global leaderboards.
          </p>
          <div className="bg-gray-900 rounded-xl p-4 overflow-x-auto border border-gray-800">
            <pre className="text-sm font-mono text-blue-300">
              <code>{`function onPlayerDeath(finalScore) {
  if (window.PixelPlay) {
    // Only accepts integers
    PixelPlay.submitScore(Math.floor(finalScore));
    PixelPlay.gameOver();
  }
}`}</code>
            </pre>
          </div>
        </section>

        {/* Features list */}
        <section>
          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Available Methods</h3>
          <div className="flex flex-col gap-3">
            <div className="flex gap-4 p-4 border border-gray-200 dark:border-white/5 rounded-xl bg-gray-50 dark:bg-black/20">
              <Code className="text-[#6366F1] shrink-0" size={20} />
              <div>
                <p className="font-bold text-gray-900 dark:text-white font-mono text-sm">PixelPlay.gameReady()</p>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Tells the platform the iFrame has finished loading its internal assets.</p>
              </div>
            </div>
            <div className="flex gap-4 p-4 border border-gray-200 dark:border-white/5 rounded-xl bg-gray-50 dark:bg-black/20">
              <Code className="text-[#6366F1] shrink-0" size={20} />
              <div>
                <p className="font-bold text-gray-900 dark:text-white font-mono text-sm">PixelPlay.submitScore(score: number)</p>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Posts a score integer to the user's profile and global leaderboards.</p>
              </div>
            </div>
            <div className="flex gap-4 p-4 border border-gray-200 dark:border-white/5 rounded-xl bg-gray-50 dark:bg-black/20">
              <Code className="text-[#6366F1] shrink-0" size={20} />
              <div>
                <p className="font-bold text-gray-900 dark:text-white font-mono text-sm">PixelPlay.gameOver()</p>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Signals the end of a session, potentially triggering a platform-level overlay or ad.</p>
              </div>
            </div>
            <div className="flex gap-4 p-4 border border-gray-200 dark:border-white/5 rounded-xl bg-gray-50 dark:bg-black/20">
              <Code className="text-[#6366F1] shrink-0" size={20} />
              <div>
                <p className="font-bold text-gray-900 dark:text-white font-mono text-sm">PixelPlay.unlockAchievement(key: string)</p>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Future feature: unlocks a specific platform achievement for the user.</p>
              </div>
            </div>
          </div>
        </section>

      </div>
    </div>
  );
}
