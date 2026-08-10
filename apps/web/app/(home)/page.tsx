import { Puzzle, Gamepad2, Grid, Swords, Car, Brain } from 'lucide-react';
import { HeroSection } from '@/components/HeroSection';
import { SectionHeader } from '@/components/SectionHeader';
import { HorizontalScroll } from '@/components/HorizontalScroll';
import GameCard from '@/components/GameCard';
import CategoryCard from '@/components/CategoryCard';
import BlogPreviewCard from '@/components/BlogPreviewCard';

export default function HomePage() {
  const dummyGames = [
    { title: "Neon Snake", rating: 4.8 },
    { title: "Tic Tac Toe Pro", rating: 4.5 },
    { title: "Sudoku Master", rating: 4.9 },
    { title: "Space Shooter", rating: 4.7 },
    { title: "Chess AI", rating: 4.6 },
    { title: "Solitaire Classic", rating: 4.4 },
  ];

  const categories = [
    { title: "Puzzle", icon: Puzzle, count: 120 },
    { title: "Arcade", icon: Gamepad2, count: 85 },
    { title: "Board", icon: Grid, count: 40 },
    { title: "Action", icon: Swords, count: 200 },
    { title: "Racing", icon: Car, count: 55 },
    { title: "Strategy", icon: Brain, count: 90 },
  ];

  return (
    <div className="flex flex-col gap-12 pb-20">
      <HeroSection />

      <div className="container mx-auto px-4 md:px-8 space-y-16">
        {/* Continue Playing */}
        <section>
          <SectionHeader title="🎯 Continue Playing" />
          <HorizontalScroll>
            {dummyGames.slice(0, 4).map((game, i) => (
              <div key={i} className="min-w-[280px]">
                <GameCard title={game.title} rating={game.rating} />
              </div>
            ))}
          </HorizontalScroll>
        </section>

        {/* Trending Games */}
        <section>
          <SectionHeader title="🔥 Trending Games" actionText="See all" />
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {dummyGames.map((game, i) => (
               <GameCard key={i} title={game.title} rating={game.rating} />
            ))}
          </div>
        </section>

        {/* Categories */}
        <section>
          <SectionHeader title="🧩 Popular Categories" actionText="Explore" />
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {categories.map((cat, i) => (
               <CategoryCard key={i} name={cat.title} icon={cat.icon} gameCount={cat.count} />
            ))}
          </div>
        </section>

        {/* Featured / Editor's Picks */}
        <section>
          <SectionHeader title="⭐ Editor's Picks" subtitle="Hand-picked gems for you" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-1 h-64">
               <GameCard title="Ultimate Chess" rating={5.0} featured={true} />
            </div>
            <div className="md:col-span-1 h-64">
               <GameCard title="Cyberpunk Racing" rating={4.9} featured={true} />
            </div>
          </div>
        </section>

        {/* New Games */}
        <section>
          <SectionHeader title="🎮 Recently Added" />
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {dummyGames.reverse().map((game, i) => (
               <GameCard key={i} title={game.title} rating={game.rating} />
            ))}
          </div>
        </section>

        {/* Blog Section for SEO */}
        <section>
          <SectionHeader title="📖 Latest Guides & News" actionText="Read more" />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <BlogPreviewCard title="Top 10 Puzzle Games" date="Aug 10, 2026" readTime="5 min read" excerpt="Discover the best brain teasers to play directly in your browser." />
            <BlogPreviewCard title="Best Browser Games" date="Aug 8, 2026" readTime="8 min read" excerpt="A definitive list of HTML5 games that you shouldn't miss." />
            <BlogPreviewCard title="Brain Games for Focus" date="Aug 5, 2026" readTime="4 min read" excerpt="How strategy games improve your cognitive abilities." />
            <BlogPreviewCard title="How to Play Sudoku" date="Aug 2, 2026" readTime="6 min read" excerpt="Master the classic number puzzle with these easy tips." />
          </div>
        </section>
      </div>
    </div>
  );
}
