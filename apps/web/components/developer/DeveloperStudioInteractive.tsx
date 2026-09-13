'use client';

import React, { useState, useMemo } from 'react';
import { 
  Check, 
  Copy, 
  Code2, 
  Calculator, 
  ChevronDown, 
  Search, 
  Sparkles, 
  Terminal, 
  DollarSign, 
  Layers, 
  Cpu, 
  Zap, 
  ShieldCheck, 
  ExternalLink 
} from 'lucide-react';
import { FAQ_DATA } from '@/lib/developerFaqData';

/* =========================================================================
   ENGINE GUIDES DATA
   ========================================================================= */
interface EngineGuide {
  id: string;
  name: string;
  badge: string;
  description: string;
  exportSteps: string[];
  filename: string;
  language: string;
  code: string;
  tips: string;
}

const ENGINE_GUIDES: EngineGuide[] = [
  {
    id: 'unity',
    name: 'Unity WebGL',
    badge: 'Unity 2021 / 2022 / 6',
    description: 'Connect Unity WebGL games to Spielcade using a lightweight JSlib JavaScript plugin and C# DllImport bridge.',
    exportSteps: [
      'Set Player Settings > Resolution and Presentation to Full Window or responsive canvas.',
      'Under Publishing Settings, enable Decompression Fallback (Gzip or Brotli).',
      'Create a file at Assets/Plugins/WebGL/SpielcadeBridge.jslib with the code below.',
      'Call the static C# methods when loading completes or when the player dies.'
    ],
    filename: 'SpielcadeBridge.jslib & SpielcadeManager.cs',
    language: 'csharp',
    code: `// --- File: Assets/Plugins/WebGL/SpielcadeBridge.jslib ---
mergeInto(LibraryManager.library, {
  Spielcade_GameReady: function () {
    if (window.Spielcade) window.Spielcade.gameReady();
  },
  Spielcade_SubmitScore: function (score) {
    if (window.Spielcade) window.Spielcade.submitScore(score);
  },
  Spielcade_GameOver: function () {
    if (window.Spielcade) window.Spielcade.gameOver();
  },
  Spielcade_UnlockAchievement: function (keyPtr) {
    if (window.Spielcade) {
      var key = UTF8ToString(keyPtr);
      window.Spielcade.unlockAchievement(key);
    }
  }
});

// --- File: Assets/Scripts/SpielcadeManager.cs ---
using System.Runtime.InteropServices;
using UnityEngine;

public class SpielcadeManager : MonoBehaviour {
    [DllImport("__Internal")] private static extern void Spielcade_GameReady();
    [DllImport("__Internal")] private static extern void Spielcade_SubmitScore(int score);
    [DllImport("__Internal")] private static extern void Spielcade_GameOver();
    [DllImport("__Internal")] private static extern void Spielcade_UnlockAchievement(string key);

    void Start() {
        #if UNITY_WEBGL && !UNITY_EDITOR
        Spielcade_GameReady();
        #endif
    }

    public static void SendScore(int score) {
        #if UNITY_WEBGL && !UNITY_EDITOR
        Spielcade_SubmitScore(score);
        Spielcade_GameOver();
        #endif
    }
}`,
    tips: 'Recommended Memory Size: 256MB to 512MB. Avoid setting above 1024MB for mobile browser compatibility.'
  },
  {
    id: 'godot',
    name: 'Godot Engine',
    badge: 'Godot 4.x / 3.5+',
    description: 'Seamless integration with Godot 4 via the JavaScriptBridge singleton for Web exports.',
    exportSteps: [
      'In Project > Export > Web, ensure the export template is installed and Canvas Resize Policy is set to Project.',
      'In the Custom HTML Shell Head Include, ensure the Spielcade SDK script tag is present.',
      'Use JavaScriptBridge.eval() or get_interface() in GDScript to dispatch events.'
    ],
    filename: 'SpielcadeBridge.gd',
    language: 'gdscript',
    code: `# File: res://scripts/SpielcadeBridge.gd
extends Node

func _ready() -> void:
    signal_game_ready()

func signal_game_ready() -> void:
    if OS.has_feature("web"):
        JavaScriptBridge.eval("if (window.Spielcade) { window.Spielcade.gameReady(); }")

func submit_score(final_score: int) -> void:
    if OS.has_feature("web"):
        var js_call = "if (window.Spielcade) { window.Spielcade.submitScore(%d); window.Spielcade.gameOver(); }" % final_score
        JavaScriptBridge.eval(js_call)

func unlock_achievement(achievement_key: String) -> void:
    if OS.has_feature("web"):
        var js_call = "if (window.Spielcade) { window.Spielcade.unlockAchievement('%s'); }" % achievement_key
        JavaScriptBridge.eval(js_call)`,
    tips: 'Use Compatibility (OpenGL 3) renderer in Godot 4 for maximum cross-browser mobile and desktop compatibility.'
  },
  {
    id: 'phaser',
    name: 'Phaser 3',
    badge: 'JavaScript / TypeScript',
    description: 'Direct native integration for the web’s most popular 2D HTML5 game framework.',
    exportSteps: [
      'Include <script src="https://spielcade.com/spielcade-sdk.js"></script> in index.html.',
      'Call window.Spielcade.gameReady() in your MainScene or BootScene create() method.',
      'Trigger submitScore() and gameOver() on death or level completion.'
    ],
    filename: 'GameScene.js',
    language: 'javascript',
    code: `// File: src/scenes/GameScene.js
import Phaser from 'phaser';

export default class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
  }

  create() {
    // Notify Spielcade parent container that loading screen can be dismissed
    if (typeof window !== 'undefined' && window.Spielcade) {
      window.Spielcade.gameReady();
    }

    this.score = 0;
    this.scoreText = this.add.text(16, 16, 'Score: 0', { fontSize: '24px', fill: '#fff' });
  }

  onPlayerDeath() {
    // Submit score to global leaderboard and trigger interstitial ad / session end
    if (typeof window !== 'undefined' && window.Spielcade) {
      window.Spielcade.submitScore(Math.floor(this.score));
      window.Spielcade.gameOver();
    }

    this.scene.start('GameOverScene', { finalScore: this.score });
  }
}`,
    tips: 'Use Phaser.Scale.FIT with autoCenter: Phaser.Scale.CENTER_BOTH for flawless responsive scaling on all screens.'
  },
  {
    id: 'construct',
    name: 'Construct 3',
    badge: 'No-Code / Visual Scripting',
    description: 'Integrate using Construct 3 Browser Scripting or custom JavaScript blocks in event sheets.',
    exportSteps: [
      'Add the Browser plugin to your Construct 3 project.',
      'In Project Settings, ensure index.html includes the Spielcade SDK script.',
      'Use the "Execute JavaScript" action or JS script block in your event sheets.'
    ],
    filename: 'Eventsheet.js (Construct 3 Script Block)',
    language: 'javascript',
    code: `// On Loader Complete / Start of Layout:
runOnStartup(async runtime => {
  if (window.Spielcade) {
    window.Spielcade.gameReady();
  }
});

// On Player Dead / Game Over Event:
// Call this inside a Construct 3 JavaScript Script block:
const currentScore = runtime.globalVars.PlayerScore;

if (window.Spielcade) {
  window.Spielcade.submitScore(Math.floor(currentScore));
  window.Spielcade.gameOver();
}`,
    tips: 'Set "Sampling" to Linear or Point based on your art style. Disable "Pause on unfocus" if audio glitches occur.'
  },
  {
    id: 'gamemaker',
    name: 'GameMaker',
    badge: 'GML / HTML5 Export',
    description: 'Export to HTML5 using GameMaker Studio 2 and bridge events via custom JS extensions.',
    exportSteps: [
      'Create an Extension named SpielcadeBridge with JavaScript as target.',
      'Declare functions spielcade_ready, spielcade_submit_score, and spielcade_game_over.',
      'Add corresponding JS implementation calling window.Spielcade methods.'
    ],
    filename: 'SpielcadeExtension.js & GML Event',
    language: 'javascript',
    code: `// File: extensions/SpielcadeBridge/SpielcadeBridge.js
function spielcade_ready() {
    if (window.Spielcade) window.Spielcade.gameReady();
}

function spielcade_submit_score(score) {
    if (window.Spielcade) window.Spielcade.submitScore(score);
}

function spielcade_game_over() {
    if (window.Spielcade) window.Spielcade.gameOver();
}

// In GameMaker GML Object Event (e.g. obj_game_controller: Step Event):
if (player_health <= 0 && !is_dead) {
    is_dead = true;
    spielcade_submit_score(global.score);
    spielcade_game_over();
}`,
    tips: 'Ensure "Web server URL" is empty during export so relative paths work automatically when embedded in Spielcade iframes.'
  },
  {
    id: 'vanilla',
    name: 'Vanilla JS / Canvas / Three.js',
    badge: 'HTML5 / WebGL / Three.js',
    description: 'Direct zero-dependency integration for custom JavaScript, Canvas 2D, Three.js, Pixi.js, or Babylon.js engines.',
    exportSteps: [
      'Add <script src="https://spielcade.com/spielcade-sdk.js"></script> to your index.html <head>.',
      'Listen for asset completion, then call window.Spielcade.gameReady().',
      'Dispatch scores and game over events on round completion.'
    ],
    filename: 'main.js',
    language: 'javascript',
    code: `// Include in index.html:
// <script src="https://spielcade.com/spielcade-sdk.js"></script>

// In your game initialization loop:
window.addEventListener('load', () => {
  // When your Three.js / Canvas 2D assets are loaded:
  if (window.Spielcade) {
    window.Spielcade.gameReady();
  }
});

function handleGameOver(score) {
  if (window.Spielcade) {
    window.Spielcade.submitScore(Math.floor(score));
    window.Spielcade.gameOver();
  }
}

function handleAchievementUnlocked(badgeKey) {
  if (window.Spielcade) {
    window.Spielcade.unlockAchievement(badgeKey);
  }
}`,
    tips: 'Always wrap canvas with "touch-action: none" to prevent mobile pull-to-refresh gestures during active touch play.'
  }
];

/* =========================================================================
   SDK CODE PLAYGROUND SNIPPETS
   ========================================================================= */
const SDK_SNIPPETS = [
  {
    id: 'install',
    title: '1. Script Tag Installation',
    desc: 'Include this script in your HTML <head>. Zero dependencies, 2KB size, loaded via global Cloudflare Edge CDN.',
    code: `<script src="https://spielcade.com/spielcade-sdk.js"></script>`
  },
  {
    id: 'ready',
    title: '2. Spielcade.gameReady()',
    desc: 'Call once your game assets, sounds, and canvas are rendered. This dismisses the platform loading placeholder.',
    code: `if (window.Spielcade) {
  // Signals the platform that game assets have loaded
  window.Spielcade.gameReady();
}`
  },
  {
    id: 'score',
    title: '3. Spielcade.submitScore(number)',
    desc: 'Pass an integer score. Spielcade validates the score, updates global daily/all-time leaderboards, and logs player stats.',
    code: `// Submits an integer score to the player's profile and leaderboards
function onScoreUpdate(finalScore) {
  if (window.Spielcade) {
    window.Spielcade.submitScore(Math.floor(finalScore));
  }
}`
  },
  {
    id: 'gameover',
    title: '4. Spielcade.gameOver()',
    desc: 'Triggers session wrap-up. Prompts the platform to calculate XP rewards, trigger non-intrusive ads, and refresh leaderboards.',
    code: `function onPlayerDeath() {
  if (window.Spielcade) {
    window.Spielcade.submitScore(Math.floor(currentScore));
    window.Spielcade.gameOver();
  }
}`
  },
  {
    id: 'achievement',
    title: '5. Spielcade.unlockAchievement(key)',
    desc: 'Unlocks a platform badge on the player’s public profile. Drive 3x higher retention by awarding achievements.',
    code: `// Unlocks a custom badge registered in your Developer Studio dashboard
if (window.Spielcade) {
  window.Spielcade.unlockAchievement('defeat_dragon_boss');
}`
  }
];

/* =========================================================================
   MAIN INTERACTIVE COMPONENT
   ========================================================================= */
export default function DeveloperStudioInteractive() {
  // Engine Guide state
  const [selectedEngine, setSelectedEngine] = useState<string>('unity');
  const activeEngine = useMemo(() => 
    ENGINE_GUIDES.find(e => e.id === selectedEngine) || ENGINE_GUIDES[0],
    [selectedEngine]
  );

  // Revenue Estimator state
  const [dailyPlays, setDailyPlays] = useState<number>(25000);
  const [ecpmTier, setEcpmTier] = useState<number>(2.50); // $2.50 standard eCPM

  const revenueCalc = useMemo(() => {
    const monthlyPlays = dailyPlays * 30;
    // Estimated 1.6 ad impressions per play (pre-roll + interstitial on game over)
    const monthlyImpressions = Math.round(monthlyPlays * 1.6);
    const grossRevenue = (monthlyImpressions / 1000) * ecpmTier;
    const devEarningsMonthly = grossRevenue * 0.70; // 70% developer share
    const devEarningsAnnual = devEarningsMonthly * 12;

    return {
      monthlyPlays,
      monthlyImpressions,
      grossRevenue,
      devEarningsMonthly,
      devEarningsAnnual
    };
  }, [dailyPlays, ecpmTier]);

  // Code Copy State
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2200);
  };

  // SDK Explorer State
  const [selectedSdkTab, setSelectedSdkTab] = useState<string>('install');
  const activeSnippet = useMemo(() => 
    SDK_SNIPPETS.find(s => s.id === selectedSdkTab) || SDK_SNIPPETS[0],
    [selectedSdkTab]
  );

  // FAQ Search & Accordion State
  const [faqSearch, setFaqSearch] = useState<string>('');
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);
  const [faqCategoryFilter, setFaqCategoryFilter] = useState<string>('All');

  const filteredFaqs = useMemo(() => {
    return FAQ_DATA.filter(item => {
      const matchesSearch = faqSearch === '' || 
        item.q.toLowerCase().includes(faqSearch.toLowerCase()) ||
        item.a.toLowerCase().includes(faqSearch.toLowerCase());
      const matchesCategory = faqCategoryFilter === 'All' || item.tag === faqCategoryFilter;
      return matchesSearch && matchesCategory;
    });
  }, [faqSearch, faqCategoryFilter]);

  return (
    <div className="flex flex-col gap-24">

      {/* ===================================================================
          SECTION 1: INTERACTIVE REVENUE ESTIMATOR
          =================================================================== */}
      <section id="revenue-calculator" className="relative">
        <div className="bg-gradient-to-b from-gray-900 via-[#0E1029] to-[#0A0A1B] text-white rounded-3xl p-6 sm:p-10 lg:p-12 border border-indigo-500/20 shadow-2xl overflow-hidden relative">
          {/* Background decorative glow */}
          <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 flex flex-col gap-10">
            {/* Header */}
            <div className="text-center max-w-3xl mx-auto">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-bold text-xs uppercase tracking-wider mb-4">
                <Calculator className="w-3.5 h-3.5" />
                <span>Interactive Earnings Estimator</span>
              </div>
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black font-outfit tracking-tight">
                Transparent 70% Developer Revenue Share
              </h2>
              <p className="text-gray-300 mt-3 text-sm sm:text-base leading-relaxed">
                Adjust your estimated daily plays and audience tier to calculate your projected monthly and annual earnings. We pass through up to 70% of all ad revenues directly to creators.
              </p>
            </div>

            {/* Main Interactive Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
              
              {/* Left Controls: Sliders & Tier Selectors */}
              <div className="lg:col-span-6 bg-white/5 border border-white/10 rounded-2xl p-6 sm:p-8 flex flex-col gap-6 backdrop-blur-sm">
                
                {/* Slider 1: Daily Plays */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-xs font-bold text-gray-300 uppercase tracking-wider">
                      Estimated Daily Plays
                    </label>
                    <span className="text-xl font-black font-mono text-indigo-400">
                      {dailyPlays.toLocaleString()} <span className="text-xs text-gray-400 font-sans">plays/day</span>
                    </span>
                  </div>
                  <input
                    type="range"
                    min={1000}
                    max={250000}
                    step={1000}
                    value={dailyPlays}
                    onChange={(e) => setDailyPlays(Number(e.target.value))}
                    className="w-full h-2.5 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-indigo-500"
                  />
                  <div className="flex justify-between text-[11px] text-gray-400 font-mono mt-1.5">
                    <span>1,000</span>
                    <span>50,000</span>
                    <span>150,000</span>
                    <span>250,000+</span>
                  </div>
                </div>

                {/* Control 2: Traffic Geo & eCPM Tier */}
                <div>
                  <label className="block text-xs font-bold text-gray-300 uppercase tracking-wider mb-2.5">
                    Target Geo / eCPM Tier
                  </label>
                  <div className="grid grid-cols-3 gap-2.5">
                    <button
                      type="button"
                      onClick={() => setEcpmTier(1.60)}
                      className={`p-3 rounded-xl border text-left transition-all ${
                        ecpmTier === 1.60 
                          ? 'bg-indigo-600/30 border-indigo-400 text-white shadow-lg' 
                          : 'bg-black/30 border-white/10 text-gray-400 hover:bg-white/5'
                      }`}
                    >
                      <div className="text-xs font-bold">Global Blend</div>
                      <div className="text-sm font-mono text-emerald-400 mt-0.5">$1.60 eCPM</div>
                    </button>

                    <button
                      type="button"
                      onClick={() => setEcpmTier(2.50)}
                      className={`p-3 rounded-xl border text-left transition-all ${
                        ecpmTier === 2.50 
                          ? 'bg-indigo-600/30 border-indigo-400 text-white shadow-lg' 
                          : 'bg-black/30 border-white/10 text-gray-400 hover:bg-white/5'
                      }`}
                    >
                      <div className="text-xs font-bold">Standard Mix</div>
                      <div className="text-sm font-mono text-emerald-400 mt-0.5">$2.50 eCPM</div>
                    </button>

                    <button
                      type="button"
                      onClick={() => setEcpmTier(4.20)}
                      className={`p-3 rounded-xl border text-left transition-all ${
                        ecpmTier === 4.20 
                          ? 'bg-indigo-600/30 border-indigo-400 text-white shadow-lg' 
                          : 'bg-black/30 border-white/10 text-gray-400 hover:bg-white/5'
                      }`}
                    >
                      <div className="text-xs font-bold">Tier 1 Geo (US/EU)</div>
                      <div className="text-sm font-mono text-emerald-400 mt-0.5">$4.20 eCPM</div>
                    </button>
                  </div>
                  <p className="text-[11px] text-gray-400 mt-2">
                    * eCPM is calculated based on blended video pre-roll and interstitial ad fills.
                  </p>
                </div>

                {/* Metrics Breakdown */}
                <div className="pt-4 border-t border-white/10 grid grid-cols-2 gap-4">
                  <div>
                    <span className="text-[11px] text-gray-400 uppercase tracking-wider block">Monthly Plays</span>
                    <span className="text-lg font-bold font-mono text-white">
                      {(revenueCalc.monthlyPlays / 1000).toFixed(0)}k
                    </span>
                  </div>
                  <div>
                    <span className="text-[11px] text-gray-400 uppercase tracking-wider block">Monthly Ad Impressions</span>
                    <span className="text-lg font-bold font-mono text-white">
                      {(revenueCalc.monthlyImpressions / 1000).toFixed(0)}k
                    </span>
                  </div>
                </div>

              </div>

              {/* Right Output: Big Highlight Earnings */}
              <div className="lg:col-span-6 flex flex-col gap-5">
                <div className="bg-gradient-to-br from-[#121438] to-[#1A1D4E] border border-indigo-500/30 rounded-3xl p-8 sm:p-10 shadow-2xl relative overflow-hidden">
                  <div className="absolute top-0 right-0 p-6 opacity-10">
                    <DollarSign size={140} />
                  </div>

                  <div className="relative z-10 flex flex-col gap-6">
                    <div>
                      <div className="text-xs font-bold uppercase tracking-widest text-emerald-400 mb-1">
                        Developer Take-Home (70% Share)
                      </div>
                      <div className="text-4xl sm:text-6xl font-black font-mono text-white tracking-tight">
                        ${Math.round(revenueCalc.devEarningsMonthly).toLocaleString()}
                        <span className="text-xl sm:text-2xl font-sans text-gray-400 font-normal"> / mo</span>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 pt-4 border-t border-white/10">
                      <div>
                        <span className="text-xs text-gray-400 block font-medium">Estimated Annual Pay</span>
                        <span className="text-xl sm:text-2xl font-black font-mono text-emerald-400">
                          ${Math.round(revenueCalc.devEarningsAnnual).toLocaleString()}
                        </span>
                      </div>
                      <div>
                        <span className="text-xs text-gray-400 block font-medium">Payout Frequency</span>
                        <span className="text-sm font-bold text-white flex items-center gap-1.5 mt-1">
                          <Check size={16} className="text-emerald-400" /> Net-30 Monthly
                        </span>
                      </div>
                    </div>

                    <div className="bg-black/40 rounded-xl p-3.5 border border-white/5 flex flex-wrap items-center justify-between text-xs text-gray-300 gap-2">
                      <span className="flex items-center gap-1.5">
                        <ShieldCheck size={15} className="text-indigo-400" />
                        Min. Payout: <strong>$50 USD</strong>
                      </span>
                      <span className="text-gray-400">Supported: Stripe, PayPal, Wire</span>
                    </div>

                    <a
                      href="/studio/submit"
                      className="w-full bg-[#6366F1] hover:bg-[#5457DF] text-white font-bold py-3.5 px-6 rounded-xl transition-all text-center shadow-[0_0_20px_rgba(99,102,241,0.4)] hover:shadow-[0_0_30px_rgba(99,102,241,0.6)]"
                    >
                      Start Monetizing Your Game Now
                    </a>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </div>
      </section>


      {/* ===================================================================
          SECTION 2: MULTI-ENGINE INTEGRATION GUIDES
          =================================================================== */}
      <section id="engine-integration" className="relative">
        <div className="flex flex-col gap-8">
          
          <div className="text-center max-w-3xl mx-auto">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-100 dark:bg-indigo-900/30 border border-indigo-200 dark:border-indigo-800 text-indigo-700 dark:text-indigo-300 font-bold text-xs uppercase tracking-wider mb-4">
              <Cpu className="w-3.5 h-3.5" />
              <span>Multi-Engine Compatibility Matrix</span>
            </div>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black font-outfit text-gray-900 dark:text-white tracking-tight">
              Build in Any Engine. We Handle the Rest.
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mt-3 text-sm sm:text-base leading-relaxed">
              Spielcade is 100% engine-agnostic. Whether you develop in Unity, Godot, Phaser, Construct 3, GameMaker, or raw JavaScript, your game seamlessly bridges into our leaderboards, achievements, and ad pipeline.
            </p>
          </div>

          {/* Engine Selector Buttons */}
          <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3">
            {ENGINE_GUIDES.map((engine) => (
              <button
                key={engine.id}
                type="button"
                onClick={() => setSelectedEngine(engine.id)}
                className={`px-5 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition-all flex items-center gap-2 ${
                  selectedEngine === engine.id
                    ? 'bg-[#6366F1] text-white shadow-lg shadow-indigo-500/30 scale-105'
                    : 'bg-white dark:bg-[#111228] text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-white/10 hover:border-[#6366F1]'
                }`}
              >
                <span>{engine.name}</span>
                <span className="text-[10px] px-2 py-0.5 rounded-md bg-black/10 dark:bg-white/10 opacity-80">
                  {engine.badge.split(' ')[0]}
                </span>
              </button>
            ))}
          </div>

          {/* Active Engine Card */}
          <div className="bg-white dark:bg-[#111228] rounded-3xl border border-gray-200 dark:border-white/10 p-6 sm:p-10 shadow-xl flex flex-col gap-8">
            
            {/* Header info */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-gray-100 dark:border-white/5">
              <div>
                <div className="flex items-center gap-3">
                  <h3 className="text-2xl font-black font-outfit text-gray-900 dark:text-white">
                    {activeEngine.name}
                  </h3>
                  <span className="px-3 py-1 rounded-full text-xs font-bold bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800">
                    {activeEngine.badge}
                  </span>
                </div>
                <p className="text-gray-600 dark:text-gray-400 text-sm mt-1.5">
                  {activeEngine.description}
                </p>
              </div>

              <div className="text-xs font-mono text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-black/30 px-3.5 py-2 rounded-xl border border-gray-200 dark:border-white/5 shrink-0">
                File: <strong className="text-gray-900 dark:text-white">{activeEngine.filename}</strong>
              </div>
            </div>

            {/* 2-Col layout: Export Steps + Code Snippet */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              
              {/* Export Steps */}
              <div className="lg:col-span-5 flex flex-col gap-4">
                <h4 className="text-sm font-bold uppercase tracking-wider text-gray-900 dark:text-white flex items-center gap-2">
                  <Layers size={16} className="text-indigo-500" />
                  Recommended Export Settings
                </h4>
                <ul className="flex flex-col gap-3">
                  {activeEngine.exportSteps.map((step, idx) => (
                    <li key={idx} className="flex items-start gap-3 text-sm text-gray-600 dark:text-gray-300">
                      <span className="w-6 h-6 rounded-full bg-indigo-100 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-400 font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">
                        {idx + 1}
                      </span>
                      <span>{step}</span>
                    </li>
                  ))}
                </ul>

                {/* Pro tip box */}
                <div className="mt-4 p-4 rounded-2xl bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/20 text-amber-900 dark:text-amber-300 text-xs leading-relaxed">
                  <strong>Engine Pro-Tip:</strong> {activeEngine.tips}
                </div>
              </div>

              {/* Code Snippet Box */}
              <div className="lg:col-span-7 flex flex-col">
                <div className="bg-gray-900 rounded-2xl border border-gray-800 overflow-hidden shadow-2xl flex flex-col flex-1">
                  
                  {/* Code Header with Copy Button */}
                  <div className="flex items-center justify-between px-4 py-3 bg-gray-800/80 border-b border-gray-700">
                    <div className="flex items-center gap-2">
                      <div className="flex gap-1.5">
                        <div className="w-3 h-3 rounded-full bg-red-500/80" />
                        <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
                        <div className="w-3 h-3 rounded-full bg-green-500/80" />
                      </div>
                      <span className="text-xs font-mono text-gray-400 ml-2">
                        {activeEngine.name.toLowerCase().replace(/\s+/g, '-')}-integration.{activeEngine.language === 'csharp' ? 'cs' : activeEngine.language === 'gdscript' ? 'gd' : 'js'}
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleCopy(activeEngine.id, activeEngine.code)}
                      className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-gray-700 hover:bg-gray-600 text-xs font-medium text-white transition-colors"
                    >
                      {copiedId === activeEngine.id ? (
                        <>
                          <Check size={14} className="text-emerald-400" />
                          <span className="text-emerald-400">Copied!</span>
                        </>
                      ) : (
                        <>
                          <Copy size={14} />
                          <span>Copy Code</span>
                        </>
                      )}
                    </button>
                  </div>

                  {/* Preformatted Code Content */}
                  <div className="p-4 sm:p-5 overflow-x-auto font-mono text-xs sm:text-sm text-gray-200 leading-relaxed max-h-[420px] scrollbar-thin">
                    <pre>
                      <code>{activeEngine.code}</code>
                    </pre>
                  </div>

                </div>
              </div>

            </div>

          </div>

        </div>
      </section>


      {/* ===================================================================
          SECTION 3: INTERACTIVE SDK CODE PLAYGROUND
          =================================================================== */}
      <section id="sdk-reference" className="relative">
        <div className="bg-white dark:bg-[#111228] rounded-3xl border border-gray-200 dark:border-white/10 p-6 sm:p-10 shadow-xl flex flex-col gap-8">
          
          <div className="text-center max-w-3xl mx-auto">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-100 dark:bg-indigo-900/30 border border-indigo-200 dark:border-indigo-800 text-indigo-700 dark:text-indigo-300 font-bold text-xs uppercase tracking-wider mb-4">
              <Terminal className="w-3.5 h-3.5" />
              <span>Official SDK API Explorer</span>
            </div>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black font-outfit text-gray-900 dark:text-white tracking-tight">
              2KB Lightweight SDK API Reference
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mt-3 text-sm sm:text-base leading-relaxed">
              No bloated npm libraries or dependencies required. Add one script tag to your HTML shell and call simple standard methods for leaderboards, saves, and monetization.
            </p>
          </div>

          {/* Playground Tabs */}
          <div className="flex flex-wrap gap-2 justify-center">
            {SDK_SNIPPETS.map((snippet) => (
              <button
                key={snippet.id}
                type="button"
                onClick={() => setSelectedSdkTab(snippet.id)}
                className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all ${
                  selectedSdkTab === snippet.id
                    ? 'bg-gray-900 dark:bg-white text-white dark:text-gray-900 shadow-md'
                    : 'bg-gray-100 dark:bg-black/30 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-white/5'
                }`}
              >
                {snippet.title.split(' ')[1]}
              </button>
            ))}
          </div>

          {/* Active Snippet Box */}
          <div className="bg-gray-900 rounded-2xl border border-gray-800 overflow-hidden shadow-2xl flex flex-col">
            <div className="p-4 sm:p-6 bg-gray-800/60 border-b border-gray-700 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h3 className="text-lg font-bold text-white font-mono flex items-center gap-2">
                  <Code2 size={18} className="text-indigo-400" />
                  {activeSnippet.title}
                </h3>
                <p className="text-xs text-gray-400 mt-1">
                  {activeSnippet.desc}
                </p>
              </div>

              <button
                type="button"
                onClick={() => handleCopy(`sdk-${activeSnippet.id}`, activeSnippet.code)}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#6366F1] hover:bg-[#5457DF] text-white text-xs font-bold transition-all shrink-0"
              >
                {copiedId === `sdk-${activeSnippet.id}` ? (
                  <>
                    <Check size={14} className="text-white" />
                    <span>Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy size={14} />
                    <span>Copy Snippet</span>
                  </>
                )}
              </button>
            </div>

            <div className="p-6 overflow-x-auto font-mono text-sm text-emerald-400 leading-relaxed">
              <pre>
                <code>{activeSnippet.code}</code>
              </pre>
            </div>
          </div>

        </div>
      </section>


      {/* ===================================================================
          SECTION 4: SEARCHABLE DEVELOPER FAQ ACCORDION
          =================================================================== */}
      <section id="developer-faq" className="relative">
        <div className="flex flex-col gap-8 max-w-4xl mx-auto">
          
          <div className="text-center">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-100 dark:bg-indigo-900/30 border border-indigo-200 dark:border-indigo-800 text-indigo-700 dark:text-indigo-300 font-bold text-xs uppercase tracking-wider mb-4">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Developer Knowledge Base</span>
            </div>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black font-outfit text-gray-900 dark:text-white tracking-tight">
              Frequently Asked Questions
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mt-3 text-sm sm:text-base leading-relaxed">
              Everything you need to know about publishing, monetization splits, payout timelines, and copyright protection on Spielcade.
            </p>
          </div>

          {/* Search and Category Filters */}
          <div className="flex flex-col sm:flex-row items-center gap-3">
            
            {/* Search Input */}
            <div className="relative w-full sm:flex-1">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search developer questions (e.g. payouts, Unity, copyright, iframe)..."
                value={faqSearch}
                onChange={(e) => setFaqSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-white dark:bg-[#111228] border border-gray-200 dark:border-white/10 rounded-2xl text-sm text-gray-900 dark:text-white focus:outline-none focus:border-[#6366F1] transition-colors"
              />
            </div>

            {/* Category Filter Chips */}
            <div className="flex items-center gap-1.5 shrink-0 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
              {['All', 'Publishing', 'Monetization', 'Technical', 'Legal'].map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setFaqCategoryFilter(cat)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                    faqCategoryFilter === cat
                      ? 'bg-[#6366F1] text-white shadow-md'
                      : 'bg-white dark:bg-[#111228] text-gray-600 dark:text-gray-400 border border-gray-200 dark:border-white/10 hover:bg-gray-50 dark:hover:bg-white/5'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

          </div>

          {/* Accordion List */}
          <div className="flex flex-col gap-3">
            {filteredFaqs.length === 0 ? (
              <div className="p-8 text-center bg-white dark:bg-[#111228] rounded-2xl border border-gray-200 dark:border-white/10 text-gray-500">
                No matching questions found for "{faqSearch}". Try clearing your search.
              </div>
            ) : (
              filteredFaqs.map((faq, idx) => {
                const isOpen = openFaqIndex === idx;
                return (
                  <div
                    key={idx}
                    className="bg-white dark:bg-[#111228] border border-gray-200 dark:border-white/10 rounded-2xl overflow-hidden transition-colors"
                  >
                    <button
                      type="button"
                      onClick={() => setOpenFaqIndex(isOpen ? null : idx)}
                      className="w-full p-5 sm:p-6 text-left flex items-center justify-between gap-4 hover:bg-gray-50/50 dark:hover:bg-white/5 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-xs px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wider bg-gray-100 dark:bg-white/5 text-gray-600 dark:text-gray-400 border border-gray-200 dark:border-white/5">
                          {faq.tag}
                        </span>
                        <h3 className="font-bold text-sm sm:text-base text-gray-900 dark:text-white">
                          {faq.q}
                        </h3>
                      </div>
                      <ChevronDown
                        className={`text-gray-400 shrink-0 transition-transform duration-200 ${
                          isOpen ? 'rotate-180 text-indigo-500' : ''
                        }`}
                        size={20}
                      />
                    </button>

                    {isOpen && (
                      <div className="px-5 pb-5 sm:px-6 sm:pb-6 text-sm text-gray-600 dark:text-gray-300 leading-relaxed border-t border-gray-100 dark:border-white/5 pt-4">
                        {faq.a}
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>

        </div>
      </section>

    </div>
  );
}
