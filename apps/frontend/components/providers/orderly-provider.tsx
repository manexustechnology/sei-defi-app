'use client';

import { FC, ReactNode } from 'react';
import { OrderlyAppProvider } from '@orderly.network/react-app';
import { WalletConnectorProvider } from '@orderly.network/wallet-connector';

interface OrderlyProviderProps {
  children: ReactNode;
}

export const OrderlyProvider: FC<OrderlyProviderProps> = ({ children }) => {
  return (
    <WalletConnectorProvider>
      <OrderlyAppProvider
        brokerId="nexus"
        brokerName="Nexus"
        networkId="testnet"
        appIcons={{
          main: {
            img: '/nexus-logo.svg',
          },
        }}
      >
        {children}
      </OrderlyAppProvider>
    </WalletConnectorProvider>
  );
};
