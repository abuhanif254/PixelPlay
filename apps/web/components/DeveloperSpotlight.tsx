import Link from 'next/link';
import { ArrowRight, Code2 } from 'lucide-react';

export default function DeveloperSpotlight() {
  return (
    <div className="bg-gray-900 text-white rounded-3xl overflow-hidden relative group">
      {/* Background decoration */}
      <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-transparent z-0"></div>
      <div className="absolute right-0 top-0 bottom-0 w-1/2 bg-[url('https://images.unsplash.com/photo-1542751371-adc38448a05e?q=80&w=2070&auto=format&fit=crop')] bg-cover bg-center opacity-20 mix-blend-luminosity transition-opacity group-hover:opacity-40"></div>
      
      <div className="relative z-10 p-8 md:p-12 flex flex-col justify-center min-h-[300px] max-w-xl">
        <div className="flex items-center gap-2 text-accent font-bold mb-4">
          <Code2 className="w-5 h-5" />
          <span>Developer Spotlight</span>
        </div>
        
        <h3 className="text-3xl font-outfit font-bold mb-4">RetroArcade Studios</h3>
        <p className="text-gray-300 mb-8">
          The masterminds behind classic hits like "Neon Snake" and "Cyberpunk Racing". RetroArcade specializes in bringing nostalgic gameplay mechanics to modern HTML5 engines with stunning particle effects.
        </p>
        
        <Link href="/developers/retroarcade" className="inline-flex items-center justify-center bg-white text-gray-900 px-6 py-3 rounded-full font-bold hover:bg-gray-200 transition-colors self-start">
          View Developer Catalog <ArrowRight className="ml-2 w-4 h-4" />
        </Link>
      </div>
    </div>
  );
}
