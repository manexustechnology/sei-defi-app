import type { Metadata } from 'next';
import { ThemeProvider } from '@/components/providers/theme-provider';

import './global.css';

export const metadata: Metadata = {
  title: 'Nexus - The New Standard Perp-DEX Trading Platform',
  description: 'A hybrid exchange where perps remain the execution layer, and prediction data becomes the decision layer.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <body className="min-h-screen bg-background text-foreground">
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          forcedTheme="dark"
          enableSystem={false}
          disableTransitionOnChange
        >
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
