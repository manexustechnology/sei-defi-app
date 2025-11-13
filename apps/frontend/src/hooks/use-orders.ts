'use client';

import { useEffect, useMemo } from 'react';
import { keepPreviousData, useQuery } from '@tanstack/react-query';

import type { OrderStatus } from '@/stores/trading-store';
import { useTradingStore } from '@/stores/trading-store';

export type Order = {
  id: string;
  asset: string;
  type: 'BUY' | 'SELL';
  quantity: number;
  price: number;
  status: OrderStatus;
  timestamp: string;
};

type OrdersResponse = {
  orders: Order[];
};

const ORDERS_QUERY_KEY = ['orders'];

async function fetchOrders(): Promise<OrdersResponse> {
  const response = await fetch('/api/orders', { cache: 'no-store' });

  if (!response.ok) {
    throw new Error('Failed to load orders');
  }

  return response.json();
}

export function useOrders() {
  const statusFilter = useTradingStore((state) => state.statusFilter);
  const markSynced = useTradingStore((state) => state.markSynced);

  const query = useQuery({
    queryKey: ORDERS_QUERY_KEY,
    queryFn: fetchOrders,
    placeholderData: keepPreviousData,
    refetchInterval: process.env.NODE_ENV === 'test' ? false : 60_000,
    select: (data) => data.orders,
    meta: { description: 'Fetches latest trading orders.' },
  });

  useEffect(() => {
    if (query.isSuccess) {
      markSynced(query.dataUpdatedAt);
    }
  }, [query.isSuccess, query.dataUpdatedAt, markSynced]);

  const filteredOrders = useMemo(() => {
    if (!query.data) {
      return [] as Order[];
    }

    if (statusFilter === 'all') {
      return query.data;
    }

    return query.data.filter((order) => order.status === statusFilter);
  }, [query.data, statusFilter]);

  return {
    ...query,
    filteredOrders,
  };
}
