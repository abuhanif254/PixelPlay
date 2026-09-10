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

function stringHash(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

/**
 * Generate rich, multi-variant, high-ranking SEO description
 * Uses varied sentence architectures to prevent algorithmic duplicate-content penalties
 */
export function generateEnrichedDescription(title: string, category: string, rawDescription: string = ''): string {
  const cleanRaw = rawDescription.replace(/<[^>]*>?/gm, '').trim();
  const hash = stringHash(title + category);

  const introTemplates = [
    `Immerse yourself in **${title}**, a premier ${category.toLowerCase()} web game engineered for fast, responsive action directly in your browser with zero installation needed.`,
    `Looking for top-tier free online gaming? **${title}** delivers an engaging ${category.toLowerCase()} experience packed with fluid mechanics, challenging milestones, and instant browser accessibility.`,
    `Take control in **${title}**, an exhilarating free-to-play ${category.toLowerCase()} title where precision timing, strategic planning, and quick reflexes lead directly to leaderboard dominance.`,
    `Jump into **${title}**—a highly rated ${category.toLowerCase()} game playable on desktops, tablets, and mobile devices without downloading any software or creating an account.`
  ];

  const categoryFeatures: Record<string, string[]> = {
    Racing: [
      `Take tight corners, test tire-burning drifting physics, and push high-speed supercars to their limits across meticulously crafted courses.`,
      `Master acceleration curves, out-maneuver rival racers, and shave split-seconds off your lap times in pulse-pounding vehicular action.`,
      `Experience responsive steering, turbo boost mechanics, and dynamic track layouts designed to reward fearless driving.`
    ],
    Puzzle: [
      `Engage your cognitive logic, decipher intricate pattern relationships, and discover clever solutions across multi-stage spatial challenges.`,
      `Sharpen your mental agility, plan several moves in advance, and unleash high-scoring cascade combos with satisfying chain reactions.`,
      `Exercise problem-solving reflexes through progressively complex puzzles that balance relaxed exploration with high-stakes brain teasers.`
    ],
    Action: [
      `Dodge enemy barrages, execute precise combat combos, and navigate intense arena hazards where every split-second decision counts.`,
      `Battle waves of hostile forces, upgrade tactical abilities, and survive escalating combat encounters in an adrenaline-fueled battleground.`,
      `Harness fluid movement mechanics, rapid-fire attacks, and tactical positioning to overcome formidable bosses and record-breaking challenges.`
    ],
    Strategy: [
      `Formulate tactical roadmaps, manage critical resources under pressure, and outthink your opponents across calculated turns.`,
      `Build, expand, and defend your positions through smart decision-making, adaptive defenses, and ruthless tactical foresight.`,
      `Deploy strategic counter-measures, analyze the battlefield, and coordinate victorious campaigns against relentless competitors.`
    ],
    Sports: [
      `Experience the thrill of championship tournaments, master authentic ball physics, and execute game-winning plays with pinpoint accuracy.`,
      `Compete in realistic athletic showdowns, time your moves perfectly, and lead your squad to trophy glory across global sports arenas.`,
      `Fine-tune shot power, read incoming trajectory angles, and celebrate clutch moments in high-energy competitive athletic matchups.`
    ],
    Board: [
      `Enjoy modernized digital board game mechanics, out-wit artificial intelligence or live rivals, and enjoy classic tactical depth.`,
      `Calculate every roll, anticipate opponent moves, and implement time-tested master strategies on a clean virtual game board.`,
      `Combine luck with sharp tactical insight to dominate traditional tabletop challenges crafted for rapid browser play.`
    ],
    Adventure: [
      `Traverse mysterious terrains, uncover hidden secrets, and navigate immersive quests designed with rich atmosphere and exploration.`,
      `Collect rare relics, solve environmental riddles, and embark on an unforgettable hero's voyage through dangerous forgotten realms.`,
      `Unravel rich lore, conquer treacherous obstacles, and write your own legend across beautifully illustrated landscape zones.`
    ],
    Arcade: [
      `Relive the golden era of arcade gaming with modern responsive polish, addictive gameplay loops, and endless high-score chasing.`,
      `Collect valuable score multipliers, survive relentless hazard escalation, and prove your lightning-quick reflexes against global players.`,
      `Enjoy pure, unfiltered gaming excitement featuring vibrant visuals, instant restarts, and intuitive one-click control mechanics.`
    ]
  };

  const catOptions = categoryFeatures[category] || categoryFeatures['Arcade'];
  const featureText = catOptions[hash % catOptions.length];

  const valueProps = [
    `Whether you have a 5-minute break at the office or an afternoon free at home, ${title} offers an ideal balance of casual pickup-and-play ease and deep mastery potential.`,
    `Compete against your friends, track your performance metrics, and push your personal high score higher with every attempt in this addictive community favorite.`,
    `Optimized with cutting-edge HTML5 and WebGL engines, the game delivers buttery-smooth 60 FPS performance without heating up your device or draining battery life.`
  ];
  const valueText = valueProps[(hash >> 2) % valueProps.length];

  const unblockedNote = `**Unblocked & Chromebook Ready:** Play **${title}** 100% free on Spielcade today. Designed to run seamlessly across all major browsers (Google Chrome, Microsoft Edge, Mozilla Firefox, Safari) with zero downloads required and full accessibility at school, work, or home.`;

  let primaryIntro = cleanRaw;
  if (!primaryIntro || primaryIntro.length < 40) {
    primaryIntro = introTemplates[hash % introTemplates.length];
  }

  return `${primaryIntro}\n\n${featureText} ${valueText}\n\n${unblockedNote}`;
}

/**
 * Generate structured Strategy & How to Play content with Pro Tips
 */
export function generateStrategyContent(title: string, category: string, rawInstructions: string = ''): string {
  const cleanInstructions = rawInstructions ? rawInstructions.replace(/<[^>]*>?/gm, '').trim() : '';

  const tipsMap: Record<string, string[]> = {
    Racing: [
      'Brake slightly before apex turns to maintain maximum exit velocity down straightaways.',
      'Feather your nitro boost out of tight corners rather than dumping it all on straight paths.',
      'Learn the optimal racing line—inside lines minimize overall distance traveled per lap.'
    ],
    Puzzle: [
      'Scan the entire board before making your first move to uncover multi-layer combo sequences.',
      'Prioritize clearing obstacles on lower rows to trigger cascade falls and automatic matches.',
      'Save power-ups and special items for moments when no natural moves remain.'
    ],
    Action: [
      'Keep constantly in motion—stationary players become easy targets for projectile barrages.',
      'Master the timing of your defensive dodge or jump to exploit enemy attack cooldowns.',
      'Focus fire on weaker perimeter foes first to reduce total incoming damage.'
    ],
    Strategy: [
      'Invest early resources into economy generators to sustain long-term army production.',
      'Scout opponent positioning continuously to deploy appropriate counter-units.',
      'Maintain flexible defensive lines rather than over-committing to a single frontline.'
    ],
    Sports: [
      'Watch opponent movement momentum to pass or shoot against their running direction.',
      'Practice power meter release timing to achieve consistent sweet-spot accuracy.',
      'Utilize tactical pauses to reset team formation before critical offensive pushes.'
    ],
    Arcade: [
      'Prioritize survival over risky point pickups—longer runs yield exponential score multipliers.',
      'Stay near the center of the playfield to leave maximum reaction room for random hazards.',
      'Rhythm and steady breathing help maintain peak hand-eye coordination during speed spikes.'
    ]
  };

  const selectedTips = tipsMap[category] || tipsMap['Arcade'];
  const instructionsHtml = cleanInstructions 
    ? `<p class="mb-3"><strong>Core Objective:</strong> ${cleanInstructions}</p>` 
    : `<p class="mb-3"><strong>Core Objective:</strong> Guide your character or pieces through progressive challenges, react quickly to environmental hazards, and rack up the highest score possible in <strong>${title}</strong>.</p>`;

  const tipsListHtml = `
    <h4 class="font-bold text-base mt-4 mb-2 text-indigo-600 dark:text-indigo-400">Pro Tips for High Scores:</h4>
    <ul class="list-disc pl-5 space-y-1.5 text-sm">
      ${selectedTips.map(t => `<li>${t}</li>`).join('')}
    </ul>
  `;

  return `${instructionsHtml}${tipsListHtml}`;
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
 * Generate 7 high-intent FAQ items for rich Google Search results
 */
export function generateGameFaqs(title: string, category: string): Array<{ q: string; a: string }> {
  return [
    {
      q: `How can I play ${title} online for free?`,
      a: `You can play ${title} completely free on Spielcade. No downloads, app store installations, or paid subscriptions are required. Just launch the game directly in any modern browser window and enjoy immediate gameplay.`
    },
    {
      q: `Is ${title} unblocked to play at school or on Chromebooks?`,
      a: `Yes! ${title} is hosted over secure SSL/HTTPS and built on lightweight HTML5 technology. Because it does not require administrative installations or third-party executable files, it runs smoothly on school Chromebooks, library computers, and office networks.`
    },
    {
      q: `Can I play ${title} on mobile phones and tablets?`,
      a: `Yes, ${title} features responsive design that automatically scales to touchscreen displays on Apple iOS (iPhone, iPad) and Android devices, as well as Windows PCs and Mac laptops.`
    },
    {
      q: `What are the best tips to achieve a high score in ${title}?`,
      a: `To maximize your score in ${title}, study the timing of obstacles, chain consecutive achievements for combo multipliers, and take advantage of keyboard shortcuts or precise touch inputs described in our controls section.`
    },
    {
      q: `Does ${title} require Flash Player to run?`,
      a: `No. Flash Player is obsolete and unsupported. ${title} is developed with modern HTML5, Canvas, and WebGL web standards, guaranteeing safe, high-speed execution without any external plugins.`
    },
    {
      q: `Do I need an account to save my game progress?`,
      a: `You can play immediately as a guest with local progress saved in your browser cache. Signing up for a free Spielcade account enables automatic cloud backup, cross-device synchronization, and global leaderboard rankings.`
    },
    {
      q: `Can I play ${title} in full screen mode?`,
      a: `Yes. Click the Fullscreen icon located in the bottom control bar of the game player to expand ${title} to your full display for an immersive, distraction-free gaming session.`
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
    `${title.toLowerCase()} for chromebook`,
    `${category.toLowerCase()} games`,
    'free online games',
    'html5 games',
    'no download games',
    'unblocked games',
    'browser games',
    'instant play'
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
