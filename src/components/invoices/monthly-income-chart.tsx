'use client';

import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip } from 'recharts';
import type { MonthlyChartData } from '@/lib/types';

interface MonthlyIncomeChartProps {
  data: MonthlyChartData[];
}

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

export function MonthlyIncomeChart({ data }: MonthlyIncomeChartProps) {
  const hasData = data.some(d => d.paid > 0);

  if (!hasData) {
    return (
      <div
        className="flex h-[200px] items-center justify-center text-muted-foreground text-sm"
        data-testid="chart-empty-state"
      >
        Start invoicing to see your income trend
      </div>
    );
  }

  return (
    <div data-testid="monthly-income-chart" className="h-[200px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 5, right: 5, left: 5, bottom: 5 }}>
          <XAxis
            dataKey="month"
            tick={{ fontSize: 12 }}
            tickLine={false}
            axisLine={false}
            tickFormatter={(value: string) => value.split(' ')[0]}
          />
          <YAxis
            tick={{ fontSize: 12 }}
            tickLine={false}
            axisLine={false}
            tickFormatter={(value: number) => formatCurrency(value)}
            width={60}
          />
          <Tooltip
            formatter={(value) => [formatCurrency(Number(value)), 'Cobrado']}
            labelStyle={{ fontWeight: 600 }}
            contentStyle={{
              borderRadius: '8px',
              border: '1px solid hsl(var(--border))',
              backgroundColor: 'hsl(var(--card))',
            }}
          />
          <Bar
            dataKey="paid"
            fill="hsl(var(--primary))"
            radius={[4, 4, 0, 0]}
            maxBarSize={40}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
