import Link from 'next/link';
import { ArrowRight, Code2 } from 'lucide-react';

export default function DeveloperSpotlight() {
  return (
    <div className="bg-[#0B0F19] text-white rounded-3xl overflow-hidden relative group border border-gray-800 hover:border-purple-500/50 transition-colors duration-500 shadow-2xl">
      {/* Background decoration */}
      <div className="absolute inset-0 bg-gradient-to-br from-purple-900/40 via-blue-900/20 to-transparent z-0"></div>
      <div className="absolute right-0 top-0 bottom-0 w-full md:w-1/2 bg-[url('https://images.unsplash.com/photo-1542751371-adc38448a05e?q=80&w=2070&auto=format&fit=crop')] bg-cover bg-center opacity-10 mix-blend-luminosity transition-opacity duration-700 group-hover:opacity-30"></div>
      
      {/* Abstract Glowing Orbs */}
      <div className="absolute top-0 right-1/4 w-64 h-64 bg-purple-600/30 rounded-full blur-[80px] pointer-events-none group-hover:bg-purple-500/40 transition-colors duration-700" />
      <div className="absolute bottom-0 right-0 w-64 h-64 bg-blue-600/20 rounded-full blur-[80px] pointer-events-none group-hover:bg-blue-500/40 transition-colors duration-700" />

      <div className="relative z-10 p-8 md:p-12 flex flex-col justify-center min-h-[350px] max-w-xl">
        <div className="flex items-center gap-2 text-purple-400 font-bold mb-4 uppercase tracking-widest text-xs">
          <Code2 className="w-4 h-4" />
          <span>Developer Spotlight</span>
        </div>
        
        <h3 className="text-4xl md:text-5xl font-extrabold mb-4 text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-400 group-hover:to-purple-200 transition-colors duration-500">RetroArcade Studios</h3>
        <p className="text-gray-400 mb-8 text-sm md:text-base leading-relaxed max-w-lg group-hover:text-gray-300 transition-colors duration-500">
          The masterminds behind classic hits like "Neon Snake" and "Cyberpunk Racing". RetroArcade specializes in bringing nostalgic gameplay mechanics to modern HTML5 engines with stunning particle effects.
        </p>
        
        <div className="flex flex-wrap items-center gap-4">
          <Link href="/studio" className="inline-flex items-center justify-center bg-gradient-to-r from-[#6366F1] to-[#8B5CF6] text-white px-6 py-3 rounded-full font-bold hover:shadow-[0_0_25px_rgba(99,102,241,0.6)] hover:scale-105 transition-all duration-300 shadow-md">
            Publish on Spielcade <ArrowRight className="ml-2 w-4 h-4" />
          </Link>
          <Link href="/developers" className="inline-flex items-center justify-center bg-white/10 hover:bg-white/20 text-white border border-white/10 px-5 py-3 rounded-full font-bold hover:scale-105 transition-all duration-300">
            Developer Program
          </Link>
        </div>
      </div>
    </div>
  );
}
