import type { Metadata } from 'next';
import { ThemeProvider } from '@/components/providers/theme-provider';

import './global.css';

export const metadata: Metadata = {
  title: 'Manexus Onchain Trading Console',
  description: 'Monitor on-chain trading activity with live insights.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="min-h-screen bg-background text-foreground">
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
