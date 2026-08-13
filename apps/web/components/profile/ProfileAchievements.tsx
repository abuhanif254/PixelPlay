import React from 'react';
import Link from 'next/link';
import { Gamepad2, Star, Flame, Package, Trophy } from 'lucide-react';

export default function ProfileAchievements() {
  const achievements = [
    { id: 1, title: 'First Steps', desc: 'Play 1 game', icon: Gamepad2, color: '#10B981', gradient: 'from-green-500 to-emerald-700' },
    { id: 2, title: 'Score Master', desc: 'Score 10,000 points', icon: Star, color: '#3B82F6', gradient: 'from-blue-400 to-blue-700' },
    { id: 3, title: 'Streak 7', desc: '7 days streak', icon: Flame, color: '#F97316', gradient: 'from-orange-400 to-red-600' },
    { id: 4, title: 'Collector', desc: 'Save 10 games', icon: Package, color: '#8B5CF6', gradient: 'from-purple-400 to-purple-700' },
    { id: 5, title: 'Winner', desc: 'Win 50 games', icon: Trophy, color: '#EAB308', gradient: 'from-yellow-400 to-yellow-600' },
  ];

  return (
    <div className="bg-[#111228] border border-white/5 rounded-2xl p-5 flex flex-col h-full">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-bold text-white">Achievements</h3>
        <Link href="/profile/achievements" className="text-[#6366F1] text-xs font-bold hover:text-white transition-colors">
          View All
        </Link>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
        {achievements.map((ach) => (
          <div key={ach.id} className="flex flex-col items-center text-center group cursor-pointer">
            {/* Hexagon Shape */}
            <div className="relative w-16 h-16 sm:w-20 sm:h-20 mb-3 drop-shadow-xl group-hover:-translate-y-1 transition-transform">
              <div 
                className={`absolute inset-0 bg-gradient-to-b ${ach.gradient} opacity-20 blur-md group-hover:opacity-40 transition-opacity`}
              ></div>
              {/* CSS Hexagon using clip-path */}
              <div 
                className={`w-full h-full bg-gradient-to-br ${ach.gradient} flex items-center justify-center relative overflow-hidden`}
                style={{ clipPath: 'polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)' }}
              >
                {/* Inner smaller hexagon for border effect */}
                <div 
                  className="w-[92%] h-[92%] bg-gradient-to-tr from-[#111228] to-[#1A1C3D] flex items-center justify-center"
                  style={{ clipPath: 'polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)' }}
                >
                  <div 
                    className={`w-[85%] h-[85%] bg-gradient-to-br ${ach.gradient} flex items-center justify-center shadow-inner`}
                    style={{ clipPath: 'polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)' }}
                  >
                    <ach.icon className="w-8 h-8 text-white drop-shadow-md" strokeWidth={1.5} />
                  </div>
                </div>
              </div>
            </div>
            <h4 className="text-xs font-bold text-white mb-0.5">{ach.title}</h4>
            <p className="text-[10px] text-gray-500 leading-tight">{ach.desc}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
