import React from 'react';
import Link from 'next/link';
import { Gamepad2, Trophy, Heart, Star } from 'lucide-react';

export default function ProfileActivity() {
  const activities = [
    { id: 1, icon: Trophy, color: 'text-green-500', bg: 'bg-green-500/20', text: 'You earned the achievement "Score Master"', time: '2 hours ago' },
    { id: 2, icon: Gamepad2, color: 'text-blue-500', bg: 'bg-blue-500/20', text: 'You played Sudoku and scored 520 points', time: 'Yesterday' },
    { id: 3, icon: Star, color: 'text-yellow-500', bg: 'bg-yellow-500/20', text: 'You reached Level 28', time: '2 days ago' },
    { id: 4, icon: Heart, color: 'text-red-500', bg: 'bg-red-500/20', text: 'You added Chess to your favorites', time: '3 days ago' },
  ];

  return (
    <div className="bg-[#111228] border border-white/5 rounded-2xl p-5 flex flex-col h-full">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-bold text-white">Activity Feed</h3>
        <Link href="/profile/activity" className="text-[#6366F1] text-xs font-bold hover:text-white transition-colors">
          View All
        </Link>
      </div>

      <div className="flex flex-col gap-4 flex-1">
        {activities.map((activity) => (
          <div key={activity.id} className="flex items-center gap-4 border-b border-white/5 pb-4 last:border-0 last:pb-0">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${activity.bg}`}>
              <activity.icon className={`w-5 h-5 ${activity.color}`} />
            </div>
            <div className="flex flex-col flex-1">
              <span className="text-sm text-gray-300 font-medium line-clamp-2">
                {/* Highlight specific words based on the text structure */}
                {activity.text.split('"Score Master"').length > 1 ? (
                  <>You earned the achievement <span className="font-bold text-white">"Score Master"</span></>
                ) : activity.text.split('Sudoku').length > 1 ? (
                  <>You played <span className="font-bold text-white">Sudoku</span> and scored <span className="text-green-400 font-bold">520 points</span></>
                ) : activity.text.split('Level 28').length > 1 ? (
                  <>You reached <span className="font-bold text-white">Level 28</span></>
                ) : activity.text.split('Chess').length > 1 ? (
                  <>You added <span className="font-bold text-white">Chess</span> to your favorites</>
                ) : (
                  activity.text
                )}
              </span>
            </div>
            <span className="text-[10px] text-gray-500 whitespace-nowrap">{activity.time}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
