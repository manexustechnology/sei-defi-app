'use client';

import { TradingPage } from '@orderly.network/trading';
import { TopNav } from './top-nav';
import { useTradingStore } from '@/stores/trading-store';

export function OrderlyTradingDashboard() {
  const { activeSymbol, setActiveSymbol } = useTradingStore();

  return (
    <div className="h-screen flex flex-col bg-background">
      {/* Top Navigation */}
      <TopNav />

      {/* Orderly Trading Page */}
      <div className="flex-1 min-h-0">
        <TradingPage
          symbol={activeSymbol}
          tradingViewConfig={{
            scriptSRC: '/tradingview/charting_library/charting_library.js',
            library_path: '/tradingview/charting_library/',
          }}
          onSymbolChange={(symbol) => {
            setActiveSymbol(symbol.symbol);
          }}
        />
      </div>
    </div>
  );
}
