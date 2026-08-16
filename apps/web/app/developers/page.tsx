import { Metadata } from 'next';
import Link from 'next/link';
import { Code2, Globe2, Coins, Zap, Trophy, ShieldCheck, ArrowRight, Terminal } from 'lucide-react';
import { motion } from 'framer-motion';

export const metadata: Metadata = {
  title: 'Publish Your Game | Spielcade for Developers',
  description: 'Reach millions of players worldwide. Publish your HTML5 or WebGL game on Spielcade and earn industry-leading revenue share through our premium ad network.',
  alternates: {
    canonical: 'https://spielcade.com/developers',
  },
  openGraph: {
    title: 'Publish Your Game | Spielcade for Developers',
    description: 'Reach millions of players worldwide and earn revenue.',
    url: 'https://spielcade.com/developers',
    siteName: 'Spielcade',
    locale: 'en_US',
    type: 'website',
  },
};

export default function DevelopersPage() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#05050F] transition-colors">
      
      {/* Hero Section */}
      <section className="relative pt-32 pb-20 md:pt-40 md:pb-32 px-4 overflow-hidden">
        {/* Background Effects */}
        <div className="absolute inset-0 bg-[#0A0A1B] hidden dark:block" />
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-50 to-white dark:from-[#0A0A1B] dark:to-[#111228]" />
        <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-indigo-500/10 dark:bg-indigo-500/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3 pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-blue-500/10 dark:bg-blue-500/20 rounded-full blur-3xl translate-y-1/3 -translate-x-1/3 pointer-events-none" />
        <div className="absolute inset-0 bg-[url('/noise.png')] opacity-[0.03] dark:opacity-[0.05] mix-blend-overlay pointer-events-none" />

        <div className="container mx-auto max-w-6xl relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-8 items-center">
            
            {/* Left Content */}
            <div className="text-center lg:text-left">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 font-medium text-sm mb-6 border border-indigo-200 dark:border-indigo-800">
                <Terminal className="w-4 h-4" />
                <span>Spielcade Developer Portal V2</span>
              </div>
              <h1 className="text-5xl md:text-7xl font-black font-outfit text-gray-900 dark:text-white leading-[1.1] mb-6 tracking-tight">
                Your Games.<br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-blue-500 dark:from-indigo-400 dark:to-blue-400">
                  Global Audience.
                </span>
              </h1>
              <p className="text-lg md:text-xl text-gray-600 dark:text-gray-400 mb-8 max-w-2xl mx-auto lg:mx-0 leading-relaxed">
                Publish your HTML5 or WebGL game on Spielcade and instantly reach millions of highly engaged players. Earn industry-leading revenue share through our premium, non-intrusive ad network.
              </p>
              
              <div className="flex flex-col sm:flex-row items-center gap-4 justify-center lg:justify-start">
                <Link 
                  href="/studio/submit" 
                  className="w-full sm:w-auto bg-[#6366F1] hover:bg-[#5457DF] text-white font-bold py-4 px-8 rounded-xl transition-all shadow-[0_0_20px_rgba(99,102,241,0.3)] hover:shadow-[0_0_30px_rgba(99,102,241,0.5)] flex items-center justify-center gap-2"
                >
                  <span>Submit Your Game</span>
                  <ArrowRight size={20} />
                </Link>
                <Link 
                  href="/studio/docs" 
                  className="w-full sm:w-auto bg-white dark:bg-[#1A1C36] hover:bg-gray-50 dark:hover:bg-[#232649] text-gray-900 dark:text-white border border-gray-200 dark:border-white/10 font-bold py-4 px-8 rounded-xl transition-all flex items-center justify-center"
                >
                  Read the Docs
                </Link>
              </div>
            </div>

            {/* Right Interactive Mockup */}
            <div className="relative mx-auto w-full max-w-lg lg:max-w-none">
              <div className="relative rounded-2xl bg-gray-900 shadow-2xl overflow-hidden border border-gray-800 aspect-[4/3] group">
                {/* Mockup Header */}
                <div className="absolute top-0 inset-x-0 h-10 bg-gray-800/80 backdrop-blur border-b border-gray-700 flex items-center px-4 gap-2 z-10">
                  <div className="flex gap-1.5">
                    <div className="w-3 h-3 rounded-full bg-red-500" />
                    <div className="w-3 h-3 rounded-full bg-yellow-500" />
                    <div className="w-3 h-3 rounded-full bg-green-500" />
                  </div>
                  <div className="mx-auto bg-gray-900 rounded-md px-3 py-1 text-xs text-gray-400 font-mono">
                    spielcade-dev-dashboard
                  </div>
                </div>
                {/* Mockup Body */}
                <div className="absolute inset-0 pt-10 bg-[#0A0A1B] p-6 font-mono text-sm text-green-400">
                  <p className="text-gray-500 mb-2">{'// Initializing Spielcade SDK'}</p>
                  <p>{'>'} npm install @spielcade/sdk</p>
                  <p className="text-gray-400 mb-4">added 1 package, and audited 2 packages in 3s</p>
                  
                  <p className="text-gray-500 mb-2">{'// Unlock an achievement'}</p>
                  <p className="text-blue-400">await <span className="text-yellow-300">Spielcade</span>.<span className="text-yellow-300">achievements</span>.<span className="text-purple-400">unlock</span>(</p>
                  <p className="pl-4 text-green-300">"first_boss_defeated"</p>
                  <p className="text-blue-400">);</p>
                  
                  <div className="mt-8 p-4 bg-green-500/10 border border-green-500/20 rounded-lg flex items-center gap-3 animate-pulse">
                    <Trophy className="text-yellow-500 w-5 h-5" />
                    <span className="text-green-300">Achievement Unlocked logic verified!</span>
                  </div>
                </div>
              </div>

              {/* Floating Stat Cards */}
              <div className="absolute -bottom-6 -left-6 bg-white dark:bg-[#111228] p-4 rounded-xl shadow-xl border border-gray-200 dark:border-white/10 flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center text-green-600 dark:text-green-400">
                  <Coins size={24} />
                </div>
                <div>
                  <div className="text-sm text-gray-500 dark:text-gray-400 font-medium">Developer Split</div>
                  <div className="text-xl font-bold text-gray-900 dark:text-white">Up to 70%</div>
                </div>
              </div>
              
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-24 bg-white dark:bg-[#111228] relative">
        <div className="container mx-auto px-4 md:px-6 max-w-6xl">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl md:text-5xl font-black font-outfit text-gray-900 dark:text-white mb-6">
              Everything you need to succeed.
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-400">
              We provide the tools, infrastructure, and audience. You focus on making great games.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            
            <div className="bg-gray-50 dark:bg-[#0A0A1B] p-8 rounded-3xl border border-gray-100 dark:border-white/5 hover:-translate-y-1 transition-transform">
              <div className="w-14 h-14 rounded-2xl bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 dark:text-blue-400 mb-6">
                <Globe2 size={28} />
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">Instant Global Audience</h3>
              <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                Tap into our existing user base. We feature top-quality new releases on our homepage and through our newsletter to jumpstart your player count.
              </p>
            </div>

            <div className="bg-gray-50 dark:bg-[#0A0A1B] p-8 rounded-3xl border border-gray-100 dark:border-white/5 hover:-translate-y-1 transition-transform">
              <div className="w-14 h-14 rounded-2xl bg-green-100 dark:bg-green-900/30 flex items-center justify-center text-green-600 dark:text-green-400 mb-6">
                <Coins size={28} />
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">Premium Monetization</h3>
              <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                We handle the ad network. You get paid. Our 5-second unskippable pre-roll ads generate high CPMs without ruining the player experience.
              </p>
            </div>

            <div className="bg-gray-50 dark:bg-[#0A0A1B] p-8 rounded-3xl border border-gray-100 dark:border-white/5 hover:-translate-y-1 transition-transform">
              <div className="w-14 h-14 rounded-2xl bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center text-purple-600 dark:text-purple-400 mb-6">
                <Trophy size={28} />
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">Achievements API</h3>
              <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                Increase player retention by integrating with our Achievements API. Let players showcase their trophies directly on their Spielcade profiles.
              </p>
            </div>

            <div className="bg-gray-50 dark:bg-[#0A0A1B] p-8 rounded-3xl border border-gray-100 dark:border-white/5 hover:-translate-y-1 transition-transform">
              <div className="w-14 h-14 rounded-2xl bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center text-amber-600 dark:text-amber-400 mb-6">
                <Zap size={28} />
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">Lightning Fast Hosting</h3>
              <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                Upload your game files directly to us, or host them yourself via iframe. We serve game assets via a global Edge CDN for zero-latency loading.
              </p>
            </div>

            <div className="bg-gray-50 dark:bg-[#0A0A1B] p-8 rounded-3xl border border-gray-100 dark:border-white/5 hover:-translate-y-1 transition-transform">
              <div className="w-14 h-14 rounded-2xl bg-rose-100 dark:bg-rose-900/30 flex items-center justify-center text-rose-600 dark:text-rose-400 mb-6">
                <Code2 size={28} />
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">Engine Agnostic</h3>
              <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                Whether you use Unity, Godot, Construct, GameMaker, Phaser, or raw HTML5/Canvas, if it runs in a browser, it runs on Spielcade.
              </p>
            </div>

            <div className="bg-gray-50 dark:bg-[#0A0A1B] p-8 rounded-3xl border border-gray-100 dark:border-white/5 hover:-translate-y-1 transition-transform">
              <div className="w-14 h-14 rounded-2xl bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center text-indigo-600 dark:text-indigo-400 mb-6">
                <ShieldCheck size={28} />
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">IP Protection</h3>
              <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                You retain 100% ownership of your IP. We implement domain-locking and hotlink protection to prevent unauthorized sites from stealing your game.
              </p>
            </div>

          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 relative overflow-hidden">
        <div className="container mx-auto px-4 md:px-6 max-w-5xl relative z-10">
          <div className="bg-gradient-to-br from-[#6366F1] to-[#8B5CF6] rounded-3xl p-10 md:p-16 text-center text-white shadow-2xl border border-white/10">
            <h2 className="text-4xl md:text-5xl font-black font-outfit mb-6">
              Ready to launch?
            </h2>
            <p className="text-xl text-white/90 max-w-2xl mx-auto mb-10">
              Join hundreds of developers already monetizing their browser games on Spielcade. Submitting your game takes less than 5 minutes.
            </p>
            <Link 
              href="/studio/submit" 
              className="inline-flex items-center gap-2 bg-white text-[#6366F1] font-bold py-4 px-10 rounded-xl hover:bg-gray-50 transition-colors shadow-lg hover:shadow-xl text-lg"
            >
              <span>Submit to Portal</span>
              <ArrowRight size={20} />
            </Link>
          </div>
        </div>
      </section>

    </div>
  );
}
