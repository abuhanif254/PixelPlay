'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Gamepad2, Twitter, Github, Youtube, ShieldCheck, Zap, Globe, Sparkles } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import NewsletterForm from './NewsletterForm';

export default function Footer() {
  const pathname = usePathname();
  if (pathname?.startsWith('/admin')) return null;

  return (
    <footer className="bg-slate-50 dark:bg-[#070818] border-t border-slate-200/80 dark:border-white/10 pt-16 pb-12 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Top 4-Column Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-10 lg:gap-8 mb-14">
          
          {/* Col 1: Brand & Status (4 cols) */}
          <div className="lg:col-span-4 space-y-4">
            <Link href="/" aria-label="Spielcade Homepage" title="Go to Spielcade Homepage" className="flex items-center gap-2.5 shrink-0 group">
              <div className="w-9 h-9 rounded-full overflow-hidden border-2 border-indigo-500/50 shadow-[0_0_12px_rgba(99,102,241,0.4)] bg-[#111228] flex items-center justify-center shrink-0">
                <img 
                  src="/logo.png" 
                  alt="Spielcade Logo" 
                  className="w-[120%] h-[120%] object-cover animate-[spin_12s_linear_infinite] group-hover:animate-[spin_3s_linear_infinite] transition-all" 
                />
              </div>
              <span className="font-extrabold text-2xl tracking-tight text-slate-900 dark:text-white">
                Spiel<span className="text-indigo-600 dark:text-indigo-400">cade</span>
              </span>
            </Link>
            
            <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed max-w-sm">
              The premier web gaming portal. Play over 17,000 free online HTML5 games instantly with zero downloads. Built for gamers, powered by creators.
            </p>

            {/* Platform Status Badge */}
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs font-semibold">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <span>All Systems Operational • 99.9% Uptime</span>
            </div>

            {/* Social Icons */}
            <div className="flex items-center gap-3 pt-2">
              {[
                { Icon: Twitter, label: 'Twitter', href: 'https://twitter.com' },
                { Icon: Github, label: 'GitHub', href: 'https://github.com' },
                { Icon: Youtube, label: 'YouTube', href: 'https://youtube.com' }
              ].map(({ Icon, label, href }) => (
                <motion.a 
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={label}
                  title={label}
                  whileHover={{ y: -2, scale: 1.05 }}
                  className="w-9 h-9 rounded-full bg-slate-200/70 dark:bg-white/5 flex items-center justify-center text-slate-600 dark:text-slate-400 hover:bg-indigo-600 hover:text-white dark:hover:bg-indigo-600 dark:hover:text-white transition-all shadow-sm"
                >
                  <Icon className="w-4 h-4" />
                </motion.a>
              ))}
            </div>
          </div>

          {/* Col 2: Platform Links (2 cols) */}
          <div className="lg:col-span-2">
            <h3 className="font-bold text-sm uppercase tracking-wider text-slate-900 dark:text-white mb-4">
              Platform
            </h3>
            <ul className="space-y-2.5">
              {[
                { name: 'All Games', path: '/games' },
                { name: 'Categories', path: '/categories' },
                { name: 'New Releases', path: '/games/new' },
                { name: 'Popular Hits', path: '/popular' },
                { name: 'Leaderboard', path: '/leaderboard' },
                { name: 'Developer Studio', path: '/studio' }
              ].map((link) => (
                <li key={link.name}>
                  <Link 
                    href={link.path} 
                    title={link.name} 
                    className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-white transition-colors flex items-center gap-2 group"
                  >
                    <span className="w-1 h-1 rounded-full bg-slate-400 dark:bg-slate-600 group-hover:bg-indigo-600 transition-colors" />
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Col 3: Support & Legal (2 cols) */}
          <div className="lg:col-span-2">
            <h3 className="font-bold text-sm uppercase tracking-wider text-slate-900 dark:text-white mb-4">
              Support
            </h3>
            <ul className="space-y-2.5">
              {[
                { name: 'Help Center', path: '/help' },
                { name: 'Game Guides', path: '/blog' },
                { name: 'Terms of Service', path: '/terms' },
                { name: 'Privacy Policy', path: '/privacy' },
                { name: 'Cookie Settings', path: '/cookies' },
                { name: 'Contact Us', path: '/contact' }
              ].map((link) => (
                <li key={link.name}>
                  <Link 
                    href={link.path} 
                    title={link.name} 
                    className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-white transition-colors flex items-center gap-2 group"
                  >
                    <span className="w-1 h-1 rounded-full bg-slate-400 dark:bg-slate-600 group-hover:bg-indigo-600 transition-colors" />
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Col 4: Newsletter & Trust Badges (4 cols) */}
          <div className="lg:col-span-4">
            <h3 className="font-bold text-sm uppercase tracking-wider text-slate-900 dark:text-white mb-4">
              Stay Updated
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mb-4 leading-relaxed">
              Get weekly drops of trending unblocked web games and creator insights.
            </p>
            <div className="mb-6">
              <NewsletterForm />
            </div>

            {/* Trust Badges */}
            <div className="flex flex-wrap gap-2 pt-2">
              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-200/60 dark:bg-white/5 text-slate-700 dark:text-slate-300 text-[11px] font-semibold">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
                <span>SSL Encrypted</span>
              </div>
              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-200/60 dark:bg-white/5 text-slate-700 dark:text-slate-300 text-[11px] font-semibold">
                <Zap className="w-3.5 h-3.5 text-amber-500" />
                <span>Instant WebGL</span>
              </div>
              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-200/60 dark:bg-white/5 text-slate-700 dark:text-slate-300 text-[11px] font-semibold">
                <Globe className="w-3.5 h-3.5 text-blue-500" />
                <span>Global Edge CDN</span>
              </div>
            </div>
          </div>

        </div>

        {/* Structured Category Hubs Directory for Google Crawlability & User Discovery */}
        <div className="pt-8 mb-8 border-t border-slate-200 dark:border-white/10">
          <p className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-3">
            Popular Categories & Cluster Hubs
          </p>
          <div className="flex flex-wrap gap-2">
            {[
              { name: 'Car Games', path: '/categories/car-games' },
              { name: 'Zombie Games', path: '/categories/zombie-games' },
              { name: '2 Player Games', path: '/categories/2-player-games' },
              { name: 'Action Games', path: '/categories/action-games' },
              { name: 'Puzzle Games', path: '/categories/puzzle-games' },
              { name: 'Racing Games', path: '/categories/racing-games' },
              { name: 'Shooting Games', path: '/categories/shooting-games' },
              { name: 'Arcade Games', path: '/categories/arcade-games' },
              { name: 'Strategy Games', path: '/categories/strategy-games' },
              { name: 'Board Games', path: '/categories/board-games' },
              { name: 'Sports Games', path: '/categories/sports-games' },
              { name: 'Adventure Games', path: '/categories/adventure-games' },
              { name: 'Stickman Games', path: '/categories/stickman-games' },
              { name: 'Unblocked Games', path: '/categories/unblocked-games' },
              { name: 'Runner Games', path: '/categories/runner-games' },
              { name: 'Escape Games', path: '/categories/escape-games' },
            ].map(cat => (
              <Link 
                key={cat.name} 
                href={cat.path} 
                className="px-3 py-1 rounded-lg bg-white dark:bg-white/5 border border-slate-200 dark:border-white/5 text-slate-700 dark:text-slate-300 text-xs font-medium hover:border-indigo-500/50 hover:text-indigo-600 dark:hover:text-white transition-colors"
              >
                {cat.name}
              </Link>
            ))}
          </div>
        </div>

        {/* Bottom Bar: Copyright & Compliance */}
        <div className="pt-8 border-t border-slate-200 dark:border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500 dark:text-slate-400">
          <p>
            © {new Date().getFullYear()} Spielcade Platform. All games are the property of their respective creators.
          </p>
          <div className="flex items-center gap-6">
            <Link href="/terms" className="hover:text-slate-900 dark:hover:text-white transition-colors">Terms of Use</Link>
            <Link href="/privacy" className="hover:text-slate-900 dark:hover:text-white transition-colors">Privacy Policy</Link>
            <Link href="/cookies" className="hover:text-slate-900 dark:hover:text-white transition-colors">Cookie Policy</Link>
          </div>
        </div>

      </div>
    </footer>
  );
}
