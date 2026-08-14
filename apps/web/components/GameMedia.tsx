import React from 'react';

interface GameMediaProps {
  trailerUrl?: string;
  screenshots?: string[];
  title: string;
}

export default function GameMedia({ trailerUrl, screenshots, title }: GameMediaProps) {
  if (!trailerUrl && (!screenshots || screenshots.length === 0)) {
    return null;
  }

  return (
    <div id="media" className="scroll-mt-32 w-full mt-12 pt-8 border-t border-gray-200 dark:border-white/5">
      <h3 className="text-xl font-bold mb-6 text-gray-900 dark:text-white font-outfit">Media & Gameplay</h3>
      
      <div className="flex flex-col xl:flex-row gap-6">
        {/* Trailer Video (Left) */}
        {trailerUrl && (
          <div className="flex-1 rounded-2xl overflow-hidden border border-gray-200 dark:border-white/10 shadow-2xl bg-gray-100 dark:bg-[#0A0B1A]">
            <div className="aspect-video w-full relative">
              <iframe 
                src={trailerUrl} 
                title={`${title} Gameplay Trailer`}
                className="absolute inset-0 w-full h-full"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
          </div>
        )}

        {/* Screenshots (Right) */}
        {screenshots && screenshots.length > 0 && (
          <div className={`grid gap-4 ${trailerUrl ? 'xl:w-1/3 grid-cols-2 xl:grid-cols-1' : 'grid-cols-2 md:grid-cols-3 xl:grid-cols-4 w-full'}`}>
            {screenshots.map((imgUrl, i) => (
              <div key={i} className="rounded-xl overflow-hidden border border-gray-200 dark:border-white/10 relative group aspect-video">
                <img 
                  src={imgUrl} 
                  alt={`${title} screenshot ${i + 1}`} 
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" 
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors" />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
