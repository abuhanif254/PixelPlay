import React from 'react';
import { Edit3, Gamepad2, Star, Trophy, Flame } from 'lucide-react';

export default function ProfileHero() {
  return (
    <div className="flex flex-col gap-6">
      
      {/* Top Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold font-outfit text-white mb-2">
            Welcome back, <span className="text-gray-100">GameMaster!</span> 👋
          </h1>
          <p className="text-gray-400 text-sm">Let's continue your gaming journey.</p>
        </div>
        <button className="flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-[#6366F1] to-purple-600 text-white text-sm font-bold rounded-xl hover:shadow-[0_0_20px_rgba(99,102,241,0.4)] transition-all">
          <Edit3 size={16} />
          Edit Profile
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Games Played */}
        <div className="bg-[#111228] border border-white/5 rounded-2xl p-5 flex flex-col relative overflow-hidden group">
          <div className="absolute -right-4 -top-4 w-20 h-20 bg-[#6366F1]/10 rounded-full blur-xl group-hover:bg-[#6366F1]/20 transition-all"></div>
          <div className="flex items-center gap-4 mb-2">
            <div className="w-12 h-12 rounded-xl bg-[#6366F1]/20 flex items-center justify-center shrink-0">
              <Gamepad2 className="w-6 h-6 text-[#6366F1]" />
            </div>
            <div className="flex flex-col">
              <span className="text-gray-400 text-xs font-medium">Games Played</span>
              <span className="text-2xl font-bold text-white">245</span>
            </div>
          </div>
          <span className="text-green-500 text-xs font-bold pl-16">+12 this week</span>
        </div>

        {/* Total Score */}
        <div className="bg-[#111228] border border-white/5 rounded-2xl p-5 flex flex-col relative overflow-hidden group">
          <div className="absolute -right-4 -top-4 w-20 h-20 bg-blue-500/10 rounded-full blur-xl group-hover:bg-blue-500/20 transition-all"></div>
          <div className="flex items-center gap-4 mb-2">
            <div className="w-12 h-12 rounded-xl bg-blue-500/20 flex items-center justify-center shrink-0">
              <Star className="w-6 h-6 text-blue-500 fill-current" />
            </div>
            <div className="flex flex-col">
              <span className="text-gray-400 text-xs font-medium">Total Score</span>
              <span className="text-2xl font-bold text-white">18,750</span>
            </div>
          </div>
          <span className="text-green-500 text-xs font-bold pl-16">+980 this week</span>
        </div>

        {/* Achievements */}
        <div className="bg-[#111228] border border-white/5 rounded-2xl p-5 flex flex-col relative overflow-hidden group">
          <div className="absolute -right-4 -top-4 w-20 h-20 bg-yellow-500/10 rounded-full blur-xl group-hover:bg-yellow-500/20 transition-all"></div>
          <div className="flex items-center gap-4 mb-2">
            <div className="w-12 h-12 rounded-xl bg-yellow-500/20 flex items-center justify-center shrink-0">
              <Trophy className="w-6 h-6 text-yellow-500 fill-current" />
            </div>
            <div className="flex flex-col">
              <span className="text-gray-400 text-xs font-medium">Achievements</span>
              <div className="flex items-baseline gap-1">
                <span className="text-2xl font-bold text-white">32</span>
                <span className="text-sm text-gray-500">/ 88</span>
              </div>
            </div>
          </div>
          <span className="text-gray-400 text-xs font-medium pl-16">36% Completed</span>
        </div>

        {/* Current Streak */}
        <div className="bg-[#111228] border border-white/5 rounded-2xl p-5 flex flex-col relative overflow-hidden group">
          <div className="absolute -right-4 -top-4 w-20 h-20 bg-orange-500/10 rounded-full blur-xl group-hover:bg-orange-500/20 transition-all"></div>
          <div className="flex items-center gap-4 mb-2">
            <div className="w-12 h-12 rounded-xl bg-orange-500/20 flex items-center justify-center shrink-0">
              <Flame className="w-6 h-6 text-orange-500 fill-current" />
            </div>
            <div className="flex flex-col">
              <span className="text-gray-400 text-xs font-medium">Current Streak</span>
              <span className="text-2xl font-bold text-white">7 Days</span>
            </div>
          </div>
          <span className="text-orange-400 text-xs font-bold pl-16">Keep it up! 🔥</span>
        </div>

      </div>
    </div>
  );
}
