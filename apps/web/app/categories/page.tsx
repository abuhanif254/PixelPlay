import { Metadata } from 'next';
import { 
  Puzzle, 
  Gamepad2, 
  Grid, 
  Swords, 
  Car, 
  Brain, 
  Target, 
  Shield, 
  Flame, 
  Skull, 
  Users, 
  Trophy, 
  Utensils, 
  Footprints, 
  Zap,
  Sparkles
} from 'lucide-react';
import Link from 'next/link';
import CategoryCard from '@/components/CategoryCard';
import { SectionHeader } from '@/components/SectionHeader';
import { CubeIcon } from '@/components/3d/SectionIcons';
import { categoriesData } from '@/lib/mockCategories';

export const metadata: Metadata = {
  title: "All Game Categories & Thematic Hubs | Spielcade",
  description: "Browse thousands of free online games by genre and theme. Car games, zombie survival, 2-player games, puzzles, unblocked games, and retro arcades.",
  openGraph: {
    title: "All Game Categories & Thematic Hubs | Spielcade",
    description: "Browse thousands of free online games by genre and theme. Car games, zombie survival, 2-player games, puzzles, unblocked games, and retro arcades.",
    url: "https://spielcade.com/categories",
  },
  alternates: {
    canonical: "https://spielcade.com/categories",
  },
};

export const runtime = 'edge';
export const revalidate = 3600; // Cache for 1 hour

export default async function CategoriesIndexPage() {
  const categoryCounts: Record<string, number> = {
    'Action': 3250,
    'Arcade': 4120,
    'Racing': 1680,
    'Puzzle': 3450,
    'Adventure': 1340,
    'Sports': 1050,
    'Strategy': 1280,
    'Board': 520,
  };

  const canonicalCards = [
    { name: "Puzzle", icon: <Puzzle className="w-8 h-8" />, colorClass: "text-indigo-500", key: "Puzzle" },
    { name: "Arcade", icon: <Gamepad2 className="w-8 h-8" />, colorClass: "text-yellow-500", key: "Arcade" },
    { name: "Board", icon: <Grid className="w-8 h-8" />, colorClass: "text-purple-500", key: "Board" },
    { name: "Action", icon: <Swords className="w-8 h-8" />, colorClass: "text-red-500", key: "Action" },
    { name: "Racing", icon: <Car className="w-8 h-8" />, colorClass: "text-blue-500", key: "Racing" },
    { name: "Strategy", icon: <Brain className="w-8 h-8" />, colorClass: "text-teal-500", key: "Strategy" },
    { name: "Sports", icon: <Target className="w-8 h-8" />, colorClass: "text-orange-500", key: "Sports" },
    { name: "Adventure", icon: <Shield className="w-8 h-8" />, colorClass: "text-emerald-500", key: "Adventure" },
  ];

  const thematicClusters = [
    { name: "Car Games", slug: "car-games", icon: "🚗", count: "1,000+", desc: "Supercars, drift, racing & parking" },
    { name: "Zombie Games", slug: "zombie-games", icon: "🧟", count: "330+", desc: "Undead waves, survival & shooters" },
    { name: "Stickman Games", slug: "stickman-games", icon: "🏃", count: "230+", desc: "Brawlers, parkour & sniper duels" },
    { name: "2 Player Games", slug: "2-player-games", icon: "👥", count: "130+", desc: "Local co-op & head-to-head battles" },
    { name: "Shooting Games", slug: "shooting-games", icon: "🎯", count: "580+", desc: "FPS shooters & sniper missions" },
    { name: "Escape Games", slug: "escape-games", icon: "🗝️", count: "530+", desc: "Mystery rooms & puzzle chambers" },
    { name: "Runner Games", slug: "runner-games", icon: "🏃‍♂️", count: "670+", desc: "Endless platform runners & dashes" },
    { name: "Unblocked Games", slug: "unblocked-games", icon: "🔓", count: "17,000+", desc: "Safe, instant games for school or work" },
    { name: "Drift Games", slug: "drift-games", icon: "🏎️", count: "110+", desc: "Asphalt slides & tire-burning physics" },
    { name: "Dress Up Games", slug: "dress-up-games", icon: "👗", count: "350+", desc: "Fashion styling, makeover & beauty" },
    { name: "Cooking Games", slug: "cooking-games", icon: "🍳", count: "120+", desc: "Baking, restaurant management & chef" },
    { name: "Football Games", slug: "football-games", icon: "⚽", count: "120+", desc: "World tournaments & penalty kicks" },
  ];

  // Dynamic JSON-LD CollectionPage schema
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: 'Spielcade Game Categories and Thematic Hubs',
    description: 'Browse all game genres and thematic collections on Spielcade.',
    url: 'https://spielcade.com/categories',
    hasPart: Object.keys(categoriesData).map(slug => ({
      '@type': 'WebPage',
      name: categoriesData[slug].title,
      url: `https://spielcade.com/categories/${slug}`
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
            Game Categories & Hubs
          </h1>
          <p className="text-lg md:text-xl text-gray-500 dark:text-gray-400">
            Explore 17,000+ free online browser games categorized by genre, sub-theme, and gameplay mechanics. Instant play with zero downloads.
          </p>
        </div>

        {/* Primary Canonical Genres */}
        <SectionHeader title="Explore Canonical Genres" icon3d={<CubeIcon />} />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mt-8 mb-16">
          {canonicalCards.map((cat) => (
            <div key={cat.key} className="h-48">
              <CategoryCard 
                name={cat.name} 
                icon={cat.icon} 
                gameCount={categoryCounts[cat.key] || 500} 
                colorClass={cat.colorClass} 
              />
            </div>
          ))}
        </div>

        {/* Thematic Topic Clusters */}
        <div className="flex items-center gap-3 mb-8">
          <div className="w-10 h-10 rounded-xl bg-purple-500/10 flex items-center justify-center text-purple-500 text-xl font-bold">
            ⚡
          </div>
          <div>
            <h2 className="text-2xl font-bold font-outfit text-gray-900 dark:text-white">
              Trending Thematic Clusters
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Curated landing hubs for the most popular game search queries
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {thematicClusters.map((hub) => (
            <Link
              key={hub.slug}
              href={`/categories/${hub.slug}`}
              className="group p-6 rounded-2xl bg-gray-50 dark:bg-[#111228]/80 border border-gray-200 dark:border-white/5 hover:border-[#6366F1]/50 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg flex flex-col justify-between"
            >
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-3xl mb-3 block group-hover:scale-110 transition-transform duration-300">
                    {hub.icon}
                  </span>
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white group-hover:text-[#6366F1] transition-colors">
                    {hub.name}
                  </h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    {hub.desc}
                  </p>
                </div>
              </div>
              <div className="mt-4 pt-3 border-t border-gray-200 dark:border-white/5 flex items-center justify-between text-xs">
                <span className="font-semibold text-purple-600 dark:text-purple-400">{hub.count} Games</span>
                <span className="text-gray-400 group-hover:text-[#6366F1] transition-colors font-bold">Play Now →</span>
              </div>
            </Link>
          ))}
        </div>

      </div>
    </div>
  );
}
