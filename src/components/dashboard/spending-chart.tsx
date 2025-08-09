'use client';

import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip } from 'recharts';
import { Card } from '@/components/ui/card';
import type { Transaction } from '@/lib/types';

type SpendingChartProps = {
  transactions: Transaction[];
};

export default function SpendingChart({ transactions }: SpendingChartProps) {
  const spendingByCategory = transactions.reduce((acc, transaction) => {
    if (transaction.amount < 0) return acc; // Only include expenses
    if (!acc[transaction.category]) {
      acc[transaction.category] = 0;
    }
    acc[transaction.category] += transaction.amount;
    return acc;
  }, {} as Record<Transaction['category'], number>);
  
  const chartData = Object.entries(spendingByCategory).map(([name, value]) => ({
    name,
    value,
  }));


  return (
    <div className="h-[300px]">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={chartData}>
          <XAxis dataKey="name" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
          <YAxis stroke="#888888" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `₹${value}`} />
          <Tooltip
            cursor={{ fill: 'hsl(var(--muted))' }}
            contentStyle={{
              backgroundColor: 'hsl(var(--background))',
              borderColor: 'hsl(var(--border))',
              color: 'hsl(var(--foreground))',
              borderRadius: 'var(--radius)',
            }}
             formatter={(value: number) => `₹${value.toFixed(2)}`}
          />
          <Bar dataKey="value" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
