'use client';
import React, { useState, useEffect } from 'react';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  BarChart,
  Bar
} from 'recharts';

const trafficData = [
  { name: 'Mon', views: 4000, unique: 2400 },
  { name: 'Tue', views: 3000, unique: 1398 },
  { name: 'Wed', views: 5000, unique: 3800 },
  { name: 'Thu', views: 2780, unique: 1908 },
  { name: 'Fri', views: 6890, unique: 4800 },
  { name: 'Sat', views: 8390, unique: 6800 },
  { name: 'Sun', views: 7490, unique: 5300 },
];

const revenueData = [
  { name: 'Mon', revenue: 120 },
  { name: 'Tue', revenue: 95 },
  { name: 'Wed', revenue: 150 },
  { name: 'Thu', revenue: 85 },
  { name: 'Fri', revenue: 210 },
  { name: 'Sat', revenue: 290 },
  { name: 'Sun', revenue: 245 },
];

export function TrafficChart() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  if (!mounted) return <div className="h-[300px] flex items-center justify-center text-gray-500">Loading chart...</div>;

  return (
    <div className="h-[300px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={trafficData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
          <defs>
            <linearGradient id="colorViews" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#6366F1" stopOpacity={0.3}/>
              <stop offset="95%" stopColor="#6366F1" stopOpacity={0}/>
            </linearGradient>
            <linearGradient id="colorUnique" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#10B981" stopOpacity={0.3}/>
              <stop offset="95%" stopColor="#10B981" stopOpacity={0}/>
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#ffffff1a" />
          <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#9CA3AF', fontSize: 12 }} dy={10} />
          <YAxis axisLine={false} tickLine={false} tick={{ fill: '#9CA3AF', fontSize: 12 }} />
          <Tooltip 
            contentStyle={{ backgroundColor: '#111228', borderColor: '#ffffff1a', borderRadius: '12px', color: '#fff', fontSize: '12px' }}
            itemStyle={{ fontWeight: 'bold' }}
          />
          <Area type="monotone" dataKey="views" stroke="#6366F1" strokeWidth={3} fillOpacity={1} fill="url(#colorViews)" />
          <Area type="monotone" dataKey="unique" stroke="#10B981" strokeWidth={3} fillOpacity={1} fill="url(#colorUnique)" />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

export function RevenueChart() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  if (!mounted) return <div className="h-[300px] flex items-center justify-center text-gray-500">Loading chart...</div>;

  return (
    <div className="h-[300px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={revenueData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#ffffff1a" />
          <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#9CA3AF', fontSize: 12 }} dy={10} />
          <YAxis axisLine={false} tickLine={false} tick={{ fill: '#9CA3AF', fontSize: 12 }} tickFormatter={(value) => `$${value}`} />
          <Tooltip 
            cursor={{ fill: '#ffffff0a' }}
            contentStyle={{ backgroundColor: '#111228', borderColor: '#ffffff1a', borderRadius: '12px', color: '#fff', fontSize: '12px' }}
            itemStyle={{ color: '#EAB308', fontWeight: 'bold' }}
            formatter={(value: any) => [`$${value}`, 'Revenue']}
          />
          <Bar dataKey="revenue" fill="#EAB308" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
