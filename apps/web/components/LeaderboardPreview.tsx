import { Trophy, Medal, Award } from 'lucide-react';
import Link from 'next/link';

const leaderboardData = [
  { rank: 1, user: 'SpeedKing', score: 145020, game: 'Cyberpunk Racing' },
  { rank: 2, user: 'SnakeMaster', score: 9840, game: 'Classic Snake' },
  { rank: 3, user: 'PuzzlePro', score: 8500, game: 'Sudoku Pro' },
  { rank: 4, user: 'NoobSlayer', score: 8200, game: 'Ultimate Chess' },
  { rank: 5, user: 'CasualGamer', score: 7100, game: 'Flappy Clone' },
];

export default function LeaderboardPreview() {
  return (
    <div className="bg-gray-50 dark:bg-gray-800/50 rounded-2xl border border-black/5 dark:border-white/5 overflow-hidden">
      <div className="p-6 border-b border-black/5 dark:border-white/5 flex items-center justify-between">
        <h3 className="font-outfit text-xl font-bold flex items-center">
          <Trophy className="w-5 h-5 text-warning mr-2" /> Global Top Players
        </h3>
        <Link href="/leaderboards" className="text-sm font-semibold text-primary hover:underline">
          Full Rankings
        </Link>
      </div>
      <div className="divide-y divide-black/5 dark:divide-white/5">
        {leaderboardData.map((player, idx) => (
          <div key={idx} className="p-4 flex items-center hover:bg-black/5 dark:hover:bg-white/5 transition-colors">
            <div className="w-8 font-bold text-gray-400 flex items-center justify-center">
              {player.rank === 1 ? <Trophy className="w-5 h-5 text-warning" /> : 
               player.rank === 2 ? <Medal className="w-5 h-5 text-gray-400" /> : 
               player.rank === 3 ? <Medal className="w-5 h-5 text-amber-700" /> : 
               `#${player.rank}`}
            </div>
            <div className="flex-grow ml-4">
              <div className="font-semibold">{player.user}</div>
              <div className="text-xs text-gray-500 dark:text-gray-400">{player.game}</div>
            </div>
            <div className="font-mono font-bold text-accent">
              {player.score.toLocaleString()} pts
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
