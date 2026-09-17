'use client';

import React, { useState, useEffect, useRef } from 'react';
import { 
  Play, 
  RefreshCw, 
  Terminal, 
  CheckCircle2, 
  AlertCircle, 
  Award, 
  Trophy, 
  Copy, 
  Check, 
  Sparkles,
  Smartphone,
  Monitor,
  Code2
} from 'lucide-react';
import { GAME_IFRAME_SANDBOX, GAME_IFRAME_PERMISSIONS } from '@/lib/constants';

interface SdkEventLog {
  id: string;
  time: string;
  type: string;
  payload: any;
  direction: 'in' | 'out';
}

const ENGINE_SNIPPETS: Record<string, { title: string; lang: string; code: string; notes: string }> = {
  javascript: {
    title: 'HTML5 / JavaScript',
    lang: 'html',
    code: `<!-- 1. Include the SDK in <head> -->
<script src="https://spielcade.com/spielcade-sdk.js"></script>

<script>
// 2. When assets are loaded
window.addEventListener('load', () => {
  if (window.Spielcade) {
    Spielcade.gameReady();
  }
});

// 3. Submit high score on death or stage clear
function onGameOver(score) {
  if (window.Spielcade) {
    Spielcade.submitScore(Math.floor(score));
    Spielcade.gameOver();
  }
}

// 4. Unlock platform achievement
function onSecretDiscovered(badgeKey) {
  if (window.Spielcade) {
    Spielcade.unlockAchievement(badgeKey); // e.g. 'secret_vault'
  }
}
</script>`,
    notes: 'The SDK script exposes a global `Spielcade` object on window.'
  },
  unity: {
    title: 'Unity WebGL',
    lang: 'csharp',
    code: `// Create a file Assets/Plugins/WebGL/SpielcadeBridge.jslib:
/*
mergeInto(LibraryManager.library, {
  Spielcade_GameReady: function() {
    if (window.Spielcade) Spielcade.gameReady();
  },
  Spielcade_SubmitScore: function(score) {
    if (window.Spielcade) Spielcade.submitScore(score);
  },
  Spielcade_GameOver: function() {
    if (window.Spielcade) Spielcade.gameOver();
  }
});
*/

// In your C# GameManager.cs:
using System.Runtime.InteropServices;
using UnityEngine;

public class GameManager : MonoBehaviour {
#if UNITY_WEBGL && !UNITY_EDITOR
    [DllImport("__Internal")]
    private static extern void Spielcade_GameReady();

    [DllImport("__Internal")]
    private static extern void Spielcade_SubmitScore(int score);

    [DllImport("__Internal")]
    private static extern void Spielcade_GameOver();
#else
    private static void Spielcade_GameReady() => Debug.Log("[Mock] GameReady");
    private static void Spielcade_SubmitScore(int s) => Debug.Log($"[Mock] Score: {s}");
    private static void Spielcade_GameOver() => Debug.Log("[Mock] GameOver");
#endif

    void Start() {
        Spielcade_GameReady();
    }

    public void FinishGame(int score) {
        Spielcade_SubmitScore(score);
        Spielcade_GameOver();
    }
}`,
    notes: 'Use a .jslib plugin in Assets/Plugins/WebGL/ for zero-allocation calls.'
  },
  godot: {
    title: 'Godot 4 HTML5',
    lang: 'gdscript',
    code: `# Godot 4 GDScript integration via JavaScriptBridge
extends Node

func _ready() -> void:
    notify_game_ready()

func notify_game_ready() -> void:
    if OS.has_feature("web"):
        JavaScriptBridge.eval("if (window.Spielcade) Spielcade.gameReady();")

func submit_score(score: int) -> void:
    if OS.has_feature("web"):
        var js_cmd = "if (window.Spielcade) { Spielcade.submitScore(%d); Spielcade.gameOver(); }" % [score]
        JavaScriptBridge.eval(js_cmd)

func unlock_achievement(badge_key: String) -> void:
    if OS.has_feature("web"):
        var js_cmd = "if (window.Spielcade) Spielcade.unlockAchievement('%s');" % [badge_key]
        JavaScriptBridge.eval(js_cmd)`,
    notes: 'Godot 4 exposes JavaScriptBridge for instant browser interop.'
  },
  phaser: {
    title: 'Phaser 3',
    lang: 'javascript',
    code: `// Inside your Phaser.Scene
export default class MainScene extends Phaser.Scene {
  create() {
    // Notify platform assets loaded
    if (window.Spielcade) {
      window.Spielcade.gameReady();
    }

    this.score = 0;
  }

  handlePlayerDeath() {
    if (window.Spielcade) {
      window.Spielcade.submitScore(this.score);
      window.Spielcade.gameOver();
    }
    this.scene.restart();
  }
}`,
    notes: 'Call Spielcade.gameReady() in the create() method of your initial playable scene.'
  },
  construct: {
    title: 'Construct 3',
    lang: 'javascript',
    code: `// Construct 3 JavaScript Scripting Block
// Add a JS file or use the "Execute JavaScript" action in Event Sheet:

// In On Start of Layout:
if (typeof Spielcade !== "undefined") {
  Spielcade.gameReady();
}

// When Game Over condition fires:
// (Pass runtime.globalVars.Score into JavaScript)
if (typeof Spielcade !== "undefined") {
  Spielcade.submitScore(runtime.globalVars.Score);
  Spielcade.gameOver();
}`,
    notes: 'Insert inside Construct 3 Script files or inline JS script actions.'
  }
};

const DEFAULT_DEMO_HTML = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Spielcade SDK Demo Game</title>
  <script src="https://spielcade.com/spielcade-sdk.js"><\/script>
  <style>
    body {
      margin: 0;
      background: #0F172A;
      color: #FFFFFF;
      font-family: system-ui, -apple-system, sans-serif;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      min-height: 100vh;
      text-align: center;
      padding: 1rem;
      box-sizing: border-box;
    }
    .card {
      background: #1E293B;
      padding: 1.5rem;
      border-radius: 1rem;
      border: 1px solid rgba(255,255,255,0.1);
      max-width: 380px;
      width: 100%;
      box-shadow: 0 10px 25px rgba(0,0,0,0.5);
    }
    h2 { margin-top: 0; color: #818CF8; font-size: 1.25rem; }
    .score-display { font-size: 2.5rem; font-weight: 900; margin: 1rem 0; color: #38BDF8; font-family: monospace; }
    .btn {
      background: #6366F1;
      color: white;
      border: none;
      padding: 0.6rem 1.2rem;
      border-radius: 0.5rem;
      font-weight: bold;
      cursor: pointer;
      margin: 0.25rem;
      transition: background 0.2s;
    }
    .btn:hover { background: #4F46E5; }
    .btn-green { background: #10B981; }
    .btn-green:hover { background: #059669; }
    .status { font-size: 0.75rem; color: #94A3B8; margin-top: 1rem; }
  </style>
</head>
<body>
  <div class="card">
    <h2>🎮 Test Target Iframe</h2>
    <p style="font-size: 0.85rem; color: #94A3B8;">Click buttons below to fire live SDK events to the parent harness.</p>
    
    <div class="score-display" id="score">0</div>
    
    <button class="btn" onclick="addScore(100)">+100 Score</button>
    <button class="btn" onclick="addScore(500)">+500 Score</button>
    <br/>
    <button class="btn btn-green" onclick="submitCurrentScore()">Submit Score</button>
    <button class="btn" style="background:#EC4899;" onclick="unlockBadge()">Unlock Achievement</button>
    
    <div class="status" id="status">SDK Status: Initializing...</div>
  </div>

  <script>
    let currentScore = 0;
    
    function addScore(pts) {
      currentScore += pts;
      document.getElementById('score').innerText = currentScore;
    }

    function submitCurrentScore() {
      if (window.Spielcade) {
        Spielcade.submitScore(currentScore);
        Spielcade.gameOver();
        document.getElementById('status').innerText = 'Submitted score: ' + currentScore;
      }
    }

    function unlockBadge() {
      if (window.Spielcade) {
        Spielcade.unlockAchievement('sandbox_champion');
        document.getElementById('status').innerText = 'Unlocked sandbox_champion';
      }
    }

    window.addEventListener('load', () => {
      setTimeout(() => {
        if (window.Spielcade) {
          Spielcade.gameReady();
          document.getElementById('status').innerText = 'SDK Ready! GAME_READY sent.';
        }
      }, 500);
    });
  <\/script>
</body>
</html>`;

export default function StudioSdkTester() {
  const [targetUrl, setTargetUrl] = useState<string>('demo');
  const [customInputUrl, setCustomInputUrl] = useState<string>('');
  const [aspectRatio, setAspectRatio] = useState<'16:9' | '4:3' | '9:16'>('16:9');
  const [logs, setLogs] = useState<SdkEventLog[]>([]);
  const [activeEngine, setActiveEngine] = useState<string>('javascript');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [lastScore, setLastScore] = useState<number | null>(null);
  const [isReady, setIsReady] = useState<boolean>(false);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  // Listen for real window.postMessage events from the test iframe
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (!event.data) return;

      if (event.data.source === 'SPIELCADE_SDK') {
        const timeStr = new Date().toLocaleTimeString();
        const newLog: SdkEventLog = {
          id: Math.random().toString(36).substring(2, 9),
          time: timeStr,
          type: event.data.type || 'UNKNOWN',
          payload: event.data.payload || {},
          direction: 'in'
        };

        setLogs(prev => [newLog, ...prev.slice(0, 49)]);

        if (event.data.type === 'GAME_READY') {
          setIsReady(true);
        } else if (event.data.type === 'SUBMIT_SCORE') {
          setLastScore(Number(event.data.payload?.score ?? 0));
        }
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, []);

  const clearLogs = () => {
    setLogs([]);
    setLastScore(null);
    setIsReady(false);
  };

  const handleSimulateEvent = (type: string, payload: any = {}) => {
    const timeStr = new Date().toLocaleTimeString();
    const newLog: SdkEventLog = {
      id: Math.random().toString(36).substring(2, 9),
      time: timeStr,
      type,
      payload,
      direction: 'in'
    };
    setLogs(prev => [newLog, ...prev.slice(0, 49)]);

    if (type === 'GAME_READY') setIsReady(true);
    if (type === 'SUBMIT_SCORE') setLastScore(payload.score);
  };

  const copyCode = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  // Compute aspect ratio CSS classes
  const aspectClass = aspectRatio === '16:9' 
    ? 'aspect-video' 
    : aspectRatio === '4:3' 
      ? 'aspect-[4/3]' 
      : 'aspect-[9/16] max-w-sm mx-auto';

  return (
    <div className="flex flex-col gap-6">
      
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-indigo-900/40 via-purple-900/30 to-blue-900/40 border border-indigo-500/20 rounded-2xl p-6 shadow-xl backdrop-blur-md">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-indigo-400 text-xs font-bold uppercase tracking-wider mb-2">
              <Sparkles size={14} /> Interactive SDK Sandbox
            </div>
            <h2 className="text-2xl font-black text-gray-900 dark:text-white font-outfit">
              Live SDK Simulator & Event Inspector
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
              Test your game iframe against the official Spielcade SDK runtime. Inspect incoming <code className="text-indigo-400">postMessage</code> events in real-time before submitting.
            </p>
          </div>
          
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => {
                setTargetUrl('demo');
                setCustomInputUrl('');
                clearLogs();
              }}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                targetUrl === 'demo'
                  ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30'
                  : 'bg-white dark:bg-white/5 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-white/10'
              }`}
            >
              Built-in Demo Game
            </button>
          </div>
        </div>

        {/* Custom URL Input Bar */}
        <div className="mt-5 flex flex-col sm:flex-row gap-3">
          <input
            type="url"
            value={customInputUrl}
            onChange={(e) => setCustomInputUrl(e.target.value)}
            placeholder="Or enter your game URL: e.g. http://localhost:8080 or https://your-game.surge.sh"
            className="flex-1 bg-white/80 dark:bg-black/40 border border-gray-200 dark:border-white/10 rounded-xl px-4 py-2.5 text-xs text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:border-indigo-500 transition-colors"
          />
          <button
            onClick={() => {
              if (customInputUrl.trim()) {
                setTargetUrl(customInputUrl.trim());
                clearLogs();
              }
            }}
            disabled={!customInputUrl.trim()}
            className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white rounded-xl text-xs font-bold transition-all shrink-0 flex items-center justify-center gap-2"
          >
            <Play size={14} /> Load Custom URL
          </button>
        </div>
      </div>

      {/* Simulator Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column: Iframe Display */}
        <div className="lg:col-span-7 flex flex-col gap-4">
          <div className="bg-white dark:bg-[#111228] border border-gray-200 dark:border-white/5 rounded-2xl p-4 shadow-xl flex flex-col gap-4">
            
            {/* Top Toolbar */}
            <div className="flex items-center justify-between gap-2 border-b border-gray-100 dark:border-white/5 pb-3">
              <div className="flex items-center gap-2">
                <span className={`w-2.5 h-2.5 rounded-full ${isReady ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'}`} />
                <span className="text-xs font-bold text-gray-700 dark:text-gray-300">
                  {isReady ? 'SDK Ready (Active)' : 'Awaiting GAME_READY'}
                </span>
                {lastScore !== null && (
                  <span className="ml-2 px-2 py-0.5 rounded-md bg-indigo-500/10 text-indigo-400 font-mono text-[11px] font-bold">
                    Score: {lastScore.toLocaleString()}
                  </span>
                )}
              </div>

              {/* Aspect Ratio Selector */}
              <div className="flex items-center gap-1 bg-gray-100 dark:bg-black/30 p-1 rounded-xl">
                <button
                  onClick={() => setAspectRatio('16:9')}
                  title="Widescreen (16:9)"
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all flex items-center gap-1 ${
                    aspectRatio === '16:9' ? 'bg-white dark:bg-indigo-600 text-indigo-600 dark:text-white shadow-sm' : 'text-gray-500'
                  }`}
                >
                  <Monitor size={12} /> 16:9
                </button>
                <button
                  onClick={() => setAspectRatio('4:3')}
                  title="Standard (4:3)"
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all flex items-center gap-1 ${
                    aspectRatio === '4:3' ? 'bg-white dark:bg-indigo-600 text-indigo-600 dark:text-white shadow-sm' : 'text-gray-500'
                  }`}
                >
                  4:3
                </button>
                <button
                  onClick={() => setAspectRatio('9:16')}
                  title="Mobile Vertical (9:16)"
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all flex items-center gap-1 ${
                    aspectRatio === '9:16' ? 'bg-white dark:bg-indigo-600 text-indigo-600 dark:text-white shadow-sm' : 'text-gray-500'
                  }`}
                >
                  <Smartphone size={12} /> 9:16
                </button>
              </div>
            </div>

            {/* Iframe Container */}
            <div className="relative w-full rounded-xl overflow-hidden bg-slate-950 border border-slate-800 shadow-inner">
              <div className={`w-full ${aspectClass} transition-all duration-300`}>
                {targetUrl === 'demo' ? (
                  <iframe
                    ref={iframeRef}
                    title="Spielcade SDK Demo"
                    srcDoc={DEFAULT_DEMO_HTML}
                    className="w-full h-full border-0"
                    sandbox="allow-scripts allow-same-origin"
                  />
                ) : (
                  <iframe
                    ref={iframeRef}
                    title="Custom Game Test"
                    src={targetUrl}
                    className="w-full h-full border-0"
                    allow={GAME_IFRAME_PERMISSIONS}
                    sandbox={GAME_IFRAME_SANDBOX}
                  />
                )}
              </div>
            </div>

            {/* Bottom Iframe Info / Reload */}
            <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400 pt-1">
              <span className="truncate max-w-xs font-mono">
                Source: {targetUrl === 'demo' ? 'Interactive Sandbox Preset' : targetUrl}
              </span>
              <button
                onClick={() => {
                  if (iframeRef.current) {
                    if (targetUrl === 'demo') {
                      iframeRef.current.srcdoc = DEFAULT_DEMO_HTML;
                    } else {
                      iframeRef.current.src = targetUrl;
                    }
                    setIsReady(false);
                  }
                }}
                className="flex items-center gap-1 hover:text-indigo-400 font-bold transition-colors"
              >
                <RefreshCw size={12} /> Reload Frame
              </button>
            </div>

          </div>
        </div>

        {/* Right Column: Live Event Stream & Controls */}
        <div className="lg:col-span-5 flex flex-col gap-4">
          
          {/* Real-time Console */}
          <div className="bg-slate-950 rounded-2xl border border-slate-800 shadow-xl overflow-hidden flex flex-col h-[380px]">
            <div className="p-3 bg-slate-900 border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Terminal size={14} className="text-emerald-400" />
                <span className="text-xs font-mono font-bold text-slate-200">
                  Event Stream ({logs.length})
                </span>
              </div>
              <button
                onClick={clearLogs}
                className="text-[10px] text-slate-400 hover:text-white font-mono px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 transition-colors"
              >
                Clear
              </button>
            </div>

            {/* Log Stream Area */}
            <div className="flex-1 p-3 overflow-y-auto font-mono text-xs space-y-2">
              {logs.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center text-slate-600">
                  <Terminal size={24} className="mb-2 opacity-50" />
                  <p className="text-xs">No SDK events received yet.</p>
                  <p className="text-[11px] text-slate-600 mt-1">
                    Interact with the test game or click triggers below.
                  </p>
                </div>
              ) : (
                logs.map((log) => (
                  <div 
                    key={log.id} 
                    className={`p-2 rounded-lg border text-[11px] leading-relaxed animate-fadeIn ${
                      log.direction === 'out'
                        ? 'bg-blue-950/40 border-blue-800/40 text-blue-300'
                        : log.type === 'GAME_READY'
                          ? 'bg-emerald-950/40 border-emerald-800/40 text-emerald-300'
                          : log.type === 'SUBMIT_SCORE'
                            ? 'bg-indigo-950/40 border-indigo-800/40 text-indigo-300'
                            : log.type === 'UNLOCK_ACHIEVEMENT'
                              ? 'bg-amber-950/40 border-amber-800/40 text-amber-300'
                              : 'bg-slate-900 border-slate-800 text-slate-300'
                    }`}
                  >
                    <div className="flex items-center justify-between font-bold mb-1">
                      <span className="flex items-center gap-1.5">
                        <span className="text-[10px] opacity-70">
                          {log.direction === 'in' ? '⬇ [Game]' : '⬆ [Platform]'}
                        </span>
                        <span>{log.type}</span>
                      </span>
                      <span className="text-[10px] opacity-50 font-normal">{log.time}</span>
                    </div>
                    {log.payload && Object.keys(log.payload).length > 0 && (
                      <pre className="text-[10px] opacity-90 overflow-x-auto p-1 bg-black/40 rounded mt-1 font-mono">
                        {JSON.stringify(log.payload, null, 2)}
                      </pre>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Manual Event Injection Triggers */}
          <div className="bg-white dark:bg-[#111228] border border-gray-200 dark:border-white/5 rounded-2xl p-4 shadow-xl">
            <h4 className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3">
              Simulate Inbound Triggers
            </h4>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => handleSimulateEvent('GAME_READY')}
                className="px-3 py-2 bg-emerald-50 dark:bg-emerald-500/10 hover:bg-emerald-100 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/20 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5"
              >
                <CheckCircle2 size={13} /> GAME_READY
              </button>
              <button
                onClick={() => handleSimulateEvent('SUBMIT_SCORE', { score: Math.floor(Math.random() * 5000 + 1000) })}
                className="px-3 py-2 bg-indigo-50 dark:bg-indigo-500/10 hover:bg-indigo-100 text-indigo-700 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-500/20 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5"
              >
                <Trophy size={13} /> Random Score
              </button>
              <button
                onClick={() => handleSimulateEvent('UNLOCK_ACHIEVEMENT', { key: 'first_boss_slain' })}
                className="px-3 py-2 bg-amber-50 dark:bg-amber-500/10 hover:bg-amber-100 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-500/20 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5"
              >
                <Award size={13} /> Achievement
              </button>
              <button
                onClick={() => handleSimulateEvent('GAME_OVER')}
                className="px-3 py-2 bg-rose-50 dark:bg-rose-500/10 hover:bg-rose-100 text-rose-700 dark:text-rose-400 border border-rose-200 dark:border-rose-500/20 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5"
              >
                <AlertCircle size={13} /> GAME_OVER
              </button>
            </div>
          </div>

        </div>

      </div>

      {/* Multi-Engine Code Integration Sandbox */}
      <div className="bg-white dark:bg-[#111228] border border-gray-200 dark:border-white/5 rounded-2xl shadow-xl overflow-hidden">
        <div className="p-6 border-b border-gray-100 dark:border-white/5 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h3 className="text-lg font-bold font-outfit text-gray-900 dark:text-white flex items-center gap-2">
              <Code2 size={20} className="text-indigo-500" />
              Engine Integration Templates
            </h3>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
              Production-tested boilerplates ready to drop directly into your game project.
            </p>
          </div>

          {/* Engine Tabs */}
          <div className="flex flex-wrap items-center gap-1 bg-gray-100 dark:bg-black/30 p-1 rounded-xl">
            {Object.keys(ENGINE_SNIPPETS).map((engKey) => (
              <button
                key={engKey}
                onClick={() => setActiveEngine(engKey)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  activeEngine === engKey
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                }`}
              >
                {ENGINE_SNIPPETS[engKey].title}
              </button>
            ))}
          </div>
        </div>

        {/* Snippet Viewer */}
        <div className="p-6 bg-slate-950 relative">
          <div className="flex items-center justify-between mb-3 text-xs text-slate-400">
            <span className="font-mono">{ENGINE_SNIPPETS[activeEngine].title} Integration</span>
            <button
              onClick={() => copyCode(ENGINE_SNIPPETS[activeEngine].code, activeEngine)}
              className="flex items-center gap-1 px-3 py-1 bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-xs font-bold transition-colors"
            >
              {copiedKey === activeEngine ? <Check size={12} className="text-emerald-400" /> : <Copy size={12} />}
              {copiedKey === activeEngine ? 'Copied!' : 'Copy Snippet'}
            </button>
          </div>

          <pre className="p-4 rounded-xl bg-slate-900 border border-slate-800 text-slate-200 font-mono text-xs leading-relaxed overflow-x-auto">
            <code>{ENGINE_SNIPPETS[activeEngine].code}</code>
          </pre>

          <p className="text-xs text-slate-400 mt-3 italic">
            💡 {ENGINE_SNIPPETS[activeEngine].notes}
          </p>
        </div>
      </div>

    </div>
  );
}
