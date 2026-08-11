export interface BlogPost {
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  date: string;
  readTime: string;
  category: string;
  imageUrl: string;
  author: {
    name: string;
    avatar: string;
  };
}

// Simulated data to emulate a Headless CMS response
const MOCK_POSTS: BlogPost[] = [
  {
    slug: 'top-10-puzzle-games-2026',
    title: 'Top 10 Puzzle Games to Keep Your Brain Sharp in 2026',
    excerpt: 'Discover the most challenging and rewarding puzzle browser games available right now. No downloads required!',
    content: `
      <h2>The Rise of Browser-Based Puzzle Games</h2>
      <p>Puzzle games have always been a staple of gaming, but in 2026, browser-based puzzles have reached new heights in complexity and visual design. Thanks to modern WebGL and HTML5 capabilities, you no longer need a console to experience mind-bending mechanics.</p>
      
      <h3>1. The Evolution of Grid Mechanics</h3>
      <p>Games like <strong>Neon Snake</strong> have revolutionized how we interact with simple grids. By introducing multi-layered objectives and time-bending mechanics, the standard grid has become a playground for innovation.</p>
      
      <h3>2. Physics-Based Brain Teasers</h3>
      <p>Physics engines in the browser are incredibly robust now. Titles focusing on gravity, fluid dynamics, and momentum are offering puzzles that feel grounded and tactile.</p>
      
      <h2>Why You Should Play Daily</h2>
      <p>Playing puzzle games daily isn't just about entertainment; it's about cognitive maintenance. Studies show that engaging with spatial reasoning puzzles can improve problem-solving skills in everyday life.</p>
    `,
    date: '2026-08-11',
    readTime: '5 min read',
    category: 'Guides',
    imageUrl: 'https://images.unsplash.com/photo-1611162616305-c69b3fa7fbe0?w=800&q=80',
    author: {
      name: 'Alex Gamer',
      avatar: 'https://i.pravatar.cc/150?u=alex',
    },
  },
  {
    slug: 'how-to-master-arcade-games',
    title: 'Mastering the Arcade: Tips for High Scores',
    excerpt: 'Struggling to beat the global leaderboard? Here are pro tips to improve your reaction time and strategy.',
    content: `
      <h2>The Secret to Arcade Dominance</h2>
      <p>Arcade games require a mix of raw reaction speed and pattern recognition. If you find yourself hitting a wall, it's usually because you are reacting instead of anticipating.</p>
      
      <h3>Focus on the Center of the Screen</h3>
      <p>In bullet-hell or fast-paced arcade games, your eyes should be focused slightly ahead of your character. Let your peripheral vision handle immediate dodging.</p>
      
      <h3>Take Breaks</h3>
      <p>Reaction times degrade after 45 minutes of intense focus. Step away, rest your eyes, and come back. You'll often find that a level you were stuck on suddenly feels much slower.</p>
    `,
    date: '2026-08-09',
    readTime: '4 min read',
    category: 'Strategy',
    imageUrl: 'https://images.unsplash.com/photo-1552820728-8b83bb6b773f?w=800&q=80',
    author: {
      name: 'Sam Highscore',
      avatar: 'https://i.pravatar.cc/150?u=sam',
    },
  },
  {
    slug: 'browser-gaming-vs-console',
    title: 'Why Browser Gaming is Making a Massive Comeback',
    excerpt: 'With cloud gaming and WebGPU, the line between browser and console gaming is blurring faster than ever.',
    content: `
      <h2>No Downloads, No Patches</h2>
      <p>The greatest strength of browser gaming in 2026 is immediate access. While console gamers wait for 50GB day-one patches, browser gamers are instantly in the action.</p>
      
      <h3>The Power of WebGPU</h3>
      <p>With WebGPU now standard across major browsers, developers are unleashing near-native performance. 3D games that would have melted a laptop five years ago now run flawlessly at 60FPS in a simple browser tab.</p>
      
      <h2>The Future is Link-Based</h2>
      <p>Sharing a game is as simple as sending a URL. This friction-free sharing mechanism is driving unprecedented virality for indie developers.</p>
    `,
    date: '2026-08-05',
    readTime: '6 min read',
    category: 'Industry News',
    imageUrl: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=800&q=80',
    author: {
      name: 'Jordan Tech',
      avatar: 'https://i.pravatar.cc/150?u=jordan',
    },
  },
];

export async function getAllPosts(): Promise<BlogPost[]> {
  // In the future, replace this with a fetch to your Headless CMS
  return MOCK_POSTS;
}

export async function getPostBySlug(slug: string): Promise<BlogPost | null> {
  const post = MOCK_POSTS.find(p => p.slug === slug);
  return post || null;
}
