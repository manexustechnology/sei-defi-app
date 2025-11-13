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
    <main className="mx-auto flex w-full max-w-5xl flex-col gap-6 p-6">
      <Dashboard />
    </main>
  );
}
