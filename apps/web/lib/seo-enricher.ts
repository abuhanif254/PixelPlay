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
 * Strip legacy hardcoded boilerplate paragraphs and markdown asterisks that were stored in DB rows
 */
export function stripLegacyBoilerplate(rawDescription: string = ''): string {
  if (!rawDescription) return '';
  return rawDescription
    .replace(/<[^>]*>?/gm, '')
    .replace(/Featuring smooth mechanics,\s*dynamic gameplay,[\s\S]*$/i, '')
    .replace(/Play\s+\*\*.*?\*\*\s+online for free on Spielcade today[\s\S]*$/i, '')
    .replace(/\*\*Unblocked & Chromebook Ready:\*\*[\s\S]*$/i, '')
    .replace(/\*\*/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Generate rich, multi-variant, high-ranking SEO description
 * Uses varied sentence architectures and strips legacy boilerplate to prevent algorithmic duplicate-content penalties
 */
export function generateEnrichedDescription(title: string, category: string, rawDescription: string = ''): string {
  const cleanRaw = stripLegacyBoilerplate(rawDescription);
  const hash = stringHash(`${title}::${category}`);
  const catLower = (category || 'Arcade').toLowerCase();

  const introTemplates = [
    `Immerse yourself in ${title}, a premier ${catLower} web game engineered for fast, responsive action directly in your browser with zero installation needed.`,
    `Looking for top-tier free online gaming? ${title} delivers an engaging ${catLower} experience packed with fluid mechanics, challenging milestones, and instant browser accessibility.`,
    `Take control in ${title}, an exhilarating free-to-play ${catLower} title where precision timing, tactical awareness, and quick reflexes lead directly to high-score mastery.`,
    `Jump into ${title}—a standout ${catLower} game playable on desktops, tablets, and mobile phones without downloading any software or creating an account.`,
    `Step into the arena of ${title}, an instant-play HTML5 ${catLower} adventure crafted for players who appreciate tight controls and rewarding progression.`,
    `Experience ${title}, a community-favorite ${catLower} browser challenge that blends approachable pick-up-and-play mechanics with deep replayability.`,
  ];

  const categoryFeatures: Record<string, string[]> = {
    Racing: [
      `Take tight corners, test tire-burning drifting physics, and push high-speed vehicles to their limits across winding courses.`,
      `Master acceleration curves, out-maneuver rival racers, and shave split-seconds off your lap times in pulse-pounding vehicular action.`,
      `Experience responsive steering, nitro boost timing, and dynamic track layouts designed to reward fearless driving.`,
      `Balance grip and drift angles across tricky chicanes while avoiding traffic hazards and chasing the checkered flag.`,
    ],
    Puzzle: [
      `Engage your cognitive logic, decipher intricate pattern relationships, and discover clever solutions across multi-stage spatial challenges.`,
      `Sharpen your mental agility, plan several moves in advance, and unleash high-scoring cascade combos with satisfying chain reactions.`,
      `Exercise problem-solving reflexes through progressively complex stages that balance relaxed exploration with brain-teasing depth.`,
      `Analyze board layouts carefully, spot hidden symmetries, and clear tricky obstacles using smart sequence planning.`,
    ],
    Action: [
      `Dodge enemy barrages, execute precise combat combos, and navigate intense arena hazards where every split-second decision counts.`,
      `Battle waves of hostile forces, upgrade tactical abilities, and survive escalating encounters in an adrenaline-fueled battleground.`,
      `Harness fluid movement mechanics, rapid-fire attacks, and smart positioning to overcome formidable bosses and stage hazards.`,
      `Chain together agile dodges and counter-strikes as the pace intensifies across action-packed combat zones.`,
    ],
    Strategy: [
      `Formulate tactical roadmaps, manage critical resources under pressure, and outthink your opponents across calculated engagements.`,
      `Build, expand, and defend your positions through smart decision-making, adaptive defenses, and long-term foresight.`,
      `Deploy strategic counter-measures, analyze the battlefield, and coordinate victorious campaigns against relentless waves.`,
      `Balance offensive pushes with fortified defenses to control key territory and outlast rival commanders.`,
    ],
    Sports: [
      `Experience the thrill of championship tournaments, master authentic ball physics, and execute game-winning plays with pinpoint accuracy.`,
      `Compete in athletic showdowns, time your releases perfectly, and lead your squad to trophy glory across competitive arenas.`,
      `Fine-tune shot power, read incoming trajectory angles, and celebrate clutch moments in high-energy sporting matchups.`,
      `Outplay defenders with crisp footwork, accurate passing, and decisive finishing under scoreboard pressure.`,
    ],
    Board: [
      `Enjoy modernized digital tabletop mechanics, outwit artificial intelligence or live rivals, and explore classic tactical depth.`,
      `Calculate every move, anticipate opponent traps, and implement time-tested strategies on a clean virtual game board.`,
      `Combine probability management with sharp tactical insight to dominate traditional board challenges crafted for browser play.`,
      `Control the center of the board, set multi-turn traps, and convert small positional edges into decisive victories.`,
    ],
    Adventure: [
      `Traverse mysterious terrains, uncover hidden secrets, and navigate immersive quests designed with rich atmosphere and exploration.`,
      `Collect rare relics, solve environmental riddles, and embark on an unforgettable hero's journey through dangerous realms.`,
      `Conquer treacherous platforming obstacles, unlock new pathways, and test your courage across handcrafted world zones.`,
      `Interact with dynamic environments, evade ancient traps, and piece together clues to reach the final objective.`,
    ],
    Arcade: [
      `Relive the golden spirit of arcade gaming with modern responsive polish, addictive gameplay loops, and endless high-score chasing.`,
      `Collect valuable score multipliers, survive relentless hazard escalation, and test your hand-eye coordination in fast sessions.`,
      `Enjoy pure, unfiltered gaming excitement featuring vibrant visuals, instant restarts, and intuitive control mechanics.`,
      `Build unstoppable combo streaks, weave through shifting obstacle patterns, and set a new personal record on every run.`,
    ],
  };

  const catOptions = categoryFeatures[category] || categoryFeatures['Arcade'];
  const featureText = catOptions[hash % catOptions.length];

  const valueProps = [
    `Whether you have a quick 5-minute break or a longer gaming session, ${title} offers an ideal balance of accessibility and skill ceiling.`,
    `Track your personal bests, refine your timing on each replay, and see how far you can push your score in ${title}.`,
    `Built on lightweight HTML5 and WebGL web standards, ${title} loads in seconds and runs smoothly across desktop PCs, Chromebooks, iPhones, iPads, and Android devices.`,
    `With zero downloads or plugins required, you can launch ${title} directly in Chrome, Safari, Edge, or Firefox whenever you want to play.`,
    `Every round in ${title} introduces fresh tactical moments that reward patience, pattern recognition, and steady execution.`,
  ];
  const valueText = valueProps[(hash >> 3) % valueProps.length];

  let primaryIntro = cleanRaw;
  if (!primaryIntro || primaryIntro.length < 35) {
    primaryIntro = introTemplates[hash % introTemplates.length];
  }

  return `${primaryIntro} ${featureText} ${valueText}`;
}

/**
 * Generate structured Strategy & How to Play content with Pro Tips
 */
export function generateStrategyContent(title: string, category: string, rawInstructions: string = ''): string {
  const cleanInstructions = stripLegacyBoilerplate(rawInstructions);
  const hash = stringHash(`strategy::${title}::${category}`);

  const tipsMap: Record<string, string[]> = {
    Racing: [
      'Brake slightly before entering tight corners so you can accelerate earlier on the exit.',
      'Save your nitro boost for recovery after collisions or long straightaways.',
      'Hug the inside apex on curved tracks to minimize total travel distance.',
      'Watch upcoming track markers early to anticipate hairpins and obstacles.',
      'Feather steering inputs at top speed to prevent over-drifting into barriers.',
    ],
    Puzzle: [
      'Scan the entire board before making your first move to spot multi-step chain reactions.',
      'Focus on clearing bottom or corner blockers first to open up space for new pieces.',
      'Reserve special boosters and hints for high-density board states.',
      'Look two moves ahead so each placement sets up your next combination.',
      'Avoid rushing early turns—accuracy builds higher combo multipliers than speed alone.',
    ],
    Action: [
      'Keep moving laterally—standing still makes you an easy target for ranged attacks.',
      'Learn enemy attack wind-ups so you can dodge or counter during their cooldown window.',
      'Clear fast perimeter enemies first before focusing damage on heavy bosses.',
      'Use terrain cover and corners to break line-of-sight when outnumbered.',
      'Prioritize mobility and defense upgrades early to survive longer waves.',
    ],
    Strategy: [
      'Invest early resources into economy or unit generation to build a sustainable advantage.',
      'Place ranged defense units behind choke points to maximize their firing time.',
      'Scout incoming wave compositions and mix unit types to counter armor and speed.',
      'Upgrade core defensive structures in key lanes before expanding outward.',
      'Keep a small reserve of resources ready for emergency reinforcements.',
    ],
    Sports: [
      'Read defender momentum and pass or shoot into open space against their movement.',
      'Practice your release timing to hit the green accuracy window consistently.',
      'Mix up short passes and long shots to keep AI defenders off balance.',
      'Position your player early before the ball arrives for cleaner one-touch shots.',
      'Protect your stamina or boost meter for the final stretch of close matches.',
    ],
    Arcade: [
      'Prioritize survival over risky pickups—staying alive longer multiplies your score faster.',
      'Stay near the center of the play area to give yourself maximum reaction time.',
      'Focus on rhythm and pattern recognition as obstacle speed ramps up.',
      'Chain consecutive pickups without missing to keep your score multiplier active.',
      'Make small, controlled adjustments rather than holding directional keys too long.',
    ],
  };

  const pool = tipsMap[category] || tipsMap['Arcade'];
  const selectedTips = [
    pool[hash % pool.length],
    pool[(hash + 1) % pool.length],
    pool[(hash + 2) % pool.length],
  ];

  const instructionsHtml = cleanInstructions && cleanInstructions.length > 20
    ? `<p class="mb-3"><strong>How to Play ${title}:</strong> ${cleanInstructions}</p>`
    : `<p class="mb-3"><strong>Objective:</strong> Master the controls in <strong>${title}</strong>, react to dynamic ${category.toLowerCase()} challenges, and build streaks to achieve a top score.</p>`;

  const tipsListHtml = `
    <h4 class="font-bold text-base mt-4 mb-2 text-indigo-600 dark:text-indigo-400">Key Tactics:</h4>
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
 * Generate game-specific FAQ items selected deterministically from a 12-question pool to avoid duplicate FAQ boilerplate across games
 */
export function generateGameFaqs(title: string, category: string): Array<{ q: string; a: string }> {
  const hash = stringHash(`faq::${title}::${category}`);
  const catLower = (category || 'Arcade').toLowerCase();

  const faqPool: Array<{ q: string; a: string }> = [
    {
      q: `How do I play ${title} online for free?`,
      a: `Click the Play button at the top of this page to launch ${title} directly in your web browser. It is 100% free on Spielcade with no downloads, installations, or sign-ups required.`,
    },
    {
      q: `What genre is ${title} and what are the main mechanics?`,
      a: `${title} is an HTML5 ${catLower} game. Players use keyboard, mouse, or touchscreen inputs to complete stages, overcome ${catLower} obstacles, and aim for a high score.`,
    },
    {
      q: `Can I play ${title} unblocked on a school Chromebook?`,
      a: `Yes, ${title} runs over standard HTTPS using native HTML5 and WebGL without external plugins or executables, making it fully compatible with school Chromebooks and restricted networks.`,
    },
    {
      q: `Does ${title} work on mobile phones and tablets?`,
      a: `Yes! ${title} supports responsive touchscreen controls on iOS (iPhone and iPad) and Android smartphones as well as desktop browsers.`,
    },
    {
      q: `How do I get a higher score in ${title}?`,
      a: `Focus on consistent timing, avoid early mistakes to preserve your combo multiplier, and check the Controls and Tips sections on this page to master ${title}'s core mechanics.`,
    },
    {
      q: `Is Flash Player needed to run ${title}?`,
      a: `No. ${title} is built with modern HTML5 canvas and WebGL technology, so it plays smoothly in Chrome, Safari, Edge, and Firefox without Flash or extra extensions.`,
    },
    {
      q: `How is my progress saved in ${title}?`,
      a: `${title} automatically stores your local progress and high scores in your browser storage. You can also sign in to a free Spielcade account to track XP and leaderboard stats.`,
    },
    {
      q: `Can I play ${title} in fullscreen mode?`,
      a: `Yes. Use the Fullscreen button on the bottom toolbar of the game player to expand ${title} across your entire screen.`,
    },
    {
      q: `What other games are similar to ${title}?`,
      a: `If you enjoy ${title}, check out the "Games Like ${title}" section below or browse our ${category} Games hub for dozens of related free browser titles.`,
    },
    {
      q: `Why is ${title} not loading or running slowly?`,
      a: `If ${title} feels slow, try closing unused browser tabs, enabling hardware acceleration in your browser settings, or refreshing the page to reload the HTML5 assets.`,
    },
  ];

  const selected: Array<{ q: string; a: string }> = [];
  for (let i = 0; i < 4; i++) {
    selected.push(faqPool[(hash + i * 2) % faqPool.length]);
  }
  return selected;
}

/**
 * Generate a list of SEO tags and search keywords
 */
export function generateGameTags(title: string, category: string, rawTags: string = ''): string[] {
  const lowerTitle = (title || '').toLowerCase();
  const matchedTopics: string[] = [];

  const topicKeywords = [
    'stickman', 'zombie', 'sniper', 'drift', 'car', 'bike', 'moto', 'truck', 'bus',
    'basketball', 'football', 'soccer', 'tennis', 'pool', 'billiards', 'bowling', 'golf',
    'chess', 'mahjong', 'solitaire', '2048', 'jigsaw', 'bubble', 'match', 'word', 'math',
    'escape', 'horror', 'parkour', 'runner', 'ninja', 'tank', 'war', 'defense', 'clicker',
    'idle', 'merge', 'dress up', 'cooking', '2 player', 'multiplayer', 'io', '3d', 'physics'
  ];

  for (const kw of topicKeywords) {
    if (lowerTitle.includes(kw)) {
      matchedTopics.push(kw);
    }
  }

  const baseTags = [
    `${category.toLowerCase()} games`,
    ...matchedTopics,
    'unblocked games',
    'chromebook games',
    'no download games',
    'free online games',
    'html5 games',
    'browser games',
  ];

  if (rawTags) {
    const split = rawTags
      .split(',')
      .map((t) => t.trim().toLowerCase())
      .filter((t) => t.length >= 3 && t.length <= 24 && t.split(/\s+/).length <= 2);
    return Array.from(new Set([...baseTags, ...split])).slice(0, 10);
  }

  return Array.from(new Set(baseTags)).slice(0, 10);
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
