import React from 'react';
import { TrafficChart, RevenueChart } from '@/components/admin/AdminCharts';
import { Users, Gamepad2, DollarSign, Activity, FileText } from 'lucide-react';

export default function AdminDashboardPage() {
  const kpis = [
    { title: 'Total Users', value: '24,592', change: '+12%', icon: Users, color: 'text-blue-500', bg: 'bg-blue-500/10' },
    { title: 'Active Games', value: '142', change: '+3', icon: Gamepad2, color: 'text-purple-500', bg: 'bg-purple-500/10' },
    { title: 'Daily Revenue', value: '$245.50', change: '+18%', icon: DollarSign, color: 'text-yellow-500', bg: 'bg-yellow-500/10' },
    { title: 'Active Sessions', value: '1,204', change: '+5%', icon: Activity, color: 'text-green-500', bg: 'bg-green-500/10' },
  ];

  const recentActivity = [
    { id: 1, action: 'New User Registration', user: 'alex_gamer99', time: '2 mins ago' },
    { id: 2, action: 'High Score Achieved', user: 'sarah_p', game: '2048', time: '15 mins ago' },
    { id: 3, action: 'Blog Comment', user: 'mike_d', time: '1 hour ago' },
    { id: 4, action: 'New User Registration', user: 'pro_player', time: '2 hours ago' },
    { id: 5, action: 'Game Published', user: 'Admin', game: 'Snake 3D', time: '5 hours ago' },
  ];

  return (
    <div className="flex flex-col gap-8">
      
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold font-outfit text-gray-900 dark:text-white tracking-tight text-balance mb-2">
          Dashboard Overview
        </h1>
        <p className="text-gray-500 dark:text-gray-400 text-sm">Monitor platform metrics, user activity, and revenue.</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {kpis.map((kpi, idx) => (
          <div key={idx} className="bg-white dark:bg-[#111228]/80 backdrop-blur-md border border-gray-200 dark:border-white/5 rounded-2xl p-5 flex flex-col relative overflow-hidden group shadow-sm hover:shadow-xl transition-all">
            <div className="flex items-center gap-4 mb-3">
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${kpi.bg}`}>
                <kpi.icon className={`w-6 h-6 ${kpi.color}`} />
              </div>
              <div className="flex flex-col">
                <span className="text-gray-500 dark:text-gray-400 text-xs font-medium uppercase tracking-wider">{kpi.title}</span>
                <span className="text-2xl font-bold text-gray-900 dark:text-white">{kpi.value}</span>
              </div>
            </div>
            <div className="flex items-center text-xs font-bold text-green-500 pl-16">
              {kpi.change} this week
            </div>
          </div>
        ))}
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Traffic Chart */}
        <div className="lg:col-span-2 bg-white dark:bg-[#111228]/80 backdrop-blur-md border border-gray-200 dark:border-white/5 rounded-2xl p-6 flex flex-col shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white">Traffic & Engagement</h3>
            <select className="bg-gray-50 dark:bg-[#0A0B1A] border border-gray-200 dark:border-white/10 text-gray-600 dark:text-gray-300 text-xs rounded-lg px-3 py-1.5 focus:outline-none">
              <option>Last 7 Days</option>
              <option>Last 30 Days</option>
              <option>This Year</option>
            </select>
          </div>
          <TrafficChart />
        </div>

        {/* Revenue Chart */}
        <div className="bg-white dark:bg-[#111228]/80 backdrop-blur-md border border-gray-200 dark:border-white/5 rounded-2xl p-6 flex flex-col shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white">Estimated Revenue</h3>
            <span className="text-xs text-yellow-500 font-bold bg-yellow-500/10 px-2 py-1 rounded-full">Monetag</span>
          </div>
          <RevenueChart />
        </div>

      </div>

      {/* Bottom Row: Recent Activity & Top Games */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        
        {/* Recent Activity */}
        <div className="bg-white dark:bg-[#111228]/80 backdrop-blur-md border border-gray-200 dark:border-white/5 rounded-2xl p-6 flex flex-col shadow-sm">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-6">Recent Activity</h3>
          <div className="flex flex-col gap-4">
            {recentActivity.map((activity) => (
              <div key={activity.id} className="flex items-start gap-4 border-b border-gray-100 dark:border-white/5 pb-4 last:border-0 last:pb-0">
                <div className="w-2 h-2 rounded-full bg-[#6366F1] mt-2 shrink-0 shadow-[0_0_8px_#6366F1]" />
                <div className="flex flex-col flex-1">
                  <span className="text-sm font-medium text-gray-900 dark:text-gray-200">{activity.action}</span>
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    <span className="font-bold text-gray-700 dark:text-gray-300">{activity.user}</span> 
                    {activity.game && <> in <span className="text-[#6366F1]">{activity.game}</span></>}
                  </span>
                </div>
                <span className="text-[10px] text-gray-400 whitespace-nowrap">{activity.time}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white dark:bg-[#111228]/80 backdrop-blur-md border border-gray-200 dark:border-white/5 rounded-2xl p-6 flex flex-col shadow-sm">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-6">Quick Actions</h3>
          <div className="grid grid-cols-2 gap-4">
            <button className="flex flex-col items-center justify-center p-6 bg-gray-50 dark:bg-black/20 border border-gray-200 dark:border-white/5 rounded-xl hover:bg-gray-100 dark:hover:bg-white/5 hover:border-[#6366F1]/50 transition-all group">
              <div className="w-12 h-12 rounded-full bg-blue-500/10 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                <Gamepad2 className="w-6 h-6 text-blue-500" />
              </div>
              <span className="text-sm font-bold text-gray-900 dark:text-white">Add New Game</span>
            </button>
            <button className="flex flex-col items-center justify-center p-6 bg-gray-50 dark:bg-black/20 border border-gray-200 dark:border-white/5 rounded-xl hover:bg-gray-100 dark:hover:bg-white/5 hover:border-[#6366F1]/50 transition-all group">
              <div className="w-12 h-12 rounded-full bg-purple-500/10 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                <FileText className="w-6 h-6 text-purple-500" />
              </div>
              <span className="text-sm font-bold text-gray-900 dark:text-white">Write Blog Post</span>
            </button>
          </div>
        </div>

      </div>

    </div>
  );
}
