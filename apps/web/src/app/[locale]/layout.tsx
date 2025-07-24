import Providers from '@/components/layout/Providers';
import { routing } from '@/i18n/routing';
import { auth } from '@/lib/auth';
import '@/styles/globals.css';
import { Analytics } from '@vercel/analytics/react';
import { Metadata } from 'next';
import { hasLocale, NextIntlClientProvider } from 'next-intl';
import { getMessages, getTranslations } from 'next-intl/server';
import { Roboto } from 'next/font/google';
import { notFound } from 'next/navigation';
import NextTopLoader from 'nextjs-toploader';

const roboto = Roboto({
  weight: ['400', '700'],
  style: ['normal', 'italic'],
  subsets: ['latin'],
  display: 'swap'
});

interface Props {
  children: React.ReactNode;
  params: { locale: string };
}

export async function generateMetadata({
  params
}: Omit<Props, 'children'>): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'metadata' });

  return {
    title: t('title'),
    description: t('description')
  };
}

export default async function LocaleLayout({
  children,
  params
}: Readonly<Props>) {
  const session = await auth();
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }
  const messages = await getMessages();

  return (
    <html lang={locale} suppressHydrationWarning>
      <body className={roboto.className}>
        <NextTopLoader showSpinner={false} />
        <NextIntlClientProvider locale={locale} messages={messages}>
          <Providers session={session}>{children}</Providers>
        </NextIntlClientProvider>
        <Analytics />
      </body>
    </html>
  );
}
