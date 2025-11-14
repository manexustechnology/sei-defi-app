import { notFound } from 'next/navigation';

import { LocaleProvider } from '@/components/providers/locale-provider';
import { QueryProvider } from '@/components/providers/query-provider';
import { OrderlyProvider } from '@/components/providers/orderly-provider';
import { getDictionary, isLocale, locales, type Locale } from '@/i18n/config';

type LocaleLayoutProps = {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
};

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export default async function LocaleLayout({ children, params }: LocaleLayoutProps) {
  const { locale: localeParam } = await params;
  const locale = localeParam as Locale;

  if (!isLocale(locale)) {
    notFound();
  }

  const dictionary = await getDictionary(locale);

  return (
    <LocaleProvider locale={locale} dictionary={dictionary}>
      <QueryProvider>
        <OrderlyProvider>
          {children}
        </OrderlyProvider>
      </QueryProvider>
    </LocaleProvider>
  );
}
