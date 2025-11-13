'use client';

import { useState } from 'react';
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import type { PoolHistoricalData } from '@/hooks/use-pools';

type PoolChartProps = {
  data: PoolHistoricalData[];
  dictionary: {
    title: string;
    tvl: string;
    volume: string;
    reserves: string;
    price: string;
  };
};

type ChartType = 'tvl' | 'volume' | 'reserves' | 'price';

export function PoolChart({ data, dictionary }: PoolChartProps) {
  const [chartType, setChartType] = useState<ChartType>('tvl');

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  };

  const formatNumber = (value: number) => {
    if (value >= 1_000_000) {
      return `$${(value / 1_000_000).toFixed(2)}M`;
    }
    if (value >= 1_000) {
      return `$${(value / 1_000).toFixed(2)}K`;
    }
    return `$${value.toFixed(2)}`;
  };

  const chartData = data.map((item) => ({
    timestamp: item.timestamp,
    date: formatDate(item.timestamp),
    tvl: item.tvl ? parseFloat(item.tvl) : 0,
    volume: item.volume ? parseFloat(item.volume) : 0,
    reserve0: parseFloat(item.reserve0),
    reserve1: parseFloat(item.reserve1),
    price: item.price ? parseFloat(item.price) : 0,
  }));

  const getChartConfig = () => {
    switch (chartType) {
      case 'tvl':
        return {
          dataKey: 'tvl',
          stroke: '#8b5cf6',
          fill: '#8b5cf6',
          name: dictionary.tvl,
        };
      case 'volume':
        return {
          dataKey: 'volume',
          stroke: '#10b981',
          fill: '#10b981',
          name: dictionary.volume,
        };
      case 'price':
        return {
          dataKey: 'price',
          stroke: '#f59e0b',
          fill: '#f59e0b',
          name: dictionary.price,
        };
      default:
        return {
          dataKey: 'tvl',
          stroke: '#8b5cf6',
          fill: '#8b5cf6',
          name: dictionary.tvl,
        };
    }
  };

  const config = getChartConfig();

  if (data.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{dictionary.title}</CardTitle>
          <CardDescription>No historical data available</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{dictionary.title}</CardTitle>
        <div className="flex gap-2 pt-2">
          <Button
            size="sm"
            variant={chartType === 'tvl' ? 'default' : 'outline'}
            onClick={() => setChartType('tvl')}
          >
            {dictionary.tvl}
          </Button>
          <Button
            size="sm"
            variant={chartType === 'volume' ? 'default' : 'outline'}
            onClick={() => setChartType('volume')}
          >
            {dictionary.volume}
          </Button>
          <Button
            size="sm"
            variant={chartType === 'price' ? 'default' : 'outline'}
            onClick={() => setChartType('price')}
          >
            {dictionary.price}
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={350}>
          <AreaChart data={chartData}>
            <defs>
              <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={config.stroke} stopOpacity={0.3} />
                <stop offset="95%" stopColor={config.stroke} stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
            <XAxis
              dataKey="date"
              className="text-xs text-muted-foreground"
              tick={{ fill: 'currentColor' }}
            />
            <YAxis
              className="text-xs text-muted-foreground"
              tick={{ fill: 'currentColor' }}
              tickFormatter={formatNumber}
            />
            <Tooltip
              content={({ active, payload }) => {
                if (!active || !payload || payload.length === 0) return null;

                return (
                  <div className="rounded-lg border bg-background p-3 shadow-md">
                    <p className="text-xs text-muted-foreground">
                      {payload[0]?.payload?.date}
                    </p>
                    <p className="font-semibold">
                      {config.name}: {formatNumber(Number(payload[0]?.value || 0))}
                    </p>
                  </div>
                );
              }}
            />
            <Area
              type="monotone"
              dataKey={config.dataKey}
              stroke={config.stroke}
              fill="url(#colorValue)"
              strokeWidth={2}
            />
          </AreaChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}

