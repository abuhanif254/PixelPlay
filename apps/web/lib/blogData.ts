export interface BlogPost {
  slug: string;
  title: string;
  description: string;
  keywords: string[];
  author: {
    name: string;
    avatar?: string;
  };
  date: string;
  coverImage: string;
  content?: string; // This could be HTML or Markdown string for full rendering later
}

export const blogRegistry: Record<string, BlogPost> = {
  'top-10-adventure-games-2024': {
    slug: 'top-10-adventure-games-2024',
    title: 'Top 10 Adventure Games You Should Play in 2024',
    description: 'Explore our handpicked list of the best adventure games that deliver epic stories, stunning worlds, and unforgettable moments.',
    keywords: ['adventure games', 'top 10 games', 'spielcade blog', 'gaming news', 'guides'],
    author: {
      name: 'Spielcade Team',
    },
    date: '2024-05-12T08:00:00+08:00',
    coverImage: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?q=80&w=1200&auto=format&fit=crop',
  },
  'beginners-guide-rpg-games': {
    slug: 'beginners-guide-rpg-games',
    title: 'A Beginner\'s Guide to RPG Games',
    description: 'New to RPGs? We break down everything you need to know to get started in the world of role-playing games.',
    keywords: ['rpg', 'role playing games', 'beginner guide', 'spielcade', 'tutorial'],
    author: {
      name: 'Spielcade Team',
    },
    date: '2024-05-10T08:00:00+08:00',
    coverImage: 'https://images.unsplash.com/photo-1511512578047-dfb367046420?q=80&w=1200&auto=format&fit=crop',
  },
  'improve-reflexes-action-games': {
    slug: 'improve-reflexes-action-games',
    title: 'How Action Games Can Improve Your Reflexes',
    description: 'Discover the science behind fast-paced gaming and how playing action games can boost your real-world reaction time.',
    keywords: ['action games', 'reflexes', 'gaming benefits', 'health', 'fast paced'],
    author: {
      name: 'Spielcade Team',
    },
    date: '2024-05-08T08:00:00+08:00',
    coverImage: 'https://images.unsplash.com/photo-1552820728-8b83bb6b773f?q=80&w=1200&auto=format&fit=crop',
  }
};

export function getBlogPost(slug: string): BlogPost | undefined {
  return blogRegistry[slug];
}

export function getAllBlogPosts(): BlogPost[] {
  return Object.values(blogRegistry).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}
