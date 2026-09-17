import React from 'react';
import { Terminal, Code, Lightbulb } from 'lucide-react';
import StudioSdkTester from '@/components/developer/StudioSdkTester';
import { Metadata } from 'next';

export const metadata: Metadata = { 
  title: 'Studio Docs & SDK Sandbox - Spielcade', 
  robots: { index: false, follow: false } 
};

export default function StudioDocsPage() {
  return (
    <div className="flex flex-col gap-8">
      {/* Interactive Simulator and Inspector */}
      <StudioSdkTester />

      {/* Comprehensive SDK Reference Card */}
      <div className="bg-white dark:bg-[#111228] rounded-2xl border border-gray-200 dark:border-white/5 shadow-xl overflow-hidden">
        
        <div className="p-6 border-b border-gray-100 dark:border-white/5 bg-gray-50/50 dark:bg-black/20">
          <h2 className="text-xl font-bold font-outfit text-gray-900 dark:text-white flex items-center gap-2">
            <Terminal size={20} className="text-[#6366F1]" />
            Spielcade Plugin SDK Specification
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Complete protocol specification and API reference for iFrame-embedded HTML5 and WebGL games.
          </p>
        </div>

        <div className="p-6 flex flex-col gap-8">
          
          {/* Intro */}
          <section>
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-3">Overview</h3>
            <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed mb-4">
              The Spielcade SDK is a lightweight JavaScript library that allows your iFrame-hosted game to securely communicate with the parent platform using the <code>window.postMessage</code> protocol. This allows your game to submit high scores and unlock achievements without needing direct database access.
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
                <code>&lt;script src="https://spielcade.com/spielcade-sdk.js"&gt;&lt;/script&gt;</code>
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
                <code>{`if (window.Spielcade) {
  Spielcade.gameReady();
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
  if (window.Spielcade) {
    // Only accepts integers
    Spielcade.submitScore(Math.floor(finalScore));
    Spielcade.gameOver();
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
                  <p className="font-bold text-gray-900 dark:text-white font-mono text-sm">Spielcade.gameReady()</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Tells the platform the iFrame has finished loading its internal assets.</p>
                </div>
              </div>
              <div className="flex gap-4 p-4 border border-gray-200 dark:border-white/5 rounded-xl bg-gray-50 dark:bg-black/20">
                <Code className="text-[#6366F1] shrink-0" size={20} />
                <div>
                  <p className="font-bold text-gray-900 dark:text-white font-mono text-sm">Spielcade.submitScore(score: number)</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Posts a score integer to the user's profile and global leaderboards.</p>
                </div>
              </div>
              <div className="flex gap-4 p-4 border border-gray-200 dark:border-white/5 rounded-xl bg-gray-50 dark:bg-black/20">
                <Code className="text-[#6366F1] shrink-0" size={20} />
                <div>
                  <p className="font-bold text-gray-900 dark:text-white font-mono text-sm">Spielcade.gameOver()</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Signals the end of a session, potentially triggering a platform-level overlay or ad.</p>
                </div>
              </div>
              <div className="flex gap-4 p-4 border border-gray-200 dark:border-white/5 rounded-xl bg-gray-50 dark:bg-black/20">
                <Code className="text-[#6366F1] shrink-0" size={20} />
                <div>
                  <p className="font-bold text-gray-900 dark:text-white font-mono text-sm">Spielcade.unlockAchievement(key: string)</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Unlocks a specific platform achievement for the active player.</p>
                </div>
              </div>
            </div>
          </section>

        </div>
      </div>

      {/* Developer REST API v1 Reference Card */}
      <div className="bg-white dark:bg-[#111228] rounded-2xl border border-gray-200 dark:border-white/5 shadow-xl overflow-hidden">
        <div className="p-6 border-b border-gray-100 dark:border-white/5 bg-gray-50/50 dark:bg-black/20 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold font-outfit text-gray-900 dark:text-white flex items-center gap-2">
              <Terminal size={20} className="text-emerald-500" />
              Developer REST API v1 (Server-to-Server)
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Direct REST endpoints for Unity, Godot, Unreal, Construct 3, and dedicated game servers.
            </p>
          </div>
          <a
            href="/studio/keys"
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-colors shrink-0 flex items-center gap-1.5"
          >
            Manage Master Key &rarr;
          </a>
        </div>

        <div className="p-6 flex flex-col gap-8">
          {/* Authentication */}
          <section>
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">Authentication</h3>
            <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed mb-4">
              All REST API endpoints require your Master API Key passed as a Bearer token or custom header:
            </p>
            <div className="bg-gray-900 rounded-xl p-4 overflow-x-auto border border-gray-800 font-mono text-sm text-emerald-400">
              <code>Authorization: Bearer sp_live_YOUR_64_CHAR_KEY</code>
              <div className="text-gray-400 mt-1">or</div>
              <code>x-api-key: sp_live_YOUR_64_CHAR_KEY</code>
            </div>
          </section>

          {/* Endpoints */}
          <section className="flex flex-col gap-6">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white">API Endpoints</h3>

            {/* 1. GET /api/v1/developer/me */}
            <div className="border border-gray-200 dark:border-white/5 rounded-xl p-5 bg-gray-50/50 dark:bg-black/20">
              <div className="flex items-center gap-2 mb-2">
                <span className="px-2 py-0.5 rounded text-xs font-bold uppercase bg-blue-100 dark:bg-blue-500/20 text-blue-700 dark:text-blue-300 font-mono">
                  GET
                </span>
                <code className="text-sm font-mono font-bold text-gray-900 dark:text-white">
                  /api/v1/developer/me
                </code>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-300 mb-3">
                Returns developer profile, payout status, published game catalog summary, and key metadata.
              </p>
              <div className="bg-gray-900 rounded-lg p-3 text-xs font-mono text-gray-300 overflow-x-auto">
                <span className="text-gray-500">curl -H &quot;Authorization: Bearer sp_live_...&quot; \</span><br />
                <span>  https://spielcade.com/api/v1/developer/me</span>
              </div>
            </div>

            {/* 2. GET /api/v1/developer/games */}
            <div className="border border-gray-200 dark:border-white/5 rounded-xl p-5 bg-gray-50/50 dark:bg-black/20">
              <div className="flex items-center gap-2 mb-2">
                <span className="px-2 py-0.5 rounded text-xs font-bold uppercase bg-blue-100 dark:bg-blue-500/20 text-blue-700 dark:text-blue-300 font-mono">
                  GET
                </span>
                <code className="text-sm font-mono font-bold text-gray-900 dark:text-white">
                  /api/v1/developer/games
                </code>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-300 mb-3">
                Retrieves all games owned by your account with live play counts, estimated ad impressions, and lifetime 70% rev-share cut.
              </p>
              <div className="bg-gray-900 rounded-lg p-3 text-xs font-mono text-gray-300 overflow-x-auto">
                <span className="text-gray-500">curl -H &quot;Authorization: Bearer sp_live_...&quot; \</span><br />
                <span>  https://spielcade.com/api/v1/developer/games</span>
              </div>
            </div>

            {/* 3. POST /api/v1/developer/games/:slug/scores */}
            <div className="border border-gray-200 dark:border-white/5 rounded-xl p-5 bg-gray-50/50 dark:bg-black/20">
              <div className="flex items-center gap-2 mb-2">
                <span className="px-2 py-0.5 rounded text-xs font-bold uppercase bg-emerald-100 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 font-mono">
                  POST
                </span>
                <code className="text-sm font-mono font-bold text-gray-900 dark:text-white">
                  /api/v1/developer/games/:slug/scores
                </code>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-300 mb-3">
                Server-authoritative score submission. Perfect for backend game servers, Unity builds, or protected game loops.
              </p>
              <div className="bg-gray-900 rounded-lg p-3 text-xs font-mono text-gray-300 overflow-x-auto mb-3">
                <span className="text-gray-500">curl -X POST https://spielcade.com/api/v1/developer/games/neon-blaster/scores \</span><br />
                <span className="text-gray-500">  -H &quot;Authorization: Bearer sp_live_...&quot; \</span><br />
                <span className="text-gray-500">  -H &quot;Content-Type: application/json&quot; \</span><br />
                <span>  -d &apos;{JSON.stringify({ score: 14500, username: "SpeedyPlayer", metadata: { stage: 4, combo: 18 } })}&apos;</span>
              </div>
              <div className="text-xs text-gray-500">
                <strong>Payload:</strong> <code>score</code> (integer, 0 to 10,000,000), optional <code>username</code> or <code>user_id</code>, optional <code>metadata</code> object.
              </div>
            </div>

            {/* 4. GET /api/v1/developer/revenue */}
            <div className="border border-gray-200 dark:border-white/5 rounded-xl p-5 bg-gray-50/50 dark:bg-black/20">
              <div className="flex items-center gap-2 mb-2">
                <span className="px-2 py-0.5 rounded text-xs font-bold uppercase bg-blue-100 dark:bg-blue-500/20 text-blue-700 dark:text-blue-300 font-mono">
                  GET
                </span>
                <code className="text-sm font-mono font-bold text-gray-900 dark:text-white">
                  /api/v1/developer/revenue?days=30
                </code>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-300 mb-3">
                Fetches your financial ledger including settled daily records, real-time pending accruals, and impressions breakdown.
              </p>
              <div className="bg-gray-900 rounded-lg p-3 text-xs font-mono text-gray-300 overflow-x-auto">
                <span className="text-gray-500">curl -H &quot;Authorization: Bearer sp_live_...&quot; \</span><br />
                <span>  https://spielcade.com/api/v1/developer/revenue?days=30</span>
              </div>
            </div>
          </section>

          {/* Unity C# Integration Example */}
          <section>
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">Unity C# Integration Example</h3>
            <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed mb-3">
              Submit scores directly from Unity games using <code>UnityWebRequest</code>:
            </p>
            <div className="bg-gray-900 rounded-xl p-4 overflow-x-auto border border-gray-800">
              <pre className="text-xs font-mono text-blue-300 leading-relaxed">
                <code>{`using System.Collections;
using System.Text;
using UnityEngine;
using UnityEngine.Networking;

public class SpielcadeServerApi : MonoBehaviour {
    private const string ApiKey = "sp_live_YOUR_KEY_HERE";
    private const string GameSlug = "your-game-slug";

    public IEnumerator SubmitScore(int score, string playerName) {
        string url = $"https://spielcade.com/api/v1/developer/games/{GameSlug}/scores";
        string json = $"{{\\"score\\": {score}, \\"username\\": \\"{playerName}\\"}}";

        using (UnityWebRequest req = new UnityWebRequest(url, "POST")) {
            byte[] bodyRaw = Encoding.UTF8.GetBytes(json);
            req.uploadHandler = new UploadHandlerRaw(bodyRaw);
            req.downloadHandler = new DownloadHandlerBuffer();
            req.SetRequestHeader("Content-Type", "application/json");
            req.SetRequestHeader("Authorization", "Bearer " + ApiKey);

            yield return req.SendWebRequest();

            if (req.result == UnityWebRequest.Result.Success) {
                Debug.Log("Score submitted to Spielcade: " + req.downloadHandler.text);
            } else {
                Debug.LogError("Error submitting score: " + req.error);
            }
        }
    }
}`}</code>
              </pre>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}

