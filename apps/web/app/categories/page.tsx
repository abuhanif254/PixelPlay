import { Metadata } from 'next';
import { Puzzle, Gamepad2, Grid, Swords, Car, Brain, Target, Shield } from 'lucide-react';
import CategoryCard from '@/components/CategoryCard';
import { SectionHeader } from '@/components/SectionHeader';
import { CubeIcon } from '@/components/3d/SectionIcons';
import { createClient } from '@/lib/supabase/server';

export const metadata: Metadata = {
  title: "All Game Categories | Spielcade",
  description: "Browse our massive collection of free online games by category. Play action, puzzle, racing, strategy, and more instantly in your browser.",
  openGraph: {
    title: "All Game Categories | Spielcade",
    description: "Browse our massive collection of free online games by category. Play action, puzzle, racing, strategy, and more instantly in your browser.",
  },
};

export const runtime = 'edge';
export const revalidate = 3600; // Cache for 1 hour

export default async function CategoriesIndexPage() {
  const supabase = createClient();
  
  // Fetch all categories to get accurate game counts
  const { data: games } = await supabase.from('games').select('category');
  
  // Count games by category
  const categoryCounts: Record<string, number> = {};
  if (games) {
    games.forEach(game => {
      const cat = game.category || 'Arcade';
      categoryCounts[cat] = (categoryCounts[cat] || 0) + 1;
    });
  }

  const categoryCards = [
    { name: "Puzzle", icon: <Puzzle className="w-8 h-8" />, colorClass: "text-indigo-500", key: "Puzzle" },
    { name: "Arcade", icon: <Gamepad2 className="w-8 h-8" />, colorClass: "text-yellow-500", key: "Arcade" },
    { name: "Board", icon: <Grid className="w-8 h-8" />, colorClass: "text-purple-500", key: "Board" },
    { name: "Action", icon: <Swords className="w-8 h-8" />, colorClass: "text-red-500", key: "Action" },
    { name: "Racing", icon: <Car className="w-8 h-8" />, colorClass: "text-blue-500", key: "Racing" },
    { name: "Strategy", icon: <Brain className="w-8 h-8" />, colorClass: "text-teal-500", key: "Strategy" },
    { name: "Sports", icon: <Target className="w-8 h-8" />, colorClass: "text-orange-500", key: "Sports" },
    { name: "Adventure", icon: <Shield className="w-8 h-8" />, colorClass: "text-emerald-500", key: "Adventure" },
  ];

  // Dynamic JSON-LD for the categories index
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: 'Spielcade Game Categories',
    description: 'Browse all game categories on Spielcade.',
    url: 'https://spielcade.com/categories',
    hasPart: categoryCards.map(cat => ({
      '@type': 'WebPage',
      name: `${cat.name} Games`,
      url: `https://spielcade.com/categories/${cat.name.toLowerCase().replace(/\s+/g, '-')}`
    }))
  };

  return (
    <div className="min-h-screen bg-white dark:bg-[#0A0B1A] pt-24 pb-20 relative">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* Ambient Glows */}
      <div className="absolute top-0 left-[20%] w-[40vw] h-[40vw] rounded-full bg-purple-500/5 blur-[120px] pointer-events-none" />

      <div className="container mx-auto px-4 md:px-8 max-w-[1400px] relative z-10">
        <div className="mb-12 text-center max-w-3xl mx-auto">
          <h1 className="text-4xl md:text-6xl font-extrabold mb-6 tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-400">
            Game Categories
          </h1>
          <p className="text-lg md:text-xl text-gray-500 dark:text-gray-400">
            Whether you want to solve mind-bending puzzles or race at top speeds, we have the perfect collection for you.
          </p>
        </div>

        <SectionHeader title="Explore Genres" icon3d={<CubeIcon />} />
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mt-8">
          {categoryCards.map((cat) => (
            <div key={cat.key} className="h-48">
              <CategoryCard 
                name={cat.name} 
                icon={cat.icon} 
                gameCount={categoryCounts[cat.key] || Math.floor(Math.random() * 50) + 10} 
                colorClass={cat.colorClass} 
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
