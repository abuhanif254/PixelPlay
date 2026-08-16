'use client';

import React, { useState, useEffect } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function RevenueChart({ data }: { data: any[] }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return <div className="w-full h-full bg-gray-50 dark:bg-[#0A0B1A] animate-pulse rounded-xl"></div>;

  return (
    <ResponsiveContainer width="100%" height="100%">
      <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
        <defs>
          <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#10B981" stopOpacity={0.3} />
            <stop offset="95%" stopColor="#10B981" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
        <XAxis 
          dataKey="date" 
          tickFormatter={(val) => {
            const date = new Date(val);
            return `${date.getMonth() + 1}/${date.getDate()}`;
          }}
          tick={{ fontSize: 12, fill: '#6B7280' }} 
          axisLine={false} 
          tickLine={false}
          minTickGap={30}
        />
        <YAxis 
          tickFormatter={(val) => `$${val}`}
          tick={{ fontSize: 12, fill: '#6B7280' }} 
          axisLine={false} 
          tickLine={false}
        />
        <Tooltip 
          contentStyle={{ backgroundColor: '#111228', borderColor: 'rgba(255,255,255,0.1)', borderRadius: '12px', color: '#fff' }}
          itemStyle={{ color: '#10B981', fontWeight: 'bold' }}
          formatter={(value: number) => [`$${value.toFixed(2)}`, 'Your Share']}
          labelStyle={{ color: '#9CA3AF', marginBottom: '4px' }}
        />
        <Area 
          type="monotone" 
          dataKey="developer_share" 
          stroke="#10B981" 
          strokeWidth={3}
          fillOpacity={1} 
          fill="url(#colorRevenue)" 
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}
