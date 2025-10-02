'use client';

import * as React from 'react';
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useParking } from '@/hooks/use-parking';
import { useTranslations } from 'next-intl';

const RADIAN = Math.PI / 180;
const renderCustomizedLabel = ({
  cx,
  cy,
  midAngle,
  innerRadius,
  outerRadius,
  percent,
}: any) => {
  const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);

  return (
    <text
      x={x}
      y={y}
      fill="white"
      textAnchor={x > cx ? 'start' : 'end'}
      dominantBaseline="central"
      className="text-xs font-bold"
    >
      {`${(percent * 100).toFixed(0)}%`}
    </text>
  );
};

export default function OccupancyChart() {
  const t = useTranslations('OccupancyChart');
  const { slots } = useParking();

  const occupied = slots.filter((slot) => slot.isOccupied).length;
  const available = slots.length - occupied;

  const data = [
    { name: t('occupied'), value: occupied, color: 'hsl(var(--chart-2))' },
    { name: t('available'), value: available, color: 'hsl(var(--chart-1))' },
  ];

  return (
    <Card className="lg:col-span-2">
      <CardHeader>
        <CardTitle>{t('title')}</CardTitle>
      </CardHeader>
      <CardContent>
        <div style={{ width: '100%', height: 150 }}>
          <ResponsiveContainer>
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={renderCustomizedLabel}
                outerRadius={60}
                innerRadius={30}
                fill="#8884d8"
                dataKey="value"
                strokeWidth={2}
                stroke="hsl(var(--background))"
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  backgroundColor: 'hsl(var(--card))',
                  borderColor: 'hsl(var(--border))',
                  borderRadius: 'var(--radius)',
                }}
              />
              <Legend
                iconType="circle"
                wrapperStyle={{
                  paddingTop: '20px',
                  fontSize: '0.8rem',
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
