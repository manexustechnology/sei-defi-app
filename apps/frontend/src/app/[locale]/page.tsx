import { notFound } from 'next/navigation';

import { Dashboard } from '@/components/dashboard/dashboard';
import { isLocale } from '@/i18n/config';

type LocalePageProps = {
  params: Promise<{ locale: string }>;
};

export default async function LocalePage({ params }: LocalePageProps) {
  const { locale } = await params;

  if (!isLocale(locale)) {
    notFound();
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      <div className="mx-auto max-w-7xl px-6 py-8">
        <Dashboard />
      </div>
    </main>
  );
}
