"use client";

import { motion } from 'framer-motion';
import { Gamepad2, Twitter, Github, Youtube, Mail } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import NewsletterForm from './NewsletterForm';

export default function Footer() {
  const pathname = usePathname();
  if (pathname?.startsWith('/admin')) return null;

  return (
    <footer className="bg-background border-t border-black/10 dark:border-white/10 pt-16 pb-8">
      <div className="container mx-auto px-4 md:px-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">
          
          {/* Brand */}
          <div className="space-y-4">
            <Link href="/" aria-label="Spielcade Homepage" title="Go to Spielcade Homepage" className="flex items-center gap-3 shrink-0 group">
              <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-indigo-500/50 shadow-[0_0_15px_rgba(99,102,241,0.5)] bg-[#111228] flex items-center justify-center shrink-0">
                <img 
                  src="/logo.png" 
                  alt="Spielcade Logo" 
                  className="w-[120%] h-[120%] object-cover animate-[spin_10s_linear_infinite] group-hover:animate-[spin_3s_linear_infinite] transition-all" 
                />
              </div>
              <span className="font-extrabold text-2xl tracking-tight text-gray-900 dark:text-white">
                Spiel<span className="text-gray-600 dark:text-gray-300">cade</span>
              </span>
            </Link>
            <p className="text-sm text-black/60 dark:text-white/60 leading-relaxed max-w-xs">
              Your ultimate destination for free browser games. Play instantly, no downloads required. Join millions of players worldwide.
            </p>
            <div className="flex items-center gap-4 pt-2">
              {[Twitter, Github, Youtube].map((Icon, i) => (
                <motion.a 
                  key={i}
                  href="#"
                  aria-label={['Twitter', 'GitHub', 'YouTube'][i]}
                  title={['Twitter', 'GitHub', 'YouTube'][i]}
                  whileHover={{ y: -3 }}
                  className="w-10 h-10 rounded-full bg-black/5 dark:bg-white/5 flex items-center justify-center text-black/70 dark:text-white/70 hover:bg-primary/20 hover:text-primary transition-colors"
                >
                  <Icon className="w-4 h-4" />
                </motion.a>
              ))}
            </div>
          </div>

          {/* Links */}
          <div>
            <h3 className="font-semibold text-lg mb-6 text-black/90 dark:text-white/90">Platform</h3>
            <ul className="space-y-3">
              {[
                { name: 'All Games', path: '/games' },
                { name: 'Categories', path: '/categories' },
                { name: 'Leaderboard', path: '/leaderboard' },
                { name: 'Blog & News', path: '/blog' },
                { name: 'Developer Studio', path: '/studio' }
              ].map((link) => (
                <li key={link.name}>
                  <Link href={link.path} title={link.name} className="text-sm text-black/60 dark:text-white/60 hover:text-[#6366F1] transition-colors flex items-center gap-2 group">
                    <span className="w-1.5 h-1.5 rounded-full bg-black/20 dark:bg-white/20 group-hover:bg-[#6366F1] transition-colors" />
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="font-semibold text-lg mb-6 text-black/90 dark:text-white/90">Support</h3>
            <ul className="space-y-3">
              {[
                { name: 'Help Center', path: '/help' },
                { name: 'Terms of Service', path: '/terms' },
                { name: 'Privacy Policy', path: '/privacy' },
                { name: 'Cookie Policy', path: '/cookies' },
                { name: 'Contact Us', path: '/contact' }
              ].map((link) => (
                <li key={link.name}>
                  <Link href={link.path} title={link.name} className="text-sm text-black/60 dark:text-white/60 hover:text-[#6366F1] transition-colors flex items-center gap-2 group">
                    <span className="w-1.5 h-1.5 rounded-full bg-black/20 dark:bg-white/20 group-hover:bg-[#6366F1] transition-colors" />
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Newsletter */}
          <div>
            <h3 className="font-semibold text-lg mb-6 text-black/90 dark:text-white/90">Stay Updated</h3>
            <p className="text-sm text-black/60 dark:text-white/60 mb-4">
              Subscribe to our newsletter for the latest games and updates.
            </p>
            <NewsletterForm />
          </div>

        </div>

        {/* Category Links for Crawlability & Sitewide SEO */}
        <div className="pt-8 mb-8 border-t border-black/10 dark:border-white/10">
          <p className="text-xs font-bold uppercase tracking-wider text-black/50 dark:text-white/50 mb-3">
            Popular Categories & Genres
          </p>
          <div className="flex flex-wrap gap-x-6 gap-y-2 text-xs text-black/60 dark:text-white/60">
            <Link href="/categories/action-games" className="hover:text-[#6366F1] transition-colors">Action Games</Link>
            <Link href="/categories/puzzle-games" className="hover:text-[#6366F1] transition-colors">Puzzle Games</Link>
            <Link href="/categories/racing-games" className="hover:text-[#6366F1] transition-colors">Racing Games</Link>
            <Link href="/categories/arcade-games" className="hover:text-[#6366F1] transition-colors">Arcade Games</Link>
            <Link href="/categories/strategy-games" className="hover:text-[#6366F1] transition-colors">Strategy Games</Link>
            <Link href="/categories/board-games" className="hover:text-[#6366F1] transition-colors">Board Games</Link>
            <Link href="/categories/sports-games" className="hover:text-[#6366F1] transition-colors">Sports Games</Link>
            <Link href="/categories/adventure-games" className="hover:text-[#6366F1] transition-colors">Adventure Games</Link>
            <Link href="/games/tags/unblocked" className="hover:text-[#6366F1] transition-colors">Unblocked Games</Link>
            <Link href="/games/tags/multiplayer" className="hover:text-[#6366F1] transition-colors">Multiplayer Games</Link>
            <Link href="/popular" className="hover:text-[#6366F1] transition-colors">Top Played Games</Link>
            <Link href="/games/new" className="hover:text-[#6366F1] transition-colors">New HTML5 Games</Link>
          </div>
        </div>

        {/* Bottom */}
        <div className="pt-8 border-t border-black/10 dark:border-white/10 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-sm text-black/40 dark:text-white/40">
            © {new Date().getFullYear()} Spielcade Games. All rights reserved.
          </p>
          <div className="flex items-center gap-6 text-sm text-black/40 dark:text-white/40">
            <span className="hover:text-black dark:text-white transition-colors cursor-pointer">Status</span>
            <span className="hover:text-black dark:text-white transition-colors cursor-pointer">Security</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
