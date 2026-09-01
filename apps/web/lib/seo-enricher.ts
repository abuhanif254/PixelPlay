import { RawGameFeedItem } from './game-feeds';

export interface EnrichedGameRecord {
  title: string;
  slug: string;
  description: string;
  category: string;
  image_url: string;
  source_url: string;
  status: 'active';
  rating: number;
  total_plays: number;
  metadata: {
    strategy: string;
    keyboardControls: Record<string, string>;
    faqs: Array<{ q: string; a: string }>;
    tags: string[];
    developer: string;
    releaseDate: string;
    platform: string;
  };
}

/**
 * Generate a clean URL-friendly slug from game title
 */
export function slugifyGameTitle(title: string): string {
  return title
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '') // remove special characters
    .replace(/[\s_-]+/g, '-') // collapse spaces and dashes
    .replace(/^-+|-+$/g, ''); // trim leading/trailing dashes
}

/**
 * Normalize external categories to Spielcade's 8 canonical categories
 */
export function normalizeCategory(rawCategory: string, title: string = '', description: string = ''): string {
  const text = `${rawCategory} ${title} ${description}`.toLowerCase();

  if (text.includes('race') || text.includes('car') || text.includes('driving') || text.includes('bike') || text.includes('moto') || text.includes('drift')) {
    return 'Racing';
  }
  if (text.includes('puzzle') || text.includes('match') || text.includes('mahjong') || text.includes('word') || text.includes('brain') || text.includes('quiz') || text.includes('logic') || text.includes('2048') || text.includes('jigsaw') || text.includes('sudoku')) {
    return 'Puzzle';
  }
  if (text.includes('board') || text.includes('chess') || text.includes('card') || text.includes('solitaire') || text.includes('domino') || text.includes('checkers') || text.includes('ludo')) {
    return 'Board';
  }
  if (text.includes('sport') || text.includes('football') || text.includes('soccer') || text.includes('basketball') || text.includes('tennis') || text.includes('golf') || text.includes('pool') || text.includes('billiards') || text.includes('cricket') || text.includes('bowling')) {
    return 'Sports';
  }
  if (text.includes('strategy') || text.includes('defense') || text.includes('tower') || text.includes('tactics') || text.includes('war') || text.includes('rts') || text.includes('tycoon') || text.includes('building')) {
    return 'Strategy';
  }
  if (text.includes('adventure') || text.includes('rpg') || text.includes('quest') || text.includes('escape') || text.includes('explore') || text.includes('story')) {
    return 'Adventure';
  }
  if (text.includes('shoot') || text.includes('gun') || text.includes('fight') || text.includes('zombie') || text.includes('battle') || text.includes('combat') || text.includes('warrior') || text.includes('action') || text.includes('stickman')) {
    return 'Action';
  }

  // Default to Arcade for hyper-casual, runner, io, or classic games
  return 'Arcade';
}

/**
 * Generate rich, high-ranking SEO description
 */
export function generateEnrichedDescription(title: string, category: string, rawDescription: string = ''): string {
  const cleanRaw = rawDescription.replace(/<[^>]*>?/gm, '').trim();
  
  let intro = cleanRaw;
  if (!intro || intro.length < 30) {
    intro = `Step into the thrilling world of **${title}**, an exciting ${category.toLowerCase()} game playable directly in your web browser with zero downloads required.`;
  }

  const features = `Featuring smooth mechanics, dynamic gameplay, and full optimization for desktop and mobile devices, ${title} offers hours of addictive entertainment. Master unique challenges, sharpen your reflexes, and compete to achieve the highest score on the global leaderboard.`;

  const accessibility = `Play **${title}** online for free on Spielcade today. It runs seamlessly on modern browsers (Chrome, Edge, Safari, Firefox) with instant unblocked access at home, school, or on the go!`;

  return `${intro}\n\n${features}\n\n${accessibility}`;
}

/**
 * Generate structured Strategy & How to Play content
 */
export function generateStrategyContent(title: string, category: string, rawInstructions: string = ''): string {
  if (rawInstructions && rawInstructions.length > 20) {
    return `<p><strong>Overview:</strong> ${rawInstructions}</p><p>Stay focused, time your movements carefully, and aim for maximum precision to beat your high score in <strong>${title}</strong>.</p>`;
  }

  return `<p>Welcome to <strong>${title}</strong>! Your primary objective is to navigate challenges, react quickly to hazards, and score as many points as possible.</p><p>Use your controls to guide your character or pieces, anticipate obstacles, and chain together combos for high multipliers!</p>`;
}

/**
 * Generate device-specific controls matrix
 */
export function generateControlsMatrix(rawInstructions: string = '', category: string = ''): Record<string, string> {
  const text = (rawInstructions + ' ' + category).toLowerCase();

  if (text.includes('mouse') || text.includes('click') || text.includes('tap') || category === 'Puzzle' || category === 'Board') {
    return {
      'Mouse Click / Tap': 'Interact / Select item / Trigger action',
      'Drag & Drop': 'Move pieces / Aim direction',
      'Esc / P': 'Pause Game'
    };
  }

  if (category === 'Racing' || text.includes('drive') || text.includes('steer')) {
    return {
      'W / Up Arrow': 'Accelerate / Gas',
      'S / Down Arrow': 'Brake / Reverse',
      'A / Left Arrow': 'Steer Left',
      'D / Right Arrow': 'Steer Right',
      'Spacebar': 'Handbrake / Drift / Nitro',
      'R': 'Reset Vehicle'
    };
  }

  if (category === 'Action' || text.includes('shoot') || text.includes('fight')) {
    return {
      'WASD / Arrow Keys': 'Move Character',
      'Left Mouse Button': 'Attack / Shoot',
      'Right Mouse Button / Shift': 'Aim / Special Ability',
      'Spacebar': 'Jump / Dodge',
      'R': 'Reload'
    };
  }

  // Universal Arcade Controls
  return {
    'Arrow Keys / WASD': 'Move / Navigate',
    'Spacebar': 'Jump / Action / Start',
    'Mouse Left Click': 'Menu Selection & Interaction',
    'P': 'Pause / Resume'
  };
}

/**
 * Generate 4 high-intent FAQ items for rich Google Search results
 */
export function generateGameFaqs(title: string, category: string): Array<{ q: string; a: string }> {
  return [
    {
      q: `How can I play ${title} online for free?`,
      a: `You can play ${title} for 100% free directly on Spielcade. No downloads, installations, or subscriptions are required—simply click and start playing instantly in your browser.`
    },
    {
      q: `Can I play ${title} on mobile phones and tablets?`,
      a: `Yes, ${title} is fully responsive and optimized for touchscreens on iOS (iPhone/iPad) and Android devices, as well as desktop computers.`
    },
    {
      q: `Is ${title} unblocked to play at school or work?`,
      a: `Yes! ${title} is a lightweight HTML5 web game delivered over secure HTTPS, making it easily accessible and playable on school Chromebooks and restricted office networks without administrative rights.`
    },
    {
      q: `Do I need to create an account to save my score in ${title}?`,
      a: `No account is required to play immediately. However, signing in to your free Spielcade account lets you track your stats, earn achievements, and submit your scores to global leaderboards.`
    }
  ];
}

/**
 * Generate a list of SEO tags and search keywords
 */
export function generateGameTags(title: string, category: string, rawTags: string = ''): string[] {
  const baseTags = [
    title.toLowerCase(),
    `${title.toLowerCase()} online`,
    `free ${title.toLowerCase()}`,
    `${title.toLowerCase()} unblocked`,
    `${category.toLowerCase()} games`,
    'free online games',
    'html5 games',
    'no download games',
    'browser games'
  ];

  if (rawTags) {
    const split = rawTags.split(',').map(t => t.trim().toLowerCase()).filter(Boolean);
    return Array.from(new Set([...baseTags, ...split])).slice(0, 12);
  }

  return baseTags;
}

/**
 * Complete SEO Enrichment Pipeline for a Raw Game Feed Item
 */
export function enrichGameForDatabase(rawItem: RawGameFeedItem): EnrichedGameRecord {
  const category = normalizeCategory(rawItem.category, rawItem.title, rawItem.description);
  const slug = slugifyGameTitle(rawItem.title);
  const description = generateEnrichedDescription(rawItem.title, category, rawItem.description);
  const strategy = generateStrategyContent(rawItem.title, category, rawItem.instructions);
  const keyboardControls = generateControlsMatrix(rawItem.instructions, category);
  const faqs = generateGameFaqs(rawItem.title, category);
  const tags = generateGameTags(rawItem.title, category, rawItem.tags);

  return {
    title: rawItem.title,
    slug,
    description,
    category,
    image_url: rawItem.thumb,
    source_url: rawItem.url,
    status: 'active',
    rating: rawItem.rating || 4.8,
    total_plays: rawItem.plays || Math.floor(Math.random() * 40000) + 5000,
    metadata: {
      strategy,
      keyboardControls,
      faqs,
      tags,
      developer: 'Spielcade Partner Network',
      releaseDate: new Date().toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
      platform: 'Web Browser (HTML5)'
    }
  };
}
