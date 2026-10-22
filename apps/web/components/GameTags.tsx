import React from 'react';
import Link from 'next/link';
import { Tag } from 'lucide-react';

interface GameTagsProps {
  tags?: string[];
  category: string;
}

const CANONICAL_CATEGORY_HUBS: Record<string, string> = {
  action: '/categories/action-games',
  'action games': '/categories/action-games',
  adventure: '/categories/adventure-games',
  'adventure games': '/categories/adventure-games',
  arcade: '/categories/arcade-games',
  'arcade games': '/categories/arcade-games',
  board: '/categories/board-games',
  'board games': '/categories/board-games',
  puzzle: '/categories/puzzle-games',
  'puzzle games': '/categories/puzzle-games',
  racing: '/categories/racing-games',
  'racing games': '/categories/racing-games',
  sports: '/categories/sports-games',
  'sports games': '/categories/sports-games',
  strategy: '/categories/strategy-games',
  'strategy games': '/categories/strategy-games',
  car: '/categories/car-games',
  'car games': '/categories/car-games',
  driving: '/categories/car-games',
  drift: '/categories/drift-games',
  drifting: '/categories/drift-games',
  moto: '/categories/moto-games',
  bike: '/categories/moto-games',
  motorbike: '/categories/moto-games',
  motorcycle: '/categories/moto-games',
  zombie: '/categories/zombie-games',
  zombies: '/categories/zombie-games',
  'zombie games': '/categories/zombie-games',
  stickman: '/categories/stickman-games',
  'stickman games': '/categories/stickman-games',
  '2 player': '/categories/2-player-games',
  '2-player': '/categories/2-player-games',
  '2 player games': '/categories/2-player-games',
  multiplayer: '/categories/multiplayer-games',
  'multiplayer games': '/categories/multiplayer-games',
  escape: '/categories/escape-games',
  'escape games': '/categories/escape-games',
  shooting: '/categories/shooting-games',
  shooter: '/categories/shooting-games',
  'shooting games': '/categories/shooting-games',
  gun: '/categories/shooting-games',
  sniper: '/categories/sniper-games',
  fps: '/categories/fps-games',
  'dress up': '/categories/dress-up-games',
  cooking: '/categories/cooking-games',
  football: '/categories/football-games',
  soccer: '/categories/football-games',
  basketball: '/categories/basketball-games',
  tennis: '/categories/tennis-games',
  pool: '/categories/pool-games',
  billiards: '/categories/pool-games',
  bowling: '/categories/bowling-games',
  golf: '/categories/golf-games',
  boxing: '/categories/boxing-games',
  cricket: '/categories/cricket-games',
  clicker: '/categories/clicker-games',
  idle: '/categories/clicker-games',
  runner: '/categories/runner-games',
  running: '/categories/runner-games',
  parkour: '/categories/parkour-games',
  ninja: '/categories/ninja-games',
  chess: '/categories/chess-games',
  mahjong: '/categories/mahjong-games',
  solitaire: '/categories/solitaire-games',
  card: '/categories/solitaire-games',
  brain: '/categories/brain-games',
  logic: '/categories/brain-games',
  math: '/categories/brain-games',
  horror: '/categories/horror-games',
  scary: '/categories/horror-games',
  tank: '/categories/tank-games',
  tanks: '/categories/tank-games',
  war: '/categories/war-games',
  defense: '/categories/tower-defense-games',
  'tower defense': '/categories/tower-defense-games',
  match: '/categories/match-3-games',
  'match 3': '/categories/match-3-games',
  bubble: '/categories/bubble-shooter-games',
  jigsaw: '/categories/jigsaw-puzzle-games',
  word: '/categories/word-games',
  io: '/categories/io-games',
  '.io': '/categories/io-games',
  physics: '/categories/physics-games',
  casual: '/categories/casual-games',
  retro: '/categories/retro-arcade-games',
  classic: '/categories/retro-arcade-games',
  unblocked: '/categories/unblocked-games',
  'unblocked games': '/categories/unblocked-games',
  chromebook: '/categories/chromebook-games',
  'for chromebook': '/categories/chromebook-games',
  'no download': '/categories/no-download-games',
  'no download games': '/categories/no-download-games',
  'free online games': '/games',
  'browser games': '/games',
  'html5 games': '/categories/no-download-games',
  html5: '/categories/no-download-games',
  'instant play': '/popular',
};

const HIGH_INTENT_TAGS = new Set([
  '2048',
  'checkers',
  'ludo',
  'dominoes',
  'monster-truck',
  'parking',
  'archery',
  'aircraft',
  'pixel',
  'merge',
  'obby',
  'skibidi',
  'brawl-stars',
  'fnf',
  'squid-game',
  'minecraft',
  'stickman-archery',
  'penalty',
  'pinball',
  'water-slide',
]);

function normalizeAndFilterTags(rawTags: string[], category: string): Array<{ label: string; href: string }> {
  const results: Array<{ label: string; href: string }> = [];
  const seenHrefs = new Set<string>();

  const addTag = (label: string, href: string) => {
    if (!seenHrefs.has(href)) {
      seenHrefs.add(href);
      results.push({ label, href });
    }
  };

  // 1. Primary category hub always comes first
  const catLower = (category || 'arcade').toLowerCase().trim();
  const catHref = CANONICAL_CATEGORY_HUBS[catLower] || `/categories/${catLower.replace(/\s+/g, '-')}-games`;
  addTag(`${category} Games`, catHref);

  // 2. Process provided tags: filter out synthetic per-game title spam ("free <title>", "<title> online", "<title> for chromebook")
  for (const raw of rawTags) {
    if (!raw || typeof raw !== 'string') continue;
    const lower = raw.toLowerCase().trim();

    // Direct match in canonical category hubs
    if (CANONICAL_CATEGORY_HUBS[lower]) {
      addTag(raw.replace(/\b\w/g, (c) => c.toUpperCase()), CANONICAL_CATEGORY_HUBS[lower]);
      continue;
    }

    // Check if any canonical keyword appears inside a longer synthetic tag (e.g. "free stickman sniper 3d" -> "stickman", "sniper")
    let matchedKeyword = false;
    for (const [kw, hubHref] of Object.entries(CANONICAL_CATEGORY_HUBS)) {
      if (kw.length >= 4 && lower.includes(kw)) {
        const display = kw.replace(/\b\w/g, (c) => c.toUpperCase());
        addTag(display, hubHref);
        matchedKeyword = true;
      }
    }
    if (matchedKeyword) continue;

    // Skip synthetic multi-word per-game spam tags ("free ...", "... online", "... unblocked", "... for chromebook")
    const wordCount = lower.split(/\s+/).length;
    if (
      wordCount > 2 ||
      lower.startsWith('free ') ||
      lower.endsWith(' online') ||
      lower.endsWith(' unblocked') ||
      lower.includes('chromebook') ||
      /[^a-z0-9\s-]/.test(lower)
    ) {
      continue;
    }

    const cleanSlug = lower.replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
    // Only link to curated high-intent tags to preserve Googlebot crawl budget
    if (HIGH_INTENT_TAGS.has(cleanSlug)) {
      addTag(raw.replace(/\b\w/g, (c) => c.toUpperCase()), `/games/tags/${cleanSlug}`);
    }
  }

  // 3. Ensure strong evergreen hub links are always present for internal link equity
  addTag('Unblocked Games', '/categories/unblocked-games');
  addTag('Chromebook Games', '/categories/chromebook-games');
  addTag('No Download Games', '/categories/no-download-games');

  return results.slice(0, 10);
}

export default function GameTags({ tags, category }: GameTagsProps) {
  const curatedLinks = normalizeAndFilterTags(tags || [], category);

  return (
    <div id="tags" className="w-full mt-12 pt-8 border-t border-gray-200 dark:border-white/5">
      <div className="flex items-center gap-2 mb-4 text-gray-600 dark:text-gray-400">
        <Tag size={16} />
        <h3 className="text-sm font-bold uppercase tracking-wider">Related Categories & Tags</h3>
      </div>

      <div className="flex flex-wrap gap-3">
        {curatedLinks.map((item, idx) => (
          <Link
            key={idx}
            href={item.href}
            prefetch={false}
            className="px-4 py-2 bg-gray-100 dark:bg-[#111228] hover:bg-[#6366F1] dark:hover:bg-[#6366F1] border border-gray-200 dark:border-white/10 hover:border-[#6366F1] text-gray-700 dark:text-gray-300 hover:text-white rounded-full text-sm font-medium transition-all shadow-sm"
          >
            #{item.label}
          </Link>
        ))}
      </div>
    </div>
  );
}
