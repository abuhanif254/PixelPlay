"use client";

import { motion } from 'framer-motion';
import { Gamepad2, Twitter, Github, Youtube, Mail } from 'lucide-react';
import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="bg-background border-t border-black/10 dark:border-white/10 pt-16 pb-8">
      <div className="container mx-auto px-4 md:px-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">
          
          {/* Brand */}
          <div className="space-y-4">
            <Link href="/" className="flex items-center gap-2">
              <Gamepad2 className="w-8 h-8 text-primary" />
              <span className="font-bold text-2xl tracking-tight">PixelPlay</span>
            </Link>
            <p className="text-sm text-black/60 dark:text-white/60 leading-relaxed max-w-xs">
              Your ultimate destination for free browser games. Play instantly, no downloads required. Join millions of players worldwide.
            </p>
            <div className="flex items-center gap-4 pt-2">
              {[Twitter, Github, Youtube].map((Icon, i) => (
                <motion.a 
                  key={i}
                  href="#"
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
              {['Browse Games', 'New Releases', 'Top Rated', 'Categories', 'Developers'].map((link) => (
                <li key={link}>
                  <Link href="#" className="text-sm text-black/60 dark:text-white/60 hover:text-primary transition-colors flex items-center gap-2 group">
                    <span className="w-1.5 h-1.5 rounded-full bg-black/20 dark:bg-white/20 group-hover:bg-primary transition-colors" />
                    {link}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="font-semibold text-lg mb-6 text-black/90 dark:text-white/90">Support</h3>
            <ul className="space-y-3">
              {['Help Center', 'Terms of Service', 'Privacy Policy', 'Cookie Policy', 'Contact Us'].map((link) => (
                <li key={link}>
                  <Link href="#" className="text-sm text-black/60 dark:text-white/60 hover:text-primary transition-colors flex items-center gap-2 group">
                    <span className="w-1.5 h-1.5 rounded-full bg-black/20 dark:bg-white/20 group-hover:bg-primary transition-colors" />
                    {link}
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
            <form className="space-y-3" onSubmit={(e) => e.preventDefault()}>
              <div className="relative">
                <Mail className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-black/40 dark:text-white/40" />
                <input 
                  type="email" 
                  placeholder="Enter your email" 
                  className="w-full bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 rounded-lg py-2.5 pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                  required
                />
              </div>
              <motion.button 
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-medium rounded-lg py-2.5 text-sm transition-colors shadow-lg shadow-primary/20"
              >
                Subscribe Now
              </motion.button>
            </form>
          </div>

        </div>

        {/* Bottom */}
        <div className="pt-8 border-t border-black/10 dark:border-white/10 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-sm text-black/40 dark:text-white/40">
            © {new Date().getFullYear()} PixelPlay Games. All rights reserved.
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
