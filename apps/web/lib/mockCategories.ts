export const categoriesData = {
  'action-games': {
    title: 'Action Games',
    slug: 'action-games',
    icon: '⚔️',
    description: 'Jump into the heat of the moment with our thrilling action games. Fast-paced, explosive, and intense!',
    stats: { games: '98+', plays: '4.5M+', rating: '4.8' },
    color: '#EF4444', // Red
  },
  'adventure-games': {
    title: 'Adventure Games',
    slug: 'adventure-games',
    icon: '🗺️',
    description: 'Embark on epic journeys, explore unknown worlds, and uncover hidden treasures.',
    stats: { games: '56+', plays: '1.2M+', rating: '4.7' },
    color: '#10B981', // Green
  },
  'arcade-games': {
    title: 'Arcade Games',
    slug: 'arcade-games',
    icon: '👾',
    description: 'Relive the golden age of gaming with classic and modern arcade experiences.',
    stats: { games: '82+', plays: '3.1M+', rating: '4.6' },
    color: '#F59E0B', // Yellow
  },
  'board-games': {
    title: 'Board Games',
    slug: 'board-games',
    icon: '🎲',
    description: 'Play digital versions of your favorite classic board games with friends or AI.',
    stats: { games: '43+', plays: '890K+', rating: '4.5' },
    color: '#8B5CF6', // Purple
  },
  'puzzle-games': {
    title: 'Puzzle Games',
    slug: 'puzzle-games',
    icon: '🧩',
    description: 'Challenge your mind with our collection of the best puzzle games. Solve, match, connect, and win!',
    stats: { games: '125+', plays: '2.3M+', rating: '4.6' },
    color: '#6366F1', // Indigo (Default)
  },
  'racing-games': {
    title: 'Racing Games',
    slug: 'racing-games',
    icon: '🏎️',
    description: 'Burn rubber and race to the finish line in our high-speed racing games.',
    stats: { games: '67+', plays: '5.6M+', rating: '4.7' },
    color: '#3B82F6', // Blue
  },
  'sports-games': {
    title: 'Sports Games',
    slug: 'sports-games',
    icon: '🏅',
    description: 'Compete in your favorite sports, from basketball to soccer and everything in between.',
    stats: { games: '32+', plays: '1.9M+', rating: '4.4' },
    color: '#F97316', // Orange
  },
  'strategy-games': {
    title: 'Strategy Games',
    slug: 'strategy-games',
    icon: '♟️',
    description: 'Plan your moves, build your empire, and outsmart your opponents.',
    stats: { games: '41+', plays: '2.8M+', rating: '4.8' },
    color: '#14B8A6', // Teal
  }
};

export type CategoryData = typeof categoriesData['puzzle-games'];
