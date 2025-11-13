import type { Metadata } from 'next';

import './global.css';

export const metadata: Metadata = {
  title: 'Manexus Onchain Trading Console',
  description: 'Monitor on-chain trading activity with live insights.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="min-h-screen bg-background text-foreground">{children}</body>
    </html>
  );
}
