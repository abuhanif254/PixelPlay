import React from 'react';
import { Metadata } from 'next';
import Link from 'next/link';
import { 
  Gamepad2, 
  Coins, 
  Globe2, 
  Zap, 
  Trophy, 
  ShieldCheck, 
  ArrowRight, 
  Terminal, 
  Code2, 
  Layers, 
  BarChart3, 
  Sparkles, 
  Clock, 
  Cpu, 
  ChevronRight, 
  Smartphone, 
  Lock 
} from 'lucide-react';
import DeveloperStudioInteractive from '@/components/developer/DeveloperStudioInteractive';
import { FAQ_DATA } from '@/lib/developerFaqData';

/* =========================================================================
   METADATA & SEO TAGS
   ========================================================================= */
export const metadata: Metadata = {
  title: 'Spielcade Developer Studio | Publish & Monetize HTML5 Games (70% Rev-Share)',
  description: 'Join Spielcade Developer Studio. Publish your HTML5, WebGL, Unity, or Godot browser games to over 500,000 players worldwide. Earn up to 70% ad revenue share with our 2KB SDK and non-exclusive platform.',
  keywords: [
    'publish HTML5 game',
    'HTML5 game monetization',
    'browser game developer studio',
    'web game publisher',
    'Unity WebGL games publishing',
    'Godot web game portal',
    'game developer revenue share',
    'browser game SDK',
    'Poki developer alternative',
    'CrazyGames developer alternative',
    'web game ad network',
    'indie game distribution'
  ],
  alternates: {
    canonical: 'https://spielcade.com/developers',
  },
  openGraph: {
    title: 'Spielcade Developer Studio | Publish & Monetize HTML5 Games',
    description: 'Earn up to 70% ad revenue share publishing your HTML5 and WebGL browser games. Zero exclusivity, 24h QA turnaround, and instant global edge CDN hosting.',
    url: 'https://spielcade.com/developers',
    siteName: 'Spielcade',
    locale: 'en_US',
    type: 'website',
    images: [
      {
        url: 'https://spielcade.com/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'Spielcade Developer Studio - Publish HTML5 Games',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Spielcade Developer Studio | Publish & Monetize HTML5 Games',
    description: 'Reach millions of browser gamers. 70% developer split, 2KB lightweight SDK, and instant global distribution.',
    images: ['https://spielcade.com/og-image.jpg'],
    creator: '@Spielcade',
  },
};

/* =========================================================================
   STRUCTURED DATA (JSON-LD SCHEMAS)
   ========================================================================= */
const jsonLdData = {
  '@context': 'https://schema.org',
  '@graph': [
    // 1. WebApplication Schema
    {
      '@type': 'WebApplication',
      '@id': 'https://spielcade.com/developers#webapp',
      'name': 'Spielcade Developer Studio',
      'url': 'https://spielcade.com/developers',
      'applicationCategory': 'DeveloperApplication',
      'operatingSystem': 'All (Web Browser)',
      'description': 'Online publishing portal, SDK, and monetization dashboard for HTML5, WebGL, Unity, and Godot game creators.',
      'offers': {
        '@type': 'Offer',
        'price': '0',
        'priceCurrency': 'USD',
        'description': 'Free to join and publish with up to 70% developer revenue share.'
      },
      'provider': {
        '@type': 'Organization',
        'name': 'Spielcade',
        'url': 'https://spielcade.com'
      }
    },
    // 2. HowTo Schema
    {
      '@type': 'HowTo',
      '@id': 'https://spielcade.com/developers#howto',
      'name': 'How to Publish an HTML5 Game on Spielcade Developer Studio',
      'description': 'A step-by-step guide for developers to export, integrate the SDK, and publish web games for global monetization.',
      'step': [
        {
          '@type': 'HowToStep',
          'position': 1,
          'name': 'Create a Free Developer Studio Account',
          'text': 'Sign up on Spielcade and navigate to the Developer Studio to generate your Master API key.'
        },
        {
          '@type': 'HowToStep',
          'position': 2,
          'name': 'Build Your Game in Any Engine',
          'text': 'Export your project to HTML5 or WebGL from Unity, Godot, Phaser, Construct 3, GameMaker, or vanilla JavaScript.'
        },
        {
          '@type': 'HowToStep',
          'position': 3,
          'name': 'Embed the Lightweight 2KB SDK',
          'text': 'Include https://spielcade.com/spielcade-sdk.js in your HTML shell to enable gameReady signals, score submissions, and game over callbacks.'
        },
        {
          '@type': 'HowToStep',
          'position': 4,
          'name': 'Submit Game for QA Review & Monetization',
          'text': 'Submit your game URL or zip archive in the Developer Studio. Our team approves games within 24 hours to begin earning ad revenue.'
        }
      ]
    },
    // 3. FAQPage Schema
    {
      '@type': 'FAQPage',
      '@id': 'https://spielcade.com/developers#faq',
      'mainEntity': FAQ_DATA.map((item) => ({
        '@type': 'Question',
        'name': item.q,
        'acceptedAnswer': {
          '@type': 'Answer',
          'text': item.a
        }
      }))
    },
    // 4. BreadcrumbList Schema
    {
      '@type': 'BreadcrumbList',
      '@id': 'https://spielcade.com/developers#breadcrumb',
      'itemListElement': [
        {
          '@type': 'ListItem',
          'position': 1,
          'name': 'Home',
          'item': 'https://spielcade.com'
        },
        {
          '@type': 'ListItem',
          'position': 2,
          'name': 'Developer Studio',
          'item': 'https://spielcade.com/developers'
        }
      ]
    }
  ]
};

/* =========================================================================
   PAGE COMPONENT
   ========================================================================= */
export default function DevelopersPage() {
  return (
    <article className="min-h-screen bg-gray-50 dark:bg-[#05050F] text-gray-900 dark:text-white transition-colors">
      
      {/* Schema.org JSON-LD */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdData) }}
      />

      {/* ===================================================================
          HERO SECTION
          =================================================================== */}
      <section className="relative pt-32 pb-20 md:pt-40 md:pb-28 px-4 overflow-hidden border-b border-gray-200 dark:border-white/5">
        {/* Background glow effects */}
        <div className="absolute top-0 right-1/4 w-[600px] h-[600px] bg-indigo-500/10 dark:bg-indigo-500/20 rounded-full blur-[120px] pointer-events-none -translate-y-1/2" />
        <div className="absolute bottom-0 left-1/4 w-[500px] h-[500px] bg-purple-500/10 dark:bg-purple-500/15 rounded-full blur-[100px] pointer-events-none translate-y-1/2" />
        <div className="absolute inset-0 bg-[url('/noise.png')] opacity-[0.02] dark:opacity-[0.04] pointer-events-none" />

        <div className="container mx-auto max-w-6xl relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            
            {/* Left Column: Core Value Proposition */}
            <div className="lg:col-span-7 flex flex-col text-center lg:text-left">
              
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 font-bold text-xs uppercase tracking-wider mb-6 border border-indigo-200 dark:border-indigo-800 w-fit mx-auto lg:mx-0">
                <Terminal className="w-4 h-4 text-indigo-500" />
                <span>Spielcade Developer Studio V2</span>
              </div>

              <h1 className="text-4xl sm:text-5xl md:text-6xl font-black font-outfit leading-[1.1] mb-6 tracking-tight">
                Publish & Monetize Your Web Games with{' '}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-500 dark:from-indigo-400 dark:via-purple-400 dark:to-pink-400">
                  70% Revenue Share.
                </span>
              </h1>

              <p className="text-base sm:text-lg md:text-xl text-gray-600 dark:text-gray-300 mb-8 max-w-2xl mx-auto lg:mx-0 leading-relaxed font-normal">
                Reach over 500,000 passionate browser gamers worldwide. Zero exclusivity lock-in, 100% intellectual property ownership, and seamless multi-engine support for Unity, Godot, Phaser, Construct, and vanilla HTML5.
              </p>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row items-center gap-4 justify-center lg:justify-start">
                <Link 
                  href="/studio/submit" 
                  className="w-full sm:w-auto bg-[#6366F1] hover:bg-[#5457DF] text-white font-bold py-4 px-8 rounded-2xl transition-all shadow-[0_0_25px_rgba(99,102,241,0.4)] hover:shadow-[0_0_35px_rgba(99,102,241,0.6)] flex items-center justify-center gap-2 text-base hover:scale-[1.02] active:scale-[0.98]"
                >
                  <span>Submit Your Game Free</span>
                  <ArrowRight size={20} />
                </Link>

                <a 
                  href="#sdk-reference" 
                  className="w-full sm:w-auto bg-white dark:bg-[#111228] hover:bg-gray-100 dark:hover:bg-[#1B1D3D] text-gray-900 dark:text-white border border-gray-200 dark:border-white/10 font-bold py-4 px-8 rounded-2xl transition-all flex items-center justify-center text-base"
                >
                  Explore SDK & Docs
                </a>
              </div>

              {/* Trust highlights */}
              <div className="mt-10 pt-8 border-t border-gray-200 dark:border-white/10 flex flex-wrap items-center justify-center lg:justify-start gap-6 text-xs text-gray-500 dark:text-gray-400">
                <span className="flex items-center gap-1.5 font-semibold">
                  <ShieldCheck className="text-emerald-500 w-4 h-4" /> 100% IP Ownership
                </span>
                <span className="flex items-center gap-1.5 font-semibold">
                  <Coins className="text-amber-500 w-4 h-4" /> Up to 70% Ad Split
                </span>
                <span className="flex items-center gap-1.5 font-semibold">
                  <Zap className="text-indigo-500 w-4 h-4" /> &lt;24h QA Approval
                </span>
                <span className="flex items-center gap-1.5 font-semibold">
                  <Globe2 className="text-blue-500 w-4 h-4" /> Zero Exclusivity
                </span>
              </div>

            </div>

            {/* Right Column: Interactive Code & Terminal Mockup */}
            <div className="lg:col-span-5 relative mx-auto w-full max-w-md lg:max-w-none">
              <div className="relative rounded-3xl bg-gray-950 shadow-2xl overflow-hidden border border-gray-800 shadow-indigo-500/10">
                
                {/* Mockup Topbar */}
                <div className="h-11 bg-gray-900/90 border-b border-gray-800 flex items-center justify-between px-4">
                  <div className="flex gap-2">
                    <div className="w-3 h-3 rounded-full bg-red-500/80" />
                    <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
                    <div className="w-3 h-3 rounded-full bg-green-500/80" />
                  </div>
                  <div className="text-xs text-gray-400 font-mono">
                    spielcade-developer-bridge.js
                  </div>
                  <div className="w-6" />
                </div>

                {/* Mockup Code Body */}
                <div className="p-6 font-mono text-xs sm:text-sm text-gray-300 leading-relaxed bg-[#0A0B1A]">
                  <p className="text-gray-500">{'// 1. Initialized via Cloudflare Edge CDN'}</p>
                  <p className="text-indigo-400">&lt;script <span className="text-purple-300">src</span>=<span className="text-green-300">"https://spielcade.com/spielcade-sdk.js"</span>&gt;&lt;/script&gt;</p>
                  
                  <p className="text-gray-500 mt-4">{'// 2. Signal game assets ready'}</p>
                  <p className="text-blue-400">window.<span className="text-yellow-300">Spielcade</span>.<span className="text-indigo-300">gameReady</span>();</p>
                  
                  <p className="text-gray-500 mt-4">{'// 3. Post score & trigger ad rewards'}</p>
                  <p className="text-blue-400">window.<span className="text-yellow-300">Spielcade</span>.<span className="text-indigo-300">submitScore</span>(<span className="text-amber-300">4250</span>);</p>
                  <p className="text-blue-400">window.<span className="text-yellow-300">Spielcade</span>.<span className="text-indigo-300">gameOver</span>();</p>

                  <div className="mt-6 p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 flex items-center gap-3">
                    <Trophy className="w-5 h-5 text-yellow-400 shrink-0" />
                    <div>
                      <div className="font-bold text-xs">Verified 70% Revenue Share Active</div>
                      <div className="text-[11px] text-emerald-400/80">Leaderboards & Anti-Cheat Sync Complete</div>
                    </div>
                  </div>
                </div>

              </div>

              {/* Floating Stat Card */}
              <div className="absolute -bottom-6 -left-6 bg-white dark:bg-[#111228] p-4 rounded-2xl shadow-xl border border-gray-200 dark:border-white/10 hidden sm:flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-emerald-100 dark:bg-emerald-900/40 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
                  <Coins size={24} />
                </div>
                <div>
                  <div className="text-xs text-gray-500 dark:text-gray-400 font-bold uppercase tracking-wider">Creator Split</div>
                  <div className="text-xl font-extrabold text-gray-900 dark:text-white font-mono">Up to 70%</div>
                </div>
              </div>

            </div>

          </div>
        </div>
      </section>


      {/* ===================================================================
          SECTION 2: WHY DEVELOPERS CHOOSE SPIELCADE
          =================================================================== */}
      <section className="py-24 px-4 bg-white dark:bg-[#0B0C1E] border-b border-gray-200 dark:border-white/5 relative">
        <div className="container mx-auto max-w-6xl">
          
          <div className="text-center max-w-3xl mx-auto mb-16">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-100 dark:bg-indigo-900/30 border border-indigo-200 dark:border-indigo-800 text-indigo-700 dark:text-indigo-300 font-bold text-xs uppercase tracking-wider mb-4">
              <Sparkles className="w-3.5 h-3.5" />
              <span>The Creator-First Advantage</span>
            </div>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black font-outfit tracking-tight">
              Engineered for Independence and Sustainable Revenue
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mt-3 text-base sm:text-lg leading-relaxed">
              Unlike legacy web portals with restrictive exclusivity contracts and predatory 30% payouts, Spielcade was built from the ground up to empower independent game creators.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            
            {/* Pillar 1: Up to 70% Revenue Share */}
            <div className="bg-gray-50 dark:bg-[#111228] p-8 rounded-3xl border border-gray-200/80 dark:border-white/5 hover:border-indigo-500/30 transition-all flex flex-col gap-4">
              <div className="w-14 h-14 rounded-2xl bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
                <Coins size={28} />
              </div>
              <h3 className="text-xl font-bold font-outfit text-gray-900 dark:text-white">
                Industry-Leading 70% Split
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                Retain up to 70% of gross advertising revenue generated by your game sessions. We negotiate directly with premium programmatic SSPs and demand partners to maximize global eCPMs.
              </p>
            </div>

            {/* Pillar 2: 100% Non-Exclusive */}
            <div className="bg-gray-50 dark:bg-[#111228] p-8 rounded-3xl border border-gray-200/80 dark:border-white/5 hover:border-indigo-500/30 transition-all flex flex-col gap-4">
              <div className="w-14 h-14 rounded-2xl bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 dark:text-blue-400">
                <Globe2 size={28} />
              </div>
              <h3 className="text-xl font-bold font-outfit text-gray-900 dark:text-white">
                Zero Exclusivity Lock-In
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                Never sign away your freedom. Publish on Spielcade while simultaneously distributing on your own website, Poki, CrazyGames, Steam, itch.io, or Google Play.
              </p>
            </div>

            {/* Pillar 3: Real-Time Analytics */}
            <div className="bg-gray-50 dark:bg-[#111228] p-8 rounded-3xl border border-gray-200/80 dark:border-white/5 hover:border-indigo-500/30 transition-all flex flex-col gap-4">
              <div className="w-14 h-14 rounded-2xl bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center text-purple-600 dark:text-purple-400">
                <BarChart3 size={28} />
              </div>
              <h3 className="text-xl font-bold font-outfit text-gray-900 dark:text-white">
                Transparent Real-Time Stats
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                Track every gameplay session, ad impression, geographic source, and dollar earned with transparent real-time telemetry inside your Developer Studio dashboard.
              </p>
            </div>

            {/* Pillar 4: Rapid QA & Publishing */}
            <div className="bg-gray-50 dark:bg-[#111228] p-8 rounded-3xl border border-gray-200/80 dark:border-white/5 hover:border-indigo-500/30 transition-all flex flex-col gap-4">
              <div className="w-14 h-14 rounded-2xl bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center text-amber-600 dark:text-amber-400">
                <Clock size={28} />
              </div>
              <h3 className="text-xl font-bold font-outfit text-gray-900 dark:text-white">
                24-Hour Review Turnaround
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                No waiting weeks for corporate committees. Our dedicated QA engineers test and approve games in less than 24 hours so you can iterate quickly.
              </p>
            </div>

            {/* Pillar 5: Global Edge CDN Hosting */}
            <div className="bg-gray-50 dark:bg-[#111228] p-8 rounded-3xl border border-gray-200/80 dark:border-white/5 hover:border-indigo-500/30 transition-all flex flex-col gap-4">
              <div className="w-14 h-14 rounded-2xl bg-rose-100 dark:bg-rose-900/30 flex items-center justify-center text-rose-600 dark:text-rose-400">
                <Zap size={28} />
              </div>
              <h3 className="text-xl font-bold font-outfit text-gray-900 dark:text-white">
                Sub-30ms Global Edge CDN
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                Self-host your iframe, or let us host your zip builds across Cloudflare’s global edge network spanning 300+ cities for instant zero-latency loading.
              </p>
            </div>

            {/* Pillar 6: Hotlink Shielding & Anti-Theft */}
            <div className="bg-gray-50 dark:bg-[#111228] p-8 rounded-3xl border border-gray-200/80 dark:border-white/5 hover:border-indigo-500/30 transition-all flex flex-col gap-4">
              <div className="w-14 h-14 rounded-2xl bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
                <ShieldCheck size={28} />
              </div>
              <h3 className="text-xl font-bold font-outfit text-gray-900 dark:text-white">
                Domain Locking & IP Defense
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                Stop illegal scraping and pirate re-hosting. Our domain shielding prevents unauthorized sites from embedding your game assets without your permission.
              </p>
            </div>

          </div>

        </div>
      </section>


      {/* ===================================================================
          SECTION 3: HOW IT WORKS (4-STEP PUBLISHING WORKFLOW)
          =================================================================== */}
      <section className="py-24 px-4 border-b border-gray-200 dark:border-white/5 relative">
        <div className="container mx-auto max-w-6xl">
          
          <div className="text-center max-w-3xl mx-auto mb-16">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-100 dark:bg-indigo-900/30 border border-indigo-200 dark:border-indigo-800 text-indigo-700 dark:text-indigo-300 font-bold text-xs uppercase tracking-wider mb-4">
              <Layers className="w-3.5 h-3.5" />
              <span>Step-by-Step Publishing Pipeline</span>
            </div>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black font-outfit tracking-tight">
              How to Publish an HTML5 Game in 4 Steps
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mt-3 text-base sm:text-lg leading-relaxed">
              From your development machine to thousands of players in under 24 hours. Here is how our frictionless workflow works.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            
            {/* Step 1 */}
            <div className="bg-white dark:bg-[#111228] p-6 rounded-3xl border border-gray-200 dark:border-white/10 shadow-lg flex flex-col relative">
              <span className="w-10 h-10 rounded-2xl bg-indigo-600 text-white font-black text-lg flex items-center justify-center mb-6 shadow-md shadow-indigo-500/30">
                1
              </span>
              <h3 className="text-lg font-bold font-outfit mb-2 text-gray-900 dark:text-white">
                Create Free Account
              </h3>
              <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                Register on Spielcade and access your Developer Studio dashboard. Claim your Master API Key for secure SDK authentication and leaderboard tracking.
              </p>
            </div>

            {/* Step 2 */}
            <div className="bg-white dark:bg-[#111228] p-6 rounded-3xl border border-gray-200 dark:border-white/10 shadow-lg flex flex-col relative">
              <span className="w-10 h-10 rounded-2xl bg-purple-600 text-white font-black text-lg flex items-center justify-center mb-6 shadow-md shadow-purple-500/30">
                2
              </span>
              <h3 className="text-lg font-bold font-outfit mb-2 text-gray-900 dark:text-white">
                Build in Any Engine
              </h3>
              <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                Export to HTML5 or WebGL from Unity, Godot 4, Phaser 3, Construct 3, GameMaker, or your custom Canvas/WebGL engine with responsive dimensions.
              </p>
            </div>

            {/* Step 3 */}
            <div className="bg-white dark:bg-[#111228] p-6 rounded-3xl border border-gray-200 dark:border-white/10 shadow-lg flex flex-col relative">
              <span className="w-10 h-10 rounded-2xl bg-pink-600 text-white font-black text-lg flex items-center justify-center mb-6 shadow-md shadow-pink-500/30">
                3
              </span>
              <h3 className="text-lg font-bold font-outfit mb-2 text-gray-900 dark:text-white">
                Embed 2KB SDK
              </h3>
              <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                Add our lightweight script tag. Hook into <code className="font-mono text-xs">gameReady()</code>, <code className="font-mono text-xs">submitScore()</code>, and <code className="font-mono text-xs">gameOver()</code> using simple standard JavaScript.
              </p>
            </div>

            {/* Step 4 */}
            <div className="bg-white dark:bg-[#111228] p-6 rounded-3xl border border-gray-200 dark:border-white/10 shadow-lg flex flex-col relative">
              <span className="w-10 h-10 rounded-2xl bg-emerald-600 text-white font-black text-lg flex items-center justify-center mb-6 shadow-md shadow-emerald-500/30">
                4
              </span>
              <h3 className="text-lg font-bold font-outfit mb-2 text-gray-900 dark:text-white">
                Submit & Monetize
              </h3>
              <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                Enter your title, thumbnail, and HTTPS game URL. Our QA team approves it within 24 hours, placing your game in front of global players with automated ad share.
              </p>
            </div>

          </div>

        </div>
      </section>


      {/* ===================================================================
          SECTION 4: INTERACTIVE APPS (REVENUE, ENGINES, SDK, FAQS)
          =================================================================== */}
      <section className="py-24 px-4">
        <div className="container mx-auto max-w-6xl">
          <DeveloperStudioInteractive />
        </div>
      </section>


      {/* ===================================================================
          SECTION 5: TECHNICAL GUIDELINES & QUALITY BENCHMARKS
          =================================================================== */}
      <section className="py-24 px-4 bg-white dark:bg-[#0B0C1E] border-t border-b border-gray-200 dark:border-white/5 relative">
        <div className="container mx-auto max-w-6xl">
          
          <div className="text-center max-w-3xl mx-auto mb-16">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-100 dark:bg-indigo-900/30 border border-indigo-200 dark:border-indigo-800 text-indigo-700 dark:text-indigo-300 font-bold text-xs uppercase tracking-wider mb-4">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Technical Standards</span>
            </div>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black font-outfit tracking-tight">
              Quality Guidelines to Maximize Gameplay & Retention
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mt-3 text-base sm:text-lg leading-relaxed">
              Games meeting these benchmarks receive top algorithmic placement on the Spielcade homepage, category hero carousels, and the New Releases leaderboard.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            
            {/* Standard 1: Aspect Ratios */}
            <div className="bg-gray-50 dark:bg-[#111228] p-8 rounded-3xl border border-gray-200/80 dark:border-white/5 flex flex-col gap-4">
              <div className="w-12 h-12 rounded-xl bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold">
                16:9
              </div>
              <h3 className="text-xl font-bold font-outfit text-gray-900 dark:text-white">
                Responsive Dimensions
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                Design your game canvas to dynamically adapt to <strong>16:9 widescreen</strong>, <strong>9:16 vertical portrait</strong> (for smartphone browsers), or <strong>4:3 classic arcade</strong>. Spielcade’s Universal Player automatically scales your viewport without letterboxing.
              </p>
            </div>

            {/* Standard 2: Mobile Touch & Gamepad */}
            <div className="bg-gray-50 dark:bg-[#111228] p-8 rounded-3xl border border-gray-200/80 dark:border-white/5 flex flex-col gap-4">
              <div className="w-12 h-12 rounded-xl bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 flex items-center justify-center font-bold">
                <Smartphone size={24} />
              </div>
              <h3 className="text-xl font-bold font-outfit text-gray-900 dark:text-white">
                Mobile Touch Controls
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                Over 60% of modern web game traffic is mobile. Implement touch gestures or on-screen D-pads, or leverage Spielcade’s built-in virtual touch gamepad which translates mobile taps into standard keyboard events.
              </p>
            </div>

            {/* Standard 3: 60 FPS Performance */}
            <div className="bg-gray-50 dark:bg-[#111228] p-8 rounded-3xl border border-gray-200/80 dark:border-white/5 flex flex-col gap-4">
              <div className="w-12 h-12 rounded-xl bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold">
                60 FPS
              </div>
              <h3 className="text-xl font-bold font-outfit text-gray-900 dark:text-white">
                Smooth 60 FPS Target
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                Optimize texture atlases, minimize draw calls, and keep initial download bundles under 15 MB. Faster loading times directly correlate with higher player retention and superior eCPM ad rates.
              </p>
            </div>

          </div>

        </div>
      </section>


      {/* ===================================================================
          FINAL CTA SECTION
          =================================================================== */}
      <section className="py-24 px-4 relative overflow-hidden">
        <div className="container mx-auto max-w-5xl relative z-10">
          <div className="bg-gradient-to-br from-[#4F46E5] via-[#6366F1] to-[#8B5CF6] rounded-3xl p-10 sm:p-14 lg:p-16 text-center text-white shadow-2xl border border-white/10 relative overflow-hidden">
            
            <div className="relative z-10 flex flex-col items-center gap-6 max-w-3xl mx-auto">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 border border-white/20 text-white font-bold text-xs uppercase tracking-wider">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Join Over 1,200 Web Game Creators</span>
              </div>

              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black font-outfit leading-tight">
                Ready to Launch Your Game on Spielcade?
              </h2>

              <p className="text-white/90 text-base sm:text-lg leading-relaxed">
                Sign up for free in 60 seconds, submit your HTML5 or WebGL game, and start earning transparent 70% ad revenue from day one.
              </p>

              <div className="flex flex-col sm:flex-row items-center gap-4 mt-4 w-full sm:w-auto">
                <Link
                  href="/studio/submit"
                  className="w-full sm:w-auto bg-white text-[#4F46E5] hover:bg-gray-100 font-extrabold py-4 px-10 rounded-2xl transition-all shadow-xl text-base flex items-center justify-center gap-2 hover:scale-105 active:scale-95"
                >
                  <span>Submit to Developer Studio</span>
                  <ArrowRight size={20} />
                </Link>

                <Link
                  href="/studio"
                  className="w-full sm:w-auto bg-white/15 hover:bg-white/25 text-white border border-white/20 font-bold py-4 px-8 rounded-2xl transition-all text-base flex items-center justify-center"
                >
                  Open Studio Dashboard
                </Link>
              </div>

              <p className="text-xs text-white/70 mt-2">
                No credit card required. Zero exclusivity lock-in. Full IP rights retained.
              </p>
            </div>

          </div>
        </div>
      </section>

    </article>
  );
}
