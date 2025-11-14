'use client';

import { useEffect, useMemo } from 'react';
import { keepPreviousData, useQuery } from '@tanstack/react-query';

import type { OrderStatus } from '@/stores/trading-store';
import { useTradingStore } from '@/stores/trading-store';
import { apiFetch } from '@/lib/api';

export type Order = {
  id: string;
  asset: string;
  type: 'BUY' | 'SELL';
  quantity: number;
  price: number;
  status: OrderStatus;
  timestamp: string;
};

type ApiResponse<T> = {
  success: boolean;
  data: T;
  message?: string;
  timestamp: string;
};

type OrdersData = {
  orders: Order[];
};

const ORDERS_QUERY_KEY = ['orders'];

async function fetchOrders(): Promise<Order[]> {
  try {
    const response = await apiFetch<ApiResponse<OrdersData>>('/orders');
    return response.data.orders;
  } catch (error) {
    // Backend might not have this endpoint yet, return empty array
    console.warn('Orders endpoint not available:', error);
    return [];
  }
}

export function useOrders() {
  const statusFilter = useTradingStore((state) => state.statusFilter);
  const markSynced = useTradingStore((state) => state.markSynced);

  const query = useQuery({
    queryKey: ORDERS_QUERY_KEY,
    queryFn: fetchOrders,
    placeholderData: keepPreviousData,
    refetchInterval: process.env.NODE_ENV === 'test' ? false : 60_000,
    meta: { description: 'Fetches latest trading orders from backend.' },
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
