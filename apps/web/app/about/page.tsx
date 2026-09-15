import React from 'react';
import { Metadata } from 'next';
import Link from 'next/link';
import { 
  Gamepad2, 
  Sparkles, 
  Zap, 
  Globe2, 
  ShieldCheck, 
  Code2, 
  Github, 
  Linkedin, 
  Facebook, 
  MapPin, 
  ArrowRight,
  HeartHandshake,
  Cpu
} from 'lucide-react';

export const runtime = 'edge';
export const revalidate = 86400; // Cache for 24 hours

export const metadata: Metadata = {
  title: 'About Spielcade | Founder & Platform Vision',
  description: 'Learn about Spielcade, the high-performance instant browser gaming portal founded and engineered by MD Abu Hanif Mia. Play 17,000+ HTML5 games with zero installation.',
  keywords: [
    'About Spielcade',
    'MD Abu Hanif Mia',
    'PixelPlay',
    'browser games platform',
    'free online games developer',
    'HTML5 web games',
    'indie game portal'
  ],
  alternates: {
    canonical: 'https://spielcade.com/about',
  },
  openGraph: {
    title: 'About Spielcade | Founder & Platform Vision',
    description: 'Learn about Spielcade, the high-performance instant browser gaming portal founded and engineered by MD Abu Hanif Mia.',
    url: 'https://spielcade.com/about',
    siteName: 'Spielcade',
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'About Spielcade | Founder & Platform Vision',
    description: 'Learn about Spielcade, the high-performance instant browser gaming portal founded and engineered by MD Abu Hanif Mia.',
  },
};

export default function AboutPage() {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Organization',
        '@id': 'https://spielcade.com/#organization',
        'name': 'Spielcade',
        'url': 'https://spielcade.com',
        'logo': 'https://spielcade.com/logo.png',
        'founder': {
          '@type': 'Person',
          'name': 'MD Abu Hanif Mia',
          'jobTitle': 'Founder & Lead Developer',
          'url': 'https://github.com/abuhanif254',
          'image': 'https://ik.imagekit.io/ubwpdqyav/my_photo-removebg-preview.png?updatedAt=1776774813574',
          'address': {
            '@type': 'PostalAddress',
            'streetAddress': '2300 Kishoreganj Sadar',
            'addressLocality': 'Dhaka',
            'addressCountry': 'Bangladesh'
          },
          'sameAs': [
            'https://github.com/abuhanif254',
            'https://www.linkedin.com/in/md-abu-hanif-mia',
            'https://www.facebook.com/bitulla'
          ]
        }
      },
      {
        '@type': 'AboutPage',
        '@id': 'https://spielcade.com/about#webpage',
        'url': 'https://spielcade.com/about',
        'name': 'About Spielcade',
        'description': 'Mission, engineering principles, and founder identity behind Spielcade.'
      }
    ]
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#070818] text-slate-900 dark:text-slate-100 transition-colors py-12 px-4 sm:px-6 lg:px-8">
      {/* Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div className="max-w-6xl mx-auto space-y-16">
        
        {/* Breadcrumb Navigation */}
        <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-xs sm:text-sm text-slate-500 font-medium">
          <Link href="/" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">Home</Link>
          <span>›</span>
          <span className="text-indigo-600 dark:text-indigo-400">About</span>
        </nav>

        {/* 1. Hero Section */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-900 via-indigo-950 to-slate-950 p-8 sm:p-12 lg:p-16 border border-indigo-500/20 shadow-2xl">
          <div className="absolute top-0 right-0 w-[450px] h-[450px] bg-indigo-500/10 rounded-full blur-[120px] pointer-events-none" />
          <div className="relative z-10 max-w-3xl space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 border border-indigo-500/30 text-indigo-300 text-xs font-bold tracking-wider uppercase">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Next-Gen Web Entertainment</span>
            </div>
            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black font-outfit text-white tracking-tight leading-tight">
              Reinventing Instant Gaming for the Modern Web
            </h1>
            <p className="text-slate-300 text-base sm:text-lg leading-relaxed font-normal">
              Spielcade was conceived with a single, uncompromising vision: to bring high-framerate, frictionless browser entertainment to every screen on Earth with zero downloads, zero paywalls, and ultra-low latency.
            </p>
          </div>
        </div>

        {/* 2. Platform Core Pillars */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
          <div className="bg-white dark:bg-[#0f1026] p-8 rounded-2xl border border-slate-200/80 dark:border-white/5 shadow-sm hover:shadow-md transition-shadow space-y-4">
            <div className="w-12 h-12 rounded-xl bg-indigo-500/10 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
              <Zap className="w-6 h-6" />
            </div>
            <h2 className="text-xl font-bold font-outfit text-slate-900 dark:text-white">Zero Download Latency</h2>
            <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
              Every title executes natively in the browser via HTML5 Canvas, WebGL, and WebAssembly. No 50GB patches, no waiting—just instant play.
            </p>
          </div>

          <div className="bg-white dark:bg-[#0f1026] p-8 rounded-2xl border border-slate-200/80 dark:border-white/5 shadow-sm hover:shadow-md transition-shadow space-y-4">
            <div className="w-12 h-12 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
              <Globe2 className="w-6 h-6" />
            </div>
            <h2 className="text-xl font-bold font-outfit text-slate-900 dark:text-white">Global Edge Network</h2>
            <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
              Built on Cloudflare’s worldwide edge CDN and low-latency PostgreSQL clustering, delivering sub-100ms time-to-interactive in over 200 countries.
            </p>
          </div>

          <div className="bg-white dark:bg-[#0f1026] p-8 rounded-2xl border border-slate-200/80 dark:border-white/5 shadow-sm hover:shadow-md transition-shadow space-y-4">
            <div className="w-12 h-12 rounded-xl bg-purple-500/10 flex items-center justify-center text-purple-600 dark:text-purple-400">
              <HeartHandshake className="w-6 h-6" />
            </div>
            <h2 className="text-xl font-bold font-outfit text-slate-900 dark:text-white">Empowering Creators</h2>
            <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
              Independent indie developers can upload HTML5 zip bundles directly to Spielcade Studio, reach millions of daily gamers, and earn fair ad revenue.
            </p>
          </div>
        </div>

        {/* 3. Dedicated Developer Identity Section */}
        <section aria-labelledby="developer-identity-heading" className="bg-white dark:bg-[#0c0d20] rounded-3xl border border-indigo-500/30 p-8 sm:p-12 lg:p-14 shadow-xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-80 h-80 bg-indigo-600/10 rounded-full blur-[100px] pointer-events-none" />
          
          <div className="flex flex-col lg:flex-row items-center gap-10 lg:gap-14 relative z-10">
            {/* Developer Portrait */}
            <div className="relative shrink-0">
              <div className="w-48 h-48 sm:w-56 sm:h-56 rounded-3xl overflow-hidden bg-gradient-to-b from-indigo-500/20 to-purple-600/30 border-4 border-indigo-500/40 shadow-2xl flex items-end justify-center p-1">
                <img
                  src="https://ik.imagekit.io/ubwpdqyav/my_photo-removebg-preview.png?updatedAt=1776774813574"
                  alt="MD Abu Hanif Mia - Founder and Developer"
                  className="w-full h-full object-cover object-top hover:scale-105 transition-transform duration-300"
                  loading="lazy"
                />
              </div>
              <div className="absolute -bottom-3 -right-3 px-3 py-1.5 rounded-full bg-emerald-500 text-white font-bold text-xs shadow-lg flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-white animate-pulse" />
                Active Architect
              </div>
            </div>

            {/* Developer Info */}
            <div className="flex-1 text-center lg:text-left space-y-4">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 dark:bg-indigo-900/30 border border-indigo-200 dark:border-indigo-800/50 text-indigo-600 dark:text-indigo-400 text-xs font-bold uppercase tracking-wider">
                <Code2 className="w-3.5 h-3.5" />
                <span>Founder & Lead Developer</span>
              </div>
              
              <h2 id="developer-identity-heading" className="text-3xl sm:text-4xl font-extrabold font-outfit text-slate-900 dark:text-white">
                MD Abu Hanif Mia
              </h2>

              <div className="flex flex-wrap items-center justify-center lg:justify-start gap-2 text-sm text-slate-500 dark:text-slate-400">
                <MapPin className="w-4 h-4 text-rose-500 shrink-0" />
                <span>2300 Kishoreganj Sadar, Dhaka, Bangladesh</span>
              </div>

              <p className="text-slate-600 dark:text-slate-300 text-sm sm:text-base leading-relaxed max-w-2xl">
                Full-Stack Systems Engineer and creator of the <strong>PixelPlay</strong> open-architecture platform. Dedicated to engineering hyper-responsive web applications, resilient edge runtimes, WebGL render pipelines, and modern interactive experiences that empower gamers and game makers worldwide.
              </p>

              {/* Social & Repository Links */}
              <div className="pt-3 flex flex-wrap items-center justify-center lg:justify-start gap-3">
                <a
                  href="https://github.com/abuhanif254"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-900 text-white dark:bg-white dark:text-slate-900 hover:opacity-90 transition-opacity text-xs sm:text-sm font-semibold shadow-sm"
                >
                  <Github className="w-4 h-4" />
                  <span>GitHub Profile</span>
                </a>

                <a
                  href="https://www.linkedin.com/in/md-abu-hanif-mia"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#0A66C2] text-white hover:bg-[#095196] transition-colors text-xs sm:text-sm font-semibold shadow-sm"
                >
                  <Linkedin className="w-4 h-4" />
                  <span>LinkedIn</span>
                </a>

                <a
                  href="https://www.facebook.com/bitulla"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#1877F2] text-white hover:bg-[#166fe5] transition-colors text-xs sm:text-sm font-semibold shadow-sm"
                >
                  <Facebook className="w-4 h-4" />
                  <span>Facebook</span>
                </a>

                <a
                  href="https://github.com/abuhanif254/PixelPlay"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 text-white hover:bg-indigo-500 transition-colors text-xs sm:text-sm font-semibold shadow-sm"
                >
                  <Code2 className="w-4 h-4" />
                  <span>PixelPlay Repository</span>
                </a>
              </div>
            </div>
          </div>
        </section>

        {/* 4. Platform Architectural Highlights */}
        <div className="bg-slate-100 dark:bg-[#0c0d20] rounded-2xl p-8 sm:p-10 border border-slate-200 dark:border-white/5 space-y-6">
          <div className="flex items-center gap-3">
            <Cpu className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
            <h3 className="text-xl font-bold font-outfit text-slate-900 dark:text-white">
              Open Architecture & Modern Tech Stack
            </h3>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs sm:text-sm font-medium">
            <div className="p-4 rounded-xl bg-white dark:bg-[#13142e] border border-slate-200 dark:border-white/5">
              <span className="text-indigo-600 dark:text-indigo-400 font-bold block mb-1">Frontend</span>
              <span>Next.js 14 App Router & React 18</span>
            </div>
            <div className="p-4 rounded-xl bg-white dark:bg-[#13142e] border border-slate-200 dark:border-white/5">
              <span className="text-emerald-600 dark:text-emerald-400 font-bold block mb-1">Runtime</span>
              <span>Cloudflare Edge V8 Workers</span>
            </div>
            <div className="p-4 rounded-xl bg-white dark:bg-[#13142e] border border-slate-200 dark:border-white/5">
              <span className="text-blue-600 dark:text-blue-400 font-bold block mb-1">Database</span>
              <span>Supabase PostgreSQL + RLS</span>
            </div>
            <div className="p-4 rounded-xl bg-white dark:bg-[#13142e] border border-slate-200 dark:border-white/5">
              <span className="text-purple-600 dark:text-purple-400 font-bold block mb-1">Rendering</span>
              <span>Tailwind CSS & WebGL Canvas</span>
            </div>
          </div>
        </div>

        {/* 5. Call to Action */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-6 p-8 rounded-2xl bg-indigo-600 text-white">
          <div className="space-y-1 text-center sm:text-left">
            <h4 className="text-xl font-bold font-outfit">Ready to explore our catalog?</h4>
            <p className="text-indigo-100 text-sm">Discover thousands of free games or submit your own creation.</p>
          </div>
          <div className="flex items-center gap-4 shrink-0">
            <Link
              href="/games"
              className="px-5 py-2.5 rounded-xl bg-white text-indigo-600 font-bold text-sm hover:bg-indigo-50 transition-colors shadow-sm"
            >
              Play Games
            </Link>
            <Link
              href="/contact"
              className="px-5 py-2.5 rounded-xl bg-indigo-700 hover:bg-indigo-800 text-white font-bold text-sm transition-colors"
            >
              Contact Us
            </Link>
          </div>
        </div>

      </div>
    </div>
  );
}
