'use client';

import { create } from 'zustand';

export type OrderStatus = 'open' | 'pending' | 'filled';

type TradingState = {
  statusFilter: 'all' | OrderStatus;
  setStatusFilter: (filter: TradingState['statusFilter']) => void;
  lastSyncedAt: number;
  markSynced: (timestamp?: number) => void;
};

export const useTradingStore = create<TradingState>((set) => ({
  statusFilter: 'all',
  setStatusFilter: (filter) => set({ statusFilter: filter }),
  lastSyncedAt: 0, // Will be set on client mount to avoid hydration mismatch
  markSynced: (timestamp) => set({ lastSyncedAt: timestamp ?? Date.now() }),
}));
