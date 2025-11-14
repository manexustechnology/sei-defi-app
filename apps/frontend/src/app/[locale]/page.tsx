import { notFound } from 'next/navigation';

import { OrderlyTradingDashboard } from '@/components/trading/orderly-trading-dashboard';
import { isLocale } from '@/i18n/config';

type LocalePageProps = {
  params: Promise<{ locale: string }>;
};

export default async function LocalePage({ params }: LocalePageProps) {
  const { locale } = await params;

  if (!isLocale(locale)) {
    notFound();
  }

  return <OrderlyTradingDashboard />;
}
