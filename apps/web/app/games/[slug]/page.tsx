import React from 'react';
import { notFound } from 'next/navigation';
import { gamesRegistry } from '@spielcade/games/registry';
import { Star, ChevronRight, Heart, Clock, ArrowUp, ArrowDown, ArrowLeft, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import GamePlayer from '@/components/GamePlayer';
import GameDetailsTabs from '@/components/GameDetailsTabs';
import AdBanner from '@/components/AdBanner';
import FavoriteButton from '@/components/FavoriteButton';
import { Metadata, ResolvingMetadata } from 'next';
import { submitScore } from '../actions';
import { createClient } from '@/lib/supabase/server';
import { 
  generateEnrichedDescription, 
  generateStrategyContent, 
  generateControlsMatrix, 
  generateGameFaqs, 
  generateGameTags 
} from '@/lib/seo-enricher';

export const runtime = 'edge';
export const revalidate = 600; // 10-minute Cloudflare Edge ISR caching for sub-30ms TTFB

interface GamePageProps {
  params: {
    slug: string;
  };
}

export async function generateMetadata(
  { params }: GamePageProps,
  parent: ResolvingMetadata
): Promise<Metadata> {
  const { slug } = params;
  
  const supabase = createClient();
  const { data: dbGame } = await supabase
    .from('games')
    .select('id, title, slug, description, category, image_url, status, metadata')
    .eq('slug', slug)
    .single();
  
  const localGame = gamesRegistry[slug];

  if (!dbGame && !localGame) {
    return {
      title: 'Game Not Found - Spielcade',
      robots: { index: false, follow: false },
    };
  }

  const title = dbGame?.title || localGame?.config?.title || 'Game';
  const category = dbGame?.category || (dbGame?.metadata as any)?.category || localGame?.config?.category || 'Arcade';
  const rawGameDesc = dbGame?.description || localGame?.config?.description || '';
  const description = (rawGameDesc && rawGameDesc.length >= 80)
    ? rawGameDesc
    : generateEnrichedDescription(title, category, rawGameDesc);
  const image = dbGame?.image_url || localGame?.config?.image || 'https://spielcade.com/og-default.jpg';
  const status = dbGame?.status || 'active'; // local games are considered approved
  const tags = (dbGame?.metadata as any)?.tags || localGame?.config?.tags || generateGameTags(title, category);

  const shouldIndex = status === 'approved' || status === 'active';
  
  const pageTitle = `${title} — Play Free Online Game Unblocked | Spielcade`;
  const pageDescription = description.length > 160 ? description.slice(0, 157).trimEnd() + "..." : description;
  const canonicalUrl = `https://spielcade.com/games/${slug}`;

  return {
    title: pageTitle,
    description: pageDescription,
    keywords: [
      title,
      `${title} online`,
      `play ${title}`,
      `${title} unblocked`,
      'unblocked games',
      'free browser games',
      `free ${category.toLowerCase()} games`,
      ...tags,
    ],
    alternates: {
      canonical: canonicalUrl,
    },
    robots: {
      index: shouldIndex,
      follow: true,
      googleBot: {
        index: shouldIndex,
        follow: true,
        "max-image-preview": "large",
      },
    },
    openGraph: {
      title: pageTitle,
      description: pageDescription,
      url: canonicalUrl,
      siteName: 'Spielcade',
      type: 'website',
      images: [
        {
          url: image,
          width: 1200,
          height: 630,
          alt: `${title} — gameplay screenshot`,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: pageTitle,
      description: pageDescription,
      images: [image],
    },
  };
}

export default async function GamePage({ params }: GamePageProps) {
  const { slug } = params;
  
  const supabase = createClient();
  const { data: dbGame } = await supabase.from('games').select('*').eq('slug', slug).single();
  
  const localGame = gamesRegistry[slug];

  if (!dbGame && !localGame) {
    notFound();
  }

  const rawTitle = dbGame?.title || localGame?.config?.title || 'Unknown Game';
  const rawCat = dbGame?.category || (dbGame?.metadata as any)?.category || localGame?.config?.category || 'Arcade';
  const rawGameDesc = dbGame?.description || localGame?.config?.description || '';
  const finalDesc = (rawGameDesc && rawGameDesc.length >= 80)
    ? rawGameDesc
    : generateEnrichedDescription(rawTitle, rawCat, rawGameDesc);

  const finalStrategy = (dbGame?.metadata as any)?.strategy || (localGame?.config as any)?.strategy || generateStrategyContent(rawTitle, rawCat);
  const finalControls = (dbGame?.metadata as any)?.keyboardControls || (localGame?.config as any)?.keyboardControls || generateControlsMatrix('', rawCat);
  const finalFaqs = ((dbGame?.metadata as any)?.faqs && (dbGame?.metadata as any)?.faqs.length > 0)
    ? (dbGame?.metadata as any)?.faqs
    : ((localGame?.config as any)?.faqs && (localGame?.config as any)?.faqs.length > 0)
      ? (localGame?.config as any)?.faqs
      : generateGameFaqs(rawTitle, rawCat);
  const finalTags = ((dbGame?.metadata as any)?.tags && (dbGame?.metadata as any)?.tags.length > 0)
    ? (dbGame?.metadata as any)?.tags
    : ((localGame?.config as any)?.tags && (localGame?.config as any)?.tags.length > 0)
      ? (localGame?.config as any)?.tags
      : generateGameTags(rawTitle, rawCat);

  // Merge database and local configs (DB takes precedence if available)
  const config = {
    ...(localGame?.config || {}),
    title: rawTitle,
    description: finalDesc,
    image: dbGame?.image_url || localGame?.config?.image,
    category: rawCat,
    developer: (dbGame?.metadata as any)?.developer || localGame?.config?.developer || 'Spielcade',
    rating: dbGame?.rating || (dbGame?.metadata as any)?.rating || localGame?.config?.rating || 4.8,
    sourceUrl: dbGame?.source_url || (localGame?.config as any)?.sourceUrl,
    strategy: finalStrategy,
    keyboardControls: finalControls,
    faqs: finalFaqs,
    tags: finalTags,
  };

  const sourceUrl = config.sourceUrl || ((config as any).type === 'html5' ? `/games/${slug}/index.html` : null);
  const GameComponent = localGame?.component || (() => null);

  // Check if current user favorited this game
  let isFavorited = false;
  if (dbGame) {
    const { data: authData } = await supabase.auth.getUser();
    if (authData?.user) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('favorite_game_ids')
        .eq('id', authData.user.id)
        .single();
      if (profile?.favorite_game_ids) {
        isFavorited = profile.favorite_game_ids.includes(dbGame.id);
      }
    }
  }

  const totalPlaysNum = dbGame?.total_plays || (localGame ? 25000 : 12000);
  const formattedPlays = totalPlaysNum >= 1000000 
    ? `${(totalPlaysNum / 1000000).toFixed(1)}M plays`
    : `${Math.floor(totalPlaysNum / 1000)}K plays`;

  const votesNum = Math.floor(totalPlaysNum * 0.12);
  const formattedVotes = votesNum >= 1000
    ? `${(votesNum / 1000).toFixed(1)}K votes`
    : `${votesNum} votes`;

  // Schema data for Structured Data
  const videoGameSchema = {
    "@context": "https://schema.org",
    "@type": "VideoGame",
    "name": config.title,
    "description": config.description || `Play ${config.title} online for free.`,
    "image": config.image || 'https://spielcade.com/og-default.jpg',
    "genre": config.category,
    "inLanguage": "en",
    "isAccessibleForFree": "true",
    "playMode": "SinglePlayer",
    "applicationCategory": "Game",
    "operatingSystem": "Windows, macOS, Linux, Android, iOS, ChromeOS",
    "gamePlatform": ["Web Browser", "Chromebook", "Mobile", "Desktop"],
    "url": `https://spielcade.com/games/${slug}`,
    "author": {
      "@type": "Organization",
      "name": config.developer || 'Spielcade',
    },
    "publisher": {
      "@type": "Organization",
      "name": "Spielcade",
      "url": "https://spielcade.com",
      "logo": {
        "@type": "ImageObject",
        "url": "https://spielcade.com/logo.png"
      }
    },
    "offers": {
      "@type": "Offer",
      "price": "0",
      "priceCurrency": "USD",
      "availability": "https://schema.org/InStock",
    },
    ...(config.rating ? {
      "aggregateRating": {
        "@type": "AggregateRating",
        "ratingValue": Number(config.rating).toFixed(1),
        "bestRating": "5",
        "worstRating": "1",
        "ratingCount": Math.max(25, votesNum)
      }
    } : {})
  };

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      {
        "@type": "ListItem",
        "position": 1,
        "name": "Home",
        "item": "https://spielcade.com/"
      },
      {
        "@type": "ListItem",
        "position": 2,
        "name": `${config.category} Games`,
        "item": `https://spielcade.com/categories/${config.category.toLowerCase().replace(/\s+/g, '-')}-games`
      },
      {
        "@type": "ListItem",
        "position": 3,
        "name": config.title,
        "item": `https://spielcade.com/games/${slug}`
      }
    ]
  };

  const faqSchema = config.faqs && config.faqs.length > 0 ? {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": config.faqs.map((faq: any) => ({
      "@type": "Question",
      "name": faq.q,
      "acceptedAnswer": {
        "@type": "Answer",
        "text": faq.a
      }
    }))
  } : null;

  const howToSchema = config.keyboardControls && Object.keys(config.keyboardControls).length > 0 ? {
    "@context": "https://schema.org",
    "@type": "HowTo",
    "name": `How to Play ${config.title}`,
    "description": `Comprehensive controls guide and gameplay instructions to play ${config.title} online for free in your browser.`,
    "image": config.image || 'https://spielcade.com/og-default.jpg',
    "step": Object.entries(config.keyboardControls).map(([key, action], idx) => ({
      "@type": "HowToStep",
      "position": idx + 1,
      "name": `Control ${idx + 1}: ${key}`,
      "text": `Press ${key} to ${action}.`,
      "url": `https://spielcade.com/games/${slug}#controls`
    }))
  } : null;

  // Fetch real related games from the database matching the same category
  const { data: dbRelated } = await supabase
    .from('games')
    .select('id, title, slug, image_url, category, rating, total_plays')
    .eq('status', 'active')
    .eq('category', config.category)
    .neq('slug', slug)
    .order('total_plays', { ascending: false })
    .limit(12);

  let relatedGames = (dbRelated || []).map((g: any) => ({
    id: g.id,
    slug: g.slug,
    title: g.title,
    image: g.image_url,
    category: g.category,
    rating: g.rating || 4.8,
    totalPlays: g.total_plays || 10000
  }));

  // Fallback to top games if fewer than 6 games exist in this specific category
  if (relatedGames.length < 6) {
    const { data: fallbackGames } = await supabase
      .from('games')
      .select('id, title, slug, image_url, category, rating, total_plays')
      .eq('status', 'active')
      .neq('slug', slug)
      .order('total_plays', { ascending: false })
      .limit(12);

    relatedGames = (fallbackGames || []).map((g: any) => ({
      id: g.id,
      slug: g.slug,
      title: g.title,
      image: g.image_url,
      category: g.category,
      rating: g.rating || 4.8,
      totalPlays: g.total_plays || 10000
    }));
  }

  const handleGameOver = async (score: number) => {
    'use server';
    await submitScore(slug, score);
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(videoGameSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      {faqSchema && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
        />
      )}
      {howToSchema && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(howToSchema) }}
        />
      )}
      <div className="bg-gray-50 dark:bg-[#05050F] min-h-screen text-gray-900 dark:text-white pt-24 pb-12 transition-colors">
        <div className="container mx-auto px-4 md:px-6 lg:px-8 max-w-7xl">
          
          {/* Breadcrumbs */}
          <nav className="flex items-center gap-2 text-sm text-[#6366F1] font-bold mb-6">
            <Link href="/" className="hover:underline">Home</Link>
            <ChevronRight size={14} className="text-gray-400 dark:text-gray-500" />
            <Link 
              href={`/categories/${config.category.toLowerCase().replace(/\s+/g, '-')}-games`} 
              className="hover:underline"
            >
              {config.category} Games
            </Link>
            <ChevronRight size={14} className="text-gray-400 dark:text-gray-500" />
            <span className="text-[#F59E0B]">{config.title}</span>
          </nav>

          {/* Game Header Area */}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8">
            <div className="flex items-center gap-5">
              {/* Game Icon */}
              <div className="w-20 h-20 rounded-2xl overflow-hidden bg-white dark:bg-[#111228] border border-gray-200 dark:border-white/10 shrink-0 relative shadow-xl shadow-black/50">
                {config.image ? (
                  <img src={config.image} alt={config.title} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center font-bold text-gray-400 dark:text-gray-500 bg-gradient-to-br from-gray-100 to-gray-200 dark:from-[#111228] dark:to-[#1D1B4B]">
                    {config.title.substring(0,2).toUpperCase()}
                  </div>
                )}
              </div>
              
              <div className="flex flex-col gap-2">
                <div className="flex items-center gap-3">
                  <h1 className="text-3xl md:text-4xl font-extrabold font-outfit text-gray-900 dark:text-white tracking-wide">
                    {config.title}
                  </h1>
                  <span className="px-3 py-1 bg-white dark:bg-[#111228] border border-[#6366F1]/30 text-[#6366F1] text-xs font-bold rounded-lg shadow-sm shadow-[#6366F1]/10">
                    {config.category}
                  </span>
                </div>
                
                <div className="flex flex-wrap items-center gap-4 text-sm font-medium text-gray-400">
                  <div className="flex items-center gap-1.5">
                    <div className="flex items-center text-[#F59E0B]">
                      <Star size={14} className="fill-current" />
                      <Star size={14} className="fill-current" />
                      <Star size={14} className="fill-current" />
                      <Star size={14} className="fill-current" />
                      <Star size={14} className="fill-current opacity-50" />
                    </div>
                    <span className="text-gray-900 dark:text-white font-bold ml-1">{config.rating || '4.6'}</span>
                    <span className="text-gray-500">({formattedVotes})</span>
                  </div>
                  <div className="w-1 h-1 rounded-full bg-gray-400 dark:bg-gray-600"></div>
                  <div className="flex items-center gap-1.5">
                    <Clock size={14} className="text-gray-500" />
                    <span>{formattedPlays}</span>
                  </div>
                </div>
              </div>
            </div>

            {dbGame && (
              <FavoriteButton gameId={dbGame.id} initialFavorited={isFavorited} />
            )}
          </div>

          {/* Main Grid: Game Player & Info Sidebar */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 mb-10">
            
            {/* Left Column: Player Area */}
            <div className="lg:col-span-8 flex flex-col gap-6">
              {/* Leaderboard Ad Above Game */}
              <div className="hidden md:flex justify-center w-full">
                <AdBanner id="2bd411e3e6c5caac36fa619ee3376222" width={728} height={90} className="w-full max-w-[728px]" />
              </div>
              <div className="flex md:hidden justify-center w-full">
                <AdBanner id="5a3fd317f38a51c8553f75f8c2a547ef" width={320} height={50} />
              </div>

              <GamePlayer 
                title={config.title} 
                slug={slug} 
                image={config.image} 
                sourceUrl={sourceUrl} 
                onGameOver={handleGameOver}
                relatedGames={relatedGames}
                gameId={dbGame?.id}
                initialFavorited={isFavorited}
              >
                {GameComponent && <GameComponent onGameOver={handleGameOver} />}
              </GamePlayer>
            </div>

            {/* Right Column: Game Info Sidebar */}
            <div className="lg:col-span-4 flex flex-col gap-6">
              
              {/* Sidebar Ad */}
              <div className="hidden lg:flex justify-center w-full">
                <AdBanner id="2728a9e3df26c1ad90aeab8d28474a82" width={300} height={250} />
              </div>

              {/* How to Play Box */}
              <div className="bg-white dark:bg-[#111228] border border-gray-200 dark:border-white/5 rounded-2xl p-6 shadow-xl">
                <h3 className="text-lg font-bold font-outfit text-gray-900 dark:text-white mb-4">How to Play</h3>
                <div className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed space-y-4">
                  {config.strategy ? (
                    <div dangerouslySetInnerHTML={{ __html: config.strategy }} />
                  ) : (
                    <>
                      <p>Use your arrow keys to move the tiles.</p>
                      <p>When two tiles with the same number touch, they merge into one!</p>
                      <p>Get the highest score possible to win the game.</p>
                    </>
                  )}
                </div>
              </div>

              {/* Controls Box */}
              <div className="bg-white dark:bg-[#111228] border border-gray-200 dark:border-white/5 rounded-2xl p-6 shadow-xl">
                <h3 className="text-lg font-bold font-outfit text-gray-900 dark:text-white mb-4">Controls</h3>
                
                {config.keyboardControls ? (
                  <ul className="space-y-3">
                    {Object.entries(config.keyboardControls).map(([key, action]) => (
                      <li key={key} className="flex items-center gap-3">
                        <kbd className="min-w-[28px] h-7 px-2 flex items-center justify-center bg-gray-50 dark:bg-[#0A0B1A] border border-gray-200 dark:border-white/10 rounded-lg text-xs font-bold font-mono text-gray-800 dark:text-gray-300 shadow-[0_2px_0_rgba(0,0,0,0.05)] dark:shadow-[0_2px_0_rgba(255,255,255,0.1)]">
                          {key}
                        </kbd>
                        <span className="text-sm text-gray-600 dark:text-gray-400">{action as React.ReactNode}</span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <ul className="space-y-3">
                    <li className="flex items-center gap-3">
                      <kbd className="w-7 h-7 flex items-center justify-center bg-gray-50 dark:bg-[#0A0B1A] border border-gray-200 dark:border-white/10 rounded-lg text-gray-800 dark:text-gray-300 shadow-[0_2px_0_rgba(0,0,0,0.05)] dark:shadow-[0_2px_0_rgba(255,255,255,0.1)]">
                        <ArrowUp size={14} />
                      </kbd>
                      <span className="text-sm text-gray-600 dark:text-gray-400">Move Up</span>
                    </li>
                    <li className="flex items-center gap-3">
                      <kbd className="w-7 h-7 flex items-center justify-center bg-gray-50 dark:bg-[#0A0B1A] border border-gray-200 dark:border-white/10 rounded-lg text-gray-800 dark:text-gray-300 shadow-[0_2px_0_rgba(0,0,0,0.05)] dark:shadow-[0_2px_0_rgba(255,255,255,0.1)]">
                        <ArrowDown size={14} />
                      </kbd>
                      <span className="text-sm text-gray-600 dark:text-gray-400">Move Down</span>
                    </li>
                    <li className="flex items-center gap-3">
                      <kbd className="w-7 h-7 flex items-center justify-center bg-gray-50 dark:bg-[#0A0B1A] border border-gray-200 dark:border-white/10 rounded-lg text-gray-800 dark:text-gray-300 shadow-[0_2px_0_rgba(0,0,0,0.05)] dark:shadow-[0_2px_0_rgba(255,255,255,0.1)]">
                        <ArrowLeft size={14} />
                      </kbd>
                      <span className="text-sm text-gray-600 dark:text-gray-400">Move Left</span>
                    </li>
                    <li className="flex items-center gap-3">
                      <kbd className="w-7 h-7 flex items-center justify-center bg-gray-50 dark:bg-[#0A0B1A] border border-gray-200 dark:border-white/10 rounded-lg text-gray-800 dark:text-gray-300 shadow-[0_2px_0_rgba(0,0,0,0.05)] dark:shadow-[0_2px_0_rgba(255,255,255,0.1)]">
                        <ArrowRight size={14} />
                      </kbd>
                      <span className="text-sm text-gray-600 dark:text-gray-400">Move Right</span>
                    </li>
                  </ul>
                )}
              </div>

              {/* Game Info Box */}
              <div className="bg-white dark:bg-[#111228] border border-gray-200 dark:border-white/5 rounded-2xl p-6 shadow-xl flex-1">
                <h3 className="text-lg font-bold font-outfit text-gray-900 dark:text-white mb-4">Game Info</h3>
                <div className="grid grid-cols-2 gap-y-4 gap-x-2 text-sm">
                  
                  <div className="flex flex-col gap-1">
                    <span className="text-gray-500 font-medium">Developer</span>
                    <span className="text-gray-800 dark:text-gray-300">{config.developer || 'Spielcade'}</span>
                  </div>
                  
                  <div className="flex flex-col gap-1">
                    <span className="text-gray-500 font-medium">Genre</span>
                    <span className="text-gray-800 dark:text-gray-300">{config.category}</span>
                  </div>

                  <div className="flex flex-col gap-1">
                    <span className="text-gray-500 font-medium">Released</span>
                    <span className="text-gray-800 dark:text-gray-300">{config.releaseDate || 'Aug 2026'}</span>
                  </div>

                  <div className="flex flex-col gap-1">
                    <span className="text-gray-500 font-medium">Platform</span>
                    <span className="text-gray-800 dark:text-gray-300">{config.platform || 'Browser'}</span>
                  </div>

                  <div className="flex flex-col gap-1">
                    <span className="text-gray-500 font-medium">Rating</span>
                    <span className="text-gray-800 dark:text-gray-300">{config.rating || '4.6'} / 5</span>
                  </div>

                  <div className="flex flex-col gap-1">
                    <span className="text-gray-500 font-medium">Players</span>
                    <span className="text-gray-800 dark:text-gray-300">1 Player</span>
                  </div>

                </div>
              </div>

            </div>
          </div>

          {/* Bottom Interactive Tabs Area */}
          <GameDetailsTabs config={config} relatedGames={relatedGames} />

          {/* Semantic Recommendation Graph: Games Like {title} */}
          {relatedGames.length > 0 && (
            <section className="w-full mt-12 bg-white dark:bg-[#111228] border border-gray-200 dark:border-white/5 rounded-2xl p-6 md:p-8 shadow-xl">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 pb-4 border-b border-gray-100 dark:border-white/5">
                <div>
                  <h2 className="text-xl md:text-2xl font-bold font-outfit text-gray-900 dark:text-white">
                    Games Like {config.title}
                  </h2>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                    If you enjoyed playing <span className="font-semibold text-gray-900 dark:text-gray-200">{config.title}</span>, discover these similar free online {config.category} games. No downloads, instant browser play, unblocked on Chromebooks and mobile.
                  </p>
                </div>
                <Link
                  href={`/categories/${config.category.toLowerCase().replace(/\s+/g, '-')}-games`}
                  className="inline-flex items-center gap-2 text-xs font-bold text-[#6366F1] hover:text-white bg-[#6366F1]/10 hover:bg-[#6366F1] px-4 py-2.5 rounded-xl transition-all self-start md:self-auto shrink-0"
                >
                  More {config.category} Games →
                </Link>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                {relatedGames.slice(0, 6).map((similarGame: any) => (
                  <Link
                    key={similarGame.slug}
                    href={`/games/${similarGame.slug}`}
                    className="group flex flex-col bg-gray-50 dark:bg-[#0A0B1A] border border-gray-200 dark:border-white/5 hover:border-[#6366F1]/50 rounded-xl overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-lg"
                  >
                    <div className="relative aspect-video w-full overflow-hidden bg-gray-200 dark:bg-black/30">
                      <img
                        src={similarGame.image || 'https://spielcade.com/og-default.jpg'}
                        alt={`Play ${similarGame.title} unblocked free online`}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        loading="lazy"
                      />
                    </div>
                    <div className="p-3 flex flex-col flex-grow justify-between">
                      <h3 className="text-xs font-bold text-gray-900 dark:text-white truncate group-hover:text-[#6366F1] transition-colors">
                        {similarGame.title}
                      </h3>
                      <div className="flex items-center justify-between mt-2 text-[11px]">
                        <span className="font-semibold text-emerald-500">Free</span>
                        <span className="text-gray-500 dark:text-gray-400">★ {Number(similarGame.rating || 4.8).toFixed(1)}</span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </section>
          )}

          {/* Bottom Ad Banner */}
          <div className="flex justify-center w-full mt-12">
            <AdBanner id="2bd411e3e6c5caac36fa619ee3376222" width={728} height={90} className="hidden md:flex" />
            <AdBanner id="5a3fd317f38a51c8553f75f8c2a547ef" width={320} height={50} className="flex md:hidden" />
          </div>

        </div>
      </div>
    </>
  );
}
